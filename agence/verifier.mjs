#!/usr/bin/env node
// Vérifie que l'agence d'agents Forlife est complète et prête sur cette machine.
//   node agence/verifier.mjs          (ou : npm run verifier)
// N'installe rien et n'exécute aucun code tiers : il regarde, teste, et dit quoi faire.

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { platform } from 'node:os';

const RACINE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OS = platform(); // win32 | darwin | linux
const res = { ok: 0, attention: 0, manque: 0 };
const afaire = [];
const ligne = (etat, texte, conseil) => {
  const icone = { ok: '✅', attention: '⚠️ ', manque: '❌' }[etat];
  res[etat]++;
  console.log(`${icone} ${texte}`);
  if (conseil && etat !== 'ok') afaire.push(conseil);
};
const cmd = (c, a = ['--version']) => { const r = spawnSync(c, a, { encoding: 'utf8', shell: OS === 'win32' }); return r.status === 0 ? (r.stdout || r.stderr).trim().split('\n')[0] : null; };
const installe = { win32: 'winget install', darwin: 'brew install', linux: 'sudo apt install' }[OS] || 'installer';
const p = (...x) => join(RACINE, ...x);

console.log(`\nAgence Forlife — vérification (${OS})\n`);

// 1. Outils de base
console.log('— Outils de base');
const nodeMaj = +process.versions.node.split('.')[0];
ligne(nodeMaj >= 20 ? 'ok' : 'manque', `Node.js ${process.versions.node}`, `Node.js 20 ou plus : ${OS === 'win32' ? 'winget install OpenJS.NodeJS.LTS' : OS === 'darwin' ? 'brew install node' : 'https://nodejs.org'}`);
const git = cmd('git');
ligne(git ? 'ok' : 'manque', git || 'Git introuvable', `Git : ${OS === 'win32' ? 'winget install Git.Git' : `${installe} git`}`);
const ff = cmd('ffmpeg', ['-version']), fp = cmd('ffprobe', ['-version']);
ligne(ff && fp ? 'ok' : 'manque', ff ? `ffmpeg ${ff.split(' ')[2]}` : 'ffmpeg / ffprobe introuvables (vidéo, son)', `ffmpeg : ${OS === 'win32' ? 'winget install Gyan.FFmpeg' : `${installe} ffmpeg`} (puis rouvrir le terminal)`);
const claude = cmd('claude');
ligne(claude ? 'ok' : 'attention', claude ? `Claude Code ${claude}` : 'Claude Code (CLI) non trouvé dans le terminal — normal si vous utilisez l\'application de bureau', 'Facultatif : Claude Code en ligne de commande, https://code.claude.com');

// 2. Moteurs maison
console.log('\n— Moteurs de production (visuel-studio, motion-studio)');
let pw = null;
try { pw = createRequire(p('.claude', 'skills', 'visuel-studio', 'scripts', 'x.mjs'))('playwright'); } catch { /* absent */ }
ligne(pw ? 'ok' : 'manque', pw ? 'Playwright installé' : 'Playwright absent', 'Dans le dossier du dépôt : npm install');
if (pw) {
  try {
    const b = await pw.chromium.launch(); await b.close();
    ligne('ok', 'Navigateur Chromium de rendu opérationnel');
  } catch {
    ligne('manque', 'Chromium pour Playwright non installé', 'npx playwright install chromium');
  }
}
const polices = existsSync(p('.claude/skills/visuel-studio/polices')) ? readdirSync(p('.claude/skills/visuel-studio/polices')).filter(f => f.endsWith('.woff2')).length : 0;
ligne(polices >= 12 ? 'ok' : 'manque', `Police Poppins (${polices} fichiers)`, 'Récupérer à nouveau le dépôt (git pull) : polices manquantes');
for (const s of ['visuel-studio/scripts/rendre.mjs', 'motion-studio/scripts/animer.mjs'])
  ligne(existsSync(p('.claude/skills', s)) ? 'ok' : 'manque', s, 'git pull');

// 3. Agents et skills
console.log('\n— Agents et skills');
const agents = existsSync(p('.claude/agents')) ? readdirSync(p('.claude/agents')).filter(f => f.endsWith('.md')) : [];
const invalides = agents.filter(f => {
  const t = readFileSync(p('.claude/agents', f), 'utf8');
  const fm = t.match(/^---\r?\n([\s\S]*?)\r?\n---/); const n = fm && fm[1].match(/^name:\s*(.+?)\s*$/m);
  return !n || !/^description:/m.test(fm[1]) || n[1] + '.md' !== f;
});
ligne(agents.length === 22 && !invalides.length ? 'ok' : 'manque', `${agents.length} agents dans .claude/agents/${invalides.length ? ` (${invalides.length} mal formés : ${invalides.join(', ')})` : ''}`,
  'Récupérer la branche de l\'agence (git pull) ; les agents doivent être sur la branche ouverte dans Claude Code');
