// Tome 1 · Module 7 : Internet, le grand marché du monde
const { C } = require('../outils/livre');

module.exports = {
  num: 7,
  titre: 'Internet, le grand marché du monde',
  sousTitre: 'Trouver le bon commerçant, éviter les vendeurs de vent',
  objectifs: [
    'comprendre ce que sont **Internet**, le **Web**, un **navigateur**, une **adresse** et un **moteur de recherche** ;',
    'naviguer avec les **onglets**, les flèches et les **favoris** ;',
    'faire une **recherche efficace** avec des mots-clés ;',
    'reconnaître une **information fiable** et repérer une **fausse information** ;',
    'télécharger un fichier **sans danger**.',
  ],
  duree: 'Quatre heures', materiel: 'Un ordinateur connecté à Internet', prerequis: 'Modules 1 à 4',

  situation: [
    { h2: 'Les 150 000 F du gouvernement' },
    'Koffi reçoit sur Facebook un message partagé par un cousin : « URGENT ! Le gouvernement offre 150 000 F à chaque jeune de 18 à 35 ans. Cliquez vite sur ce lien et entrez votre numéro Mobile Money. Offre valable 24 heures ! Partagez à 10 groupes pour valider. »',
    'Il y a même le drapeau du pays et une photo officielle. Le lien s\'appelle **aide-jeunes-ci.online**. Koffi a déjà le doigt sur le lien.',
    { d: ['Koffi', 'Monsieur Kouassi, c\'est vrai ça ? Mon cousin l\'a partagé, et lui il travaille au Plateau !'] },
    { d: ['M. Kouassi', 'Avant de cliquer, Koffi, on va apprendre à faire ses courses sur Internet. Au marché, tu ne donnes pas ton argent au premier qui crie le plus fort.'] },
  ],

  declic: [
    { h2: 'Internet, c\'est le plus grand marché du monde' },
    'Imaginez un marché immense, plus grand qu\'Adjamé, Treichville et tous les marchés du monde réunis, ouvert jour et nuit. Des milliards de boutiques : des journaux, des écoles, des administrations, des magasins, des vidéos… et aussi des voleurs. C\'est **Internet**. Pour s\'y retrouver, il faut savoir comment il est organisé.',
    { tableau: [['Sur Internet…', 'Au marché…', 'Ce que c\'est'], [
      ['Le **navigateur** (Edge, Chrome)', 'Le woro-woro qui vous y conduit', 'Le programme qui permet de visiter les sites. Sur Windows 11, Microsoft **Edge** est déjà installé.'],
      ['Un **site web**', 'Une boutique', 'Un ensemble de pages publié par une personne, une entreprise ou une administration.'],
      ['L\'**adresse** (URL)', 'L\'adresse exacte de la boutique', 'Elle s\'écrit en haut du navigateur, par exemple **www.servicepublic.gouv.ci**.'],
      ['Le **moteur de recherche** (Google, Bing)', 'Le guide qui connaît toutes les boutiques', 'Vous lui dites ce que vous cherchez, il vous propose une liste de sites.'],
      ['Un **lien**', 'Un panneau indicateur', 'Un texte ou une image sur lequel on clique pour aller ailleurs. Le pointeur devient une petite main 👆.'],
      ['Un **onglet**', 'Plusieurs boutiques visitées en même temps', 'Chaque page ouverte dans le navigateur a son onglet, en haut.'],
    ], [1.3, 1.4, 2.3]] },
    { h3: 'Lire une adresse comme une enseigne' },
    'Prenons **https://www.servicepublic.gouv.ci/demarches**. Lisons-la de la fin du nom vers le début :',
    { puces: [
      '**.ci** : le pays, la Côte d\'Ivoire. On voit aussi **.com**, **.org**, **.fr**…',
      '**.gouv.ci** : réservé au **gouvernement ivoirien**. C\'est un excellent signe de confiance.',
      '**servicepublic** : le nom du site, son « enseigne ».',
      '**/demarches** : une page précise à l\'intérieur du site, comme un rayon dans la boutique.',
      '**https** et le petit **cadenas** 🔒 : la conversation entre vous et le site est **chiffrée**, personne ne peut l\'écouter en route.',
    ] },
    { encadre: { titre: '⚠️  Le cadenas ne garantit pas l\'honnêteté', style: 'rouge', contenu: [
      'Le cadenas signifie seulement que la porte de la boutique est fermée à clé pendant que vous parlez. Mais un escroc peut très bien avoir une boutique avec une porte fermée à clé ! Le site **aide-jeunes-ci.online** peut avoir un cadenas et être une arnaque. Ce qui compte d\'abord, c\'est **qui** est derrière le site.',
    ] } },
    { h2: 'La méthode QUAT\' pour vérifier une information' },
    'Avant de croire, de partager ou de payer, posez quatre questions. Retenez-les avec le mot **QUAT\'** :',
    { tableau: [['Lettre', 'La question', 'Le bon signe'], [
      ['**Q**', '**Qui** parle ? Qui a écrit ou publié cela ?', 'Un média connu, une administration (.gouv.ci), une entreprise identifiable.'],
      ['**U**', 'Est-ce **Urgent** ou trop beau pour être vrai ?', 'Une vraie information ne vous presse pas avec « vite, 24 heures, partagez à 10 groupes ».'],
      ['**A**', 'D\'**Autres** sources sérieuses disent-elles la même chose ?', 'Les médias nationaux et le site officiel en parlent aussi.'],
      ['**T**', 'De quand date-t-elle (**Temps**) ?', 'Une information récente, datée.'],
    ], [0.6, 2.2, 2.4], C.violet] },
  ],

  pasAPas: [
    { h2: 'Étape 1 : ouvrir le navigateur et aller sur un site' },
    { etapes: [
      'Ouvrez **Microsoft Edge** (l\'icône en forme de vague bleue et verte, dans la barre des tâches) ou **Google Chrome** s\'il est installé.',
      'Cliquez dans la **barre d\'adresse**, tout en haut. Tapez **servicepublic.gouv.ci**, puis **Entrée**.',
      'Cliquez sur un lien de la page. Pour revenir en arrière, cliquez sur la **flèche ←** en haut à gauche.',
    ] },
    { illus: 'Capture d\'écran de Microsoft Edge annotée : les flèches précédent et suivant, le bouton actualiser, la barre d\'adresse avec le cadenas, l\'étoile des favoris, les onglets en haut avec le « + » pour en ouvrir un nouveau.' },
    { h2: 'Étape 2 : chercher avec des mots-clés' },
    'Le moteur de recherche n\'est pas une personne : inutile de lui écrire une phrase polie. Donnez-lui les **mots importants**, comme on donne une liste de courses.',
    { tableau: [['Au lieu de…', 'J\'écris…'], [
      ['« Bonjour, je voudrais savoir combien coûte une machine à coudre à Abidjan s\'il vous plaît »', '**prix machine à coudre Abidjan**'],
      ['« Comment on fait pour avoir un extrait d\'acte de naissance ? »', '**extrait acte de naissance Côte d\'Ivoire démarche**'],
      ['« Je cherche la recette du garba »', '**recette garba**'],
    ], [2.6, 2]] },
    { etapes: [
      'Tapez vos mots-clés directement dans la barre d\'adresse, puis **Entrée** : le navigateur lance la recherche.',
      'Lisez les résultats : chaque résultat montre un **titre**, l\'**adresse** du site et un petit extrait.',
      'Méfiez-vous des résultats marqués **Sponsorisé** ou **Annonce** : ce sont des publicités payées, pas forcément les meilleures réponses.',
      'Ouvrez les résultats intéressants dans de **nouveaux onglets** : clic droit sur le lien → **Ouvrir le lien dans un nouvel onglet**. Vous gardez ainsi votre liste de résultats.',
    ] },
    { h2: 'Étape 3 : onglets et favoris' },
    { tableau: [['Je veux…', 'Je fais…'], [
      ['Ouvrir un nouvel onglet', 'Le **+** à droite des onglets, ou **Ctrl + T**'],
      ['Fermer un onglet', 'La **✕** de l\'onglet, ou **Ctrl + W**'],
      ['Garder l\'adresse d\'un site utile', 'L\'**étoile** ☆ au bout de la barre d\'adresse → **Ajouter aux favoris**'],
      ['Agrandir le texte d\'une page', '**Ctrl +** (ou Ctrl + molette). **Ctrl 0** pour revenir à la normale'],
    ], [1.6, 3]] },
    { h2: 'Étape 4 : télécharger sans danger' },
    { etapes: [
      'Ne téléchargez un logiciel **que depuis le site officiel** de son éditeur, ou depuis le **Microsoft Store** (dans le menu Démarrer).',
      'Cliquez sur le bouton de téléchargement : le fichier arrive dans le dossier **Téléchargements**.',
      'Rangez-le ensuite à sa place (module 4).',
      'Si une page affiche « Votre ordinateur est infecté ! Appelez ce numéro ! », **fermez l\'onglet**. C\'est une arnaque : Windows ne vous parle jamais ainsi depuis une page Internet.',
    ] },
  ],

  pieges: {
    lignes: [
      ['🔗 Cliquer sur un lien reçu d\'un inconnu, ou partagé « en urgence »', 'Le lien peut mener à un faux site qui vole vos codes ou votre argent.', 'Taper soi-même l\'adresse du site officiel.'],
      ['📢 Partager avant de vérifier', 'On aide les escrocs et les fausses nouvelles à se répandre.', 'La méthode QUAT\' avant chaque partage.'],
      ['🔔 Cliquer « Autoriser » quand un site propose des notifications', 'Des publicités envahissantes apparaîtront ensuite sur votre écran.', 'Cliquer « Bloquer » sauf pour les sites de confiance.'],
      ['💿 Télécharger un logiciel « gratuit » ou « cracké » sur un site inconnu', 'C\'est le premier chemin des virus.', 'Site officiel ou Microsoft Store uniquement.'],
      ['📺 Croire une vidéo ou une photo « choc »', 'Les images peuvent être anciennes, sorties de leur contexte, ou fabriquées par une IA.', 'Chercher la même information dans des médias sérieux.'],
    ],
    questions: [
      ['Internet et Wi-Fi, c\'est la même chose ?', 'Non. Le **Wi-Fi** est seulement le moyen sans fil de relier votre ordinateur à la box ou au téléphone qui, lui, est connecté à **Internet**. Le Wi-Fi est la route ; Internet est le marché au bout de la route.'],
      ['Est-ce que Google sait tout ?', 'Google ne sait rien : il **trouve** des pages écrites par d\'autres, bonnes ou mauvaises. C\'est à vous de juger avec la méthode QUAT\'.'],
    ],
  },

  exercices: {
    echauffe: [
      { h3: 'Exercice 1 : je décode les adresses' },
      'Pour chaque adresse, dites qui est probablement derrière et si vous lui faites confiance.',
      { tableau: [['Adresse', 'Qui ?', 'Confiance ?'], [
        ['www.servicepublic.gouv.ci', '', ''], ['www.cie.ci', '', ''], ['orange-money-bonus-gratuit.xyz', '', ''],
        ['www.fratmat.info', '', ''], ['wave-ci-recompense.online', '', ''],
      ], [2.2, 1.6, 1], C.bleu] },
    ],
    entraine: [
      { h3: 'Exercice 2 : les bons mots-clés' },
      'Transformez chaque question en une recherche de trois à cinq mots-clés, puis lancez-la.',
      { lignes: ['« À quelle heure ouvre la mairie de Cocody le samedi ? » → ', '« Comment soigner une brûlure légère à la maison ? » → ', '« Quels sont les documents pour faire un passeport ? » → '] },
    ],
    lance: [
      { h3: 'Exercice 3 : détective de l\'information' },
      'Choisissez une information qui circule en ce moment sur WhatsApp ou Facebook dans votre entourage. Appliquez la méthode QUAT\' et notez votre conclusion : vraie, fausse, ou impossible à vérifier.',
      { lignes: ['L\'information : ', 'Q : ', 'U : ', 'A : ', 'T : ', 'Ma conclusion : '] },
    ],
  },

  cas: [
    { h2: 'Koffi doit-il cliquer ?' },
    'Reprenez le message reçu par Koffi au début du module.',
    { etapes: [
      'Appliquez la méthode **QUAT\'** : répondez aux quatre questions.',
      'Que vous apprend l\'adresse **aide-jeunes-ci.online** ?',
      'Pourquoi le message demande-t-il de « partager à 10 groupes » ?',
      'Où Koffi peut-il vérifier si une aide de l\'État existe vraiment ?',
      'Que doit-il répondre à son cousin ?',
    ] },
  ],

  retiens: [
    'Le **navigateur** (Edge, Chrome) visite les sites ; le **moteur de recherche** (Google, Bing) les trouve.',
    'Une adresse se lit comme une enseigne : **.gouv.ci** = gouvernement ivoirien.',
    'Le **cadenas** protège la conversation, mais ne prouve pas l\'honnêteté du site.',
    'Je cherche avec des **mots-clés**, et je me méfie des résultats **Sponsorisés**.',
    'Avant de croire ou de partager : **QUAT\'** (Qui ? Urgent ? Autres sources ? Temps ?).',
    'Je télécharge **uniquement** depuis les sites officiels ou le Microsoft Store.',
  ],
  defi: [
    'Cette semaine, avant de partager **quoi que ce soit** sur WhatsApp ou Facebook, appliquez la méthode QUAT\'. Comptez combien de messages vous n\'avez finalement pas partagés.',
  ],
  motDeLaFin: 'Koffi n\'a pas cliqué. Il a cherché « aide 150 000 F jeunes Côte d\'Ivoire » et trouvé, sur un grand média, un article qui dénonçait justement cette arnaque. Il l\'a envoyé à son cousin, avec ce message : « Grand-frère, QUAT\' avant de partager ! »',
  quiz: [
    'Le programme qui permet de visiter les sites s\'appelle… **a)** le navigateur · **b)** le moteur de recherche · **c)** le Wi-Fi.',
    'Une adresse qui se termine par .gouv.ci appartient… **a)** à n\'importe qui · **b)** au gouvernement ivoirien · **c)** à Google.',
    'Le cadenas 🔒 dans la barre d\'adresse prouve… **a)** que le site est honnête · **b)** que la connexion est chiffrée · **c)** que le site est gratuit.',
    'Un message dit « Urgent, partagez à 10 groupes pour recevoir votre cadeau ». C\'est… **a)** une bonne affaire · **b)** très probablement une arnaque · **c)** un message officiel.',
  ],
  corriges: [
    ['Exercice 1', 'servicepublic.gouv.ci : le gouvernement, confiance · cie.ci : la Compagnie ivoirienne d\'électricité, confiance (en vérifiant bien l\'orthographe de l\'adresse) · orange-money-bonus-gratuit.xyz : inconnu imitant Orange, aucune confiance · fratmat.info : le quotidien Fraternité Matin, confiance · wave-ci-recompense.online : inconnu imitant Wave, aucune confiance.'],
    ['Exercice 2', 'Par exemple : « horaires mairie Cocody samedi » · « soigner brûlure légère » · « documents passeport Côte d\'Ivoire ».'],
    ['Cas pratique', '**1.** Q : un inconnu, pas d\'administration identifiée ; U : très urgent et trop beau ; A : aucun média sérieux n\'en parle ; T : pas de date. **2.** Ce n\'est pas une adresse en .gouv.ci : ce n\'est pas un site officiel. **3.** Pour se propager le plus vite possible et faire de nouvelles victimes. **4.** Sur les sites officiels en .gouv.ci et dans les grands médias nationaux. **5.** Que c\'est une arnaque, qu\'il ne faut ni cliquer ni donner son numéro, et qu\'il doit supprimer son partage.'],
    ['Mini-quiz', '1-a · 2-b · 3-b · 4-b'],
  ],
  glossaire: [
    ['Internet', 'Le réseau mondial qui relie des milliards d\'ordinateurs et de téléphones.'],
    ['Navigateur', 'Le programme qui permet de visiter les sites web : Edge, Chrome, Firefox…'],
    ['Site web', 'Un ensemble de pages publiées sur Internet sous une même adresse.'],
    ['URL (adresse web)', 'L\'adresse d\'une page sur Internet, comme www.servicepublic.gouv.ci.'],
    ['Moteur de recherche', 'Un service qui trouve des pages à partir de mots-clés : Google, Bing…'],
    ['Lien', 'Un texte ou une image sur lequel on clique pour aller vers une autre page.'],
    ['Onglet (navigateur)', 'Une page ouverte dans le navigateur, accessible par son étiquette en haut.'],
    ['HTTPS', 'Une connexion chiffrée entre votre appareil et le site, signalée par un cadenas.'],
    ['Télécharger', 'Copier un fichier depuis Internet vers son ordinateur.'],
    ['Fausse information', 'Une information inventée ou déformée, souvent partagée pour tromper ou faire du bruit.'],
  ],
};
