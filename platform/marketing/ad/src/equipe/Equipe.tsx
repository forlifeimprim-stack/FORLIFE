import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Audio, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { useFonts } from "../fonts";
import { NetIcon } from "../kit";

/**
 * « Toute une équipe marketing dans votre téléphone » — film vertical de 30 s, comptoir de boutique vu du dessus
 * (thème 099 Overhead Desk). Tout est fonction du temps t : rendu déterministe, image par image.
 * Grille musicale : 120 BPM → un temps = 0,5 s, une mesure = 2 s. Le drop tombe à 6 s.
 */
export const EQ_FPS = 30;
export const EQ_DURATION_S = 30;

const K = {
  wood: "#8a5a34",
  woodDark: "#5e3b20",
  paper: "#f6efe3",
  ink: "#21160f",
  inkSoft: "#5b4a3d",
  orange: "#ea7822",
  orangeLight: "#ffb26b",
  gold: "#d9ac4e",
  green: "#25D366",
  skin: "#8d5a3b",
  skinDark: "#6f432a",
  screen: "#fbf6ee",
};
const FONT = "Poppins, system-ui, sans-serif";
const W = 1080;
const H = 1920;

// ───────────── courbes (déterministes) ─────────────
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const expoOut = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
const power2Out = (x: number) => 1 - Math.pow(1 - x, 2);
const power3InOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const power4Out = (x: number) => 1 - Math.pow(1 - x, 4);
const sineInOut = (x: number) => -(Math.cos(Math.PI * x) - 1) / 2;
/** Rebond léger réservé aux OBJETS posés sur le comptoir (jamais à l'interface). */
const backOut = (x: number, s = 1.6) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
const mix = (a: number, b: number, p: number) => a + (b - a) * p;

/** Bois du comptoir : veinage en dégradés répétés, sans bruit aléatoire. */
const woodBg = (light: number): CSSProperties => ({
  background: [
    "repeating-linear-gradient(93deg, rgba(255,220,180,.05) 0 3px, rgba(0,0,0,0) 3px 23px)",
    "repeating-linear-gradient(88deg, rgba(40,20,8,.10) 0 2px, rgba(0,0,0,0) 2px 61px)",
    "repeating-linear-gradient(91deg, rgba(255,230,200,.04) 0 40px, rgba(0,0,0,.05) 40px 140px)",
    `linear-gradient(180deg, ${K.wood}, ${K.woodDark})`,
  ].join(","),
  filter: `brightness(${light})`,
});

/** Pagne (wax) : motif de cercles et losanges en dégradés, teintes sourdes. */
const waxBg: CSSProperties = {
  background: [
    "radial-gradient(circle at 50% 50%, #e9b44c 0 16px, #2f4a7a 17px 24px, rgba(0,0,0,0) 25px)",
    "radial-gradient(circle at 0 0, #c4572c 0 14px, rgba(0,0,0,0) 15px)",
    "radial-gradient(circle at 100% 100%, #c4572c 0 14px, rgba(0,0,0,0) 15px)",
    "linear-gradient(45deg, #24375e 25%, #2f4a7a 25% 50%, #24375e 50% 75%, #2f4a7a 75%)",
  ].join(","),
  backgroundSize: "80px 80px",
};

// ───────────── marque (tracé officiel du LogoMark de l'application) ─────────────
const LOGO_PATHS = [
  "m59.23,55.5h112.07c9.44,0,17.09,7.65,17.09,17.09h0c0,16.06-13.02,29.08-29.08,29.08H47.23c-9.44,0-17.09-7.64-17.1-17.08,0,0,0,0,0-.01h0c0-16.06,13.02-29.08,29.08-29.08,0,0,.01,0,.02,0Z",
  "m56.23,121.44h62.72c7.29,0,13.2,5.91,13.2,13.2v8.65c0,12.41-10.06,22.47-22.47,22.47h-62.69c-7.29,0-13.2-5.91-13.2-13.2v-8.65c0-12.4,10.04-22.45,22.44-22.47Z",
];
function Mark({ size, color = K.orange }: { size: number; color?: string }) {
  return (
    <svg width={size} height={size * (190 / 170)} viewBox="25 50 170 190">
      <g fill={color}>
        <circle cx="59.24" cy="209.06" r="25.45" />
        {LOGO_PATHS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </svg>
  );
}
const MARK_MASK = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='25 50 170 190'><g fill='black'><circle cx='59.24' cy='209.06' r='25.45'/>${LOGO_PATHS.map((d) => `<path d='${d}'/>`).join("")}</g></svg>`,
)}")`;

// ───────────── petits objets ─────────────
function Shadowed({ x, y, rot = 0, lift = 0, children, z }: { x: number; y: number; rot?: number; lift?: number; children: ReactNode; z?: number }) {
  // lift 1 = en l'air (ombre large et floue), 0 = posé (ombre serrée).
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `rotate(${rot}deg) scale(${1 + lift * 0.08})`, zIndex: z, filter: `drop-shadow(${6 + lift * 28}px ${10 + lift * 40}px ${8 + lift * 30}px rgba(25,12,4,${0.42 - lift * 0.18}))` }}>
      {children}
    </div>
  );
}

