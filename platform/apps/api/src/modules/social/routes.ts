import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { SANDBOX_NETWORKS, TASK_CREDIT_COST, sandboxNetwork } from "@forlife/shared";
import { loadConfig } from "../../config.js";
import { prisma } from "../../lib/prisma.js";
import { clientIp } from "../../lib/request.js";
import { decryptSecret, encryptSecret, randomToken, sha256 } from "../../lib/crypto.js";
import { badRequest, forbidden, notFound } from "../../lib/errors.js";
import { parse } from "../../lib/validation.js";
import { audit } from "../../lib/audit.js";
import { auditCtx, authenticate, requireWorkspace } from "../../plugins/auth.js";
import { adapterByKey, getAdapters } from "./registry.js";
import { revokeRemote, settleContent } from "./service.js";
import { enqueue } from "../jobs/queue.js";
import { parsePageLink } from "./links.js";
import { NETWORK_LABELS } from "./audit.js";
import { assertApprovedVersion } from "../content/service.js";
import { SocialError, type ConnectedAccount } from "./types.js";

const CONNECTORS = ["meta", "linkedin", "tiktok", "youtube", "sandbox"] as const;
const wsParams = z.object({ workspaceId: z.string() });
const wsIdParams = z.object({ workspaceId: z.string(), id: z.string() });
/**
 * Le retour OAuth arrive sur l'interface (pas sur l'API) : c'est le navigateur connecté qui termine la liaison,
 * avec sa propre session. Un lien d'autorisation transmis à un tiers ne peut donc rien rattacher.
 */
const redirectUri = (key: string, req: FastifyRequest) => `${appBase(req)}/social/callback/${key}`;

/**
 * Adresse de l'interface depuis laquelle l'utilisateur travaille (domaine officiel ou ancienne adresse web.app) :
 * le retour OAuth revient au même endroit, avec la même session. Toute autre origine retombe sur APP_URL.
 */
export function appBase(req: FastifyRequest): string {
  const cfg = loadConfig();
  const origin = typeof req.headers.origin === "string" ? req.headers.origin.replace(/\/$/, "") : null;
  const allowed = cfg.WEB_ORIGIN.split(",").map((o) => o.trim().replace(/\/$/, ""));
  return origin && allowed.includes(origin) ? origin : cfg.APP_URL;
}

