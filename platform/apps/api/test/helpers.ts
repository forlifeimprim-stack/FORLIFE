import type { FastifyInstance } from "fastify";
import { buildServer } from "../src/server.js";
import { prisma } from "../src/lib/prisma.js";
import { testMailbox } from "../src/modules/mail/mailer.js";

/** Dernier lien (jeton) envoyé à une adresse pour un gabarit d'email donné. */
export function lastToken(email: string, template: string): string {
  const mail = [...testMailbox].reverse().find((m) => m.to === email && m.template === template);
  const token = mail?.text.match(/token=([\w-]+)/)?.[1];
  if (!token) throw new Error(`Aucun email « ${template} » pour ${email}`);
  return token;
}

export const csrf = { "x-forlife-csrf": "1" };

let app: FastifyInstance | undefined;

export async function getApp(): Promise<FastifyInstance> {
  app ??= await buildServer({ logger: false });
  return app;
}

let counter = 0;

export interface TestAccount {
  token: string;
  userId: string;
  organizationId: string;
  workspaceId: string;
  email: string;
  cookie: string;
}

export async function signup(overrides: Record<string, unknown> = {}, verify = true): Promise<TestAccount> {
  const a = await getApp();
  const email = typeof overrides.email === "string" ? overrides.email : `user${Date.now()}${counter++}@test.ci`;
  if (typeof overrides.email === "string") counter++;
  const remoteAddress = `10.0.${counter % 250}.${Math.floor(counter / 250) + 1}`;
  const res = await a.inject({
    method: "POST",
    url: "/api/auth/signup",
    remoteAddress,
    headers: csrf,
    payload: {
      name: "Test Utilisateur",
      email,
      password: "motdepasse-solide",
      organizationName: `Org ${counter}`,
      sector: "Imprimerie",
      city: "Bingerville",
      objective: { type: "LEADS", title: "Obtenir des devis", metric: "demandes", target: 20 },
      ...overrides,
    },
  });
  if (res.statusCode !== 201) throw new Error(`signup ${res.statusCode}: ${res.body}`);
  const body = res.json();
  if (verify) {
    const v = await a.inject({ method: "POST", url: "/api/auth/verify-email", remoteAddress, payload: { token: lastToken(email, "email_verification") } });
    if (v.statusCode !== 200) throw new Error(`verify ${v.statusCode}: ${v.body}`);
  }
  const me = await a.inject({ method: "GET", url: "/api/me", headers: { authorization: `Bearer ${body.accessToken}` } });
  const cookie = String(res.headers["set-cookie"]).split(";")[0]!;
  return { token: body.accessToken, userId: me.json().user.id, organizationId: body.organizationId, workspaceId: body.workspaceId, email, cookie };
}

/** Crée un compte puis l'ajoute à l'organisation du propriétaire avec le rôle donné (invitation acceptée). */
export async function addMember(owner: TestAccount, role: string, extra: Record<string, unknown> = {}): Promise<TestAccount> {
  const other = await signup();
  const a = await getApp();
  const scope = role === "AGENCY" && !("workspaceIds" in extra) ? { allWorkspaces: false, workspaceIds: [owner.workspaceId] } : {};
  const inv = await a.inject({ method: "POST", url: `/api/orgs/${owner.organizationId}/invitations`, headers: auth(owner), payload: { email: other.email, role, ...scope, ...extra } });
  if (inv.statusCode !== 201) throw new Error(`invite ${inv.statusCode}: ${inv.body}`);
  const res = await a.inject({ method: "POST", url: "/api/invitations/accept", headers: { ...auth(other), ...csrf }, payload: { token: lastToken(other.email, "invitation") } });
  if (res.statusCode !== 200) throw new Error(`accept ${res.statusCode}: ${res.body}`);
  return { ...other, organizationId: owner.organizationId, workspaceId: owner.workspaceId };
}

export const auth = (acc: TestAccount) => ({ authorization: `Bearer ${acc.token}` });

export { prisma };
