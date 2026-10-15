import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { PLANS } from "@forlife/shared";
import { useAuth } from "../lib/auth";
import { t } from "../lib/i18n";
import { LogoMark } from "./ui";
import { VerifyEmailBanner } from "../pages/VerifyEmail";
import { DemoVideoHost, openDemo } from "./DemoVideo";
import { ErrorBoundary } from "./ErrorBoundary";
import { Icon } from "./Icon";
import { CelebrationHost } from "./Delight";

/** Modules prévus par la roadmap, affichés pour donner la vision produit complète. */
const UPCOMING: { key: string; label: string; phase: string }[] = [];

export function Layout() {
  const { me, org, workspace, selectWorkspace, logout, can } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);
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
        <div className="sidebar-glow" aria-hidden="true" />
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
            <Icon name="home" /> <span>{t("nav.home")}</span>
          </NavLink>
          {can("ai:read") && <NavLink to="/copilot" className="nav-copilot">
              <Icon name="copilot" /> <span>AI Copilot</span>
            </NavLink>}
          <div className="nav-section">Business Brain</div>
          <NavLink to="/brand">
            <Icon name="brand" /> <span>{t("nav.brand")}</span>
          </NavLink>
          <NavLink to="/strategy">
            <Icon name="strategy" /> <span>{t("nav.strategy")}</span>
          </NavLink>
          <div className="nav-section">Production</div>
          <NavLink to="/content">
            <Icon name="content" /> <span>{t("nav.content")}</span>
          </NavLink>
          <NavLink to="/creative">
            <Icon name="creative" /> <span>Creative Studio</span>
          </NavLink>
          <NavLink to="/video">
            <Icon name="video" /> <span>Video Studio</span>
          </NavLink>
          <NavLink to="/calendar">
            <Icon name="calendar" /> <span>{t("nav.calendar")}</span>
          </NavLink>
          <NavLink to="/approvals">
            <Icon name="approvals" /> <span>{t("nav.approvals")}</span>
          </NavLink>
          {can("social:read") && <NavLink to="/social">
              <Icon name="social" /> <span>Social Hub</span>
            </NavLink>}
          {(can("crm:read") || can("campaigns:read")) && <div className="nav-section">Ventes</div>}
          {can("campaigns:read") && <NavLink to="/campaigns">
              <Icon name="campaigns" /> <span>Campagnes</span>
            </NavLink>}
          {can("crm:read") && <NavLink to="/crm">
              <Icon name="crm" /> <span>CRM & leads</span>
            </NavLink>}
          {can("campaigns:read") && <NavLink to="/analytics">
              <Icon name="analytics" /> <span>Analytics & ROI</span>
            </NavLink>}
          {UPCOMING.length > 0 && <div className="nav-section">{t("nav.soon")}</div>}
          {UPCOMING.map((m) => (
            <NavLink key={m.key} to={`/soon/${m.key}`} className="soon">
              {m.label} <small>{m.phase}</small>
            </NavLink>
          ))}
          {(me.user.isPlatformAdmin || me.user.canClaimAdmin) && (
            <>
              <div className="nav-section">Plateforme</div>
              <NavLink to="/admin">
                <Icon name="admin" /> <span>Back-office</span>
              </NavLink>
            </>
          )}
          {(can("members:read") || can("billing:read")) && (
            <>
              <div className="nav-section">Organisation</div>
              <NavLink to="/settings">
                <Icon name="settings" /> <span>{t("nav.settings")}</span>
              </NavLink>
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
          <button onClick={openDemo}>
            <Icon name="play" size={14} /> Vidéo de démo
          </button>
          <button onClick={() => void logout()}>
            <Icon name="logout" size={14} /> Se déconnecter
          </button>
        </div>
      </aside>
      <main className="main" id="contenu">
        {org.status === "SUSPENDED" && <div className="alert alert-error" style={{ marginBottom: 16 }}>Cette organisation est suspendue. Contactez le support Forlife Com sur WhatsApp ou par téléphone : +225 07 79 59 05 62 ou +225 05 85 80 18 56.</div>}
        <VerifyEmailBanner />
        <ErrorBoundary resetKey={location.pathname}>
          <div className="page-enter" key={location.pathname}>
            <Outlet />
          </div>
        </ErrorBoundary>
      </main>
      <DemoVideoHost userId={me.user.id} />
      <CelebrationHost />
    </div>
  );
}
