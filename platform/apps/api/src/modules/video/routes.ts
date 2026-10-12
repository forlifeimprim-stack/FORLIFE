import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { OBJECTIVE_TYPES, TASK_CREDIT_COST, VIDEO_DURATIONS, VIDEO_MOTIONS } from "@forlife/shared";
import { prisma } from "../../lib/prisma.js";
import { badRequest, conflict, notFound } from "../../lib/errors.js";
import { parse } from "../../lib/validation.js";
import { audit } from "../../lib/audit.js";
import { auditCtx, authenticate, requireWorkspace } from "../../plugins/auth.js";
import { enqueue } from "../jobs/queue.js";
import { getStorage } from "../storage/storage.js";
import { chargeVideoRender, qualityCheck } from "./service.js";
import { ledger } from "../billing/ledger.js";

const wsParams = z.object({ workspaceId: z.string() });
const wsIdParams = z.object({ workspaceId: z.string(), id: z.string() });
const motions = Object.keys(VIDEO_MOTIONS) as [keyof typeof VIDEO_MOTIONS, ...(keyof typeof VIDEO_MOTIONS)[]];

async function loadProject(workspaceId: string, id: string) {
  const project = await prisma.videoProject.findFirst({
    where: { id, workspaceId },
    include: { scenes: { orderBy: { order: "asc" } }, renders: { orderBy: { version: "desc" } } },
  });
  if (!project) throw notFound("Projet vidéo");
  return project;
}