const NOTES = [
  { text: "Post Facebook ?", color: "#f7dc6f", x: 120, y: 330, r: -8 },
  { text: "Visuel promo", color: "#f5b7a8", x: 640, y: 420, r: 7 },
  { text: "Répondre aux clients", color: "#aed9c9", x: 170, y: 1210, r: 5 },
  { text: "Vidéo TikTok", color: "#f7dc6f", x: 650, y: 1290, r: -6 },
  { text: "Statut WhatsApp", color: "#c9c4ef", x: 380, y: 160, r: 3 },
  { text: "Relancer Aminata", color: "#f5b7a8", x: 60, y: 760, r: -4 },
  { text: "Photos produits", color: "#aed9c9", x: 700, y: 840, r: 9 },
  { text: "Story Instagram", color: "#f7dc6f", x: 400, y: 1500, r: -10 },
];
function Note({ text, color }: { text: string; color: string }) {
  return (
    <div style={{ width: 300, height: 300, background: color, padding: 30, boxSizing: "border-box", fontFamily: FONT, fontWeight: 700, fontSize: 40, lineHeight: 1.15, color: K.ink, backgroundImage: "linear-gradient(180deg, rgba(0,0,0,.06), rgba(0,0,0,0) 22%)" }}>
      {text}
    </div>
  );
}

/** Main stylisée vue du dessus (index tendu). */
function Hand({ press = 0 }: { press?: number }) {
  return (
    <svg width={260} height={520} viewBox="0 0 260 520" style={{ transform: `scale(${1 - press * 0.03})` }}>
      <g fill={K.skin}>
        <rect x="98" y="0" width="58" height="230" rx="29" />
        <rect x="36" y="180" width="190" height="230" rx="70" />
        <rect x="156" y="150" width="50" height="140" rx="25" transform="rotate(14 181 220)" />
        <rect x="10" y="220" width="50" height="130" rx="25" transform="rotate(-28 35 285)" />
        <rect x="70" y="380" width="130" height="160" rx="30" />
      </g>
      <rect x="110" y="10" width="34" height="34" rx="12" fill="#b98767" opacity=".55" />
      <path d="M60 300 q70 30 150 0" stroke={K.skinDark} strokeWidth="6" fill="none" opacity=".35" />
    </svg>
  );
}

function Phone({ w, children, glow = 0 }: { w: number; children?: ReactNode; glow?: number }) {
  const h = w * 2.05;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.12, background: "#1b1411", padding: w * 0.035, boxSizing: "border-box", boxShadow: `0 ${w * 0.05}px ${w * 0.12}px rgba(20,8,2,.5), 0 0 ${glow * 120}px rgba(255,178,107,${glow * 0.45})` }}>
      <div style={{ width: "100%", height: "100%", borderRadius: w * 0.09, overflow: "hidden", position: "relative", background: K.screen }}>{children}</div>
    </div>
  );
}

