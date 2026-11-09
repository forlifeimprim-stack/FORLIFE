import type { Job } from "@prisma/client";
import { LEAD_SOURCE_LABELS, LEAD_STAGE_LABELS } from "@forlife/shared";
import { prisma } from "../../lib/prisma.js";
import { runAI } from "../ai/gateway.js";
import { loadBrandContext } from "../ai/context.js";
import { followupPrompt, type FollowupInput, type FollowupOutput } from "../ai/prompts.js";

export async function crmFollowupJob(job: Job) {
  const p = job.payload as { workspaceId: string; leadId: string; actorId: string };
  const lead = await prisma.lead.findFirstOrThrow({
    where: { id: p.leadId, workspaceId: p.workspaceId },
    include: { contact: true, campaign: true, activities: { where: { type: { in: ["NOTE", "CALL", "WHATSAPP", "EMAIL", "MEETING"] } }, orderBy: { createdAt: "desc" }, take: 5 } },
  });
  const context = await loadBrandContext(p.workspaceId);
  const ai = await runAI<FollowupInput, FollowupOutput>({
    organizationId: job.organizationId,
    workspaceId: p.workspaceId,
    actorId: p.actorId,
    prompt: followupPrompt,
    input: {
      context,
      lead: {
        firstName: lead.contact.name.split(" ")[0] ?? lead.contact.name,
        stage: LEAD_STAGE_LABELS[lead.stage],
        source: LEAD_SOURCE_LABELS[lead.source],
        title: lead.title,
        daysSinceLastActivity: Math.floor((Date.now() - lead.lastActivityAt.getTime()) / 864e5),
        history: lead.activities.map((a) => `${a.type} : ${a.body.slice(0, 200)}`),
        campaign: lead.campaign?.name ?? null,
        offer: lead.campaign?.offer ?? null,
      },
    },
    forbiddenWords: context.forbiddenWords,
    traceId: job.correlationId,
    idempotencyKey: `${job.id}:${job.attempts}`,
  });
  return { messages: ai.output.messages, phone: lead.contact.phone, consent: lead.contact.consentWhatsApp, aiRunId: ai.runId, isSimulated: ai.isSimulated, safety: ai.safety as never };
}
