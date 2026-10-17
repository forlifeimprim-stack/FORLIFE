import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { randomToken } from "../../lib/crypto.js";
import { badRequest, forbidden, notFound } from "../../lib/errors.js";
import { parse } from "../../lib/validation.js";
import { audit } from "../../lib/audit.js";
import { auditCtx, authenticate, requireWorkspace } from "../../plugins/auth.js";
import { clientIp } from "../../lib/request.js";
import { getStorage } from "../storage/storage.js";
import { layout, sendEmail } from "../mail/mailer.js";
import { revokeRemote } from "../social/service.js";

/** Délai de rétractation avant l'effacement définitif d'une organisation (politique de confidentialité). */
export const DELETION_GRACE_DAYS = 30;
const DAY = 86_400_000;

const wsParams = z.object({ workspaceId: z.string() });
const orgParams = z.object({ orgId: z.string() });

/** Export JSON de toutes les données d'un espace (droit d'accès et de portabilité, §22). Aucun secret ni jeton. */
export async function exportWorkspace(workspaceId: string) {
  const w = { workspaceId };
  const [workspace, brand, products, assets, businessProfiles, audiences, competitors, objectives, strategyPlans, recommendations, pillars, campaigns, contents, approvals, contacts, leads, tasks, forms, socialAccounts, publications, socialAudits, creativeBriefs, videoProjects, conversations] = await Promise.all([
    prisma.workspace.findUniqueOrThrow({ where: { id: workspaceId }, select: { id: true, name: true, slug: true, timezone: true, createdAt: true, organization: { select: { id: true, name: true, country: true, currency: true } } } }),
    prisma.brand.findUnique({ where: w, include: { guidelines: true } }),
    prisma.product.findMany({ where: w }),
    prisma.brandAsset.findMany({ where: { ...w, deletedAt: null }, select: { id: true, type: true, fileName: true, mime: true, sizeBytes: true, createdAt: true } }),
    prisma.businessProfile.findMany({ where: w }),
    prisma.audience.findMany({ where: w }),
    prisma.competitor.findMany({ where: w }),
    prisma.objective.findMany({ where: w }),
    prisma.strategyPlan.findMany({ where: w }),
    prisma.recommendation.findMany({ where: w }),
    prisma.contentPillar.findMany({ where: w }),
    prisma.campaign.findMany({ where: w }),
    prisma.contentItem.findMany({ where: w, include: { variants: true } }),
    prisma.approval.findMany({ where: w }),
    prisma.contact.findMany({ where: w }),
    prisma.lead.findMany({ where: w, include: { activities: true } }),
    prisma.crmTask.findMany({ where: w }),
    prisma.leadForm.findMany({ where: w }),
    prisma.socialAccount.findMany({ where: w, select: { id: true, provider: true, name: true, status: true, createdAt: true } }),
    prisma.publication.findMany({ where: w, include: { metrics: true } }),
    prisma.socialAudit.findMany({ where: w }),
    prisma.creativeBrief.findMany({ where: w, include: { concepts: { include: { versions: { select: { id: true, version: true, width: true, height: true, critic: true, createdAt: true } } } } } }),
    prisma.videoProject.findMany({ where: w, include: { scenes: true, renders: { select: { id: true, version: true, status: true, durationSec: true, createdAt: true } } } }),
    prisma.copilotConversation.findMany({ where: w, include: { messages: true } }),
  ]);
  return {
    format: "forlife-com-export/1",
    exportedAt: new Date().toISOString(),
    workspace,
    brand,
    products,
    assets,
    businessProfiles,
    audiences,
    competitors,
    objectives,
    strategyPlans,
    recommendations,
    pillars,
    campaigns,
    contents,
    approvals,
    crm: { contacts, leads, tasks, forms },
    social: { accounts: socialAccounts, publications, audits: socialAudits },
    creative: creativeBriefs,
    video: videoProjects,
    copilot: conversations,
  };
}

