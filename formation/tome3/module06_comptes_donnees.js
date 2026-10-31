// Tome 3 · Module 6 : Une vraie application avec comptes et données
const { C } = require('../outils/livre');

module.exports = {
  num: 6,
  titre: 'Une vraie application avec comptes et données',
  sousTitre: 'La tontine : chaque membre se connecte et voit ses versements',
  objectifs: [
    'ajouter une **base de données** et l\'**authentification** à une application ;',
    'définir des **rôles** (administratrice, membre) et leurs **droits** ;',
    'faire respecter la règle « chacun ne voit que ses données » ;',
    'construire les écrans de **saisie**, de **liste** et de **tableau de bord** ;',
    'tester avec **plusieurs comptes** et des **données réalistes**.',
  ],
  duree: 'Huit heures, en trois séances', materiel: 'Votre constructeur d\'applications, avec sa base de données intégrée ou un compte Supabase ou Firebase', prerequis: 'Modules 1 à 5',

  situation: [
    { h2: 'La tontine sur le téléphone' },
    'Tantie Akissi a adoré le classeur Excel du Tome 2. Mais les membres veulent voir leur situation **elles-mêmes**, sur leur téléphone, sans appeler la trésorière. Et Tantie Akissi veut saisir un versement depuis le marché, en dix secondes, sans ordinateur.',
    { d: ['Tantie Akissi', 'Mais attention, hein : Bintou ne doit pas voir ce que Adjoua a payé. Chacune son affaire.'] },
    { d: ['M. Kouassi', 'C\'est la règle la plus importante de toute l\'application, Tantie. Votre fils Yao va devoir la vérifier lui-même, pas seulement faire confiance à l\'IA.'] },
  ],

  declic: [
    { h2: 'Le registre et les badges' },
    'Une application avec des comptes, c\'est un bureau avec un **registre** (la base de données) et des **badges** (les comptes). À l\'entrée, on vérifie le badge : c\'est l\'**authentification** (« qui êtes-vous ? »). Ensuite, le badge ouvre certaines portes et pas d\'autres : ce sont les **autorisations** (« qu\'avez-vous le droit de faire ? »).',
    { tableau: [['Rôle', 'Badge', 'Il peut…', 'Il ne peut pas…'], [
      ['**Trésorière**', 'Badge doré', 'Voir tous les versements, en ajouter, gérer les membres', 'Supprimer l\'historique sans trace'],
      ['**Membre**', 'Badge simple', 'Voir **ses** versements, sa date de passage', 'Voir les versements des autres, modifier quoi que ce soit'],
      ['**Visiteur**', 'Pas de badge', 'Voir la page de connexion', 'Voir la moindre donnée'],
    ], [1, 1, 1.8, 1.8]] },
    { encadre: { titre: '🔑  La règle doit être dans l\'arrière-boutique, pas dans la vitrine', style: 'rouge', contenu: [
      'Cacher un bouton dans l\'interface ne protège rien : quelqu\'un d\'un peu malin peut demander directement les données au serveur. La règle « chacune ne voit que ses versements » doit être appliquée **dans la base de données elle-même**. Avec Supabase, cela s\'appelle la **sécurité au niveau des lignes** (Row Level Security, ou RLS). Exigez-la, et vérifiez-la.',
    ] } },
    { h3: 'Les tables de la tontine' },
    { tableau: [['Table', 'Colonnes principales', 'Relation'], [
      ['**profils**', 'id, nom, téléphone, rôle (trésorière ou membre), rang de passage, active', 'Liée au compte de connexion'],
      ['**versements**', 'id, membre (profil), semaine, montant, date, moyen (espèces, Mobile Money), saisi par', 'Chaque versement appartient à une membre'],
      ['**semaines**', 'numéro, date, bénéficiaire (profil), remise faite (oui/non)', 'Chaque semaine a une bénéficiaire'],
    ], [1, 2.8, 1.4], C.vert] },
  ],

  pasAPas: [
    { h2: 'Étape 1 : choisir le mode de connexion' },
    { tableau: [['Mode', 'Avantages', 'Limites'], [
      ['**E-mail et mot de passe**', 'Simple, classique, gratuit', 'Beaucoup de membres n\'utilisent pas d\'e-mail'],
      ['**Lien magique par e-mail**', 'Pas de mot de passe à retenir', 'Demande aussi un e-mail'],
      ['**Numéro de téléphone avec code SMS**', 'Adapté à nos réalités : tout le monde a un numéro', 'Les SMS ont un coût, à vérifier selon le service'],
      ['**Compte Google**', 'Un clic', 'Toutes les membres n\'en ont pas'],
    ], [1.6, 1.7, 1.7]] },
    'Pour la tontine, discutez-en avec Tantie Akissi. Une solution réaliste pour la première version : la trésorière crée les comptes, chaque membre se connecte avec son numéro et un code.',
    { h2: 'Étape 2 : le prompt de construction' },
    { encadre: { titre: '✍️  Prompt (en mode plan d\'abord)', style: 'bleu', contenu: [
      'Ajoute une base de données et l\'authentification à l\'application de la tontine. Ne code rien pour l\'instant : présente-moi le plan.',
      '**Tables** : profils (nom, téléphone, rôle « tresoriere » ou « membre », rang de passage, active), versements (membre, numéro de semaine, montant, date, moyen, saisi_par), semaines (numéro, date, bénéficiaire, remise_faite).',
      '**Règles d\'accès dans la base (RLS)** : une membre ne peut lire que son propre profil et ses propres versements, et ne peut rien modifier. La trésorière peut tout lire, ajouter et modifier, mais pas supprimer un versement : elle peut seulement l\'annuler avec un motif.',
      '**Écrans** : connexion ; pour la trésorière : tableau de bord (total de la semaine, retards en rouge), saisie rapide d\'un versement, liste des membres ; pour la membre : « Ma situation » (total versé, retards éventuels, date de mon passage).',
      '**Règles** : cotisation 10 000 F par semaine ; une membre est « en retard » si aucun versement pour la semaine en cours le dimanche à 23 h 59.',
      'Explique-moi comment je pourrai **vérifier** moi-même que les règles d\'accès fonctionnent.',
    ] } },
    { etapes: [
      'Lisez le plan. Posez vos questions. Validez.',
      'Laissez l\'IA créer les tables et les règles. Selon l\'outil, il faudra peut-être **connecter** un projet Supabase ou Firebase (l\'outil vous guide), ou activer la base de données intégrée.',
      'Construisez ensuite **un écran à la fois** : connexion, puis saisie, puis tableau de bord, puis « Ma situation ».',
    ] },
    { h2: 'Étape 3 : les données de test' },
    'Demandez : « Crée des données de test réalistes : une trésorière, huit membres avec des noms ivoiriens, dix semaines de versements, avec deux membres en retard et une qui a payé deux semaines d\'un coup. » Des données réalistes révèlent les problèmes que des données parfaites cachent.',
    { h2: 'Étape 4 : le test des badges' },
    'C\'est le test le plus important du module. Ne le sautez jamais.',
    { cases: [
      'Je me connecte comme **trésorière** : je vois tout, je peux saisir un versement.',
      'Je me connecte comme **Bintou** (dans une fenêtre de navigation privée) : je ne vois que ses versements.',
      'Comme Bintou, j\'essaie d\'ouvrir directement l\'adresse de la page de la trésorière : je suis refusée ou redirigée.',
      'Je demande à l\'IA : « Écris un test qui vérifie qu\'une membre ne peut pas lire les versements d\'une autre membre, et montre-moi le résultat. »',
      'Déconnectée, je ne vois aucune donnée.',
      'Une membre désactivée ne peut plus se connecter.',
    ] },
    { img: 'tontine_app', illus: 'Deux téléphones côte à côte : à gauche, le tableau de bord de la trésorière (total collecté, liste des membres avec badges verts et rouges, bouton « + Versement ») ; à droite, l\'écran « Ma situation » de Bintou (total versé, prochaine échéance, date de passage).' },
    { h2: 'Étape 5 : simple et rapide pour la vraie vie' },
    { puces: [
      'Saisie d\'un versement en **trois touches** : choisir la membre (recherche par nom), montant prérempli à 10 000, Enregistrer.',
      'Gros boutons, textes courts, chiffres lisibles : **10 000 F**, pas « 10000.00 XOF ».',
      'Un message clair après chaque action : « Versement de Bintou enregistré pour la semaine 12. »',
      'Ajoutez l\'application à l\'**écran d\'accueil** du téléphone (menu du navigateur → **Ajouter à l\'écran d\'accueil**) : elle s\'ouvre comme une application.',
    ] },
  ],

  pieges: {
    lignes: [
      ['🙈 Cacher les données dans l\'interface au lieu de les protéger dans la base', 'N\'importe qui d\'un peu malin peut les lire.', 'Règles d\'accès dans la base (RLS), et test des badges.'],
      ['🗑️ Permettre de supprimer un versement', 'Fraude possible, disputes sans preuve.', 'Annulation avec motif, historique conservé.'],
      ['🧪 Tester avec un seul compte', 'On ne voit pas les fuites entre comptes.', 'Au moins trois comptes de rôles différents.'],
      ['🧑‍🤝‍🧑 Mettre les vraies données des membres dans l\'outil de test', 'Données personnelles exposées pendant le développement.', 'Des données fictives tant que l\'application n\'est pas validée.'],
      ['📵 Oublier les petits téléphones et les connexions lentes', 'Les membres abandonnent l\'application.', 'Tester sur un téléphone d\'entrée de gamme, en 3G.'],
    ],
    questions: [
      ['Où sont stockées les données ? C\'est sûr ?', 'Dans la base de données du service utilisé (Supabase, Firebase, ou celle intégrée à votre outil), sur des serveurs souvent situés hors d\'Afrique. Ces services sont sérieux, mais la sécurité dépend surtout de **vos** réglages : règles d\'accès, mots de passe, clés secrètes (module 10). Pour des données personnelles, renseignez-vous aussi sur les obligations prévues par la loi n° 2013-450.'],
      ['Et si Tantie Akissi oublie son mot de passe ?', 'Prévoyez dès le départ une procédure de récupération (lien par e-mail, ou code par SMS), et **deux** comptes trésorière : Tantie Akissi et une adjointe de confiance. Une application qui dépend d\'une seule personne est fragile.'],
    ],
  },

  exercices: {
    echauffe: [
      { h3: 'Exercice 1 : authentification ou autorisation ?' },
      { tableau: [['Situation', 'Authentification ou autorisation ?'], [
        ['Bintou tape son numéro et le code reçu', ''], ['Bintou ne voit pas les versements d\'Adjoua', ''],
        ['La trésorière peut ajouter un versement', ''], ['Un visiteur est renvoyé vers la page de connexion', ''],
      ], [3, 2], C.bleu] },
    ],
    entraine: [
      { h3: 'Exercice 2 : la tontine en ligne' },
      'Construisez l\'application de la tontine en suivant les cinq étapes, avec des données de test. Réussissez les six vérifications du test des badges.',
    ],
    lance: [
      { h3: 'Exercice 3 : mon projet avec des comptes' },
      'Ajoutez à votre projet personnel une base de données et des comptes, avec au moins deux rôles. Rédigez vous-même la liste des vérifications du test des badges adaptée à votre projet, et passez-la.',
    ],
  },

  cas: [
    { h2: 'L\'audit de Koffi' },
    'Koffi teste l\'application de la tontine avec le compte de Bintou. Dans l\'onglet **Réseau** des outils de développement (F12), il voit passer la liste complète des versements de **toutes** les membres, même si l\'écran n\'affiche que ceux de Bintou.',
    { etapes: [
      'Quel est le problème exactement ? Pourquoi est-il grave ?',
      'Où la règle d\'accès doit-elle être appliquée ?',
      'Rédigez la demande à envoyer à l\'IA pour corriger.',
      'Comment vérifier que la correction fonctionne ?',
    ] },
  ],

  retiens: [
    '**Authentification** = qui êtes-vous ? **Autorisation** = qu\'avez-vous le droit de faire ?',
    'Des **rôles** clairs : chacun ses droits.',
    'La règle « chacun ses données » se protège **dans la base** (RLS), pas en cachant des boutons.',
    'On **annule avec motif**, on ne supprime pas les données importantes.',
    'Données de test **réalistes**, et le **test des badges** avec plusieurs comptes, en navigation privée.',
    'Simple et rapide pour la vraie vie : trois touches, gros boutons, petits téléphones.',
  ],
  defi: [
    'Cette semaine, faites tester votre application avec comptes par trois personnes, chacune avec un rôle. Demandez à l\'une d\'elles d\'essayer volontairement de voir ce qu\'elle ne devrait pas voir.',
  ],
  motDeLaFin: 'Un dimanche soir, Bintou a ouvert l\'application, vu « Semaine 12 : payé » en vert, et envoyé un message vocal à Tantie Akissi : « Ma sœur, c\'est la première fois que la tontine me donne la paix ! » Tantie Akissi l\'a fait écouter à Yao trois fois.',
  quiz: [
    'Vérifier l\'identité d\'un utilisateur, c\'est… **a)** l\'authentification · **b)** l\'autorisation · **c)** l\'hébergement.',
    'La règle « chaque membre ne voit que ses versements » doit être appliquée… **a)** en cachant les boutons · **b)** dans la base de données · **c)** dans le logo.',
    'Pour tester les droits, j\'utilise… **a)** un seul compte · **b)** plusieurs comptes de rôles différents, en navigation privée · **c)** le compte de la trésorière seulement.',
    'Un versement saisi par erreur doit être… **a)** supprimé sans trace · **b)** annulé avec un motif, l\'historique étant conservé · **c)** ignoré.',
  ],
  corriges: [
    ['Exercice 1', 'Authentification · Autorisation · Autorisation · Authentification (pas connecté) et autorisation (pas d\'accès).'],
    ['Cas pratique', '**1.** L\'application télécharge toutes les données et se contente de filtrer l\'affichage : n\'importe quelle membre peut lire les versements des autres. C\'est une fuite de données personnelles. **2.** Dans la base de données, par des règles d\'accès au niveau des lignes (RLS). **3.** « Faille de sécurité : avec le compte d\'une membre, l\'onglet Réseau montre les versements de toutes les membres. Active la sécurité au niveau des lignes sur la table versements : une membre ne peut lire que les lignes où membre = son identifiant ; la trésorière peut tout lire. Modifie la requête de l\'écran Ma situation pour ne demander que ses versements. Montre-moi les règles créées. » **4.** Refaire le test avec le compte de Bintou et l\'onglet Réseau ; demander un test automatique ; essayer avec deux autres comptes.'],
    ['Mini-quiz', '1-a · 2-b · 3-b · 4-b'],
  ],
  glossaire: [
    ['Autorisation', 'Les droits d\'un utilisateur une fois connecté : ce qu\'il peut voir et faire.'],
    ['Rôle', 'Une catégorie d\'utilisateurs ayant les mêmes droits : administrateur, membre…'],
    ['RLS (sécurité au niveau des lignes)', 'Des règles dans la base de données qui limitent les lignes qu\'un utilisateur peut lire ou modifier.'],
    ['Supabase', 'Un service qui fournit base de données, authentification et stockage de fichiers, souvent utilisé par les outils de vibe coding.'],
    ['Données de test', 'Des données fictives mais réalistes, utilisées pendant la construction.'],
    ['Navigation privée', 'Un mode du navigateur sans mémoire de connexion, utile pour tester un autre compte.'],
  ],
};
