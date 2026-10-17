import { describe, expect, it } from "vitest";
import { drainQueue } from "../src/modules/jobs/queue.js";
import { purgeDueOrganizations } from "../src/modules/governance/data.js";
import { addMember, auth, getApp, prisma, signup, type TestAccount } from "./helpers.js";

const DAY = 86_400_000;

/** Remplit un espace avec des données de chaque module (contenus, CRM, réseaux, stratégie IA). */
async function fill(acc: TestAccount) {
  const app = await getApp();
  const w = acc.workspaceId;
  const contact = await prisma.contact.create({ data: { workspaceId: w, name: "Koffi Client", phone: "+2250700000001" } });
  await prisma.lead.create({ data: { workspaceId: w, contactId: contact.id, title: "Devis cartes", activities: { create: [{ workspaceId: w, type: "NOTE", body: "Appelé" }] } } });
  const item = await prisma.contentItem.create({ data: { workspaceId: w, title: "Post", body: "Promo", status: "APPROVED", approvedVersion: 1 } });
  const variant = await prisma.contentVariant.create({ data: { contentId: item.id, channel: "FACEBOOK", body: "Promo" } });
  const account = await prisma.socialAccount.create({ data: { workspaceId: w, provider: "SANDBOX", externalId: "sandbox-page", name: "Page", credential: { create: { accessTokenEnc: "chiffre" } } } });
  await prisma.publication.create({ data: { workspaceId: w, contentId: item.id, variantId: variant.id, socialAccountId: account.id, scheduledAt: new Date(Date.now() + DAY), idempotencyKey: `pub-${w}` } });
  const gen = await app.inject({ method: "POST", url: `/api/workspaces/${w}/strategy/plans/generate`, headers: auth(acc), payload: { period: "MONTHLY" } });
  expect(gen.statusCode).toBe(202);
  await drainQueue();
  return { contact, item };
}

