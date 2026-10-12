import type { Job, Prisma } from "@prisma/client";
import { TASK_CREDIT_COST } from "@forlife/shared";
import { prisma } from "../../lib/prisma.js";
import { createId } from "../../lib/id.js";
import { AppError } from "../../lib/errors.js";
import { audit } from "../../lib/audit.js";
import { ledger } from "../billing/ledger.js";
import { runAI } from "../ai/gateway.js";
import { loadBrandContext } from "../ai/context.js";
import { storyboardPrompt, type StoryboardInput, type StoryboardOutput } from "../ai/prompts.js";
import { getStorage } from "../storage/storage.js";
import { isSafeImage } from "../../lib/image.js";
import { palettes, type Image } from "../creative/composer.js";
import { END_CARD, renderVideo, srt, type PlannedScene, type VideoPlan } from "./renderer.js";

const PHOTO_MIME = ["image/png", "image/jpeg", "image/webp"];
const ids = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

/** Video Director : hook + storyboard en scènes éditables (somme = durée cible − carte finale). */
export async function storyboardJob(job: Job) {
  const p = job.payload as { workspaceId: string; projectId: string; actorId: string };
  const project = await prisma.videoProject.findFirstOrThrow({ where: { id: p.projectId, workspaceId: p.workspaceId } });
  const photos = ids(project.productAssetIds);
  const context = await loadBrandContext(p.workspaceId);
  const ai = await runAI<StoryboardInput, StoryboardOutput>({
    organizationId: job.organizationId,
    workspaceId: p.workspaceId,
    actorId: p.actorId,
    prompt: storyboardPrompt,
    input: { context, video: { objective: project.objective, brief: project.brief, offer: project.offer, cta: project.cta, duration: project.durationTarget, photos: photos.length } },
    forbiddenWords: context.forbiddenWords,
    traceId: job.correlationId,
    idempotencyKey: `${job.id}:${job.attempts}`,
  });
  // Normalisation : 3 à 5 scènes, durées recalées sur la cible exacte.
  const target = project.durationTarget - END_CARD;
  const raw = ai.output.scenes.slice(0, 5);
  // L'accroche reste sous 2 s ; le reste du temps est réparti au prorata des scènes suivantes.
  const hook = Math.min(1.8, Math.max(0.8, raw[0]?.duration ?? 1.8));
  const restSum = raw.slice(1).reduce((n, s) => n + Math.max(0.8, s.duration), 0) || 1;
  const durationOf = (i: number, d: number) => (i === 0 ? hook : Math.round((Math.max(0.8, d) / restSum) * (target - hook) * 10) / 10);
  let photoIdx = 0;
  await prisma.$transaction(async (tx) => {
    await tx.videoScene.deleteMany({ where: { projectId: project.id } });
    for (const [i, s] of raw.entries()) {
      const assetId = s.usePhoto && photos.length ? photos[photoIdx++ % photos.length]! : null;
      await tx.videoScene.create({
        data: { projectId: project.id, order: i, duration: durationOf(i, s.duration), overlay: s.overlay.slice(0, 80), caption: s.caption.slice(0, 160), assetId, motion: s.motion },
      });
    }
    await tx.videoProject.update({ where: { id: project.id }, data: { status: "STORYBOARD", hook: ai.output.hook, cta: project.cta ?? ai.output.cta, aiRunId: ai.runId } });
  });
  return { projectId: project.id, scenes: raw.length, aiRunId: ai.runId, isSimulated: ai.isSimulated };
}

/** Contrôle qualité et score de rétention potentielle (règles explicites, estimation). */
export function qualityCheck(project: { durationTarget: number; objective: string; cta: string | null }, scenes: { duration: number; overlay: string; caption: string; assetId: string | null }[]) {
  const checks = [
    { key: "hook", label: "Accroche en moins de 2 secondes", ok: (scenes[0]?.duration ?? 99) <= 2.05 },
    { key: "overlay", label: "Textes à l'écran de 6 mots maximum", ok: scenes.every((s) => s.overlay.trim().split(/\s+/).length <= 6) },
    { key: "captions", label: "Sous-titres sur chaque scène (lecture sans le son)", ok: scenes.every((s) => s.caption.trim().length > 0) },
    { key: "pace", label: "Rythme soutenu (3,5 s maximum par scène)", ok: scenes.every((s) => s.duration <= 3.6) },
    { key: "story", label: "Micro-histoire en 3 à 5 scènes", ok: scenes.length >= 3 && scenes.length <= 5 },
    { key: "cta", label: "Appel à l'action en carte finale", ok: !!project.cta },
    { key: "proof", label: "Vraie photo du produit ou de la réalisation", ok: scenes.some((s) => !!s.assetId) },
    { key: "duration", label: `Durée cible respectée (${project.durationTarget} s)`, ok: Math.abs(scenes.reduce((n, s) => n + s.duration, 0) + END_CARD - project.durationTarget) <= 0.6 },
  ];
  const weights: Record<string, number> = { hook: 20, overlay: 10, captions: 15, pace: 10, story: 10, cta: 15, proof: 12, duration: 8 };
  const score = checks.reduce((n, c) => n + (c.ok ? weights[c.key]! : 0), 0);
  return { score, checks, disclaimer: "Score de rétention potentielle : estimation basée sur des bonnes pratiques, pas une mesure de performance." };
}

async function loadPhoto(workspaceId: string, assetId: string | null): Promise<Image | null> {
  if (!assetId) return null;
  const a = await prisma.brandAsset.findFirst({ where: { id: assetId, workspaceId, deletedAt: null } });
  if (!a || !PHOTO_MIME.includes(a.mime)) return null;
  const data = await getStorage().get(a.storageKey);
  return isSafeImage(data, a.mime) ? { mime: a.mime, data } : null;
}

