#!/usr/bin/env node
// FORLIFE Visuel Studio — rend une page HTML/CSS en PNG, JPG ou PDF au format exact (réseaux sociaux ou impression).
//
//   node rendre.mjs <page.html> <sortie.png|jpg|pdf> --format <nom> [options]
//   node rendre.mjs --formats                       liste des formats
//
// Options
//   --format <nom>        format prédéfini (post, story, a5, affiche-a3, rollup…) — voir --formats
//   --taille LxH          taille libre : "1080x1350" (pixels) ou "148x210mm" (impression)
//   --dpi <n>             résolution des formats impression en PNG/JPG (défaut 300 ; 150 pour bâches et roll-up)
//   --fond-perdu <mm>     ajoute un fond perdu (défaut 3 mm pour l'impression, 0 pour l'écran)
//   --echelle <n>         facteur de pixels pour l'écran (défaut 1 = taille exacte demandée par la plateforme)
//   --qualite <n>         qualité JPG (défaut 92)
//   --sans-traits         PDF impression sans traits de coupe (par défaut : traits de coupe + repères hors format)
//   --rogner              PNG/JPG d'un format impression rogné au format fini (aperçu réseaux, sans fond perdu)
//
// Logo officiel : <img data-forlife-logo="horizontal|vertical|symbole" [data-texte="#1A1A1A"] [data-sans-slogan]>
// est remplacé par le SVG de assets/logo/ (voir logo.mjs).
//
// La page reçoit automatiquement :
//   - la police Poppins (locale, 400 à 900) ;
//   - les variables CSS --page-l / --page-h (taille finale, fond perdu compris) et --fond-perdu ;
//   - la classe <html class="format-<nom>">.
// Après le rendu, le script signale les textes qui débordent de leur bloc et les éléments qui sortent de la page.

import { createRequire } from 'node:module';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve, extname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { injecterLogos } from './logo.mjs';

const ICI = dirname(fileURLToPath(import.meta.url));
let chromium;
try { ({ chromium } = createRequire(import.meta.url)('playwright')); }
catch { console.error('Playwright introuvable. Installer : npm i -D playwright && npx playwright install chromium'); process.exit(1); }
const POLICES = resolve(ICI, '..', 'polices');

