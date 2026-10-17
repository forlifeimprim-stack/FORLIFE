import { randomBytes } from "node:crypto";
import type { Payment, Prisma } from "@prisma/client";
import { CREDIT_PACKS, PLANS, subscriptionPrice, type BillingMonths, type CreditPackCode, type PlanCode } from "@forlife/shared";
import { loadConfig } from "../../config.js";
import { prisma } from "../../lib/prisma.js";
import { badRequest } from "../../lib/errors.js";
import { audit } from "../../lib/audit.js";
import { addMonths, enforceWorkspaceLimit, ledger } from "../billing/ledger.js";
import { layout, sendEmail } from "../mail/mailer.js";
import { paymentProviders, type PaymentProvider, type VerifiedPayment } from "./providers.js";

export type PurchaseRequest = { kind: "SUBSCRIPTION"; planCode: Exclude<PlanCode, "FREE">; months: BillingMonths } | { kind: "CREDITS"; packCode: CreditPackCode };

const event = (paymentId: string, type: string, payload: unknown = {}) => prisma.paymentEvent.create({ data: { paymentId, type, payload: payload as Prisma.InputJsonValue } });

export function describe(p: Pick<Payment, "kind" | "planCode" | "months" | "packCode" | "credits">): string {
  if (p.kind === "SUBSCRIPTION") return `Forlife Com ${PLANS[p.planCode!].name} - ${p.months} mois`;
  return `Forlife Com - ${p.credits} credits`;
}

/** Crée le paiement et la session de paiement chez le prestataire (idempotent par requestId). */
export async function createPayment(input: { organizationId: string; userId: string; email: string; name: string; provider: PaymentProvider["key"]; requestId: string; purchase: PurchaseRequest }) {
  const provider = paymentProviders()[input.provider];
  if (!provider) throw badRequest("Moyen de paiement indisponible");
  const key = `pay:${input.organizationId}:${input.requestId}`;
  const found = await prisma.payment.findUnique({ where: { idempotencyKey: key } });
  if (found) return found;
  const pr = input.purchase;
  const data =
    pr.kind === "SUBSCRIPTION"
      ? { kind: "SUBSCRIPTION", planCode: pr.planCode, months: pr.months, amount: subscriptionPrice(pr.planCode, pr.months), credits: PLANS[pr.planCode].monthlyCredits }
      : { kind: "CREDITS", packCode: pr.packCode, months: 0, amount: CREDIT_PACKS[pr.packCode].priceXof, credits: CREDIT_PACKS[pr.packCode].credits };
  const payment = await prisma.payment.create({
    data: { ...data, organizationId: input.organizationId, provider: provider.key, providerRef: `FL${Date.now().toString(36)}${randomBytes(5).toString("hex")}`.toUpperCase(), idempotencyKey: key, createdById: input.userId },
  });
  try {
    const { checkoutUrl } = await provider.createCheckout({ paymentId: payment.id, transactionId: payment.providerRef, amount: payment.amount, currency: payment.currency, description: describe(payment), customer: { name: input.name, email: input.email } });
    await event(payment.id, "CREATED", { provider: provider.key });
    return prisma.payment.update({ where: { id: payment.id }, data: { checkoutUrl } });
  } catch (e) {
    const reason = e instanceof Error ? e.message : String(e);
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED", failureReason: reason.slice(0, 300) } });
    await event(payment.id, "FAILED", { reason });
    throw badRequest("Le prestataire de paiement est momentanément indisponible. Réessayez dans un instant.");
  }
}

// Une vérification auprès du prestataire au plus toutes les 10 secondes par paiement (anti-inondation du webhook).
const CHECK_INTERVAL_MS = 10_000;

/**
 * Interroge le prestataire et applique le résultat. Seule source de vérité du statut.
 * `allowCancelled` : un paiement expiré côté Forlife mais finalement accepté chez le prestataire est livré.
 */
