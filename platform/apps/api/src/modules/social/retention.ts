import { prisma } from "../../lib/prisma.js";

/** Règles YouTube (API Services, III.E.4) : une donnée issue de l'API non rafraîchie depuis 30 jours est supprimée. */
const MAX_AGE_MS = 30 * 86_400_000;

/**
 * Supprime les statistiques YouTube de plus de 30 jours et les analyses de réseaux qui contiennent des données YouTube
 * de plus de 30 jours. Idempotent : peut tourner sur plusieurs workers.
 */
export async function purgeStalePlatformData(now = new Date()): Promise<{ metrics: number; audits: number }> {
  const cutoff = new Date(now.getTime() - MAX_AGE_MS);
  const metrics = await prisma.socialMetricSnapshot.deleteMany({ where: { capturedAt: { lt: cutoff }, publication: { socialAccount: { provider: "YOUTUBE" } } } });
  const old = await prisma.socialAudit.findMany({ where: { createdAt: { lt: cutoff } }, select: { id: true, stats: true } });
  const withYouTube = old
    .filter((a) => {
      const accounts = (a.stats as { accounts?: { key?: string; source?: string }[] } | null)?.accounts ?? [];
      return accounts.some((x) => x.key === "YOUTUBE" && x.source !== "none");
    })
    .map((a) => a.id);
  const audits = withYouTube.length ? await prisma.socialAudit.deleteMany({ where: { id: { in: withYouTube } } }) : { count: 0 };
  return { metrics: metrics.count, audits: audits.count };
}