// largeur × hauteur. "px" = écran (pixels exacts), "mm" = impression.
const FORMATS = {
  // Réseaux sociaux
  'post':            { l: 1080, h: 1350, u: 'px', d: 'Post Instagram/Facebook portrait 4:5 (le plus visible dans le fil)' },
  'carre':           { l: 1080, h: 1080, u: 'px', d: 'Post carré 1:1' },
  'story':           { l: 1080, h: 1920, u: 'px', d: 'Story / Reel / TikTok / Statut WhatsApp 9:16' },
  'paysage':         { l: 1920, h: 1080, u: 'px', d: 'Vidéo / slide 16:9' },
  'couverture-fb':   { l: 1640, h: 624,  u: 'px', d: 'Couverture de page Facebook' },
  'evenement-fb':    { l: 1920, h: 1005, u: 'px', d: 'Bannière d\'événement Facebook' },
  'miniature-yt':    { l: 1280, h: 720,  u: 'px', d: 'Miniature YouTube' },
  'linkedin':        { l: 1200, h: 627,  u: 'px', d: 'Post lien LinkedIn' },
  'avatar':          { l: 1080, h: 1080, u: 'px', d: 'Photo de profil (cercle centré)' },
  'whatsapp-catalogue': { l: 1080, h: 1080, u: 'px', d: 'Image produit catalogue WhatsApp Business' },
  // Impression (fond perdu ajouté automatiquement)
  'carte-visite':    { l: 85,   h: 55,   u: 'mm', d: 'Carte de visite 85×55 mm' },
  'a6':              { l: 105,  h: 148,  u: 'mm', d: 'Flyer A6' },
  'a5':              { l: 148,  h: 210,  u: 'mm', d: 'Flyer A5' },
  'a4':              { l: 210,  h: 297,  u: 'mm', d: 'Flyer / affiche A4' },
  'affiche-a3':      { l: 297,  h: 420,  u: 'mm', d: 'Affiche A3' },
  'affiche-a2':      { l: 420,  h: 594,  u: 'mm', d: 'Affiche A2 (format max de l\'imprimante DTF A2 pour le textile)' },
  'affiche-a1':      { l: 594,  h: 841,  u: 'mm', d: 'Affiche A1' },
  'depliant-a4':     { l: 297,  h: 210,  u: 'mm', d: 'Dépliant A4 à plat (3 volets de 99 mm)' },
  'menu-a4':         { l: 210,  h: 297,  u: 'mm', d: 'Menu de restaurant A4' },
  'faire-part':      { l: 148,  h: 148,  u: 'mm', d: 'Faire-part carré 14,8 cm' },
  'calendrier-a3':   { l: 297,  h: 420,  u: 'mm', d: 'Calendrier mural A3' },
  'rollup':          { l: 850,  h: 2000, u: 'mm', d: 'Roll-up 85×200 cm (prévoir 10 cm bas non visibles)', dpi: 150 },
  'kakemono':        { l: 800,  h: 1800, u: 'mm', d: 'Kakémono 80×180 cm', dpi: 150 },
  'bache-2x1':       { l: 2000, h: 1000, u: 'mm', d: 'Bâche 2×1 m', dpi: 100 },
  'bache-3x2':       { l: 3000, h: 2000, u: 'mm', d: 'Bâche 3×2 m', dpi: 72 },
  'dtf-tshirt':      { l: 280,  h: 350,  u: 'mm', d: 'Transfert DTF face avant tee-shirt (fond transparent : PNG)', fondPerdu: 0 },
  'dtf-coeur':       { l: 90,   h: 90,   u: 'mm', d: 'Transfert DTF logo cœur/poitrine', fondPerdu: 0 },
};

function args(argv) {
  const o = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2);
      const v = argv[i + 1];
      if (v === undefined || v.startsWith('--')) o[k] = true; else { o[k] = v; i++; }
    } else o._.push(a);
  }
  return o;
}

const o = args(process.argv.slice(2));
if (o.formats) {
  for (const [k, f] of Object.entries(FORMATS)) console.log(`${k.padEnd(20)} ${String(f.l + '×' + f.h + ' ' + f.u).padEnd(16)} ${f.d}`);
  process.exit(0);
}
const [entree, sortie] = o._;
if (!entree || !sortie) {
  console.error('Usage : node rendre.mjs <page.html> <sortie.png|jpg|pdf> --format <nom>   (--formats pour la liste)');
  process.exit(1);
}
if (!existsSync(entree)) { console.error(`Fichier introuvable : ${entree}`); process.exit(1); }

let fmt;
if (o.taille) {
  const m = String(o.taille).match(/^(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)(mm|px)?$/);
  if (!m) { console.error('--taille attendu : 1080x1350 ou 148x210mm'); process.exit(1); }
  fmt = { l: +m[1], h: +m[2], u: m[3] || 'px', d: 'taille libre' };
} else {
  fmt = FORMATS[o.format || 'post'];
  if (!fmt) { console.error(`Format inconnu : ${o.format}. Voir --formats`); process.exit(1); }
}
const nom = o.format || 'libre';
const ext = extname(sortie).toLowerCase();
const impression = fmt.u === 'mm';
const fp = impression ? +(o['fond-perdu'] ?? fmt.fondPerdu ?? 3) : 0;
const dpi = +(o.dpi ?? fmt.dpi ?? 300);
const MM = 96 / 25.4; // px CSS par mm

