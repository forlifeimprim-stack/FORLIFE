import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { PLANS } from "@forlife/shared";
import { useAuth } from "../lib/auth";
import { t } from "../lib/i18n";
import { LogoMark } from "./ui";
import { VerifyEmailBanner } from "../pages/VerifyEmail";
import { DemoVideoHost, openDemo } from "./DemoVideo";
import { ErrorBoundary } from "./ErrorBoundary";

/** Modules prévus par la roadmap, affichés pour donner la vision produit complète. */
const UPCOMING: { key: string; label: string; phase: string }[] = [];

export function Layout() {
  const { me, org, workspace, selectWorkspace, logout, can } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  if (!me || !org || !workspace) return null;

  const options = me.organizations.flatMap((o) => o.workspaces.map((w) => ({ value: `${o.id}|${w.id}`, label: `${me.organizations.length > 1 ? `${o.name} · ${w.name}` : w.name}${w.status === "LOCKED" ? " (lecture seule)" : ""}` })));
  const plan = PLANS[org.plan];

  return (
    <div className={`shell ${open ? "nav-open" : ""}`}>
      <header className="topbar-mobile">
        <button onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
          ☰
        </button>
        <div className="row">
          <LogoMark size={22} /> <strong>{workspace.name}</strong>
        </div>
        <span />
      </header>
      {open && <div className="nav-backdrop" aria-hidden="true" onClick={() => setOpen(false)} />}
      <aside className="sidebar" aria-label="Navigation principale">
        <div className="brand-row">
          <LogoMark />
          <div>
            <strong>Forlife Com</strong>
            <small>AI Growth & Creative OS</small>
          </div>
        </div>
        <div className="ws-switch">
          <label className="nav-section" htmlFor="ws-select">
            Espace de travail
          </label>
          <select
            id="ws-select"
            value={`${org.id}|${workspace.id}`}
            onChange={(e) => {
              const [o, w] = e.target.value.split("|");
              if (o && w) selectWorkspace(o, w);
            }}
          >
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <nav className="nav">
          <NavLink to="/" end>
            {t("nav.home")}
          </NavLink>
          {can("ai:read") && <NavLink to="/copilot">AI Copilot</NavLink>}
          <div className="nav-section">Business Brain</div>
          <NavLink to="/brand">{t("nav.brand")}</NavLink>
          <NavLink to="/strategy">{t("nav.strategy")}</NavLink>
          <div className="nav-section">Production</div>
          <NavLink to="/content">{t("nav.content")}</NavLink>
          <NavLink to="/creative">Creative Studio</NavLink>
          <NavLink to="/video">Video Studio</NavLink>
          <NavLink to="/calendar">{t("nav.calendar")}</NavLink>
          <NavLink to="/approvals">{t("nav.approvals")}</NavLink>
          {can("social:read") && <NavLink to="/social">Social Hub</NavLink>}
          {(can("crm:read") || can("campaigns:read")) && <div className="nav-section">Ventes</div>}
          {can("campaigns:read") && <NavLink to="/campaigns">Campagnes</NavLink>}
          {can("crm:read") && <NavLink to="/crm">CRM & leads</NavLink>}
          {can("campaigns:read") && <NavLink to="/analytics">Analytics & ROI</NavLink>}
          {UPCOMING.length > 0 && <div className="nav-section">{t("nav.soon")}</div>}
          {UPCOMING.map((m) => (
            <NavLink key={m.key} to={`/soon/${m.key}`} className="soon">
              {m.label} <small>{m.phase}</small>
            </NavLink>
          ))}
          {(me.user.isPlatformAdmin || me.user.canClaimAdmin) && (
            <>
              <div className="nav-section">Plateforme</div>
              <NavLink to="/admin">Back-office</NavLink>
            </>
          )}
          {(can("members:read") || can("billing:read")) && (
            <>
              <div className="nav-section">Organisation</div>
              <NavLink to="/settings">{t("nav.settings")}</NavLink>
            </>
          )}
        </nav>
        <div className="sidebar-foot">
          <div className="credits-pill" title={`Plan ${plan.name}`}>
            <span>Crédits IA</span>
            <b>{org.credits.toLocaleString("fr-FR")}</b>
          </div>
          <span>
            {me.user.name} · {org.name}
          </span>
          <button onClick={openDemo}>▶ Vidéo de démo</button>
          <button onClick={() => void logout()}>Se déconnecter</button>
        </div>
      </aside>
      <main className="main" id="contenu">
        {org.status === "SUSPENDED" && <div className="alert alert-error" style={{ marginBottom: 16 }}>Cette organisation est suspendue. Contactez le support Forlife Com sur WhatsApp : +225 05 85 80 18 56.</div>}
        <VerifyEmailBanner />
        <ErrorBoundary resetKey={location.pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
      <DemoVideoHost userId={me.user.id} />
    </div>
  );
}
