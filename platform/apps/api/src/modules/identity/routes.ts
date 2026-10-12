import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { CHANNELS, OBJECTIVE_TYPES, ROLE_PERMISSIONS } from "@forlife/shared";
import { prisma } from "../../lib/prisma.js";
import { loadConfig } from "../../config.js";
import { hashPassword, slugify, verifyPassword } from "../../lib/crypto.js";
import { badRequest, conflict, unauthorized } from "../../lib/errors.js";
import { parse } from "../../lib/validation.js";
import { audit } from "../../lib/audit.js";
import { authenticate } from "../../plugins/auth.js";
import { grantMonthlyAllowance, provisionBilling } from "../billing/ledger.js";
import { issueSession, revokeCurrent, rotateSession } from "./sessions.js";

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

/** Exige un en-tête personnalisé sur les routes à cookie (protection CSRF, en plus de SameSite=strict). */
function requireCsrfHeader(headers: Record<string, unknown>) {
  if (headers["x-forlife-csrf"] !== "1") throw badRequest("En-tête anti-CSRF manquant");
}

/** Promeut les emails listés dans PLATFORM_ADMIN_EMAILS (seul moyen de devenir administrateur de la plateforme). */
export async function syncPlatformAdmin(userId: string, email: string) {
  if (loadConfig().PLATFORM_ADMIN_EMAILS.includes(email.toLowerCase())) {
    await prisma.user.updateMany({ where: { id: userId, isPlatformAdmin: false }, data: { isPlatformAdmin: true } });
  }
}

export async function identityRoutes(app: FastifyInstance) {
  const authRateLimit = { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } };

  /** Critère d'acceptation : un nouvel utilisateur crée son organisation et son premier workspace sans intervention humaine. */
  app.post("/api/auth/signup", authRateLimit, async (req, reply) => {
    const body = parse(signupSchema, req.body);
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
      await audit({ organizationId: org.id, workspaceId: workspace.id, actorId: user.id, action: "org.created", entityType: "organization", entityId: org.id, ip: req.ip, correlationId: req.id }, tx);
      return { user, org, workspace };
    });
    await grantMonthlyAllowance(org.id);
    await syncPlatformAdmin(user.id, user.email);
    const tokens = await issueSession(app, req, reply, user.id);
    reply.code(201);
    return { ...tokens, organizationId: org.id, workspaceId: workspace.id };
  });

  app.post("/api/auth/login", authRateLimit, async (req, reply) => {
    const body = parse(loginSchema, req.body);
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    // Vérification systématique pour un temps de réponse constant (pas d'énumération de comptes).
    const ok = await verifyPassword(body.password, user?.passwordHash ?? "scrypt$16384$8$1$AAAA$AAAA");
    if (!user || !ok) throw unauthorized("Email ou mot de passe incorrect");
    await syncPlatformAdmin(user.id, user.email);
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
            status: "ACTIVE",
            ...(m.allWorkspaces ? {} : { id: { in: m.workspaces.map((w) => w.workspaceId) } }),
          },
          orderBy: { createdAt: "asc" },
          select: { id: true, name: true, slug: true, timezone: true },
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
          credits: m.organization.wallet?.balance ?? 0,
          workspaces,
        };
      }),
    );
    return { user: { id: user.id, email: user.email, name: user.name, locale: user.locale, isPlatformAdmin: user.isPlatformAdmin }, organizations };
  });
}
