// Tome 2 · Module 6 : Communiquer comme un professionnel
const { C } = require('../outils/livre');

module.exports = {
  num: 6,
  titre: 'Communiquer comme un professionnel',
  sousTitre: 'E-mail, agenda, visioconférence : la réunion qui commence à l\'heure',
  objectifs: [
    'organiser sa messagerie : **dossiers**, **règles**, **réponse d\'absence**, **envoi programmé** ;',
    'utiliser un **agenda** partagé et envoyer des **invitations** ;',
    'tenir compte des **fuseaux horaires** ;',
    'animer et suivre une **visioconférence** (Google Meet, Microsoft Teams, Zoom) ;',
    'rédiger un **ordre du jour** et un **compte rendu**.',
  ],
  duree: 'Quatre heures', materiel: 'Un ordinateur avec micro et caméra (ou un casque), un compte Google ou Microsoft', prerequis: 'Tome 1, module 8 ; module 5 de ce tome',

  situation: [
    { h2: 'La réunion Abidjan, Bouaké, Paris' },
    'Le directeur de Mariam veut réunir ses partenaires : le responsable de l\'usine de Bouaké et un client installé à Paris. Mariam envoie un message WhatsApp à chacun : « Réunion mardi à 10 h ». Mardi, à 10 h, à Abidjan, personne. Le partenaire de Bouaké attendait un lien qui n\'est jamais venu. Celui de Paris s\'est connecté… à 10 h, heure de Paris. Le directeur, lui, n\'avait pas noté la réunion dans son agenda.',
    { d: ['Mariam', 'J\'ai pourtant prévenu tout le monde !'] },
    { d: ['M. Kouassi', 'Tu as prévenu, Mariam, mais tu n\'as pas invité. Une vraie invitation arrive dans l\'agenda de chacun, à la bonne heure pour lui, avec le lien de la réunion et l\'ordre du jour. Et elle demande une réponse.'] },
  ],

  declic: [
    { h2: 'Le carnet de rendez-vous et le carton d\'invitation' },
    { tableau: [['Dans la vie…', 'Outil numérique', 'Ce qu\'il apporte'], [
      ['Le carnet de rendez-vous de la secrétaire', 'L\'**agenda** (Google Agenda, calendrier Outlook)', 'Disponible partout, partageable, avec des rappels automatiques'],
      ['Le carton d\'invitation avec « RSVP »', 'L\'**invitation** d\'agenda', 'L\'événement s\'ajoute chez l\'invité, qui répond Oui, Non ou Peut-être'],
      ['La réunion au salon', 'La **visioconférence**', 'Chacun reste chez soi, on se voit et on partage des documents'],
      ['Le secrétaire de séance', 'Le **compte rendu** partagé', 'Une trace écrite des décisions, avec qui fait quoi et pour quand'],
    ], [1.6, 1.8, 2.2]] },
    { h3: 'Les fuseaux horaires' },
    'Quand il est midi à Abidjan, le soleil n\'est pas au même endroit partout. La Côte d\'Ivoire est à l\'heure **GMT** (on dit aussi **UTC+0**) toute l\'année. La France est à **UTC+1** en hiver et **UTC+2** en été. Ainsi, une réunion à **10 h à Abidjan** a lieu à **11 h à Paris en hiver**, et à **midi à Paris en été**.',
    { encadre: { titre: '🔑  La bonne nouvelle', style: 'vert', contenu: [
      'Une invitation d\'agenda **convertit l\'heure toute seule** pour chaque invité, selon le fuseau de son appareil. C\'est la meilleure raison d\'inviter plutôt que de « prévenir ». Dans le message, précisez quand même : « 10 h heure d\'Abidjan (11 h à Paris) ».',
    ] } },
    { h3: 'Les bonnes manières numériques' },
    { puces: [
      'Un e-mail = **un sujet**, avec un objet précis. Répondez sous 24 à 48 heures, même pour dire « bien reçu, je reviens vers vous ».',
      '**Cc** pour informer, **Cci** pour masquer les adresses d\'une liste de destinataires qui ne se connaissent pas.',
      'En visio : **micro coupé** quand on ne parle pas, **caméra allumée** si possible, tenue correcte, fond rangé ou flouté, pas de conversation à côté.',
    ] },
  ],

  pasAPas: [
    { h2: 'Étape 1 : une messagerie bien tenue' },
    { tableau: [['Je veux…', 'Dans Gmail', 'Dans Outlook'], [
      ['Classer automatiquement les messages d\'un expéditeur', '⚙️ → **Voir tous les paramètres** → **Filtres et adresses bloquées** → **Créer un filtre**', 'Clic droit sur un message → **Règles** → **Créer une règle**'],
      ['Ranger par sujet', '**Libellés** (colonne de gauche → **Créer un libellé**)', '**Dossiers** (clic droit sur la boîte → **Nouveau dossier**)'],
      ['Répondre automatiquement pendant mes congés', '⚙️ → **Voir tous les paramètres** → **Réponse automatique**', '**Fichier** → **Réponses automatiques** (ou ⚙️ → **Réponses automatiques**)'],
      ['Programmer un envoi', 'Flèche à côté de **Envoyer** → **Programmer l\'envoi**', 'Flèche à côté de **Envoyer** → **Planifier l\'envoi**'],
      ['Une signature professionnelle', '⚙️ → **Voir tous les paramètres** → **Signature**', '⚙️ → **Comptes** → **Signatures**'],
    ], [1.5, 1.8, 1.8]] },
    { encadre: { titre: '✍️  La signature professionnelle', style: 'violet', contenu: [
      '**Mariam Koné**',
      'Assistante de direction · Société Ivoire Distribution',
      'Tél. : +225 07 00 00 00 00 · Abidjan, Treichville',
    ] } },
    { h2: 'Étape 2 : l\'invitation d\'agenda' },
    { etapes: [
      'Ouvrez **Google Agenda** (calendar.google.com) ou le **calendrier d\'Outlook**.',
      'Cliquez sur le créneau voulu, puis **Plus d\'options** (ou **Nouvel événement**).',
      'Titre clair : « Point trimestriel Abidjan, Bouaké, Paris ». Date, heure de début et de fin.',
      'Ajoutez les **invités** par leur adresse e-mail.',
      'Ajoutez la visioconférence : **Ajouter une visioconférence Google Meet** dans Google Agenda, ou **Réunion Teams** dans Outlook. Le lien est créé automatiquement.',
      'Dans la description, collez l\'**ordre du jour**. Joignez les documents depuis Drive ou OneDrive.',
      'Ajoutez une **notification** (rappel) trente minutes avant, puis **Enregistrer** → **Envoyer** les invitations.',
    ] },
    { img: 'agenda', illus: 'Capture d\'écran de Google Agenda : la fenêtre d\'un nouvel événement avec le titre, l\'horaire, les invités, le bouton « Rejoindre avec Google Meet » et l\'ordre du jour dans la description.' },
    { h2: 'Étape 3 : la visioconférence' },
    { tableau: [['Je veux…', 'Je fais… (les icônes sont similaires dans Meet, Teams et Zoom)'], [
      ['Rejoindre', 'Je clique sur le lien de l\'invitation, je vérifie micro et caméra dans l\'écran d\'attente, puis **Participer**.'],
      ['Couper ou activer mon micro', 'L\'icône **micro** en bas de l\'écran.'],
      ['Flouter mon arrière-plan', 'Les **trois points ⋯** → **Effets** ou **Arrière-plan** → **Flou**.'],
      ['Demander la parole', 'L\'icône **main levée**.'],
      ['Montrer un document', '**Partager l\'écran** → je choisis **une fenêtre** précise plutôt que l\'écran entier.'],
      ['Écrire sans interrompre', 'La **discussion** (bulle) : pour un lien, une question.'],
    ], [1.4, 3.6]] },
    { encadre: { titre: '📶  Économiser ses données mobiles', style: 'bleu', contenu: [
      'Une visioconférence avec vidéo peut consommer plusieurs centaines de mégaoctets par heure. Sur forfait mobile, coupez votre caméra quand ce n\'est pas indispensable, et préférez le Wi-Fi.',
    ] } },
    { h2: 'Étape 4 : ordre du jour et compte rendu' },
    { tableau: [['L\'ordre du jour (envoyé avant)', 'Le compte rendu (envoyé dans les 24 h)'], [
      ['Objet, date, heure (avec fuseaux), lien', 'Date, participants, absents'],
      ['Trois à cinq points, avec la durée de chacun', 'Pour chaque point : ce qui a été décidé'],
      ['Les documents à lire avant', 'Le tableau des actions : **Quoi ? Qui ? Pour quand ?**'],
      ['Qui anime, qui prend les notes', 'La date de la prochaine réunion'],
    ], [2.5, 2.5]] },
  ],

  pieges: {
    lignes: [
      ['🕐 Oublier le fuseau horaire', 'Des invités arrivent une ou deux heures en retard ou en avance.', 'Une invitation d\'agenda, et l\'heure précisée dans les deux fuseaux.'],
      ['🖥️ Partager tout son écran', 'Le public voit vos notifications WhatsApp et vos onglets personnels.', 'Partager une seule fenêtre ; activer le mode Ne pas déranger.'],
      ['🎙️ Laisser son micro ouvert', 'Bruits de klaxon, de bébé, de conversation privée.', 'Micro coupé par défaut.'],
      ['👥 Répondre à tous pour dire « merci »', 'Vingt personnes reçoivent un message inutile.', 'Répondre seulement à l\'expéditeur.'],
      ['📝 Pas de compte rendu', 'Personne ne se souvient des décisions ; on en rediscute à la réunion suivante.', 'Le tableau Quoi, Qui, Pour quand, envoyé dans les 24 h.'],
    ],
    questions: [
      ['Mes invités n\'ont pas de compte Google. Ils peuvent rejoindre Meet ?', 'Oui : un lien Google Meet s\'ouvre dans le navigateur. Selon les réglages de la réunion, la personne peut devoir attendre que l\'organisateur l\'admette. Pour Teams et Zoom, un navigateur suffit aussi, l\'application est seulement plus confortable.'],
      ['Ma connexion coupe pendant la réunion. Que faire ?', 'Coupez votre caméra, fermez les autres onglets et téléchargements, rapprochez-vous du Wi-Fi. En dernier recours, beaucoup de réunions proposent un **numéro de téléphone** pour participer en audio seulement.'],
    ],
  },

  exercices: {
    echauffe: [
      { h3: 'Exercice 1 : quelle heure chez eux ?' },
      { tableau: [['Réunion à Abidjan', 'Heure à Paris en hiver', 'Heure à Paris en été'], [
        ['9 h', '', ''], ['14 h 30', '', ''], ['17 h', '', ''],
      ], [1.6, 1.6, 1.6], C.bleu] },
    ],
    entraine: [
      { h3: 'Exercice 2 : ma messagerie en ordre' },
      { cases: [
        'Je crée trois libellés (ou dossiers) : Travail, Administratif, Famille.',
        'Je crée un filtre (ou une règle) qui range automatiquement les messages d\'un expéditeur.',
        'Je configure ma signature professionnelle.',
        'Je programme l\'envoi d\'un e-mail pour demain à 8 h.',
      ] },
    ],
    lance: [
      { h3: 'Exercice 3 : ma première visio organisée' },
      'Organisez une visioconférence de vingt minutes avec deux personnes : invitation d\'agenda avec lien et ordre du jour, partage d\'une fenêtre pendant la réunion, puis compte rendu envoyé avec le tableau Quoi, Qui, Pour quand.',
    ],
  },

  cas: [
    { h2: 'Rattraper la réunion manquée' },
    'Le directeur demande à Mariam de réorganiser la réunion, en février, un mardi, avec Bouaké et Paris, pour une heure.',
    { etapes: [
      'Quel créneau proposer pour que chacun soit à une heure de travail raisonnable ? Donnez l\'heure à Abidjan, Bouaké et Paris.',
      'Rédigez l\'invitation : titre, description avec ordre du jour, invités, rappel.',
      'Quelles consignes donner au directeur, qui n\'a jamais fait de visioconférence ?',
      'Préparez le modèle du compte rendu.',
    ] },
  ],

  retiens: [
    'On n\'informe pas : on **invite**, avec l\'agenda. L\'invitation contient l\'heure, le **lien** et l\'**ordre du jour**.',
    'Côte d\'Ivoire : **UTC+0** toute l\'année. Paris : **+1 h** en hiver, **+2 h** en été.',
    'Messagerie : **libellés/dossiers**, **filtres/règles**, **réponse automatique**, **envoi programmé**, **signature**.',
    'En visio : **micro coupé**, partage d\'**une fenêtre**, main levée, discussion.',
    'Compte rendu sous 24 h : **Quoi ? Qui ? Pour quand ?**',
  ],
  defi: [
    'Cette semaine, remplacez au moins un « je te préviens sur WhatsApp » par une vraie invitation d\'agenda, et envoyez un compte rendu après une réunion (même familiale ou associative).',
  ],
  motDeLaFin: 'En février, la réunion a commencé à 10 h pile à Abidjan et Bouaké, 11 h à Paris. Le directeur avait reçu un rappel sur son téléphone. Le client de Paris a écrit ensuite : « Réunion parfaitement organisée, compte rendu reçu avant même que je rentre chez moi. » Le directeur l\'a transféré à Mariam avec un seul mot : « Bravo ».',
  quiz: [
    'Une réunion à 15 h à Abidjan a lieu à Paris, en été, à… **a)** 15 h · **b)** 16 h · **c)** 17 h.',
    'L\'avantage d\'une invitation d\'agenda est que… **a)** elle convertit l\'heure selon le fuseau de chacun · **b)** elle est en couleur · **c)** elle est payante.',
    'Pour montrer seulement un document en visio, je partage… **a)** tout mon écran · **b)** une fenêtre précise · **c)** mon fond d\'écran.',
    'Un bon compte rendu indique pour chaque action… **a)** quoi, qui, pour quand · **b)** la météo · **c)** le nom de la salle.',
  ],
  corriges: [
    ['Exercice 1', '9 h → 10 h (hiver), 11 h (été) · 14 h 30 → 15 h 30, 16 h 30 · 17 h → 18 h, 19 h.'],
    ['Cas pratique', '**1.** Par exemple 10 h à Abidjan et Bouaké (même fuseau), soit 11 h à Paris en février. **2.** Titre : « Point trimestriel Ivoire Distribution » ; description : ordre du jour en trois ou quatre points avec durées, documents joints ; invités : partenaires de Bouaké et de Paris, le directeur ; lien Meet ou Teams ; rappel la veille et 30 minutes avant. **3.** Tester le lien la veille, arriver 5 minutes avant, micro coupé quand il ne parle pas, caméra allumée, partager une fenêtre, lieu calme. **4.** Date, participants, absents ; décisions par point ; tableau Quoi, Qui, Pour quand ; prochaine réunion.'],
    ['Mini-quiz', '1-c · 2-a · 3-b · 4-a'],
  ],
  glossaire: [
    ['Agenda partagé', 'Un calendrier en ligne consultable et modifiable par plusieurs personnes.'],
    ['Invitation d\'agenda', 'Un événement envoyé par e-mail qui s\'ajoute au calendrier de l\'invité, avec réponse.'],
    ['Fuseau horaire', 'Une zone du globe qui partage la même heure légale (UTC+0 pour la Côte d\'Ivoire).'],
    ['Visioconférence', 'Une réunion à distance avec image et son, par Internet.'],
    ['Filtre / règle de messagerie', 'Une consigne qui classe ou traite automatiquement certains e-mails.'],
    ['Ordre du jour', 'La liste des points à traiter pendant une réunion.'],
    ['Compte rendu', 'Le résumé écrit des décisions d\'une réunion, avec les actions à mener.'],
  ],
};
