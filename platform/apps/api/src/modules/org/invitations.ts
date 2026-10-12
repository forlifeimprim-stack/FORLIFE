import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { canAssignRole, PLANS, ROLE_LABELS, ROLES } from "@forlife/shared";
import { loadConfig } from "../../config.js";
import { prisma } from "../../lib/prisma.js";
import { hashPassword, randomToken, sha256 } from "../../lib/crypto.js";
import { badRequest, conflict, forbidden, notFound, unauthorized } from "../../lib/errors.js";
import { parse } from "../../lib/validation.js";
import { audit } from "../../lib/audit.js";
import { auditCtx, authenticate, requireOrg } from "../../plugins/auth.js";
import { layout, sendEmail } from "../mail/mailer.js";
import { issueSession } from "../identity/sessions.js";

const INVITE_TTL_MS = 7 * 864e5;
const orgParams = z.object({ orgId: z.string() });
const tokenParams = z.object({ token: z.string().min(20).max(200) });

async function findValid(token: string) {
  const inv = await prisma.invitation.findUnique({ where: { tokenHash: sha256(token) }, include: { organization: { select: { name: true, status: true } } } });
  if (!inv || inv.revokedAt || inv.acceptedAt) throw notFound("Invitation");
  if (inv.expiresAt < new Date()) throw badRequest("Cette invitation a expiré. Demandez-en une nouvelle.");
  return inv;
}

/** Utilisateur authentifié s'il présente un jeton valide (route accessible aussi sans compte). */
async function optionalUser(req: FastifyRequest): Promise<string | null> {
  if (!req.headers.authorization) return null;
  try {
    await req.jwtVerify();
    return req.user.sub;
  } catch {
    return null;
  }
}

