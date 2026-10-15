import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { C, FONT, Flash, GRAD, GradText, Logo, NETWORKS, NetIcon, Scene, TimeCtx, Words, easeOut, lin, pop } from "../kit";
import { useFonts } from "../fonts";

/**
 * Présentation Forlife Com (2 min, 16:9) : vraies séquences filmées de l'application, mises en scène
 * dans un écran en 3D, titres de chapitres, photos d'Awa, musique ElevenLabs et voix off.
 */
export const PRES_FPS = 30;
export const PRES_DURATION_S = 120;
const BEAT = 0.55;
const DROP = 7.6;

/** Chapitres : [début, fin] dans la vidéo, et passage de la prise filmée (app.mp4) à montrer. */
export const CHAPTERS = [
  { key: "login", n: "", title: "Votre espace", text: "Créez votre espace en une minute… gratuitement.", at: [12, 17], clip: 8.6 },
  { key: "home", n: "01", title: "Accueil & missions", text: "Chaque matin, vos missions du jour : ce qui compte vraiment pour vendre plus.", at: [17, 24.5], clip: 19.6 },
  { key: "brand", n: "02", title: "Brand DNA", text: "Votre ton, vos produits, vos mots interdits : chaque création reste fidèle à votre marque.", at: [24.5, 31], clip: 29.9 },
  { key: "strategy", n: "03", title: "Stratégie", text: "Vos objectifs deviennent un plan d'action, classé par impact.", at: [31, 37.5], clip: 40.0 },
  { key: "content", n: "04", title: "Content Studio", text: "Vos publications, adaptées à chaque réseau.", at: [37.5, 44], clip: 49.6, nets: true },
  { key: "creative", n: "05", title: "Creative Studio", text: "Des visuels à vos couleurs, notés par un critique exigeant.", at: [44, 50.5], clip: 58.8 },
  { key: "video", n: "06", title: "Video Studio", text: "Des vidéos verticales de 15 secondes, avec storyboard et sous-titres.", at: [50.5, 57], clip: 68.8 },
  { key: "approvals", n: "07", title: "Validation & calendrier", text: "Rien ne part sans votre accord. Vous validez, puis vous programmez.", at: [57, 64.5], clip: 78.4 },
  { key: "social", n: "08", title: "Social Hub", text: "Publication automatique sur vos pages, résultats mesurés.", at: [64.5, 70.5], clip: 92.6 },
  { key: "campaigns", n: "09", title: "Campagnes", text: "Des campagnes complètes, avec formulaires de capture et suivi des prospects.", at: [70.5, 76.5], clip: 101.0 },
  { key: "crm", n: "10", title: "CRM & WhatsApp", text: "Chaque demande arrive dans le CRM. Relancez sur WhatsApp au bon moment.", at: [76.5, 82.5], clip: 109.3 },
  { key: "analytics", n: "11", title: "Analytics & ROI", text: "Vos contenus reliés à vos ventes réelles, en FCFA.", at: [82.5, 88.5], clip: 117.0 },
  { key: "copilot", n: "12", title: "AI Copilot & 12 agents", text: "Votre Copilot conseille et prépare le travail. Vous n'avez plus qu'à valider.", at: [88.5, 97], clip: 125.4 },
] as const;
const SUCCESS = [97, 106] as const;
const CTA = [106, 121] as const;

/** Voix off : fichier et instant de départ (secondes). */
export const VO_CUES: { file: string; at: number }[] = [
  { file: "intro", at: 0.6 },
  { file: "reveal", at: 8.0 },
  ...CHAPTERS.map((c) => ({ file: c.key, at: c.at[0] + 0.35 })),
  { file: "success", at: SUCCESS[0] + 0.4 },
  { file: "cta", at: CTA[0] + 0.5 },
];

const pulseAt = (t: number) => (t < DROP ? 0 : Math.exp(-(((t - DROP) % BEAT) / BEAT) * 7));

