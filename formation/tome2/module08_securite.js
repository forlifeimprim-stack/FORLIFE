// Tome 2 · Module 8 : Sécurité numérique, protéger son identité
const { C } = require('../outils/livre');

module.exports = {
  num: 8,
  titre: 'Sécurité numérique : protéger son identité',
  sousTitre: 'Votre nom en ligne vaut plus que votre porte-monnaie',
  objectifs: [
    'reconnaître un **hameçonnage** (phishing) élaboré ;',
    'utiliser un **gestionnaire de mots de passe** et une **application d\'authentification** ;',
    'faire le **bilan de sécurité** de ses comptes ;',
    'appliquer la règle de sauvegarde **3-2-1** ;',
    'protéger sa **vie privée** et connaître ses **droits** sur ses données ;',
    'réagir à un **piratage** de compte.',
  ],
  duree: 'Cinq heures', materiel: 'Un ordinateur, votre smartphone, un disque externe ou une clé USB', prerequis: 'Tome 1, module 10 ; module 5 de ce tome',

  situation: [
    { h2: 'Le compte piraté de Koffi' },
    'Un matin, Koffi reçoit des appels inquiets de ses clients : « C\'est toi qui vends des imprimantes à moitié prix ? J\'ai déjà envoyé l\'acompte par Mobile Money… » Son compte Facebook professionnel, avec ses 4 000 abonnés, publie depuis la nuit de fausses promotions. Le nom du compte a changé. Le mot de passe aussi. Koffi ne peut plus se connecter.',
    'La veille, il avait reçu un message « de Facebook » : « Votre page va être supprimée pour violation des droits d\'auteur. Contestez sous 24 heures. » Il avait cliqué, puis saisi son mot de passe. C\'était le même que pour son e-mail.',
    { d: ['Koffi', 'Le message avait le logo, les couleurs, tout ! Comment je pouvais savoir ?'] },
    { d: ['M. Kouassi', 'Les escrocs ont fait des progrès, Koffi. Nous aussi, il faut en faire. Ton identité en ligne est une maison avec plusieurs portes : on va changer les serrures, ajouter des verrous et faire des doubles des clés.'] },
  ],

  declic: [
    { h2: 'L\'hameçonnage, c\'est le faux guichet' },
    'Imaginez qu\'un escroc installe, à côté de la vraie agence bancaire, un faux guichet avec le même logo et un faux employé en uniforme. Vous donnez votre carte et votre code… C\'est l\'**hameçonnage** (« phishing » en anglais) : un faux message ou un faux site qui imite un organisme de confiance pour vous faire livrer vos codes.',
    { tableau: [['Indice', 'Ce qu\'il faut vérifier'], [
      ['**L\'expéditeur**', 'L\'adresse réelle, pas le nom affiché : « Facebook <securite@fb-support-alerte.com> » n\'est pas Facebook.'],
      ['**Le lien**', 'Survolez-le avec la souris **sans cliquer** : l\'adresse réelle s\'affiche en bas du navigateur. Le nom officiel doit être juste avant le premier « / ».'],
      ['**L\'urgence ou la menace**', '« Sous 24 heures », « suppression », « suspension » : le levier de la peur.'],
      ['**La demande**', 'Mot de passe, code reçu par SMS, code secret : jamais demandés par un organisme sérieux.'],
      ['**La forme**', 'Fautes, formules impersonnelles (« Cher utilisateur »), pièces jointes inattendues.'],
    ], [1.3, 3.7]] },
    { encadre: { titre: '🔑  Le réflexe qui déjoue presque tout', style: 'vert', contenu: [
      'Ne passez **jamais** par le lien d\'un message pour vous connecter. Ouvrez vous-même l\'application officielle, ou tapez l\'adresse du site. Si le problème est réel, vous le verrez aussi là.',
    ] } },
    { h2: 'Le trousseau du gardien : le gestionnaire de mots de passe' },
    'Avoir un mot de passe différent et solide pour chaque compte, c\'est indispensable… et impossible à retenir. Le **gestionnaire de mots de passe** est le trousseau du gardien : un coffre chiffré qui retient tous vos mots de passe. Vous ne retenez qu\'**un seul** mot de passe maître, très solide. Le gestionnaire crée, retient et remplit les autres. Bonus : il ne remplit rien sur un faux site, car l\'adresse ne correspond pas.',
    { h2: 'La règle de sauvegarde 3-2-1' },
    'Pour un titre foncier, on garde l\'original, une copie certifiée à la maison, et une autre chez un parent de confiance dans une autre ville. Si la maison brûle, il reste une copie. Pour vos fichiers, c\'est la règle **3-2-1** :',
    { tableau: [['Chiffre', 'Règle', 'Exemple'], [
      ['**3**', 'Trois copies de vos fichiers importants', 'L\'original sur l\'ordinateur + deux copies'],
      ['**2**', 'Sur au moins deux supports différents', 'Un disque externe + le nuage'],
      ['**1**', 'Une copie hors de la maison ou du bureau', 'Le nuage (OneDrive, Google Drive), ou un disque gardé ailleurs'],
    ], [0.6, 2, 2.4], C.violet] },
  ],

  pasAPas: [
    { h2: 'Étape 1 : le gestionnaire de mots de passe' },
    { etapes: [
      'Choisissez un gestionnaire reconnu : celui de votre navigateur (Google Chrome, Microsoft Edge) pour commencer, ou une application dédiée comme **Bitwarden** (version gratuite) pour l\'utiliser partout.',
      'Créez un **mot de passe maître** : une longue phrase de passe que vous n\'utilisez nulle part ailleurs. Notez-la sur papier, rangée en lieu sûr à la maison.',
      'Activez la **vérification en deux étapes** sur le gestionnaire lui-même.',
      'Pour chaque compte important, en commençant par l\'**e-mail** : changez le mot de passe et laissez le gestionnaire en **générer** un nouveau, long et aléatoire.',
    ] },
    { h2: 'Étape 2 : une application d\'authentification' },
    'Les codes par SMS valent mieux que rien, mais une **application d\'authentification** (Google Authenticator, Microsoft Authenticator) est plus sûre : le code change toutes les trente secondes et reste dans votre téléphone.',
    { etapes: [
      'Installez l\'application sur votre téléphone.',
      'Dans les paramètres de sécurité du compte (Google, Facebook, Microsoft…), choisissez **Application d\'authentification**. Un QR code s\'affiche.',
      'Dans l\'application, touchez **+** et scannez le QR code. Tapez le code affiché pour confirmer.',
      '**Notez les codes de secours** proposés et rangez-les avec votre mot de passe maître : ils vous sauveront si vous perdez votre téléphone.',
    ] },
    { h2: 'Étape 3 : le bilan de sécurité de vos comptes' },
    { tableau: [['Compte', 'Où faire le bilan'], [
      ['**Google** (Gmail, Drive)', '**myaccount.google.com** → **Sécurité** → **Check-up Sécurité** : appareils connectés, applications tierces, numéro et e-mail de récupération.'],
      ['**Facebook** et **Instagram**', '**Paramètres** → **Espace Comptes** → **Mot de passe et sécurité** : authentification à deux facteurs, appareils connectés, alertes de connexion.'],
      ['**WhatsApp**', '**Paramètres** → **Appareils connectés** : déconnectez tout appareil inconnu. Vérification en deux étapes activée (Tome 1).'],
      ['**Microsoft**', '**account.microsoft.com** → **Sécurité**.'],
    ], [1.4, 3.6]] },
    { h2: 'Étape 4 : mettre en place la sauvegarde 3-2-1' },
    { etapes: [
      '**Copie 1 (le nuage)** : activez la sauvegarde **OneDrive** de vos dossiers Bureau, Documents et Images (module 5), ou utilisez Google Drive.',
      '**Copie 2 (le disque externe)** : branchez un disque externe ou une grande clé USB. Chaque mois, copiez-y vos dossiers importants. Windows peut aussi le faire automatiquement : cherchez **Historique des fichiers** dans le menu Démarrer, choisissez le disque, activez.',
      '**Le test** : une fois par trimestre, essayez de **restaurer** un fichier depuis chaque copie. Une sauvegarde jamais testée n\'est qu\'un espoir.',
      'Gardez le disque externe **débranché** en dehors des sauvegardes : en cas de virus, il sera épargné.',
    ] },
    { h2: 'Étape 5 : si un compte est piraté' },
    { encadre: { titre: '🚨  Plan d\'urgence', style: 'rouge', contenu: [
      { etapes: [
        '**Sécuriser l\'e-mail d\'abord** : c\'est lui qui permet de réinitialiser tout le reste. Changez son mot de passe depuis un appareil sûr.',
        '**Récupérer le compte** par la procédure officielle : pour Facebook, **facebook.com/hacked** ; pour Google, **accounts.google.com/signin/recovery** ; pour WhatsApp, réinstallez l\'application et réenregistrez votre numéro.',
        '**Déconnecter** toutes les sessions et appareils inconnus ; activer la vérification en deux étapes.',
        '**Prévenir** vos contacts et clients par un autre canal : « Mon compte a été piraté, ne répondez à aucune demande d\'argent. »',
        '**Garder les preuves** et **porter plainte** (commissariat ou PLCC, par les contacts officiels).',
      ] },
    ] } },
    { h2: 'Étape 6 : vie privée et droits sur vos données' },
    { puces: [
      'Réglez la **visibilité** de vos publications et de votre liste d\'amis : **Paramètres** → **Confidentialité** sur chaque réseau social.',
      'Ne publiez pas votre **pièce d\'identité**, votre adresse précise, les horaires de vos absences ou le nom de l\'école de vos enfants.',
      'Vérifiez les **autorisations** des applications du téléphone (contacts, localisation, micro) : **Paramètres** → **Applications** → **Autorisations**.',
      'En Côte d\'Ivoire, la **loi n° 2013-450** relative à la protection des données à caractère personnel vous donne des droits d\'**accès**, de **rectification**, d\'**opposition** et de **suppression** sur vos données. L\'**ARTCI** est l\'autorité chargée de les faire respecter.',
      'Localisez un ordinateur ou un téléphone perdu : **Localiser mon appareil** (Paramètres → Confidentialité et sécurité sur Windows ; **Localiser mon appareil** de Google sur Android ; **Localiser** sur iPhone). Activez-le **avant** la perte.',
    ] },
  ],

  pieges: {
    lignes: [
      ['🔁 Le même mot de passe pour l\'e-mail et Facebook', 'Un seul piratage ouvre toutes les portes.', 'Un gestionnaire, un mot de passe par compte.'],
      ['🔗 Se connecter depuis le lien d\'un message', 'C\'est exactement ce que veut l\'hameçonneur.', 'Ouvrir soi-même l\'application ou le site.'],
      ['📱 Activer la double authentification sans noter les codes de secours', 'Téléphone perdu = compte perdu.', 'Codes de secours rangés en lieu sûr.'],
      ['💽 Garder le disque de sauvegarde toujours branché', 'Un rançongiciel chiffrera aussi la sauvegarde.', 'Le brancher seulement pour sauvegarder.'],
      ['🤳 Publier sa vie en temps réel', 'Les voleurs savent quand la maison est vide.', 'Publier les photos de voyage au retour.'],
    ],
    questions: [
      ['Un gestionnaire de mots de passe, ce n\'est pas mettre tous ses œufs dans le même panier ?', 'Si, mais dans un panier blindé, verrouillé par un mot de passe maître et la double authentification. C\'est bien plus sûr que le même mot de passe partout, ou un carnet qu\'on peut perdre. Les experts en sécurité le recommandent.'],
      ['Comment savoir si mes mots de passe ont fuité ?', 'Les gestionnaires (et le Check-up Mots de passe de Google) vous préviennent si un mot de passe apparaît dans une fuite connue. Le site **haveibeenpwned.com** indique aussi si votre adresse e-mail figure dans une fuite. Si oui : changez le mot de passe concerné.'],
    ],
  },

  exercices: {
    echauffe: [
      { h3: 'Exercice 1 : vrai ou faux message ?' },
      { tableau: [['Message', 'Hameçonnage ?', 'Indices'], [
        ['De « Orange Money <info@orange-money-ci-bonus.net> » : « Votre compte est suspendu, cliquez pour réactiver. »', '', ''],
        ['Notification dans l\'application officielle de votre banque : « Nouvelle connexion depuis un appareil Android. Était-ce vous ? »', '', ''],
        ['De « Microsoft <no-reply@microsoft-security-verify.co> » : « Votre licence Office expire, entrez votre carte bancaire. »', '', ''],
        ['De votre collègue, depuis son adresse habituelle : « Voici le compte rendu de la réunion », pièce jointe .docx attendue.', '', ''],
      ], [3.2, 0.9, 1.4], C.bleu] },
    ],
    entraine: [
      { h3: 'Exercice 2 : je change les serrures' },
      { cases: [
        'J\'installe un gestionnaire de mots de passe et je crée mon mot de passe maître.',
        'Je change le mot de passe de mon e-mail avec un mot de passe généré.',
        'J\'installe une application d\'authentification et je l\'active sur mon e-mail.',
        'Je note et range mes codes de secours.',
        'Je fais le Check-up Sécurité de Google et je déconnecte les appareils inconnus.',
      ] },
    ],
    lance: [
      { h3: 'Exercice 3 : ma sauvegarde 3-2-1' },
      'Mettez en place votre sauvegarde 3-2-1, puis faites le test : supprimez une copie d\'un fichier sans importance et restaurez-la depuis le nuage, puis depuis le disque externe. Notez la date de votre prochain test.',
    ],
  },

  cas: [
    { h2: 'Reprendre la main pour Koffi' },
    'Il est 9 h. Le compte Facebook professionnel de Koffi est piraté depuis la nuit et publie de fausses promotions. Son e-mail utilise le même mot de passe. Il a encore accès à son e-mail. Trois clients ont déjà envoyé de l\'argent.',
    { etapes: [
      'Quelles sont les trois premières actions à faire **dans l\'heure**, dans l\'ordre ?',
      'Comment prévenir ses clients le plus vite possible ?',
      'Que dire aux trois clients qui ont envoyé de l\'argent ?',
      'Une fois le compte récupéré, quelles protections mettre en place pour que cela ne se reproduise pas ?',
    ] },
  ],

  retiens: [
    'Hameçonnage : vérifier **l\'expéditeur réel**, **survoler le lien**, se méfier de l\'**urgence**. Jamais de connexion par un lien reçu.',
    'Un **gestionnaire de mots de passe** : un mot de passe maître, un mot de passe unique par compte.',
    'Une **application d\'authentification**, et les **codes de secours** rangés en lieu sûr.',
    'Sauvegarde **3-2-1** : 3 copies, 2 supports, 1 ailleurs. Et on **teste** la restauration.',
    'Compte piraté : **e-mail d\'abord**, procédure officielle, déconnecter, prévenir, porter plainte.',
    'Loi n° **2013-450** : droits d\'accès, de rectification, d\'opposition et de suppression ; **ARTCI**.',
  ],
  defi: [
    'Cette semaine, sécurisez vos **trois** comptes les plus importants (e-mail, Mobile Money ou banque, réseau social principal) : mot de passe unique, double authentification, appareils connectés vérifiés.',
  ],
  motDeLaFin: 'Koffi a récupéré sa page en deux jours, grâce à son e-mail sécurisé et à la procédure officielle. Il a publié une vidéo pour expliquer ce qui s\'était passé et rembourser, sur ses propres fonds, deux de ses trois clients. Son nombre d\'abonnés a augmenté. « Les gens font confiance à quelqu\'un qui dit la vérité », a-t-il conclu.',
  quiz: [
    'Pour vérifier un lien sans risque, je… **a)** clique dessus · **b)** le survole avec la souris pour lire l\'adresse réelle · **c)** le transfère à mes amis.',
    'La règle 3-2-1 signifie… **a)** 3 copies, 2 supports, 1 ailleurs · **b)** 3 mots de passe, 2 comptes, 1 téléphone · **c)** 3 sauvegardes par jour.',
    'Si un compte est piraté, je sécurise d\'abord… **a)** mon e-mail · **b)** mon fond d\'écran · **c)** mon imprimante.',
    'Un gestionnaire de mots de passe permet… **a)** d\'avoir un mot de passe unique et solide pour chaque compte · **b)** de partager ses codes · **c)** de pirater les comptes.',
  ],
  corriges: [
    ['Exercice 1', '1 : hameçonnage (adresse imitant Orange, menace, lien) · 2 : probablement vrai (dans l\'application officielle, aucune demande de code) ; en cas de doute, vérifier dans l\'application · 3 : hameçonnage (domaine imitant Microsoft, demande de carte) · 4 : probablement vrai (expéditeur connu, pièce attendue) ; en cas de doute, appeler le collègue.'],
    ['Cas pratique', '**1.** Changer immédiatement le mot de passe de l\'e-mail et activer la double authentification ; lancer la récupération sur facebook.com/hacked ; déconnecter les sessions inconnues de l\'e-mail. **2.** Statut WhatsApp, message aux listes de diffusion, publication depuis un compte personnel ou un compte ami, appel aux clients réguliers. **3.** Leur dire de garder les preuves, de contacter immédiatement leur opérateur pour tenter de bloquer la transaction et de porter plainte ; Koffi peut fournir une attestation du piratage. **4.** Gestionnaire de mots de passe, mots de passe uniques, application d\'authentification, codes de secours, plusieurs administrateurs de confiance pour la page, alertes de connexion activées.'],
    ['Mini-quiz', '1-b · 2-a · 3-a · 4-a'],
  ],
  glossaire: [
    ['Gestionnaire de mots de passe', 'Un coffre chiffré qui crée, retient et remplit les mots de passe.'],
    ['Mot de passe maître', 'Le seul mot de passe à retenir, qui ouvre le gestionnaire.'],
    ['Application d\'authentification', 'Une application qui génère des codes temporaires pour la double authentification.'],
    ['Codes de secours', 'Des codes à usage unique pour récupérer un compte si l\'on perd son téléphone.'],
    ['Sauvegarde 3-2-1', 'Trois copies, sur deux supports différents, dont une hors du lieu habituel.'],
    ['Rançongiciel', 'Un logiciel malveillant qui chiffre les fichiers et exige une rançon pour les rendre.'],
    ['Données à caractère personnel', 'Toute information qui permet d\'identifier une personne : nom, numéro, photo, adresse…'],
    ['ARTCI', 'L\'Autorité de régulation des télécommunications de Côte d\'Ivoire, chargée aussi de la protection des données personnelles.'],
  ],
};
