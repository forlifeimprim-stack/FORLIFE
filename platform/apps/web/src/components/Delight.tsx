import { useEffect, useRef, useState } from "react";

/* ───────── Mouvement réduit ───────── */
export function prefersReducedMotion() {
  return typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

/* ───────── Célébrations (confettis + message) ───────── */
const CELEBRATE = "forlife:celebrate";

/** Déclenche une célébration depuis n'importe quel écran, après un vrai succès de l'utilisateur. */
export function celebrate(message: string) {
  window.dispatchEvent(new CustomEvent(CELEBRATE, { detail: message }));
}

const COLORS = ["#ea7822", "#ffb26b", "#d9ac4e", "#1d7a46", "#0866FF", "#FF0069"];

export function CelebrationHost() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [message, setMessage] = useState<{ id: number; text: string } | null>(null);
  useEffect(() => {
    let raf = 0;
    let hide = 0;
    const onCelebrate = (e: Event) => {
      setMessage({ id: Date.now(), text: (e as CustomEvent<string>).detail });
      window.clearTimeout(hide);
      hide = window.setTimeout(() => setMessage(null), 3200);
      const c = canvas.current;
      if (!c || prefersReducedMotion()) return;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      c.width = window.innerWidth;
      c.height = window.innerHeight;
      const parts = Array.from({ length: 140 }, () => ({
        x: c.width / 2 + (Math.random() - 0.5) * 200,
        y: c.height * 0.35,
        vx: (Math.random() - 0.5) * 14,
        vy: -Math.random() * 13 - 4,
        r: Math.random() * 6 + 3,
        a: Math.random() * Math.PI,
        va: (Math.random() - 0.5) * 0.3,
        color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
      }));
      const t0 = performance.now();
      cancelAnimationFrame(raf);
      const frame = (t: number) => {
        ctx.clearRect(0, 0, c.width, c.height);
        for (const p of parts) {
          p.vy += 0.35;
          p.vx *= 0.99;
          p.x += p.vx;
          p.y += p.vy;
          p.a += p.va;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.a);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, 1 - (t - t0) / 2600);
          ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
          ctx.restore();
        }
        if (t - t0 < 2600) raf = requestAnimationFrame(frame);
        else ctx.clearRect(0, 0, c.width, c.height);
      };
      raf = requestAnimationFrame(frame);
    };
    window.addEventListener(CELEBRATE, onCelebrate);
    return () => {
      window.removeEventListener(CELEBRATE, onCelebrate);
      cancelAnimationFrame(raf);
      window.clearTimeout(hide);
    };
  }, []);
  return (
    <>
      <canvas ref={canvas} className="confetti" aria-hidden="true" />
      <div className="celebration-toast" role="status" aria-live="polite">
        {message && (
          <span key={message.id}>
            <b aria-hidden="true">🎉</b> {message.text}
          </span>
        )}
      </div>
    </>
  );
}

/* ───────── Nombre animé ───────── */
export function AnimatedNumber({ value, format = (n) => n.toLocaleString("fr-FR"), ms = 1100 }: { value: number; format?: (n: number) => string; ms?: number }) {
  const [shown, setShown] = useState(() => (prefersReducedMotion() ? value : 0));
  const from = useRef(0);
  useEffect(() => {
    if (prefersReducedMotion()) {
      setShown(value);
      return;
    }
    const start = from.current;
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / ms);
      const v = start + (value - start) * (1 - Math.pow(1 - p, 3));
      setShown(Number.isInteger(value) ? Math.round(v) : v);
      if (p < 1) raf = requestAnimationFrame(step);
      else from.current = value;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, ms]);
  return <span className="tabular">{format(shown)}</span>;
}

/* ───────── Anneau de progression ───────── */
export function ProgressRing({ value, size = 92, label }: { value: number; size?: number; label: string }) {
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="ring" style={{ width: size, height: size }} role="img" aria-label={`${label} : ${value} %`}>
      <svg width={size} height={size} aria-hidden="true">
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffb26b" />
            <stop offset="100%" stopColor="#ea7822" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} className="ring-track" />
        <circle cx={size / 2} cy={size / 2} r={r} className="ring-fill" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} />
      </svg>
      <strong>
        <AnimatedNumber value={value} />%
      </strong>
    </div>
  );
}

/* ───────── Série de jours actifs (propre à ce navigateur) ───────── */
const dayKey = (d: Date) => d.toISOString().slice(0, 10);
export function useStreak(userId: string) {
  const [streak, setStreak] = useState(1);
  useEffect(() => {
    const key = `forlife.streak.${userId}`;
    try {
      const today = dayKey(new Date());
      const yesterday = dayKey(new Date(Date.now() - 864e5));
      const saved = JSON.parse(localStorage.getItem(key) ?? "null") as { last: string; count: number } | null;
      const count = !saved ? 1 : saved.last === today ? saved.count : saved.last === yesterday ? saved.count + 1 : 1;
      localStorage.setItem(key, JSON.stringify({ last: today, count }));
      setStreak(count);
    } catch {
      setStreak(1);
    }
  }, [userId]);
  return streak;
}

/* ───────── Astuce du jour ───────── */
export const TIPS = [
  "Demandez au Copilot « Que publier cette semaine ? » : il s'appuie sur vos objectifs et votre Brand DNA.",
  "Dans le Content Studio, une même idée se décline pour chaque réseau en un clic.",
  "Le Creative Studio note chaque visuel : visez une note du Critic d'au moins 4/5.",
  "Programmez vos publications le soir : c'est souvent là que vos clients sont sur leur téléphone.",
  "Un lead sans action depuis 7 jours refroidit vite : le CRM vous les signale à l'accueil.",
  "Ajoutez vos mots interdits au Brand DNA : l'IA ne les utilisera jamais.",
  "Analytics & ROI relie chaque contenu aux leads et aux ventes : regardez ce qui rapporte vraiment.",
  "Une vidéo verticale de 15 secondes capte plus l'attention qu'un texte long : essayez le Video Studio.",
  "Invitez votre équipe dans Paramètres : chacun a ses droits, et vous gardez la validation finale.",
  "Les campagnes regroupent contenus, formulaires et leads autour d'un même objectif.",
];
export function tipOfTheDay(offset = 0) {
  const day = Math.floor(Date.now() / 864e5);
  return TIPS[(day + offset) % TIPS.length]!;
}

/* ───────── Squelette de chargement ───────── */
export function Skeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="skeleton-wrap" aria-busy="true" aria-label="Chargement">
      <div className="skeleton skeleton-title" />
      <div className="grid grid-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="skeleton skeleton-card" />
        ))}
      </div>
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className="skeleton skeleton-line" style={{ width: `${90 - i * 12}%` }} />
      ))}
    </div>
  );
}
