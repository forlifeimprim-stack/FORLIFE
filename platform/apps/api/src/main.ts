import { loadConfig } from "./config.js";
import { buildServer } from "./server.js";
import { startWorker } from "./modules/jobs/queue.js";
import { prisma } from "./lib/prisma.js";

const cfg = loadConfig();
const app = await buildServer();
const worker = cfg.RUN_WORKER_INLINE ? startWorker({ log: (msg, extra) => app.log.info(extra, msg) }) : null;

await app.listen({ port: cfg.PORT, host: "0.0.0.0" });

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, async () => {
    app.log.info({ signal }, "Arrêt en cours");
    await worker?.stop();
    await app.close();
    await prisma.$disconnect();
    process.exit(0);
  });
}
