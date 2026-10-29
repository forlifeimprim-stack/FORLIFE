import { canTransition, type ContentStatus } from "@forlife/shared";
import { prisma, type Tx } from "../../lib/prisma.js";
import { badRequest, conflict, notFound } from "../../lib/errors.js";

export async function getContent(workspaceId: string, id: string) {
  const item = await prisma.contentItem.findFirst({
    where: { id, workspaceId },
    include: { variants: { orderBy: [{ channel: "asc" }, { label: "asc" }] }, pillar: true, objective: true, campaign: true },
  });
  if (!item) throw notFound("Contenu");
  return item;
}

/**
 * Transition d'état contrôlée par la machine à états partagée + verrou optimiste
 * (`revision`) pour éviter qu'une mise à jour concurrente soit écrasée.
 */
export async function transition(
  tx: Tx,
  workspaceId: string,
  id: string,
  to: ContentStatus,
  extra: { scheduledAt?: Date | null; approvedVersion?: number } = {},
) {
  const item = await tx.contentItem.findFirst({ where: { id, workspaceId } });
  if (!item) throw notFound("Contenu");
  if (!canTransition(item.status, to)) {
    throw badRequest(`Transition impossible : ${item.status} → ${to}`);
  }
  const res = await tx.contentItem.updateMany({
    where: { id, revision: item.revision },
    data: { status: to, revision: { increment: 1 }, ...extra },
  });
  if (!res.count) throw conflict("Le contenu a été modifié entre-temps, rechargez la page");
  return { before: item.status };
}

/**
 * Modification de fond d'un contenu (texte, variante, visuel) : nouvelle version, retour en brouillon
 * si elle avait été soumise, approuvée ou était en échec, et annulation des demandes d'approbation en cours.
 * L'approbation précédente ne vaut plus : rien ne pourra être programmé avant une nouvelle validation.
 */
export async function markContentChanged(tx: Tx, id: string, status: ContentStatus) {
  const backToDraft = status === "APPROVED" || status === "REVIEW" || status === "FAILED";
  await tx.contentItem.update({ where: { id }, data: { contentVersion: { increment: 1 }, ...(backToDraft ? { status: "DRAFT" } : {}) } });
  await tx.approval.updateMany({ where: { entityType: "content", entityId: id, status: "PENDING" }, data: { status: "REJECTED", comment: "Contenu modifié après la demande : nouvelle soumission nécessaire", decidedAt: new Date() } });
  return backToDraft;
}

/** Seule la version approuvée d'un contenu peut être programmée ou publiée. */
export function assertApprovedVersion(item: { contentVersion: number; approvedVersion: number | null }) {
  if (item.approvedVersion !== item.contentVersion) throw badRequest("Ce contenu a été modifié depuis son approbation : soumettez-le de nouveau");
}
