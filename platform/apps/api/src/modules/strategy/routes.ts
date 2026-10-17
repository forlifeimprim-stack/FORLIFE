import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { CHANNELS, OBJECTIVE_TYPES, TASK_CREDIT_COST } from "@forlife/shared";
import { prisma } from "../../lib/prisma.js";
import { badRequest, notFound } from "../../lib/errors.js";
import { parse } from "../../lib/validation.js";
import { audit } from "../../lib/audit.js";
import { auditCtx, authenticate, requireWorkspace } from "../../plugins/auth.js";
import { enqueue } from "../jobs/queue.js";

const wsParams = z.object({ workspaceId: z.string() });
const wsIdParams = z.object({ workspaceId: z.string(), id: z.string() });
const strList = z.array(z.string().trim().min(1).max(200)).max(20);

const profileSchema = z.object({
  sector: z.string().trim().min(2).max(80),
  country: z.string().trim().length(2).default("CI"),
  city: z.string().trim().max(80).nullish(),
  offerSummary: z.string().trim().max(1000).nullish(),
  targetSummary: z.string().trim().max(1000).nullish(),
  differentiators: z.string().trim().max(1000).nullish(),
  resources: z.string().trim().max(1000).nullish(),
  channels: z.array(z.enum(CHANNELS)).default([]),
});
const audienceSchema = z.object({ name: z.string().trim().min(1).max(120), persona: z.string().trim().max(1000).nullish(), pains: strList.default([]), goals: strList.default([]) });
const competitorSchema = z.object({ name: z.string().trim().min(1).max(120), url: z.url().nullish(), notes: z.string().trim().max(2000).nullish() });
const objectiveBase = z.object({
  type: z.enum(OBJECTIVE_TYPES),
  title: z.string().trim().min(2).max(160),
  metric: z.string().trim().min(1).max(80),
  target: z.number().positive(),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  status: z.enum(["ACTIVE", "ACHIEVED", "ABANDONED"]).default("ACTIVE"),
});
const objectiveSchema = objectiveBase.refine((o) => o.periodEnd > o.periodStart, { message: "La fin doit être postérieure au début", path: ["periodEnd"] });

/** CRUD générique sur une entité simple scopée par workspace. */
function crud<T extends z.ZodType>(
  app: FastifyInstance,
  path: string,
  model: "audience" | "competitor" | "objective",
  schema: T,
  partial: z.ZodType,
) {
  // Les délégués Prisma ont des signatures distinctes ; l'accès est restreint aux 3 modèles ci-dessus.
  const delegate = () => prisma[model] as unknown as {
    create(a: object): Promise<{ id: string }>;
    updateMany(a: object): Promise<{ count: number }>;
    deleteMany(a: object): Promise<{ count: number }>;
    findFirst(a: object): Promise<unknown>;
  };
  app.post(`/api/workspaces/:workspaceId/${path}`, async (req, reply) => {
    const { workspaceId } = parse(wsParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "strategy:create");
    const data = parse(schema, req.body) as object;
    const row = await delegate().create({ data: { ...data, workspaceId } });
    await audit({ ...auditCtx(ctx), action: `${model}.created`, entityType: model, entityId: row.id });
    reply.code(201);
    return row;
  });
  app.patch(`/api/workspaces/:workspaceId/${path}/:id`, async (req) => {
    const { workspaceId, id } = parse(wsIdParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "strategy:update");
    const data = parse(partial, req.body) as object;
    const res = await delegate().updateMany({ where: { id, workspaceId }, data });
    if (!res.count) throw notFound();
    await audit({ ...auditCtx(ctx), action: `${model}.updated`, entityType: model, entityId: id });
    return delegate().findFirst({ where: { id, workspaceId } });
  });
  app.delete(`/api/workspaces/:workspaceId/${path}/:id`, async (req) => {
    const { workspaceId, id } = parse(wsIdParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "strategy:delete");
    const res = await delegate().deleteMany({ where: { id, workspaceId } });
    if (!res.count) throw notFound();
    await audit({ ...auditCtx(ctx), action: `${model}.deleted`, entityType: model, entityId: id });
    return { ok: true };
  });
}

