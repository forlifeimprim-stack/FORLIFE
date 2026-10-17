import { celebrate } from "../components/Delight";
import { useState } from "react";
import { LEAD_SOURCE_LABELS, LEAD_SOURCES, LEAD_STAGE_LABELS, LEAD_STAGES, type LeadSource, type LeadStage } from "@forlife/shared";
import { api } from "../lib/api";
import { useAuth, useWorkspace } from "../lib/auth";
import { errorMessage, useJob, useResource } from "../lib/hooks";
import { fmtDate, fmtDateTime, fmtNumber, fmtXof } from "../lib/i18n";
import type { SafetyResult } from "../lib/types";
import { AiNotice, Alert, Badge, Button, Card, CreditCost, Empty, Field, JobStatus, Modal, PageHeader } from "../components/ui";

interface Lead {
  id: string;
  title: string;
  stage: LeadStage;
  source: LeadSource;
  score: number;
  scoreReasons: { label: string; points: number }[];
  valueAmount: number | null;
  revision: number;
  lastActivityAt: string;
  createdAt: string;
  lostReason: string | null;
  contact: { id: string; name: string; phone: string | null; email?: string | null; consentWhatsApp: boolean };
  campaign: { id: string; name: string } | null;
}
interface Pipeline {
  leads: Lead[];
  stats: { byStage: Partial<Record<LeadStage, { count: number; value: number }>>; openValue: number; wonLast30: { count: number; value: number }; newLast30: number; conversionRate: number | null };
  followupCreditCost: number;
}
interface LeadDetail extends Lead {
  activities: { id: string; type: string; body: string; actorId: string | null; createdAt: string }[];
  tasks: { id: string; title: string; dueAt: string | null; doneAt: string | null }[];
  actors: Record<string, string>;
}

const ACTIVITY_LABELS: Record<string, string> = { NOTE: "Note", CALL: "Appel", WHATSAPP: "WhatsApp", EMAIL: "Email", MEETING: "Rendez-vous", STAGE_CHANGE: "Étape", SYSTEM: "Système" };
const waLink = (phone: string | null, text = "") => (phone ? `https://wa.me/${phone.replace(/\D/g, "")}${text ? `?text=${encodeURIComponent(text)}` : ""}` : null);

type Tab = "pipeline" | "tasks" | "forms";

