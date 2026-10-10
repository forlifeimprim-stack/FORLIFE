import type { Prisma } from "@prisma/client";
import { prisma, type Tx } from "./prisma.js";

export interface AuditEntry {
  organizationId: string;
  workspaceId?: string | null;
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue;
  ip?: string | null;
  correlationId?: string | null;
}

/** Journalise une opération critique. Passer `tx` pour l'inclure dans la transaction métier. */
export async function audit(entry: AuditEntry, tx: Tx = prisma): Promise<void> {
  await tx.auditLog.create({
    data: {
      organizationId: entry.organizationId,
      workspaceId: entry.workspaceId ?? null,
      actorId: entry.actorId ?? null,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId ?? null,
      metadata: entry.metadata ?? {},
      ip: entry.ip ?? null,
      correlationId: entry.correlationId ?? null,
    },
  });
}
