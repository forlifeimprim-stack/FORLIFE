import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  COPILOT_ACTION_TYPES,
  COPILOT_ACTIONS,
  COPILOT_AGENT_KEYS,
  COPILOT_AGENTS,
  COPILOT_MESSAGE_MAX,
  COPILOT_MODE_LABELS,
  COPILOT_MODES,
  TASK_CREDIT_COST,
  can,
} from "@forlife/shared";
import { prisma } from "../../lib/prisma.js";
import { conflict, forbidden, notFound } from "../../lib/errors.js";
import { parse } from "../../lib/validation.js";
import { audit } from "../../lib/audit.js";
import { limit } from "../../lib/throttle.js";
import { auditCtx, authenticate, requireWorkspace } from "../../plugins/auth.js";
import { enqueue } from "../jobs/queue.js";
import { allowedActions, executeAction, getSettings } from "./service.js";

const wsParams = z.object({ workspaceId: z.string() });
const wsIdParams = z.object({ workspaceId: z.string(), id: z.string() });

/** Conversation du membre courant (les conversations sont privées : 404 pour les autres). */
async function ownConversation(workspaceId: string, id: string, userId: string) {
  const conv = await prisma.copilotConversation.findFirst({ where: { id, workspaceId, userId } });
  if (!conv) throw notFound("Conversation");
  return conv;
}

