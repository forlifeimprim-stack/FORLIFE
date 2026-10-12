import { Prisma } from "@prisma/client";
import { PLANS, type PlanCode } from "@forlife/shared";
import { prisma, type Tx } from "../../lib/prisma.js";
import { paymentRequired } from "../../lib/errors.js";

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

function addMonth(d: Date): Date {
  const n = new Date(d);
  n.setMonth(n.getMonth() + 1);
  return n;
}

/** Renouvelle les abonnements arrivés à échéance et verse l'allocation de la nouvelle période. */
export async function renewDueSubscriptions(now = new Date()): Promise<number> {
  const due = await prisma.subscription.findMany({ where: { status: "ACTIVE", currentPeriodEnd: { lte: now } }, take: 500 });
  let renewed = 0;
  for (const sub of due) {
    let start = sub.currentPeriodEnd;
    let end = addMonth(start);
    while (end <= now) {
      start = end;
      end = addMonth(end);
    }
    // Mise à jour conditionnelle : un seul worker renouvelle une période donnée.
    const res = await prisma.subscription.updateMany({
      where: { id: sub.id, currentPeriodEnd: sub.currentPeriodEnd },
      data: { currentPeriodStart: start, currentPeriodEnd: end },
    });
    if (!res.count) continue;
    await grantMonthlyAllowance(sub.organizationId);
    renewed++;
  }
  return renewed;
}
