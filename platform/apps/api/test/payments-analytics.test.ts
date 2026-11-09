import { randomUUID } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import { subscriptionPrice } from "@forlife/shared";
import { CinetPayProvider, demoToken, setPaymentProviders, type PaymentProvider } from "../src/modules/payments/providers.js";
import { sweepPendingPayments } from "../src/modules/payments/service.js";
import { renewDueSubscriptions } from "../src/modules/billing/ledger.js";
import { testMailbox } from "../src/modules/mail/mailer.js";
import { addMember, auth, getApp, prisma, signup, type TestAccount } from "./helpers.js";

afterEach(() => setPaymentProviders(undefined));

const balance = async (orgId: string) => (await prisma.creditWallet.findUniqueOrThrow({ where: { organizationId: orgId } })).balance;

async function buy(acc: TestAccount, purchase: Record<string, unknown>, provider = "sandbox", requestId = randomUUID()) {
  const app = await getApp();
  return app.inject({ method: "POST", url: `/api/orgs/${acc.organizationId}/payments`, headers: auth(acc), payload: { requestId, provider, purchase } });
}

async function payDemo(paymentId: string, outcome: "success" | "failure" = "success") {
  const app = await getApp();
  return app.inject({ method: "POST", url: "/api/public/payments/demo/pay", payload: { id: paymentId, t: demoToken(paymentId), outcome, method: "ORANGE_MONEY" } });
}

/** Faux CinetPay : contrôle de ce que renvoie l'API de vérification. */
function fakeCinetPay(state: { status: string; amount: number }) {
  const calls: { url: string; body: Record<string, unknown> }[] = [];
  const fetchImpl = (async (url: string, init: RequestInit) => {
    const body = JSON.parse(String(init.body));
    calls.push({ url, body });
    if (url.endsWith("/payment")) return new Response(JSON.stringify({ code: "201", message: "CREATED", data: { payment_url: `https://checkout.cinetpay.test/${body.transaction_id}` } }));
    return new Response(JSON.stringify({ code: state.status === "ACCEPTED" ? "00" : "662", message: "x", data: { status: state.status, amount: String(state.amount), currency: "XOF", payment_method: "OMCIV2" } }));
  }) as unknown as typeof fetch;
  return { provider: new CinetPayProvider("key", "site", "https://api.test/v2", fetchImpl), calls };
}

