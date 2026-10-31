// Outils de mise en page des manuels FOR LIFE (Word .docx via la bibliothèque « docx »).
// Chaque chapitre est décrit par un fichier de contenu qui appelle ces fonctions.
const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType,
  BorderStyle, AlignmentType, HeadingLevel, LevelFormat, Header, Footer, PageNumber, PageBreak,
  TabStopType, TabStopPosition, VerticalAlign,
} = require('docx');

const C = {
  orange: 'EA7822', orangeFonce: 'C96318', orangeClair: 'FEF0E4', creme: 'FDF8F3',
  texte: '1E1E1E', gris: '444444', grisClair: '777777', bordure: 'E8E2DA',
  vert: '1E8E5A', vertClair: 'E7F6EE', rouge: 'C0392B', rougeClair: 'FDECEA',
  bleu: '1F5F99', bleuClair: 'E8F1FA', violet: '6B3FA0', violetClair: 'F1EBF8',
};
const POLICE = 'Calibri';
const LARGEUR = 9638; // A4 (11906) moins 2 × 2 cm de marges

// Texte avec **gras** et *italique*.
function runs(texte, opts = {}) {
  const out = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let last = 0, m;
  while ((m = re.exec(texte))) {
    if (m.index > last) out.push(new TextRun({ text: texte.slice(last, m.index), ...opts }));
    const t = m[0];
    if (t.startsWith('**')) out.push(new TextRun({ text: t.slice(2, -2), bold: true, ...opts }));
    else out.push(new TextRun({ text: t.slice(1, -1), italics: true, ...opts }));
    last = m.index + t.length;
  }
  if (last < texte.length) out.push(new TextRun({ text: texte.slice(last), ...opts }));
  return out;
}

const p = (texte, o = {}) => new Paragraph({
  children: runs(texte, o.run || {}), alignment: o.align || AlignmentType.JUSTIFIED,
  spacing: { after: o.after ?? 140, before: o.before ?? 0, line: 288 }, keepNext: o.keepNext,
});
const vide = (h = 120) => new Paragraph({ spacing: { after: h }, children: [] });
const saut = () => new Paragraph({ children: [new PageBreak()] });

const titre1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)], keepNext: true });
const titre2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)], keepNext: true });
const titre3 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(t)], keepNext: true });

const puces = (items, niveau = 0) => items.map((t) => new Paragraph({
  numbering: { reference: 'puces', level: niveau }, children: runs(t),
  spacing: { after: 80, line: 276 },
}));
let compteurListes = 0;
const etapes = (items) => {
  const ref = 'etapes';
  const instance = ++compteurListes;
  return items.map((t) => new Paragraph({
    numbering: { reference: ref, level: 0, instance }, children: runs(t),
    spacing: { after: 100, line: 276 },
  }));
};
const cases = (items) => items.map((t) => new Paragraph({
  children: [new TextRun({ text: '☐  ', size: 26 }), ...runs(t)], spacing: { after: 90 }, indent: { left: 360 },
}));

const bord = (couleur, taille = 4) => ({ style: BorderStyle.SINGLE, size: taille, color: couleur });
const sansBord = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };

// Encadré coloré : bande à gauche, fond clair, titre puis contenu (chaînes ou Paragraph).
function encadre({ titre, couleur = C.orange, fond = C.orangeClair, contenu = [] }) {
  const enfants = [];
  if (titre) enfants.push(new Paragraph({
    children: [new TextRun({ text: titre, bold: true, color: couleur, size: 24 })], spacing: { after: 100 },
  }));
  for (const c of contenu) enfants.push(typeof c === 'string' ? p(c, { after: 90 }) : c);
  return new Table({
    width: { size: LARGEUR, type: WidthType.DXA }, columnWidths: [LARGEUR],
    rows: [new TableRow({ cantSplit: true, children: [new TableCell({
      width: { size: LARGEUR, type: WidthType.DXA },
      shading: { fill: fond, type: ShadingType.CLEAR, color: 'auto' },
      margins: { top: 160, bottom: 120, left: 240, right: 240 },
      borders: { left: bord(couleur, 24), top: sansBord, bottom: sansBord, right: sansBord },
      children: enfants,
    })] })],
  });
}

// Emplacement réservé à une illustration ou une capture d'écran.
function illustration(description) {
  return new Table({
    width: { size: LARGEUR, type: WidthType.DXA }, columnWidths: [LARGEUR],
    rows: [new TableRow({ children: [new TableCell({
      width: { size: LARGEUR, type: WidthType.DXA },
      shading: { fill: 'F4F4F4', type: ShadingType.CLEAR, color: 'auto' },
      margins: { top: 300, bottom: 300, left: 240, right: 240 },
      borders: { top: { style: BorderStyle.DASHED, size: 6, color: 'AAAAAA' }, bottom: { style: BorderStyle.DASHED, size: 6, color: 'AAAAAA' },
        left: { style: BorderStyle.DASHED, size: 6, color: 'AAAAAA' }, right: { style: BorderStyle.DASHED, size: 6, color: 'AAAAAA' } },
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '🖼️  ILLUSTRATION', bold: true, color: C.grisClair, size: 20 })], spacing: { after: 60 } }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: runs(description, { color: C.grisClair, italics: true, size: 20 }) }),
      ],
    })] })],
  });
}

