// Tome 1 · Module 4 : Ranger ses affaires, fichiers et dossiers
const { C } = require('../outils/livre');

module.exports = {
  num: 4,
  titre: 'Ranger ses affaires : fichiers et dossiers',
  sousTitre: 'L\'armoire de la famille, version numérique',
  objectifs: [
    'comprendre la différence entre un **fichier** et un **dossier**, et lire un **chemin** ;',
    'utiliser l\'**Explorateur de fichiers** ;',
    '**créer**, **renommer**, **copier**, **déplacer** et **supprimer** fichiers et dossiers ;',
    '**récupérer** un fichier supprimé par erreur ;',
    'utiliser une **clé USB** en toute sécurité et organiser mes documents avec méthode.',
  ],
  duree: 'Quatre heures, en deux séances', materiel: 'Un ordinateur, une clé USB', prerequis: 'Modules 1 à 3',

  situation: [
    { h2: 'Le courrier introuvable' },
    'Dix heures. Le directeur passe la tête par la porte : « Mariam, le courrier pour la mairie, celui d\'hier. J\'en ai besoin tout de suite. »',
    'Mariam ouvre Word. Dans les documents récents, elle voit : **Document1**, **Document2**, **courrier**, **courrier final**, **courrier final 2**, **courrier final VRAI**. Elle les ouvre un par un. Le premier est une invitation de baptême. Le deuxième, une liste de courses. Le directeur attend, les bras croisés.',
    { d: ['Mariam', 'Je l\'ai écrit, je vous jure ! Il est quelque part dans l\'ordinateur…'] },
    'Ce « quelque part », c\'est tout le problème de ce module.',
  ],

  declic: [
    { h2: 'L\'ordinateur, c\'est l\'armoire de la famille' },
    'Dans beaucoup de maisons, il y a une armoire où l\'on range les papiers importants : actes de naissance, bulletins des enfants, factures de la CIE, titres fonciers. Si tout est jeté en vrac au fond, on ne retrouve rien le jour où on en a besoin. Si chaque papier est dans la bonne chemise, avec une étiquette, on le retrouve en dix secondes.',
    { tableau: [['Dans l\'armoire…', 'Dans l\'ordinateur', 'Ce que c\'est'], [
      ['L\'**armoire** elle-même', 'Un **lecteur** (C:, ou une clé USB)', 'Un espace de stockage : le disque de l\'ordinateur, une clé USB, un disque externe.'],
      ['Un **classeur**, une **chemise**', 'Un **dossier** 📁', 'Un contenant. Il porte un nom et peut contenir des fichiers et d\'autres dossiers.'],
      ['Une **feuille** de papier', 'Un **fichier** 📄', 'Le document lui-même : une lettre, une photo, un tableau, une chanson.'],
      ['L\'**étiquette** sur la chemise', 'Le **nom**', 'Ce qui permet de reconnaître le dossier ou le fichier sans l\'ouvrir.'],
      ['« Armoire, tiroir du haut, classeur bleu, chemise Actes »', 'Le **chemin**', 'L\'adresse complète d\'un fichier : **Documents > Famille > Actes de naissance**.'],
      ['La **poubelle** de la maison', 'La **Corbeille**', 'Ce qu\'on jette y attend avant le passage des éboueurs. On peut encore le récupérer.'],
    ], [1.4, 1.3, 2.3]] },
    { h3: 'Le type de papier : l\'extension' },
    'Chaque fichier a un nom suivi d\'un point et de quelques lettres : c\'est l\'**extension**. Elle dit quel type de papier c\'est, et quel programme sait l\'ouvrir. Windows la cache parfois, mais l\'icône la trahit.',
    { tableau: [['Extension', 'Type de fichier', 'S\'ouvre avec…'], [
      ['**.docx**', 'Un texte, une lettre', 'Word'],
      ['**.xlsx**', 'Un tableau de calcul', 'Excel'],
      ['**.pdf**', 'Un document « figé », prêt à imprimer ou à envoyer', 'Le navigateur, ou un lecteur PDF'],
      ['**.jpg**, **.png**', 'Une photo, une image', 'L\'application Photos'],
      ['**.mp3**', 'Un son, une musique', 'Le lecteur multimédia'],
      ['**.mp4**', 'Une vidéo', 'Le lecteur multimédia'],
      ['**.zip**', 'Un « colis » qui contient plusieurs fichiers compressés', 'L\'Explorateur de fichiers'],
    ], [1, 2.4, 1.6]] },
    { h3: 'Copier ou déplacer ?' },
    { puces: [
      '**Copier**, c\'est faire une **photocopie** : l\'original reste à sa place, et un double apparaît ailleurs.',
      '**Déplacer**, c\'est **changer la feuille de chemise** : elle quitte sa place pour aller dans une autre.',
    ] },
  ],

  pasAPas: [
    { h2: 'Étape 1 : ouvrir l\'armoire (l\'Explorateur de fichiers)' },
    'Cliquez sur l\'icône du **dossier jaune** dans la barre des tâches, ou appuyez sur **Windows + E**.',
    { illus: 'Capture d\'écran annotée de l\'Explorateur de fichiers de Windows 11 : le volet de gauche (Accueil, Bureau, Téléchargements, Documents, Images, Ce PC), la barre d\'adresse qui montre le chemin, le bouton « + Nouveau », la barre de recherche en haut à droite et le contenu au centre.' },
    { puces: [
      'À **gauche**, les grands rangements : **Bureau**, **Documents**, **Images**, **Téléchargements** (où arrive tout ce que vous téléchargez sur Internet), et **Ce PC** (les lecteurs et clés USB).',
      'En **haut**, la **barre d\'adresse** montre le chemin du dossier ouvert.',
      'Au **centre**, le contenu du dossier. Le bouton **Afficher** permet de choisir **Grandes icônes** (pour les photos) ou **Détails** (pour voir les dates et les tailles).',
    ] },
    { h2: 'Étape 2 : créer et renommer' },
    { etapes: [
      'Ouvrez **Documents**.',
      'Cliquez sur **+ Nouveau**, en haut à gauche, puis sur **Dossier**.',
      'Un nouveau dossier apparaît, son nom surligné en bleu : tapez directement **Famille**, puis **Entrée**.',
      'Pour **renommer** un fichier ou un dossier : cliquez dessus une fois, puis appuyez sur **F2** (ou clic droit → **Renommer**). Tapez le nouveau nom, **Entrée**.',
    ] },
    { h2: 'Étape 3 : copier, déplacer, supprimer' },
    { tableau: [['Je veux…', 'Avec la souris', 'Avec le clavier'], [
      ['**Copier**', 'Clic droit sur le fichier → **Copier** ; ouvrir le dossier d\'arrivée ; clic droit dans le vide → **Coller**', '**Ctrl + C**, puis **Ctrl + V** dans le dossier d\'arrivée'],
      ['**Déplacer**', 'Glisser-déposer le fichier sur le dossier d\'arrivée, ou clic droit → **Couper**, puis **Coller**', '**Ctrl + X**, puis **Ctrl + V**'],
      ['**Supprimer**', 'Clic droit → icône de la **poubelle**', '**Suppr**'],
      ['**Sélectionner plusieurs fichiers**', 'Tenir **Ctrl** et cliquer sur chaque fichier', '**Ctrl + A** pour tout sélectionner'],
    ], [1, 2.4, 1.6]] },
    { h2: 'Étape 4 : récupérer dans la Corbeille' },
    { etapes: [
      'Double-cliquez sur la **Corbeille**, sur le Bureau.',
      'Trouvez le fichier supprimé par erreur.',
      'Clic droit dessus → **Restaurer**. Il retourne exactement à sa place d\'origine.',
    ] },
    { encadre: { titre: '⚠️  Attention aux clés USB', style: 'rouge', contenu: [
      'Ce que vous supprimez sur une **clé USB** ne passe **pas** par la Corbeille : c\'est supprimé **définitivement**. Réfléchissez deux fois avant d\'appuyer sur Suppr.',
    ] } },
    { h2: 'Étape 5 : utiliser une clé USB' },
    { etapes: [
      'Branchez la clé dans un port USB. Elle apparaît dans l\'Explorateur, dans **Ce PC**, avec une lettre (D:, E:…).',
      'Copiez-y vos fichiers comme dans n\'importe quel dossier.',
      'Avant de la retirer : clic droit sur la clé dans **Ce PC** → **Éjecter**. Attendez le message indiquant qu\'elle peut être retirée en toute sécurité.',
    ] },
    { h2: 'Étape 6 : retrouver un fichier perdu' },
    'Ouvrez l\'Explorateur, cliquez dans la **barre de recherche** en haut à droite et tapez un mot du nom du fichier. Windows fouille le dossier ouvert et tous ses sous-dossiers. Pour chercher partout, placez-vous d\'abord sur **Ce PC**.',
    { h2: 'La méthode de rangement FOR LIFE' },
    { encadre: { titre: '🗂️  Trois règles d\'or', style: 'violet', contenu: [
      { etapes: [
        '**Une place pour chaque chose** : quelques grands dossiers dans Documents, par exemple **Famille**, **Travail**, **Boutique**, **Administratif**, **Formation**.',
        '**Un nom qui parle** : la date à l\'envers, puis le sujet. Exemple : **2026-11-03 Courrier mairie.docx**. Les fichiers se rangent alors tout seuls par date.',
        '**Le Bureau n\'est pas un placard** : on y pose les fichiers en cours de la journée, puis on les range le soir.',
      ] },
    ] } },
    { illus: 'Schéma en arbre : Documents → Famille (Actes de naissance, Bulletins des enfants), Travail (Courriers, Rapports), Boutique (Factures, Stock), Administratif (CIE-SODECI, Impôts), Formation (Tome 1).' },
  ],

  pieges: {
    lignes: [
      ['📛 Garder les noms « Document1 », « final », « final 2 »', 'Impossible de savoir ce que contient le fichier sans l\'ouvrir.', 'Date à l\'envers + sujet précis, dès le premier enregistrement.'],
      ['🔌 Retirer la clé USB sans l\'éjecter', 'Les fichiers en cours de copie peuvent être abîmés.', 'Clic droit → Éjecter, puis retirer.'],
      ['🗑️ Vider la Corbeille sans regarder', 'On perd définitivement un fichier jeté par erreur.', 'Jeter un coup d\'œil avant de vider.'],
      ['🦠 Brancher sa clé USB partout', 'Au cybercafé, une clé peut attraper un virus.', 'Faire analyser la clé par l\'antivirus en rentrant (module 10).'],
      ['📥 Laisser tout dans Téléchargements', 'Le dossier devient un fourre-tout.', 'Après chaque téléchargement, ranger le fichier à sa place.'],
    ],
    questions: [
      ['Si je supprime un raccourci du Bureau, est-ce que je supprime le fichier ?', 'Non. Un raccourci (icône avec une petite flèche) n\'est qu\'une étiquette qui indique où se trouve le vrai fichier.'],
      ['Mes fichiers sont-ils en sécurité dans l\'ordinateur ?', 'Tant que l\'ordinateur fonctionne, oui. Mais un vol, une panne ou une chute peuvent tout faire disparaître. Gardez toujours une **copie** de vos documents importants sur une clé USB ou en ligne (vous l\'apprendrez au Tome 2).'],
    ],
  },

  exercices: {
    echauffe: [
      { h3: 'Exercice 1 : fichier ou dossier ?' },
      { tableau: [['Élément', 'Fichier ou dossier ?', 'Extension probable'], [
        ['Lettre au propriétaire', '', ''], ['Photos du mariage', '', ''], ['Comptes du mois d\'octobre', '', ''],
        ['Contrat de bail signé et scanné', '', ''], ['Chanson de Magic System', '', ''],
      ], [2, 1.4, 1.4], C.bleu] },
    ],
    entraine: [
      { h3: 'Exercice 2 : je construis mon armoire' },
      { cases: [
        'Dans Documents, je crée les dossiers Famille, Travail, Administratif et Formation.',
        'Dans Famille, je crée un dossier Photos.',
        'Je crée un fichier dans le Bloc-notes, je l\'enregistre dans Formation sous le nom « 2026-11-03 Mes notes ».',
        'Je le copie dans Famille, puis je supprime la copie.',
        'Je la récupère dans la Corbeille.',
        'Je copie le dossier Formation sur une clé USB, puis j\'éjecte la clé proprement.',
      ] },
    ],
    lance: [
      { h3: 'Exercice 3 : le chemin' },
      'Écrivez le chemin complet de votre fichier « 2026-11-03 Mes notes », comme l\'affiche la barre d\'adresse de l\'Explorateur.',
      { lignes: [''] },
    ],
  },

  cas: [
    { h2: 'Le grand rangement de Mariam' },
    'Voici quelques-uns des fichiers qui encombrent le Bureau de Mariam. Proposez pour chacun un **dossier** et un **nouveau nom** selon la méthode FOR LIFE.',
    { tableau: [['Nom actuel', 'Contenu', 'Dossier', 'Nouveau nom'], [
      ['courrier final VRAI.docx', 'Courrier à la mairie du 2 novembre 2026', '', ''],
      ['Document2.docx', 'Liste de courses', '', ''],
      ['IMG_20261012.jpg', 'Photo du baptême de sa nièce', '', ''],
      ['facture.pdf', 'Facture CIE d\'octobre 2026', '', ''],
      ['tableau.xlsx', 'Planning des congés du service', '', ''],
    ], [1.4, 1.8, 1, 1.6], C.violet] },
  ],

  retiens: [
    '**Dossier** = la chemise ; **fichier** = la feuille ; **chemin** = l\'adresse complète.',
    'L\'**extension** (.docx, .xlsx, .pdf, .jpg) dit le type de fichier.',
    'Explorateur : **Windows + E**. Nouveau dossier : **+ Nouveau → Dossier**. Renommer : **F2**.',
    '**Copier** = photocopie (Ctrl + C, Ctrl + V). **Déplacer** = changer de chemise (Ctrl + X, Ctrl + V).',
    'La **Corbeille** permet de **restaurer**, sauf pour les clés USB.',
    'Je nomme mes fichiers : **date à l\'envers + sujet**. J\'**éjecte** toujours ma clé USB.',
  ],
  defi: [
    'Cette semaine, rangez **tous** les fichiers de votre Bureau et de votre dossier Téléchargements selon la méthode FOR LIFE. Le Bureau doit être presque vide dimanche soir.',
  ],
  motDeLaFin: 'Une semaine plus tard, le directeur demande un vieux courrier de septembre. Mariam ouvre Documents, puis Travail, puis Courriers. En triant par nom, elle le trouve en huit secondes. Le directeur la regarde, surpris : « Vous avez changé d\'ordinateur ? »',
  quiz: [
    'Un fichier « Comptes.xlsx » s\'ouvre avec… **a)** Word · **b)** Excel · **c)** Photos.',
    'Pour renommer un fichier sélectionné, j\'appuie sur… **a)** F2 · **b)** Suppr · **c)** Échap.',
    'Un fichier supprimé d\'une clé USB… **a)** va dans la Corbeille · **b)** est supprimé définitivement · **c)** retourne dans Documents.',
    'Le meilleur nom pour un fichier est… **a)** final2.docx · **b)** Document1.docx · **c)** 2026-11-03 Courrier mairie.docx.',
  ],
  corriges: [
    ['Exercice 1', 'Lettre : fichier, .docx · Photos du mariage : dossier · Comptes : fichier, .xlsx · Contrat scanné : fichier, .pdf · Chanson : fichier, .mp3.'],
    ['Exercice 3', 'Par exemple : **Ce PC > Documents > Formation**. Le nom exact dépend de votre ordinateur et de votre nom d\'utilisateur.'],
    ['Cas pratique', 'Propositions : **Travail > Courriers** : 2026-11-02 Courrier mairie.docx · **Famille** : 2026-11 Liste de courses.docx (ou à supprimer) · **Famille > Photos** : 2026-10-12 Baptême nièce.jpg · **Administratif > CIE-SODECI** : 2026-10 Facture CIE.pdf · **Travail** : 2026 Planning des congés.xlsx.'],
    ['Mini-quiz', '1-b · 2-a · 3-b · 4-c'],
  ],
  glossaire: [
    ['Dossier', 'Un contenant portant un nom, qui regroupe des fichiers et d\'autres dossiers. La chemise.'],
    ['Explorateur de fichiers', 'Le programme qui permet de voir et de ranger tous les fichiers de l\'ordinateur.'],
    ['Chemin', 'L\'adresse complète d\'un fichier : la suite des dossiers où il se trouve.'],
    ['Extension', 'Les lettres après le point dans le nom d\'un fichier (.docx, .pdf…), qui indiquent son type.'],
    ['Corbeille', 'L\'endroit où vont les fichiers supprimés, d\'où l\'on peut encore les restaurer.'],
    ['Clé USB', 'Un petit objet de stockage qu\'on branche sur un port USB pour transporter des fichiers.'],
    ['Éjecter', 'Prévenir Windows qu\'on va retirer une clé USB, pour éviter d\'abîmer les fichiers.'],
    ['PDF', 'Un format de document « figé », qui s\'affiche de la même façon sur tous les appareils.'],
  ],
};
