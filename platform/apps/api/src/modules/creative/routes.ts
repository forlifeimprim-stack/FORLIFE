import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { CREATIVE_FORMATS, CREATIVE_LAYOUTS, OBJECTIVE_TYPES, TASK_CREDIT_COST } from "@forlife/shared";
import { prisma, type Tx } from "../../lib/prisma.js";
import { markContentChanged } from "../content/service.js";
import { badRequest, notFound } from "../../lib/errors.js";
import { parse } from "../../lib/validation.js";
import { audit } from "../../lib/audit.js";
import { auditCtx, authenticate, requireWorkspace } from "../../plugins/auth.js";
import { enqueue } from "../jobs/queue.js";
import { ledger } from "../billing/ledger.js";
import { chargeRender, renderVersion, verifyMediaSignature, versionImage } from "./service.js";

const wsParams = z.object({ workspaceId: z.string() });
const wsIdParams = z.object({ workspaceId: z.string(), id: z.string() });
const formats = Object.keys(CREATIVE_FORMATS) as [keyof typeof CREATIVE_FORMATS, ...(keyof typeof CREATIVE_FORMATS)[]];
const layouts = Object.keys(CREATIVE_LAYOUTS) as [keyof typeof CREATIVE_LAYOUTS, ...(keyof typeof CREATIVE_LAYOUTS)[]];

function sendPng(reply: import("fastify").FastifyReply, png: Buffer, cache = "private, max-age=3600") {
  return reply.header("content-type", "image/png").header("x-content-type-options", "nosniff").header("cache-control", cache).send(png);
}

