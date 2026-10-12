import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { canAssignRole, ORG_WIDE_ROLES, PLANS, ROLE_LABELS, ROLES, type Role } from "@forlife/shared";
import { loadConfig } from "../../config.js";
import { prisma } from "../../lib/prisma.js";
import { hashPassword, randomToken, sha256 } from "../../lib/crypto.js";
import { badRequest, conflict, forbidden, notFound, unauthorized } from "../../lib/errors.js";
import { parse } from "../../lib/validation.js";
import { audit } from "../../lib/audit.js";
import { clientIp } from "../../lib/request.js";
import { limit } from "../../lib/throttle.js";
import { auditCtx, authenticate, requireOrg } from "../../plugins/auth.js";
import { layout, sendEmail } from "../mail/mailer.js";
import { issueSession } from "../identity/sessions.js";
import { requireCsrfHeader } from "../identity/routes.js";
import { markEmailVerified } from "../identity/verification.js";

const INVITE_TTL_MS = 7 * 864e5;
const orgParams = z.object({ orgId: z.string() });
const tokenBody = z.object({ token: z.string().min(20).max(200) });

/**
 * Périmètre d'accès selon le rôle : une agence (ou tout rôle non « organisation entière ») n'accède
 * qu'aux workspaces qui lui sont explicitement assignés, quoi qu'envoie le client.
 */
export function accessScope(role: Role, allWorkspaces: boolean, workspaceIds: string[]) {
  if (role === "AGENCY") {
    if (!workspaceIds.length) throw badRequest("Assignez au moins un workspace à une agence");
    return { allWorkspaces: false, workspaceIds };
  }
  if (ORG_WIDE_ROLES.has(role)) return { allWorkspaces: true, workspaceIds: [] };
  if (!allWorkspaces && !workspaceIds.length) throw badRequest("Sélectionnez au moins un workspace");
  return { allWorkspaces, workspaceIds: allWorkspaces ? [] : workspaceIds };
}

/** Texte saisi par un utilisateur et repris dans un email : sans lien cliquable (anti-hameçonnage). */
const plain = (s: string) => s.replace(/(https?:\/\/|www\.)\S*/gi, "").replace(/\b[\w-]+\.(com|net|org|ci|fr|io|co|info|xyz|link|site|online)\b\S*/gi, "").trim() || "Forlife Com";

async function findValid(token: string) {
  const inv = await prisma.invitation.findUnique({ where: { tokenHash: sha256(token) }, include: { organization: { select: { name: true, status: true } } } });
  if (!inv || inv.revokedAt || inv.acceptedAt) throw notFound("Invitation");
  if (inv.expiresAt < new Date()) throw badRequest("Cette invitation a expiré. Demandez-en une nouvelle.");
  return inv;
}

/** Utilisateur authentifié s'il présente un jeton valide sur une session active (route accessible aussi sans compte). */
async function optionalUser(req: FastifyRequest): Promise<string | null> {
  if (!req.headers.authorization) return null;
  try {
    await authenticate(req, undefined as never);
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
    Object.assign(body, accessScope(body.role, body.allWorkspaces, body.workspaceIds));
    // Plafond d'emails d'invitation par organisation (révocations comprises) : pas de relais d'emails.
    await limit(`invite-org:${orgId}`, 20, 86400, "Limite de 20 invitations par jour atteinte pour cette organisation.");
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
      subject: "Vous êtes invité(e) sur Forlife Com",
      template: "invitation",
      ...layout(`Rejoignez ${plain(inv.organization.name)} sur Forlife Com`, [
        `${plain(inviter.name)} vous invite à rejoindre l'espace « ${plain(inv.organization.name)} » en tant que ${ROLE_LABELS[body.role]}.`,
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

  // ───── Côté invité (public) : le jeton circule dans le corps, jamais dans l'URL (journaux) ─────
  app.post("/api/invitations/lookup", { config: { rateLimit: { max: 20, timeWindow: "1 minute" } } }, async (req) => {
    const { token } = parse(tokenBody, req.body);
    const inv = await findValid(token);
    const account = await prisma.user.findUnique({ where: { email: inv.email }, select: { id: true } });
    return { organizationName: inv.organization.name, email: inv.email, role: inv.role, roleLabel: ROLE_LABELS[inv.role], accountExists: !!account };
  });

  /**
   * Acceptation : soit l'invité est connecté avec le même email, soit il crée son compte
   * (nom + mot de passe). Un compte existant doit d'abord se connecter.
   */
  app.post("/api/invitations/accept", { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } }, async (req, reply) => {
    requireCsrfHeader(req.headers);
    const body = parse(tokenBody.extend({ name: z.string().trim().min(2).max(80).optional(), password: z.string().min(10, "10 caractères minimum").max(200).optional() }), req.body ?? {});
    const inv = await findValid(body.token);
    if (inv.organization.status === "SUSPENDED") throw forbidden("Cette organisation est suspendue");
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
      // Verrou sur l'abonnement : le plafond de membres est revérifié sans course possible.
      await tx.$queryRaw`SELECT 1 FROM "Subscription" WHERE "organizationId" = ${inv.organizationId} FOR UPDATE`;
      const sub = await tx.subscription.findUniqueOrThrow({ where: { organizationId: inv.organizationId } });
      if ((await tx.membership.count({ where: { organizationId: inv.organizationId } })) >= PLANS[sub.planCode].maxMembers) {
        throw badRequest("Cette organisation a atteint le nombre maximal de membres de son plan");
      }
      const userId = sessionUser ?? (await tx.user.create({ data: { email: inv.email, ...newAccount! } })).id;
      const used = await tx.invitation.updateMany({ where: { id: inv.id, acceptedAt: null, revokedAt: null }, data: { acceptedAt: new Date() } });
      if (!used.count) throw notFound("Invitation");
      const exists = await tx.membership.findUnique({ where: { organizationId_userId: { organizationId: inv.organizationId, userId } } });
      if (exists) throw conflict("Vous êtes déjà membre de cette organisation");
      const valid = await tx.workspace.findMany({ where: { organizationId: inv.organizationId, id: { in: workspaceIds } }, select: { id: true } });
      if (!inv.allWorkspaces && !valid.length) throw badRequest("Les workspaces de cette invitation n'existent plus. Demandez une nouvelle invitation.");
      const m = await tx.membership.create({
        data: { organizationId: inv.organizationId, userId, role: inv.role, allWorkspaces: inv.allWorkspaces, workspaces: { create: valid.map((w) => ({ workspaceId: w.id })) } },
      });
      await audit({ organizationId: inv.organizationId, actorId: userId, action: "invitation.accepted", entityType: "membership", entityId: m.id, ip: clientIp(req), correlationId: req.id, metadata: { invitationId: inv.id } }, tx);
      return userId;
    });
    // L'invitation a été reçue par email : l'adresse est prouvée.
    await markEmailVerified(userId);
    if (newAccount) return { ...(await issueSession(app, req, reply, userId)), organizationId: inv.organizationId };
    return { ok: true, organizationId: inv.organizationId };
  });
}
