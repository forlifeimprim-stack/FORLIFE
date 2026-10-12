import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { errorMessage } from "../lib/hooks";
import { Alert, Button, Field } from "../components/ui";
import { AuthAside } from "./AuthAside";

interface InviteInfo {
  organizationName: string;
  email: string;
  roleLabel: string;
  accountExists: boolean;
}

/** Acceptation d'une invitation : avec le compte connecté, en se connectant, ou en créant son compte. */
export function InvitePage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const { me, login, adoptSession, reload, selectWorkspace } = useAuth();
  const navigate = useNavigate();
  const [info, setInfo] = useState<InviteInfo | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ name: "", password: "" });

  useEffect(() => {
    api.get<InviteInfo>(`/invitations/${token}`).then(setInfo).catch((e) => setErr(errorMessage(e)));
  }, [token]);

  const finish = async (organizationId: string) => {
    await reload();
    const fresh = await api.get<{ organizations: { id: string; workspaces: { id: string }[] }[] }>("/me");
    const ws = fresh.organizations.find((o) => o.id === organizationId)?.workspaces[0];
    if (ws) selectWorkspace(organizationId, ws.id);
    navigate("/");
  };

  const accept = async (e?: FormEvent) => {
    e?.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      if (!me && info?.accountExists) await login(info.email, f.password);
      const res = await api.post<{ accessToken?: string; organizationId: string }>(`/invitations/${token}/accept`, me || info?.accountExists ? {} : f);
      if (res.accessToken) await adoptSession(res.accessToken);
      await finish(res.organizationId);
    } catch (e2) {
      setErr(errorMessage(e2));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <AuthAside />
      <div className="auth-main">
        <form className="auth-card card" onSubmit={accept}>
          <h1>Invitation</h1>
          {err && <Alert tone="error">{err}</Alert>}
          {!info && !err && <p className="muted">Chargement…</p>}
          {info && (
            <>
              <p>
                Vous êtes invité(e) à rejoindre <strong>{info.organizationName}</strong> en tant que <strong>{info.roleLabel}</strong>.
              </p>
              {me ? (
                me.user.email === info.email ? (
                  <Button busy={busy} type="submit">
                    Rejoindre {info.organizationName}
                  </Button>
                ) : (
                  <Alert tone="warning">Cette invitation est destinée à {info.email}. Déconnectez-vous puis ouvrez à nouveau le lien.</Alert>
                )
              ) : info.accountExists ? (
                <>
                  <p className="muted small">Un compte existe déjà pour {info.email} : saisissez votre mot de passe.</p>
                  <Field label="Mot de passe">
                    <input type="password" required autoComplete="current-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
                  </Field>
                  <Button busy={busy} type="submit">
                    Se connecter et rejoindre
                  </Button>
                </>
              ) : (
                <>
                  <Field label="Email">
                    <input value={info.email} disabled />
                  </Field>
                  <Field label="Votre nom">
                    <input required minLength={2} autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
                  </Field>
                  <Field label="Mot de passe" hint="10 caractères minimum">
                    <input type="password" required minLength={10} autoComplete="new-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
                  </Field>
                  <Button busy={busy} type="submit">
                    Créer mon compte et rejoindre
                  </Button>
                </>
              )}
            </>
          )}
        </form>
      </div>
    </div>
  );
}
