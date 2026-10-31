// Tome 3 · Module 8 : Sauvegarder chaque étape avec GitHub
const { C } = require('../outils/livre');

module.exports = {
  num: 8,
  titre: 'Sauvegarder chaque étape avec GitHub',
  sousTitre: 'L\'album photo de la construction, étage par étage',
  objectifs: [
    'comprendre le principe du **contrôle de versions** ;',
    'relier son projet à un **dépôt GitHub** ;',
    'faire des **commits** clairs et lire l\'**historique** ;',
    'revenir à une **version précédente** ;',
    'utiliser les **branches** pour essayer sans risque, et écrire un **README**.',
  ],
  duree: 'Trois heures', materiel: 'Votre compte GitHub, votre projet', prerequis: 'Modules 1 à 7',

  situation: [
    { h2: 'Le projet disparu' },
    'Un matin, Yao ouvre son outil de vibe coding : son compte a été suspendu « pour vérification de paiement ». Sa carte a été refusée pour l\'abonnement du mois. L\'application de la tontine, trois semaines de travail, est inaccessible. Les membres l\'utilisent tous les jours.',
    'Deux jours d\'angoisse plus tard, le compte est rétabli. Yao a eu très peur.',
    { d: ['Yao', 'Si le compte avait été fermé, j\'aurais tout perdu ?'] },
    { d: ['M. Kouassi', 'Oui, Yao. Ton travail ne doit jamais dépendre d\'un seul endroit. Le code doit avoir sa maison à lui, avec l\'histoire de chaque étape. Cette maison, c\'est GitHub.'] },
  ],

  declic: [
    { h2: 'L\'album photo de la construction' },
    'Quand on construit une maison, certains prennent une photo à chaque étape : les fondations, le premier mur, la dalle, la toiture. Si un jour on veut savoir où passe un tuyau, on regarde l\'album. **Git** est cet album pour le code : chaque étape enregistrée s\'appelle un **commit**, avec une date, un auteur et un message. **GitHub** est le site où l\'album est rangé, en sécurité, en ligne.',
    { tableau: [['Mot', 'Dans l\'album photo…', 'Dans GitHub'], [
      ['**Dépôt** (repository)', 'L\'album d\'un chantier', 'Le dossier en ligne qui contient tout le code et son histoire'],
      ['**Commit**', 'Une photo datée avec une légende', 'Un enregistrement des modifications, avec un message'],
      ['**Historique**', 'Feuilleter l\'album', 'La liste de tous les commits'],
      ['**Branche**', 'Un album de brouillon pour essayer une extension, sans toucher à l\'album principal', 'Une version parallèle du code pour essayer'],
      ['**Fusion** (merge)', 'Coller les photos du brouillon dans l\'album principal', 'Intégrer une branche validée'],
      ['**README**', 'La première page de l\'album, qui explique le chantier', 'La notice du projet'],
    ], [1.3, 2, 2]] },
    { encadre: { titre: '🔑  Trois raisons d\'utiliser GitHub', style: 'vert', contenu: [
      { puces: [
        '**La sécurité** : votre code existe ailleurs que dans l\'outil de vibe coding.',
        '**La liberté** : vous pouvez changer d\'outil, d\'hébergeur, ou confier le projet à quelqu\'un d\'autre.',
        '**La mémoire** : vous pouvez revenir à n\'importe quelle étape, et comprendre ce qui a changé.',
      ] },
    ] } },
  ],

  pasAPas: [
    { h2: 'Étape 1 : relier le projet à GitHub' },
    { etapes: [
      'Connectez-vous à **github.com** (compte créé au module 1, avec double authentification).',
      'Dans votre constructeur d\'applications, cherchez **GitHub** dans les réglages du projet ou l\'intégration (souvent un bouton « Connect to GitHub » ou « Export to GitHub »).',
      'Autorisez l\'outil à accéder à votre compte GitHub, puis créez un nouveau **dépôt**. Choisissez **Private** (privé) pour un projet client.',
      'Selon l\'outil, chaque modification sera ensuite enregistrée automatiquement dans GitHub, ou vous devrez cliquer sur un bouton de synchronisation.',
      'Ouvrez votre dépôt sur github.com : vous voyez vos fichiers.',
    ] },
    { h2: 'Étape 2 : lire l\'historique' },
    { etapes: [
      'Sur la page du dépôt, cliquez sur **Commits** (avec une petite horloge).',
      'Chaque ligne est une étape : message, auteur, date. Cliquez sur une ligne pour voir **ce qui a changé** : en vert les lignes ajoutées, en rouge les lignes supprimées.',
      'Si les messages sont vagues (« update », « changes »), demandez à votre outil ou à l\'IA d\'écrire des messages clairs : « Ajout du calendrier des passages », « Correction du décalage horaire des rendez-vous ».',
    ] },
    { img: 'github', illus: 'Capture d\'écran de GitHub : la liste des commits d\'un dépôt « tontine-allee-b » avec des messages clairs, et à côté le détail d\'un commit montrant des lignes ajoutées en vert et supprimées en rouge.' },
    { h2: 'Étape 3 : revenir en arrière' },
    { puces: [
      '**Le plus simple** : utiliser l\'historique de votre outil de vibe coding pour restaurer une version, qui sera ensuite enregistrée dans GitHub.',
      '**Depuis GitHub** : demandez à un agent de code ou à l\'IA de votre outil : « Reviens à l\'état du code du commit [message ou numéro], sans perdre l\'historique. » En langage Git, on parle de **revert**.',
      'Ne supprimez **jamais** l\'historique pour « faire propre » : c\'est votre assurance.',
    ] },
    { h2: 'Étape 4 : les branches pour essayer sans risque' },
    'Vous voulez essayer une grosse nouveauté (le paiement Mobile Money, par exemple) sans risquer l\'application que les membres utilisent ? Créez une **branche**.',
    { etapes: [
      'Dans votre outil (s\'il gère les branches) ou sur GitHub : créez une branche **essai-paiement**.',
      'Travaillez sur cette branche ; l\'application principale (branche **main**) ne bouge pas.',
      'Quand tout est validé, **fusionnez** la branche dans main (sur GitHub, on passe par une **Pull Request** : une demande de fusion, qui montre toutes les modifications avant de les accepter).',
      'Si l\'essai échoue, abandonnez simplement la branche.',
    ] },
    { h2: 'Étape 5 : le README, la notice du projet' },
    { encadre: { titre: '✍️  Prompt', style: 'bleu', contenu: [
      '« Rédige un fichier README.md en français pour ce projet : à quoi sert l\'application, pour qui, les fonctionnalités, les technologies et services utilisés, comment la lancer, où sont configurées les variables d\'environnement (sans aucune valeur secrète), et qui contacter. »',
    ] } },
    'Un bon README permet à quelqu\'un d\'autre (ou à vous dans six mois) de reprendre le projet sans tout redécouvrir.',
  ],

  pieges: {
    lignes: [
      ['🗄️ Garder son code seulement dans l\'outil de vibe coding', 'Compte suspendu, outil fermé : tout est perdu.', 'Relier chaque projet à GitHub dès le début.'],
      ['🌍 Mettre un projet client en dépôt public', 'Le code et parfois des secrets sont visibles par tous.', 'Dépôt privé par défaut.'],
      ['🔑 Envoyer le fichier .env sur GitHub', 'Les clés secrètes sont exposées, des robots les cherchent en permanence.', 'Vérifier que .env est ignoré ; changer immédiatement toute clé publiée par erreur.'],
      ['📝 Des messages de commit vagues', 'Impossible de retrouver la bonne étape.', 'Un message qui dit ce qui a changé et pourquoi.'],
      ['🎰 Essayer les grosses nouveautés directement sur main', 'L\'application des utilisateurs casse.', 'Une branche pour chaque essai important.'],
    ],
    questions: [
      ['GitHub, c\'est pour les programmeurs. Je vais m\'y perdre ?', 'Vous n\'utiliserez au début que trois choses : le dépôt, l\'historique des commits et le README. Votre outil de vibe coding fait le reste. Et l\'IA peut vous expliquer tout ce que vous voyez.'],
      ['À qui appartient le code que j\'ai fait générer pour un client ?', 'C\'est une question de **contrat** (module 13). En général, on prévoit que le code devient la propriété du client à la fin du paiement, et on lui transfère le dépôt GitHub ou on l\'y ajoute comme propriétaire.'],
    ],
  },

  exercices: {
    echauffe: [
      { h3: 'Exercice 1 : le vocabulaire' },
      { tableau: [['Je veux…', 'Le mot Git ou GitHub'], [
        ['L\'album complet d\'un projet', ''], ['Une photo datée d\'une étape', ''], ['Un brouillon pour essayer', ''],
        ['Intégrer le brouillon validé', ''], ['La notice du projet', ''],
      ], [3, 2], C.bleu] },
    ],
    entraine: [
      { h3: 'Exercice 2 : mon dépôt' },
      { cases: [
        'Je relie mon projet à un dépôt GitHub privé.',
        'Je vérifie que le fichier .env n\'apparaît pas dans le dépôt.',
        'Je fais trois modifications et je retrouve les trois commits dans l\'historique.',
        'Je reviens à l\'avant-dernière version, puis à la dernière.',
        'Je fais générer un README, je le relis et je le corrige.',
      ] },
    ],
    lance: [
      { h3: 'Exercice 3 : ma première branche' },
      'Créez une branche pour essayer une nouveauté dans votre projet personnel (un nouveau thème de couleurs, par exemple). Faites-la valider par votre binôme, puis fusionnez-la avec une Pull Request.',
    ],
  },

  cas: [
    { h2: 'Le départ de Yao' },
    'Yao part six mois en stage à Dakar. Koffi doit confier la maintenance de son application de rendez-vous à une autre personne, Awa.',
    { etapes: [
      'Que doit contenir le dépôt GitHub pour qu\'Awa puisse reprendre le projet ?',
      'Comment donner accès à Awa sans lui donner le compte de Yao ?',
      'Quelles informations ne doivent **pas** être dans le dépôt, et comment les transmettre ?',
    ] },
  ],

  retiens: [
    '**Git** = l\'album photo du code ; **GitHub** = l\'endroit où il est rangé en ligne.',
    '**Dépôt**, **commit**, **historique**, **branche**, **fusion** (Pull Request), **README**.',
    'Chaque projet relié à GitHub **dès le début**, en dépôt **privé** pour un client.',
    'Des messages de commit **clairs** ; on ne supprime jamais l\'historique.',
    'Une **branche** pour chaque essai important.',
    'Le fichier **.env** ne va **jamais** sur GitHub.',
  ],
  defi: [
    'Cette semaine, reliez tous vos projets à GitHub, avec un README pour chacun. Vérifiez qu\'aucun secret n\'a été publié.',
  ],
  motDeLaFin: 'Avant de partir à Dakar, Yao a ajouté Awa comme collaboratrice du dépôt et lui a laissé un README de deux pages. La première semaine, Awa a corrigé un bug en suivant le carnet de bugs. Elle a écrit à Yao : « Ton album photo est tellement clair que j\'ai l\'impression d\'avoir construit la maison avec toi. »',
  quiz: [
    'Un commit, c\'est… **a)** une étape enregistrée avec un message · **b)** un mot de passe · **c)** un hébergeur.',
    'Pour un projet client, le dépôt doit être… **a)** public · **b)** privé · **c)** supprimé.',
    'Pour essayer une grosse nouveauté sans risque, j\'utilise… **a)** une branche · **b)** le fichier .env · **c)** la Corbeille.',
    'Le fichier .env sur GitHub, c\'est… **a)** obligatoire · **b)** une fuite de secrets à éviter absolument · **c)** sans importance.',
  ],
  corriges: [
    ['Exercice 1', 'Dépôt · Commit · Branche · Fusion (Pull Request) · README.'],
    ['Cas pratique', '**1.** Tout le code, un historique de commits clairs, un README complet (fonctionnalités, services utilisés, lancement, emplacement des variables d\'environnement), le carnet de bugs. **2.** L\'ajouter comme collaboratrice du dépôt (Settings → Collaborators) avec son propre compte GitHub, et lui donner ses propres accès aux services (hébergeur, base de données) ; idéalement, le dépôt appartient au compte de Koffi. **3.** Les clés secrètes, mots de passe, fichier .env, données des clients : les transmettre en direct par un canal sûr (gestionnaire de mots de passe partagé), puis changer les clés après le départ de Yao.'],
    ['Mini-quiz', '1-a · 2-b · 3-a · 4-b'],
  ],
  glossaire: [
    ['Git', 'Le système qui enregistre l\'historique des modifications du code.'],
    ['GitHub', 'Le site en ligne qui héberge les dépôts Git et facilite le travail à plusieurs.'],
    ['Dépôt (repository)', 'Le dossier d\'un projet avec tout son code et son historique.'],
    ['Commit', 'Un enregistrement daté des modifications, avec un message.'],
    ['Branche', 'Une version parallèle du code, pour essayer sans toucher à la version principale.'],
    ['Pull Request', 'Une demande de fusion d\'une branche, qui montre les modifications avant de les accepter.'],
    ['README', 'Le fichier qui présente et explique un projet.'],
  ],
};
