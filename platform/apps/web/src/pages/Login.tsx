import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { errorMessage } from "../lib/hooks";
import { t } from "../lib/i18n";
import { Alert, Button, Field } from "../components/ui";
import { AuthAside } from "./AuthAside";

export function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <AuthAside />
      <div className="auth-main" role="main">
        <form className="auth-card card" onSubmit={submit}>
          <h1>Connexion</h1>
          <p className="muted">{t("app.tagline")}</p>
          {error && <Alert tone="error">{error}</Alert>}
          <Field label="Email">
            <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Mot de passe">
            <input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          <Button busy={busy} type="submit">
            Se connecter
          </Button>
          <p className="muted small">
            <Link to="/forgot-password">Mot de passe oublié ?</Link>
          </p>
          <p className="muted small">
            Pas encore de compte ? <Link to="/signup">Créer mon espace gratuitement</Link>
          </p>
          <p className="muted small legal-links">
            <Link to="/conditions">Conditions d'utilisation</Link> · <Link to="/confidentialite">Confidentialité</Link> · <Link to="/suppression-des-donnees">Suppression des données</Link>
          </p>
          <p className="muted small">
            Besoin d'aide ? WhatsApp et appels : <a href="https://wa.me/2250779590562" target="_blank" rel="noreferrer">+225 07 79 59 05 62</a> · <a href="https://wa.me/2250585801856" target="_blank" rel="noreferrer">+225 05 85 80 18 56</a>
          </p>
        </form>
      </div>
    </div>
  );
}