export function Presentation({ withVoice = true }: { withVoice?: boolean }) {
  useFonts();
  const frame = useCurrentFrame();
  const t = frame / PRES_FPS;
  return (
    <TimeCtx.Provider value={t}>
      <AbsoluteFill style={{ background: C.bg, fontFamily: FONT, color: C.cream, overflow: "hidden" }}>
        <Backdrop t={t} />
        <Intro t={t} />
        <Reveal t={t} />
        {CHAPTERS.map((c, i) => (
          <Chapter key={c.key} t={t} i={i} c={c} />
        ))}
        <Success t={t} />
        <Cta t={t} />
        <Progress t={t} />
        <Flash t={t} at={DROP} dur={0.45} color={C.orangeLight} />
        <Flash t={t} at={SUCCESS[0]} dur={0.25} />
        <Flash t={t} at={CTA[0]} dur={0.3} color={C.orangeLight} />
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,.5) 100%)", pointerEvents: "none" }} />
        <Audio src={staticFile("pres/musique.mp3")} volume={(f) => musicVolume(f / PRES_FPS, withVoice)} />
        {withVoice &&
          VO_CUES.map((v) => (
            <Sequence key={v.file} from={Math.round(v.at * PRES_FPS)}>
              <Audio src={staticFile(`pres/vo/${v.file}.mp3`)} volume={1} />
            </Sequence>
          ))}
      </AbsoluteFill>
    </TimeCtx.Provider>
  );
}

/** Musique pleine pendant les respirations, plus discrète sous la voix. */
function musicVolume(t: number, withVoice: boolean) {
  if (!withVoice) return 0.9;
  if (t < DROP) return 0.55;
  if (t < 12) return 0.75;
  if (t > CTA[1] - 4) return 0.6;
  return 0.42;
}

/* ───────── Décor ───────── */
function Backdrop({ t }: { t: number }) {
  const p = pulseAt(t);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: "-25%", filter: "blur(90px)", opacity: 0.85 + p * 0.15 }}>
        <div style={{ position: "absolute", width: "55%", height: "60%", left: `${8 + Math.sin(t * 0.25) * 10}%`, top: `${10 + Math.cos(t * 0.2) * 8}%`, borderRadius: "50%", background: "radial-gradient(circle, rgba(234,120,34,.5), transparent 65%)" }} />
        <div style={{ position: "absolute", width: "50%", height: "55%", right: `${4 + Math.cos(t * 0.22) * 8}%`, bottom: `${6 + Math.sin(t * 0.3) * 8}%`, borderRadius: "50%", background: "radial-gradient(circle, rgba(217,172,78,.35), transparent 65%)" }} />
      </div>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px)", backgroundSize: "64px 64px", backgroundPosition: `${t * 6}px ${t * 10}px`, maskImage: "radial-gradient(ellipse at 50% 50%, #000 30%, transparent 80%)", WebkitMaskImage: "radial-gradient(ellipse at 50% 50%, #000 30%, transparent 80%)" }} />
    </AbsoluteFill>
  );
}

function Photo({ src, t, from, to, zoom = [1.05, 1.18], filter, pos = "50% 40%" }: { src: string; t: number; from: number; to: number; zoom?: [number, number]; filter?: string; pos?: string }) {
  const s = zoom[0] + (zoom[1] - zoom[0]) * lin(t, from, to);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, transform: `scale(${s})`, filter }} />
    </AbsoluteFill>
  );
}

