import type { Job } from "@prisma/client";
import type { Channel } from "@forlife/shared";
import { prisma } from "../../lib/prisma.js";
import { audit } from "../../lib/audit.js";
import { runAI } from "../ai/gateway.js";
import { loadBrandContext } from "../ai/context.js";
import { ideasPrompt, type IdeasInput, type IdeasOutput } from "../ai/prompts.js";
import { enqueue } from "../jobs/queue.js";

/**
 * Campaign pack : le Content Strategist propose N angles à partir du brief central,
 * puis un contenu multi-réseaux est lancé par angle (chaque génération est un job tracé et facturé).
 */
export async function campaignPackJob(job: Job) {
  const p = job.payload as { workspaceId: string; campaignId: string; actorId: string; count: number; channels: Channel[] };
  const [context, c] = await Promise.all([loadBrandContext(p.workspaceId), prisma.campaign.findFirstOrThrow({ where: { id: p.campaignId, workspaceId: p.workspaceId } })]);
  const ai = await runAI<IdeasInput, IdeasOutput>({
    organizationId: job.organizationId,
    workspaceId: p.workspaceId,
    actorId: p.actorId,
    prompt: ideasPrompt,
    input: {
      context,
      objective: { type: c.objective, title: `${c.name}${c.brief ? ` — ${c.brief.slice(0, 300)}` : ""}` },
      audience: c.audience,
      offer: c.offer,
      pillar: null,
      count: p.count,
    },
    forbiddenWords: context.forbiddenWords,
    traceId: job.correlationId,
    idempotencyKey: `${job.id}:${job.attempts}`,
  });
  const ideas = ai.output.ideas.slice(0, p.count);
  const contentIds: string[] = [];
  for (const [i, idea] of ideas.entries()) {
    const item = await prisma.contentItem.create({
      data: { workspaceId: p.workspaceId, campaignId: c.id, type: idea.format, title: idea.angle.slice(0, 200), angle: idea.angle, hook: idea.hook, cta: idea.cta, status: "GENERATING", createdById: p.actorId },
    });
    contentIds.push(item.id);
    await enqueue({
      organizationId: job.organizationId,
      workspaceId: p.workspaceId,
      type: "ai.content_post",
      payload: { workspaceId: p.workspaceId, actorId: p.actorId, contentId: item.id, idea: { angle: idea.angle, hook: idea.hook, message: idea.message, cta: idea.cta }, channels: p.channels, objectiveId: null },
      correlationId: job.correlationId,
      createdById: p.actorId,
      idempotencyKey: `pack-post:${job.id}:${i}`,
    });
  }
  await audit({ organizationId: job.organizationId, workspaceId: p.workspaceId, actorId: p.actorId, action: "campaign.pack_generated", entityType: "campaign", entityId: c.id, correlationId: job.correlationId, metadata: { contents: contentIds.length } });
  return { contentIds, aiRunId: ai.runId, isSimulated: ai.isSimulated };
}
