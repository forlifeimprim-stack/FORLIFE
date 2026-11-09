import { timingSafeEqual } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { PLAN_CODES, PLANS } from "@forlife/shared";
import { loadConfig } from "../../config.js";
import { prisma } from "../../lib/prisma.js";
import { sha256 } from "../../lib/crypto.js";
import { badRequest, forbidden, notFound } from "../../lib/errors.js";
import { limit } from "../../lib/throttle.js";
import { parse } from "../../lib/validation.js";
import { audit } from "../../lib/audit.js";
import { authenticate, requirePlatformAdmin } from "../../plugins/auth.js";
import { addMonths, enforceWorkspaceLimit, ledger } from "../billing/ledger.js";

const idParams = z.object({ id: z.string() });

/**
 * Back-office de la plateforme (administrateurs Forlife Com uniquement).
 * Toute action est journalisée dans l'audit de l'organisation concernée (préfixe « platform. »).
 */
export async function adminRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);

  /**
   * Activation du back-office : l'email doit figurer dans PLATFORM_ADMIN_EMAILS ET l'utilisateur doit fournir
   * le code d'activation (secret « forlife-admin-bootstrap », connu du seul propriétaire de l'infrastructure).
   * S'inscrire avec l'email d'un administrateur ne suffit donc jamais.
   */
  app.post("/api/admin/claim", async (req) => {
    const { code } = parse(z.object({ code: z.string().trim().min(1).max(200) }), req.body);
    const uid = req.user.sub;
    await limit(`admin-claim:${uid}`, 5, 3600, "Trop d'essais. Réessayez dans une heure.");
    const cfg = loadConfig();
    const user = await prisma.user.findUniqueOrThrow({ where: { id: uid } });
    const expected = cfg.ADMIN_BOOTSTRAP_TOKEN;
    const valid = !!expected && timingSafeEqual(Buffer.from(sha256(code)), Buffer.from(sha256(expected)));
    if (!cfg.PLATFORM_ADMIN_EMAILS.includes(user.email.toLowerCase()) || !valid) {
      req.log.warn({ userId: uid }, "platform.admin_claim_refused");
      throw forbidden("Code d'activation invalide");
    }
    await prisma.user.update({ where: { id: uid }, data: { isPlatformAdmin: true } });
    req.log.info({ userId: uid }, "platform.admin_claimed");
    return { ok: true };
  });

  app.get("/api/admin/stats", async (req) => {
    await requirePlatformAdmin(req);
    const since = new Date(Date.now() - 30 * 864e5);
    const [orgs, suspended, users, workspaces, newOrgs, subs, aiRuns, consumed, contents] = await Promise.all([
      prisma.organization.count(),
      prisma.organization.count({ where: { status: "SUSPENDED" } }),
      prisma.user.count(),
      prisma.workspace.count({ where: { status: "ACTIVE" } }),
      prisma.organization.count({ where: { createdAt: { gte: since } } }),
      prisma.subscription.groupBy({ by: ["planCode"], _count: true }),
      prisma.aIRun.count({ where: { createdAt: { gte: since } } }),
      prisma.creditTransaction.aggregate({ where: { kind: "CONSUME", createdAt: { gte: since } }, _sum: { amount: true } }),
      prisma.contentItem.count({ where: { createdAt: { gte: since } } }),
    ]);
    const byPlan = Object.fromEntries(PLAN_CODES.map((p) => [p, subs.find((s) => s.planCode === p)?._count ?? 0]));
    // Revenu mensuel récurrent théorique (prix catalogue × abonnements actifs) — l'encaissement réel arrive avec les paiements.
    const mrrXof = PLAN_CODES.reduce((sum, p) => sum + PLANS[p].monthlyPriceXof * (byPlan[p] ?? 0), 0);
    return { organizations: orgs, suspended, users, activeWorkspaces: workspaces, newOrganizations30d: newOrgs, byPlan, mrrXof, aiRuns30d: aiRuns, creditsConsumed30d: -(consumed._sum.amount ?? 0), contents30d: contents };
  });

  app.get("/api/admin/organizations", async (req) => {
    await requirePlatformAdmin(req);
    const q = parse(z.object({ q: z.string().max(100).optional(), status: z.enum(["ACTIVE", "SUSPENDED"]).optional(), plan: z.enum(PLAN_CODES).optional(), take: z.coerce.number().int().min(1).max(200).default(100) }), req.query);
    const orgs = await prisma.organization.findMany({
      where: {
        ...(q.status ? { status: q.status } : {}),
        ...(q.plan ? { subscription: { planCode: q.plan } } : {}),
        ...(q.q ? { OR: [{ name: { contains: q.q, mode: "insensitive" } }, { slug: { contains: q.q, mode: "insensitive" } }, { memberships: { some: { user: { email: { contains: q.q, mode: "insensitive" } } } } }] } : {}),
      },
      include: {
        subscription: { select: { planCode: true, currentPeriodEnd: true } },
        wallet: { select: { balance: true } },
        _count: { select: { memberships: true, workspaces: true } },
        memberships: { where: { role: "OWNER" }, take: 1, include: { user: { select: { name: true, email: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: q.take,
    });
    return orgs.map((o) => ({
      id: o.id,
      name: o.name,
      status: o.status,
      suspendedReason: o.suspendedReason,
      country: o.country,
      createdAt: o.createdAt,
      plan: o.subscription?.planCode ?? "FREE",
      periodEnd: o.subscription?.currentPeriodEnd ?? null,
      credits: o.wallet?.balance ?? 0,
      members: o._count.memberships,
      workspaces: o._count.workspaces,
      owner: o.memberships[0]?.user ?? null,
    }));
  });

  app.get("/api/admin/organizations/:id", async (req) => {
    await requirePlatformAdmin(req);
    const { id } = parse(idParams, req.params);
    const org = await prisma.organization.findUnique({
      where: { id },
      include: {
        subscription: true,
        wallet: true,
        workspaces: { select: { id: true, name: true, status: true, createdAt: true } },
        memberships: { include: { user: { select: { id: true, name: true, email: true, createdAt: true } } } },
      },
    });
    if (!org) throw notFound("Organisation");
    const [transactions, auditLog] = await Promise.all([
      prisma.creditTransaction.findMany({ where: { organizationId: id }, orderBy: { createdAt: "desc" }, take: 30 }),
      prisma.auditLog.findMany({ where: { organizationId: id }, orderBy: { createdAt: "desc" }, take: 30 }),
    ]);
    return { ...org, transactions, auditLog };
  });

  app.patch("/api/admin/organizations/:id/plan", async (req) => {
    const admin = await requirePlatformAdmin(req);
    const { id } = parse(idParams, req.params);
    // `months` : durée offerte (ex. « 1 mois Starter offert ») ; à l'échéance, retour automatique au plan Free.
    const { planCode, months } = parse(z.object({ planCode: z.enum(PLAN_CODES), months: z.number().int().min(1).max(24).default(1) }), req.body);
    const sub = await prisma.subscription.findUnique({ where: { organizationId: id } });
    if (!sub) throw notFound("Organisation");
    if (sub.planCode === planCode && planCode === "FREE") return sub;
    const base = sub.planCode === planCode && sub.paidUntil && sub.paidUntil > new Date() ? sub.paidUntil : new Date();
    const paidUntil = planCode === "FREE" ? null : addMonths(base, months);
    const updated = await prisma.$transaction(async (tx) => {
      const u = await tx.subscription.update({ where: { organizationId: id }, data: { planCode, paidUntil } });
      await audit({ organizationId: id, actorId: admin.userId, action: "platform.plan.changed", entityType: "subscription", entityId: sub.id, ip: admin.ip, correlationId: admin.correlationId, metadata: { from: sub.planCode, to: planCode, months, paidUntil } }, tx);
      return u;
    });
    await enforceWorkspaceLimit(id);
    // Montée en gamme : la différence d'allocation est versée immédiatement (une fois par changement).
    const diff = PLANS[planCode].monthlyCredits - PLANS[sub.planCode].monthlyCredits;
    if (diff > 0) {
      await ledger.grant({ organizationId: id, amount: diff, reason: `Passage au plan ${PLANS[planCode].name}`, idempotencyKey: `plan-change:${sub.id}:${updated.updatedAt.toISOString()}`, refType: "subscription", refId: sub.id });
    }
    return updated;
  });

  app.post("/api/admin/organizations/:id/credits", async (req) => {
    const admin = await requirePlatformAdmin(req);
    const { id } = parse(idParams, req.params);
    const body = parse(z.object({ amount: z.number().int().refine((n) => n !== 0 && Math.abs(n) <= 1_000_000, "Montant invalide"), reason: z.string().trim().min(3).max(200), requestId: z.uuid() }), req.body);
    if (!(await prisma.organization.findUnique({ where: { id } }))) throw notFound("Organisation");
    const op = { organizationId: id, amount: Math.abs(body.amount), reason: `Ajustement Forlife : ${body.reason}`, idempotencyKey: `admin:${id}:${body.requestId}`, refType: "admin", refId: admin.userId };
    const res = body.amount > 0 ? await ledger.grant(op) : await ledger.consume(op);
    if (!res.replayed) {
      await audit({ organizationId: id, actorId: admin.userId, action: "platform.credits.adjusted", entityType: "credit_wallet", ip: admin.ip, correlationId: admin.correlationId, metadata: { amount: body.amount, reason: body.reason } });
    }
    return res;
  });

  app.post("/api/admin/organizations/:id/suspend", async (req) => {
    const admin = await requirePlatformAdmin(req);
    const { id } = parse(idParams, req.params);
    const { reason } = parse(z.object({ reason: z.string().trim().min(3).max(300) }), req.body);
    const res = await prisma.organization.updateMany({ where: { id, status: "ACTIVE" }, data: { status: "SUSPENDED", suspendedReason: reason } });
    if (!res.count) throw badRequest("Organisation introuvable ou déjà suspendue");
    await audit({ organizationId: id, actorId: admin.userId, action: "platform.org.suspended", entityType: "organization", entityId: id, ip: admin.ip, correlationId: admin.correlationId, metadata: { reason } });
    return { ok: true };
  });

  app.post("/api/admin/organizations/:id/reactivate", async (req) => {
    const admin = await requirePlatformAdmin(req);
    const { id } = parse(idParams, req.params);
    const res = await prisma.organization.updateMany({ where: { id, status: "SUSPENDED" }, data: { status: "ACTIVE", suspendedReason: null } });
    if (!res.count) throw badRequest("Organisation introuvable ou déjà active");
    await audit({ organizationId: id, actorId: admin.userId, action: "platform.org.reactivated", entityType: "organization", entityId: id, ip: admin.ip, correlationId: admin.correlationId });
    return { ok: true };
  });

  app.get("/api/admin/users", async (req) => {
    await requirePlatformAdmin(req);
    const q = parse(z.object({ q: z.string().max(100).optional() }), req.query);
    return prisma.user.findMany({
      where: q.q ? { OR: [{ email: { contains: q.q, mode: "insensitive" } }, { name: { contains: q.q, mode: "insensitive" } }] } : {},
      select: { id: true, name: true, email: true, isPlatformAdmin: true, createdAt: true, memberships: { select: { role: true, organization: { select: { id: true, name: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  });
}
