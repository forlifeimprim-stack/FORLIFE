import { describe, expect, it } from "vitest";
import { drainQueue } from "../src/modules/jobs/queue.js";
import { ledger } from "../src/modules/billing/ledger.js";
import { addMember, auth, getApp, prisma, signup, type TestAccount } from "./helpers.js";

async function newLead(acc: TestAccount, phone = "07 49 56 70 82", extra: Record<string, unknown> = {}) {
  const app = await getApp();
  const res = await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/crm/leads`, headers: auth(acc), payload: { contact: { name: "Koffi Yao", phone, consentWhatsApp: true }, source: "WHATSAPP", title: "Devis bâche 3×2", ...extra } });
  expect(res.statusCode).toBe(201);
  return res.json();
}

describe("CRM", () => {
  it("normalise le téléphone, dédoublonne le contact et explique le score", async () => {
    const acc = await signup();
    const a = await newLead(acc, "07 49 56 70 82");
    const b = await newLead(acc, "+225 0749567082");
    expect(a.contact.phone).toBe("+2250749567082");
    expect(b.contactId).toBe(a.contactId);
    expect(a.score).toBeGreaterThan(0);
    expect(a.scoreReasons.length).toBeGreaterThan(0);
  });

  it("fait avancer le pipeline avec historique, exige une raison de perte et protège des écrasements", async () => {
    const acc = await signup();
    const app = await getApp();
    const lead = await newLead(acc);
    const url = `/api/workspaces/${acc.workspaceId}/crm/leads/${lead.id}`;
    const lost = await app.inject({ method: "PATCH", url, headers: auth(acc), payload: { revision: lead.revision, stage: "LOST" } });
    expect(lost.statusCode).toBe(400);
    const won = await app.inject({ method: "PATCH", url, headers: auth(acc), payload: { revision: lead.revision, stage: "WON", valueAmount: 75000 } });
    expect(won.json().wonAt).toBeTruthy();
    const stale = await app.inject({ method: "PATCH", url, headers: auth(acc), payload: { revision: lead.revision, title: "écrasement" } });
    expect(stale.statusCode).toBe(409);
    const detail = (await app.inject({ method: "GET", url, headers: auth(acc) })).json();
    expect(detail.activities.some((x: { type: string }) => x.type === "STAGE_CHANGE")).toBe(true);
    const pipeline = (await app.inject({ method: "GET", url: `/api/workspaces/${acc.workspaceId}/crm/pipeline`, headers: auth(acc) })).json();
    expect(pipeline.stats.wonLast30.value).toBe(75000);
  });

  it("propose des relances WhatsApp et facture les crédits", async () => {
    const acc = await signup();
    const app = await getApp();
    const lead = await newLead(acc);
    const res = await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/crm/leads/${lead.id}/followup`, headers: auth(acc) });
    await drainQueue();
    const job = (await app.inject({ method: "GET", url: `/api/workspaces/${acc.workspaceId}/jobs/${res.json().jobId}`, headers: auth(acc) })).json();
    expect(job.result.messages).toHaveLength(3);
    expect(job.result.phone).toBe("+2250749567082");
    expect((await prisma.creditWallet.findUniqueOrThrow({ where: { organizationId: acc.organizationId } })).balance).toBe(197);
  });

  it("restreint le CRM aux rôles autorisés", async () => {
    const owner = await signup();
    const viewer = await addMember(owner, "VIEWER");
    const app = await getApp();
    expect((await app.inject({ method: "GET", url: `/api/workspaces/${owner.workspaceId}/crm/pipeline`, headers: auth(viewer) })).statusCode).toBe(403);
  });

  it("capte des leads via un formulaire public, avec consentement et anti-spam", async () => {
    const acc = await signup();
    const app = await getApp();
    const camp = (await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/campaigns`, headers: auth(acc), payload: { name: "Liste d'attente lancement", objective: "LEADS" } })).json();
    const form = (await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/crm/forms`, headers: auth(acc), payload: { title: "Je veux être parmi les premiers", campaignId: camp.id } })).json();
    expect((await app.inject({ method: "GET", url: `/api/public/forms/${form.slug}` })).json().title).toBe("Je veux être parmi les premiers");
    const noConsent = await app.inject({ method: "POST", url: `/api/public/forms/${form.slug}`, remoteAddress: "10.9.0.1", payload: { name: "Ama", phone: "0585801856" } });
    expect(noConsent.statusCode).toBe(400);
    const bot = await app.inject({ method: "POST", url: `/api/public/forms/${form.slug}`, remoteAddress: "10.9.0.2", payload: { name: "Bot", phone: "0585801856", consentWhatsApp: true, website: "spam.com" } });
    expect(bot.statusCode).toBe(400);
    const ok = await app.inject({ method: "POST", url: `/api/public/forms/${form.slug}`, remoteAddress: "10.9.0.3", payload: { name: "Ama Kouassi", phone: "05 85 80 18 56", consentWhatsApp: true, message: "JE VEUX" } });
    expect(ok.statusCode).toBe(200);
    const lead = await prisma.lead.findFirstOrThrow({ where: { workspaceId: acc.workspaceId }, include: { contact: true } });
    expect(lead.source).toBe("FORM");
    expect(lead.campaignId).toBe(camp.id);
    expect(lead.contact.consentWhatsApp).toBe(true);
    await app.inject({ method: "PATCH", url: `/api/workspaces/${acc.workspaceId}/crm/forms/${form.id}`, headers: auth(acc), payload: { active: false } });
    expect((await app.inject({ method: "GET", url: `/api/public/forms/${form.slug}` })).statusCode).toBe(404);
  });
});

