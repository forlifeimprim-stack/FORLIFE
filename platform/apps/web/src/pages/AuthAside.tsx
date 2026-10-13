import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Channel } from "@forlife/shared";
import { LogoMark } from "../components/ui";
import { ChannelIcon } from "../components/SocialIcon";
import { DemoVideoModal } from "../components/DemoVideo";

const WORDS = ["votre entreprise", "votre marché", "vos clients", "vos objectifs"];
const NETWORKS: Channel[] = ["FACEBOOK", "INSTAGRAM", "TIKTOK", "LINKEDIN", "WHATSAPP", "YOUTUBE"];
const POSTS = [
  "Nouvelle collection de pagnes disponible à Cocody ! Livraison gratuite ce week-end. Écrivez-nous sur WhatsApp 👇",
  "Vos bâches imprimées en 48 h, prêtes pour vos événements. Devis gratuit en un message.",
  "Promo de fin de mois : -20 % sur tous les forfaits. Réservez votre place avant vendredi !",
];
const FEATURES = [
  { icon: "🎯", text: "Stratégie avant génération" },
  { icon: "🧬", text: "Brand DNA persistant" },
  { icon: "🎬", text: "Visuels et vidéos en 1 clic" },
  { icon: "🤖", text: "AI Copilot et 12 agents" },
  { icon: "📈", text: "CRM, leads et ROI réel" },
  { icon: "💳", text: "FCFA et mobile money" },
];

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const on = () => setReduced(mq.matches);
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);
  return reduced;
}

/** Index qui avance à intervalle régulier (figé si l'utilisateur préfère réduire les animations). */
function useTicker(length: number, ms: number, paused: boolean) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % length), ms);
    return () => window.clearInterval(id);
  }, [length, ms, paused]);
  return i;
}

/** Texte tapé lettre par lettre, puis marqué « publié ». */
function useTypewriter(text: string, paused: boolean) {
  const [n, setN] = useState(paused ? text.length : 0);
  useEffect(() => {
    if (paused) {
      setN(text.length);
      return;
    }
    setN(0);
    const id = window.setInterval(() => {
      setN((k) => {
        if (k >= text.length) {
          window.clearInterval(id);
          return k;
        }
        return k + 1;
      });
    }, 32);
    return () => window.clearInterval(id);
  }, [text, paused]);
  return { shown: text.slice(0, n), done: n >= text.length };
}

/** Compteur animé de 0 à la valeur cible. */
function useCountUp(target: number, paused: boolean, ms = 1600) {
  const [v, setV] = useState(paused ? target : 0);
  useEffect(() => {
    if (paused) {
      setV(target);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / ms);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, paused, ms]);
  return v;
}

const fmt = (n: number) => n.toLocaleString("fr-FR").replace(/ | /g, " ");

export function AuthAside() {
  const reduced = useReducedMotion();
  const navigate = useNavigate();
  const [demo, setDemo] = useState(false);
  const word = useTicker(WORDS.length, 2600, reduced);
  const postIdx = useTicker(POSTS.length, 7000, reduced);
  const net = useTicker(NETWORKS.length, 1400, reduced);
  const { shown, done } = useTypewriter(POSTS[postIdx]!, reduced);
  const leads = useCountUp(38, reduced);
  const sales = useCountUp(1250000, reduced, 2200);

  return (
    <aside className="auth-aside">
      <div className="aurora" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <div className="auth-aside-inner">
        <div className="row auth-brand">
          <LogoMark size={36} />
          <strong style={{ fontSize: "1.2rem" }}>Forlife Com</strong>
          <span className="pill-live">
            <i aria-hidden="true" /> AI Growth &amp; Creative OS
          </span>
        </div>

        <div className="stack hero">
          <h1>
            L'IA qui connaît
            <br />
            <span className="rotator" aria-live="off">
              <em key={word}>{WORDS[word]}</em>
            </span>
          </h1>
          <p className="hero-sub">Stratégie, contenus, visuels, vidéos, publication et ventes : toute votre croissance au même endroit, pensée pour les PME d'Afrique francophone.</p>
          <div className="row hero-cta">
            <button type="button" className="btn btn-glow" onClick={() => setDemo(true)}>
              <span aria-hidden="true">▶</span> Voir la démo (1 min 35)
            </button>
          </div>
        </div>

        <div className="stage" aria-hidden="true">
          <div className="float-card post-card">
            <div className="row post-head">
              <span className="avatar">FC</span>
              <div>
                <strong>Votre marque</strong>
                <small>Programmé · aujourd'hui 18:00</small>
              </div>
              <span className="net-badge">
                <ChannelIcon key={net} channel={NETWORKS[net]!} size={18} />
              </span>
            </div>
            <p className="typed">
              {shown}
              {!done && <b className="caret" />}
            </p>
            <div className={`post-foot ${done ? "on" : ""}`}>
              <span className="tag-ok">✓ Conforme au Brand DNA</span>
              <span className="tag-pub">Publié</span>
            </div>
          </div>

          <div className="float-card kpi-card">
            <small>Ventes du mois</small>
            <strong>{fmt(sales)} FCFA</strong>
            <div className="bars">
              {[38, 52, 45, 64, 58, 80, 96].map((h, i) => (
                <span key={i} style={{ height: `${h}%`, animationDelay: `${i * 90}ms` }} />
              ))}
            </div>
            <small className="up">▲ +{leads} leads cette semaine</small>
          </div>

          <div className="float-card copilot-card">
            <small>🤖 AI Copilot · Sales Coach</small>
            <p>4 leads n'ont pas été relancés depuis 7 jours. Je prépare un message WhatsApp ?</p>
            <span className="approve">Approuver</span>
          </div>
        </div>

        <ul className="feature-chips">
          {FEATURES.map((f, i) => (
            <li key={f.text} style={{ animationDelay: `${300 + i * 90}ms` }}>
              <span aria-hidden="true">{f.icon}</span> {f.text}
            </li>
          ))}
        </ul>

        <div className="net-strip">
          <span>Publiez sur</span>
          <div className="row">
            {NETWORKS.map((n) => (
              <span key={n} className="net-dot">
                <ChannelIcon channel={n} size={18} />
              </span>
            ))}
          </div>
        </div>

        <small className="auth-foot">Forlife Com — Bingerville, Côte d'Ivoire</small>
      </div>
      <DemoVideoModal open={demo} onClose={() => setDemo(false)} footerLabel="Créer mon espace gratuitement" onAction={() => navigate("/signup")} />
    </aside>
  );
}
