import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { errorMessage } from "../lib/hooks";
import { Alert, Button, Field } from "../components/ui";
import { AuthAside } from "./AuthAside";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (e2) {
      setErr(errorMessage(e2));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="auth">
      <AuthAside />
      <div className="auth-main" role="main">
        <form className="auth-card card" onSubmit={submit}>
          <h1>Mot de passe oublié</h1>
          {err && <Alert tone="error">{err}</Alert>}
          {sent ? (
            <Alert tone="success">Si un compte existe pour {email}, un email avec un lien de réinitialisation vient d'être envoyé (valable 1 heure).</Alert>
          ) : (
            <>
              <Field label="Email du compte">
                <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </Field>
              <Button busy={busy} type="submit">
                Recevoir le lien
              </Button>
            </>
          )}
          <Link to="/" className="small">
            Retour à la connexion
          </Link>
        </form>
      </div>
    </div>
  );
}

export function ResetPassword() {
  const [params] = useSearchParams();
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await api.post("/auth/reset-password", { token: params.get("token"), password });
      setDone(true);
    } catch (e2) {
      setErr(errorMessage(e2));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="auth">
      <AuthAside />
      <div className="auth-main" role="main">
        <form className="auth-card card" onSubmit={submit}>
          <h1>Nouveau mot de passe</h1>
          {err && <Alert tone="error">{err}</Alert>}
          {done ? (
            <Alert tone="success">
              Mot de passe modifié. <Link to="/">Connectez-vous</Link> avec votre nouveau mot de passe.
            </Alert>
          ) : (
            <>
              <Field label="Nouveau mot de passe" hint="10 caractères minimum">
                <input type="password" required minLength={10} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </Field>
              <Button busy={busy} type="submit">
                Enregistrer
              </Button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
