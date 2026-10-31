// Tome 3 · Module 4 : L'art de parler à l'IA pour coder
const { C } = require('../outils/livre');

module.exports = {
  num: 4,
  titre: 'L\'art de parler à l\'IA pour coder',
  sousTitre: 'Commander chez le couturier : plus on est précis, moins on retouche',
  objectifs: [
    'rédiger un **premier prompt** complet à partir du cahier des charges ;',
    'avancer **par petites touches**, une demande à la fois ;',
    'utiliser le **mode plan** : faire réfléchir l\'IA avant qu\'elle construise ;',
    'donner des **références visuelles** et des **captures d\'écran** ;',
    'se constituer une **bibliothèque de prompts** réutilisables.',
  ],
  duree: 'Quatre heures', materiel: 'Votre constructeur d\'applications, votre cahier des charges (module 2)', prerequis: 'Modules 1 à 3',

  situation: [
    { h2: 'Le couturier et la robe de Mariam' },
    'Pour le mariage de sa cousine, Mariam avait dit au couturier : « Fais-moi une belle robe. » Résultat : une robe rose à volants, magnifique… pour quelqu\'un d\'autre. Trois retouches, deux disputes, une robe finalement correcte, la veille au soir.',
    'Le mois suivant, elle est revenue avec une photo d\'un modèle, le tissu, ses mesures, la date, et une phrase : « Comme sur la photo, mais manches trois-quarts et sans traîne. » Robe parfaite du premier coup.',
    { d: ['Mariam', 'Avec l\'IA, c\'est pareil, non ?'] },
    { d: ['M. Kouassi', 'Exactement pareil, Mariam. L\'IA est un couturier très rapide. Si vous lui donnez un modèle, des mesures et des consignes claires, il coud juste. Sinon, il improvise… et il improvise très bien, mais pas forcément ce que vous voulez.'] },
  ],

  declic: [
    { h2: 'Le bon de commande du couturier' },
    'Le premier prompt d\'une application, c\'est le **bon de commande** : il reprend le cahier des charges sous une forme que l\'IA comprend bien. Ensuite, chaque demande suivante est une **retouche** précise.',
    { tableau: [['Rubrique du premier prompt', 'Ce qu\'on y met'], [
      ['**But**', 'Ce que fait l\'application, pour qui, en une ou deux phrases.'],
      ['**Utilisateurs et rôles**', 'Qui l\'utilise, et qui a le droit de faire quoi.'],
      ['**Écrans**', 'La liste des pages, et ce que chacune contient.'],
      ['**Données**', 'Les informations à enregistrer, et leurs liens.'],
      ['**Règles**', 'Les règles de gestion et les cas particuliers.'],
      ['**Style**', 'L\'ambiance, les couleurs, une référence de site ou une capture.'],
      ['**Contraintes**', 'Téléphone d\'abord, langue, légèreté, ce qu\'il ne faut **pas** faire.'],
      ['**Méthode**', '« Présente d\'abord ton plan, puis construis seulement la première étape. »'],
    ], [1.8, 3.2], C.violet] },
    { h3: 'Les cinq règles des retouches' },
    { etapes: [
      '**Une seule demande à la fois.** « Change la couleur du bouton » puis, une fois vérifié, « ajoute un filtre ». Si vous demandez cinq choses, l\'IA en ratera deux et vous ne saurez pas lesquelles.',
      '**Dites où.** « Sur la page Catalogue, dans la carte de chaque produit, sous le prix… »',
      '**Dites quoi, précisément.** Pas « c\'est moche », mais « le texte est trop petit sur téléphone, mets-le en 16 pixels au moins ».',
      '**Dites ce qu\'il ne faut pas toucher.** « Ne modifie rien d\'autre que ce bouton. »',
      '**Vérifiez avant de continuer.** Une retouche validée, puis la suivante.',
    ] },
    { encadre: { titre: '🔑  Le mode plan : réfléchir avant de construire', style: 'vert', contenu: [
      'La plupart des outils permettent de **discuter sans modifier le code** (un mode « plan », « discussion » ou « chat »). Utilisez-le pour toute demande importante : « Je veux ajouter les comptes utilisateurs. Ne code rien pour l\'instant : propose-moi deux façons de faire, avec leurs avantages et leurs risques. » Vous choisissez, puis vous lancez la construction.',
    ] } },
  ],

  pasAPas: [
    { h2: 'Étape 1 : transformer le cahier des charges en premier prompt' },
    { etapes: [
      'Reprenez le cahier des charges du module 2.',
      'Demandez de l\'aide à un assistant d\'IA : « Voici mon cahier des charges. Transforme-le en premier prompt pour un outil de création d\'applications, avec les rubriques But, Utilisateurs, Écrans, Données, Règles, Style, Contraintes, Méthode. Pose-moi des questions si quelque chose est flou. »',
      'Relisez et corrigez le prompt obtenu : c\'est **votre** commande.',
      'Terminez toujours par : « Présente d\'abord ton plan et pose-moi tes questions avant de commencer. »',
    ] },
    { h2: 'Étape 2 : donner des références visuelles' },
    { puces: [
      'Une **capture d\'écran** d\'un site dont vous aimez le style (**Windows + Maj + S**, puis collez-la dans la discussion) : « Inspire-toi de la mise en page de cette capture, sans copier le contenu. »',
      'Vos **croquis papier** du module 2, photographiés.',
      'Des **couleurs précises** : « orange #EA7822, vert #187A52, fond crème #F6EFE6 ».',
      'Une **capture de ce qui ne va pas**, avec la zone entourée : « Ici, le texte déborde sur téléphone. »',
    ] },
    { h2: 'Étape 3 : les modèles de retouches' },
    { tableau: [['Je veux…', 'Modèle de demande'], [
      ['Ajouter une fonction', '« Sur la page [X], ajoute [fonction] qui permet à [qui] de [quoi]. Quand [action], il doit se passer [résultat]. Ne modifie rien d\'autre. »'],
      ['Corriger l\'apparence', '« Sur téléphone, dans [zone], [problème précis]. Je voudrais [résultat attendu]. »'],
      ['Comprendre avant d\'agir', '« Ne code rien. Explique-moi comment tu ferais [X], quels fichiers tu modifierais et quels sont les risques. »'],
      ['Simplifier', '« Cette page est trop chargée. Propose une version plus simple qui garde seulement [éléments essentiels]. »'],
      ['Vérifier', '« Relis le code de [fonction] et liste les cas où elle pourrait ne pas marcher. »'],
      ['Revenir en arrière', '« Annule la dernière modification et reviens à la version où [ce qui marchait]. »'],
    ], [1.4, 3.6]] },
    { h2: 'Étape 4 : tenir sa bibliothèque de prompts' },
    'Dans votre journal de bord, gardez les prompts qui ont **bien marché**, classés par usage (premier prompt, retouche visuelle, ajout de données, correction d\'erreur, sécurité). Vous les adapterez d\'un projet à l\'autre. L\'annexe « La bibliothèque de prompts », à la fin de ce livre, vous en offre une première série.',
    { h2: 'Étape 5 : les instructions permanentes du projet' },
    'Beaucoup d\'outils permettent d\'enregistrer des **instructions de projet** (appelées « connaissances », « règles » ou « instructions personnalisées ») que l\'IA relit à chaque demande. Mettez-y ce qui ne change pas :',
    { encadre: { style: 'bleu', contenu: [
      '« Application en français, pour des utilisatrices ivoiriennes, souvent sur de petits téléphones avec peu de données. Montants en F CFA, sans décimales, avec espace des milliers. Dates au format JJ/MM/AAAA. Interface simple, gros boutons, textes courts. Ne jamais afficher de clé secrète dans le code de l\'interface. Avant toute modification importante, présenter un plan. »',
    ] } },
  ],

  pieges: {
    lignes: [
      ['📦 Tout demander en un seul message', 'L\'IA en fait la moitié, mal.', 'Une demande, une vérification.'],
      ['😤 « Ça ne marche pas, corrige ! »', 'L\'IA devine, et casse parfois autre chose.', 'Décrire le symptôme précis (module 7).'],
      ['🔄 Recommencer le projet à zéro à chaque difficulté', 'On perd tout le travail validé.', 'Revenir à la dernière version qui marchait.'],
      ['🧾 Oublier de dire ce qu\'il ne faut pas toucher', 'L\'IA « améliore » aussi ce qui allait bien.', '« Ne modifie rien d\'autre. »'],
      ['💸 Multiplier les petits messages inutiles', 'Beaucoup d\'outils comptent les messages ou les crédits.', 'Réfléchir en mode plan, puis une demande claire.'],
    ],
    questions: [
      ['Faut-il écrire ses prompts en anglais ?', 'Non : les outils comprennent très bien le français. Écrivez dans la langue où vous êtes le plus précis. Gardez simplement les termes techniques tels qu\'ils sont (bouton, page, base de données, API).'],
      ['L\'IA me répond qu\'elle a corrigé, mais rien n\'a changé. Pourquoi ?', 'Elle se trompe parfois sur ce qu\'elle a fait. Vérifiez toujours vous-même dans l\'aperçu, rafraîchissez la page, et si besoin demandez : « Montre-moi exactement les lignes que tu as modifiées. »'],
    ],
  },

  exercices: {
    echauffe: [
      { h3: 'Exercice 1 : réécrire des retouches vagues' },
      { lignes: ['« C\'est moche. » → ', '« Ajoute des trucs pour les clients. » → ', '« Le menu bug. » → '] },
    ],
    entraine: [
      { h3: 'Exercice 2 : le premier prompt de la tontine' },
      'À partir du cahier des charges de la tontine (module 2), rédigez le premier prompt complet avec les huit rubriques. Ne lancez pas encore la construction : nous le ferons au module 6.',
    ],
    lance: [
      { h3: 'Exercice 3 : ma bibliothèque' },
      'Créez dans votre journal de bord votre bibliothèque de prompts avec au moins dix modèles, classés par usage, et rédigez les instructions permanentes de votre projet personnel.',
    ],
  },

  cas: [
    { h2: 'Les demandes de Koffi' },
    'Koffi teste la première version de son application de rendez-vous et envoie d\'un coup à l\'IA : « Le calendrier est trop petit, il faut aussi que je puisse bloquer des jours, et les clients doivent recevoir un message, et mets mon logo, et le bouton est bizarre sur mon téléphone. »',
    { etapes: [
      'Combien de demandes différentes contient ce message ?',
      'Dans quel ordre les traiter, et pourquoi ?',
      'Réécrivez chacune selon les cinq règles des retouches.',
      'Laquelle mérite de passer d\'abord par le mode plan ?',
    ] },
  ],

  retiens: [
    'Le **premier prompt** est le bon de commande : But, Utilisateurs, Écrans, Données, Règles, Style, Contraintes, Méthode.',
    '« **Présente d\'abord ton plan** » avant toute construction importante.',
    'Retouches : **une à la fois**, dire **où**, **quoi**, et **ce qu\'il ne faut pas toucher**, puis **vérifier**.',
    'Des **références visuelles** : captures, croquis, couleurs précises.',
    'Une **bibliothèque de prompts** et des **instructions permanentes** de projet.',
  ],
  defi: [
    'Cette semaine, pour votre projet personnel, rédigez le premier prompt complet, faites-le relire par votre binôme comme s\'il était l\'IA (« qu\'est-ce que tu ne comprends pas ? »), puis lancez la construction de la première étape seulement.',
  ],
  motDeLaFin: 'Mariam a montré à Yao la photo de sa robe parfaite. Yao l\'a collée dans son journal de bord, à la première page, avec cette légende : « Un modèle, des mesures, une retouche à la fois. »',
  quiz: [
    'Pour une modification importante, je demande d\'abord à l\'IA… **a)** de tout coder vite · **b)** de présenter un plan sans coder · **c)** de recommencer le projet.',
    'Une bonne retouche contient… **a)** cinq demandes à la fois · **b)** où, quoi, et ce qu\'il ne faut pas toucher · **c)** seulement « corrige ».',
    'Les instructions permanentes servent à… **a)** répéter à chaque demande les règles fixes du projet · **b)** payer l\'abonnement · **c)** effacer l\'historique.',
    'L\'IA dit avoir corrigé mais rien n\'a changé. Je… **a)** la crois · **b)** vérifie moi-même et lui demande les lignes modifiées · **c)** abandonne.',
  ],
  corriges: [
    ['Exercice 1', 'Exemples : « Sur la page Accueil, les couleurs sont trop vives : utilise un fond crème #F6EFE6 et garde l\'orange seulement pour les boutons. » · « Sur la page Catalogue, ajoute un filtre par catégorie au-dessus de la grille de produits. » · « Sur téléphone, quand je touche l\'icône du menu, rien ne s\'ouvre. Le menu doit s\'ouvrir en plein écran. Ne modifie rien d\'autre. »'],
    ['Cas pratique', '**1.** Cinq : taille du calendrier, blocage de jours, message aux clients, logo, bouton sur téléphone. **2.** D\'abord ce qui bloque l\'usage (bouton sur téléphone, taille du calendrier), puis la fonction métier (bloquer des jours), puis le message aux clients (plus complexe), enfin le logo. **3.** Par exemple : « Sur téléphone, le bouton “Réserver” dépasse de l\'écran à droite. Il doit occuper toute la largeur, avec une marge de 16 pixels. Ne modifie rien d\'autre. » **4.** Le message aux clients : il implique un service externe (SMS, e-mail ou WhatsApp), des coûts et des données personnelles.'],
    ['Mini-quiz', '1-b · 2-b · 3-a · 4-b'],
  ],
  glossaire: [
    ['Prompt', 'La demande écrite adressée à l\'IA.'],
    ['Premier prompt', 'La demande initiale qui décrit toute l\'application, à partir du cahier des charges.'],
    ['Retouche', 'Une demande de modification précise, une à la fois.'],
    ['Mode plan', 'Un mode de discussion où l\'IA réfléchit et propose sans modifier le code.'],
    ['Instructions de projet', 'Des consignes permanentes que l\'IA relit à chaque demande.'],
    ['Bibliothèque de prompts', 'Une collection personnelle de demandes efficaces, réutilisables.'],
  ],
};
