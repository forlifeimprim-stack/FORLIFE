import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { PLANS } from "@forlife/shared";
import { prisma } from "../../lib/prisma.js";
import { parse } from "../../lib/validation.js";
import { authenticate, requireWorkspace } from "../../plugins/auth.js";

/** Business Home : priorité aux actions et recommandations (§24). */
export async function dashboardRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);

  app.get("/api/workspaces/:workspaceId/dashboard", async (req) => {
    const { workspaceId } = parse(z.object({ workspaceId: z.string() }), req.params);
    const ctx = await requireWorkspace(req, workspaceId, "workspace:read");
    const now = new Date();
    const [byStatus, upcoming, recommendations, guideline, objectives, approvedPlan, latestPlan, wallet, sub, pendingApprovals, aiRuns] = await Promise.all([
      prisma.contentItem.groupBy({ by: ["status"], where: { workspaceId }, _count: true }),
      prisma.contentItem.findMany({ where: { workspaceId, status: "SCHEDULED", scheduledAt: { gte: now } }, orderBy: { scheduledAt: "asc" }, take: 5, select: { id: true, title: true, scheduledAt: true } }),
      prisma.recommendation.findMany({ where: { workspaceId, status: "OPEN" }, orderBy: [{ impact: "desc" }, { effort: "asc" }], take: 4 }),
      prisma.brandGuideline.findFirst({ where: { brand: { workspaceId }, status: "APPROVED" }, select: { version: true } }),
      prisma.objective.findMany({ where: { workspaceId, status: "ACTIVE" }, orderBy: { periodEnd: "asc" }, take: 5 }),
      prisma.strategyPlan.findFirst({ where: { workspaceId, status: "APPROVED" }, orderBy: { approvedAt: "desc" } }),
      prisma.strategyPlan.findFirst({ where: { workspaceId }, orderBy: { createdAt: "desc" }, select: { content: true } }),
      prisma.creditWallet.findUnique({ where: { organizationId: ctx.organizationId } }),
      prisma.subscription.findUnique({ where: { organizationId: ctx.organizationId } }),
      prisma.approval.count({ where: { workspaceId, status: "PENDING" } }),
      prisma.aIRun.count({ where: { workspaceId, createdAt: { gte: new Date(Date.now() - 30 * 864e5) } } }),
    ]);
    const counts = Object.fromEntries(byStatus.map((s) => [s.status, s._count]));
    const totalContents = byStatus.reduce((n, s) => n + s._count, 0);
    const plan = PLANS[sub?.planCode ?? "FREE"];
    const auditScore = (latestPlan?.content as { auditScore?: number } | undefined)?.auditScore ?? null;
    return {
      setup: [
        { key: "brand", label: "Valider votre Brand DNA", done: !!guideline, to: "brand" },
        { key: "objectives", label: "Définir au moins un objectif", done: objectives.length > 0, to: "strategy" },
        { key: "strategy", label: "Valider un plan stratégique", done: !!approvedPlan, to: "strategy" },
        { key: "content", label: "Créer votre premier contenu", done: totalContents > 0, to: "content" },
        { key: "schedule", label: "Programmer un contenu approuvé", done: (counts.SCHEDULED ?? 0) + (counts.PUBLISHED ?? 0) > 0, to: "calendar" },
      ],
      contentByStatus: counts,
      pendingApprovals,
      upcoming,
      recommendations,
      objectives,
      auditScore,
      credits: { balance: wallet?.balance ?? 0, monthly: plan.monthlyCredits, plan: plan.name },
      aiRunsLast30Days: aiRuns,
    };
  });
}