describe("Gouvernance des données", () => {
  it("exporte les données d'un espace, sans aucun jeton, pour le propriétaire seulement", async () => {
    const acc = await signup();
    await fill(acc);
    const app = await getApp();
    const res = await app.inject({ method: "GET", url: `/api/workspaces/${acc.workspaceId}/export`, headers: auth(acc) });
    expect(res.statusCode).toBe(200);
    expect(res.headers["content-disposition"]).toContain("attachment");
    const data = res.json();
    expect(data.format).toBe("forlife-com-export/1");
    expect(data.crm.contacts[0].name).toBe("Koffi Client");
    expect(data.contents).toHaveLength(1);
    expect(data.strategyPlans.length).toBeGreaterThan(0);
    expect(res.body).not.toContain("chiffre");
    expect(res.body).not.toContain("accessTokenEnc");
    const editor = await addMember(acc, "EDITOR");
    expect((await app.inject({ method: "GET", url: `/api/workspaces/${acc.workspaceId}/export`, headers: auth(editor) })).statusCode).toBe(403);
  });

  it("supprime un contact et ses prospects (droit à l'effacement)", async () => {
    const acc = await signup();
    const { contact } = await fill(acc);
    const app = await getApp();
    const other = await signup();
    expect((await app.inject({ method: "DELETE", url: `/api/workspaces/${other.workspaceId}/crm/contacts/${contact.id}`, headers: auth(other) })).statusCode).toBe(404);
    expect((await app.inject({ method: "DELETE", url: `/api/workspaces/${acc.workspaceId}/crm/contacts/${contact.id}`, headers: auth(acc) })).statusCode).toBe(200);
    expect(await prisma.contact.count({ where: { id: contact.id } })).toBe(0);
    expect(await prisma.lead.count({ where: { contactId: contact.id } })).toBe(0);
  });

  it("demande de suppression : blocage immédiat, annulation possible, effacement après 30 jours", async () => {
    const acc = await signup();
    const { item } = await fill(acc);
    const app = await getApp();
    const url = `/api/orgs/${acc.organizationId}/deletion`;
    const admin = await addMember(acc, "ADMIN");
    expect((await app.inject({ method: "POST", url, headers: auth(admin), payload: { confirmName: "x" } })).statusCode).toBe(403);
    expect((await app.inject({ method: "POST", url, headers: auth(acc), payload: { confirmName: "Mauvais nom" } })).statusCode).toBe(400);

    const org = await prisma.organization.findUniqueOrThrow({ where: { id: acc.organizationId } });
    const ok = await app.inject({ method: "POST", url, headers: auth(acc), payload: { confirmName: org.name.toUpperCase() } });
    expect(ok.statusCode).toBe(200);
    // Jetons retirés et publications annulées tout de suite ; plus aucun accès aux données.
    expect(await prisma.socialCredential.count({ where: { socialAccount: { workspaceId: acc.workspaceId } } })).toBe(0);
    expect(await prisma.publication.count({ where: { workspaceId: acc.workspaceId, status: "QUEUED" } })).toBe(0);
    expect((await app.inject({ method: "GET", url: `/api/workspaces/${acc.workspaceId}/dashboard`, headers: auth(acc) })).statusCode).toBe(403);

    // Annulation par le propriétaire, puis nouvelle demande.
    expect((await app.inject({ method: "DELETE", url, headers: auth(acc) })).statusCode).toBe(200);
    expect((await app.inject({ method: "GET", url: `/api/workspaces/${acc.workspaceId}/dashboard`, headers: auth(acc) })).statusCode).toBe(200);
    expect((await app.inject({ method: "POST", url, headers: auth(acc), payload: { confirmName: org.name } })).statusCode).toBe(200);

    // Avant 30 jours : rien n'est effacé.
    expect(await purgeDueOrganizations(new Date(Date.now() + 29 * DAY))).toBe(0);
    expect(await purgeDueOrganizations(new Date(Date.now() + 31 * DAY))).toBe(1);

    const after = await prisma.organization.findUniqueOrThrow({ where: { id: acc.organizationId } });
    expect(after).toMatchObject({ status: "DELETED", name: "Organisation supprimée" });
    expect(await prisma.contentItem.count({ where: { id: item.id } })).toBe(0);
    expect(await prisma.contact.count({ where: { workspaceId: acc.workspaceId } })).toBe(0);
    expect(await prisma.strategyPlan.count({ where: { workspaceId: acc.workspaceId } })).toBe(0);
    expect(await prisma.aIRun.count({ where: { workspaceId: acc.workspaceId } })).toBe(0);
    expect(await prisma.membership.count({ where: { organizationId: acc.organizationId } })).toBe(0);
    const user = await prisma.user.findUniqueOrThrow({ where: { id: acc.userId } });
    expect(user.email).not.toBe(acc.email);
    expect(user.name).toBe("Utilisateur supprimé");
    // Les écritures comptables restent (obligation légale).
    expect(await prisma.creditTransaction.count({ where: { wallet: { organizationId: acc.organizationId } } })).toBeGreaterThan(0);
    // L'ancien compte ne peut plus se connecter.
    const login = await app.inject({ method: "POST", url: "/api/auth/login", headers: { "x-forlife-csrf": "1" }, payload: { email: acc.email, password: "motdepasse-solide" } });
    expect(login.statusCode).toBe(401);
  });
});

describe("Alertes de crédits", () => {
  it("prévient le propriétaire une seule fois par seuil franchi (20 % puis 5 %)", async () => {
    const { ledger } = await import("../src/modules/billing/ledger.js");
    const { testMailbox } = await import("../src/modules/mail/mailer.js");
    const acc = await signup();
    // Plan Free : 200 crédits par mois, soit des seuils à 40 et 10 crédits.
    await prisma.creditWallet.update({ where: { organizationId: acc.organizationId }, data: { balance: 45 } });
    const mails = () => testMailbox.filter((m) => m.to === acc.email && m.template === "credits-low");
    const settle = () => new Promise((r) => setTimeout(r, 150));
    await ledger.consume({ organizationId: acc.organizationId, amount: 3, reason: "test", idempotencyKey: `t1-${acc.organizationId}` });
    await settle();
    expect(mails()).toHaveLength(0);
    await ledger.consume({ organizationId: acc.organizationId, amount: 5, reason: "test", idempotencyKey: `t2-${acc.organizationId}` });
    await settle();
    expect(mails()).toHaveLength(1);
    expect(mails()[0]!.subject).toContain("20 %");
    await ledger.consume({ organizationId: acc.organizationId, amount: 2, reason: "test", idempotencyKey: `t3-${acc.organizationId}` });
    await settle();
    expect(mails()).toHaveLength(1);
    await ledger.consume({ organizationId: acc.organizationId, amount: 30, reason: "test", idempotencyKey: `t4-${acc.organizationId}` });
    await settle();
    expect(mails()).toHaveLength(2);
    expect(mails()[1]!.subject).toContain("5 %");
  });
});
