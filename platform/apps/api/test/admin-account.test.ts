import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { testMailbox } from "../src/modules/mail/mailer.js";
import { renewDueSubscriptions } from "../src/modules/billing/ledger.js";
import { auth, csrf, getApp, prisma, signup, type TestAccount } from "./helpers.js";

const CODE = "code-activation-test-0123456789";
let adminAcc: TestAccount | undefined;
async function admin() {
  if (!adminAcc) {
    adminAcc = await signup({ email: "admin@forlife.test" });
    const app = await getApp();
    const r = await app.inject({ method: "POST", url: "/api/admin/claim", headers: auth(adminAcc), payload: { code: CODE } });
    if (r.statusCode !== 200) throw new Error(`claim ${r.statusCode}: ${r.body}`);
  }
  return adminAcc;
}
const lastLink = (to: string) => {
  const mail = [...testMailbox].reverse().find((m) => m.to === to);
  return mail?.text.match(/token=([\w-]+)/)?.[1];
};

describe("Back-office plateforme", () => {
  it("l'email administrateur seul ne suffit pas : il faut le code d'activation", async () => {
    const app = await getApp();
    const squatter = await signup({ email: "admin2@forlife.test" });
    const me = (await app.inject({ method: "GET", url: "/api/me", headers: auth(squatter) })).json();
    expect(me.user.isPlatformAdmin).toBe(false);
    expect(me.user.canClaimAdmin).toBe(false); // email absent de la liste
    expect((await app.inject({ method: "GET", url: "/api/admin/stats", headers: auth(squatter) })).statusCode).toBe(404);
    expect((await app.inject({ method: "POST", url: "/api/admin/claim", headers: auth(squatter), payload: { code: CODE } })).statusCode).toBe(403);
    // Email listé mais mauvais code : refusé, puis bloqué après 5 essais.
    const listed = await signup({ email: `listed-${Date.now()}@forlife.test` });
    const { resetConfigCache, loadConfig } = await import("../src/config.js");
    const prev = process.env.PLATFORM_ADMIN_EMAILS;
    process.env.PLATFORM_ADMIN_EMAILS = `${prev},${listed.email}`;
    resetConfigCache();
    loadConfig();
    try {
      expect((await app.inject({ method: "GET", url: "/api/me", headers: auth(listed) })).json().user.canClaimAdmin).toBe(true);
      for (let i = 0; i < 5; i++) expect((await app.inject({ method: "POST", url: "/api/admin/claim", headers: auth(listed), payload: { code: "mauvais-code" } })).statusCode).toBe(403);
      expect((await app.inject({ method: "POST", url: "/api/admin/claim", headers: auth(listed), payload: { code: CODE } })).statusCode).toBe(429);
    } finally {
      process.env.PLATFORM_ADMIN_EMAILS = prev;
      resetConfigCache();
      loadConfig();
    }
  });

  it("retirer un email de la liste coupe l'accès immédiatement", async () => {
    const app = await getApp();
    const a = await admin();
    expect((await app.inject({ method: "GET", url: "/api/admin/stats", headers: auth(a) })).statusCode).toBe(200);
    const { resetConfigCache, loadConfig } = await import("../src/config.js");
    const prev = process.env.PLATFORM_ADMIN_EMAILS;
    process.env.PLATFORM_ADMIN_EMAILS = "quelquun-dautre@forlife.test";
    resetConfigCache();
    loadConfig();
    try {
      expect((await app.inject({ method: "GET", url: "/api/admin/stats", headers: auth(a) })).statusCode).toBe(404);
    } finally {
      process.env.PLATFORM_ADMIN_EMAILS = prev;
      resetConfigCache();
      loadConfig();
    }
  });

  it("est invisible pour un utilisateur normal et accessible à l'administrateur", async () => {
    const app = await getApp();
    const user = await signup();
    expect((await app.inject({ method: "GET", url: "/api/admin/stats", headers: auth(user) })).statusCode).toBe(404);
    const a = await admin();
    const me = (await app.inject({ method: "GET", url: "/api/me", headers: auth(a) })).json();
    expect(me.user.isPlatformAdmin).toBe(true);
    const stats = (await app.inject({ method: "GET", url: "/api/admin/stats", headers: auth(a) })).json();
    expect(stats.organizations).toBeGreaterThan(0);
  });

  it("change le plan, verse la différence de crédits et ajuste le solde de façon idempotente", async () => {
    const app = await getApp();
    const a = await admin();
    const client = await signup();
    const res = await app.inject({ method: "PATCH", url: `/api/admin/organizations/${client.organizationId}/plan`, headers: auth(a), payload: { planCode: "STARTER" } });
    expect(res.statusCode).toBe(200);
    const wallet = () => prisma.creditWallet.findUniqueOrThrow({ where: { organizationId: client.organizationId } });
    expect((await wallet()).balance).toBe(200 + 1300);
    const requestId = randomUUID();
    for (let i = 0; i < 2; i++) {
      await app.inject({ method: "POST", url: `/api/admin/organizations/${client.organizationId}/credits`, headers: auth(a), payload: { amount: 500, reason: "Geste commercial", requestId } });
    }
    expect((await wallet()).balance).toBe(2000);
    const actions = (await prisma.auditLog.findMany({ where: { organizationId: client.organizationId } })).map((x) => x.action);
    expect(actions).toEqual(expect.arrayContaining(["platform.plan.changed", "platform.credits.adjusted"]));
  });

  it("une organisation suspendue est bloquée puis réactivée", async () => {
    const app = await getApp();
    const a = await admin();
    const client = await signup();
    await app.inject({ method: "POST", url: `/api/admin/organizations/${client.organizationId}/suspend`, headers: auth(a), payload: { reason: "Impayé" } });
    const blocked = await app.inject({ method: "GET", url: `/api/workspaces/${client.workspaceId}/dashboard`, headers: auth(client) });
    expect(blocked.statusCode).toBe(403);
    await app.inject({ method: "POST", url: `/api/admin/organizations/${client.organizationId}/reactivate`, headers: auth(a) });
    expect((await app.inject({ method: "GET", url: `/api/workspaces/${client.workspaceId}/dashboard`, headers: auth(client) })).statusCode).toBe(200);
  });
});

