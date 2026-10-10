import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { CHANNEL_LABELS, CONTENT_STATUS_LABELS, type Channel, type ContentStatus } from "@forlife/shared";
import { t } from "../lib/i18n";
import type { SafetyResult } from "../lib/types";

export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="25 50 170 190" aria-hidden="true">
      <g fill="var(--accent)">
        <circle cx="59.24" cy="209.06" r="25.45" />
        <path d="m59.23,55.5h112.07c9.44,0,17.09,7.65,17.09,17.09h0c0,16.06-13.02,29.08-29.08,29.08H47.23c-9.44,0-17.09-7.64-17.1-17.08,0,0,0,0,0-.01h0c0-16.06,13.02-29.08,29.08-29.08,0,0,.01,0,.02,0Z" />
        <path d="m56.23,121.44h62.72c7.29,0,13.2,5.91,13.2,13.2v8.65c0,12.41-10.06,22.47-22.47,22.47h-62.69c-7.29,0-13.2-5.91-13.2-13.2v-8.65c0-12.4,10.04-22.45,22.44-22.47Z" />
      </g>
    </svg>
  );
}

type Variant = "primary" | "secondary" | "ghost" | "danger";
export function Button({ variant = "primary", busy, children, className = "", ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; busy?: boolean }) {
  return (
    <button className={`btn btn-${variant} ${className}`} disabled={busy || rest.disabled} aria-busy={busy || undefined} {...rest}>
      {busy && <span className="spinner" aria-hidden="true" />}
      {children}
    </button>
  );
}

export function Card({ title, actions, children, className = "" }: { title?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`card ${className}`}>
      {(title || actions) && (
        <header className="card-head">
          {title && <h2>{title}</h2>}
          {actions && <div className="card-actions">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

export function PageHeader({ title, question, actions }: { title: string; question?: string; actions?: ReactNode }) {
  return (
    <header className="page-head">
      <div>
        <h1>{title}</h1>
        {question && <p className="muted">{question}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  );
}

export function StatusBadge({ status }: { status: ContentStatus }) {
  return <span className={`badge status-${status.toLowerCase()}`}>{CONTENT_STATUS_LABELS[status]}</span>;
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "accent" | "success" | "warning" | "danger" }) {
  return <span className={`badge tone-${tone}`}>{children}</span>;
}

export function ChannelChip({ channel }: { channel: Channel }) {
  return <span className={`chip ch-${channel.toLowerCase()}`}>{CHANNEL_LABELS[channel]}</span>;
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

export function Alert({ tone = "info", children }: { tone?: "info" | "error" | "warning" | "success"; children: ReactNode }) {
  return (
    <div className={`alert alert-${tone}`} role={tone === "error" ? "alert" : "status"}>
      {children}
    </div>
  );
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <p className="empty-title">{title}</p>
      {children}
    </div>
  );
}

export function Modal({ open, title, onClose, children, footer }: { open: boolean; title: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} className="modal" onClose={onClose} aria-labelledby="modal-title">
      <header className="card-head">
        <h2 id="modal-title">{title}</h2>
        <button className="icon-btn" onClick={onClose} aria-label="Fermer">
          ×
        </button>
      </header>
      <div className="modal-body">{children}</div>
      {footer && <footer className="modal-foot">{footer}</footer>}
    </dialog>
  );
}

/** Coût affiché AVANT toute génération (§24 : indication du coût/usage avant génération lourde). */
export function CreditCost({ credits }: { credits: number }) {
  return (
    <span className="cost" title="Coût estimé débité de votre solde">
      ≈ {credits} {t("common.credits")}
    </span>
  );
}

export function AiNotice({ simulated, safety }: { simulated?: boolean; safety?: SafetyResult | null }) {
  return (
    <div className="ai-notice">
      <span>✦ {t("ai.proposal")}</span>
      {simulated && <Badge tone="warning">{t("ai.simulated")}</Badge>}
      {safety && !safety.passed && (
        <Badge tone="danger">
          Contrôle sécurité : {safety.flags.map((f) => f.detail).join(", ")}
        </Badge>
      )}
    </div>
  );
}

export function JobStatus({ running, label, error }: { running: boolean; label: string; error?: string | null }) {
  if (error) return <Alert tone="error">{error}</Alert>;
  if (!running) return null;
  return (
    <div className="job-status" role="status">
      <span className="spinner" aria-hidden="true" /> {label}
    </div>
  );
}

export function TagList({ items, empty = "—" }: { items: string[]; empty?: string }) {
  if (!items.length) return <span className="muted">{empty}</span>;
  return (
    <ul className="tags">
      {items.map((x) => (
        <li key={x}>{x}</li>
      ))}
    </ul>
  );
}

/** Saisie d'une liste de valeurs (une par ligne). */
export function ListInput({ value, onChange, rows = 3, placeholder }: { value: string[]; onChange: (v: string[]) => void; rows?: number; placeholder?: string }) {
  return (
    <textarea
      rows={rows}
      placeholder={placeholder ?? "Une valeur par ligne"}
      value={value.join("\n")}
      onChange={(e) => onChange(e.target.value.split("\n").map((s) => s.trimStart()).filter((s, i, arr) => s || i === arr.length - 1))}
      onBlur={(e) => onChange(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
    />
  );
}

export function Score({ value, max = 5, label }: { value: number; max?: number; label: string }) {
  return (
    <span className="score" aria-label={`${label} ${value} sur ${max}`}>
      <span className="muted">{label}</span>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < value ? "dot on" : "dot"} />
      ))}
    </span>
  );
}
