import { useEffect, useState, type CSSProperties } from "react";
import { AbsoluteFill, Audio, continueRender, delayRender, random, staticFile, useCurrentFrame } from "remotion";
import { C, FONT, Flash, GRAD, Glass, GradText, Logo, NETWORKS, NetIcon, Phone, Scene, TimeCtx, Words, easeOut, lin, pop, pulse, shake, useLayout } from "./kit";
import { BEAT, FPS, SCENES, VO, beat } from "./timing";

/* ───────── Polices locales (rendu hors ligne) ───────── */
function useFonts() {
  const [handle] = useState(() => delayRender("Polices"));
  useEffect(() => {
    const weights = [400, 600, 700, 800, 900];
    Promise.all(
      weights.flatMap((w) =>
        ["latin", "latin-ext"].map((sub) => {
          const face = new FontFace("Poppins", `url(${staticFile(`fonts/poppins-${sub}-${w}-normal.woff2`)})`, { weight: String(w) });
          return face.load().then((f) => (document.fonts as unknown as { add: (x: FontFace) => void }).add(f));
        }),
      ),
    ).finally(() => continueRender(handle));
  }, [handle]);
}

export function Ad() {
  useFonts();
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <TimeCtx.Provider value={t}>
      <AbsoluteFill style={{ background: C.bg, fontFamily: FONT, color: C.cream, overflow: "hidden" }}>
        <Background t={t} />
        <Hook t={t} />
        <Pain t={t} />
        <Reveal t={t} />
        <Create t={t} />
        <Publish t={t} />
        <Sell t={t} />
        <Agents t={t} />
        <Proof t={t} />
        <Cta t={t} />
        <Flash t={t} at={SCENES.reveal[0]} dur={0.35} />
        <Flash t={t} at={SCENES.cta[0]} dur={0.3} color={C.orangeLight} />
        <Flash t={t} at={VO.finalHit} dur={0.35} />
        <Vignette />
        <Audio src={staticFile("soundtrack.mp3")} />
      </AbsoluteFill>
    </TimeCtx.Provider>
  );
}

/* ───────── Décor : aurore vivante, grille, particules, battement ───────── */
function Background({ t }: { t: number }) {
  const drop = t >= beat(12);
  const p = pulse(t);
  const pain = t >= SCENES.pain[0] && t < SCENES.pain[1];
  const k = drop ? 1 : 0.55;
  const parts = Array.from({ length: 34 }, (_, i) => {
    const x = random(`x${i}`) * 100;
    const speed = 2 + random(`s${i}`) * 5;
    const y = (100 - ((t * speed + random(`y${i}`) * 100) % 110)) as number;
    const s = 3 + random(`r${i}`) * 6;
    return <div key={i} style={{ position: "absolute", left: `${x}%`, top: `${y}%`, width: s, height: s, borderRadius: "50%", background: i % 3 ? C.orange : C.gold, opacity: (drop ? 0.5 : 0.2) * (0.4 + random(`o${i}`) * 0.6), filter: "blur(1px)" }} />;
  });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: "-25%", filter: "blur(80px)", opacity: k * (0.8 + p * 0.25) }}>
        <div style={{ position: "absolute", width: "60%", height: "50%", left: `${10 + Math.sin(t * 0.7) * 12}%`, top: `${5 + Math.cos(t * 0.5) * 8}%`, borderRadius: "50%", background: pain ? "radial-gradient(circle, rgba(255,70,50,.55), transparent 65%)" : "radial-gradient(circle, rgba(234,120,34,.65), transparent 65%)" }} />
        <div style={{ position: "absolute", width: "55%", height: "50%", right: `${5 + Math.cos(t * 0.6) * 10}%`, top: `${40 + Math.sin(t * 0.4) * 10}%`, borderRadius: "50%", background: "radial-gradient(circle, rgba(217,172,78,.45), transparent 65%)" }} />
        <div style={{ position: "absolute", width: "50%", height: "45%", left: `${25 + Math.sin(t * 0.9) * 10}%`, bottom: `${0 + Math.cos(t * 0.8) * 6}%`, borderRadius: "50%", background: "radial-gradient(circle, rgba(168,79,11,.6), transparent 65%)" }} />
      </div>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px)", backgroundSize: "60px 60px", backgroundPosition: `0 ${t * 30}px`, maskImage: "radial-gradient(ellipse at 50% 45%, #000 25%, transparent 75%)", WebkitMaskImage: "radial-gradient(ellipse at 50% 45%, #000 25%, transparent 75%)" }} />
      {parts}
      {drop && <div style={{ position: "absolute", inset: 0, boxShadow: `inset 0 0 ${180 + p * 120}px rgba(234,120,34,${0.18 * p})` }} />}
    </AbsoluteFill>
  );
}