export async function socialRoutes(app: FastifyInstance) {
  app.get("/api/workspaces/:workspaceId/social/accounts", { preHandler: authenticate }, async (req) => {
    const { workspaceId } = parse(wsParams, req.params);
    await requireWorkspace(req, workspaceId, "social:read");
    const accounts = await prisma.socialAccount.findMany({
      where: { workspaceId, status: { not: "REVOKED" } },
      select: { id: true, provider: true, externalId: true, name: true, avatarUrl: true, status: true, lastError: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });
    return {
      accounts: accounts.map(({ externalId, ...a }) => ({ ...a, network: a.provider === "SANDBOX" ? sandboxNetwork(externalId) : null })),
      connectors: Object.fromEntries(getAdapters().map((a) => [a.key, a.isConfigured()])) };
  });

  /** Démarre la connexion OAuth : état aléatoire à usage unique (anti-CSRF), valable 10 minutes. */
  app.post("/api/workspaces/:workspaceId/social/connect", { preHandler: authenticate }, async (req) => {
    const { workspaceId } = parse(wsParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "social:manage");
    const { connector, network } = parse(z.object({ connector: z.enum(CONNECTORS), network: z.enum(SANDBOX_NETWORKS).optional() }), req.body);
    const adapter = adapterByKey(connector);
    if (!adapter?.isConfigured()) throw badRequest("Ce connecteur n'est pas encore activé sur la plateforme");
    const state = randomToken(24);
    await prisma.oAuthState.create({ data: { stateHash: sha256(state), workspaceId, userId: ctx.userId, provider: connector, expiresAt: new Date(Date.now() + 10 * 60_000) } });
    return { url: adapter.authorizeUrl(state, redirectUri(connector, req), { network }) };
  });

  /**
   * Fin de connexion OAuth, appelée par l'interface avec la session de l'utilisateur.
   * L'état doit avoir été créé par CE même utilisateur, qui doit toujours pouvoir gérer le workspace.
   * Les comptes autorisés sont mis en attente (chiffrés) : l'utilisateur choisit ensuite ceux à connecter.
   */
  app.post("/api/social/oauth/complete", { preHandler: authenticate }, async (req) => {
    const body = parse(z.object({ connector: z.enum(CONNECTORS), state: z.string().min(10).max(200), code: z.string().max(2000).optional(), error: z.string().max(200).optional() }), req.body);
    const stateRow = await prisma.oAuthState.findUnique({ where: { stateHash: sha256(body.state) } });
    if (!stateRow || stateRow.expiresAt < new Date() || stateRow.provider !== body.connector) throw badRequest("Lien de connexion expiré, recommencez");
    if (stateRow.userId !== req.user.sub) throw forbidden("Cette connexion a été lancée depuis un autre compte. Recommencez depuis votre Social Hub.");
    await requireWorkspace(req, stateRow.workspaceId, "social:manage");
    const used = await prisma.oAuthState.updateMany({ where: { id: stateRow.id, usedAt: null }, data: { usedAt: new Date() } });
    if (!used.count) throw badRequest("Lien de connexion déjà utilisé");
    if (body.error || !body.code) throw badRequest("Connexion annulée");
    const adapter = adapterByKey(body.connector);
    if (!adapter?.isConfigured()) throw badRequest("Connecteur indisponible");
    let accounts: ConnectedAccount[];
    try {
      accounts = await adapter.exchange(body.code, redirectUri(body.connector, req));
    } catch (e) {
      throw badRequest(e instanceof SocialError ? e.message : "La connexion a échoué");
    }
    if (!accounts.length) throw badRequest("Aucune page ou compte professionnel trouvé pour ce profil");
    await prisma.oAuthState.update({ where: { id: stateRow.id }, data: { pendingEnc: encryptSecret(JSON.stringify(accounts), loadConfig().ENCRYPTION_KEY), expiresAt: new Date(Date.now() + 15 * 60_000) } });
    return { workspaceId: stateRow.workspaceId, accounts: accounts.map((a) => ({ provider: a.provider, externalId: a.externalId, name: a.name, avatarUrl: a.avatarUrl ?? null })) };
  });

  /** Connexion des seuls comptes choisis par l'utilisateur, dans le workspace qui a lancé la connexion. */
  app.post("/api/social/oauth/select", { preHandler: authenticate }, async (req) => {
    const body = parse(z.object({ state: z.string().min(10).max(200), externalIds: z.array(z.string().max(200)).min(1).max(50) }), req.body);
    const stateRow = await prisma.oAuthState.findUnique({ where: { stateHash: sha256(body.state) } });
    if (!stateRow?.pendingEnc || stateRow.expiresAt < new Date() || stateRow.userId !== req.user.sub) throw badRequest("Sélection expirée, recommencez la connexion");
    const ctx = await requireWorkspace(req, stateRow.workspaceId, "social:manage");
    // Usage unique : la liste en attente est effacée avant toute écriture.
    const taken = await prisma.oAuthState.updateMany({ where: { id: stateRow.id, pendingEnc: { not: null } }, data: { pendingEnc: null } });
    if (!taken.count) throw badRequest("Sélection déjà enregistrée");
    const key = loadConfig().ENCRYPTION_KEY;
    const pending = JSON.parse(decryptSecret(stateRow.pendingEnc, key)) as (ConnectedAccount & { expiresAt?: string | null })[];
    const chosen = pending.filter((a) => body.externalIds.includes(a.externalId));
    for (const a of chosen) {
      const acc = await prisma.socialAccount.upsert({
        where: { workspaceId_provider_externalId: { workspaceId: stateRow.workspaceId, provider: a.provider, externalId: a.externalId } },
        update: { name: a.name, avatarUrl: a.avatarUrl ?? null, status: "CONNECTED", lastError: null, scopes: a.scopes },
        create: { workspaceId: stateRow.workspaceId, provider: a.provider, externalId: a.externalId, name: a.name, avatarUrl: a.avatarUrl ?? null, scopes: a.scopes, connectedById: ctx.userId },
      });
      const cred = { accessTokenEnc: encryptSecret(a.accessToken, key), refreshTokenEnc: a.refreshToken ? encryptSecret(a.refreshToken, key) : null, expiresAt: a.expiresAt ? new Date(a.expiresAt) : null };
      await prisma.socialCredential.upsert({ where: { socialAccountId: acc.id }, update: cred, create: { socialAccountId: acc.id, ...cred } });
      await audit({ ...auditCtx(ctx), action: "social.connected", entityType: "social_account", entityId: acc.id, ip: clientIp(req), metadata: { provider: a.provider } });
    }
    return { connected: chosen.length, workspaceId: stateRow.workspaceId };
  });

  app.delete("/api/workspaces/:workspaceId/social/accounts/:id", { preHandler: authenticate }, async (req) => {
    const { workspaceId, id } = parse(wsIdParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "social:manage");
    const acc = await prisma.socialAccount.findFirst({ where: { id, workspaceId }, include: { credential: true } });
    if (!acc) throw notFound("Compte");
    await revokeRemote(acc);
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
    assertApprovedVersion(await prisma.contentItem.findUniqueOrThrow({ where: { id: pub.contentId }, select: { contentVersion: true, approvedVersion: true } }));
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

  /** Dernière analyse des réseaux + comptes connectés (pour savoir si l'analyse est possible). */
  app.get("/api/workspaces/:workspaceId/social/audit", { preHandler: authenticate }, async (req) => {
    const { workspaceId } = parse(wsParams, req.params);
    await requireWorkspace(req, workspaceId, "social:read");
    const [latest, accounts] = await Promise.all([
      prisma.socialAudit.findFirst({ where: { workspaceId }, orderBy: { createdAt: "desc" }, select: { id: true, links: true, postsCount: true, stats: true, report: true, createdAt: true } }),
      prisma.socialAccount.count({ where: { workspaceId, status: "CONNECTED" } }),
    ]);
    return { latest, connectedAccounts: accounts, creditCost: TASK_CREDIT_COST["social.audit"] };
  });

  /** Lance l'analyse des pages dont l'utilisateur donne le lien (un par réseau) : lecture puis audit IA (asynchrone). */
  app.post("/api/workspaces/:workspaceId/social/audit", { preHandler: authenticate }, async (req, reply) => {
    const { workspaceId } = parse(wsParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "ai:generate");
    await requireWorkspace(req, workspaceId, "social:read");
    const link = z.string().trim().max(300).optional().transform((v) => v || undefined);
    const { links } = parse(z.object({ links: z.object(Object.fromEntries(SANDBOX_NETWORKS.map((n) => [n, link])) as Record<(typeof SANDBOX_NETWORKS)[number], typeof link>) }), req.body);
    const given = Object.entries(links).filter(([, v]) => v) as [(typeof SANDBOX_NETWORKS)[number], string][];
    if (!given.length) throw badRequest("Indiquez le lien d'au moins une de vos pages");
    const invalid = given.filter(([n, v]) => !parsePageLink(n, v)).map(([n]) => NETWORK_LABELS[n]);
    if (invalid.length) throw badRequest(`Lien non reconnu pour : ${invalid.join(", ")}. Copiez l'adresse de la page depuis le navigateur (ex. https://www.facebook.com/mapage).`);
    const job = await enqueue({
      organizationId: ctx.organizationId,
      workspaceId,
      type: "ai.social_audit",
      payload: { workspaceId, actorId: ctx.userId, links: Object.fromEntries(given) },
      correlationId: ctx.correlationId,
      createdById: ctx.userId,
    });
    reply.code(202);
    return { jobId: job.id, estimatedCredits: TASK_CREDIT_COST["social.audit"] };
  });

  /** Textes des publications analysées, réutilisés comme sources du Brand DNA. */
  app.get("/api/workspaces/:workspaceId/social/audit/:id/sources", { preHandler: authenticate }, async (req) => {
    const { workspaceId, id } = parse(wsIdParams, req.params);
    await requireWorkspace(req, workspaceId, "brand:update");
    const a = await prisma.socialAudit.findFirst({ where: { id, workspaceId }, select: { sourcesText: true } });
    if (!a) throw notFound("Analyse");
    return { sources: a.sourcesText };
  });
}
