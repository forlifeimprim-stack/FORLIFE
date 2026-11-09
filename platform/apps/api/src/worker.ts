import { loadConfig } from "./config.js";
import { prisma } from "./lib/prisma.js";
import { registerAllJobHandlers } from "./modules/jobs/handlers.js";
import { startWorker } from "./modules/jobs/queue.js";
import { startScheduler } from "./modules/jobs/scheduler.js";

/** Worker pool séparé pour les traitements IA lourds (§19). Scalable horizontalement. */
loadConfig();
registerAllJobHandlers();
const log = (msg: string, extra: object = {}) => console.log(JSON.stringify({ time: new Date().toISOString(), msg, ...extra }));
const worker = startWorker({ concurrency: Number(process.env.WORKER_CONCURRENCY ?? 4), log });
const scheduler = startScheduler(log);
log("worker.started", { workerId: worker.workerId });

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, async () => {
    log("worker.stopping", { signal });
    scheduler.stop();
    await worker.stop();
    await prisma.$disconnect();
    process.exit(0);
  });
}
