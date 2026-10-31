// Assemble un tome complet : couverture, liminaires, sommaire, test, modules, projet final, annexes, attestation.
// Chaque tome fournit sa configuration (voir tomeN/livre.js).
const fs = require('fs');
const path = require('path');
const L = require('./livre');
const { construireModule, rendre } = require('./module');
const { C, p, vide, saut, titre1, titre2, tableau } = L;
const { Paragraph, TextRun, PositionalTab, PositionalTabAlignment, PositionalTabRelativeTo, PositionalTabLeader } = L.docx;

function assembler(cfg) {
  const pagesConnues = process.argv[2] && fs.existsSync(process.argv[2]) ? JSON.parse(fs.readFileSync(process.argv[2])) : {};
  const fichiers = fs.readdirSync(cfg.dossier).filter((f) => /^module\d\d_.*\.js$/.test(f)).sort();
  const modules = fichiers.map((f) => construireModule(require(path.join(cfg.dossier, f))));
  const { liminaires, projet } = cfg;

  const entrees = [
    ['Préface : ' + cfg.titrePreface, 'preface'],
    ['Comment utiliser ce livre', 'mode'],
    ['Test de positionnement', 'test'],
    ...modules.map((m) => [`Module ${m.num}  ·  ${m.titre}`, `m${m.num}`]),
    ['Projet final  ·  ' + projet.titre, 'projet'],
    ['Annexe A  ·  Corrigés', 'annexeA'],
    ['Annexe B  ·  Glossaire', 'annexeB'],
    ['Annexe C  ·  ' + cfg.annexeC.titre, 'annexeC'],
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
  const sommaire = [titre1('Sommaire'), ...entrees.map(([l, c]) => ligneSommaire(l, c))];

  const annexeA = [titre1('Annexe A · Corrigés'),
    p('Ne regardez les corrigés qu\'**après** avoir fait l\'exercice. Se tromper fait partie de l\'apprentissage : c\'est en comparant votre réponse à la bonne que vous progressez.')];
  for (const m of [...modules, { num: '★', titre: projet.titre, corriges: projet.corriges }]) {
    if (!m.corriges.length) continue;
    annexeA.push(titre2(m.num === '★' ? `Projet final · ${m.titre}` : `Module ${m.num} · ${m.titre}`));
    annexeA.push(tableau(['Exercice', 'Corrigé'], m.corriges.map(([a, b]) => [`**${a}**`, b]), [1, 4], C.vert), vide(120));
  }

  const glossaire = new Map();
  for (const m of modules) for (const [mot, def] of m.glossaire) if (!glossaire.has(mot)) glossaire.set(mot, [def, m.num]);
  const tries = [...glossaire.entries()].sort((a, b) => a[0].localeCompare(b[0], 'fr', { sensitivity: 'base' }));
  const annexeB = [titre1('Annexe B · Glossaire'),
    p('Tous les mots techniques du livre, expliqués simplement. Le numéro indique le module où le mot est présenté.'),
    tableau(['Mot', 'En mots simples', 'Module'], tries.map(([mot, [def, n]]) => [`**${mot}**`, def, String(n)]), [1.3, 3.4, 0.6], C.orange)];

  const annexeC = [titre1('Annexe C · ' + cfg.annexeC.titre), ...rendre(cfg.annexeC.contenu)];
  const annexeD = [titre1('Annexe D · Pour aller plus loin'), ...rendre(cfg.annexeD)];

  const enTeteModule = (m) => `FOR LIFE · Tome ${cfg.num} · Module ${m.num} — ${m.titre}`;
  const sections = [
    { couverture: cfg.couverture },
    { sansEnTetePremierePage: true, contenu: [...rendre(liminaires.pageDeTitre), saut(), ...rendre(liminaires.mentions)] },
    { contenu: rendre(liminaires.preface) },
    { contenu: sommaire },
    { contenu: rendre(liminaires.modeEmploi) },
    { contenu: rendre(liminaires.test) },
    ...modules.map((m) => ({ enTete: enTeteModule(m), contenu: m.contenu })),
    { enTete: `FOR LIFE · Tome ${cfg.num} · Projet final — ${projet.titre}`, contenu: rendre(projet.contenu) },
    { contenu: annexeA }, { contenu: annexeB }, { contenu: annexeC }, { contenu: annexeD },
    { sansEnTetePremierePage: true, contenu: rendre(liminaires.attestation) },
  ];
  const doc = L.documentLivre({ enTete: cfg.enTete, sections });
  return L.ecrire(doc, cfg.sortie);
}

module.exports = { assembler };
