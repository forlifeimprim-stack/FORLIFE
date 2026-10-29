import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { CAMPAIGN_STATUSES, CHANNELS, OBJECTIVE_TYPES, TASK_CREDIT_COST, can } from "@forlife/shared";
import { prisma } from "../../lib/prisma.js";
import { badRequest, notFound, paymentRequired } from "../../lib/errors.js";
import { parse } from "../../lib/validation.js";
import { audit } from "../../lib/audit.js";
import { auditCtx, authenticate, requireWorkspace } from "../../plugins/auth.js";
import { enqueue } from "../jobs/queue.js";

const wsParams = z.object({ workspaceId: z.string() });
const wsIdParams = z.object({ workspaceId: z.string(), id: z.string() });

const campaignBase = z.object({
  name: z.string().trim().min(2).max(120),
  objective: z.enum(OBJECTIVE_TYPES),
  brief: z.string().trim().max(4000).nullish(),
  audience: z.string().trim().max(500).nullish(),
  offer: z.string().trim().max(500).nullish(),
  kpiTarget: z.string().trim().max(200).nullish(),
  budgetAmount: z.number().int().nonnegative().max(10_000_000_000).nullish(),
  channels: z.array(z.enum(CHANNELS)).max(8).default([]),
  startAt: z.coerce.date().nullish(),
  endAt: z.coerce.date().nullish(),
});
const campaignSchema = campaignBase.refine((c) => !c.startAt || !c.endAt || c.endAt > c.startAt, { message: "La fin doit être postérieure au début", path: ["endAt"] });

/** Transitions autorisées du cycle de vie d'une campagne. */
const NEXT: Record<string, string[]> = { DRAFT: ["ACTIVE"], ACTIVE: ["PAUSED", "COMPLETED"], PAUSED: ["ACTIVE", "COMPLETED"], COMPLETED: [] };

