import { describe, expect, it } from "vitest";
import { auth, csrf, getApp, lastToken, prisma, signup } from "./helpers.js";

describe("Identity & onboarding", () => {
  it("crée organisation, workspace, profil, abonnement et crédits en une inscription", async () => {
    const acc = await signup();
    const app = await getApp();
    const me = (await app.inject({ method: "GET", url: "/api/me", headers: auth(acc) })).json();
    expect(me.organizations).toHaveLength(1);
    expect(me.organizations[0].role).toBe("OWNER");
    expect(me.organizations[0].plan).toBe("FREE");
    expect(me.organizations[0].credits).toBe(200);
    expect(me.organizations[0].workspaces).toHaveLength(1);
    expect(await prisma.businessProfile.count({ where: { workspaceId: acc.workspaceId } })).toBe(1);
    expect(await prisma.objective.count({ where: { workspaceId: acc.workspaceId } })).toBe(1);
    expect(await prisma.auditLog.count({ where: { organizationId: acc.organizationId, action: "org.created" } })).toBe(1);
  });

  it("refuse un email déjà utilisé et un mot de passe faible", async () => {
    const acc = await signup();
    const app = await getApp();
    const dup = await app.inject({ method: "POST", url: "/api/auth/signup", headers: csrf, payload: { name: "X Y", email: acc.email, password: "motdepasse-solide", organizationName: "Org", sector: "Test" } });
    expect(dup.statusCode).toBe(409);
    const weak = await app.inject({ method: "POST", url: "/api/auth/signup", headers: csrf, payload: { name: "X Y", email: "weak@test.ci", password: "court", organizationName: "Org", sector: "Test" } });
    expect(weak.statusCode).toBe(400);
  });

  it("refuse un mauvais mot de passe sans révéler si le compte existe", async () => {
    const acc = await signup();
    const app = await getApp();
    const bad = await app.inject({ method: "POST", url: "/api/auth/login", headers: csrf, payload: { email: acc.email, password: "mauvais-mdp" } });
    const unknown = await app.inject({ method: "POST", url: "/api/auth/login", headers: csrf, payload: { email: "inconnu@test.ci", password: "mauvais-mdp" } });
    expect(bad.statusCode).toBe(401);
    expect(unknown.statusCode).toBe(401);
    expect(bad.json().error.message).toBe(unknown.json().error.message);
    const ok = await app.inject({ method: "POST", url: "/api/auth/login", headers: csrf, payload: { email: acc.email, password: "motdepasse-solide" } });
    expect(ok.statusCode).toBe(200);
  });

  it("fait tourner le refresh token et révoque tout en cas de réutilisation", async () => {
    const acc = await signup();
    const app = await getApp();
    const headers = { cookie: acc.cookie, "x-forlife-csrf": "1" };
    const noCsrf = await app.inject({ method: "POST", url: "/api/auth/refresh", headers: { cookie: acc.cookie } });
    expect(noCsrf.statusCode).toBe(400);
    const first = await app.inject({ method: "POST", url: "/api/auth/refresh", headers });
    expect(first.statusCode).toBe(200);
    const newCookie = String(first.headers["set-cookie"]).split(";")[0]!;
    // Réutilisation de l'ancien token (hors fenêtre de rafraîchissement simultané) → vol détecté, tout est révoqué.
    await prisma.session.updateMany({ where: { userId: acc.userId, revokedAt: { not: null } }, data: { revokedAt: new Date(Date.now() - 60_000) } });
    const replay = await app.inject({ method: "POST", url: "/api/auth/refresh", headers });
    expect(replay.statusCode).toBe(401);
    const afterTheft = await app.inject({ method: "POST", url: "/api/auth/refresh", headers: { cookie: newCookie, "x-forlife-csrf": "1" } });
    expect(afterTheft.statusCode).toBe(401);
  });

  it("exige une authentification", async () => {
    const app = await getApp();
    expect((await app.inject({ method: "GET", url: "/api/me" })).statusCode).toBe(401);
    expect((await app.inject({ method: "GET", url: "/api/me", headers: { authorization: "Bearer faux.jeton.jwt" } })).statusCode).toBe(401);
  });

  it("crédits offerts seulement après confirmation de l'email ; lien à usage unique", async () => {
    const acc = await signup({}, false);
    const app = await getApp();
    const me = async () => (await app.inject({ method: "GET", url: "/api/me", headers: auth(acc) })).json();
    expect((await me()).user.emailVerified).toBe(false);
    expect((await me()).organizations[0].credits).toBe(0);
    const token = lastToken(acc.email, "email_verification");
    expect((await app.inject({ method: "POST", url: "/api/auth/verify-email", payload: { token } })).statusCode).toBe(200);
    expect((await app.inject({ method: "POST", url: "/api/auth/verify-email", payload: { token } })).statusCode).toBe(400);
    expect((await me()).user.emailVerified).toBe(true);
    expect((await me()).organizations[0].credits).toBe(200);
  });

  it("protège la connexion : en-tête anti-CSRF, verrou par compte malgré des IP changeantes", async () => {
    const acc = await signup();
    const app = await getApp();
    expect((await app.inject({ method: "POST", url: "/api/auth/login", payload: { email: acc.email, password: "motdepasse-solide" } })).statusCode).toBe(400);
    for (let i = 0; i < 10; i++) {
      const r = await app.inject({ method: "POST", url: "/api/auth/login", headers: { ...csrf, "x-forwarded-for": `203.0.113.${i}`, "x-fah-client-ip": `198.51.100.${i}` }, remoteAddress: `10.9.0.${i + 1}`, payload: { email: acc.email, password: "mauvais-mdp" } });
      expect(r.statusCode).toBe(401);
    }
    // Même le bon mot de passe est refusé tant que le verrou du compte est actif.
    const locked = await app.inject({ method: "POST", url: "/api/auth/login", headers: csrf, remoteAddress: "10.9.1.1", payload: { email: acc.email, password: "motdepasse-solide" } });
    expect(locked.statusCode).toBe(429);
  });

  it("un jeton d'accès cesse de fonctionner dès la déconnexion", async () => {
    const acc = await signup();
    const app = await getApp();
    expect((await app.inject({ method: "GET", url: "/api/me", headers: auth(acc) })).statusCode).toBe(200);
    await app.inject({ method: "POST", url: "/api/auth/logout", headers: { cookie: acc.cookie, ...csrf } });
    expect((await app.inject({ method: "GET", url: "/api/me", headers: auth(acc) })).statusCode).toBe(401);
  });

  it("un refresh token ne sert qu'une fois, même en requêtes simultanées", async () => {
    const acc = await signup();
    const app = await getApp();
    const results = await Promise.all(Array.from({ length: 5 }, () => app.inject({ method: "POST", url: "/api/auth/refresh", headers: { cookie: acc.cookie, ...csrf } })));
    expect(results.filter((r) => r.statusCode === 200)).toHaveLength(1);
  });
});
