import { randomUUID } from "node:crypto";
import { Prisma, type Job } from "@prisma/client";
import { prisma, type Tx } from "../../lib/prisma.js";
import { AppError } from "../../lib/errors.js";

export interface EnqueueInput {
  organizationId: string;
  workspaceId?: string | null;
  type: string;
  payload: Prisma.InputJsonValue;
  correlationId: string;
  createdById?: string | null;
  idempotencyKey?: string;
  maxAttempts?: number;
}

/** Enfile un job. Avec une clé d'idempotence, un second appel renvoie le job existant. */
export async function enqueue(input: EnqueueInput, tx: Tx = prisma): Promise<Job> {
  if (input.idempotencyKey) {
    const found = await tx.job.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
    if (found) return found;
  }
  try {
    return await tx.job.create({
      data: {
        organizationId: input.organizationId,
        workspaceId: input.workspaceId ?? null,
        type: input.type,
        payload: input.payload,
        correlationId: input.correlationId,
        createdById: input.createdById ?? null,
        idempotencyKey: input.idempotencyKey ?? null,
        maxAttempts: input.maxAttempts ?? 3,
      },
    });
  } catch (e) {
    if (input.idempotencyKey && e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return tx.job.findUniqueOrThrow({ where: { idempotencyKey: input.idempotencyKey } });
    }
    throw e;
  }
}

export type JobHandler = (job: Job) => Promise<Prisma.InputJsonValue>;
const handlers = new Map<string, JobHandler>();

export function registerJobHandler(type: string, handler: JobHandler): void {
  handlers.set(type, handler);
}

/** Délai avant nouvelle tentative : backoff exponentiel plafonné + jitter. */
export function backoffMs(attempt: number): number {
  const base = Math.min(60_000, 2_000 * 2 ** (attempt - 1));
  return base + Math.floor(Math.random() * 1_000);
}

/** Réserve atomiquement le prochain job prêt (concurrence sûre entre plusieurs workers). */
export async function claimNext(workerId: string): Promise<Job | null> {
  const rows = await prisma.$queryRaw<Job[]>`
    UPDATE "Job" SET "status" = 'RUNNING', "lockedAt" = now(), "lockedBy" = ${workerId},
      "attempts" = "attempts" + 1, "updatedAt" = now()
    WHERE "id" = (
      SELECT "id" FROM "Job" WHERE "status" = 'QUEUED' AND "runAt" <= now()
      ORDER BY "runAt" ASC FOR UPDATE SKIP LOCKED LIMIT 1
    )
    RETURNING *`;
  return rows[0] ?? null;
}

/** Erreurs métier (4xx : crédits insuffisants, données invalides…) : inutile de réessayer. */
function isPermanent(e: unknown): boolean {
  return e instanceof AppError && e.statusCode < 500;
}

export async function processJob(job: Job): Promise<void> {
  const handler = handlers.get(job.type);
  try {
    if (!handler) throw new AppError(400, "UNKNOWN_JOB", `Type de job inconnu : ${job.type}`);
    const result = await handler(job);
    await prisma.job.update({
      where: { id: job.id },
      data: { status: "SUCCEEDED", result, progress: 100, lockedAt: null, finishedAt: new Date(), lastError: null },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const exhausted = job.attempts >= job.maxAttempts;
    if (isPermanent(e) || exhausted) {
      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: isPermanent(e) ? "FAILED" : "DEAD",
          lastError: message,
          result: e instanceof AppError ? { code: e.code, details: (e.details ?? null) as Prisma.InputJsonValue } : Prisma.JsonNull,
          lockedAt: null,
          finishedAt: new Date(),
        },
      });
    } else {
      await prisma.job.update({
        where: { id: job.id },
        data: { status: "QUEUED", lastError: message, lockedAt: null, runAt: new Date(Date.now() + backoffMs(job.attempts)) },
      });
    }
  }
}

/** Remet en file les jobs bloqués (worker arrêté brutalement). */
export async function recoverStaleJobs(timeoutMs = 10 * 60_000): Promise<number> {
  const res = await prisma.job.updateMany({
    where: { status: "RUNNING", lockedAt: { lt: new Date(Date.now() - timeoutMs) } },
    data: { status: "QUEUED", lockedAt: null, lockedBy: null },
  });
  return res.count;
}

/** Exécute tous les jobs prêts (utilisé par les tests et le worker). */
export async function drainQueue(workerId = "drain"): Promise<number> {
  let n = 0;
  for (let job = await claimNext(workerId); job; job = await claimNext(workerId)) {
    await processJob(job);
    n++;
  }
  return n;
}

export function startWorker(options: { concurrency?: number; pollMs?: number; log?: (msg: string, extra?: object) => void } = {}) {
  const workerId = `worker-${randomUUID().slice(0, 8)}`;
  const concurrency = options.concurrency ?? 2;
  const pollMs = options.pollMs ?? 1_000;
  let stopped = false;

  const loop = async () => {
    while (!stopped) {
      try {
        const job = await claimNext(workerId);
        if (!job) {
          await new Promise((r) => setTimeout(r, pollMs));
          continue;
        }
        options.log?.("job.start", { jobId: job.id, type: job.type, attempt: job.attempts, correlationId: job.correlationId });
        await processJob(job);
        options.log?.("job.end", { jobId: job.id });
      } catch (e) {
        options.log?.("worker.error", { error: e instanceof Error ? e.message : String(e) });
        await new Promise((r) => setTimeout(r, pollMs));
      }
    }
  };

  const staleTimer = setInterval(() => void recoverStaleJobs().catch(() => undefined), 60_000);
  const loops = Array.from({ length: concurrency }, loop);
  return {
    workerId,
    async stop() {
      stopped = true;
      clearInterval(staleTimer);
      await Promise.all(loops);
    },
  };
}
