#!/usr/bin/env node
// FORLIFE Motion Studio — transforme une animation HTML/CSS (ou GSAP) en vidéo MP4 image par image,
// sans After Effects. Rendu déterministe : chaque image est calculée au temps exact, aucune saccade.
//
//   node animer.mjs <anim.html> <sortie.mp4> [options]
//
// Options
//   --format story|post|carre|paysage   1080×1920 (défaut) · 1080×1350 · 1080×1080 · 1920×1080
//   --taille LxH                        taille libre en pixels
//   --duree <s>                         durée ; sinon <meta name="duree" content="15"> dans la page ; sinon 10 s
//   --fps <n>                           images par seconde (défaut 30)
//   --musique <fichier>                 fond musical (baissé sous la voix, fondu de sortie)
//   --voix <fichier>                    voix off (ex. sortie de voixoff/forlife_voixoff.sh)
//   --voix-debut <s>                    décalage de la voix (défaut 0.5 s)
//   --lufs <n>                          niveau final (défaut -14, standard réseaux sociaux)
//   --apercu <s>                        exporte seulement une image PNG au temps donné (contrôle rapide)
//   --planche                           exporte aussi une planche contact (1 image par seconde) à côté du MP4
//
// Comment écrire l'animation (3 méthodes, combinables) :
//   1. CSS @keyframes / transitions : pilotées automatiquement (Web Animations API), utiliser animation-delay
//      pour enchaîner les scènes. Ne pas utiliser "infinite" sans le vouloir.
//   2. GSAP : si window.gsap existe, sa timeline globale est placée au temps exact.
//   3. window.rendu = (t) => { ... }  : fonction appelée à chaque image avec t en secondes (canvas, compteurs…).
// La police Poppins est injectée automatiquement (comme visuel-studio).

import { createRequire } from 'node:module';
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';

const ICI = dirname(fileURLToPath(import.meta.url));
const POLICES = resolve(ICI, '..', '..', 'visuel-studio', 'polices');
let chromium;
try { ({ chromium } = createRequire(import.meta.url)('playwright')); }
catch { console.error('Playwright introuvable. Installer : npm i -D playwright && npx playwright install chromium'); process.exit(1); }

const FORMATS = { story: [1080, 1920], post: [1080, 1350], carre: [1080, 1080], paysage: [1920, 1080] };

const o = { _: [] };
for (let a = process.argv.slice(2), i = 0; i < a.length; i++) {
  if (a[i].startsWith('--')) { const k = a[i].slice(2), v = a[i + 1]; if (v === undefined || v.startsWith('--')) o[k] = true; else { o[k] = v; i++; } }
  else o._.push(a[i]);
}
const [entree, sortie] = o._;
if (!entree || !sortie) { console.error('Usage : node animer.mjs <anim.html> <sortie.mp4> [--format story] [--duree 15] [--musique m.mp3] [--voix v.mp3]'); process.exit(1); }
if (!existsSync(entree)) { console.error(`Fichier introuvable : ${entree}`); process.exit(1); }
if (spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' }).status !== 0) { console.error('ffmpeg introuvable : l\'installer (apt install ffmpeg / brew install ffmpeg).'); process.exit(1); }
for (const k of ['musique', 'voix']) if (o[k] && !existsSync(o[k])) { console.error(`--${k} : fichier introuvable ${o[k]}`); process.exit(1); }

let [L, H] = FORMATS[o.format || 'story'] || [];
if (o.taille) [L, H] = String(o.taille).split('x').map(Number);
if (!L || !H) { console.error('Format inconnu (story, post, carre, paysage) ou --taille LxH'); process.exit(1); }
const fps = +(o.fps ?? 30);

const css = [400, 500, 600, 700, 800, 900].map(w =>
  `@font-face{font-family:'Poppins';font-weight:${w};font-display:block;src:url(${pathToFileURL(join(POLICES, `poppins-latin-${w}-normal.woff2`))}) format('woff2')}
@font-face{font-family:'Poppins';font-weight:${w};font-display:block;src:url(${pathToFileURL(join(POLICES, `poppins-latin-ext-${w}-normal.woff2`))}) format('woff2');unicode-range:U+0100-02BA,U+1E00-1EFF,U+20A0-20C0}`).join('\n')
  + `\nhtml,body{margin:0;padding:0;width:${L}px;height:${H}px;overflow:hidden}`;

const navigateur = await chromium.launch();
const page = await navigateur.newPage({ viewport: { width: L, height: H }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(resolve(entree)).href, { waitUntil: 'networkidle' });
await page.addStyleTag({ content: css });
await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))); });

const duree = +(o.duree ?? await page.evaluate(() => document.querySelector('meta[name=duree]')?.content) ?? 10);
const total = Math.round(duree * fps);

// Place la page au temps t (secondes)
const placer = t => page.evaluate(t => {
  for (const a of document.getAnimations()) { a.pause(); a.currentTime = t * 1000; }
  if (window.gsap) { window.gsap.globalTimeline.pause(); window.gsap.globalTimeline.time(t, false); }
  if (typeof window.rendu === 'function') window.rendu(t);
}, t);