// ───────────── nouveau composant : les badges d'équipe ─────────────
const TEAM = [
  { role: "Rédaction", module: "Content Studio", icon: "pen" },
  { role: "Graphisme", module: "Creative Studio", icon: "image" },
  { role: "Montage vidéo", module: "Video Studio", icon: "clap" },
  { role: "Community", module: "Social Hub", icon: "mega" },
  { role: "Analyse", module: "Analytics & ROI", icon: "chart" },
  { role: "Conseil", module: "AI Copilot · 12 agents", icon: "spark" },
] as const;
type IconName = (typeof TEAM)[number]["icon"];
function RoleIcon({ name, size, color = K.paper }: { name: IconName; size: number; color?: string }) {
  const s = { stroke: color, strokeWidth: 2.4, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      {name === "pen" && <path {...s} d="M4 20l4-1 11-11-3-3L5 16l-1 4zM14 6l3 3" />}
      {name === "image" && (
        <g {...s}>
          <rect x="3" y="4" width="18" height="16" rx="3" />
          <path d="M3 16l5-5 4 4 3-3 6 6" />
          <circle cx="16" cy="9" r="1.6" />
        </g>
      )}
      {name === "clap" && (
        <g {...s}>
          <rect x="3" y="9" width="18" height="11" rx="2" />
          <path d="M3 9l2-5 16 2-1 3M8 4.5l-1 4.5M13 5l-1 4M18 5.6l-1 3.4" />
        </g>
      )}
      {name === "mega" && <path {...s} d="M4 10v4h3l8 4V6L7 10H4zM18 9a4 4 0 0 1 0 6" />}
      {name === "chart" && <path {...s} d="M4 20V10M10 20V4M16 20v-7M21 20H3" />}
      {name === "spark" && <path {...s} d="M12 3v5M12 16v5M3 12h5M16 12h5M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3" />}
    </svg>
  );
}
function Badge({ i }: { i: number }) {
  const m = TEAM[i]!;
  return (
    <div style={{ width: 270, height: 350, borderRadius: 26, background: K.paper, boxShadow: "inset 0 0 0 3px rgba(33,22,15,.08)", fontFamily: FONT, color: K.ink, position: "relative", overflow: "hidden" }}>
      <div style={{ height: 70, background: K.ink, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
        <Mark size={26} />
        <span style={{ color: K.paper, fontWeight: 700, fontSize: 22, letterSpacing: 1 }}>ÉQUIPE</span>
      </div>
      <div style={{ position: "absolute", top: 14, left: "50%", width: 70, height: 14, marginLeft: -35, borderRadius: 7, background: K.paper, opacity: 0.9 }} />
      <div style={{ margin: "34px auto 18px", width: 110, height: 110, borderRadius: 55, background: K.orange, display: "grid", placeItems: "center" }}>
        <RoleIcon name={m.icon} size={62} />
      </div>
      <div style={{ textAlign: "center", fontWeight: 800, fontSize: 32 }}>{m.role}</div>
      <div style={{ textAlign: "center", fontWeight: 600, fontSize: 21, color: K.inkSoft, marginTop: 6 }}>{m.module}</div>
    </div>
  );
}
/** Positions des badges (point d'accroche du clip) et du téléphone dans le plan 4. */
const BADGE_POS = [
  { x: 190, y: 430 },
  { x: 540, y: 380 },
  { x: 890, y: 430 },
  { x: 190, y: 840 },
  { x: 540, y: 790 },
  { x: 890, y: 840 },
];
const PHONE4 = { x: 540, y: 1500, w: 300 };
/** Balancier amorti : signature de mouvement du composant (jamais un simple fondu). */
const swing = (t: number, at: number) => (t < at ? 0 : 26 * Math.exp(-2.4 * (t - at)) * Math.sin((t - at) * 9.5));

// ───────────── tampon de texte ─────────────
function Stamp({ t, at, text, size, rot, color = K.ink }: { t: number; at: number; text: string; size: number; rot: number; color?: string }) {
  if (t < at) return null;
  const p = expoOut(seg(t, at, at + 0.35));
  return (
    <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: size, color, lineHeight: 1, transform: `rotate(${rot}deg) scale(${mix(1.5, 1, p)})`, opacity: p, letterSpacing: -1 }}>{text}</div>
  );
}

