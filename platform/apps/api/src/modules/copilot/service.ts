import type { CopilotAction, Job, Prisma } from "@prisma/client";
import {
  COPILOT_ACTION_TYPES,
  COPILOT_ACTIONS,
  COPILOT_AGENTS,
  can,
  type CopilotActionType,
  type CopilotAgentKey,
  type CopilotMode,
  type Role,
} from "@forlife/shared";
import { prisma } from "../../lib/prisma.js";
import { AppError, badRequest, conflict, forbidden, notFound } from "../../lib/errors.js";
import { audit } from "../../lib/audit.js";
import { runAI } from "../ai/gateway.js";
import { loadCopilotMemory } from "./memory.js";
import { copilotPrompt, type CopilotInput, type CopilotOutput, type CopilotProposedAction } from "./prompt.js";

const HISTORY_MESSAGES = 12;
const DAY = 864e5;

export interface CopilotSettingsView {
  mode: CopilotMode;
  autoActions: CopilotActionType[];
  dailyAutoLimit: number;
}

const isActionType = (v: unknown): v is CopilotActionType => typeof v === "string" && (COPILOT_ACTION_TYPES as readonly string[]).includes(v);

export async function getSettings(workspaceId: string): Promise<CopilotSettingsView> {
  const s = await prisma.copilotSettings.findUnique({ where: { workspaceId } });
  return {
    mode: s?.mode ?? "COPILOT",
    autoActions: Array.isArray(s?.autoActions) ? s.autoActions.filter(isActionType) : [],
    dailyAutoLimit: s?.dailyAutoLimit ?? 10,
  };
}

/** Rôle courant d'un membre sur un workspace (null s'il n'y a plus accès). */
export async function memberRole(userId: string, workspaceId: string): Promise<Role | null> {
  const ws = await prisma.workspace.findUnique({ where: { id: workspaceId }, select: { organizationId: true, status: true, organization: { select: { status: true } } } });
  if (!ws || ws.status !== "ACTIVE" || ws.organization.status !== "ACTIVE") return null;
  const m = await prisma.membership.findUnique({
    where: { organizationId_userId: { organizationId: ws.organizationId, userId } },
    include: { workspaces: { where: { workspaceId } } },
  });
  if (!m || (!m.allWorkspaces && m.workspaces.length === 0)) return null;
  return m.role;
}

/** Types d'actions que l'agent peut proposer à ce membre dans ce mode. */
export function allowedActions(agent: CopilotAgentKey, mode: CopilotMode, role: Role): CopilotActionType[] {
  if (mode === "ASSISTED") return [];
  return COPILOT_AGENTS[agent].actions.filter((t) => can(role, COPILOT_ACTIONS[t].permission));
}

const clampInt = (n: number | null, min: number, max: number, dflt: number) => (n == null || !Number.isFinite(n) ? dflt : Math.max(min, Math.min(max, Math.round(n))));
const text = (s: string | null | undefined, max: number) => (s ?? "").trim().slice(0, max);

/** Normalise une action proposée par l'IA (bornes, références) ; null si elle est inutilisable. */
export async function normalizeAction(workspaceId: string, a: CopilotProposedAction, allowed: CopilotActionType[]) {
  if (!allowed.includes(a.type)) return null;
  const title = text(a.title, 200);
  if (!title) return null;
  const rationale = text(a.rationale, 1000) || null;
  switch (a.type) {
    case "content.draft":
      return { type: a.type, title, rationale, params: { body: text(a.body, 10_000), cta: text(a.cta, 300) || null } };
    case "crm.task": {
      const lead = a.leadId ? await prisma.lead.findFirst({ where: { id: a.leadId, workspaceId }, select: { id: true } }) : null;
      return { type: a.type, title, rationale, params: { dueInDays: clampInt(a.dueInDays, 0, 30, 1), leadId: lead?.id ?? null } };
    }
    case "strategy.recommendation":
      return { type: a.type, title, rationale, params: { impact: clampInt(a.impact, 1, 5, 3), effort: clampInt(a.effort, 1, 5, 3) } };
    case "campaign.draft":
      return { type: a.type, title, rationale, params: { brief: text(a.body, 4000) || null, objective: a.objective ?? "LEADS" } };
  }
}

interface ExecuteOptions {
  actorId: string;
  auto: boolean;
  correlationId: string;
  ip?: string | null;
}

