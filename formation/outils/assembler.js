// Assemble un tome en deux éditions : « apprenant » (le manuel de l'apprenant) et « formateur » (le manuel du formateur).
// Usage (via outils/construire.sh) : node tomeN/livre.js <pages.json> <apprenant|formateur> <sortie.docx>
// Le .docx n'est qu'un intermédiaire : seul le PDF est livré.
const fs = require('fs');
const path = require('path');
const L = require('./livre');
const { construireModule, rendre } = require('./module');
const F = require('./formateur');
const { C, p, vide, saut, titre1, titre2, tableau } = L;
const { Paragraph, TextRun, PositionalTab, PositionalTabAlignment, PositionalTabRelativeTo, PositionalTabLeader } = L.docx;

const echapper = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function assembler(cfg) {
  const fichierPages = process.argv[2];
  const edition = process.argv[3] || 'apprenant';
  const sortie = process.argv[4] || cfg.sortie;
  const pagesConnues = fichierPages && fs.existsSync(fichierPages) ? JSON.parse(fs.readFileSync(fichierPages)) : {};
  const fichiers = fs.readdirSync(cfg.dossier).filter((f) => /^module\d\d_.*\.js$/.test(f)).sort();
  const bruts = fichiers.map((f) => require(path.join(cfg.dossier, f)));
  const modules = bruts.map((m) => construireModule(m));
  const { liminaires, projet } = cfg;
  const formateur = edition === 'formateur';
  const notes = formateur ? require(path.join(cfg.dossier, 'formateur.js')) : null;

  // Entrées du sommaire : [libellé, clé, motif de recherche dans le PDF, avant le sommaire ?]
  const entrees = [];
  const ajouter = (libelle, cle, titre, avant = false) => entrees.push([libelle, cle, echapper(titre), avant]);
  const annexes = [];
  const lettre = () => String.fromCharCode(65 + annexes.length);

  const glossaire = new Map();
  for (const m of modules) for (const [mot, def] of m.glossaire) if (!glossaire.has(mot)) glossaire.set(mot, [def, m.num]);
  const tries = [...glossaire.entries()].sort((a, b) => a[0].localeCompare(b[0], 'fr', { sensitivity: 'base' }));
  const annexe = (nom, contenu) => {
    const titre = `Annexe ${lettre()} · ${nom}`;
    annexes.push({ titre, nom, contenu: [titre1(titre), ...contenu] });
  };
  annexe('Glossaire', [
    p('Tous les mots techniques du livre, expliqués simplement. Le numéro indique le module où le mot est présenté.'),
    tableau(['Mot', 'En mots simples', 'Module'], tries.map(([mot, [def, n]]) => [`**${mot}**`, def, String(n)]), [1.3, 3.4, 0.6], C.orange)]);
  annexe(cfg.annexeC.titre, rendre(cfg.annexeC.contenu));
  if (formateur) annexe('Fiche d\'évaluation de la formation', rendre(F.ficheEvaluation(cfg)));
  annexe('Pour aller plus loin', rendre(cfg.annexeD));

  const enTeteBase = `${cfg.enTete} · ${formateur ? 'Manuel du formateur' : 'Manuel de l\'apprenant'}`;
  const sections = [{ couverture: cfg.couverture.replace('.png', formateur ? '_Formateur.png' : '_Apprenant.png') }];

  if (!formateur) {
    sections.push(
      { sansEnTetePremierePage: true, contenu: [...rendre(liminaires.pageDeTitre), saut(), ...rendre(liminaires.mentions)] },
      { contenu: rendre(liminaires.preface) },
      { contenu: null, sommaire: true },
      { contenu: rendre(liminaires.modeEmploi) },
      { contenu: rendre(liminaires.test) },
      ...modules.map((m) => ({ enTete: `FOR LIFE · Tome ${cfg.num} · Module ${m.num} — ${m.titre}`, contenu: m.contenu })),
      { enTete: `FOR LIFE · Tome ${cfg.num} · Projet final — ${projet.titre}`, contenu: rendre(projet.contenu) },
      ...annexes.map((a) => ({ contenu: a.contenu })),
      { sansEnTetePremierePage: true, contenu: rendre(liminaires.attestation) },
    );
    ajouter('Préface : ' + cfg.titrePreface, 'preface', 'Préface :', true);
    ajouter('Comment utiliser ce livre', 'mode', 'Comment utiliser ce livre');
    ajouter('Test de positionnement', 'test', 'Test de positionnement : par où');
  } else {
    const intro = F.introduction(cfg, bruts);
    sections.push(
      { sansEnTetePremierePage: true, contenu: [...rendre(F.pageDeTitre(cfg)), saut(), ...rendre(liminaires.mentions)] },
      { contenu: rendre(F.motAuteur(cfg)) },
      { contenu: null, sommaire: true },
      { contenu: rendre(intro.methode) },
      { contenu: rendre(intro.organiser) },
      { contenu: rendre(intro.evaluer) },
      { contenu: rendre(liminaires.test) },
      ...bruts.map((m, i) => ({ enTete: `FOR LIFE · Tome ${cfg.num} · Fiche pédagogique · Module ${m.num}`,
        contenu: rendre(F.fiche(m, modules[i], notes[m.num] || {})) })),
      { enTete: `FOR LIFE · Tome ${cfg.num} · Projet final — guide d'évaluation`, contenu: rendre(F.ficheProjet(projet, notes.projet || {})) },
      ...annexes.map((a) => ({ contenu: a.contenu })),
      { sansEnTetePremierePage: true, contenu: rendre(liminaires.attestation) },
    );
    ajouter('Mot de l\'auteur aux formateurs', 'preface', 'Mot de l\'auteur aux formateurs', true);
    ajouter('La méthode FOR LIFE et ses fondements', 'methode', 'La méthode FOR LIFE et ses fondements');
    ajouter('Organiser la formation', 'organiser', 'Organiser la formation');
    ajouter('Évaluer les apprenants', 'evaluer', 'Évaluer les apprenants');
    ajouter('Le test de positionnement', 'test', 'Test de positionnement : par où');
  }
  for (const m of modules) entrees.push([`${formateur ? 'Fiche · ' : ''}Module ${m.num}  ·  ${m.titre}`, `m${m.num}`, `^\\s*MODULE ${m.num}\\s*$`, false]);
  ajouter(formateur ? 'Projet final  ·  guide d\'évaluation' : 'Projet final  ·  ' + projet.titre, 'projet', 'PROJET FINAL');
  annexes.forEach((a, i) => ajouter(`Annexe ${String.fromCharCode(65 + i)}  ·  ${a.nom}`, `annexe${i}`, a.titre));

  const ligneSommaire = (libelle, cle) => new Paragraph({
    spacing: { after: 100 },
    children: [
      new TextRun({ text: libelle, bold: /Module|Projet/.test(libelle.slice(0, 14)), size: 23 }),
      new TextRun({ children: [new PositionalTab({ alignment: PositionalTabAlignment.RIGHT, relativeTo: PositionalTabRelativeTo.MARGIN, leader: PositionalTabLeader.DOT })] }),
      new TextRun({ text: String(pagesConnues[cle] || '00'), color: C.orange, bold: true }),
    ],
  });
  const sommaire = [titre1('Sommaire'), ...entrees.map(([l, c]) => ligneSommaire(l, c))];
  for (const s of sections) if (s.sommaire) s.contenu = sommaire;

  if (fichierPages) {
    const motifs = {};
    for (const [, cle, motif, avant] of entrees) motifs[cle] = { motif, avant };
    fs.writeFileSync(fichierPages + '.motifs.json', JSON.stringify(motifs));
  }
  const doc = L.documentLivre({ enTete: enTeteBase, sections });
  return L.ecrire(doc, sortie);
}

module.exports = { assembler };
