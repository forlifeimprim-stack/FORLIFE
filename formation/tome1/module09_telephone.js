// Tome 1 · Module 9 : Téléphone et ordinateur, deux amis
const { C } = require('../outils/livre');

module.exports = {
  num: 9,
  titre: 'Téléphone et ordinateur, deux amis',
  sousTitre: 'Faire passer photos et documents de l\'un à l\'autre',
  objectifs: [
    'transférer des photos et des documents du téléphone vers l\'ordinateur **par câble** ;',
    'utiliser **WhatsApp Web** et s\'envoyer des fichiers à soi-même ;',
    '**scanner** un document avec son téléphone et en faire un **PDF** ;',
    'libérer de la place sur son téléphone **sans rien perdre**.',
  ],
  duree: 'Trois heures', materiel: 'Un ordinateur, votre smartphone et son câble USB', prerequis: 'Modules 1 à 8',

  situation: [
    { h2: 'Les photos du baptême' },
    'Samedi, Mariam a pris deux cents photos au baptême de sa nièce. Sa sœur veut les plus belles imprimées pour l\'album de famille. Problème : le téléphone de Mariam affiche « Stockage presque plein » et refuse de prendre une seule photo de plus. Et l\'imprimerie du quartier demande les photos « sur une clé ou par e-mail ».',
    { d: ['Mariam', 'J\'envoie tout par WhatsApp à l\'imprimeur ? Deux cents photos, une par une ?'] },
    { d: ['M. Kouassi', 'Votre téléphone et votre ordinateur sont deux cousins, Mariam. Ils parlent la même langue. Il suffit de construire un pont entre eux.'] },
  ],

  declic: [
    { h2: 'Plusieurs routes entre le téléphone et l\'ordinateur' },
    'Pour aller de Cocody au Plateau, on peut prendre le pont, le bateau-bus ou faire le tour par la route. Pour passer un fichier du téléphone à l\'ordinateur, il y a aussi plusieurs routes. Chacune a ses avantages.',
    { tableau: [['La route', 'Comme…', 'Idéal pour…', 'Attention'], [
      ['🔌 **Le câble USB**', 'La route goudronnée directe', 'Beaucoup de photos ou de vidéos d\'un coup. Pas besoin d\'Internet.', 'Certains câbles ne servent qu\'à charger.'],
      ['💬 **WhatsApp Web**', 'Le pont', 'Quelques fichiers, des documents reçus sur WhatsApp.', 'Les photos envoyées comme « photo » perdent de la qualité.'],
      ['✉️ **L\'e-mail**', 'La poste', 'Un ou deux documents à garder et à classer.', 'Taille limitée (environ 25 Mo par message dans Gmail).'],
      ['☁️ **Le stockage en ligne** (Google Photos, Google Drive, OneDrive)', 'L\'entrepôt partagé', 'Retrouver ses fichiers partout et les sauvegarder.', 'Consomme des données Internet.'],
    ], [1.3, 1.1, 1.7, 1.5]] },
    { h3: 'Le téléphone, une photocopieuse de poche' },
    'Votre téléphone sait **scanner** un document : il le photographie, le redresse, retire les ombres et le transforme en **PDF** propre, comme une photocopie. Plus besoin de chercher un scanner au cybercafé pour une pièce d\'identité ou un diplôme.',
  ],

  pasAPas: [
    { h2: 'Route 1 : le câble USB' },
    { h3: 'Avec un téléphone Android' },
    { etapes: [
      'Branchez le téléphone à l\'ordinateur avec son câble, et **déverrouillez** le téléphone.',
      'Sur le téléphone, une notification apparaît, par exemple « Recharge via USB ». Touchez-la et choisissez **Transfert de fichiers** (le nom exact varie selon la marque).',
      'Sur l\'ordinateur, ouvrez l\'**Explorateur de fichiers** (Windows + E), puis **Ce PC** : le téléphone apparaît avec son nom.',
      'Ouvrez **Stockage interne** → **DCIM** → **Camera** : ce sont vos photos.',
      'Sélectionnez les photos voulues (Ctrl + clic, ou Ctrl + A pour toutes), **copiez**, puis **collez** dans un dossier de l\'ordinateur, par exemple **Images > 2026-11 Baptême**.',
    ] },
    { h3: 'Avec un iPhone' },
    { etapes: [
      'Branchez l\'iPhone et déverrouillez-le. Il demande « Faire confiance à cet ordinateur ? » : touchez **Se fier**, puis entrez votre code.',
      'Dans l\'Explorateur, ouvrez **Ce PC** → **Apple iPhone** → **Internal Storage** → **DCIM** : vos photos sont rangées dans des dossiers par date.',
      'Copiez-les vers l\'ordinateur comme avec Android.',
    ] },
    { illus: 'Capture d\'écran : l\'Explorateur de fichiers ouvert sur Ce PC > Galaxy A15 > Stockage interne > DCIM > Camera, avec des miniatures de photos ; à côté, l\'écran d\'un téléphone Android montrant le choix « Transfert de fichiers ».' },
    { h2: 'Route 2 : WhatsApp Web' },
    { etapes: [
      'Sur l\'ordinateur, ouvrez le navigateur et allez sur **web.whatsapp.com**. Un grand carré noir et blanc apparaît : un **QR code**.',
      'Sur le téléphone, ouvrez WhatsApp. Sur Android : touchez les **trois points ⋮** en haut à droite ; sur iPhone : **Réglages**. Puis **Appareils connectés** → **Connecter un appareil**.',
      'Pointez la caméra du téléphone vers le QR code de l\'écran. Vos discussions apparaissent sur l\'ordinateur.',
      'Pour **vous envoyer un fichier à vous-même** : sur le téléphone, ouvrez la discussion avec **vous-même** (cherchez votre propre nom dans les contacts, marqué « Vous »), envoyez le fichier comme **Document** pour garder toute sa qualité. Sur l\'ordinateur, ouvrez la même discussion et cliquez sur le fichier pour le **télécharger**.',
      'Pour vous **déconnecter** : sur le téléphone, **Appareils connectés**, touchez l\'appareil, puis **Se déconnecter**. Indispensable sur un ordinateur qui n\'est pas le vôtre.',
    ] },
    { h2: 'Route 3 : scanner un document en PDF' },
    { etapes: [
      'Posez le document **bien à plat**, sur un fond **sombre** et uni, dans un endroit **bien éclairé**, sans ombre.',
      'Sur **Android** : ouvrez l\'application **Google Drive**, touchez le bouton **+**, puis **Scanner** (l\'icône d\'appareil photo). Sur **iPhone** : ouvrez l\'application **Notes**, créez une note, touchez l\'icône d\'appareil photo → **Scanner des documents**.',
      'Cadrez le document : l\'application détecte souvent les bords toute seule. Prenez la photo, ajustez les coins si besoin.',
      'Pour une pièce d\'identité, ajoutez une **deuxième page** pour le verso.',
      'Enregistrez en **PDF** avec un nom clair (**CNI Mariam Koné**), puis envoyez-le-vous par e-mail ou WhatsApp, ou retrouvez-le sur l\'ordinateur dans Google Drive.',
    ] },
    { encadre: { titre: '🧹  Libérer de la place sans rien perdre', style: 'vert', contenu: [
      { etapes: [
        'Copiez les photos sur l\'ordinateur.',
        '**Vérifiez** qu\'elles s\'ouvrent bien sur l\'ordinateur.',
        'Faites une **deuxième copie** sur une clé USB ou en ligne.',
        'Seulement **ensuite**, supprimez-les du téléphone.',
      ] },
    ] } },
  ],

  pieges: {
    lignes: [
      ['🔋 Le téléphone reste en mode « Recharge uniquement »', 'L\'ordinateur ne voit pas les photos.', 'Choisir « Transfert de fichiers » dans la notification USB.'],
      ['🧵 Utiliser un câble de charge bon marché', 'Il ne transporte pas les données.', 'Utiliser le câble d\'origine.'],
      ['🖼️ Envoyer les photos à imprimer par WhatsApp « en photo »', 'WhatsApp les compresse : elles seront floues à l\'impression.', 'Les envoyer comme Document, par câble ou par e-mail.'],
      ['🗑️ Supprimer du téléphone avant d\'avoir vérifié la copie', 'Si la copie a échoué, les souvenirs sont perdus.', 'Copier, vérifier, doubler, puis supprimer.'],
      ['🖥️ Laisser WhatsApp Web connecté au bureau ou au cybercafé', 'N\'importe qui peut lire et envoyer des messages en votre nom.', 'Se déconnecter depuis le téléphone.'],
    ],
    questions: [
      ['Ça ne va pas abîmer mon téléphone de le brancher à l\'ordinateur ?', 'Non, c\'est fait pour cela. Débranchez simplement le câble quand la copie est terminée.'],
      ['Mon PDF scanné est trop lourd pour être envoyé. Que faire ?', 'Scannez en noir et blanc pour un document texte, ou réduisez la qualité dans les options de l\'application. Une page de document ne devrait pas dépasser un ou deux Mo.'],
    ],
  },

  exercices: {
    echauffe: [
      { h3: 'Exercice 1 : quelle route ?' },
      { tableau: [['Situation', 'La meilleure route'], [
        ['Transférer 300 photos de vacances', ''], ['Récupérer sur l\'ordinateur un PDF reçu sur WhatsApp', ''],
        ['Envoyer son diplôme scanné à une entreprise', ''], ['Retrouver ses photos même si le téléphone est volé', ''],
      ], [3, 2], C.bleu] },
    ],
    entraine: [
      { h3: 'Exercice 2 : le pont par câble' },
      { cases: [
        'Je copie dix photos de mon téléphone dans un dossier Images > Essai transfert.',
        'Je vérifie qu\'elles s\'ouvrent sur l\'ordinateur.',
        'Je me connecte à WhatsApp Web et je m\'envoie un document à moi-même.',
        'Je télécharge ce document sur l\'ordinateur, puis je me déconnecte de WhatsApp Web.',
      ] },
    ],
    lance: [
      { h3: 'Exercice 3 : mon scanner de poche' },
      'Scannez recto et verso de votre pièce d\'identité en un seul PDF, nommez-le correctement, transférez-le sur l\'ordinateur dans **Documents > Administratif**. Vous en aurez besoin pour le projet final.',
    ],
  },

  cas: [
    { h2: 'Le téléphone plein de Mariam' },
    'Le téléphone de Mariam contient 3 Go de photos du baptême, 1,5 Go de vidéos WhatsApp et de nombreux documents de travail reçus sur WhatsApp. Il ne reste que 200 Mo de libre.',
    { etapes: [
      'Proposez un plan en étapes pour libérer au moins 4 Go **sans rien perdre**.',
      'Comment envoyer les vingt plus belles photos à l\'imprimerie en bonne qualité ?',
      'Où ranger, sur l\'ordinateur, les documents de travail reçus sur WhatsApp ?',
    ] },
  ],

  retiens: [
    'Câble USB : je choisis **Transfert de fichiers** sur le téléphone, puis **Ce PC** dans l\'Explorateur.',
    'Les photos sont dans **DCIM**.',
    '**WhatsApp Web** : web.whatsapp.com, puis **Appareils connectés** sur le téléphone. Je me **déconnecte** après usage.',
    'Pour garder la qualité, j\'envoie les photos comme **Document**.',
    'Mon téléphone **scanne** en PDF : Google Drive (Android) ou Notes (iPhone).',
    'Avant de supprimer : **copier, vérifier, doubler**.',
  ],
  defi: [
    'Cette semaine, faites le grand ménage de votre téléphone : transférez vos photos et vos documents importants sur l\'ordinateur, faites une copie de secours, puis libérez de la place. Notez combien de Go vous avez récupérés.',
  ],
  motDeLaFin: 'Mariam a déposé une clé USB à l\'imprimerie avec vingt photos parfaites. Sur son téléphone, il reste maintenant 5 Go de libre. Sa sœur lui a demandé : « Tu m\'apprends ? » Mariam a souri : « Samedi, chez moi. Apporte ton câble. »',
  quiz: [
    'Sur Android, pour que l\'ordinateur voie les photos, je choisis… **a)** Recharge uniquement · **b)** Transfert de fichiers · **c)** Mode avion.',
    'Les photos du téléphone sont rangées dans le dossier… **a)** DCIM · **b)** Windows · **c)** Téléchargements.',
    'Pour ne pas perdre en qualité sur WhatsApp, j\'envoie la photo comme… **a)** sticker · **b)** Document · **c)** statut.',
    'Avant de supprimer mes photos du téléphone, je… **a)** copie, vérifie et fais une seconde copie · **b)** redémarre le téléphone · **c)** les envoie sur Facebook.',
  ],
  corriges: [
    ['Exercice 1', '300 photos : câble USB · PDF reçu sur WhatsApp : WhatsApp Web · Diplôme scanné : e-mail · Photos protégées en cas de vol : stockage en ligne (Google Photos, Drive, OneDrive).'],
    ['Cas pratique', '**1.** Copier les photos et les vidéos par câble dans Images > 2026-11 Baptême ; vérifier ; faire une seconde copie sur clé USB ; supprimer du téléphone les photos copiées (3 Go) et les vidéos WhatsApp inutiles (1,5 Go) ; vider la corbeille de la galerie. **2.** Les copier sur une clé USB depuis l\'ordinateur, ou les envoyer par e-mail en pièces jointes, ou par WhatsApp en tant que Document. **3.** Dans Documents > Travail, dans des sous-dossiers bien nommés.'],
    ['Mini-quiz', '1-b · 2-a · 3-b · 4-a'],
  ],
  glossaire: [
    ['Transfert de fichiers', 'Le mode USB qui permet à l\'ordinateur de voir les fichiers du téléphone.'],
    ['DCIM', 'Le dossier où les téléphones rangent les photos et vidéos de l\'appareil photo.'],
    ['WhatsApp Web', 'La version de WhatsApp qui s\'utilise sur l\'ordinateur, reliée au téléphone.'],
    ['QR code', 'Un carré de petits motifs noirs et blancs qu\'on scanne avec la caméra du téléphone.'],
    ['Scanner', 'Transformer un document papier en fichier, souvent en PDF.'],
    ['Stockage en ligne (cloud)', 'Un espace sur Internet pour garder ses fichiers et les retrouver sur tous ses appareils.'],
  ],
};