export async function creativeRoutes(app: FastifyInstance) {
  app.get("/api/workspaces/:workspaceId/creative/briefs", { preHandler: authenticate }, async (req) => {
    const { workspaceId } = parse(wsParams, req.params);
    await requireWorkspace(req, workspaceId, "content:read");
    const briefs = await prisma.creativeBrief.findMany({
      where: { workspaceId },
      include: { concepts: { include: { versions: { orderBy: { score: "desc" }, take: 1, select: { id: true, score: true, status: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 60,
    });
    return briefs.map((b) => {
      const best = b.concepts.flatMap((c) => c.versions).sort((x, y) => y.score - x.score)[0] ?? null;
      return { id: b.id, subject: b.subject, objective: b.objective, format: b.format, status: b.status, createdAt: b.createdAt, concepts: b.concepts.length, best };
    });
  });

  app.post("/api/workspaces/:workspaceId/creative/briefs", { preHandler: authenticate }, async (req, reply) => {
    const { workspaceId } = parse(wsParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "ai:generate");
    await requireWorkspace(req, workspaceId, "content:create");
    const body = parse(
      z.object({
        subject: z.string().trim().min(3).max(200),
        objective: z.enum(OBJECTIVE_TYPES),
        format: z.enum(formats).default("SQUARE"),
        offer: z.string().trim().max(60).nullish(),
        cta: z.string().trim().max(40).nullish(),
        artDirection: z.string().trim().max(500).nullish(),
        productAssetId: z.string().nullish(),
        contentId: z.string().nullish(),
        campaignId: z.string().nullish(),
      }),
      req.body,
    );
    if (body.productAssetId && !(await prisma.brandAsset.findFirst({ where: { id: body.productAssetId, workspaceId, deletedAt: null } }))) throw badRequest("Photo inconnue");
    if (body.contentId && !(await prisma.contentItem.findFirst({ where: { id: body.contentId, workspaceId } }))) throw badRequest("Contenu inconnu");
    if (body.campaignId && !(await prisma.campaign.findFirst({ where: { id: body.campaignId, workspaceId } }))) throw badRequest("Campagne inconnue");
    const brief = await prisma.creativeBrief.create({ data: { ...body, workspaceId, createdById: ctx.userId } });
    const job = await enqueue({ organizationId: ctx.organizationId, workspaceId, type: "ai.creative_concepts", payload: { workspaceId, briefId: brief.id, actorId: ctx.userId }, correlationId: ctx.correlationId, createdById: ctx.userId });
    await audit({ ...auditCtx(ctx), action: "creative.brief_created", entityType: "creative_brief", entityId: brief.id });
    reply.code(202);
    return { briefId: brief.id, jobId: job.id, estimatedCredits: TASK_CREDIT_COST["creative.concepts"] };
  });

  app.get("/api/workspaces/:workspaceId/creative/briefs/:id", { preHandler: authenticate }, async (req) => {
    const { workspaceId, id } = parse(wsIdParams, req.params);
    await requireWorkspace(req, workspaceId, "content:read");
    const brief = await prisma.creativeBrief.findFirst({
      where: { id, workspaceId },
      include: { concepts: { orderBy: { label: "asc" }, include: { versions: { orderBy: { version: "desc" } } } } },
    });
    if (!brief) throw notFound("Brief");
    return { ...brief, renderCreditCost: TASK_CREDIT_COST["creative.render"] };
  });

  app.get("/api/workspaces/:workspaceId/creative/versions/:id/image", { preHandler: authenticate }, async (req, reply) => {
    const { workspaceId, id } = parse(wsIdParams, req.params);
    await requireWorkspace(req, workspaceId, "content:read");
    return sendPng(reply, await versionImage(id, workspaceId));
  });

  /** Régénération ciblée : on ne change que ce qui est demandé (titre, mise en page, ambiance…). */
  app.post("/api/workspaces/:workspaceId/creative/concepts/:id/versions", { preHandler: authenticate }, async (req, reply) => {
    const { workspaceId, id } = parse(wsIdParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "ai:generate");
    await requireWorkspace(req, workspaceId, "content:update");
    const body = parse(
      z.object({
        requestId: z.uuid(),
        headline: z.string().trim().min(2).max(90).optional(),
        subline: z.string().trim().max(140).nullish(),
        cta: z.string().trim().max(40).nullish(),
        layout: z.enum(layouts).optional(),
        mood: z.enum(["dark", "light", "accent"]).optional(),
      }),
      req.body,
    );
    const concept = await prisma.creativeConcept.findFirst({ where: { id, brief: { workspaceId } }, include: { brief: true } });
    if (!concept) throw notFound("Concept");
    if (body.layout === "OFFER_BADGE" && !concept.brief.offer) throw badRequest("Ajoutez une offre au brief pour utiliser la pastille");
    const { requestId, ...overrides } = body;
    // Débit d'abord (idempotent) : un double clic ne facture et ne crée qu'une version.
    const charged = await chargeRender(ctx.organizationId, workspaceId, ctx.userId, requestId);
    if (!charged) {
      const latest = await prisma.creativeVersion.findFirst({ where: { conceptId: id }, orderBy: { version: "desc" } });
      return latest;
    }
    try {
      const v = await renderVersion(id, overrides, ctx.userId);
      reply.code(201);
      return v;
    } catch (e) {
      await ledger.refund({ organizationId: ctx.organizationId, amount: TASK_CREDIT_COST["creative.render"], reason: "Remboursement : rendu de visuel en échec", idempotencyKey: `render-refund:${ctx.organizationId}:${requestId}` });
      throw e;
    }
  });

  /**
   * Validation humaine d'un visuel (droit d'approbation requis). S'il est lié à un contenu, il devient son média :
   * c'est une modification de fond, le contenu devra être (re)validé avant toute programmation.
   */
  app.post("/api/workspaces/:workspaceId/creative/versions/:id/approve", { preHandler: authenticate }, async (req) => {
    const { workspaceId, id } = parse(wsIdParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "content:approve");
    const v = await prisma.creativeVersion.findFirst({ where: { id, workspaceId }, include: { concept: { include: { brief: true } } } });
    if (!v) throw notFound("Visuel");
    const contentId = v.concept.brief.contentId;
    await prisma.$transaction(async (tx) => {
      await tx.creativeVersion.update({ where: { id }, data: { status: "APPROVED" } });
      await tx.creativeBrief.update({ where: { id: v.concept.briefId }, data: { status: "DONE" } });
      if (contentId) await setContentMedia(tx, workspaceId, contentId, id);
      await audit({ ...auditCtx(ctx), action: "creative.approved", entityType: "creative_version", entityId: id, metadata: { score: v.score } }, tx);
    });
    return { ok: true, contentId };
  });

  /** Associer (ou retirer) un visuel à un contenu existant : le contenu repasse par l'approbation. */
  app.post("/api/workspaces/:workspaceId/contents/:id/media", { preHandler: authenticate }, async (req) => {
    const { workspaceId, id } = parse(wsIdParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "content:update");
    const { versionId } = parse(z.object({ versionId: z.string().nullable() }), req.body);
    if (versionId && !(await prisma.creativeVersion.findFirst({ where: { id: versionId, workspaceId } }))) throw badRequest("Visuel inconnu");
    await prisma.$transaction((tx) => setContentMedia(tx, workspaceId, id, versionId));
    await audit({ ...auditCtx(ctx), action: "content.media_set", entityType: "content", entityId: id, metadata: { versionId } });
    return { ok: true };
  });

  /** URL publique signée et expirante (téléchargement par Instagram au moment de la publication). */
  app.get("/api/public/media/:id", async (req, reply) => {
    const { id } = parse(z.object({ id: z.string().max(40) }), req.params);
    const q = parse(z.object({ e: z.coerce.number(), s: z.string().max(100) }), req.query);
    if (!verifyMediaSignature(id, q.e, q.s)) throw notFound("Visuel");
    return sendPng(reply, await versionImage(id), "public, max-age=86400");
  });
}

/** Change le visuel d'un contenu : interdit une fois programmé ou publié ; sinon nouvelle version à revalider. */
async function setContentMedia(tx: Tx, workspaceId: string, contentId: string, versionId: string | null) {
  const item = await tx.contentItem.findFirst({ where: { id: contentId, workspaceId } });
  if (!item) throw notFound("Contenu");
  if (["SCHEDULED", "PUBLISHED", "GENERATING", "ARCHIVED"].includes(item.status)) throw badRequest("Déprogrammez ce contenu avant de changer son visuel");
  if (item.mediaVersionId === versionId) return;
  await tx.contentItem.update({ where: { id: contentId }, data: { mediaVersionId: versionId, revision: { increment: 1 } } });
  await markContentChanged(tx, contentId, item.status);
}
