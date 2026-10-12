import type { FastifyReply, FastifyRequest } from "fastify";
import { can, type Permission, type Role } from "@forlife/shared";
import { loadConfig } from "../config.js";
import { prisma } from "../lib/prisma.js";
import { forbidden, notFound, unauthorized } from "../lib/errors.js";
import { clientIp } from "../lib/request.js";

export interface AccessTokenClaims {
  sub: string;
  sid: string;
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: AccessTokenClaims;
    user: AccessTokenClaims;
  }
}

/** Contexte tenant résolu côté serveur pour chaque requête métier. */
export interface TenantContext {
  userId: string;
  organizationId: string;
  workspaceId: string | null;
  role: Role;
  correlationId: string;
  ip: string;
}

// Cache court des sessions valides : une déconnexion ou une révocation prend effet en quelques secondes.
const SESSION_CACHE_MS = 5_000;
const sessionCache = new Map<string, number>();

/** Invalide immédiatement le cache local (déconnexion, réinitialisation, vol détecté). */
export function forgetSessions(ids: string[]) {
  for (const id of ids) sessionCache.delete(id);
}

export async function authenticate(req: FastifyRequest, _reply: FastifyReply): Promise<void> {
  try {
    await req.jwtVerify();
  } catch {
    throw unauthorized();
  }
  // Le jeton d'accès n'est valable que tant que sa session n'est ni révoquée ni expirée.
  const sid = req.user?.sid;
  if (!sid) throw unauthorized();
  const until = sessionCache.get(sid);
  if (until && until > Date.now()) return;
  const session = await prisma.session.findUnique({ where: { id: sid }, select: { userId: true, revokedAt: true, expiresAt: true } });
  if (!session || session.revokedAt || session.expiresAt < new Date() || session.userId !== req.user.sub) {
    sessionCache.delete(sid);
    throw unauthorized("Session expirée");
  }
  if (sessionCache.size > 10_000) sessionCache.clear();
  sessionCache.set(sid, Date.now() + SESSION_CACHE_MS);
}

function userId(req: FastifyRequest): string {
  if (!req.user?.sub) throw unauthorized();
  return req.user.sub;
}

/**
 * Résout l'organisation et vérifie la permission du membre.
 * Un utilisateur non membre reçoit 404 (on ne révèle pas l'existence d'un autre tenant).
 */
export async function requireOrg(req: FastifyRequest, organizationId: string, permission: Permission): Promise<TenantContext> {
  const uid = userId(req);
  const membership = await prisma.membership.findUnique({
    where: { organizationId_userId: { organizationId, userId: uid } },
    include: { organization: { select: { status: true } } },
  });
  if (!membership) throw notFound("Organisation");
  assertActive(membership.organization.status);
  if (!can(membership.role, permission)) throw forbidden();
  return { userId: uid, organizationId, workspaceId: null, role: membership.role, correlationId: req.id, ip: clientIp(req) };
}

/**
 * Résout le workspace, son organisation, puis vérifie : appartenance, accès au workspace
 * (rôles restreints / agences) et permission demandée.
 */
export async function requireWorkspace(req: FastifyRequest, workspaceId: string, permission: Permission): Promise<TenantContext> {
  const uid = userId(req);
  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId }, select: { id: true, organizationId: true, status: true, organization: { select: { status: true } } } });
  if (!workspace) throw notFound("Workspace");
  const membership = await prisma.membership.findUnique({
    where: { organizationId_userId: { organizationId: workspace.organizationId, userId: uid } },
    include: { workspaces: { where: { workspaceId } } },
  });
  if (!membership) throw notFound("Workspace");
  const hasAccess = membership.allWorkspaces || membership.workspaces.length > 0;
  if (!hasAccess) throw notFound("Workspace");
  assertActive(workspace.organization.status);
  if (!can(membership.role, permission)) throw forbidden();
  if (workspace.status === "LOCKED" && !permission.endsWith(":read")) {
    throw forbidden("Cet espace est en lecture seule : votre plan actuel n'inclut pas autant d'espaces. Réabonnez-vous pour le débloquer.");
  }
  if (workspace.status === "ARCHIVED") throw notFound("Workspace");
  return {
    userId: uid,
    organizationId: workspace.organizationId,
    workspaceId,
    role: membership.role,
    correlationId: req.id,
    ip: clientIp(req),
  };
}

function assertActive(status: string) {
  if (status === "SUSPENDED") throw forbidden("Cette organisation est suspendue. Contactez le support Forlife Com.");
}

/** Administrateur effectif : drapeau activé ET email toujours présent dans PLATFORM_ADMIN_EMAILS. */
export function isEffectiveAdmin(user: { isPlatformAdmin: boolean; email: string }): boolean {
  return user.isPlatformAdmin && loadConfig().PLATFORM_ADMIN_EMAILS.includes(user.email.toLowerCase());
}

/** Réservé aux administrateurs de la plateforme (back-office global). */
export async function requirePlatformAdmin(req: FastifyRequest): Promise<{ userId: string; correlationId: string; ip: string }> {
  const uid = userId(req);
  const user = await prisma.user.findUnique({ where: { id: uid }, select: { isPlatformAdmin: true, email: true } });
  if (!user || !isEffectiveAdmin(user)) throw notFound("Ressource");
  return { userId: uid, correlationId: req.id, ip: clientIp(req) };
}

/** Raccourci : contexte d'audit à partir du contexte tenant. */
export function auditCtx(ctx: TenantContext) {
  return {
    organizationId: ctx.organizationId,
    workspaceId: ctx.workspaceId,
    actorId: ctx.userId,
    ip: ctx.ip,
    correlationId: ctx.correlationId,
  };
}