/** Supprime toutes les données métier d'un espace, fichiers compris. Les écritures comptables et le journal d'audit sont conservés (obligation légale). */
async function purgeWorkspace(workspaceId: string) {
  const w = { workspaceId };
  const storage = getStorage();
  const keys = [
    ...(await prisma.brandAsset.findMany({ where: w, select: { storageKey: true } })).map((x) => x.storageKey),
    ...(await prisma.creativeVersion.findMany({ where: w, select: { storageKey: true } })).map((x) => x.storageKey),
    ...(await prisma.videoRender.findMany({ where: { project: w }, select: { storageKey: true, srtKey: true } })).flatMap((x) => [x.storageKey, x.srtKey]),
  ].filter((k): k is string => !!k);
  for (const k of keys) await storage.remove(k).catch(() => undefined);

  const accounts = await prisma.socialAccount.findMany({ where: w, include: { credential: true } });
  for (const a of accounts) await revokeRemote(a);

  await prisma.$transaction(async (tx) => {
    await tx.copilotConversation.deleteMany({ where: w });
    await tx.copilotSettings.deleteMany({ where: w });
    await tx.publication.deleteMany({ where: w });
    await tx.socialAccount.deleteMany({ where: w });
    await tx.oAuthState.deleteMany({ where: w });
    await tx.socialAudit.deleteMany({ where: w });
    await tx.crmTask.deleteMany({ where: w });
    await tx.lead.deleteMany({ where: w });
    await tx.contact.deleteMany({ where: w });
    await tx.leadForm.deleteMany({ where: w });
    await tx.approval.deleteMany({ where: w });
    await tx.contentItem.deleteMany({ where: w });
    await tx.creativeBrief.deleteMany({ where: w });
    await tx.videoProject.deleteMany({ where: w });
    await tx.brandAsset.deleteMany({ where: w });
    await tx.product.deleteMany({ where: w });
    await tx.brandGuideline.deleteMany({ where: { brand: w } });
    await tx.brand.deleteMany({ where: w });
    await tx.businessProfile.deleteMany({ where: w });
    await tx.audience.deleteMany({ where: w });
    await tx.competitor.deleteMany({ where: w });
    await tx.recommendation.deleteMany({ where: w });
    await tx.strategyPlan.deleteMany({ where: w });
    await tx.objective.deleteMany({ where: w });
    await tx.contentPillar.deleteMany({ where: w });
    await tx.campaign.deleteMany({ where: w });
    await tx.aIRun.deleteMany({ where: w });
    await tx.job.deleteMany({ where: w });
    await tx.workspace.update({ where: { id: workspaceId }, data: { name: "Espace supprimé", slug: `supprime-${workspaceId}`, status: "ARCHIVED" } });
  });
}

/**
 * Efface une organisation : données des espaces, membres, invitations ; les utilisateurs sans autre organisation
 * sont anonymisés. Paiements, crédits et journal d'audit sont conservés sans données de contenu.
 */
export async function purgeOrganization(organizationId: string) {
  const workspaces = await prisma.workspace.findMany({ where: { organizationId }, select: { id: true } });
  for (const ws of workspaces) await purgeWorkspace(ws.id);
  const members = await prisma.membership.findMany({ where: { organizationId }, select: { userId: true } });
  await prisma.$transaction(async (tx) => {
    await tx.invitation.deleteMany({ where: { organizationId } });
    await tx.membership.deleteMany({ where: { organizationId } });
    await tx.organization.update({ where: { id: organizationId }, data: { name: "Organisation supprimée", slug: `supprimee-${organizationId}`, status: "DELETED" } });
    for (const { userId } of members) {
      if (await tx.membership.count({ where: { userId } })) continue;
      const user = await tx.user.findUniqueOrThrow({ where: { id: userId }, select: { email: true } });
      await tx.emailOutbox.deleteMany({ where: { to: user.email } });
      await tx.session.deleteMany({ where: { userId } });
      await tx.user.update({ where: { id: userId }, data: { email: `supprime-${userId}@invalid.forlife`, name: "Utilisateur supprimé", passwordHash: randomToken(32), emailVerifiedAt: null, isPlatformAdmin: false } });
    }
  });
}

/** Tâche planifiée : efface les organisations dont le délai de rétractation est écoulé. */
export async function purgeDueOrganizations(now = new Date()): Promise<number> {
  const due = await prisma.organization.findMany({ where: { status: "DELETION_PENDING", deletionRequestedAt: { lt: new Date(now.getTime() - DELETION_GRACE_DAYS * DAY) } }, select: { id: true } });
  for (const o of due) {
    await purgeOrganization(o.id);
    await audit({ organizationId: o.id, actorId: null, action: "org.purged", entityType: "organization", entityId: o.id });
  }
  return due.length;
}

/** Propriétaire de l'organisation (seul habilité à demander ou annuler la suppression, même organisation bloquée). */
async function requireOwner(userId: string, organizationId: string) {
  const m = await prisma.membership.findUnique({ where: { organizationId_userId: { organizationId, userId } }, include: { organization: true } });
  if (!m) throw notFound("Organisation");
  if (m.role !== "OWNER") throw forbidden("Seul le propriétaire de l'organisation peut faire cette demande");
  return m;
}

