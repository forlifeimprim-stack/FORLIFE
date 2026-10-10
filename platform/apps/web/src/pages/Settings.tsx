import { useState } from "react";
import { ROLE_LABELS, ROLES, canAssignRole, type PlanDefinition, type Role } from "@forlife/shared";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { errorMessage, useResource } from "../lib/hooks";
import { fmtDateTime, fmtNumber, fmtXof } from "../lib/i18n";
import { Alert, Badge, Button, Card, Empty, PageHeader } from "../components/ui";

type Tab = "members" | "billing" | "audit" | "ai";

export function SettingsPage() {
  const { can } = useAuth();
  const tabs: [Tab, string, boolean][] = [
    ["members", "Équipe", can("members:read")],
    ["billing", "Plan & crédits", can("billing:read")],
    ["audit", "Journal d'audit", can("audit:read")],
    ["ai", "Traçabilité IA", can("ai:read")],
  ];
  const visible = tabs.filter((t) => t[2]);
  const [tab, setTab] = useState<Tab>(visible[0]?.[0] ?? "members");
  return (
    <>
      <PageHeader title="Paramètres" question="Équipe, consommation et gouvernance." />
      <div className="tabs" role="tablist">
        {visible.map(([k, label]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>
            {label}
          </button>
        ))}
      </div>
      {tab === "members" && <Members />}
      {tab === "billing" && <Billing />}
      {tab === "audit" && <Audit />}
      {tab === "ai" && <AiRuns />}
    </>
  );
}

interface Member {
  id: string;
  role: Role;
  allWorkspaces: boolean;
  workspaceIds: string[];
  user: { id: string; email: string; name: string };
}

