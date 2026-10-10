import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { canAssignRole, PLANS, ROLES } from "@forlife/shared";
import { prisma } from "../../lib/prisma.js";
import { slugify } from "../../lib/crypto.js";
import { badRequest, conflict, forbidden, notFound } from "../../lib/errors.js";
import { parse } from "../../lib/validation.js";
import { audit } from "../../lib/audit.js";
import { auditCtx, authenticate, requireOrg } from "../../plugins/auth.js";

const orgParams = z.object({ orgId: z.string() });
const memberParams = z.object({ orgId: z.string(), membershipId: z.string() });

const addMemberSchema = z.object({
  email: z.email().transform((e) => e.toLowerCase()),
  role: z.enum(ROLES),
  allWorkspaces: z.boolean().default(true),
  workspaceIds: z.array(z.string()).default([]),
});
const updateMemberSchema = addMemberSchema.omit({ email: true }).partial();
const workspaceSchema = z.object({ name: z.string().trim().min(2).max(80), sector: z.string().trim().min(2).max(80).default("Non précisé") });

export async function orgRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);

  // ───── Membres ─────
  app.get("/api/orgs/:orgId/members", async (req) => {
    const { orgId } = parse(orgParams, req.params);
    await requireOrg(req, orgId, "members:read");
    const members = await prisma.membership.findMany({
      where: { organizationId: orgId },
      include: { user: { select: { id: true, email: true, name: true } }, workspaces: { select: { workspaceId: true } } },
      orderBy: { createdAt: "asc" },
    });
    return members.map((m) => ({ id: m.id, role: m.role, allWorkspaces: m.allWorkspaces, workspaceIds: m.workspaces.map((w) => w.workspaceId), user: m.user }));
  });

  app.post("/api/orgs/:orgId/members", async (req, reply) => {
    const { orgId } = parse(orgParams, req.params);
    const ctx = await requireOrg(req, orgId, "members:manage");
    const body = parse(addMemberSchema, req.body);
    if (!canAssignRole(ctx.role, body.role)) throw forbidden("Vous ne pouvez pas attribuer ce rôle");
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user) throw notFound("Utilisateur (la personne doit d'abord créer son compte Forlife)");
    const plan = PLANS[(await prisma.subscription.findUniqueOrThrow({ where: { organizationId: orgId } })).planCode];
    if ((await prisma.membership.count({ where: { organizationId: orgId } })) >= plan.maxMembers) {
      throw badRequest(`Votre plan ${plan.name} est limité à ${plan.maxMembers} membres`);
    }
    await assertWorkspacesInOrg(orgId, body.workspaceIds);
    const existing = await prisma.membership.findUnique({ where: { organizationId_userId: { organizationId: orgId, userId: user.id } } });
    if (existing) throw conflict("Cette personne est déjà membre");
    const membership = await prisma.$transaction(async (tx) => {
      const m = await tx.membership.create({
        data: {
          organizationId: orgId,
          userId: user.id,
          role: body.role,
          allWorkspaces: body.allWorkspaces,
          workspaces: { create: body.workspaceIds.map((workspaceId) => ({ workspaceId })) },
        },
      });
      await audit({ ...auditCtx(ctx), action: "member.added", entityType: "membership", entityId: m.id, metadata: { email: body.email, role: body.role } }, tx);
      return m;
    });
    reply.code(201);
    return membership;
  });

  app.patch("/api/orgs/:orgId/members/:membershipId", async (req) => {
    const { orgId, membershipId } = parse(memberParams, req.params);
    const ctx = await requireOrg(req, orgId, "members:manage");
    const body = parse(updateMemberSchema, req.body);
    const target = await prisma.membership.findFirst({ where: { id: membershipId, organizationId: orgId } });
    if (!target) throw notFound("Membre");
    if (!canAssignRole(ctx.role, target.role)) throw forbidden("Vous ne pouvez pas modifier ce membre");
    if (body.role && !canAssignRole(ctx.role, body.role)) throw forbidden("Vous ne pouvez pas attribuer ce rôle");
    if (target.role === "OWNER" && body.role && body.role !== "OWNER") await assertNotLastOwner(orgId);
    if (body.workspaceIds) await assertWorkspacesInOrg(orgId, body.workspaceIds);
    return prisma.$transaction(async (tx) => {
      if (body.workspaceIds) {
        await tx.membershipWorkspace.deleteMany({ where: { membershipId } });
        await tx.membershipWorkspace.createMany({ data: body.workspaceIds.map((workspaceId) => ({ membershipId, workspaceId })) });
      }
      const m = await tx.membership.update({
        where: { id: membershipId },
        data: { role: body.role, allWorkspaces: body.allWorkspaces },
      });
      await audit({ ...auditCtx(ctx), action: "member.updated", entityType: "membership", entityId: m.id, metadata: { from: target.role, to: m.role } }, tx);
      return m;
    });
  });

  app.delete("/api/orgs/:orgId/members/:membershipId", async (req) => {
    const { orgId, membershipId } = parse(memberParams, req.params);
    const ctx = await requireOrg(req, orgId, "members:manage");
    const target = await prisma.membership.findFirst({ where: { id: membershipId, organizationId: orgId } });
    if (!target) throw notFound("Membre");
    if (!canAssignRole(ctx.role, target.role)) throw forbidden("Vous ne pouvez pas retirer ce membre");
    if (target.role === "OWNER") await assertNotLastOwner(orgId);
    await prisma.$transaction(async (tx) => {
      await tx.membership.delete({ where: { id: membershipId } });
      await audit({ ...auditCtx(ctx), action: "member.removed", entityType: "membership", entityId: membershipId, metadata: { userId: target.userId } }, tx);
    });
    return { ok: true };
  });

  // ───── Workspaces ─────
  app.post("/api/orgs/:orgId/workspaces", async (req, reply) => {
    const { orgId } = parse(orgParams, req.params);
    const ctx = await requireOrg(req, orgId, "workspace:create");
    const body = parse(workspaceSchema, req.body);
    const plan = PLANS[(await prisma.subscription.findUniqueOrThrow({ where: { organizationId: orgId } })).planCode];
    if ((await prisma.workspace.count({ where: { organizationId: orgId, status: "ACTIVE" } })) >= plan.maxWorkspaces) {
      throw badRequest(`Votre plan ${plan.name} est limité à ${plan.maxWorkspaces} workspace(s)`);
    }
    let slug = slugify(body.name);
    if (await prisma.workspace.findUnique({ where: { organizationId_slug: { organizationId: orgId, slug } } })) {
      slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
    }
    const ws = await prisma.$transaction(async (tx) => {
      const ws = await tx.workspace.create({ data: { organizationId: orgId, name: body.name, slug } });
      await tx.brand.create({ data: { workspaceId: ws.id, name: body.name } });
      await tx.businessProfile.create({ data: { workspaceId: ws.id, version: 1, sector: body.sector, createdById: ctx.userId } });
      await audit({ ...auditCtx(ctx), workspaceId: ws.id, action: "workspace.created", entityType: "workspace", entityId: ws.id }, tx);
      return ws;
    });
    reply.code(201);
    return ws;
  });

  // ───── Facturation & usage ─────
  app.get("/api/orgs/:orgId/billing", async (req) => {
    const { orgId } = parse(orgParams, req.params);
    await requireOrg(req, orgId, "billing:read");
    const [subscription, wallet, transactions, usage] = await Promise.all([
      prisma.subscription.findUniqueOrThrow({ where: { organizationId: orgId } }),
      prisma.creditWallet.findUniqueOrThrow({ where: { organizationId: orgId } }),
      prisma.creditTransaction.findMany({ where: { organizationId: orgId }, orderBy: { createdAt: "desc" }, take: 50 }),
      prisma.aIUsageEvent.groupBy({
        by: ["kind"],
        where: { organizationId: orgId, createdAt: { gte: new Date(Date.now() - 30 * 864e5) } },
        _sum: { credits: true, units: true },
        _count: true,
      }),
    ]);
    const plan = PLANS[subscription.planCode];
    return {
      plan,
      subscription,
      balance: wallet.balance,
      lowBalance: wallet.balance < plan.monthlyCredits * 0.2,
      transactions,
      usageLast30Days: usage.map((u) => ({ kind: u.kind, credits: u._sum.credits ?? 0, units: u._sum.units ?? 0, runs: u._count })),
    };
  });

  // ───── Gouvernance ─────
  app.get("/api/orgs/:orgId/audit", async (req) => {
    const { orgId } = parse(orgParams, req.params);
    await requireOrg(req, orgId, "audit:read");
    const q = parse(z.object({ cursor: z.string().optional(), limit: z.coerce.number().int().min(1).max(100).default(50) }), req.query);
    const rows = await prisma.auditLog.findMany({
      where: { organizationId: orgId },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: q.limit,
      ...(q.cursor ? { cursor: { id: q.cursor }, skip: 1 } : {}),
    });
    const actorIds = [...new Set(rows.map((r) => r.actorId).filter((x): x is string => !!x))];
    const actors = await prisma.user.findMany({ where: { id: { in: actorIds } }, select: { id: true, name: true } });
    const names = new Map(actors.map((a) => [a.id, a.name]));
    return { items: rows.map((r) => ({ ...r, actorName: r.actorId ? names.get(r.actorId) ?? null : null })), nextCursor: rows.length === q.limit ? rows.at(-1)?.id : null };
  });

  app.get("/api/orgs/:orgId/ai-runs", async (req) => {
    const { orgId } = parse(orgParams, req.params);
    await requireOrg(req, orgId, "ai:read");
    return prisma.aIRun.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
      take: 50,
      // Les entrées/prompts complets ne sont pas renvoyés au client (§21).
      select: { id: true, workspaceId: true, taskType: true, promptKey: true, promptVersion: true, provider: true, model: true, status: true, latencyMs: true, creditsCharged: true, inputTokens: true, outputTokens: true, error: true, safety: true, createdAt: true },
    });
  });
}

async function assertWorkspacesInOrg(orgId: string, ids: string[]) {
  if (!ids.length) return;
  const n = await prisma.workspace.count({ where: { organizationId: orgId, id: { in: ids } } });
  if (n !== new Set(ids).size) throw badRequest("Workspace inconnu dans cette organisation");
}

async function assertNotLastOwner(orgId: string) {
  if ((await prisma.membership.count({ where: { organizationId: orgId, role: "OWNER" } })) <= 1) {
    throw badRequest("L'organisation doit conserver au moins un propriétaire");
  }
}
