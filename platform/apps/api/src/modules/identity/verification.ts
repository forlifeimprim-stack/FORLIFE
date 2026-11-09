import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { loadConfig } from "../../config.js";
import { prisma } from "../../lib/prisma.js";
import { randomToken, sha256 } from "../../lib/crypto.js";
import { badRequest } from "../../lib/errors.js";
import { parse } from "../../lib/validation.js";
import { limit } from "../../lib/throttle.js";
import { authenticate } from "../../plugins/auth.js";
import { grantMonthlyAllowance } from "../billing/ledger.js";
import { layout, sendEmail } from "../mail/mailer.js";

const VERIFY_TTL_MS = 3 * 24 * 3600 * 1000;

/** Envoie (sans bloquer la réponse) un lien de confirmation d'adresse email. */
export async function sendVerificationEmail(user: { id: string; email: string; name: string }) {
  const token = randomToken(32);
  await prisma.emailVerification.updateMany({ where: { userId: user.id, usedAt: null }, data: { usedAt: new Date() } });
  await prisma.emailVerification.create({ data: { userId: user.id, tokenHash: sha256(token), expiresAt: new Date(Date.now() + VERIFY_TTL_MS) } });
  const url = `${loadConfig().APP_URL}/verify-email?token=${token}`;
  void sendEmail({
    to: user.email,
    subject: "Confirmez votre adresse email — Forlife Com",
    template: "email_verification",
    ...layout("Confirmez votre adresse email", [`Bonjour ${user.name},`, "Confirmez votre adresse pour sécuriser votre compte et recevoir vos crédits IA offerts. Ce lien est valable 3 jours."], { label: "Confirmer mon email", url }),
  }).catch(() => undefined);
}

/**
 * Possession de l'email prouvée (lien de vérification, invitation ou réinitialisation reçus par email) :
 * débloque l'allocation de crédits du plan Free des organisations dont l'utilisateur est propriétaire.
 */
export async function markEmailVerified(userId: string) {
  const r = await prisma.user.updateMany({ where: { id: userId, emailVerifiedAt: null }, data: { emailVerifiedAt: new Date() } });
  if (!r.count) return;
  const owned = await prisma.membership.findMany({ where: { userId, role: "OWNER" }, select: { organizationId: true } });
  for (const m of owned) await grantMonthlyAllowance(m.organizationId);
}

export async function verificationRoutes(app: FastifyInstance) {
  app.post("/api/auth/verify-email", { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } }, async (req) => {
    const { token } = parse(z.object({ token: z.string().min(20).max(200) }), req.body);
    const row = await prisma.emailVerification.findUnique({ where: { tokenHash: sha256(token) } });
    if (!row || row.usedAt || row.expiresAt < new Date()) throw badRequest("Lien invalide ou expiré");
    const used = await prisma.emailVerification.updateMany({ where: { id: row.id, usedAt: null }, data: { usedAt: new Date() } });
    if (!used.count) throw badRequest("Lien invalide ou expiré");
    await markEmailVerified(row.userId);
    return { ok: true };
  });

  app.post("/api/auth/resend-verification", { preHandler: authenticate }, async (req) => {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user.sub } });
    if (user.emailVerifiedAt) return { ok: true, alreadyVerified: true };
    await limit(`verify-mail:${user.id}`, 3, 3600, "Un email vient déjà de vous être envoyé. Vérifiez vos courriers indésirables.");
    await sendVerificationEmail(user);
    return { ok: true };
  });
}