if (o.apercu !== undefined) {
  const t = +o.apercu;
  await placer(t);
  const png = sortie.replace(/\.[^.]+$/, '') + `-t${t}.png`;
  await page.screenshot({ path: png });
  console.log(`✔ aperçu ${png}`);
  await navigateur.close();
  process.exit(0);
}

mkdirSync(dirname(resolve(sortie)), { recursive: true });
const tmp = join(tmpdir(), `motion-${process.pid}`);
mkdirSync(tmp, { recursive: true });
const muet = join(tmp, 'muet.mp4');

// 1) Images -> vidéo muette (H.264, yuv420p, compatible WhatsApp/Instagram/TikTok)
const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(fps), '-movflags', '+faststart', muet], { stdio: ['pipe', 'inherit', 'inherit'] });
const fin = new Promise((ok, ko) => ff.on('close', c => c === 0 ? ok() : ko(new Error('ffmpeg a échoué (' + c + ')'))));
const t0 = Date.now();
for (let i = 0; i < total; i++) {
  await placer(i / fps);
  const img = await page.screenshot({ type: 'jpeg', quality: 95 });
  if (!ff.stdin.write(img)) await new Promise(r => ff.stdin.once('drain', r));
  if (i % fps === 0) process.stdout.write(`\r  rendu ${Math.round(i / fps)}/${Math.round(duree)} s`);
}
ff.stdin.end();
await fin;
process.stdout.write(`\r  rendu ${duree}/${duree} s — ${total} images en ${((Date.now() - t0) / 1000).toFixed(0)} s\n`);

// Planche contact optionnelle
if (o.planche) {
  const planche = sortie.replace(/\.[^.]+$/, '') + '-planche.jpg';
  const cols = Math.min(Math.ceil(duree), 6);
  spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', muet, '-vf', `fps=1,scale=270:-1,tile=${cols}x${Math.ceil(Math.ceil(duree) / cols)}`, '-frames:v', '1', planche]);
  console.log(`  planche contact : ${planche}`);
}
await navigateur.close();

// 2) Son : musique sous la voix, fondu de sortie, normalisation
const lufs = +(o.lufs ?? -14);
const args = ['-y', '-loglevel', 'error'];
let filtre = null;
const d = +(o['voix-debut'] ?? 0.5);
const fondu = `afade=t=out:st=${Math.max(duree - 1.5, 0)}:d=1.5`;
if (o.musique && o.voix) {
  args.push('-stream_loop', '-1', '-i', o.musique, '-i', o.voix);
  filtre = `[0:a]atrim=0:${duree},volume=0.18,afade=t=in:d=0.5,${fondu}[m];` +
    `[1:a]adelay=${Math.round(d * 1000)}:all=1,apad[v];[m][v]amix=inputs=2:duration=first:normalize=0[a]`;
} else if (o.musique) {
  args.push('-stream_loop', '-1', '-i', o.musique);
  filtre = `[0:a]atrim=0:${duree},afade=t=in:d=0.3,${fondu}[a]`;
} else if (o.voix) {
  args.push('-i', o.voix);
  filtre = `[0:a]adelay=${Math.round(d * 1000)}:all=1,apad,atrim=0:${duree}[a]`;
}
if (filtre) {
  // a) mixage brut, b) mesure, c) normalisation linéaire en deux passes (niveau exact, dynamique préservée)
  const mix = join(tmp, 'mix.wav');
  let r = spawnSync('ffmpeg', [...args, '-filter_complex', filtre, '-map', '[a]', '-t', String(duree), '-ar', '48000', '-ac', '2', mix], { stdio: 'inherit' });
  if (r.status !== 0) { console.error('Mixage audio échoué'); process.exit(1); }
  const mesure = spawnSync('ffmpeg', ['-hide_banner', '-i', mix, '-af', `loudnorm=I=${lufs}:TP=-1.5:LRA=11:print_format=json`, '-f', 'null', '-'], { encoding: 'utf8' });
  const m = JSON.parse((mesure.stderr.match(/\{[\s\S]*?\}/g) || ['{}']).pop());
  const ln = m.input_i
    ? `loudnorm=I=${lufs}:TP=-1.5:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`
    : `loudnorm=I=${lufs}:TP=-1.5:LRA=11`;
  r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', muet, '-i', mix, '-filter_complex', `[1:a]${ln},aresample=48000[a]`,
    '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-t', String(duree), '-movflags', '+faststart', sortie], { stdio: 'inherit' });
  if (r.status !== 0) { console.error('Normalisation audio échouée'); process.exit(1); }
} else {
  spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', muet, '-c', 'copy', sortie]);
}
rmSync(tmp, { recursive: true, force: true });
console.log(`✔ ${sortie} — ${L}×${H}, ${fps} i/s, ${duree} s${filtre ? `, son normalisé à ${lufs} LUFS` : ', sans son'}`);
if (o.voix && !o.musique) console.log('  conseil : ajouter --musique (libre de droits) pour un rendu plus vivant.');

