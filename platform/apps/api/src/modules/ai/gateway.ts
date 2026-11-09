import type { Prisma } from "@prisma/client";
import { TASK_CREDIT_COST } from "@forlife/shared";
import { prisma } from "../../lib/prisma.js";
import { loadConfig } from "../../config.js";
import { AppError } from "../../lib/errors.js";
import { ledger } from "../billing/ledger.js";
import { getRegistry } from "./registry.js";
import { checkSafety } from "./safety.js";
import { ProviderError, type AIRequest, type AIResponse } from "./types.js";

export function estimateCredits(task: keyof typeof TASK_CREDIT_COST): number {
  return TASK_CREDIT_COST[task];
}

/**
 * AI Gateway — point d'entrée unique de toute génération IA.
 * 1. débit des crédits (idempotent) avant exécution ;
 * 2. routage vers les fournisseurs disponibles avec fallback ;
 * 3. validation de la sortie par schéma ;
 * 4. contrôle sécurité ;
 * 5. traçabilité (AIRun + AIUsageEvent append-only) ; remboursement en cas d'échec.
 */
export async function runAI<I, O>(req: AIRequest<I>): Promise<AIResponse<O>> {
  const prompt = req.prompt;
  const credits = estimateCredits(prompt.task);

  const run = await prisma.aIRun.create({
    data: {
      organizationId: req.organizationId,
      workspaceId: req.workspaceId,
      actorId: req.actorId,
      taskType: prompt.task,
      promptKey: prompt.key,
      promptVersion: prompt.version,
      input: req.input as Prisma.InputJsonValue,
      traceId: req.traceId,
    },
  });

  const charge = await ledger
    .consume({
      organizationId: req.organizationId,
      amount: credits,
      reason: `IA : ${prompt.task}`,
      idempotencyKey: `ai:${req.idempotencyKey}`,
      refType: "ai_run",
      refId: run.id,
    })
    .catch(async (e) => {
      await prisma.aIRun.update({ where: { id: run.id }, data: { status: "FAILED", error: "Crédits insuffisants", finishedAt: new Date() } });
      throw e;
    });

  const started = Date.now();
  const attempted: string[] = [];
  const errors: string[] = [];
  const candidates = getRegistry().route(prompt.usageKind);

  for (const provider of candidates) {
    attempted.push(provider.name);
    try {
      const result = await provider.generate({ prompt, input: req.input, traceId: req.traceId });
      const parsed = prompt.output.safeParse(result.output);
      if (!parsed.success) {
        errors.push(`${provider.name}: sortie non conforme au schéma`);
        continue;
      }
      const output = parsed.data as O;
      const safety = checkSafety(prompt.textForSafety(output), req.forbiddenWords);
      const latencyMs = Date.now() - started;
      // En production, un contenu simulé (fournisseur de démonstration) n'est jamais facturé.
      const simulatedInProd = provider.name === "mock" && loadConfig().NODE_ENV === "production";
      if (simulatedInProd && !charge.replayed) {
        await ledger.refund({ organizationId: req.organizationId, amount: credits, reason: `Remboursement IA : ${prompt.task} (contenu simulé)`, idempotencyKey: `ai-refund:${req.idempotencyKey}`, refType: "ai_run", refId: run.id });
      }
      const billed = charge.replayed || simulatedInProd ? 0 : credits;
      await prisma.$transaction([
        prisma.aIRun.update({
          where: { id: run.id },
          data: {
            status: "SUCCEEDED",
            provider: provider.name,
            model: result.model,
            attemptedProviders: attempted,
            output: output as Prisma.InputJsonValue,
            latencyMs,
            inputTokens: result.inputTokens ?? null,
            outputTokens: result.outputTokens ?? null,
            creditsCharged: billed,
            safety: safety as unknown as Prisma.InputJsonValue,
            finishedAt: new Date(),
          },
        }),
        prisma.aIUsageEvent.create({
          data: {
            organizationId: req.organizationId,
            workspaceId: req.workspaceId,
            aiRunId: run.id,
            kind: prompt.usageKind,
            provider: provider.name,
            model: result.model,
            units: (result.inputTokens ?? 0) + (result.outputTokens ?? 0),
            credits: billed,
          },
        }),
      ]);
      return {
        runId: run.id,
        output,
        provider: provider.name,
        model: result.model,
        creditsCharged: billed,
        safety,
        isSimulated: provider.name === "mock",
        latencyMs,
        traceId: req.traceId,
      };
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      errors.push(`${provider.name}: ${message}`);
      if (e instanceof ProviderError && !e.retryable) break;
    }
  }

  // Aucun fournisseur n'a abouti : on rembourse et on trace l'échec.
  if (!charge.replayed) {
    await ledger.refund({
      organizationId: req.organizationId,
      amount: credits,
      reason: `Remboursement IA : ${prompt.task} (échec)`,
      idempotencyKey: `ai-refund:${req.idempotencyKey}`,
      refType: "ai_run",
      refId: run.id,
    });
  }
  await prisma.aIRun.update({
    where: { id: run.id },
    data: {
      status: "FAILED",
      attemptedProviders: attempted,
      error: errors.join(" | ") || "Aucun fournisseur IA disponible",
      latencyMs: Date.now() - started,
      finishedAt: new Date(),
    },
  });
  throw new AppError(502, "AI_UNAVAILABLE", "La génération IA a échoué. Vos crédits ont été remboursés.", { attempted });
}
