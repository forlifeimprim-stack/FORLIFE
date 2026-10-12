import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { CHANNELS, CONTENT_STATUSES, CONTENT_TYPES, OBJECTIVE_TYPES, TASK_CREDIT_COST } from "@forlife/shared";
import { prisma } from "../../lib/prisma.js";
import { badRequest, conflict, notFound } from "../../lib/errors.js";
import { parse } from "../../lib/validation.js";
import { audit } from "../../lib/audit.js";
import { auditCtx, authenticate, requireWorkspace } from "../../plugins/auth.js";
import { enqueue } from "../jobs/queue.js";
import { getContent, transition, markContentChanged, assertApprovedVersion } from "./service.js";
import { cancelPublications, schedulePublications } from "../social/service.js";

const wsParams = z.object({ workspaceId: z.string() });
const wsIdParams = z.object({ workspaceId: z.string(), id: z.string() });

const ideaSchema = z.object({
  angle: z.string().trim().min(1).max(300),
  hook: z.string().trim().min(1).max(300),
  message: z.string().trim().min(1).max(1000),
  cta: z.string().trim().min(1).max(300),
});

const createSchema = z.object({
  title: z.string().trim().min(1).max(200),
  type: z.enum(CONTENT_TYPES).default("POST"),
  body: z.string().max(10_000).default(""),
  cta: z.string().max(300).nullish(),
  objectiveId: z.string().nullish(),
  pillarId: z.string().nullish(),
  campaignId: z.string().nullish(),
});

const updateSchema = z.object({
  revision: z.number().int(),
  title: z.string().trim().min(1).max(200).optional(),
  body: z.string().max(10_000).optional(),
  cta: z.string().max(300).nullish(),
  hook: z.string().max(300).nullish(),
  pillarId: z.string().nullish(),
  objectiveId: z.string().nullish(),
  campaignId: z.string().nullish(),
});

const variantSchema = z.object({
  body: z.string().min(1).max(10_000).optional(),
  cta: z.string().max(300).nullish(),
  hashtags: z.array(z.string().trim().regex(/^[\p{L}\p{N}_]+$/u, "Hashtag invalide").max(60)).max(30).optional(),
});

const idemKey = (h: unknown, scope: string) => (typeof h === "string" && h.length <= 128 ? `${scope}:${h}` : undefined);

/** Vérifie que des références (pilier, objectif, campagne) appartiennent bien au workspace. */
async function assertRefs(workspaceId: string, refs: { pillarId?: string | null; objectiveId?: string | null; campaignId?: string | null }) {
  const checks: Promise<unknown>[] = [];
  if (refs.pillarId) checks.push(prisma.contentPillar.findFirst({ where: { id: refs.pillarId, workspaceId } }).then((r) => r ?? Promise.reject(badRequest("Pilier inconnu"))));
  if (refs.objectiveId) checks.push(prisma.objective.findFirst({ where: { id: refs.objectiveId, workspaceId } }).then((r) => r ?? Promise.reject(badRequest("Objectif inconnu"))));
  if (refs.campaignId) checks.push(prisma.campaign.findFirst({ where: { id: refs.campaignId, workspaceId } }).then((r) => r ?? Promise.reject(badRequest("Campagne inconnue"))));
  await Promise.all(checks);
}

