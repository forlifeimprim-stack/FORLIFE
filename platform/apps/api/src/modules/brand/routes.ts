import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { createId } from "../../lib/id.js";
import { prisma } from "../../lib/prisma.js";
import { sha256 } from "../../lib/crypto.js";
import { badRequest, notFound } from "../../lib/errors.js";
import { parse } from "../../lib/validation.js";
import { audit } from "../../lib/audit.js";
import { loadConfig } from "../../config.js";
import { auditCtx, authenticate, requireWorkspace } from "../../plugins/auth.js";
import { ALLOWED_MIME, getStorage, safeExtension, validateUpload } from "../storage/storage.js";
import { enqueue } from "../jobs/queue.js";
import { CHANNELS, TASK_CREDIT_COST } from "@forlife/shared";

const wsParams = z.object({ workspaceId: z.string() });
const wsIdParams = z.object({ workspaceId: z.string(), id: z.string() });
const strList = z.array(z.string().trim().min(1).max(200)).max(50);

const brandSchema = z.object({
  name: z.string().trim().min(1).max(120),
  mission: z.string().trim().max(1000).nullable(),
  positioning: z.string().trim().max(1000).nullable(),
  values: strList,
  lockedFacts: strList,
}).partial();

const guidelineSchema = z.object({
  tone: z.string().trim().max(500).nullable(),
  voiceByChannel: z.array(z.object({ channel: z.enum(CHANNELS), guidance: z.string().max(500) })).max(10),
  vocabulary: strList,
  forbiddenWords: strList,
  promises: strList,
  proofs: strList,
  objections: strList,
  colors: z.array(z.object({ name: z.string().max(40), hex: z.string().regex(/^#[0-9a-fA-F]{6}$/) })).max(12),
  fonts: strList,
  visualRules: strList,
}).partial();

const productSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(1000).optional(),
  priceAmount: z.number().int().nonnegative().optional(),
  locked: z.boolean().default(true),
});

export async function brandRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);

  app.get("/api/workspaces/:workspaceId/brand", async (req) => {
    const { workspaceId } = parse(wsParams, req.params);
    await requireWorkspace(req, workspaceId, "brand:read");
    const brand = await prisma.brand.findUniqueOrThrow({
      where: { workspaceId },
      include: { guidelines: { orderBy: { version: "desc" } } },
    });
    const [assets, products] = await Promise.all([
      prisma.brandAsset.findMany({ where: { workspaceId, deletedAt: null }, orderBy: { createdAt: "desc" } }),
      prisma.product.findMany({ where: { workspaceId }, orderBy: { createdAt: "asc" } }),
    ]);
    return { brand, assets, products, dnaCreditCost: TASK_CREDIT_COST["brand.dna"] };
  });

  app.patch("/api/workspaces/:workspaceId/brand", async (req) => {
    const { workspaceId } = parse(wsParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "brand:update");
    const body = parse(brandSchema, req.body);
    return prisma.$transaction(async (tx) => {
      const b = await tx.brand.update({ where: { workspaceId }, data: body });
      await audit({ ...auditCtx(ctx), action: "brand.updated", entityType: "brand", entityId: b.id, metadata: { fields: Object.keys(body) } }, tx);
      return b;
    });
  });

  /** Nouvelle version (brouillon) du Brand DNA, initialisée depuis la version approuvée. */
  app.post("/api/workspaces/:workspaceId/brand/guidelines", async (req, reply) => {
    const { workspaceId } = parse(wsParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "brand:update");
    const body = parse(guidelineSchema, req.body);
    const brand = await prisma.brand.findUniqueOrThrow({ where: { workspaceId } });
    const g = await createGuidelineVersion(brand.id, body, ctx.userId, "manual", null);
    await audit({ ...auditCtx(ctx), action: "brand.guideline.created", entityType: "brand_guideline", entityId: g.id, metadata: { version: g.version } });
    reply.code(201);
    return g;
  });

  app.patch("/api/workspaces/:workspaceId/brand/guidelines/:id", async (req) => {
    const { workspaceId, id } = parse(wsIdParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "brand:update");
    const body = parse(guidelineSchema, req.body);
    const g = await prisma.brandGuideline.findFirst({ where: { id, brand: { workspaceId } } });
    if (!g) throw notFound("Version de Brand DNA");
    if (g.status !== "DRAFT") throw badRequest("Seul un brouillon peut être modifié : créez une nouvelle version");
    const updated = await prisma.brandGuideline.update({ where: { id }, data: body });
    await audit({ ...auditCtx(ctx), action: "brand.guideline.updated", entityType: "brand_guideline", entityId: id });
    return updated;
  });

  /** Validation humaine : la version devient la référence, la précédente est archivée. */
  app.post("/api/workspaces/:workspaceId/brand/guidelines/:id/approve", async (req) => {
    const { workspaceId, id } = parse(wsIdParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "brand:approve");
    const g = await prisma.brandGuideline.findFirst({ where: { id, brand: { workspaceId } } });
    if (!g) throw notFound("Version de Brand DNA");
    if (g.status !== "DRAFT") throw badRequest("Cette version n'est pas un brouillon");
    return prisma.$transaction(async (tx) => {
      await tx.brandGuideline.updateMany({ where: { brandId: g.brandId, status: "APPROVED" }, data: { status: "SUPERSEDED" } });
      const approved = await tx.brandGuideline.update({
        where: { id },
        data: { status: "APPROVED", approvedById: ctx.userId, approvedAt: new Date() },
      });
      await audit({ ...auditCtx(ctx), action: "brand.guideline.approved", entityType: "brand_guideline", entityId: id, metadata: { version: g.version } }, tx);
      return approved;
    });
  });

  /** Brand DNA par IA à partir des sources texte + documents texte importés. Asynchrone (job). */
  app.post("/api/workspaces/:workspaceId/brand/analyze", async (req, reply) => {
    const { workspaceId } = parse(wsParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "ai:generate");
    await requireWorkspace(req, workspaceId, "brand:update");
    const body = parse(z.object({ sources: z.string().trim().max(30_000).default(""), includeTextAssets: z.boolean().default(true) }), req.body);
    let sources = body.sources;
    if (body.includeTextAssets) {
      const docs = await prisma.brandAsset.findMany({ where: { workspaceId, mime: "text/plain", deletedAt: null }, take: 5 });
      for (const d of docs) sources += `\n\n[${d.fileName}]\n${(await getStorage().get(d.storageKey)).toString("utf8").slice(0, 8000)}`;
    }
    if (sources.trim().length < 50) throw badRequest("Fournissez au moins quelques phrases sur l'entreprise (50 caractères) ou importez un document texte");
    const job = await enqueue({
      organizationId: ctx.organizationId,
      workspaceId,
      type: "ai.brand_dna",
      payload: { workspaceId, actorId: ctx.userId, sources: sources.slice(0, 40_000) },
      correlationId: ctx.correlationId,
      createdById: ctx.userId,
    });
    reply.code(202);
    return { jobId: job.id, estimatedCredits: TASK_CREDIT_COST["brand.dna"] };
  });

  // ───── Produits (prix verrouillés) ─────
  app.post("/api/workspaces/:workspaceId/products", async (req, reply) => {
    const { workspaceId } = parse(wsParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "brand:update");
    const body = parse(productSchema, req.body);
    const p = await prisma.product.create({ data: { workspaceId, ...body } });
    await audit({ ...auditCtx(ctx), action: "product.created", entityType: "product", entityId: p.id });
    reply.code(201);
    return p;
  });

  app.delete("/api/workspaces/:workspaceId/products/:id", async (req) => {
    const { workspaceId, id } = parse(wsIdParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "brand:update");
    const res = await prisma.product.deleteMany({ where: { id, workspaceId } });
    if (!res.count) throw notFound("Produit");
    await audit({ ...auditCtx(ctx), action: "product.deleted", entityType: "product", entityId: id });
    return { ok: true };
  });

  // ───── Bibliothèque d'assets ─────
  app.post("/api/workspaces/:workspaceId/assets", async (req, reply) => {
    const { workspaceId } = parse(wsParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "assets:create");
    const file = await req.file({ limits: { fileSize: loadConfig().MAX_UPLOAD_BYTES, files: 1 } });
    if (!file) throw badRequest("Aucun fichier reçu");
    const data = await file.toBuffer();
    if (file.file.truncated) throw badRequest("Fichier trop volumineux");
    if (!ALLOWED_MIME.includes(file.mimetype) || !validateUpload(file.mimetype, data)) {
      throw badRequest(`Type de fichier refusé. Formats acceptés : PNG, JPEG, WebP, SVG, PDF, TXT`);
    }
    const typeField = (file.fields.type as { value?: string } | undefined)?.value;
    const type = ["logo", "photo", "catalog", "document", "other"].includes(typeField ?? "") ? typeField! : "other";
    const fileName = file.filename.replace(/[^\p{L}\p{N}._ -]/gu, "_").slice(0, 120) || "fichier";
    const storageKey = `${ctx.organizationId}/${workspaceId}/${createId()}${safeExtension(fileName)}`;
    await getStorage().put(storageKey, data, file.mimetype);
    const brand = await prisma.brand.findUnique({ where: { workspaceId }, select: { id: true } });
    const asset = await prisma.brandAsset.create({
      data: { workspaceId, brandId: brand?.id ?? null, type, fileName, mime: file.mimetype, sizeBytes: data.length, checksum: sha256(data), storageKey, createdById: ctx.userId },
    });
    await audit({ ...auditCtx(ctx), action: "asset.uploaded", entityType: "brand_asset", entityId: asset.id, metadata: { mime: asset.mime, size: asset.sizeBytes } });
    reply.code(201);
    return asset;
  });

  app.get("/api/workspaces/:workspaceId/assets/:id/file", async (req, reply) => {
    const { workspaceId, id } = parse(wsIdParams, req.params);
    await requireWorkspace(req, workspaceId, "assets:read");
    const asset = await prisma.brandAsset.findFirst({ where: { id, workspaceId, deletedAt: null } });
    if (!asset) throw notFound("Fichier");
    const data = await getStorage().get(asset.storageKey);
    reply
      .header("content-type", asset.mime)
      .header("x-content-type-options", "nosniff")
      .header("content-security-policy", "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox")
      .header("cache-control", "private, max-age=300")
      .header("content-disposition", `${asset.mime.startsWith("image/") ? "inline" : "attachment"}; filename="${encodeURIComponent(asset.fileName)}"`);
    return reply.send(data);
  });

  app.delete("/api/workspaces/:workspaceId/assets/:id", async (req) => {
    const { workspaceId, id } = parse(wsIdParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "assets:delete");
    const res = await prisma.brandAsset.updateMany({ where: { id, workspaceId, deletedAt: null }, data: { deletedAt: new Date() } });
    if (!res.count) throw notFound("Fichier");
    await audit({ ...auditCtx(ctx), action: "asset.deleted", entityType: "brand_asset", entityId: id });
    return { ok: true };
  });
}

