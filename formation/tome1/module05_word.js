// Tome 1 · Module 5 : Écrire avec l'ordinateur (Word)
const { C } = require('../outils/livre');

module.exports = {
  num: 5,
  titre: 'Écrire avec l\'ordinateur (Word)',
  sousTitre: 'Le cahier qu\'on peut gommer à l\'infini',
  objectifs: [
    'créer, **enregistrer**, rouvrir et **imprimer** un document Word ;',
    'écrire proprement : paragraphes, majuscules, ponctuation, **correction automatique** ;',
    '**sélectionner** du texte et le mettre en forme : police, taille, gras, alignement, listes ;',
    'rédiger une **lettre formelle** et un **CV** simple ;',
    'transformer un document en **PDF**.',
  ],
  duree: 'Six heures, en trois séances', materiel: 'Un ordinateur avec Microsoft Word', prerequis: 'Modules 1 à 4',

  situation: [
    { h2: 'La demande de stage de Yao' },
    'Yao a trouvé une entreprise qui accepte des stagiaires. Le responsable lui a dit : « Envoie-moi une demande écrite. » Fier de lui, Yao tape sur son téléphone et montre le résultat à M. Kouassi :',
    { encadre: { style: 'bleu', contenu: ['*bjr mr. jsui yao etudiant en 2e année je vx faire 1 stage ds vot entreprise svp. merci d\'avance. yao 0700000000*'] } },
    { d: ['M. Kouassi', 'Yao, si le responsable reçoit ça, il pensera que tu lui écris depuis un gbaka. Une demande de stage, c\'est ta première impression. On va l\'écrire dans Word, comme un professionnel.'] },
  ],

  declic: [
    { h2: 'Word, le cahier magique' },
    'Avec un cahier et un stylo, une faute oblige à raturer ou à tout recopier. **Word** est un cahier où l\'on peut gommer, déplacer, agrandir, embellir à l\'infini, sans jamais salir la page. Et quand tout est parfait, on imprime autant de copies qu\'on veut.',
    { h3: 'Le ruban : les rayons de la boutique' },
    'En haut de Word, une large bande contient tous les outils : c\'est le **ruban**. Il est rangé en **onglets**, comme les rayons d\'une boutique.',
    { illus: 'Capture d\'écran de Word annotée : la barre de titre avec le nom du document, les onglets du ruban (Fichier, Accueil, Insertion, Mise en page, Révision), les boutons Gras, Italique, Souligné, la police et la taille, les alignements, la page blanche avec le curseur, et la barre d\'état en bas avec le nombre de mots et le zoom.' },
    { tableau: [['Onglet', 'Le rayon…', 'On y trouve'], [
      ['**Fichier**', 'Le bureau du gérant', 'Enregistrer, ouvrir, imprimer, exporter en PDF'],
      ['**Accueil**', 'Le comptoir, ce qu\'on demande le plus', 'Police, taille, gras, couleurs, alignements, listes'],
      ['**Insertion**', 'Le magasin des choses à ajouter', 'Images, tableaux, formes, numéros de page'],
      ['**Mise en page**', 'Le choix du papier', 'Marges, orientation (portrait ou paysage)'],
      ['**Révision**', 'Le correcteur', 'Orthographe et grammaire, nombre de mots'],
    ], [1, 1.6, 2.4]] },
    { h3: 'La règle d\'or : d\'abord montrer, ensuite demander' },
    'Chez le couturier, vous ne dites pas « raccourcis ! » dans le vide. Vous montrez d\'abord la manche, puis vous dites ce qu\'il faut faire. Word fonctionne pareil : on **sélectionne** d\'abord le texte (il se colore en gris), **puis** on clique sur l\'outil (gras, taille, couleur…).',
    { tableau: [['Pour sélectionner…', 'Je fais…'], [
      ['Un mot', 'Un **double-clic** sur le mot'],
      ['Un paragraphe', 'Un **triple-clic** dans le paragraphe'],
      ['Un morceau de texte', 'Je maintiens le clic au début et je **glisse** jusqu\'à la fin'],
      ['Tout le document', '**Ctrl + A**'],
    ], [1.6, 3]] },
    { h3: 'Enregistrer : ranger le plat dans le magasin' },
    'Souvenez-vous du module 1 : ce que vous écrivez est sur la **table** (la mémoire vive). Tant que vous n\'avez pas **enregistré**, une coupure de courant peut tout effacer. **Enregistrer sous** sert la première fois, pour choisir le dossier et le nom. Ensuite, **Ctrl + S** met à jour le fichier en un instant.',
  ],

  pasAPas: [
    { h2: 'Étape 1 : créer et enregistrer' },
    { etapes: [
      'Ouvrez Word (touche Windows, tapez **word**, Entrée), puis cliquez sur **Document vierge**.',
      'Avant même d\'écrire, enregistrez : **Fichier** → **Enregistrer sous** → **Parcourir**. Choisissez le dossier (par exemple **Documents > Formation**), tapez le nom **2026-11-03 Demande de stage**, puis **Enregistrer**.',
      'Pendant que vous travaillez, appuyez souvent sur **Ctrl + S**. Prenez l\'habitude : après chaque paragraphe.',
    ] },
    { h2: 'Étape 2 : écrire proprement' },
    { puces: [
      'N\'appuyez **pas** sur Entrée à la fin de chaque ligne : le texte va à la ligne tout seul, comme l\'eau qui suit la pente. On appuie sur **Entrée** seulement pour commencer un **nouveau paragraphe**.',
      'Un **seul espace** entre deux mots. Pour centrer ou décaler, on utilise les boutons d\'alignement, jamais une rafale d\'espaces.',
      'En français, on met un espace **avant** : ; ! ? et à l\'intérieur des guillemets « ». Word s\'en charge souvent tout seul.',
      'Un mot souligné en **rouge** : faute d\'orthographe probable. En **bleu** : grammaire ou ponctuation. **Clic droit** sur le mot pour voir les corrections proposées.',
    ] },
    { h2: 'Étape 3 : mettre en forme' },
    { tableau: [['Je veux…', 'Je sélectionne, puis dans l\'onglet Accueil…', 'Raccourci'], [
      ['Mettre en **gras**', 'Bouton **G**', 'Ctrl + G'],
      ['Mettre en *italique*', 'Bouton **I**', 'Ctrl + I'],
      ['Souligner', 'Bouton **S**', 'Ctrl + U'],
      ['Changer la police ou la taille', 'Les deux listes déroulantes en haut à gauche (par exemple **Calibri**, **12**)', ''],
      ['Centrer un titre', 'Le bouton **Centrer** (les lignes centrées)', ''],
      ['Justifier un paragraphe (bords droits des deux côtés)', 'Le bouton **Justifier**', ''],
      ['Faire une liste', 'Le bouton **Puces** ou **Numérotation**', ''],
      ['Annuler une erreur', '', 'Ctrl + Z'],
    ], [1.8, 2.6, 0.9]] },
    { h2: 'Étape 4 : la lettre formelle' },
    'Une lettre administrative suit toujours le même plan. Le voici, prêt à recopier :',
    { illus: 'Modèle de lettre formelle annoté : expéditeur en haut à gauche, destinataire à droite, lieu et date, objet en gras, formule d\'appel, trois paragraphes, formule de politesse, signature.' },
    { encadre: { titre: '✉️  Le plan de la lettre', style: 'violet', contenu: [
      { etapes: [
        '**Vos coordonnées**, en haut à gauche : nom, adresse, téléphone, e-mail.',
        '**Le destinataire**, à droite : « Monsieur le Directeur des ressources humaines », nom de l\'entreprise, adresse.',
        '**Lieu et date**, à droite : « Abidjan, le 3 novembre 2026 ».',
        '**L\'objet**, en gras : « Objet : demande de stage ».',
        '**La formule d\'appel** : « Madame, Monsieur, » ou « Monsieur le Directeur, ».',
        '**Le corps**, en trois paragraphes : qui je suis ; ce que je demande et pourquoi chez vous ; ce que j\'apporte et ma disponibilité.',
        '**La formule de politesse** : « Dans l\'attente de votre réponse, je vous prie d\'agréer, Monsieur le Directeur, l\'expression de mes salutations distinguées. »',
        '**La signature** : votre nom, et votre signature à la main si la lettre est imprimée.',
      ] },
    ] } },
    { h2: 'Étape 5 : le CV en quelques minutes' },
    { etapes: [
      '**Fichier** → **Nouveau**. Dans la zone de recherche des modèles, tapez **CV**, puis **Entrée**.',
      'Choisissez un modèle **sobre** (évitez les décorations trop chargées), puis **Créer**.',
      'Cliquez sur chaque texte d\'exemple et remplacez-le par vos informations. Supprimez les rubriques inutiles.',
      'Enregistrez dans votre dossier, avec un nom clair : **CV Yao Kouamé**.',
    ] },
    { h2: 'Étape 6 : PDF et impression' },
    { puces: [
      '**En PDF** (pour envoyer par e-mail) : **Fichier** → **Enregistrer sous** (ou **Enregistrer une copie**) → dans **Type**, choisissez **PDF** → **Enregistrer**. Le PDF ne bouge plus : il s\'affichera pareil chez tout le monde.',
      '**Imprimer** : **Ctrl + P**. Vérifiez l\'**aperçu** à droite, choisissez l\'imprimante et le nombre de copies, puis **Imprimer**.',
    ] },
  ],

  pieges: {
    lignes: [
      ['↵ Appuyer sur Entrée à chaque ligne', 'Dès qu\'on corrige un mot, toute la mise en page se décale.', 'Entrée seulement en fin de paragraphe.'],
      ['␣ Centrer avec des espaces', 'Le texte n\'est jamais vraiment centré, et tout bouge à l\'impression.', 'Le bouton Centrer.'],
      ['🎨 Mettre six polices et dix couleurs', 'Le document fait désordre, peu sérieux.', 'Une ou deux polices, une couleur d\'accent au maximum.'],
      ['🔠 TOUT ÉCRIRE EN MAJUSCULES', 'C\'est difficile à lire et, à l\'écrit, cela donne l\'impression de crier.', 'Majuscules seulement en début de phrase et pour les noms propres.'],
      ['💾 Travailler une heure sans enregistrer', 'Un délestage, et tout est perdu.', 'Enregistrer sous dès le début, puis Ctrl + S très souvent.'],
    ],
    questions: [
      ['J\'ai fermé Word sans enregistrer. Tout est perdu ?', 'Pas forcément. Rouvrez Word, puis **Fichier** → **Informations** → **Gérer le document** → **Récupérer les documents non enregistrés**. Word garde parfois une copie de secours. Mais ne comptez pas dessus : enregistrez !'],
      ['Je n\'ai pas Word. Comment faire ?', 'Ce livre utilise Word, mais les mêmes gestes marchent dans **Word en ligne**, gratuit avec un compte Microsoft, ou dans **LibreOffice Writer**, gratuit lui aussi.'],
    ],
  },

  exercices: {
    echauffe: [
      { h3: 'Exercice 1 : mise en forme guidée' },
      'Tapez le texte suivant, puis appliquez les consignes.',
      { encadre: { style: 'bleu', contenu: [
        'Le marché d\'Adjamé',
        'Le marché d\'Adjamé est l\'un des plus grands marchés d\'Abidjan. On y trouve des pagnes, des épices, des téléphones et des pièces détachées. Chaque jour, des milliers de commerçants et de clients s\'y croisent dès l\'aube.',
      ] } },
      { cases: [
        'Le titre : centré, en gras, taille 16.',
        'Le paragraphe : justifié, taille 12.',
        'Le mot « pagnes » : en italique.',
        'J\'enregistre sous le nom « 2026-11 Exercice Word 1 » dans mon dossier Formation.',
      ] },
    ],
    entraine: [
      { h3: 'Exercice 2 : la lettre de Tantie Akissi' },
      'Tantie Akissi demande à sa caisse d\'épargne un rendez-vous pour parler de son crédit. Rédigez sa lettre en suivant le plan de la lettre formelle. Inventez les adresses. Enregistrez-la en Word **et** en PDF.',
    ],
    lance: [
      { h3: 'Exercice 3 : mon CV' },
      'Créez **votre** CV à partir d\'un modèle. Faites-le relire par votre binôme, corrigez, puis enregistrez-le en PDF. Vous en aurez besoin pour le projet final.',
    ],
  },

  cas: [
    { h2: 'Transformer le message de Yao' },
    'Reprenez le message de Yao de la situation de départ. Transformez-le en une vraie **lettre de demande de stage** d\'une page, dans Word.',
    { etapes: [
      'Listez toutes les erreurs du message d\'origine (abréviations, majuscules, ponctuation, informations manquantes).',
      'Rédigez la lettre en suivant le plan. Yao est étudiant en deuxième année de licence de gestion ; il cherche un stage de deux mois à partir de juillet.',
      'Mettez en forme : objet en gras, paragraphes justifiés, une seule police.',
      'Enregistrez-la en PDF sous un nom professionnel.',
    ] },
  ],

  retiens: [
    'Le **ruban** est rangé en onglets : **Fichier** pour enregistrer et imprimer, **Accueil** pour la mise en forme.',
    'D\'abord je **sélectionne**, ensuite je **mets en forme**.',
    '**Entrée** seulement pour un nouveau paragraphe. Jamais d\'espaces pour centrer.',
    '**Enregistrer sous** au début, puis **Ctrl + S** souvent.',
    'Rouge = orthographe, bleu = grammaire : **clic droit** pour corriger.',
    'Pour envoyer un document : **Enregistrer sous → PDF**.',
  ],
  defi: [
    'Cette semaine, écrivez dans Word une vraie lettre dont vous avez besoin : une demande, une réclamation, une invitation, un remerciement. Imprimez-la ou envoyez-la en PDF.',
  ],
  motDeLaFin: 'Trois jours après avoir déposé sa lettre, Yao reçoit un appel : « Votre demande est très claire. Pouvez-vous passer jeudi pour un entretien ? » Il raccroche, et la première personne qu\'il appelle, c\'est M. Kouassi.',
  quiz: [
    'Pour mettre un mot en gras, je dois d\'abord… **a)** le sélectionner · **b)** l\'enregistrer · **c)** l\'imprimer.',
    'Pour aller à la ligne à la fin d\'une ligne de texte, je… **a)** appuie sur Entrée · **b)** laisse Word passer à la ligne tout seul · **c)** tape des espaces.',
    'Un mot souligné en rouge signale… **a)** une faute d\'orthographe probable · **b)** un mot important · **c)** un lien internet.',
    'Pour envoyer un document qui s\'affiche pareil partout, je l\'enregistre en… **a)** .docx · **b)** .pdf · **c)** .mp3.',
  ],
  corriges: [
    ['Exercice 1', 'Titre : sélection par triple-clic, bouton Centrer, Ctrl + G, taille 16. Paragraphe : triple-clic, bouton Justifier, taille 12. « pagnes » : double-clic, Ctrl + I. Puis Fichier → Enregistrer sous.'],
    ['Cas pratique', '**Erreurs** : abréviations (bjr, mr, jsui, vx, ds, vot, svp), absence de majuscules et de ponctuation, pas d\'objet, pas de formule de politesse, pas de dates ni de durée du stage, pas de formation précise, numéro collé au nom.\n**Exemple de corps** : « Étudiant en deuxième année de licence de gestion, je souhaite effectuer un stage de deux mois au sein de votre entreprise à partir de juillet 2026. Votre réputation dans la distribution m\'attire particulièrement, et ce stage me permettrait de mettre en pratique mes cours de comptabilité et de gestion commerciale. Sérieux et disponible, je serais heureux de vous rencontrer pour vous exposer ma motivation. »'],
    ['Mini-quiz', '1-a · 2-b · 3-a · 4-b'],
  ],
  glossaire: [
    ['Traitement de texte', 'Un logiciel qui sert à écrire et mettre en forme des documents. Word en est un.'],
    ['Ruban', 'La bande d\'outils en haut de Word et Excel, rangée en onglets.'],
    ['Onglet', 'Une rubrique du ruban : Fichier, Accueil, Insertion…'],
    ['Sélectionner', 'Désigner un élément (texte, fichier, cellule) avant d\'agir dessus. Il se colore.'],
    ['Police', 'Le style des lettres : Calibri, Times New Roman, Arial…'],
    ['Justifier', 'Aligner un paragraphe sur les deux bords de la page.'],
    ['Modèle', 'Un document déjà mis en forme qu\'on remplit avec ses propres informations.'],
  ],
};
