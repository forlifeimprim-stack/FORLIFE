import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  CAMPAIGN_STATUS_LABELS,
  CHANNEL_LABELS,
  CHANNELS,
  LEAD_STAGE_LABELS,
  OBJECTIVE_LABELS,
  OBJECTIVE_TYPES,
  type CampaignStatus,
  type Channel,
  type ContentStatus,
  type LeadStage,
  type ObjectiveType,
} from "@forlife/shared";
import { api } from "../lib/api";
import { useAuth, useWorkspace } from "../lib/auth";
import { errorMessage, useJob, useResource } from "../lib/hooks";
import { fmtDate, fmtXof } from "../lib/i18n";
import { Alert, Badge, Button, Card, ChannelChip, CreditCost, Empty, Field, JobStatus, Modal, PageHeader, StatusBadge } from "../components/ui";
import { ChannelIcon } from "../components/SocialIcon";

interface Campaign {
  id: string;
  name: string;
  objective: ObjectiveType;
  status: CampaignStatus;
  brief: string | null;
  audience: string | null;
  offer: string | null;
  kpiTarget: string | null;
  budgetAmount: number | null;
  channels: Channel[];
  startAt: string | null;
  endAt: string | null;
  _count?: { contents: number; leads: number | null };
  wonCount?: number | null;
  wonValue?: number | null;
}

const statusTone = (s: CampaignStatus) => (s === "ACTIVE" ? "success" : s === "PAUSED" ? "warning" : s === "COMPLETED" ? "neutral" : "accent");

