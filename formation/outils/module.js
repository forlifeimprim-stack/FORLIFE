// Gabarit d'un module : transforme une description compacte en contenu Word.
// Blocs acceptés : chaîne (paragraphe), {h2}, {h3}, {puces}, {etapes}, {cases}, {lignes}, {encadre},
// {tableau:[entêtes, lignes, proportions, couleur?]}, {illus}, {d:[nom, texte]}, {note}, {vide}, ou un objet docx déjà construit.
const L = require('./livre');
const { C, p, vide, titre2, titre3, puces, etapes, cases, encadre, illustration, tableau, bandeau, dialogue, ligneAEcrire } = L;
const { Paragraph, Table, TextRun, AlignmentType } = L.docx;

const COULEURS_PERSOS = {
  'Tantie Akissi': C.orangeFonce, 'Akissi': C.orangeFonce, 'Yao': C.bleu, 'M. Kouassi': C.vert,
  'Mariam': C.violet, 'Koffi': C.rouge, 'Aya': C.orange,
};
const STYLES_ENCADRE = {
  orange: [C.orange, C.orangeClair], vert: [C.vert, C.vertClair], bleu: [C.bleu, C.bleuClair],
  violet: [C.violet, C.violetClair], rouge: [C.rouge, C.rougeClair], fonce: [C.orangeFonce, C.orangeClair],
};

function rendre(blocs) {
  const out = [];
  for (const b of blocs) {
    if (b == null) continue;
    if (typeof b === 'string') { out.push(p(b)); continue; }
    if (b instanceof Paragraph || b instanceof Table) { out.push(b); continue; }
    if (Array.isArray(b)) { out.push(...rendre(b)); continue; }
    if (b.h2) out.push(titre2(b.h2));
    else if (b.h3) out.push(titre3(b.h3));
    else if (b.puces) out.push(...puces(b.puces));
    else if (b.etapes) out.push(...etapes(b.etapes));
    else if (b.cases) out.push(...cases(b.cases));
    else if (b.lignes) out.push(...b.lignes.map((t) => ligneAEcrire(t)));
    else if (b.d) out.push(dialogue(b.d[0], b.d[1], COULEURS_PERSOS[b.d[0]] || C.gris));
    else if (b.illus) { out.push(illustration(b.illus)); out.push(vide(100)); }
    else if (b.note) out.push(p(`*${b.note}*`, { run: { color: C.gris, size: 20 } }));
    else if (b.centre) out.push(p(b.centre, { align: AlignmentType.CENTER }));
    else if (b.vide) out.push(vide(b.vide));
    else if (b.tableau) { const [e, l, pr, c] = b.tableau; out.push(tableau(e, l, pr, c)); out.push(vide(100)); }
    else if (b.encadre) {
      const { titre, style = 'orange', contenu = [] } = b.encadre;
      const [couleur, fond] = STYLES_ENCADRE[style];
      out.push(encadre({ titre, couleur, fond, contenu: rendre(contenu) }));
      out.push(vide(100));
    } else throw new Error('Bloc inconnu : ' + JSON.stringify(b).slice(0, 80));
  }
  return out;
}

// Ouverture d'un module : étiquette, titre, sous-titre, objectifs, durée.
function ouverture(m) {
  return [
    new Paragraph({ spacing: { before: 200, after: 80 }, children: [
      new TextRun({ text: `MODULE ${m.num}`, bold: true, color: C.orange, size: 26, characterSpacing: 40 })] }),
    new Paragraph({ heading: 'Heading1', spacing: { after: 80 }, children: [new TextRun({ text: m.titre, color: C.texte, size: 52 })] }),
    new Paragraph({ spacing: { after: 300 }, border: { bottom: { style: 'single', size: 12, color: C.orange, space: 8 } },
      children: [new TextRun({ text: m.sousTitre, italics: true, size: 28, color: C.gris })] }),
    encadre({ titre: '🎯  À la fin de ce module, je saurai…', contenu: puces(m.objectifs) }),
    vide(140),
    tableau(['Durée conseillée', 'Matériel', 'Prérequis'], [[m.duree, m.materiel, m.prerequis]], [1, 1.4, 1.2]),
    vide(100),
  ];
}

const ETAPES = [
  ['situation', '📖', 'La situation', C.orange],
  ['declic', '💡', 'Le déclic', C.orange],
  ['pasAPas', '🖱️', 'Pas à pas', C.orange],
  ['pieges', '⚠️', 'Les pièges à éviter', C.rouge],
  ['exercices', '✍️', 'Exercices', C.bleu],
  ['cas', '🧩', 'Cas pratique', C.violet],
];

function construireModule(m) {
  const contenu = [...ouverture(m)];
  for (const [cle, icone, libelle, couleur] of ETAPES) {
    if (!m[cle]) continue;
    contenu.push(bandeau(icone, libelle, couleur));
    if (cle === 'pieges' && Array.isArray(m.pieges.lignes)) {
      contenu.push(tableau(['Le piège', 'Pourquoi c\'est dangereux', 'Le bon réflexe'], m.pieges.lignes, [1.3, 1.8, 2]));
      contenu.push(vide(100));
      if (m.pieges.questions && m.pieges.questions.length) {
        contenu.push(titre2('🙋🏾  Les questions qu\'on n\'ose pas poser'));
        for (const [q, r] of m.pieges.questions) contenu.push(...rendre([{ encadre: { titre: `« ${q} »`, style: 'bleu', contenu: [r] } }]));
      }
    } else if (cle === 'exercices' && !Array.isArray(m.exercices)) {
      const ex = m.exercices;
      if (ex.echauffe) contenu.push(titre2('🟢  Je m\'échauffe'), ...rendre(ex.echauffe));
      if (ex.entraine) contenu.push(titre2('🟡  Je m\'entraîne'), ...rendre(ex.entraine));
      if (ex.lance) contenu.push(titre2('🔴  Je me lance'), ...rendre(ex.lance));
    } else {
      contenu.push(...rendre(m[cle]));
    }
  }
  contenu.push(bandeau('📌', 'Ce que je retiens', C.vert));
  contenu.push(encadre({ couleur: C.vert, fond: C.vertClair, contenu: puces(m.retiens) }));
  contenu.push(bandeau('🏆', 'Mon défi de la semaine', C.orangeFonce));
  contenu.push(...rendre(m.defi));
  if (m.motDeLaFin) contenu.push(vide(100), encadre({ titre: '💬  Le mot de la fin', couleur: C.orangeFonce, fond: C.orangeClair, contenu: [p(m.motDeLaFin)] }));
  if (m.quiz) {
    contenu.push(titre2('📝  Mini-quiz : ai-je bien compris ?'));
    contenu.push(...etapes(m.quiz));
    contenu.push(p('*Les corrigés de tous les exercices et des mini-quiz sont en annexe A, à la fin du livre.*', { run: { color: C.gris, size: 20 } }));
  }
  return {
    num: m.num, titre: m.titre, contenu,
    corriges: m.corriges || [], glossaire: m.glossaire || [],
  };
}

module.exports = { rendre, construireModule, ouverture };
