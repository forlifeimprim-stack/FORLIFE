import { describe, expect, it } from "vitest";
import { claimNext, drainQueue, enqueue, processJob, registerJobHandler } from "../src/modules/jobs/queue.js";
import { AppError } from "../src/lib/errors.js";
import { prisma, signup } from "./helpers.js";

describe("File de jobs", () => {
  it("réessaie avec backoff puis passe en dead-letter après épuisement", async () => {
    const acc = await signup();
    let calls = 0;
    registerJobHandler("test.flaky", async () => {
      calls++;
      throw new Error("panne transitoire");
    });
    const job = await enqueue({ organizationId: acc.organizationId, type: "test.flaky", payload: {}, correlationId: "c1", maxAttempts: 2 });
    await drainQueue();
    let state = await prisma.job.findUniqueOrThrow({ where: { id: job.id } });
    expect(state.status).toBe("QUEUED");
    expect(state.runAt.getTime()).toBeGreaterThan(Date.now());
    await prisma.job.update({ where: { id: job.id }, data: { runAt: new Date() } });
    await drainQueue();
    state = await prisma.job.findUniqueOrThrow({ where: { id: job.id } });
    expect(state.status).toBe("DEAD");
    expect(calls).toBe(2);
  });

  it("n'insiste pas sur une erreur métier permanente", async () => {
    const acc = await signup();
    registerJobHandler("test.permanent", async () => {
      throw new AppError(402, "INSUFFICIENT_CREDITS", "Crédits insuffisants");
    });
    const job = await enqueue({ organizationId: acc.organizationId, type: "test.permanent", payload: {}, correlationId: "c2" });
    await drainQueue();
    const state = await prisma.job.findUniqueOrThrow({ where: { id: job.id } });
    expect(state.status).toBe("FAILED");
    expect(state.attempts).toBe(1);
  });

  it("garantit qu'un job n'est réservé que par un seul worker", async () => {
    const acc = await signup();
    registerJobHandler("test.once", async () => ({ ok: true }));
    await enqueue({ organizationId: acc.organizationId, type: "test.once", payload: {}, correlationId: "c3" });
    const claims = await Promise.all(Array.from({ length: 8 }, (_, i) => claimNext(`w${i}`)));
    const got = claims.filter(Boolean);
    expect(got).toHaveLength(1);
    await processJob(got[0]!);
  });

  it("est idempotent à l'enfilement", async () => {
    const acc = await signup();
    const a = await enqueue({ organizationId: acc.organizationId, type: "test.once", payload: {}, correlationId: "c4", idempotencyKey: `idem-${acc.organizationId}` });
    const b = await enqueue({ organizationId: acc.organizationId, type: "test.once", payload: {}, correlationId: "c4", idempotencyKey: `idem-${acc.organizationId}` });
    expect(a.id).toBe(b.id);
    await drainQueue();
  });
});
