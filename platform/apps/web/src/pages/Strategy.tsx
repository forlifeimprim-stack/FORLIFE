import { Skeleton } from "../components/Delight";
import { useState } from "react";
import { CHANNEL_LABELS, CHANNELS, OBJECTIVE_LABELS, OBJECTIVE_TYPES, type Channel, type ObjectiveType } from "@forlife/shared";
import { api } from "../lib/api";
import { useAuth, useWorkspace } from "../lib/auth";
import { errorMessage, useJob, useResource } from "../lib/hooks";
import { fmtDate, fmtDateTime, fmtNumber } from "../lib/i18n";
import type { Objective, Recommendation, SafetyResult } from "../lib/types";
import { AiNotice, Alert, Badge, Button, Card, CreditCost, Empty, Field, JobStatus, PageHeader, Score, TagList } from "../components/ui";
import { ChannelIcon } from "../components/SocialIcon";

interface Profile {
  version: number;
  sector: string;
  country: string;
  city: string | null;
  offerSummary: string | null;
  targetSummary: string | null;
  differentiators: string | null;
  channels: Channel[];
  createdAt: string;
}
interface PlanContent {
  auditScore: number;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  smartObjectives: { title: string; metric: string; target: string; deadline: string }[];
  pillars: { name: string; description: string }[];
  weeklyPlan: { week: number; focus: string; actions: string[] }[];
  isSimulated?: boolean;
  safety?: SafetyResult;
}
interface Plan {
  id: string;
  title: string;
  period: string;
  status: "DRAFT" | "APPROVED" | "SUPERSEDED";
  summary: string;
  content: PlanContent;
  businessProfileVersion: number | null;
  createdAt: string;
}
interface StrategyData {
  profile: Profile | null;
  audiences: { id: string; name: string; persona: string | null; pains: string[] }[];
  competitors: { id: string; name: string; url: string | null; notes: string | null }[];
  objectives: Objective[];
  plans: Plan[];
  recommendations: Recommendation[];
  planCreditCost: number;
}