/**
 * Exécute une action PROPOSÉE, une seule fois (verrou sur le statut), avec les droits actuels de l'acteur.
 * Ne crée que des éléments internes en brouillon : rien n'est publié ni envoyé.
 */
export async function executeAction(actionId: string, workspaceId: string, opts: ExecuteOptions): Promise<CopilotAction> {
  const action = await prisma.copilotAction.findFirst({ where: { id: actionId, workspaceId } });
  if (!action) throw notFound("Action");
  if (action.status !== "PROPOSED") throw conflict("Cette action a déjà été traitée");
  if (!isActionType(action.type)) throw badRequest("Type d'action inconnu");
  const role = await memberRole(opts.actorId, workspaceId);
  if (!role || !can(role, COPILOT_ACTIONS[action.type].permission)) throw forbidden("Vos droits ne permettent pas cette action");

  const p = action.params as Record<string, unknown>;
  try {
    return await prisma.$transaction(async (tx) => {
      const locked = await tx.copilotAction.updateMany({ where: { id: action.id, status: "PROPOSED" }, data: { status: "EXECUTED", decidedAt: new Date(), decidedById: opts.actorId, auto: opts.auto } });
      if (!locked.count) throw conflict("Cette action a déjà été traitée");
      let result: { type: string; id: string };
      switch (action.type as CopilotActionType) {
        case "content.draft": {
          const c = await tx.contentItem.create({ data: { workspaceId, title: action.title, body: String(p.body ?? ""), cta: (p.cta as string | null) ?? null, status: "DRAFT", createdById: opts.actorId } });
          result = { type: "content", id: c.id };
          break;
        }
        case "crm.task": {
          const t = await tx.crmTask.create({
            data: { workspaceId, title: action.title, dueAt: new Date(Date.now() + Number(p.dueInDays ?? 1) * DAY), leadId: (p.leadId as string | null) ?? null, createdById: opts.actorId, assigneeId: opts.actorId },
          });
          result = { type: "crm_task", id: t.id };
          break;
        }
        case "strategy.recommendation": {
          const r = await tx.recommendation.create({
            data: { workspaceId, source: "copilot", title: action.title, rationale: action.rationale ?? action.title, impact: Number(p.impact ?? 3), effort: Number(p.effort ?? 3), isEstimate: true, evidence: { copilotActionId: action.id } },
          });
          result = { type: "recommendation", id: r.id };
          break;
        }
        case "campaign.draft": {
          const c = await tx.campaign.create({ data: { workspaceId, name: action.title, objective: p.objective as never, brief: (p.brief as string | null) ?? null, status: "DRAFT", createdById: opts.actorId } });
          result = { type: "campaign", id: c.id };
          break;
        }
      }
      const done = await tx.copilotAction.update({ where: { id: action.id }, data: { resultType: result.type, resultId: result.id } });
      await audit(
        {
          organizationId: action.organizationId,
          workspaceId,
          actorId: opts.actorId,
          action: opts.auto ? "copilot.action.auto_executed" : "copilot.action.approved",
          entityType: "copilot_action",
          entityId: action.id,
          metadata: { type: action.type, resultType: result.type, resultId: result.id },
          ip: opts.ip ?? null,
          correlationId: opts.correlationId,
        },
        tx,
      );
      return done;
    });
  } catch (e) {
    if (e instanceof AppError) throw e;
    await prisma.copilotAction.updateMany({ where: { id: action.id, status: "PROPOSED" }, data: { status: "FAILED", error: "Exécution impossible", decidedAt: new Date(), decidedById: opts.actorId } });
    throw new AppError(500, "COPILOT_ACTION_FAILED", "L'action n'a pas pu être exécutée");
  }
}

interface ReplyPayload {
  conversationId: string;
  assistantMessageId: string;
  userMessageId: string;
  actorId: string;
}

/** Job « ai.copilot_reply » : réponse de l'agent, actions proposées et, en autopilot borné, exécution automatique. */
export async function copilotReplyJob(job: Job): Promise<Prisma.InputJsonValue> {
  const p = job.payload as unknown as ReplyPayload;
  try {
    return await reply(job, p);
  } catch (e) {
    const permanent = e instanceof AppError && e.statusCode < 500;
    if (permanent || job.attempts >= job.maxAttempts) {
      const message = e instanceof AppError && e.statusCode < 500 ? e.message : "Le Copilot n'a pas pu répondre. Vos crédits ont été remboursés ; réessayez dans un instant.";
      await prisma.copilotMessage.updateMany({ where: { id: p.assistantMessageId, status: "PENDING" }, data: { status: "FAILED", content: message } });
    }
    throw e;
  }
}

