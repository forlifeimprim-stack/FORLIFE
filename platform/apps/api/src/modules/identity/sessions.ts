import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { loadConfig } from "../../config.js";
import { prisma } from "../../lib/prisma.js";
import { randomToken, sha256 } from "../../lib/crypto.js";
import { unauthorized } from "../../lib/errors.js";
import { clientIp } from "../../lib/request.js";
import { forgetSessions } from "../../plugins/auth.js";

// « __session » : seul cookie transmis par Firebase Hosting aux services Cloud Run.
export const REFRESH_COOKIE = "__session";

export async function issueSession(app: FastifyInstance, req: FastifyRequest, reply: FastifyReply, userId: string) {
  const cfg = loadConfig();
  const refreshToken = randomToken(48);
  const session = await prisma.session.create({
    data: {
      userId,
      refreshTokenHash: sha256(refreshToken),
      expiresAt: new Date(Date.now() + cfg.REFRESH_TOKEN_TTL_DAYS * 864e5),
      userAgent: req.headers["user-agent"]?.slice(0, 255) ?? null,
      ip: clientIp(req),
    },
  });
  setRefreshCookie(reply, refreshToken);
  const accessToken = app.jwt.sign({ sub: userId, sid: session.id }, { expiresIn: cfg.ACCESS_TOKEN_TTL_SECONDS });
  return { accessToken, expiresIn: cfg.ACCESS_TOKEN_TTL_SECONDS, sessionId: session.id };
}

export function setRefreshCookie(reply: FastifyReply, token: string) {
  const cfg = loadConfig();
  reply.setCookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: cfg.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/auth",
    maxAge: cfg.REFRESH_TOKEN_TTL_DAYS * 86400,
  });
}

/** Révoque toutes les sessions actives d'un utilisateur (y compris leurs jetons d'accès en cours). */
export async function revokeAllSessions(userId: string) {
  const active = await prisma.session.findMany({ where: { userId, revokedAt: null }, select: { id: true } });
  await prisma.session.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
  forgetSessions(active.map((s) => s.id));
}

// Deux onglets qui rafraîchissent en même temps : la réutilisation immédiate n'est pas un vol.
const CONCURRENT_REFRESH_GRACE_MS = 10_000;

/**
 * Rotation du refresh token, à usage unique garanti (consommation atomique).
 * La réutilisation d'un token déjà tourné révoque toutes les sessions de l'utilisateur (détection de vol).
 */
export async function rotateSession(app: FastifyInstance, req: FastifyRequest, reply: FastifyReply) {
  const token = req.cookies[REFRESH_COOKIE];
  if (!token) throw unauthorized("Session expirée");
  const session = await prisma.session.findUnique({ where: { refreshTokenHash: sha256(token) } });
  if (!session) throw unauthorized("Session expirée");
  const consumed = await prisma.session.updateMany({ where: { id: session.id, revokedAt: null, expiresAt: { gt: new Date() } }, data: { revokedAt: new Date() } });
  if (!consumed.count) {
    const fresh = await prisma.session.findUnique({ where: { id: session.id }, select: { revokedAt: true, replacedById: true } });
    const concurrent = fresh?.revokedAt && fresh.replacedById && Date.now() - fresh.revokedAt.getTime() < CONCURRENT_REFRESH_GRACE_MS;
    if (fresh?.revokedAt && !concurrent) await revokeAllSessions(session.userId);
    throw unauthorized(fresh?.revokedAt ? "Session révoquée" : "Session expirée");
  }
  forgetSessions([session.id]);
  const next = await issueSession(app, req, reply, session.userId);
  await prisma.session.update({ where: { id: session.id }, data: { replacedById: next.sessionId } });
  return next;
}

export async function revokeCurrent(req: FastifyRequest, reply: FastifyReply) {
  const token = req.cookies[REFRESH_COOKIE];
  if (token) {
    const s = await prisma.session.findUnique({ where: { refreshTokenHash: sha256(token) }, select: { id: true } });
    await prisma.session.updateMany({ where: { refreshTokenHash: sha256(token), revokedAt: null }, data: { revokedAt: new Date() } });
    if (s) forgetSessions([s.id]);
  }
  reply.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
}