describe("Paiements", () => {
  it("achète un pack de crédits en démo : livraison unique, reçu envoyé", async () => {
    const acc = await signup();
    const res = await buy(acc, { kind: "CREDITS", packCode: "PACK_500" });
    expect(res.statusCode).toBe(201);
    const p = res.json();
    expect(p.amount).toBe(5000);
    expect(p.checkoutUrl).toContain(`/pay/demo/${p.id}`);
    // Page publique : un mauvais jeton ne donne rien
    const app = await getApp();
    expect((await app.inject({ method: "POST", url: "/api/public/payments/demo/lookup", payload: { id: p.id, t: "faux" } })).statusCode).toBe(404);
    expect((await app.inject({ method: "POST", url: "/api/public/payments/demo/lookup", payload: { id: p.id, t: demoToken(p.id) } })).json().amount).toBe(5000);
    expect((await payDemo(p.id)).json().status).toBe("SUCCEEDED");
    await payDemo(p.id); // rejeu
    expect(await balance(acc.organizationId)).toBe(200 + 500);
    const tx = await prisma.creditTransaction.findMany({ where: { organizationId: acc.organizationId, kind: "PURCHASE" } });
    expect(tx).toHaveLength(1);
    expect(testMailbox.some((m) => m.to === acc.email && m.template === "payment.receipt")).toBe(true);
  });

  it("le double clic ne crée qu'un paiement ; un refus ne livre rien", async () => {
    const acc = await signup();
    const rid = randomUUID();
    const a = (await buy(acc, { kind: "CREDITS", packCode: "PACK_2000" }, "sandbox", rid)).json();
    const b = (await buy(acc, { kind: "CREDITS", packCode: "PACK_2000" }, "sandbox", rid)).json();
    expect(a.id).toBe(b.id);
    expect((await payDemo(a.id, "failure")).json().status).toBe("FAILED");
    expect(await balance(acc.organizationId)).toBe(200);
  });

  it("active un abonnement payé d'avance puis le prolonge", async () => {
    const acc = await signup();
    const p = (await buy(acc, { kind: "SUBSCRIPTION", planCode: "STARTER", months: 3 })).json();
    expect(p.amount).toBe(subscriptionPrice("STARTER", 3));
    expect(p.amount % 5).toBe(0);
    await payDemo(p.id);
    let sub = await prisma.subscription.findUniqueOrThrow({ where: { organizationId: acc.organizationId } });
    expect(sub.planCode).toBe("STARTER");
    const months = (sub.paidUntil!.getTime() - Date.now()) / (30 * 864e5);
    expect(months).toBeGreaterThan(2.8);
    expect(await balance(acc.organizationId)).toBe(200 + 1500);
    // Prolongation : même plan → date repoussée, pas de nouvelle allocation immédiate
    const before = sub.paidUntil!;
    const p2 = (await buy(acc, { kind: "SUBSCRIPTION", planCode: "STARTER", months: 1 })).json();
    await payDemo(p2.id);
    sub = await prisma.subscription.findUniqueOrThrow({ where: { organizationId: acc.organizationId } });
    expect(sub.paidUntil!.getTime()).toBeGreaterThan(before.getTime() + 27 * 864e5);
    expect(await balance(acc.organizationId)).toBe(200 + 1500);
  });

  it("changer de plan conserve au prorata la période déjà payée", async () => {
    const acc = await signup();
    const p = (await buy(acc, { kind: "SUBSCRIPTION", planCode: "STARTER", months: 12 })).json();
    await payDemo(p.id);
    const up = (await buy(acc, { kind: "SUBSCRIPTION", planCode: "PRO", months: 1 })).json();
    await payDemo(up.id);
    const sub = await prisma.subscription.findUniqueOrThrow({ where: { organizationId: acc.organizationId } });
    expect(sub.planCode).toBe("PRO");
    // ~12 mois Starter (15 000) ≈ 180 000 FCFA ≈ 57 jours de Pro (95 000 / mois), en plus du mois payé.
    const days = (sub.paidUntil!.getTime() - Date.now()) / 864e5;
    expect(days).toBeGreaterThan(80);
    expect(days).toBeLessThan(95);
  });

  it("un plan non renouvelé repasse en Free à l'échéance", async () => {
    const acc = await signup();
    const p = (await buy(acc, { kind: "SUBSCRIPTION", planCode: "BUSINESS", months: 1 })).json();
    await payDemo(p.id);
    // On simule deux mois écoulés
    const sub = await prisma.subscription.findUniqueOrThrow({ where: { organizationId: acc.organizationId } });
    await prisma.subscription.update({ where: { id: sub.id }, data: { currentPeriodEnd: new Date(Date.now() - 1000), paidUntil: new Date(Date.now() - 1000) } });
    await renewDueSubscriptions();
    const after = await prisma.subscription.findUniqueOrThrow({ where: { organizationId: acc.organizationId } });
    expect(after.planCode).toBe("FREE");
    expect(testMailbox.some((m) => m.to === acc.email && m.template === "subscription.expired")).toBe(true);
  });

  it("à l'expiration, les espaces au-delà du plan passent en lecture seule, puis sont débloqués au réabonnement", async () => {
    const acc = await signup();
    const app = await getApp();
    const p = (await buy(acc, { kind: "SUBSCRIPTION", planCode: "BUSINESS", months: 1 })).json();
    await payDemo(p.id);
    const ws2 = (await app.inject({ method: "POST", url: `/api/orgs/${acc.organizationId}/workspaces`, headers: auth(acc), payload: { name: "Client B" } })).json();
    const sub = await prisma.subscription.findUniqueOrThrow({ where: { organizationId: acc.organizationId } });
    await prisma.subscription.update({ where: { id: sub.id }, data: { currentPeriodEnd: new Date(Date.now() - 1000), paidUntil: new Date(Date.now() - 1000) } });
    await renewDueSubscriptions();
    expect((await prisma.workspace.findUniqueOrThrow({ where: { id: ws2.id } })).status).toBe("LOCKED");
    expect((await app.inject({ method: "GET", url: `/api/workspaces/${ws2.id}/contents`, headers: auth(acc) })).statusCode).toBe(200);
    expect((await app.inject({ method: "POST", url: `/api/workspaces/${ws2.id}/contents`, headers: auth(acc), payload: { title: "Bloqué" } })).statusCode).toBe(403);
    expect((await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/contents`, headers: auth(acc), payload: { title: "Autorisé" } })).statusCode).toBe(201);
    const again = (await buy(acc, { kind: "SUBSCRIPTION", planCode: "BUSINESS", months: 1 })).json();
    await payDemo(again.id);
    expect((await prisma.workspace.findUniqueOrThrow({ where: { id: ws2.id } })).status).toBe("ACTIVE");
  });

  it("CinetPay : le webhook déclenche une vérification, le montant est contrôlé", async () => {
    const state = { status: "PENDING", amount: 18000 };
    const { provider, calls } = fakeCinetPay(state);
    setPaymentProviders({ cinetpay: provider as PaymentProvider });
    const acc = await signup();
    const p = (await buy(acc, { kind: "CREDITS", packCode: "PACK_2000" }, "cinetpay")).json();
    expect(p.checkoutUrl).toMatch(/^https:\/\/checkout\.cinetpay\.test\//);
    const created = calls[0]!.body;
    expect(created.amount).toBe(18000);
    expect(String(created.description)).not.toMatch(/[éè#&]/);
    const app = await getApp();
    // Notification alors que le paiement est encore en attente : rien n'est livré
    const notify = (ref: string) => app.inject({ method: "POST", url: "/api/public/payments/cinetpay/notify", headers: { "content-type": "application/x-www-form-urlencoded" }, payload: `cpm_trans_id=${ref}&cpm_site_id=site` });
    expect((await notify(p.reference)).statusCode).toBe(200);
    expect(await balance(acc.organizationId)).toBe(200);
    // Inondation du webhook : une seule vérification auprès du prestataire toutes les 10 secondes.
    const checks = calls.length;
    for (let i = 0; i < 5; i++) await notify(p.reference);
    expect(calls.length).toBe(checks);
    state.status = "ACCEPTED";
    await prisma.payment.update({ where: { id: p.id }, data: { lastCheckedAt: new Date(Date.now() - 60_000) } });
    await notify(p.reference);
    await prisma.payment.update({ where: { id: p.id }, data: { lastCheckedAt: new Date(Date.now() - 60_000) } });
    await notify(p.reference);
    expect(await balance(acc.organizationId)).toBe(2200);
    expect(await prisma.creditTransaction.count({ where: { organizationId: acc.organizationId, kind: "PURCHASE" } })).toBe(1);
    // Montant falsifié : refusé
    const p2 = (await buy(acc, { kind: "CREDITS", packCode: "PACK_6000" }, "cinetpay")).json();
    state.amount = 100;
    await notify(p2.reference);
    const res = await app.inject({ method: "GET", url: `/api/orgs/${acc.organizationId}/payments/${p2.id}`, headers: auth(acc) });
    expect(res.json().status).toBe("FAILED");
    expect(await balance(acc.organizationId)).toBe(2200);
  });

  it("expire les paiements abandonnés après 48 h", async () => {
    const acc = await signup();
    const p = (await buy(acc, { kind: "CREDITS", packCode: "PACK_500" })).json();
    await prisma.payment.update({ where: { id: p.id }, data: { createdAt: new Date(Date.now() - 49 * 3600e3) } });
    await sweepPendingPayments();
    expect((await prisma.payment.findUniqueOrThrow({ where: { id: p.id } })).status).toBe("CANCELLED");
  });

  it("seuls les rôles autorisés paient ; isolation entre organisations", async () => {
    const owner = await signup();
    const editor = await addMember(owner, "EDITOR");
    expect((await buy(editor, { kind: "CREDITS", packCode: "PACK_500" })).statusCode).toBe(403);
    const p = (await buy(owner, { kind: "CREDITS", packCode: "PACK_500" })).json();
    const other = await signup();
    const app = await getApp();
    expect((await app.inject({ method: "GET", url: `/api/orgs/${other.organizationId}/payments/${p.id}`, headers: auth(other) })).statusCode).toBe(404);
  });
});

describe("Analytics & ROI", () => {
  it("calcule entonnoir, ROI de campagne et export CSV sans mélanger réel et simulé", async () => {
    const acc = await signup();
    const app = await getApp();
    const camp = (await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/campaigns`, headers: auth(acc), payload: { name: "=Rentrée", objective: "SALES", budgetAmount: 50000 } })).json();
    const mk = async (phone: string, source: string) =>
      (await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/crm/leads`, headers: auth(acc), payload: { contact: { name: "Client", phone }, source, title: "Devis", campaignId: camp.id } })).json();
    const l1 = await mk("+2250700000001", "WHATSAPP");
    await mk("+2250700000002", "WHATSAPP");
    await mk("+2250700000003", "FORM");
    const won = await app.inject({ method: "PATCH", url: `/api/workspaces/${acc.workspaceId}/crm/leads/${l1.id}`, headers: auth(acc), payload: { revision: l1.revision, stage: "WON", valueAmount: 150000 } });
    expect(won.statusCode).toBe(200);

    const res = await app.inject({ method: "GET", url: `/api/workspaces/${acc.workspaceId}/analytics?days=30`, headers: auth(acc) });
    expect(res.statusCode).toBe(200);
    const a = res.json();
    expect(a.sales.newLeads).toBe(3);
    expect(a.sales.won).toBe(1);
    expect(a.sales.revenue).toBe(150000);
    const c = a.campaigns.find((x: { id: string }) => x.id === camp.id);
    expect(c.leads).toBe(3);
    expect(c.costPerLead).toBe(16667);
    expect(c.roi).toBe(200);
    expect(a.sales.sources[0].source).toBe("WHATSAPP");
    expect(a.audience.real.impressions).toBe(0);

    const csv = await app.inject({ method: "GET", url: `/api/workspaces/${acc.workspaceId}/analytics/report.csv?days=30`, headers: auth(acc) });
    expect(csv.headers["content-type"]).toContain("text/csv");
    expect(csv.body).toContain("'=Rentrée"); // formule neutralisée
    expect(csv.body).toContain("150000");

    // Un rôle sans accès CRM ne voit pas les ventes
    const viewer = await addMember(acc, "VIEWER");
    const v = (await app.inject({ method: "GET", url: `/api/workspaces/${acc.workspaceId}/analytics`, headers: auth(viewer) })).json();
    expect(v.sales).toBeNull();
    expect(v.campaigns[0].roi).toBeNull();
    // Accueil : bloc ventes
    const home = (await app.inject({ method: "GET", url: `/api/workspaces/${acc.workspaceId}/dashboard`, headers: auth(acc) })).json();
    expect(home.sales.newLeads7d).toBe(3);
    expect(home.sales.revenueThisMonth).toBe(150000);
  });
});
