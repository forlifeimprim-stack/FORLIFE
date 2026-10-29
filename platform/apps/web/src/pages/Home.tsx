import { Link } from "react-router-dom";
import { CONTENT_STATUS_LABELS, OBJECTIVE_LABELS, type ContentStatus } from "@forlife/shared";
import { useAuth, useWorkspace } from "../lib/auth";
import { useResource } from "../lib/hooks";
import { fmtDate, fmtDateTime, fmtNumber, fmtXof } from "../lib/i18n";
import type { Objective, Recommendation } from "../lib/types";
import { Alert, Badge, Card, Empty, Score } from "../components/ui";
import { Icon, type IconName } from "../components/Icon";
import { AnimatedNumber, ProgressRing, Skeleton, TIPS, celebrate, tipOfTheDay, useStreak } from "../components/Delight";
import { useEffect, useState } from "react";
import { DemoVideoButton } from "../components/DemoVideo";

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
  const streak = useStreak(me?.user.id ?? "anon");
  if (error) return <Alert tone="error">{error}</Alert>;
  if (!data) return <Skeleton />;
  const done = data.setup.filter((s) => s.done).length;
  const pct = Math.round((done / data.setup.length) * 100);
  const c = data.contentByStatus;
  const paidUntil = data.subscription?.paidUntil ? new Date(data.subscription.paidUntil) : null;
  const expiresSoon = paidUntil && data.subscription?.planCode !== "FREE" && paidUntil.getTime() - Date.now() < 7 * 864e5;

  const firstName = me?.user.name.split(" ")[0] ?? "";
  const hour = new Date().getHours();
  const hello = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  // Missions du jour : les 3 actions les plus utiles, tirées des vraies données de l'espace.
  const missions: { icon: IconName; title: string; detail: string; to: string }[] = [];
  const nextSetup = data.setup.find((s) => !s.done);
  if (data.pendingApprovals > 0) missions.push({ icon: "approvals", title: `Valider ${data.pendingApprovals} contenu(s)`, detail: "Ils attendent votre feu vert pour partir.", to: "/approvals" });
  if (data.sales && data.sales.staleLeads > 0) missions.push({ icon: "crm", title: `Relancer ${data.sales.staleLeads} lead(s)`, detail: "Sans action depuis 7 jours : un message WhatsApp suffit.", to: "/crm" });
  if (nextSetup) missions.push({ icon: "strategy", title: nextSetup.label, detail: "Prochaine étape de votre démarrage.", to: `/${nextSetup.to}` });
  if ((c.APPROVED ?? 0) > 0) missions.push({ icon: "calendar", title: `Programmer ${c.APPROVED} contenu(s) approuvé(s)`, detail: "Choisissez le jour et l'heure de publication.", to: "/calendar" });
  if (data.sales && data.sales.tasksDue > 0) missions.push({ icon: "crm", title: `${data.sales.tasksDue} tâche(s) du jour`, detail: "Vos rendez-vous et relances prévus aujourd'hui.", to: "/crm" });
  if ((c.SCHEDULED ?? 0) === 0) missions.push({ icon: "content", title: "Créer le contenu de la semaine", detail: "L'IA rédige pour chaque réseau en un clic.", to: "/content" });
  missions.push({ icon: "copilot", title: "Demander conseil au Copilot", detail: "« Que dois-je faire cette semaine pour vendre plus ? »", to: "/copilot" });
  const todays = missions.slice(0, 3);

  // Badges débloqués à partir des données réelles.
  const published = c.PUBLISHED ?? 0;
  const badges = [
    { icon: "🚀", label: "Premier pas", ok: done >= 1, hint: "Compléter une étape de démarrage" },
    { icon: "🧬", label: "Marque affirmée", ok: data.setup.some((s) => s.key.toLowerCase().includes("brand") && s.done), hint: "Valider votre Brand DNA" },
    { icon: "🎯", label: "Cap fixé", ok: data.objectives.length > 0, hint: "Définir un objectif" },
    { icon: "📣", label: "En ligne", ok: published >= 1, hint: "Publier un premier contenu" },
    { icon: "🔥", label: "Régulier", ok: published >= 10, hint: "Publier 10 contenus" },
    { icon: "💰", label: "Première vente", ok: (data.sales?.wonThisMonth ?? 0) > 0, hint: "Gagner une vente ce mois-ci" },
    { icon: "🏆", label: "Prêt à grandir", ok: pct === 100, hint: "Terminer le démarrage" },
  ];
  const unlocked = badges.filter((b) => b.ok).length;

  return (
    <>
      <section className="hero-banner">
        <div className="hero-banner-glow" aria-hidden="true" />
        <div className="hero-banner-text">
          <p className="eyebrow">{workspace.name}</p>
          <h1>
            {hello} {firstName} <span className="wave" aria-hidden="true">👋</span>
          </h1>
          <p>Que faire aujourd'hui pour faire grandir {workspace.name} ? Voici vos missions du jour.</p>
          <div className="row hero-banner-actions">
            <Link className="btn btn-primary" to="/content">
              Créer un contenu
            </Link>
            <Link className="btn btn-glass" to="/copilot">
              <Icon name="copilot" size={16} /> Demander au Copilot
            </Link>
            <DemoVideoButton label="▶ Démo" variant="ghost" />
          </div>
        </div>
        <div className="hero-banner-side">
          <ProgressRing value={pct} label="Démarrage" />
          <div className="streak" title="Jours consécutifs où vous ouvrez Forlife Com sur cet appareil">
            <span className="flame" aria-hidden="true">
              <Icon name="flame" size={20} />
            </span>
            <div>
              <strong>
                <AnimatedNumber value={streak} /> jour{streak > 1 ? "s" : ""}
              </strong>
              <small>de suite</small>
            </div>
          </div>
        </div>
      </section>

      {expiresSoon && (
        <div style={{ marginBottom: 16 }}>
          <Alert tone="warning">
            Votre plan {data.credits.plan} expire le {fmtDate(paidUntil!.toISOString())}. <Link to="/settings?tab=billing">Renouveler par mobile money</Link>
          </Alert>
        </div>
      )}

      <div className="grid grid-3 missions" style={{ marginBottom: 16 }}>
        {todays.map((m, i) => (
          <Link key={m.title} to={m.to} className="mission">
            <span className="mission-num">{i + 1}</span>
            <span className="mission-icon">
              <Icon name={m.icon} size={20} />
            </span>
            <span className="mission-body">
              <strong>{m.title}</strong>
              <small>{m.detail}</small>
            </span>
            <span className="mission-go" aria-hidden="true">
              →
            </span>
          </Link>
        ))}
      </div>

      {data.sales && (
        <div className="grid grid-4" style={{ marginBottom: 16 }}>
          <Card className="kpi-card-v2">
            <div className="kpi">
              <span className="label">Ventes ce mois-ci</span>
              <span className="value">
                <AnimatedNumber value={data.sales.revenueThisMonth} format={fmtXof} />
              </span>
              <span className="small muted">{data.sales.wonThisMonth} vente(s) gagnée(s)</span>
            </div>
          </Card>
          <Card className="kpi-card-v2">
            <div className="kpi">
              <span className="label">Nouveaux leads (7 j)</span>
              <span className="value">
                <AnimatedNumber value={data.sales.newLeads7d} />
              </span>
              <Link to="/crm" className="small">Ouvrir le CRM</Link>
            </div>
          </Card>
          <Card className="kpi-card-v2">
            <div className="kpi">
              <span className="label">Leads à relancer</span>
              <span className="value" style={data.sales.staleLeads ? { color: "var(--warning)" } : undefined}>
                <AnimatedNumber value={data.sales.staleLeads} />
              </span>
              <span className="small muted">sans action depuis 7 jours</span>
            </div>
          </Card>
          <Card className="kpi-card-v2">
            <div className="kpi">
              <span className="label">Tâches du jour</span>
              <span className="value">
                <AnimatedNumber value={data.sales.tasksDue} />
              </span>
              <Link to="/analytics" className="small">Voir le ROI</Link>
            </div>
          </Card>
        </div>
      )}
      <div className="grid grid-4" style={{ marginBottom: 16 }}>
        <Card className="kpi-card-v2">
          <div className="kpi">
            <span className="label">Score d'audit (estimation IA)</span>
            <span className="value">{data.auditScore != null ? <><AnimatedNumber value={data.auditScore} />/100</> : "—"}</span>
            {data.auditScore == null && <Link to="/strategy" className="small">Générer un audit</Link>}
          </div>
        </Card>
        <Card className="kpi-card-v2">
          <div className="kpi">
            <span className="label">En attente d'approbation</span>
            <span className="value">
              <AnimatedNumber value={data.pendingApprovals} />
            </span>
            {data.pendingApprovals > 0 && <Link to="/approvals" className="small">Valider maintenant</Link>}
          </div>
        </Card>
        <Card className="kpi-card-v2">
          <div className="kpi">
            <span className="label">Contenus programmés</span>
            <span className="value">
              <AnimatedNumber value={c.SCHEDULED ?? 0} />
            </span>
            <span className="small muted">{c.APPROVED ?? 0} approuvé(s) à programmer</span>
          </div>
        </Card>
        <Card className="kpi-card-v2">
          <div className="kpi">
            <span className="label">Crédits IA ({data.credits.plan})</span>
            <span className="value">
              <AnimatedNumber value={data.credits.balance} />
            </span>
            <div className="progress" aria-hidden="true">
              <span style={{ width: `${Math.min(100, (data.credits.balance / data.credits.monthly) * 100)}%` }} />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 16 }}>
        <Card title={`Vos badges — ${unlocked}/${badges.length}`} actions={<Icon name="trophy" />}>
          <BadgeWatcher userId={me?.user.id ?? "anon"} workspaceId={workspace.id} unlocked={badges.filter((b) => b.ok).map((b) => b.label)} />
          <ul className="badges">
            {badges.map((b) => (
              <li key={b.label} className={b.ok ? "ok" : ""} title={b.ok ? "Débloqué" : `À débloquer : ${b.hint}`}>
                <span className="badge-icon" aria-hidden="true">
                  {b.icon}
                </span>
                <strong>{b.label}</strong>
                <small>{b.ok ? "Débloqué" : b.hint}</small>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Astuce du jour" actions={<Icon name="bulb" />}>
          <TipCarousel />
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

/** Astuces : celle du jour, puis les suivantes à la demande. */
function TipCarousel() {
  const [offset, setOffset] = useState(0);
  return (
    <div className="tip">
      <p key={offset}>{tipOfTheDay(offset)}</p>
      <button type="button" className="btn btn-secondary" onClick={() => setOffset((o) => (o + 1) % TIPS.length)}>
        Astuce suivante →
      </button>
    </div>
  );
}

/** Célèbre les badges débloqués depuis la dernière visite (mémorisés sur cet appareil). */
function BadgeWatcher({ userId, workspaceId, unlocked }: { userId: string; workspaceId: string; unlocked: string[] }) {
  const sig = unlocked.join("|");
  useEffect(() => {
    const key = `forlife.badges.${userId}.${workspaceId}`;
    try {
      const raw = localStorage.getItem(key);
      const seen = raw ? (JSON.parse(raw) as string[]) : null;
      localStorage.setItem(key, JSON.stringify(unlocked));
      // Première visite : on mémorise sans fêter l'existant.
      if (!seen) return;
      const fresh = unlocked.filter((b) => !seen.includes(b));
      if (fresh.length) celebrate(`Badge débloqué : ${fresh.join(", ")}`);
    } catch {
      /* stockage indisponible : pas de célébration */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, workspaceId, sig]);
  return null;
}
