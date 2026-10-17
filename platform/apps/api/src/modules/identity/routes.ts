import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { CHANNELS, OBJECTIVE_TYPES, ROLE_PERMISSIONS } from "@forlife/shared";
import { prisma } from "../../lib/prisma.js";
import { loadConfig } from "../../config.js";
import { dummyPasswordHash, hashPassword, needsRehash, slugify, verifyPassword } from "../../lib/crypto.js";
import { AppError, badRequest, conflict, unauthorized } from "../../lib/errors.js";
import { parse } from "../../lib/validation.js";
import { audit } from "../../lib/audit.js";
import { clientIp } from "../../lib/request.js";
import { hit, limit, peek, reset } from "../../lib/throttle.js";
import { authenticate, isEffectiveAdmin } from "../../plugins/auth.js";
import { provisionBilling } from "../billing/ledger.js";
import { issueSession, revokeCurrent, rotateSession } from "./sessions.js";
import { sendVerificationEmail } from "./verification.js";

const signupSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email().transform((e) => e.toLowerCase()),
  password: z.string().min(10, "10 caractères minimum").max(200),
  organizationName: z.string().trim().min(2).max(80),
  workspaceName: z.string().trim().min(2).max(80).optional(),
  sector: z.string().trim().min(2).max(80),
  country: z.string().trim().length(2).default("CI"),
  city: z.string().trim().max(80).optional(),
  offerSummary: z.string().trim().max(500).optional(),
  targetSummary: z.string().trim().max(500).optional(),
  channels: z.array(z.enum(CHANNELS)).default(["FACEBOOK", "INSTAGRAM", "WHATSAPP"]),
  objective: z
    .object({
      type: z.enum(OBJECTIVE_TYPES),
      title: z.string().trim().min(2).max(160),
      metric: z.string().trim().min(1).max(80),
      target: z.number().positive(),
    })
    .optional(),
});

const loginSchema = z.object({ email: z.email().transform((e) => e.toLowerCase()), password: z.string().min(1) });

async function uniqueOrgSlug(name: string): Promise<string> {
  const base = slugify(name);
  for (let i = 0; i < 20; i++) {
    const slug = i === 0 ? base : `${base}-${Math.random().toString(36).slice(2, 6)}`;
    if (!(await prisma.organization.findUnique({ where: { slug } }))) return slug;
  }
  throw conflict("Impossible de générer un identifiant d'organisation unique");
}

/**
 * Exige un en-tête personnalisé sur les routes qui posent ou utilisent le cookie de session
 * (protection CSRF, y compris « login CSRF ») : un formulaire d'un autre site ne peut pas l'ajouter.
 */
export function requireCsrfHeader(headers: Record<string, unknown>) {
  if (headers["x-forlife-csrf"] !== "1") throw badRequest("En-tête anti-CSRF manquant");
}

// Connexion : 10 échecs par compte et par quart d'heure, quelle que soit l'adresse IP déclarée.
const LOGIN_MAX_FAILURES = 10;
const LOGIN_WINDOW_S = 15 * 60;

