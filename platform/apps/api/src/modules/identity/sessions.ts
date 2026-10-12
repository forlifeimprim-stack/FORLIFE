import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { loadConfig } from "../../config.js";
import { prisma } from "../../lib/prisma.js";
import { randomToken, sha256 } from "../../lib/crypto.js";
import { unauthorized } from "../../lib/errors.js";

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
      ip: req.ip,
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

/**
 * Rotation du refresh token. La réutilisation d'un token déjà tourné révoque
 * toutes les sessions de l'utilisateur (détection de vol de token).
 */
export async function rotateSession(app: FastifyInstance, req: FastifyRequest, reply: FastifyReply) {
  const token = req.cookies[REFRESH_COOKIE];
  if (!token) throw unauthorized("Session expirée");
  const session = await prisma.session.findUnique({ where: { refreshTokenHash: sha256(token) } });
  if (!session) throw unauthorized("Session expirée");
  if (session.revokedAt) {
    await prisma.session.updateMany({ where: { userId: session.userId, revokedAt: null }, data: { revokedAt: new Date() } });
    throw unauthorized("Session révoquée");
  }
  if (session.expiresAt < new Date()) throw unauthorized("Session expirée");
  const next = await issueSession(app, req, reply, session.userId);
  await prisma.session.update({ where: { id: session.id }, data: { revokedAt: new Date(), replacedById: next.sessionId } });
  return next;
}

export async function revokeCurrent(req: FastifyRequest, reply: FastifyReply) {
  const token = req.cookies[REFRESH_COOKIE];
  if (token) {
    await prisma.session.updateMany({ where: { refreshTokenHash: sha256(token), revokedAt: null }, data: { revokedAt: new Date() } });
  }
  reply.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
}
