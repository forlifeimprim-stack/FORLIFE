// Pages liminaires communes aux tomes 2 et 3 : page de titre, mentions, mode d'emploi, attestation.
const L = require('./livre');
const { C, vide } = L;
const { Paragraph, TextRun, AlignmentType } = L.docx;

const ligne = (texte, o = {}) => new Paragraph({ alignment: o.align || AlignmentType.LEFT, spacing: { after: o.after ?? 120 },
  children: [new TextRun({ text: texte, size: o.size || 24, bold: o.bold, italics: o.italics, color: o.color || C.texte, characterSpacing: o.esp })] });

function liminairesCommuns(t) {
  const pageDeTitre = [
    vide(1800),
    ligne(`COLLECTION « APPRIVOISER L'INFORMATIQUE »  ·  TOME ${t.num}`, { size: 22, bold: true, color: C.orange, esp: 30 }),
    ligne(t.titre, { size: 72, bold: true, after: 160 }),
    ligne(t.sousTitre, { size: 34, italics: true, color: C.gris, after: 900 }),
    ligne('Manuel de formation', { size: 24, color: C.gris }),
    ligne(t.niveau, { size: 24, color: C.gris, after: 600 }),
    ligne('Kouadio Koffi Elisée', { size: 32, bold: true }),
    ligne('FOR LIFE  ·  Abidjan', { size: 24, color: C.orange, bold: true }),
  ];
  const mentions = [
    vide(7000),
    ligne('© 2026 Kouadio Koffi Elisée — FOR LIFE. Tous droits réservés.', { size: 19, color: C.gris }),
    ligne('Toute reproduction, même partielle, sans l\'accord écrit de l\'auteur est interdite.', { size: 19, color: C.gris }),
    ligne(t.logiciels, { size: 19, color: C.gris }),
    ligne('Les noms de marques cités appartiennent à leurs propriétaires respectifs. Les personnages et les situations sont fictifs ; toute ressemblance serait fortuite.', { size: 19, color: C.gris }),
    ligne('Les services en ligne évoluent vite : si un bouton a changé de nom ou de place, cherchez la fonction équivalente, la méthode reste la même.', { size: 19, color: C.gris }),
    ligne('Première édition, 2026.', { size: 19, color: C.gris }),
  ];
  const modeEmploi = [
    { h2: 'Comment utiliser ce livre' },
    `Ce tome garde **la même structure** que le Tome 1. ${t.prerequis}`,
    { tableau: [['Étape', 'Ce que vous y trouvez'], [
      ['📖 **La situation**', 'Une histoire de la vie professionnelle ou quotidienne.'],
      ['💡 **Le déclic**', 'L\'explication, toujours à partir d\'une image de la vie réelle.'],
      ['🖱️ **Pas à pas**', 'Les manipulations, étape par étape.'],
      ['⚠️ **Les pièges à éviter**', 'Les erreurs fréquentes et les questions qu\'on n\'ose pas poser.'],
      ['✍️ **Exercices**', '🟢 *Je m\'échauffe*, 🟡 *Je m\'entraîne*, 🔴 *Je me lance*.'],
      ['🧩 **Cas pratique**', 'Un vrai problème à résoudre.'],
      ['📌 **Ce que je retiens**', 'La fiche mémo du module.'],
      ['🏆 **Mon défi de la semaine**', 'Une mission dans votre vraie vie.'],
    ], [1.3, 3.4]] },
    { h3: 'Les personnages, ' + t.quand },
    { tableau: [['Qui ?', 'Où en est-il ?'], t.personnages, [1.3, 3.4]] },
    { img: 'personnages', illus: 'Les personnages' },
    { encadre: { titre: '📚  Les logiciels et services utilisés', style: 'bleu', contenu: [t.logicielsDetail] } },
  ];
  const attestation = [
    vide(1200),
    { centre: '**ATTESTATION DE FIN DE PARCOURS**' },
    ligne(`Tome ${t.num} · ${t.titre}`, { align: AlignmentType.CENTER, size: 36, bold: true, color: C.orange, after: 600 }),
    { centre: 'Je soussigné(e), formateur ou formatrice, atteste que' },
    { lignes: [''] },
    { centre: `a suivi l'ensemble des modules du Tome ${t.num}, réalisé les exercices et présenté avec succès le projet final « ${t.projet} ».` },
    { vide: 300 },
    { centre: t.competences },
    { vide: 600 },
    { lignes: ['Fait à ', 'Le ', 'Signature du formateur : ', 'Signature de l\'apprenant : '] },
    { vide: 400 },
    ligne('FOR LIFE', { align: AlignmentType.CENTER, size: 30, bold: true, color: C.orange }),
  ];
  return { pageDeTitre, mentions, modeEmploi, attestation };
}

module.exports = { liminairesCommuns };