async function reply(job: Job, p: ReplyPayload): Promise<Prisma.InputJsonValue> {
  const conv = await prisma.copilotConversation.findUniqueOrThrow({ where: { id: p.conversationId } });
  const pending = await prisma.copilotMessage.findUniqueOrThrow({ where: { id: p.assistantMessageId } });
  if (pending.status !== "PENDING") return { skipped: true };
  const role = await memberRole(p.actorId, conv.workspaceId);
  if (!role || !can(role, "ai:generate")) throw forbidden("Vous n'avez plus accès à cet espace");

  const agentKey = (conv.agent in COPILOT_AGENTS ? conv.agent : "copilot") as CopilotAgentKey;
  const agent = COPILOT_AGENTS[agentKey];
  const settings = await getSettings(conv.workspaceId);
  const allowed = allowedActions(agentKey, settings.mode, role);
  const [memory, history, userMessage] = await Promise.all([
    loadCopilotMemory(conv.organizationId, conv.workspaceId, role),
    prisma.copilotMessage.findMany({
      where: { conversationId: conv.id, status: "DONE", id: { not: p.userMessageId }, createdAt: { lte: pending.createdAt } },
      orderBy: { createdAt: "desc" },
      take: HISTORY_MESSAGES,
      select: { role: true, content: true },
    }),
    prisma.copilotMessage.findUniqueOrThrow({ where: { id: p.userMessageId }, select: { content: true } }),
  ]);

  const ai = await runAI<CopilotInput, CopilotOutput>({
    organizationId: conv.organizationId,
    workspaceId: conv.workspaceId,
    actorId: p.actorId,
    prompt: copilotPrompt,
    input: {
      agent: { key: agent.key, name: agent.name, role: agent.role, mission: agent.mission },
      mode: settings.mode,
      allowedActions: allowed,
      memory: memory.text,
      history: history.reverse().map((m) => ({ role: m.role === "USER" ? "USER" : "ASSISTANT", content: m.content.slice(0, 2000) })),
      message: userMessage.content,
      today: new Date().toISOString().slice(0, 10),
    },
    forbiddenWords: memory.forbiddenWords,
    traceId: job.correlationId,
    idempotencyKey: `${job.id}:${job.attempts}`,
  });

  const normalized = (await Promise.all(ai.output.actions.slice(0, 3).map((a) => normalizeAction(conv.workspaceId, a, allowed)))).filter((a) => a !== null);
  const created = await prisma.$transaction(async (tx) => {
    const done = await tx.copilotMessage.updateMany({
      where: { id: pending.id, status: "PENDING" },
      data: { status: "DONE", content: ai.output.reply.trim().slice(0, 8000) || "…", aiRunId: ai.runId, isSimulated: ai.isSimulated },
    });
    if (!done.count) return [];
    await tx.copilotConversation.update({ where: { id: conv.id }, data: { updatedAt: new Date() } });
    return Promise.all(
      normalized.map((a) =>
        tx.copilotAction.create({
          data: { organizationId: conv.organizationId, workspaceId: conv.workspaceId, conversationId: conv.id, messageId: pending.id, type: a.type, title: a.title, rationale: a.rationale, params: a.params },
        }),
      ),
    );
  });

  // Autopilot borné : uniquement les types autorisés, dans la limite quotidienne, avec les droits du membre.
  let autoExecuted = 0;
  if (settings.mode === "AUTOPILOT") {
    for (const action of created) {
      if (!settings.autoActions.includes(action.type as CopilotActionType)) continue;
      const used = await prisma.copilotAction.count({ where: { workspaceId: conv.workspaceId, auto: true, status: "EXECUTED", decidedAt: { gte: new Date(Date.now() - DAY) } } });
      if (used >= settings.dailyAutoLimit) break;
      await executeAction(action.id, conv.workspaceId, { actorId: p.actorId, auto: true, correlationId: job.correlationId }).then(
        () => autoExecuted++,
        () => undefined,
      );
    }
  }
  return { aiRunId: ai.runId, actions: created.length, autoExecuted };
}
