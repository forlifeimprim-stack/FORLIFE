import type { Job } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { audit } from "../../lib/audit.js";
import { runAI } from "../ai/gateway.js";
import { loadBrandContext } from "../ai/context.js";
import { brandDnaPrompt, type BrandDnaInput, type BrandDnaOutput } from "../ai/prompts.js";
import { createGuidelineVersion } from "./routes.js";

interface Payload {
  workspaceId: string;
  actorId: string;
  sources: string;
}

/** Brand Guardian : produit une nouvelle version BROUILLON du Brand DNA (validation humaine requise). */
export async function brandDnaJob(job: Job) {
  const p = job.payload as unknown as Payload;
  const context = await loadBrandContext(p.workspaceId);
  const ai = await runAI<BrandDnaInput, BrandDnaOutput>({
    organizationId: job.organizationId,
    workspaceId: p.workspaceId,
    actorId: p.actorId,
    prompt: brandDnaPrompt,
    input: { context, sources: p.sources },
    traceId: job.correlationId,
    idempotencyKey: `${job.id}:${job.attempts}`,
  });
  const brand = await prisma.brand.findUniqueOrThrow({ where: { workspaceId: p.workspaceId } });
  const o = ai.output;
  const guideline = await createGuidelineVersion(
    brand.id,
    {
      tone: o.tone,
      voiceByChannel: o.voiceByChannel,
      vocabulary: o.vocabulary,
      forbiddenWords: o.forbiddenWords,
      promises: o.promises,
      proofs: o.proofs,
      objections: o.objections,
    },
    p.actorId,
    "ai",
    ai.runId,
  );
  // Mission/positionnement : uniquement proposés s'ils sont vides (on n'écrase jamais une saisie humaine).
  await prisma.brand.update({
    where: { id: brand.id },
    data: {
      mission: brand.mission ?? o.mission,
      positioning: brand.positioning ?? o.positioning,
      values: Array.isArray(brand.values) && brand.values.length ? undefined : o.values,
    },
  });
  await audit({ organizationId: job.organizationId, workspaceId: p.workspaceId, actorId: p.actorId, action: "brand.dna.generated", entityType: "brand_guideline", entityId: guideline.id, correlationId: job.correlationId, metadata: { aiRunId: ai.runId, provider: ai.provider } });
  return { guidelineId: guideline.id, version: guideline.version, aiRunId: ai.runId, isSimulated: ai.isSimulated, safety: ai.safety as never };
}
