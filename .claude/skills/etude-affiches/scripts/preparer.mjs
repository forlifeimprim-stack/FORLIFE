#!/usr/bin/env node
// Prépare un lot d'affiches (ou de tout visuel) pour l'étude par l'équipe création.
//
//   node .claude/skills/etude-affiches/scripts/preparer.mjs [dossier] [--source <origine>] [--garder]
//
//   dossier        images à étudier (défaut : agence/inspiration/a-etudier/) — jpg, jpeg, png, webp
//   --source       origine du lot : "forlife" (nos réalisations), "client:<nom>" (fourni par un client),
//                  "externe" (autre agence, rue, internet…). Défaut : "forlife".
//   --garder       copier les images au lieu de les déplacer (automatique hors de a-etudier/)
//
// Pour chaque image : numéro ref-0001…, copie dans agence/inspiration/affiches/, dimensions, format probable,
// palette dominante (6 couleurs, k-moyennes), fiche pré-remplie dans agence/inspiration/fiches/, ligne dans index.csv.
// Puis une planche contact du lot (agence/inspiration/planches/) pour répartir le travail d'analyse.

import { createRequire } from 'node:module';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, appendFileSync, copyFileSync, rmSync } from 'node:fs';
import { join, resolve, extname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = resolve(fileURLToPath(import.meta.url), '..', '..', '..', '..', '..');
const INSP = join(RACINE, 'agence', 'inspiration');
let chromium;
try { ({ chromium } = createRequire(import.meta.url)('playwright')); }
catch { console.error('Playwright introuvable : npm install, puis npx playwright install chromium'); process.exit(1); }

const o = { _: [] };
for (let a = process.argv.slice(2), i = 0; i < a.length; i++) {
  if (a[i].startsWith('--')) { const k = a[i].slice(2), v = a[i + 1]; if (v === undefined || v.startsWith('--')) o[k] = true; else { o[k] = v; i++; } }
  else o._.push(a[i]);
}
const dossier = resolve(o._[0] || join(INSP, 'a-etudier'));
const source = o.source || 'forlife';
const deplacer = !o.garder && dossier === resolve(INSP, 'a-etudier');
for (const d of ['a-etudier', 'affiches', 'fiches', 'planches']) mkdirSync(join(INSP, d), { recursive: true });
if (!existsSync(dossier)) { console.error(`Dossier introuvable : ${dossier}`); process.exit(1); }

const images = readdirSync(dossier).filter(f => /\.(jpe?g|png|webp)$/i.test(f)).sort();
if (!images.length) { console.log(`Aucune image dans ${relative(RACINE, dossier) || dossier}.`); process.exit(0); }

const INDEX = join(INSP, 'index.csv');
const ENTETE = 'id,fichier,nom_origine,source,largeur,hauteur,format_probable,secteur,type_support,tags,note_sur_5,statut\n';
if (!existsSync(INDEX)) writeFileSync(INDEX, ENTETE);
const lignes = readFileSync(INDEX, 'utf8').trim().split('\n').slice(1);
const deja = new Set(lignes.map(l => l.split(',')[2]?.replace(/^"|"$/g, '') + '|' + l.split(',')[3]));
let n = lignes.reduce((m, l) => Math.max(m, +(l.match(/^ref-(\d+)/)?.[1] || 0)), 0);

const formatProbable = (l, h) => {
  const r = h / l;
  const c = [[1, 'carré 1:1'], [1.25, 'post 4:5'], [1.414, 'A (A4/A3/A2) portrait'], [1.778, 'story 9:16'], [0.707, 'A paysage'], [0.5625, '16:9 paysage'], [2.35, 'roll-up / kakémono'], [0.5, 'bâche / bannière']];
  const [, nom] = c.reduce((b, x) => Math.abs(Math.log(x[0] / r)) < Math.abs(Math.log(b[0] / r)) ? x : b);
  return nom;
};
const csv = v => /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v);
const mime = e => ({ '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' })[e.toLowerCase()];

