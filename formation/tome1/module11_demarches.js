// Tome 1 · Module 11 : Mes démarches en ligne
const { C } = require('../outils/livre');

module.exports = {
  num: 11,
  titre: 'Mes démarches en ligne',
  sousTitre: 'Le guichet ouvert jour et nuit, sans file d\'attente',
  objectifs: [
    'trouver la **bonne démarche** et la **bonne information** sur un site officiel ;',
    'créer un **compte** sur un portail et l\'**activer** ;',
    'remplir un **formulaire en ligne** sans erreur et y joindre des documents ;',
    '**payer en ligne** en sécurité et **conserver ses justificatifs** ;',
    'éviter les **faux sites** et les **faux intermédiaires**.',
  ],
  duree: 'Quatre heures', materiel: 'Un ordinateur connecté, votre téléphone, vos documents scannés', prerequis: 'Modules 1 à 10',

  situation: [
    { h2: 'La journée perdue de Koffi' },
    'Pour s\'inscrire à un concours, Koffi a besoin de plusieurs documents. Il a pris un jour de congé, payé deux woro-woro, fait la queue deux heures sous le soleil… pour apprendre au guichet qu\'il manquait une photocopie, et que l\'inscription se faisait de toute façon **en ligne**.',
    'Sur le chemin du retour, un jeune homme l\'aborde : « Grand-frère, moi je connais quelqu\'un dedans. Tu me donnes 100 000 F, je fais ton inscription et ton nom sort sur la liste. »',
    { d: ['Koffi', 'Je perds ma journée et en plus on veut me prendre 100 000 F !'] },
    { d: ['M. Kouassi', 'Koffi, beaucoup de guichets sont maintenant ouverts sur Internet, jour et nuit. Et le premier réflexe, c\'est de passer par les sites officiels, jamais par un « quelqu\'un qui connaît quelqu\'un ».'] },
  ],

  declic: [
    { h2: 'Le guichet virtuel' },
    'Une démarche en ligne, c\'est exactement le guichet de l\'administration, mais sur votre écran :',
    { tableau: [['Au guichet…', 'En ligne…'], [
      ['L\'**annuaire** qui dit à quel guichet aller', 'Le portail **servicepublic.gouv.ci**, qui recense les démarches administratives'],
      ['La **fiche** affichée au mur : pièces à fournir, coût, délai', 'La **fiche de la démarche**, à lire en entier avant de commencer'],
      ['Le **ticket** et le dossier à votre nom', 'Votre **compte** : un identifiant (souvent votre e-mail) et un mot de passe'],
      ['Le **formulaire** papier', 'Le **formulaire en ligne**, avec ses cases à remplir'],
      ['Les **photocopies** agrafées', 'Les **documents scannés** joints au formulaire (PDF, JPG)'],
      ['La **caisse**', 'Le **paiement en ligne** (Mobile Money, carte)'],
      ['Le **reçu tamponné**', 'L\'**accusé de réception**, le reçu de paiement, le numéro de dossier'],
    ], [2, 3]] },
    { h3: 'Le vocabulaire des formulaires' },
    { tableau: [['À l\'écran', 'Ce que c\'est', 'Ce que je fais'], [
      ['**Champ**', 'Une case où l\'on écrit', 'Je clique dedans et je tape'],
      ['**Astérisque \\***', 'Le champ est obligatoire', 'Je ne le laisse jamais vide'],
      ['**Liste déroulante** ▾', 'Une liste de choix', 'Je clique sur la flèche et je choisis'],
      ['**Case à cocher** ☐', 'Un ou plusieurs choix possibles', 'Je clique pour cocher ou décocher'],
      ['**Bouton radio** ◯', 'Un seul choix possible parmi plusieurs', 'Je clique sur le bon rond'],
      ['**Parcourir** / **Joindre**', 'Le bouton pour ajouter un document', 'Je vais chercher le fichier dans mes dossiers'],
      ['**Captcha**', 'Un petit test « Je ne suis pas un robot »', 'Je coche, ou je recopie les lettres affichées'],
    ], [1.3, 1.9, 1.9]] },
  ],

  pasAPas: [
    { h2: 'Étape 1 : trouver la démarche et lire la fiche' },
    { etapes: [
      'Ouvrez le navigateur et tapez vous-même **servicepublic.gouv.ci** dans la barre d\'adresse.',
      'Utilisez la **recherche** du site, par exemple : « casier judiciaire », « passeport », « déclaration de naissance ».',
      'Ouvrez la fiche et notez : les **pièces à fournir**, le **coût**, le **délai**, et s\'il existe un **service en ligne** (un bouton du type « Accéder au service en ligne »).',
      'Si la démarche est en ligne, suivez le lien depuis la fiche officielle : vous êtes sûr d\'arriver sur le bon site.',
    ] },
    { encadre: { titre: '📞  Besoin d\'aide ?', style: 'bleu', contenu: [
      'Le Centre d\'information et de communication gouvernementale répond gratuitement aux questions sur les démarches au **101**. Vérifiez les coordonnées à jour sur le portail officiel.',
    ] } },
    { h2: 'Étape 2 : préparer ses documents AVANT de commencer' },
    'Beaucoup de formulaires se ferment au bout de quelques minutes d\'inactivité : préparez tout avant.',
    { cases: [
      'Mes pièces scannées en **PDF** (module 9), lisibles, bien nommées, rangées dans un dossier de la démarche (module 4).',
      'Ma **photo d\'identité numérique** (fichier JPG), si elle est demandée, au format indiqué.',
      'Mes informations exactes, **écrites comme sur ma pièce d\'identité** : noms, prénoms, date et lieu de naissance.',
      'Mon adresse e-mail et mon téléphone, à portée de main pour recevoir les codes.',
    ] },
    { h2: 'Étape 3 : créer son compte et l\'activer' },
    { etapes: [
      'Cliquez sur **Créer un compte** (ou **S\'inscrire**).',
      'Remplissez les champs. Comme identifiant, on utilise souvent votre **adresse e-mail**. Choisissez un **mot de passe solide** (module 10).',
      'Le site vous envoie un **e-mail de confirmation** : ouvrez votre boîte, cliquez sur le **lien d\'activation**. Pas de message ? Regardez dans les **Spams**.',
    ] },
    { h2: 'Étape 4 : remplir le formulaire' },
    { etapes: [
      'Remplissez les champs **un par un**, en passant au suivant avec **Tab**.',
      'Les dates s\'écrivent souvent au format **JJ/MM/AAAA** : 05/03/1998 pour le 5 mars 1998.',
      'Pour joindre un document : **Parcourir** → allez dans le dossier de la démarche → double-cliquez sur le fichier.',
      'Avant de valider, **relisez tout** : une erreur dans le nom peut tout bloquer.',
      'Cliquez sur **Valider** ou **Soumettre**, une seule fois, et patientez.',
    ] },
    { h2: 'Étape 5 : payer en sécurité' },
    { puces: [
      'Vérifiez que vous êtes toujours sur le **site officiel** (adresse, cadenas) avant de payer.',
      'Le paiement Mobile Money se termine **sur votre téléphone** : vous confirmez avec votre code secret **dans le menu de votre opérateur**, jamais en le donnant à quelqu\'un.',
      'Gardez le **SMS de confirmation** de paiement.',
    ] },
    { h2: 'Étape 6 : garder les preuves' },
    { tableau: [['Je veux garder…', 'Je fais…'], [
      ['La page de confirmation entière, en PDF', '**Ctrl + P** → imprimante **Microsoft Print to PDF** (ou **Enregistrer au format PDF**) → **Imprimer** → je choisis le dossier de la démarche et un nom clair.'],
      ['Une partie de l\'écran', '**Windows + Maj + S**, je sélectionne la zone, puis je colle l\'image dans un document ou je l\'enregistre.'],
      ['Le reçu envoyé par e-mail', 'Je le garde dans ma boîte, avec un libellé « Démarches », et j\'enregistre la pièce jointe dans le dossier.'],
    ], [1.6, 3.4]] },
    { illus: 'Capture d\'écran : la fenêtre d\'impression du navigateur avec l\'imprimante « Microsoft Print to PDF » sélectionnée, l\'aperçu d\'un accusé de réception à droite et le bouton Imprimer.' },
  ],

  pieges: {
    lignes: [
      ['🕵️ Passer par un intermédiaire « qui connaît quelqu\'un »', 'Argent perdu, dossier jamais déposé, et parfois vos données volées.', 'Faire soi-même, sur le site officiel. Se faire aider par un proche de confiance.'],
      ['🔎 Cliquer sur le premier résultat de recherche', 'Ce peut être un faux site qui imite le vrai, ou une publicité.', 'Passer par servicepublic.gouv.ci ou taper l\'adresse officielle.'],
      ['📱 Payer des « frais » sur un numéro Mobile Money personnel', 'Une administration n\'encaisse pas sur le numéro d\'un particulier.', 'Payer uniquement par le module de paiement du site officiel.'],
      ['✍️ Écrire son nom différemment de la pièce d\'identité', 'Le dossier peut être rejeté.', 'Recopier exactement, lettre par lettre.'],
      ['🗑️ Ne garder aucune preuve', 'Impossible de réclamer en cas de problème.', 'PDF de la confirmation, SMS de paiement, numéro de dossier.'],
    ],
    questions: [
      ['Le site me déconnecte avant que j\'aie fini. Pourquoi ?', 'Par sécurité, beaucoup de sites ferment la session après quelques minutes d\'inactivité. Préparez tous vos documents avant de commencer, et ne vous absentez pas au milieu.'],
      ['Mon fichier est refusé : « format ou taille non autorisés ».', 'Lisez la consigne : souvent PDF ou JPG, et une taille maximale (par exemple 2 Mo). Rescannez en noir et blanc ou en qualité moyenne pour alléger le fichier.'],
    ],
  },

  exercices: {
    echauffe: [
      { h3: 'Exercice 1 : je remplis sur papier' },
      'Voici un formulaire. Remplissez-le comme sur un site, avec vos vraies informations ou des informations inventées.',
      { encadre: { style: 'bleu', contenu: [
        { lignes: ['Nom \\* : ', 'Prénoms \\* : ', 'Date de naissance \\* (JJ/MM/AAAA) : ', 'Lieu de naissance \\* : ', 'Adresse e-mail \\* : ', 'Téléphone : '] },
        'Situation \\* :   ◯ Étudiant    ◯ Salarié    ◯ Indépendant    ◯ Sans emploi',
        'Centres d\'intérêt :   ☐ Informatique    ☐ Commerce    ☐ Santé    ☐ Agriculture',
        'Pièce d\'identité \\* : [ Parcourir… ]  aucun fichier choisi',
        '☐ Je certifie l\'exactitude des informations fournies \\*',
      ] } },
      'Quels champs ne peut-on pas laisser vides ? Pour « Situation », combien de choix sont possibles ? Et pour « Centres d\'intérêt » ?',
    ],
    entraine: [
      { h3: 'Exercice 2 : la fiche de démarche' },
      'Sur **servicepublic.gouv.ci**, trouvez la fiche d\'une démarche qui vous concerne (casier judiciaire, passeport, certificat de nationalité…). Notez :',
      { lignes: ['La démarche : ', 'Les pièces à fournir : ', 'Le coût : ', 'Le délai : ', 'En ligne ? Si oui, l\'adresse du service : '] },
    ],
    lance: [
      { h3: 'Exercice 3 : je garde la preuve' },
      'Ouvrez la fiche trouvée à l\'exercice 2 et enregistrez-la en PDF avec **Microsoft Print to PDF**, dans **Documents > Administratif**, avec un nom selon la méthode FOR LIFE.',
    ],
  },

  cas: [
    { h2: 'L\'inscription au concours de Koffi' },
    'Koffi veut s\'inscrire à un concours administratif. L\'annonce officielle indique : inscription en ligne uniquement, sur le site officiel du concours ; pièces : extrait d\'acte de naissance, diplôme, pièce d\'identité, photo d\'identité numérique ; frais d\'inscription payables en ligne ; date limite dans dix jours.',
    { etapes: [
      'Faites la liste de tout ce que Koffi doit préparer **avant** d\'ouvrir le site.',
      'Comment Koffi peut-il être sûr d\'être sur le **vrai** site d\'inscription ?',
      'Que doit-il répondre au jeune homme qui proposait de « faire sortir son nom » pour 100 000 F ?',
      'Quelles **preuves** doit-il garder après l\'inscription, et où les ranger ?',
    ] },
  ],

  retiens: [
    'Je pars toujours d\'un **site officiel** : **servicepublic.gouv.ci** ou l\'adresse officielle tapée moi-même.',
    'Je lis la **fiche** : pièces, coût, délai.',
    'Je prépare mes documents **avant** de commencer ; j\'écris mon nom **exactement** comme sur ma pièce.',
    'Astérisque \\* = champ **obligatoire**. Rond = un seul choix ; case = plusieurs choix.',
    'Je paie **uniquement** par le module du site officiel ; je confirme sur mon téléphone, je ne donne mon code à personne.',
    'Je garde mes preuves : **Microsoft Print to PDF**, SMS, numéro de dossier.',
  ],
  defi: [
    'Cette semaine, réalisez **une vraie démarche en ligne** : payer une facture, prendre un rendez-vous, vous inscrire à un service, ou simplement créer votre compte sur un portail officiel. Gardez la preuve en PDF.',
  ],
  motDeLaFin: 'Un dimanche soir, depuis son salon, Koffi a terminé son inscription en vingt minutes. Il a enregistré le reçu en PDF dans **Documents > Administratif > 2026-11 Concours**. Puis il a envoyé un message à M. Kouassi : « Monsieur, les 100 000 F, je les garde pour fêter mon admission ! »',
  quiz: [
    'Pour trouver une démarche administrative ivoirienne, je commence par… **a)** Facebook · **b)** servicepublic.gouv.ci · **c)** un intermédiaire.',
    'Un champ marqué d\'un astérisque \\* est… **a)** facultatif · **b)** obligatoire · **c)** payant.',
    'Pour garder une page de confirmation en PDF, j\'utilise… **a)** Ctrl + P puis Microsoft Print to PDF · **b)** Ctrl + Z · **c)** la Corbeille.',
    'Un inconnu propose de « faire passer votre dossier » contre de l\'argent. C\'est… **a)** un service normal · **b)** une arnaque à refuser · **c)** obligatoire.',
  ],
  corriges: [
    ['Exercice 1', 'Les champs obligatoires sont ceux marqués d\'un astérisque : nom, prénoms, date et lieu de naissance, e-mail, situation, pièce d\'identité et la case de certification. Situation : un seul choix (boutons ronds). Centres d\'intérêt : plusieurs choix possibles (cases carrées).'],
    ['Cas pratique', '**1.** Extrait d\'acte de naissance, diplôme et pièce d\'identité scannés en PDF ; photo d\'identité numérique en JPG au bon format ; une adresse e-mail sérieuse ; un mot de passe solide ; un téléphone avec du crédit Mobile Money pour les frais ; un dossier « 2026-11 Concours » pour tout ranger. **2.** Partir de l\'annonce officielle ou de servicepublic.gouv.ci, taper l\'adresse lui-même, vérifier le nom de domaine. **3.** Refuser poliment mais fermement : c\'est une escroquerie, et cela peut même être signalé. **4.** Le PDF de l\'accusé de réception, le reçu de paiement, le SMS de confirmation et le numéro de dossier, dans Documents > Administratif > 2026-11 Concours.'],
    ['Mini-quiz', '1-b · 2-b · 3-a · 4-b'],
  ],
  glossaire: [
    ['Démarche en ligne', 'Une procédure administrative réalisée sur Internet.'],
    ['Portail', 'Un site qui rassemble de nombreux services, comme servicepublic.gouv.ci.'],
    ['Formulaire', 'Une page avec des champs à remplir pour transmettre des informations.'],
    ['Champ obligatoire', 'Une case marquée d\'un astérisque, qu\'on ne peut pas laisser vide.'],
    ['Lien d\'activation', 'Le lien envoyé par e-mail pour confirmer la création d\'un compte.'],
    ['Accusé de réception', 'La preuve que votre demande a bien été reçue.'],
    ['Microsoft Print to PDF', 'Une « imprimante » de Windows qui enregistre n\'importe quelle page en PDF.'],
    ['Captcha', 'Un petit test qui vérifie qu\'on est un humain et pas un robot.'],
  ],
};
