import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { badRequest, notFound } from "../../lib/errors.js";
import { parse } from "../../lib/validation.js";
import { audit } from "../../lib/audit.js";
import { createLead } from "./service.js";

const slugParams = z.object({ slug: z.string().min(3).max(40) });

/** Formulaires publics de capture : sans authentification, limités et protégés contre le spam. */
export async function publicFormRoutes(app: FastifyInstance) {
  app.get("/api/public/forms/:slug", async (req) => {
    const { slug } = parse(slugParams, req.params);
    const form = await prisma.leadForm.findUnique({ where: { slug }, include: { workspace: { select: { name: true, organization: { select: { status: true } } } } } });
    if (!form || !form.active || form.workspace.organization.status !== "ACTIVE") throw notFound("Formulaire");
    return { title: form.title, description: form.description, brandName: form.workspace.name };
  });

  app.post("/api/public/forms/:slug", { config: { rateLimit: { max: 5, timeWindow: "1 minute" } } }, async (req) => {
    const { slug } = parse(slugParams, req.params);
    const body = parse(
      z.object({
        name: z.string().trim().min(2).max(120),
        phone: z.string().trim().min(6).max(30),
        email: z.email().optional().or(z.literal("").transform(() => undefined)),
        message: z.string().trim().max(1000).optional(),
        consentWhatsApp: z.literal(true, { error: "Votre accord pour être recontacté sur WhatsApp est nécessaire" }),
        // Pot de miel : champ invisible pour les humains.
        website: z.string().max(0).optional(),
      }),
      req.body,
    );
    const form = await prisma.leadForm.findUnique({ where: { slug }, include: { workspace: { select: { organizationId: true, organization: { select: { status: true } } } } } });
    if (!form || !form.active || form.workspace.organization.status !== "ACTIVE") throw notFound("Formulaire");
    if (body.website) throw badRequest("Requête invalide");
    const { lead } = await prisma.$transaction(async (tx) => {
      const r = await createLead(tx, form.workspaceId, {
        contact: { name: body.name, phone: body.phone, email: body.email ?? null, consentWhatsApp: true },
        title: form.title,
        source: "FORM",
        campaignId: form.campaignId,
        formId: form.id,
        note: body.message ? `Message : ${body.message}` : null,
      });
      await tx.leadForm.update({ where: { id: form.id }, data: { submissions: { increment: 1 } } });
      await audit({ organizationId: form.workspace.organizationId, workspaceId: form.workspaceId, action: "lead.captured", entityType: "lead", entityId: r.lead.id, ip: req.ip, correlationId: req.id, metadata: { formId: form.id } }, tx);
      return r;
    });
    return { ok: true, thankYou: form.thankYou, reference: lead.id.slice(-6).toUpperCase() };
  });
}
