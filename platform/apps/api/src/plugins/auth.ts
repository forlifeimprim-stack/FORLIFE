import type { FastifyReply, FastifyRequest } from "fastify";
import { can, type Permission, type Role } from "@forlife/shared";
import { prisma } from "../lib/prisma.js";
import { forbidden, notFound, unauthorized } from "../lib/errors.js";

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

export async function authenticate(req: FastifyRequest, _reply: FastifyReply): Promise<void> {
  try {
    await req.jwtVerify();
  } catch {
    throw unauthorized();
  }
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
  return { userId: uid, organizationId, workspaceId: null, role: membership.role, correlationId: req.id, ip: req.ip };
}

/**
 * Résout le workspace, son organisation, puis vérifie : appartenance, accès au workspace
 * (rôles restreints / agences) et permission demandée.
 */
export async function requireWorkspace(req: FastifyRequest, workspaceId: string, permission: Permission): Promise<TenantContext> {
  const uid = userId(req);
  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId }, select: { id: true, organizationId: true, organization: { select: { status: true } } } });
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
  return {
    userId: uid,
    organizationId: workspace.organizationId,
    workspaceId,
    role: membership.role,
    correlationId: req.id,
    ip: req.ip,
  };
}

function assertActive(status: string) {
  if (status === "SUSPENDED") throw forbidden("Cette organisation est suspendue. Contactez le support Forlife Com.");
}

/** Réservé aux administrateurs de la plateforme (back-office global). */
export async function requirePlatformAdmin(req: FastifyRequest): Promise<{ userId: string; correlationId: string; ip: string }> {
  const uid = userId(req);
  const user = await prisma.user.findUnique({ where: { id: uid }, select: { isPlatformAdmin: true } });
  if (!user?.isPlatformAdmin) throw notFound("Ressource");
  return { userId: uid, correlationId: req.id, ip: req.ip };
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
