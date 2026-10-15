import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame } from "remotion";
import { C, FONT, Flash, GRAD, Glass, GradText, Logo, NETWORKS, NetIcon, Scene, TimeCtx, Words, easeOut, lin, pop, shake, useLayout } from "../kit";
import { useFonts } from "../fonts";

/**
 * « L'histoire d'Awa » — pub Forlife Com sans voix off : la typographie raconte, la musique porte.
 * Musique ElevenLabs (afrobeat ≈109 BPM), drop à 8,2 s ; photos d'Awa générées avec un visage constant.
 */
export const STORY_FPS = 30;
export const STORY_DURATION_S = 30;
const BEAT = 0.55;
const DROP = 8.2;
const T = {
  problem: [0, DROP],
  reveal: [DROP, 10.4],
  strategy: [10.4, 12.05],
  posts: [12.05, 13.7],
  visuals: [13.7, 15.35],
  videos: [15.35, 17.0],
  publish: [17.0, 18.65],
  sell: [18.65, 20.3],
  success: [20.3, 25.8],
  cta: [25.8, 30.5],
} as const;

const pulseAt = (t: number) => (t < DROP ? 0 : Math.exp(-(((t - DROP) % BEAT) / BEAT) * 7));

export function Story() {
  useFonts();
  const t = useCurrentFrame() / STORY_FPS;
  return (
    <TimeCtx.Provider value={t}>
      <AbsoluteFill style={{ background: C.bg, fontFamily: FONT, color: C.cream, overflow: "hidden" }}>
        <Problem t={t} />
        <Reveal t={t} />
        <Features t={t} />
        <Success t={t} />
        <Cta t={t} />
        <Flash t={t} at={DROP} dur={0.4} color={C.orangeLight} />
        <Flash t={t} at={T.success[0]} dur={0.25} />
        <Flash t={t} at={T.cta[0]} dur={0.3} color={C.orangeLight} />
        <Grain t={t} />
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,.55) 100%)" }} />
        <Audio src={staticFile("story/musique.mp3")} />
      </AbsoluteFill>
    </TimeCtx.Provider>
  );
}

/* ───────── Outils ───────── */
function Photo({ src, t, from, to, zoom = [1.08, 1.22], pan = [0, 0], focusV = "50% 50%", filter }: { src: string; t: number; from: number; to: number; zoom?: [number, number]; pan?: [number, number]; focusV?: string; filter?: string }) {
  const { v } = useLayout();
  const p = lin(t, from, to);
  const s = zoom[0] + (zoom[1] - zoom[0]) * p;
  const x = pan[0] + (pan[1] - pan[0]) * p;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: v ? focusV : "50% 45%", transform: `scale(${s}) translateX(${x}%)`, filter }} />
    </AbsoluteFill>
  );
}

function Grain({ t }: { t: number }) {
  const seed = Math.floor(t * 24) % 4;
  return (
    <AbsoluteFill
      style={{
        opacity: 0.06,
        mixBlendMode: "overlay",
        backgroundImage: `repeating-radial-gradient(circle at ${17 + seed * 23}% ${31 + seed * 17}%, #fff 0 1px, transparent 1px 3px)`,
        backgroundSize: "7px 7px",
      }}
    />
  );
}

function Caption({ children, style, pos = "bottom" }: { children: ReactNode; style?: CSSProperties; pos?: "top" | "center" | "bottom" }) {
  const { v } = useLayout();
  const place: CSSProperties = pos === "top" ? { top: v ? 230 : 110 } : pos === "bottom" ? { bottom: v ? 300 : 120 } : { top: 0, bottom: 0, display: "grid", alignContent: "center" };
  return (
    <div style={{ position: "absolute", left: v ? 70 : 160, right: v ? 70 : 160, textAlign: "center", fontWeight: 800, letterSpacing: "-0.025em", lineHeight: 1.1, textShadow: "0 6px 40px rgba(0,0,0,.65)", ...place, ...style }}>
      {children}
    </div>
  );
}

