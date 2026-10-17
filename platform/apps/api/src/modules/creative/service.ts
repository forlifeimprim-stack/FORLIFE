import { createHmac, timingSafeEqual } from "node:crypto";
import type { Job, Prisma } from "@prisma/client";
import { TASK_CREDIT_COST, type CreativeFormat, type CreativeLayout } from "@forlife/shared";
import { loadConfig } from "../../config.js";
import { prisma } from "../../lib/prisma.js";
import { createId } from "../../lib/id.js";
import { deriveKey } from "../../lib/crypto.js";
import { isSafeImage } from "../../lib/image.js";
import { notFound } from "../../lib/errors.js";
import { audit } from "../../lib/audit.js";
import { ledger } from "../billing/ledger.js";
import { runAI } from "../ai/gateway.js";
import { loadBrandContext } from "../ai/context.js";
import { conceptsPrompt, type ConceptsInput, type ConceptsOutput } from "../ai/prompts.js";
import { getStorage } from "../storage/storage.js";
import { composeSvg, palettes, renderPng, type CompositionSpec, type Image } from "./composer.js";
import { critique } from "./critic.js";
import { getImageGenerator } from "./imagegen.js";

const RENDERABLE = ["image/png", "image/jpeg", "image/webp"];

async function safeImage(mime: string, storageKey: string): Promise<Image | null> {
  const data = await getStorage().get(storageKey);
  return isSafeImage(data, mime) ? { mime, data } : null;
}

async function loadImage(workspaceId: string, assetId: string | null | undefined): Promise<Image | null> {
  if (!assetId) return null;
  const asset = await prisma.brandAsset.findFirst({ where: { id: assetId, workspaceId, deletedAt: null } });
  if (!asset || !RENDERABLE.includes(asset.mime)) return null;
  const data = await getStorage().get(asset.storageKey);
  // Jamais de décodage d'une image aux dimensions démesurées (gel ou saturation mémoire du serveur).
  return isSafeImage(data, asset.mime) ? { mime: asset.mime, data } : null;
}

const sniffMime = (key: string) => (key.endsWith(".png") ? "image/png" : "image/jpeg");

/**
 * Fond photo généré par IA pour un concept (§9) : facturé seulement si l'image est produite. En cas d'échec
 * (service non activé, filtre de sécurité, crédits insuffisants), le concept garde son fond graphique et la raison est notée.
 */
async function generateBackground(conceptId: string, prompt: string, format: CreativeFormat, ctx: { organizationId: string; workspaceId: string; actorId: string; key: string }) {
  const note = (backgroundNote: string) => prisma.creativeConcept.update({ where: { id: conceptId }, data: { backgroundNote } });
  const gen = getImageGenerator();
  if (!gen) return note("Génération d'images par IA non activée sur ce serveur : fond graphique aux couleurs de la marque.");
  const cost = TASK_CREDIT_COST["creative.image"];
  const wallet = await prisma.creditWallet.findUnique({ where: { organizationId: ctx.organizationId } });
  if ((wallet?.balance ?? 0) < cost) return note("Crédits insuffisants pour le fond photo IA : fond graphique utilisé.");
  let image: Image;
  try {
    image = await gen.generate(prompt, format);
  } catch (e) {
    return note(e instanceof Error ? e.message : "Génération d'image impossible");
  }
  if (!RENDERABLE.includes(image.mime) || !isSafeImage(image.data, image.mime)) return note("Image générée illisible : fond graphique utilisé.");
  try {
    await ledger.consume({ organizationId: ctx.organizationId, amount: cost, reason: "Création : fond photo généré par IA", idempotencyKey: `image:${ctx.key}`, refType: "creative_concept", refId: conceptId });
  } catch {
    return note("Crédits insuffisants pour le fond photo IA : fond graphique utilisé.");
  }
  const storageKey = `${ctx.organizationId}/${ctx.workspaceId}/creative/fond-${createId()}.${image.mime === "image/png" ? "png" : "jpg"}`;
  await getStorage().put(storageKey, image.data, image.mime);
  const run = await prisma.aIRun.create({
    data: { organizationId: ctx.organizationId, workspaceId: ctx.workspaceId, actorId: ctx.actorId, taskType: "creative.image", promptKey: "creative.image", promptVersion: 1, provider: gen.provider, model: gen.model, status: "SUCCEEDED", input: { prompt, format }, creditsCharged: cost, traceId: ctx.key, finishedAt: new Date() },
  });
  await prisma.aIUsageEvent.create({ data: { organizationId: ctx.organizationId, workspaceId: ctx.workspaceId, aiRunId: run.id, kind: "IMAGE", provider: gen.provider, model: gen.model, units: 1, credits: cost } });
  await prisma.creativeConcept.update({ where: { id: conceptId }, data: { backgroundKey: storageKey, backgroundNote: null } });
}

