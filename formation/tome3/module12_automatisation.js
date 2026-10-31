// Tome 3 · Module 12 : Automatisation et IA avancée : API, Make, Zapier, agents
const { C } = require('../outils/livre');

module.exports = {
  num: 12,
  titre: 'Automatisation et IA avancée : API, Make, Zapier, agents',
  sousTitre: 'L\'employé qui ne dort jamais',
  objectifs: [
    'repérer les **tâches répétitives** qui méritent d\'être automatisées ;',
    'construire un **scénario** avec **Make** ou **Zapier** : déclencheur, actions, filtres ;',
    'utiliser une **API** dans un scénario, sans programmer ;',
    'ajouter de l\'**IA** dans une automatisation ;',
    'comprendre les **agents d\'IA** et les garder **sous contrôle**.',
  ],
  duree: 'Six heures', materiel: 'Un compte Make ou Zapier (offre gratuite), Google Forms et Sheets, Gmail', prerequis: 'Modules 1 à 11 ; Tome 2, module 5',

  situation: [
    { h2: 'Les soirées de Mariam' },
    'Chaque soir, Mariam passe une heure à la même routine : elle ouvre les demandes de devis reçues par le formulaire du site, les recopie dans le tableau de suivi, envoie à chaque client un e-mail « Nous avons bien reçu votre demande », prévient le commercial concerné sur WhatsApp, et prépare un résumé pour le directeur. Cinq jours par semaine. Deux cent cinquante heures par an.',
    { d: ['Mariam', 'Je ne suis pas devenue assistante de direction pour faire du copier-coller !'] },
    { d: ['M. Kouassi', 'Alors on va vous embaucher un employé qui ne dort jamais, qui ne se trompe pas en recopiant, et qui ne demande pas d\'augmentation. Il faudra juste lui expliquer son travail très précisément… et vérifier qu\'il le fait bien.'] },
  ],

  declic: [
    { h2: 'Un scénario, c\'est une fiche de poste' },
    'Une automatisation se décrit comme la fiche de poste d\'un employé très obéissant : **quand** il se passe telle chose, **fais** ceci, puis cela, **seulement si** telle condition est vraie.',
    { tableau: [['Élément', 'Dans la fiche de poste…', 'Dans Make ou Zapier'], [
      ['**Déclencheur**', '« Quand un client dépose une demande au guichet… »', 'L\'événement qui lance le scénario : nouveau formulaire, nouvel e-mail, nouvelle ligne, paiement reçu, heure fixe'],
      ['**Actions**', '« … recopie-la dans le registre, envoie un accusé de réception, préviens le commercial. »', 'Les étapes exécutées l\'une après l\'autre, dans différentes applications'],
      ['**Filtre**', '« … seulement si le montant dépasse 500 000 F. »', 'Une condition qui laisse passer ou arrête la suite'],
      ['**Données transmises**', 'Le nom du client recopié du formulaire vers le registre', 'Les champs d\'une étape réutilisés dans les suivantes'],
    ], [1.2, 2.2, 2.2]] },
    { tableau: [['Outil', 'Points forts', 'À savoir'], [
      ['**Zapier**', 'Très simple, des milliers d\'applications reliées', 'Offre gratuite limitée ; tarif selon le nombre de tâches'],
      ['**Make**', 'Visuel (des bulles reliées), très souple, souvent moins cher pour des scénarios complexes', 'Un peu plus technique ; tarif selon le nombre d\'opérations'],
      ['**n8n**', 'Libre, peut être installé sur son propre serveur', 'Pour les plus avancés'],
    ], [1, 2.3, 2.3]] },
    { h2: 'Les agents d\'IA' },
    'Un scénario Make suit une fiche de poste **fixe**. Un **agent d\'IA** reçoit un **objectif** et décide lui-même des étapes, en utilisant des **outils** (chercher sur Internet, lire des e-mails, remplir un tableau, appeler une API). Par exemple : « Chaque matin, lis les nouvelles demandes de devis, classe-les par urgence, prépare un brouillon de réponse pour chacune, et fais-moi un résumé. »',
    { encadre: { titre: '🔑  L\'agent est un stagiaire autonome : il faut des garde-fous', style: 'rouge', contenu: [
      { puces: [
        '**Validation humaine** avant toute action irréversible ou extérieure : envoyer un e-mail à un client, payer, supprimer, publier.',
        '**Droits minimaux** : l\'agent n\'accède qu\'à ce dont il a besoin (lecture seule quand c\'est possible).',
        '**Limites** de dépenses et de nombre d\'actions.',
        '**Journal** de tout ce qu\'il fait, relu régulièrement.',
        '**Méfiance** envers le contenu qu\'il lit : un e-mail ou une page web peuvent contenir des instructions piégées destinées à le détourner.',
      ] },
    ] } },
  ],

  pasAPas: [
    { h2: 'Étape 1 : repérer ce qui mérite d\'être automatisé' },
    'Une tâche est une bonne candidate si elle est **répétitive**, **régulière**, **à règles claires**, et qu\'une erreur n\'est pas dramatique. Listez vos tâches de la semaine et estimez pour chacune : temps par fois × nombre de fois par mois.',
    { h2: 'Étape 2 : le scénario de Mariam avec Make' },
    { etapes: [
      'Créez un compte sur **make.com** → **Create a new scenario**.',
      '**Déclencheur** : cliquez sur le **+**, choisissez **Google Forms** (ou **Google Sheets** → **Watch New Rows** sur la feuille des réponses du formulaire), connectez votre compte Google, choisissez le formulaire des devis.',
      '**Action 1** : **Google Sheets** → **Add a Row** dans le tableau de suivi. Glissez chaque champ du formulaire (nom, téléphone, besoin, montant estimé) dans la bonne colonne ; ajoutez la date et le statut « Nouveau ».',
      '**Action 2** : **Gmail** → **Send an Email** au client : objet « Nous avons bien reçu votre demande », message personnalisé avec son prénom.',
      '**Filtre** : entre deux bulles, cliquez sur le lien → **Set up a filter** : « Montant estimé supérieur à 500 000 ».',
      '**Action 3** (après le filtre) : prévenir le directeur par e-mail, ou par un message dans l\'outil de discussion de l\'équipe.',
      'Cliquez sur **Run once** et remplissez le formulaire avec une fausse demande : suivez les bulles qui s\'allument. Vérifiez la ligne ajoutée et l\'e-mail reçu.',
      'Activez le scénario (**ON**) et choisissez sa fréquence.',
    ] },
    { img: 'make', illus: 'Capture d\'écran d\'un scénario Make : une bulle Google Forms reliée à Google Sheets (Add a Row), puis à Gmail (Send an Email), puis un filtre « Montant > 500 000 » vers une bulle « Prévenir le directeur ».' },
    { h2: 'Étape 3 : ajouter l\'IA au scénario' },
    { etapes: [
      'Entre le déclencheur et l\'enregistrement, ajoutez une bulle d\'IA (module OpenAI, Anthropic Claude ou Google Gemini, selon ceux proposés, avec votre clé).',
      'Instruction : « Voici une demande de devis : [besoin]. Classe-la dans une seule de ces catégories : Impression, Saisie, Conception graphique, Autre. Donne aussi une urgence : Haute, Normale, Basse. Réponds uniquement au format : catégorie;urgence. »',
      'Utilisez la réponse dans les colonnes « Catégorie » et « Urgence » du tableau de suivi.',
      'Pendant deux semaines, **vérifiez** chaque classement. Corrigez l\'instruction si l\'IA se trompe souvent.',
    ] },
    { h2: 'Étape 4 : appeler une API sans programmer' },
    'Quand une application n\'a pas de bulle toute prête, la bulle **HTTP** (« Make a request ») permet d\'appeler directement son API, à partir de sa **documentation** : une adresse, une méthode (GET pour lire, POST pour envoyer), éventuellement une clé. Demandez à un assistant d\'IA : « Voici la documentation de cette API : [extrait]. Comment configurer la bulle HTTP de Make pour [ce que je veux] ? »',
    { h2: 'Étape 5 : un premier agent, sous contrôle' },
    { etapes: [
      'Commencez par un agent qui **prépare** sans **agir** : il lit les demandes du jour et rédige des **brouillons** de réponse dans Gmail, que Mariam relit et envoie elle-même.',
      'Donnez-lui une instruction écrite précise : son rôle, ses sources, ce qu\'il a le droit de faire, ce qu\'il ne doit **jamais** faire, le format de son compte rendu.',
      'Faites-le tourner en parallèle de la méthode manuelle pendant une ou deux semaines, et comparez.',
      'N\'élargissez ses droits qu\'après avoir constaté sa fiabilité, et gardez toujours la validation humaine pour ce qui part chez un client.',
    ] },
  ],

  pieges: {
    lignes: [
      ['🤖 Automatiser un processus mal défini', 'On automatise le désordre, plus vite.', 'Écrire d\'abord la fiche de poste, à la main.'],
      ['🔁 Un scénario qui se déclenche lui-même en boucle', 'Des centaines d\'e-mails envoyés, quota épuisé.', 'Tester avec Run once ; filtres ; limites.'],
      ['📧 Laisser l\'IA écrire directement aux clients', 'Une erreur ou une invention part sous votre nom.', 'Brouillons validés par un humain.'],
      ['🔑 Donner à un agent tous les accès', 'Une erreur ou un détournement peut tout toucher.', 'Droits minimaux, lecture seule si possible.'],
      ['🙈 Ne plus regarder un scénario qui « marche »', 'Une connexion expire, rien ne se passe pendant des semaines.', 'Alertes d\'erreur activées, contrôle hebdomadaire.'],
    ],
    questions: [
      ['Combien ça coûte ?', 'Les offres gratuites permettent d\'apprendre et de faire tourner de petits scénarios. Au-delà, Make et Zapier facturent selon le nombre d\'opérations ou de tâches par mois, et les modules d\'IA consomment des crédits chez le fournisseur d\'IA. Calculez : le coût mensuel est-il inférieur au temps gagné ?'],
      ['Automatiser, c\'est supprimer des emplois ?', 'Bien utilisée, l\'automatisation supprime surtout des **tâches** ennuyeuses et libère du temps pour ce qui demande du jugement, de la relation et de la créativité. Mariam n\'a pas perdu son poste : elle a gagné cinq heures par semaine pour des missions plus importantes.'],
    ],
  },

  exercices: {
    echauffe: [
      { h3: 'Exercice 1 : déclencheur, action ou filtre ?' },
      { tableau: [['Élément', 'Rôle'], [
        ['Chaque lundi à 8 h', ''], ['Envoyer un SMS au client', ''], ['Seulement si le client est à Abidjan', ''],
        ['Nouvelle réponse au formulaire', ''], ['Ajouter une ligne dans Google Sheets', ''],
      ], [3, 2], C.bleu] },
    ],
    entraine: [
      { h3: 'Exercice 2 : le scénario de Mariam' },
      'Reproduisez le scénario complet de l\'étape 2 avec votre propre formulaire, puis ajoutez la bulle d\'IA de l\'étape 3. Testez avec cinq fausses demandes variées.',
    ],
    lance: [
      { h3: 'Exercice 3 : ma fiche de poste' },
      'Choisissez une vraie tâche répétitive de votre vie ou de votre travail. Écrivez sa fiche de poste (déclencheur, actions, filtres), estimez le temps gagné par mois, puis automatisez-la.',
    ],
  },

  cas: [
    { h2: 'L\'agent de la coopérative' },
    'Une coopérative de productrices de vivriers de Daloa reçoit chaque jour des commandes de restaurants d\'Abidjan par WhatsApp et par e-mail. La présidente voudrait « un agent IA qui gère tout : prendre les commandes, confirmer aux clients, réserver le transport et encaisser ».',
    { etapes: [
      'Qu\'est-ce qui peut être automatisé par un **scénario fixe** ? Qu\'est-ce qui demanderait un **agent** ?',
      'Quelles actions doivent **toujours** garder une validation humaine ?',
      'Proposez une mise en place en trois étapes, de la plus prudente à la plus autonome.',
      'Quels garde-fous mettez-vous en place ?',
    ] },
  ],

  retiens: [
    'Un scénario = une **fiche de poste** : **déclencheur**, **actions**, **filtres**, données transmises.',
    '**Zapier** (simple), **Make** (visuel et souple), **n8n** (libre). On teste avec **Run once**.',
    'La bulle **HTTP** appelle n\'importe quelle **API** à partir de sa documentation.',
    'L\'IA dans un scénario : instruction précise, format de réponse imposé, **vérification** au début.',
    'Un **agent** reçoit un objectif et choisit ses étapes : **validation humaine**, **droits minimaux**, **limites**, **journal**.',
  ],
  defi: [
    'Cette semaine, automatisez une tâche répétitive réelle et mesurez le temps gagné. Activez les alertes d\'erreur du scénario.',
  ],
  motDeLaFin: 'Trois semaines plus tard, le directeur a demandé à Mariam pourquoi elle partait maintenant à 17 h 30. Elle lui a montré le scénario, les bulles qui s\'allumaient, le tableau qui se remplissait tout seul, et le résumé du matin préparé par l\'agent. Il a réfléchi, puis il a dit : « Vous pourriez faire la même chose pour la comptabilité ? »',
  quiz: [
    'Ce qui lance un scénario s\'appelle… **a)** le déclencheur · **b)** le filtre · **c)** la clé.',
    'Un filtre sert à… **a)** laisser passer la suite seulement si une condition est vraie · **b)** colorer les cellules · **c)** héberger le site.',
    'Un agent d\'IA… **a)** suit une liste d\'étapes fixe · **b)** reçoit un objectif et choisit lui-même ses étapes avec des outils · **c)** est un antivirus.',
    'Avant qu\'un agent envoie un e-mail à un client, il faut… **a)** une validation humaine · **b)** rien · **c)** redémarrer l\'ordinateur.',
  ],
  corriges: [
    ['Exercice 1', 'Déclencheur · Action · Filtre · Déclencheur · Action.'],
    ['Cas pratique', '**1.** Scénario fixe : enregistrer chaque commande (formulaire ou e-mail) dans un tableau, envoyer un accusé de réception, prévenir la responsable logistique, résumé quotidien. Agent : lire les messages libres (WhatsApp, e-mails) et en extraire les commandes, proposer un planning de transport, préparer les réponses. **2.** Confirmer une commande ferme au client (prix, quantités, date), réserver et payer le transport, encaisser ou rembourser. **3.** a) Scénario fixe à partir d\'un formulaire de commande ; b) agent qui lit les messages et prépare des brouillons et un tableau, validés chaque matin par une personne ; c) après plusieurs semaines fiables, envoi automatique des accusés de réception simples, le reste restant validé. **4.** Droits minimaux, limites de dépenses, journal relu, validation humaine pour l\'argent et les engagements, alertes d\'erreur, méfiance envers les instructions contenues dans les messages reçus.'],
    ['Mini-quiz', '1-a · 2-a · 3-b · 4-a'],
  ],
  glossaire: [
    ['Automatisation', 'L\'exécution automatique d\'une suite de tâches selon des règles.'],
    ['Scénario (Zap)', 'Une automatisation dans Make (scénario) ou Zapier (Zap).'],
    ['Déclencheur', 'L\'événement qui lance une automatisation.'],
    ['Filtre', 'Une condition qui laisse passer ou arrête la suite d\'un scénario.'],
    ['Requête HTTP', 'Une demande envoyée à une API à une adresse donnée, pour lire (GET) ou envoyer (POST) des données.'],
    ['Agent d\'IA', 'Une IA qui reçoit un objectif et enchaîne elle-même des actions avec des outils.'],
    ['Validation humaine', 'L\'étape où une personne vérifie et approuve une action avant qu\'elle soit exécutée.'],
    ['Make / Zapier / n8n', 'Des outils pour créer des automatisations entre applications, sans programmer.'],
  ],
};
