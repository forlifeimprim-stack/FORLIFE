import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { CHANNEL_LABELS, CHANNELS, OBJECTIVE_LABELS, OBJECTIVE_TYPES, type Channel, type ObjectiveType } from "@forlife/shared";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { errorMessage } from "../lib/hooks";
import { Alert, Button, Field } from "../components/ui";
import { AuthAside } from "./AuthAside";

const SECTORS = ["Commerce de détail", "Mode et textile", "Restauration", "Beauté et cosmétique", "Éducation et formation", "Imprimerie et communication", "BTP et immobilier", "Santé", "Services aux entreprises", "Agriculture et agroalimentaire", "Événementiel", "Autre"];

/** Onboarding guidé (§6) : compte → entreprise → objectif & canaux. Aucune intervention humaine requise. */
export function Signup() {
  const { completeSignup } = useAuth();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [f, setF] = useState({
    name: "",
    email: "",
    password: "",
    organizationName: "",
    sector: SECTORS[0]!,
    city: "",
    offerSummary: "",
    targetSummary: "",
    channels: ["FACEBOOK", "INSTAGRAM", "WHATSAPP"] as Channel[],
    objectiveType: "LEADS" as ObjectiveType,
    objectiveTitle: "Recevoir plus de demandes clients",
    metric: "demandes WhatsApp",
    target: 30,
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (step < 2) return setStep(step + 1);
    setBusy(true);
    setError(null);
    try {
      const res = await api.post<{ accessToken: string; workspaceId: string }>("/auth/signup", {
        name: f.name,
        email: f.email,
        password: f.password,
        organizationName: f.organizationName,
        sector: f.sector,
        country: "CI",
        city: f.city || undefined,
        offerSummary: f.offerSummary || undefined,
        targetSummary: f.targetSummary || undefined,
        channels: f.channels,
        objective: { type: f.objectiveType, title: f.objectiveTitle, metric: f.metric, target: Number(f.target) },
      });
      await completeSignup(res.accessToken, res.workspaceId);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <AuthAside />
      <div className="auth-main">
        <form className="auth-card card" onSubmit={submit}>
          <div className="steps" aria-label={`Étape ${step + 1} sur 3`}>
            {[0, 1, 2].map((i) => (
              <span key={i} className={i <= step ? "on" : ""} />
            ))}
          </div>
          {error && <Alert tone="error">{error}</Alert>}

          {step === 0 && (
            <>
              <h1>Créez votre compte</h1>
              <Field label="Votre nom">
                <input required minLength={2} autoComplete="name" value={f.name} onChange={(e) => set("name", e.target.value)} />
              </Field>
              <Field label="Email professionnel">
                <input type="email" required autoComplete="email" value={f.email} onChange={(e) => set("email", e.target.value)} />
              </Field>
              <Field label="Mot de passe" hint="10 caractères minimum">
                <input type="password" required minLength={10} autoComplete="new-password" value={f.password} onChange={(e) => set("password", e.target.value)} />
              </Field>
            </>
          )}

          {step === 1 && (
            <>
              <h1>Votre entreprise</h1>
              <Field label="Nom de l'entreprise ou de la marque">
                <input required minLength={2} value={f.organizationName} onChange={(e) => set("organizationName", e.target.value)} />
              </Field>
              <div className="grid grid-2">
                <Field label="Secteur">
                  <select value={f.sector} onChange={(e) => set("sector", e.target.value)}>
                    {SECTORS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Ville">
                  <input placeholder="Abidjan, Bingerville…" value={f.city} onChange={(e) => set("city", e.target.value)} />
                </Field>
              </div>
              <Field label="Que vendez-vous ?">
                <textarea rows={2} placeholder="Ex. impression de bâches, flyers et t-shirts personnalisés" value={f.offerSummary} onChange={(e) => set("offerSummary", e.target.value)} />
              </Field>
              <Field label="À qui ?">
                <textarea rows={2} placeholder="Ex. PME, écoles et associations de la commune" value={f.targetSummary} onChange={(e) => set("targetSummary", e.target.value)} />
              </Field>
            </>
          )}

          {step === 2 && (
            <>
              <h1>Votre objectif prioritaire</h1>
              <p className="muted">Forlife Com construit tout à partir de vos objectifs : stratégie avant génération.</p>
              <Field label="Type d'objectif">
                <select value={f.objectiveType} onChange={(e) => set("objectiveType", e.target.value as ObjectiveType)}>
                  {OBJECTIVE_TYPES.map((o) => (
                    <option key={o} value={o}>
                      {OBJECTIVE_LABELS[o]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Objectif">
                <input required value={f.objectiveTitle} onChange={(e) => set("objectiveTitle", e.target.value)} />
              </Field>
              <div className="grid grid-2">
                <Field label="Indicateur">
                  <input required value={f.metric} onChange={(e) => set("metric", e.target.value)} />
                </Field>
                <Field label="Cible (3 mois)">
                  <input type="number" min={1} required value={f.target} onChange={(e) => set("target", Number(e.target.value))} />
                </Field>
              </div>
              <Field label="Canaux utilisés">
                <div className="checks">
                  {CHANNELS.map((c) => (
                    <label key={c} className="check">
                      <input
                        type="checkbox"
                        checked={f.channels.includes(c)}
                        onChange={(e) => set("channels", e.target.checked ? [...f.channels, c] : f.channels.filter((x) => x !== c))}
                      />
                      {CHANNEL_LABELS[c]}
                    </label>
                  ))}
                </div>
              </Field>
            </>
          )}

          <div className="row between">
            {step > 0 ? (
              <Button type="button" variant="ghost" onClick={() => setStep(step - 1)}>
                Retour
              </Button>
            ) : (
              <Link to="/" className="small">
                J'ai déjà un compte
              </Link>
            )}
            <Button type="submit" busy={busy}>
              {step < 2 ? "Continuer" : "Créer mon espace"}
            </Button>
          </div>
          {step === 2 && <p className="muted small">Plan Free : 200 crédits IA offerts chaque mois, sans carte bancaire.</p>}
        </form>
      </div>
    </div>
  );
}
