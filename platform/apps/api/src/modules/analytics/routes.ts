import type { FastifyInstance } from "fastify";
import { can } from "@forlife/shared";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { parse } from "../../lib/validation.js";
import { authenticate, requireWorkspace } from "../../plugins/auth.js";
import { analyticsCsv, computeAnalytics } from "./service.js";

const params = z.object({ workspaceId: z.string() });
const query = z.object({ days: z.coerce.number().int().refine((d) => [7, 30, 90, 365].includes(d)).default(30) });

export async function analyticsRoutes(app: FastifyInstance) {
  app.get("/api/workspaces/:workspaceId/analytics", { preHandler: authenticate }, async (req) => {
    const { workspaceId } = parse(params, req.params);
    const { days } = parse(query, req.query);
    const ctx = await requireWorkspace(req, workspaceId, "campaigns:read");
    return computeAnalytics(workspaceId, days, { crm: can(ctx.role, "crm:read") });
  });

  app.get("/api/workspaces/:workspaceId/analytics/report.csv", { preHandler: authenticate }, async (req, reply) => {
    const { workspaceId } = parse(params, req.params);
    const { days } = parse(query, req.query);
    const ctx = await requireWorkspace(req, workspaceId, "campaigns:read");
    const ws = await prisma.workspace.findUniqueOrThrow({ where: { id: workspaceId }, select: { name: true } });
    const data = await computeAnalytics(workspaceId, days, { crm: can(ctx.role, "crm:read") });
    return reply
      .header("content-type", "text/csv; charset=utf-8")
      .header("content-disposition", `attachment; filename="forlife-rapport-${days}j.csv"`)
      .send(analyticsCsv(data, ws.name));
  });
}
