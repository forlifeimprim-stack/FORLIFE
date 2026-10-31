// Tome 1 · Module 6 : Mon premier tableau de comptes (Excel)
const { C } = require('../outils/livre');

module.exports = {
  num: 6,
  titre: 'Mon premier tableau de comptes (Excel)',
  sousTitre: 'Le cahier de la boutique qui compte tout seul',
  objectifs: [
    'comprendre ce qu\'est un **tableur** : classeur, feuille, **cellule**, **adresse** ;',
    'saisir du texte et des **nombres** correctement ;',
    'écrire une **formule** simple et utiliser la **somme automatique** ;',
    '**recopier** une formule sur toute une colonne ;',
    'présenter un tableau propre : largeur des colonnes, bordures, format des nombres.',
  ],
  duree: 'Six heures, en trois séances', materiel: 'Un ordinateur avec Microsoft Excel', prerequis: 'Modules 1 à 5',

  situation: [
    { h2: 'Le cahier de Tantie Akissi' },
    'Depuis trente ans, Tantie Akissi note ses ventes dans un cahier d\'écolier : la date, le pagne, le prix. À la fin du mois, elle additionne tout à la main, ligne après ligne. Chaque mois, le total change selon qu\'elle compte le matin ou le soir. Ce mois-ci, entre les ratures, les taches d\'huile et une page arrachée, elle ne sait plus si elle a gagné ou perdu de l\'argent.',
    { d: ['Tantie Akissi', 'Je compte bien, hein ! Mais trente lignes de chiffres, à la fin, ma tête tourne.'] },
    { d: ['M. Kouassi', 'Tantie, et si votre cahier comptait tout seul ? Vous écrivez les ventes, il fait les additions. Et si vous corrigez une ligne, le total se corrige tout seul.'] },
  ],

  declic: [
    { h2: 'Excel, le cahier quadrillé qui calcule' },
    '**Excel** est un **tableur** : un immense cahier quadrillé, avec des milliers de cases, qui sait calculer. Un fichier Excel s\'appelle un **classeur** ; il contient une ou plusieurs **feuilles**, comme les pages du cahier.',
    { h3: 'Chaque case a son adresse, comme au marché' },
    'Au marché, pour retrouver une vendeuse, on dit : « allée **B**, place **3** ». Dans Excel, c\'est pareil. Les **colonnes** sont désignées par des **lettres** (A, B, C…) et les **lignes** par des **chiffres** (1, 2, 3…). Chaque case s\'appelle une **cellule**, et son adresse combine les deux : **B3**, c\'est la cellule de la colonne B, ligne 3.',
    { illus: 'Capture d\'écran d\'Excel annotée : les lettres des colonnes, les numéros des lignes, la cellule B3 encadrée en vert, la zone Nom qui affiche « B3 », la barre de formule, le bouton Somme automatique Σ, les onglets de feuilles en bas.' },
    { h3: 'Le signe = : « Excel, calcule ! »' },
    'Quand on écrit dans une cellule un texte commençant par le signe **=**, Excel comprend que c\'est un ordre de calcul : une **formule**. Il affiche le **résultat** dans la cellule, et la formule reste visible dans la **barre de formule**, en haut.',
    { tableau: [['Opération', 'Signe', 'Exemple', 'Résultat'], [
      ['Addition', '**+**', '=1500+2000', '3500'],
      ['Soustraction', '**-**', '=5000-1500', '3500'],
      ['Multiplication', '**\\***', '=3\\*2500', '7500'],
      ['Division', '**/**', '=10000/4', '2500'],
    ], [1.3, 0.7, 1.4, 1]] },
    { encadre: { titre: '🔑  Le vrai pouvoir : calculer avec des adresses', style: 'vert', contenu: [
      'Écrire **=3\\*2500** marche, mais Excel ne fait alors que remplacer la calculatrice. Le vrai pouvoir, c\'est d\'écrire **=C2\\*D2** : « multiplie ce qu\'il y a dans C2 par ce qu\'il y a dans D2 ». Si Tantie corrige la quantité dans C2, le résultat se met à jour **tout seul**. Comme un vendeur honnête qui recalcule à chaque fois que vous changez d\'avis.',
    ] } },
    { h3: 'Une plage : de la case… à la case…' },
    'Pour désigner plusieurs cellules qui se suivent, on écrit la première et la dernière, séparées par deux-points : **E2:E20** se lit « de E2 à E20 ». C\'est comme dire « de la place 2 à la place 20 de l\'allée E ».',
  ],

  pasAPas: [
    { h2: 'Le cahier de ventes de Tantie Akissi' },
    { h3: 'Étape 1 : préparer le tableau' },
    { etapes: [
      'Ouvrez Excel et choisissez **Nouveau classeur vide**. Enregistrez tout de suite : **Fichier** → **Enregistrer sous**, dossier **Boutique**, nom **2026-11 Ventes de novembre**.',
      'Cliquez sur la cellule **A1** et tapez le titre : **Ventes de novembre 2026**. Appuyez sur **Entrée** : Excel descend à la cellule du dessous.',
      'En ligne 3, tapez les en-têtes, en passant d\'une cellule à la suivante avec la touche **Tab** : **Date** (A3), **Article** (B3), **Quantité** (C3), **Prix unitaire** (D3), **Montant** (E3).',
      'Si un texte déborde, **élargissez** la colonne : placez le pointeur entre deux lettres de colonnes (par exemple entre B et C), il devient une double flèche ; **double-cliquez** : la colonne prend la bonne largeur.',
    ] },
    { h3: 'Étape 2 : saisir les ventes' },
    'Recopiez ces lignes, à partir de la ligne 4. Tapez les nombres **seuls**, sans « F », sans espaces : Excel ne sait pas calculer avec « 12 500 F ».',
    { tableau: [['', 'A', 'B', 'C', 'D', 'E'], [
      ['**3**', 'Date', 'Article', 'Quantité', 'Prix unitaire', 'Montant'],
      ['**4**', '03/11/2026', 'Wax hollandais', '2', '18000', ''],
      ['**5**', '03/11/2026', 'Pagne baoulé', '1', '25000', ''],
      ['**6**', '04/11/2026', 'Wax ordinaire', '5', '6500', ''],
      ['**7**', '05/11/2026', 'Foulard', '4', '2000', ''],
      ['**8**', '05/11/2026', 'Wax hollandais', '1', '18000', ''],
    ], [0.4, 1.1, 1.5, 0.9, 1.1, 1], C.vert] },
    { h3: 'Étape 3 : la première formule' },
    { etapes: [
      'Cliquez sur **E4**.',
      'Tapez **=C4\\*D4**, puis **Entrée**. Excel affiche **36000**.',
      'Cliquez à nouveau sur E4 : regardez la **barre de formule**, la formule y est.',
    ] },
    { h3: 'Étape 4 : recopier la formule d\'un geste' },
    { etapes: [
      'Cliquez sur **E4**. En bas à droite de la cellule, il y a un tout petit carré : la **poignée de recopie**.',
      'Placez le pointeur dessus : il devient une petite croix noire **+**.',
      '**Double-cliquez**, ou glissez vers le bas jusqu\'à E8. La formule est recopiée sur toutes les lignes, et Excel adapte tout seul les adresses : E5 contient =C5\\*D5, E6 contient =C6\\*D6…',
    ] },
    { h3: 'Étape 5 : le total' },
    { etapes: [
      'Cliquez sur **D9**, juste sous la dernière vente, et tapez **TOTAL**.',
      'Cliquez sur **E9**, puis sur le bouton **Σ Somme automatique** dans l\'onglet **Accueil** (tout à droite). Excel propose **=SOMME(E4:E8)** et entoure la plage en pointillés.',
      'Vérifiez que la plage est la bonne, puis **Entrée**. Le total des ventes s\'affiche.',
      'Faites l\'essai : changez la quantité du foulard de 4 à 6. Le montant **et** le total changent tout seuls.',
    ] },
    { h3: 'Étape 6 : rendre le tableau présentable' },
    { tableau: [['Je veux…', 'Je sélectionne, puis…'], [
      ['Des nombres lisibles (18 000 au lieu de 18000)', 'Colonnes D et E → onglet **Accueil** → groupe **Nombre** → bouton **Séparateur de milliers** (000). Réduisez ensuite les décimales à zéro avec le bouton **Réduire les décimales**.'],
      ['Des bordures autour du tableau', 'A3:E9 → flèche du bouton **Bordures** → **Toutes les bordures**.'],
      ['Des en-têtes visibles', 'A3:E3 → **Gras** et une **couleur de remplissage** (le pot de peinture).'],
      ['Un titre mis en valeur', 'A1 → **Gras**, taille **16**.'],
    ], [1.6, 3.4]] },
    { illus: 'Capture d\'écran : le tableau « Ventes de novembre 2026 » terminé, en-têtes colorés, bordures, montants avec séparateur de milliers et total en gras.' },
    { encadre: { titre: '💡  Les fonctions de base', style: 'bleu', contenu: [
      { puces: [
        '**=SOMME(E4:E9)** : additionne.',
        '**=MOYENNE(E4:E9)** : calcule la moyenne.',
        '**=MAX(E4:E9)** et **=MIN(E4:E9)** : trouvent la plus grande et la plus petite valeur.',
        'En français, les nombres à virgule s\'écrivent avec une **virgule** : 12,5 et non 12.5.',
      ] },
    ] } },
  ],

  pieges: {
    lignes: [
      ['💬 Écrire « 12 500 F » dans une cellule', 'Excel le prend pour du texte : il ne peut pas le calculer.', 'Écrire 12500, puis appliquer un format de nombre.'],
      ['✋ Calculer de tête et taper le résultat', 'Si une donnée change, le résultat reste faux.', 'Toujours une formule avec des adresses.'],
      ['❌ Oublier le signe =', 'Excel affiche « C4*D4 » comme un texte.', 'Toute formule commence par =.'],
      ['#️⃣ Voir « ##### » dans une cellule', 'Pas une erreur : la colonne est trop étroite pour afficher le nombre.', 'Élargir la colonne (double-clic sur le bord).'],
      ['🧮 Additionner la colonne en oubliant une ligne', 'Le total est faux.', 'Vérifier la plage proposée par Σ avant d\'appuyer sur Entrée.'],
    ],
    questions: [
      ['Est-ce qu\'Excel peut se tromper dans un calcul ?', 'Excel ne se trompe pas en calcul. Mais il calcule exactement ce qu\'on lui demande : si la formule ou la plage est fausse, le résultat l\'est aussi. Vérifiez toujours un ou deux résultats de tête.'],
      ['Excel et Word, c\'est pas la même chose ?', 'Non : Word sert à **écrire** des textes, Excel à **compter** et à organiser des données en tableau. On peut faire un petit tableau dans Word, mais seul Excel calcule.'],
    ],
  },

  exercices: {
    echauffe: [
      { h3: 'Exercice 1 : les adresses' },
      { tableau: [['Question', 'Réponse'], [
        ['Quelle est l\'adresse de la cellule colonne D, ligne 7 ?', ''],
        ['Que signifie la plage A2:A15 ?', ''],
        ['Que calcule =B2+B3+B4 ?', ''],
        ['Que calcule =SOMME(B2:B4) ?', ''],
      ], [3, 2], C.bleu] },
    ],
    entraine: [
      { h3: 'Exercice 2 : le budget du mois' },
      'Créez un tableau des dépenses d\'un mois pour une famille : loyer 75 000, électricité 18 000, eau 7 500, transport 30 000, nourriture 120 000, crédit téléphone 10 000, scolarité 25 000. Calculez le **total**, la **moyenne** et la dépense la plus élevée avec **MAX**.',
    ],
    lance: [
      { h3: 'Exercice 3 : le reste à vivre' },
      'Ajoutez au tableau précédent une cellule **Revenus du mois** (par exemple 350 000), puis une cellule **Reste** qui calcule automatiquement Revenus moins Total des dépenses. Modifiez le loyer : le reste doit changer tout seul.',
    ],
  },

  cas: [
    { h2: 'Ai-je gagné de l\'argent ce mois-ci ?' },
    'Tantie Akissi achète ses pagnes chez un grossiste, puis les revend. Voici ses chiffres pour la première semaine de novembre.',
    { tableau: [['Article', 'Quantité vendue', 'Prix d\'achat unitaire', 'Prix de vente unitaire'], [
      ['Wax hollandais', '3', '14 000', '18 000'],
      ['Pagne baoulé', '1', '19 000', '25 000'],
      ['Wax ordinaire', '5', '4 800', '6 500'],
      ['Foulard', '4', '1 200', '2 000'],
    ], [1.5, 1.2, 1.4, 1.4], C.violet] },
    { etapes: [
      'Construisez ce tableau dans Excel (sans espaces dans les nombres).',
      'Ajoutez trois colonnes calculées : **Total achat** (quantité × prix d\'achat), **Total vente** (quantité × prix de vente), **Bénéfice** (total vente − total achat).',
      'Calculez les totaux de chaque colonne avec Σ.',
      'Quel article rapporte le plus de bénéfice ? Que conseilleriez-vous à Tantie Akissi ?',
    ] },
  ],

  retiens: [
    'Un fichier Excel = un **classeur** ; il contient des **feuilles** ; chaque case est une **cellule** avec une **adresse** (B3).',
    'Une **formule** commence toujours par **=**.',
    'Je calcule avec des **adresses** (=C4\\*D4), pas avec des nombres tapés : tout se met à jour seul.',
    'La **poignée de recopie** (le petit carré) recopie une formule sur toute une colonne.',
    '**Σ Somme automatique** = =SOMME(…). Je vérifie toujours la plage.',
    'Je tape les nombres **sans « F » ni espaces**, puis je choisis un format.',
  ],
  defi: [
    'Cette semaine, notez dans Excel **toutes** vos dépenses (ou les ventes de votre activité), jour après jour. Dimanche, faites le total. Vous découvrirez peut-être où part votre argent !',
  ],
  motDeLaFin: 'À la fin du mois, Tantie Akissi n\'a plus de rature dans son cahier. Elle a même découvert que les foulards, qu\'elle vendait « pour rendre service », lui rapportaient presque autant que le wax ordinaire. Elle en a commandé le double.',
  quiz: [
    'L\'adresse de la cellule colonne C, ligne 5 est… **a)** 5C · **b)** C5 · **c)** CC5.',
    'Une formule commence toujours par… **a)** + · **b)** = · **c)** #.',
    '« ##### » dans une cellule signifie… **a)** une erreur grave · **b)** que la colonne est trop étroite · **c)** un virus.',
    'Pour additionner les cellules de E4 à E9, j\'écris… **a)** =SOMME(E4:E9) · **b)** =SOMME(E4-E9) · **c)** SOMME E4 E9.',
  ],
  corriges: [
    ['Exercice 1', 'D7 · les cellules de A2 à A15 · la somme de B2, B3 et B4 · la même chose, plus rapidement.'],
    ['Exercice 2', 'Total : 285 500 · Moyenne : environ 40 786 · MAX : 120 000 (nourriture).'],
    ['Exercice 3', 'Reste = 350 000 − 285 500 = 64 500. Formule du type =B10-B8, selon l\'emplacement de vos cellules.'],
    ['Cas pratique', 'Bénéfices : wax hollandais 3 × 4 000 = 12 000 ; pagne baoulé 6 000 ; wax ordinaire 5 × 1 700 = 8 500 ; foulard 4 × 800 = 3 200. Total achat : 42 000 + 19 000 + 24 000 + 4 800 = 89 800. Total vente : 54 000 + 25 000 + 32 500 + 8 000 = 119 500. Bénéfice total : 29 700. Le wax hollandais rapporte le plus ; le foulard a une très bonne marge (67 % du prix d\'achat) pour un petit investissement.'],
    ['Mini-quiz', '1-b · 2-b · 3-b · 4-a'],
  ],
  glossaire: [
    ['Tableur', 'Un logiciel de calcul en forme de tableau. Excel en est un.'],
    ['Classeur', 'Un fichier Excel, qui contient une ou plusieurs feuilles.'],
    ['Cellule', 'Une case d\'un tableau Excel, repérée par une adresse comme B3.'],
    ['Formule', 'Un calcul écrit dans une cellule, qui commence par =.'],
    ['Plage', 'Un ensemble de cellules qui se suivent, noté par exemple E4:E9.'],
    ['Poignée de recopie', 'Le petit carré en bas à droite d\'une cellule, qui sert à recopier son contenu.'],
    ['Fonction', 'Une formule toute prête d\'Excel : SOMME, MOYENNE, MAX, MIN…'],
  ],
};