export async function campaignRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);

  app.get("/api/workspaces/:workspaceId/campaigns", async (req) => {
    const { workspaceId } = parse(wsParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "campaigns:read");
    const campaigns = await prisma.campaign.findMany({
      where: { workspaceId },
      include: { _count: { select: { contents: true, leads: true } } },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    });
    // Leads et chiffre d'affaires : réservés aux rôles ayant accès au CRM.
    if (!can(ctx.role, "crm:read")) return campaigns.map(({ _count, ...c }) => ({ ...c, _count: { contents: _count.contents, leads: null }, wonCount: null, wonValue: null }));
    const won = await prisma.lead.groupBy({ by: ["campaignId"], where: { workspaceId, stage: "WON", campaignId: { in: campaigns.map((c) => c.id) } }, _count: true, _sum: { valueAmount: true } });
    const byId = new Map(won.map((w) => [w.campaignId, w]));
    return campaigns.map((c) => ({ ...c, wonCount: byId.get(c.id)?._count ?? 0, wonValue: byId.get(c.id)?._sum.valueAmount ?? 0 }));
  });

  app.post("/api/workspaces/:workspaceId/campaigns", async (req, reply) => {
    const { workspaceId } = parse(wsParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "campaigns:create");
    const body = parse(campaignSchema, req.body);
    const c = await prisma.campaign.create({ data: { ...body, workspaceId, createdById: ctx.userId } });
    await audit({ ...auditCtx(ctx), action: "campaign.created", entityType: "campaign", entityId: c.id });
    reply.code(201);
    return c;
  });

  /** Vue campagne : brief, contenus, leads et résultats commerciaux réels. */
  app.get("/api/workspaces/:workspaceId/campaigns/:id", async (req) => {
    const { workspaceId, id } = parse(wsIdParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "campaigns:read");
    const crm = can(ctx.role, "crm:read");
    const c = await prisma.campaign.findFirst({
      where: { id, workspaceId },
      include: {
        contents: { select: { id: true, title: true, status: true, scheduledAt: true, variants: { select: { channel: true } } }, orderBy: { createdAt: "desc" } },
        forms: { select: { id: true, slug: true, title: true, submissions: true, active: true } },
      },
    });
    if (!c) throw notFound("Campagne");
    if (!crm) return { ...c, forms: [], results: null, packCreditCost: { ideas: TASK_CREDIT_COST["content.ideas"], perPost: TASK_CREDIT_COST["content.post"] } };
    const leads = await prisma.lead.groupBy({ by: ["stage"], where: { workspaceId, campaignId: id }, _count: true, _sum: { valueAmount: true } });
    const total = leads.reduce((n, l) => n + l._count, 0);
    const won = leads.find((l) => l.stage === "WON");
    return {
      ...c,
      results: {
        leads: total,
        byStage: Object.fromEntries(leads.map((l) => [l.stage, l._count])),
        wonCount: won?._count ?? 0,
        wonValue: won?._sum.valueAmount ?? 0,
        // Coût par lead calculé uniquement si un budget réel est saisi.
        costPerLead: c.budgetAmount && total ? Math.round(c.budgetAmount / total) : null,
      },
      packCreditCost: { ideas: TASK_CREDIT_COST["content.ideas"], perPost: TASK_CREDIT_COST["content.post"] },
    };
  });

  app.patch("/api/workspaces/:workspaceId/campaigns/:id", async (req) => {
    const { workspaceId, id } = parse(wsIdParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "campaigns:update");
    const body = parse(campaignBase.partial(), req.body);
    const c = await prisma.campaign.findFirst({ where: { id, workspaceId } });
    if (!c) throw notFound("Campagne");
    if (c.status === "COMPLETED") throw badRequest("Une campagne terminée ne peut plus être modifiée");
    const updated = await prisma.campaign.update({ where: { id }, data: body });
    await audit({ ...auditCtx(ctx), action: "campaign.updated", entityType: "campaign", entityId: id, metadata: { fields: Object.keys(body) } });
    return updated;
  });

  /** Activation = approbation (human-in-the-loop) ; pause et clôture par l'équipe. */
  app.post("/api/workspaces/:workspaceId/campaigns/:id/status", async (req) => {
    const { workspaceId, id } = parse(wsIdParams, req.params);
    const { status } = parse(z.object({ status: z.enum(CAMPAIGN_STATUSES) }), req.body);
    const ctx = await requireWorkspace(req, workspaceId, status === "ACTIVE" ? "campaigns:approve" : "campaigns:update");
    const c = await prisma.campaign.findFirst({ where: { id, workspaceId } });
    if (!c) throw notFound("Campagne");
    if (!NEXT[c.status]?.includes(status)) throw badRequest(`Transition impossible : ${c.status} → ${status}`);
    const res = await prisma.campaign.updateMany({
      where: { id, status: c.status },
      data: { status, ...(status === "ACTIVE" && !c.approvedAt ? { approvedAt: new Date(), approvedById: ctx.userId } : {}) },
    });
    if (!res.count) throw badRequest("La campagne a changé d'état entre-temps");
    await audit({ ...auditCtx(ctx), action: `campaign.${status.toLowerCase()}`, entityType: "campaign", entityId: id, metadata: { from: c.status } });
    return { ok: true, status };
  });

  /** Campaign pack : un brief central → N contenus multi-réseaux (asynchrone). */
  app.post("/api/workspaces/:workspaceId/campaigns/:id/pack", async (req, reply) => {
    const { workspaceId, id } = parse(wsIdParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "ai:generate");
    await requireWorkspace(req, workspaceId, "content:create");
    const body = parse(z.object({ count: z.number().int().min(1).max(6).default(3), channels: z.array(z.enum(CHANNELS)).min(1).max(8).optional() }), req.body ?? {});
    const c = await prisma.campaign.findFirst({ where: { id, workspaceId } });
    if (!c) throw notFound("Campagne");
    const channels = body.channels ?? (Array.isArray(c.channels) && c.channels.length ? (c.channels as string[]) : ["FACEBOOK", "INSTAGRAM", "WHATSAPP"]);
    const estimate = TASK_CREDIT_COST["content.ideas"] + body.count * TASK_CREDIT_COST["content.post"];
    const wallet = await prisma.creditWallet.findUniqueOrThrow({ where: { organizationId: ctx.organizationId } });
    if (wallet.balance < estimate) throw paymentRequired("Crédits insuffisants pour générer ce pack", { required: estimate, balance: wallet.balance });
    const job = await enqueue({
      organizationId: ctx.organizationId,
      workspaceId,
      type: "ai.campaign_pack",
      payload: { workspaceId, campaignId: id, actorId: ctx.userId, count: body.count, channels },
      correlationId: ctx.correlationId,
      createdById: ctx.userId,
      idempotencyKey: typeof req.headers["idempotency-key"] === "string" ? `pack:${id}:${req.headers["idempotency-key"]}` : undefined,
    });
    await audit({ ...auditCtx(ctx), action: "campaign.pack_requested", entityType: "campaign", entityId: id, metadata: { count: body.count, channels } });
    reply.code(202);
    return { jobId: job.id, estimatedCredits: estimate };
  });
}
