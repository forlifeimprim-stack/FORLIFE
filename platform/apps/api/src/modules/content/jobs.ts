import type { Job } from "@prisma/client";
import type { Channel, ObjectiveType } from "@forlife/shared";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/errors.js";
import { audit } from "../../lib/audit.js";
import { runAI } from "../ai/gateway.js";
import { loadBrandContext } from "../ai/context.js";
import { ideasPrompt, postPrompt, type IdeasInput, type IdeasOutput, type PostInput, type PostOutput } from "../ai/prompts.js";

interface IdeasPayload {
  workspaceId: string;
  actorId: string;
  objectiveId?: string;
  objective?: { type: ObjectiveType; title: string };
  audience?: string;
  offer?: string;
  pillarId?: string;
  count: number;
}

/** Content Strategist : angles, hooks, messages et CTA à partir d'un objectif. Résultat éphémère (choix utilisateur). */
export async function contentIdeasJob(job: Job) {
  const p = job.payload as unknown as IdeasPayload;
  const [context, objective, pillar] = await Promise.all([
    loadBrandContext(p.workspaceId),
    p.objectiveId ? prisma.objective.findFirst({ where: { id: p.objectiveId, workspaceId: p.workspaceId } }) : null,
    p.pillarId ? prisma.contentPillar.findFirst({ where: { id: p.pillarId, workspaceId: p.workspaceId } }) : null,
  ]);
  const obj = objective ? { type: objective.type, title: objective.title } : p.objective;
  if (!obj) throw new AppError(400, "OBJECTIVE_REQUIRED", "Objectif introuvable");
  const ai = await runAI<IdeasInput, IdeasOutput>({
    organizationId: job.organizationId,
    workspaceId: p.workspaceId,
    actorId: p.actorId,
    prompt: ideasPrompt,
    input: { context, objective: obj, audience: p.audience ?? null, offer: p.offer ?? null, pillar: pillar?.name ?? null, count: p.count },
    forbiddenWords: context.forbiddenWords,
    traceId: job.correlationId,
    idempotencyKey: `${job.id}:${job.attempts}`,
  });
  return { ideas: ai.output.ideas, aiRunId: ai.runId, isSimulated: ai.isSimulated, safety: ai.safety as never, objectiveId: objective?.id ?? null, pillarId: pillar?.id ?? null };
}

interface PostPayload {
  workspaceId: string;
  actorId: string;
  contentId: string;
  idea: PostInput["idea"];
  channels: Channel[];
  objectiveId: string | null;
}

/** Copywriter + Social Manager : contenu maître et une variante native par réseau. */
export async function contentPostJob(job: Job) {
  const p = job.payload as unknown as PostPayload;
  try {
    const [context, objective] = await Promise.all([
      loadBrandContext(p.workspaceId),
      p.objectiveId ? prisma.objective.findFirst({ where: { id: p.objectiveId, workspaceId: p.workspaceId } }) : null,
    ]);
    const ai = await runAI<PostInput, PostOutput>({
      organizationId: job.organizationId,
      workspaceId: p.workspaceId,
      actorId: p.actorId,
      prompt: postPrompt,
      input: { context, objective: objective ? { type: objective.type, title: objective.title } : null, idea: p.idea, channels: p.channels },
      forbiddenWords: context.forbiddenWords,
      traceId: job.correlationId,
      idempotencyKey: `${job.id}:${job.attempts}`,
    });
    const o = ai.output;
    // Une seule variante par canal demandé (on ignore tout canal non demandé renvoyé par le modèle).
    const byChannel = new Map(o.variants.filter((v) => p.channels.includes(v.channel)).map((v) => [v.channel, v]));
    await prisma.$transaction(async (tx) => {
      await tx.contentVariant.deleteMany({ where: { contentId: p.contentId } });
      await tx.contentVariant.createMany({
        data: [...byChannel.values()].map((v) => ({
          contentId: p.contentId,
          channel: v.channel,
          body: v.body,
          cta: v.cta,
          hashtags: v.hashtags.map((h) => h.replace(/^#/, "").replace(/[^\p{L}\p{N}_]/gu, "")).filter(Boolean),
          aiRunId: ai.runId,
        })),
      });
      await tx.contentItem.update({
        where: { id: p.contentId },
        data: { title: o.title.slice(0, 200), hook: o.hook, body: o.body, cta: o.cta, status: "DRAFT", aiRunId: ai.runId, revision: { increment: 1 }, contentVersion: { increment: 1 } },
      });
      await audit({ organizationId: job.organizationId, workspaceId: p.workspaceId, actorId: p.actorId, action: "content.generated", entityType: "content", entityId: p.contentId, correlationId: job.correlationId, metadata: { aiRunId: ai.runId, channels: p.channels } }, tx);
    });
    return { contentId: p.contentId, aiRunId: ai.runId, isSimulated: ai.isSimulated, safety: ai.safety as never, missingChannels: p.channels.filter((c) => !byChannel.has(c)) };
  } catch (e) {
    const permanent = e instanceof AppError && e.statusCode < 500;
    if (permanent || job.attempts >= job.maxAttempts) {
      await prisma.contentItem.updateMany({ where: { id: p.contentId, status: "GENERATING" }, data: { status: "FAILED" } });
    }
    throw e;
  }
}
