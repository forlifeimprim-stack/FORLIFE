// Tome 3 · Module 2 : Penser comme un programmeur, sans coder
const { C } = require('../outils/livre');

module.exports = {
  num: 2,
  titre: 'Penser comme un programmeur, sans coder',
  sousTitre: 'La recette de l\'attiéké-poisson, écrite pour quelqu\'un qui n\'a jamais cuisiné',
  objectifs: [
    '**découper** une idée en étapes précises ;',
    'reconnaître les briques de toute logique : **séquence**, **condition**, **répétition**, **données** ;',
    'décrire les besoins avec des **récits utilisateurs** ;',
    'rédiger un **cahier des charges** d\'une page : utilisateurs, écrans, actions, données, règles ;',
    'définir une **première version** réaliste.',
  ],
  duree: 'Quatre heures', materiel: 'Papier, crayon, et votre journal de bord', prerequis: 'Module 1',

  situation: [
    { h2: 'L\'application « qui fait tout »' },
    'Tantie Akissi a appris que Yao « fabrique des applications ». Elle l\'appelle : « Mon fils, fais-moi une application pour ma tontine. Qu\'elle fasse tout ! » Yao, enthousiaste, écrit à l\'IA : « Crée une application de tontine complète. »',
    'L\'IA produit quelque chose de joli… et de faux : les membres versent de l\'argent par carte bancaire, il y a des « taux d\'intérêt », un « classement des meilleures épargnantes », et rien sur l\'ordre de passage ni sur les retards. Rien de ce que Tantie Akissi fait vraiment.',
    { d: ['Yao', 'L\'IA n\'a rien compris !'] },
    { d: ['M. Kouassi', 'Elle a très bien compris ce que tu lui as dit, Yao. C\'est-à-dire presque rien. Avant de parler au maçon, le maître d\'ouvrage dessine le plan. Et pour dessiner le plan, il faut d\'abord écouter le client.'] },
  ],

  declic: [
    { h2: 'Un programme, c\'est une recette' },
    'Écrivez la recette de l\'attiéké-poisson pour quelqu\'un qui n\'a **jamais** cuisiné. Vous ne pouvez pas écrire « prépare le poisson ». Il faut dire : nettoyer, écailler, entailler, assaisonner, faire frire combien de temps, à quel feu. Un ordinateur est ce cuisinier débutant : il fait **exactement** ce qu\'on lui dit, rien de plus. L\'IA vous aide beaucoup, mais plus votre recette est précise, meilleur est le plat.',
    { h3: 'Les quatre briques de toute logique' },
    { tableau: [['Brique', 'Dans la recette', 'Dans une application'], [
      ['**La séquence** (dans l\'ordre)', 'D\'abord nettoyer le poisson, ensuite l\'assaisonner, enfin le frire.', 'Le client choisit un article, puis indique la quantité, puis valide.'],
      ['**La condition** (si… alors… sinon)', 'Si l\'huile fume, baisser le feu.', 'Si la membre n\'a pas versé avant dimanche, la marquer « en retard ».'],
      ['**La répétition** (pour chaque…)', 'Pour chaque poisson, faire trois entailles.', 'Pour chaque membre, calculer le total versé.'],
      ['**Les données** (les ingrédients)', 'Poisson, attiéké, oignons, tomates, piment.', 'Nom, téléphone, montant, date du versement.'],
    ], [1.5, 1.8, 2]] },
    { h2: 'Le récit utilisateur : « En tant que… je veux… afin de… »' },
    'Les professionnels décrivent chaque besoin par une phrase simple, toujours construite pareil. Elle oblige à penser à **qui**, **quoi** et **pourquoi**.',
    { encadre: { style: 'violet', contenu: [
      '**En tant que** trésorière, **je veux** voir en un coup d\'œil qui est en retard **afin de** relancer les membres avant la réunion.',
      '**En tant que** membre, **je veux** voir l\'historique de mes versements **afin d\'**éviter les disputes.',
      '**En tant que** membre, **je veux** connaître la date à laquelle je prendrai la tontine **afin d\'**organiser mes dépenses.',
    ] } },
    { h2: 'La première version : le pagne avant la robe' },
    'On ne coud pas une robe de mariée en une fois : on fait d\'abord un patron, on essaie, on ajuste. Une application aussi se construit par étapes. La **première version** (les professionnels disent **MVP**, produit minimum viable) contient le **strict nécessaire** pour être utile. Le reste viendra ensuite, quand les vrais utilisateurs auront donné leur avis.',
  ],

  pasAPas: [
    { h2: 'Étape 1 : écouter le client' },
    'Avant tout prompt, posez ces questions et notez les réponses, avec les mots du client.',
    { tableau: [['Question', 'Réponse de Tantie Akissi'], [
      ['Quel problème voulez-vous régler ?', '« Les disputes sur qui a payé, et le cahier illisible. »'],
      ['Qui va utiliser l\'application ?', '« Moi la trésorière, et les trente membres. »'],
      ['Comment faites-vous aujourd\'hui ?', '« Un cahier, puis Excel depuis un an. Les membres paient en espèces ou par Mobile Money. »'],
      ['Qu\'est-ce qui serait un succès ?', '« Plus aucune dispute à la réunion. »'],
      ['Sur quel appareil ?', '« Nos téléphones. Certaines ont des petits téléphones avec peu de données. »'],
      ['Quelles règles faut-il respecter ?', '« 10 000 F par semaine, versement avant dimanche, une membre prend la tontine chaque semaine selon l\'ordre tiré au sort. »'],
    ], [2, 3], C.bleu] },
    { h2: 'Étape 2 : le cahier des charges d\'une page' },
    { tableau: [['Rubrique', 'Exemple : l\'application de la tontine'], [
      ['**Objectif**', 'Suivre les versements de la tontine et l\'ordre de passage, sans dispute.'],
      ['**Utilisateurs**', 'La trésorière (administratrice) ; les membres (consultation de leur propre situation).'],
      ['**Écrans**', '1. Connexion · 2. Tableau de bord de la trésorière · 3. Saisie d\'un versement · 4. Liste des membres · 5. Ma situation (membre) · 6. Calendrier des passages.'],
      ['**Actions**', 'La trésorière ajoute un versement, ajoute ou désactive une membre, marque la semaine comme versée à la bénéficiaire. La membre consulte, sans rien modifier.'],
      ['**Données**', 'Membre (nom, téléphone, rang de passage) ; Versement (membre, date, montant, moyen) ; Semaine (numéro, bénéficiaire, date).'],
      ['**Règles**', 'Cotisation 10 000 F ; « en retard » si pas de versement pour la semaine au dimanche 23 h 59 ; une membre ne voit que ses propres versements.'],
      ['**Contraintes**', 'Utilisable sur petit téléphone, légère, en français simple, sans paiement en ligne dans la première version.'],
      ['**Hors première version**', 'Paiement Mobile Money intégré, rappels automatiques par SMS, plusieurs tontines.'],
    ], [1.3, 3.7]] },
    { h2: 'Étape 3 : dessiner les écrans sur papier' },
    { etapes: [
      'Pour chaque écran, dessinez un rectangle de la taille d\'un téléphone.',
      'Placez les éléments : titres, boutons, listes, champs. Pas besoin d\'être beau : des boîtes et des flèches suffisent.',
      'Reliez les écrans par des flèches : « je clique ici, j\'arrive là ».',
      'Montrez les dessins au client. C\'est beaucoup moins cher de corriger un dessin que du code.',
    ] },
    { illus: 'Croquis à la main de trois écrans de téléphone reliés par des flèches : « Connexion » → « Tableau de bord » (total collecté, liste des retards en rouge, bouton « + Versement ») → « Saisie d\'un versement » (membre, montant, date, bouton Enregistrer).' },
    { h2: 'Étape 4 : vérifier avec les cas particuliers' },
    'C\'est là que se cachent les vraies difficultés. Posez-vous la question « et si… ? » :',
    { puces: [
      'Et si une membre paie deux semaines d\'un coup ?',
      'Et si une membre quitte la tontine en cours d\'année ?',
      'Et si la trésorière se trompe de montant ?',
      'Et si deux membres ont le même nom ?',
      'Et si la trésorière perd son téléphone ?',
    ] },
    'Notez la réponse du client pour chacun : ce sont des **règles** à ajouter au cahier des charges.',
  ],

  pieges: {
    lignes: [
      ['🌫️ « Fais-moi une application qui fait tout »', 'L\'IA invente des besoins qui ne sont pas les vôtres.', 'Un cahier des charges d\'une page, avec des récits utilisateurs.'],
      ['🏰 Vouloir tout dans la première version', 'Projet interminable, jamais livré.', 'Le strict nécessaire ; le reste plus tard.'],
      ['🙉 Ne pas écouter les vrais utilisateurs', 'Une belle application que personne n\'utilise.', 'Questions, dessins, essais avec eux.'],
      ['🤷 Oublier les cas particuliers', 'L\'application casse au premier imprévu.', 'La série des « et si… ? ».'],
      ['🔤 Utiliser son jargon avec le client', 'Le client ne comprend pas et n\'ose pas le dire.', 'Ses mots à lui, dans le cahier des charges.'],
    ],
    questions: [
      ['C\'est long, tout ce travail avant de commencer !', 'Une heure de cahier des charges économise souvent dix heures de corrections. Et ce document devient le cœur de votre premier prompt (module 4).'],
      ['Je peux demander à l\'IA de m\'aider à écrire le cahier des charges ?', 'Oui, c\'est même un très bon usage : donnez-lui vos notes d\'entretien et demandez-lui de les organiser selon les rubriques, puis de lister les cas particuliers oubliés. Mais les décisions restent celles du client.'],
    ],
  },

  exercices: {
    echauffe: [
      { h3: 'Exercice 1 : les briques' },
      'Pour chaque phrase, indiquez la brique : séquence, condition, répétition ou données.',
      { tableau: [['Phrase', 'Brique'], [
        ['Pour chaque commande du jour, imprimer un bon de livraison.', ''], ['Si le stock est inférieur à 5, afficher l\'article en rouge.', ''],
        ['Nom du client, adresse, téléphone, articles commandés.', ''], ['Le client remplit le formulaire, puis reçoit un SMS de confirmation.', ''],
      ], [3.6, 1.4], C.bleu] },
    ],
    entraine: [
      { h3: 'Exercice 2 : mes récits utilisateurs' },
      'Écrivez cinq récits utilisateurs pour l\'application de rendez-vous de Koffi : deux pour les clients, trois pour Koffi.',
      { lignes: ['1. En tant que ', '2. En tant que ', '3. En tant que ', '4. En tant que ', '5. En tant que '] },
    ],
    lance: [
      { h3: 'Exercice 3 : mon cahier des charges' },
      'Choisissez l\'une de vos trois idées du module 1. Interrogez une vraie personne concernée, puis rédigez le cahier des charges d\'une page et dessinez les écrans. Ce sera votre projet personnel pour la suite du livre.',
    ],
  },

  cas: [
    { h2: 'Le cahier des charges de Koffi' },
    'Koffi décrit son besoin : « Mes clients doivent pouvoir réserver un créneau pour la saisie de documents ou la mise en page de CV, du lundi au samedi, de 8 h à 18 h, par tranches de 30 minutes. Je veux voir mon planning sur mon téléphone, et que le client reçoive une confirmation. Parfois je ferme pour un deuil ou une fête. »',
    { etapes: [
      'Rédigez le cahier des charges d\'une page (objectif, utilisateurs, écrans, actions, données, règles, contraintes, hors première version).',
      'Listez au moins cinq cas particuliers et proposez une règle pour chacun.',
      'Qu\'est-ce qui doit être dans la première version, et qu\'est-ce qui peut attendre ?',
    ] },
  ],

  retiens: [
    'Un programme est une **recette** pour un cuisinier qui fait exactement ce qu\'on lui dit.',
    'Quatre briques : **séquence**, **condition**, **répétition**, **données**.',
    'Les besoins s\'écrivent en **récits utilisateurs** : En tant que… je veux… afin de…',
    'Le **cahier des charges** d\'une page : objectif, utilisateurs, écrans, actions, données, règles, contraintes, hors première version.',
    'Dessiner les écrans **sur papier** et les montrer au client.',
    'Une **première version** minimale, et la série des **« et si… ? »**.',
  ],
  defi: [
    'Cette semaine, interrogez une personne de votre entourage sur un problème de son activité, avec les six questions de l\'étape 1. Rédigez son cahier des charges et faites-le-lui valider.',
  ],
  motDeLaFin: 'Yao est retourné voir Tantie Akissi avec un cahier et un crayon. Il a posé ses six questions, dessiné six écrans, et noté onze « et si… ? ». Tantie Akissi a regardé les dessins et a dit : « Là, c\'est ma tontine. » Elle a ajouté en riant : « Mais pas de classement des meilleures épargnantes, hein, sinon les disputes vont recommencer ! »',
  quiz: [
    '« Si la membre n\'a pas payé avant dimanche, la marquer en retard » est une… **a)** répétition · **b)** condition · **c)** donnée.',
    'Un récit utilisateur se construit ainsi : **a)** En tant que… je veux… afin de… · **b)** Bonjour… merci… au revoir · **c)** Titre… sous-titre… conclusion.',
    'La première version d\'une application doit contenir… **a)** toutes les idées possibles · **b)** le strict nécessaire pour être utile · **c)** seulement le logo.',
    'Il vaut mieux corriger une erreur de conception… **a)** sur le dessin papier · **b)** après la mise en ligne · **c)** jamais.',
  ],
  corriges: [
    ['Exercice 1', 'Répétition · Condition · Données · Séquence.'],
    ['Exercice 2', 'Exemples : En tant que client, je veux voir les créneaux libres afin de choisir une heure qui m\'arrange · En tant que client, je veux recevoir une confirmation afin d\'être sûr de ma réservation · En tant que Koffi, je veux voir le planning du jour sur mon téléphone afin d\'organiser mon équipe · En tant que Koffi, je veux bloquer une journée afin de fermer pour un événement · En tant que Koffi, je veux annuler un rendez-vous afin de gérer les imprévus.'],
    ['Cas pratique', '**1.** Objectif : réservation en ligne des prestations. Utilisateurs : clients, Koffi (administrateur). Écrans : choix de la prestation, choix du créneau, coordonnées, confirmation ; pour Koffi : connexion, planning, jours fermés. Données : prestation (nom, durée, prix), réservation (client, téléphone, prestation, date, heure, statut), jour fermé. Règles : lundi-samedi, 8 h-18 h, tranches de 30 minutes, un créneau ne peut être réservé qu\'une fois. **2.** Client qui ne vient pas ; deux réservations simultanées sur le même créneau ; prestation plus longue que 30 minutes ; client qui veut annuler ; fermeture décidée après des réservations (prévenir les clients). **3.** Première version : réservation, planning, jours fermés, confirmation à l\'écran. Plus tard : paiement en ligne, rappels par SMS ou WhatsApp, statistiques.'],
    ['Mini-quiz', '1-b · 2-a · 3-b · 4-a'],
  ],
  glossaire: [
    ['Algorithme', 'Une suite d\'étapes précises pour résoudre un problème : une recette.'],
    ['Condition', 'Une règle du type « si… alors… sinon… ».'],
    ['Boucle (répétition)', 'Une action répétée pour chaque élément d\'une liste.'],
    ['Récit utilisateur', 'Une phrase qui décrit un besoin : En tant que…, je veux…, afin de…'],
    ['Cahier des charges', 'Le document qui décrit ce que l\'application doit faire, pour qui et selon quelles règles.'],
    ['MVP (produit minimum viable)', 'La première version, réduite à l\'essentiel, pour être utile et recueillir des avis.'],
    ['Maquette', 'Un dessin des écrans, sur papier ou à l\'ordinateur, avant la construction.'],
  ],
};