/* ───────── 1. Le problème (soir, boutique vide) ───────── */
function Problem({ t }: { t: number }) {
  const { v } = useLayout();
  const [a, b] = T.problem;
  const chips = [
    { at: 3.0, icon: "♡", text: "0 j'aime" },
    { at: 3.45, icon: "💬", text: "0 message" },
    { at: 3.9, icon: "🛍️", text: "0 vente" },
  ];
  return (
    <Scene t={t} from={a} to={b}>
      <Photo src="story/awa-soir.jpg" t={t} from={a} to={b} zoom={[1.05, 1.28]} focusV="50% 30%" filter="saturate(.75) brightness(.8) contrast(1.05) hue-rotate(-8deg)" />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(5,8,20,.55), rgba(5,8,20,.1) 40%, rgba(5,8,20,.75))" }} />
      <Caption pos="bottom" style={{ fontSize: v ? 104 : 92, opacity: 1 - lin(t, 2.6, 2.85) }}>
        <div style={{ opacity: lin(t, 0.3, 0.6), transform: `translateY(${(1 - easeOut(lin(t, 0.3, 0.7))) * 30}px)`, color: C.orangeLight }}>20h.</div>
        <div style={{ fontSize: v ? 68 : 62, fontWeight: 700, marginTop: 10 }}>
          <Words t={t} at={1.1} text="Awa a encore posté…" step={0.18} />
        </div>
      </Caption>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: v ? 330 : 140, display: "flex", justifyContent: "center", gap: 18, flexWrap: "wrap", padding: "0 60px", opacity: 1 - lin(t, 4.85, 5.05) }}>
        {chips.map((c) => {
          const p = pop(t, c.at, 10, 220);
          return (
            <Glass key={c.text} style={{ padding: "18px 30px", fontSize: v ? 50 : 42, fontWeight: 800, display: "flex", gap: 14, alignItems: "center", transform: `scale(${p}) translateY(${(1 - p) * 40}px)`, opacity: Math.min(1, p * 1.5), borderColor: "rgba(255,90,79,.5)" }}>
              <span>{c.icon}</span>
              <span>{c.text}</span>
            </Glass>
          );
        })}
      </div>
      <Caption pos="bottom" style={{ fontSize: v ? 80 : 70, transform: `translateX(${shake(t, 5.2, 10) + shake(t, 5.9, 10)}px)`, opacity: lin(t, 5.1, 5.2) * (1 - lin(t, 6.35, 6.55)) }}>
        <Words t={t} at={5.2} text="Pas le temps." step={0.12} />
        <br />
        <Words t={t} at={5.9} text="Pas d'idées." step={0.12} />
      </Caption>
      <Caption pos="bottom" style={{ fontSize: v ? 76 : 72, opacity: lin(t, 6.6, 6.8) }}>
        <Words t={t} at={6.6} text="Et si ton business avait enfin son équipe marketing ?" step={0.11} highlight={["équipe", "marketing"]} />
      </Caption>
    </Scene>
  );
}

