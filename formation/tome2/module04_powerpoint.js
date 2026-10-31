// Tome 2 · Module 4 : PowerPoint, convaincre en dix diapositives
const { C } = require('../outils/livre');

module.exports = {
  num: 4,
  titre: 'PowerPoint : convaincre en dix diapositives',
  sousTitre: 'Le griot raconte, les images soutiennent',
  objectifs: [
    'construire une présentation comme une **histoire** : problème, solution, preuves, demande ;',
    'appliquer les règles de **lisibilité** : une idée par diapositive, peu de texte, grandes polices ;',
    'utiliser **thèmes**, **dispositions**, **images**, **icônes**, **graphiques** et **SmartArt** ;',
    'préparer ses **notes** et s\'entraîner avec le **mode Présentateur** ;',
    'présenter avec assurance et **exporter** en PDF.',
  ],
  duree: 'Cinq heures', materiel: 'Un ordinateur avec Microsoft PowerPoint', prerequis: 'Tome 1 ; modules 2 et 3 de ce tome',

  situation: [
    { h2: 'Les vingt-cinq diapositives de Koffi' },
    'Koffi présente son projet d\'agrandissement à la caisse d\'épargne : il demande 3 millions de F pour deux nouveaux ordinateurs, une photocopieuse couleur et un local plus grand. Il a préparé vingt-cinq diapositives couvertes de texte en taille 12, avec des animations qui font tourner chaque mot.',
    'Pendant quarante minutes, il lit ses diapositives, dos au comité. À la dixième, le directeur regarde sa montre. À la quinzième, il consulte son téléphone. À la fin, il dit poliment : « Envoyez-nous un résumé d\'une page. »',
    { d: ['Koffi', 'J\'avais tout mis, pourtant ! Toutes les informations étaient là !'] },
    { d: ['M. Kouassi', 'C\'est justement le problème, Koffi. Une présentation n\'est pas un document à lire. C\'est toi qui parles. Les diapositives sont là pour t\'aider, comme le tam-tam aide le griot.'] },
  ],

  declic: [
    { h2: 'Une présentation, c\'est un conte au village' },
    'Le soir, au village, le griot ne lit pas un livre à l\'assemblée. Il raconte, il regarde son public, il marque des pauses. Le tam-tam souligne les moments forts. Une bonne présentation fonctionne pareil : **vous** êtes le griot, les **diapositives** sont le tam-tam. Elles soutiennent, elles ne remplacent pas.',
    { h3: 'Le fil de l\'histoire' },
    { tableau: [['Partie', 'La question à laquelle elle répond', 'Diapositives'], [
      ['1. **Le problème**', 'Quel besoin réel, chiffré, avez-vous observé ?', '1 à 2'],
      ['2. **La solution**', 'Que proposez-vous, simplement ?', '1 à 2'],
      ['3. **Les preuves**', 'Pourquoi cela va marcher : chiffres, clients, expérience', '2 à 3'],
      ['4. **Les moyens**', 'Combien, pour quoi faire, avec quel calendrier ?', '1 à 2'],
      ['5. **La demande**', 'Qu\'attendez-vous précisément de votre public ?', '1'],
    ], [1.2, 2.6, 0.9]] },
    { encadre: { titre: '📐  La règle 10-20-30', style: 'violet', contenu: [
      'Guy Kawasaki, célèbre investisseur de la Silicon Valley, a résumé ce qu\'attend un comité de financement : **10 diapositives**, **20 minutes**, et pas de texte plus petit que **30 points**. Une police de 30 oblige à n\'écrire que l\'essentiel.',
    ] } },
    { h3: 'Les quatre règles de lisibilité' },
    { puces: [
      '**Une idée par diapositive.** Le titre dit l\'idée en une phrase courte : « Yopougon manque de secrétariats ouverts le dimanche ».',
      '**Peu de mots.** Six lignes au maximum, quelques mots par ligne. Les détails, vous les dites.',
      '**Des images plutôt que des phrases.** Une photo du local, un graphique, une icône.',
      '**Du contraste.** Texte foncé sur fond clair ou l\'inverse. Pas de texte sur une photo chargée.',
    ] },
  ],

  pasAPas: [
    { h2: 'Étape 1 : poser le squelette' },
    { etapes: [
      'Avant d\'ouvrir PowerPoint, écrivez sur une feuille les **dix titres** de vos diapositives, en suivant le fil de l\'histoire.',
      'Ouvrez PowerPoint → **Nouvelle présentation**. Choisissez un **thème** sobre dans l\'onglet **Création**.',
      'Pour chaque diapositive : **Accueil** → **Nouvelle diapositive** → choisissez la **disposition** adaptée (Titre et contenu, Deux contenus, Titre seul…).',
      'Tapez vos titres. En mode **Plan** (**Affichage** → **Mode Plan**), vous voyez toute l\'histoire d\'un coup d\'œil.',
    ] },
    { h2: 'Étape 2 : habiller' },
    { tableau: [['Je veux…', 'Chemin'], [
      ['Une mise en page élégante proposée automatiquement', '**Création** → **Concepteur** (Designer) : PowerPoint propose des mises en page pour la diapositive.'],
      ['Une **photo**', '**Insertion** → **Images** → **Cet appareil** pour vos photos, ou **Images de stock** pour des photos libres de droits.'],
      ['Une **icône** simple', '**Insertion** → **Icônes**.'],
      ['Un **graphique**', 'Copiez le graphique depuis Excel et collez-le, ou **Insertion** → **Graphique**.'],
      ['Un schéma (étapes, cycle, organigramme)', '**Insertion** → **SmartArt**.'],
      ['Une transition sobre entre les diapositives', '**Transitions** → **Fondu**, puis **Appliquer partout**.'],
    ], [1.8, 3.2]] },
    { illus: 'Avant / après : à gauche, une diapositive surchargée de texte en taille 12 ; à droite, la même idée avec un titre court, un grand chiffre « 3 200 clients par mois » et une photo du secrétariat.' },
    { h2: 'Étape 3 : les notes du présentateur' },
    { etapes: [
      'Sous chaque diapositive, la zone **Cliquez pour ajouter des notes** reçoit ce que vous voulez **dire**. Si elle est cachée : **Affichage** → **Notes**.',
      'Écrivez des mots-clés, pas un texte à lire.',
    ] },
    { h2: 'Étape 4 : s\'entraîner et présenter' },
    { etapes: [
      '**Diaporama** → **Répéter avec le coach** (selon votre version) : PowerPoint vous écoute et signale si vous parlez trop vite ou lisez trop vos diapositives.',
      '**Diaporama** → **Vérification du minutage** : chronométrez-vous. Visez dix-huit minutes pour vingt prévues.',
      'Le jour J, avec un vidéoprojecteur : **Diaporama** → cochez **Utiliser le mode Présentateur**. Vous voyez vos notes et la diapositive suivante ; le public ne voit que la diapositive.',
      '**F5** lance le diaporama depuis le début ; les **flèches** avancent et reculent ; **B** met l\'écran en noir pour capter l\'attention ; **Échap** quitte.',
      'Exportez une version **PDF** (**Fichier** → **Enregistrer sous** → type PDF) à envoyer après la présentation.',
    ] },
    { encadre: { titre: '🎤  Les conseils de M. Kouassi pour l\'oral', style: 'vert', contenu: [
      { puces: [
        'Regardez votre **public**, pas l\'écran.',
        'Commencez par une **phrase forte** : un chiffre, une question, une histoire courte.',
        'Arrivez **tôt** pour tester le vidéoprojecteur. Ayez le fichier sur une **clé USB** et dans votre **boîte e-mail**.',
        'Terminez par votre **demande**, clairement : « Nous vous demandons un prêt de 3 millions sur 24 mois. »',
      ] },
    ] } },
  ],

  pieges: {
    lignes: [
      ['📜 Écrire des paragraphes entiers', 'Le public lit au lieu d\'écouter, et lit plus vite que vous parlez.', 'Six lignes maximum, quelques mots par ligne.'],
      ['🔙 Lire ses diapositives, dos au public', 'On perd l\'attention et la confiance.', 'Notes du présentateur et entraînement.'],
      ['🌀 Animations et sons gadgets', 'Distraction, impression d\'amateurisme.', 'Une transition sobre, appliquée partout.'],
      ['🖼️ Prendre n\'importe quelle image sur Internet', 'Images floues, et risque de violer des droits d\'auteur.', 'Vos photos, ou les Images de stock libres de droits.'],
      ['🎨 Texte clair sur fond clair', 'Illisible au vidéoprojecteur.', 'Un contraste fort.'],
    ],
    questions: [
      ['Et si le vidéoprojecteur ne marche pas ?', 'Ayez toujours un plan B : des exemplaires imprimés (Fichier → Imprimer → **Pages de commentaires** ou **Documents** avec trois diapositives par page), et sachez présenter sans écran. Si votre histoire est claire, vous pourrez la raconter.'],
      ['PowerPoint, Google Slides, Canva : lequel choisir ?', 'Les mêmes règles s\'appliquent partout. PowerPoint est le plus répandu en entreprise ; Google Slides est gratuit et facile à partager ; Canva propose de très beaux modèles. Choisissez celui que votre public pourra ouvrir.'],
    ],
  },

  exercices: {
    echauffe: [
      { h3: 'Exercice 1 : le bon titre' },
      'Réécrivez chaque titre en une phrase courte qui dit l\'idée :',
      { lignes: ['« Chiffres » → ', '« Présentation de l\'entreprise et de son historique depuis sa création » → ', '« Besoins » → '] },
    ],
    entraine: [
      { h3: 'Exercice 2 : avant / après' },
      'Prenez une diapositive surchargée (la vôtre ou celle d\'un collègue) et refaites-la : un titre-idée, trois éléments au maximum, une image ou un graphique, police de 28 au moins.',
    ],
    lance: [
      { h3: 'Exercice 3 : mon pitch de cinq minutes' },
      'Présentez en cinq diapositives et cinq minutes un projet personnel (activité, association, achat important). Faites-vous filmer par votre binôme avec le téléphone, regardez la vidéo, notez deux points à améliorer, recommencez.',
    ],
  },

  cas: [
    { h2: 'La deuxième chance de Koffi' },
    'La caisse d\'épargne accepte de revoir Koffi dans deux semaines, pour quinze minutes. Voici ses informations : 3 200 clients par mois ; aucun secrétariat ouvert le dimanche dans son quartier ; deux ordinateurs saturés ; demande de 3 millions de F sur 24 mois ; chiffre d\'affaires en hausse de 30 % sur l\'année ; trois entreprises clientes régulières.',
    { etapes: [
      'Rédigez les **titres** de ses dix diapositives en suivant le fil problème, solution, preuves, moyens, demande.',
      'Quelles informations mettre en **graphique** ?',
      'Quelle **phrase d\'ouverture** lui conseillez-vous ?',
      'Que doit-il préparer comme plan B ?',
    ] },
  ],

  retiens: [
    'Une présentation est une **histoire** : problème, solution, preuves, moyens, demande.',
    '**10-20-30** : dix diapositives, vingt minutes, police de trente.',
    'Une **idée** par diapositive, un **titre-phrase**, peu de mots, des **images**.',
    '**Création → Concepteur** pour la mise en page ; **Images de stock** pour des photos libres de droits.',
    'Les **notes** pour vous, le **mode Présentateur** le jour J, **F5** pour lancer, **Échap** pour quitter.',
    'Je regarde mon public, je m\'entraîne, j\'ai un **plan B**.',
  ],
  defi: [
    'Cette semaine, présentez quelque chose à au moins trois personnes avec une présentation de cinq diapositives maximum : un projet, un bilan, une idée pour votre association ou votre famille.',
  ],
  motDeLaFin: 'Deux semaines plus tard, Koffi a présenté dix diapositives en quinze minutes, debout, face au comité. Il a commencé par : « Le dimanche, à Yopougon, 3 200 personnes par mois ne trouvent personne pour imprimer leur dossier. » Le directeur a posé son téléphone. Le prêt a été accordé.',
  quiz: [
    'Selon la règle 10-20-30, la taille minimale du texte est de… **a)** 10 · **b)** 20 · **c)** 30 points.',
    'Le titre d\'une diapositive doit… **a)** être un seul mot · **b)** exprimer l\'idée en une phrase courte · **c)** être en majuscules.',
    'Le mode Présentateur permet… **a)** de voir ses notes sans que le public les voie · **b)** d\'ajouter des animations · **c)** d\'imprimer.',
    'Pour lancer le diaporama depuis le début : **a)** F5 · **b)** Ctrl + Z · **c)** Alt + F4.',
  ],
  corriges: [
    ['Exercice 1', 'Par exemple : « Nos ventes ont augmenté de 30 % en un an » · « Huit ans d\'expérience au service des PME » · « Il nous manque deux ordinateurs et une photocopieuse ».'],
    ['Cas pratique', '**1.** Exemple : 1. Le dimanche, 3 200 personnes par mois ne trouvent pas de secrétariat · 2. Nos machines sont saturées · 3. Notre solution : ouvrir 7 jours sur 7 · 4. Ce que nous ajouterons · 5. +30 % de chiffre d\'affaires en un an · 6. Trois entreprises nous font déjà confiance · 7. Le budget : 3 millions · 8. Le calendrier · 9. Le remboursement sur 24 mois · 10. Notre demande. **2.** L\'évolution du chiffre d\'affaires (courbe), la répartition du budget (secteurs ou barres), le plan de remboursement. **3.** Un chiffre fort tiré du terrain, par exemple celui des 3 200 clients. **4.** Des copies imprimées, le fichier sur clé USB et par e-mail, et la capacité de présenter sans écran.'],
    ['Mini-quiz', '1-c · 2-b · 3-a · 4-a'],
  ],
  glossaire: [
    ['Diapositive', 'Une page d\'une présentation PowerPoint.'],
    ['Disposition', 'Le modèle d\'organisation d\'une diapositive : titre seul, titre et contenu, deux contenus…'],
    ['Thème', 'L\'ensemble cohérent de couleurs, polices et fonds d\'une présentation.'],
    ['Mode Présentateur', 'L\'affichage qui montre au présentateur ses notes et la diapositive suivante, pendant que le public ne voit que la diapositive en cours.'],
    ['SmartArt', 'Un outil qui transforme une liste en schéma : étapes, cycle, organigramme.'],
    ['Pitch', 'Une présentation courte et percutante d\'un projet, pour convaincre.'],
  ],
};
