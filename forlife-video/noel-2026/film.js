// Moteur déterministe : tout est fonction du temps t (secondes). Aucun timer, aucune transition CSS.
const W = 1080, H = 1920, Q = window.CUE;
const $ = id => document.getElementById(id);
const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, p) => a + (b - a) * p;
const pr = (t, t0, d) => cl((t - t0) / d);
const io = p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
const out = p => 1 - Math.pow(1 - p, 3);
const inn = p => p * p * p;
const expo = p => p >= 1 ? 1 : 1 - Math.pow(2, -10 * p);
// réponse indicielle d'un ressort (f en Hz, z amortissement)
function sp(t, t0, f = 2.6, z = 0.72) {
  const x = t - t0; if (x <= 0) return 0;
  const w = 2 * Math.PI * f, wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * x) * (Math.cos(wd * x) + (z * w / wd) * Math.sin(wd * x));
}
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function put(e, x, y, s = 1, r = 0, o = 1) {
  if (o <= 0.002) { e.style.visibility = 'hidden'; return; }
  e.style.visibility = 'visible'; e.style.opacity = o;
  e.style.transform = `translate(${x.toFixed(2)}px,${y.toFixed(2)}px) rotate(${r.toFixed(3)}deg) scale(${(+s).toFixed(4)})`;
}
function words(e, html) { // "mot|mot" ; <br> conservé ; *mot* = accent
  e.innerHTML = html.split('\n').map(l => l.split(' ').map(w => {
    const b = w.startsWith('*'); if (b) w = w.slice(1);
    return `<span class="w"><i>${b ? '<b>' + w + '</b>' : w}</i></span>`;
  }).join(' ')).join('<br>');
  e._w = [...e.querySelectorAll('.w>i')];
}
function reveal(e, t, t0, tOut, st = 0.075) {
  e._w.forEach((w, i) => {
    const p = sp(t, t0 + i * st, 2.4, 0.8), q = tOut == null ? 0 : inn(pr(t, tOut + i * 0.02, 0.25));
    w.style.transform = `translateY(${((1 - p) * 125 - q * 125).toFixed(2)}%) rotate(${((1 - p) * 7).toFixed(2)}deg)`;
  });
}
const E = {}; ['hello', 'pill0', 'logo', 'offrez', 'swoosh', 'kids2', 'kids1', 'ledge', 'gifts', 'c1', 'c2', 'chip1', 'chip2', 'chacun', 'noel1', 'b1', 'b2', 'sign', 'cmd', 'phone', 'sub', 'p1', 'p2', 'loc'].forEach(k => E[k] = $(k));
words(E.hello, "C’est Noël chez");
words(E.offrez, "Offrez la magie\nde Noël à vos\nenfants !");
words(E.chacun, "À chacun son *modèle !");
words(E.cmd, "Commandez vite !");
const digits = [...document.querySelectorAll('#digits span')];
const swp = $('swp'); const SWL = 520; swp.style.strokeDasharray = SWL;
const c1i = E.c1.querySelector('img'), c2i = E.c2.querySelector('img');
const n1 = document.querySelector('#b1 .n'), n2 = document.querySelector('#b2 .n'), l2 = document.querySelector('#b2 .l2');