export function CrmPage() {
  const { ws } = useWorkspace();
  const { can } = useAuth();
  const [tab, setTab] = useState<Tab>("pipeline");
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const pipeline = useResource<Pipeline>(`${ws}/crm/pipeline${search ? `?q=${encodeURIComponent(search)}` : ""}`);
  const [openLead, setOpenLead] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [drag, setDrag] = useState<LeadStage | null>(null);

  const move = async (lead: Lead, stage: LeadStage) => {
    if (lead.stage === stage) return;
    let lostReason: string | undefined;
    if (stage === "LOST") {
      lostReason = prompt("Pourquoi cette affaire est-elle perdue ? (prix, délai, concurrent…)") ?? undefined;
      if (!lostReason) return;
    }
    setErr(null);
    try {
      await api.patch(`${ws}/crm/leads/${lead.id}`, { revision: lead.revision, stage, lostReason });
      if (stage === "WON") celebrate(`Vente gagnée avec ${lead.contact.name} ! Bravo.`);
      await pipeline.reload();
    } catch (e) {
      setErr(errorMessage(e));
    }
  };

  const s = pipeline.data?.stats;
  return (
    <>
      <PageHeader
        title="CRM & leads"
        question="Qui relancer aujourd'hui, et combien d'affaires sont en jeu ?"
        actions={can("crm:create") && <Button onClick={() => setCreating(true)}>+ Nouveau lead</Button>}
      />
      {s && (
        <div className="grid grid-4" style={{ marginBottom: 16 }}>
          <Card>
            <div className="kpi">
              <span className="label">Nouveaux leads (30 j)</span>
              <span className="value">{fmtNumber(s.newLast30)}</span>
            </div>
          </Card>
          <Card>
            <div className="kpi">
              <span className="label">Affaires en cours</span>
              <span className="value">{fmtXof(s.openValue)}</span>
              <span className="small muted">valeur estimée saisie</span>
            </div>
          </Card>
          <Card>
            <div className="kpi">
              <span className="label">Gagné (30 j)</span>
              <span className="value">{fmtXof(s.wonLast30.value)}</span>
              <span className="small muted">{s.wonLast30.count} affaire(s)</span>
            </div>
          </Card>
          <Card>
            <div className="kpi">
              <span className="label">Taux de conversion</span>
              <span className="value">{s.conversionRate != null ? `${s.conversionRate} %` : "—"}</span>
              <span className="small muted">gagnés / clos</span>
            </div>
          </Card>
        </div>
      )}
      <div className="tabs" role="tablist">
        {(
          [
            ["pipeline", "Pipeline"],
            ["tasks", "Tâches"],
            ["forms", "Formulaires de capture"],
          ] as [Tab, string][]
        ).map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>
            {l}
          </button>
        ))}
      </div>
      {err && <Alert tone="error">{err}</Alert>}

      {tab === "pipeline" && (
        <>
          <form
            className="row"
            style={{ marginBottom: 12 }}
            onSubmit={(e) => {
              e.preventDefault();
              setSearch(q);
            }}
          >
            <input placeholder="Rechercher un nom, un numéro…" value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 320 }} aria-label="Rechercher un lead" />
            <Button variant="secondary" type="submit">
              Rechercher
            </Button>
          </form>
          <div className="kanban">
            {LEAD_STAGES.map((stage) => {
              const leads = pipeline.data?.leads.filter((l) => l.stage === stage) ?? [];
              return (
                <section
                  key={stage}
                  className={`kanban-col ${drag === stage ? "drop" : ""}`}
                  onDragOver={(e) => {
                    if (!can("crm:update")) return;
                    e.preventDefault();
                    setDrag(stage);
                  }}
                  onDragLeave={() => setDrag(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDrag(null);
                    const lead = pipeline.data?.leads.find((l) => l.id === e.dataTransfer.getData("text/plain"));
                    if (lead) void move(lead, stage);
                  }}
                  aria-label={LEAD_STAGE_LABELS[stage]}
                >
                  <header className="kanban-head">
                    <strong>{LEAD_STAGE_LABELS[stage]}</strong>
                    <span className="muted small">
                      {leads.length} · {fmtXof(leads.reduce((n, l) => n + (l.valueAmount ?? 0), 0))}
                    </span>
                  </header>
                  {leads.map((l) => (
                    <button key={l.id} className="lead-card" draggable={can("crm:update")} onDragStart={(e) => e.dataTransfer.setData("text/plain", l.id)} onClick={() => setOpenLead(l.id)}>
                      <span className="row between">
                        <strong>{l.contact.name}</strong>
                        <span className={`lead-score ${l.score >= 60 ? "hot" : l.score >= 35 ? "warm" : ""}`} title="Score du lead">
                          {l.score}
                        </span>
                      </span>
                      <span className="small">{l.title}</span>
                      <span className="small muted">
                        {LEAD_SOURCE_LABELS[l.source]}
                        {l.campaign ? ` · ${l.campaign.name}` : ""}
                        {l.valueAmount ? ` · ${fmtXof(l.valueAmount)}` : ""}
                      </span>
                    </button>
                  ))}
                </section>
              );
            })}
          </div>
          <p className="muted small">Glissez une carte d'une colonne à l'autre pour faire avancer l'affaire.</p>
        </>
      )}
      {tab === "tasks" && <TasksTab ws={ws} onOpenLead={setOpenLead} />}
      {tab === "forms" && <FormsTab ws={ws} />}

      <NewLeadModal open={creating} ws={ws} onClose={() => setCreating(false)} onCreated={() => { setCreating(false); void pipeline.reload(); }} />
      {openLead && <LeadModal ws={ws} id={openLead} cost={pipeline.data?.followupCreditCost ?? 3} onClose={() => { setOpenLead(null); void pipeline.reload(); }} />}
    </>
  );
}

