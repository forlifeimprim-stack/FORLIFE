import { can, type Role } from "@forlife/shared";
import { prisma } from "../../lib/prisma.js";
import { loadBrandContext, renderContext } from "../ai/context.js";

const DAY = 864e5;
const fmtDate = (d: Date) => d.toISOString().slice(0, 10);
const fcfa = (minor: number | null | undefined) => (minor == null ? "—" : `${Math.round(minor).toLocaleString("fr-FR")} FCFA`);
/** Texte saisi par des tiers (formulaires publics, contenus) : tronqué et aplati, jamais interprété comme consigne. */
const clip = (s: string | null | undefined, n = 120) => (s ?? "").replace(/\s+/g, " ").trim().slice(0, n);

/**
 * Mémoire de l'entreprise injectée dans chaque échange avec le Copilot : Business Brain, Brand DNA,
 * objectifs, stratégie, contenus, campagnes et, si le rôle le permet, CRM. Aucune donnée personnelle de
 * contact (téléphone, email) n'y figure. Seules les sections lisibles par le rôle du membre sont incluses.
 */
export async function loadCopilotMemory(organizationId: string, workspaceId: string, role: Role): Promise<{ text: string; forbiddenWords: string[] }> {
  const now = new Date();
  const context = await loadBrandContext(workspaceId);
  const sections: string[] = [`## Entreprise et marque\n${renderContext(context)}`];

  if (can(role, "strategy:read")) {
    const [objectives, plan, recos] = await Promise.all([
      prisma.objective.findMany({ where: { workspaceId, status: "ACTIVE" }, orderBy: { periodEnd: "asc" }, take: 8 }),
      prisma.strategyPlan.findFirst({ where: { workspaceId, status: "APPROVED" }, orderBy: { approvedAt: "desc" }, select: { title: true, summary: true } }),
      prisma.recommendation.findMany({ where: { workspaceId, status: { in: ["OPEN", "ACCEPTED"] } }, orderBy: [{ impact: "desc" }, { effort: "asc" }], take: 6 }),
    ]);
    sections.push(
      [
        "## Objectifs actifs",
        objectives.length ? objectives.map((o) => `- ${clip(o.title)} : ${o.target} ${clip(o.metric, 40)} avant le ${fmtDate(o.periodEnd)}`).join("\n") : "- Aucun objectif défini",
        "## Stratégie",
        plan ? `Plan validé : ${clip(plan.title)} — ${clip(plan.summary, 400)}` : "Aucun plan stratégique validé.",
        recos.length ? `Recommandations en cours :\n${recos.map((r) => `- ${clip(r.title)} (impact ${r.impact}/5, effort ${r.effort}/5, ${r.status === "ACCEPTED" ? "acceptée" : "ouverte"})`).join("\n")}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }

  if (can(role, "content:read")) {
    const [byStatus, upcoming, recent, pendingApprovals, published30] = await Promise.all([
      prisma.contentItem.groupBy({ by: ["status"], where: { workspaceId }, _count: true }),
      prisma.contentItem.findMany({ where: { workspaceId, status: "SCHEDULED", scheduledAt: { gte: now } }, orderBy: { scheduledAt: "asc" }, take: 6, select: { title: true, scheduledAt: true } }),
      prisma.contentItem.findMany({ where: { workspaceId }, orderBy: { updatedAt: "desc" }, take: 5, select: { title: true, status: true, hook: true } }),
      prisma.approval.count({ where: { workspaceId, status: "PENDING" } }),
      prisma.publication.count({ where: { workspaceId, status: "PUBLISHED", publishedAt: { gte: new Date(now.getTime() - 30 * DAY) } } }),
    ]);
    const counts = byStatus.map((s) => `${s.status} : ${s._count}`).join(", ") || "aucun contenu";
    sections.push(
      [
        "## Contenus",
        `Par statut : ${counts}. Validations en attente : ${pendingApprovals}. Publications des 30 derniers jours : ${published30}.`,
        upcoming.length ? `Programmés :\n${upcoming.map((c) => `- ${fmtDate(c.scheduledAt!)} : ${clip(c.title)}`).join("\n")}` : "Aucun contenu programmé.",
        recent.length ? `Derniers contenus :\n${recent.map((c) => `- [${c.status}] ${clip(c.title)}${c.hook ? ` — « ${clip(c.hook, 80)} »` : ""}`).join("\n")}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }

  if (can(role, "campaigns:read")) {
    const campaigns = await prisma.campaign.findMany({ where: { workspaceId, status: { in: ["DRAFT", "ACTIVE", "PAUSED"] } }, orderBy: { updatedAt: "desc" }, take: 5 });
    sections.push(
      `## Campagnes\n${
        campaigns.length
          ? campaigns.map((c) => `- [${c.status}] ${clip(c.name)} — objectif ${c.objective}, budget ${fcfa(c.budgetAmount)}${c.endAt ? `, fin ${fmtDate(c.endAt)}` : ""}`).join("\n")
          : "Aucune campagne en cours."
      }`,
    );
  }

  if (can(role, "crm:read")) {
    const [byStage, stale, hot, tasksDue, won] = await Promise.all([
      prisma.lead.groupBy({ by: ["stage"], where: { workspaceId }, _count: true }),
      prisma.lead.count({ where: { workspaceId, stage: { in: ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL"] }, lastActivityAt: { lt: new Date(now.getTime() - 7 * DAY) } } }),
      prisma.lead.findMany({
        where: { workspaceId, stage: { in: ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL"] } },
        orderBy: [{ score: "desc" }, { lastActivityAt: "asc" }],
        take: 6,
        select: { id: true, title: true, stage: true, score: true, valueAmount: true, lastActivityAt: true },
      }),
      prisma.crmTask.count({ where: { workspaceId, doneAt: null, dueAt: { lte: new Date(now.getTime() + DAY) } } }),
      prisma.lead.aggregate({ where: { workspaceId, stage: "WON", wonAt: { gte: new Date(now.getTime() - 30 * DAY) } }, _sum: { valueAmount: true }, _count: true }),
    ]);
    sections.push(
      [
        "## Ventes (CRM)",
        `Leads par étape : ${byStage.map((s) => `${s.stage} : ${s._count}`).join(", ") || "aucun lead"}. Leads sans activité depuis 7 jours : ${stale}. Tâches dues sous 24 h : ${tasksDue}.`,
        `Gagnés sur 30 jours : ${won._count} pour ${fcfa(won._sum.valueAmount)}.`,
        hot.length
          ? `Leads ouverts prioritaires (identifiant entre crochets, à reprendre pour une tâche de relance) :\n${hot
              .map((l) => `- [${l.id}] ${clip(l.title, 80)} — ${l.stage}, score ${l.score}, valeur ${fcfa(l.valueAmount)}, dernière activité ${fmtDate(l.lastActivityAt)}`)
              .join("\n")}`
          : "",
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }

  if (can(role, "billing:read")) {
    const wallet = await prisma.creditWallet.findUnique({ where: { organizationId } });
    sections.push(`## Crédits IA\nSolde : ${wallet?.balance ?? 0} crédits.`);
  }

  return { text: sections.join("\n\n"), forbiddenWords: context.forbiddenWords };
}