export function CampaignsPage() {
  const { ws } = useWorkspace();
  const { can } = useAuth();
  const { data, reload } = useResource<Campaign[]>(`${ws}/campaigns`);
  const [creating, setCreating] = useState(false);
  return (
    <>
      <PageHeader title="Campagnes" question="Quelle campagne rapporte vraiment, et laquelle lancer ensuite ?" actions={can("campaigns:create") && <Button onClick={() => setCreating(true)}>+ Nouvelle campagne</Button>} />
      {data?.length === 0 ? (
        <Card>
          <Empty title="Aucune campagne">
            <p>Une campagne réunit un objectif, un budget, des contenus et les leads qu'elle génère : vous voyez enfin ce qui rapporte.</p>
          </Empty>
        </Card>
      ) : (
        <div className="grid grid-3">
          {data?.map((c) => (
            <Link key={c.id} to={`/campaigns/${c.id}`} className="card campaign-card">
              <div className="row between">
                <Badge tone={statusTone(c.status)}>{CAMPAIGN_STATUS_LABELS[c.status]}</Badge>
                <span className="small muted">{OBJECTIVE_LABELS[c.objective]}</span>
              </div>
              <h2 style={{ margin: "10px 0 6px" }}>{c.name}</h2>
              <div className="small muted">
                {c.startAt ? fmtDate(c.startAt) : "Sans date"}
                {c.endAt ? ` → ${fmtDate(c.endAt)}` : ""}
                {c.budgetAmount ? ` · budget ${fmtXof(c.budgetAmount)}` : ""}
              </div>
              <div className="row" style={{ marginTop: 12, gap: 16 }}>
                <span>
                  <b>{c._count?.contents ?? 0}</b> <span className="small muted">contenus</span>
                </span>
                {c.wonValue != null && (
                  <>
                    <span>
                      <b>{c._count?.leads ?? 0}</b> <span className="small muted">leads</span>
                    </span>
                    <span>
                      <b>{fmtXof(c.wonValue)}</b> <span className="small muted">gagnés</span>
                    </span>
                  </>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
      <CampaignModal open={creating} ws={ws} onClose={() => setCreating(false)} onSaved={() => { setCreating(false); void reload(); }} />
    </>
  );
}

function CampaignModal({ open, ws, initial, onClose, onSaved }: { open: boolean; ws: string; initial?: Campaign; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({
    name: initial?.name ?? "",
    objective: initial?.objective ?? ("SALES" as ObjectiveType),
    brief: initial?.brief ?? "",
    audience: initial?.audience ?? "",
    offer: initial?.offer ?? "",
    kpiTarget: initial?.kpiTarget ?? "",
    budgetAmount: initial?.budgetAmount ? String(initial.budgetAmount) : "",
    channels: initial?.channels ?? (["FACEBOOK", "INSTAGRAM", "WHATSAPP"] as Channel[]),
    startAt: initial?.startAt?.slice(0, 10) ?? "",
    endAt: initial?.endAt?.slice(0, 10) ?? "",
  });
  const [err, setErr] = useState<string | null>(null);
  const save = async () => {
    setErr(null);
    const body = {
      ...f,
      brief: f.brief || null,
      audience: f.audience || null,
      offer: f.offer || null,
      kpiTarget: f.kpiTarget || null,
      budgetAmount: f.budgetAmount ? Number(f.budgetAmount) : null,
      startAt: f.startAt ? new Date(`${f.startAt}T00:00:00Z`).toISOString() : null,
      endAt: f.endAt ? new Date(`${f.endAt}T23:59:00Z`).toISOString() : null,
    };
    try {
      if (initial) await api.patch(`${ws}/campaigns/${initial.id}`, body);
      else await api.post(`${ws}/campaigns`, body);
      onSaved();
    } catch (e) {
      setErr(errorMessage(e));
    }
  };
  return (
    <Modal
      open={open}
      title={initial ? "Modifier la campagne" : "Nouvelle campagne"}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button disabled={f.name.trim().length < 2} onClick={save}>
            Enregistrer
          </Button>
        </>
      }
    >
      {err && <Alert tone="error">{err}</Alert>}
      <div className="grid grid-2">
        <Field label="Nom">
          <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Ex. Rentrée scolaire 2026" />
        </Field>
        <Field label="Objectif">
          <select value={f.objective} onChange={(e) => setF({ ...f, objective: e.target.value as ObjectiveType })}>
            {OBJECTIVE_TYPES.map((o) => (
              <option key={o} value={o}>
                {OBJECTIVE_LABELS[o]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Début">
          <input type="date" value={f.startAt} onChange={(e) => setF({ ...f, startAt: e.target.value })} />
        </Field>
        <Field label="Fin">
          <input type="date" value={f.endAt} onChange={(e) => setF({ ...f, endAt: e.target.value })} />
        </Field>
        <Field label="Budget (FCFA)" hint="Sert à calculer le coût réel par lead">
          <input type="number" min={0} value={f.budgetAmount} onChange={(e) => setF({ ...f, budgetAmount: e.target.value })} />
        </Field>
        <Field label="Indicateur visé">
          <input value={f.kpiTarget} onChange={(e) => setF({ ...f, kpiTarget: e.target.value })} placeholder="Ex. 40 demandes de devis" />
        </Field>
      </div>
      <Field label="Brief (message central de la campagne)">
        <textarea rows={3} value={f.brief} onChange={(e) => setF({ ...f, brief: e.target.value })} />
      </Field>
      <div className="grid grid-2">
        <Field label="Audience">
          <input value={f.audience} onChange={(e) => setF({ ...f, audience: e.target.value })} placeholder="Ex. parents d'élèves de Bingerville" />
        </Field>
        <Field label="Offre">
          <input value={f.offer} onChange={(e) => setF({ ...f, offer: e.target.value })} placeholder="Ex. -10 % jusqu'au 15 septembre" />
        </Field>
      </div>
      <Field label="Canaux">
        <div className="checks">
          {CHANNELS.map((c) => (
            <label key={c} className="check">
              <input type="checkbox" checked={f.channels.includes(c)} onChange={(e) => setF({ ...f, channels: e.target.checked ? [...f.channels, c] : f.channels.filter((x) => x !== c) })} />
              <ChannelIcon channel={c} />
              {CHANNEL_LABELS[c]}
            </label>
          ))}
        </div>
      </Field>
    </Modal>
  );
}

interface CampaignDetail extends Campaign {
  contents: { id: string; title: string; status: ContentStatus; scheduledAt: string | null; variants: { channel: Channel }[] }[];
  forms: { id: string; slug: string; title: string; submissions: number; active: boolean }[];
  /** null : résultats commerciaux réservés aux rôles ayant accès au CRM. */
  results: { leads: number; byStage: Partial<Record<LeadStage, number>>; wonCount: number; wonValue: number; costPerLead: number | null } | null;
  packCreditCost: { ideas: number; perPost: number };
}

export function CampaignDetailPage() {
  const { id = "" } = useParams();
  const { ws } = useWorkspace();
  const { can, reload: reloadMe } = useAuth();
  const { data: c, error, reload } = useResource<CampaignDetail>(`${ws}/campaigns/${id}`);
  const [editing, setEditing] = useState(false);
  const [count, setCount] = useState(3);
  const [err, setErr] = useState<string | null>(null);
  const pack = useJob(ws);
  if (error) return <Alert tone="error">{error}</Alert>;
  if (!c) return <p className="muted">Chargement…</p>;

  const setStatus = async (status: CampaignStatus) => {
    setErr(null);
    try {
      await api.post(`${ws}/campaigns/${id}/status`, { status });
      await reload();
    } catch (e) {
      setErr(errorMessage(e));
    }
  };
  const genPack = async () => {
    setErr(null);
    try {
      const { jobId } = await api.post<{ jobId: string }>(`${ws}/campaigns/${id}/pack`, { count }, { "idempotency-key": crypto.randomUUID() });
      const res = await pack.track(jobId);
      if (res.status !== "SUCCEEDED") setErr(res.lastError ?? "Échec de la génération");
      // Les contenus se rédigent en arrière-plan : on rafraîchit pour les voir apparaître.
      await reload();
      setTimeout(() => void reload(), 4000);
      void reloadMe();
    } catch (e) {
      setErr(errorMessage(e));
    }
  };
  const estimate = c.packCreditCost.ideas + count * c.packCreditCost.perPost;

  return (
    <>
      <PageHeader
        title={c.name}
        question={`${OBJECTIVE_LABELS[c.objective]}${c.kpiTarget ? ` · cible : ${c.kpiTarget}` : ""}`}
        actions={
          <>
            <Badge tone={statusTone(c.status)}>{CAMPAIGN_STATUS_LABELS[c.status]}</Badge>
            {c.status === "DRAFT" && can("campaigns:approve") && <Button onClick={() => setStatus("ACTIVE")}>Valider et lancer</Button>}
            {c.status === "ACTIVE" && can("campaigns:update") && (
              <Button variant="secondary" onClick={() => setStatus("PAUSED")}>
                Mettre en pause
              </Button>
            )}
            {c.status === "PAUSED" && can("campaigns:approve") && <Button onClick={() => setStatus("ACTIVE")}>Relancer</Button>}
            {["ACTIVE", "PAUSED"].includes(c.status) && can("campaigns:update") && (
              <Button variant="ghost" onClick={() => setStatus("COMPLETED")}>
                Clôturer
              </Button>
            )}
            {c.status !== "COMPLETED" && can("campaigns:update") && (
              <Button variant="ghost" onClick={() => setEditing(true)}>
                Modifier
              </Button>
            )}
          </>
        }
      />
      <div className="stack">
        {err && <Alert tone="error">{err}</Alert>}
        {c.results && (
        <div className="grid grid-4">
          <Card>
            <div className="kpi">
              <span className="label">Leads générés</span>
              <span className="value">{c.results!.leads}</span>
            </div>
          </Card>
          <Card>
            <div className="kpi">
              <span className="label">Ventes gagnées</span>
              <span className="value">{fmtXof(c.results!.wonValue)}</span>
              <span className="small muted">{c.results!.wonCount} affaire(s)</span>
            </div>
          </Card>
          <Card>
            <div className="kpi">
              <span className="label">Budget</span>
              <span className="value">{c.budgetAmount ? fmtXof(c.budgetAmount) : "—"}</span>
            </div>
          </Card>
          <Card>
            <div className="kpi">
              <span className="label">Coût par lead (réel)</span>
              <span className="value">{c.results!.costPerLead != null ? fmtXof(c.results!.costPerLead) : "—"}</span>
              <span className="small muted">budget ÷ leads</span>
            </div>
          </Card>
        </div>
        )}
        <div className="grid grid-2">
          <Card title="Brief central">
            <p style={{ whiteSpace: "pre-wrap", marginTop: 0 }}>{c.brief || <span className="muted">Pas encore de brief.</span>}</p>
            {c.audience && <p className="small">Audience : {c.audience}</p>}
            {c.offer && <p className="small">Offre : {c.offer}</p>}
            <div className="row">
              {c.channels.map((ch) => (
                <ChannelChip key={ch} channel={ch} />
              ))}
            </div>
            <p className="small muted">
              {c.startAt ? `Du ${fmtDate(c.startAt)}` : ""}
              {c.endAt ? ` au ${fmtDate(c.endAt)}` : ""}
            </p>
          </Card>
        {c.results && (
          <Card title="Pipeline de la campagne">
            {c.results!.leads === 0 ? (
              <Empty title="Aucun lead rattaché pour l'instant">
                <Link to="/crm" className="small">
                  Ouvrir le CRM
                </Link>
              </Empty>
            ) : (
              <ul className="list">
                {(Object.keys(c.results!.byStage) as LeadStage[]).map((s) => (
                  <li key={s}>
                    <span>{LEAD_STAGE_LABELS[s]}</span>
                    <b>{c.results!.byStage[s]}</b>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}
        </div>
        <Card
          title="Contenus de la campagne"
          actions={
            can("ai:generate") &&
            c.status !== "COMPLETED" && (
              <div className="row">
                <select value={count} onChange={(e) => setCount(Number(e.target.value))} aria-label="Nombre de contenus" style={{ width: 90 }}>
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
                <Button busy={pack.running} onClick={genPack}>
                  ✦ Générer le pack <CreditCost credits={estimate} />
                </Button>
              </div>
            )
          }
        >
          <JobStatus running={pack.running} label="Le Content Strategist prépare les angles de la campagne…" />
          {c.contents.length === 0 ? (
            <Empty title="Aucun contenu : générez un pack à partir du brief" />
          ) : (
            <ul className="list">
              {c.contents.map((x) => (
                <li key={x.id}>
                  <div>
                    <Link to={`/content/${x.id}`}>
                      <strong>{x.title}</strong>
                    </Link>
                    <div className="row small" style={{ marginTop: 4 }}>
                      {x.variants.map((v) => (
                        <ChannelChip key={v.channel} channel={v.channel} />
                      ))}
                    </div>
                  </div>
                  <StatusBadge status={x.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
      {editing && <CampaignModal open ws={ws} initial={c} onClose={() => setEditing(false)} onSaved={() => { setEditing(false); void reload(); }} />}
    </>
  );
}
