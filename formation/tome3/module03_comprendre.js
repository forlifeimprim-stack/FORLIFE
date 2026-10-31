// Tome 3 · Module 3 : Comprendre ce que l'IA fabrique
const { C } = require('../outils/livre');

module.exports = {
  num: 3,
  titre: 'Comprendre ce que l\'IA fabrique',
  sousTitre: 'La vitrine, l\'arrière-boutique, le cahier de stock et le bailleur',
  objectifs: [
    'expliquer les grandes parties d\'une application web : **interface**, **serveur**, **base de données**, **API** ;',
    'comprendre ce que sont un **hébergement** et un **nom de domaine** ;',
    'reconnaître **HTML**, **CSS** et **JavaScript** sans les écrire ;',
    'se repérer dans les **fichiers** d\'un projet ;',
    'ouvrir les **outils de développement** du navigateur pour observer une page.',
  ],
  duree: 'Trois heures', materiel: 'Un ordinateur connecté, le navigateur Chrome ou Edge', prerequis: 'Modules 1 et 2',

  situation: [
    { h2: 'Les mots de l\'IA' },
    'Yao demande à l\'IA d\'ajouter des comptes à l\'application de la tontine. Elle répond : « Pour cela, je vais connecter un backend avec une base de données, créer une table des membres avec des politiques d\'accès au niveau des lignes, et ajouter l\'authentification. Je vais aussi stocker la clé d\'API dans les variables d\'environnement. Voulez-vous continuer ? »',
    { d: ['Yao', 'Je clique sur « Oui » ? Je ne comprends pas un mot sur deux.'] },
    { d: ['M. Kouassi', 'Un maître d\'ouvrage n\'a pas besoin de savoir couler le béton. Mais il doit savoir ce qu\'est une fondation, une dalle et un mur porteur. Sinon, il signe n\'importe quoi. On va faire le tour du chantier.'] },
  ],

  declic: [
    { h2: 'Une application web, c\'est une boutique' },
    { illus: 'Schéma d\'une boutique en coupe : la vitrine côté rue (interface), l\'arrière-boutique avec le gérant (serveur), le cahier de stock dans le tiroir (base de données), le coursier qui fait les liaisons avec la banque et le transporteur (API), l\'enseigne avec l\'adresse (nom de domaine), et le bailleur qui loue le local (hébergeur).' },
    { tableau: [['Dans la boutique…', 'Dans l\'application', 'Le mot technique'], [
      ['La **vitrine** et le comptoir : ce que voit le client', 'Les pages, les boutons, les formulaires', '**Interface** ou **front-end**'],
      ['L\'**arrière-boutique** et le gérant : il reçoit les demandes, vérifie, décide', 'Le programme qui traite les demandes et applique les règles', '**Serveur** ou **back-end**'],
      ['Le **cahier de stock** et le registre des clients', 'L\'endroit où toutes les informations sont rangées', '**Base de données**'],
      ['Le **coursier** qui va à la banque ou chez le transporteur, avec un bon de commande', 'La porte par laquelle deux programmes s\'échangent des demandes', '**API**'],
      ['Le **badge** à l\'entrée de l\'arrière-boutique', 'L\'inscription, la connexion, les droits de chacun', '**Authentification**'],
      ['Le **bailleur** qui loue le local', 'L\'entreprise dont les ordinateurs font tourner l\'application', '**Hébergeur**'],
      ['L\'**enseigne** et l\'adresse', 'L\'adresse de l\'application, par exemple pagnesakissi.ci', '**Nom de domaine**'],
    ], [1.8, 1.9, 1.3]] },
    { h3: 'La base de données : le cahier à colonnes' },
    'Une base de données ressemble à un classeur Excel bien tenu : des **tables** (comme des feuilles), avec des **colonnes** (nom, téléphone, montant) et une **ligne** par élément (une membre, un versement). Les tables sont **reliées** : chaque versement indique **à quelle membre** il appartient, comme on écrirait le numéro de la membre sur chaque reçu.',
    { tableau: [['Table « membres »', '', ''], [
      ['**id**', '**nom**', '**téléphone**'], ['1', 'Akissi Kouamé', '07…'], ['2', 'Bintou Traoré', '05…'],
    ], [1, 2, 2], C.vert] },
    { tableau: [['Table « versements »', '', '', ''], [
      ['**id**', '**membre_id**', '**montant**', '**date**'], ['1', '2', '10000', '03/11/2026'], ['2', '1', '10000', '04/11/2026'],
    ], [1, 1.4, 1.3, 1.3], C.vert] },
    'Le versement n° 1 porte **membre_id = 2** : il appartient à Bintou. C\'est ce qu\'on appelle une **relation**.',
    { h3: 'Les trois langues de la vitrine' },
    { tableau: [['Langage', 'Son rôle', 'Comme pour une maison…', 'Il ressemble à…'], [
      ['**HTML**', 'La structure : titres, paragraphes, images, boutons', 'Les murs et les pièces', '<h1>Pagnes Akissi</h1>'],
      ['**CSS**', 'L\'apparence : couleurs, tailles, disposition', 'La peinture et la décoration', 'color: orange;'],
      ['**JavaScript**', 'Le comportement : ce qui se passe quand on clique', 'L\'électricité et les interrupteurs', 'onClick={commander}'],
    ], [1, 1.8, 1.4, 1.5]] },
    'Beaucoup d\'outils d\'IA utilisent **React**, une manière moderne d\'écrire des interfaces en JavaScript, et **Tailwind**, une manière rapide d\'écrire le CSS. Vous verrez souvent ces noms : ce sont des outils de professionnels, et c\'est une bonne nouvelle.',
  ],

  pasAPas: [
    { h2: 'Étape 1 : faire le tour des fichiers d\'un projet' },
    'Dans votre constructeur d\'applications, ouvrez le mode **Code** (souvent un onglet ou une icône **</>**). Vous verrez une arborescence de fichiers, comme dans l\'Explorateur de Windows.',
    { tableau: [['Ce que vous voyez', 'Ce que c\'est'], [
      ['Un dossier **src** (pour « source »)', 'Le code de l\'application'],
      ['Des fichiers **.tsx**, **.jsx**, **.js**, **.ts**', 'Les pages et les composants, en JavaScript ou TypeScript'],
      ['Des fichiers **.css**', 'Les styles'],
      ['Un fichier **package.json**', 'La liste des « ingrédients » (bibliothèques) utilisés par le projet'],
      ['Un fichier **README.md**', 'La notice du projet, à lire en premier'],
      ['Un fichier **.env** (parfois caché)', 'Les **réglages secrets** : clés, mots de passe. Il ne doit jamais être publié (module 10).'],
    ], [2, 3]] },
    { h2: 'Étape 2 : demander à l\'IA d\'expliquer' },
    'Le meilleur professeur de code, c\'est l\'IA elle-même. Ouvrez un fichier et demandez :',
    { encadre: { style: 'bleu', contenu: [
      '« Explique-moi ce fichier comme à quelqu\'un qui ne sait pas programmer : à quoi il sert, comment il est organisé, et ce qui se passerait si je le supprimais. Utilise une comparaison avec une boutique. »',
    ] } },
    'Ou, pour toute l\'application : « Fais-moi un plan de l\'application : quelles pages, quelles tables de données, quels services externes, et comment ils sont reliés. »',
    { h2: 'Étape 3 : observer une page avec les outils du navigateur' },
    { etapes: [
      'Ouvrez votre application (ou n\'importe quel site) dans Chrome ou Edge.',
      'Appuyez sur **F12** (ou clic droit sur la page → **Inspecter**). Un panneau s\'ouvre : ce sont les **outils de développement**.',
      'Onglet **Elements** (ou **Éléments**) : survolez les lignes, la partie correspondante de la page se colore. Vous voyez le HTML et le CSS de chaque élément.',
      'Onglet **Console** : c\'est là que s\'affichent les **messages d\'erreur** en rouge. Vous en aurez besoin au module 7.',
      'Cliquez sur l\'icône **téléphone et tablette** (mode appareil) pour voir la page comme sur un téléphone, et choisissez un modèle dans la liste.',
    ] },
    { illus: 'Capture d\'écran : une page web avec les outils de développement ouverts à droite, l\'onglet Éléments montrant le HTML, le mode appareil réglé sur un téléphone, et l\'onglet Console avec un message d\'erreur en rouge.' },
    { encadre: { titre: '💡  Le conseil de M. Kouassi', style: 'vert', contenu: [
      '« Vous n\'avez pas besoin de comprendre chaque ligne. Vous devez savoir **où** regarder, **quoi** demander, et **quand** vous méfier. C\'est exactement ce que fait un bon chef de chantier. »',
    ] } },
  ],

  pieges: {
    lignes: [
      ['✅ Cliquer « Oui » à tout ce que propose l\'IA sans comprendre', 'On accepte des choix coûteux ou dangereux.', 'Demander « explique-moi avant de le faire, avec les avantages et les risques ».'],
      ['🗑️ Supprimer un fichier « qui a l\'air inutile »', 'L\'application ne démarre plus.', 'Demander d\'abord à l\'IA à quoi il sert ; sauvegarder (module 8).'],
      ['🔑 Ouvrir et partager le fichier .env', 'Les clés secrètes sont exposées.', 'Ne jamais copier ce fichier dans une discussion ni le publier.'],
      ['📚 Vouloir tout comprendre avant de commencer', 'On ne commence jamais.', 'Comprendre au fur et à mesure, en demandant à l\'IA.'],
    ],
    questions: [
      ['Toutes les applications ont-elles un serveur et une base de données ?', 'Non. Une simple vitrine (module 5) peut n\'être que de l\'interface. Dès qu\'il faut **retenir** des informations (comptes, commandes, versements), il faut une base de données et souvent un serveur.'],
      ['Supabase, Firebase : qu\'est-ce que c\'est ?', 'Ce sont des services qui fournissent, prêts à l\'emploi, une base de données, l\'authentification et un stockage de fichiers. Les outils de vibe coding s\'y branchent souvent automatiquement. On les appelle parfois « back-end as a service ».'],
    ],
  },

  exercices: {
    echauffe: [
      { h3: 'Exercice 1 : où est-ce rangé ?' },
      { tableau: [['Élément', 'Interface, serveur, base de données, API ou hébergeur ?'], [
        ['Le bouton orange « Commander »', ''], ['La liste de tous les versements', ''], ['La règle « en retard si pas payé avant dimanche »', ''],
        ['La liaison avec le service de paiement Mobile Money', ''], ['L\'entreprise qui fait tourner l\'application jour et nuit', ''],
      ], [2.6, 2.4], C.bleu] },
    ],
    entraine: [
      { h3: 'Exercice 2 : le tour du propriétaire' },
      { cases: [
        'J\'ouvre le mode Code de mon projet d\'essai (module 1) et je repère src, package.json et README.',
        'Je demande à l\'IA un plan de mon application.',
        'J\'ouvre les outils de développement (F12) et je repère un élément dans l\'onglet Éléments.',
        'J\'affiche ma page en mode téléphone.',
      ] },
    ],
    lance: [
      { h3: 'Exercice 3 : les tables de mon projet' },
      'Pour votre projet personnel (module 2), dessinez les tables de données : nom de chaque table, ses colonnes, et les relations entre elles.',
    ],
  },

  cas: [
    { h2: 'Décoder la réponse de l\'IA' },
    'Reprenez la réponse de l\'IA dans la situation de départ : « connecter un backend avec une base de données, créer une table des membres avec des politiques d\'accès au niveau des lignes, ajouter l\'authentification, stocker la clé d\'API dans les variables d\'environnement ».',
    { etapes: [
      'Traduisez chaque élément en langage « boutique ».',
      'Lesquels sont nécessaires pour le cahier des charges de la tontine ? Pourquoi ?',
      'Quelles questions Yao doit-il poser à l\'IA avant d\'accepter ?',
    ] },
  ],

  retiens: [
    '**Interface** = la vitrine ; **serveur** = l\'arrière-boutique ; **base de données** = le cahier de stock ; **API** = le coursier.',
    '**Hébergeur** = le bailleur ; **nom de domaine** = l\'enseigne et l\'adresse.',
    'Base de données : des **tables**, des **colonnes**, des **lignes**, et des **relations**.',
    '**HTML** = les murs, **CSS** = la peinture, **JavaScript** = l\'électricité.',
    'Le fichier **.env** contient les secrets : on ne le partage jamais.',
    '**F12** : les outils de développement, la **Console** pour les erreurs, le mode **téléphone**.',
  ],
  defi: [
    'Cette semaine, ouvrez les outils de développement sur trois sites que vous utilisez souvent, et repérez la Console et le mode téléphone. Expliquez à quelqu\'un, avec l\'image de la boutique, comment fonctionne une application.',
  ],
  motDeLaFin: 'Yao a relu la réponse de l\'IA. Cette fois, il a écrit : « Avant de continuer, explique-moi les politiques d\'accès au niveau des lignes avec l\'exemple de la tontine. » L\'IA a répondu : « Cela garantit que chaque membre ne voit que ses propres versements. » Yao a souri : c\'était exactement la règle de Tantie Akissi.',
  quiz: [
    'La partie de l\'application que voit l\'utilisateur s\'appelle… **a)** le serveur · **b)** l\'interface · **c)** la base de données.',
    'Une API est comparable… **a)** au coursier qui transmet les demandes entre deux programmes · **b)** à la peinture · **c)** au bailleur.',
    'Le CSS sert à… **a)** la structure · **b)** l\'apparence · **c)** le paiement.',
    'Le fichier .env contient… **a)** les images · **b)** les réglages secrets · **c)** la notice.',
  ],
  corriges: [
    ['Exercice 1', 'Bouton : interface · Liste des versements : base de données · Règle de retard : serveur (ou logique de l\'application) · Liaison paiement : API · Entreprise : hébergeur.'],
    ['Cas pratique', '**1.** Back-end : l\'arrière-boutique ; base de données : le cahier ; table des membres : la feuille des membres ; politiques d\'accès au niveau des lignes : chaque membre ne voit que ses propres lignes ; authentification : le badge d\'entrée ; clé d\'API dans les variables d\'environnement : le code secret du coffre rangé dans un tiroir fermé, et non affiché en vitrine. **2.** Tout est nécessaire : comptes (trésorière et membres), données à conserver, règle « une membre ne voit que ses versements ». **3.** Quel service est utilisé et combien il coûte ? Où sont stockées les données ? Comment la trésorière a-t-elle plus de droits que les membres ? Comment vérifier qu\'une membre ne peut pas voir les versements des autres ?'],
    ['Mini-quiz', '1-b · 2-a · 3-b · 4-b'],
  ],
  glossaire: [
    ['Front-end (interface)', 'La partie visible d\'une application : pages, boutons, formulaires.'],
    ['Back-end (serveur)', 'La partie invisible qui traite les demandes, applique les règles et accède aux données.'],
    ['Base de données', 'L\'endroit où les informations d\'une application sont rangées en tables.'],
    ['Table', 'Un ensemble de données de même nature, en lignes et colonnes, dans une base de données.'],
    ['API', 'Une interface qui permet à deux programmes d\'échanger des demandes et des réponses.'],
    ['Authentification', 'La vérification de l\'identité d\'un utilisateur : inscription, connexion.'],
    ['HTML, CSS, JavaScript', 'Les trois langages des pages web : structure, apparence, comportement.'],
    ['Outils de développement', 'Les outils intégrés au navigateur (F12) pour inspecter une page et lire les erreurs.'],
    ['Nom de domaine', 'L\'adresse lisible d\'un site, comme pagnesakissi.ci.'],
    ['Hébergeur', 'L\'entreprise qui fait fonctionner une application sur ses serveurs, accessible par Internet.'],
  ],
};
