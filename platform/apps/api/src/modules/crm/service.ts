import { normalizePhone, scoreLead, type LeadSource } from "@forlife/shared";
import type { Prisma } from "@prisma/client";
import type { Tx } from "../../lib/prisma.js";
import { badRequest } from "../../lib/errors.js";

export interface ContactInput {
  name: string;
  phone?: string | null;
  email?: string | null;
  company?: string | null;
  city?: string | null;
  consentWhatsApp?: boolean;
}

/**
 * Retrouve ou crée un contact, dédoublonné par téléphone normalisé.
 * `untrusted` (formulaire public, sans authentification) : une fiche existante n'est jamais modifiée
 * — ni ses coordonnées, ni son consentement (un retrait de consentement ne peut pas être annulé par un tiers).
 */
export async function upsertContact(tx: Tx, workspaceId: string, c: ContactInput, opts: { untrusted?: boolean } = {}) {
  const phone = c.phone ? normalizePhone(c.phone) : null;
  if (c.phone && !phone) throw badRequest("Numéro de téléphone invalide");
  if (!phone && !c.email) throw badRequest("Un téléphone ou un email est requis");
  const consent = c.consentWhatsApp ? { consentWhatsApp: true, consentAt: new Date() } : {};
  if (phone) {
    const existing = await tx.contact.findUnique({ where: { workspaceId_phone: { workspaceId, phone } } });
    if (existing && opts.untrusted) return existing;
    if (existing) {
      return tx.contact.update({
        where: { id: existing.id },
        data: { email: existing.email ?? c.email ?? null, company: existing.company ?? c.company ?? null, city: existing.city ?? c.city ?? null, ...consent },
      });
    }
  }
  return tx.contact.create({
    data: { workspaceId, name: c.name, phone, email: c.email ?? null, company: c.company ?? null, city: c.city ?? null, ...consent },
  });
}

/** Recalcule le score transparent d'un lead à partir des données réelles du CRM. */
export async function rescore(tx: Tx, leadId: string) {
  const lead = await tx.lead.findUniqueOrThrow({ where: { id: leadId }, include: { contact: true, _count: { select: { activities: { where: { type: { notIn: ["SYSTEM", "STAGE_CHANGE"] } } } } } } });
  const { score, reasons } = scoreLead({
    hasPhone: !!lead.contact.phone,
    hasEmail: !!lead.contact.email,
    consent: lead.contact.consentWhatsApp,
    source: lead.source as LeadSource,
    fromCampaign: !!lead.campaignId,
    activities: lead._count.activities,
    valueAmount: lead.valueAmount,
    stage: lead.stage,
  });
  await tx.lead.update({ where: { id: leadId }, data: { score, scoreReasons: reasons as unknown as Prisma.InputJsonValue } });
  return score;
}

export async function createLead(
  tx: Tx,
  workspaceId: string,
  input: { contact: ContactInput; title?: string; source: LeadSource; campaignId?: string | null; contentId?: string | null; formId?: string | null; valueAmount?: number | null; note?: string | null; actorId?: string | null; untrusted?: boolean },
) {
  const contact = await upsertContact(tx, workspaceId, input.contact, { untrusted: input.untrusted });
  const lead = await tx.lead.create({
    data: {
      workspaceId,
      contactId: contact.id,
      title: input.title?.trim() || `Demande de ${contact.name}`,
      source: input.source,
      campaignId: input.campaignId ?? null,
      contentId: input.contentId ?? null,
      formId: input.formId ?? null,
      valueAmount: input.valueAmount ?? null,
    },
  });
  await tx.leadActivity.create({ data: { workspaceId, leadId: lead.id, type: "SYSTEM", body: `Lead créé (source : ${input.source})`, actorId: input.actorId ?? null } });
  if (input.note) await tx.leadActivity.create({ data: { workspaceId, leadId: lead.id, type: "NOTE", body: input.note, actorId: input.actorId ?? null } });
  await rescore(tx, lead.id);
  return { lead, contact };
}