function Vignette() {
  return <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,.55) 100%)", pointerEvents: "none" }} />;
}

/* ───────── 1. Accroche : le problème ───────── */
function Hook({ t }: { t: number }) {
  const { v } = useLayout();
  const [a, b] = SCENES.hook;
  const sad = pop(t, 2.2, 9);
  return (
    <Scene t={t} from={a} to={b}>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: v ? "column" : "row", alignItems: "center", justifyContent: "center", gap: v ? 70 : 120, padding: v ? "0 70px" : "0 140px" }}>
        <div style={{ fontSize: v ? 92 : 96, fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.03em", maxWidth: v ? 940 : 900, textAlign: v ? "center" : "left" }}>
          <Words t={t} at={VO.hook1} text="Tu postes tous les jours…" step={0.28} />
          <div style={{ height: 24 }} />
          <div style={{ transform: `translateX(${shake(t, VO.hook2 + 0.35, 14)}px)` }}>
            <Words t={t} at={VO.hook2} text="mais les clients ne suivent pas ?" step={0.1} style={{ fontSize: v ? 76 : 80 }} highlight={["ne", "suivent", "pas"]} />
          </div>
        </div>
        <div style={{ position: "relative", transform: `translateY(${(1 - pop(t, 0.05, 14)) * 400}px) rotate(${-4 + Math.sin(t * 2) * 1.5}deg)` }}>
          <Phone w={v ? 360 : 330}>
            <div style={{ padding: 22, color: "#1a1a1a", fontSize: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: GRAD }} />
                <div>
                  <b>Ma boutique</b>
                  <div style={{ fontSize: 16, color: "#888" }}>il y a 3 h</div>
                </div>
              </div>
              <div style={{ height: 300, borderRadius: 18, background: "linear-gradient(135deg,#d8cfc6,#bfb3a7)", display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, fontSize: 34 }}>NOUVEAUTÉ</div>
              <div style={{ display: "flex", gap: 22, marginTop: 18, fontSize: 24, fontWeight: 600 }}>
                <span>♡ 0</span>
                <span>💬 0</span>
                <span>↗ 0</span>
              </div>
              <div style={{ marginTop: 10, color: "#888", fontSize: 18 }}>Vu par 3 personnes</div>
              <div style={{ marginTop: 26, display: "grid", gap: 10 }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ height: 16, width: `${90 - i * 20}%`, borderRadius: 8, background: "#e6ddd3" }} />
                ))}
              </div>
            </div>
          </Phone>
          <div style={{ position: "absolute", right: -40, top: 120, transform: `scale(${sad}) rotate(8deg)`, background: C.red, color: "#fff", fontWeight: 800, fontSize: 34, padding: "12px 22px", borderRadius: 18, boxShadow: "0 20px 50px rgba(255,90,79,.5)" }}>0 vente</div>
        </div>
      </div>
    </Scene>
  );
}