/* ───────── Ouverture ───────── */
function Intro({ t }: { t: number }) {
  return (
    <Scene t={t} from={0} to={DROP}>
      <Photo src="story/awa-soir.jpg" t={t} from={0} to={DROP} zoom={[1.02, 1.15]} filter="saturate(.75) brightness(.72) hue-rotate(-8deg)" />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(5,8,20,.85), rgba(5,8,20,.3) 55%, transparent)" }} />
      <div style={{ position: "absolute", left: 140, top: 0, bottom: 0, width: 900, display: "grid", alignContent: "center", gap: 26 }}>
        <div style={{ fontSize: 30, letterSpacing: "0.3em", textTransform: "uppercase", color: C.orangeLight, opacity: lin(t, 0.4, 0.9) }}>Abidjan · 20 h</div>
        <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.03em" }}>
          <Words t={t} at={0.8} text="Publier tous les jours… sans voir arriver les clients." step={0.16} highlight={["clients"]} />
        </div>
        <div style={{ fontSize: 36, color: C.muted, opacity: lin(t, 4.4, 4.9) }}>Le quotidien de milliers d'entrepreneurs en Afrique.</div>
      </div>
    </Scene>
  );
}

function Reveal({ t }: { t: number }) {
  const p = pulseAt(t);
  return (
    <Scene t={t} from={DROP} to={12}>
      <div style={{ position: "absolute", inset: "-40%", background: `repeating-conic-gradient(from ${t * 25}deg, rgba(234,120,34,.18) 0deg 6deg, transparent 6deg 18deg)`, maskImage: "radial-gradient(circle, #000 8%, transparent 50%)", WebkitMaskImage: "radial-gradient(circle, #000 8%, transparent 50%)" }} />
      <AbsoluteFill style={{ display: "grid", placeItems: "center", textAlign: "center" }}>
        <div style={{ display: "grid", justifyItems: "center", gap: 18, transform: `scale(${1 + p * 0.04})` }}>
          <Logo size={190} t={t} at={DROP} />
          <div style={{ fontSize: 150, fontWeight: 900, letterSpacing: "-0.045em", lineHeight: 1, display: "flex" }}>
            {"Forlife Com".split("").map((ch, i) => {
              const q = pop(t, DROP + 0.25 + i * 0.03, 10, 230);
              return (
                <span key={i} style={{ display: "inline-block", whiteSpace: "pre", opacity: Math.min(1, q * 1.5), transform: `translateY(${(1 - q) * 80}px)` }}>
                  {ch}
                </span>
              );
            })}
          </div>
          <div style={{ fontSize: 38, letterSpacing: "0.2em", textTransform: "uppercase", color: C.orangeLight, opacity: lin(t, DROP + 0.9, DROP + 1.3) }}>AI Growth &amp; Creative OS</div>
          <div style={{ fontSize: 40, fontWeight: 600, opacity: lin(t, DROP + 1.6, DROP + 2.1) }}>Votre équipe marketing complète, propulsée par l'IA.</div>
        </div>
      </AbsoluteFill>
    </Scene>
  );
}

