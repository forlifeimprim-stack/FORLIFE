import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { errorMessage } from "../lib/hooks";
import { Alert } from "../components/ui";

/** Confirmation de l'adresse email (lien reçu par email). */
export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const { me, reload } = useAuth();
  const [state, setState] = useState<{ ok: boolean; text: string } | null>(null);
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    api
      .post("/auth/verify-email", { token })
      .then(async () => {
        setState({ ok: true, text: "Adresse confirmée. Vos crédits IA offerts sont disponibles." });
        if (me) await reload();
      })
      .catch((e) => setState({ ok: false, text: errorMessage(e) }));
  }, [token, me, reload]);
  return (
    <div className="auth-main" role="main">
      <div className="auth-card card stack">
        <h1>Confirmation de l'email</h1>
        {!state ? <p className="muted">Vérification…</p> : <Alert tone={state.ok ? "success" : "error"}>{state.text}</Alert>}
        <Link className="btn btn-primary" to={me ? "/" : "/login"}>
          {me ? "Aller à l'accueil" : "Se connecter"}
        </Link>
      </div>
    </div>
  );
}

/** Rappel tant que l'adresse n'est pas confirmée. */
export function VerifyEmailBanner() {
  const { me } = useAuth();
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (!me || me.user.emailVerified) return null;
  const resend = async () => {
    setBusy(true);
    try {
      await api.post("/auth/resend-verification");
      setMsg(`Email envoyé à ${me.user.email}.`);
    } catch (e) {
      setMsg(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div style={{ marginBottom: 16 }}>
      <Alert tone="warning">
        Confirmez votre adresse email ({me.user.email}) pour sécuriser votre compte et recevoir vos 200 crédits IA offerts.{" "}
        <button className="link-button" disabled={busy} onClick={resend}>
          Renvoyer l'email
        </button>
        {msg && <span className="small"> — {msg}</span>}
      </Alert>
    </div>
  );
}