export async function invitationRoutes(app: FastifyInstance) {
  app.post("/api/orgs/:orgId/invitations", { preHandler: authenticate }, async (req, reply) => {
    const { orgId } = parse(orgParams, req.params);
    const ctx = await requireOrg(req, orgId, "members:manage");
    const body = parse(
      z.object({
        email: z.email().transform((e) => e.toLowerCase()),
        role: z.enum(ROLES),
        allWorkspaces: z.boolean().default(true),
        workspaceIds: z.array(z.string()).default([]),
      }),
      req.body,
    );
    if (!canAssignRole(ctx.role, body.role)) throw forbidden("Vous ne pouvez pas attribuer ce rôle");
    if (body.workspaceIds.length) {
      const n = await prisma.workspace.count({ where: { organizationId: orgId, id: { in: body.workspaceIds } } });
      if (n !== new Set(body.workspaceIds).size) throw badRequest("Workspace inconnu dans cette organisation");
    }
    const existingMember = await prisma.membership.findFirst({ where: { organizationId: orgId, user: { email: body.email } } });
    if (existingMember) throw conflict("Cette personne est déjà membre");
    const plan = PLANS[(await prisma.subscription.findUniqueOrThrow({ where: { organizationId: orgId } })).planCode];
    const [members, pending] = await Promise.all([
      prisma.membership.count({ where: { organizationId: orgId } }),
      prisma.invitation.count({ where: { organizationId: orgId, acceptedAt: null, revokedAt: null, expiresAt: { gt: new Date() } } }),
    ]);
    if (members + pending >= plan.maxMembers) throw badRequest(`Votre plan ${plan.name} est limité à ${plan.maxMembers} membres`);

    // Une nouvelle invitation remplace les précédentes pour le même email.
    await prisma.invitation.updateMany({ where: { organizationId: orgId, email: body.email, acceptedAt: null, revokedAt: null }, data: { revokedAt: new Date() } });
    const token = randomToken(32);
    const inv = await prisma.invitation.create({
      data: { organizationId: orgId, email: body.email, role: body.role, allWorkspaces: body.allWorkspaces, workspaceIds: body.workspaceIds, tokenHash: sha256(token), invitedById: ctx.userId, expiresAt: new Date(Date.now() + INVITE_TTL_MS) },
      include: { organization: { select: { name: true } } },
    });
    const inviter = await prisma.user.findUniqueOrThrow({ where: { id: ctx.userId }, select: { name: true } });
    await sendEmail({
      to: body.email,
      subject: `${inviter.name} vous invite sur Forlife Com`,
      template: "invitation",
      ...layout(`Rejoignez ${inv.organization.name} sur Forlife Com`, [
        `${inviter.name} vous invite à rejoindre l'espace « ${inv.organization.name} » en tant que ${ROLE_LABELS[body.role]}.`,
        "Forlife Com est la plateforme qui transforme la stratégie de votre entreprise en contenus, campagnes et ventes.",
        "Cette invitation est valable 7 jours.",
      ], { label: "Accepter l'invitation", url: `${loadConfig().APP_URL}/invite?token=${token}` }),
    });
    await audit({ ...auditCtx(ctx), action: "invitation.sent", entityType: "invitation", entityId: inv.id, metadata: { email: body.email, role: body.role } });
    reply.code(201);
    return { id: inv.id, email: inv.email, role: inv.role, expiresAt: inv.expiresAt };
  });

  app.get("/api/orgs/:orgId/invitations", { preHandler: authenticate }, async (req) => {
    const { orgId } = parse(orgParams, req.params);
    await requireOrg(req, orgId, "members:read");
    return prisma.invitation.findMany({
      where: { organizationId: orgId, acceptedAt: null, revokedAt: null, expiresAt: { gt: new Date() } },
      select: { id: true, email: true, role: true, expiresAt: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
  });

  app.delete("/api/orgs/:orgId/invitations/:id", { preHandler: authenticate }, async (req) => {
    const { orgId, id } = parse(orgParams.extend({ id: z.string() }), req.params);
    const ctx = await requireOrg(req, orgId, "members:manage");
    const res = await prisma.invitation.updateMany({ where: { id, organizationId: orgId, acceptedAt: null, revokedAt: null }, data: { revokedAt: new Date() } });
    if (!res.count) throw notFound("Invitation");
    await audit({ ...auditCtx(ctx), action: "invitation.revoked", entityType: "invitation", entityId: id });
    return { ok: true };
  });

  // ───── Côté invité (public) ─────
  app.get("/api/invitations/:token", async (req) => {
    const { token } = parse(tokenParams, req.params);
    const inv = await findValid(token);
    const account = await prisma.user.findUnique({ where: { email: inv.email }, select: { id: true } });
    return { organizationName: inv.organization.name, email: inv.email, role: inv.role, roleLabel: ROLE_LABELS[inv.role], accountExists: !!account };
  });

  /**
   * Acceptation : soit l'invité est connecté avec le même email, soit il crée son compte
   * (nom + mot de passe). Un compte existant doit d'abord se connecter.
   */
  app.post("/api/invitations/:token/accept", { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } }, async (req, reply) => {
    const { token } = parse(tokenParams, req.params);
    const inv = await findValid(token);
    if (inv.organization.status === "SUSPENDED") throw forbidden("Cette organisation est suspendue");
    const body = parse(z.object({ name: z.string().trim().min(2).max(80).optional(), password: z.string().min(10, "10 caractères minimum").max(200).optional() }), req.body ?? {});
    const sessionUser = await optionalUser(req);
    let newAccount: { name: string; passwordHash: string } | null = null;
    if (sessionUser) {
      const u = await prisma.user.findUniqueOrThrow({ where: { id: sessionUser } });
      if (u.email !== inv.email) throw forbidden(`Cette invitation est destinée à ${inv.email}`);
    } else {
      if (await prisma.user.findUnique({ where: { email: inv.email } })) throw unauthorized("Un compte existe déjà avec cet email : connectez-vous pour accepter l'invitation");
      if (!body.name || !body.password) throw badRequest("Nom et mot de passe requis pour créer votre compte");
      newAccount = { name: body.name, passwordHash: await hashPassword(body.password) };
    }
    const workspaceIds = (Array.isArray(inv.workspaceIds) ? inv.workspaceIds : []).filter((x): x is string => typeof x === "string");
    // Compte, membership et consommation de l'invitation : tout ou rien.
    const userId = await prisma.$transaction(async (tx) => {
      const userId = sessionUser ?? (await tx.user.create({ data: { email: inv.email, ...newAccount! } })).id;
      const used = await tx.invitation.updateMany({ where: { id: inv.id, acceptedAt: null, revokedAt: null }, data: { acceptedAt: new Date() } });
      if (!used.count) throw notFound("Invitation");
      const exists = await tx.membership.findUnique({ where: { organizationId_userId: { organizationId: inv.organizationId, userId } } });
      if (exists) throw conflict("Vous êtes déjà membre de cette organisation");
      const valid = await tx.workspace.findMany({ where: { organizationId: inv.organizationId, id: { in: workspaceIds } }, select: { id: true } });
      const m = await tx.membership.create({
        data: { organizationId: inv.organizationId, userId, role: inv.role, allWorkspaces: inv.allWorkspaces, workspaces: { create: valid.map((w) => ({ workspaceId: w.id })) } },
      });
      await audit({ organizationId: inv.organizationId, actorId: userId, action: "invitation.accepted", entityType: "membership", entityId: m.id, ip: req.ip, correlationId: req.id, metadata: { invitationId: inv.id } }, tx);
      return userId;
    });
    if (newAccount) return { ...(await issueSession(app, req, reply, userId)), organizationId: inv.organizationId };
    return { ok: true, organizationId: inv.organizationId };
  });
}
