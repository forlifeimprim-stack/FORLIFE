import { loadConfig } from "./config.js";
import { buildServer } from "./server.js";
import { startWorker } from "./modules/jobs/queue.js";
import { startScheduler } from "./modules/jobs/scheduler.js";
import { prisma } from "./lib/prisma.js";

const cfg = loadConfig();
const app = await buildServer();
const log = (msg: string, extra?: object) => app.log.info(extra ?? {}, msg);
const worker = cfg.RUN_WORKER_INLINE ? startWorker({ log }) : null;
const scheduler = cfg.RUN_WORKER_INLINE ? startScheduler(log) : null;

await app.listen({ port: cfg.PORT, host: "0.0.0.0" });

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, async () => {
    app.log.info({ signal }, "Arrêt en cours");
    scheduler?.stop();
    await worker?.stop();
    await app.close();
    await prisma.$disconnect();
    process.exit(0);
  });
}