type GuidelineFields = z.infer<typeof guidelineSchema>;

/** Crée la version N+1, en reprenant la version approuvée comme base. */
export async function createGuidelineVersion(brandId: string, fields: GuidelineFields, actorId: string | null, source: "manual" | "ai", aiRunId: string | null) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const [latest, approved] = await Promise.all([
      prisma.brandGuideline.findFirst({ where: { brandId }, orderBy: { version: "desc" } }),
      prisma.brandGuideline.findFirst({ where: { brandId, status: "APPROVED" } }),
    ]);
    const base = approved ?? latest;
    try {
      return await prisma.brandGuideline.create({
        data: {
          brandId,
          version: (latest?.version ?? 0) + 1,
          status: "DRAFT",
          tone: fields.tone ?? base?.tone ?? null,
          voiceByChannel: fields.voiceByChannel ?? base?.voiceByChannel ?? [],
          vocabulary: fields.vocabulary ?? base?.vocabulary ?? [],
          forbiddenWords: fields.forbiddenWords ?? base?.forbiddenWords ?? [],
          promises: fields.promises ?? base?.promises ?? [],
          proofs: fields.proofs ?? base?.proofs ?? [],
          objections: fields.objections ?? base?.objections ?? [],
          colors: fields.colors ?? base?.colors ?? [],
          fonts: fields.fonts ?? base?.fonts ?? [],
          visualRules: fields.visualRules ?? base?.visualRules ?? [],
          source,
          aiRunId,
          createdById: actorId,
        },
      });
    } catch (e) {
      // Conflit de numéro de version en concurrence : on recalcule.
      if (attempt === 2 || !(e instanceof Error && "code" in e && (e as { code: string }).code === "P2002")) throw e;
    }
  }
  throw new Error("unreachable");
}
