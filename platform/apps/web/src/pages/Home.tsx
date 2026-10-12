import { Link } from "react-router-dom";
import { CONTENT_STATUS_LABELS, OBJECTIVE_LABELS, type ContentStatus } from "@forlife/shared";
import { useAuth, useWorkspace } from "../lib/auth";
import { useResource } from "../lib/hooks";
import { fmtDate, fmtDateTime, fmtNumber, fmtXof } from "../lib/i18n";
import type { Objective, Recommendation } from "../lib/types";
import { Alert, Badge, Card, Empty, PageHeader, Score } from "../components/ui";

interface Dashboard {
  setup: { key: string; label: string; done: boolean; to: string }[];
  contentByStatus: Partial<Record<ContentStatus, number>>;
  pendingApprovals: number;
  upcoming: { id: string; title: string; scheduledAt: string }[];
  recommendations: Recommendation[];
  objectives: Objective[];
  auditScore: number | null;
  credits: { balance: number; monthly: number; plan: string };
  aiRunsLast30Days: number;
  sales: { newLeads7d: number; staleLeads: number; wonThisMonth: number; revenueThisMonth: number; tasksDue: number } | null;
  subscription: { planCode: string; paidUntil: string | null } | null;
}

export function Home() {
  const { me } = useAuth();
  const { ws, workspace } = useWorkspace();
  const { data, error } = useResource<Dashboard>(`${ws}/dashboard`);
  if (error) return <Alert tone="error">{error}</Alert>;
  if (!data) return <p className="muted">Chargement…</p>;
  const done = data.setup.filter((s) => s.done).length;
  const pct = Math.round((done / data.setup.length) * 100);
  const c = data.contentByStatus;
  const paidUntil = data.subscription?.paidUntil ? new Date(data.subscription.paidUntil) : null;
  const expiresSoon = paidUntil && data.subscription?.planCode !== "FREE" && paidUntil.getTime() - Date.now() < 7 * 864e5;

  return (
    <>
      <PageHeader
        title={`Bonjour ${me?.user.name.split(" ")[0] ?? ""} 👋`}
        question={`Que faire aujourd'hui pour faire grandir ${workspace.name} ?`}
        actions={
          <Link className="btn btn-primary" to="/content">
            Créer un contenu
          </Link>
        }
      />
      {expiresSoon && (
        <div style={{ marginBottom: 16 }}>
          <Alert tone="warning">
            Votre plan {data.credits.plan} expire le {fmtDate(paidUntil!.toISOString())}. <Link to="/settings?tab=billing">Renouveler par mobile money</Link>
          </Alert>
        </div>
      )}
      {data.sales && (
        <div className="grid grid-4" style={{ marginBottom: 16 }}>
          <Card>
            <div className="kpi">
              <span className="label">Ventes ce mois-ci</span>
              <span className="value">{fmtXof(data.sales.revenueThisMonth)}</span>
              <span className="small muted">{data.sales.wonThisMonth} vente(s) gagnée(s)</span>
            </div>
          </Card>
          <Card>
            <div className="kpi">
              <span className="label">Nouveaux leads (7 j)</span>
              <span className="value">{data.sales.newLeads7d}</span>
              <Link to="/crm" className="small">Ouvrir le CRM</Link>
            </div>
          </Card>
          <Card>
            <div className="kpi">
              <span className="label">Leads à relancer</span>
              <span className="value" style={data.sales.staleLeads ? { color: "var(--warning)" } : undefined}>{data.sales.staleLeads}</span>
              <span className="small muted">sans action depuis 7 jours</span>
            </div>
          </Card>
          <Card>
            <div className="kpi">
              <span className="label">Tâches du jour</span>
              <span className="value">{data.sales.tasksDue}</span>
              <Link to="/analytics" className="small">Voir le ROI</Link>
            </div>
          </Card>
        </div>
      )}
      <div className="grid grid-4" style={{ marginBottom: 16 }}>
        <Card>
          <div className="kpi">
            <span className="label">Score d'audit (estimation IA)</span>
            <span className="value">{data.auditScore != null ? `${data.auditScore}/100` : "—"}</span>
            {data.auditScore == null && <Link to="/strategy" className="small">Générer un audit</Link>}
          </div>
        </Card>
        <Card>
          <div className="kpi">
            <span className="label">En attente d'approbation</span>
            <span className="value">{data.pendingApprovals}</span>
            {data.pendingApprovals > 0 && <Link to="/approvals" className="small">Valider maintenant</Link>}
          </div>
        </Card>
        <Card>
          <div className="kpi">
            <span className="label">Contenus programmés</span>
            <span className="value">{c.SCHEDULED ?? 0}</span>
            <span className="small muted">{c.APPROVED ?? 0} approuvé(s) à programmer</span>
          </div>
        </Card>
        <Card>
          <div className="kpi">
            <span className="label">Crédits IA ({data.credits.plan})</span>
            <span className="value">{fmtNumber(data.credits.balance)}</span>
            <div className="progress" aria-hidden="true">
              <span style={{ width: `${Math.min(100, (data.credits.balance / data.credits.monthly) * 100)}%` }} />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-2">
        <Card title="Recommandations prioritaires" actions={<Badge tone="accent">Impact / effort</Badge>}>
          {data.recommendations.length === 0 ? (
            <Empty title="Aucune recommandation pour l'instant">
              <Link to="/strategy" className="btn btn-secondary">
                Générer un plan stratégique
              </Link>
            </Empty>
          ) : (
            <ul className="list">
              {data.recommendations.map((r) => (
                <li key={r.id}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <strong>{r.title}</strong>
                    <p className="muted small" style={{ margin: "2px 0 0" }}>
                      {r.rationale}
                    </p>
                  </div>
                  <div style={{ display: "grid", gap: 2 }}>
                    <Score label="Impact" value={r.impact} />
                    <Score label="Effort" value={r.effort} />
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="muted small">Les recommandations IA sont des estimations, pas des mesures.</p>
        </Card>

        <Card title={`Démarrage — ${pct} %`}>
          <div className="progress" style={{ marginBottom: 14 }}>
            <span style={{ width: `${pct}%` }} />
          </div>
          <ul className="checklist">
            {data.setup.map((s) => (
              <li key={s.key} className={s.done ? "done" : ""}>
                <span className="tick">{s.done ? "✓" : ""}</span>
                <Link to={`/${s.to}`}>{s.label}</Link>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Objectifs actifs">
          {data.objectives.length === 0 ? (
            <Empty title="Aucun objectif actif" />
          ) : (
            <ul className="list">
              {data.objectives.map((o) => (
                <li key={o.id}>
                  <div>
                    <strong>{o.title}</strong>
                    <div className="muted small">
                      {OBJECTIVE_LABELS[o.type]} · {fmtNumber(o.target)} {o.metric} d'ici le {fmtDate(o.periodEnd)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Prochaines publications" actions={<Link to="/calendar" className="small">Calendrier</Link>}>
          {data.upcoming.length === 0 ? (
            <Empty title="Rien de programmé" />
          ) : (
            <ul className="list">
              {data.upcoming.map((u) => (
                <li key={u.id}>
                  <Link to={`/content/${u.id}`}>{u.title}</Link>
                  <span className="muted small">{fmtDateTime(u.scheduledAt)}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="muted small">
            Pipeline : {(["DRAFT", "REVIEW", "APPROVED", "SCHEDULED", "PUBLISHED"] as ContentStatus[]).map((s) => `${CONTENT_STATUS_LABELS[s]} ${c[s] ?? 0}`).join(" · ")}
          </p>
        </Card>
      </div>
    </>
  );
}
