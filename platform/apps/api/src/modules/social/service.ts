import type { Job, Prisma, SocialAccount, SocialCredential } from "@prisma/client";
import { CHANNEL_PROVIDERS, sandboxServes, type Channel } from "@forlife/shared";
import { loadConfig } from "../../config.js";
import { prisma, type Tx } from "../../lib/prisma.js";
import { decryptSecret, encryptSecret } from "../../lib/crypto.js";
import { AppError } from "../../lib/errors.js";
import { audit } from "../../lib/audit.js";
import { enqueue } from "../jobs/queue.js";
import { adapterFor } from "./registry.js";
import { SocialError } from "./types.js";
import { signedMediaUrl } from "../creative/service.js";
import { getStorage } from "../storage/storage.js";

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
    for (const acc of accounts.filter((a) => providers.includes(a.provider) && (a.provider !== "SANDBOX" || sandboxServes(a.externalId, v.channel as Channel)))) {
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
  // Les organisations suspendues ne publient plus rien.
  const due = await prisma.publication.findMany({ where: { status: "QUEUED", scheduledAt: { lte: now }, workspace: { status: "ACTIVE", organization: { status: "ACTIVE" } } }, take: 100, orderBy: { scheduledAt: "asc" }, include: { workspace: { select: { organizationId: true } } } });
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

/**
 * Jeton d'accès utilisable : renouvelé (et ré-enregistré chiffré) quand il expire dans moins de 10 minutes
 * et que le réseau le permet. Un refus de renouvellement remonte en erreur AUTH (compte à reconnecter).
 */
export async function accessTokenFor(account: SocialAccount & { credential: SocialCredential }): Promise<string> {
  const key = loadConfig().ENCRYPTION_KEY;
  const cred = account.credential;
  const adapter = adapterFor(account.provider);
  const expiring = cred.expiresAt && cred.expiresAt.getTime() < Date.now() + 10 * 60_000;
  if (!expiring || !adapter.refresh || !cred.refreshTokenEnc) return decryptSecret(cred.accessTokenEnc, key);
  const t = await adapter.refresh(decryptSecret(cred.refreshTokenEnc, key));
  await prisma.socialCredential.update({
    where: { id: cred.id },
    data: { accessTokenEnc: encryptSecret(t.accessToken, key), ...(t.refreshToken ? { refreshTokenEnc: encryptSecret(t.refreshToken, key) } : {}), expiresAt: t.expiresAt ?? null },
  });
  return t.accessToken;
}

/** Dernière vidéo terminée du Video Studio rattachée au contenu. */
async function contentVideo(workspaceId: string, contentId: string): Promise<Buffer | null> {
  const render = await prisma.videoRender.findFirst({
    where: { status: "SUCCEEDED", storageKey: { not: null }, project: { workspaceId, contentId } },
    orderBy: { createdAt: "desc" },
  });
  return render?.storageKey ? getStorage().get(render.storageKey) : null;
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
  const content = await prisma.contentItem.findUniqueOrThrow({ where: { id: pub.contentId }, select: { mediaVersionId: true, contentVersion: true, approvedVersion: true, workspace: { select: { organization: { select: { status: true } } } } } });
  const imageUrl = content.mediaVersionId ? signedMediaUrl(content.mediaVersionId) : null;
  const account = pub.socialAccount;
  const fail = async (err: SocialError | Error, final: boolean) => {
    const code = err instanceof SocialError ? err.code : "UNKNOWN";
    await prisma.publicationAttempt.create({ data: { publicationId: pub.id, attemptNo: job.attempts, status: "FAILED", errorCode: code, errorMessage: err.message.slice(0, 500) } });
    await prisma.publication.update({ where: { id: pub.id }, data: { attempts: job.attempts, lastError: err.message.slice(0, 500), ...(final ? { status: "FAILED" } : {}) } });
    if (final) await settleContent(pub.contentId);
  };
  try {
    // Garde-fous au moment de publier : version approuvée uniquement, organisation active.
    if (content.approvedVersion !== content.contentVersion) throw new SocialError("INVALID", "Contenu modifié depuis son approbation : publication annulée");
    if (content.workspace.organization.status !== "ACTIVE") throw new SocialError("INVALID", "Organisation suspendue : publication annulée");
    if (account.status !== "CONNECTED" || !account.credential) throw new SocialError("AUTH", "Compte social déconnecté : reconnectez-le dans le Social Hub");
    const token = await accessTokenFor({ ...account, credential: account.credential });
    const loadVideo = () => contentVideo(pub.workspaceId, pub.contentId);
    const res = await adapterFor(account.provider).publish(account, token, { text: hashtagsText(variant.body, variant.hashtags), imageUrl, loadVideo }, pub.idempotencyKey);
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
      const token = await accessTokenFor({ ...pub.socialAccount, credential: pub.socialAccount.credential });
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