/* ───────── 2. Les douleurs ───────── */
function Pain({ t }: { t: number }) {
  const { v } = useLayout();
  const [a, b] = SCENES.pain;
  const lines = [
    { at: VO.pain1, icon: "💡", text: "PAS D'IDÉES" },
    { at: VO.pain2, icon: "⏱️", text: "PAS LE TEMPS" },
    { at: VO.pain3, icon: "📉", text: "PAS DE RÉSULTATS" },
  ];
  const sx = lines.reduce((s, l) => s + shake(t, l.at, 26), 0);
  const zoom = lin(t, 5.75, b, 1, 1.5);
  return (
    <Scene t={t} from={a} to={b}>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", transform: `translateX(${sx}px) scale(${zoom})` }}>
        <div style={{ display: "grid", gap: v ? 44 : 30, justifyItems: "center" }}>
          {lines.map((l) => {
            const p = pop(t, l.at, 13, 220, 0.8);
            const strike = easeOut(lin(t, l.at + 0.22, l.at + 0.5));
            return (
              <div key={l.text} style={{ display: "flex", alignItems: "center", gap: 26, opacity: Math.min(1, p * 1.5), transform: `scale(${2.4 - 1.4 * p})`, filter: `blur(${(1 - Math.min(1, p)) * 10}px)` }}>
                <span style={{ fontSize: v ? 76 : 84 }}>{l.icon}</span>
                <span style={{ position: "relative", fontSize: v ? 86 : 112, fontWeight: 900, letterSpacing: "-0.03em", whiteSpace: "nowrap" }}>
                  {l.text}
                  <span style={{ position: "absolute", left: 0, top: "52%", height: 12, width: `${strike * 100}%`, background: C.red, borderRadius: 6, boxShadow: "0 0 30px rgba(255,90,79,.8)" }} />
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Scene>
  );
}

/* ───────── 3. Révélation : Forlife Com ───────── */
function Reveal({ t }: { t: number }) {
  const { v } = useLayout();
  const [a, b] = SCENES.reveal;
  const p = pulse(t);
  const name = "Forlife Com";
  return (
    <Scene t={t} from={a} to={b}>
      <div style={{ position: "absolute", inset: "-30%", background: `repeating-conic-gradient(from ${t * 25}deg, rgba(234,120,34,.18) 0deg 8deg, transparent 8deg 22deg)`, maskImage: "radial-gradient(circle, #000 10%, transparent 55%)", WebkitMaskImage: "radial-gradient(circle, #000 10%, transparent 55%)" }} />
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
        <div style={{ display: "grid", justifyItems: "center", gap: 18 }}>
          <div style={{ fontSize: 48, fontWeight: 600, color: C.muted, opacity: lin(t, VO.reveal1, VO.reveal1 + 0.2) }}>Voici</div>
          <div style={{ transform: `scale(${1 + p * 0.06})` }}>
            <Logo size={v ? 230 : 190} t={t} at={a + 0.05} />
          </div>
          <div style={{ fontSize: v ? 130 : 140, fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1, display: "flex" }}>
            {name.split("").map((ch, i) => {
              const q = pop(t, VO.reveal1 + 0.3 + i * 0.035, 10, 220);
              return (
                <span key={i} style={{ display: "inline-block", whiteSpace: "pre", opacity: Math.min(1, q * 1.5), transform: `translateY(${(1 - q) * 80}px) rotate(${(1 - q) * 20}deg)` }}>
                  {ch}
                </span>
              );
            })}
          </div>
          <div style={{ fontSize: v ? 70 : 72, fontWeight: 800, letterSpacing: "-0.02em", maxWidth: v ? 960 : 1500, lineHeight: 1.12, marginTop: 10 }}>
            <Words t={t} at={VO.reveal2} text="L'IA qui connaît ton business" step={0.17} highlight={["ton", "business"]} />
          </div>
        </div>
      </div>
    </Scene>
  );
}

/* ───────── 4. Création : posts, visuels, vidéos ───────── */
const POST = "Nouvelle collection wax 🔥 Livraison gratuite à Abidjan ce week-end. Écris-nous sur WhatsApp !";
function Create({ t }: { t: number }) {
  const { v } = useLayout();
  const [a, b] = SCENES.create;
  const typed = Math.floor(lin(t, VO.create1 + 0.25, VO.create1 + 1.3) * POST.length);
  const c1 = pop(t, VO.create1, 12);
  const c2 = pop(t, VO.create2 + 0.15, 11);
  const c3 = pop(t, VO.create2 + 0.75, 11);
  const prog = lin(t, VO.create2 + 0.9, b, 0, 1);
  const label = (text: string, p: number) => (
    <div style={{ position: "absolute", top: -34, left: 24, background: GRAD, color: C.ink, fontWeight: 800, fontSize: 30, padding: "8px 20px", borderRadius: 999, transform: `scale(${p})`, boxShadow: "0 10px 30px rgba(234,120,34,.5)" }}>{text}</div>
  );
  const postCard = (
    <Glass style={{ position: "relative", width: v ? 900 : 620, padding: 34, transform: `translateY(${(1 - c1) * 300}px) rotate(${(1 - c1) * -8}deg)`, opacity: Math.min(1, c1 * 1.3) }}>
      {label("Tes posts", c1)}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: GRAD, display: "grid", placeItems: "center", color: C.ink, fontWeight: 800 }}>FC</div>
        <b style={{ fontSize: 28 }}>Ta marque</b>
        <span style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {NETWORKS.slice(0, 4).map((n, i) => (
            <div key={n} style={{ transform: `scale(${pop(t, VO.create1 + 0.4 + i * 0.08)})` }}>
              <NetIcon name={n} size={44} />
            </div>
          ))}
        </span>
      </div>
      <div style={{ fontSize: v ? 34 : 30, lineHeight: 1.45, minHeight: v ? 150 : 175 }}>
        {POST.slice(0, typed)}
        {typed < POST.length && <span style={{ display: "inline-block", width: 4, height: 34, background: C.orange, marginLeft: 3, verticalAlign: -5 }} />}
      </div>
      <div style={{ marginTop: 12, display: "inline-block", fontSize: 22, color: "#8be0ad", background: "rgba(29,122,70,.25)", padding: "6px 14px", borderRadius: 999, opacity: lin(t, VO.create1 + 1.3, VO.create1 + 1.5) }}>✓ Conforme au Brand DNA</div>
    </Glass>
  );
  const visual = (
    <div style={{ position: "relative", transform: `translateX(${(1 - c2) * -400}px) rotate(${(1 - c2) * -12 - 3}deg)`, opacity: Math.min(1, c2 * 1.3) }}>
      {label("Tes visuels", c2)}
      <div style={{ width: v ? 420 : 440, height: v ? 420 : 440, borderRadius: 32, overflow: "hidden", position: "relative", background: "linear-gradient(145deg,#ffb26b,#ea7822 50%,#7a2f05)", boxShadow: "0 30px 80px rgba(0,0,0,.5)" }}>
        <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", right: -60, bottom: -60, background: "repeating-linear-gradient(45deg,#1a0d03 0 18px,#d9ac4e 18px 36px,#0b6e4f 36px 54px)", opacity: 0.9 }} />
        <div style={{ position: "absolute", left: 30, top: 30, fontSize: 30, fontWeight: 700, color: C.ink }}>WAX PREMIUM</div>
        <div style={{ position: "absolute", left: 26, top: 74, fontSize: 130, fontWeight: 900, color: "#fff", lineHeight: 1, textShadow: "0 8px 30px rgba(0,0,0,.25)", transform: `scale(${0.6 + 0.4 * pop(t, VO.create2 + 0.4, 8)})`, transformOrigin: "left top" }}>-20%</div>
        <div style={{ position: "absolute", left: 30, bottom: 26, fontSize: 24, background: "rgba(0,0,0,.6)", color: "#fff", padding: "8px 16px", borderRadius: 999 }}>★ Critic 4,8/5</div>
      </div>
    </div>
  );
  const video = (
    <div style={{ position: "relative", transform: `translateX(${(1 - c3) * 400}px) rotate(${(1 - c3) * 12 + 3}deg)`, opacity: Math.min(1, c3 * 1.3) }}>
      {label("Tes vidéos", c3)}
      <div style={{ width: v ? 300 : 280, height: v ? 520 : 480, borderRadius: 32, overflow: "hidden", position: "relative", background: "linear-gradient(180deg,#3a2a1d,#120c08)", boxShadow: "0 30px 80px rgba(0,0,0,.5)" }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at ${50 + Math.sin(t * 3) * 20}% 40%, rgba(234,120,34,.55), transparent 60%)` }} />
        <div style={{ position: "absolute", left: "50%", top: "42%", transform: `translate(-50%,-50%) scale(${1 + pulse(t) * 0.12})`, width: 110, height: 110, borderRadius: "50%", background: "rgba(255,255,255,.92)", display: "grid", placeItems: "center" }}>
          <div style={{ width: 0, height: 0, borderLeft: "38px solid #ea7822", borderTop: "24px solid transparent", borderBottom: "24px solid transparent", marginLeft: 10 }} />
        </div>
        <div style={{ position: "absolute", left: 20, right: 20, bottom: 70, textAlign: "center", fontWeight: 800, fontSize: 30, color: "#fff" }}>-20% ce week-end</div>
        <div style={{ position: "absolute", left: 20, right: 20, bottom: 34, height: 8, borderRadius: 4, background: "rgba(255,255,255,.25)" }}>
          <div style={{ width: `${prog * 100}%`, height: "100%", borderRadius: 4, background: GRAD }} />
        </div>
        <div style={{ position: "absolute", top: 18, right: 18, fontSize: 22, fontWeight: 700, background: "rgba(0,0,0,.55)", padding: "4px 12px", borderRadius: 999 }}>15 s</div>
      </div>
    </div>
  );
  return (
    <Scene t={t} from={a} to={b}>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: v ? 90 : 70 }}>
        {v ? (
          <>
            {postCard}
            <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
              {visual}
              {video}
            </div>
          </>
        ) : (
          <div style={{ display: "flex", gap: 60, alignItems: "center" }}>
            {postCard}
            {visual}
            {video}
          </div>
        )}
      </div>
    </Scene>
  );
}

/* ───────── 5. Publication partout ───────── */
function Publish({ t }: { t: number }) {
  const { v } = useLayout();
  const [a, b] = SCENES.publish;
  const R = v ? 340 : 330;
  return (
    <Scene t={t} from={a} to={b}>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
        <div style={{ position: "relative", width: 10, height: 10 }}>
          {NETWORKS.map((n, i) => {
            const at = beat(25) + i * 0.13;
            const p = pop(t, at, 9, 180);
            const ang = (i / NETWORKS.length) * Math.PI * 2 - Math.PI / 2;
            const x = Math.cos(ang) * R * p;
            const y = Math.sin(ang) * R * p;
            return (
              <div key={n}>
                <div style={{ position: "absolute", left: 0, top: 0, width: R * p, height: 4, background: "linear-gradient(90deg, rgba(234,120,34,.9), rgba(234,120,34,0))", transformOrigin: "0 50%", transform: `rotate(${(ang * 180) / Math.PI}deg)`, opacity: 0.7 }} />
                <div style={{ position: "absolute", left: x - 60, top: y - 60, transform: `scale(${p}) rotate(${(1 - p) * 90}deg)` }}>
                  <NetIcon name={n} size={120} />
                  <div style={{ position: "absolute", right: -10, top: -10, width: 44, height: 44, borderRadius: "50%", background: C.green, color: "#fff", display: "grid", placeItems: "center", fontWeight: 900, fontSize: 26, transform: `scale(${pop(t, at + 0.25, 8)})` }}>✓</div>
                </div>
              </div>
            );
          })}
          <div style={{ position: "absolute", left: -110, top: -110, width: 220, height: 220, borderRadius: "50%", background: GRAD, display: "grid", placeItems: "center", boxShadow: `0 0 ${60 + pulse(t) * 80}px rgba(234,120,34,.8)`, transform: `scale(${pop(t, a, 10) * (1 + pulse(t) * 0.08)})` }}>
            <Logo size={110} />
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, [v ? "top" : "bottom"]: v ? 230 : 70, textAlign: "center", fontSize: v ? 84 : 76, fontWeight: 900, letterSpacing: "-0.03em" } as CSSProperties}>
        <Words t={t} at={VO.publish} text="Publié partout." step={0.14} highlight={["partout"]} />
      </div>
    </Scene>
  );
}

/* ───────── 6. Ventes sur WhatsApp ───────── */
function Sell({ t }: { t: number }) {
  const { v } = useLayout();
  const [a, b] = SCENES.sell;
  const b1 = pop(t, VO.sell + 0.15, 12);
  const b2 = pop(t, VO.sell + 0.6, 12);
  const lead = pop(t, VO.sell + 0.95, 11);
  const sale = pop(t, beat(29.5), 9, 200);
  const amount = Math.round(easeOut(lin(t, beat(29.5), beat(29.5) + 0.6)) * 45000);
  const total = pop(t, beat(31), 9, 200);
  const totalAmount = Math.round(easeOut(lin(t, beat(31), beat(31) + 0.7)) * 1250000);
  const fmt = (n: number) => n.toLocaleString("fr-FR").replace(/ | /g, " ");
  const chat = (
    <Glass style={{ width: v ? 820 : 720, overflow: "hidden", padding: 0 }}>
      <div style={{ background: "#075E54", padding: "22px 28px", display: "flex", alignItems: "center", gap: 16 }}>
        <NetIcon name="WHATSAPP" size={56} />
        <div>
          <b style={{ fontSize: 30, color: "#fff" }}>Aïcha K.</b>
          <div style={{ fontSize: 20, color: "#cfe9e3" }}>en ligne</div>
        </div>
      </div>
      <div style={{ padding: 28, display: "grid", gap: 18, background: "rgba(236,229,221,.06)" }}>
        <div style={{ justifySelf: "start", maxWidth: "80%", background: "#2a2622", padding: "16px 22px", borderRadius: "22px 22px 22px 6px", fontSize: 30, transform: `scale(${b1})`, transformOrigin: "left bottom" }}>Bonjour 👋 la robe wax est dispo ?</div>
        <div style={{ justifySelf: "end", maxWidth: "80%", background: "#005c4b", padding: "16px 22px", borderRadius: "22px 22px 6px 22px", fontSize: 30, transform: `scale(${b2})`, transformOrigin: "right bottom" }}>Oui ! Taille M ? Livraison demain 🚚</div>
      </div>
    </Glass>
  );
  return (
    <Scene t={t} from={a} to={b}>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: v ? 50 : 36 }}>
        <div style={{ fontSize: v ? 72 : 70, fontWeight: 900, letterSpacing: "-0.03em", textAlign: "center", lineHeight: 1.1, maxWidth: v ? 960 : 1600 }}>
          <Words t={t} at={VO.sell} text="Tes abonnés deviennent des clients" step={0.12} highlight={["clients"]} />
        </div>
        <div style={{ display: "flex", flexDirection: v ? "column" : "row", alignItems: "center", gap: v ? 40 : 60 }}>
          {chat}
          <div style={{ display: "grid", gap: 26, justifyItems: "center" }}>
            <Glass style={{ padding: "20px 30px", display: "flex", alignItems: "center", gap: 18, transform: `translateX(${(1 - lead) * 500}px)`, opacity: Math.min(1, lead * 1.4) }}>
              <span style={{ fontSize: 44 }}>🔥</span>
              <div>
                <b style={{ fontSize: 32 }}>Lead chaud · Aïcha K.</b>
                <div style={{ fontSize: 22, color: C.muted }}>CRM · score 82/100 · à relancer aujourd'hui</div>
              </div>
            </Glass>
            <div style={{ transform: `scale(${sale}) rotate(${(1 - sale) * -10}deg)`, background: "linear-gradient(135deg,#2fd27a,#128a4a)", color: "#fff", padding: "22px 40px", borderRadius: 26, boxShadow: "0 24px 60px rgba(29,180,100,.45)", textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 600 }}>✓ Vente gagnée</div>
              <div style={{ fontSize: 64, fontWeight: 900, letterSpacing: "-0.02em" }}>+{fmt(amount)} FCFA</div>
            </div>
            <div style={{ transform: `scale(${total})`, textAlign: "center" }}>
              <div style={{ fontSize: v ? 76 : 70, fontWeight: 900, letterSpacing: "-0.03em" }}>
                <GradText>{fmt(totalAmount)} FCFA</GradText>
              </div>
              <div style={{ fontSize: 22, color: C.muted }}>ce mois-ci · exemple</div>
            </div>
          </div>
        </div>
      </div>
    </Scene>
  );
}

/* ───────── 7. Les 12 agents ───────── */
const AGENTS = [
  ["✨", "Copilot"],
  ["🎯", "Strategist"],
  ["🧬", "Brand Guardian"],
  ["✍️", "Content Writer"],
  ["🎨", "Creative Director"],
  ["⭐", "Critic"],
  ["🎬", "Video Producer"],
  ["📲", "Social Manager"],
  ["📣", "Campaign Planner"],
  ["💬", "Sales Coach"],
  ["📊", "Analyst"],
  ["⚡", "Optimizer"],
] as const;
function Agents({ t }: { t: number }) {
  const { v } = useLayout();
  const [a, b] = SCENES.agents;
  const n = Math.round(easeOut(lin(t, VO.agents1, VO.agents1 + 0.8)) * 12);
  const cols = v ? 3 : 6;
  const clock = pop(t, VO.agents2, 9);
  return (
    <Scene t={t} from={a} to={b}>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: v ? 56 : 40 }}>
        <div style={{ textAlign: "center", lineHeight: 1 }}>
          <div style={{ fontSize: v ? 220 : 190, fontWeight: 900, letterSpacing: "-0.05em", transform: `scale(${1 + pulse(t) * 0.05})` }}>
            <GradText>{n}</GradText>
          </div>
          <div style={{ fontSize: v ? 64 : 60, fontWeight: 800, marginTop: -6 }}>
            <Words t={t} at={VO.agents1 + 0.3} text="agents IA bossent pour toi" step={0.12} highlight={["toi"]} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, ${v ? 300 : 270}px)`, gap: 18 }}>
          {AGENTS.map(([icon, name], i) => {
            const p = pop(t, VO.agents1 + 0.15 + i * 0.075, 10, 200);
            const lit = i === Math.floor(((t - a) / BEAT) % 12);
            return (
              <div key={name} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderRadius: 20, background: lit ? "rgba(234,120,34,.28)" : "rgba(28,23,19,.8)", border: `1px solid ${lit ? "rgba(234,120,34,.8)" : "rgba(255,255,255,.12)"}`, transform: `scale(${p})`, opacity: Math.min(1, p * 1.3) }}>
                <span style={{ fontSize: 40 }}>{icon}</span>
                <b style={{ fontSize: 25, lineHeight: 1.15 }}>{name}</b>
              </div>
            );
          })}
        </div>
        <div style={{ transform: `scale(${clock}) rotate(${(1 - clock) * -12}deg)`, background: GRAD, color: C.ink, fontWeight: 900, fontSize: v ? 52 : 46, padding: "14px 36px", borderRadius: 999, boxShadow: "0 20px 60px rgba(234,120,34,.5)" }}>⏰ À toute heure · 24h/24</div>
      </div>
    </Scene>
  );
}

