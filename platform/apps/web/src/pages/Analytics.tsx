import { useState } from "react";
import { Link } from "react-router-dom";
import { LEAD_STAGE_LABELS, OBJECTIVE_LABELS, SOCIAL_PROVIDER_LABELS, type LeadStage, type ObjectiveType, type SocialProvider } from "@forlife/shared";
import { fetchBlobUrl } from "../lib/api";
import { useAuth, useWorkspace } from "../lib/auth";
import { useResource } from "../lib/hooks";
import { fmtNumber, fmtXof } from "../lib/i18n";
import { Alert, Badge, Button, Card, Empty, PageHeader } from "../components/ui";

interface Audience {
  publications: number;
  impressions: number;
  reach: number;
  engagement: number;
  clicks: number;
  engagementRate: number | null;
}
interface Analytics {
  period: { days: number; since: string; until: string };
  production: { contents: number; publications: number; creatives: number; videos: number };
  audience: { real: Audience; simulated: Audience };
  sales: null | {
    newLeads: number;
    won: number;
    revenue: number;
    averageDeal: number | null;
    conversionRate: number | null;
    pipelineValue: number;
    pipelineCount: number;
    staleLeads: number;
    funnel: { stage: LeadStage; count: number }[];
    sources: { source: string; label: string; leads: number; won: number; conversionRate: number | null }[];
  };
  campaigns: { id: string; name: string; status: string; objective: ObjectiveType; budget: number | null; publications: number; impressions: number; leads: number; won: number; revenue: number; costPerLead: number | null; conversionRate: number | null; roi: number | null }[];
  topContents: { contentId: string; title: string; provider: SocialProvider; impressions: number; engagement: number; isSimulated: boolean; leads: number }[];
  weekly: { week: string; publications: number; leads: number; won: number }[];
  ai: { creditsUsed: number; runs: number; byTask: { taskType: string; runs: number; credits: number }[] };
  insights: { tone: "success" | "warning" | "info"; text: string }[];
  notes: string[];
}

const PERIODS = [7, 30, 90, 365] as const;
const TASK_LABELS: Record<string, string> = {
  "brand.dna": "Brand DNA",
  "strategy.plan": "Stratégie",
  "content.ideas": "Idées de contenus",
  "content.post": "Rédaction de posts",
  "crm.followup": "Relances CRM",
  "copilot.chat": "AI Copilot",
  "creative.concepts": "Concepts visuels",
  "creative.render": "Versions de visuels",
  "video.storyboard": "Storyboards vidéo",
  "video.render": "Rendus vidéo",
  "campaign.pack": "Packs de campagne",
};