/* ───────── 2. Drop : Forlife Com ───────── */
function Reveal({ t }: { t: number }) {
  const { v } = useLayout();
  const [a, b] = T.reveal;
  const p = pulseAt(t);
  return (
    <Scene t={t} from={a} to={b}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, rgba(234,120,34,.45), transparent 60%), ${C.bg}` }} />
      <div style={{ position: "absolute", inset: "-30%", background: `repeating-conic-gradient(from ${t * 30}deg, rgba(234,120,34,.2) 0deg 7deg, transparent 7deg 20deg)`, maskImage: "radial-gradient(circle, #000 10%, transparent 55%)", WebkitMaskImage: "radial-gradient(circle, #000 10%, transparent 55%)" }} />
      <AbsoluteFill style={{ display: "grid", placeItems: "center", textAlign: "center" }}>
        <div style={{ display: "grid", justifyItems: "center", gap: 16, transform: `scale(${1 + p * 0.05})` }}>
          <Logo size={v ? 220 : 180} t={t} at={a} />
          <div style={{ fontSize: v ? 132 : 140, fontWeight: 900, letterSpacing: "-0.045em", lineHeight: 1, display: "flex" }}>
            {"Forlife Com".split("").map((ch, i) => {
              const q = pop(t, a + 0.25 + i * 0.03, 10, 230);
              return (
                <span key={i} style={{ display: "inline-block", whiteSpace: "pre", opacity: Math.min(1, q * 1.5), transform: `translateY(${(1 - q) * 70}px)` }}>
                  {ch}
                </span>
              );
            })}
          </div>
          <div style={{ fontSize: v ? 40 : 38, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: C.orangeLight, opacity: lin(t, a + 0.8, a + 1.1) }}>AI Growth &amp; Creative OS</div>
        </div>
      </AbsoluteFill>
    </Scene>
  );
}

/* ───────── 3. Ce que fait Forlife Com (au rythme) ───────── */
function FeatureFrame({ t, range, title, children }: { t: number; range: readonly [number, number]; title: string; children: ReactNode }) {
  const { v } = useLayout();
  const [a, b] = range;
  const p = pop(t, a, 12, 240);
  return (
    <Scene t={t} from={a} to={b}>
      <div style={{ position: "absolute", left: 0, right: 0, top: v ? 250 : 90, textAlign: "center", fontSize: v ? 96 : 90, fontWeight: 900, letterSpacing: "-0.04em", transform: `translateY(${(1 - p) * -40}px)`, opacity: Math.min(1, p * 1.4) }}>
        <GradText>{title}</GradText>
      </div>
      <AbsoluteFill style={{ display: "grid", placeItems: "center", paddingTop: v ? 140 : 110 }}>{children}</AbsoluteFill>
    </Scene>
  );
}

function Features({ t }: { t: number }) {
  const { v } = useLayout();
  const [a, b] = [T.strategy[0], T.sell[1]];
  if (t < a - 0.05 || t >= b) return null;
  const p = pulseAt(t);
  const POST = "Nouvelle collection wax 🔥 Livraison gratuite ce week-end. Écris-nous sur WhatsApp !";
  const typed = Math.floor(lin(t, T.posts[0] + 0.15, T.posts[1] - 0.25) * POST.length);
  const sale = Math.round(easeOut(lin(t, T.sell[0] + 0.7, T.sell[0] + 1.3)) * 45000);
  return (
    <>
      <Photo src="story/awa-portrait.jpg" t={t} from={a} to={b} zoom={[1.15, 1.3]} focusV="50% 30%" filter="blur(18px) brightness(.35) saturate(1.3)" />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 55%, rgba(234,120,34,${0.18 + p * 0.12}), transparent 60%)` }} />

      <FeatureFrame t={t} range={T.strategy} title="Ta stratégie">
        <Glass style={{ width: v ? 860 : 900, padding: 34, fontSize: v ? 34 : 32 }}>
          {["🎯 Objectif : 50 commandes ce mois", "📅 3 posts + 1 vidéo par semaine", "💬 Relances WhatsApp le jeudi"].map((line, i) => (
            <div key={line} style={{ padding: "14px 0", borderTop: i ? "1px solid rgba(255,255,255,.1)" : "none", transform: `translateX(${(1 - pop(t, T.strategy[0] + 0.15 + i * 0.18)) * 120}px)`, opacity: Math.min(1, pop(t, T.strategy[0] + 0.15 + i * 0.18) * 1.4) }}>
              {line}
            </div>
          ))}
        </Glass>
      </FeatureFrame>

      <FeatureFrame t={t} range={T.posts} title="Tes posts">
        <Glass style={{ width: v ? 860 : 900, padding: 34 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div style={{ width: 58, height: 58, borderRadius: "50%", overflow: "hidden" }}>
              <Img src={staticFile("story/awa-portrait.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "52% 30%", transform: "scale(2.2)" }} />
            </div>
            <b style={{ fontSize: 30 }}>Boutique Awa</b>
            <span style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              {NETWORKS.slice(0, 4).map((n) => (
                <NetIcon key={n} name={n} size={44} />
              ))}
            </span>
          </div>
          <div style={{ fontSize: v ? 36 : 32, lineHeight: 1.45, minHeight: 160 }}>
            {POST.slice(0, typed)}
            {typed < POST.length && <span style={{ display: "inline-block", width: 4, height: 36, background: C.orange, marginLeft: 3, verticalAlign: -6 }} />}
          </div>
        </Glass>
      </FeatureFrame>

      <FeatureFrame t={t} range={T.visuals} title="Tes visuels">
        <div style={{ width: v ? 620 : 560, height: v ? 620 : 560, borderRadius: 36, overflow: "hidden", position: "relative", boxShadow: "0 40px 100px rgba(0,0,0,.55)", transform: `rotate(${-3 + (1 - pop(t, T.visuals[0], 9)) * -12}deg) scale(${pop(t, T.visuals[0], 9)})` }}>
          <Img src={staticFile("story/awa-portrait.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "52% 40%" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 40%, rgba(26,13,3,.85))" }} />
          <div style={{ position: "absolute", left: 30, top: 26, background: GRAD, color: C.ink, fontWeight: 900, fontSize: 64, padding: "4px 22px", borderRadius: 18, transform: `scale(${pop(t, T.visuals[0] + 0.35, 7)}) rotate(-4deg)` }}>-20%</div>
          <div style={{ position: "absolute", left: 30, bottom: 30, fontSize: 40, fontWeight: 800 }}>Wax premium · ce week-end</div>
        </div>
      </FeatureFrame>

      <FeatureFrame t={t} range={T.videos} title="Tes vidéos">
        <div style={{ width: v ? 400 : 330, height: v ? 700 : 580, borderRadius: 40, overflow: "hidden", position: "relative", boxShadow: "0 40px 100px rgba(0,0,0,.55)", transform: `scale(${pop(t, T.videos[0], 9)})` }}>
          <Img src={staticFile("story/awa-boutique.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "22% 50%", transform: `scale(${1.1 + lin(t, T.videos[0], T.videos[1]) * 0.15})` }} />
          <div style={{ position: "absolute", left: "50%", top: "45%", transform: `translate(-50%,-50%) scale(${1 + p * 0.12})`, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,.92)", display: "grid", placeItems: "center" }}>
            <div style={{ width: 0, height: 0, borderLeft: "40px solid #ea7822", borderTop: "26px solid transparent", borderBottom: "26px solid transparent", marginLeft: 10 }} />
          </div>
          <div style={{ position: "absolute", left: 24, right: 24, bottom: 34, height: 8, borderRadius: 4, background: "rgba(255,255,255,.3)" }}>
            <div style={{ width: `${lin(t, T.videos[0], T.videos[1]) * 100}%`, height: "100%", borderRadius: 4, background: GRAD }} />
          </div>
          <div style={{ position: "absolute", top: 20, right: 20, fontSize: 26, fontWeight: 800, background: "rgba(0,0,0,.55)", padding: "4px 14px", borderRadius: 999 }}>15 s</div>
        </div>
      </FeatureFrame>

      <FeatureFrame t={t} range={T.publish} title="Publiés partout">
        <div style={{ position: "relative", width: 10, height: 10 }}>
          {NETWORKS.map((n, i) => {
            const q = pop(t, T.publish[0] + 0.1 + i * 0.09, 9, 200);
            const ang = (i / NETWORKS.length) * Math.PI * 2 - Math.PI / 2 + t * 0.4;
            const R = (v ? 300 : 280) * q;
            return (
              <div key={n} style={{ position: "absolute", left: Math.cos(ang) * R - 55, top: Math.sin(ang) * R - 55, transform: `scale(${q})` }}>
                <NetIcon name={n} size={110} />
              </div>
            );
          })}
          <div style={{ position: "absolute", left: -100, top: -100, width: 200, height: 200, borderRadius: "50%", background: GRAD, display: "grid", placeItems: "center", boxShadow: `0 0 ${60 + p * 80}px rgba(234,120,34,.8)` }}>
            <Logo size={100} />
          </div>
        </div>
      </FeatureFrame>

      <FeatureFrame t={t} range={T.sell} title="Tes ventes">
        <div style={{ display: "grid", gap: 26, justifyItems: "center" }}>
          <Glass style={{ padding: "18px 26px", fontSize: v ? 36 : 32, display: "flex", gap: 16, alignItems: "center", transform: `scale(${pop(t, T.sell[0] + 0.1)})` }}>
            <NetIcon name="WHATSAPP" size={56} /> « Bonjour, la robe wax est dispo ? »
          </Glass>
          <div style={{ transform: `scale(${pop(t, T.sell[0] + 0.65, 8, 220)})`, background: "linear-gradient(135deg,#2fd27a,#128a4a)", padding: "20px 44px", borderRadius: 28, textAlign: "center", boxShadow: "0 24px 70px rgba(29,180,100,.5)" }}>
            <div style={{ fontSize: 28, fontWeight: 600 }}>✓ Vente gagnée</div>
            <div style={{ fontSize: v ? 76 : 70, fontWeight: 900, letterSpacing: "-0.02em" }}>+{sale.toLocaleString("fr-FR").replace(/ | /g, " ")} FCFA</div>
          </div>
        </div>
      </FeatureFrame>
    </>
  );
}

/* ───────── 4. Aujourd'hui (boutique pleine) ───────── */
function Success({ t }: { t: number }) {
  const { v } = useLayout();
  const [a, b] = T.success;
  return (
    <Scene t={t} from={a} to={b}>
      <Photo src="story/awa-boutique.jpg" t={t} from={a} to={b} zoom={[1.18, 1.05]} pan={v ? [0, 4] : [0, 0]} focusV="24% 50%" filter="saturate(1.12) contrast(1.04) brightness(1.02)" />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(26,13,3,.55), transparent 30%, transparent 55%, rgba(26,13,3,.8))" }} />
      <Caption pos="bottom" style={{ fontSize: v ? 74 : 66, opacity: 1 - lin(t, a + 2.5, a + 2.7) }}>
        <Words t={t} at={a + 0.3} text="Aujourd'hui, Awa a retrouvé ses soirées." step={0.12} highlight={["soirées"]} />
      </Caption>
      <Caption pos="bottom" style={{ fontSize: v ? 74 : 66 }}>
        <Words t={t} at={a + 2.75} text="Et sa boutique ne désemplit plus." step={0.12} highlight={["désemplit", "plus"]} />
      </Caption>
    </Scene>
  );
}

/* ───────── 5. Appel à l'action ───────── */
function Cta({ t }: { t: number }) {
  const { v } = useLayout();
  const [a, b] = T.cta;
  const p = pulseAt(t);
  const url = "ai-growth-et-creative-os.web.app";
  const typed = Math.floor(lin(t, a + 1.6, a + 2.4) * url.length);
  const stamp = pop(t, a + 1.0, 8, 220);
  return (
    <Scene t={t} from={a} to={b} exit={false}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, rgba(234,120,34,.35), transparent 60%), ${C.bg}` }} />
      <AbsoluteFill style={{ display: "grid", placeItems: "center", textAlign: "center" }}>
        <div style={{ display: "grid", justifyItems: "center", gap: v ? 34 : 24, transform: `scale(${1 + p * 0.015})` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Logo size={v ? 110 : 90} t={t} at={a} />
            <div style={{ fontSize: v ? 80 : 74, fontWeight: 900, letterSpacing: "-0.04em", opacity: lin(t, a + 0.2, a + 0.45) }}>Forlife Com</div>
          </div>
          <div style={{ fontSize: v ? 104 : 104, fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1 }}>
            <Words t={t} at={a + 0.45} text="Crée ton espace" step={0.12} />
          </div>
          <div style={{ transform: `scale(${stamp === 0 ? 0 : 3 - 2 * stamp}) rotate(-4deg)`, opacity: Math.min(1, stamp * 1.5), background: GRAD, color: C.ink, fontSize: v ? 96 : 92, fontWeight: 900, padding: "6px 40px", borderRadius: 24, boxShadow: "0 30px 90px rgba(234,120,34,.55)" }}>GRATUITEMENT</div>
          <div style={{ marginTop: 10, fontSize: v ? 38 : 36, fontWeight: 600, padding: "14px 28px", borderRadius: 999, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.18)", minWidth: v ? 760 : 800, opacity: lin(t, a + 1.5, a + 1.7) }}>
            🔗 {url.slice(0, typed)}
          </div>
          <div style={{ fontSize: v ? 30 : 28, color: C.muted, opacity: lin(t, a + 2.6, a + 2.9) }}>Fait pour les entrepreneurs d'Afrique · FCFA · mobile money · WhatsApp</div>
        </div>
      </AbsoluteFill>
    </Scene>
  );
}
