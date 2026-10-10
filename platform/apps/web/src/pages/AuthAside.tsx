import { LogoMark } from "../components/ui";

export function AuthAside() {
  return (
    <aside className="auth-aside">
      <div className="row">
        <LogoMark size={36} />
        <strong style={{ fontSize: "1.2rem" }}>Forlife Com</strong>
      </div>
      <div className="stack">
        <h1>
          L'IA qui connaît <em>votre entreprise</em>, votre marché et vos objectifs.
        </h1>
        <ul>
          <li>Stratégie avant génération : chaque contenu sert un objectif.</li>
          <li>Brand DNA persistant pour une identité cohérente.</li>
          <li>Contenus adaptés à Facebook, Instagram, TikTok, LinkedIn et WhatsApp.</li>
          <li>Pensé pour l'Afrique : FCFA, WhatsApp, PME, mobile.</li>
        </ul>
      </div>
      <small style={{ color: "var(--sidebar-muted)" }}>Forlife Com — Bingerville, Côte d'Ivoire</small>
    </aside>
  );
}
