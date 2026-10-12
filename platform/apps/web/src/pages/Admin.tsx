import { useState } from "react";
import { Navigate } from "react-router-dom";
import { PLAN_CODES, PLANS, type PlanCode } from "@forlife/shared";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { errorMessage, useResource } from "../lib/hooks";
import { fmtDate, fmtNumber, fmtXof } from "../lib/i18n";
import { Alert, Badge, Button, Card, Empty, Field, Modal, PageHeader } from "../components/ui";

interface Stats {
  organizations: number;
  suspended: number;
  users: number;
  activeWorkspaces: number;
  newOrganizations30d: number;
  byPlan: Record<PlanCode, number>;
  mrrXof: number;
  aiRuns30d: number;
  creditsConsumed30d: number;
  contents30d: number;
}
interface OrgRow {
  id: string;
  name: string;
  status: "ACTIVE" | "SUSPENDED";
  suspendedReason: string | null;
  createdAt: string;
  plan: PlanCode;
  credits: number;
  members: number;
  workspaces: number;
  owner: { name: string; email: string } | null;
}

/** Back-office Forlife Com : pilotage de toutes les organisations clientes. */
export function AdminPage() {
  const { me } = useAuth();
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const stats = useResource<Stats>("/admin/stats");
  const orgs = useResource<OrgRow[]>(`/admin/organizations${search ? `?q=${encodeURIComponent(search)}` : ""}`);
  const [credit, setCredit] = useState<OrgRow | null>(null);
  const [suspend, setSuspend] = useState<OrgRow | null>(null);
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  if (!me?.user.isPlatformAdmin) return <Navigate to="/" replace />;
  const s = stats.data;
  const refresh = () => Promise.all([stats.reload(), orgs.reload()]);
  const act = async (fn: () => Promise<unknown>, ok: string) => {
    setMsg(null);
    try {
      await fn();
      setMsg({ tone: "success", text: ok });
      await refresh();
    } catch (e) {
      setMsg({ tone: "error", text: errorMessage(e) });
    }
  };

  return (
    <>
      <PageHeader title="Back-office Forlife Com" question="Comment se porte la plateforme, et quel client a besoin d'une action ?" />
      {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
      {s && (
        <div className="grid grid-4" style={{ margin: "16px 0" }}>
          <Card>
            <div className="kpi">
              <span className="label">Organisations</span>
              <span className="value">{fmtNumber(s.organizations)}</span>
              <span className="small muted">+{s.newOrganizations30d} sur 30 jours · {s.suspended} suspendue(s)</span>
            </div>
          </Card>
          <Card>
            <div className="kpi">
              <span className="label">Revenu mensuel théorique</span>
              <span className="value">{fmtXof(s.mrrXof)}</span>
              <span className="small muted">{PLAN_CODES.map((p) => `${PLANS[p].name} ${s.byPlan[p] ?? 0}`).join(" · ")}</span>
            </div>
          </Card>
          <Card>
            <div className="kpi">
              <span className="label">Utilisateurs</span>
              <span className="value">{fmtNumber(s.users)}</span>
              <span className="small muted">{s.activeWorkspaces} espaces actifs</span>
            </div>
          </Card>
          <Card>
            <div className="kpi">
              <span className="label">Activité IA (30 j)</span>
              <span className="value">{fmtNumber(s.aiRuns30d)}</span>
              <span className="small muted">{fmtNumber(s.creditsConsumed30d)} crédits · {s.contents30d} contenus</span>
            </div>
          </Card>
        </div>
      )}
      <Card
        title="Organisations clientes"
        actions={
          <form
            className="row"
            onSubmit={(e) => {
              e.preventDefault();
              setSearch(q);
            }}
          >
            <input placeholder="Nom, email du propriétaire…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Rechercher une organisation" style={{ width: 260 }} />
            <Button variant="secondary" type="submit">
              Rechercher
            </Button>
          </form>
        }
      >
        {orgs.data?.length === 0 ? (
          <Empty title="Aucune organisation" />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Organisation</th>
                  <th>Propriétaire</th>
                  <th>Plan</th>
                  <th>Crédits</th>
                  <th>Membres</th>
                  <th>Créée le</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orgs.data?.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <strong>{o.name}</strong>
                      {o.status === "SUSPENDED" && (
                        <div>
                          <Badge tone="danger">Suspendue</Badge> <span className="small muted">{o.suspendedReason}</span>
                        </div>
                      )}
                    </td>
                    <td>
                      {o.owner?.name}
                      <div className="small muted">{o.owner?.email}</div>
                    </td>
                    <td>
                      <select
                        value={o.plan}
                        aria-label={`Plan de ${o.name}`}
                        onChange={(e) => act(() => api.patch(`/admin/organizations/${o.id}/plan`, { planCode: e.target.value }), `Plan de ${o.name} mis à jour`)}
                      >
                        {PLAN_CODES.map((p) => (
                          <option key={p} value={p}>
                            {PLANS[p].name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>{fmtNumber(o.credits)}</td>
                    <td>
                      {o.members} · {o.workspaces} esp.
                    </td>
                    <td>{fmtDate(o.createdAt)}</td>
                    <td>
                      <div className="row">
                        <Button variant="secondary" onClick={() => setCredit(o)}>
                          Crédits
                        </Button>
                        {o.status === "ACTIVE" ? (
                          <Button variant="ghost" onClick={() => setSuspend(o)}>
                            Suspendre
                          </Button>
                        ) : (
                          <Button variant="ghost" onClick={() => act(() => api.post(`/admin/organizations/${o.id}/reactivate`), `${o.name} réactivée`)}>
                            Réactiver
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <CreditModal org={credit} onClose={() => setCredit(null)} onDone={(text) => { setCredit(null); setMsg({ tone: "success", text }); void refresh(); }} />
      <SuspendModal org={suspend} onClose={() => setSuspend(null)} onDone={(text) => { setSuspend(null); setMsg({ tone: "success", text }); void refresh(); }} />
    </>
  );
}

function CreditModal({ org, onClose, onDone }: { org: OrgRow | null; onClose: () => void; onDone: (msg: string) => void }) {
  const [amount, setAmount] = useState(500);
  const [reason, setReason] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Identifiant de requête stable : un double clic ne crédite qu'une fois.
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());
  const submit = async () => {
    if (!org) return;
    setBusy(true);
    setErr(null);
    try {
      await api.post(`/admin/organizations/${org.id}/credits`, { amount, reason, requestId });
      setRequestId(crypto.randomUUID());
      setReason("");
      onDone(`${amount > 0 ? "+" : ""}${amount} crédits pour ${org.name}`);
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal
      open={!!org}
      title={`Ajuster les crédits — ${org?.name ?? ""}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button busy={busy} disabled={!amount || reason.trim().length < 3} onClick={submit}>
            Valider
          </Button>
        </>
      }
    >
      {err && <Alert tone="error">{err}</Alert>}
      <p className="muted small">Solde actuel : {org ? fmtNumber(org.credits) : 0} crédits. Un montant négatif retire des crédits.</p>
      <Field label="Montant">
        <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
      </Field>
      <Field label="Motif (visible dans le ledger du client)">
        <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ex. offre de lancement — 15 premiers" />
      </Field>
    </Modal>
  );
}

function SuspendModal({ org, onClose, onDone }: { org: OrgRow | null; onClose: () => void; onDone: (msg: string) => void }) {
  const [reason, setReason] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const submit = async () => {
    if (!org) return;
    try {
      await api.post(`/admin/organizations/${org.id}/suspend`, { reason });
      setReason("");
      onDone(`${org.name} suspendue`);
    } catch (e) {
      setErr(errorMessage(e));
    }
  };
  return (
    <Modal
      open={!!org}
      title={`Suspendre ${org?.name ?? ""}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="danger" disabled={reason.trim().length < 3} onClick={submit}>
            Suspendre
          </Button>
        </>
      }
    >
      {err && <Alert tone="error">{err}</Alert>}
      <p className="muted small">Les membres ne pourront plus accéder à leurs espaces jusqu'à la réactivation. Aucune donnée n'est supprimée.</p>
      <Field label="Motif">
        <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ex. impayé, abus…" />
      </Field>
    </Modal>
  );
}
