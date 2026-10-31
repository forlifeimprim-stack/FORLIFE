// Assemble le Tome 1 complet : couverture, pages liminaires, test, modules, projet final, annexes.
// Usage : node tome1/livre.js [pages.json]   (pages.json : numéros de page du sommaire, issus d'une première passe)
const fs = require('fs');
const path = require('path');
const L = require('../outils/livre');
const { construireModule, rendre } = require('../outils/module');
const { C, p, vide, saut, titre1, titre2, tableau, encadre, puces } = L;
const { Paragraph, TextRun, AlignmentType, PositionalTab, PositionalTabAlignment, PositionalTabRelativeTo, PositionalTabLeader } = L.docx;

const ICI = __dirname;
const TITRE = 'Apprivoiser l\'ordinateur';
const ENTETE = 'FOR LIFE · Tome 1 — Apprivoiser l\'ordinateur';
const pagesConnues = process.argv[2] && fs.existsSync(process.argv[2]) ? JSON.parse(fs.readFileSync(process.argv[2])) : {};

const fichiers = fs.readdirSync(ICI).filter((f) => /^module\d\d_.*\.js$/.test(f)).sort();
const modules = fichiers.map((f) => construireModule(require(path.join(ICI, f))));
const projet = require('./projet_final');
const liminaires = require('./liminaires');

// ---------- Sommaire (numéros de page issus de la passe précédente) ----------
const entreesSommaire = [
  ['Préface : le nouvel alphabet', 'preface'],
  ['Comment utiliser ce livre', 'mode'],
  ['Test de positionnement', 'test'],
  ...modules.map((m) => [`Module ${m.num}  ·  ${m.titre}`, `m${m.num}`]),
  ['Projet final  ·  ' + projet.titre, 'projet'],
  ['Annexe A  ·  Corrigés', 'annexeA'],
  ['Annexe B  ·  Glossaire', 'annexeB'],
  ['Annexe C  ·  Les raccourcis clavier essentiels', 'annexeC'],
  ['Annexe D  ·  Pour aller plus loin', 'annexeD'],
];
const ligneSommaire = (libelle, cle) => new Paragraph({
  spacing: { after: 110 },
  children: [
    new TextRun({ text: libelle, bold: libelle.startsWith('Module') || libelle.startsWith('Projet'), size: 23 }),
    new TextRun({ children: [new PositionalTab({ alignment: PositionalTabAlignment.RIGHT, relativeTo: PositionalTabRelativeTo.MARGIN, leader: PositionalTabLeader.DOT })] }),
    new TextRun({ text: String(pagesConnues[cle] || '00'), color: C.orange, bold: true }),
  ],
});
// Marqueur invisible pour retrouver la page de chaque partie dans le PDF.
// Les numéros de page sont retrouvés dans le PDF grâce aux titres (voir outils/construire.sh) : aucun repère n'est nécessaire.
const repere = () => null;

const sommaire = [
  titre1('Sommaire'),
  ...entreesSommaire.map(([l, c]) => ligneSommaire(l, c)),
];

// ---------- Annexes ----------
const annexeA = [titre1('Annexe A · Corrigés'),
  p('Ne regardez les corrigés qu\'**après** avoir fait l\'exercice. Se tromper fait partie de l\'apprentissage : c\'est en comparant votre réponse à la bonne que vous progressez.'),
];
for (const m of [...modules, { num: '★', titre: projet.titre, corriges: projet.corriges }]) {
  if (!m.corriges.length) continue;
  annexeA.push(titre2(m.num === '★' ? `Projet final · ${m.titre}` : `Module ${m.num} · ${m.titre}`));
  annexeA.push(tableau(['Exercice', 'Corrigé'], m.corriges.map(([a, b]) => [`**${a}**`, b]), [1, 4], C.vert), vide(120));
}

const glossaire = new Map();
for (const m of modules) for (const [mot, def] of m.glossaire) if (!glossaire.has(mot)) glossaire.set(mot, [def, m.num]);
const motsTries = [...glossaire.entries()].sort((a, b) => a[0].localeCompare(b[0], 'fr', { sensitivity: 'base' }));
const annexeB = [titre1('Annexe B · Glossaire'),
  p('Tous les mots techniques du livre, expliqués simplement. Le numéro indique le module où le mot est présenté.'),
  tableau(['Mot', 'En mots simples', 'Module'], motsTries.map(([mot, [def, n]]) => [`**${mot}**`, def, String(n)]), [1.3, 3.4, 0.6], C.orange),
];