export async function reconcile(paymentId: string, source: string, opts: { allowCancelled?: boolean } = {}): Promise<Payment> {
  const payment = await prisma.payment.findUniqueOrThrow({ where: { id: paymentId } });
  if (payment.status !== "PENDING" && !(opts.allowCancelled && payment.status === "CANCELLED")) return payment;
  const provider = paymentProviders()[payment.provider as PaymentProvider["key"]];
  if (!provider) return payment;
  // Réservation atomique du créneau de vérification : les appels rapprochés ne déclenchent rien.
  const slot = await prisma.payment.updateMany({
    where: { id: payment.id, OR: [{ lastCheckedAt: null }, { lastCheckedAt: { lt: new Date(Date.now() - CHECK_INTERVAL_MS) } }] },
    data: { lastCheckedAt: new Date() },
  });
  if (!slot.count && source !== "demo") return payment;
  let verified: VerifiedPayment;
  try {
    verified = await provider.verify(payment.providerRef);
  } catch (e) {
    await event(payment.id, "CHECK", { source, error: e instanceof Error ? e.message : String(e) });
    return payment;
  }
  await event(payment.id, "CHECK", { source, status: verified.status, raw: verified.raw ?? null });
  if (verified.status === "SUCCEEDED") {
    // Garde-fou strict : montant et devise confirmés par le prestataire, sinon pas de livraison.
    const amountOk = typeof verified.amount === "number" && Number.isFinite(verified.amount) && verified.amount >= payment.amount;
    const currencyOk = verified.currency === payment.currency;
    if (!amountOk || !currencyOk) {
      await prisma.payment.updateMany({ where: { id: payment.id, status: { in: ["PENDING", "CANCELLED"] } }, data: { status: "FAILED", failureReason: "Montant ou devise non confirmés par le prestataire : vérification manuelle nécessaire" } });
      await audit({ organizationId: payment.organizationId, action: "payment.amount_mismatch", entityType: "payment", entityId: payment.id, metadata: { expected: payment.amount, got: verified.amount ?? null, currency: verified.currency ?? null } });
    } else {
      await fulfill(payment, verified.method);
    }
  } else if (verified.status === "FAILED" && payment.status === "PENDING") {
    await prisma.payment.updateMany({ where: { id: payment.id, status: "PENDING" }, data: { status: "FAILED", failureReason: (verified.reason ?? "Paiement refusé").slice(0, 300), method: verified.method } });
  }
  return prisma.payment.findUniqueOrThrow({ where: { id: payment.id } });
}

/** Mois restants (fractionnaires) d'une période payée, à leur valeur en FCFA. */
function remainingValue(planCode: Exclude<PlanCode, "FREE">, paidUntil: Date, now: Date) {
  const days = Math.max(0, (paidUntil.getTime() - now.getTime()) / 864e5);
  return (days / 30) * PLANS[planCode].monthlyPriceXof;
}

/**
 * Livraison en une seule transaction : statut payé, crédits et abonnement sont appliqués ensemble ou pas du tout.
 * Une seule livraison possible, même si webhook, retour navigateur et balayage arrivent ensemble.
 */
async function fulfill(payment: Payment, method?: string) {
  const now = new Date();
  const delivered = await prisma.$transaction(async (tx) => {
    const won = await tx.payment.updateMany({ where: { id: payment.id, status: { in: ["PENDING", "CANCELLED"] } }, data: { status: "SUCCEEDED", paidAt: now, method: method ?? null, failureReason: null } });
    if (!won.count) return false;
    if (payment.kind === "CREDITS") {
      await ledger.creditInTx(tx, { organizationId: payment.organizationId, amount: payment.credits, reason: `Achat de ${payment.credits} crédits`, idempotencyKey: `payment:${payment.id}`, refType: "payment", refId: payment.id }, "PURCHASE");
    } else {
      const plan = payment.planCode as Exclude<PlanCode, "FREE">;
      await tx.$queryRaw`SELECT 1 FROM "Subscription" WHERE "organizationId" = ${payment.organizationId} FOR UPDATE`;
      const sub = await tx.subscription.findUniqueOrThrow({ where: { organizationId: payment.organizationId } });
      const active = sub.planCode !== "FREE" && sub.paidUntil && sub.paidUntil > now;
      if (active && sub.planCode === plan) {
        await tx.subscription.update({ where: { id: sub.id }, data: { paidUntil: addMonths(sub.paidUntil!, payment.months), status: "ACTIVE" } });
      } else {
        // Changement de plan : la période déjà payée de l'ancien plan est convertie au prorata en jours du nouveau plan.
        const carriedDays = active ? Math.floor(remainingValue(sub.planCode as Exclude<PlanCode, "FREE">, sub.paidUntil!, now) / (PLANS[plan].monthlyPriceXof / 30)) : 0;
        const paidUntil = new Date(addMonths(now, payment.months).getTime() + carriedDays * 864e5);
        await tx.subscription.update({ where: { id: sub.id }, data: { planCode: plan, status: "ACTIVE", currentPeriodStart: now, currentPeriodEnd: addMonths(now), paidUntil } });
        await ledger.creditInTx(tx, { organizationId: payment.organizationId, amount: PLANS[plan].monthlyCredits, reason: `Abonnement ${PLANS[plan].name} activé`, idempotencyKey: `payment:${payment.id}`, refType: "payment", refId: payment.id }, "GRANT");
      }
    }
    await tx.paymentEvent.create({ data: { paymentId: payment.id, type: "FULFILLED", payload: { method: method ?? null } } });
    await audit({ organizationId: payment.organizationId, actorId: payment.createdById, action: "payment.succeeded", entityType: "payment", entityId: payment.id, metadata: { amount: payment.amount, kind: payment.kind, planCode: payment.planCode, credits: payment.credits, provider: payment.provider } }, tx);
    return true;
  });
  if (delivered) {
    if (payment.kind === "SUBSCRIPTION") await enforceWorkspaceLimit(payment.organizationId);
    await sendReceipt(payment, now, method).catch(() => undefined);
  }
}