export function StrategyPage() {
  const { ws } = useWorkspace();
  const { can, reload: reloadMe } = useAuth();
  const { data, error, reload } = useResource<StrategyData>(`${ws}/strategy`);
  const { running, track } = useJob(ws);
  const [period, setPeriod] = useState<"MONTHLY" | "QUARTERLY">("MONTHLY");
  const [err, setErr] = useState<string | null>(null);

  if (error) return <Alert tone="error">{error}</Alert>;
  if (!data) return <Skeleton />;

  const generate = async () => {
    setErr(null);
    try {
      const { jobId } = await api.post<{ jobId: string }>(`${ws}/strategy/plans/generate`, { period }, { "idempotency-key": crypto.randomUUID() });
      const final = await track(jobId);
      if (final.status !== "SUCCEEDED") setErr(final.lastError ?? "La génération a échoué");
      await reload();
      void reloadMe();
    } catch (e) {
      setErr(errorMessage(e));
    }
  };

  const plan = data.plans[0];

  return (
    <>
      <PageHeader
        title="Stratégie"
        question="Où voulons-nous aller, pour qui, et par quels moyens ?"
        actions={
          can("ai:generate") && (
            <>
              <select value={period} onChange={(e) => setPeriod(e.target.value as "MONTHLY" | "QUARTERLY")} aria-label="Période du plan" style={{ width: "auto" }}>
                <option value="MONTHLY">Plan mensuel</option>
                <option value="QUARTERLY">Plan trimestriel</option>
              </select>
              <Button busy={running} onClick={generate}>
                ✦ Générer audit & plan <CreditCost credits={data.planCreditCost} />
              </Button>
            </>
          )
        }
      />
      <div className="stack">
        <JobStatus running={running} label="Le Business Strategist analyse votre contexte…" error={err} />
        {plan && <PlanView ws={ws} plan={plan} onChange={reload} />}

        <div className="grid grid-2">
          <ObjectivesCard ws={ws} objectives={data.objectives} onChange={reload} />
          <RecommendationsCard ws={ws} items={data.recommendations} onChange={reload} />
        </div>
        <ProfileCard ws={ws} profile={data.profile} onChange={reload} />
        <div className="grid grid-2">
          <SimpleListCard
            title="Audiences"
            ws={ws}
            path="audiences"
            items={data.audiences.map((a) => ({ id: a.id, title: a.name, sub: a.persona }))}
            fields={[
              { key: "name", label: "Nom de l'audience", required: true },
              { key: "persona", label: "Description (persona)" },
            ]}
            onChange={reload}
          />
          <SimpleListCard
            title="Concurrents"
            ws={ws}
            path="competitors"
            items={data.competitors.map((c) => ({ id: c.id, title: c.name, sub: c.notes }))}
            fields={[
              { key: "name", label: "Nom", required: true },
              { key: "notes", label: "Ce qu'ils font bien / moins bien" },
            ]}
            onChange={reload}
          />
        </div>
        {data.plans.length > 1 && (
          <Card title="Plans précédents">
            <ul className="list">
              {data.plans.slice(1).map((p) => (
                <li key={p.id}>
                  <span>{p.title}</span>
                  <span className="muted small">
                    {fmtDateTime(p.createdAt)} · {p.status === "APPROVED" ? "validé" : p.status === "DRAFT" ? "brouillon" : "archivé"}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </>
  );
}

function PlanView({ ws, plan, onChange }: { ws: string; plan: Plan; onChange: () => void }) {
  const { can } = useAuth();
  const [busy, setBusy] = useState(false);
  const c = plan.content;
  return (
    <Card
      title={plan.title}
      actions={
        <>
          <Badge tone={plan.status === "APPROVED" ? "success" : "warning"}>{plan.status === "APPROVED" ? "Plan validé" : "Brouillon"}</Badge>
          {plan.status === "DRAFT" && can("strategy:approve") && (
            <Button
              busy={busy}
              onClick={async () => {
                setBusy(true);
                await api.post(`${ws}/strategy/plans/${plan.id}/approve`).finally(() => setBusy(false));
                onChange();
              }}
            >
              Valider le plan
            </Button>
          )}
        </>
      }
    >
      <div className="stack">
        <AiNotice simulated={c.isSimulated} safety={c.safety} />
        <p>{plan.summary}</p>
        <p className="muted small">
          Généré le {fmtDateTime(plan.createdAt)} à partir du profil business v{plan.businessProfileVersion ?? "?"} et de vos objectifs actifs.
        </p>
        <div className="grid grid-4">
          <div className="kpi">
            <span className="label">Score d'audit (estimation)</span>
            <span className="value">{c.auditScore}/100</span>
          </div>
          <div>
            <h3>Forces</h3>
            <TagList items={c.strengths} />
          </div>
          <div>
            <h3>Faiblesses</h3>
            <TagList items={c.weaknesses} />
          </div>
          <div>
            <h3>Opportunités</h3>
            <TagList items={c.opportunities} />
          </div>
        </div>
        <div className="grid grid-2">
          <div>
            <h3>Objectifs SMART</h3>
            <ul>
              {c.smartObjectives.map((o) => (
                <li key={o.title}>
                  {o.title} — {o.target} {o.metric} avant le {o.deadline}
                </li>
              ))}
            </ul>
            <h3>Piliers de contenu</h3>
            <ul>
              {c.pillars.map((p) => (
                <li key={p.name}>
                  <b>{p.name}</b> : {p.description}
                </li>
              ))}
            </ul>
            {plan.status === "DRAFT" && <p className="muted small">Les piliers alimenteront le Content Studio dès validation du plan.</p>}
          </div>
          <div>
            <h3>Plan d'action</h3>
            <div className="table-wrap" tabIndex={0}>
              <table>
                <thead>
                  <tr>
                    <th>Sem.</th>
                    <th>Focus</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {c.weeklyPlan.map((w) => (
                    <tr key={w.week}>
                      <td>{w.week}</td>
                      <td>{w.focus}</td>
                      <td>{w.actions.join(" · ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function ObjectivesCard({ ws, objectives, onChange }: { ws: string; objectives: Objective[]; onChange: () => void }) {
  const { can } = useAuth();
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const end = new Date();
  end.setMonth(end.getMonth() + 3);
  const [f, setF] = useState({ type: "SALES" as ObjectiveType, title: "", metric: "", target: 10, periodEnd: end.toISOString().slice(0, 10) });
  const add = async () => {
    try {
      await api.post(`${ws}/objectives`, { ...f, periodStart: new Date().toISOString(), periodEnd: new Date(f.periodEnd).toISOString() });
      setOpen(false);
      setF({ ...f, title: "", metric: "" });
      onChange();
    } catch (e) {
      setErr(errorMessage(e));
    }
  };
  return (
    <Card title="Objectifs" actions={can("strategy:create") && <Button variant="secondary" onClick={() => setOpen(!open)}>+ Objectif</Button>}>
      {open && (
        <div className="stack" style={{ marginBottom: 14 }}>
          {err && <Alert tone="error">{err}</Alert>}
          <div className="grid grid-2">
            <Field label="Type">
              <select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value as ObjectiveType })}>
                {OBJECTIVE_TYPES.map((o) => (
                  <option key={o} value={o}>
                    {OBJECTIVE_LABELS[o]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Échéance">
              <input type="date" value={f.periodEnd} onChange={(e) => setF({ ...f, periodEnd: e.target.value })} />
            </Field>
          </div>
          <Field label="Objectif">
            <input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Ex. Vendre la nouvelle collection" />
          </Field>
          <div className="grid grid-2">
            <Field label="Indicateur">
              <input value={f.metric} onChange={(e) => setF({ ...f, metric: e.target.value })} placeholder="commandes" />
            </Field>
            <Field label="Cible">
              <input type="number" min={1} value={f.target} onChange={(e) => setF({ ...f, target: Number(e.target.value) })} />
            </Field>
          </div>
          <Button disabled={!f.title || !f.metric} onClick={add}>
            Ajouter l'objectif
          </Button>
        </div>
      )}
      {objectives.length === 0 ? (
        <Empty title="Aucun objectif" />
      ) : (
        <ul className="list">
          {objectives.map((o) => (
            <li key={o.id}>
              <div>
                <strong>{o.title}</strong>
                <div className="muted small">
                  {OBJECTIVE_LABELS[o.type]} · {fmtNumber(o.target)} {o.metric} · échéance {fmtDate(o.periodEnd)}
                </div>
              </div>
              <Badge tone={o.status === "ACTIVE" ? "accent" : "neutral"}>{o.status === "ACTIVE" ? "Actif" : o.status === "ACHIEVED" ? "Atteint" : "Abandonné"}</Badge>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function RecommendationsCard({ ws, items, onChange }: { ws: string; items: Recommendation[]; onChange: () => void }) {
  const { can } = useAuth();
  const set = (id: string, status: string) => api.patch(`${ws}/recommendations/${id}`, { status }).then(onChange);
  return (
    <Card title="Recommandations">
      {items.length === 0 ? (
        <Empty title="Générez un plan pour obtenir des recommandations priorisées" />
      ) : (
        <ul className="list">
          {items.map((r) => (
            <li key={r.id}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <strong>{r.title}</strong> {r.status === "ACCEPTED" && <Badge tone="success">Acceptée</Badge>}
                <p className="muted small" style={{ margin: "2px 0 6px" }}>
                  {r.rationale}
                </p>
                <div className="row">
                  <Score label="Impact" value={r.impact} />
                  <Score label="Effort" value={r.effort} />
                  {r.isEstimate && <Badge>Estimation</Badge>}
                </div>
              </div>
              {can("strategy:update") && (
                <div className="row">
                  {r.status === "OPEN" && (
                    <Button variant="secondary" onClick={() => set(r.id, "ACCEPTED")}>
                      Accepter
                    </Button>
                  )}
                  {r.status === "ACCEPTED" && (
                    <Button variant="secondary" onClick={() => set(r.id, "DONE")}>
                      Fait
                    </Button>
                  )}
                  <Button variant="ghost" onClick={() => set(r.id, "DISMISSED")}>
                    Ignorer
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function ProfileCard({ ws, profile, onChange }: { ws: string; profile: Profile | null; onChange: () => void }) {
  const { can } = useAuth();
  const ro = !can("strategy:update");
  const [f, setF] = useState({
    sector: profile?.sector ?? "",
    city: profile?.city ?? "",
    offerSummary: profile?.offerSummary ?? "",
    targetSummary: profile?.targetSummary ?? "",
    differentiators: profile?.differentiators ?? "",
    channels: profile?.channels ?? [],
  });
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const save = async () => {
    try {
      const p = await api.put<Profile>(`${ws}/business-profile`, { ...f, country: profile?.country ?? "CI" });
      setMsg({ tone: "success", text: `Profil enregistré (version ${p.version})` });
      onChange();
    } catch (e) {
      setMsg({ tone: "error", text: errorMessage(e) });
    }
  };
  return (
    <Card title={`Profil business${profile ? ` — v${profile.version}` : ""}`} actions={!ro && <Button variant="secondary" onClick={save}>Enregistrer une nouvelle version</Button>}>
      {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
      <div className="grid grid-2">
        <Field label="Secteur">
          <input disabled={ro} value={f.sector} onChange={(e) => setF({ ...f, sector: e.target.value })} />
        </Field>
        <Field label="Ville">
          <input disabled={ro} value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} />
        </Field>
        <Field label="Offre">
          <textarea disabled={ro} rows={2} value={f.offerSummary} onChange={(e) => setF({ ...f, offerSummary: e.target.value })} />
        </Field>
        <Field label="Cible">
          <textarea disabled={ro} rows={2} value={f.targetSummary} onChange={(e) => setF({ ...f, targetSummary: e.target.value })} />
        </Field>
        <Field label="Différenciation">
          <textarea disabled={ro} rows={2} value={f.differentiators} onChange={(e) => setF({ ...f, differentiators: e.target.value })} />
        </Field>
        <Field label="Canaux">
          <div className="checks">
            {CHANNELS.map((c) => (
              <label key={c} className="check">
                <input type="checkbox" disabled={ro} checked={f.channels.includes(c)} onChange={(e) => setF({ ...f, channels: e.target.checked ? [...f.channels, c] : f.channels.filter((x) => x !== c) })} />
                <ChannelIcon channel={c} />
                {CHANNEL_LABELS[c]}
              </label>
            ))}
          </div>
        </Field>
      </div>
    </Card>
  );
}

function SimpleListCard({
  title,
  ws,
  path,
  items,
  fields,
  onChange,
}: {
  title: string;
  ws: string;
  path: string;
  items: { id: string; title: string; sub: string | null }[];
  fields: { key: string; label: string; required?: boolean }[];
  onChange: () => void;
}) {
  const { can } = useAuth();
  const [f, setF] = useState<Record<string, string>>({});
  const [err, setErr] = useState<string | null>(null);
  const add = async () => {
    try {
      await api.post(`${ws}/${path}`, Object.fromEntries(Object.entries(f).filter(([, v]) => v.trim())));
      setF({});
      onChange();
    } catch (e) {
      setErr(errorMessage(e));
    }
  };
  return (
    <Card title={title}>
      {err && <Alert tone="error">{err}</Alert>}
      {items.length === 0 ? (
        <Empty title={`Aucun élément`} />
      ) : (
        <ul className="list">
          {items.map((i) => (
            <li key={i.id}>
              <div>
                <strong>{i.title}</strong>
                {i.sub && <div className="muted small">{i.sub}</div>}
              </div>
              {can("strategy:delete") && (
                <button className="icon-btn" aria-label={`Supprimer ${i.title}`} onClick={() => api.del(`${ws}/${path}/${i.id}`).then(onChange)}>
                  ×
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {can("strategy:create") && (
        <div className="stack" style={{ marginTop: 12 }}>
          {fields.map((fd) => (
            <input key={fd.key} placeholder={fd.label} aria-label={fd.label} value={f[fd.key] ?? ""} onChange={(e) => setF({ ...f, [fd.key]: e.target.value })} />
          ))}
          <Button variant="secondary" disabled={fields.some((fd) => fd.required && !f[fd.key]?.trim())} onClick={add}>
            Ajouter
          </Button>
        </div>
      )}
    </Card>
  );
}
