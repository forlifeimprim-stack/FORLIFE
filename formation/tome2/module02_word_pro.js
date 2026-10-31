// Tome 2 · Module 2 : Word professionnel
const { C } = require('../outils/livre');

module.exports = {
  num: 2,
  titre: 'Word professionnel',
  sousTitre: 'Faire travailler Word à votre place',
  objectifs: [
    'utiliser les **styles** pour mettre en forme un long document en un instant ;',
    'générer une **table des matières** automatique et naviguer dans le document ;',
    'maîtriser **sauts de page**, **numéros de page**, **en-têtes**, **page de garde** et **légendes** ;',
    'relire à plusieurs avec le **suivi des modifications** et les **commentaires** ;',
    'envoyer des documents personnalisés en série avec le **publipostage**.',
  ],
  duree: 'Six heures', materiel: 'Un ordinateur avec Microsoft Word, Excel', prerequis: 'Tome 1, module 5',

  situation: [
    { h2: 'Les quarante pages de Yao' },
    'Yao termine son rapport de stage. Quarante pages. Chaque titre, il l\'a mis en gras, taille 14, souligné, à la main. Pour changer de page, il appuie sur Entrée jusqu\'à ce que le curseur passe à la suivante. Il a écrit la table des matières à la main, avec les numéros de page.',
    'Son tuteur lui demande d\'ajouter une partie au milieu du rapport. Tout se décale : les titres tombent en bas des pages, les numéros de la table des matières sont tous faux, et il faut tout refaire. La soutenance est dans trois jours.',
    { d: ['Yao', 'Monsieur, j\'ai passé la nuit à recompter les pages !'] },
    { d: ['M. Kouassi', 'Yao, Word sait compter à ta place. Il faut seulement lui dire ce qui est un titre et ce qui est du texte. On appelle ça les styles.'] },
  ],

  declic: [
    { h2: 'Les styles, ce sont les uniformes de l\'école' },
    'Dans une école, chaque catégorie porte son uniforme : les élèves en kaki, les surveillants en bleu, les enseignants en tenue de ville. Le jour où le directeur décide que les élèves porteront du bleu ciel, il ne repasse pas voir chaque élève : il change la règle, et tout le monde suit.',
    'Dans Word, un **style** est un uniforme. On dit à Word : « ce paragraphe est un **Titre 1** », « celui-ci est un **Titre 2** », « le reste est du texte **Normal** ». Si on décide ensuite que tous les Titres 1 seront orange et en taille 18, on modifie le style **une seule fois**, et les quarante pages changent d\'un coup.',
    { tableau: [['Sans styles', 'Avec les styles'], [
      ['Chaque titre est mis en forme à la main', 'Un clic sur **Titre 1** ou **Titre 2**'],
      ['Changer l\'aspect des titres : refaire tout le document', 'Modifier le style une fois : tout suit'],
      ['Table des matières écrite et recomptée à la main', 'Table des matières **automatique**, mise à jour en un clic'],
      ['On fait défiler quarante pages pour trouver une partie', 'Le **volet de navigation** affiche le plan cliquable'],
    ], [2.5, 2.5]] },
    { h3: 'Les autres automatismes' },
    { puces: [
      'Le **saut de page** (**Ctrl + Entrée**) est un « mur » : ce qui suit commence toujours en haut d\'une nouvelle page, même si on ajoute du texte avant. Fini les Entrée répétés.',
      'Les **numéros de page** et l\'**en-tête** se placent une fois, et Word les répète sur toutes les pages.',
      'Le **publipostage**, c\'est la machine à faire-part : **une** lettre modèle et **une** liste de destinataires dans Excel, et Word produit autant de lettres personnalisées que de noms.',
    ] },
  ],

  pasAPas: [
    { h2: 'Étape 1 : appliquer les styles' },
    { etapes: [
      'Cliquez dans un titre principal (sans rien sélectionner), puis dans **Accueil** → groupe **Styles**, cliquez sur **Titre 1**.',
      'Pour les sous-parties, utilisez **Titre 2**, puis **Titre 3** si besoin. Le texte courant reste en **Normal**.',
      'Ouvrez **Affichage** → cochez **Volet de navigation** : le plan de votre document apparaît à gauche. Cliquez sur un titre pour y aller, glissez-le pour déplacer toute la partie.',
      'Pour modifier un style : clic droit sur **Titre 1** dans la galerie → **Modifier** → choisissez police, taille, couleur, espacement → **OK**. Tous les Titres 1 changent.',
    ] },
    { illus: 'Capture d\'écran de Word : la galerie des styles (Normal, Titre 1, Titre 2) dans l\'onglet Accueil, et le volet de navigation à gauche montrant le plan du rapport de stage.' },
    { h2: 'Étape 2 : la table des matières automatique' },
    { etapes: [
      'Placez le curseur là où la table doit apparaître (après la page de garde), puis insérez un **saut de page** après elle (**Ctrl + Entrée**).',
      '**Références** → **Table des matières** → choisissez une **Table automatique**.',
      'Après chaque modification du document : clic dans la table → **Mettre à jour la table** → **Mettre à jour toute la table** → **OK**.',
    ] },
    { h2: 'Étape 3 : la mise en page d\'un long document' },
    { tableau: [['Je veux…', 'Chemin'], [
      ['Une **page de garde**', '**Insertion** → **Page de garde** → choisir un modèle, puis remplacer les textes.'],
      ['Des **numéros de page**', '**Insertion** → **Numéro de page** → **Bas de page** → choisir la position.'],
      ['Un **en-tête** (titre du rapport, nom)', '**Insertion** → **En-tête** → choisir un modèle. Double-cliquez dans le corps de la page pour en sortir.'],
      ['Pas de numéro sur la page de garde', 'Double-clic dans l\'en-tête → cochez **Première page différente**.'],
      ['Un **tableau**', '**Insertion** → **Tableau** → choisir le nombre de colonnes et de lignes. L\'onglet **Création de tableau** propose des styles.'],
      ['Une **légende** sous une image ou un tableau (« Figure 1 : … »)', 'Clic droit sur l\'image → **Insérer une légende**. La numérotation se fait toute seule.'],
      ['Une image qui ne bouge plus dans tous les sens', 'Clic sur l\'image → icône **Options de disposition** → **Aligné sur le texte**.'],
    ], [1.8, 3.2]] },
    { h2: 'Étape 4 : relire à plusieurs' },
    { etapes: [
      'Avant d\'envoyer le rapport au tuteur : **Révision** → **Suivi des modifications** (le bouton devient actif).',
      'Chaque ajout, suppression ou correction apparaît en couleur, avec le nom de son auteur.',
      'Pour une remarque sans modifier le texte : sélectionnez le passage → **Révision** → **Nouveau commentaire**.',
      'Au retour, examinez chaque modification : **Accepter** ou **Refuser**, une par une ou toutes à la fois.',
    ] },
    { h2: 'Étape 5 : le publipostage' },
    'Exemple : Tantie Akissi invite ses cinquante meilleures clientes à sa journée promotionnelle, avec une lettre à leur nom.',
    { etapes: [
      'Dans **Excel**, préparez la liste : une ligne par cliente, avec les colonnes **Civilité**, **Prénom**, **Nom**, **Quartier**. Enregistrez et fermez le fichier.',
      'Dans **Word**, rédigez la lettre modèle, en laissant un blanc là où iront les noms.',
      '**Publipostage** → **Démarrer la fusion et le publipostage** → **Lettres**.',
      '**Sélection des destinataires** → **Utiliser une liste existante** → choisissez le fichier Excel et la feuille.',
      'Placez le curseur après « Chère » → **Insérer un champ de fusion** → **Prénom**. Faites de même pour les autres champs.',
      '**Aperçu des résultats** pour vérifier avec les vrais noms.',
      '**Terminer et fusionner** → **Modifier des documents individuels** → **Tous** : Word crée un document avec les cinquante lettres, prêtes à imprimer ou à enregistrer en PDF.',
    ] },
  ],

  pieges: {
    lignes: [
      ['🖌️ Mettre les titres en forme à la main', 'Pas de table des matières automatique ni de volet de navigation.', 'Toujours les styles Titre 1, 2, 3.'],
      ['↵ Changer de page avec des Entrée', 'Tout se décale à la moindre modification.', 'Ctrl + Entrée (saut de page).'],
      ['🔢 Écrire les numéros de page soi-même', 'Ils deviennent faux dès qu\'on ajoute une ligne.', 'Insertion → Numéro de page.'],
      ['📝 Oublier de mettre à jour la table des matières', 'Les numéros de page sont faux le jour de l\'impression.', 'Mettre à jour la table juste avant d\'imprimer ou d\'exporter en PDF.'],
      ['📊 Laisser des espaces avant ou après les noms dans la liste Excel', 'Les lettres affichent des espaces bizarres.', 'Nettoyer la liste avant la fusion.'],
    ],
    questions: [
      ['Les styles de Word ne me plaisent pas. Je suis obligé de les garder ?', 'Non. Modifiez-les (clic droit → Modifier) ou choisissez un autre jeu de styles dans l\'onglet **Création**. L\'important est d\'utiliser des styles, pas leur apparence par défaut.'],
      ['Mon document est déjà écrit sans styles. Tout est à refaire ?', 'Non : cliquez dans chaque titre et appliquez le bon style. Pour quarante pages, comptez une vingtaine de minutes, et vous gagnerez des heures ensuite.'],
    ],
  },

  exercices: {
    echauffe: [
      { h3: 'Exercice 1 : le bon outil' },
      { tableau: [['Je veux…', 'L\'outil Word'], [
        ['Que tous mes titres changent de couleur d\'un coup', ''], ['Commencer le chapitre 2 en haut d\'une page', ''],
        ['Numéroter automatiquement mes figures', ''], ['Voir les corrections de mon tuteur', ''], ['Envoyer 80 invitations personnalisées', ''],
      ], [3, 2], C.bleu] },
    ],
    entraine: [
      { h3: 'Exercice 2 : le squelette d\'un rapport' },
      'Créez un document avec : une page de garde ; une table des matières automatique ; une introduction ; deux parties (Titre 1) contenant chacune deux sous-parties (Titre 2) ; une conclusion. Numéros de page en bas, sauf sur la page de garde. Modifiez ensuite le style Titre 1, et mettez à jour la table.',
    ],
    lance: [
      { h3: 'Exercice 3 : le publipostage' },
      'Créez une liste Excel de dix personnes, puis une lettre d\'invitation à un événement de votre choix, personnalisée avec la civilité, le prénom et le nom. Produisez les dix lettres et enregistrez-les en un seul PDF.',
    ],
  },

  cas: [
    { h2: 'Sauver la soutenance de Yao' },
    'Il reste trois jours à Yao. Son rapport compte quarante pages mises en forme à la main, une table des matières écrite à la main, et son tuteur a envoyé ses corrections en commentaires.',
    { etapes: [
      'Dans quel ordre Yao doit-il travailler pour être prêt à temps ? Proposez un plan en six étapes.',
      'Comment doit-il traiter les corrections de son tuteur ?',
      'Quelles vérifications faire juste avant d\'exporter le PDF final ?',
    ] },
  ],

  retiens: [
    'Les **styles** sont des uniformes : **Titre 1**, **Titre 2**, **Normal**. Je modifie le style, tout le document suit.',
    '**Affichage → Volet de navigation** : le plan cliquable.',
    '**Références → Table des matières** ; je la **mets à jour** avant d\'imprimer.',
    '**Ctrl + Entrée** : saut de page. **Insertion** : page de garde, numéros, en-tête.',
    '**Révision** : suivi des modifications et commentaires pour relire à plusieurs.',
    '**Publipostage** : une lettre modèle + une liste Excel = des lettres personnalisées en série.',
  ],
  defi: [
    'Cette semaine, reprenez un long document existant (rapport, mémoire, règlement intérieur de votre association) et appliquez-lui des styles et une table des matières automatique.',
  ],
  motDeLaFin: 'Le jour de la soutenance, un membre du jury a feuilleté le rapport de Yao et a dit : « Enfin un rapport où la table des matières est juste ! » Yao a obtenu la meilleure note de sa promotion. Il n\'a pas dit au jury qu\'il avait dormi huit heures la veille.',
  quiz: [
    'Pour que la table des matières soit automatique, les titres doivent… **a)** être en gras · **b)** utiliser les styles Titre 1, Titre 2… · **c)** être soulignés.',
    'Pour commencer une partie en haut d\'une nouvelle page, j\'utilise… **a)** plusieurs Entrée · **b)** Ctrl + Entrée · **c)** la barre d\'espace.',
    'Le publipostage associe… **a)** une lettre modèle et une liste de destinataires · **b)** deux documents Word · **c)** un PDF et une image.',
    'Pour voir qui a modifié quoi dans un document, j\'active… **a)** le suivi des modifications · **b)** le zoom · **c)** la page de garde.',
  ],
  corriges: [
    ['Exercice 1', 'Modifier le style Titre 1 · Saut de page (Ctrl + Entrée) · Insérer une légende · Révision → Suivi des modifications et commentaires · Publipostage.'],
    ['Cas pratique', '**1.** Appliquer les styles à tous les titres ; supprimer les Entrée de remplissage et mettre des sauts de page ; supprimer la table manuelle et insérer une table automatique ; insérer les numéros de page et la page de garde ; traiter les commentaires du tuteur ; relecture finale. **2.** Lire chaque commentaire, corriger, puis supprimer le commentaire ou y répondre ; s\'il a utilisé le suivi des modifications, accepter ou refuser chaque proposition. **3.** Mettre à jour la table des matières, vérifier les légendes, l\'orthographe (Révision → Grammaire et orthographe), qu\'aucune modification ni aucun commentaire ne reste visible, puis exporter en PDF et l\'ouvrir pour contrôler.'],
    ['Mini-quiz', '1-b · 2-b · 3-a · 4-a'],
  ],
  glossaire: [
    ['Style', 'Un ensemble de mises en forme portant un nom (Titre 1, Normal…), appliqué en un clic.'],
    ['Table des matières automatique', 'Une table construite par Word à partir des titres utilisant les styles.'],
    ['Volet de navigation', 'Le panneau qui affiche le plan cliquable d\'un document Word.'],
    ['Saut de page', 'Une commande qui fait commencer la suite du texte en haut d\'une nouvelle page.'],
    ['En-tête et pied de page', 'Les zones en haut et en bas de chaque page, répétées automatiquement.'],
    ['Suivi des modifications', 'Le mode de Word qui montre chaque changement et son auteur.'],
    ['Publipostage', 'La création de documents personnalisés en série à partir d\'une liste de destinataires.'],
    ['Champ de fusion', 'Un emplacement dans la lettre modèle, remplacé par une donnée de la liste (Prénom, Nom…).'],
  ],
};