// Taille de la page en px CSS (fond perdu compris)
const lCss = impression ? (fmt.l + 2 * fp) * MM : fmt.l;
const hCss = impression ? (fmt.h + 2 * fp) * MM : fmt.h;
const echelle = impression ? dpi / 96 : +(o.echelle ?? 1);

const css = `
@font-face{font-family:'Poppins';font-style:normal;font-weight:400;font-display:block;src:url(${pathToFileURL(join(POLICES, 'poppins-latin-400-normal.woff2'))}) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
${[400, 500, 600, 700, 800, 900].map(w => `
@font-face{font-family:'Poppins';font-style:normal;font-weight:${w};font-display:block;src:url(${pathToFileURL(join(POLICES, `poppins-latin-${w}-normal.woff2`))}) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
@font-face{font-family:'Poppins';font-style:normal;font-weight:${w};font-display:block;src:url(${pathToFileURL(join(POLICES, `poppins-latin-ext-${w}-normal.woff2`))}) format('woff2');unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}`).join('')}
${[400, 500, 700].map(w => `@font-face{font-family:'Poppins';font-style:italic;font-weight:${w};font-display:block;src:url(${pathToFileURL(join(POLICES, `poppins-latin-${w}-italic.woff2`))}) format('woff2')}`).join('\n')}
:root{--page-l:${lCss}px;--page-h:${hCss}px;--fond-perdu:${fp}mm}
html,body{margin:0;padding:0;width:${lCss}px;height:${hCss}px;overflow:hidden}
@page{size:${lCss}px ${hCss}px;margin:0}
*{-webkit-print-color-adjust:exact;print-color-adjust:exact}
`;

const navigateur = await chromium.launch();
try {
  const page = await navigateur.newPage({ viewport: { width: Math.round(lCss), height: Math.round(hCss) }, deviceScaleFactor: echelle });
  await page.goto(pathToFileURL(resolve(entree)).href, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: css });
  await page.evaluate(n => document.documentElement.classList.add('format-' + n), nom);
  await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))); });
  const alertesLogo = await injecterLogos(page);
  await page.evaluate(() => document.fonts.ready);

  // Contrôle qualité : débordements
  const alertes = await page.evaluate(({ l, h }) => {
    const out = [];
    const nomEl = e => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (e.classList.length ? '.' + [...e.classList].join('.') : '');
    for (const e of document.body.querySelectorAll('*')) {
      const s = getComputedStyle(e);
      if (s.display === 'none' || s.visibility === 'hidden' || e.closest('[data-deborde-ok]')) continue;
      const r = e.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const texte = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
      if (texte && (e.scrollWidth > e.clientWidth + 2 || e.scrollHeight > e.clientHeight + 2) && s.overflow !== 'visible')
        out.push(`texte coupé dans ${nomEl(e)} : « ${e.textContent.trim().slice(0, 40)} »`);
      if (texte && (r.right > l + 1 || r.bottom > h + 1 || r.left < -1 || r.top < -1))
        out.push(`texte hors page : ${nomEl(e)} « ${e.textContent.trim().slice(0, 40)} »`);
    }
    return [...new Set(out)].slice(0, 15);
  }, { l: lCss, h: hCss });
  alertes.push(...alertesLogo);

  mkdirSync(dirname(resolve(sortie)), { recursive: true });
  if (ext === '.pdf') {
    const traits = impression && fp > 0 && !o['sans-traits'];
    const M = traits ? 10 : 0; // marge autour du fond perdu pour les traits de coupe (mm)
    if (traits) {
      // La page grandit de 10 mm de chaque côté ; le visuel (fond perdu compris) est posé au centre,
      // les traits de coupe marquent le format fini, une ligne de repère indique fichier, format et date.
      await page.addStyleTag({ content: `html{width:${lCss + 2 * M * MM}px;height:${hCss + 2 * M * MM}px;background:#fff;position:relative}
        body{position:absolute;left:${M}mm;top:${M}mm;width:${lCss}px;height:${hCss}px;overflow:hidden}` });
      await page.evaluate(({ M, fp, l, h, info }) => {
        const c = document.createElement('div');
        c.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:2147483647';
        const t = 0.1, g = 1; // mm : épaisseur des traits, écart avec le fond perdu
        const xs = [M + fp, M + l - fp], ys = [M + fp, M + h - fp];
        const trait = (x, y, w, hh) => { const s = document.createElement('div'); s.style.cssText = `position:absolute;left:${x}mm;top:${y}mm;width:${w}mm;height:${hh}mm;background:#000`; c.appendChild(s); };
        for (const x of xs) { trait(x - t / 2, 0, t, M - g); trait(x - t / 2, M + h + g, t, M - g); }
        for (const y of ys) { trait(0, y - t / 2, M - g, t); trait(M + l + g, y - t / 2, M - g, t); }
        const r = document.createElement('div');
        r.textContent = info;
        r.style.cssText = `position:absolute;left:${M + fp}mm;top:${M + h + 2.5}mm;font:5.5pt Poppins,sans-serif;color:#000;white-space:nowrap`;
        c.appendChild(r);
        document.documentElement.appendChild(c);
      }, { M, fp, l: fmt.l + 2 * fp, h: fmt.h + 2 * fp, info: `${sortie.split(/[\\/]/).pop()} · format fini ${fmt.l}×${fmt.h} mm · fond perdu ${fp} mm · RVB · ${new Date().toLocaleDateString('fr-FR')} · Forlife Com'` });
    }
    // Tailles en mm (pas en px) : le PDF fait exactement le format demandé
    await page.pdf({ path: sortie, width: `${fmt.l + 2 * fp + 2 * M}mm`, height: `${fmt.h + 2 * fp + 2 * M}mm`, printBackground: true, pageRanges: '1' });
  } else if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
    const transparent = await page.evaluate(() => getComputedStyle(document.body).backgroundColor === 'rgba(0, 0, 0, 0)' && getComputedStyle(document.documentElement).backgroundColor === 'rgba(0, 0, 0, 0)');
    const r = impression && o.rogner ? fp * MM : 0;
    await page.screenshot({ path: sortie, type: ext === '.png' ? 'png' : 'jpeg', quality: ext === '.png' ? undefined : +(o.qualite ?? 92), omitBackground: ext === '.png' && transparent, clip: { x: r, y: r, width: lCss - 2 * r, height: hCss - 2 * r } });
  } else {
    console.error('Extension de sortie : .png, .jpg ou .pdf'); process.exit(1);
  }

  const rog = impression && o.rogner && ext !== '.pdf' ? 2 * fp * MM : 0;
  const pxL = Math.round((lCss - rog) * echelle), pxH = Math.round((hCss - rog) * echelle);
  console.log(`✔ ${sortie}`);
  const px = ext === '.pdf' || (!impression && echelle === 1) ? '' : ` — ${pxL}×${pxH} px${impression ? ` à ${dpi} dpi` : ''}`;
  console.log(`  format ${nom} — ${fmt.l}×${fmt.h} ${fmt.u}${impression && !rog ? ` + fond perdu ${fp} mm` : rog ? ' (rogné au format fini)' : ''}${px}`);
  if (ext === '.pdf' && impression && fp > 0 && !o['sans-traits']) console.log('  traits de coupe et repères ajoutés (10 mm autour du fond perdu) ; --sans-traits pour les retirer.');
  if (impression && ext !== '.pdf') console.log('  conseil : pour l\'imprimeur, exporter aussi en .pdf (texte vectoriel net).');
  if (impression) console.log('  rappel : rendu en RVB ; garder textes et éléments importants à 5 mm minimum du bord de coupe.');
  if (alertes.length) { console.log('⚠ Contrôle qualité :'); for (const a of alertes) console.log('  - ' + a); }
  else console.log('  contrôle qualité : aucun débordement détecté.');
} finally {
  await navigateur.close();
}