describe("Invitations", () => {
  it("invite par email, crée le compte à l'acceptation et respecte le quota du plan", async () => {
    const app = await getApp();
    const owner = await signup();
    const email = `invite-${Date.now()}@test.ci`;
    const res = await app.inject({ method: "POST", url: `/api/orgs/${owner.organizationId}/invitations`, headers: auth(owner), payload: { email, role: "EDITOR" } });
    expect(res.statusCode).toBe(201);
    const token = lastLink(email)!;
    expect(token).toBeTruthy();
    const info = (await app.inject({ method: "POST", url: "/api/invitations/lookup", payload: { token } })).json();
    expect(info.accountExists).toBe(false);
    // FREE = 2 membres : la seconde invitation est refusée tant que la première est en attente
    const over = await app.inject({ method: "POST", url: `/api/orgs/${owner.organizationId}/invitations`, headers: auth(owner), payload: { email: "autre@test.ci", role: "VIEWER" } });
    expect(over.statusCode).toBe(400);
    expect((await app.inject({ method: "POST", url: "/api/invitations/accept", payload: { token, name: "Nouvel Éditeur", password: "motdepasse-solide" } })).statusCode).toBe(400); // sans en-tête anti-CSRF
    const accept = await app.inject({ method: "POST", url: "/api/invitations/accept", headers: csrf, payload: { token, name: "Nouvel Éditeur", password: "motdepasse-solide" } });
    expect(accept.statusCode).toBe(200);
    const me = (await app.inject({ method: "GET", url: "/api/me", headers: { authorization: `Bearer ${accept.json().accessToken}` } })).json();
    expect(me.organizations[0].role).toBe("EDITOR");
    expect(me.user.emailVerified).toBe(true); // l'invitation reçue par email prouve l'adresse
    expect((await app.inject({ method: "POST", url: "/api/invitations/accept", headers: csrf, payload: { token, name: "X Y", password: "motdepasse-solide" } })).statusCode).toBe(404);
  });

  it("un compte existant doit se connecter avec le bon email pour accepter", async () => {
    const app = await getApp();
    const owner = await signup();
    const invited = await signup();
    await app.inject({ method: "POST", url: `/api/orgs/${owner.organizationId}/invitations`, headers: auth(owner), payload: { email: invited.email, role: "VIEWER" } });
    const token = lastLink(invited.email)!;
    expect((await app.inject({ method: "POST", url: "/api/invitations/accept", headers: csrf, payload: { token, name: "X Y", password: "motdepasse-solide" } })).statusCode).toBe(401);
    const stranger = await signup();
    expect((await app.inject({ method: "POST", url: "/api/invitations/accept", headers: { ...auth(stranger), ...csrf }, payload: { token } })).statusCode).toBe(403);
    expect((await app.inject({ method: "POST", url: "/api/invitations/accept", headers: { ...auth(invited), ...csrf }, payload: { token } })).statusCode).toBe(200);
    expect(await prisma.membership.count({ where: { organizationId: owner.organizationId } })).toBe(2);
  });
});

