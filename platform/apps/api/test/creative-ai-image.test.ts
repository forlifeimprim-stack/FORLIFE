import { afterEach, describe, expect, it } from "vitest";
import { drainQueue } from "../src/modules/jobs/queue.js";
import { renderPng } from "../src/modules/creative/composer.js";
import { setImageGenerator } from "../src/modules/creative/imagegen.js";
import { auth, getApp, prisma, signup, type TestAccount } from "./helpers.js";

afterEach(() => setImageGenerator(undefined));

const balance = async (orgId: string) => (await prisma.creditWallet.findUniqueOrThrow({ where: { organizationId: orgId } })).balance;

async function brief(acc: TestAccount, extra: Record<string, unknown> = {}) {
  const app = await getApp();
  const res = await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/creative/briefs`, headers: auth(acc), payload: { subject: "Nouvelle collection de pagnes", objective: "SALES", format: "PORTRAIT", ...extra } });
  expect(res.statusCode).toBe(202);
  await drainQueue();
  return { res: res.json(), brief: (await app.inject({ method: "GET", url: `/api/workspaces/${acc.workspaceId}/creative/briefs/${res.json().briefId}`, headers: auth(acc) })).json() };
}

describe("Creative Studio : fonds photo générés par IA", () => {
  it("génère un fond par concept, au bon format, et le facture une seule fois par image", async () => {
    const calls: { prompt: string; format: string }[] = [];
    const photo = renderPng('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400"><rect width="300" height="400" fill="#2a6"/></svg>');
    setImageGenerator({ provider: "test", model: "test-1", generate: async (prompt, format) => (calls.push({ prompt, format }), { mime: "image/png", data: photo }) });
    const acc = await signup();
    const { res, brief: b } = await brief(acc, { aiImage: true });
    expect(res.estimatedCredits).toBe(6 + 12);
    expect(calls).toHaveLength(3);
    expect(calls.every((c) => c.format === "PORTRAIT" && c.prompt.length > 0)).toBe(true);
    expect(b.concepts.every((c: { backgroundKey: string | null; backgroundNote: string | null }) => c.backgroundKey && !c.backgroundNote)).toBe(true);
    expect(await balance(acc.organizationId)).toBe(200 - 6 - 12);
    const usage = await prisma.aIUsageEvent.count({ where: { organizationId: acc.organizationId, provider: "test", kind: "IMAGE" } });
    expect(usage).toBe(3);
  });

  it("sans option, ou si le générateur échoue, garde le fond graphique et n'est pas facturé", async () => {
    let n = 0;
    setImageGenerator({ provider: "test", model: "test-1", generate: async () => (n++, Promise.reject(new Error("Image refusée par le filtre de sécurité"))) });
    const acc = await signup();
    await brief(acc);
    expect(n).toBe(0);
    const { brief: b } = await brief(acc, { aiImage: true });
    expect(n).toBe(3);
    expect(b.concepts.every((c: { backgroundKey: string | null; backgroundNote: string | null }) => !c.backgroundKey && c.backgroundNote?.includes("filtre"))).toBe(true);
    expect(await balance(acc.organizationId)).toBe(200 - 6 - 6);
  });
});