export async function videoRoutes(app: FastifyInstance) {
  app.get("/api/workspaces/:workspaceId/video/projects", { preHandler: authenticate }, async (req) => {
    const { workspaceId } = parse(wsParams, req.params);
    await requireWorkspace(req, workspaceId, "content:read");
    const projects = await prisma.videoProject.findMany({
      where: { workspaceId },
      include: { renders: { orderBy: { version: "desc" }, take: 1, select: { id: true, status: true, score: true, progress: true } }, _count: { select: { scenes: true } } },
      orderBy: { createdAt: "desc" },
      take: 60,
    });
    return projects.map(({ renders, _count, ...p }) => ({ ...p, scenes: _count.scenes, lastRender: renders[0] ?? null }));
  });

  app.post("/api/workspaces/:workspaceId/video/projects", { preHandler: authenticate }, async (req, reply) => {
    const { workspaceId } = parse(wsParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "ai:generate");
    await requireWorkspace(req, workspaceId, "content:create");
    const body = parse(
      z.object({
        title: z.string().trim().min(3).max(120),
        objective: z.enum(OBJECTIVE_TYPES),
        brief: z.string().trim().min(10).max(1000),
        offer: z.string().trim().max(60).nullish(),
        cta: z.string().trim().max(40).nullish(),
        durationTarget: z.union(VIDEO_DURATIONS.map((d) => z.literal(d)) as [z.ZodLiteral<10>, z.ZodLiteral<12>, z.ZodLiteral<15>]).default(15),
        productAssetIds: z.array(z.string()).max(5).default([]),
        contentId: z.string().nullish(),
        campaignId: z.string().nullish(),
      }),
      req.body,
    );
    if (body.productAssetIds.length) {
      const n = await prisma.brandAsset.count({ where: { id: { in: body.productAssetIds }, workspaceId, deletedAt: null } });
      if (n !== new Set(body.productAssetIds).size) throw badRequest("Photo inconnue");
    }
    if (body.contentId && !(await prisma.contentItem.findFirst({ where: { id: body.contentId, workspaceId } }))) throw badRequest("Contenu inconnu");
    if (body.campaignId && !(await prisma.campaign.findFirst({ where: { id: body.campaignId, workspaceId } }))) throw badRequest("Campagne inconnue");
    const project = await prisma.videoProject.create({ data: { ...body, workspaceId, createdById: ctx.userId } });
    const job = await enqueue({ organizationId: ctx.organizationId, workspaceId, type: "ai.video_storyboard", payload: { workspaceId, projectId: project.id, actorId: ctx.userId }, correlationId: ctx.correlationId, createdById: ctx.userId });
    await audit({ ...auditCtx(ctx), action: "video.project_created", entityType: "video_project", entityId: project.id });
    reply.code(202);
    return { projectId: project.id, jobId: job.id, estimatedCredits: TASK_CREDIT_COST["video.storyboard"] };
  });

  app.get("/api/workspaces/:workspaceId/video/projects/:id", { preHandler: authenticate }, async (req) => {
    const { workspaceId, id } = parse(wsIdParams, req.params);
    await requireWorkspace(req, workspaceId, "content:read");
    const project = await loadProject(workspaceId, id);
    return { ...project, qc: qualityCheck(project, project.scenes), renderCreditCost: TASK_CREDIT_COST["video.render"] };
  });

  /** Édition ciblée d'une scène : texte, sous-titre, durée, photo ou mouvement. */
  app.patch("/api/workspaces/:workspaceId/video/scenes/:id", { preHandler: authenticate }, async (req) => {
    const { workspaceId, id } = parse(wsIdParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "content:update");
    const body = parse(
      z.object({
        overlay: z.string().trim().min(1).max(80).optional(),
        caption: z.string().trim().max(160).optional(),
        duration: z.number().min(0.8).max(5).optional(),
        assetId: z.string().nullish(),
        motion: z.enum(motions).optional(),
      }),
      req.body,
    );
    const scene = await prisma.videoScene.findFirst({ where: { id, project: { workspaceId } }, include: { project: true } });
    if (!scene) throw notFound("Scène");
    if (scene.project.status === "RENDERING") throw conflict("Rendu en cours : patientez avant de modifier");
    if (body.assetId && !(await prisma.brandAsset.findFirst({ where: { id: body.assetId, workspaceId, deletedAt: null } }))) throw badRequest("Photo inconnue");
    const updated = await prisma.videoScene.update({ where: { id }, data: { ...body, duration: body.duration !== undefined ? Math.round(body.duration * 10) / 10 : undefined } });
    await audit({ ...auditCtx(ctx), action: "video.scene_updated", entityType: "video_scene", entityId: id, metadata: { fields: Object.keys(body) } });
    return updated;
  });

  /** Mise à jour du projet (appel à l'action, offre, titre). */
  app.patch("/api/workspaces/:workspaceId/video/projects/:id", { preHandler: authenticate }, async (req) => {
    const { workspaceId, id } = parse(wsIdParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "content:update");
    const body = parse(z.object({ title: z.string().trim().min(3).max(120).optional(), cta: z.string().trim().max(40).nullish(), offer: z.string().trim().max(60).nullish() }), req.body);
    const res = await prisma.videoProject.updateMany({ where: { id, workspaceId, status: { not: "RENDERING" } }, data: body });
    if (!res.count) throw notFound("Projet vidéo");
    await audit({ ...auditCtx(ctx), action: "video.project_updated", entityType: "video_project", entityId: id });
    return loadProject(workspaceId, id);
  });

  /** Lance un rendu MP4 9:16 (débit idempotent : un double clic ne crée qu'un rendu). */
  app.post("/api/workspaces/:workspaceId/video/projects/:id/render", { preHandler: authenticate }, async (req, reply) => {
    const { workspaceId, id } = parse(wsIdParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "ai:generate");
    await requireWorkspace(req, workspaceId, "content:update");
    const { requestId } = parse(z.object({ requestId: z.uuid() }), req.body);
    const project = await loadProject(workspaceId, id);
    // Double clic : on renvoie le rendu déjà lancé pour cette demande.
    const jobKey = `video.render:${ctx.organizationId}:${requestId}`;
    const previous = await prisma.job.findUnique({ where: { idempotencyKey: jobKey } });
    if (previous) return project.renders.find((r) => r.id === (previous.payload as { renderId?: string }).renderId) ?? null;
    if (project.scenes.length === 0) throw badRequest("Le storyboard n'est pas encore prêt");
    // Entrée atomique en rendu : deux lancements simultanés ne peuvent pas être débités tous les deux.
    const entered = await prisma.videoProject.updateMany({ where: { id, workspaceId, status: { not: "RENDERING" } }, data: { status: "RENDERING" } });
    if (!entered.count) throw conflict("Un rendu est déjà en cours");
    let charged = false;
    let render;
    try {
      charged = await chargeVideoRender(ctx.organizationId, workspaceId, ctx.userId, requestId);
      if (!charged) throw conflict("Cette demande de rendu a déjà été traitée");
      render = await prisma.$transaction(async (tx) => {
        const r = await tx.videoRender.create({ data: { projectId: id, version: (project.renders[0]?.version ?? 0) + 1, createdById: ctx.userId } });
        await enqueue({ organizationId: ctx.organizationId, workspaceId, type: "video.render", payload: { workspaceId, projectId: id, renderId: r.id, actorId: ctx.userId, requestId }, correlationId: ctx.correlationId, createdById: ctx.userId, idempotencyKey: jobKey, maxAttempts: 2 }, tx);
        return r;
      });
    } catch (e) {
      // Échec avant la mise en file : crédits rendus et projet débloqué.
      if (charged) await ledger.refund({ organizationId: ctx.organizationId, amount: TASK_CREDIT_COST["video.render"], reason: "Remboursement : rendu vidéo non lancé", idempotencyKey: `video-refund:${ctx.organizationId}:${requestId}` });
      await prisma.videoProject.updateMany({ where: { id, status: "RENDERING" }, data: { status: project.status } });
      throw e;
    }
    await audit({ ...auditCtx(ctx), action: "video.render_requested", entityType: "video_render", entityId: render.id });
    reply.code(202);
    return render;
  });

  app.get("/api/workspaces/:workspaceId/video/renders/:id/file", { preHandler: authenticate }, async (req, reply) => {
    const { workspaceId, id } = parse(wsIdParams, req.params);
    await requireWorkspace(req, workspaceId, "content:read");
    const { format } = parse(z.object({ format: z.enum(["mp4", "srt"]).default("mp4") }), req.query);
    const r = await prisma.videoRender.findFirst({ where: { id, project: { workspaceId }, status: "SUCCEEDED" } });
    const key = format === "mp4" ? r?.storageKey : r?.srtKey;
    if (!r || !key) throw notFound("Vidéo");
    const data = await getStorage().get(key);
    return reply
      .header("content-type", format === "mp4" ? "video/mp4" : "application/x-subrip; charset=utf-8")
      .header("content-disposition", `attachment; filename="forlife-video-v${r.version}.${format}"`)
      .header("x-content-type-options", "nosniff")
      .header("cache-control", "private, max-age=3600")
      .send(data);
  });

  /** Validation humaine de la vidéo (droit d'approbation requis). */
  app.post("/api/workspaces/:workspaceId/video/renders/:id/approve", { preHandler: authenticate }, async (req) => {
    const { workspaceId, id } = parse(wsIdParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "content:approve");
    const r = await prisma.videoRender.findFirst({ where: { id, project: { workspaceId }, status: "SUCCEEDED" } });
    if (!r) throw notFound("Vidéo");
    await prisma.videoProject.update({ where: { id: r.projectId }, data: { status: "APPROVED" } });
    await audit({ ...auditCtx(ctx), action: "video.approved", entityType: "video_render", entityId: id, metadata: { score: r.score } });
    return { ok: true };
  });
}