/* ───────── 8. Fait pour l'Afrique (break) ───────── */
function Proof({ t }: { t: number }) {
  const { v } = useLayout();
  const [a, b] = SCENES.proof;
  const chips = ["💳 FCFA & mobile money", "💬 WhatsApp intégré", "📱 Pensé pour le mobile", "🌍 Fait pour l'Afrique"];
  return (
    <Scene t={t} from={a} to={b}>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
        <div style={{ display: "grid", gap: 26, justifyItems: "center" }}>
          {chips.map((c, i) => {
            const p = pop(t, a + 0.04 + i * 0.22, 11, 260);
            return (
              <div key={c} style={{ fontSize: v ? 62 : 58, fontWeight: 800, padding: "16px 40px", borderRadius: 999, background: i === 3 ? GRAD : "rgba(28,23,19,.85)", color: i === 3 ? C.ink : C.cream, border: "1px solid rgba(255,255,255,.14)", transform: `scale(${p}) translateX(${(i % 2 ? 1 : -1) * (1 - p) * 300}px)`, opacity: Math.min(1, p * 1.5) }}>
                {c}
              </div>
            );
          })}
        </div>
      </div>
    </Scene>
  );
}

/* ───────── 9. Appel à l'action ───────── */
function Cta({ t }: { t: number }) {
  const { v } = useLayout();
  const [a, b] = SCENES.cta;
  const stamp = pop(t, VO.cta2 + 0.38, 8, 220);
  const url = "ai-growth-et-creative-os.web.app";
  const typed = Math.floor(lin(t, 24.5, 25.3) * url.length);
  const btn = pop(t, 25.1, 10);
  const press = t > 25.85 && t < 26.05 ? 0.94 : 1;
  const cursor = easeOut(lin(t, 25.3, 25.8));
  const hit = Math.max(0, 1 - Math.abs(t - VO.finalHit) * 6);
  return (
    <Scene t={t} from={a} to={b + 1} exit={false}>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center", transform: `scale(${1 + hit * 0.05 + pulse(t, a) * 0.015})` }}>
        <div style={{ display: "grid", justifyItems: "center", gap: v ? 34 : 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <Logo size={v ? 120 : 100} t={t} at={a} />
            <div style={{ fontSize: v ? 84 : 78, fontWeight: 900, letterSpacing: "-0.04em", opacity: lin(t, VO.cta1, VO.cta1 + 0.2), transform: `translateX(${(1 - easeOut(lin(t, VO.cta1, VO.cta1 + 0.3))) * 60}px)` }}>Forlife Com</div>
          </div>
          <div style={{ fontSize: v ? 112 : 110, fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1 }}>
            <Words t={t} at={VO.cta2} text="Crée ton espace" step={0.12} />
          </div>
          <div style={{ transform: `scale(${stamp === 0 ? 0 : 3 - 2 * stamp}) rotate(-4deg)`, opacity: Math.min(1, stamp * 1.5), background: GRAD, color: C.ink, fontSize: v ? 104 : 100, fontWeight: 900, padding: "6px 44px", borderRadius: 24, letterSpacing: "-0.02em", boxShadow: "0 30px 90px rgba(234,120,34,.55)" }}>GRATUITEMENT</div>
          <div style={{ marginTop: 16, fontSize: v ? 40 : 38, fontWeight: 600, padding: "16px 30px", borderRadius: 999, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.18)", minWidth: v ? 760 : 820, opacity: lin(t, 24.4, 24.6) }}>
            🔗 {url.slice(0, typed)}
            {typed < url.length && <span style={{ display: "inline-block", width: 4, height: 40, background: C.orange, verticalAlign: -7, marginLeft: 3 }} />}
          </div>
          <div style={{ position: "relative", transform: `scale(${btn * press})` }}>
            <div style={{ background: "#fff", color: C.ink, fontSize: v ? 50 : 46, fontWeight: 800, padding: "24px 56px", borderRadius: 999, boxShadow: `0 0 0 ${8 + pulse(t, a) * 18}px rgba(234,120,34,${0.25 + pulse(t, a) * 0.25}), 0 24px 70px rgba(0,0,0,.45)` }}>Commencer maintenant →</div>
            <div style={{ position: "absolute", left: `${70 - (1 - cursor) * 40}%`, top: `${60 + (1 - cursor) * 180}%`, fontSize: 70, opacity: cursor, filter: "drop-shadow(0 6px 10px rgba(0,0,0,.5))" }}>👆</div>
          </div>
        </div>
      </div>
    </Scene>
  );
}

