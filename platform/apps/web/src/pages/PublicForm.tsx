import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api";
import { errorMessage } from "../lib/hooks";
import { Alert, Button, Field, LogoMark } from "../components/ui";

/** Formulaire public de capture (liste d'attente, demande de devis, catalogue…). */
export function PublicFormPage() {
  const { slug = "" } = useParams();
  const [form, setForm] = useState<{ title: string; description: string | null; brandName: string } | null>(null);
  const [f, setF] = useState({ name: "", phone: "", email: "", message: "", consentWhatsApp: false, website: "" });
  const [done, setDone] = useState<{ thankYou: string; reference: string } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get<typeof form>(`/public/forms/${slug}`).then(setForm).catch((e) => setErr(errorMessage(e)));
  }, [slug]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      setDone(await api.post(`/public/forms/${slug}`, { ...f, email: f.email || undefined, message: f.message || undefined }));
    } catch (e2) {
      setErr(errorMessage(e2));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-main" style={{ minHeight: "100%", background: "var(--bg)" }}>
      <form className="auth-card card" onSubmit={submit}>
        <div className="row">
          <span className="avatar">
            <LogoMark size={18} />
          </span>
          <strong>{form?.brandName ?? "Forlife Com"}</strong>
        </div>
        {err && <Alert tone="error">{err}</Alert>}
        {form && !done && (
          <>
            <h1>{form.title}</h1>
            {form.description && <p className="muted">{form.description}</p>}
            <Field label="Votre nom">
              <input required minLength={2} autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
            </Field>
            <Field label="Votre numéro WhatsApp">
              <input type="tel" required autoComplete="tel" placeholder="07 00 00 00 00" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
            </Field>
            <Field label="Email (optionnel)">
              <input type="email" autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
            </Field>
            <Field label="Message (optionnel)">
              <textarea rows={3} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} />
            </Field>
            {/* Pot de miel anti-spam : invisible pour les humains */}
            <input tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: -9999 }} value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} />
            <label className="check">
              <input type="checkbox" required checked={f.consentWhatsApp} onChange={(e) => setF({ ...f, consentWhatsApp: e.target.checked })} />
              J'accepte d'être recontacté(e) sur WhatsApp
            </label>
            <Button busy={busy} type="submit">
              Envoyer
            </Button>
          </>
        )}
        {done && (
          <Alert tone="success">
            {done.thankYou} (référence {done.reference})
          </Alert>
        )}
        <p className="muted small">Propulsé par Forlife Com</p>
      </form>
    </div>
  );
}
