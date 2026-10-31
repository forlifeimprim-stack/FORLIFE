// Boîte à outils des illustrations : maquettes d'écrans, téléphones, schémas, annotations.
// Chaque fonction renvoie du HTML ; rendre.js transforme chaque planche en PNG.
const path = require('path');
const POL = 'file://' + path.join(__dirname, '..', 'couvertures', 'polices');
const POL2 = 'file:///root/.claude/skills/synced/84494c23-5045-42ab-b0a8-1d5d1f7be8a0_4804c437-e7a6-465b-8116-3c0c75a15439/canvas-design/canvas-fonts';

const CSS = `
@font-face { font-family: 'Bricolage'; src: url('${POL}/BricolageGrotesque-Bold.ttf'); font-weight: 700; }
@font-face { font-family: 'Geist Mono'; src: url('${POL}/GeistMono-Regular.ttf'); }
@font-face { font-family: 'Geist Mono'; src: url('${POL}/GeistMono-Bold.ttf'); font-weight: 700; }
@font-face { font-family: 'Instrument Sans'; src: url('${POL}/InstrumentSans-Regular.ttf'); }
@font-face { font-family: 'Instrument Sans'; src: url('${POL}/InstrumentSans-Bold.ttf'); font-weight: 700; }
@font-face { font-family: 'Main'; src: url('${POL2}/NothingYouCouldDo-Regular.ttf'); }
:root { --orange:#EA7822; --or:#E2AC48; --vert:#187A52; --creme:#F6EFE6; --indigo:#18162A; --brique:#A03E20; --gris:#6B6560; --bleu:#1F5F99; --rouge:#C0392B; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { width: 1600px; background: var(--creme); font-family: 'Instrument Sans', 'Segoe UI', sans-serif; color: var(--indigo); }
.planche { width: 1600px; padding: 44px 56px 40px; position: relative; background: var(--creme); }
.etiquette { font-family: 'Geist Mono'; font-size: 18px; letter-spacing: 4px; color: var(--orange); font-weight: 700; margin-bottom: 6px; }
.titre { font-family: 'Bricolage'; font-size: 40px; line-height: 1.1; margin-bottom: 26px; }
.ligne { display: flex; gap: 40px; align-items: flex-start; }
.col { display: flex; flex-direction: column; gap: 22px; }
.ann { position: relative; }
.pt { position: absolute; z-index: 9; width: 38px; height: 38px; border-radius: 50%; background: var(--orange); color: #fff; font-family: 'Bricolage'; font-size: 21px;
  display: flex; align-items: center; justify-content: center; border: 3px solid #fff; box-shadow: 0 3px 8px rgba(0,0,0,.28); }
.leg { display: flex; flex-direction: column; gap: 13px; min-width: 330px; max-width: 360px; }
.leg > div { display: grid; grid-template-columns: 42px 1fr; gap: 12px; align-items: center; font-size: 19px; line-height: 1.25; }
.leg b { font-family: 'Bricolage'; font-weight: 700; display: block; font-size: 20px; }
.leg small { color: var(--gris); font-size: 16px; }
.leg span.l { width: 38px; height: 38px; border-radius: 50%; background: var(--orange); color: #fff; font-family: 'Bricolage'; display: flex; align-items: center; justify-content: center; font-size: 20px; }
.win { background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 14px 40px rgba(24,22,42,.22); border: 1px solid #d9d4cc; }
.win .tb { height: 40px; background: #F3F3F3; display: flex; align-items: center; padding-left: 16px; font-size: 15px; color: #333; border-bottom: 1px solid #e4e4e4; }
.win .tb .ic { width: 18px; height: 18px; border-radius: 4px; margin-right: 10px; }
.win .tb .bt { margin-left: auto; display: flex; height: 100%; }
.win .tb .bt span { width: 50px; display: flex; align-items: center; justify-content: center; font-size: 17px; color: #333; }
.win .tb .bt span:last-child:hover { background: #E81123; }
.ruban { background: #fafafa; border-bottom: 1px solid #e3e3e3; }
.onglets { display: flex; gap: 4px; padding: 6px 12px 0; font-size: 15px; }
.onglets span { padding: 7px 14px; border-radius: 6px 6px 0 0; color: #444; }
.onglets span.on { background: #fff; color: #185ABD; font-weight: 700; border: 1px solid #e3e3e3; border-bottom: none; }
.outils { display: flex; gap: 10px; padding: 10px 14px; align-items: center; background: #fff; font-size: 14px; flex-wrap: wrap; }
.btn { border: 1px solid #d6d6d6; border-radius: 6px; padding: 6px 12px; background: #fff; font-size: 15px; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; }
.btn.p { background: var(--orange); color: #fff; border-color: var(--orange); font-weight: 700; }
.btn.b { background: #1a73e8; color: #fff; border-color: #1a73e8; font-weight: 700; }
.btn.v { background: var(--vert); color: #fff; border-color: var(--vert); font-weight: 700; }
.champ { border: 1px solid #c9c9c9; border-radius: 6px; padding: 8px 12px; font-size: 15px; background: #fff; color: #333; }
.phone { width: 330px; border-radius: 36px; background: var(--indigo); padding: 14px; box-shadow: 0 14px 40px rgba(24,22,42,.25); }
.phone .ecr { background: #fff; border-radius: 26px; overflow: hidden; height: 640px; position: relative; font-size: 15px; }
.phone .sb { height: 30px; display: flex; justify-content: space-between; align-items: center; padding: 0 20px; font-size: 13px; font-weight: 700; color: #222; }
.nav .barre { display: flex; align-items: center; gap: 12px; padding: 9px 14px; background: #f1f3f4; border-bottom: 1px solid #ddd; font-size: 17px; color: #555; }
.nav .url { flex: 1; background: #fff; border-radius: 18px; padding: 7px 16px; font-size: 15px; color: #222; display: flex; gap: 8px; align-items: center; }
.nav .tabs { display: flex; gap: 2px; padding: 8px 10px 0; background: #dee1e6; font-size: 13px; }
.nav .tabs span { background: #f1f3f4; padding: 8px 16px; border-radius: 8px 8px 0 0; color: #333; min-width: 160px; }
.nav .tabs span.off { background: transparent; color: #666; }
.grille { border-collapse: collapse; font-size: 15px; }
.grille td, .grille th { border: 1px solid #dadada; padding: 6px 10px; height: 32px; min-width: 70px; }
.grille th { background: #f3f3f3; color: #555; font-weight: 400; text-align: center; }
.carte { background: #fff; border-radius: 14px; border: 2px solid #E8E2DA; padding: 16px; }
.fl { font-size: 38px; color: var(--orange); font-weight: 700; align-self: center; }
.note { font-size: 17px; color: var(--gris); margin-top: 18px; }
.main { font-family: 'Main'; }
`;

