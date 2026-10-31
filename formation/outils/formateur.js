// Contenu du manuel du formateur : pages communes et fiche pédagogique de chaque module.
const L = require('./livre');
const { C } = L;
const { Paragraph, TextRun, AlignmentType } = L.docx;

const MOTS = { une: 1, un: 1, deux: 2, trois: 3, quatre: 4, cinq: 5, six: 6, sept: 7, huit: 8, dix: 10 };
const heures = (duree) => MOTS[duree.trim().split(/\s+/)[0].toLowerCase()] || 3;
const fmt = (min) => (min >= 60 ? `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')}` : `${min} min`).replace(' h 00', ' h');

const PHASES = [
  ['Accueil et rappel', 0.05, 'Fait le point sur le défi de la semaine précédente ; rappel du module précédent en trois questions.', 'Racontent leurs réussites et leurs difficultés.'],
  ['📖 La situation', 0.10, 'Raconte ou fait jouer la situation ; pose la question d\'accroche ; laisse réagir.', 'Réagissent, partagent une expérience proche.'],
  ['💡 Le déclic', 0.15, 'Explique avec l\'image de la vie réelle (tableau, illustration du livre) ; vérifie la compréhension par la reformulation.', 'Reformulent avec leurs mots, proposent leurs propres comparaisons.'],
  ['🖱️ Pas à pas', 0.30, 'Démontre au vidéoprojecteur, une étape à la fois, puis circule dans la salle sans prendre la souris.', 'Reproduisent chaque étape sur leur poste.'],
  ['✍️ Exercices', 0.20, 'Lance les trois paliers ; oriente les plus rapides vers 🔴, accompagne les autres sur 🟢.', 'Travaillent seuls ou en binômes.'],
  ['🧩 Cas pratique', 0.12, 'Forme des petits groupes, anime la restitution, complète avec le corrigé.', 'Résolvent le cas, présentent leur solution.'],
  ['📌 Synthèse', 0.08, 'Relit « Ce que je retiens », fait le mini-quiz à main levée, présente le défi de la semaine.', 'Répondent au quiz, notent leur défi.'],
];

function deroule(duree) {
  const total = heures(duree) * 60;
  const lignes = PHASES.map(([phase, part, f, a]) => [phase, Math.max(5, Math.round((total * part) / 5) * 5), f, a]);
  const ecart = total - lignes.reduce((s, l) => s + l[1], 0);
  lignes[3][1] += ecart;
  return { total, lignes: lignes.map(([ph, min, f, a]) => [`**${ph}**`, fmt(min), f, a]) };
}

const ligne = (texte, o = {}) => new Paragraph({ alignment: o.align || AlignmentType.LEFT, spacing: { after: o.after ?? 120 },
  children: [new TextRun({ text: texte, size: o.size || 24, bold: o.bold, italics: o.italics, color: o.color || C.texte, characterSpacing: o.esp })] });

function pageDeTitre(cfg) {
  return [
    L.vide(1800),
    ligne(`COLLECTION « APPRIVOISER L'INFORMATIQUE »  ·  TOME ${cfg.num}`, { size: 22, bold: true, color: C.orange, esp: 30 }),
    ligne(cfg.titreTome, { size: 72, bold: true, after: 160 }),
    ligne(cfg.sousTitreTome, { size: 34, italics: true, color: C.gris, after: 500 }),
    ligne('MANUEL DU FORMATEUR', { size: 30, bold: true, color: C.vert, esp: 40, after: 400 }),
    ligne(cfg.niveau, { size: 24, color: C.gris, after: 600 }),
    ligne('Kouadio Koffi Elisée', { size: 32, bold: true }),
    ligne('FOR LIFE  ·  Abidjan', { size: 24, color: C.orange, bold: true }),
  ];
}

const motAuteur = (cfg) => [
  { h2: 'Mot de l\'auteur aux formateurs' },
  `Ce manuel accompagne le manuel de l\'apprenant du Tome ${cfg.num}, *${cfg.titreTome}*. Il contient tout ce dont vous avez besoin pour animer la formation : la méthode et ses fondements, l\'organisation des séances, l\'évaluation, et, pour chaque module, une **fiche pédagogique** avec le déroulé minuté, la question d\'accroche, les conseils d\'animation, les erreurs fréquentes des apprenants, les corrigés et des pistes d\'adaptation.`,
  'Former des adultes au numérique, c\'est d\'abord leur rendre confiance. Beaucoup arrivent avec une peur ancienne, parfois une honte : celle de ne pas savoir ce que « tout le monde » semble savoir. Votre premier travail n\'est pas d\'expliquer : c\'est de rassurer, d\'écouter, et de faire réussir très vite un premier geste.',
  'Gardez une règle d\'or tout au long de la formation : **on ne prend jamais la souris de l\'apprenant**. On montre sur son propre poste, on guide par la parole, on laisse faire. Ce que la main a fait, la tête le retient.',
  'Les apprenants ont leur manuel ; vous avez le vôtre. Ensemble, faites en sorte que personne ne reste au bord du numérique.',
  { centre: '*Kouadio Koffi Elisée*' },
  { centre: '*Fondateur de FOR LIFE, formateur*' },
];

