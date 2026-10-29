import { createContext, useContext, type CSSProperties, type ReactNode } from "react";
import { interpolate, spring, useVideoConfig } from "remotion";
import { BEAT, FPS, beat } from "./timing";

export const C = {
  bg: "#0b0908",
  ink: "#1a0d03",
  orange: "#ea7822",
  orangeLight: "#ffb26b",
  gold: "#d9ac4e",
  cream: "#f4efe9",
  muted: "#b6aca2",
  green: "#25D366",
  red: "#ff5a4f",
};
export const GRAD = `linear-gradient(135deg, ${C.orangeLight}, ${C.orange} 55%, ${C.gold})`;
export const FONT = "Poppins, system-ui, sans-serif";

/** Temps absolu (secondes) partagé par toutes les scènes. */
export const TimeCtx = createContext(0);
export const useT = () => useContext(TimeCtx);

export function useLayout() {
  const { width, height } = useVideoConfig();
  const v = height > width;
  return { v, w: width, h: height };
}

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Ressort qui démarre à `at` (secondes). 0 avant, ~1 après. */
export function pop(t: number, at: number, damping = 12, stiffness = 170, mass = 0.7) {
  if (t < at) return 0;
  return spring({ frame: (t - at) * FPS, fps: FPS, config: { damping, stiffness, mass } });
}
export const lin = (t: number, a: number, b: number, from = 0, to = 1) => interpolate(t, [a, b], [from, to], clamp);
export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);

/** Impulsion sur chaque temps après le drop (pour faire « respirer » l'image sur la musique). */
export function pulse(t: number, from = beat(12)) {
  if (t < from) return 0;
  const phase = ((t - from) % BEAT) / BEAT;
  return Math.exp(-phase * 7);
}

/** Petite secousse après un impact. */
export function shake(t: number, at: number, amp = 18, dur = 0.28) {
  if (t < at || t > at + dur) return 0;
  const k = 1 - (t - at) / dur;
  return Math.sin((t - at) * 90) * amp * k;
}

/** Enveloppe d'une scène : entrée en zoom, sortie en « whip zoom ». */
export function Scene({ t, from, to, children, exit = true }: { t: number; from: number; to: number; children: ReactNode; exit?: boolean }) {
  if (t < from - 0.01 || t >= to) return null;
  const inP = easeOut(lin(t, from, from + 0.22));
  const outP = exit ? lin(t, to - 0.16, to) : 0;
  const scale = (0.88 + 0.12 * inP) * (1 + outP * 0.35);
  const blur = (1 - inP) * 14 + outP * 18;
  const opacity = inP * (1 - outP);
  return (
    <div style={{ position: "absolute", inset: 0, transform: `scale(${scale})`, filter: `blur(${blur}px)`, opacity }}>
      {children}
    </div>
  );
}

export function Flash({ t, at, dur = 0.3, color = "#fff" }: { t: number; at: number; dur?: number; color?: string }) {
  if (t < at || t > at + dur) return null;
  const o = 1 - (t - at) / dur;
  return <div style={{ position: "absolute", inset: 0, background: color, opacity: o * 0.9, mixBlendMode: "screen" }} />;
}

export function GradText({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <span style={{ background: GRAD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", ...style }}>{children}</span>
  );
}

/** Mots qui apparaissent un par un (léger saut + flou). */
export function Words({ t, at, text, step = 0.16, style, highlight = [] as string[] }: { t: number; at: number; text: string; step?: number; style?: CSSProperties; highlight?: string[] }) {
  const words = text.split(" ");
  return (
    <span style={{ display: "inline", ...style }}>
      {words.map((w, i) => {
        const p = pop(t, at + i * step, 11, 200, 0.6);
        const hl = highlight.includes(w.replace(/[.,!?…:]/g, ""));
        const inner = hl ? <GradText>{w}</GradText> : w;
        return (
          <span key={i} style={{ display: "inline-block", marginRight: "0.26em", opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * 40}px) scale(${0.7 + 0.3 * p})`, filter: `blur(${(1 - Math.min(1, p)) * 8}px)` }}>
            {inner}
          </span>
        );
      })}
    </span>
  );
}

/** Logo Forlife Com (barres + point), pièces animables séparément. */
export function Logo({ size, t, at = -1 }: { size: number; t?: number; at?: number }) {
  const tt = t ?? 99;
  const a = at < 0 ? 1 : pop(tt, at, 10, 160);
  const b = at < 0 ? 1 : pop(tt, at + 0.1, 10, 160);
  const c = at < 0 ? 1 : pop(tt, at + 0.2, 8, 180);
  return (
    <svg width={size} height={size * 1.12} viewBox="25 50 170 190">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={C.orangeLight} />
          <stop offset="100%" stopColor={C.orange} />
        </linearGradient>
      </defs>
      <g fill="url(#lg)">
        <path transform={`translate(${(1 - a) * -160} 0)`} opacity={a} d="m59.23,55.5h112.07c9.44,0,17.09,7.65,17.09,17.09h0c0,16.06-13.02,29.08-29.08,29.08H47.23c-9.44,0-17.09-7.64-17.1-17.08,0,0,0,0,0-.01h0c0-16.06,13.02-29.08,29.08-29.08,0,0,.01,0,.02,0Z" />
        <path transform={`translate(${(1 - b) * 160} 0)`} opacity={b} d="m56.23,121.44h62.72c7.29,0,13.2,5.91,13.2,13.2v8.65c0,12.41-10.06,22.47-22.47,22.47h-62.69c-7.29,0-13.2-5.91-13.2-13.2v-8.65c0-12.4,10.04-22.45,22.44-22.47Z" />
        <circle cx="59.24" cy={209.06 - (1 - c) * 140} r={25.45 * Math.max(0.01, c)} />
      </g>
    </svg>
  );
}

const ICONS: Record<string, { color: string; path: string }> = {
  FACEBOOK: { color: "#0866FF", path: "M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" },
  INSTAGRAM: { color: "#FF0069", path: "M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.35-2.62-6.78-6.98-6.98C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.41-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" },
  TIKTOK: { color: "#111111", path: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" },
  LINKEDIN: { color: "#0A66C2", path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
  WHATSAPP: { color: "#25D366", path: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" },
  YOUTUBE: { color: "#FF0000", path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" },
};
export const NETWORKS = ["FACEBOOK", "INSTAGRAM", "TIKTOK", "LINKEDIN", "WHATSAPP", "YOUTUBE"] as const;

export function NetIcon({ name, size }: { name: string; size: number }) {
  const i = ICONS[name]!;
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.28, background: "#fff", display: "grid", placeItems: "center", boxShadow: "0 14px 40px rgba(0,0,0,.45)" }}>
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill={i.color}>
        <path d={i.path} />
      </svg>
    </div>
  );
}

export function Glass({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ background: "rgba(28,23,19,.78)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 28, boxShadow: "0 30px 80px rgba(0,0,0,.5)", backdropFilter: "blur(14px)", color: C.cream, ...style }}>
      {children}
    </div>
  );
}

export function Phone({ children, w, style }: { children: ReactNode; w: number; style?: CSSProperties }) {
  return (
    <div style={{ width: w, height: w * 2.02, borderRadius: w * 0.14, padding: w * 0.035, background: "linear-gradient(160deg,#2b2520,#0d0b09)", boxShadow: "0 40px 120px rgba(0,0,0,.65), inset 0 0 0 2px rgba(255,255,255,.08)", ...style }}>
      <div style={{ width: "100%", height: "100%", borderRadius: w * 0.11, overflow: "hidden", background: "#f6f1eb", position: "relative" }}>{children}</div>
    </div>
  );
}