// ---------- fond : aplats + floods circulaires + bokeh ----------
const bg = $('bg').getContext('2d'), fg = $('fg').getContext('2d');
const FLOODS = [
  { t: -9, c: '#FBF3E4', x: 540, y: 960 },
  { t: Q.B - 0.25, c: '#0E5A31', x: 540, y: 960 },
  { t: Q.C1 - 0.25, c: '#C1121F', x: 540, y: 1700 },
  { t: Q.D - 0.25, c: '#FBF3E4', x: 540, y: 520 },
  { t: Q.E - 0.25, c: '#2B1309', x: 540, y: 1000 },
];
const FD = 0.55;
const rb = rng(7), BOK = Array.from({ length: 30 }, () => ({ x: rb() * W, y: rb() * H, r: 30 + rb() * 110, a: 0.05 + rb() * 0.11, vx: (rb() - .5) * 26, vy: -8 - rb() * 22, ph: rb() * 6.28 }));
function drawBg(t) {
  let base = FLOODS[0];
  for (const f of FLOODS) if (t >= f.t + FD) base = f;
  bg.fillStyle = base.c; bg.fillRect(0, 0, W, H);
  for (const f of FLOODS) if (t > f.t && t < f.t + FD) {
    const R = Math.max(Math.hypot(f.x, f.y), Math.hypot(W - f.x, f.y), Math.hypot(f.x, H - f.y), Math.hypot(W - f.x, H - f.y)) * 1.05;
    bg.fillStyle = f.c; bg.beginPath(); bg.arc(f.x, f.y, R * expo(pr(t, f.t, FD)), 0, 6.2832); bg.fill();
  }
  // halo chaud + bokeh doré
  const g = bg.createRadialGradient(540, 820, 80, 540, 820, 1150);
  g.addColorStop(0, 'rgba(255,225,150,.20)'); g.addColorStop(1, 'rgba(0,0,0,.16)');
  bg.fillStyle = g; bg.fillRect(0, 0, W, H);
  for (const b of BOK) {
    const x = ((b.x + b.vx * t) % (W + 300) + W + 300) % (W + 300) - 150, y = ((b.y + b.vy * t) % (H + 300) + H + 300) % (H + 300) - 150;
    const a = b.a * (0.65 + 0.35 * Math.sin(t * 1.3 + b.ph));
    const gg = bg.createRadialGradient(x, y, 0, x, y, b.r);
    gg.addColorStop(0, `rgba(255,214,120,${a})`); gg.addColorStop(.7, `rgba(255,200,90,${a * .8})`); gg.addColorStop(1, 'rgba(255,200,90,0)');
    bg.fillStyle = gg; bg.beginPath(); bg.arc(x, y, b.r, 0, 6.2832); bg.fill();
  }
}
// ---------- premier plan : guirlande lumineuse, boules suspendues, neige, étincelles ----------
const rs = rng(21), SNOW = Array.from({ length: 80 }, () => ({ x: rs() * W, y: rs() * H, r: 2.5 + rs() * 6, v: 70 + rs() * 130, amp: 10 + rs() * 40, f: .4 + rs() * 1.1, ph: rs() * 6.28, a: .45 + rs() * .5 }));
const LCOL = ['#FF3B3B', '#FFD23F', '#35C76B', '#FFFFFF', '#FF8A2A'];
const ORN = [{ x: 150, l: 420, r: 62, c: '#C8102E' }, { x: 300, l: 250, r: 44, c: '#D9A93A' }, { x: 800, l: 300, r: 52, c: '#178A3A' }, { x: 940, l: 470, r: 66, c: '#D9A93A' }, { x: 660, l: 210, r: 36, c: '#C8102E' }];
const rk = rng(99), SPK = Array.from({ length: 16 }, () => ({ a: rk() * 6.28, d: 330 + rk() * 330, s: 16 + rk() * 26, dl: rk() * 0.25 }));
function star(c, x, y, s, rot, col, a) {
  c.save(); c.translate(x, y); c.rotate(rot); c.globalAlpha = a; c.fillStyle = col; c.beginPath();
  for (let i = 0; i < 8; i++) { const r = i % 2 ? s * .28 : s, an = i * Math.PI / 4; c.lineTo(Math.cos(an) * r, Math.sin(an) * r); }
  c.closePath(); c.fill(); c.restore();
}
function burst(t, t0, cx, cy, col) {
  const p = pr(t, t0, 0.9); if (p <= 0 || p >= 1) return;
  for (const s of SPK) { const q = cl((p - s.dl) / (1 - s.dl)); if (q <= 0) continue; const d = s.d * out(q) * .9 + 120; star(fg, cx + Math.cos(s.a) * d * 1.25, cy + Math.sin(s.a) * d * .7, s.s * (1 - q * q) * 1.6, q * 2 + s.a, col, 1 - q * q); }
}
function drawFg(t) {
  fg.clearRect(0, 0, W, H);
  // boules suspendues (scène d'ouverture)
  const oOut = inn(pr(t, Q.B - 0.45, 0.45));
  if (oOut < 1) ORN.forEach((o, i) => {
    const d = sp(t, 0.05 + i * 0.09, 1.5, 0.5), len = o.l * d - oOut * (o.l + 160), sw = Math.sin(t * 1.5 + i * 1.7) * 0.05 + (1 - d) * 0.2;
    const x = o.x + Math.sin(sw) * len, y = Math.cos(sw) * len;
    if (y < -o.r) return;
    fg.strokeStyle = '#B8893A'; fg.lineWidth = 3; fg.beginPath(); fg.moveTo(o.x, -5); fg.lineTo(x, y - o.r); fg.stroke();
    fg.fillStyle = '#B8893A'; fg.fillRect(x - 9, y - o.r - 12, 18, 14);
    const g = fg.createRadialGradient(x - o.r * .35, y - o.r * .4, o.r * .1, x, y, o.r);
    g.addColorStop(0, '#fff'); g.addColorStop(.25, o.c); g.addColorStop(1, 'rgba(0,0,0,.55)');
    fg.fillStyle = o.c; fg.beginPath(); fg.arc(x, y, o.r, 0, 6.2832); fg.fill();
    fg.globalAlpha = .55; fg.fillStyle = g; fg.beginPath(); fg.arc(x, y, o.r, 0, 6.2832); fg.fill(); fg.globalAlpha = 1;
  });
  // guirlande lumineuse
  const gi = sp(t, 0.1, 1.6, 0.7);
  fg.strokeStyle = '#14301d'; fg.lineWidth = 5; fg.beginPath();
  const pts = []; for (let i = 0; i <= 60; i++) { const u = i / 60, x = -20 + u * (W + 40), y = -60 + gi * (78 + 34 * Math.abs(Math.sin(u * Math.PI * 3)) + 4 * Math.sin(t * 1.2 + u * 9)); pts.push([x, y]); i ? fg.lineTo(x, y) : fg.moveTo(x, y); }
  fg.stroke();
  for (let i = 2; i < 60; i += 4) {
    const [x, y] = pts[i], k = (i / 4) | 0, col = LCOL[k % LCOL.length], on = 0.55 + 0.45 * Math.sin(t * 5.2 + k * 2.1);
    const g = fg.createRadialGradient(x, y + 16, 0, x, y + 16, 52); g.addColorStop(0, col); g.addColorStop(1, 'rgba(255,255,255,0)');
    fg.globalAlpha = 0.5 * on; fg.fillStyle = g; fg.beginPath(); fg.arc(x, y + 16, 52, 0, 6.2832); fg.fill();
    fg.globalAlpha = 0.6 + 0.4 * on; fg.fillStyle = col; fg.beginPath(); fg.ellipse(x, y + 17, 10, 15, 0, 0, 6.2832); fg.fill();
    fg.globalAlpha = 1; fg.fillStyle = '#14301d'; fg.fillRect(x - 6, y - 2, 12, 8);
  }
  // étincelles sur les moments clés
  burst(t, Q.D + 0.12, 540, 520, '#FFC400'); burst(t, Q.D1 + 0.05, 280, 990, '#FFD91A'); burst(t, Q.D2 + 0.05, 800, 990, '#FFD91A');
  burst(t, Q.E5 + 0.05, 540, 1185, '#FFD23F'); burst(t, Q.C3 + 0.1, 540, 1700, '#FFD23F');
  // neige
  for (const s of SNOW) {
    const y = (s.y + s.v * t) % (H + 40) - 20, x = s.x + Math.sin(t * s.f + s.ph) * s.amp;
    fg.globalAlpha = s.a; fg.fillStyle = '#fff'; fg.beginPath(); fg.arc(x, y, s.r, 0, 6.2832); fg.fill();
  }
  fg.globalAlpha = 1;
}

