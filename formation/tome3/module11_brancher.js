// Tome 3 · Module 11 : Brancher son application au monde
const { C } = require('../outils/livre');

module.exports = {
  num: 11,
  titre: 'Brancher son application au monde',
  sousTitre: 'Le maquis qui accepte Wave, Orange Money, MTN MoMo et Moov Money',
  objectifs: [
    'comprendre comment une application parle à d\'autres services par **API** ;',
    'intégrer un **paiement Mobile Money** par un agrégateur de paiement ;',
    'comprendre les **webhooks** : être prévenu quand un paiement est confirmé ;',
    'envoyer des **e-mails** et des **messages** automatiques ;',
    'ajouter une fonction d\'**intelligence artificielle** dans son application.',
  ],
  duree: 'Six heures', materiel: 'Votre projet en ligne, un compte de test chez un agrégateur de paiement', prerequis: 'Modules 1 à 10',

  situation: [
    { h2: 'Le rendez-vous non honoré' },
    'Chez Koffi Services, un client sur quatre réserve un rendez-vous… et ne vient pas. Le créneau est perdu. Koffi voudrait demander un **acompte de 1 000 F** à la réservation, payable par Mobile Money, et que le client reçoive automatiquement une confirmation, puis un rappel la veille.',
    { d: ['Koffi', 'Au maquis d\'à côté, on peut payer avec n\'importe quel opérateur. Pourquoi pas sur mon application ?'] },
    { d: ['M. Kouassi', 'Le maquis n\'a pas signé avec chaque opérateur, Koffi : il passe par un intermédiaire qui les accepte tous. Ton application fera pareil. Mais l\'argent, c\'est sérieux : on va le faire avec méthode.'] },
  ],

  declic: [
    { h2: 'L\'API, c\'est le serveur du maquis' },
    'Au maquis, vous ne rentrez pas dans la cuisine. Vous donnez votre commande au **serveur**, dans un format convenu (« deux garbas, un alloco »), il la transmet à la cuisine, et vous rapporte le plat. Une **API** fait la même chose entre deux programmes : votre application envoie une demande dans un format convenu (« crée un paiement de 1 000 F pour ce client »), le service la traite et renvoie une réponse.',
    { h2: 'L\'agrégateur de paiement' },
    'Signer un contrat avec chaque opérateur Mobile Money serait long et compliqué. Un **agrégateur de paiement** (en Afrique de l\'Ouest, par exemple CinetPay, PayDunya, FedaPay, Paystack…) le fait pour vous : avec **une seule** intégration, vos clients paient par Orange Money, MTN MoMo, Moov Money, Wave ou carte bancaire, selon les moyens proposés par l\'agrégateur. Il prend une **commission** par transaction et vous reverse le reste.',
    { encadre: { titre: '⚠️  À vérifier avant de choisir', style: 'rouge', contenu: [
      'Les moyens de paiement acceptés, les **frais**, le délai de **reversement**, les **documents** demandés pour ouvrir un compte marchand (souvent ceux d\'une entreprise déclarée), et la qualité de la **documentation** technique. Ces éléments changent : comparez sur les sites officiels au moment de votre projet.',
    ] } },
    { h2: 'Le webhook : le coup de fil de confirmation' },
    'Quand le client paie sur son téléphone, votre application ne le sait pas tout de suite. C\'est l\'agrégateur qui **appelle** votre application pour la prévenir : « Le paiement n° 123 est confirmé. » Cet appel automatique s\'appelle un **webhook**. C\'est **lui**, et seulement lui, qui doit faire passer la réservation en « payée », après vérification.',
    { tableau: [['Étape', 'Qui fait quoi'], [
      ['1', 'Le client choisit son créneau et clique sur « Payer l\'acompte ».'],
      ['2', 'Votre **serveur** demande à l\'agrégateur de créer un paiement (avec la clé secrète, côté serveur).'],
      ['3', 'Le client est envoyé sur la page de paiement de l\'agrégateur et valide sur son téléphone.'],
      ['4', 'L\'agrégateur appelle votre **webhook** : paiement confirmé ou refusé.'],
      ['5', 'Votre serveur **vérifie** l\'authenticité de l\'appel et le montant, puis marque la réservation « payée ».'],
      ['6', 'L\'application envoie la confirmation au client.'],
    ], [0.6, 4.4], C.violet] },
  ],

  pasAPas: [
    { h2: 'Étape 1 : le paiement en mode test' },
    { etapes: [
      'Créez un compte chez l\'agrégateur choisi et activez le **mode test** (ou « sandbox ») : de faux paiements, pour essayer sans argent réel.',
      'Récupérez les **clés de test** et placez-les dans les **variables d\'environnement** (jamais dans le code de l\'interface : module 10).',
      'Donnez à l\'IA la **documentation officielle** de l\'agrégateur (lien ou extrait) : elle travaillera beaucoup mieux qu\'en devinant.',
    ] },
    { encadre: { titre: '✍️  Prompt (mode plan d\'abord)', style: 'bleu', contenu: [
      '« Intègre le paiement d\'un acompte de 1 000 F CFA avec [nom de l\'agrégateur], dont voici la documentation : [lien]. Utilise les clés de test des variables d\'environnement [NOMS DES VARIABLES]. La création du paiement et la réception du webhook doivent se faire dans des fonctions serveur. Le webhook doit vérifier l\'authenticité de l\'appel selon la documentation, vérifier le montant, et seulement ensuite passer la réservation en « payée ». Une réservation non payée sous 30 minutes est libérée. Présente-moi d\'abord le plan et les cas d\'échec que tu vas gérer. »',
    ] } },
    { h2: 'Étape 2 : tester tous les cas' },
    { cases: [
      'Paiement réussi : la réservation passe en « payée », le client reçoit la confirmation.',
      'Paiement refusé ou annulé : la réservation reste en attente, puis est libérée.',
      'Le client ferme la page avant de payer : rien n\'est marqué payé.',
      'Le webhook arrive deux fois : la réservation n\'est pas comptée deux fois.',
      'Un faux appel au webhook (envoyé par quelqu\'un d\'autre que l\'agrégateur) est refusé.',
      'Les montants affichés, payés et enregistrés sont identiques.',
    ] },
    'Ce n\'est qu\'après ces tests, et un petit paiement réel de vérification, qu\'on passe aux **clés de production**.',
    { h2: 'Étape 3 : e-mails et messages automatiques' },
    { tableau: [['Canal', 'Comment', 'À savoir'], [
      ['**E-mail**', 'Un service d\'envoi d\'e-mails transactionnels (Resend, Brevo, SendGrid…), appelé depuis une fonction serveur', 'Configurer son nom de domaine pour que les e-mails n\'arrivent pas en spam'],
      ['**SMS**', 'Un fournisseur de SMS (dont certains agrégateurs africains)', 'Coût par message : prévoir un budget'],
      ['**WhatsApp**', 'Simple : un lien wa.me prérempli (module 5). Automatique : l\'**API WhatsApp Business** de Meta, via un fournisseur', 'L\'API demande une validation, des modèles de messages approuvés, et elle est payante selon les conversations'],
    ], [1, 2.4, 2.2]] },
    'Pour le rappel « la veille », il faut une **tâche programmée** (on dit aussi « cron ») : une fonction serveur qui s\'exécute chaque jour à 18 h et envoie les rappels du lendemain. Demandez-la à l\'IA en précisant le fuseau horaire : **Africa/Abidjan**.',
    { h2: 'Étape 4 : ajouter de l\'IA dans son application' },
    'Exemple : Tantie Akissi voudrait un bouton « Rédiger la description » qui propose un texte pour chaque nouveau pagne.',
    { etapes: [
      'Créez une clé chez un fournisseur d\'IA (Anthropic, OpenAI, Google…) ; certains outils de vibe coding proposent aussi l\'IA intégrée.',
      'Fixez une **limite de dépenses**.',
      'Demandez à l\'IA de votre outil : « Ajoute un bouton “Rédiger la description” qui envoie le nom, la catégorie et la couleur du pagne à une fonction serveur, laquelle appelle l\'API d\'IA avec la clé des variables d\'environnement et renvoie une description de 25 mots, ton chaleureux. La trésorière doit pouvoir modifier le texte avant de l\'enregistrer. »',
      'Testez, puis limitez l\'usage (par exemple dix descriptions par jour) pour maîtriser les coûts.',
    ] },
  ],

  pieges: {
    lignes: [
      ['✅ Marquer « payé » dès que le client revient sur l\'application', 'Le client peut revenir sans avoir payé.', 'Seul le webhook vérifié fait foi.'],
      ['🔑 Clés de paiement dans l\'interface', 'Vol, fraude, transactions frauduleuses.', 'Fonctions serveur et variables d\'environnement.'],
      ['🧪 Passer en production sans tester les cas d\'échec', 'Réservations payées non enregistrées, clients furieux.', 'La liste des six tests, en mode test.'],
      ['💸 Oublier les commissions et coûts des messages', 'La marge disparaît.', 'Les inclure dans le prix ou dans l\'acompte.'],
      ['📵 Envoyer des messages non sollicités', 'Clients agacés, compte bloqué par les plateformes.', 'Seulement des messages utiles, avec l\'accord du client.'],
    ],
    questions: [
      ['Faut-il une entreprise déclarée pour encaisser en ligne ?', 'La plupart des agrégateurs demandent des documents d\'entreprise pour ouvrir un compte marchand en production. Renseignez-vous sur leurs conditions ; pour un client, c\'est en général **son** entreprise qui ouvre le compte, pas vous.'],
      ['Et la loi ?', 'Les transactions électroniques sont encadrées en Côte d\'Ivoire, notamment par la loi n° 2013-546 relative aux transactions électroniques. Affichez clairement les prix, les conditions (acompte remboursable ou non) et l\'identité du vendeur.'],
    ],
  },

  exercices: {
    echauffe: [
      { h3: 'Exercice 1 : remettre le paiement dans l\'ordre' },
      'Remettez dans l\'ordre : « Le webhook confirme le paiement » · « Le client valide sur son téléphone » · « Le serveur crée le paiement chez l\'agrégateur » · « La réservation passe en payée » · « Le client clique sur Payer ».',
      { lignes: ['1. ', '2. ', '3. ', '4. ', '5. '] },
    ],
    entraine: [
      { h3: 'Exercice 2 : le paiement de test' },
      'Intégrez un paiement en mode test dans votre projet (ou dans une copie de la vitrine de Pagnes Akissi), et passez les six tests de l\'étape 2.',
    ],
    lance: [
      { h3: 'Exercice 3 : le rappel automatique' },
      'Ajoutez à votre projet un e-mail de confirmation et une tâche programmée qui envoie un rappel la veille, au bon fuseau horaire.',
    ],
  },

  cas: [
    { h2: 'L\'acompte de Koffi' },
    'Koffi lance l\'acompte de 1 000 F. Après une semaine : 85 réservations payées selon l\'agrégateur, mais seulement 79 marquées « payées » dans l\'application. Deux clients se plaignent d\'avoir payé sans recevoir de confirmation.',
    { etapes: [
      'Quelles sont les causes possibles de l\'écart ?',
      'Où regarder pour trouver la cause ?',
      'Que faire immédiatement pour les clients concernés ?',
      'Quelle amélioration durable proposer ?',
    ] },
  ],

  retiens: [
    'Une **API**, c\'est le serveur du maquis : une demande dans un format convenu, une réponse.',
    'Un **agrégateur** de paiement : une intégration pour Mobile Money et cartes, contre une commission.',
    'Le **webhook** vérifié est la **seule** preuve de paiement.',
    '**Mode test** d\'abord, six cas testés, puis production.',
    'Clés en **variables d\'environnement**, appels dans des **fonctions serveur**, **limites de dépenses**.',
    'E-mails, SMS, WhatsApp : utiles, consentis, et dont on connaît le **coût**. Fuseau **Africa/Abidjan**.',
  ],
  defi: [
    'Cette semaine, comparez trois agrégateurs de paiement disponibles en Côte d\'Ivoire : moyens acceptés, frais, documents demandés, délai de reversement. Présentez votre tableau à votre binôme.',
  ],
  motDeLaFin: 'Après l\'acompte, le taux de rendez-vous non honorés de Koffi est passé d\'un sur quatre à un sur vingt. Les clients reçoivent un message la veille : « Bonjour, nous vous attendons demain à 10 h chez Koffi Services. » Un client a répondu : « Même ma banque ne me rappelle pas comme ça ! »',
  quiz: [
    'Un agrégateur de paiement permet… **a)** d\'accepter plusieurs moyens de paiement avec une seule intégration · **b)** d\'héberger le site · **c)** de créer un logo.',
    'La preuve qu\'un paiement est confirmé, c\'est… **a)** le retour du client sur la page · **b)** le webhook vérifié de l\'agrégateur · **c)** un message WhatsApp du client.',
    'Avant la production, on teste en… **a)** mode test (sandbox) · **b)** direct avec de vrais clients · **c)** mode avion.',
    'Pour un rappel la veille à 18 h, on utilise… **a)** une tâche programmée · **b)** la Corbeille · **c)** le README.',
  ],
  corriges: [
    ['Exercice 1', '1. Le client clique sur Payer · 2. Le serveur crée le paiement chez l\'agrégateur · 3. Le client valide sur son téléphone · 4. Le webhook confirme le paiement · 5. La réservation passe en payée.'],
    ['Cas pratique', '**1.** Webhooks non reçus (mauvaise adresse, application indisponible), webhooks rejetés par erreur (vérification mal codée), réservations libérées avant la confirmation (délai de 30 minutes trop court), erreur lors de la mise à jour. **2.** Le tableau de bord de l\'agrégateur (liste des webhooks envoyés et leurs réponses), les journaux des fonctions serveur, la console et l\'onglet Réseau. **3.** Rapprocher les six paiements manquants, confirmer manuellement les réservations ou recontacter les clients, rembourser si le créneau n\'est plus disponible, s\'excuser. **4.** Gérer les webhooks en double et en retard, ne libérer une réservation qu\'après vérification du statut auprès de l\'agrégateur, ajouter un rapprochement automatique quotidien entre l\'agrégateur et la base, et une alerte en cas d\'écart.'],
    ['Mini-quiz', '1-a · 2-b · 3-a · 4-a'],
  ],
  glossaire: [
    ['Agrégateur de paiement', 'Un intermédiaire qui permet d\'accepter plusieurs moyens de paiement avec une seule intégration.'],
    ['Webhook', 'Un appel automatique d\'un service vers votre application pour la prévenir d\'un événement.'],
    ['Mode test (sandbox)', 'Un environnement où l\'on fait de faux paiements pour essayer sans argent réel.'],
    ['Tâche programmée (cron)', 'Une action exécutée automatiquement à une heure fixe.'],
    ['E-mail transactionnel', 'Un e-mail envoyé automatiquement après une action : confirmation, rappel, reçu.'],
    ['API WhatsApp Business', 'L\'interface payante de Meta pour envoyer des messages WhatsApp automatiques.'],
  ],
};