const page = (corps) => `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>${CSS}</style></head><body><div class="planche">${corps}</div></body></html>`;
const entete = (etiquette, titre) => `${etiquette ? `<div class="etiquette">${etiquette}</div>` : ''}${titre ? `<div class="titre">${titre}</div>` : ''}`;
// Élément annoté : pastille en haut à droite (ou position donnée).
const ann = (lettre, html, pos = 'top:-16px;right:-16px') => `<div class="ann">${html}<div class="pt" style="${pos}">${lettre}</div></div>`;
const pt = (lettre, pos) => `<div class="pt" style="${pos}">${lettre}</div>`;
const leg = (items) => `<div class="leg">${items.map(([l, t, s]) => `<div><span class="l">${l}</span><div><b>${t}</b>${s ? `<small>${s}</small>` : ''}</div></div>`).join('')}</div>`;
const win = ({ titre, ic = '#2B579A', w = 1000, h = 'auto', corps, style = '' }) =>
  `<div class="win" style="width:${w}px;${style}"><div class="tb"><span class="ic" style="background:${ic}"></span>${titre}<div class="bt"><span>—</span><span>☐</span><span>✕</span></div></div><div style="height:${h === 'auto' ? 'auto' : h + 'px'};position:relative">${corps}</div></div>`;
const ruban = (onglets, actif, outils) => `<div class="ruban"><div class="onglets">${onglets.map((o) => `<span class="${o === actif ? 'on' : ''}">${o}</span>`).join('')}</div><div class="outils">${outils}</div></div>`;
const phone = (corps, { heure = '14:32', style = '' } = {}) => `<div class="phone" style="${style}"><div class="ecr"><div class="sb"><span>${heure}</span><span>📶 🔋</span></div>${corps}</div></div>`;
const nav = ({ url, onglets = ['Nouvel onglet'], corps, w = 1000, lock = true }) =>
  `<div class="win nav" style="width:${w}px"><div class="tabs">${onglets.map((o, i) => `<span class="${i ? 'off' : ''}">${o}</span>`).join('')}<span class="off" style="min-width:30px">+</span></div><div class="barre"><span>←</span><span>→</span><span>⟳</span><div class="url">${lock ? '🔒' : ''}<span>${url}</span><span style="margin-left:auto">☆</span></div><span>⋯</span></div><div style="position:relative">${corps}</div></div>`;
const grille = (cols, lignes, { sel = null, larg = {} } = {}) => `<table class="grille"><tr><th style="min-width:44px"></th>${cols.map((c) => `<th style="${larg[c] ? 'min-width:' + larg[c] + 'px' : ''}">${c}</th>`).join('')}</tr>${lignes.map((l, i) => `<tr><th>${i + 1}</th>${l.map((v, j) => {
  const adr = cols[j] + (i + 1);
  const st = sel === adr ? 'outline:3px solid #217346;outline-offset:-3px;' : '';
  return `<td style="${st}${typeof v === 'object' && v ? v.s : ''}">${typeof v === 'object' && v ? v.t : v}</td>`;
}).join('')}</tr>`).join('')}</table>`;
const fleche = (t = '→') => `<div class="fl">${t}</div>`;

module.exports = { page, entete, ann, pt, leg, win, ruban, phone, nav, grille, fleche };