describe("Campagnes", () => {
  it("l'activation exige l'approbation d'un responsable", async () => {
    const owner = await signup();
    const editor = await addMember(owner, "EDITOR");
    const app = await getApp();
    const c = (await app.inject({ method: "POST", url: `/api/workspaces/${owner.workspaceId}/campaigns`, headers: auth(editor), payload: { name: "Rentrée", objective: "SALES", budgetAmount: 50000 } })).json();
    expect((await app.inject({ method: "POST", url: `/api/workspaces/${owner.workspaceId}/campaigns/${c.id}/status`, headers: auth(editor), payload: { status: "ACTIVE" } })).statusCode).toBe(403);
    expect((await app.inject({ method: "POST", url: `/api/workspaces/${owner.workspaceId}/campaigns/${c.id}/status`, headers: auth(owner), payload: { status: "ACTIVE" } })).statusCode).toBe(200);
    expect((await app.inject({ method: "POST", url: `/api/workspaces/${owner.workspaceId}/campaigns/${c.id}/status`, headers: auth(owner), payload: { status: "DRAFT" } })).statusCode).toBe(400);
  });

  it("génère un pack de contenus rattachés à la campagne et calcule le coût par lead", async () => {
    const acc = await signup();
    const app = await getApp();
    const c = (await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/campaigns`, headers: auth(acc), payload: { name: "Nouvelle collection", objective: "SALES", budgetAmount: 30000, channels: ["FACEBOOK", "WHATSAPP"], offer: "-10 % la première semaine" } })).json();
    const res = await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/campaigns/${c.id}/pack`, headers: auth(acc), payload: { count: 3 } });
    expect(res.json().estimatedCredits).toBe(38);
    await drainQueue();
    const contents = await prisma.contentItem.findMany({ where: { campaignId: c.id }, include: { variants: true } });
    expect(contents).toHaveLength(3);
    expect(contents.every((x) => x.status === "DRAFT" && x.variants.length === 2)).toBe(true);
    await newLead(acc, "0700000001", { campaignId: c.id });
    await newLead(acc, "0700000002", { campaignId: c.id });
    const detail = (await app.inject({ method: "GET", url: `/api/workspaces/${acc.workspaceId}/campaigns/${c.id}`, headers: auth(acc) })).json();
    expect(detail.results.leads).toBe(2);
    expect(detail.results.costPerLead).toBe(15000);
  });

  it("refuse un pack si les crédits ne suffisent pas", async () => {
    const acc = await signup();
    const app = await getApp();
    await ledger.consume({ organizationId: acc.organizationId, amount: 190, reason: "test", idempotencyKey: `drain-pack-${acc.organizationId}` });
    const c = (await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/campaigns`, headers: auth(acc), payload: { name: "Test pack", objective: "LEADS" } })).json();
    expect((await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/campaigns/${c.id}/pack`, headers: auth(acc), payload: { count: 2 } })).statusCode).toBe(402);
  });
});
