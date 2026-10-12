import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { loadConfig } from "../../config.js";
import { prisma } from "../../lib/prisma.js";
import { encryptSecret, randomToken, sha256 } from "../../lib/crypto.js";
import { badRequest, notFound } from "../../lib/errors.js";
import { parse } from "../../lib/validation.js";
import { audit } from "../../lib/audit.js";
import { auditCtx, authenticate, requireWorkspace } from "../../plugins/auth.js";
import { adapterByKey, getAdapters } from "./registry.js";
import { settleContent } from "./service.js";
import { SocialError } from "./types.js";

const wsParams = z.object({ workspaceId: z.string() });
const wsIdParams = z.object({ workspaceId: z.string(), id: z.string() });
const redirectUri = (key: string) => `${loadConfig().API_PUBLIC_URL}/api/social/oauth/${key}/callback`;

export async function socialRoutes(app: FastifyInstance) {
  app.get("/api/workspaces/:workspaceId/social/accounts", { preHandler: authenticate }, async (req) => {
    const { workspaceId } = parse(wsParams, req.params);
    await requireWorkspace(req, workspaceId, "social:read");
    const accounts = await prisma.socialAccount.findMany({
      where: { workspaceId, status: { not: "REVOKED" } },
      select: { id: true, provider: true, name: true, avatarUrl: true, status: true, lastError: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });
    return { accounts, connectors: Object.fromEntries(getAdapters().map((a) => [a.key, a.isConfigured()])) };
  });

  /** Démarre la connexion OAuth : état aléatoire à usage unique (anti-CSRF), valable 10 minutes. */
  app.post("/api/workspaces/:workspaceId/social/connect", { preHandler: authenticate }, async (req) => {
    const { workspaceId } = parse(wsParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "social:manage");
    const { connector } = parse(z.object({ connector: z.enum(["meta", "sandbox"]) }), req.body);
    const adapter = adapterByKey(connector);
    if (!adapter?.isConfigured()) throw badRequest("Ce connecteur n'est pas encore activé sur la plateforme");
    const state = randomToken(24);
    await prisma.oAuthState.create({ data: { stateHash: sha256(state), workspaceId, userId: ctx.userId, provider: connector, expiresAt: new Date(Date.now() + 10 * 60_000) } });
    return { url: adapter.authorizeUrl(state, redirectUri(connector)) };
  });

  /** Retour OAuth (navigateur) : jetons chiffrés, comptes créés ou reconnectés, puis redirection vers l'interface. */
  app.get("/api/social/oauth/:connector/callback", async (req, reply) => {
    const { connector } = parse(z.object({ connector: z.string() }), req.params);
    const q = parse(z.object({ code: z.string().max(2000).optional(), state: z.string().max(200).optional(), error: z.string().optional(), error_description: z.string().optional() }), req.query);
    const back = (params: Record<string, string>) => reply.redirect(`${loadConfig().APP_URL}/social?${new URLSearchParams(params)}`);
    if (!q.state) return back({ error: "Réponse OAuth invalide" });
    const stateRow = await prisma.oAuthState.findUnique({ where: { stateHash: sha256(q.state) } });
    if (!stateRow || stateRow.usedAt || stateRow.expiresAt < new Date() || stateRow.provider !== connector) return back({ error: "Lien de connexion expiré, recommencez" });
    const used = await prisma.oAuthState.updateMany({ where: { id: stateRow.id, usedAt: null }, data: { usedAt: new Date() } });
    if (!used.count) return back({ error: "Lien de connexion déjà utilisé" });
    if (q.error || !q.code) return back({ error: q.error_description ?? "Connexion annulée" });
    const adapter = adapterByKey(connector);
    if (!adapter) return back({ error: "Connecteur inconnu" });
    try {
      const accounts = await adapter.exchange(q.code, redirectUri(connector));
      const workspace = await prisma.workspace.findUniqueOrThrow({ where: { id: stateRow.workspaceId }, select: { organizationId: true } });
      const key = loadConfig().ENCRYPTION_KEY;
      for (const a of accounts) {
        const acc = await prisma.socialAccount.upsert({
          where: { workspaceId_provider_externalId: { workspaceId: stateRow.workspaceId, provider: a.provider, externalId: a.externalId } },
          update: { name: a.name, avatarUrl: a.avatarUrl ?? null, status: "CONNECTED", lastError: null, scopes: a.scopes },
          create: { workspaceId: stateRow.workspaceId, provider: a.provider, externalId: a.externalId, name: a.name, avatarUrl: a.avatarUrl ?? null, scopes: a.scopes, connectedById: stateRow.userId },
        });
        const cred = { accessTokenEnc: encryptSecret(a.accessToken, key), refreshTokenEnc: a.refreshToken ? encryptSecret(a.refreshToken, key) : null, expiresAt: a.expiresAt ?? null };
        await prisma.socialCredential.upsert({ where: { socialAccountId: acc.id }, update: cred, create: { socialAccountId: acc.id, ...cred } });
        await audit({ organizationId: workspace.organizationId, workspaceId: stateRow.workspaceId, actorId: stateRow.userId, action: "social.connected", entityType: "social_account", entityId: acc.id, ip: req.ip, correlationId: req.id, metadata: { provider: a.provider } });
      }
      return back({ connected: String(accounts.length) });
    } catch (e) {
      return back({ error: e instanceof SocialError ? e.message : "La connexion a échoué" });
    }
  });

  app.delete("/api/workspaces/:workspaceId/social/accounts/:id", { preHandler: authenticate }, async (req) => {
    const { workspaceId, id } = parse(wsIdParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "social:manage");
    const acc = await prisma.socialAccount.findFirst({ where: { id, workspaceId } });
    if (!acc) throw notFound("Compte");
    const contents = await prisma.publication.findMany({ where: { socialAccountId: id, status: "QUEUED" }, select: { contentId: true } });
    await prisma.$transaction(async (tx) => {
      await tx.socialCredential.deleteMany({ where: { socialAccountId: id } });
      await tx.socialAccount.update({ where: { id }, data: { status: "REVOKED" } });
      await tx.publication.updateMany({ where: { socialAccountId: id, status: "QUEUED" }, data: { status: "CANCELLED" } });
      await audit({ ...auditCtx(ctx), action: "social.disconnected", entityType: "social_account", entityId: id, metadata: { provider: acc.provider } }, tx);
    });
    for (const c of new Set(contents.map((x) => x.contentId))) await settleContent(c);
    return { ok: true };
  });

  app.get("/api/workspaces/:workspaceId/social/publications", { preHandler: authenticate }, async (req) => {
    const { workspaceId } = parse(wsParams, req.params);
    await requireWorkspace(req, workspaceId, "social:read");
    const q = parse(z.object({ contentId: z.string().optional() }), req.query);
    return prisma.publication.findMany({
      where: { workspaceId, ...(q.contentId ? { contentId: q.contentId } : {}) },
      include: {
        content: { select: { id: true, title: true } },
        socialAccount: { select: { id: true, name: true, provider: true } },
        metrics: { orderBy: { capturedAt: "desc" }, take: 1 },
        attemptsLog: { orderBy: { createdAt: "desc" }, take: 3 },
      },
      orderBy: { scheduledAt: "desc" },
      take: 200,
    });
  });

  /** Relance manuelle d'une publication en échec (après reconnexion du compte par exemple). */
  app.post("/api/workspaces/:workspaceId/social/publications/:id/retry", { preHandler: authenticate }, async (req) => {
    const { workspaceId, id } = parse(wsIdParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "social:update");
    const pub = await prisma.publication.findFirst({ where: { id, workspaceId } });
    if (!pub) throw notFound("Publication");
    if (pub.status !== "FAILED") throw badRequest("Seule une publication en échec peut être relancée");
    await prisma.$transaction(async (tx) => {
      await tx.publication.update({ where: { id }, data: { status: "QUEUED", scheduledAt: new Date(), lastError: null } });
      await tx.contentItem.updateMany({ where: { id: pub.contentId, status: "FAILED" }, data: { status: "SCHEDULED" } });
      await audit({ ...auditCtx(ctx), action: "publication.retried", entityType: "publication", entityId: id }, tx);
    });
    return { ok: true };
  });

  /** Performance agrégée (30 jours) : réel et simulé ne sont jamais additionnés. */
  app.get("/api/workspaces/:workspaceId/social/overview", { preHandler: authenticate }, async (req) => {
    const { workspaceId } = parse(wsParams, req.params);
    await requireWorkspace(req, workspaceId, "social:read");
    const pubs = await prisma.publication.findMany({
      where: { workspaceId, status: "PUBLISHED", publishedAt: { gte: new Date(Date.now() - 30 * 864e5) } },
      include: { socialAccount: { select: { provider: true } }, metrics: { orderBy: { capturedAt: "desc" }, take: 1 } },
    });
    const sum = (simulated: boolean) => {
      const list = pubs.map((p) => p.metrics[0]).filter((m) => m && m.isSimulated === simulated);
      return { publications: list.length, impressions: list.reduce((n, m) => n + m!.impressions, 0), reach: list.reduce((n, m) => n + m!.reach, 0), engagement: list.reduce((n, m) => n + m!.engagement, 0), clicks: list.reduce((n, m) => n + m!.clicks, 0) };
    };
    return { published30d: pubs.length, real: sum(false), simulated: sum(true) };
  });
}