/** Analytics & ROI : ce qui a été produit, ce qui a touché l'audience, ce qui a fait vendre. */
export function AnalyticsPage() {
  const { ws } = useWorkspace();
  const { workspace } = useAuth();
  const [days, setDays] = useState<(typeof PERIODS)[number]>(30);
  const { data, error } = useResource<Analytics>(`${ws}/analytics?days=${days}`);

  const exportCsv = async () => {
    const url = await fetchBlobUrl(`${ws}/analytics/report.csv?days=${days}`);
    const a = document.createElement("a");
    a.href = url;
    a.download = `forlife-rapport-${workspace?.name ?? "espace"}-${days}j.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader
        title="Analytics & ROI"
        question="Qu'est-ce qui nous a vraiment rapporté des clients ?"
        actions={
          <div className="row no-print">
            <div className="segmented" role="radiogroup" aria-label="Période">
              {PERIODS.map((d) => (
                <button key={d} role="radio" aria-checked={days === d} className={days === d ? "on" : ""} onClick={() => setDays(d)}>
                  {d === 365 ? "12 mois" : `${d} j`}
                </button>
              ))}
            </div>
            <Button variant="secondary" onClick={exportCsv}>
              Export Excel (CSV)
            </Button>
            <Button variant="ghost" onClick={() => window.print()}>
              Imprimer / PDF
            </Button>
          </div>
        }
      />
      {error && <Alert tone="error">{error}</Alert>}
      {!data ? (
        <p className="muted">Chargement…</p>
      ) : (
        <div className="stack report">
          <p className="print-only small">
            Rapport {workspace?.name} — du {new Date(data.period.since).toLocaleDateString("fr-FR")} au {new Date(data.period.until).toLocaleDateString("fr-FR")}
          </p>
          {data.insights.length > 0 && (
            <Card title="À retenir">
              <ul className="insights">
                {data.insights.map((i) => (
                  <li key={i.text} className={i.tone}>
                    {i.text}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {data.sales && (
            <div className="grid grid-4">
              <Kpi label="Chiffre d'affaires" value={fmtXof(data.sales.revenue)} hint={`${data.sales.won} vente(s) gagnée(s)`} />
              <Kpi label="Nouveaux leads" value={fmtNumber(data.sales.newLeads)} hint={data.sales.conversionRate !== null ? `${data.sales.conversionRate} % de conversion` : "conversion : pas encore de lead clôturé"} />
              <Kpi label="Panier moyen" value={data.sales.averageDeal ? fmtXof(data.sales.averageDeal) : "—"} />
              <Kpi label="En négociation" value={fmtXof(data.sales.pipelineValue)} hint={`${data.sales.pipelineCount} lead(s) chauds`} />
            </div>
          )}

          <div className="grid grid-2">
            {data.sales && (
              <Card title="Entonnoir de vente">
                <Funnel steps={data.sales.funnel} />
                {data.sales.staleLeads > 0 && (
                  <p className="small" style={{ color: "var(--warning)" }}>
                    {data.sales.staleLeads} lead(s) à relancer · <Link to="/crm">Ouvrir le CRM</Link>
                  </p>
                )}
              </Card>
            )}
            {data.sales && (
              <Card title="Sources de leads">
                {data.sales.sources.length === 0 ? (
                  <Empty title="Aucun lead sur la période" />
                ) : (
                  <Bars rows={data.sales.sources.map((s) => ({ label: s.label, value: s.leads, extra: `${s.won} gagné(s)${s.conversionRate !== null ? ` · ${s.conversionRate} %` : ""}` }))} />
                )}
              </Card>
            )}
          </div>

          <Card title="Évolution hebdomadaire">
            <Weekly weeks={data.weekly} />
          </Card>

          <Card title="ROI des campagnes">
            {data.campaigns.length === 0 ? (
              <Empty title="Aucune campagne sur la période">
                <Link to="/campaigns">Créer une campagne</Link>
              </Empty>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Campagne</th>
                      <th>Budget</th>
                      <th>Publications</th>
                      <th>Leads</th>
                      <th>Gagnés</th>
                      <th>CA</th>
                      <th>Coût / lead</th>
                      <th>ROI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.campaigns.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <Link to={`/campaigns/${c.id}`}>{c.name}</Link>
                          <div className="small muted">{OBJECTIVE_LABELS[c.objective]}</div>
                        </td>
                        <td>{c.budget ? fmtXof(c.budget) : "—"}</td>
                        <td>{c.publications}</td>
                        <td>{c.leads}</td>
                        <td>{c.won}</td>
                        <td>{data.sales ? fmtXof(c.revenue) : "—"}</td>
                        <td>{c.costPerLead !== null ? fmtXof(c.costPerLead) : "—"}</td>
                        <td>{c.roi !== null ? <Badge tone={c.roi >= 0 ? "success" : "danger"}>{c.roi > 0 ? "+" : ""}{c.roi} %</Badge> : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <div className="grid grid-2">
            <Card title="Audience réelle">
              <div className="grid grid-2">
                <Kpi label="Impressions" value={fmtNumber(data.audience.real.impressions)} />
                <Kpi label="Engagements" value={fmtNumber(data.audience.real.engagement)} hint={data.audience.real.engagementRate !== null ? `${data.audience.real.engagementRate} % d'engagement` : undefined} />
                <Kpi label="Portée" value={fmtNumber(data.audience.real.reach)} />
                <Kpi label="Clics" value={fmtNumber(data.audience.real.clicks)} />
              </div>
              {data.audience.simulated.publications > 0 && (
                <p className="small muted">
                  + {fmtNumber(data.audience.simulated.impressions)} impressions simulées (compte de démonstration), jamais additionnées.
                </p>
              )}
            </Card>
            <Card title="Production">
              <div className="grid grid-2">
                <Kpi label="Contenus créés" value={fmtNumber(data.production.contents)} />
                <Kpi label="Publications" value={fmtNumber(data.production.publications)} />
                <Kpi label="Visuels générés" value={fmtNumber(data.production.creatives)} />
                <Kpi label="Vidéos rendues" value={fmtNumber(data.production.videos)} />
              </div>
            </Card>
          </div>

          <Card title="Contenus les plus performants">
            {data.topContents.length === 0 ? (
              <Empty title="Aucune publication sur la période" />
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Contenu</th>
                      <th>Réseau</th>
                      <th>Impressions</th>
                      <th>Engagements</th>
                      <th>Leads attribués</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topContents.map((c) => (
                      <tr key={c.contentId + c.provider}>
                        <td>
                          <Link to={`/content/${c.contentId}`}>{c.title}</Link>
                        </td>
                        <td>{SOCIAL_PROVIDER_LABELS[c.provider]}</td>
                        <td>
                          {fmtNumber(c.impressions)} {c.isSimulated && <Badge tone="warning">simulé</Badge>}
                        </td>
                        <td>{fmtNumber(c.engagement)}</td>
                        <td>{c.leads}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card title={`Crédits IA consommés : ${fmtNumber(data.ai.creditsUsed)}`}>
            {data.ai.byTask.length === 0 ? <Empty title="Aucune génération sur la période" /> : <Bars rows={data.ai.byTask.map((t) => ({ label: TASK_LABELS[t.taskType] ?? t.taskType, value: t.credits, extra: `${t.runs} génération(s)` }))} />}
          </Card>

          <ul className="small muted">
            {data.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <div className="kpi">
        <span className="label">{label}</span>
        <span className="value">{value}</span>
        {hint && <span className="small muted">{hint}</span>}
      </div>
    </Card>
  );
}

function Funnel({ steps }: { steps: { stage: LeadStage; count: number }[] }) {
  const max = Math.max(1, ...steps.map((s) => s.count));
  return (
    <div className="funnel">
      {steps.map((s) => (
        <div key={s.stage} className="funnel-row">
          <span className="small">{LEAD_STAGE_LABELS[s.stage]}</span>
          <div className="funnel-bar">
            <span style={{ width: `${(s.count / max) * 100}%`, background: s.stage === "WON" ? "var(--success)" : s.stage === "LOST" ? "var(--border)" : "var(--accent)" }} />
          </div>
          <strong className="small">{s.count}</strong>
        </div>
      ))}
    </div>
  );
}

function Bars({ rows }: { rows: { label: string; value: number; extra?: string }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="funnel">
      {rows.map((r) => (
        <div key={r.label} className="funnel-row">
          <span className="small">{r.label}</span>
          <div className="funnel-bar">
            <span style={{ width: `${(r.value / max) * 100}%`, background: "var(--accent)" }} />
          </div>
          <span className="small">
            <strong>{fmtNumber(r.value)}</strong> {r.extra && <span className="muted">{r.extra}</span>}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Histogramme SVG léger (aucune dépendance graphique). */
function Weekly({ weeks }: { weeks: { week: string; publications: number; leads: number; won: number }[] }) {
  const max = Math.max(1, ...weeks.flatMap((w) => [w.publications, w.leads]));
  const shown = weeks.slice(-26);
  const bw = 100 / shown.length;
  return (
    <div>
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="weekly" role="img" aria-label="Publications et leads par semaine">
        {shown.map((w, i) => (
          <g key={w.week}>
            <rect x={i * bw + bw * 0.12} width={bw * 0.36} y={40 - (w.publications / max) * 38} height={(w.publications / max) * 38} fill="var(--border)" />
            <rect x={i * bw + bw * 0.52} width={bw * 0.36} y={40 - (w.leads / max) * 38} height={(w.leads / max) * 38} fill="var(--accent)" />
          </g>
        ))}
      </svg>
      <div className="row between small muted">
        <span>Semaine du {new Date(shown[0]!.week).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>
        <span>
          <span className="legend" style={{ background: "var(--border)" }} /> Publications <span className="legend" style={{ background: "var(--accent)" }} /> Leads
        </span>
        <span>Cette semaine</span>
      </div>
    </div>
  );
}