describe("Mot de passe oublié", () => {
  it("réinitialise une seule fois et révoque les sessions", async () => {
    const app = await getApp();
    const acc = await signup();
    const unknown = await app.inject({ method: "POST", url: "/api/auth/forgot-password", payload: { email: "personne@test.ci" } });
    expect(unknown.statusCode).toBe(200);
    await app.inject({ method: "POST", url: "/api/auth/forgot-password", payload: { email: acc.email } });
    const older = lastLink(acc.email)!;
    await app.inject({ method: "POST", url: "/api/auth/forgot-password", payload: { email: acc.email } });
    const token = lastLink(acc.email)!;
    // Un seul lien valable à la fois : le précédent est invalidé.
    expect((await app.inject({ method: "POST", url: "/api/auth/reset-password", payload: { token: older, password: "nouveau-mot-de-passe" } })).statusCode).toBe(400);
    expect((await app.inject({ method: "POST", url: "/api/auth/reset-password", payload: { token, password: "nouveau-mot-de-passe" } })).statusCode).toBe(200);
    expect((await app.inject({ method: "POST", url: "/api/auth/reset-password", payload: { token, password: "encore-un-autre" } })).statusCode).toBe(400);
    expect((await app.inject({ method: "POST", url: "/api/auth/login", headers: csrf, payload: { email: acc.email, password: "motdepasse-solide" } })).statusCode).toBe(401);
    expect((await app.inject({ method: "POST", url: "/api/auth/login", headers: csrf, payload: { email: acc.email, password: "nouveau-mot-de-passe" } })).statusCode).toBe(200);
    expect((await app.inject({ method: "POST", url: "/api/auth/refresh", headers: { cookie: acc.cookie, "x-forlife-csrf": "1" } })).statusCode).toBe(401);
    // Le jeton d'accès de l'ancienne session est révoqué lui aussi.
    expect((await app.inject({ method: "GET", url: "/api/me", headers: auth(acc) })).statusCode).toBe(401);
  });

  it("limite les emails de réinitialisation envoyés à une même adresse", async () => {
    const app = await getApp();
    const acc = await signup();
    const before = testMailbox.filter((m) => m.to === acc.email && m.template === "password_reset").length;
    for (let i = 0; i < 6; i++) {
      await app.inject({ method: "POST", url: "/api/auth/forgot-password", remoteAddress: `10.8.0.${i + 1}`, headers: { "x-forwarded-for": `203.0.113.${i}` }, payload: { email: acc.email } });
    }
    expect(testMailbox.filter((m) => m.to === acc.email && m.template === "password_reset").length - before).toBe(3);
  });
});

describe("Renouvellement mensuel", () => {
  it("avance la période et verse l'allocation avec un report plafonné", async () => {
    const acc = await signup();
    const past = new Date(Date.now() - 864e5);
    await prisma.subscription.update({ where: { organizationId: acc.organizationId }, data: { currentPeriodStart: new Date(past.getTime() - 30 * 864e5), currentPeriodEnd: past } });
    await renewDueSubscriptions();
    await renewDueSubscriptions(); // idempotent
    const sub = await prisma.subscription.findUniqueOrThrow({ where: { organizationId: acc.organizationId } });
    expect(sub.currentPeriodEnd.getTime()).toBeGreaterThan(Date.now());
    const wallet = await prisma.creditWallet.findUniqueOrThrow({ where: { organizationId: acc.organizationId } });
    expect(wallet.balance).toBe(400); // 200 + 200, plafond 2 × 200
  });
});