// ---------- scènes ----------
function seekSync(t) {
  drawBg(t); drawFg(t);
  const br = Math.sin(t * 1.9), br2 = Math.sin(t * 1.4 + 1);

  // A — logo d'ouverture, puis logo en en-tête pour tout le film
  put(E.hello, 0, 640 - 40 * inn(pr(t, Q.B - 0.4, 0.4)), 1, -3, 1 - pr(t, Q.B - 0.35, 0.3));
  reveal(E.hello, t, 0.25, Q.B - 0.5);
  const lm = io(pr(t, Q.B - 0.45, 0.8)), ls = lerp(1.62, 0.6, lm) * (1 + 0.012 * br * (1 - lm)), lcx = 540, lcy = lerp(960, 150, lm);
  put(E.logo, lcx - 302 * ls, lcy - 145 * ls, ls, 0, 1);
  [['lg1', .75], ['lg2', .87], ['lg3', .99]].forEach(([id, t0]) => { const p = sp(t, t0, 3, 0.55); $(id).style.transform = `scale(${p.toFixed(4)})`; });
  const pt = out(pr(t, 1.15, 0.5)); $('lgT').style.opacity = pt; $('lgT').style.transform = `translateX(${((1 - pt) * -40).toFixed(2)}px)`;
  const ps = out(pr(t, 1.55, 0.5)); $('lgS').style.opacity = ps; $('lgS').style.transform = `translateY(${((1 - ps) * 12).toFixed(2)}px)`;
  put(E.pill0, 540 - 210, lcy - 75, lerp(1.6, 1, lm), 0, pr(t, Q.B - 0.3, 0.45));

  // B — « Offrez la magie de Noël à vos enfants ! » + enfants (affiche 2)
  const bOut = inn(pr(t, Q.C1 - 0.4, 0.4));
  const kIn = sp(t, Q.B + 0.2, 1.7, 0.68);
  put(E.kids2, -160 + 6 * br2, 585 + (1 - kIn) * 1500 + bOut * 1500, 1 + 0.008 * br, 0.5 * br2, t > Q.B - 0.1 && t < Q.C1 + 0.05 ? 1 : 0);
  put(E.offrez, 392, 300 - 60 * bOut, 1, -5, t > Q.B && t < Q.C1 ? 1 - bOut : 0);
  reveal(E.offrez, t, Q.B + 0.25, null, 0.11);
  const sw = out(pr(t, Q.B + 1.6, 0.5)); swp.style.strokeDashoffset = SWL * (1 - sw);
  put(E.swoosh, 470, 655 - 60 * bOut, 1, -5, t > Q.B + 1.6 && t < Q.C1 ? 1 - bOut : 0);
  // congère + cadeaux : présents en B, puis reviennent en E/F
  const lB = sp(t, 0.35, 1.8, 0.8) - bOut, lE = sp(t, Q.E + 0.1, 1.8, 0.8), lF = io(pr(t, Q.F - 0.1, 0.7));
  const ly = t < Q.D ? lerp(1940, 1690, lB) : lerp(lerp(1940, 1660, lE), 1800, lF);
  put(E.ledge, -100 + 14 * br2, ly, 1, 0, 1);
  const gB = sp(t, 1.9, 2.4, 0.55), gE = sp(t, Q.E + 0.5, 2.4, 0.55);
  if (t < Q.D) put(E.gifts, lerp(190, -30, io(pr(t, Q.B - 0.2, 0.6))), 1545 + (1 - gB) * 600 + bOut * 600, 1, -2 + br * .4, 1);
  else put(E.gifts, 190, 1525 + (1 - gE) * 500 + lF * 420, 1, br * .4, t > Q.E ? 1 : 0);

  // C — les modèles : deux cartes
  const cOut = inn(pr(t, Q.D - 0.4, 0.4));
  const a1 = sp(t, Q.C1, 2.0, 0.74), a2 = sp(t, Q.C2, 2.0, 0.74);
  const von = (t0) => t > t0 - 0.05 && t < Q.D + 0.05 ? 1 : 0;
  put(E.c1, 70 + (1 - a1) * 1150 - cOut * 1200, 250, 1, 2.2 * (1 - a1) - 1.2, von(Q.C1));
  put(E.c2, 70 - (1 - a2) * 1150 + cOut * 1200, 935, 1, -2.2 * (1 - a2) + 1.2, von(Q.C2));
  const d1 = pr(t, Q.C1, Q.D - Q.C1), d2 = pr(t, Q.C2, Q.D - Q.C2);
  c1i.style.transform = `translate(${(10 - 14 * d1).toFixed(2)}px,${(-150 - 60 * d1).toFixed(2)}px) scale(${(1 + .05 * d1).toFixed(4)})`;
  c2i.style.transform = `translate(${(-175 + 14 * d2).toFixed(2)}px,${(-175 - 60 * d2).toFixed(2)}px) scale(${(1 + .05 * d2).toFixed(4)})`;
  const h1 = sp(t, Q.C1 + 0.35, 3, 0.6), h2 = sp(t, Q.C2 + 0.35, 3, 0.6);
  put(E.chip1, 110 - cOut * 1200, 800, h1, -4, von(Q.C1 + 0.35));
  put(E.chip2, 570 + cOut * 1200, 1485, h2, 3, von(Q.C2 + 0.35));
  put(E.chacun, 0, 1640 + 80 * cOut, 1 + 0.01 * br, -2, t > Q.C3 - 0.05 && t < Q.D ? 1 - cOut : 0);
  reveal(E.chacun, t, Q.C3, null, 0.09);

  // D — Promo Spécial Noël + prix (affiche 1)
  const dOut = inn(pr(t, Q.E - 0.4, 0.4)), dv = (t0) => t > t0 - 0.02 && t < Q.E + 0.02 ? 1 : 0;
  const ti = sp(t, Q.D, 2.3, 0.5);
  put(E.noel1, 70, 232 - dOut * 900, lerp(0.2, 1, ti) * (1 + 0.012 * br), lerp(-14, 0, ti) + br2 * .6, dv(Q.D));
  const k1 = sp(t, Q.D + 0.45, 1.7, 0.7);
  put(E.kids1, 96 + 6 * br2, 1150 + (1 - k1) * 900 + dOut * 900, 1 + 0.008 * br, .5 * br2, dv(Q.D + 0.4));
  const p1 = sp(t, Q.D1, 2.6, 0.5), p2 = sp(t, Q.D2, 2.6, 0.5);
  put(E.b1, 40 - dOut * 700, 865, p1, lerp(-25, -5, p1), dv(Q.D1));
  put(E.b2, 560 + dOut * 700, 885, p2, lerp(25, 4, p2), dv(Q.D2));
  n1.textContent = Math.round(2500 * out(pr(t, Q.D1, 0.7)) / 50) * 50 || '0';
  n2.textContent = Math.round(2000 * out(pr(t, Q.D2, 0.7)) / 50) * 50 || '0';
  const pu = pr(t, Q.D3, 0.5); l2.style.transform = `scale(${(1 + 0.22 * Math.sin(pu * Math.PI)).toFixed(4)})`;

  // E — contact WhatsApp
  const fOut = inn(pr(t, Q.F - 0.35, 0.4)), ev = t > Q.E - 0.02 ? 1 : 0;
  const sI = sp(t, Q.E, 1.1, 0.28);
  put(E.sign, 140, 275 - fOut * 900, 1, (1 - sI) * 38 + 1.5 * br, ev && fOut < 1 ? 1 : 0);
  put(E.cmd, 0, 880 - 40 * fOut, 1, -3, ev ? 1 - fOut : 0);
  reveal(E.cmd, t, Q.E + 0.35, null, 0.1);
  const ph = sp(t, Q.E + 0.6, 2.4, 0.6), py = lerp(1090, 1345, lF);
  put(E.phone, 50, py, ph * (1 + 0.01 * br), 0, t > Q.E + 0.6 ? 1 : 0);
  [Q.E1, Q.E2, Q.E3, Q.E4, Q.E5].forEach((t0, i) => {
    const p = sp(t, t0, 3.2, 0.5), hot = 1 - pr(t, t0, 0.45);
    digits[i].style.opacity = t >= t0 ? 1 : 0.14;
    digits[i].style.transform = `scale(${(t >= t0 ? lerp(1.5, 1, p) : 1).toFixed(4)})`;
    digits[i].style.color = t >= t0 && hot > 0 ? '#E2742A' : '#3B1E12';
  });
  put(E.sub, 0, py + 215, 1, 0, out(pr(t, Q.E + 1.0, 0.4)) * (1 - pr(t, Q.F - 0.3, 0.3)));

  // F — final : les deux affiches + adresse
  const q1 = sp(t, Q.F, 1.7, 0.66), q2 = sp(t, Q.F + 0.18, 1.7, 0.66), dr = pr(t, Q.F, Q.END - Q.F);
  put(E.p1, 40 - 8 * dr, 262 + (1 - q1) * 1900, 1 + 0.02 * dr, lerp(-28, -5, q1) - dr, t > Q.F ? 1 : 0);
  put(E.p2, 400 + 8 * dr, 640 + (1 - q2) * 1900, 1 + 0.02 * dr, lerp(28, 5, q2) + dr, t > Q.F + 0.18 ? 1 : 0);
  const lo = sp(t, Q.F1, 2.4, 0.7), pin = sp(t, Q.F1 + 0.1, 3, 0.4);
  put(E.loc, 0, 1578 + (1 - lo) * 80, 1, 0, cl(lo * 1.5));
  E.loc.querySelector('svg').style.transform = `translateY(${((1 - pin) * -160).toFixed(2)}px) scale(${(1 + 0.04 * br).toFixed(4)})`;
}
window.seek = async t => seekSync(t);

// ---------- prévisualisation : Espace = lecture/pause, ←/→ = image, R = rejouer ----------
let T = 0, playing = false, last = 0;
function loop(now) { if (playing) { T += (now - last) / 1000; if (T > Q.END) T = 0; seekSync(T); } last = now; $('hud').textContent = T.toFixed(2) + ' s'; requestAnimationFrame(loop); }
addEventListener('keydown', e => { if (e.key === ' ') playing = !playing; if (e.key === 'ArrowRight') { T += 1 / 30; seekSync(T); } if (e.key === 'ArrowLeft') { T = Math.max(0, T - 1 / 30); seekSync(T); } if (e.key === 'r') T = 0; });
Promise.all([document.fonts.ready, ...[...document.images].map(i => i.decode().catch(() => { }))]).then(async () => {
  await Promise.all(['500 20px Poppins', 'italic 500 20px Poppins', '600 20px Poppins', '700 20px Poppins', '800 20px Poppins', '20px Pacifico', '20px Lilita'].map(f => document.fonts.load(f)));
  if (new URLSearchParams(location.search).has('render')) $('hud').style.display = 'none'; else requestAnimationFrame(loop);
  seekSync(0); window.ready = true;
});