export async function identityRoutes(app: FastifyInstance) {
  const authRateLimit = { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } };

  /** Critère d'acceptation : un nouvel utilisateur crée son organisation et son premier workspace sans intervention humaine. */
  app.post("/api/auth/signup", authRateLimit, async (req, reply) => {
    requireCsrfHeader(req.headers);
    const body = parse(signupSchema, req.body);
    await limit(`signup-ip:${clientIp(req)}`, 20, 3600, "Trop de comptes créés depuis cette connexion. Réessayez plus tard.");
    if (await prisma.user.findUnique({ where: { email: body.email } })) throw conflict("Un compte existe déjà avec cet email");
    const passwordHash = await hashPassword(body.password);
    const slug = await uniqueOrgSlug(body.organizationName);
    const wsName = body.workspaceName ?? body.organizationName;

    const { user, org, workspace } = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({ data: { email: body.email, name: body.name, passwordHash } });
      const org = await tx.organization.create({ data: { name: body.organizationName, slug, country: body.country } });
      await tx.membership.create({ data: { organizationId: org.id, userId: user.id, role: "OWNER" } });
      const workspace = await tx.workspace.create({ data: { organizationId: org.id, name: wsName, slug: slugify(wsName) } });
      await tx.brand.create({ data: { workspaceId: workspace.id, name: wsName } });
      await tx.businessProfile.create({
        data: {
          workspaceId: workspace.id,
          version: 1,
          sector: body.sector,
          country: body.country,
          city: body.city ?? null,
          offerSummary: body.offerSummary ?? null,
          targetSummary: body.targetSummary ?? null,
          channels: body.channels,
          createdById: user.id,
        },
      });
      if (body.objective) {
        const start = new Date();
        const end = new Date(start);
        end.setMonth(end.getMonth() + 3);
        await tx.objective.create({ data: { workspaceId: workspace.id, ...body.objective, periodStart: start, periodEnd: end } });
      }
      await provisionBilling(tx, org.id);
      await audit({ organizationId: org.id, workspaceId: workspace.id, actorId: user.id, action: "org.created", entityType: "organization", entityId: org.id, ip: clientIp(req), correlationId: req.id }, tx);
      return { user, org, workspace };
    });
    // Les crédits offerts du plan Free sont versés à la confirmation de l'email.
    await sendVerificationEmail(user);
    const tokens = await issueSession(app, req, reply, user.id);
    reply.code(201);
    return { ...tokens, organizationId: org.id, workspaceId: workspace.id };
  });

  app.post("/api/auth/login", authRateLimit, async (req, reply) => {
    requireCsrfHeader(req.headers);
    const body = parse(loginSchema, req.body);
    const key = `login:${body.email}`;
    if ((await peek(key)) >= LOGIN_MAX_FAILURES) throw new AppError(429, "RATE_LIMITED", "Trop de tentatives sur ce compte. Réessayez dans 15 minutes ou réinitialisez votre mot de passe.");
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    // Vérification systématique pour un temps de réponse constant (pas d'énumération de comptes).
    const ok = await verifyPassword(body.password, user?.passwordHash ?? (await dummyPasswordHash()));
    if (!user || !ok) {
      await hit(key, LOGIN_WINDOW_S);
      throw unauthorized("Email ou mot de passe incorrect");
    }
    await reset(key);
    if (needsRehash(user.passwordHash)) await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(body.password) } });
    return issueSession(app, req, reply, user.id);
  });

  app.post("/api/auth/refresh", authRateLimit, async (req, reply) => {
    requireCsrfHeader(req.headers);
    return rotateSession(app, req, reply);
  });

  app.post("/api/auth/logout", async (req, reply) => {
    requireCsrfHeader(req.headers);
    await revokeCurrent(req, reply);
    return { ok: true };
  });

  app.get("/api/me", { preHandler: authenticate }, async (req) => {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: req.user.sub },
      include: {
        memberships: {
          include: {
            organization: { include: { subscription: true, wallet: true } },
            workspaces: { select: { workspaceId: true } },
          },
        },
      },
    });
    const organizations = await Promise.all(
      user.memberships.map(async (m) => {
        const workspaces = await prisma.workspace.findMany({
          where: {
            organizationId: m.organizationId,
            status: { in: ["ACTIVE", "LOCKED"] },
            ...(m.allWorkspaces ? {} : { id: { in: m.workspaces.map((w) => w.workspaceId) } }),
          },
          orderBy: { createdAt: "asc" },
          select: { id: true, name: true, slug: true, timezone: true, status: true },
        });
        return {
          id: m.organization.id,
          name: m.organization.name,
          currency: m.organization.currency,
          timezone: m.organization.timezone,
          role: m.role,
          permissions: [...ROLE_PERMISSIONS[m.role]],
          plan: m.organization.subscription?.planCode ?? "FREE",
          status: m.organization.status,
          deletionRequestedAt: m.organization.deletionRequestedAt,
          credits: m.organization.wallet?.balance ?? 0,
          workspaces,
        };
      }),
    );
    const listed = loadConfig().PLATFORM_ADMIN_EMAILS.includes(user.email.toLowerCase());
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        locale: user.locale,
        emailVerified: !!user.emailVerifiedAt,
        isPlatformAdmin: isEffectiveAdmin(user),
        // Email autorisé mais back-office pas encore activé avec le code d'activation.
        canClaimAdmin: listed && !user.isPlatformAdmin,
      },
      organizations,
    };
  });
}