function Members() {
  const { org, me, can } = useAuth();
  const { data, reload } = useResource<Member[]>(`/orgs/${org!.id}/members`);
  const [f, setF] = useState({ email: "", role: "EDITOR" as Role, workspaceIds: [] as string[] });
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const manage = can("members:manage");
  const restricted = f.role === "AGENCY" || f.role === "CREATOR";

  const add = async () => {
    try {
      await api.post(`/orgs/${org!.id}/members`, { email: f.email, role: f.role, allWorkspaces: !restricted, workspaceIds: restricted ? f.workspaceIds : [] });
      setMsg({ tone: "success", text: "Membre ajouté" });
      setF({ ...f, email: "" });
      void reload();
    } catch (e) {
      setMsg({ tone: "error", text: errorMessage(e) });
    }
  };
  const update = async (id: string, role: Role) => {
    try {
      await api.patch(`/orgs/${org!.id}/members/${id}`, { role });
      void reload();
    } catch (e) {
      setMsg({ tone: "error", text: errorMessage(e) });
    }
  };
  const remove = async (id: string) => {
    if (!confirm("Retirer ce membre de l'organisation ?")) return;
    try {
      await api.del(`/orgs/${org!.id}/members/${id}`);
      void reload();
    } catch (e) {
      setMsg({ tone: "error", text: errorMessage(e) });
    }
  };

  return (
    <div className="stack">
      {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
      {manage && (
        <Card title="Ajouter un membre">
          <div className="stack">
            <div className="row">
              <input type="email" placeholder="email@entreprise.ci" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} style={{ flex: 2, minWidth: 200 }} aria-label="Email" />
              <select value={f.role} onChange={(e) => setF({ ...f, role: e.target.value as Role })} style={{ flex: 1, minWidth: 140 }} aria-label="Rôle">
                {ROLES.filter((r) => canAssignRole(org!.role, r)).map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
              <Button disabled={!f.email || (restricted && f.workspaceIds.length === 0)} onClick={add}>
                Ajouter
              </Button>
            </div>
            {restricted && (
              <div className="checks">
                {org!.workspaces.map((w) => (
                  <label key={w.id} className="check">
                    <input type="checkbox" checked={f.workspaceIds.includes(w.id)} onChange={(e) => setF({ ...f, workspaceIds: e.target.checked ? [...f.workspaceIds, w.id] : f.workspaceIds.filter((x) => x !== w.id) })} />
                    {w.name}
                  </label>
                ))}
              </div>
            )}
            <p className="muted small">La personne doit avoir créé son compte Forlife. Les invitations par email arrivent prochainement.</p>
          </div>
        </Card>
      )}
      <Card title="Membres">
        <ul className="list">
          {data?.map((m) => (
            <li key={m.id}>
              <div>
                <strong>{m.user.name}</strong> {m.user.id === me?.user.id && <Badge>vous</Badge>}
                <div className="muted small">
                  {m.user.email} {!m.allWorkspaces && `· ${m.workspaceIds.length} workspace(s)`}
                </div>
              </div>
              {manage && m.user.id !== me?.user.id && canAssignRole(org!.role, m.role) ? (
                <div className="row">
                  <select value={m.role} onChange={(e) => update(m.id, e.target.value as Role)} aria-label={`Rôle de ${m.user.name}`} style={{ width: "auto" }}>
                    {ROLES.filter((r) => canAssignRole(org!.role, r)).map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </option>
                    ))}
                  </select>
                  <button className="icon-btn" aria-label={`Retirer ${m.user.name}`} onClick={() => remove(m.id)}>
                    ×
                  </button>
                </div>
              ) : (
                <Badge tone="accent">{ROLE_LABELS[m.role]}</Badge>
              )}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

interface BillingData {
  plan: PlanDefinition;
  balance: number;
  lowBalance: boolean;
  subscription: { currentPeriodEnd: string };
  transactions: { id: string; amount: number; balanceAfter: number; kind: string; reason: string; createdAt: string }[];
  usageLast30Days: { kind: string; credits: number; units: number; runs: number }[];
}

function Billing() {
  const { org } = useAuth();
  const { data } = useResource<BillingData>(`/orgs/${org!.id}/billing`);
  if (!data) return <p className="muted">Chargement…</p>;
  return (
    <div className="stack">
      {data.lowBalance && <Alert tone="warning">Votre solde de crédits est bas (moins de 20 % de votre allocation mensuelle).</Alert>}
      <div className="grid grid-3">
        <Card>
          <div className="kpi">
            <span className="label">Plan</span>
            <span className="value">{data.plan.name}</span>
            <span className="small muted">{data.plan.monthlyPriceXof ? `${fmtXof(data.plan.monthlyPriceXof)} / mois` : "Gratuit"}</span>
          </div>
        </Card>
        <Card>
          <div className="kpi">
            <span className="label">Solde</span>
            <span className="value">{fmtNumber(data.balance)}</span>
            <span className="small muted">sur {fmtNumber(data.plan.monthlyCredits)} crédits / mois</span>
          </div>
        </Card>
        <Card>
          <div className="kpi">
            <span className="label">Renouvellement</span>
            <span className="value" style={{ fontSize: "1.1rem" }}>
              {fmtDateTime(data.subscription.currentPeriodEnd)}
            </span>
          </div>
        </Card>
      </div>
      <Card title="Usage des 30 derniers jours (par type)">
        {data.usageLast30Days.length === 0 ? (
          <Empty title="Aucun usage" />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Générations</th>
                <th>Crédits</th>
              </tr>
            </thead>
            <tbody>
              {data.usageLast30Days.map((u) => (
                <tr key={u.kind}>
                  <td>{u.kind === "TEXT" ? "Texte" : u.kind}</td>
                  <td>{u.runs}</td>
                  <td>{fmtNumber(u.credits)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
      <Card title="Ledger de crédits (auditable)">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Opération</th>
                <th>Montant</th>
                <th>Solde</th>
              </tr>
            </thead>
            <tbody>
              {data.transactions.map((t) => (
                <tr key={t.id}>
                  <td>{fmtDateTime(t.createdAt)}</td>
                  <td>{t.reason}</td>
                  <td style={{ color: t.amount < 0 ? "var(--danger)" : "var(--success)" }}>{t.amount > 0 ? `+${t.amount}` : t.amount}</td>
                  <td>{t.balanceAfter}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Audit() {
  const { org } = useAuth();
  const { data } = useResource<{ items: { id: string; action: string; entityType: string; actorName: string | null; createdAt: string; ip: string | null }[] }>(`/orgs/${org!.id}/audit`);
  return (
    <Card title="Journal d'audit (immuable)">
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Acteur</th>
              <th>Action</th>
              <th>Objet</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((a) => (
              <tr key={a.id}>
                <td>{fmtDateTime(a.createdAt)}</td>
                <td>{a.actorName ?? "Système"}</td>
                <td>
                  <code>{a.action}</code>
                </td>
                <td>{a.entityType}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function AiRuns() {
  const { org } = useAuth();
  const { data } = useResource<{ id: string; taskType: string; promptKey: string; promptVersion: number; provider: string | null; model: string | null; status: string; latencyMs: number | null; creditsCharged: number; createdAt: string; error: string | null }[]>(`/orgs/${org!.id}/ai-runs`);
  return (
    <Card title="Traçabilité des générations IA">
      <p className="muted small">Chaque génération enregistre la tâche, la version de l'instruction, le fournisseur, le modèle, la durée et le coût.</p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Tâche</th>
              <th>Fournisseur / modèle</th>
              <th>Statut</th>
              <th>Durée</th>
              <th>Crédits</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((r) => (
              <tr key={r.id}>
                <td>{fmtDateTime(r.createdAt)}</td>
                <td>
                  {r.taskType} <span className="muted small">v{r.promptVersion}</span>
                </td>
                <td>
                  {r.provider ?? "—"} <span className="muted small">{r.model}</span>
                </td>
                <td>
                  <Badge tone={r.status === "SUCCEEDED" ? "success" : r.status === "FAILED" ? "danger" : "warning"}>{r.status}</Badge>
                </td>
                <td>{r.latencyMs != null ? `${(r.latencyMs / 1000).toFixed(1)} s` : "—"}</td>
                <td>{r.creditsCharged}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
