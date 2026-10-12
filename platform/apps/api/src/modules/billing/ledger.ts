import { Prisma } from "@prisma/client";
import { PLANS, type PlanCode } from "@forlife/shared";
import { prisma, type Tx } from "../../lib/prisma.js";
import { paymentRequired } from "../../lib/errors.js";
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

async function existing(idempotencyKey: string): Promise<LedgerResult | null> {
  const tx = await prisma.creditTransaction.findUnique({ where: { idempotencyKey } });
  return tx ? { transactionId: tx.id, balanceAfter: tx.balanceAfter, replayed: true } : null;
}

/**
 * Applique un mouvement de crédits de façon atomique et idempotente :
 * - la mise à jour du solde est conditionnelle (jamais négatif, sans race condition) ;
 * - la clé d'idempotence unique empêche toute double application, y compris en concurrence.
 */
async function apply(op: LedgerOp, kind: "GRANT" | "CONSUME" | "REFUND" | "PURCHASE" | "ADJUST", sign: 1 | -1): Promise<LedgerResult> {
  if (!Number.isInteger(op.amount) || op.amount <= 0) throw new Error("Le montant doit être un entier positif");
  const already = await existing(op.idempotencyKey);
  if (already) return already;
  try {
    return await prisma.$transaction(async (tx) => {
      const delta = sign * op.amount;
      const rows = await tx.$queryRaw<{ id: string; balance: number }[]>`
        UPDATE "CreditWallet" SET "balance" = "balance" + ${delta}, "updatedAt" = now()
        WHERE "organizationId" = ${op.organizationId} AND "balance" + ${delta} >= 0
        RETURNING "id", "balance"`;
      const wallet = rows[0];
      if (!wallet) {
        const current = await tx.creditWallet.findUnique({ where: { organizationId: op.organizationId } });
        throw paymentRequired("Crédits insuffisants pour cette opération", {
          required: op.amount,
          balance: current?.balance ?? 0,
        });
      }
      const created = await tx.creditTransaction.create({
        data: {
          walletId: wallet.id,
          organizationId: op.organizationId,
          amount: delta,
          balanceAfter: wallet.balance,
          kind,
          reason: op.reason,
          refType: op.refType ?? null,
          refId: op.refId ?? null,
          idempotencyKey: op.idempotencyKey,
        },
      });
      return { transactionId: created.id, balanceAfter: wallet.balance, replayed: false };
    });
  } catch (e) {
    // Course perdue contre une requête identique : la transaction a été annulée, on renvoie l'opération gagnante.
    if (isUniqueViolation(e)) {
      const replay = await existing(op.idempotencyKey);
      if (replay) return replay;
    }
    throw e;
  }
}

export const ledger = {
  grant: (op: LedgerOp) => apply(op, "GRANT", 1),
  consume: (op: LedgerOp) => apply(op, "CONSUME", -1),
  refund: (op: LedgerOp) => apply(op, "REFUND", 1),
  purchase: (op: LedgerOp) => apply(op, "PURCHASE", 1),
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