/* ───────── Chapitre : texte à gauche, vraie séquence de l'appli à droite dans un écran 3D ───────── */
type Ch = (typeof CHAPTERS)[number];
function Chapter({ t, i, c }: { t: number; i: number; c: Ch }) {
  const [a, b] = c.at;
  if (t < a - 0.05 || t >= b) return null;
  const k = lin(t, a, b);
  const enter = pop(t, a, 13, 160);
  const flip = i % 2 === 1; // alterne l'écran à gauche/à droite pour le rythme
  const rotY = (flip ? 14 : -14) * (1 - easeOut(k) * 0.55);
  const p = pulseAt(t);
  const screen = (
    <div style={{ perspective: 2200, width: 1180 }}>
      <div style={{ transform: `rotateY(${rotY}deg) rotateX(${4 - k * 2}deg) translateY(${(1 - enter) * 160}px) scale(${0.9 + enter * 0.1})`, transformStyle: "preserve-3d", opacity: Math.min(1, enter * 1.5) }}>
        <div style={{ borderRadius: 22, overflow: "hidden", background: "#111", boxShadow: `0 50px 120px rgba(0,0,0,.6), 0 0 ${60 + p * 40}px rgba(234,120,34,.25)`, border: "1px solid rgba(255,255,255,.12)" }}>
          <div style={{ height: 40, background: "#1b1714", display: "flex", alignItems: "center", gap: 8, padding: "0 16px" }}>
            {["#ff5f57", "#febc2e", "#28c840"].map((col) => (
              <span key={col} style={{ width: 12, height: 12, borderRadius: "50%", background: col }} />
            ))}
            <span style={{ marginLeft: 14, flex: 1, height: 24, borderRadius: 8, background: "rgba(255,255,255,.07)", color: C.muted, fontSize: 15, display: "flex", alignItems: "center", padding: "0 12px" }}>🔒 ai-growth-et-creative-os.web.app</span>
          </div>
          <div style={{ width: 1180, height: 737, overflow: "hidden", background: "#f9f6f2" }}>
            <Sequence from={Math.round(a * PRES_FPS)} layout="none">
              <OffthreadVideo src={staticFile("pres/app.mp4")} startFrom={Math.round(c.clip * PRES_FPS)} muted style={{ width: 1180, height: 737, transform: `scale(${1 + k * 0.06})`, transformOrigin: "60% 40%" }} />
            </Sequence>
          </div>
        </div>
      </div>
    </div>
  );
  const text = (
    <div style={{ width: 560, display: "grid", gap: 22 }}>
      {c.n && (
        <div style={{ fontSize: 120, fontWeight: 900, lineHeight: 0.9, letterSpacing: "-0.05em", opacity: 0.9 * Math.min(1, pop(t, a, 12) * 1.4) }}>
          <GradText>{c.n}</GradText>
        </div>
      )}
      <div style={{ fontSize: 62, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.05 }}>
        <Words t={t} at={a + 0.15} text={c.title} step={0.1} />
      </div>
      <div style={{ width: `${easeOut(lin(t, a + 0.4, a + 1)) * 90}px`, height: 6, borderRadius: 4, background: GRAD }} />
      <div style={{ fontSize: 32, lineHeight: 1.4, color: "#e9e1d9", opacity: lin(t, a + 0.6, a + 1) }}>{c.text}</div>
      {"nets" in c && c.nets && (
        <div style={{ display: "flex", gap: 12 }}>
          {NETWORKS.map((n, j) => (
            <div key={n} style={{ transform: `scale(${pop(t, a + 1.2 + j * 0.12, 9)})` }}>
              <NetIcon name={n} size={56} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
  return (
    <Scene t={t} from={a} to={b}>
      <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 70, flexDirection: flip ? "row-reverse" : "row", padding: "0 70px" }}>
        {text}
        {screen}
      </AbsoluteFill>
    </Scene>
  );
}

/** Fil des 12 chapitres en bas de l'écran. */
function Progress({ t }: { t: number }) {
  const first = CHAPTERS[1].at[0];
  const last = CHAPTERS[CHAPTERS.length - 1].at[1];
  if (t < first - 0.3 || t > last + 0.3) return null;
  const o = lin(t, first - 0.3, first) * (1 - lin(t, last, last + 0.3));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 40, display: "flex", justifyContent: "center", gap: 10, opacity: o }}>
      {CHAPTERS.slice(1).map((c) => {
        const active = t >= c.at[0] && t < c.at[1];
        const done = t >= c.at[1];
        return <div key={c.key} style={{ width: active ? 56 : 22, height: 8, borderRadius: 8, background: active ? GRAD : done ? "rgba(234,120,34,.6)" : "rgba(255,255,255,.18)", transition: "none" }} />;
      })}
    </div>
  );
}

/* ───────── Pensé pour l'Afrique ───────── */
function Success({ t }: { t: number }) {
  const [a, b] = SUCCESS;
  const chips = ["💳 FCFA & mobile money", "💬 WhatsApp intégré", "📱 Pensé pour le mobile", "🌍 Fait pour l'Afrique"];
  return (
    <Scene t={t} from={a} to={b}>
      <Photo src="story/awa-boutique.jpg" t={t} from={a} to={b} zoom={[1.12, 1.02]} pos="50% 45%" filter="saturate(1.1) contrast(1.03)" />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(26,13,3,.85), rgba(26,13,3,.35) 50%, transparent)" }} />
      <div style={{ position: "absolute", left: 130, top: 0, bottom: 0, width: 820, display: "grid", alignContent: "center", gap: 26 }}>
        <div style={{ fontSize: 70, fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.03em" }}>
          <Words t={t} at={a + 0.3} text="Pensé pour l'Afrique." step={0.14} highlight={["l'Afrique."]} />
        </div>
        <div style={{ display: "grid", gap: 14 }}>
          {chips.map((c, i) => {
            const q = pop(t, a + 1.1 + i * 0.35, 11, 220);
            return (
              <div key={c} style={{ justifySelf: "start", fontSize: 36, fontWeight: 700, padding: "12px 26px", borderRadius: 999, background: "rgba(20,16,13,.75)", border: "1px solid rgba(255,255,255,.15)", transform: `translateX(${(1 - q) * -200}px)`, opacity: Math.min(1, q * 1.4) }}>
                {c}
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: 40, fontWeight: 700, color: C.orangeLight, opacity: lin(t, a + 5.2, a + 5.6) }}>Awa l'a adopté… et sa boutique ne désemplit plus.</div>
      </div>
    </Scene>
  );
}

/* ───────── Appel à l'action et contacts ───────── */
function Cta({ t }: { t: number }) {
  const [a, b] = CTA;
  const p = pulseAt(t);
  const phones = ["+225 07 79 59 05 62", "+225 05 85 80 18 56"];
  return (
    <Scene t={t} from={a} to={b} exit={false}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 38%, rgba(234,120,34,.32), transparent 60%), ${C.bg}` }} />
      <AbsoluteFill style={{ display: "grid", placeItems: "center", textAlign: "center" }}>
        <div style={{ display: "grid", justifyItems: "center", gap: 26, transform: `scale(${1 + p * 0.012})` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <Logo size={96} t={t} at={a} />
            <div style={{ fontSize: 80, fontWeight: 900, letterSpacing: "-0.04em", opacity: lin(t, a + 0.2, a + 0.5) }}>Forlife Com</div>
          </div>
          <div style={{ fontSize: 96, fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1 }}>
            <Words t={t} at={a + 0.5} text="Créez votre espace" step={0.12} />{" "}
            <span style={{ display: "inline-block", transform: `scale(${pop(t, a + 1.1, 8, 220)}) rotate(-3deg)`, background: GRAD, color: C.ink, padding: "0 26px", borderRadius: 20 }}>gratuitement</span>
          </div>
          <div style={{ fontSize: 40, fontWeight: 600, padding: "14px 32px", borderRadius: 999, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.18)", opacity: lin(t, a + 1.8, a + 2.1) }}>🔗 ai-growth-et-creative-os.web.app</div>
          <div style={{ marginTop: 18, display: "grid", gap: 16, justifyItems: "center" }}>
            <div style={{ fontSize: 30, letterSpacing: "0.18em", textTransform: "uppercase", color: C.orangeLight, opacity: lin(t, a + 3, a + 3.3) }}>WhatsApp &amp; appels</div>
            <div style={{ display: "flex", gap: 30 }}>
              {phones.map((ph, i) => {
                const q = pop(t, a + 3.3 + i * 0.35, 10, 200);
                return (
                  <div key={ph} style={{ display: "flex", alignItems: "center", gap: 18, padding: "18px 32px", borderRadius: 24, background: "linear-gradient(135deg, rgba(37,211,102,.22), rgba(37,211,102,.08))", border: "1px solid rgba(37,211,102,.55)", transform: `scale(${q})`, boxShadow: `0 0 ${20 + p * 30}px rgba(37,211,102,.25)` }}>
                    <NetIcon name="WHATSAPP" size={60} />
                    <span style={{ fontSize: 50, fontWeight: 800, letterSpacing: "0.01em", fontVariantNumeric: "tabular-nums" }}>{ph}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </Scene>
  );
}