/** Débit du rendu (usage VIDEO tracé). */
export async function chargeVideoRender(organizationId: string, workspaceId: string, actorId: string, requestId: string) {
  const credits = TASK_CREDIT_COST["video.render"];
  const charge = await ledger.consume({ organizationId, amount: credits, reason: "Vidéo : rendu 9:16", idempotencyKey: `video:${organizationId}:${requestId}`, refType: "video_render" });
  if (charge.replayed) return false;
  const run = await prisma.aIRun.create({
    data: { organizationId, workspaceId, actorId, taskType: "video.render", promptKey: "video.render", promptVersion: 1, provider: "forlife-video", model: "svg-motion-1", status: "SUCCEEDED", input: {}, creditsCharged: credits, traceId: requestId, finishedAt: new Date() },
  });
  await prisma.aIUsageEvent.create({ data: { organizationId, workspaceId, aiRunId: run.id, kind: "VIDEO", provider: "forlife-video", model: "svg-motion-1", units: 1, credits } });
  return true;
}

export async function renderJob(job: Job) {
  const p = job.payload as { workspaceId: string; projectId: string; renderId: string; actorId: string; requestId: string };
  const r = await prisma.videoRender.findUniqueOrThrow({ where: { id: p.renderId } });
  if (r.status === "SUCCEEDED") return { renderId: r.id, alreadyDone: true };
  const project = await prisma.videoProject.findFirstOrThrow({ where: { id: p.projectId, workspaceId: p.workspaceId }, include: { scenes: { orderBy: { order: "asc" } }, workspace: { include: { brand: true } } } });
  await prisma.videoRender.update({ where: { id: r.id }, data: { status: "RENDERING", progress: 0 } });
  try {
    const [guideline, logo] = await Promise.all([
      prisma.brandGuideline.findFirst({ where: { brand: { workspaceId: p.workspaceId }, status: "APPROVED" } }),
      prisma.brandAsset.findFirst({ where: { workspaceId: p.workspaceId, type: "logo", deletedAt: null, mime: { in: PHOTO_MIME } }, orderBy: { createdAt: "desc" } }),
    ]);
    const brandColor = (Array.isArray(guideline?.colors) ? (guideline!.colors as { hex?: string }[]) : []).find((c) => /^#[0-9a-fA-F]{6}$/.test(c.hex ?? ""))?.hex;
    let t = 0;
    const scenes: PlannedScene[] = [];
    for (const s of project.scenes) {
      scenes.push({ start: t, end: t + s.duration, overlay: s.overlay, caption: s.caption, photo: await loadPhoto(p.workspaceId, s.assetId), motion: s.motion as PlannedScene["motion"] });
      t += s.duration;
    }
    const plan: VideoPlan = {
      scenes,
      total: Math.round((t + END_CARD) * 10) / 10,
      palette: palettes(brandColor)["dark"],
      brandName: project.workspace.brand?.name ?? project.workspace.name,
      logo: logo ? await (async () => {
        const data = await getStorage().get(logo.storageKey);
        return isSafeImage(data, logo.mime) ? { mime: logo.mime, data } : null;
      })() : null,
      cta: project.cta ?? "Écrivez-nous sur WhatsApp",
      offer: project.offer,
    };
    let last = 0;
    const mp4 = await renderVideo(plan, (pct) => {
      if (pct - last >= 10) {
        last = pct;
        void prisma.videoRender.update({ where: { id: r.id }, data: { progress: pct } }).catch(() => undefined);
      }
    });
    const base = `${job.organizationId}/${p.workspaceId}/video/${createId()}`;
    await getStorage().put(`${base}.mp4`, mp4, "video/mp4");
    await getStorage().put(`${base}.srt`, Buffer.from(srt(plan), "utf8"), "text/plain");
    const qc = qualityCheck(project, project.scenes);
    await prisma.$transaction([
      prisma.videoRender.update({ where: { id: r.id }, data: { status: "SUCCEEDED", progress: 100, storageKey: `${base}.mp4`, srtKey: `${base}.srt`, durationSec: plan.total, sizeBytes: mp4.length, qc: qc as unknown as Prisma.InputJsonValue, score: qc.score, finishedAt: new Date() } }),
      prisma.videoProject.update({ where: { id: project.id }, data: { status: "RENDERED" } }),
    ]);
    await audit({ organizationId: job.organizationId, workspaceId: p.workspaceId, actorId: p.actorId, action: "video.rendered", entityType: "video_render", entityId: r.id, correlationId: job.correlationId, metadata: { seconds: plan.total, bytes: mp4.length } });
    return { renderId: r.id, sizeBytes: mp4.length };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const final = job.attempts >= job.maxAttempts || /FFmpeg n'est pas installé/.test(message);
    if (final) {
      await prisma.$transaction([
        prisma.videoRender.update({ where: { id: r.id }, data: { status: "FAILED", error: message.slice(0, 500), finishedAt: new Date() } }),
        prisma.videoProject.update({ where: { id: project.id }, data: { status: "FAILED" } }),
      ]);
      await ledger.refund({ organizationId: job.organizationId, amount: TASK_CREDIT_COST["video.render"], reason: "Remboursement : rendu vidéo en échec", idempotencyKey: `video-refund:${job.organizationId}:${p.requestId}` });
      throw new AppError(422, "VIDEO_RENDER_FAILED", message);
    }
    throw e;
  }
}
