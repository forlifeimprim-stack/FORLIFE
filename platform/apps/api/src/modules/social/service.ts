import type { Job, Prisma } from "@prisma/client";
import { CHANNEL_PROVIDERS, type Channel } from "@forlife/shared";
import { loadConfig } from "../../config.js";
import { prisma, type Tx } from "../../lib/prisma.js";
import { decryptSecret } from "../../lib/crypto.js";
import { AppError } from "../../lib/errors.js";
import { audit } from "../../lib/audit.js";
import { enqueue } from "../jobs/queue.js";
import { adapterFor } from "./registry.js";
import { SocialError } from "./types.js";

/**
 * À la programmation d'un contenu : une Publication par (variante × compte connecté compatible).
 * Les canaux sans compte connecté (WhatsApp, email…) restent en diffusion manuelle.
 */
export async function schedulePublications(tx: Tx, workspaceId: string, contentId: string, scheduledAt: Date): Promise<number> {
  await cancelPublications(tx, contentId);
  const [variants, accounts] = await Promise.all([
    tx.contentVariant.findMany({ where: { contentId } }),
    tx.socialAccount.findMany({ where: { workspaceId, status: "CONNECTED" } }),
  ]);
  let n = 0;
  for (const v of variants) {
    const providers = CHANNEL_PROVIDERS[v.channel as Channel] ?? [];
    for (const acc of accounts.filter((a) => providers.includes(a.provider))) {
      await tx.publication.create({
        data: { workspaceId, contentId, variantId: v.id, socialAccountId: acc.id, scheduledAt, idempotencyKey: `${v.id}:${acc.id}:${scheduledAt.toISOString()}` },
      });
      n++;
    }
  }
  return n;
}

export async function cancelPublications(tx: Tx, contentId: string) {
  await tx.publication.updateMany({ where: { contentId, status: "QUEUED" }, data: { status: "CANCELLED" } });
}

/** Réserve atomiquement les publications arrivées à échéance et les confie à la file de jobs. */
export async function dispatchDuePublications(now = new Date()): Promise<number> {
  const due = await prisma.publication.findMany({ where: { status: "QUEUED", scheduledAt: { lte: now } }, take: 100, orderBy: { scheduledAt: "asc" }, include: { workspace: { select: { organizationId: true } } } });
  let n = 0;
  for (const pub of due) {
    const claimed = await prisma.publication.updateMany({ where: { id: pub.id, status: "QUEUED" }, data: { status: "PUBLISHING" } });
    if (!claimed.count) continue;
    await enqueue({ organizationId: pub.workspace.organizationId, workspaceId: pub.workspaceId, type: "social.publish", payload: { publicationId: pub.id }, correlationId: `pub-${pub.id}`, maxAttempts: 4 });
    n++;
  }
  return n;
}

/** Quand toutes les publications d'un contenu sont terminées, le contenu passe à PUBLISHED (ou FAILED). */
export async function settleContent(contentId: string) {
  const pubs = await prisma.publication.findMany({ where: { contentId, status: { not: "CANCELLED" } }, select: { status: true } });
  if (!pubs.length || pubs.some((p) => p.status === "QUEUED" || p.status === "PUBLISHING")) return;
  const status = pubs.every((p) => p.status === "PUBLISHED") ? "PUBLISHED" : "FAILED";
  await prisma.contentItem.updateMany({ where: { id: contentId, status: "SCHEDULED" }, data: { status, revision: { increment: 1 } } });
}

function hashtagsText(body: string, tags: unknown): string {
  const list = Array.isArray(tags) ? tags.filter((t): t is string => typeof t === "string") : [];
  return list.length ? `${body}\n\n${list.map((t) => `#${t}`).join(" ")}` : body;
}