function introduction(cfg, bruts) {
  const methode = [
    { h2: 'La méthode FOR LIFE et ses fondements' },
    'Chaque module suit les huit mêmes étapes : **la situation**, **le déclic**, **pas à pas**, **les pièges à éviter**, **exercices**, **cas pratique**, **ce que je retiens**, **mon défi de la semaine**. Cette régularité rassure les apprenants : ils savent toujours où ils en sont. Elle s\'appuie sur des travaux reconnus sur l\'apprentissage.',
    { h3: 'Les adultes apprennent quand ils voient à quoi ça sert (Malcolm Knowles)' },
    { tableau: [['Principe de l\'andragogie', 'Ce que cela change dans vos séances'], [
      ['**Le besoin de savoir pourquoi**', 'Commencez toujours par la situation : le problème concret que le module va résoudre.'],
      ['**L\'autonomie**', 'Laissez faire, laissez chercher. Proposez des choix (paliers d\'exercices, projets personnels).'],
      ['**L\'expérience**', 'Faites parler les apprenants de leur vie : leur téléphone, leur commerce, leur bureau. C\'est la matière première du déclic.'],
      ['**La disposition à apprendre**', 'Reliez chaque module à un moment de leur vie : une démarche à faire, un emploi à chercher, une activité à développer.'],
      ['**L\'orientation vers les problèmes**', 'Le cas pratique et le défi de la semaine sont au cœur de l\'apprentissage, pas des bonus.'],
      ['**La motivation interne**', 'Valorisez chaque réussite, même petite. La fierté est le meilleur moteur.'],
    ], [1.6, 3.4], C.vert] },
    { h3: 'L\'analogie fait le déclic (Dedre Gentner)' },
    { puces: [
      'Une notion nouvelle s\'accroche à une notion connue : la mémoire vive à la table de la cuisinière, le dossier à la chemise de l\'armoire.',
      'Choisissez des images tirées de la vie de **votre** groupe. Les analogies du livre sont des exemples : adaptez-les.',
      'Demandez aux apprenants d\'inventer **leur** comparaison : s\'ils y arrivent, ils ont compris.',
      'Montrez aussi les **limites** de l\'image : « la table, c\'est la mémoire vive… sauf qu\'elle s\'efface d\'un coup quand on éteint ».',
    ] },
    { h3: 'Des images et des mots bien associés (Richard E. Mayer)' },
    { puces: [
      'Montrez pendant que vous parlez : l\'illustration ou l\'écran projeté, commenté à voix haute, plutôt qu\'un long texte à lire.',
      'Signalez l\'essentiel : entourez, pointez, répétez le mot clé.',
      'Retirez le superflu : une idée à la fois, un geste à la fois.',
    ] },
    { h3: 'L\'aide qu\'on retire peu à peu' },
    'Les trois paliers d\'exercices (🟢 guidé, 🟡 semi-guidé, 🔴 autonome) appliquent le principe de l\'**étayage** : on soutient beaucoup au début, puis on retire l\'aide progressivement. Un apprenant qui réussit seul le palier 🔴 a atteint l\'objectif du module.',
    { h3: 'Votre posture de formateur' },
    { tableau: [['Faites…', 'Évitez…'], [
      ['Guider par la parole, l\'apprenant garde la souris', 'Prendre la souris « pour aller plus vite »'],
      ['Accueillir l\'erreur : « Très bien, regardons ce qui s\'est passé »', 'Soupirer, corriger sèchement, comparer les apprenants'],
      ['Utiliser les mots simples du livre, puis le mot technique', 'Le jargon et les sigles non expliqués'],
      ['Vérifier par une question ouverte : « Comment l\'expliqueriez-vous à votre voisin ? »', 'Demander « Vous avez compris ? » (tout le monde répond oui)'],
      ['Former des binômes mêlant les niveaux', 'Laisser les plus rapides s\'ennuyer et les plus lents décrocher'],
    ], [2.5, 2.5], C.orange] },
  ];

  const total = bruts.reduce((s, m) => s + heures(m.duree), 0);
  const planning = bruts.map((m) => [`**${m.num}**`, m.titre, `${heures(m.duree)} h`, String(Math.max(1, Math.round(heures(m.duree) / 3)))]);
  const organiser = [
    { h2: 'Organiser la formation' },
    { tableau: [['Élément', 'Recommandation'], [
      ['**Public**', cfg.public],
      ['**Prérequis**', cfg.prerequisTome],
      ['**Taille du groupe**', '8 à 12 apprenants. Au-delà, prévoyez un second formateur ou un apprenant avancé comme assistant.'],
      ['**Matériel**', 'Un ordinateur par apprenant (ou un pour deux, en alternant la souris), un vidéoprojecteur, une connexion Internet, un tableau, le manuel de l\'apprenant pour chacun.'],
      ['**Rythme conseillé**', 'Des séances de deux à trois heures, deux fois par semaine, pour laisser le temps du défi de la semaine.'],
      ['**Volume total**', `Environ **${total} heures** de séances, plus le projet final et sa soutenance.`],
    ], [1.3, 3.7]] },
    { h3: 'Le planning des modules' },
    { tableau: [['Module', 'Titre', 'Durée', 'Séances'], [...planning, ['', '**Projet final et soutenance**', '6 h', '2']], [0.7, 3, 0.7, 0.7], C.violet] },
    { h3: 'Préparer chaque séance' },
    { cases: [
      'J\'ai relu le module dans le manuel de l\'apprenant et sa fiche pédagogique.',
      'J\'ai refait moi-même toutes les manipulations sur un poste identique à ceux des apprenants.',
      'Les postes sont allumés, à jour, connectés ; les comptes et fichiers d\'exercice sont prêts.',
      'Le vidéoprojecteur fonctionne ; j\'ai un plan B (illustrations du livre, tableau).',
      'J\'ai adapté la situation et l\'analogie à mon groupe.',
    ] },
    { h3: 'Les groupes hétérogènes' },
    { puces: [
      'Formez des **binômes** mêlant un apprenant à l\'aise et un apprenant en difficulté, en changeant les binômes régulièrement.',
      'Confiez aux plus rapides le palier 🔴, puis un rôle de **tuteur** : expliquer, sans toucher la souris du voisin.',
      'Pour les apprenants peu à l\'aise avec la lecture, lisez à voix haute les consignes, appuyez-vous sur les illustrations et les gestes.',
      'Prévoyez des temps de reprise individuels, en début ou en fin de séance.',
    ] },
  ];

  const evaluer = [
    { h2: 'Évaluer les apprenants' },
    { tableau: [['Quand', 'Outil', 'À quoi il sert'], [
      ['**Au début**', 'Le **test de positionnement** (page suivante)', 'Connaître le niveau de chacun, former les binômes, adapter le rythme.'],
      ['**Pendant**', 'Les **exercices**, le **mini-quiz** de fin de module, le **défi de la semaine**', 'Vérifier la progression, reprendre ce qui n\'est pas acquis. Les corrigés sont dans les fiches pédagogiques.'],
      ['**À la fin**', 'Le **projet final** et sa grille sur 20', 'Valider les compétences. Seuil conseillé : 14 sur 20 pour délivrer l\'attestation.'],
      ['**Après**', 'La **fiche d\'évaluation de la formation** (en annexe)', 'Recueillir l\'avis des apprenants pour améliorer vos séances.'],
    ], [0.9, 2, 2.2]] },
    { h3: 'La grille de suivi du groupe' },
    'Cochez pour chaque apprenant les modules dont il réussit seul le palier 🔴. Un module non coché à la fin de la formation indique une reprise à prévoir.',
    { tableau: [['Apprenant', ...bruts.map((m) => String(m.num)), 'Projet'], Array.from({ length: 6 }, () => ['', ...bruts.map(() => ''), '']),
      [2.2, ...bruts.map(() => 0.45), 0.8], C.bleu] },
    { note: 'Faites refaire le test de positionnement en fin de formation : la comparaison avant/après est un puissant moteur de fierté.' },
  ];
  return { methode, organiser, evaluer };
}

