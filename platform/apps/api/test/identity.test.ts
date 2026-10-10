import { describe, expect, it } from "vitest";
import { auth, getApp, prisma, signup } from "./helpers.js";

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
    const dup = await app.inject({ method: "POST", url: "/api/auth/signup", payload: { name: "X Y", email: acc.email, password: "motdepasse-solide", organizationName: "Org", sector: "Test" } });
    expect(dup.statusCode).toBe(409);
    const weak = await app.inject({ method: "POST", url: "/api/auth/signup", payload: { name: "X Y", email: "weak@test.ci", password: "court", organizationName: "Org", sector: "Test" } });
    expect(weak.statusCode).toBe(400);
  });

  it("refuse un mauvais mot de passe sans révéler si le compte existe", async () => {
    const acc = await signup();
    const app = await getApp();
    const bad = await app.inject({ method: "POST", url: "/api/auth/login", payload: { email: acc.email, password: "mauvais-mdp" } });
    const unknown = await app.inject({ method: "POST", url: "/api/auth/login", payload: { email: "inconnu@test.ci", password: "mauvais-mdp" } });
    expect(bad.statusCode).toBe(401);
    expect(unknown.statusCode).toBe(401);
    expect(bad.json().error.message).toBe(unknown.json().error.message);
    const ok = await app.inject({ method: "POST", url: "/api/auth/login", payload: { email: acc.email, password: "motdepasse-solide" } });
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
    // Réutilisation de l'ancien token → détection de vol, toutes les sessions sont révoquées.
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
});
