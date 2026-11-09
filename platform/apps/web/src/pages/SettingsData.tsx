import { useState } from "react";
import { PLANS } from "@forlife/shared";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { errorMessage } from "../lib/hooks";
import { fmtDate } from "../lib/i18n";
import { Alert, Badge, Button, Card, Field, LogoMark } from "../components/ui";

const GRACE_DAYS = 30;
const purgeDate = (requestedAt: string) => new Date(new Date(requestedAt).getTime() + GRACE_DAYS * 86_400_000);

/** Espaces de travail de l'organisation : liste, bascule et création dans la limite du plan. */
export function WorkspacesCard() {
  const { org, workspace, can, reload, selectWorkspace } = useAuth();
  const [form, setForm] = useState({ name: "", sector: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  if (!org) return null;
  const plan = PLANS[org.plan];
  const active = org.workspaces.filter((w) => w.status === "ACTIVE").length;
  const full = active >= plan.maxWorkspaces;

  const create = async () => {
    setBusy(true);
    setErr(null);
    try {
      const ws = await api.post<{ id: string }>(`/orgs/${org.id}/workspaces`, { name: form.name, ...(form.sector.trim() ? { sector: form.sector } : {}) });
      setForm({ name: "", sector: "" });
      await reload();
      selectWorkspace(org.id, ws.id);
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card title={`Espaces de travail (${active} / ${plan.maxWorkspaces})`}>
      <div className="stack">
        <p className="muted small">Un espace par marque, boutique ou client : chacun a son Brand DNA, ses réseaux, ses contenus et son CRM. Les crédits sont partagés par l'organisation.</p>
        <ul className="stack" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {org.workspaces.map((w) => (
            <li key={w.id} className="row" style={{ justifyContent: "space-between" }}>
              <span>
                <b>{w.name}</b> {w.status === "LOCKED" && <Badge tone="warning">Lecture seule</Badge>} {w.id === workspace?.id && <Badge tone="accent">Espace actuel</Badge>}
              </span>
              {w.id !== workspace?.id && (
                <Button variant="ghost" onClick={() => selectWorkspace(org.id, w.id)}>
                  Ouvrir
                </Button>
              )}
            </li>
          ))}
        </ul>
        {can("workspace:create") &&
          (full ? (
            <Alert tone="info">
              Votre plan {plan.name} inclut {plan.maxWorkspaces} espace{plan.maxWorkspaces > 1 ? "s" : ""}. Passez à une offre supérieure (onglet « Plan &amp; crédits ») pour en créer d'autres.
            </Alert>
          ) : (
            <form
              className="grid grid-3"
              onSubmit={(e) => {
                e.preventDefault();
                void create();
              }}
            >
              <Field label="Nom du nouvel espace">
                <input required minLength={2} maxLength={80} value={form.name} placeholder="Ex. Boutique Cocody" onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>
              <Field label="Secteur (facultatif)">
                <input maxLength={80} value={form.sector} placeholder="Ex. Mode, restauration…" onChange={(e) => setForm({ ...form, sector: e.target.value })} />
              </Field>
              <div style={{ alignSelf: "end" }}>
                <Button type="submit" busy={busy}>
                  Créer l'espace
                </Button>
              </div>
            </form>
          ))}
        {err && <Alert tone="error">{err}</Alert>}
      </div>
    </Card>
  );
}

/** Droits sur les données (§22) : export de l'espace et suppression de l'organisation. */
export function DataRightsCard() {
  const { org, workspace, can, reload } = useAuth();
  const [busy, setBusy] = useState<"export" | "delete" | null>(null);
  const [confirmName, setConfirmName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  if (!org || !workspace) return null;

  const exportData = async () => {
    setBusy("export");
    setErr(null);
    try {
      const data = await api.get<{ workspace: { slug: string } }>(`/workspaces/${workspace.id}/export`);
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `forlife-export-${data.workspace.slug}-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  const requestDeletion = async () => {
    if (!confirm(`Supprimer définitivement « ${org.name} » et tous ses espaces ? L'accès est coupé tout de suite ; l'effacement a lieu dans ${GRACE_DAYS} jours.`)) return;
    setBusy("delete");
    setErr(null);
    try {
      await api.post(`/orgs/${org.id}/deletion`, { confirmName });
      await reload();
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card title="Vos données">
      <div className="stack">
        {can("org:update") && (
          <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
            <p className="small" style={{ margin: 0 }}>
              <b>Exporter</b> toutes les données de l'espace « {workspace.name} » (Brand DNA, contenus, campagnes, CRM, statistiques) dans un fichier JSON.
            </p>
            <Button variant="secondary" busy={busy === "export"} onClick={exportData}>
              Télécharger l'export
            </Button>
          </div>
        )}
        {org.role === "OWNER" && (
          <div className="stack danger-zone">
            <p className="small" style={{ margin: 0 }}>
              <b>Supprimer l'organisation</b> : les comptes de réseaux sont déconnectés et l'accès coupé immédiatement. Toutes les données (espaces, contenus, prospects, fichiers) sont
              effacées après {GRACE_DAYS} jours, délai pendant lequel vous pouvez annuler. Les justificatifs de paiement sont conservés comme la loi l'exige.
            </p>
            <Field label={`Pour confirmer, saisissez le nom de l'organisation : ${org.name}`}>
              <input value={confirmName} onChange={(e) => setConfirmName(e.target.value)} autoComplete="off" />
            </Field>
            <div>
              <Button variant="danger" busy={busy === "delete"} disabled={confirmName.trim().toLowerCase() !== org.name.trim().toLowerCase()} onClick={requestDeletion}>
                Supprimer l'organisation
              </Button>
            </div>
          </div>
        )}
        {err && <Alert tone="error">{err}</Alert>}
      </div>
    </Card>
  );
}

/** Écran affiché tant qu'une suppression est en attente : seul le propriétaire peut l'annuler. */
export function DeletionPendingScreen() {
  const { me, org, reload, logout, selectWorkspace } = useAuth();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  if (!me || !org) return null;
  const others = me.organizations.filter((o) => o.id !== org.id && o.status === "ACTIVE" && o.workspaces[0]);
  const cancel = async () => {
    setBusy(true);
    setErr(null);
    try {
      await api.del(`/orgs/${org.id}/deletion`);
      await reload();
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="legal" role="main">
      <div className="legal-body card stack">
        <div className="row">
          <LogoMark size={28} /> <strong>Forlife Com</strong>
        </div>
        <h1>Suppression en cours</h1>
        <p>
          La suppression de l'organisation <b>{org.name}</b> a été demandée
          {org.deletionRequestedAt ? ` le ${fmtDate(org.deletionRequestedAt)}` : ""}. Ses données seront définitivement effacées
          {org.deletionRequestedAt ? ` le ${fmtDate(purgeDate(org.deletionRequestedAt))}` : ` dans ${GRACE_DAYS} jours`}.
        </p>
        {org.role === "OWNER" ? (
          <div>
            <Button busy={busy} onClick={cancel}>
              Annuler la suppression
            </Button>
          </div>
        ) : (
          <p className="muted">Seul le propriétaire de l'organisation peut annuler cette demande.</p>
        )}
        {others.map((o) => (
          <Button key={o.id} variant="secondary" onClick={() => selectWorkspace(o.id, o.workspaces[0]!.id)}>
            Ouvrir {o.name}
          </Button>
        ))}
        {err && <Alert tone="error">{err}</Alert>}
        <div>
          <Button variant="ghost" onClick={() => void logout()}>
            Se déconnecter
          </Button>
        </div>
      </div>
    </main>
  );
}