export async function copilotRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);

  app.get("/api/workspaces/:workspaceId/copilot", async (req) => {
    const { workspaceId } = parse(wsParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "ai:read");
    const [settings, conversations] = await Promise.all([
      getSettings(workspaceId),
      prisma.copilotConversation.findMany({
        where: { workspaceId, userId: ctx.userId },
        orderBy: { updatedAt: "desc" },
        take: 40,
        select: { id: true, agent: true, title: true, updatedAt: true },
      }),
    ]);
    return {
      settings,
      modes: COPILOT_MODES.map((m) => ({ key: m, ...COPILOT_MODE_LABELS[m] })),
      actionTypes: COPILOT_ACTION_TYPES.map((t) => ({ key: t, label: COPILOT_ACTIONS[t].label, allowedForYou: can(ctx.role, COPILOT_ACTIONS[t].permission) })),
      agents: COPILOT_AGENT_KEYS.map((k) => ({ ...COPILOT_AGENTS[k], actionsForYou: allowedActions(k, settings.mode, ctx.role) })),
      conversations,
      creditCost: TASK_CREDIT_COST["copilot.chat"],
      canChat: can(ctx.role, "ai:generate"),
      canManage: can(ctx.role, "workspace:update"),
    };
  });

  app.put("/api/workspaces/:workspaceId/copilot/settings", async (req) => {
    const { workspaceId } = parse(wsParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "workspace:update");
    const body = parse(
      z.object({
        mode: z.enum(COPILOT_MODES),
        autoActions: z.array(z.enum(COPILOT_ACTION_TYPES)).max(COPILOT_ACTION_TYPES.length).default([]),
        dailyAutoLimit: z.number().int().min(1).max(50).default(10),
      }),
      req.body,
    );
    // On ne peut pas autoriser l'exécution automatique d'une action que l'on n'a pas le droit de faire soi-même.
    const denied = body.autoActions.filter((t) => !can(ctx.role, COPILOT_ACTIONS[t].permission));
    if (denied.length) throw forbidden(`Vos droits ne permettent pas d'automatiser : ${denied.map((t) => COPILOT_ACTIONS[t].label).join(", ")}`);
    const autoActions = Array.from(new Set(body.autoActions));
    const saved = await prisma.copilotSettings.upsert({
      where: { workspaceId },
      create: { workspaceId, mode: body.mode, autoActions, dailyAutoLimit: body.dailyAutoLimit, updatedById: ctx.userId },
      update: { mode: body.mode, autoActions, dailyAutoLimit: body.dailyAutoLimit, updatedById: ctx.userId },
    });
    await audit({ ...auditCtx(ctx), action: "copilot.settings.updated", entityType: "copilot_settings", entityId: workspaceId, metadata: { mode: saved.mode, autoActions, dailyAutoLimit: saved.dailyAutoLimit } });
    return getSettings(workspaceId);
  });

  app.post("/api/workspaces/:workspaceId/copilot/conversations", async (req, reply) => {
    const { workspaceId } = parse(wsParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "ai:generate");
    const { agent } = parse(z.object({ agent: z.enum(COPILOT_AGENT_KEYS).default("copilot") }), req.body ?? {});
    const conv = await prisma.copilotConversation.create({
      data: { organizationId: ctx.organizationId, workspaceId, userId: ctx.userId, agent, title: `${COPILOT_AGENTS[agent].name} — nouvelle conversation` },
    });
    reply.code(201);
    return conv;
  });

  app.get("/api/workspaces/:workspaceId/copilot/conversations/:id", async (req) => {
    const { workspaceId, id } = parse(wsIdParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "ai:read");
    const conv = await ownConversation(workspaceId, id, ctx.userId);
    const messages = await prisma.copilotMessage.findMany({
      where: { conversationId: conv.id },
      orderBy: { createdAt: "asc" },
      take: 200,
      select: {
        id: true,
        role: true,
        content: true,
        status: true,
        isSimulated: true,
        createdAt: true,
        actions: { orderBy: { createdAt: "asc" }, select: { id: true, type: true, title: true, params: true, rationale: true, status: true, auto: true, resultType: true, resultId: true, error: true, decidedAt: true } },
      },
    });
    return { conversation: conv, messages };
  });

  app.delete("/api/workspaces/:workspaceId/copilot/conversations/:id", async (req) => {
    const { workspaceId, id } = parse(wsIdParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "ai:read");
    const conv = await ownConversation(workspaceId, id, ctx.userId);
    await prisma.copilotConversation.delete({ where: { id: conv.id } });
    await audit({ ...auditCtx(ctx), action: "copilot.conversation.deleted", entityType: "copilot_conversation", entityId: conv.id });
    return { ok: true };
  });

  app.post("/api/workspaces/:workspaceId/copilot/conversations/:id/messages", async (req, reply) => {
    const { workspaceId, id } = parse(wsIdParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "ai:generate");
    const { content } = parse(z.object({ content: z.string().trim().min(1).max(COPILOT_MESSAGE_MAX) }), req.body);
    const conv = await ownConversation(workspaceId, id, ctx.userId);
    await limit(`copilot:${ctx.userId}`, 40, 600, "Vous envoyez beaucoup de messages. Patientez quelques minutes.");
    const { userMessage, assistantMessage } = await prisma.$transaction(async (tx) => {
      // Une seule réponse en préparation à la fois par conversation (verrou de ligne).
      await tx.$queryRaw`SELECT id FROM "CopilotConversation" WHERE id = ${conv.id} FOR UPDATE`;
      const busy = await tx.copilotMessage.count({ where: { conversationId: conv.id, status: "PENDING" } });
      if (busy) throw conflict("Le Copilot prépare déjà une réponse dans cette conversation");
      const userMessage = await tx.copilotMessage.create({ data: { conversationId: conv.id, role: "USER", content } });
      const assistantMessage = await tx.copilotMessage.create({ data: { conversationId: conv.id, role: "ASSISTANT", status: "PENDING", createdAt: new Date(userMessage.createdAt.getTime() + 1) } });
      const job = await enqueue(
        {
          organizationId: ctx.organizationId,
          workspaceId,
          type: "ai.copilot_reply",
          payload: { conversationId: conv.id, assistantMessageId: assistantMessage.id, userMessageId: userMessage.id, actorId: ctx.userId },
          correlationId: ctx.correlationId,
          createdById: ctx.userId,
          idempotencyKey: `copilot:${assistantMessage.id}`,
        },
        tx,
      );
      const isFirst = (await tx.copilotMessage.count({ where: { conversationId: conv.id, role: "USER" } })) === 1;
      await tx.copilotConversation.update({
        where: { id: conv.id },
        data: { updatedAt: new Date(), ...(isFirst ? { title: content.replace(/\s+/g, " ").slice(0, 80) } : {}) },
      });
      return { userMessage, assistantMessage: await tx.copilotMessage.update({ where: { id: assistantMessage.id }, data: { jobId: job.id } }) };
    });
    reply.code(202);
    return { userMessage, assistantMessage, estimatedCredits: TASK_CREDIT_COST["copilot.chat"] };
  });

  app.post("/api/workspaces/:workspaceId/copilot/actions/:id/approve", async (req) => {
    const { workspaceId, id } = parse(wsIdParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "ai:generate");
    const action = await prisma.copilotAction.findFirst({ where: { id, workspaceId, conversation: { userId: ctx.userId } } });
    if (!action) throw notFound("Action");
    return executeAction(action.id, workspaceId, { actorId: ctx.userId, auto: false, correlationId: ctx.correlationId, ip: ctx.ip });
  });

  app.post("/api/workspaces/:workspaceId/copilot/actions/:id/reject", async (req) => {
    const { workspaceId, id } = parse(wsIdParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "ai:generate");
    const action = await prisma.copilotAction.findFirst({ where: { id, workspaceId, conversation: { userId: ctx.userId } } });
    if (!action) throw notFound("Action");
    const res = await prisma.copilotAction.updateMany({ where: { id: action.id, status: "PROPOSED" }, data: { status: "REJECTED", decidedAt: new Date(), decidedById: ctx.userId } });
    if (!res.count) throw conflict("Cette action a déjà été traitée");
    await audit({ ...auditCtx(ctx), action: "copilot.action.rejected", entityType: "copilot_action", entityId: action.id, metadata: { type: action.type } });
    return prisma.copilotAction.findUniqueOrThrow({ where: { id: action.id } });
  });
}