export async function strategyRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);

  app.get("/api/workspaces/:workspaceId/strategy", async (req) => {
    const { workspaceId } = parse(wsParams, req.params);
    await requireWorkspace(req, workspaceId, "strategy:read");
    const [profile, audiences, competitors, objectives, plans, recommendations] = await Promise.all([
      prisma.businessProfile.findFirst({ where: { workspaceId }, orderBy: { version: "desc" } }),
      prisma.audience.findMany({ where: { workspaceId }, orderBy: { createdAt: "asc" } }),
      prisma.competitor.findMany({ where: { workspaceId }, orderBy: { createdAt: "asc" } }),
      prisma.objective.findMany({ where: { workspaceId }, orderBy: { periodEnd: "asc" } }),
      prisma.strategyPlan.findMany({ where: { workspaceId }, orderBy: { createdAt: "desc" }, take: 10 }),
      prisma.recommendation.findMany({ where: { workspaceId, status: { in: ["OPEN", "ACCEPTED"] } }, orderBy: [{ impact: "desc" }, { effort: "asc" }] }),
    ]);
    return { profile, audiences, competitors, objectives, plans, recommendations, planCreditCost: TASK_CREDIT_COST["strategy.plan"] };
  });

  /** Business Profile versionné : chaque modification crée une nouvelle version. */
  app.put("/api/workspaces/:workspaceId/business-profile", async (req) => {
    const { workspaceId } = parse(wsParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "strategy:update");
    const body = parse(profileSchema, req.body);
    const latest = await prisma.businessProfile.findFirst({ where: { workspaceId }, orderBy: { version: "desc" } });
    const created = await prisma.businessProfile.create({
      data: { ...body, workspaceId, version: (latest?.version ?? 0) + 1, createdById: ctx.userId },
    });
    await audit({ ...auditCtx(ctx), action: "business_profile.versioned", entityType: "business_profile", entityId: created.id, metadata: { version: created.version } });
    return created;
  });

  crud(app, "audiences", "audience", audienceSchema, audienceSchema.partial());
  crud(app, "competitors", "competitor", competitorSchema, competitorSchema.partial());
  crud(app, "objectives", "objective", objectiveSchema, objectiveBase.partial());

  app.post("/api/workspaces/:workspaceId/strategy/plans/generate", async (req, reply) => {
    const { workspaceId } = parse(wsParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "ai:generate");
    await requireWorkspace(req, workspaceId, "strategy:create");
    const body = parse(z.object({ period: z.enum(["MONTHLY", "QUARTERLY"]).default("MONTHLY") }), req.body ?? {});
    const job = await enqueue({
      organizationId: ctx.organizationId,
      workspaceId,
      type: "ai.strategy_plan",
      payload: { workspaceId, actorId: ctx.userId, period: body.period },
      correlationId: ctx.correlationId,
      createdById: ctx.userId,
      idempotencyKey: typeof req.headers["idempotency-key"] === "string" ? `strategy:${workspaceId}:${req.headers["idempotency-key"]}` : undefined,
    });
    reply.code(202);
    return { jobId: job.id, estimatedCredits: TASK_CREDIT_COST["strategy.plan"] };
  });

  /** Validation d'un plan : il devient la référence et ses piliers alimentent la Content Factory. */
  app.post("/api/workspaces/:workspaceId/strategy/plans/:id/approve", async (req) => {
    const { workspaceId, id } = parse(wsIdParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "strategy:approve");
    const plan = await prisma.strategyPlan.findFirst({ where: { id, workspaceId } });
    if (!plan) throw notFound("Plan");
    if (plan.status !== "DRAFT") throw badRequest("Ce plan n'est pas un brouillon");
    const pillars = ((plan.content as { pillars?: { name: string; description: string }[] }).pillars ?? []).slice(0, 8);
    return prisma.$transaction(async (tx) => {
      await tx.strategyPlan.updateMany({ where: { workspaceId, status: "APPROVED" }, data: { status: "SUPERSEDED" } });
      const approved = await tx.strategyPlan.update({ where: { id }, data: { status: "APPROVED", approvedById: ctx.userId, approvedAt: new Date() } });
      for (const p of pillars) {
        await tx.contentPillar.upsert({
          where: { workspaceId_name: { workspaceId, name: p.name.slice(0, 80) } },
          update: { description: p.description },
          create: { workspaceId, name: p.name.slice(0, 80), description: p.description },
        });
      }
      await audit({ ...auditCtx(ctx), action: "strategy_plan.approved", entityType: "strategy_plan", entityId: id }, tx);
      return approved;
    });
  });

  app.patch("/api/workspaces/:workspaceId/recommendations/:id", async (req) => {
    const { workspaceId, id } = parse(wsIdParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "strategy:update");
    const body = parse(z.object({ status: z.enum(["OPEN", "ACCEPTED", "DONE", "DISMISSED"]) }), req.body);
    const res = await prisma.recommendation.updateMany({ where: { id, workspaceId }, data: body });
    if (!res.count) throw notFound("Recommandation");
    await audit({ ...auditCtx(ctx), action: "recommendation.updated", entityType: "recommendation", entityId: id, metadata: body });
    return { ok: true };
  });
}