/** Identité visuelle utilisée par le moteur : couleur et logo issus du Brand DNA. */
async function brandVisuals(workspaceId: string) {
  const [guideline, logo, ws] = await Promise.all([
    prisma.brandGuideline.findFirst({ where: { brand: { workspaceId }, status: "APPROVED" } }),
    prisma.brandAsset.findFirst({ where: { workspaceId, type: "logo", deletedAt: null, mime: { in: RENDERABLE } }, orderBy: { createdAt: "desc" } }),
    prisma.workspace.findUniqueOrThrow({ where: { id: workspaceId }, include: { brand: true } }),
  ]);
  const colors = Array.isArray(guideline?.colors) ? (guideline!.colors as { hex?: string }[]) : [];
  const brandColor = colors.find((c) => typeof c.hex === "string" && /^#[0-9a-fA-F]{6}$/.test(c.hex))?.hex ?? null;
  const forbidden = Array.isArray(guideline?.forbiddenWords) ? (guideline!.forbiddenWords as string[]) : [];
  return {
    brandName: ws.brand?.name ?? ws.name,
    brandColor,
    forbidden,
    logo: logo ? await safeImage(logo.mime, logo.storageKey) : null,
  };
}

export interface VersionOverrides {
  headline?: string;
  subline?: string | null;
  cta?: string | null;
  layout?: CreativeLayout;
  mood?: "dark" | "light" | "accent";
}

/** Compose, critique et enregistre une nouvelle version d'un concept (historique complet conservé). */
export async function renderVersion(conceptId: string, overrides: VersionOverrides, actorId: string | null) {
  const concept = await prisma.creativeConcept.findUniqueOrThrow({ where: { id: conceptId }, include: { brief: true, versions: { orderBy: { version: "desc" }, take: 1 } } });
  const brief = concept.brief;
  const prev = (concept.versions[0]?.spec ?? {}) as Partial<CompositionSpec & { mood: string }>;
  const visuals = await brandVisuals(brief.workspaceId);
  // La vraie photo produit prime toujours ; sinon, le fond photo généré par IA pour ce concept.
  const photo = (await loadImage(brief.workspaceId, brief.productAssetId)) ?? (concept.backgroundKey ? await safeImage(sniffMime(concept.backgroundKey), concept.backgroundKey) : null);
  const mood = overrides.mood ?? (prev.mood as "dark" | "light" | "accent" | undefined) ?? ((concept.mood as "dark" | "light" | "accent") || "dark");
  const layout = overrides.layout ?? (prev.layout as CreativeLayout | undefined) ?? (concept.layout as CreativeLayout);
  const spec: CompositionSpec & { mood: string } = {
    format: brief.format as CreativeFormat,
    layout,
    palette: palettes(visuals.brandColor ?? undefined)[mood],
    headline: overrides.headline ?? prev.headline ?? concept.headline,
    subline: overrides.subline !== undefined ? overrides.subline : (prev.subline ?? concept.subline),
    cta: overrides.cta !== undefined ? overrides.cta : (prev.cta ?? concept.cta),
    offer: brief.offer,
    brandName: visuals.brandName,
    mood,
  };
  const composed = composeSvg(spec, { photo, logo: visuals.logo });
  const png = renderPng(composed.svg);
  const report = critique({ spec, objective: brief.objective, hasPhoto: !!photo, hasLogo: !!visuals.logo, brandColor: visuals.brandColor, forbiddenWords: visuals.forbidden, metrics: composed.metrics });
  const ws = await prisma.workspace.findUniqueOrThrow({ where: { id: brief.workspaceId }, select: { organizationId: true } });
  const storageKey = `${ws.organizationId}/${brief.workspaceId}/creative/${createId()}.png`;
  await getStorage().put(storageKey, png, "image/png");
  for (let attempt = 0; attempt < 3; attempt++) {
    const last = await prisma.creativeVersion.findFirst({ where: { conceptId }, orderBy: { version: "desc" }, select: { version: true } });
    try {
      return await prisma.creativeVersion.create({
        data: {
          conceptId,
          workspaceId: brief.workspaceId,
          version: (last?.version ?? 0) + 1,
          spec: { ...spec, palette: spec.palette } as unknown as Prisma.InputJsonValue,
          storageKey,
          width: composed.width,
          height: composed.height,
          critic: report as unknown as Prisma.InputJsonValue,
          score: report.score,
          createdById: actorId,
        },
      });
    } catch (e) {
      if (attempt === 2 || (e as { code?: string }).code !== "P2002") throw e;
    }
  }
  throw new Error("unreachable");
}

/** Facture un rendu supplémentaire (usage IMAGE tracé comme tout appel au moteur de création). */
export async function chargeRender(organizationId: string, workspaceId: string, actorId: string, requestId: string) {
  const credits = TASK_CREDIT_COST["creative.render"];
  const charge = await ledger.consume({ organizationId, amount: credits, reason: "Création : nouvelle version de visuel", idempotencyKey: `render:${organizationId}:${requestId}`, refType: "creative_render" });
  if (charge.replayed) return false;
  const run = await prisma.aIRun.create({
    data: { organizationId, workspaceId, actorId, taskType: "creative.render", promptKey: "creative.render", promptVersion: 1, provider: "forlife-composer", model: "svg-composer-1", status: "SUCCEEDED", input: {}, creditsCharged: credits, traceId: requestId, finishedAt: new Date() },
  });
  await prisma.aIUsageEvent.create({ data: { organizationId, workspaceId, aiRunId: run.id, kind: "IMAGE", provider: "forlife-composer", model: "svg-composer-1", units: 1, credits } });
  return true;
}

/** Creative Director : 3 concepts à partir du brief, puis rendu de la première version de chacun. */
export async function creativeConceptsJob(job: Job) {
  const p = job.payload as { workspaceId: string; briefId: string; actorId: string };
  const brief = await prisma.creativeBrief.findFirstOrThrow({ where: { id: p.briefId, workspaceId: p.workspaceId } });
  const context = await loadBrandContext(p.workspaceId);
  const photo = await loadImage(p.workspaceId, brief.productAssetId);
  const ai = await runAI<ConceptsInput, ConceptsOutput>({
    organizationId: job.organizationId,
    workspaceId: p.workspaceId,
    actorId: p.actorId,
    prompt: conceptsPrompt,
    input: { context, brief: { objective: brief.objective, subject: brief.subject, offer: brief.offer, cta: brief.cta, artDirection: brief.artDirection, format: brief.format, hasProductPhoto: !!photo } },
    forbiddenWords: context.forbiddenWords,
    traceId: job.correlationId,
    idempotencyKey: `${job.id}:${job.attempts}`,
  });
  // Garde-fous : pas de mise en page « produit » sans photo, pas de pastille sans offre.
  const concepts = ai.output.concepts.slice(0, 3).map((c) => ({
    ...c,
    layout: (c.layout === "PRODUCT_HERO" && !photo) || (c.layout === "OFFER_BADGE" && !brief.offer) ? ("BOLD" as const) : c.layout,
  }));
  await prisma.creativeConcept.deleteMany({ where: { briefId: brief.id } });
  for (const [i, c] of concepts.entries()) {
    const concept = await prisma.creativeConcept.create({
      data: { briefId: brief.id, label: "ABC"[i] ?? String(i + 1), title: c.title, rationale: c.rationale, layout: c.layout, headline: c.headline, subline: c.subline, cta: c.cta, mood: c.mood, imagePrompt: c.imagePrompt },
    });
    if (brief.aiImage && !photo && c.imagePrompt.trim()) {
      await generateBackground(concept.id, c.imagePrompt, brief.format as CreativeFormat, { organizationId: job.organizationId, workspaceId: p.workspaceId, actorId: p.actorId, key: `${job.id}:${i}` });
    }
    await renderVersion(concept.id, {}, p.actorId);
  }
  await prisma.creativeBrief.update({ where: { id: brief.id }, data: { status: "CONCEPTS", aiRunId: ai.runId } });
  await audit({ organizationId: job.organizationId, workspaceId: p.workspaceId, actorId: p.actorId, action: "creative.concepts_generated", entityType: "creative_brief", entityId: brief.id, correlationId: job.correlationId, metadata: { aiRunId: ai.runId } });
  return { briefId: brief.id, concepts: concepts.length, aiRunId: ai.runId, isSimulated: ai.isSimulated };
}

// ───── URL publique signée (nécessaire à Instagram, qui télécharge le visuel) ─────

// Clé dédiée (dérivée) : une signature de média ne peut servir à rien d'autre.
const sign = (versionId: string, exp: number) => createHmac("sha256", deriveKey(loadConfig().JWT_SECRET, "media-url")).update(`media:${versionId}:${exp}`).digest("base64url");

export function signedMediaUrl(versionId: string, ttlSeconds = 7 * 86400): string {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  return `${loadConfig().API_PUBLIC_URL}/api/public/media/${versionId}?e=${exp}&s=${sign(versionId, exp)}`;
}

export function verifyMediaSignature(versionId: string, exp: number, sig: string): boolean {
  if (!Number.isFinite(exp) || exp < Date.now() / 1000) return false;
  const expected = Buffer.from(sign(versionId, exp));
  const given = Buffer.from(sig);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export async function versionImage(versionId: string, workspaceId?: string) {
  const v = await prisma.creativeVersion.findFirst({ where: { id: versionId, ...(workspaceId ? { workspaceId } : {}) } });
  if (!v) throw notFound("Visuel");
  return getStorage().get(v.storageKey);
}