const skills = existsSync(p('.claude/skills')) ? readdirSync(p('.claude/skills')).filter(d => existsSync(p('.claude/skills', d, 'SKILL.md'))) : [];
const maison = ['agence-forlife', 'brief-creatif', 'contexte-ivoirien', 'bibliotheque-agence', 'visuel-studio', 'motion-studio', 'etude-affiches'];
const manquants = maison.filter(s => !skills.includes(s));
ligne(!manquants.length ? 'ok' : 'manque', `${skills.length} skills (dont les 7 maison${manquants.length ? ` — manque : ${manquants.join(', ')}` : ''})`, 'git pull');
let guides = 0;
for (const d of ['marketing-fr', 'reseaux-sociaux', 'motion-video', 'design-graphique'])
  if (existsSync(p('agence/bibliotheque', d))) guides += readdirSync(p('agence/bibliotheque', d)).filter(x => existsSync(p('agence/bibliotheque', d, x, 'SKILL.md'))).length;
ligne(guides >= 85 ? 'ok' : 'manque', `${guides} guides dans agence/bibliotheque/`, 'bash agence/mettre-a-jour-bibliotheque.sh');
const branche = cmd('git', ['-C', RACINE, 'branch', '--show-current']);
if (branche) ligne(branche === 'main' || branche === 'master' ? 'ok' : 'attention', `Branche git : ${branche}`, `Fusionner la branche « ${branche} » dans main (pull request) pour avoir l'agence par défaut sur tous vos postes`);

// 4. Informations de l'agence
console.log('\n— Informations à fournir par l\'agence');
ligne(existsSync(p('agence/contexte/tarifs.md')) ? 'ok' : 'attention', existsSync(p('agence/contexte/tarifs.md')) ? 'Grille tarifaire (privée) présente' : 'Pas de grille tarifaire : les agents écriront « [à chiffrer] »',
  'Copier agence/contexte/tarifs.exemple.md en agence/contexte/tarifs.md et remplir les prix');
const materiel = existsSync(p('agence/contexte/materiel.md')) ? readFileSync(p('agence/contexte/materiel.md'), 'utf8') : '';
const vides = (materiel.match(/^\| [^|]+ \| +\| +\|$/gm) || []).length;
ligne(vides ? 'attention' : 'ok', vides ? `Matériel : ${vides} lignes à compléter dans agence/contexte/materiel.md` : 'Liste du matériel complétée', 'Compléter agence/contexte/materiel.md (optiques, lumières, micros, logiciels)');
const marque = existsSync(p('agence/contexte/brand-profile.md')) ? readFileSync(p('agence/contexte/brand-profile.md'), 'utf8') : '';
ligne(/Équipe humaine \| à compléter/.test(marque) ? 'attention' : 'ok', /Équipe humaine \| à compléter/.test(marque) ? 'Équipe humaine non renseignée dans le profil de marque' : 'Profil de marque complet',
  'Compléter « Équipe humaine » dans agence/contexte/brand-profile.md (qui valide quoi)');

// 5. Compléments
console.log('\n— Compléments (facultatifs)');
const moteur = p('.claude/skills/short-editing/engine');
const moteurPret = existsSync(join(moteur, 'node_modules')) && existsSync(join(moteur, 'node_modules', 'playwright-core'));
ligne(moteurPret ? 'ok' : 'attention', moteurPret ? 'Moteur de montage short-editing préparé' : 'Moteur de montage short-editing pas encore préparé (montage de prises face caméra)',
  OS === 'win32' ? 'Montage : node .claude/skills/short-editing/engine/setup.mjs (≈ 15 min, 0,5 Go), puis /studio-setup dans Claude Code' : 'Montage : bash agence/installer-extras.sh montage, puis /studio-setup dans Claude Code');
const py = cmd(OS === 'win32' ? 'python' : 'python3');
if (OS === 'linux') {
  ligne(py ? 'ok' : 'attention', py ? `${py} (voix off FOR LIFE possible)` : 'Python 3 absent (voix off FOR LIFE)', 'sudo apt install python3 python3-venv');
  const voix = process.env.FORLIFE_VOIX && existsSync(process.env.FORLIFE_VOIX);
  ligne(voix ? 'ok' : 'attention', voix ? 'Enregistrement de référence de la voix trouvé' : 'FORLIFE_VOIX non défini (enregistrement de la voix, gardé hors du dépôt public)', 'Définir FORLIFE_VOIX=/chemin/voix.m4a avant une voix off');
} else {
  ligne('attention', `Voix off FOR LIFE : fonctionne sous Linux uniquement (${OS === 'win32' ? 'sous Windows, utiliser WSL ou une session Claude Code dans le cloud' : 'sur Mac, utiliser une session Claude Code dans le cloud'})`,
    OS === 'win32' ? 'Voix off : installer WSL (wsl --install) et lancer voixoff/forlife_voixoff.sh dedans, ou faire les voix off depuis claude.ai/code' : 'Voix off : la produire depuis une session claude.ai/code (cloud, Linux)');
}

// Bilan
console.log(`\nBilan : ${res.ok} OK · ${res.attention} à compléter · ${res.manque} manquant(s)`);
if (afaire.length) { console.log('\nÀ faire :'); [...new Set(afaire)].forEach((a, i) => console.log(`  ${i + 1}. ${a}`)); }
else console.log('Tout est prêt. Bon travail à l\'agence !');
console.log('');
process.exit(res.manque ? 1 : 0);