export async function dataGovernanceRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);

  app.get("/api/workspaces/:workspaceId/export", async (req, reply) => {
    const { workspaceId } = parse(wsParams, req.params);
    const ctx = await requireWorkspace(req, workspaceId, "org:update");
    const data = await exportWorkspace(workspaceId);
    await audit({ ...auditCtx(ctx), action: "workspace.exported", entityType: "workspace", entityId: workspaceId });
    reply.header("content-disposition", `attachment; filename="forlife-export-${data.workspace.slug}-${data.exportedAt.slice(0, 10)}.json"`);
    reply.header("cache-control", "no-store");
    return data;
  });

  /** Demande de suppression : l'organisation est bloquée tout de suite, effacée après 30 jours (annulable). */
  app.post("/api/orgs/:orgId/deletion", async (req) => {
    const { orgId } = parse(orgParams, req.params);
    const uid = req.user!.sub;
    const m = await requireOwner(uid, orgId);
    const { confirmName } = parse(z.object({ confirmName: z.string().trim() }), req.body);
    if (m.organization.status !== "ACTIVE") throw badRequest("Une demande est déjà en cours pour cette organisation");
    if (confirmName.toLowerCase() !== m.organization.name.trim().toLowerCase()) throw badRequest("Saisissez exactement le nom de l'organisation pour confirmer");
    const now = new Date();
    // Les jetons des réseaux sont retirés immédiatement : plus aucune publication ni lecture possible.
    const accounts = await prisma.socialAccount.findMany({ where: { workspace: { organizationId: orgId } }, include: { credential: true } });
    for (const a of accounts) await revokeRemote(a);
    await prisma.$transaction(async (tx) => {
      await tx.socialCredential.deleteMany({ where: { socialAccount: { workspace: { organizationId: orgId } } } });
      await tx.socialAccount.updateMany({ where: { workspace: { organizationId: orgId } }, data: { status: "REVOKED" } });
      await tx.publication.updateMany({ where: { workspace: { organizationId: orgId }, status: "QUEUED" }, data: { status: "CANCELLED" } });
      await tx.organization.update({ where: { id: orgId }, data: { status: "DELETION_PENDING", deletionRequestedAt: now, deletionRequestedById: uid } });
      await audit({ organizationId: orgId, actorId: uid, ip: clientIp(req), correlationId: req.id, action: "org.deletion_requested", entityType: "organization", entityId: orgId }, tx);
    });
    const purgeAt = new Date(now.getTime() + DELETION_GRACE_DAYS * DAY);
    const user = await prisma.user.findUniqueOrThrow({ where: { id: uid }, select: { email: true } });
    const date = purgeAt.toLocaleDateString("fr-FR", { dateStyle: "long", timeZone: "Africa/Abidjan" });
    void sendEmail({
      to: user.email,
      subject: "Suppression de votre organisation Forlife Com",
      template: "org-deletion",
      ...layout("Demande de suppression enregistrée", [
        `Votre organisation « ${m.organization.name} » est désactivée et ses comptes de réseaux sociaux ont été déconnectés.`,
        `Toutes ses données seront définitivement effacées le ${date}. D'ici là, vous pouvez annuler la demande en vous connectant à Forlife Com.`,
      ]),
    });
    return { ok: true, purgeAt: purgeAt.toISOString() };
  });

  app.delete("/api/orgs/:orgId/deletion", async (req) => {
    const { orgId } = parse(orgParams, req.params);
    const uid = req.user!.sub;
    const m = await requireOwner(uid, orgId);
    if (m.organization.status !== "DELETION_PENDING") throw badRequest("Aucune demande de suppression en cours");
    await prisma.$transaction(async (tx) => {
      await tx.organization.update({ where: { id: orgId }, data: { status: "ACTIVE", deletionRequestedAt: null, deletionRequestedById: null } });
      await audit({ organizationId: orgId, actorId: uid, ip: clientIp(req), correlationId: req.id, action: "org.deletion_cancelled", entityType: "organization", entityId: orgId }, tx);
    });
    return { ok: true };
  });

  /** Droit à l'effacement d'un contact du CRM : contact, prospects, échanges et tâches. */
  app.delete("/api/workspaces/:workspaceId/crm/contacts/:id", async (req) => {
    const { workspaceId, id } = parse(z.object({ workspaceId: z.string(), id: z.string() }), req.params);
    const ctx = await requireWorkspace(req, workspaceId, "crm:delete");
    const contact = await prisma.contact.findFirst({ where: { id, workspaceId }, select: { id: true } });
    if (!contact) throw notFound("Contact");
    await prisma.$transaction(async (tx) => {
      await tx.lead.deleteMany({ where: { contactId: id, workspaceId } });
      await tx.contact.delete({ where: { id } });
      await audit({ ...auditCtx(ctx), action: "crm.contact_deleted", entityType: "contact", entityId: id }, tx);
    });
    return { ok: true };
  });
}
