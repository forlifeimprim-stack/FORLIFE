import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { BILLING_PERIODS, CREDIT_PACKS, PLAN_CODES, PLANS, subscriptionPrice, type PlanCode } from "@forlife/shared";
import { prisma } from "../../lib/prisma.js";
import { notFound } from "../../lib/errors.js";
import { parse } from "../../lib/validation.js";
import { audit } from "../../lib/audit.js";
import { auditCtx, authenticate, requireOrg } from "../../plugins/auth.js";
import { paymentProviders, verifyDemoToken } from "./providers.js";
import { createPayment, describe, reconcile } from "./service.js";

const orgParams = z.object({ orgId: z.string() });
const paidPlans = PLAN_CODES.filter((p) => p !== "FREE") as [Exclude<PlanCode, "FREE">, ...Exclude<PlanCode, "FREE">[]];
const packs = Object.keys(CREDIT_PACKS) as [keyof typeof CREDIT_PACKS, ...(keyof typeof CREDIT_PACKS)[]];
const publicView = (p: { id: string; kind: string; planCode: PlanCode | null; months: number; packCode: string | null; credits: number; amount: number; currency: string; status: string; provider: string; providerRef: string; method: string | null; failureReason: string | null; createdAt: Date; paidAt: Date | null; checkoutUrl: string | null }) => ({
  id: p.id,
  kind: p.kind,
  planCode: p.planCode,
  months: p.months,
  packCode: p.packCode,
  credits: p.credits,
  amount: p.amount,
  currency: p.currency,
  status: p.status,
  provider: p.provider,
  reference: p.providerRef,
  method: p.method,
  failureReason: p.failureReason,
  createdAt: p.createdAt,
  paidAt: p.paidAt,
  checkoutUrl: p.status === "PENDING" ? p.checkoutUrl : null,
  label: describe(p),
});

export async function paymentRoutes(app: FastifyInstance) {
  // Notifications CinetPay (formulaire URL-encodé) : analyseur limité à ce plugin, jamais aux routes d'authentification.
  app.addContentTypeParser("application/x-www-form-urlencoded", { parseAs: "string", bodyLimit: 16 * 1024 }, (_req, body, done) => {
    done(null, Object.fromEntries(new URLSearchParams(body as string)));
  });

  /** Offres et moyens de paiement disponibles. */
  app.get("/api/orgs/:orgId/billing/offers", { preHandler: authenticate }, async (req) => {
    const { orgId } = parse(orgParams, req.params);
    await requireOrg(req, orgId, "billing:read");
    const providers = paymentProviders();
    return {
      plans: paidPlans.map((code) => ({ ...PLANS[code], prices: Object.values(BILLING_PERIODS).map((b) => ({ months: b.months, label: b.label, amount: subscriptionPrice(code, b.months) })) })),
      packs: Object.values(CREDIT_PACKS),
      providers: Object.values(providers).map((p) => ({ key: p!.key, label: p!.label })),
    };
  });

  app.get("/api/orgs/:orgId/payments", { preHandler: authenticate }, async (req) => {
    const { orgId } = parse(orgParams, req.params);
    await requireOrg(req, orgId, "billing:read");
    const rows = await prisma.payment.findMany({ where: { organizationId: orgId }, orderBy: { createdAt: "desc" }, take: 50 });
    return rows.map(publicView);
  });

  app.post("/api/orgs/:orgId/payments", { preHandler: authenticate }, async (req, reply) => {
    const { orgId } = parse(orgParams, req.params);
    const ctx = await requireOrg(req, orgId, "billing:manage");
    const body = parse(
      z.object({
        requestId: z.uuid(),
        provider: z.enum(["cinetpay", "sandbox"]),
        purchase: z.discriminatedUnion("kind", [
          z.object({ kind: z.literal("SUBSCRIPTION"), planCode: z.enum(paidPlans), months: z.union([z.literal(1), z.literal(3), z.literal(12)]).default(1) }),
          z.object({ kind: z.literal("CREDITS"), packCode: z.enum(packs) }),
        ]),
      }),
      req.body,
    );
    const user = await prisma.user.findUniqueOrThrow({ where: { id: ctx.userId } });
    const payment = await createPayment({ organizationId: orgId, userId: ctx.userId, email: user.email, name: user.name, provider: body.provider, requestId: body.requestId, purchase: body.purchase });
    await audit({ ...auditCtx(ctx), action: "payment.created", entityType: "payment", entityId: payment.id, metadata: { amount: payment.amount, provider: payment.provider } });
    reply.code(201);
    return publicView(payment);
  });

  /** Retour du client après paiement : on re-vérifie auprès du prestataire avant de répondre. */
  app.get("/api/orgs/:orgId/payments/:id", { preHandler: authenticate }, async (req) => {
    const { orgId, id } = parse(z.object({ orgId: z.string(), id: z.string() }), req.params);
    await requireOrg(req, orgId, "billing:read");
    const p = await prisma.payment.findFirst({ where: { id, organizationId: orgId } });
    if (!p) throw notFound("Paiement");
    return publicView(p.status === "PENDING" ? await reconcile(p.id, "return") : p);
  });

  /** Notification CinetPay : jamais crue sur parole, toujours confirmée par l'API de vérification. */
  app.post("/api/public/payments/cinetpay/notify", { config: { rateLimit: { max: 120, timeWindow: "1 minute" } } }, async (req, reply) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const ref = typeof body.cpm_trans_id === "string" ? body.cpm_trans_id.slice(0, 64) : null;
    if (ref) {
      const p = await prisma.payment.findUnique({ where: { providerRef: ref } });
      // Seul un paiement en attente déclenche une vérification (elle-même limitée à une toutes les 10 s).
      if (p && p.status === "PENDING" && p.provider === "cinetpay") await reconcile(p.id, "notify");
    }
    return reply.code(200).send({ ok: true });
  });

  // ───── Paiement de démonstration (aucun argent réel) : jeton dans le corps, jamais dans l'URL ─────
  const demoBody = z.object({ id: z.string().max(40), t: z.string().max(64) });

  app.post("/api/public/payments/demo/lookup", async (req) => {
    const { id, t } = parse(demoBody, req.body);
    if (!paymentProviders().sandbox || !verifyDemoToken(id, t)) throw notFound("Paiement");
    const p = await prisma.payment.findUnique({ where: { id }, include: { organization: { select: { name: true } } } });
    if (!p || p.provider !== "sandbox") throw notFound("Paiement");
    return { id: p.id, label: describe(p), amount: p.amount, currency: p.currency, status: p.status, reference: p.providerRef, organization: p.organization.name };
  });

  app.post("/api/public/payments/demo/pay", async (req) => {
    const body = parse(demoBody.extend({ outcome: z.enum(["success", "failure"]), method: z.enum(["ORANGE_MONEY", "MTN_MOMO", "MOOV_MONEY", "WAVE", "CARD"]) }), req.body);
    if (!paymentProviders().sandbox || !verifyDemoToken(body.id, body.t)) throw notFound("Paiement");
    const p = await prisma.payment.findUnique({ where: { id: body.id } });
    if (!p || p.provider !== "sandbox") throw notFound("Paiement");
    if (p.status === "PENDING") await prisma.paymentEvent.create({ data: { paymentId: p.id, type: "DEMO", payload: { outcome: body.outcome, method: body.method } } });
    const r = await reconcile(p.id, "demo");
    return { status: r.status };
  });
}
