import { isIP } from "node:net";
import type { FastifyRequest } from "fastify";

/**
 * Adresse IP du client, sans jamais faire confiance à l'entrée la plus à gauche de X-Forwarded-For
 * (fournie librement par le client).
 * - Via Firebase Hosting : en-tête « x-fah-client-ip » posé par Firebase après son propre proxy.
 * - Accès direct à Cloud Run : dernière entrée de X-Forwarded-For, ajoutée par le frontal Google.
 * - Sinon (développement) : adresse de la connexion.
 * Comme l'URL *.run.app reste joignable, ces valeurs servent à des limites « au mieux » ; les protections
 * critiques (connexion, emails) s'appuient en plus sur des compteurs par compte, indépendants de l'IP.
 */
export function clientIp(req: FastifyRequest): string {
  const fah = req.headers["x-fah-client-ip"];
  if (typeof fah === "string" && isIP(fah.trim())) return fah.trim();
  const xff = req.headers["x-forwarded-for"];
  const raw = Array.isArray(xff) ? xff.join(",") : xff;
  if (raw) {
    const last = raw.split(",").map((s) => s.trim()).filter(Boolean).at(-1);
    if (last && isIP(last)) return last;
  }
  return req.socket.remoteAddress ?? "0.0.0.0";
}
