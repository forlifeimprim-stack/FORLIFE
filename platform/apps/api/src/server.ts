import Fastify, { type FastifyError } from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import { randomUUID } from "node:crypto";
import { loadConfig } from "./config.js";
import { AppError } from "./lib/errors.js";
import { prisma } from "./lib/prisma.js";
import { identityRoutes } from "./modules/identity/routes.js";
import { orgRoutes } from "./modules/org/routes.js";
import { brandRoutes } from "./modules/brand/routes.js";
import { strategyRoutes } from "./modules/strategy/routes.js";
import { contentRoutes } from "./modules/content/routes.js";
import { approvalRoutes } from "./modules/approvals/routes.js";
import { jobRoutes } from "./modules/jobs/routes.js";
import { dashboardRoutes } from "./modules/governance/dashboard.js";
import { dataGovernanceRoutes } from "./modules/governance/data.js";
import { registerAllJobHandlers } from "./modules/jobs/handlers.js";
import { adminRoutes } from "./modules/admin/routes.js";
import { crmRoutes } from "./modules/crm/routes.js";
import { publicFormRoutes } from "./modules/crm/public.js";
import { campaignRoutes } from "./modules/campaigns/routes.js";
import { socialRoutes } from "./modules/social/routes.js";
import { creativeRoutes } from "./modules/creative/routes.js";
import { videoRoutes } from "./modules/video/routes.js";
import { paymentRoutes } from "./modules/payments/routes.js";
import { analyticsRoutes } from "./modules/analytics/routes.js";
import { copilotRoutes } from "./modules/copilot/routes.js";
import { invitationRoutes } from "./modules/org/invitations.js";
import { passwordRoutes } from "./modules/identity/password.js";
import { verificationRoutes } from "./modules/identity/verification.js";
import { clientIp } from "./lib/request.js";

export async function buildServer(options: { logger?: boolean } = {}) {
  const cfg = loadConfig();
  const app = Fastify({
    logger: options.logger ?? cfg.NODE_ENV !== "test"
      ? {
          level: cfg.NODE_ENV === "production" ? "info" : "debug",
          // Ne jamais journaliser de secrets.
          redact: ["req.headers.authorization", "req.headers.cookie", "res.headers['set-cookie']"],
        }
      : false,
    // Correlation ID : repris du client s'il est fourni, sinon généré.
    genReqId: (req) => {
      const h = req.headers["x-correlation-id"];
      return typeof h === "string" && /^[\w-]{8,64}$/.test(h) ? h : randomUUID();
    },
    // Jamais « trustProxy: true » : l'entrée de gauche de X-Forwarded-For est fournie par le client.
    // L'adresse du client est déterminée par lib/request.ts (clientIp).
    trustProxy: false,
    bodyLimit: 1024 * 1024,
  });

  registerAllJobHandlers();

  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, { origin: cfg.WEB_ORIGIN.split(","), credentials: true });
  await app.register(cookie);
  await app.register(jwt, { secret: cfg.JWT_SECRET });
  // Un seul fichier par requête, quelques petits champs : rien d'autre n'est mis en mémoire.
  await app.register(multipart, { limits: { fields: 5, fieldSize: 1024, parts: 6, files: 1, fileSize: cfg.MAX_UPLOAD_BYTES } });
  await app.register(rateLimit, { max: 300, timeWindow: "1 minute", keyGenerator: (req) => clientIp(req) });

  app.addHook("onSend", async (req, reply) => {
    reply.header("x-correlation-id", req.id);
  });

  app.setErrorHandler((err: FastifyError | AppError, req, reply) => {
    if (err instanceof AppError) {
      return reply.code(err.statusCode).send({ error: { code: err.code, message: err.message, details: err.details ?? null }, correlationId: req.id });
    }
    if (err.statusCode && err.statusCode < 500) {
      return reply.code(err.statusCode).send({ error: { code: err.code ?? "BAD_REQUEST", message: err.message }, correlationId: req.id });
    }
    req.log.error({ err }, "Erreur non gérée");
    return reply.code(500).send({ error: { code: "INTERNAL", message: "Une erreur interne est survenue" }, correlationId: req.id });
  });

  app.get("/api/health", async () => {
    await prisma.$queryRaw`SELECT 1`;
    return { status: "ok", service: "forlife-com-api", aiProviders: cfg.AI_PROVIDERS };
  });

  await app.register(identityRoutes);
  await app.register(orgRoutes);
  await app.register(brandRoutes);
  await app.register(strategyRoutes);
  await app.register(contentRoutes);
  await app.register(approvalRoutes);
  await app.register(jobRoutes);
  await app.register(dashboardRoutes);
  await app.register(dataGovernanceRoutes);
  await app.register(passwordRoutes);
  await app.register(verificationRoutes);
  await app.register(invitationRoutes);
  await app.register(adminRoutes);
  await app.register(crmRoutes);
  await app.register(publicFormRoutes);
  await app.register(campaignRoutes);
  await app.register(socialRoutes);
  await app.register(creativeRoutes);
  await app.register(videoRoutes);
  await app.register(paymentRoutes);
  await app.register(analyticsRoutes);
  await app.register(copilotRoutes);

  return app;
}
