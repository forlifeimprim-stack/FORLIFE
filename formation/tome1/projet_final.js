// Tome 1 · Projet final : Mon dossier de candidature complet
const L = require('../outils/livre');
const { C } = L;
const { Paragraph, TextRun } = L.docx;

const titre = 'Mon dossier de candidature complet';

const contenu = [
  new Paragraph({ spacing: { before: 200, after: 80 }, children: [new TextRun({ text: '★  PROJET FINAL', bold: true, color: C.orange, size: 26, characterSpacing: 40 })] }),
  new Paragraph({ heading: 'Heading1', spacing: { after: 80 }, children: [new TextRun({ text: titre, color: C.texte, size: 52 })] }),
  new Paragraph({ spacing: { after: 300 }, border: { bottom: { style: 'single', size: 12, color: C.orange, space: 8 } },
    children: [new TextRun({ text: 'Tout ce que vous avez appris, réuni dans un seul vrai projet', italics: true, size: 28, color: C.gris })] }),
  { h2: 'La mission' },
  'Yao a repéré une offre de stage dans une entreprise de téléphonie au Plateau. L\'annonce dit : « Envoyez votre CV, une lettre de motivation et une copie de votre pièce d\'identité, en PDF, avant le 15 du mois, à recrutement@exemple.ci. »',
  'Cette fois, Yao ne demandera l\'aide de personne. Et vous allez faire comme lui : **constituer votre propre dossier de candidature**, pour un emploi, un stage, un concours, une inscription ou une demande de crédit. Choisissez une situation réelle ou réaliste qui vous concerne.',
  { encadre: { titre: '🎯  Ce que vous allez produire', style: 'violet', contenu: [
    { puces: [
      'un **dossier rangé** sur votre ordinateur (module 4) ;',
      'un **CV** et une **lettre** écrits dans Word et enregistrés en **PDF** (module 5) ;',
      'un **tableau de suivi** de vos candidatures dans Excel (module 6) ;',
      'une **pièce d\'identité scannée** avec votre téléphone et transférée sur l\'ordinateur (module 9) ;',
      'un **e-mail** de candidature avec les pièces jointes, envoyé depuis votre propre adresse (module 8) ;',
      'une **vérification de sécurité** de l\'annonce et de votre envoi (modules 7 et 10).',
    ] },
  ] } },
  { h2: 'Les étapes' },
  { h3: 'Étape 1 : vérifier l\'annonce (modules 7 et 10)' },
  { puces: [
    'L\'entreprise existe-t-elle vraiment ? Cherchez son nom sur Internet : site officiel, adresse, avis.',
    'L\'annonce demande-t-elle de l\'argent (« frais de dossier » à payer par Mobile Money) ? Si oui, **arrêtez-vous** : c\'est presque toujours une arnaque.',
  ] },
  { h3: 'Étape 2 : préparer le dossier (module 4)' },
  'Dans **Documents**, créez un dossier nommé **Candidatures**, et à l\'intérieur un dossier au nom de l\'entreprise ou de l\'organisme, par exemple **2026-11 Stage Telecom**.',
  { h3: 'Étape 3 : écrire le CV et la lettre (module 5)' },
  { puces: [
    'Rédigez votre CV dans Word : coordonnées, objectif, formation, expérience, compétences, langues, centres d\'intérêt. Une page suffit.',
    'Rédigez une lettre de motivation de trois paragraphes : **vous** (qui vous êtes), **eux** (pourquoi cette entreprise), **nous** (ce que vous apporterez ensemble).',
    'Faites relire par votre binôme. Corrigez les fautes signalées par Word.',
    'Enregistrez les deux documents en Word, **puis** en PDF : Fichier → **Enregistrer sous** (ou **Enregistrer une copie**) → type **PDF**. Nommez-les clairement : **CV_Yao_Kouame.pdf**, **Lettre_Yao_Kouame.pdf**.',
  ] },
  { h3: 'Étape 4 : scanner la pièce d\'identité (module 9)' },
  'Avec votre téléphone, scannez le recto et le verso de votre pièce d\'identité, enregistrez-les en un seul PDF, puis transférez-le dans le dossier de la candidature.',
  { h3: 'Étape 5 : envoyer l\'e-mail (module 8)' },
  { puces: [
    '**Objet** clair : « Candidature au stage d\'assistant commercial, Yao Kouamé ».',
    '**Message** court et poli : formule d\'appel, deux ou trois phrases, liste des pièces jointes, formule de politesse, signature avec numéro de téléphone.',
    'Joignez les **trois PDF**, vérifiez qu\'ils sont bien attachés, relisez, puis envoyez.',
  ] },
  { h3: 'Étape 6 : suivre ses candidatures (module 6)' },
  'Dans Excel, créez un fichier **Suivi des candidatures** avec les colonnes : Date d\'envoi · Organisme · Poste · Contact · Relance prévue · Réponse. Ajoutez une ligne pour chaque candidature.',
  { h2: 'La grille d\'évaluation' },
  'Évaluez-vous, puis demandez à votre formateur ou à votre binôme de vous évaluer.',
  { tableau: [['Critère', 'Points', 'Moi', 'Formateur'], [
    ['L\'annonce a été vérifiée (entreprise réelle, aucun paiement demandé)', '2', '', ''],
    ['Les fichiers sont rangés dans un dossier bien nommé', '2', '', ''],
    ['Le CV est clair, sans faute, sur une page', '4', '', ''],
    ['La lettre suit le plan vous, eux, nous', '3', '', ''],
    ['Les documents sont en PDF avec des noms explicites', '2', '', ''],
    ['La pièce d\'identité est scannée lisiblement', '2', '', ''],
    ['L\'e-mail a un objet clair, un message poli et les bonnes pièces jointes', '3', '', ''],
    ['Le tableau de suivi est créé et rempli', '2', '', ''],
    ['**Total**', '**20**', '', ''],
  ], [3.4, 0.6, 0.6, 0.8], C.violet] },
  { encadre: { titre: '🎉  Et après ?', style: 'vert', contenu: [
    'Si vous avez obtenu 14 points ou plus, vous avez **apprivoisé l\'ordinateur**. Vous savez écrire, ranger, chercher, communiquer, vous protéger et faire vos démarches seul. Refaites le test de positionnement du début : comparez vos réponses. Puis demandez votre **attestation de fin de parcours**, à la dernière page.',
  ] } },
];

const corriges = [
  ['Grille', 'Il n\'y a pas de corrigé unique : chaque dossier est personnel. Points d\'attention fréquents : un objet d\'e-mail vide, une pièce jointe oubliée, des fichiers nommés « Document1.pdf », une adresse e-mail peu sérieuse (préférez prenom.nom@…).'],
];

module.exports = { titre, contenu, corriges };
