import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { badRequest, notFound } from "../../lib/errors.js";
import { parse } from "../../lib/validation.js";
import { authenticate, requireWorkspace } from "../../plugins/auth.js";

const params = z.object({ workspaceId: z.string(), id: z.string() });

export async function jobRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);

  /** État observable d'un traitement asynchrone (§25 : générations asynchrones à état observable). */
  app.get("/api/workspaces/:workspaceId/jobs/:id", async (req) => {
    const { workspaceId, id } = parse(params, req.params);
    await requireWorkspace(req, workspaceId, "workspace:read");
    const job = await prisma.job.findFirst({
      where: { id, workspaceId },
      select: { id: true, type: true, status: true, progress: true, attempts: true, maxAttempts: true, lastError: true, result: true, createdAt: true, finishedAt: true },
    });
    if (!job) throw notFound("Traitement");
    return job;
  });

  /** Annulation tant que le job n'a pas démarré. */
  app.post("/api/workspaces/:workspaceId/jobs/:id/cancel", async (req) => {
    const { workspaceId, id } = parse(params, req.params);
    await requireWorkspace(req, workspaceId, "ai:generate");
    // Les rendus vidéo (déjà débités, projet verrouillé) vont jusqu'au bout : succès ou remboursement automatique.
    const res = await prisma.job.updateMany({ where: { id, workspaceId, status: "QUEUED", createdById: req.user.sub, type: { not: "video.render" } }, data: { status: "CANCELLED", finishedAt: new Date() } });
    if (!res.count) throw badRequest("Ce traitement ne peut plus être annulé");
    const job = await prisma.job.findUniqueOrThrow({ where: { id } });
    const contentId = (job.payload as { contentId?: string }).contentId;
    if (contentId) await prisma.contentItem.updateMany({ where: { id: contentId, status: "GENERATING" }, data: { status: "DRAFT" } });
    return { ok: true };
  });
}
