import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { loadConfig } from "../../config.js";
import { prisma } from "../../lib/prisma.js";
import { hashPassword, randomToken, sha256 } from "../../lib/crypto.js";
import { badRequest } from "../../lib/errors.js";
import { parse } from "../../lib/validation.js";
import { hit } from "../../lib/throttle.js";
import { layout, sendEmail } from "../mail/mailer.js";
import { revokeAllSessions } from "./sessions.js";
import { markEmailVerified } from "./verification.js";

const RESET_TTL_MS = 60 * 60 * 1000;

/** Mot de passe oublié : réponse identique que le compte existe ou non (pas d'énumération). */
export async function passwordRoutes(app: FastifyInstance) {
  const limit = { config: { rateLimit: { max: 5, timeWindow: "1 minute" } } };

  app.post("/api/auth/forgot-password", limit, async (req) => {
    const { email } = parse(z.object({ email: z.email().transform((e) => e.toLowerCase()) }), req.body);
    // Au plus 3 emails par adresse et par heure (anti-bombardement), sans le révéler au demandeur.
    const sent = await hit(`forgot:${email}`, 3600);
    const user = sent <= 3 ? await prisma.user.findUnique({ where: { email } }) : null;
    if (user) {
      const token = randomToken(32);
      // Un seul lien valable à la fois.
      await prisma.passwordReset.updateMany({ where: { userId: user.id, usedAt: null }, data: { usedAt: new Date() } });
      await prisma.passwordReset.create({ data: { userId: user.id, tokenHash: sha256(token), expiresAt: new Date(Date.now() + RESET_TTL_MS) } });
      const url = `${loadConfig().APP_URL}/reset-password?token=${token}`;
      // Envoi non bloquant : même temps de réponse que pour une adresse inconnue.
      void sendEmail({
        to: email,
        subject: "Réinitialisez votre mot de passe Forlife Com",
        template: "password_reset",
        ...layout("Réinitialisation du mot de passe", [`Bonjour ${user.name},`, "Vous avez demandé à réinitialiser votre mot de passe. Ce lien est valable 1 heure.", "Si vous n'êtes pas à l'origine de cette demande, ignorez cet email."], { label: "Choisir un nouveau mot de passe", url }),
      }).catch(() => undefined);
    }
    return { ok: true };
  });

  app.post("/api/auth/reset-password", limit, async (req) => {
    const body = parse(z.object({ token: z.string().min(20).max(200), password: z.string().min(10, "10 caractères minimum").max(200) }), req.body);
    const reset = await prisma.passwordReset.findUnique({ where: { tokenHash: sha256(body.token) } });
    if (!reset || reset.usedAt || reset.expiresAt < new Date()) throw badRequest("Lien invalide ou expiré");
    const passwordHash = await hashPassword(body.password);
    await prisma.$transaction(async (tx) => {
      // Consommation conditionnelle : un lien ne sert qu'une fois, même en cas de double clic.
      const used = await tx.passwordReset.updateMany({ where: { id: reset.id, usedAt: null }, data: { usedAt: new Date() } });
      if (!used.count) throw badRequest("Lien invalide ou expiré");
      await tx.user.update({ where: { id: reset.userId }, data: { passwordHash } });
      // Les autres liens encore en attente ne servent plus.
      await tx.passwordReset.updateMany({ where: { userId: reset.userId, usedAt: null }, data: { usedAt: new Date() } });
    });
    // Toutes les sessions existantes sont révoquées (jetons d'accès compris).
    await revokeAllSessions(reset.userId);
    // Le lien a été reçu par email : l'adresse est prouvée.
    await markEmailVerified(reset.userId);
    return { ok: true };
  });
}
