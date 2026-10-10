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
  extra: { scheduledAt?: Date | null } = {},
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
