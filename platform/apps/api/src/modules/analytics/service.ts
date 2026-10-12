import { LEAD_SOURCE_LABELS, LEAD_STAGES, type LeadSource, type LeadStage } from "@forlife/shared";
import { prisma } from "../../lib/prisma.js";

const DAY = 864e5;

/** Lundi 00:00 UTC de la semaine d'une date. */
function weekStart(d: Date): Date {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  x.setUTCDate(x.getUTCDate() - ((x.getUTCDay() + 6) % 7));
  return x;
}

const ratio = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 1000) / 10 : null);

/**
 * Analytics & ROI d'un espace de travail sur une période.
 * Règle d'or : les chiffres réels, simulés et estimés ne sont jamais additionnés.
 */
export async function computeAnalytics(workspaceId: string, days: number, opts: { crm: boolean }) {
  const now = new Date();
  const since = new Date(now.getTime() - days * DAY);
  const [contents, publications, creatives, videos, campaigns, aiRuns] = await Promise.all([
    prisma.contentItem.count({ where: { workspaceId, createdAt: { gte: since } } }),
    prisma.publication.findMany({
      where: { workspaceId, status: "PUBLISHED", publishedAt: { gte: since } },
      select: { id: true, contentId: true, publishedAt: true, content: { select: { title: true, campaignId: true } }, socialAccount: { select: { provider: true } }, metrics: { orderBy: { capturedAt: "desc" }, take: 1 } },
    }),
    prisma.creativeVersion.count({ where: { workspaceId, createdAt: { gte: since } } }),
    prisma.videoRender.count({ where: { project: { workspaceId }, status: "SUCCEEDED", createdAt: { gte: since } } }),
    prisma.campaign.findMany({ where: { workspaceId, OR: [{ endAt: null }, { endAt: { gte: since } }] }, select: { id: true, name: true, status: true, budgetAmount: true, objective: true, startAt: true, endAt: true, _count: { select: { contents: true } } }, orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.aIRun.groupBy({ by: ["taskType"], where: { workspaceId, createdAt: { gte: since }, status: "SUCCEEDED" }, _sum: { creditsCharged: true }, _count: true }),
  ]);

  // ───── Audience (réel vs simulé, jamais mélangés) ─────
  const audience = (simulated: boolean) => {
    const list = publications.map((p) => p.metrics[0]).filter((m) => m && m.isSimulated === simulated);
    const impressions = list.reduce((n, m) => n + m!.impressions, 0);
    const engagement = list.reduce((n, m) => n + m!.engagement, 0);
    return { publications: list.length, impressions, reach: list.reduce((n, m) => n + m!.reach, 0), engagement, clicks: list.reduce((n, m) => n + m!.clicks, 0), engagementRate: ratio(engagement, impressions) };
  };

  // ───── Ventes (CRM) ─────
  let sales = null as null | Awaited<ReturnType<typeof salesBlock>>;
  if (opts.crm) sales = await salesBlock(workspaceId, since);

  // ───── ROI des campagnes ─────
  const leadsByCampaign = new Map((sales?.leadsByCampaign ?? []).map((c) => [c.campaignId, c]));
  const campaignRows = campaigns.map((c) => {
    const l = leadsByCampaign.get(c.id);
    const leads = l?.leads ?? 0;
    const won = l?.won ?? 0;
    const revenue = l?.revenue ?? 0;
    const budget = c.budgetAmount ?? 0;
    const pubs = publications.filter((p) => p.content.campaignId === c.id);
    const impressions = pubs.reduce((n, p) => n + (p.metrics[0] && !p.metrics[0].isSimulated ? p.metrics[0].impressions : 0), 0);
    return {
      id: c.id,
      name: c.name,
      status: c.status,
      objective: c.objective,
      budget: c.budgetAmount,
      contents: c._count.contents,
      publications: pubs.length,
      impressions,
      leads,
      won,
      revenue,
      costPerLead: budget > 0 && leads > 0 ? Math.round(budget / leads) : null,
      conversionRate: ratio(won, leads),
      roi: budget > 0 && opts.crm ? Math.round(((revenue - budget) / budget) * 1000) / 10 : null,
    };
  });

  // ───── Contenus qui génèrent des leads ─────
  const leadsByContent = new Map((sales?.leadsByContent ?? []).map((c) => [c.contentId, c.leads]));
  const topContents = publications
    .map((p) => ({ contentId: p.contentId, title: p.content.title, provider: p.socialAccount.provider, publishedAt: p.publishedAt, impressions: p.metrics[0]?.impressions ?? 0, engagement: p.metrics[0]?.engagement ?? 0, isSimulated: p.metrics[0]?.isSimulated ?? false, leads: leadsByContent.get(p.contentId) ?? 0 }))
    .sort((a, b) => b.leads - a.leads || b.engagement - a.engagement)
    .slice(0, 8);

  // ───── Séries hebdomadaires ─────
  const weeks: { week: string; publications: number; leads: number; won: number }[] = [];
  for (let w = weekStart(since); w <= now; w = new Date(w.getTime() + 7 * DAY)) weeks.push({ week: w.toISOString().slice(0, 10), publications: 0, leads: 0, won: 0 });
  const bucket = (d: Date | null) => (d ? weeks.find((x) => x.week === weekStart(d).toISOString().slice(0, 10)) : undefined);
  publications.forEach((p) => bucket(p.publishedAt) && bucket(p.publishedAt)!.publications++);
  sales?.leadDates.forEach((d) => bucket(d) && bucket(d)!.leads++);
  sales?.wonDates.forEach((d) => bucket(d) && bucket(d)!.won++);

  const creditsUsed = aiRuns.reduce((n, r) => n + (r._sum.creditsCharged ?? 0), 0);
  const realAudience = audience(false);
  const insights = buildInsights({ sales, campaigns: campaignRows, realAudience, publications: publications.length });

  return {
    period: { days, since, until: now },
    production: { contents, publications: publications.length, creatives, videos },
    audience: { real: realAudience, simulated: audience(true) },
    sales: sales && { ...sales, leadsByCampaign: undefined, leadsByContent: undefined, leadDates: undefined, wonDates: undefined },
    campaigns: campaignRows,
    topContents,
    weekly: weeks,
    ai: { creditsUsed, runs: aiRuns.reduce((n, r) => n + r._count, 0), byTask: aiRuns.map((r) => ({ taskType: r.taskType, runs: r._count, credits: r._sum.creditsCharged ?? 0 })).sort((a, b) => b.credits - a.credits) },
    insights,
    notes: [
      "Le chiffre d'affaires provient de la valeur des leads gagnés saisie dans le CRM.",
      "Les audiences simulées (compte de démonstration) ne sont jamais additionnées aux chiffres réels.",
      "Le ROI d'une campagne n'est calculé que si un budget est renseigné.",
    ],
  };
}

async function salesBlock(workspaceId: string, since: Date) {
  const leads = await prisma.lead.findMany({
    where: { workspaceId, createdAt: { gte: since } },
    select: { id: true, stage: true, source: true, campaignId: true, contentId: true, valueAmount: true, createdAt: true, wonAt: true, lastActivityAt: true },
  });
  const wonInPeriod = await prisma.lead.findMany({ where: { workspaceId, stage: "WON", wonAt: { gte: since } }, select: { valueAmount: true, wonAt: true, campaignId: true } });
  const stale = await prisma.lead.count({ where: { workspaceId, stage: { in: ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL"] }, lastActivityAt: { lt: new Date(Date.now() - 7 * DAY) } } });
  const pipeline = await prisma.lead.aggregate({ where: { workspaceId, stage: { in: ["QUALIFIED", "PROPOSAL"] } }, _sum: { valueAmount: true }, _count: true });

  const funnel = LEAD_STAGES.map((stage) => ({ stage, count: leads.filter((l) => l.stage === stage).length }));
  const sources = new Map<LeadSource, { leads: number; won: number }>();
  for (const l of leads) {
    const s = sources.get(l.source) ?? { leads: 0, won: 0 };
    s.leads++;
    if (l.stage === "WON") s.won++;
    sources.set(l.source, s);
  }
  const byCampaign = new Map<string, { leads: number; won: number; revenue: number }>();
  for (const l of leads) {
    if (!l.campaignId) continue;
    const c = byCampaign.get(l.campaignId) ?? { leads: 0, won: 0, revenue: 0 };
    c.leads++;
    byCampaign.set(l.campaignId, c);
  }
  for (const w of wonInPeriod) {
    if (!w.campaignId) continue;
    const c = byCampaign.get(w.campaignId) ?? { leads: 0, won: 0, revenue: 0 };
    c.won++;
    c.revenue += w.valueAmount ?? 0;
    byCampaign.set(w.campaignId, c);
  }
  const byContent = new Map<string, number>();
  for (const l of leads) if (l.contentId) byContent.set(l.contentId, (byContent.get(l.contentId) ?? 0) + 1);
  const won = wonInPeriod.length;
  const revenue = wonInPeriod.reduce((n, w) => n + (w.valueAmount ?? 0), 0);
  const closed = leads.filter((l) => l.stage === "WON" || l.stage === "LOST").length;

  return {
    newLeads: leads.length,
    won,
    revenue,
    wonWithoutValue: wonInPeriod.filter((w) => !w.valueAmount).length,
    averageDeal: won ? Math.round(revenue / won) : null,
    conversionRate: ratio(leads.filter((l) => l.stage === "WON").length, closed),
    pipelineValue: pipeline._sum.valueAmount ?? 0,
    pipelineCount: pipeline._count,
    staleLeads: stale,
    funnel: funnel as { stage: LeadStage; count: number }[],
    sources: [...sources.entries()].map(([source, v]) => ({ source, label: LEAD_SOURCE_LABELS[source], ...v, conversionRate: ratio(v.won, v.leads) })).sort((a, b) => b.leads - a.leads),
    leadsByCampaign: [...byCampaign.entries()].map(([campaignId, v]) => ({ campaignId, ...v })),
    leadsByContent: [...byContent.entries()].map(([contentId, n]) => ({ contentId, leads: n })),
    leadDates: leads.map((l) => l.createdAt),
    wonDates: wonInPeriod.map((w) => w.wonAt),
  };
}

type Insight = { tone: "success" | "warning" | "info"; text: string };

/** Lectures automatiques et actionnables (règles explicites, pas d'invention). */
function buildInsights(d: { sales: Awaited<ReturnType<typeof salesBlock>> | null; campaigns: { name: string; costPerLead: number | null; roi: number | null; leads: number; won: number; status: string }[]; realAudience: { engagementRate: number | null; publications: number }; publications: number }): Insight[] {
  const out: Insight[] = [];
  const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n).replace(/ /g, " ");
  if (d.sales) {
    const best = d.sales.sources.filter((s) => s.leads >= 3).sort((a, b) => (b.conversionRate ?? 0) - (a.conversionRate ?? 0))[0];
    if (best && (best.conversionRate ?? 0) > 0) out.push({ tone: "success", text: `${best.label} est votre meilleure source : ${best.conversionRate} % des leads deviennent clients. Renforcez ce canal.` });
    if (d.sales.staleLeads > 0) out.push({ tone: "warning", text: `${d.sales.staleLeads} lead(s) sans action depuis plus de 7 jours : relancez-les avant qu'ils ne refroidissent.` });
    if (d.sales.wonWithoutValue > 0) out.push({ tone: "info", text: `${d.sales.wonWithoutValue} vente(s) gagnée(s) sans montant : renseignez la valeur pour un ROI exact.` });
    if (d.sales.pipelineValue > 0) out.push({ tone: "info", text: `${fmt(d.sales.pipelineValue)} FCFA en négociation (${d.sales.pipelineCount} lead(s) qualifiés ou en proposition).` });
  }
  const cpl = d.campaigns.filter((c) => c.costPerLead !== null && c.leads >= 2).sort((a, b) => a.costPerLead! - b.costPerLead!);
  if (cpl.length >= 2) out.push({ tone: "success", text: `« ${cpl[0]!.name} » obtient le coût par lead le plus bas (${fmt(cpl[0]!.costPerLead!)} FCFA). Inspirez-vous de son offre et de ses messages.` });
  // Une campagne n'est jugée non rentable qu'une fois des ventes conclues ou la campagne terminée.
  const losing = d.campaigns.find((c) => c.roi !== null && c.roi < 0 && (c.won > 0 || c.status === "COMPLETED"));
  if (losing) out.push({ tone: "warning", text: `« ${losing.name} » n'est pas encore rentable (ROI ${losing.roi} %). Ajustez l'offre ou le ciblage.` });
  if (d.publications === 0) out.push({ tone: "info", text: "Aucune publication sur la période : programmez au moins 3 contenus par semaine pour nourrir l'audience." });
  else if (d.realAudience.publications === 0) out.push({ tone: "info", text: "Connectez une vraie page Facebook ou Instagram pour mesurer votre audience réelle." });
  return out;
}

/** Export CSV (séparateur « ; » pour Excel en français, BOM UTF-8). */
export function analyticsCsv(a: Awaited<ReturnType<typeof computeAnalytics>>, workspaceName: string): string {
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    // Neutralise les formules (injection CSV) et échappe les guillemets.
    const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
    return /[";\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  const row = (...v: unknown[]) => v.map(esc).join(";");
  const lines = [
    row(`Rapport Forlife Com — ${workspaceName}`),
    row("Période", `${a.period.since.toISOString().slice(0, 10)} → ${a.period.until.toISOString().slice(0, 10)}`),
    "",
    row("Production"),
    row("Contenus créés", a.production.contents),
    row("Publications", a.production.publications),
    row("Visuels générés", a.production.creatives),
    row("Vidéos rendues", a.production.videos),
    "",
    row("Audience réelle"),
    row("Impressions", a.audience.real.impressions),
    row("Portée", a.audience.real.reach),
    row("Engagements", a.audience.real.engagement),
    row("Clics", a.audience.real.clicks),
    row("Taux d'engagement (%)", a.audience.real.engagementRate),
  ];
  if (a.sales) {
    lines.push("", row("Ventes"), row("Nouveaux leads", a.sales.newLeads), row("Ventes gagnées", a.sales.won), row("Chiffre d'affaires (FCFA)", a.sales.revenue), row("Panier moyen (FCFA)", a.sales.averageDeal), row("Taux de conversion (%)", a.sales.conversionRate), row("Valeur en négociation (FCFA)", a.sales.pipelineValue));
    lines.push("", row("Source", "Leads", "Gagnés", "Conversion (%)"), ...a.sales.sources.map((s) => row(s.label, s.leads, s.won, s.conversionRate)));
  }
  lines.push("", row("Campagne", "Statut", "Budget (FCFA)", "Publications", "Impressions réelles", "Leads", "Gagnés", "CA (FCFA)", "Coût par lead (FCFA)", "ROI (%)"));
  lines.push(...a.campaigns.map((c) => row(c.name, c.status, c.budget, c.publications, c.impressions, c.leads, c.won, c.revenue, c.costPerLead, c.roi)));
  lines.push("", row("Crédits IA consommés", a.ai.creditsUsed), "", ...a.notes.map((n) => row(n)));
  return "﻿" + lines.join("\r\n");
}
