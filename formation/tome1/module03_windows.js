// Tome 1 · Module 3 : Windows, mon bureau
const { C } = require('../outils/livre');

module.exports = {
  num: 3,
  titre: 'Windows, mon bureau',
  sousTitre: 'Un bureau bien rangé, c\'est la moitié du travail',
  objectifs: [
    'reconnaître le **Bureau**, la **barre des tâches**, le **menu Démarrer** et la **zone de notification** ;',
    'ouvrir un programme de **trois façons** différentes ;',
    '**réduire**, **agrandir**, **déplacer**, **fermer** une fenêtre et passer de l\'une à l\'autre ;',
    'afficher **deux fenêtres côte à côte** ;',
    'adapter Windows à mes yeux et à mes goûts : fond d\'écran, **taille du texte**, son, luminosité.',
  ],
  duree: 'Trois heures', materiel: 'Un ordinateur sous Windows 11', prerequis: 'Modules 1 et 2',

  situation: [
    { h2: 'Le bureau de Mariam' },
    'Au bureau de Treichville, la table de Mariam disparaît sous les papiers : factures, courriers, notes de service, un calendrier de l\'an dernier. Quand son chef lui demande le devis du fournisseur, elle met dix minutes à le retrouver.',
    'Sur l\'écran de son ordinateur, c\'est pareil. Soixante petites images couvrent le fond d\'écran. Six fenêtres sont ouvertes les unes sur les autres. Elle a ouvert Word trois fois sans le vouloir. Et elle ne sait plus du tout où est passée la lettre qu\'elle écrivait il y a cinq minutes.',
    { d: ['Mariam', 'Monsieur Kouassi, mon ordinateur, c\'est le marché d\'Adjamé un jour de fête !'] },
    { d: ['M. Kouassi', 'Alors on va ranger ce marché. Windows vous donne un bureau, des tiroirs et un tableau d\'affichage. Il suffit de savoir à quoi sert chaque chose.'] },
  ],

  declic: [
    { h2: 'Windows, c\'est un bureau' },
    'Quand l\'ordinateur a fini de s\'allumer, ce que vous voyez s\'appelle justement le **Bureau**. Windows l\'a pensé comme le bureau d\'un secrétariat.',
    { img: 'bureau_windows', illus: 'Capture d\'écran annotée du Bureau de Windows 11 : le fond d\'écran (A), des icônes (B), la barre des tâches en bas (C), le bouton Démarrer au centre (D), la zone de recherche (E), des programmes épinglés (F), la zone de notification à droite avec l\'heure, le son, le Wi-Fi et la batterie (G).' },
    { tableau: [['À l\'écran', 'Dans le bureau de Mariam…', 'À quoi ça sert'], [
      ['Le **Bureau**', 'Le plateau de la table', 'L\'espace de travail. On y pose ce qu\'on utilise souvent, sans l\'encombrer.'],
      ['Les **icônes**', 'Les objets posés sur la table', 'De petites images qui représentent un programme, un dossier ou un fichier. Un double-clic les ouvre.'],
      ['Le **menu Démarrer**', 'Le grand tiroir du bureau', 'Il contient tous les programmes de l\'ordinateur, et la recherche.'],
      ['La **barre des tâches**', 'Le tableau d\'affichage au mur', 'Elle montre en permanence les programmes **épinglés** et ceux qui sont **ouverts**.'],
      ['Les **fenêtres**', 'Les dossiers ouverts sur la table', 'Chaque programme ouvert s\'affiche dans un cadre : une fenêtre.'],
      ['La **zone de notification**', 'Le tableau de bord d\'une voiture', 'L\'heure, le son, le réseau, la batterie et les messages de Windows.'],
    ], [1.1, 1.4, 2.5]] },
    { h3: 'Les trois boutons de toutes les fenêtres' },
    'En haut à droite de chaque fenêtre, il y a trois boutons. Ce sont toujours les mêmes, dans tous les programmes.',
    { tableau: [['Bouton', 'Son nom', 'Dans le bureau, c\'est…', 'Le dossier est-il perdu ?'], [
      ['**—**', 'Réduire', 'Glisser le dossier dans le tiroir pour libérer la table un moment', 'Non. Il attend sur la barre des tâches. Un clic sur son icône le fait revenir.'],
      ['**☐**', 'Agrandir (ou Restaurer)', 'Étaler le dossier sur toute la table', 'Non. Un nouveau clic lui rend sa taille d\'avant.'],
      ['**✕**', 'Fermer', 'Ranger le dossier dans l\'armoire', 'Si le travail n\'est pas enregistré, Windows vous demande d\'abord quoi faire.'],
    ], [0.6, 1.2, 1.9, 2.1]] },
    { encadre: { titre: '🔑  Réduire n\'est pas fermer', style: 'vert', contenu: [
      'C\'est la confusion la plus fréquente. Une fenêtre **réduite** n\'a pas disparu : son icône reste sur la barre des tâches, soulignée d\'un petit trait. Avant de dire « mon travail a disparu », regardez toujours la barre des tâches.',
    ] } },
  ],

  pasAPas: [
    { h2: 'Étape 1 : ouvrir un programme, trois chemins' },
    { tableau: [['Chemin', 'Comment faire', 'Idéal pour…'], [
      ['**La recherche**', 'Appuyez sur la touche **Windows**, tapez les premières lettres du nom (par exemple **calc**), puis **Entrée**.', 'Tout. C\'est le chemin le plus rapide.'],
      ['**Le menu Démarrer**', 'Cliquez sur **Démarrer**. Les programmes **épinglés** s\'affichent. Pour les voir tous : **Toutes les applications**, en haut à droite du menu.', 'Découvrir ce que contient l\'ordinateur.'],
      ['**La barre des tâches**', 'Un **simple clic** sur l\'icône d\'un programme épinglé.', 'Les programmes utilisés tous les jours.'],
    ], [1.1, 3, 1.4]] },
    'Entraînez-vous : ouvrez la **Calculatrice** par la recherche, le **Bloc-notes** par le menu Démarrer, puis l\'**Explorateur de fichiers** (l\'icône du dossier jaune) par la barre des tâches.',
    { h2: 'Étape 2 : manier les fenêtres' },
    { etapes: [
      '**Déplacer** : placez le pointeur sur la **barre de titre** (la bande tout en haut de la fenêtre), maintenez le clic et glissez.',
      '**Changer la taille** : placez le pointeur sur un bord ou un coin ; quand il se transforme en double flèche ↔, maintenez le clic et tirez.',
      '**Passer d\'une fenêtre à l\'autre** : cliquez sur son icône dans la barre des tâches, ou tenez **Alt** et appuyez plusieurs fois sur **Tab**, puis relâchez sur la bonne fenêtre.',
      '**Mettre deux fenêtres côte à côte** : glissez une fenêtre par sa barre de titre contre le **bord gauche** de l\'écran et relâchez : elle occupe la moitié gauche. Windows vous propose alors de choisir la fenêtre qui ira à droite : cliquez dessus.',
      '**Voir le Bureau d\'un coup** : appuyez sur **Windows + D**. Recommencez pour retrouver vos fenêtres.',
    ] },
    { img: 'cote_a_cote', illus: 'Capture d\'écran : la Calculatrice à gauche et le Bloc-notes à droite, partageant l\'écran en deux moitiés égales.' },
    { h2: 'Étape 3 : épingler ses programmes préférés' },
    { etapes: [
      'Ouvrez le menu **Démarrer** et trouvez le programme (par exemple Word).',
      'Faites un **clic droit** sur son icône, puis **Épingler à la barre des tâches**.',
      'Pour retirer un programme de la barre : clic droit sur son icône, puis **Détacher de la barre des tâches**. Le programme n\'est pas supprimé de l\'ordinateur, seulement son raccourci.',
    ] },
    { h2: 'Étape 4 : adapter Windows à soi' },
    { tableau: [['Je veux…', 'Chemin'], [
      ['Des **textes plus grands**, plus confortables', 'Démarrer → **Paramètres** → **Accessibilité** → **Taille du texte**. Faites glisser le curseur, puis **Appliquer**.'],
      ['Changer le **fond d\'écran**', 'Clic droit sur un espace vide du Bureau → **Personnaliser** → **Arrière-plan**.'],
      ['Régler le **son** ou la **luminosité**', 'Un clic sur les icônes du son ou de la batterie, en bas à droite : des curseurs apparaissent.'],
      ['**Verrouiller** l\'ordinateur quand je m\'absente', '**Windows + L**. Mon travail reste ouvert ; il faudra mon code pour revenir.'],
    ], [1.6, 3.4]] },
    { encadre: { titre: '💡  Le conseil de M. Kouassi', style: 'vert', contenu: [
      '« Agrandissez le texte dès le premier jour si vous plissez les yeux. Le confort n\'est pas un luxe : on apprend mieux quand on ne se fatigue pas. »',
    ] } },
  ],

  pieges: {
    lignes: [
      ['🖱️ Double-cliquer plusieurs fois sur un programme qui tarde à s\'ouvrir', 'On ouvre le même programme trois ou quatre fois, et l\'ordinateur ralentit.', 'Un seul double-clic, puis patience : regardez le petit cercle qui tourne à côté du pointeur.'],
      ['🧺 Garder soixante icônes sur le Bureau', 'On ne trouve plus rien, comme sur une table encombrée.', 'Garder le Bureau presque vide ; ranger les fichiers dans des dossiers (module 4).'],
      ['❌ Fermer au lieu de réduire', 'On doit tout rouvrir, et parfois on perd ce qui n\'était pas enregistré.', 'Le trait « — » pour mettre de côté, la croix « ✕ » seulement quand on a fini.'],
      ['⏳ Repousser sans fin les mises à jour', 'L\'ordinateur reste exposé aux virus et aux failles de sécurité.', 'Accepter de redémarrer en fin de journée quand Windows le demande.'],
    ],
    questions: [
      ['Ma fenêtre a disparu, où est-elle passée ?', 'Elle est sûrement **réduite**. Regardez la barre des tâches : l\'icône du programme est soulignée. Cliquez dessus. Sinon, utilisez **Alt + Tab** pour voir toutes les fenêtres ouvertes.'],
      ['Si je détache Word de la barre des tâches, est-ce que je le supprime ?', 'Non. Vous retirez seulement le raccourci, comme on décroche une affiche du mur. Word reste dans le menu Démarrer.'],
    ],
  },

  exercices: {
    echauffe: [
      { h3: 'Exercice 1 : je nomme' },
      'Reprenez la capture d\'écran annotée du Déclic. Écrivez le nom de chaque élément.',
      { tableau: [['Lettre', 'Nom de l\'élément'], [['A', ''], ['B', ''], ['C', ''], ['D', ''], ['E', ''], ['F', ''], ['G', '']], [0.6, 4], C.bleu] },
    ],
    entraine: [
      { h3: 'Exercice 2 : la danse des fenêtres' },
      { cases: [
        'J\'ouvre la Calculatrice et le Bloc-notes.',
        'Je les place côte à côte, chacune sur une moitié de l\'écran.',
        'Je réduis la Calculatrice, puis je la fais revenir par la barre des tâches.',
        'Je passe de l\'une à l\'autre avec Alt + Tab.',
        'J\'épingle la Calculatrice à la barre des tâches, puis je ferme les deux fenêtres.',
      ] },
    ],
    lance: [
      { h3: 'Exercice 3 : mon Windows à moi' },
      'Choisissez une photo qui vous fait plaisir comme fond d\'écran, réglez la taille du texte à votre confort, et épinglez les trois programmes que vous pensez utiliser le plus. Notez lesquels :',
      { lignes: ['1. ', '2. ', '3. '] },
    ],
  },

  cas: [
    { h2: 'Ranger l\'écran de Mariam' },
    'Voici ce que l\'on trouve sur l\'écran de Mariam : soixante icônes sur le Bureau, dont vingt-cinq fichiers Word, douze photos, trois raccourcis vers Word, un raccourci vers un jeu jamais utilisé ; six fenêtres ouvertes dont trois fois Word ; une barre des tâches vide.',
    { etapes: [
      'Combien de fenêtres Word doit-elle garder ouvertes ? Comment fermer les autres sans rien perdre ?',
      'Quels **trois** programmes lui conseillez-vous d\'épingler à la barre des tâches pour son travail de secrétaire ?',
      'Que faire des raccourcis en double et du jeu ?',
      'Que faire des vingt-cinq fichiers Word et des douze photos ? (Indice : la réponse complète est au module 4.)',
    ] },
  ],

  retiens: [
    '**Bureau** = la table. **Menu Démarrer** = le tiroir de tous les programmes. **Barre des tâches** = le tableau d\'affichage.',
    'Pour ouvrir un programme : touche **Windows**, je tape son nom, **Entrée**.',
    '**—** réduire (mettre de côté), **☐** agrandir, **✕** fermer.',
    '**Alt + Tab** pour passer d\'une fenêtre à l\'autre ; glisser une fenêtre contre un bord pour la mettre côte à côte.',
    'J\'**épingle** mes programmes favoris avec un clic droit.',
    'Texte trop petit ? **Paramètres → Accessibilité → Taille du texte**.',
  ],
  defi: [
    'Cette semaine, gardez un Bureau avec **dix icônes au maximum**, et ouvrez tous vos programmes par la touche Windows et la recherche. À la fin de la semaine, ce geste doit devenir automatique.',
  ],
  motDeLaFin: 'Le lendemain, Mariam envoie une photo à M. Kouassi : son écran, avec un joli fond d\'écran de la lagune Ébrié et seulement six icônes. En dessous, elle a écrit : « Maintenant, il reste la table en bois. »',
  quiz: [
    'Ma fenêtre a disparu après un clic sur « — ». Elle est… **a)** fermée · **b)** supprimée · **c)** réduite, sur la barre des tâches.',
    'Le chemin le plus rapide pour ouvrir un programme est… **a)** chercher son icône sur le Bureau · **b)** touche Windows, taper son nom, Entrée · **c)** redémarrer l\'ordinateur.',
    'Pour passer d\'une fenêtre à l\'autre au clavier : **a)** Alt + Tab · **b)** Ctrl + Z · **c)** Windows + L.',
    'Détacher Word de la barre des tâches… **a)** supprime Word · **b)** retire seulement le raccourci · **c)** efface mes lettres.',
  ],
  corriges: [
    ['Exercice 1', 'A : fond d\'écran (Bureau) · B : icônes · C : barre des tâches · D : bouton Démarrer · E : recherche · F : programmes épinglés · G : zone de notification.'],
    ['Cas pratique', '**1.** Une seule. Passer sur chaque fenêtre Word en trop et la fermer avec ✕ ; si Word demande d\'enregistrer, répondre **Enregistrer** si le contenu est utile.\n**2.** Par exemple Word, Excel et le navigateur (Edge ou Chrome), ou la messagerie.\n**3.** Supprimer les raccourcis en double et celui du jeu (clic droit → Supprimer) : on supprime seulement des raccourcis, pas les programmes.\n**4.** Les ranger dans des dossiers bien nommés dans Documents et Images (module 4).'],
    ['Mini-quiz', '1-c · 2-b · 3-a · 4-b'],
  ],
  glossaire: [
    ['Bureau', 'L\'écran principal de Windows, sur lequel s\'ouvrent les fenêtres.'],
    ['Icône', 'Une petite image qui représente un programme, un dossier ou un fichier.'],
    ['Menu Démarrer', 'Le menu qui donne accès à tous les programmes et à la recherche.'],
    ['Barre des tâches', 'La barre en bas de l\'écran qui montre les programmes épinglés et ouverts.'],
    ['Fenêtre', 'Le cadre dans lequel s\'affiche un programme ouvert.'],
    ['Épingler', 'Fixer le raccourci d\'un programme sur la barre des tâches ou dans le menu Démarrer.'],
    ['Raccourci', 'Une icône qui mène à un programme ou un fichier rangé ailleurs. Le supprimer ne supprime pas l\'original.'],
    ['Zone de notification', 'La partie droite de la barre des tâches : heure, son, réseau, batterie.'],
  ],
};
