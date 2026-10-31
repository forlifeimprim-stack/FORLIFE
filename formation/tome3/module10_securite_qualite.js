// Tome 3 · Module 10 : Une application sûre et de qualité
const { C } = require('../outils/livre');

module.exports = {
  num: 10,
  titre: 'Une application sûre et de qualité',
  sousTitre: 'La boutique bien fermée le soir, et propre pour les clients',
  objectifs: [
    'protéger les **clés secrètes** et comprendre pourquoi elles fuient ;',
    'appliquer les règles de base de la sécurité d\'une application : **accès**, **saisies**, **mises à jour** ;',
    'respecter les **données personnelles** des utilisateurs et le cadre légal ivoirien ;',
    'vérifier la **qualité** : téléphone, vitesse, accessibilité, textes ;',
    'faire réaliser une **revue de sécurité** et passer la **liste de contrôle** avant livraison.',
  ],
  duree: 'Cinq heures', materiel: 'Votre projet en ligne', prerequis: 'Modules 1 à 9 ; Tome 2, module 8',

  situation: [
    { h2: 'La facture de 400 000 F' },
    'Un dimanche matin, Yao reçoit un e-mail d\'un service d\'intelligence artificielle : « Votre consommation du mois : 680 dollars. » Il n\'a presque rien utilisé. En cherchant, il découvre que la **clé secrète** de ce service était écrite directement dans le code de l\'interface de son application de démonstration. N\'importe quel visiteur pouvait la lire avec F12. Des robots l\'ont trouvée et l\'ont utilisée toute la nuit.',
    { d: ['Yao', 'Mais c\'est l\'IA qui l\'a mise là ! Je lui avais juste donné la clé pour que ça marche.'] },
    { d: ['M. Kouassi', 'L\'IA veut que ça marche, Yao. La sécurité, c\'est ton travail. C\'est toi qui as donné la clé, et c\'est toi que le client tiendra pour responsable. On va apprendre à fermer la boutique le soir.'] },
  ],

  declic: [
    { h2: 'Les clés du coffre ne vont pas dans la vitrine' },
    'Tout ce qui est dans l\'**interface** (la vitrine) est **visible** par tout visiteur, même si ce n\'est pas affiché à l\'écran : il suffit d\'ouvrir les outils de développement. Une clé secrète (paiement, IA, envoi de SMS) doit rester dans l\'**arrière-boutique** : sur le serveur, dans les **variables d\'environnement** (module 9), et être utilisée par une **fonction serveur**, jamais par la page elle-même.',
    { tableau: [['Clé', 'Peut aller dans l\'interface ?'], [
      ['Clé **publique** ou « anon » d\'un service de données, **avec** des règles d\'accès (RLS) bien réglées', '**Oui** : elle est faite pour cela, la protection vient des règles'],
      ['Clé **secrète** ou « service role » d\'un service de données', '**Jamais** : elle passe outre toutes les règles'],
      ['Clé d\'un service d\'**IA**, de **paiement**, d\'envoi de **SMS** ou d\'**e-mails**', '**Jamais** : uniquement côté serveur'],
    ], [3, 2]] },
    { h2: 'Les failles les plus fréquentes du vibe coding' },
    'Les experts en sécurité tiennent à jour une liste des failles les plus fréquentes des applications web, l\'**OWASP Top 10**. Voici, en mots simples, celles qu\'on rencontre le plus avec le code généré par IA :',
    { tableau: [['Faille', 'En clair', 'La parade'], [
      ['**Contrôle d\'accès défaillant**', 'Un utilisateur voit ou modifie les données d\'un autre', 'Règles d\'accès dans la base, test des badges (module 6)'],
      ['**Secrets exposés**', 'Clés dans le code de l\'interface ou sur GitHub', 'Variables d\'environnement, fonctions serveur, .env ignoré'],
      ['**Saisies non vérifiées**', 'On peut envoyer n\'importe quoi dans un formulaire, y compris du code malveillant', 'Vérifier chaque saisie côté serveur : type, longueur, format'],
      ['**Bibliothèques vulnérables**', 'Des « ingrédients » anciens ont des failles connues', 'Mises à jour régulières, alertes de sécurité de GitHub'],
      ['**Paquets inventés**', 'L\'IA propose parfois une bibliothèque qui n\'existe pas, ou au nom piégé', 'Vérifier que chaque bibliothèque ajoutée est connue et officielle'],
    ], [1.5, 1.9, 1.9], C.rouge] },
    { h2: 'Les données personnelles' },
    'Noms, numéros de téléphone, adresses, montants versés : ce sont des **données à caractère personnel**. En Côte d\'Ivoire, la **loi n° 2013-450** encadre leur traitement, et l\'**ARTCI** en est l\'autorité de protection. Selon la nature de l\'application, des **formalités** auprès de l\'ARTCI peuvent être nécessaires : renseignez-vous avant de mettre en production une application qui collecte des données personnelles, surtout pour un client.',
    { puces: [
      '**Ne collectez que le nécessaire** : pas de date de naissance si elle ne sert à rien.',
      '**Informez** les utilisateurs : une page « Confidentialité » qui dit quelles données sont collectées, pourquoi, combien de temps, et comment demander leur suppression.',
      '**Protégez** : accès limités, mots de passe jamais stockés en clair (les services d\'authentification s\'en chargent), sauvegardes.',
      '**Respectez les droits** : accès, rectification, opposition, suppression.',
    ] },
  ],

  pasAPas: [
    { h2: 'Étape 1 : chasser les secrets' },
    { etapes: [
      'Ouvrez votre application en ligne, **F12** → onglet **Sources** (ou **Réseau**), et cherchez (**Ctrl + F**) des mots comme « key », « secret », « sk_ », « token ».',
      'Demandez à l\'IA : « Liste toutes les clés et tous les secrets utilisés dans ce projet, et indique pour chacun s\'il est exposé dans le code de l\'interface. Ne m\'affiche aucune valeur. »',
      'Pour chaque clé secrète exposée : déplacez son utilisation dans une **fonction serveur** (l\'IA sait le faire), mettez la valeur dans les **variables d\'environnement**, puis **changez la clé** chez le fournisseur (l\'ancienne est compromise).',
      'Sur GitHub, vérifiez que le fichier **.env** n\'est pas dans le dépôt, et activez les **alertes de sécurité** du dépôt (Settings → Security).',
      'Chez chaque fournisseur (IA, SMS, paiement), fixez une **limite de dépenses** et une **alerte**.',
    ] },
    { h2: 'Étape 2 : la revue de sécurité par l\'IA' },
    { encadre: { titre: '✍️  Prompt de revue de sécurité (mode plan)', style: 'bleu', contenu: [
      '« Fais une revue de sécurité complète de cette application, sans rien modifier. Vérifie : les règles d\'accès de chaque table pour chaque rôle ; les secrets exposés dans l\'interface ; la vérification des saisies côté serveur ; les pages accessibles sans connexion ; les bibliothèques obsolètes ou inconnues ; les données personnelles collectées. Classe les problèmes du plus grave au moins grave, et propose pour chacun la correction la plus simple. »',
    ] } },
    'Corrigez **une** faille à la fois, du plus grave au moins grave, en vérifiant après chaque correction. Puis refaites la revue.',
    { h2: 'Étape 3 : la qualité' },
    { tableau: [['Domaine', 'Comment vérifier'], [
      ['**Téléphone**', 'Mode appareil (F12) et vrais téléphones, dont un petit modèle d\'entrée de gamme.'],
      ['**Vitesse**', 'F12 → onglet **Lighthouse** → analyse **Mobile** : visez un bon score en performance. Images optimisées, peu de bibliothèques lourdes.'],
      ['**Accessibilité**', 'Même rapport Lighthouse, partie **Accessibilité** : contrastes suffisants, textes alternatifs des images, boutons assez grands, navigation possible au clavier.'],
      ['**Textes**', 'Orthographe, ton, montants en F CFA, dates au format JJ/MM/AAAA, aucun texte d\'exemple oublié.'],
      ['**Erreurs**', 'Console sans erreur rouge sur chaque page ; messages d\'erreur compréhensibles pour l\'utilisateur (« Le numéro doit contenir 10 chiffres » plutôt que « Error 422 »).'],
    ], [1.2, 3.8]] },
    { h2: 'Étape 4 : la liste de contrôle avant livraison' },
    { cases: [
      'Aucune clé secrète dans l\'interface ni sur GitHub ; limites de dépenses réglées chez les fournisseurs.',
      'Test des badges réussi pour chaque rôle (module 6).',
      'Chaque saisie est vérifiée côté serveur.',
      'Revue de sécurité refaite après corrections : plus de problème grave.',
      'Page « Confidentialité » en ligne ; formalités ARTCI vérifiées si des données personnelles sont collectées.',
      'Rapport Lighthouse mobile correct ; testé sur trois téléphones.',
      'Sauvegarde des données prévue (export régulier de la base, ou sauvegarde du service).',
      'Comptes administrateurs : au moins deux, avec double authentification.',
    ] },
  ],

  pieges: {
    lignes: [
      ['🔑 Donner une clé secrète à l\'IA « pour que ça marche »', 'Elle peut l\'écrire dans le code de l\'interface.', 'Demander explicitement une fonction serveur et des variables d\'environnement.'],
      ['🙈 Croire que ce qui n\'est pas affiché est caché', 'Tout le code de l\'interface est lisible avec F12.', 'Les secrets et les règles dans l\'arrière-boutique.'],
      ['📦 Accepter n\'importe quelle bibliothèque proposée', 'Bibliothèque inconnue, obsolète ou piégée.', 'Vérifier son nom, sa popularité, sa date de mise à jour.'],
      ['🗃️ Collecter « au cas où »', 'Plus de données = plus de risques et d\'obligations.', 'Le strict nécessaire.'],
      ['💳 Pas de limite de dépenses', 'Une fuite ou un bug coûte des centaines de milliers de francs.', 'Plafonds et alertes chez chaque fournisseur.'],
    ],
    questions: [
      ['Mon application est petite. Qui voudrait l\'attaquer ?', 'Personne en particulier : des **robots** parcourent Internet en permanence à la recherche de clés exposées et de failles connues, sur toutes les applications, petites ou grandes. La taille ne protège pas.'],
      ['L\'IA dit que l\'application est « sécurisée ». C\'est suffisant ?', 'Non. Demandez-lui de **prouver** : quels tests, quelles règles, quels résultats. Faites vous-même le test des badges et la chasse aux secrets. Pour une application sensible (paiements, santé, nombreuses données), faites appel à un professionnel de la sécurité.'],
    ],
  },

  exercices: {
    echauffe: [
      { h3: 'Exercice 1 : vitrine ou arrière-boutique ?' },
      { tableau: [['Élément', 'Interface (vitrine) ou serveur (arrière-boutique) ?'], [
        ['La couleur des boutons', ''], ['La clé secrète du service de paiement', ''], ['La vérification que le montant est un nombre positif', ''],
        ['La clé publique du service de données, avec RLS', ''], ['Le calcul du total facturé au client', ''],
      ], [2.6, 2.4], C.bleu] },
    ],
    entraine: [
      { h3: 'Exercice 2 : la chasse aux secrets' },
      'Appliquez l\'étape 1 à votre projet. Notez chaque secret trouvé, où il était, et ce que vous avez fait.',
    ],
    lance: [
      { h3: 'Exercice 3 : la revue complète' },
      'Faites la revue de sécurité par l\'IA, corrigez les problèmes, passez Lighthouse, et cochez toute la liste de contrôle avant livraison. Rédigez la page « Confidentialité » de votre application.',
    ],
  },

  cas: [
    { h2: 'Après la facture' },
    'Reprenez la situation de Yao : clé secrète d\'un service d\'IA dans le code de l\'interface, 680 dollars consommés en une nuit.',
    { etapes: [
      'Que doit faire Yao **dans l\'heure** ?',
      'Comment corriger durablement l\'application ?',
      'Que peut-il demander au fournisseur ?',
      'Quelles règles ajoute-t-il dans les instructions permanentes de tous ses projets ?',
    ] },
  ],

  retiens: [
    'Tout le code de l\'interface est **lisible** : les clés secrètes vont dans l\'**arrière-boutique** (fonctions serveur, variables d\'environnement).',
    'Les failles fréquentes : **accès**, **secrets**, **saisies non vérifiées**, **bibliothèques** obsolètes ou inventées.',
    '**Limites de dépenses** et alertes chez chaque fournisseur.',
    'Données personnelles : le **nécessaire**, une page **Confidentialité**, les droits des personnes, la **loi n° 2013-450** et l\'**ARTCI**.',
    'Qualité : téléphone, **Lighthouse** (vitesse, accessibilité), textes, messages d\'erreur clairs.',
    'La **revue de sécurité** et la **liste de contrôle** avant chaque livraison.',
  ],
  defi: [
    'Cette semaine, faites la chasse aux secrets et la revue de sécurité de **tous** vos projets en ligne, même les petits essais. Changez toute clé qui a été exposée, même un instant.',
  ],
  motDeLaFin: 'Yao a changé sa clé dans l\'heure, écrit au fournisseur pour expliquer l\'abus, et obtenu un geste commercial sur une partie de la facture. Puis il a ajouté une ligne dans les instructions permanentes de tous ses projets : « Aucune clé secrète dans l\'interface. Jamais. Même pour un essai. » Il ne l\'a plus jamais enlevée.',
  quiz: [
    'Une clé secrète de paiement peut être placée… **a)** dans le code de l\'interface · **b)** uniquement côté serveur, dans les variables d\'environnement · **c)** dans le README.',
    'L\'OWASP Top 10 est… **a)** une liste des failles les plus fréquentes des applications web · **b)** un classement de téléphones · **c)** un hébergeur.',
    'Pour vérifier la vitesse et l\'accessibilité d\'une page, j\'utilise… **a)** Lighthouse dans les outils de développement · **b)** la Corbeille · **c)** WhatsApp.',
    'En matière de données personnelles, la bonne règle est… **a)** tout collecter au cas où · **b)** collecter le strict nécessaire et informer les utilisateurs · **c)** ne rien dire.',
  ],
  corriges: [
    ['Exercice 1', 'Couleur : interface · Clé secrète : serveur · Vérification du montant : serveur (et aussi dans l\'interface pour le confort, mais la vraie protection est côté serveur) · Clé publique avec RLS : interface possible · Calcul du total facturé : serveur.'],
    ['Cas pratique', '**1.** Révoquer et remplacer immédiatement la clé chez le fournisseur ; fixer une limite de dépenses ; vérifier qu\'il n\'y a pas d\'autres clés exposées. **2.** Déplacer l\'appel au service d\'IA dans une fonction serveur, mettre la nouvelle clé dans les variables d\'environnement de l\'hébergeur, vérifier avec F12 qu\'aucune clé n\'apparaît, refaire une revue de sécurité. **3.** Expliquer l\'abus et demander un geste commercial (certains fournisseurs l\'accordent, sans garantie). **4.** « Aucune clé secrète dans l\'interface ; tout appel à un service payant passe par une fonction serveur ; présenter un plan avant d\'ajouter une clé ou une bibliothèque. »'],
    ['Mini-quiz', '1-b · 2-a · 3-a · 4-b'],
  ],
  glossaire: [
    ['Clé secrète', 'Un code qui donne accès à un service payant ou sensible ; elle ne doit jamais être visible.'],
    ['Fonction serveur', 'Un petit programme exécuté côté serveur, qui peut utiliser des secrets sans les exposer.'],
    ['OWASP Top 10', 'La liste de référence des failles de sécurité les plus fréquentes des applications web.'],
    ['Validation des saisies', 'La vérification de ce que l\'utilisateur envoie : type, longueur, format.'],
    ['Lighthouse', 'L\'outil intégré à Chrome qui évalue la performance, l\'accessibilité et les bonnes pratiques d\'une page.'],
    ['Accessibilité', 'Le fait qu\'une application soit utilisable par tous, y compris les personnes malvoyantes ou ayant d\'autres handicaps.'],
    ['Limite de dépenses', 'Un plafond fixé chez un fournisseur pour éviter les factures surprises.'],
  ],
};
