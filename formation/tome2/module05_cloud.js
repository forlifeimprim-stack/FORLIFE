// Tome 2 · Module 5 : Le nuage (cloud) et le travail à plusieurs
const { C } = require('../outils/livre');

module.exports = {
  num: 5,
  titre: 'Le nuage et le travail à plusieurs',
  sousTitre: 'Un seul cahier sur la table commune',
  objectifs: [
    'comprendre ce qu\'est le **stockage en ligne** et la **synchronisation** ;',
    'utiliser **Google Drive** et **OneDrive** pour ranger, retrouver et sauvegarder ;',
    '**partager** un fichier en choisissant les **droits** de chacun ;',
    '**travailler à plusieurs** sur le même document en même temps, avec **commentaires** et **historique des versions** ;',
    'créer un **formulaire en ligne** pour collecter des réponses.',
  ],
  duree: 'Cinq heures', materiel: 'Un ordinateur connecté, un compte Google et un compte Microsoft', prerequis: 'Tome 1 ; modules 2 et 3 de ce tome',

  situation: [
    { h2: 'Le budget du mariage' },
    'Mariam fait partie du comité d\'organisation du mariage de son cousin : huit personnes, un budget de 6 millions. Le tableau du budget circule sur WhatsApp : **budget.xlsx**, **budget_v2.xlsx**, **budget_final.xlsx**, **budget_final_Mariam.xlsx**, **budget_final_VRAI_tonton.xlsx**…',
    'Le traiteur a été payé deux fois. La location des chaises n\'apparaît dans aucune version. Tonton Séraphin jure qu\'il a modifié le fichier « hier soir », mais personne ne sait lequel.',
    { d: ['Mariam', 'Huit personnes, huit versions, zéro vérité !'] },
    { d: ['M. Kouassi', 'Parce que chacun travaille sur sa photocopie. Il faut un seul cahier, posé sur une table commune, où tout le monde écrit. Et ce cahier garde la trace de qui a écrit quoi, et quand.'] },
  ],

  declic: [
    { h2: 'Le nuage, c\'est l\'entrepôt partagé' },
    'Le **cloud** (le « nuage ») n\'est pas dans le ciel : ce sont d\'immenses ordinateurs, dans des centres de données, qui gardent vos fichiers pour vous. Comme un entrepôt sécurisé où vous louez un espace : vous y déposez vos affaires, vous les retrouvez depuis n\'importe où, et vous pouvez donner une clé à d\'autres.',
    { tableau: [['Service', 'Espace gratuit', 'Idéal pour…'], [
      ['**Google Drive**', '15 Go, partagés avec Gmail et Google Photos', 'Travailler à plusieurs avec Google Docs, Sheets, Forms'],
      ['**OneDrive** (Microsoft)', '5 Go ; 1 To avec un abonnement Microsoft 365', 'Sauvegarder ses dossiers Windows et travailler à plusieurs dans Word et Excel'],
    ], [1.3, 1.8, 2.4]] },
    { h3: 'Trois clés différentes pour trois rôles' },
    { tableau: [['Droit', 'Comme dans la vie…', 'Il peut…'], [
      ['**Lecteur**', 'Lire le cahier affiché au mur', 'Voir, sans rien changer'],
      ['**Commentateur**', 'Coller des post-it sur le cahier', 'Voir et proposer des remarques'],
      ['**Éditeur**', 'Avoir le stylo', 'Modifier, ajouter, supprimer'],
    ], [1.2, 2, 2]] },
    { h3: 'Synchroniser n\'est pas sauvegarder' },
    'Avec la **synchronisation**, le même dossier existe sur votre ordinateur et dans le nuage : ce que vous changez d\'un côté change de l\'autre. C\'est pratique… mais si vous **supprimez** un fichier sur l\'ordinateur, il est supprimé **aussi** dans le nuage. La synchronisation n\'est donc pas, à elle seule, une sauvegarde (nous y reviendrons au module 8). Heureusement, Drive et OneDrive gardent une **corbeille** pendant plusieurs semaines.',
  ],

  pasAPas: [
    { h2: 'Étape 1 : Google Drive' },
    { etapes: [
      'Allez sur **drive.google.com** avec votre compte Gmail.',
      '**+ Nouveau** → **Dossier** : créez **Mariage Serge et Aïcha**.',
      'Pour y mettre des fichiers : glissez-les depuis l\'Explorateur dans la fenêtre du navigateur, ou **+ Nouveau** → **Importer un fichier**.',
      'Pour créer directement un tableau partagé : **+ Nouveau** → **Google Sheets**. Il fonctionne comme Excel, avec les mêmes formules.',
      'Sur le téléphone, l\'application **Google Drive** donne accès aux mêmes fichiers.',
    ] },
    { h2: 'Étape 2 : partager avec les bons droits' },
    { etapes: [
      'Clic droit sur le dossier ou le fichier → **Partager**.',
      'Tapez les adresses e-mail des membres du comité.',
      'Choisissez le rôle de chacun : **Lecteur**, **Commentateur** ou **Éditeur**. Ici, le trésorier et Mariam sont éditeurs ; les autres commentateurs.',
      'Ajoutez un message (« Voici le budget officiel, merci de ne plus utiliser les versions WhatsApp »), puis **Envoyer**.',
      'Pour partager par lien : dans **Accès général**, choisissez **Limité** (seules les personnes ajoutées) pour un document sensible. **Tous les utilisateurs disposant du lien** seulement pour des documents publics.',
    ] },
    { illus: 'Capture d\'écran de la fenêtre « Partager » de Google Drive : les personnes ajoutées avec leur rôle (Éditeur, Commentateur), le menu des rôles ouvert, et la section Accès général réglée sur « Limité ».' },
    { h2: 'Étape 3 : travailler ensemble, en même temps' },
    { puces: [
      'Ouvrez le tableau à plusieurs : chacun voit le **curseur coloré** des autres en temps réel. Plus de versions multiples : il n\'y a qu\'**un** fichier.',
      '**Commenter** : sélectionnez une cellule ou un passage → **Insertion** → **Commentaire** (ou l\'icône bulle). Tapez **@** suivi du nom d\'un membre pour qu\'il reçoive une notification : « @Séraphin, merci de confirmer le prix des chaises ».',
      '**Historique des versions** : **Fichier** → **Historique des versions** → **Afficher l\'historique des versions**. Vous voyez qui a modifié quoi et quand, et vous pouvez **restaurer** une ancienne version. Fini le « je l\'ai modifié hier soir ».',
    ] },
    { h2: 'Étape 4 : OneDrive et vos fichiers Word et Excel' },
    { etapes: [
      'Sur Windows 11, **OneDrive** est déjà installé : son dossier apparaît dans l\'Explorateur, et son icône en forme de nuage dans la zone de notification. Connectez-vous avec votre compte Microsoft.',
      'Pour protéger vos dossiers importants : icône OneDrive → **roue dentée** → **Paramètres** → **Synchronisation et sauvegarde** → **Gérer la sauvegarde**, puis choisissez **Bureau**, **Documents**, **Images**.',
      'Dans Word ou Excel, pour travailler à plusieurs : enregistrez le fichier dans OneDrive, puis bouton **Partager** en haut à droite → ajoutez les personnes et leurs droits.',
      'Les icônes indiquent l\'état des fichiers : **nuage** (en ligne seulement), **coche verte** (disponible aussi sur l\'ordinateur), **flèches** (synchronisation en cours).',
    ] },
    { h2: 'Étape 5 : un formulaire pour collecter les réponses' },
    'Pour connaître le nombre d\'invités de chaque famille, plutôt que cinquante appels :',
    { etapes: [
      '**drive.google.com** → **+ Nouveau** → **Plus** → **Google Forms** → **Formulaire vierge**.',
      'Donnez un titre (« Confirmation de présence au mariage ») et ajoutez les questions : **Nom de la famille** (réponse courte), **Nombre de personnes** (réponse courte, avec validation numérique), **Présence à la messe** (choix multiples : Oui / Non).',
      'Rendez les questions importantes **obligatoires** avec l\'interrupteur en bas de chaque question.',
      '**Envoyer** → icône du lien → **Copier** : collez le lien dans le groupe WhatsApp.',
      'Onglet **Réponses** → **Associer à Sheets** : toutes les réponses arrivent automatiquement dans un tableau, prêt pour les formules SOMME et NB.SI du module 3.',
    ] },
  ],

  pieges: {
    lignes: [
      ['🌐 Partager un document sensible « à tous ceux qui ont le lien »', 'Le lien peut circuler bien au-delà du groupe.', 'Accès Limité, avec les adresses de chacun.'],
      ['✏️ Donner le droit Éditeur à tout le monde', 'Une fausse manipulation, et tout est effacé.', 'Éditeur pour deux ou trois personnes ; Commentateur pour les autres.'],
      ['🔁 Continuer à envoyer des copies par WhatsApp', 'Les versions multiples reviennent.', 'Partager le lien du fichier unique.'],
      ['🗑️ Supprimer sur l\'ordinateur un fichier synchronisé', 'Il disparaît aussi du nuage, et chez les autres.', 'Réfléchir avant de supprimer ; récupérer dans la corbeille du service si besoin.'],
      ['🔐 Mettre dans le nuage des documents très sensibles sans protection', 'Si le compte est piraté, tout est exposé.', 'Vérification en deux étapes obligatoire (module 8).'],
    ],
    questions: [
      ['Mes fichiers dans le nuage, Google ou Microsoft peuvent les lire ?', 'Vos fichiers sont protégés par votre compte, et ces entreprises s\'engagent dans leurs conditions d\'utilisation sur la façon dont elles traitent vos données. Pour des documents très confidentiels (données de santé, dossiers de clients), renseignez-vous sur les règles de votre organisation et sur la loi n° 2013-450 relative à la protection des données personnelles.'],
      ['Sans Internet, je perds mes fichiers ?', 'Non, si vous les avez rendus disponibles **hors connexion** (OneDrive : clic droit → **Toujours conserver sur cet appareil** ; Google Drive : option **Disponible hors connexion**). Les modifications seront synchronisées au retour de la connexion.'],
    ],
  },

  exercices: {
    echauffe: [
      { h3: 'Exercice 1 : quel droit ?' },
      { tableau: [['Personne', 'Droit à donner'], [
        ['Le trésorier de l\'association, sur le budget', ''], ['Les membres, sur le procès-verbal de réunion', ''],
        ['Le public, sur l\'affiche de l\'événement', ''], ['Le tuteur de stage, sur le rapport de Yao', ''],
      ], [3, 2], C.bleu] },
    ],
    entraine: [
      { h3: 'Exercice 2 : le dossier partagé' },
      { cases: [
        'Je crée un dossier dans Google Drive et un tableau Google Sheets à l\'intérieur.',
        'Je le partage avec mon binôme en Éditeur, et avec une autre personne en Commentateur.',
        'Nous modifions le tableau en même temps.',
        'Je laisse un commentaire avec une mention @.',
        'J\'ouvre l\'historique des versions et je restaure une version précédente.',
      ] },
    ],
    lance: [
      { h3: 'Exercice 3 : mon formulaire' },
      'Créez un formulaire réel pour votre entourage (sondage de l\'association, inscription à une activité, commande groupée), associez-le à une feuille de calcul, et obtenez au moins cinq réponses.',
    ],
  },

  cas: [
    { h2: 'Remettre de l\'ordre dans le comité' },
    'Il reste six semaines avant le mariage. Huit personnes dans le comité, dont un trésorier, Mariam (coordinatrice), et six membres chargés chacun d\'un poste (traiteur, salle, décoration, musique, transport, invitations).',
    { etapes: [
      'Proposez l\'organisation du dossier partagé : sous-dossiers et fichiers.',
      'Qui reçoit quels droits sur le budget ? Sur la liste des invités ? Sur les devis ?',
      'Comment éviter qu\'un fournisseur soit à nouveau payé deux fois ?',
      'Quel formulaire Mariam peut-elle créer, et pour qui ?',
    ] },
  ],

  retiens: [
    'Le **nuage** : vos fichiers gardés en ligne, disponibles partout. Drive : 15 Go gratuits ; OneDrive : 5 Go.',
    '**Un seul fichier partagé**, plus jamais de versions multiples sur WhatsApp.',
    'Trois droits : **Lecteur**, **Commentateur**, **Éditeur**. Accès **Limité** pour le sensible.',
    'Commentaires avec **@nom** ; **Historique des versions** pour savoir qui a fait quoi, et restaurer.',
    'Synchroniser **n\'est pas** sauvegarder : une suppression se propage partout.',
    '**Google Forms** + **Sheets** : les réponses arrivent toutes seules dans un tableau.',
  ],
  defi: [
    'Cette semaine, remplacez un fichier qui circule en plusieurs versions (dans votre famille, votre association ou votre équipe) par **un seul** document partagé, avec les bons droits.',
  ],
  motDeLaFin: 'Le jour du mariage, Tonton Séraphin a voulu vérifier si la sono était payée. Il a sorti son téléphone, ouvert le budget partagé, et vu la ligne cochée, avec en commentaire : « Payé le 12/11 par Mariam, reçu en pièce jointe ». Il a rangé son téléphone et il est allé danser.',
  quiz: [
    'Pour que quelqu\'un puisse seulement proposer des remarques, je lui donne le droit… **a)** Lecteur · **b)** Commentateur · **c)** Éditeur.',
    'Pour savoir qui a modifié le fichier hier soir, j\'utilise… **a)** l\'historique des versions · **b)** la Corbeille de Windows · **c)** le Bloc-notes.',
    'Un fichier synchronisé supprimé de mon ordinateur… **a)** reste dans le nuage pour toujours · **b)** est aussi supprimé du nuage · **c)** est envoyé par e-mail.',
    'Pour un document confidentiel, je règle l\'accès général sur… **a)** Limité · **b)** Tous les utilisateurs disposant du lien · **c)** Public.',
  ],
  corriges: [
    ['Exercice 1', 'Trésorier : Éditeur · Membres sur le procès-verbal : Commentateur (ou Lecteur) · Public sur l\'affiche : Lecteur, lien public · Tuteur : Commentateur.'],
    ['Cas pratique', '**1.** Dossier « Mariage Serge et Aïcha » avec : Budget (un seul Sheets), Invités (Sheets alimenté par le formulaire), Devis et reçus (sous-dossiers par poste), Planning. **2.** Budget : Éditeur pour le trésorier et Mariam, Commentateur pour les autres. Invités : Éditeur pour le responsable des invitations et Mariam. Devis : chaque responsable Éditeur de son sous-dossier, les autres Lecteurs. **3.** Une seule personne paie (le trésorier), chaque paiement est saisi dans le budget avec la date et le reçu en lien ; colonne « Payé » avec mise en forme conditionnelle. **4.** Un formulaire de confirmation de présence pour les familles invitées, ou un formulaire de proposition de devis pour les membres.'],
    ['Mini-quiz', '1-b · 2-a · 3-b · 4-a'],
  ],
  glossaire: [
    ['Cloud (nuage)', 'Le stockage et les services fournis par des ordinateurs distants, accessibles par Internet.'],
    ['Synchronisation', 'La mise à jour automatique d\'un même fichier entre plusieurs appareils.'],
    ['Google Drive / OneDrive', 'Les services de stockage en ligne de Google et de Microsoft.'],
    ['Droits de partage', 'Ce qu\'une personne peut faire sur un fichier partagé : lire, commenter ou modifier.'],
    ['Historique des versions', 'La liste des états successifs d\'un document, avec leurs auteurs, qu\'on peut restaurer.'],
    ['Google Forms', 'Un outil gratuit pour créer des formulaires et des questionnaires en ligne.'],
    ['Coédition', 'Le fait de modifier un même document à plusieurs, en même temps.'],
  ],
};
