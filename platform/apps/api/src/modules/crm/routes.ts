import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { LEAD_SOURCES, LEAD_STAGES, TASK_CREDIT_COST, normalizePhone } from "@forlife/shared";
import { prisma } from "../../lib/prisma.js";
import { randomToken } from "../../lib/crypto.js";
import { badRequest, conflict, notFound } from "../../lib/errors.js";
import { parse } from "../../lib/validation.js";
import { audit } from "../../lib/audit.js";
import { auditCtx, authenticate, requireWorkspace } from "../../plugins/auth.js";
import { enqueue } from "../jobs/queue.js";
import { createLead, rescore } from "./service.js";

const wsParams = z.object({ workspaceId: z.string() });
const wsIdParams = z.object({ workspaceId: z.string(), id: z.string() });
const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().max(30).nullish(),
  email: z.email().nullish(),
  company: z.string().trim().max(120).nullish(),
  city: z.string().trim().max(80).nullish(),
  consentWhatsApp: z.boolean().default(false),
});

async function assertCampaign(workspaceId: string, campaignId?: string | null) {
  if (campaignId && !(await prisma.campaign.findFirst({ where: { id: campaignId, workspaceId } }))) throw badRequest("Campagne inconnue");
}

export async function crmRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);

  /** Vue pipeline : leads par étape + indicateurs commerciaux réels. */
  app.get("/api/workspaces/:workspaceId/crm/pipeline", async (req) => {
    const { workspaceId } = parse(wsParams, req.params);
    await requireWorkspace(req, workspaceId, "crm:read");
    const q = parse(z.object({ campaignId: z.string().optional(), q: z.string().max(100).optional() }), req.query);
    const since = new Date(Date.now() - 30 * 864e5);
    const term = q.q?.trim();
    const where: Prisma.LeadWhereInput = {
      workspaceId,
      ...(q.campaignId ? { campaignId: q.campaignId } : {}),
      ...(term
        ? { OR: [{ title: { contains: term, mode: "insensitive" } }, { contact: { name: { contains: term, mode: "insensitive" } } }, { contact: { phone: { contains: term.replace(/\s/g, "") } } }] }
        : {}),
      // Les affaires closes depuis plus de 30 jours sortent du tableau.
      NOT: { stage: { in: ["WON", "LOST"] }, updatedAt: { lt: since } },
    };
    const [leads, byStage, won30, created30] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: { contact: { select: { id: true, name: true, phone: true, consentWhatsApp: true } }, campaign: { select: { id: true, name: true } } },
        orderBy: [{ score: "desc" }, { lastActivityAt: "desc" }],
        take: 500,
      }),
      prisma.lead.groupBy({ by: ["stage"], where: { workspaceId }, _count: true, _sum: { valueAmount: true } }),
      prisma.lead.aggregate({ where: { workspaceId, stage: "WON", wonAt: { gte: since } }, _count: true, _sum: { valueAmount: true } }),
      prisma.lead.count({ where: { workspaceId, createdAt: { gte: since } } }),
    ]);
    const stats = Object.fromEntries(byStage.map((s) => [s.stage, { count: s._count, value: s._sum.valueAmount ?? 0 }]));
    const open = byStage.filter((s) => !["WON", "LOST"].includes(s.stage));
    const closed = (stats.WON?.count ?? 0) + (stats.LOST?.count ?? 0);
    return {
      leads,
      stats: {
        byStage: stats,
        openValue: open.reduce((n, s) => n + (s._sum.valueAmount ?? 0), 0),
        wonLast30: { count: won30._count, value: won30._sum.valueAmount ?? 0 },
        newLast30: created30,
        conversionRate: closed ? Math.round(((stats.WON?.count ?? 0) / closed) * 100) : null,
      },
      followupCreditCost: TASK_CREDIT_COST["crm.followup"],
    };
  });

  app.post("/api/workspaces/:workspaceId/crm/leads", async (req, reply) => {
    const { workspaceId } = parse(wsParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "crm:create");
    const body = parse(
      z.object({
        contact: contactSchema,
        title: z.string().trim().max(200).optional(),
        source: z.enum(LEAD_SOURCES).default("OTHER"),
        campaignId: z.string().nullish(),
        valueAmount: z.number().int().nonnegative().max(10_000_000_000).nullish(),
        note: z.string().trim().max(2000).nullish(),
      }),
      req.body,
    );
    await assertCampaign(workspaceId, body.campaignId);
    const { lead } = await prisma.$transaction(async (tx) => {
      const r = await createLead(tx, workspaceId, { ...body, actorId: ctx.userId });
      await audit({ ...auditCtx(ctx), action: "lead.created", entityType: "lead", entityId: r.lead.id, metadata: { source: body.source } }, tx);
      return r;
    });
    reply.code(201);
    return prisma.lead.findUniqueOrThrow({ where: { id: lead.id }, include: { contact: true } });
  });

  app.get("/api/workspaces/:workspaceId/crm/leads/:id", async (req) => {
    const { workspaceId, id } = parse(wsIdParams, req.params);
    await requireWorkspace(req, workspaceId, "crm:read");
    const lead = await prisma.lead.findFirst({
      where: { id, workspaceId },
      include: { contact: true, campaign: { select: { id: true, name: true } }, activities: { orderBy: { createdAt: "desc" }, take: 100 }, tasks: { orderBy: [{ doneAt: "asc" }, { dueAt: "asc" }] } },
    });
    if (!lead) throw notFound("Lead");
    const actorIds = [...new Set(lead.activities.map((a) => a.actorId).filter((x): x is string => !!x))];
    const actors = await prisma.user.findMany({ where: { id: { in: actorIds } }, select: { id: true, name: true } });
    return { ...lead, actors: Object.fromEntries(actors.map((a) => [a.id, a.name])) };
  });

  app.patch("/api/workspaces/:workspaceId/crm/leads/:id", async (req) => {
    const { workspaceId, id } = parse(wsIdParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "crm:update");
    const body = parse(
      z.object({
        revision: z.number().int(),
        title: z.string().trim().min(1).max(200).optional(),
        stage: z.enum(LEAD_STAGES).optional(),
        valueAmount: z.number().int().nonnegative().max(10_000_000_000).nullish(),
        lostReason: z.string().trim().max(300).nullish(),
        campaignId: z.string().nullish(),
        assigneeId: z.string().nullish(),
      }),
      req.body,
    );
    await assertCampaign(workspaceId, body.campaignId);
    const lead = await prisma.lead.findFirst({ where: { id, workspaceId } });
    if (!lead) throw notFound("Lead");
    if (body.stage === "LOST" && !body.lostReason && !lead.lostReason) throw badRequest("Indiquez la raison de la perte (utile pour l'analyse)");
    const { revision, ...data } = body;
    await prisma.$transaction(async (tx) => {
      const res = await tx.lead.updateMany({
        where: { id, revision },
        data: {
          ...data,
          revision: { increment: 1 },
          lastActivityAt: new Date(),
          ...(body.stage === "WON" && lead.stage !== "WON" ? { wonAt: new Date() } : {}),
          ...(body.stage && body.stage !== "WON" ? { wonAt: null } : {}),
        },
      });
      if (!res.count) throw conflict("Ce lead a été modifié entre-temps, rechargez");
      if (body.stage && body.stage !== lead.stage) {
        await tx.leadActivity.create({ data: { workspaceId, leadId: id, type: "STAGE_CHANGE", body: `${lead.stage} → ${body.stage}${body.lostReason ? ` (${body.lostReason})` : ""}`, actorId: ctx.userId } });
      }
      await rescore(tx, id);
      await audit({ ...auditCtx(ctx), action: body.stage === "WON" ? "lead.won" : "lead.updated", entityType: "lead", entityId: id, metadata: { fields: Object.keys(data) } }, tx);
    });
    return prisma.lead.findUniqueOrThrow({ where: { id }, include: { contact: true } });
  });

  app.post("/api/workspaces/:workspaceId/crm/leads/:id/activities", async (req, reply) => {
    const { workspaceId, id } = parse(wsIdParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "crm:update");
    const body = parse(z.object({ type: z.enum(["NOTE", "CALL", "WHATSAPP", "EMAIL", "MEETING"]), body: z.string().trim().min(1).max(4000) }), req.body);
    if (!(await prisma.lead.findFirst({ where: { id, workspaceId } }))) throw notFound("Lead");
    const activity = await prisma.$transaction(async (tx) => {
      const a = await tx.leadActivity.create({ data: { workspaceId, leadId: id, type: body.type, body: body.body, actorId: ctx.userId } });
      await tx.lead.update({ where: { id }, data: { lastActivityAt: new Date() } });
      await rescore(tx, id);
      return a;
    });
    reply.code(201);
    return activity;
  });

  /** Sales Copilot : propose des messages de relance. L'envoi reste manuel (WhatsApp de l'utilisateur). */
  app.post("/api/workspaces/:workspaceId/crm/leads/:id/followup", async (req, reply) => {
    const { workspaceId, id } = parse(wsIdParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "ai:generate");
    await requireWorkspace(req, workspaceId, "crm:update");
    if (!(await prisma.lead.findFirst({ where: { id, workspaceId } }))) throw notFound("Lead");
    const job = await enqueue({ organizationId: ctx.organizationId, workspaceId, type: "ai.crm_followup", payload: { workspaceId, leadId: id, actorId: ctx.userId }, correlationId: ctx.correlationId, createdById: ctx.userId });
    reply.code(202);
    return { jobId: job.id, estimatedCredits: TASK_CREDIT_COST["crm.followup"] };
  });

  app.patch("/api/workspaces/:workspaceId/crm/contacts/:id", async (req) => {
    const { workspaceId, id } = parse(wsIdParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "crm:update");
    const body = parse(contactSchema.partial().extend({ notes: z.string().max(4000).nullish() }), req.body);
    const contact = await prisma.contact.findFirst({ where: { id, workspaceId } });
    if (!contact) throw notFound("Contact");
    const { consentWhatsApp, phone, ...rest } = body;
    const normalized = phone === undefined ? undefined : phone ? normalizePhone(phone) : null;
    if (phone && !normalized) throw badRequest("Numéro de téléphone invalide");
    const updated = await prisma.contact.update({
      where: { id },
      data: { ...rest, ...(normalized !== undefined ? { phone: normalized } : {}), ...(consentWhatsApp !== undefined ? { consentWhatsApp, consentAt: consentWhatsApp ? new Date() : null } : {}) },
    }).catch((e: { code?: string }) => {
      if (e.code === "P2002") throw conflict("Un autre contact utilise déjà ce numéro");
      throw e;
    });
    await audit({ ...auditCtx(ctx), action: "contact.updated", entityType: "contact", entityId: id, metadata: { consentChanged: consentWhatsApp !== undefined } });
    return updated;
  });

  // ───── Tâches ─────
  app.get("/api/workspaces/:workspaceId/crm/tasks", async (req) => {
    const { workspaceId } = parse(wsParams, req.params);
    await requireWorkspace(req, workspaceId, "crm:read");
    return prisma.crmTask.findMany({ where: { workspaceId, doneAt: null }, include: { lead: { select: { id: true, title: true, contact: { select: { name: true } } } } }, orderBy: [{ dueAt: "asc" }, { createdAt: "asc" }], take: 200 });
  });

  app.post("/api/workspaces/:workspaceId/crm/tasks", async (req, reply) => {
    const { workspaceId } = parse(wsParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "crm:create");
    const body = parse(z.object({ title: z.string().trim().min(1).max(200), dueAt: z.coerce.date().nullish(), leadId: z.string().nullish() }), req.body);
    if (body.leadId && !(await prisma.lead.findFirst({ where: { id: body.leadId, workspaceId } }))) throw badRequest("Lead inconnu");
    reply.code(201);
    return prisma.crmTask.create({ data: { workspaceId, title: body.title, dueAt: body.dueAt ?? null, leadId: body.leadId ?? null, createdById: ctx.userId, assigneeId: ctx.userId } });
  });

  app.patch("/api/workspaces/:workspaceId/crm/tasks/:id", async (req) => {
    const { workspaceId, id } = parse(wsIdParams, req.params);
    await requireWorkspace(req, workspaceId, "crm:update");
    const { done } = parse(z.object({ done: z.boolean() }), req.body);
    const res = await prisma.crmTask.updateMany({ where: { id, workspaceId }, data: { doneAt: done ? new Date() : null } });
    if (!res.count) throw notFound("Tâche");
    return { ok: true };
  });

  // ───── Formulaires de capture ─────
  app.get("/api/workspaces/:workspaceId/crm/forms", async (req) => {
    const { workspaceId } = parse(wsParams, req.params);
    await requireWorkspace(req, workspaceId, "crm:read");
    return prisma.leadForm.findMany({ where: { workspaceId }, include: { campaign: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" } });
  });

  app.post("/api/workspaces/:workspaceId/crm/forms", async (req, reply) => {
    const { workspaceId } = parse(wsParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "crm:create");
    const body = parse(z.object({ title: z.string().trim().min(2).max(120), description: z.string().trim().max(500).nullish(), thankYou: z.string().trim().max(300).optional(), campaignId: z.string().nullish() }), req.body);
    await assertCampaign(workspaceId, body.campaignId);
    const form = await prisma.leadForm.create({ data: { workspaceId, ...body, slug: randomToken(6).toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) || randomToken(4) } });
    await audit({ ...auditCtx(ctx), action: "lead_form.created", entityType: "lead_form", entityId: form.id });
    reply.code(201);
    return form;
  });

  app.patch("/api/workspaces/:workspaceId/crm/forms/:id", async (req) => {
    const { workspaceId, id } = parse(wsIdParams, req.params);
    await requireWorkspace(req, workspaceId, "crm:update");
    const { active } = parse(z.object({ active: z.boolean() }), req.body);
    const res = await prisma.leadForm.updateMany({ where: { id, workspaceId }, data: { active } });
    if (!res.count) throw notFound("Formulaire");
    return { ok: true };
  });
}
