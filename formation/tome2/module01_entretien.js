// Tome 2 · Module 1 : Entretenir son ordinateur comme sa moto
const { C } = require('../outils/livre');

module.exports = {
  num: 1,
  titre: 'Entretenir son ordinateur comme sa moto',
  sousTitre: 'Un ordinateur bien entretenu ne tombe pas en panne au mauvais moment',
  objectifs: [
    'comprendre pourquoi un ordinateur **ralentit** avec le temps ;',
    'lire le **Gestionnaire des tâches** et désactiver les programmes inutiles au **démarrage** ;',
    '**libérer de l\'espace** et **désinstaller** proprement ;',
    '**installer** un logiciel sans ramasser de programmes indésirables ;',
    'gérer les **mises à jour**, les **comptes utilisateurs** et les **points de restauration**.',
  ],
  duree: 'Quatre heures', materiel: 'Un ordinateur sous Windows 11 (avec un compte administrateur)', prerequis: 'Tome 1',

  situation: [
    { h2: 'Le gbaka surchargé' },
    'L\'ordinateur de Mariam met cinq minutes à démarrer. Dès qu\'il s\'allume, une dizaine de petites fenêtres s\'ouvrent toutes seules : un « optimiseur » qui annonce 2 437 problèmes, une barre d\'outils jamais installée volontairement, un lecteur de musique, deux messageries. Le ventilateur souffle comme un vieux climatiseur. Le disque est plein à 97 %.',
    { d: ['Mariam', 'Monsieur Kouassi, il faut changer cet ordinateur, il est fatigué.'] },
    { d: ['M. Kouassi', 'Mariam, il n\'est pas fatigué, il est surchargé. C\'est un gbaka qui transporte quarante passagers pour dix-huit places, qui n\'a pas vu le garage depuis deux ans. Avant d\'acheter une nouvelle voiture, on fait l\'entretien.'] },
  ],

  declic: [
    { h2: 'L\'entretien de l\'ordinateur, c\'est l\'entretien de la moto' },
    'Un bon conducteur de moto n\'attend pas la panne : il fait la vidange, vérifie les pneus, ne surcharge pas, passe au garage agréé. L\'ordinateur demande exactement les mêmes soins.',
    { tableau: [['Pour la moto…', 'Pour l\'ordinateur…', 'Fréquence'], [
      ['🛢️ La **vidange**', 'Supprimer les fichiers temporaires et vider la Corbeille', 'Chaque mois'],
      ['🧳 Ne pas **surcharger**', 'Limiter les programmes qui se lancent au **démarrage**', 'Une fois, puis à chaque nouvelle installation'],
      ['🛞 Surveiller les **pneus**', 'Garder au moins **15 à 20 %** du disque libre', 'Chaque mois'],
      ['🔧 La **révision** au garage', 'Faire les **mises à jour** de Windows et des logiciels', 'Chaque semaine, automatiquement'],
      ['🏪 Les **pièces d\'origine**', 'Installer uniquement des logiciels **officiels**', 'Toujours'],
      ['🧽 Le **nettoyage**', 'Dépoussiérer clavier et grilles d\'aération', 'Tous les trois mois'],
    ], [1.3, 2.6, 1.4]] },
    { h3: 'Pourquoi un ordinateur ralentit' },
    { puces: [
      '**Trop de programmes au démarrage** : chacun prend une place sur la table (la mémoire vive) avant même que vous commenciez à travailler.',
      '**Un disque presque plein** : Windows n\'a plus de place pour ses fichiers de travail et ses mises à jour.',
      '**Des programmes indésirables** installés en même temps que d\'autres, parfois des logiciels malveillants.',
      '**Une surchauffe** : grilles bouchées par la poussière, l\'ordinateur ralentit pour se protéger.',
    ] },
    { encadre: { titre: '⚠️  Les « optimiseurs » miracles', style: 'rouge', contenu: [
      'Les logiciels qui promettent de « nettoyer 2 437 problèmes » ou de « doubler la vitesse » sont au mieux inutiles, au pire dangereux : ils effraient pour vendre, ou installent eux-mêmes des programmes indésirables. **Windows contient déjà tout ce qu\'il faut** pour l\'entretien courant.',
    ] } },
  ],

  pasAPas: [
    { h2: 'Étape 1 : le tableau de bord (Gestionnaire des tâches)' },
    { etapes: [
      'Appuyez sur **Ctrl + Maj + Échap** (ou clic droit sur le bouton Démarrer → **Gestionnaire des tâches**).',
      'Onglet **Processus** : vous voyez chaque programme ouvert et ce qu\'il consomme en **processeur**, **mémoire**, **disque** et **réseau**. Cliquez sur l\'en-tête **Mémoire** pour trier du plus gourmand au moins gourmand.',
      'Onglet **Performances** : la jauge de la mémoire vive. Si elle reste au-dessus de 85 % en usage normal, votre table est trop petite pour ce que vous lui demandez.',
      'Onglet **Applications de démarrage** : la liste des programmes qui se lancent tout seuls. La colonne **Impact** indique leur poids.',
      'Pour un programme inutile au démarrage (lecteur de musique, messagerie que vous ouvrez rarement…) : clic droit → **Désactiver**. Il n\'est pas supprimé, il ne démarre simplement plus tout seul.',
    ] },
    { img: 'gestionnaire', illus: 'Capture d\'écran du Gestionnaire des tâches de Windows 11, onglet Applications de démarrage, avec la colonne Impact au démarrage et le bouton Désactiver entouré en orange.' },
    { encadre: { titre: '🔑  Ce qu\'il ne faut pas désactiver', style: 'vert', contenu: [
      'Gardez actifs l\'**antivirus** (Sécurité Windows), **OneDrive** si vous l\'utilisez pour vos sauvegardes, et les programmes du **fabricant** liés au son, au pavé tactile ou à la batterie. Dans le doute, cherchez le nom du programme sur Internet avant de le désactiver.',
    ] } },
    { h2: 'Étape 2 : libérer de l\'espace' },
    { etapes: [
      'Démarrer → **Paramètres** → **Système** → **Stockage**. Une barre montre l\'espace utilisé, par catégorie.',
      'Cliquez sur **Recommandations de nettoyage** : Windows propose de supprimer les fichiers temporaires, le contenu de la Corbeille, les gros fichiers oubliés, les applications inutilisées. Cochez, puis **Nettoyer**.',
      'Activez l\'**Assistant de stockage** sur la même page : Windows fera la vidange automatiquement.',
      'Regardez aussi votre dossier **Téléchargements** : il contient souvent des gigaoctets d\'installateurs et de vidéos déjà utilisés.',
    ] },
    { h2: 'Étape 3 : désinstaller proprement' },
    { etapes: [
      '**Paramètres** → **Applications** → **Applications installées**.',
      'Triez par **taille** pour repérer les plus encombrantes, ou par **date d\'installation** pour retrouver un programme arrivé sans votre accord.',
      'Cliquez sur les **trois points ⋯** à droite du programme → **Désinstaller**, puis confirmez.',
      'Ne désinstallez pas ce que vous ne connaissez pas : cherchez d\'abord son nom sur Internet. Les programmes du fabricant (Intel, Realtek, AMD, NVIDIA…) sont souvent des **pilotes** indispensables.',
    ] },
    { h2: 'Étape 4 : installer sans ramasser d\'indésirables' },
    { etapes: [
      'Privilégiez le **Microsoft Store** (menu Démarrer). Sinon, le **site officiel** de l\'éditeur, trouvé par une recherche et vérifié.',
      'Pendant l\'installation, lisez chaque écran. Choisissez l\'installation **personnalisée** quand elle existe, et **décochez** les offres « recommandées » : barres d\'outils, antivirus d\'essai, changement de page d\'accueil du navigateur.',
      'Refusez toujours les logiciels « crackés » : c\'est le premier chemin des virus, et c\'est illégal.',
    ] },
    { h2: 'Étape 5 : mises à jour, comptes et filet de sécurité' },
    { tableau: [['Je veux…', 'Chemin'], [
      ['Faire les **mises à jour** Windows', '**Paramètres** → **Windows Update** → **Rechercher des mises à jour**. Dans **Options avancées** → **Mises à jour facultatives**, on trouve parfois des pilotes.'],
      ['Choisir mes **heures d\'activité** (pour éviter un redémarrage en pleine réunion)', '**Windows Update** → **Options avancées** → **Heures d\'activité**.'],
      ['Créer un **compte séparé** pour un enfant ou un collègue', '**Paramètres** → **Comptes** → **Autres utilisateurs** → **Ajouter un compte**. Chacun a ses fichiers et ne peut pas tout modifier.'],
      ['Créer un **point de restauration** avant une grosse installation', 'Démarrer, tapez **Créer un point de restauration** → bouton **Créer**. En cas de problème, **Restauration du système** ramène les réglages de Windows à cette date, sans toucher à vos documents.'],
      ['Économiser la **batterie**', '**Paramètres** → **Système** → **Alimentation et batterie** → **Économiseur de batterie**.'],
    ], [1.8, 3.2]] },
  ],

  pieges: {
    lignes: [
      ['🧪 Installer un « optimiseur » ou un « booster »', 'Publicités, faux problèmes, programmes indésirables.', 'Les outils intégrés de Windows suffisent.'],
      ['🗑️ Désinstaller un programme inconnu au hasard', 'On peut supprimer un pilote : plus de son, plus de Wi-Fi.', 'Chercher son nom sur Internet avant.'],
      ['💽 Garder le disque plein à plus de 90 %', 'Lenteurs, mises à jour impossibles.', 'Nettoyage mensuel, Assistant de stockage, fichiers lourds sur disque externe ou en ligne.'],
      ['⏹️ Éteindre pendant une mise à jour', 'Windows peut ne plus démarrer correctement.', 'Laisser finir, ordinateur branché.'],
      ['🍞 Poser l\'ordinateur sur le lit pendant des heures', 'Surchauffe, ralentissement, usure.', 'Une table, et un nettoyage des grilles tous les trois mois.'],
    ],
    questions: [
      ['Faut-il éteindre l\'ordinateur chaque soir ?', 'C\'est une bonne habitude, surtout avec les coupures de courant. Au minimum, **redémarrez** une fois par jour ou deux : cela vide la mémoire vive et termine les mises à jour.'],
      ['Ajouter de la mémoire vive, c\'est possible ?', 'Sur beaucoup d\'ordinateurs de bureau et certains portables, oui, et c\'est souvent la meilleure amélioration pour le prix, avec le passage à un disque SSD. Sur les portables très fins, la mémoire est parfois soudée. Demandez à un technicien de confiance en lui donnant le modèle exact.'],
    ],
  },

  exercices: {
    echauffe: [
      { h3: 'Exercice 1 : l\'état des lieux' },
      { lignes: ['Temps de démarrage (jusqu\'au Bureau utilisable) : ', 'Mémoire vive utilisée au repos (Gestionnaire des tâches, Performances) : ', 'Nombre d\'applications de démarrage actives : ', 'Espace libre sur le disque : '] },
    ],
    entraine: [
      { h3: 'Exercice 2 : la grande révision' },
      { cases: [
        'Je désactive au moins trois applications de démarrage inutiles.',
        'Je fais les recommandations de nettoyage et j\'active l\'Assistant de stockage.',
        'Je désinstalle les programmes que je n\'utilise plus.',
        'Je lance Windows Update et je règle mes heures d\'activité.',
        'Je crée un point de restauration nommé « Après révision ».',
        'Je mesure à nouveau le temps de démarrage : ………… secondes.',
      ] },
    ],
    lance: [
      { h3: 'Exercice 3 : mon carnet d\'entretien' },
      'Créez dans Excel un « carnet d\'entretien » de votre ordinateur : date, action réalisée (nettoyage, mise à jour, désinstallation…), observation. Programmez dans votre agenda un rappel mensuel.',
    ],
  },

  cas: [
    { h2: 'Le diagnostic de l\'ordinateur de Mariam' },
    'Voici ce que montre le Gestionnaire des tâches de Mariam, juste après le démarrage, sans aucun document ouvert.',
    { tableau: [['Application de démarrage', 'Impact', 'État'], [
      ['Sécurité Windows', 'Faible', 'Activé'], ['SuperBoost PC Optimizer', 'Élevé', 'Activé'], ['Lecteur musique MaxPlay', 'Élevé', 'Activé'],
      ['Microsoft OneDrive', 'Moyen', 'Activé'], ['Barre d\'outils ShopSearch', 'Moyen', 'Activé'], ['Realtek Audio', 'Faible', 'Activé'], ['Messagerie (rarement utilisée)', 'Moyen', 'Activé'],
    ], [2.4, 1, 1], C.violet] },
    'Mémoire vive utilisée au repos : 88 % de 4 Go. Disque : 97 % utilisé, dont 18 Go dans Téléchargements.',
    { etapes: [
      'Quelles applications désactiver au démarrage ? Lesquelles garder ? Pourquoi ?',
      'Quels programmes faut-il carrément désinstaller ?',
      'Comment libérer de la place sur le disque ?',
      'Après tout cela, si l\'ordinateur reste lent avec 4 Go, quel investissement conseiller à son directeur ?',
    ] },
  ],

  retiens: [
    'Un ordinateur lent est souvent **surchargé**, pas fatigué.',
    '**Ctrl + Maj + Échap** : le Gestionnaire des tâches. **Applications de démarrage** → Désactiver l\'inutile.',
    '**Paramètres → Système → Stockage** : recommandations de nettoyage et Assistant de stockage. Garder **15 à 20 %** libre.',
    'Désinstaller : **Paramètres → Applications → Applications installées**. Jamais au hasard.',
    'Installer : Microsoft Store ou site officiel, installation **personnalisée**, je **décoche** les offres.',
    'Pas d\'« optimiseur » miracle. Un **point de restauration** avant les grosses installations.',
  ],
  defi: [
    'Cette semaine, faites la « révision » complète de votre ordinateur et de celui d\'un proche. Notez le temps de démarrage avant et après.',
  ],
  motDeLaFin: 'Après la révision, l\'ordinateur de Mariam démarre en cinquante secondes. Le directeur, qui voulait en acheter un neuf, a finalement fait ajouter 4 Go de mémoire vive pour une fraction du prix. Avec l\'économie, il a payé à Mariam une formation. Celle-ci.',
  quiz: [
    'Pour voir les programmes qui se lancent au démarrage, j\'ouvre… **a)** le Gestionnaire des tâches · **b)** Word · **c)** la Corbeille.',
    'Désactiver un programme au démarrage… **a)** le supprime · **b)** l\'empêche seulement de se lancer tout seul · **c)** l\'abîme.',
    'Un logiciel annonce « 2 437 problèmes détectés, payez pour réparer ». Je… **a)** paie · **b)** me méfie : c\'est une technique pour faire peur · **c)** redémarre dix fois.',
    'Il est conseillé de garder libre sur le disque environ… **a)** 1 % · **b)** 15 à 20 % · **c)** 90 %.',
  ],
  corriges: [
    ['Cas pratique', '**1.** Désactiver SuperBoost, MaxPlay, ShopSearch et la messagerie rarement utilisée. Garder Sécurité Windows, OneDrive (sauvegardes) et Realtek Audio (le son). **2.** Désinstaller SuperBoost PC Optimizer et la barre d\'outils ShopSearch, probablement arrivés sans accord ; le lecteur MaxPlay s\'il n\'est pas utilisé. Puis lancer une analyse Sécurité Windows. **3.** Recommandations de nettoyage, Corbeille, Téléchargements (18 Go à trier), Assistant de stockage ; déplacer les vidéos et photos sur un disque externe ou en ligne. **4.** Passer à 8 Go de mémoire vive si l\'ordinateur le permet (et à un SSD s\'il a encore un disque dur classique).'],
    ['Mini-quiz', '1-a · 2-b · 3-b · 4-b'],
  ],
  glossaire: [
    ['Gestionnaire des tâches', 'L\'outil de Windows qui montre les programmes ouverts, leur consommation et ceux qui se lancent au démarrage.'],
    ['Application de démarrage', 'Un programme qui se lance automatiquement à l\'allumage de l\'ordinateur.'],
    ['Pilote', 'Un petit logiciel qui permet à Windows de faire fonctionner un composant : son, Wi-Fi, imprimante…'],
    ['Point de restauration', 'Une photographie des réglages de Windows à une date donnée, pour y revenir en cas de problème.'],
    ['Programme indésirable', 'Un logiciel installé sans réel accord, souvent caché dans l\'installation d\'un autre.'],
    ['Assistant de stockage', 'La fonction de Windows qui supprime automatiquement les fichiers inutiles.'],
  ],
};
