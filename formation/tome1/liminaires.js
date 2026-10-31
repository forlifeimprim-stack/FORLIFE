// Tome 1 : page de titre, mentions, préface, mode d'emploi, test de positionnement, attestation.
const L = require('../outils/livre');
const { C, p, vide } = L;
const { Paragraph, TextRun, AlignmentType } = L.docx;

const ligne = (texte, o = {}) => new Paragraph({ alignment: o.align || AlignmentType.LEFT, spacing: { after: o.after ?? 120 },
  children: [new TextRun({ text: texte, size: o.size || 24, bold: o.bold, italics: o.italics, color: o.color || C.texte, characterSpacing: o.esp })] });

const pageDeTitre = [
  vide(1800),
  ligne('COLLECTION « APPRIVOISER L\'INFORMATIQUE »  ·  TOME 1', { size: 22, bold: true, color: C.orange, esp: 30 }),
  ligne('Apprivoiser l\'ordinateur', { size: 72, bold: true, after: 160 }),
  ligne('Mes premiers pas sans peur', { size: 34, italics: true, color: C.gris, after: 900 }),
  ligne('Manuel de formation', { size: 24, color: C.gris }),
  ligne('Niveau débutant', { size: 24, color: C.gris, after: 600 }),
  ligne('Kouadio Koffi Elisée', { size: 32, bold: true }),
  ligne('FOR LIFE  ·  Abidjan', { size: 24, color: C.orange, bold: true }),
];

const mentions = [
  vide(7000),
  ligne('© 2026 Kouadio Koffi Elisée — FOR LIFE. Tous droits réservés.', { size: 19, color: C.gris }),
  ligne('Toute reproduction, même partielle, sans l\'accord écrit de l\'auteur est interdite.', { size: 19, color: C.gris }),
  ligne('Logiciels de référence : Windows 11 et Microsoft 365 (Word, Excel), en français. Selon votre version, certains écrans peuvent légèrement différer.', { size: 19, color: C.gris }),
  ligne('Les noms de marques cités appartiennent à leurs propriétaires respectifs. Les personnages et les situations sont fictifs ; toute ressemblance serait fortuite.', { size: 19, color: C.gris }),
  ligne('Première édition, 2026.', { size: 19, color: C.gris }),
];

const preface = [
  { h2: 'Préface : le nouvel alphabet' },
  'Il y a deux générations, dans nos villages comme dans nos quartiers, celui qui ne savait pas lire devait tendre ses lettres à un voisin. Il dépendait de sa patience, de sa discrétion, de son honnêteté. Nos parents et nos grands-parents se sont battus pour que leurs enfants aillent à l\'école et ne connaissent jamais cette dépendance.',
  'Aujourd\'hui, un nouvel alphabet s\'est imposé. Les lettres sont devenues des e-mails, les guichets des sites internet, les registres des fichiers, et l\'argent circule dans nos téléphones. Celui qui ne maîtrise pas l\'outil informatique revit, sous une autre forme, ce que vivaient nos anciens : il doit demander, attendre, parfois payer, et souvent faire confiance à quelqu\'un qui ne le mérite pas. Je n\'ai pas peur du mot : c\'est un **illettrisme numérique**.',
  'Ce livre est né d\'une conviction simple : **personne n\'est trop vieux, trop occupé ou « pas fait pour ça »**. Dans les salles de formation, j\'ai vu des commerçantes du marché, des retraités, des jeunes sortis tôt de l\'école et des cadres pressés apprivoiser l\'ordinateur. Ce qui les bloquait n\'était jamais l\'intelligence. C\'était la peur, le jargon et des explications pensées pour ceux qui savent déjà.',
  'Alors j\'ai écrit autrement. Ici, on ne commence pas par la technique : on commence par **la vie**. Une situation que vous connaissez, au marché, au bureau, à la maison. Puis une image qui fait « tilt » : un ordinateur est une cuisine, un dossier est une armoire, un e-mail est une lettre qui voyage en une seconde. Ensuite seulement viennent les gestes, pas à pas, et les exercices pour qu\'ils deviennent des réflexes.',
  'Vous allez suivre Tantie Akissi, Yao, Mariam et Koffi. Ils vous ressemblent peut-être. Ils vont se tromper, rire, recommencer et réussir. Vous aussi.',
  'Prenez ce livre comme on prend un nouveau métier : avec humilité et avec ambition. À la dernière page, vous ne serez plus un spectateur du numérique. Vous en serez un acteur.',
  { centre: '*Kouadio Koffi Elisée*' },
  { centre: '*Fondateur de FOR LIFE, formateur*' },
];

