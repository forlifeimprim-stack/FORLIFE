import { Prisma } from "@prisma/client";
import { CREDIT_ALERT_THRESHOLDS, PLANS, type PlanCode } from "@forlife/shared";
import { prisma, type Tx } from "../../lib/prisma.js";
import { conflict, paymentRequired } from "../../lib/errors.js";
import { loadConfig } from "../../config.js";
import { layout, sendEmail } from "../mail/mailer.js";

export interface LedgerOp {
  organizationId: string;
  amount: number; // > 0
  reason: string;
  idempotencyKey: string;
  refType?: string;
  refId?: string;
}

export interface LedgerResult {
  transactionId: string;
  balanceAfter: number;
  /** true si l'opération avait déjà été appliquée (rejeu idempotent). */
  replayed: boolean;
}

function isUniqueViolation(e: unknown): boolean {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
}

async function existing(idempotencyKey: string, organizationId: string): Promise<LedgerResult | null> {
  const tx = await prisma.creditTransaction.findUnique({ where: { idempotencyKey } });
  if (!tx) return null;
  // Une clé appartient à une seule organisation : jamais de « rejeu » sur l'opération d'un autre client.
  if (tx.organizationId !== organizationId) throw conflict("Identifiant de requête déjà utilisé");
  return { transactionId: tx.id, balanceAfter: tx.balanceAfter, replayed: true };
}

type Kind = "GRANT" | "CONSUME" | "REFUND" | "PURCHASE" | "ADJUST";

/** Écriture du mouvement dans une transaction existante (solde conditionnel + ligne du ledger). */
async function write(tx: Tx, op: LedgerOp, kind: Kind, sign: 1 | -1): Promise<LedgerResult> {
  const delta = sign * op.amount;
  const rows = await tx.$queryRaw<{ id: string; balance: number }[]>`
    UPDATE "CreditWallet" SET "balance" = "balance" + ${delta}, "updatedAt" = now()
    WHERE "organizationId" = ${op.organizationId} AND "balance" + ${delta} >= 0
    RETURNING "id", "balance"`;
  const wallet = rows[0];
  if (!wallet) {
    const current = await tx.creditWallet.findUnique({ where: { organizationId: op.organizationId } });
    throw paymentRequired("Crédits insuffisants pour cette opération", { required: op.amount, balance: current?.balance ?? 0 });
  }
  const created = await tx.creditTransaction.create({
    data: { walletId: wallet.id, organizationId: op.organizationId, amount: delta, balanceAfter: wallet.balance, kind, reason: op.reason, refType: op.refType ?? null, refId: op.refId ?? null, idempotencyKey: op.idempotencyKey },
  });
  return { transactionId: created.id, balanceAfter: wallet.balance, replayed: false };
}

/**
 * Applique un mouvement de crédits de façon atomique et idempotente :
 * - la mise à jour du solde est conditionnelle (jamais négatif, sans race condition) ;
 * - la clé d'idempotence unique empêche toute double application, y compris en concurrence.
 */
async function apply(op: LedgerOp, kind: Kind, sign: 1 | -1): Promise<LedgerResult> {
  if (!Number.isInteger(op.amount) || op.amount <= 0) throw new Error("Le montant doit être un entier positif");
  const already = await existing(op.idempotencyKey, op.organizationId);
  if (already) return already;
  try {
    return await prisma.$transaction((tx) => write(tx, op, kind, sign));
  } catch (e) {
    // Course perdue contre une requête identique : la transaction a été annulée, on renvoie l'opération gagnante.
    if (isUniqueViolation(e)) {
      const replay = await existing(op.idempotencyKey, op.organizationId);
      if (replay) return replay;
    }
    throw e;
  }
}

/**
 * Prévient les propriétaires et administrateurs quand une consommation fait passer le solde sous 20 % puis 5 %
 * de l'allocation mensuelle (un seul email par seuil franchi). Au mieux : n'échoue jamais l'opération.
 */