function NewLeadModal({ open, ws, onClose, onCreated }: { open: boolean; ws: string; onClose: () => void; onCreated: () => void }) {
  const campaigns = useResource<{ id: string; name: string; status: string }[]>(open ? `${ws}/campaigns` : null);
  const empty = { name: "", phone: "", email: "", company: "", title: "", source: "WHATSAPP" as LeadSource, campaignId: "", valueAmount: "", note: "", consent: true };
  const [f, setF] = useState(empty);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    setErr(null);
    try {
      await api.post(`${ws}/crm/leads`, {
        contact: { name: f.name, phone: f.phone || null, email: f.email || null, company: f.company || null, consentWhatsApp: f.consent },
        title: f.title || undefined,
        source: f.source,
        campaignId: f.campaignId || null,
        valueAmount: f.valueAmount ? Number(f.valueAmount) : null,
        note: f.note || null,
      });
      setF(empty);
      onCreated();
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal
      open={open}
      title="Nouveau lead"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button busy={busy} disabled={!f.name || (!f.phone && !f.email)} onClick={submit}>
            Créer
          </Button>
        </>
      }
    >
      {err && <Alert tone="error">{err}</Alert>}
      <div className="grid grid-2">
        <Field label="Nom">
          <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        </Field>
        <Field label="Téléphone / WhatsApp">
          <input type="tel" placeholder="07 00 00 00 00" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
        </Field>
        <Field label="Email (optionnel)">
          <input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        </Field>
        <Field label="Entreprise (optionnel)">
          <input value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} />
        </Field>
        <Field label="Demande">
          <input placeholder="Ex. 200 flyers A5" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
        </Field>
        <Field label="Valeur estimée (FCFA)">
          <input type="number" min={0} value={f.valueAmount} onChange={(e) => setF({ ...f, valueAmount: e.target.value })} />
        </Field>
        <Field label="Source">
          <select value={f.source} onChange={(e) => setF({ ...f, source: e.target.value as LeadSource })}>
            {LEAD_SOURCES.map((s) => (
              <option key={s} value={s}>
                {LEAD_SOURCE_LABELS[s]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Campagne">
          <select value={f.campaignId} onChange={(e) => setF({ ...f, campaignId: e.target.value })}>
            <option value="">Aucune</option>
            {campaigns.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Note">
        <textarea rows={2} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} />
      </Field>
      <label className="check">
        <input type="checkbox" checked={f.consent} onChange={(e) => setF({ ...f, consent: e.target.checked })} />
        La personne accepte d'être recontactée sur WhatsApp
      </label>
    </Modal>
  );
}

function LeadModal({ ws, id, cost, onClose }: { ws: string; id: string; cost: number; onClose: () => void }) {
  const { can } = useAuth();
  const { data: lead, reload } = useResource<LeadDetail>(`${ws}/crm/leads/${id}`);
  const [note, setNote] = useState({ type: "NOTE", body: "" });
  const [value, setValue] = useState<string | null>(null);
  const [task, setTask] = useState({ title: "", dueAt: "" });
  const [err, setErr] = useState<string | null>(null);
  const followup = useJob<{ messages: { tone: string; text: string }[]; phone: string | null; consent: boolean; isSimulated: boolean; safety: SafetyResult }>(ws);

  const run = async (fn: () => Promise<unknown>) => {
    setErr(null);
    try {
      await fn();
      await reload();
    } catch (e) {
      setErr(errorMessage(e));
    }
  };
  const genFollowup = async () => {
    setErr(null);
    try {
      const { jobId } = await api.post<{ jobId: string }>(`${ws}/crm/leads/${id}/followup`);
      const res = await followup.track(jobId);
      if (res.status !== "SUCCEEDED") setErr(res.lastError ?? "Échec de la génération");
    } catch (e) {
      setErr(errorMessage(e));
    }
  };

  return (
    <Modal open title={lead ? `${lead.contact.name} — ${lead.title}` : "Chargement…"} onClose={onClose}>
      {err && <Alert tone="error">{err}</Alert>}
      {lead && (
        <div className="stack">
          <div className="row">
            <Badge tone="accent">{LEAD_STAGE_LABELS[lead.stage]}</Badge>
            <Badge>{LEAD_SOURCE_LABELS[lead.source]}</Badge>
            {lead.campaign && <Badge>{lead.campaign.name}</Badge>}
            {lead.contact.consentWhatsApp ? <Badge tone="success">Accord WhatsApp</Badge> : <Badge tone="warning">Pas d'accord WhatsApp</Badge>}
          </div>
          <div className="grid grid-2">
            <div>
              <div className="small muted">Contact</div>
              <div>{lead.contact.phone ?? "—"}</div>
              {lead.contact.email && <div className="small">{lead.contact.email}</div>}
              {waLink(lead.contact.phone) && (
                <a className="btn btn-secondary" style={{ marginTop: 8 }} href={waLink(lead.contact.phone)!} target="_blank" rel="noreferrer">
                  Ouvrir WhatsApp
                </a>
              )}
              {can("crm:delete") && (
                <Button
                  variant="danger"
                  style={{ marginTop: 8, marginLeft: 8 }}
                  onClick={async () => {
                    if (!confirm(`Effacer ${lead.contact.name} et tout son historique (prospects, échanges, tâches) ? Cette action est définitive.`)) return;
                    try {
                      await api.del(`${ws}/crm/contacts/${lead.contact.id}`);
                      onClose();
                    } catch (e) {
                      setErr(errorMessage(e));
                    }
                  }}
                >
                  Effacer le contact
                </Button>
              )}
            </div>
            <div>
              <div className="small muted">Score {lead.score}/100</div>
              <ul className="small" style={{ margin: "4px 0 0", paddingLeft: 18 }}>
                {lead.scoreReasons.map((r) => (
                  <li key={r.label}>
                    {r.label} (+{r.points})
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {can("crm:update") && (
            <div className="row">
              <span className="small muted">Valeur estimée :</span>
              <input type="number" min={0} style={{ width: 160 }} value={value ?? lead.valueAmount ?? ""} onChange={(e) => setValue(e.target.value)} aria-label="Valeur estimée en FCFA" />
              {value !== null && (
                <Button variant="secondary" onClick={() => run(async () => { await api.patch(`${ws}/crm/leads/${id}`, { revision: lead.revision, valueAmount: value ? Number(value) : null }); setValue(null); })}>
                  Enregistrer
                </Button>
              )}
            </div>
          )}

          {can("ai:generate") && can("crm:update") && (
            <Card title="Relance assistée" actions={<Button variant="secondary" busy={followup.running} onClick={genFollowup}>✦ Proposer des messages <CreditCost credits={cost} /></Button>}>
              <JobStatus running={followup.running} label="Le Sales Copilot rédige vos relances…" />
              {followup.job?.status === "SUCCEEDED" && followup.job.result && (
                <div className="stack">
                  <AiNotice simulated={followup.job.result.isSimulated} safety={followup.job.result.safety} />
                  {!followup.job.result.consent && <Alert tone="warning">Ce contact n'a pas donné son accord pour être contacté sur WhatsApp : demandez-le avant tout envoi.</Alert>}
                  {followup.job.result.messages.map((m) => (
                    <div key={m.tone} className="followup">
                      <div className="small muted">{m.tone}</div>
                      <p style={{ margin: "4px 0 8px", whiteSpace: "pre-wrap" }}>{m.text}</p>
                      {waLink(followup.job!.result!.phone, m.text) && (
                        <a
                          className="btn btn-primary"
                          href={waLink(followup.job!.result!.phone, m.text)!}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => void api.post(`${ws}/crm/leads/${id}/activities`, { type: "WHATSAPP", body: `Relance envoyée : ${m.text}` }).then(reload)}
                        >
                          Envoyer sur WhatsApp
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {can("crm:update") && (
            <div className="stack">
              <div className="row">
                <select value={note.type} onChange={(e) => setNote({ ...note, type: e.target.value })} style={{ width: 150 }} aria-label="Type d'échange">
                  {["NOTE", "CALL", "WHATSAPP", "EMAIL", "MEETING"].map((t) => (
                    <option key={t} value={t}>
                      {ACTIVITY_LABELS[t]}
                    </option>
                  ))}
                </select>
                <input placeholder="Résumé de l'échange…" value={note.body} onChange={(e) => setNote({ ...note, body: e.target.value })} style={{ flex: 1, minWidth: 180 }} aria-label="Résumé" />
                <Button variant="secondary" disabled={!note.body.trim()} onClick={() => run(async () => { await api.post(`${ws}/crm/leads/${id}/activities`, note); setNote({ ...note, body: "" }); })}>
                  Ajouter
                </Button>
              </div>
              <div className="row">
                <input placeholder="Tâche : rappeler, envoyer le devis…" value={task.title} onChange={(e) => setTask({ ...task, title: e.target.value })} style={{ flex: 1, minWidth: 180 }} aria-label="Nouvelle tâche" />
                <input type="date" value={task.dueAt} onChange={(e) => setTask({ ...task, dueAt: e.target.value })} style={{ width: 160 }} aria-label="Échéance" />
                <Button variant="secondary" disabled={!task.title.trim()} onClick={() => run(async () => { await api.post(`${ws}/crm/tasks`, { title: task.title, dueAt: task.dueAt ? new Date(`${task.dueAt}T09:00:00Z`).toISOString() : null, leadId: id }); setTask({ title: "", dueAt: "" }); })}>
                  Planifier
                </Button>
              </div>
            </div>
          )}
          {lead.tasks.length > 0 && (
            <ul className="list">
              {lead.tasks.map((t) => (
                <li key={t.id}>
                  <label className="row">
                    <input type="checkbox" style={{ width: "auto" }} checked={!!t.doneAt} onChange={(e) => run(() => api.patch(`${ws}/crm/tasks/${t.id}`, { done: e.target.checked }))} />
                    <span style={{ textDecoration: t.doneAt ? "line-through" : undefined }}>{t.title}</span>
                  </label>
                  <span className="small muted">{t.dueAt ? fmtDate(t.dueAt) : ""}</span>
                </li>
              ))}
            </ul>
          )}
          <div>
            <h3>Historique</h3>
            <ul className="list">
              {lead.activities.map((a) => (
                <li key={a.id}>
                  <div style={{ flex: 1 }}>
                    <Badge>{ACTIVITY_LABELS[a.type] ?? a.type}</Badge> <span className="small">{a.body}</span>
                  </div>
                  <span className="small muted">
                    {a.actorId ? lead.actors[a.actorId] : "Système"} · {fmtDateTime(a.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Modal>
  );
}

function TasksTab({ ws, onOpenLead }: { ws: string; onOpenLead: (id: string) => void }) {
  const { data, reload } = useResource<{ id: string; title: string; dueAt: string | null; lead: { id: string; title: string; contact: { name: string } } | null }[]>(`${ws}/crm/tasks`);
  const now = Date.now();
  return (
    <Card title="Tâches à faire">
      {data?.length === 0 ? (
        <Empty title="Aucune tâche en attente. Bravo !" />
      ) : (
        <ul className="list">
          {data?.map((t) => (
            <li key={t.id}>
              <label className="row" style={{ flex: 1 }}>
                <input type="checkbox" style={{ width: "auto" }} onChange={() => api.patch(`${ws}/crm/tasks/${t.id}`, { done: true }).then(reload)} />
                <span>{t.title}</span>
                {t.lead && (
                  <button className="btn btn-ghost" onClick={() => onOpenLead(t.lead!.id)}>
                    {t.lead.contact.name}
                  </button>
                )}
              </label>
              {t.dueAt && <Badge tone={new Date(t.dueAt).getTime() < now ? "danger" : "neutral"}>{fmtDate(t.dueAt)}</Badge>}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function FormsTab({ ws }: { ws: string }) {
  const { can } = useAuth();
  const forms = useResource<{ id: string; slug: string; title: string; submissions: number; active: boolean; campaign: { name: string } | null }[]>(`${ws}/crm/forms`);
  const campaigns = useResource<{ id: string; name: string }[]>(`${ws}/campaigns`);
  const [f, setF] = useState({ title: "", description: "", campaignId: "" });
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const create = async () => {
    try {
      await api.post(`${ws}/crm/forms`, { title: f.title, description: f.description || null, campaignId: f.campaignId || null });
      setF({ title: "", description: "", campaignId: "" });
      void forms.reload();
    } catch (e) {
      setErr(errorMessage(e));
    }
  };
  const link = (slug: string) => `${location.origin}/f/${slug}`;
  return (
    <div className="stack">
      {can("crm:create") && (
        <Card title="Nouveau formulaire">
          {err && <Alert tone="error">{err}</Alert>}
          <p className="muted small">Un lien à partager en bio, en statut WhatsApp ou dans vos publicités : chaque inscription arrive directement dans votre pipeline, avec l'accord WhatsApp de la personne.</p>
          <div className="grid grid-2">
            <Field label="Titre">
              <input placeholder="Ex. Recevez notre catalogue" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
            </Field>
            <Field label="Campagne liée">
              <select value={f.campaignId} onChange={(e) => setF({ ...f, campaignId: e.target.value })}>
                <option value="">Aucune</option>
                {campaigns.data?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Description (optionnelle)">
            <input value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
          </Field>
          <div style={{ marginTop: 12 }}>
            <Button disabled={f.title.trim().length < 2} onClick={create}>
              Créer le formulaire
            </Button>
          </div>
        </Card>
      )}
      <Card title="Formulaires">
        {forms.data?.length === 0 ? (
          <Empty title="Aucun formulaire" />
        ) : (
          <ul className="list">
            {forms.data?.map((x) => (
              <li key={x.id}>
                <div>
                  <strong>{x.title}</strong> {!x.active && <Badge tone="warning">Désactivé</Badge>}
                  <div className="small muted">
                    {x.submissions} inscription(s){x.campaign ? ` · ${x.campaign.name}` : ""}
                  </div>
                </div>
                <div className="row">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      void navigator.clipboard?.writeText(link(x.slug));
                      setCopied(x.id);
                    }}
                  >
                    {copied === x.id ? "Lien copié ✓" : "Copier le lien"}
                  </Button>
                  {can("crm:update") && (
                    <Button variant="ghost" onClick={() => api.patch(`${ws}/crm/forms/${x.id}`, { active: !x.active }).then(forms.reload)}>
                      {x.active ? "Désactiver" : "Activer"}
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