async function sendReceipt(payment: Payment, paidAt: Date, method?: string) {
  if (!payment.createdById) return;
  const user = await prisma.user.findUnique({ where: { id: payment.createdById } });
  if (!user) return;
  const amount = new Intl.NumberFormat("fr-FR").format(payment.amount).replace(/ /g, " ");
  const mail = layout("Paiement confirmé — merci !", [
    `Bonjour ${user.name},`,
    `Nous avons bien reçu votre paiement de ${amount} FCFA${method ? ` (${method})` : ""} le ${paidAt.toLocaleDateString("fr-FR")}.`,
    payment.kind === "SUBSCRIPTION" ? `Votre plan ${PLANS[payment.planCode!].name} est actif pour ${payment.months} mois.` : `${payment.credits} crédits ont été ajoutés à votre compte.`,
    `Référence : ${payment.providerRef}`,
  ], { label: "Voir ma facturation", url: `${loadConfig().APP_URL}/settings?tab=billing` });
  await sendEmail({ to: user.email, subject: "Reçu de paiement Forlife Com", template: "payment.receipt", ...mail });
}

/** Filet de sécurité : re-vérifie les paiements en attente (webhook perdu) et expire les plus anciens. */
export async function sweepPendingPayments(now = new Date()): Promise<number> {
  const expired = await prisma.payment.findMany({ where: { status: "PENDING", createdAt: { lt: new Date(now.getTime() - 48 * 3600e3) } }, select: { id: true }, take: 200 });
  for (const p of expired) {
    const r = await reconcile(p.id, "sweep");
    if (r.status === "PENDING") {
      await prisma.payment.updateMany({ where: { id: p.id, status: "PENDING" }, data: { status: "CANCELLED", failureReason: "Paiement non finalisé sous 48 h" } });
      await event(p.id, "EXPIRED");
    }
  }
  const pending = await prisma.payment.findMany({ where: { status: "PENDING", provider: { not: "sandbox" }, createdAt: { lt: new Date(now.getTime() - 2 * 60e3), gte: new Date(now.getTime() - 48 * 3600e3) } }, select: { id: true }, take: 100 });
  for (const p of pending) await reconcile(p.id, "sweep");
  // Paiements expirés depuis moins de 7 jours : un encaissement tardif chez le prestataire est quand même livré (1 vérification / heure).
  const late = await prisma.payment.findMany({ where: { status: "CANCELLED", provider: { not: "sandbox" }, createdAt: { gte: new Date(now.getTime() - 7 * 864e5) }, OR: [{ lastCheckedAt: null }, { lastCheckedAt: { lt: new Date(now.getTime() - 3600e3) } }] }, select: { id: true }, take: 50 });
  for (const p of late) await reconcile(p.id, "sweep-late", { allowCancelled: true });
  return expired.length + pending.length + late.length;
}