export async function notifyLowCredits(organizationId: string, before: number, after: number): Promise<void> {
  try {
    const sub = await prisma.subscription.findUnique({ where: { organizationId }, include: { organization: { select: { name: true } } } });
    if (!sub) return;
    const allowance = PLANS[sub.planCode].monthlyCredits;
    const crossed = CREDIT_ALERT_THRESHOLDS.filter((t) => before >= allowance * t && after < allowance * t);
    if (!crossed.length) return;
    const pct = Math.round(Math.min(...crossed) * 100);
    const admins = await prisma.membership.findMany({ where: { organizationId, role: { in: ["OWNER", "ADMIN"] } }, include: { user: { select: { email: true } } } });
    const url = `${loadConfig().APP_URL}/settings?tab=billing`;
    for (const m of admins) {
      await sendEmail({
        to: m.user.email,
        subject: `Crédits Forlife Com : moins de ${pct} % restants`,
        template: "credits-low",
        ...layout(`Il vous reste ${after} crédits`, [
          `Le solde de « ${sub.organization.name} » est passé sous ${pct} % de votre allocation mensuelle (${allowance} crédits).`,
          "Pour continuer à générer contenus, visuels et vidéos sans interruption, rechargez avec un pack de crédits ou passez à une offre supérieure.",
        ], { label: "Recharger mes crédits", url }),
      });
    }
  } catch {
    // L'alerte est un confort : une erreur d'envoi ne doit pas bloquer la consommation.
  }
}

async function consume(op: LedgerOp): Promise<LedgerResult> {
  const res = await apply(op, "CONSUME", -1);
  if (!res.replayed) void notifyLowCredits(op.organizationId, res.balanceAfter + op.amount, res.balanceAfter);
  return res;
}

export const ledger = {
  grant: (op: LedgerOp) => apply(op, "GRANT", 1),
  consume,
  refund: (op: LedgerOp) => apply(op, "REFUND", 1),
  purchase: (op: LedgerOp) => apply(op, "PURCHASE", 1),
  /** Crédit à l'intérieur d'une transaction englobante (tout ou rien avec le reste de l'opération). */
  creditInTx: (tx: Tx, op: LedgerOp, kind: "GRANT" | "PURCHASE") => {
    if (!Number.isInteger(op.amount) || op.amount <= 0) throw new Error("Le montant doit être un entier positif");
    return write(tx, op, kind, 1);
  },
};

/** Crée l'abonnement + le portefeuille d'une nouvelle organisation (dans la transaction d'inscription). */
export async function provisionBilling(tx: Tx, organizationId: string, planCode: PlanCode = "FREE"): Promise<void> {
  const now = new Date();
  const end = new Date(now);
  end.setMonth(end.getMonth() + 1);
  await tx.subscription.create({
    data: { organizationId, planCode, currentPeriodStart: now, currentPeriodEnd: end },
  });
  await tx.creditWallet.create({ data: { organizationId, balance: 0 } });
}

/**
 * Allocation mensuelle du plan (idempotente par organisation et période).
 * Report plafonné : le solde après allocation ne dépasse pas 2 × l'allocation mensuelle.
 */
export async function grantMonthlyAllowance(organizationId: string): Promise<LedgerResult | null> {
  const sub = await prisma.subscription.findUniqueOrThrow({ where: { organizationId } });
  const wallet = await prisma.creditWallet.findUniqueOrThrow({ where: { organizationId } });
  const plan = PLANS[sub.planCode];
  // Plan Free : crédits offerts seulement si le propriétaire a confirmé son email (anti-inscriptions en masse).
  if (sub.planCode === "FREE") {
    const verifiedOwner = await prisma.membership.findFirst({ where: { organizationId, role: "OWNER", user: { emailVerifiedAt: { not: null } } }, select: { id: true } });
    if (!verifiedOwner) return null;
  }
  const amount = Math.min(plan.monthlyCredits, Math.max(0, plan.monthlyCredits * 2 - wallet.balance));
  if (amount <= 0) return null;
  const period = sub.currentPeriodStart.toISOString().slice(0, 10);
  return ledger.grant({
    organizationId,
    amount,
    reason: `Allocation mensuelle ${plan.name}`,
    idempotencyKey: `allowance:${organizationId}:${period}`,
    refType: "subscription",
    refId: sub.id,
  });
}

