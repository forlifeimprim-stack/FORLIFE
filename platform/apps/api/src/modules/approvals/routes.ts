import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { badRequest, notFound } from "../../lib/errors.js";
import { parse } from "../../lib/validation.js";
import { audit } from "../../lib/audit.js";
import { auditCtx, authenticate, requireWorkspace } from "../../plugins/auth.js";
import { transition } from "../content/service.js";

const wsParams = z.object({ workspaceId: z.string() });
const wsIdParams = z.object({ workspaceId: z.string(), id: z.string() });

/** Centre d'approbation : human-in-the-loop obligatoire avant toute programmation/publication. */
export async function approvalRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);

  app.get("/api/workspaces/:workspaceId/approvals", async (req) => {
    const { workspaceId } = parse(wsParams, req.params);
    await requireWorkspace(req, workspaceId, "approvals:read");
    const q = parse(z.object({ status: z.enum(["PENDING", "APPROVED", "REJECTED"]).default("PENDING") }), req.query);
    const approvals = await prisma.approval.findMany({ where: { workspaceId, status: q.status }, orderBy: { createdAt: "desc" }, take: 100 });
    const contentIds = approvals.filter((a) => a.entityType === "content").map((a) => a.entityId);
    const [contents, users] = await Promise.all([
      prisma.contentItem.findMany({ where: { id: { in: contentIds }, workspaceId }, include: { variants: true } }),
      prisma.user.findMany({ where: { id: { in: approvals.map((a) => a.requestedById).filter((x): x is string => !!x) } }, select: { id: true, name: true } }),
    ]);
    const byId = new Map(contents.map((c) => [c.id, c]));
    const names = new Map(users.map((u) => [u.id, u.name]));
    return approvals.map((a) => ({ ...a, requestedByName: a.requestedById ? names.get(a.requestedById) ?? null : null, content: byId.get(a.entityId) ?? null }));
  });

  app.post("/api/workspaces/:workspaceId/approvals/:id/decide", async (req) => {
    const { workspaceId, id } = parse(wsIdParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "content:approve");
    const body = parse(z.object({ decision: z.enum(["APPROVED", "REJECTED"]), comment: z.string().trim().max(1000).optional() }), req.body);
    if (body.decision === "REJECTED" && !body.comment) throw badRequest("Un commentaire est requis pour un refus");
    const approval = await prisma.approval.findFirst({ where: { id, workspaceId } });
    if (!approval) throw notFound("Demande d'approbation");
    if (approval.status !== "PENDING") throw badRequest("Cette demande a déjà été traitée");
    return prisma.$transaction(async (tx) => {
      // Mise à jour conditionnelle : deux relecteurs simultanés ne peuvent pas décider deux fois.
      const res = await tx.approval.updateMany({
        where: { id, status: "PENDING" },
        data: { status: body.decision, decidedById: ctx.userId, decidedAt: new Date(), comment: body.comment ?? null },
      });
      if (!res.count) throw badRequest("Cette demande a déjà été traitée");
      if (approval.entityType === "content") {
        await transition(tx, workspaceId, approval.entityId, body.decision === "APPROVED" ? "APPROVED" : "DRAFT");
      }
      await audit({ ...auditCtx(ctx), action: `approval.${body.decision.toLowerCase()}`, entityType: approval.entityType, entityId: approval.entityId, metadata: { approvalId: id, selfApproval: approval.requestedById === ctx.userId } }, tx);
      return { ok: true, status: body.decision };
    });
  });
}