function fiche(m, construit, n) {
  const d = deroule(m.duree);
  const blocs = [
    new Paragraph({ spacing: { before: 200, after: 80 }, children: [new TextRun({ text: `MODULE ${m.num}`, bold: true, color: C.orange, size: 26, characterSpacing: 40 })] }),
    new Paragraph({ heading: 'Heading1', spacing: { after: 80 }, children: [new TextRun({ text: m.titre, color: C.texte, size: 48 })] }),
    new Paragraph({ spacing: { after: 300 }, border: { bottom: { style: 'single', size: 12, color: C.vert, space: 8 } },
      children: [new TextRun({ text: 'Fiche pédagogique', italics: true, size: 28, color: C.vert })] }),
    { encadre: { titre: '🎯  Objectifs', contenu: [{ puces: m.objectifs }] } },
    { tableau: [['Durée', 'Matériel', 'Prérequis'], [[m.duree, m.materiel, m.prerequis]], [1, 1.4, 1.2]] },
    { encadre: { titre: '🔑  Le message clé', style: 'vert', contenu: [m.retiens[0]] } },
  ];
  if (n.accroche) blocs.push({ encadre: { titre: '❓  La question d\'accroche', style: 'violet', contenu: [n.accroche] } });
  blocs.push({ h3: `Le déroulé minuté (${fmt(d.total)})` },
    { tableau: [['Phase', 'Durée', 'Le formateur', 'Les apprenants'], d.lignes, [1.1, 0.6, 2.2, 1.6], C.vert] });
  if (n.conseils) blocs.push({ h3: 'Conseils d\'animation' }, { puces: n.conseils });
  const erreurs = Array.isArray(m.pieges?.lignes) ? m.pieges.lignes.map((l) => [l[0], l[2]]) : [];
  if (n.erreurs) erreurs.push(...n.erreurs);
  if (erreurs.length) blocs.push({ h3: 'Les erreurs fréquentes des apprenants' },
    { tableau: [['Ce que vous verrez', 'Comment réagir'], erreurs, [2, 3], C.rouge] });
  blocs.push({ h3: 'Corrigés' }, { tableau: [['Exercice', 'Corrigé'], m.corriges.map(([a, b]) => [`**${a}**`, b]), [1, 4], C.vert] });
  blocs.push({ h3: 'Le défi de la semaine' },
    `À présenter en fin de séance et à reprendre au début de la suivante : ${typeof m.defi[0] === 'string' ? m.defi[0] : ''}`);
  if (n.variante) blocs.push({ h3: 'Adapter la séance' }, n.variante);
  return blocs;
}

