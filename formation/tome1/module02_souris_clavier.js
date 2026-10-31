// Tome 1 · Module 2 : La souris et le clavier, mes deux mains
const { C } = require('../outils/livre');

module.exports = {
  num: 2,
  titre: 'La souris et le clavier, mes deux mains',
  sousTitre: 'Apprendre à conduire avant de prendre la route',
  objectifs: [
    'tenir la souris et réussir **clic**, **double-clic**, **clic droit**, **glisser-déposer** et **défilement** ;',
    'utiliser le **pavé tactile** d\'un ordinateur portable ;',
    'connaître les **touches importantes** du clavier AZERTY ;',
    'écrire les **majuscules**, les **accents**, les **chiffres** et l\'**arobase** (@).',
  ],
  duree: 'Trois heures, et un peu d\'entraînement chaque jour', materiel: 'Un ordinateur, une souris (conseillée)', prerequis: 'Module 1',

  situation: [
    { h2: 'Le doigt de Yao' },
    'Yao écrit sur son téléphone plus vite que son ombre. Mais devant l\'ordinateur de la formation, il est perdu. Il touche l\'écran avec son doigt : rien ne se passe. Il clique une fois sur le dossier : rien ne s\'ouvre. Il clique trois fois, lentement : toujours rien.',
    'Pendant ce temps, Tantie Akissi a écrit son nom : « TANTIE AKISSI », tout en majuscules. Elle cherche depuis cinq minutes comment écrire le « é » de « café ».',
    { d: ['Yao', 'Monsieur, cet ordinateur est gâté. Il ne répond pas quand on le touche !'] },
    { d: ['M. Kouassi', 'Il n\'est pas gâté, Yao. Il ne parle pas la même langue que ton téléphone. Ton téléphone se commande avec le doigt. L\'ordinateur, lui, se commande avec deux mains : la souris et le clavier.'] },
  ],

  declic: [
    { h2: 'La souris, c\'est votre doigt qui montre' },
    'Au marché, quand vous voulez un pagne précis, vous le montrez du doigt : « Celui-là ! » La **souris** fait exactement cela sur l\'écran. Quand vous la déplacez sur la table, une petite flèche, le **pointeur**, se déplace à l\'écran. Elle montre ce que vous voulez.',
    { illus: 'Une main posée sur une souris : l\'index sur le bouton gauche, le majeur sur le bouton droit, la molette entre les deux, la paume posée sans serrer.' },
    { tableau: [['Le geste', 'Comment faire', 'Comme dans la vie…', 'À quoi ça sert'], [
      ['**Clic** (gauche)', 'Appuyer une fois sur le bouton gauche, puis relâcher', 'Toquer une fois à la porte pour dire « je suis là »', 'Choisir, sélectionner, appuyer sur un bouton'],
      ['**Double-clic**', 'Deux clics gauches **rapides**, sans bouger la souris', '« Toc-toc », et on vous ouvre', 'Ouvrir un fichier, un dossier, un programme'],
      ['**Clic droit**', 'Une fois sur le bouton droit', 'Demander la carte au maquis : on vous montre ce qui est possible', 'Afficher un menu de choix pour l\'élément pointé'],
      ['**Glisser-déposer**', 'Maintenir le bouton gauche enfoncé, déplacer, puis relâcher', 'Prendre un objet, le porter, le poser ailleurs', 'Déplacer un fichier, une fenêtre'],
      ['**Défiler**', 'Faire rouler la **molette** avec l\'index', 'Dérouler un rouleau de tissu pour voir la suite', 'Monter ou descendre dans une page'],
    ], [1, 1.5, 1.6, 1.5]] },
    { encadre: { titre: '💻  Sans souris : le pavé tactile', style: 'bleu', contenu: [
      'Sur un portable, le rectangle sous le clavier s\'appelle le **pavé tactile**. Il remplace la souris :',
      { puces: [
        'glisser **un doigt** déplace le pointeur ;',
        'un **tapotement léger** d\'un doigt = un clic ; deux tapotements rapides = un double-clic ;',
        'un tapotement à **deux doigts** = un clic droit ;',
        'glisser **deux doigts** vers le haut ou le bas = faire défiler.',
      ] },
      'Conseil : pour apprendre, une petite souris (environ 3 000 F) est beaucoup plus facile. Le pavé tactile viendra ensuite.',
    ] } },
    { h2: 'Le clavier, c\'est votre voix' },
    'Le clavier sert à **écrire** et à **donner des ordres**. En Côte d\'Ivoire, comme en France, nos claviers sont en **AZERTY** : ce sont les six premières lettres de la ligne du haut. Le clavier se divise en quartiers, comme une ville.',
    { illus: 'Un clavier AZERTY vu de dessus, avec ses zones colorées : lettres (orange), chiffres (or), touches de commande (vert), flèches (bleu), pavé numérique (violet). Les touches Entrée, Retour arrière, Suppr, Maj, Verr Maj, Alt Gr, Espace, Échap et la touche Windows sont légendées.' },
    { tableau: [['Touche', 'Où la trouver', 'Ce qu\'elle fait'], [
      ['**Espace**', 'La longue barre en bas', 'Fait un espace entre deux mots'],
      ['**Entrée** ↵', 'Grande touche à droite des lettres', 'Va à la ligne ; valide un choix (comme dire « oui »)'],
      ['**Retour arrière** ⌫', 'Au-dessus de Entrée', 'Efface la lettre **à gauche** du curseur'],
      ['**Suppr**', 'En haut à droite', 'Efface la lettre **à droite** du curseur, ou supprime un élément choisi'],
      ['**Maj** ⇧', 'Deux touches, à gauche et à droite', 'Tant qu\'on la tient : majuscule, ou le caractère du haut d\'une touche'],
      ['**Verr Maj** ⇪', 'À gauche, au-dessus de Maj', 'Bloque les majuscules. Un voyant s\'allume souvent. On appuie à nouveau pour débloquer'],
      ['**Alt Gr**', 'À droite de la barre d\'espace', 'Donne le **troisième** caractère d\'une touche : @, €, #'],
      ['**Échap**', 'Tout en haut à gauche', 'Annule ou ferme : « laisse tomber »'],
      ['**Flèches**', 'En bas à droite', 'Déplacent le curseur dans un texte'],
      ['**Windows** ⊞', 'En bas, entre Ctrl et Alt', 'Ouvre le menu Démarrer'],
    ], [1, 1.4, 2.4]] },
    { h3: 'Le secret des touches à trois étages' },
    'Regardez la touche du chiffre **0** sur un clavier AZERTY : on y voit **à**, **0** et **@**. Une touche peut porter trois caractères, comme un immeuble à trois étages :',
    { puces: [
      '**le rez-de-chaussée** (en bas à gauche) : on appuie simplement sur la touche → **à** ;',
      '**le premier étage** (en haut) : on tient **Maj** et on appuie → **0** ;',
      '**le deuxième étage** (en bas à droite) : on tient **Alt Gr** et on appuie → **@**.',
    ] },
    { encadre: { titre: '🔑  Spécialité AZERTY : les chiffres sont à l\'étage !', style: 'vert', contenu: [
      'Sur la rangée du haut, les chiffres sont au premier étage : il faut tenir **Maj** pour les écrire. Sinon, vous obtenez &, é, ", \', (… Pour taper beaucoup de chiffres (des prix, des numéros), utilisez le **pavé numérique** à droite du clavier s\'il existe, après avoir vérifié que le voyant **Verr Num** est allumé.',
    ] } },
    { h3: 'Les accents, sans se fatiguer' },
    { tableau: [['Je veux écrire…', 'Je fais…'], [
      ['é, è, à, ù, ç', 'Ils ont leur propre touche sur la rangée des chiffres (ou à droite pour ù). On appuie simplement.'],
      ['ê, â, ô, î, û', 'J\'appuie **une fois** sur la touche ^ (à droite du P), je relâche, **puis** je tape la voyelle. Rien ne s\'affiche après le ^ : c\'est normal, il attend sa voyelle.'],
      ['ë, ï, ü', 'Je tiens **Maj** et j\'appuie sur la touche ^ (cela donne ¨), puis je tape la voyelle.'],
      ['@ (l\'arobase)', '**Alt Gr** + la touche **à / 0**.'],
      ['€', '**Alt Gr** + **E**.'],
    ], [1.2, 3.4]] },
  ],

  pasAPas: [
    { h2: 'Étape 1 : bien s\'installer' },
    { etapes: [
      'Asseyez-vous **le dos droit**, les pieds à plat, l\'écran à hauteur des yeux, à environ un bras de distance.',
      'Posez la souris **à droite du clavier** (à gauche si vous êtes gaucher), sur une surface plate. Un tapis de souris ou un cahier fermé suffit.',
      'Posez la paume sur la souris **sans serrer** : l\'index sur le bouton gauche, le majeur sur le bouton droit.',
    ] },
    { h2: 'Étape 2 : s\'entraîner à la souris sur le Bureau' },
    { etapes: [
      'Déplacez la souris doucement et suivez le pointeur des yeux. Si vous arrivez au bord de la table, **soulevez** la souris et reposez-la au milieu : le pointeur ne bouge pas pendant qu\'elle est en l\'air.',
      'Faites un **clic** sur l\'icône **Corbeille** du Bureau : elle se colore. Elle est **sélectionnée**.',
      'Faites un **double-clic** sur la Corbeille : une fenêtre s\'ouvre. Fermez-la avec la croix **✕** en haut à droite (un simple clic).',
      'Faites un **clic droit** sur un espace vide du Bureau : un menu apparaît. Appuyez sur **Échap** pour le fermer sans rien choisir.',
      'Faites un **glisser-déposer** : maintenez le bouton gauche sur la Corbeille, déplacez-la un peu, relâchez. Elle a changé de place. Remettez-la où elle était.',
    ] },
    { h2: 'Étape 3 : écrire dans le Bloc-notes' },
    'Le **Bloc-notes** est un petit logiciel très simple, parfait pour s\'entraîner à écrire.',
    { etapes: [
      'Appuyez sur la touche **Windows** du clavier. Le menu Démarrer s\'ouvre.',
      'Tapez simplement **bloc** : Windows cherche tout seul. Quand **Bloc-notes** apparaît en haut, appuyez sur **Entrée**.',
      'Une page blanche s\'ouvre, avec un petit trait qui clignote : c\'est le **curseur**. Il montre où la prochaine lettre va s\'écrire.',
      'Écrivez votre prénom avec une majuscule au début : tenez **Maj**, tapez la première lettre, relâchez **Maj**, puis tapez la suite.',
      'Appuyez sur **Entrée** pour aller à la ligne, puis écrivez : « Je suis à Abidjan. »',
      'Placez le curseur au milieu d\'un mot en cliquant dedans, puis essayez **Retour arrière** et **Suppr** pour voir la différence.',
    ] },
    { illus: 'Capture d\'écran : le Bloc-notes de Windows 11 ouvert, avec deux lignes écrites et le curseur qui clignote, légendé « le curseur ».' },
    { encadre: { titre: '💡  Le conseil de M. Kouassi', style: 'vert', contenu: [
      '« Au début, regardez vos doigts, c\'est normal. Après quelques semaines, essayez de regarder l\'écran. La vitesse viendra toute seule. Et n\'oubliez pas : **Ctrl + Z** annule votre dernière action. C\'est la gomme magique de l\'informaticien. »',
    ] } },
  ],

  pieges: {
    lignes: [
      ['🐢 Faire un double-clic trop lent', 'L\'ordinateur comprend deux clics séparés : rien ne s\'ouvre.', 'Deux clics rapides, comme un battement de cœur, sans bouger la souris.'],
      ['🔠 Écrire avec Verr Maj allumé', 'TOUT S\'ÉCRIT EN MAJUSCULES, ce qui sur Internet donne l\'impression de crier. Et le mot de passe est refusé.', 'Regarder le voyant. Appuyer une fois sur Verr Maj pour l\'éteindre.'],
      ['👆 Toucher l\'écran avec le doigt', 'La plupart des écrans d\'ordinateur ne sont pas tactiles. En plus, on y laisse des traces.', 'Utiliser la souris ou le pavé tactile.'],
      ['⌨️ Rester appuyé sur une touche', 'La lettre se répète : « bonjourrrrrrr ».', 'Appuyer brièvement, comme on tapote.'],
      ['🔢 Chercher les chiffres sans Maj', 'On obtient &é"\'( au lieu de 12345.', 'Tenir Maj, ou utiliser le pavé numérique.'],
    ],
    questions: [
      ['Si je clique au mauvais endroit, est-ce que ça peut tout effacer ?', 'Non. Un simple clic ne fait que **sélectionner**. Pour supprimer quelque chose, Windows vous demande en général de confirmer, et ce qui est supprimé va d\'abord dans la Corbeille, d\'où on peut le récupérer (module 4).'],
      ['Gaucher, je peux utiliser la souris ?', 'Bien sûr. Placez-la à gauche. Vous pouvez même inverser les boutons : Démarrer → Paramètres → Bluetooth et appareils → Souris → Bouton principal de la souris → Droite.'],
    ],
  },

  exercices: {
    echauffe: [
      { h3: 'Exercice 1 : le bon geste' },
      'Pour chaque action, écrivez le geste à utiliser : clic, double-clic, clic droit, glisser-déposer ou défiler.',
      { tableau: [['Je veux…', 'Le geste'], [
        ['Ouvrir un dossier', ''], ['Voir les choix possibles pour un fichier', ''], ['Lire la suite d\'une longue page', ''],
        ['Déplacer une photo dans un autre dossier', ''], ['Appuyer sur un bouton « OK »', ''],
      ], [2, 1.5], C.bleu] },
    ],
    entraine: [
      { h3: 'Exercice 2 : la dictée du clavier' },
      'Dans le Bloc-notes, recopiez exactement ces lignes, avec les majuscules, les accents et la ponctuation :',
      { encadre: { style: 'bleu', contenu: [
        'À Abidjan, il fait chaud ; même à la fête, on boit du café frais.',
        'Je m\'appelle Akissi. Mon numéro : 07 00 00 00 00.',
        'Écrivez-moi à : akissi.pagnes@gmail.com',
        'Prix du pagne : 12 500 F. Hôtel « Ivoire ». Noël approche !',
      ] } },
      { note: 'Astuce pour le « À » majuscule en début de phrase : vous pourrez le corriger facilement dans Word au module 5. Dans le Bloc-notes, écrivez « A ».' },
    ],
    lance: [
      { h3: 'Exercice 3 : chrono' },
      'Écrivez dans le Bloc-notes, sans regarder le livre, une phrase de votre choix d\'au moins quinze mots. Chronométrez-vous avec votre téléphone. Recommencez chaque jour de la semaine et notez vos temps : vous verrez les progrès.',
      { tableau: [['Jour', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'], [['Temps', '', '', '', '', '', '', '']], [1.2, 1, 1, 1, 1, 1, 1, 1], C.bleu] },
    ],
  },

  cas: [
    { h2: 'Le mot de passe refusé de Mariam' },
    'Mariam arrive au bureau. Elle tape son mot de passe, **Mariam2024**, et Windows répond : « Le mot de passe est incorrect. » Elle recommence trois fois. Toujours refusé. Elle est sûre de ne pas s\'être trompée.',
    { etapes: [
      'Quelles sont les **deux** touches du clavier qui peuvent expliquer ce refus ?',
      'Comment Mariam peut-elle **voir** ce qu\'elle tape ? (Indice : regardez l\'icône en forme d\'œil au bout de la case du mot de passe.)',
      'Écrivez la marche à suivre en trois étapes pour réussir à se connecter.',
    ] },
  ],

  retiens: [
    '**Clic** = choisir. **Double-clic** = ouvrir. **Clic droit** = voir les choix. **Glisser-déposer** = déplacer. **Molette** = défiler.',
    'Le **pavé tactile** remplace la souris : un doigt pour bouger, deux doigts pour le clic droit et le défilement.',
    'Une touche peut avoir trois étages : normal, **Maj**, **Alt Gr**. L\'arobase **@** = **Alt Gr + à**.',
    'Sur un clavier AZERTY, les chiffres du haut demandent **Maj**.',
    '**Retour arrière** efface à gauche, **Suppr** efface à droite. **Ctrl + Z** annule.',
    'Si tout s\'écrit en majuscules, je vérifie **Verr Maj**.',
  ],
  defi: [
    'Chaque jour de la semaine, écrivez dans le Bloc-notes trois phrases sur votre journée. À la fin de la semaine, comparez votre première et votre dernière phrase.',
  ],
  motDeLaFin: 'À la fin de la séance, Yao a réussi à ouvrir trois dossiers d\'affilée par double-clic. Tantie Akissi, elle, a écrit « Je bois mon café à Abidjan », sans une seule faute, et elle a montré fièrement son « é » à tout le monde.',
  quiz: [
    'Pour ouvrir un dossier, je fais… **a)** un clic droit · **b)** un double-clic · **c)** un glisser-déposer.',
    'Pour écrire @ sur un clavier AZERTY, j\'utilise… **a)** Maj + à · **b)** Alt Gr + à · **c)** Ctrl + à.',
    'Pour écrire ê, je… **a)** appuie sur ^ puis sur e · **b)** appuie sur e puis sur ^ · **c)** tiens Alt et j\'appuie sur e.',
    'Pour effacer la lettre à gauche du curseur, j\'utilise… **a)** Suppr · **b)** Échap · **c)** Retour arrière.',
  ],
  corriges: [
    ['Exercice 1', 'Ouvrir un dossier : double-clic · Voir les choix : clic droit · Lire la suite : défiler · Déplacer une photo : glisser-déposer · Bouton OK : clic.'],
    ['Cas pratique', '**1.** **Verr Maj** (le mot de passe s\'écrit MARIAM2024 au lieu de Mariam2024) et, pour les chiffres, **Verr Num** si elle utilise le pavé numérique éteint.\n**2.** En maintenant le clic sur l\'icône en forme d\'œil au bout de la case, Windows affiche les caractères tapés.\n**3.** Vérifier le voyant Verr Maj et l\'éteindre ; vérifier Verr Num ; afficher le mot de passe avec l\'œil, le retaper, puis appuyer sur Entrée.'],
    ['Mini-quiz', '1-b · 2-b · 3-a · 4-c'],
  ],
  glossaire: [
    ['Pointeur', 'La petite flèche qui se déplace à l\'écran quand on bouge la souris.'],
    ['Curseur', 'Le petit trait qui clignote dans un texte et montre où la prochaine lettre va s\'écrire.'],
    ['Double-clic', 'Deux clics gauches rapides, pour ouvrir.'],
    ['Clic droit', 'Un clic sur le bouton droit, qui affiche un menu de choix.'],
    ['Glisser-déposer', 'Maintenir le clic, déplacer, puis relâcher pour déplacer un élément.'],
    ['Pavé tactile', 'Surface sensible au toucher qui remplace la souris sur un portable.'],
    ['AZERTY', 'Le type de clavier utilisé en Côte d\'Ivoire et en France, nommé d\'après ses premières lettres.'],
    ['Arobase (@)', 'Le caractère qui sépare le nom et le fournisseur dans une adresse e-mail.'],
  ],
};