const annexeC = [titre1('Annexe C · Les raccourcis clavier essentiels'),
  p('Un raccourci, c\'est un chemin plus court : au lieu d\'aller chercher une commande avec la souris, on appuie sur deux touches **en même temps**. On tient la première (Ctrl, Alt ou Windows), puis on appuie brièvement sur la seconde. Découpez ou photographiez cette page et gardez-la près de votre ordinateur.'),
  titre2('Les dix raccourcis à connaître par cœur'),
  tableau(['Raccourci', 'Ce qu\'il fait', 'Pour s\'en souvenir'], [
    ['**Ctrl + C**', 'Copier', 'C comme Copier'],
    ['**Ctrl + X**', 'Couper', 'Les ciseaux : le X ressemble à des ciseaux ouverts'],
    ['**Ctrl + V**', 'Coller', 'La lettre juste à côté du C'],
    ['**Ctrl + Z**', 'Annuler la dernière action', 'La gomme magique'],
    ['**Ctrl + Y**', 'Rétablir ce qu\'on vient d\'annuler', 'Le contraire de Z'],
    ['**Ctrl + S**', 'Enregistrer', 'S comme Sauvegarder'],
    ['**Ctrl + P**', 'Imprimer', 'P comme Papier'],
    ['**Ctrl + A**', 'Tout sélectionner', 'A comme « All », « tout » en anglais'],
    ['**Ctrl + F**', 'Rechercher un mot dans la page', 'F comme « Find », trouver'],
    ['**Alt + Tab**', 'Passer d\'une fenêtre à l\'autre', 'Tab comme « tableau des fenêtres »'],
  ], [1, 1.6, 2], C.orange),
  vide(),
  titre2('Windows'),
  tableau(['Raccourci', 'Ce qu\'il fait'], [
    ['**Touche Windows**', 'Ouvrir ou fermer le menu Démarrer'],
    ['**Windows + E**', 'Ouvrir l\'Explorateur de fichiers'],
    ['**Windows + D**', 'Afficher le Bureau (et revenir)'],
    ['**Windows + L**', 'Verrouiller l\'ordinateur quand on s\'absente'],
    ['**Windows + Maj + S**', 'Faire une capture d\'une partie de l\'écran'],
    ['**Alt + F4**', 'Fermer la fenêtre active'],
    ['**F2**', 'Renommer le fichier ou le dossier sélectionné'],
    ['**Ctrl + Alt + Suppr**', 'Ouvrir l\'écran de secours (Gestionnaire des tâches, verrouiller, éteindre)'],
    ['**Ctrl + molette**', 'Agrandir ou réduire l\'affichage'],
  ], [1.4, 3.6], C.vert),
  vide(),
  titre2('Word (version française)'),
  tableau(['Raccourci', 'Ce qu\'il fait'], [
    ['**Ctrl + G**', 'Mettre en **gras**'], ['**Ctrl + I**', 'Mettre en *italique*'], ['**Ctrl + U**', 'Souligner'],
    ['**Ctrl + N**', 'Nouveau document'], ['**Ctrl + O**', 'Ouvrir un document'],
    ['**Maj + F3**', 'Passer un mot sélectionné en majuscules ou en minuscules'],
  ], [1.4, 3.6], C.bleu),
];

const annexeD = [titre1('Annexe D · Pour aller plus loin'),
  titre2('Les références de ce livre'),
  ...puces([
    '**DigComp 2.2**, le cadre européen des compétences numériques du citoyen (Commission européenne, 2022) : les cinq savoir-faire présentés au module 0.',
    '**UNESCO**, *A Global Framework of Reference on Digital Literacy Skills* (Institut de statistique de l\'UNESCO, 2018) : la définition internationale de la littératie numérique.',
    '**Malcolm Knowles**, *The Adult Learner* : les principes de l\'apprentissage des adultes qui inspirent la méthode « Situation, Déclic, Pratique ».',
    '**Dedre Gentner** et ses collègues, sur le rôle des analogies dans l\'apprentissage (2003) : le fondement de l\'étape « Le déclic ».',
    '**Richard E. Mayer**, *Multimedia Learning* : pourquoi un texte accompagné d\'images bien choisies s\'apprend mieux.',
    '**DataReportal**, *Digital 2026 : Côte d\'Ivoire* : les chiffres de l\'usage d\'Internet dans le pays.',
  ]),
  titre2('Les adresses utiles en Côte d\'Ivoire'),
  ...puces([
    '**servicepublic.gouv.ci** : le portail officiel des démarches administratives. Assistance gratuite du Centre d\'information et de communication gouvernementale au **101**.',
    '**ARTCI** (Autorité de régulation des télécommunications de Côte d\'Ivoire) : autorité de protection des données personnelles (loi n° 2013-450).',
    '**PLCC** (Plateforme de lutte contre la cybercriminalité) : pour signaler une arnaque en ligne. N\'utilisez que les contacts publiés sur les sites officiels du gouvernement : de fausses pages « PLCC » circulent sur les réseaux sociaux.',
  ]),
  titre2('Et après ce livre ?'),
  p('Vous avez appris à vous servir de l\'ordinateur. Le **Tome 2**, *Maîtriser l\'outil*, vous apprendra à en faire un véritable outil de travail : documents professionnels, Excel pour gérer une activité, présentations, travail en équipe en ligne, sécurité et intelligence artificielle. Le **Tome 3**, *Créer avec l\'IA*, vous apprendra à créer vos propres applications.'),
];

// ---------- Assemblage ----------
const enTeteModule = (m) => `FOR LIFE · Tome 1 · Module ${m.num} — ${m.titre}`;
const sansNul = (t) => t.filter(Boolean);
const sections = [
  { couverture: path.join(ICI, '..', 'couvertures', 'Couverture_Tome1.png') },
  { sansEnTetePremierePage: true, contenu: [...liminaires.pageDeTitre, saut(), ...liminaires.mentions] },
  { contenu: rendre(liminaires.preface) },
  { contenu: sommaire },
  { contenu: rendre(liminaires.modeEmploi) },
  { contenu: rendre(liminaires.test) },
  ...modules.map((m) => ({ enTete: enTeteModule(m), contenu: m.contenu })),
  { enTete: `FOR LIFE · Tome 1 · Projet final — ${projet.titre}`, contenu: rendre(projet.contenu) },
  { contenu: annexeA }, { contenu: annexeB }, { contenu: annexeC }, { contenu: annexeD },
  { sansEnTetePremierePage: true, contenu: rendre(liminaires.attestation) },
];

const doc = L.documentLivre({ enTete: ENTETE, sections });
L.ecrire(doc, path.join(ICI, '..', 'livrables', 'FOR_LIFE_Tome1_Apprivoiser_l_ordinateur.docx'));