export async function contentRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);

  app.get("/api/workspaces/:workspaceId/contents", async (req) => {
    const { workspaceId } = parse(wsParams, req.params);
    await requireWorkspace(req, workspaceId, "content:read");
    const q = parse(
      z.object({ status: z.enum(CONTENT_STATUSES).optional(), from: z.coerce.date().optional(), to: z.coerce.date().optional(), q: z.string().max(100).optional() }),
      req.query,
    );
    return prisma.contentItem.findMany({
      where: {
        workspaceId,
        ...(q.status ? { status: q.status } : { status: { not: "ARCHIVED" } }),
        ...(q.from || q.to ? { scheduledAt: { gte: q.from, lt: q.to } } : {}),
        ...(q.q ? { OR: [{ title: { contains: q.q, mode: "insensitive" } }, { body: { contains: q.q, mode: "insensitive" } }] } : {}),
      },
      include: { variants: { select: { id: true, channel: true } }, pillar: { select: { id: true, name: true } } },
      orderBy: { updatedAt: "desc" },
      take: 200,
    });
  });

  app.get("/api/workspaces/:workspaceId/contents/:id", async (req) => {
    const { workspaceId, id } = parse(wsIdParams, req.params);
    await requireWorkspace(req, workspaceId, "content:read");
    const item = await getContent(workspaceId, id);
    const approvals = await prisma.approval.findMany({ where: { workspaceId, entityType: "content", entityId: id }, orderBy: { createdAt: "desc" } });
    return { ...item, approvals };
  });

  app.post("/api/workspaces/:workspaceId/contents", async (req, reply) => {
    const { workspaceId } = parse(wsParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "content:create");
    const body = parse(createSchema, req.body);
    await assertRefs(workspaceId, body);
    const item = await prisma.contentItem.create({ data: { ...body, workspaceId, createdById: ctx.userId } });
    await audit({ ...auditCtx(ctx), action: "content.created", entityType: "content", entityId: item.id });
    reply.code(201);
    return item;
  });

  app.patch("/api/workspaces/:workspaceId/contents/:id", async (req) => {
    const { workspaceId, id } = parse(wsIdParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "content:update");
    const { revision, ...data } = parse(updateSchema, req.body);
    await assertRefs(workspaceId, data);
    const item = await prisma.contentItem.findFirst({ where: { id, workspaceId } });
    if (!item) throw notFound("Contenu");
    if (!["DRAFT", "REVIEW", "APPROVED", "FAILED"].includes(item.status)) throw badRequest("Ce contenu ne peut plus être modifié dans cet état");
    // Toute modification d'un contenu validé (ou en échec) le renvoie en brouillon : il devra être revalidé.
    const backToDraft = await prisma.$transaction(async (tx) => {
      const res = await tx.contentItem.updateMany({ where: { id, workspaceId, revision }, data: { ...data, revision: { increment: 1 } } });
      if (!res.count) throw conflict("Le contenu a été modifié entre-temps, rechargez la page");
      return markContentChanged(tx, id, item.status);
    });
    await audit({ ...auditCtx(ctx), action: "content.updated", entityType: "content", entityId: id, metadata: { fields: Object.keys(data), resetToDraft: backToDraft } });
    return getContent(workspaceId, id);
  });

  app.patch("/api/workspaces/:workspaceId/contents/:id/variants/:variantId", async (req) => {
    const { workspaceId, id, variantId } = parse(wsIdParams.extend({ variantId: z.string() }), req.params);
    const ctx = await requireWorkspace(req, workspaceId, "content:update");
    const data = parse(variantSchema, req.body);
    const item = await getContent(workspaceId, id);
    if (!item.variants.some((v) => v.id === variantId)) throw notFound("Variante");
    if (!["DRAFT", "REVIEW", "APPROVED", "FAILED"].includes(item.status)) throw badRequest("Ce contenu ne peut plus être modifié dans cet état");
    await prisma.$transaction(async (tx) => {
      await tx.contentVariant.update({ where: { id: variantId }, data });
      await tx.contentItem.update({ where: { id }, data: { revision: { increment: 1 } } });
      await markContentChanged(tx, id, item.status);
      await audit({ ...auditCtx(ctx), action: "content.variant.updated", entityType: "content_variant", entityId: variantId }, tx);
    });
    return getContent(workspaceId, id);
  });

  app.delete("/api/workspaces/:workspaceId/contents/:id", async (req) => {
    const { workspaceId, id } = parse(wsIdParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "content:delete");
    const item = await prisma.contentItem.findFirst({ where: { id, workspaceId } });
    if (!item) throw notFound("Contenu");
    if (!["DRAFT", "FAILED"].includes(item.status)) throw badRequest("Seul un brouillon peut être supprimé ; archivez-le sinon");
    await prisma.$transaction(async (tx) => {
      await tx.contentItem.delete({ where: { id } });
      await audit({ ...auditCtx(ctx), action: "content.deleted", entityType: "content", entityId: id, metadata: { title: item.title } }, tx);
    });
    return { ok: true };
  });

  // ───── Génération IA (asynchrone) ─────

  app.post("/api/workspaces/:workspaceId/contents/ideas", async (req, reply) => {
    const { workspaceId } = parse(wsParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "ai:generate");
    const body = parse(
      z.object({
        objectiveId: z.string().optional(),
        objective: z.object({ type: z.enum(OBJECTIVE_TYPES), title: z.string().trim().min(2).max(160) }).optional(),
        audience: z.string().trim().max(300).optional(),
        offer: z.string().trim().max(300).optional(),
        pillarId: z.string().optional(),
        count: z.number().int().min(1).max(6).default(5),
      }).refine((b) => b.objectiveId || b.objective, { message: "Un objectif est requis (stratégie avant génération)" }),
      req.body,
    );
    await assertRefs(workspaceId, { objectiveId: body.objectiveId, pillarId: body.pillarId });
    const job = await enqueue({
      organizationId: ctx.organizationId,
      workspaceId,
      type: "ai.content_ideas",
      payload: { ...body, workspaceId, actorId: ctx.userId },
      correlationId: ctx.correlationId,
      createdById: ctx.userId,
      idempotencyKey: idemKey(req.headers["idempotency-key"], `ideas:${workspaceId}`),
    });
    reply.code(202);
    return { jobId: job.id, estimatedCredits: TASK_CREDIT_COST["content.ideas"] };
  });

  /** Crée immédiatement le contenu en état GENERATING ; le job le remplit (texte maître + variantes par réseau). */
  app.post("/api/workspaces/:workspaceId/contents/generate", async (req, reply) => {
    const { workspaceId } = parse(wsParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "ai:generate");
    await requireWorkspace(req, workspaceId, "content:create");
    const body = parse(
      z.object({
        idea: ideaSchema,
        channels: z.array(z.enum(CHANNELS)).min(1).max(8),
        type: z.enum(CONTENT_TYPES).default("POST"),
        objectiveId: z.string().nullish(),
        pillarId: z.string().nullish(),
        campaignId: z.string().nullish(),
      }),
      req.body,
    );
    await assertRefs(workspaceId, body);
    const key = idemKey(req.headers["idempotency-key"], `post:${workspaceId}`);
    if (key) {
      const existing = await prisma.job.findUnique({ where: { idempotencyKey: key } });
      if (existing) {
        reply.code(202);
        return { jobId: existing.id, contentId: (existing.payload as { contentId: string }).contentId, estimatedCredits: TASK_CREDIT_COST["content.post"] };
      }
    }
    const { item, job } = await prisma.$transaction(async (tx) => {
      const item = await tx.contentItem.create({
        data: {
          workspaceId,
          type: body.type,
          title: body.idea.angle.slice(0, 200),
          angle: body.idea.angle,
          hook: body.idea.hook,
          cta: body.idea.cta,
          status: "GENERATING",
          objectiveId: body.objectiveId ?? null,
          pillarId: body.pillarId ?? null,
          campaignId: body.campaignId ?? null,
          createdById: ctx.userId,
        },
      });
      const job = await enqueue(
        {
          organizationId: ctx.organizationId,
          workspaceId,
          type: "ai.content_post",
          payload: { workspaceId, actorId: ctx.userId, contentId: item.id, idea: body.idea, channels: body.channels, objectiveId: body.objectiveId ?? null },
          correlationId: ctx.correlationId,
          createdById: ctx.userId,
          idempotencyKey: key,
        },
        tx,
      );
      return { item, job };
    });
    reply.code(202);
    return { jobId: job.id, contentId: item.id, estimatedCredits: TASK_CREDIT_COST["content.post"] };
  });

  // ───── Workflow ─────

  app.post("/api/workspaces/:workspaceId/contents/:id/submit", async (req) => {
    const { workspaceId, id } = parse(wsIdParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "approvals:create");
    await prisma.$transaction(async (tx) => {
      await transition(tx, workspaceId, id, "REVIEW");
      const { contentVersion } = await tx.contentItem.findUniqueOrThrow({ where: { id }, select: { contentVersion: true } });
      const approval = await tx.approval.create({ data: { workspaceId, entityType: "content", entityId: id, requestedById: ctx.userId, contentVersion } });
      await audit({ ...auditCtx(ctx), action: "content.submitted", entityType: "content", entityId: id, metadata: { approvalId: approval.id } }, tx);
    });
    return getContent(workspaceId, id);
  });

  app.post("/api/workspaces/:workspaceId/contents/:id/schedule", async (req) => {
    const { workspaceId, id } = parse(wsIdParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "content:update");
    const { scheduledAt } = parse(z.object({ scheduledAt: z.coerce.date() }), req.body);
    if (scheduledAt.getTime() < Date.now() - 60_000) throw badRequest("La date de programmation doit être dans le futur");
    const item = await prisma.contentItem.findFirst({ where: { id, workspaceId } });
    if (!item) throw notFound("Contenu");
    assertApprovedVersion(item);
    await prisma.$transaction(async (tx) => {
      if (item.status === "SCHEDULED") {
        // Re-planification (glisser-déposer dans le calendrier) : seule la date change.
        const res = await tx.contentItem.updateMany({ where: { id, revision: item.revision }, data: { scheduledAt, revision: { increment: 1 } } });
        if (!res.count) throw conflict("Le contenu a été modifié entre-temps, rechargez la page");
      } else {
        await transition(tx, workspaceId, id, "SCHEDULED", { scheduledAt });
      }
      // Publications automatiques sur les comptes connectés (les autres canaux restent manuels).
      const publications = await schedulePublications(tx, workspaceId, id, scheduledAt);
      await audit({ ...auditCtx(ctx), action: "content.scheduled", entityType: "content", entityId: id, metadata: { scheduledAt: scheduledAt.toISOString(), publications } }, tx);
    });
    return getContent(workspaceId, id);
  });

  app.post("/api/workspaces/:workspaceId/contents/:id/unschedule", async (req) => {
    const { workspaceId, id } = parse(wsIdParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "content:update");
    await prisma.$transaction(async (tx) => {
      await transition(tx, workspaceId, id, "APPROVED", { scheduledAt: null });
      await cancelPublications(tx, id);
      await audit({ ...auditCtx(ctx), action: "content.unscheduled", entityType: "content", entityId: id }, tx);
    });
    return getContent(workspaceId, id);
  });

  app.post("/api/workspaces/:workspaceId/contents/:id/archive", async (req) => {
    const { workspaceId, id } = parse(wsIdParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "content:update");
    await prisma.$transaction(async (tx) => {
      await transition(tx, workspaceId, id, "ARCHIVED");
      await audit({ ...auditCtx(ctx), action: "content.archived", entityType: "content", entityId: id }, tx);
    });
    return { ok: true };
  });

  app.get("/api/workspaces/:workspaceId/pillars", async (req) => {
    const { workspaceId } = parse(wsParams, req.params);
    await requireWorkspace(req, workspaceId, "content:read");
    return prisma.contentPillar.findMany({ where: { workspaceId }, orderBy: { name: "asc" } });
  });
}