// Tableau classique avec ligne d'en-tête colorée. largeurs en proportions.
function tableau(entetes, lignes, proportions, couleur = C.orange) {
  const total = proportions.reduce((a, b) => a + b, 0);
  const cols = proportions.map((x) => Math.floor((x / total) * LARGEUR));
  cols[cols.length - 1] += LARGEUR - cols.reduce((a, b) => a + b, 0);
  const cellule = (txt, i, entete, pair) => new TableCell({
    width: { size: cols[i], type: WidthType.DXA },
    shading: { fill: entete ? couleur : (pair ? C.creme : 'FFFFFF'), type: ShadingType.CLEAR, color: 'auto' },
    margins: { top: 80, bottom: 80, left: 120, right: 120 }, verticalAlign: VerticalAlign.CENTER,
    borders: { top: bord(C.bordure), bottom: bord(C.bordure), left: bord(C.bordure), right: bord(C.bordure) },
    children: String(txt).split('\n').map((ligne) => new Paragraph({
      children: runs(ligne, entete ? { bold: true, color: 'FFFFFF' } : {}), spacing: { after: 40, line: 264 },
    })),
  });
  return new Table({
    width: { size: LARGEUR, type: WidthType.DXA }, columnWidths: cols,
    rows: [
      new TableRow({ tableHeader: true, children: entetes.map((e, i) => cellule(e, i, true)) }),
      ...lignes.map((l, j) => new TableRow({ cantSplit: true, children: l.map((c, i) => cellule(c, i, false, j % 2 === 1)) })),
    ],
  });
}

// Bandeau d'étape de la méthode (La situation, Le déclic…).
function bandeau(icone, texte, couleur = C.orange) {
  return new Paragraph({
    keepNext: true, spacing: { before: 360, after: 200 },
    shading: { fill: couleur, type: ShadingType.CLEAR, color: 'auto' },
    border: { left: bord(couleur, 12) },
    indent: { left: 120, right: 120 },
    children: [new TextRun({ text: `  ${icone}  ${texte.toUpperCase()}`, bold: true, color: 'FFFFFF', size: 28 })],
  });
}

// Réplique de dialogue : nom en couleur, réplique en clair.
const dialogue = (nom, texte, couleur = C.orangeFonce) => new Paragraph({
  spacing: { after: 110, line: 288 }, indent: { left: 360 },
  children: [new TextRun({ text: `${nom} : `, bold: true, color: couleur }), ...runs(texte)],
});

// Ligne à compléter.
const ligneAEcrire = (libelle) => new Paragraph({
  spacing: { after: 160 },
  tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX, leader: 'dot' }],
  children: [...runs(libelle), new TextRun({ text: '\t' })],
});

function documentLivre({ enTete, sections }) {
  return new Document({
    creator: 'FOR LIFE', title: enTete,
    styles: {
      default: { document: { run: { font: POLICE, size: 23, color: C.texte } } },
      paragraphStyles: [
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 40, bold: true, color: C.orange, font: POLICE },
          paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 30, bold: true, color: C.texte, font: POLICE },
          paragraph: { spacing: { before: 300, after: 140 }, outlineLevel: 1,
            border: { bottom: bord(C.orange, 8) } } },
        { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 25, bold: true, color: C.orangeFonce, font: POLICE },
          paragraph: { spacing: { before: 220, after: 100 }, outlineLevel: 2 } },
      ],
    },
    numbering: { config: [
      { reference: 'puces', levels: [
        { level: 0, format: LevelFormat.BULLET, text: '●', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 600, hanging: 300 } }, run: { color: C.orange } } },
        { level: 1, format: LevelFormat.BULLET, text: '–', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 1080, hanging: 300 } } } } ] },
      { reference: 'etapes', levels: [
        { level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 600, hanging: 360 } }, run: { bold: true, color: C.orange } } } ] },
    ] },
    sections: sections.map((s) => ({
      properties: { page: { size: { width: 11906, height: 16838 },
        margin: { top: 1300, bottom: 1200, left: 1134, right: 1134, header: 600, footer: 600 } },
        titlePage: s.sansEnTetePremierePage },
      headers: { default: new Header({ children: [new Paragraph({
        alignment: AlignmentType.RIGHT, border: { bottom: bord(C.bordure, 4) },
        children: [new TextRun({ text: enTete, size: 17, color: C.grisClair })] })] }),
        first: new Header({ children: [] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: '— ', color: C.orange, size: 18 }), new TextRun({ children: [PageNumber.CURRENT], size: 18, color: C.gris }), new TextRun({ text: ' —', color: C.orange, size: 18 })] })] }),
        first: new Footer({ children: [] }) },
      children: s.contenu,
    })),
  });
}

async function ecrire(doc, chemin) {
  fs.writeFileSync(chemin, await Packer.toBuffer(doc));
  console.log('Écrit :', chemin);
}

module.exports = {
  C, LARGEUR, runs, p, vide, saut, titre1, titre2, titre3, puces, etapes, cases, encadre, illustration,
  tableau, bandeau, dialogue, ligneAEcrire, documentLivre, ecrire,
  docx: require('docx'),
};