export function addMonths(d: Date, months = 1): Date {
  const n = new Date(d);
  n.setMonth(n.getMonth() + months);
  return n;
}

/**
 * Renouvelle les abonnements arrivés à échéance et verse l'allocation de la nouvelle période.
 * Un plan payant non réglé (ou dont la période offerte est terminée) repasse automatiquement en Free.
 */
export async function renewDueSubscriptions(now = new Date()): Promise<number> {
  const due = await prisma.subscription.findMany({ where: { status: "ACTIVE", currentPeriodEnd: { lte: now } }, take: 500 });
  let renewed = 0;
  for (const sub of due) {
    let start = sub.currentPeriodEnd;
    let end = addMonths(start);
    while (end <= now) {
      start = end;
      end = addMonths(end);
    }
    const expired = sub.planCode !== "FREE" && (!sub.paidUntil || sub.paidUntil.getTime() <= start.getTime() + 60_000);
    // Mise à jour conditionnelle : un seul worker renouvelle une période donnée.
    const res = await prisma.subscription.updateMany({
      where: { id: sub.id, currentPeriodEnd: sub.currentPeriodEnd },
      data: { currentPeriodStart: start, currentPeriodEnd: end, ...(expired ? { planCode: "FREE", paidUntil: null } : {}) },
    });
    if (!res.count) continue;
    if (expired) {
      await enforceWorkspaceLimit(sub.organizationId);
      await prisma.auditLog.create({ data: { organizationId: sub.organizationId, action: "subscription.expired", entityType: "subscription", entityId: sub.id, metadata: { from: sub.planCode } } });
      await notifyExpired(sub.organizationId, sub.planCode).catch(() => undefined);
    }
    await grantMonthlyAllowance(sub.organizationId);
    renewed++;
  }
  return renewed;
}

async function notifyExpired(organizationId: string, planCode: PlanCode) {
  const owner = await prisma.membership.findFirst({ where: { organizationId, role: "OWNER" }, include: { user: true } });
  if (!owner) return;
  const mail = layout(`Votre plan ${PLANS[planCode].name} est arrivé à échéance`, [
    `Bonjour ${owner.user.name},`,
    "Votre espace est repassé au plan Free : vos données sont intactes, mais les crédits mensuels sont réduits.",
    "Réabonnez-vous en quelques secondes par Orange Money, MTN MoMo, Moov, Wave ou carte.",
  ], { label: "Renouveler mon abonnement", url: `${loadConfig().APP_URL}/settings?tab=billing` });
  await sendEmail({ to: owner.user.email, subject: "Votre abonnement Forlife Com a expiré", template: "subscription.expired", ...mail });
}

/**
 * Applique le nombre d'espaces du plan courant : les plus récents au-delà de la limite passent en lecture seule
 * (LOCKED), et sont débloqués dès qu'un plan suffisant est repris. Aucune donnée n'est supprimée.
 */
export async function enforceWorkspaceLimit(organizationId: string) {
  const sub = await prisma.subscription.findUnique({ where: { organizationId } });
  if (!sub) return;
  const max = PLANS[sub.planCode].maxWorkspaces;
  const all = await prisma.workspace.findMany({ where: { organizationId, status: { in: ["ACTIVE", "LOCKED"] } }, orderBy: { createdAt: "asc" }, select: { id: true, status: true } });
  const keep = all.slice(0, max).filter((w) => w.status === "LOCKED").map((w) => w.id);
  const lock = all.slice(max).filter((w) => w.status === "ACTIVE").map((w) => w.id);
  if (keep.length) await prisma.workspace.updateMany({ where: { id: { in: keep } }, data: { status: "ACTIVE" } });
  if (lock.length) await prisma.workspace.updateMany({ where: { id: { in: lock } }, data: { status: "LOCKED" } });
}