// ───────────── écran de l'application (Content Studio) ─────────────
const PROMPT = "Promo pagnes −20 % ce week-end";
function StudioScreen({ t }: { t: number }) {
  // Saisie : de 13,2 s à 14,7 s, en pas réguliers (une lettre par image).
  const typed = PROMPT.slice(0, Math.floor(seg(t, 13.2, 14.7) * PROMPT.length));
  const caret = Math.floor(t * 2) % 2 === 0 && t < 15;
  const card = (k: number) => power2Out(seg(t, 15 + k * 0.4, 15.6 + k * 0.4));
  const hover = seg(t, 17.0, 17.4);
  const tapped = t >= 18;
  const fly = power3InOut(seg(t, 18.4, 19.4));
  const chips = ["FACEBOOK", "INSTAGRAM", "TIKTOK", "LINKEDIN", "YOUTUBE"] as const;
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily: FONT, color: K.ink, padding: "54px 40px", boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Mark size={40} />
        <div style={{ fontWeight: 800, fontSize: 36 }}>Content Studio</div>
      </div>
      {/* barre de saisie */}
      <div style={{ marginTop: 36, borderRadius: 26, padding: "26px 28px", background: "#efe5d6", fontSize: 38, fontWeight: 600, display: "flex", alignItems: "center", gap: 16, minHeight: 60 }}>
        <div style={{ width: 54, height: 54, flex: "none", borderRadius: 27, background: K.orange, display: "grid", placeItems: "center", opacity: seg(t, 12.7, 13.0) }}>
          <RoleIcon name="pen" size={32} />
        </div>
        <span>
          {typed}
          {caret && <span style={{ color: K.orange }}>|</span>}
        </span>
      </div>
      {/* les trois créations */}
      <div style={{ position: "relative", marginTop: 34, height: 900 }}>
        {[0, 1, 2].map((k) => {
          const p = card(k);
          const top = [0, 290, 580][k]!;
          const toX = (k - 1) * 230;
          return (
            <div key={k} style={{ position: "absolute", left: 0, right: 0, top, height: 260, borderRadius: 26, background: K.paper, boxShadow: "0 12px 30px rgba(60,30,10,.16)", opacity: p * (1 - fly), transform: `translate(${fly * toX}px, ${(1 - p) * 120 + fly * (340 - top)}px) scale(${1 - fly * 0.75})`, overflow: "hidden", display: "flex" }}>
              {k === 0 && (
                <div style={{ padding: 28, fontSize: 30, lineHeight: 1.3, fontWeight: 600 }}>
                  <div style={{ fontSize: 22, color: K.inkSoft, fontWeight: 700, marginBottom: 8 }}>TEXTE</div>
                  Ce week-end, vos pagnes préférés à −20 %. Passez en boutique ou écrivez-nous !
                  <div style={{ color: K.orange, marginTop: 6 }}>#Wax #Promo</div>
                </div>
              )}
              {k === 1 && (
                <>
                  <Img src={staticFile("story/awa-boutique.jpg")} style={{ width: "62%", height: "100%", objectFit: "cover" }} />
                  <div style={{ padding: 24, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <div style={{ fontSize: 22, color: K.inkSoft, fontWeight: 700 }}>VISUEL</div>
                    <div style={{ marginTop: 10, background: K.orange, color: K.paper, fontWeight: 900, fontSize: 52, borderRadius: 16, padding: "4px 14px", transform: "rotate(-6deg)" }}>−20 %</div>
                  </div>
                </>
              )}
              {k === 2 && (
                <>
                  <div style={{ width: 146, margin: 20, borderRadius: 18, background: K.ink, position: "relative", overflow: "hidden" }}>
                    <Img src={staticFile("story/awa-portrait.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }} />
                    <div style={{ position: "absolute", left: "50%", top: "50%", width: 0, height: 0, marginLeft: -12, marginTop: -18, borderLeft: "34px solid rgba(246,239,227,.92)", borderTop: "18px solid transparent", borderBottom: "18px solid transparent" }} />
                  </div>
                  <div style={{ padding: "28px 8px", fontSize: 30, fontWeight: 600 }}>
                    <div style={{ fontSize: 22, color: K.inkSoft, fontWeight: 700 }}>VIDÉO 9:16</div>
                    15 s · storyboard
                    <br />+ sous-titres
                  </div>
                </>
              )}
            </div>
          );
        })}
        {/* réseaux : les créations y atterrissent */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 380, display: "flex", justifyContent: "center", gap: 18, opacity: seg(t, 18.85, 19.1) }}>
          {chips.map((n, i) => (
            <div key={n} style={{ position: "relative", transform: `scale(${mix(0.6, 1, power2Out(seg(t, 18.85 + i * 0.06, 19.25 + i * 0.06)))})` }}>
              <NetIcon name={n} size={92} />
              <div style={{ position: "absolute", right: -8, bottom: -8, width: 40, height: 40, borderRadius: 20, background: K.green, color: K.paper, display: "grid", placeItems: "center", fontWeight: 900, fontSize: 26, opacity: seg(t, 19.3 + i * 0.08, 19.45 + i * 0.08) }}>✓</div>
            </div>
          ))}
        </div>
      </div>
      {/* bouton Valider */}
      <div style={{ position: "absolute", left: 40, right: 40, bottom: 70, height: 130, borderRadius: 30, background: tapped ? K.green : K.orange, color: K.paper, display: "grid", placeItems: "center", fontWeight: 800, fontSize: 46, opacity: power2Out(seg(t, 16.4, 16.8)), transform: `scale(${tapped && t < 18.12 ? 0.96 : 1})`, overflow: "hidden" }}>
        {tapped ? "Validé · programmé ✓" : "Valider"}
        {tapped && <div style={{ position: "absolute", left: "50%", top: "50%", width: 40, height: 40, borderRadius: 20, background: "rgba(246,239,227,.45)", transform: `translate(-50%,-50%) scale(${1 + expoOut(seg(t, 18, 18.4)) * 30})`, opacity: 1 - seg(t, 18, 18.4) }} />}
      </div>
      {hover > 0 && t < 18.6 && null}
    </div>
  );
}

const NOTIFS = [
  { app: "Forlife Com", text: "Nouveau prospect · formulaire Instagram", icon: "mark" as const, at: 20.6 },
  { app: "Forlife Com", text: "Relance WhatsApp prête pour Aminata", icon: "wa" as const, at: 21.6 },
  { app: "TikTok", text: "Votre vidéo vous attend dans vos brouillons", icon: "tt" as const, at: 22.6 },
];
function LockScreen({ t }: { t: number }) {
  const day = t < 20.35 ? "Samedi" : t < 20.6 ? "Dimanche" : "Lundi";
  const hour = t < 20.35 ? "09:00" : t < 20.6 ? "14:00" : "08:30";
  return (
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #2b1d14, #4a2e1b)", fontFamily: FONT, color: K.paper, padding: "120px 36px", boxSizing: "border-box" }}>
      <div style={{ textAlign: "center", fontSize: 40, fontWeight: 600, opacity: 0.85 }}>{day}</div>
      <div style={{ textAlign: "center", fontSize: 170, fontWeight: 700, lineHeight: 1.05 }}>{hour}</div>
      <div style={{ marginTop: 70, display: "flex", flexDirection: "column", gap: 22 }}>
        {NOTIFS.map((n) => {
          const p = expoOut(seg(t, n.at, n.at + 0.5));
          if (p <= 0) return null;
          return (
            <div key={n.text} style={{ borderRadius: 30, background: "rgba(246,239,227,.94)", color: K.ink, padding: "24px 26px", display: "flex", gap: 20, alignItems: "center", transform: `translateY(${(1 - p) * -160}px)`, opacity: p }}>
              <div style={{ width: 72, height: 72, flex: "none", borderRadius: 18, background: n.icon === "wa" ? K.green : n.icon === "tt" ? K.ink : K.paper, display: "grid", placeItems: "center", boxShadow: "inset 0 0 0 2px rgba(33,22,15,.08)" }}>
                {n.icon === "mark" && <Mark size={44} />}
                {n.icon === "wa" && <NetWhite name="WHATSAPP" />}
                {n.icon === "tt" && <NetWhite name="TIKTOK" />}
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: K.inkSoft }}>{n.app}</div>
                <div style={{ fontSize: 31, fontWeight: 600, lineHeight: 1.2 }}>{n.text}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
const NET_PATH: Record<string, string> = {
  WHATSAPP:
    "M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35M12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88",
  TIKTOK:
    "M12.53.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
};
function NetWhite({ name }: { name: string }) {
  return (
    <svg width={42} height={42} viewBox="0 0 24 24" fill={K.paper}>
      <path d={NET_PATH[name]} />
    </svg>
  );
}

// ───────────── film ─────────────
export function Equipe({ withMusic = true }: { withMusic?: boolean }) {
  useFonts();
  const frame = useCurrentFrame();
  const t = frame / EQ_FPS;
  return (
    <AbsoluteFill style={{ background: K.woodDark, overflow: "hidden" }}>
      {t < 7.9 && <Night t={t} />}
      {t >= 7.9 && t < 12.5 + 0.5 && <TeamShot t={t} />}
      {t >= 12.5 && t < 24.9 && <PhoneShot t={t} />}
      {t >= 23.9 && <Cta t={t} />}
      {withMusic && <Audio src={staticFile("equipe/musique.mp3")} volume={(f) => interpolate(f, [EQ_DURATION_S * EQ_FPS - 30, EQ_DURATION_S * EQ_FPS], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />}
      {withMusic && <Audio src={staticFile("equipe/sfx.wav")} volume={0.9} />}
    </AbsoluteFill>
  );
}

/** Plans 1-3 : la nuit, la pile de post-it, puis le balayage et le sous-verre sur le drop. */
function Night({ t }: { t: number }) {
  const push = 1 + 0.06 * sineInOut(seg(t, 2.5, 6));
  const sweep = power3InOut(seg(t, 6.0, 6.5));
  const handIn = power2Out(seg(t, 4.2, 4.9));
  const day = power2Out(seg(t, 6.0, 6.6));
  // Masque en forme de F : le logo s'ouvre sur l'équipe (7,1 s → 7,9 s).
  const maskP = t < 6.7 ? 0 : power3InOut(seg(t, 6.7, 7.9));
  const caret = Math.floor(t * 2) % 2 === 0;
  return (
    <AbsoluteFill style={{ transform: `scale(${push})` }}>
      <AbsoluteFill style={woodBg(mix(0.55, 1.08, day))} />
      {/* halo de lampe la nuit */}
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 46%, rgba(255,190,120,.30), rgba(20,10,4,.72) 62%)", opacity: 1 - day }} />
      {/* pagne et verre de thé */}
      <Shadowed x={-140} y={1540} rot={-12}>
        <div style={{ width: 520, height: 420, ...waxBg, borderRadius: 8 }} />
      </Shadowed>
      <Shadowed x={830} y={60}>
        <div style={{ width: 170, height: 170, borderRadius: 85, background: "radial-gradient(circle at 45% 40%, #c98a3c, #8a4f1c 70%)", boxShadow: "inset 0 0 0 10px rgba(246,239,227,.35)" }} />
      </Shadowed>
      {/* téléphone : légende vide, curseur qui clignote, 23:58 */}
      <div style={{ position: "absolute", left: 540 - 210, top: 520, transform: `translateX(${-sweep * 0}px)` }}>
        <Phone w={420}>
          <div style={{ fontFamily: FONT, padding: "34px 28px", color: K.ink }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, fontWeight: 700 }}>
              <span>23:58</span>
              <span>▮▮▮</span>
            </div>
            <div style={{ marginTop: 60, fontSize: 26, fontWeight: 700, color: K.inkSoft }}>Nouvelle publication</div>
            <div style={{ marginTop: 18, height: 300, borderRadius: 20, background: "#efe5d6", padding: 22, fontSize: 30, fontWeight: 600, color: K.inkSoft }}>
              Écrivez une légende…{caret && <span style={{ color: K.orange }}>|</span>}
            </div>
          </div>
        </Phone>
      </div>
      {/* post-it : un par temps, puis la pile ; balayés vers la gauche sur le drop */}
      {NOTES.map((n, i) => {
        const at = i < 4 ? 0.25 + i * 0.5 : 2.5 + (i - 4) * 0.5;
        if (t < at) return null;
        const p = seg(t, at, at + 0.35);
        const drop = backOut(p);
        const sx = -sweep * (1500 + i * 60);
        return (
          <Shadowed key={n.text} x={n.x + sx} y={n.y - (1 - drop) * 300} rot={n.r - sweep * 25} lift={1 - p} z={10 + i}>
            <div style={{ filter: sweep > 0 && sweep < 1 ? "blur(4px)" : undefined }}>
              <Note text={n.text} color={n.color} />
            </div>
          </Shadowed>
        );
      })}
      {/* main qui hésite, puis balaie */}
      {t >= 4.2 && t < 6.6 && (
        <div style={{ position: "absolute", left: mix(1100, 720, handIn) - sweep * 1700, top: mix(1300, 980, handIn) + Math.sin(t * 6) * 6 * (1 - sweep), transform: `rotate(${-30 - sweep * 40}deg)`, zIndex: 30, filter: "drop-shadow(18px 30px 24px rgba(20,8,2,.45))" }}>
          <Hand />
        </div>
      )}
      {/* mots tamponnés */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 860, display: "flex", flexDirection: "column", alignItems: "center", gap: 20, zIndex: 40, opacity: 1 - sweep }}>
        <div style={{ background: K.paper, padding: "18px 34px", transform: "rotate(-3deg)", opacity: t >= 2.9 ? 1 : 0, boxShadow: "0 18px 40px rgba(20,8,2,.4)" }}>
          <Stamp t={t} at={2.9} text="Vous faites tout." size={86} rot={0} />
        </div>
        <div style={{ background: K.ink, padding: "14px 40px", transform: "rotate(2deg)", opacity: t >= 4.0 ? 1 : 0, boxShadow: "0 18px 40px rgba(20,8,2,.4)" }}>
          <Stamp t={t} at={4.0} text="Seul." size={120} rot={0} color={K.orangeLight} />
        </div>
      </div>
      {/* sous-verre de marque posé sur le drop (6,0 s) */}
      {t >= 6.0 && (
        <Shadowed x={540 - 190} y={960 - 190 - (1 - backOut(seg(t, 6.05, 6.45))) * 320} lift={1 - seg(t, 6.05, 6.45)} z={50}>
          <div style={{ width: 380, height: 380, borderRadius: 190, background: K.orange, display: "grid", placeItems: "center", boxShadow: "inset 0 0 0 14px rgba(255,178,107,.55)" }}>
            <Mark size={190} color={K.paper} />
          </div>
        </Shadowed>
      )}
      {/* masque F : l'équipe apparaît à travers le logo */}
      {maskP > 0 && (
        <AbsoluteFill style={{ zIndex: 60, WebkitMaskImage: MARK_MASK, maskImage: MARK_MASK, WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", WebkitMaskPosition: "center", maskPosition: "center", WebkitMaskSize: `${mix(190, 9000, maskP * maskP)}px`, maskSize: `${mix(190, 9000, maskP * maskP)}px` }}>
          <TeamShot t={t} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
}

/** Plan 4 : les badges d'équipe se balancent sur leurs cordons, tous reliés au téléphone. */
function TeamShot({ t }: { t: number }) {
  const drift = Math.sin((t - 7.5) * 0.8) * 10;
  const carry = power3InOut(seg(t, 12.1, 12.7));
  const title = expoOut(seg(t, 8.2, 8.8));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ ...woodBg(1.12), transform: `translateX(${drift * 0.3}px)` }} />
      <Shadowed x={-120 + drift * 0.6} y={1640} rot={8}>
        <div style={{ width: 600, height: 380, ...waxBg, borderRadius: 8 }} />
      </Shadowed>
      {/* cordons */}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {BADGE_POS.map((b, i) => {
          const at = 7.5 + i * 0.25;
          const show = seg(t, at, at + 0.3);
          if (show <= 0 || (i === 0 && carry > 0.05)) return null;
          const px = PHONE4.x + drift * 1.4;
          const py = PHONE4.y - PHONE4.w;
          return <path key={i} d={`M${b.x + drift} ${b.y} Q ${(b.x + px) / 2} ${Math.max(b.y, py) + 160} ${px} ${py}`} stroke={K.orange} strokeWidth={6} fill="none" opacity={show * 0.9} strokeLinecap="round" />;
        })}
      </svg>
      {/* badges */}
      {BADGE_POS.map((b, i) => {
        const at = 7.5 + i * 0.25;
        if (t < at) return null;
        const p = seg(t, at, at + 0.4);
        const rot = swing(t, at + 0.2);
        const isCarry = i === 0 && carry > 0;
        const cx = isCarry ? mix(b.x + drift, PHONE4.x, carry) : b.x + drift;
        const cy = isCarry ? mix(b.y, PHONE4.y - 120, carry) : b.y - (1 - backOut(p)) * 420;
        return (
          <div key={i} style={{ position: "absolute", left: cx - 135, top: cy - 20, transformOrigin: "135px 20px", transform: `rotate(${rot}deg) scale(${isCarry ? 1 - carry * 0.8 : 1})`, filter: `drop-shadow(${10 + (1 - p) * 30}px ${16 + (1 - p) * 40}px ${12 + (1 - p) * 26}px rgba(25,12,4,.38))`, zIndex: isCarry ? 20 : 5 }}>
            <Badge i={i} />
          </div>
        );
      })}
      {/* téléphone au bout des cordons */}
      <div style={{ position: "absolute", left: PHONE4.x - PHONE4.w / 2 + drift * 1.4, top: PHONE4.y - PHONE4.w, zIndex: 8 }}>
        <Phone w={PHONE4.w} glow={0.4}>
          <div style={{ display: "grid", placeItems: "center", height: "100%" }}>
            <Mark size={110} />
          </div>
        </Phone>
      </div>
      {/* titre */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 110, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 84, lineHeight: 1.05, color: K.paper, opacity: title * (1 - carry), transform: `translateX(${(1 - title) * 120}px)`, textShadow: "0 6px 24px rgba(20,8,2,.45)" }}>
        Votre équipe marketing
      </div>
    </AbsoluteFill>
  );
}

/** Plans 5-6 : poussée vers le téléphone, la preuve, puis le temps qui passe. */
function PhoneShot({ t }: { t: number }) {
  const inP = power2Out(seg(t, 12.5, 13.1));
  const w = mix(300, 900, inP);
  const out = power4Out(seg(t, 24.0, 24.9));
  const scale = mix(1, 0.42, out);
  const tick = seg(t, 19.9, 20.5); // tic de l'horloge : changement d'écran
  const buzz = NOTIFS.reduce((acc, n) => acc + (t >= n.at && t < n.at + 0.2 ? Math.sin((t - n.at) * 120) * 4 * (1 - (t - n.at) / 0.2) : 0), 0);
  const fingerIn = power2Out(seg(t, 17.0, 17.5));
  const press = t >= 18 && t < 18.12 ? 1 : 0;
  const fingerOut = power2Out(seg(t, 18.2, 18.7));
  return (
    <AbsoluteFill style={{ opacity: 1 - seg(t, 24.6, 24.9) }}>
      <AbsoluteFill style={woodBg(1.12)} />
      <div style={{ position: "absolute", left: 540 - w / 2 + buzz, top: mix(1200, 960, inP) - w * 1.025, transform: `scale(${scale})`, transformOrigin: "50% 50%" }}>
        <Phone w={w}>
          <div style={{ position: "absolute", inset: 0, width: 900, height: 1845, transform: `scale(${w / 900 - 0.0})`, transformOrigin: "0 0" }}>
            {t < 20.2 ? <StudioScreen t={t} /> : <LockScreen t={t} />}
          </div>
          {/* passage du temps : volet d'horloge */}
          {tick > 0 && tick < 1 && <div style={{ position: "absolute", inset: 0, background: `conic-gradient(rgba(33,22,15,.92) ${tick * 360}deg, rgba(0,0,0,0) 0)` }} />}
        </Phone>
      </div>
      {/* doigt qui valide */}
      {t >= 17.0 && t < 18.7 && (
        <div style={{ position: "absolute", left: 470, top: mix(1950, 1610, fingerIn) + fingerOut * 500 + press * 8, transform: "rotate(-6deg)", zIndex: 10, filter: "drop-shadow(16px 26px 22px rgba(20,8,2,.42))" }}>
          <Hand press={press} />
        </div>
      )}
    </AbsoluteFill>
  );
}

/** Plan 7 : la caméra monte, le comptoir est rangé ; l'équipe est rangée dans le téléphone. */
function Cta({ t }: { t: number }) {
  const rise = power4Out(seg(t, 24.0, 25.0));
  const l1 = expoOut(seg(t, 25.0, 25.6));
  const l2 = expoOut(seg(t, 25.5, 26.1));
  const lock = power4Out(seg(t, 26.6, 27.2));
  const contact = power2Out(seg(t, 27.4, 27.9));
  return (
    <AbsoluteFill style={{ opacity: seg(t, 23.9, 24.3) }}>
      <AbsoluteFill style={{ ...woodBg(1.15), transform: `scale(${mix(1.6, 1, rise)})` }} />
      <Shadowed x={mix(-200, -60, rise)} y={1460} rot={-9}>
        <div style={{ width: 420, height: 380, ...waxBg, borderRadius: 8 }} />
      </Shadowed>
      <Shadowed x={830} y={1500}>
        <div style={{ width: 170, height: 170, borderRadius: 85, background: "radial-gradient(circle at 45% 40%, #c98a3c, #8a4f1c 70%)", boxShadow: "inset 0 0 0 10px rgba(246,239,227,.35)" }} />
      </Shadowed>
      {/* téléphone + équipe rangée en icônes (motif) */}
      <div style={{ position: "absolute", left: 540 - 190, top: mix(560, 640, rise) }}>
        <Phone w={380} glow={0.6}>
          <div style={{ padding: "60px 30px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 26, justifyItems: "center" }}>
            {TEAM.map((m, i) => {
              const p = power4Out(seg(t, 24.6 + i * 0.12, 25.1 + i * 0.12));
              return (
                <div key={m.role} style={{ textAlign: "center", fontFamily: FONT, transform: `translateY(${(1 - p) * -260}px) scale(${mix(1.8, 1, p)})`, opacity: p }}>
                  <div style={{ width: 104, height: 104, borderRadius: 30, background: K.orange, display: "grid", placeItems: "center", margin: "0 auto" }}>
                    <RoleIcon name={m.icon} size={58} />
                  </div>
                  <div style={{ fontSize: 19, fontWeight: 700, color: K.ink, marginTop: 8 }}>{m.role}</div>
                </div>
              );
            })}
          </div>
        </Phone>
      </div>
      {/* message */}
      <div style={{ position: "absolute", left: 50, right: 50, top: 130, textAlign: "center", fontFamily: FONT, color: K.paper, textShadow: "0 6px 24px rgba(20,8,2,.45)" }}>
        <div style={{ fontSize: 76, fontWeight: 900, lineHeight: 1.05, opacity: l1, transform: `translateY(${(1 - l1) * 60}px)` }}>Toute une équipe marketing</div>
        <div style={{ fontSize: 60, fontWeight: 700, marginTop: 14, color: K.orangeLight, opacity: l2, transform: `translateX(${(1 - l2) * -80}px)` }}>dans votre téléphone.</div>
      </div>
      {/* bloc marque + action */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 1420, borderRadius: 40, background: K.paper, padding: "36px 40px", fontFamily: FONT, color: K.ink, opacity: lock, transform: `translateY(${(1 - lock) * 200}px)`, boxShadow: "0 30px 60px rgba(20,8,2,.4)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <Mark size={70} />
          <div>
            <div style={{ fontSize: 56, fontWeight: 900, lineHeight: 1 }}>Forlife Com</div>
            <div style={{ fontSize: 28, fontWeight: 600, color: K.inkSoft, marginTop: 6 }}>Créez votre espace gratuitement</div>
          </div>
        </div>
        <div style={{ marginTop: 26, display: "flex", alignItems: "center", gap: 18, opacity: contact }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: K.green, display: "grid", placeItems: "center", flex: "none" }}>
            <NetWhite name="WHATSAPP" />
          </div>
          <div style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.25 }}>
            +225 07 79 59 05 62
            <br />
            +225 05 85 80 18 56
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}