/** Job de publication : idempotent (un externalId déjà obtenu n'est jamais republié). */
export async function publishJob(job: Job): Promise<Prisma.InputJsonValue> {
  const { publicationId } = job.payload as { publicationId: string };
  const pub = await prisma.publication.findUniqueOrThrow({ where: { id: publicationId }, include: { socialAccount: { include: { credential: true } } } });
  if (pub.status === "PUBLISHED" || pub.externalId) return { externalId: pub.externalId, alreadyPublished: true };
  if (pub.status === "CANCELLED") return { cancelled: true };
  const variant = await prisma.contentVariant.findUniqueOrThrow({ where: { id: pub.variantId } });
  const account = pub.socialAccount;
  const fail = async (err: SocialError | Error, final: boolean) => {
    const code = err instanceof SocialError ? err.code : "UNKNOWN";
    await prisma.publicationAttempt.create({ data: { publicationId: pub.id, attemptNo: job.attempts, status: "FAILED", errorCode: code, errorMessage: err.message.slice(0, 500) } });
    await prisma.publication.update({ where: { id: pub.id }, data: { attempts: job.attempts, lastError: err.message.slice(0, 500), ...(final ? { status: "FAILED" } : {}) } });
    if (final) await settleContent(pub.contentId);
  };
  try {
    if (account.status !== "CONNECTED" || !account.credential) throw new SocialError("AUTH", "Compte social déconnecté : reconnectez-le dans le Social Hub");
    const token = decryptSecret(account.credential.accessTokenEnc, loadConfig().ENCRYPTION_KEY);
    const res = await adapterFor(account.provider).publish(account, token, { text: hashtagsText(variant.body, variant.hashtags) }, pub.idempotencyKey);
    await prisma.$transaction([
      prisma.publication.update({ where: { id: pub.id }, data: { status: "PUBLISHED", externalId: res.externalId, externalUrl: res.url ?? null, publishedAt: new Date(), attempts: job.attempts, lastError: null } }),
      prisma.publicationAttempt.create({ data: { publicationId: pub.id, attemptNo: job.attempts, status: "SUCCEEDED" } }),
    ]);
    await settleContent(pub.contentId);
    await audit({ organizationId: job.organizationId, workspaceId: pub.workspaceId, action: "publication.published", entityType: "publication", entityId: pub.id, correlationId: job.correlationId, metadata: { provider: account.provider, externalId: res.externalId } });
    return { externalId: res.externalId, url: res.url ?? null };
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    if (err instanceof SocialError && err.code === "AUTH") {
      await prisma.socialAccount.update({ where: { id: account.id }, data: { status: "EXPIRED", lastError: err.message } });
    }
    const retryable = err instanceof SocialError ? err.retryable : true;
    const final = !retryable || job.attempts >= job.maxAttempts;
    await fail(err, final);
    // Erreur définitive → AppError 4xx : la file n'insiste pas. Transitoire → nouvelle tentative avec backoff.
    if (!retryable) throw new AppError(400, `SOCIAL_${err instanceof SocialError ? err.code : "ERROR"}`, err.message);
    throw err;
  }
}

const hour = (d = new Date()) => new Date(Math.floor(d.getTime() / 3_600_000) * 3_600_000);

/** Relevé horaire des statistiques des publications des 30 derniers jours (dédoublonné par heure). */
export async function collectMetrics(): Promise<number> {
  const pubs = await prisma.publication.findMany({
    where: { status: "PUBLISHED", publishedAt: { gte: new Date(Date.now() - 30 * 864e5) }, socialAccount: { status: "CONNECTED" } },
    include: { socialAccount: { include: { credential: true } } },
    take: 500,
  });
  const at = hour();
  let n = 0;
  for (const pub of pubs) {
    if (!pub.externalId || !pub.socialAccount.credential) continue;
    try {
      const token = decryptSecret(pub.socialAccount.credential.accessTokenEnc, loadConfig().ENCRYPTION_KEY);
      const m = await adapterFor(pub.socialAccount.provider).fetchMetrics(pub.socialAccount, token, pub.externalId);
      await prisma.socialMetricSnapshot.upsert({
        where: { publicationId_capturedAt: { publicationId: pub.id, capturedAt: at } },
        update: m,
        create: { publicationId: pub.id, capturedAt: at, ...m },
      });
      n++;
    } catch (e) {
      if (e instanceof SocialError && e.code === "AUTH") await prisma.socialAccount.update({ where: { id: pub.socialAccountId }, data: { status: "EXPIRED", lastError: e.message } });
    }
  }
  return n;
}