const modeEmploi = [
  { h2: 'Comment utiliser ce livre' },
  'Tous les modules suivent **la même structure**. Au bout de deux ou trois modules, vous saurez toujours où vous en êtes.',
  { tableau: [['Étape', 'Ce que vous y trouvez'], [
    ['📖 **La situation**', 'Une histoire de la vie quotidienne où l\'informatique pose problème, ou pourrait aider.'],
    ['💡 **Le déclic**', 'L\'explication, toujours à partir d\'une image de la vie réelle, avant les mots techniques.'],
    ['🖱️ **Pas à pas**', 'Les gestes, étape par étape, à faire en même temps que vous lisez.'],
    ['⚠️ **Les pièges à éviter**', 'Les erreurs que tout le monde fait, et les réponses aux questions qu\'on n\'ose pas poser.'],
    ['✍️ **Exercices**', 'Trois paliers : 🟢 *Je m\'échauffe* (guidé), 🟡 *Je m\'entraîne* (semi-guidé), 🔴 *Je me lance* (seul).'],
    ['🧩 **Cas pratique**', 'On résout un vrai problème, souvent celui de l\'histoire du début.'],
    ['📌 **Ce que je retiens**', 'La fiche mémo du module, à relire avant de passer au suivant.'],
    ['🏆 **Mon défi de la semaine**', 'Une petite mission à faire dans votre vraie vie.'],
  ], [1.3, 3.4]] },
  { h3: 'Les encadrés de couleur' },
  { tableau: [['Couleur', 'Signification'], [
    ['🟩 Vert', 'Un conseil ou une règle essentielle à retenir.'],
    ['🟦 Bleu', 'Une question, une précision ou un exemple.'],
    ['🟪 Violet', 'Un chiffre, un déclic ou une méthode.'],
    ['🟥 Rouge', 'Un danger : lisez avec attention.'],
  ], [1, 3.6]] },
  { h3: 'Les personnages' },
  { tableau: [['Qui ?', 'Son histoire'], [
    ['**Tantie Akissi**, 52 ans', 'Vendeuse de pagnes au marché d\'Adjamé depuis trente ans. Sa fille lui a offert un ordinateur qu\'elle n\'ose pas toucher.'],
    ['**Yao**, 22 ans', 'Étudiant à Cocody. Très rapide sur son téléphone, perdu devant un ordinateur.'],
    ['**Mariam**, 34 ans', 'Secrétaire dans une entreprise de Treichville. Elle veut devenir assistante de direction.'],
    ['**Koffi**, 28 ans', 'Il vient d\'ouvrir un secrétariat public à Yopougon. Ambitieux, parfois trop confiant.'],
    ['**M. Kouassi**', 'Le formateur. Patient, plein d\'humour, il répond à toutes les questions, même celles qu\'on n\'ose pas poser.'],
  ], [1.3, 3.4]] },
  { encadre: { titre: '📚  Les logiciels utilisés', style: 'bleu', contenu: [
    'Ce livre utilise **Windows 11** et **Microsoft 365** (Word et Excel) en français. Si votre ordinateur a une autre version (Windows 10, Office 2019 ou 2021), la plupart des gestes sont identiques ; seuls quelques boutons peuvent changer de place.',
  ] } },
];

const test = [
  { h2: 'Test de positionnement : par où commencer ?' },
  'Ce petit test vous dit par où commencer. Soyez honnête : il n\'y a ni note ni jugement. Cochez **Oui** seulement si vous savez le faire **seul, sans aide**.',
  { tableau: [['Je sais…', 'Oui', 'Non'], [
    ['1. Allumer et éteindre correctement un ordinateur', '☐', '☐'],
    ['2. Faire un double-clic et un clic droit avec la souris', '☐', '☐'],
    ['3. Écrire un @ et une lettre accentuée (é, ê) au clavier', '☐', '☐'],
    ['4. Ouvrir un programme à partir du menu Démarrer', '☐', '☐'],
    ['5. Passer d\'une fenêtre à une autre', '☐', '☐'],
    ['6. Créer un dossier et y ranger un fichier', '☐', '☐'],
    ['7. Récupérer un fichier supprimé par erreur', '☐', '☐'],
    ['8. Écrire une lettre dans Word et l\'enregistrer', '☐', '☐'],
    ['9. Faire une addition automatique dans Excel', '☐', '☐'],
    ['10. Trouver une information fiable sur Internet', '☐', '☐'],
    ['11. Envoyer un e-mail avec une pièce jointe', '☐', '☐'],
    ['12. Transférer une photo du téléphone vers l\'ordinateur', '☐', '☐'],
    ['13. Créer un mot de passe solide', '☐', '☐'],
    ['14. Reconnaître un message d\'arnaque', '☐', '☐'],
    ['15. Remplir un formulaire administratif en ligne', '☐', '☐'],
  ], [4, 0.5, 0.5]] },
  { h3: 'Mon résultat' },
  { tableau: [['Nombre de « Oui »', 'Mon parcours conseillé'], [
    ['**0 à 5**', 'Commencez au **module 0** et suivez tout le livre dans l\'ordre. Il a été écrit pour vous.'],
    ['**6 à 10**', 'Lisez rapidement les modules 0 à 3 (faites au moins leurs fiches « Ce que je retiens »), puis travaillez sérieusement à partir du **premier module** correspondant à une question où vous avez répondu « Non ».'],
    ['**11 à 15**', 'Faites les modules 10 et 11 et le projet final, puis passez au **Tome 2**, *Maîtriser l\'outil*.'],
  ], [1.2, 4], C.violet] },
  { note: 'Refaites ce test à la fin du livre : vous mesurerez vos progrès.' },
];

const attestation = [
  vide(1200),
  { centre: '**ATTESTATION DE FIN DE PARCOURS**' },
  ligne('Tome 1 · Apprivoiser l\'ordinateur', { align: AlignmentType.CENTER, size: 36, bold: true, color: C.orange, after: 600 }),
  { centre: 'Je soussigné(e), formateur ou formatrice, atteste que' },
  { lignes: [''] },
  { centre: 'a suivi l\'ensemble des modules du Tome 1, réalisé les exercices et présenté avec succès le projet final « Mon dossier de candidature complet ».' },
  { vide: 300 },
  { centre: 'L\'apprenant sait désormais utiliser un ordinateur en autonomie, produire des documents simples, communiquer par e-mail, effectuer des démarches en ligne et se protéger des arnaques courantes.' },
  { vide: 600 },
  { lignes: ['Fait à ', 'Le ', 'Signature du formateur : ', 'Signature de l\'apprenant : '] },
  { vide: 400 },
  ligne('FOR LIFE', { align: AlignmentType.CENTER, size: 30, bold: true, color: C.orange }),
];

module.exports = { pageDeTitre, mentions, preface, modeEmploi, test, attestation };