function ficheProjet(projet, n) {
  return [
    ...projet.contenu,
    { h2: 'Conseils au formateur' },
    { puces: n.conseils || [
      'Présentez le projet dès la mi-parcours, pour que chacun choisisse un sujet réel.',
      'Prévoyez des points d\'étape : chaque apprenant montre son avancement en cinq minutes.',
      'Évaluez avec la grille, en présence de l\'apprenant, et commencez toujours par ce qui est réussi.',
    ] },
    { h3: 'Points d\'attention pour la correction' },
    { tableau: [['Élément', 'Commentaire'], projet.corriges.map(([a, b]) => [`**${a}**`, b]), [1, 4], C.vert] },
  ];
}

const ficheEvaluation = (cfg) => [
  `À remettre à chaque apprenant à la fin du Tome ${cfg.num}. Les réponses sont anonymes.`,
  { tableau: [['Entourez votre réponse (1 = pas du tout, 5 = tout à fait)', '1', '2', '3', '4', '5'], [
    ['Les situations de départ correspondaient à ma vie', '', '', '', '', ''],
    ['Les comparaisons (le déclic) m\'ont aidé à comprendre', '', '', '', '', ''],
    ['Les manipulations pas à pas étaient faciles à suivre', '', '', '', '', ''],
    ['Les exercices étaient adaptés à mon niveau', '', '', '', '', ''],
    ['Le formateur m\'a laissé faire et m\'a encouragé', '', '', '', '', ''],
    ['Je me sens capable d\'utiliser seul ce que j\'ai appris', '', '', '', '', ''],
    ['Je recommanderais cette formation à un proche', '', '', '', '', ''],
  ], [3.4, 0.4, 0.4, 0.4, 0.4, 0.4], C.bleu] },
  { lignes: ['Ce que j\'ai le plus apprécié : ', 'Ce qu\'il faudrait améliorer : ', 'Ce que j\'ai déjà fait dans ma vie grâce à cette formation : '] },
];

module.exports = { pageDeTitre, motAuteur, introduction, fiche, ficheProjet, ficheEvaluation, heures };
