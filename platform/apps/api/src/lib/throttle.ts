import { prisma } from "./prisma.js";
import { AppError } from "./errors.js";

/**
 * Limiteur partagé par toutes les instances (stocké en base) pour les actions sensibles :
 * tentatives de connexion par compte, emails envoyés à une adresse, etc.
 */
export async function hit(key: string, windowSeconds: number): Promise<number> {
  const rows = await prisma.$queryRaw<{ count: number }[]>`
    INSERT INTO "RateLimitBucket" ("key", "count", "resetAt")
    VALUES (${key}, 1, now() + make_interval(secs => ${windowSeconds}))
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "RateLimitBucket"."resetAt" <= now() THEN 1 ELSE "RateLimitBucket"."count" + 1 END,
      "resetAt" = CASE WHEN "RateLimitBucket"."resetAt" <= now() THEN now() + make_interval(secs => ${windowSeconds}) ELSE "RateLimitBucket"."resetAt" END
    RETURNING "count"`;
  return Number(rows[0]?.count ?? 0);
}

/** Valeur courante du compteur (0 si expiré ou absent). */
export async function peek(key: string): Promise<number> {
  const row = await prisma.rateLimitBucket.findUnique({ where: { key } });
  return row && row.resetAt > new Date() ? row.count : 0;
}

export async function reset(key: string): Promise<void> {
  await prisma.rateLimitBucket.deleteMany({ where: { key } });
}

/** Incrémente et refuse au-delà de `max` dans la fenêtre. */
export async function limit(key: string, max: number, windowSeconds: number, message = "Trop de tentatives. Réessayez dans quelques minutes."): Promise<void> {
  if ((await hit(key, windowSeconds)) > max) throw new AppError(429, "RATE_LIMITED", message);
}

export async function purgeExpiredBuckets(): Promise<number> {
  const r = await prisma.rateLimitBucket.deleteMany({ where: { resetAt: { lt: new Date(Date.now() - 60_000) } } });
  return r.count;
}
