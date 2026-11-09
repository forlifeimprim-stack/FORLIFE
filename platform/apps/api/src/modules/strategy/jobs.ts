import type { Job } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { audit } from "../../lib/audit.js";
import { runAI } from "../ai/gateway.js";
import { loadBrandContext } from "../ai/context.js";
import { strategyPrompt, type StrategyInput, type StrategyOutput } from "../ai/prompts.js";

interface Payload {
  workspaceId: string;
  actorId: string;
  period: "MONTHLY" | "QUARTERLY";
}

const strArr = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);
const clamp = (n: number) => Math.max(1, Math.min(5, Math.round(n)));

/** Business Strategist : plan stratégique + recommandations priorisées, traçables vers leur contexte. */
export async function strategyPlanJob(job: Job) {
  const p = job.payload as unknown as Payload;
  const [context, objectives, audiences, competitors] = await Promise.all([
    loadBrandContext(p.workspaceId),
    prisma.objective.findMany({ where: { workspaceId: p.workspaceId, status: "ACTIVE" } }),
    prisma.audience.findMany({ where: { workspaceId: p.workspaceId } }),
    prisma.competitor.findMany({ where: { workspaceId: p.workspaceId } }),
  ]);
  const ai = await runAI<StrategyInput, StrategyOutput>({
    organizationId: job.organizationId,
    workspaceId: p.workspaceId,
    actorId: p.actorId,
    prompt: strategyPrompt,
    input: {
      context,
      period: p.period,
      objectives: objectives.map((o) => ({ type: o.type, title: o.title, metric: o.metric, target: o.target, periodEnd: o.periodEnd.toISOString() })),
      audiences: audiences.map((a) => ({ name: a.name, persona: a.persona, pains: strArr(a.pains), goals: strArr(a.goals) })),
      competitors: competitors.map((c) => ({ name: c.name, notes: c.notes })),
    },
    forbiddenWords: context.forbiddenWords,
    traceId: job.correlationId,
    idempotencyKey: `${job.id}:${job.attempts}`,
  });
  const o = ai.output;
  const plan = await prisma.$transaction(async (tx) => {
    const plan = await tx.strategyPlan.create({
      data: {
        workspaceId: p.workspaceId,
        title: o.title,
        period: p.period,
        summary: o.summary,
        content: { ...o, auditScore: Math.max(0, Math.min(100, o.auditScore)), isSimulated: ai.isSimulated, safety: ai.safety } as never,
        businessProfileVersion: context.businessProfileVersion,
        objectiveIds: objectives.map((x) => x.id),
        aiRunId: ai.runId,
        createdById: p.actorId,
      },
    });
    await tx.recommendation.createMany({
      data: o.recommendations.map((r) => ({
        workspaceId: p.workspaceId,
        source: "strategy",
        title: r.title,
        rationale: r.rationale,
        impact: clamp(r.impact),
        effort: clamp(r.effort),
        isEstimate: true,
        evidence: { strategyPlanId: plan.id, businessProfileVersion: context.businessProfileVersion, objectiveIds: objectives.map((x) => x.id) },
        aiRunId: ai.runId,
      })),
    });
    await audit({ organizationId: job.organizationId, workspaceId: p.workspaceId, actorId: p.actorId, action: "strategy_plan.generated", entityType: "strategy_plan", entityId: plan.id, correlationId: job.correlationId, metadata: { aiRunId: ai.runId } }, tx);
    return plan;
  });
  return { strategyPlanId: plan.id, aiRunId: ai.runId, isSimulated: ai.isSimulated };
}