const navigateur = await chromium.launch();
const page = await navigateur.newPage();
await page.setContent('<canvas id="c"></canvas>');
const nouveaux = [];
try {
  for (const f of images) {
    if (deja.has(f + '|' + source)) { console.log(`= déjà étudiée : ${f}`); continue; }
    const chemin = join(dossier, f), ext = extname(f).toLowerCase();
    const id = `ref-${String(++n).padStart(4, '0')}`;
    const dest = `${id}${ext === '.jpeg' ? '.jpg' : ext}`;
    const dataUrl = `data:${mime(ext)};base64,${readFileSync(chemin).toString('base64')}`;
    // Dimensions + palette (k-moyennes sur un échantillon de pixels)
    const { l, h, palette } = await page.evaluate(async src => {
      const img = new Image(); img.src = src; await img.decode();
      const c = document.getElementById('c'), s = Math.min(1, 220 / Math.max(img.width, img.height));
      c.width = Math.max(1, Math.round(img.width * s)); c.height = Math.max(1, Math.round(img.height * s));
      const x = c.getContext('2d'); x.drawImage(img, 0, 0, c.width, c.height);
      const d = x.getImageData(0, 0, c.width, c.height).data, px = [];
      for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 200) px.push([d[i], d[i + 1], d[i + 2]]);
      if (!px.length) return { l: img.width, h: img.height, palette: [] };
      const k = 6, dist = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
      const cent = [px[Math.floor(px.length / 2)]];
      while (cent.length < k) { let best = px[0], bd = -1; for (let i = 0; i < px.length; i += 7) { const dd = Math.min(...cent.map(cc => dist(px[i], cc))); if (dd > bd) { bd = dd; best = px[i]; } } cent.push(best); }
      let lab = new Array(px.length).fill(0);
      for (let it = 0; it < 12; it++) {
        lab = px.map(p => { let b = 0, bd = Infinity; cent.forEach((cc, j) => { const dd = dist(p, cc); if (dd < bd) { bd = dd; b = j; } }); return b; });
        const sum = cent.map(() => [0, 0, 0, 0]);
        px.forEach((p, i) => { const s2 = sum[lab[i]]; s2[0] += p[0]; s2[1] += p[1]; s2[2] += p[2]; s2[3]++; });
        sum.forEach((s2, j) => { if (s2[3]) cent[j] = [s2[0] / s2[3], s2[1] / s2[3], s2[2] / s2[3]]; });
      }
      const cnt = cent.map((_, j) => lab.filter(v => v === j).length);
      const hex = c3 => '#' + c3.map(v => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
      return { l: img.width, h: img.height, palette: cent.map((cc, j) => ({ hex: hex(cc), pct: Math.round(100 * cnt[j] / px.length) })).filter(p => p.pct >= 2).sort((a, b) => b.pct - a.pct) };
    }, dataUrl);
    copyFileSync(chemin, join(INSP, 'affiches', dest));
    if (deplacer) rmSync(chemin);
    const fmt = formatProbable(l, h);
    const pal = palette.map(p => `\`${p.hex}\` ${p.pct} %`).join(' · ');
    writeFileSync(join(INSP, 'fiches', `${id}.md`), `# ${id} — [titre court : support + sujet]

| | |
|---|---|
| Image | \`agence/inspiration/affiches/${dest}\` (non versionnée) |
| Nom d'origine | ${f} |
| Source | ${source} |
| Dimensions | ${l} × ${h} px — format probable : ${fmt} |
| Palette mesurée | ${pal || '—'} |
| Secteur | [école · église/religieux · commerce · restauration · beauté · santé · événement privé · entreprise · institution · sport · culture…] |
| Type de support | [affiche · flyer · post · story · roll-up · bâche · faire-part · tee-shirt DTF · menu · carte · logo…] |
| Statut | à analyser |

## 1. Message et cible
Ce que dit le visuel en une phrase · à qui il parle · l'action attendue · ce qu'on comprend en 3 secondes.

## 2. Composition
Grille / structure, point focal, parcours de l'œil (1 → 2 → 3), équilibre plein/vide, marges, alignements, profondeur.

## 3. Typographie
Familles (style : sans grasse, script, serif, display, lettrage…), graisses, tailles relatives, associations, effets
(contour, ombre, déformation, texte sur photo), lisibilité à distance.

## 4. Couleurs
Rôle de chaque couleur de la palette mesurée, contrastes, ambiance, cohérence avec le secteur.

## 5. Images et éléments graphiques
Photo (détourage, cadrage, traitement, personnes représentées), illustration, formes, motifs (pagne, wax…), textures,
icônes, encadrés et pastilles (ex. référence biblique en pastille).

## 6. Techniques créatives remarquables
Ce qui rend le visuel mémorable : idée, jeu de mots, contraste d'échelle, mise en scène, rupture, humour, symbole…

## 7. Informations pratiques
Date, lieu, contact, logo(s), partenaires, mentions : présence, lisibilité, hiérarchie.

## 8. Verdict
| Critère | /5 |
|---|---|
| Clarté du message (3 s) | |
| Impact / arrêt du regard | |
| Qualité d'exécution | |
| Adéquation cible et culture locale | |
| Originalité | |

Forces : · Faiblesses / à éviter :

## 9. Idées transposables (s'inspirer, ne jamais copier)
3 principes réutilisables sur d'autres projets, formulés de façon générale
(« titre en script XXL qui chevauche un mot en capitales grasses » plutôt que « refaire cette affiche »).

## Tags
[mots-clés pour retrouver la fiche : secteur, technique, style, couleur dominante…]
`);
    appendFileSync(INDEX, [id, dest, f, source, l, h, fmt, '', '', '', '', 'a-analyser'].map(csv).join(',') + '\n');
    nouveaux.push({ id, dest });
    console.log(`+ ${id}  ${f}  (${l}×${h}, ${fmt})`);
  }

  // Planche contact du lot, avec les numéros
  if (nouveaux.length) {
    const html = `<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#1a1a1a;font:600 15px sans-serif;color:#fff;display:grid;grid-template-columns:repeat(${Math.min(6, nouveaux.length)},220px);gap:10px;padding:10px;width:max-content}
      figure{margin:0;background:#2a2a2a;padding:6px}img{width:208px;height:260px;object-fit:contain;display:block}figcaption{margin-top:4px}</style>
      ${nouveaux.map(x => `<figure><img src="data:${mime(extname(x.dest))};base64,${readFileSync(join(INSP, 'affiches', x.dest)).toString('base64')}"><figcaption>${x.id}</figcaption></figure>`).join('')}`;
    const p2 = await navigateur.newPage({ viewport: { width: 1400, height: 800 } });
    await p2.setContent(html, { waitUntil: 'load' });
    const nom = join(INSP, 'planches', `lot-${new Date().toISOString().slice(0, 10)}-${nouveaux[0].id}.jpg`);
    await p2.screenshot({ path: nom, fullPage: true, type: 'jpeg', quality: 80 });
    console.log(`\n${nouveaux.length} visuel(s) prêt(s) à analyser. Planche : ${relative(RACINE, nom)}`);
    console.log(`Fiches : agence/inspiration/fiches/${nouveaux[0].id}.md → ${nouveaux.at(-1).id}.md`);
  }
} finally {
  await navigateur.close();
}

