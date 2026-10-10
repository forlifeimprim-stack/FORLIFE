import type { FastifyInstance } from "fastify";
import { buildServer } from "../src/server.js";
import { prisma } from "../src/lib/prisma.js";

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

export async function signup(overrides: Record<string, unknown> = {}): Promise<TestAccount> {
  const a = await getApp();
  const email = `user${Date.now()}${counter++}@test.ci`;
  const res = await a.inject({
    method: "POST",
    url: "/api/auth/signup",
    remoteAddress: `10.0.${counter % 250}.${Math.floor(counter / 250) + 1}`,
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
  const me = await a.inject({ method: "GET", url: "/api/me", headers: { authorization: `Bearer ${body.accessToken}` } });
  const cookie = String(res.headers["set-cookie"]).split(";")[0]!;
  return { token: body.accessToken, userId: me.json().user.id, organizationId: body.organizationId, workspaceId: body.workspaceId, email, cookie };
}

/** Crée un compte puis l'ajoute à l'organisation du propriétaire avec le rôle donné. */
export async function addMember(owner: TestAccount, role: string, extra: Record<string, unknown> = {}): Promise<TestAccount> {
  const other = await signup();
  const a = await getApp();
  const res = await a.inject({
    method: "POST",
    url: `/api/orgs/${owner.organizationId}/members`,
    headers: auth(owner),
    payload: { email: other.email, role, ...extra },
  });
  if (res.statusCode !== 201) throw new Error(`addMember ${res.statusCode}: ${res.body}`);
  return { ...other, organizationId: owner.organizationId, workspaceId: owner.workspaceId };
}

export const auth = (acc: TestAccount) => ({ authorization: `Bearer ${acc.token}` });

export { prisma };
