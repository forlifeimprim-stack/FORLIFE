import { afterEach, describe, expect, it } from "vitest";
import { z } from "zod";
import { ledger } from "../src/modules/billing/ledger.js";
import { runAI } from "../src/modules/ai/gateway.js";
import { ProviderRegistry, setRegistry } from "../src/modules/ai/registry.js";
import { MockProvider } from "../src/modules/ai/providers/mock.js";
import { ProviderError, type AIProvider, type PromptDefinition } from "../src/modules/ai/types.js";
import { decryptSecret, encryptSecret } from "../src/lib/crypto.js";
import { prisma, signup } from "./helpers.js";

const testPrompt: PromptDefinition<{ topic: string }, { text: string }> = {
  key: "test.prompt",
  version: 1,
  task: "content.ideas",
  usageKind: "TEXT",
  system: "test",
  render: (i) => i.topic,
  output: z.object({ text: z.string() }),
  mock: (i) => ({ text: `ok ${i.topic}` }),
  textForSafety: (o) => [o.text],
};

const failing = (name: string, retryable = true): AIProvider => ({
  name,
  kinds: new Set(["TEXT"]),
  isAvailable: () => true,
  generate: async () => {
    throw new ProviderError(name, "indisponible", retryable);
  },
});

const malformed: AIProvider = {
  name: "malformed",
  kinds: new Set(["TEXT"]),
  isAvailable: () => true,
  generate: async () => ({ output: { wrong: 1 }, model: "m" }),
};

afterEach(() => setRegistry(undefined));

async function balance(orgId: string) {
  return (await prisma.creditWallet.findUniqueOrThrow({ where: { organizationId: orgId } })).balance;
}

describe("Ledger de crédits", () => {
  it("est idempotent", async () => {
    const acc = await signup();
    const op = { organizationId: acc.organizationId, amount: 30, reason: "test", idempotencyKey: `k-${acc.organizationId}` };
    const a = await ledger.consume(op);
    const b = await ledger.consume(op);
    expect(a.replayed).toBe(false);
    expect(b.replayed).toBe(true);
    expect(await balance(acc.organizationId)).toBe(170);
  });

  it("reste correct sous concurrence et ne devient jamais négatif", async () => {
    const acc = await signup();
    const results = await Promise.allSettled(
      Array.from({ length: 30 }, (_, i) => ledger.consume({ organizationId: acc.organizationId, amount: 10, reason: "c", idempotencyKey: `c-${acc.organizationId}-${i}` })),
    );
    const ok = results.filter((r) => r.status === "fulfilled").length;
    expect(ok).toBe(20); // 200 crédits / 10
    expect(await balance(acc.organizationId)).toBe(0);
    const sum = await prisma.creditTransaction.aggregate({ where: { organizationId: acc.organizationId }, _sum: { amount: true } });
    expect(sum._sum.amount).toBe(0);
  });

  it("protège le ledger et l'audit contre toute modification (append-only)", async () => {
    const acc = await signup();
    const tx = await prisma.creditTransaction.findFirstOrThrow({ where: { organizationId: acc.organizationId } });
    await expect(prisma.creditTransaction.update({ where: { id: tx.id }, data: { amount: 99999 } })).rejects.toThrow(/append-only/);
    await expect(prisma.auditLog.deleteMany({ where: { organizationId: acc.organizationId } })).rejects.toThrow(/append-only/);
  });
});

describe("AI Gateway", () => {
  const req = (orgId: string, key: string) => ({
    organizationId: orgId,
    workspaceId: null,
    actorId: null,
    prompt: testPrompt,
    input: { topic: "pagne" },
    traceId: "trace-test",
    idempotencyKey: key,
  });

  it("bascule sur le fournisseur suivant en cas d'échec ou de sortie non conforme", async () => {
    const acc = await signup();
    setRegistry(new ProviderRegistry(["down", "malformed", "mock"]).register(failing("down")).register(malformed).register(new MockProvider()));
    const res = await runAI<{ topic: string }, { text: string }>(req(acc.organizationId, "fallback"));
    expect(res.provider).toBe("mock");
    expect(res.output.text).toBe("ok pagne");
    const run = await prisma.aIRun.findUniqueOrThrow({ where: { id: res.runId } });
    expect(run.attemptedProviders).toEqual(["down", "malformed", "mock"]);
    expect(run.status).toBe("SUCCEEDED");
    expect(await balance(acc.organizationId)).toBe(200 - 8);
    expect(await prisma.aIUsageEvent.count({ where: { aiRunId: res.runId } })).toBe(1);
  });

  it("rembourse les crédits si aucun fournisseur n'aboutit", async () => {
    const acc = await signup();
    setRegistry(new ProviderRegistry(["down"]).register(failing("down")));
    await expect(runAI(req(acc.organizationId, "fail"))).rejects.toMatchObject({ code: "AI_UNAVAILABLE" });
    expect(await balance(acc.organizationId)).toBe(200);
    const run = await prisma.aIRun.findFirstOrThrow({ where: { organizationId: acc.organizationId } });
    expect(run.status).toBe("FAILED");
  });

  it("ne contourne pas un refus de sécurité par un autre fournisseur", async () => {
    const acc = await signup();
    setRegistry(new ProviderRegistry(["refuse", "mock"]).register(failing("refuse", false)).register(new MockProvider()));
    await expect(runAI(req(acc.organizationId, "refusal"))).rejects.toMatchObject({ code: "AI_UNAVAILABLE" });
  });

  it("bloque la génération sans crédits suffisants (402)", async () => {
    const acc = await signup();
    await ledger.consume({ organizationId: acc.organizationId, amount: 200, reason: "vider", idempotencyKey: `drain-${acc.organizationId}` });
    await expect(runAI(req(acc.organizationId, "nocredit"))).rejects.toMatchObject({ statusCode: 402 });
  });

  it("signale les mots interdits par le Brand DNA", async () => {
    const acc = await signup();
    const res = await runAI<{ topic: string }, { text: string }>({ ...req(acc.organizationId, "safety"), forbiddenWords: ["pagne"] });
    expect(res.safety.passed).toBe(false);
    expect(res.safety.flags[0]?.code).toBe("BRAND_FORBIDDEN_WORD");
  });
});

describe("Chiffrement des secrets", () => {
  it("chiffre et déchiffre en AES-256-GCM, et détecte toute altération", () => {
    const key = Buffer.alloc(32, 3).toString("base64");
    const enc = encryptSecret("token-oauth-secret", key);
    expect(enc).not.toContain("token-oauth-secret");
    expect(decryptSecret(enc, key)).toBe("token-oauth-secret");
    const tampered = enc.slice(0, -2) + (enc.endsWith("A") ? "BB" : "AA");
    expect(() => decryptSecret(tampered, key)).toThrow();
  });
});
