// Tome 2 · Module 7 : Comprendre Internet et le Wi-Fi
const { C } = require('../outils/livre');

module.exports = {
  num: 7,
  titre: 'Comprendre Internet et le Wi-Fi',
  sousTitre: '« Le réseau ne passe pas ! » Mais qui est coupable ?',
  objectifs: [
    'comprendre le **chemin** de la connexion, de l\'ordinateur jusqu\'à Internet ;',
    'distinguer **Wi-Fi**, **box**, **données mobiles**, **débit** et **forfait** ;',
    'se connecter à un Wi-Fi et faire un **partage de connexion** depuis son téléphone ;',
    'appliquer une **méthode de diagnostic** en six étapes ;',
    '**sécuriser** son Wi-Fi et **économiser** ses données.',
  ],
  duree: 'Trois heures', materiel: 'Un ordinateur portable, un smartphone avec forfait internet, une box si possible', prerequis: 'Tome 1, module 7',

  situation: [
    { h2: 'Lundi, 8 h 30, au secrétariat de Koffi' },
    'Six clients attendent pour imprimer des dossiers à envoyer en ligne. « Pas d\'Internet ». Koffi redémarre l\'ordinateur. Rien. Il le redémarre encore. Rien. Il appelle son opérateur, énervé : « Votre réseau est nul ! » Le conseiller lui demande si les voyants de la box sont allumés. Koffi va voir : la box est éteinte. La femme de ménage l\'a débranchée pour brancher l\'aspirateur.',
    { d: ['Koffi', 'J\'ai crié sur le conseiller pour une prise !'] },
    { d: ['M. Kouassi', 'Ce n\'est pas grave, Koffi, ça arrive aux meilleurs. Une connexion, c\'est une chaîne. Quand elle casse, il faut chercher le maillon faible, dans l\'ordre, au lieu de redémarrer au hasard.'] },
  ],

  declic: [
    { h2: 'La connexion, c\'est l\'eau qui arrive au robinet' },
    'Quand l\'eau ne coule plus au robinet, le plombier ne commence pas par appeler la SODECI. Il regarde d\'abord le robinet, puis le tuyau de la maison, puis le compteur, et seulement ensuite le réseau de la rue. Internet arrive chez vous de la même manière, par une chaîne de maillons.',
    { illus: 'Schéma en chaîne, de gauche à droite : l\'ordinateur (le robinet) → le Wi-Fi (le tuyau de la maison) → la box ou le téléphone en partage de connexion (le compteur) → l\'opérateur (le réseau de la rue) → Internet (le château d\'eau). Sous chaque maillon, la question à poser pour le vérifier.' },
    { tableau: [['Maillon', 'Ce que c\'est', 'Comme pour l\'eau…'], [
      ['**L\'ordinateur**', 'Sa carte Wi-Fi, ses réglages', 'Le robinet'],
      ['**Le Wi-Fi**', 'La liaison sans fil entre l\'appareil et la box', 'Le tuyau de la maison'],
      ['**La box** (ou le routeur, ou le téléphone en partage)', 'L\'appareil qui relie la maison au réseau de l\'opérateur', 'Le compteur'],
      ['**L\'opérateur**', 'Orange, MTN, Moov… : fibre, ADSL, 4G, 5G', 'Le réseau de la rue'],
      ['**Internet**', 'Le reste du monde', 'Le château d\'eau'],
    ], [1.5, 2.3, 1.4]] },
    { h3: 'Les mots du réseau, en mots simples' },
    { tableau: [['Mot', 'En mots simples'], [
      ['**Débit** (en Mbit/s)', 'La **largeur du tuyau** : combien de données passent par seconde. Plus il est grand, plus la page s\'affiche vite.'],
      ['**Forfait** (en Go)', 'Le **réservoir** : la quantité totale de données que vous pouvez consommer.'],
      ['**Adresse IP**', 'Le **numéro de la maison** de votre appareil sur le réseau, pour que les données arrivent au bon endroit.'],
      ['**DNS**', 'L\'**annuaire** : il traduit un nom (servicepublic.gouv.ci) en adresse IP.'],
      ['**2,4 GHz / 5 GHz**', 'Deux « voies » du Wi-Fi : la 2,4 porte plus **loin** mais va moins vite ; la 5 va plus **vite** mais traverse moins bien les murs.'],
      ['**Point d\'accès mobile**', 'Votre **téléphone** qui joue le rôle de box et partage son forfait en Wi-Fi.'],
    ], [1.3, 3.7]] },
    { encadre: { titre: '🔑  « J\'ai du Wi-Fi mais pas d\'Internet »', style: 'vert', contenu: [
      'Cette phrase, très fréquente, est précieuse : elle dit que le **tuyau de la maison** (le Wi-Fi) fonctionne, et que le problème est **plus loin** : la box, le forfait ou l\'opérateur.',
    ] } },
  ],

  pasAPas: [
    { h2: 'Étape 1 : se connecter à un Wi-Fi' },
    { etapes: [
      'Cliquez sur l\'icône **réseau** dans la zone de notification (en bas à droite), puis sur la petite flèche **›** à côté du symbole Wi-Fi.',
      'Choisissez le nom du réseau (le **SSID**, souvent écrit sous la box), cochez **Se connecter automatiquement** pour votre réseau habituel, puis **Se connecter**.',
      'Tapez la **clé de sécurité** (le mot de passe du Wi-Fi), puis **Suivant**.',
    ] },
    { h2: 'Étape 2 : partager la connexion du téléphone' },
    { tableau: [['Téléphone', 'Chemin (les noms varient selon les marques)'], [
      ['**Android**', '**Paramètres** → **Connexions** (ou **Réseau et Internet**) → **Point d\'accès mobile et modem** → activer **Point d\'accès mobile**. Notez le nom et le mot de passe affichés.'],
      ['**iPhone**', '**Réglages** → **Partage de connexion** → activer **Autoriser d\'autres utilisateurs**.'],
    ], [1, 4]] },
    'Sur l\'ordinateur, connectez-vous à ce réseau comme à n\'importe quel Wi-Fi.',
    { encadre: { titre: '💸  Ne laissez pas Windows vider votre forfait', style: 'rouge', contenu: [
      'Une mise à jour Windows peut peser plusieurs gigaoctets. Sur un partage de connexion, déclarez le réseau comme **connexion limitée** : icône réseau → flèche du Wi-Fi → **i** (Propriétés) à côté du réseau → activez **Connexion limitée**. Windows retardera alors les gros téléchargements.',
    ] } },
    { h2: 'Étape 3 : la méthode de diagnostic en six étapes' },
    'Quand « ça ne passe pas », on suit les maillons dans l\'ordre, du plus proche au plus lointain :',
    { etapes: [
      '**L\'ordinateur est-il connecté au Wi-Fi ?** Regardez l\'icône réseau. Vérifiez que le **mode Avion** est désactivé et que le Wi-Fi est activé.',
      '**Un autre appareil a-t-il Internet ?** Essayez avec votre téléphone sur le même Wi-Fi. S\'il a Internet, le problème vient de l\'ordinateur. Sinon, il vient de la box ou de plus loin.',
      '**La box est-elle allumée, et ses voyants normaux ?** Comparez avec le guide de l\'opérateur : un voyant « Internet » rouge ou éteint signale un problème de ligne.',
      '**Le forfait est-il épuisé ? La facture est-elle payée ?** Vérifiez par l\'application ou le code de votre opérateur.',
      '**Redémarrez la box** : débranchez-la, attendez **trente secondes**, rebranchez, attendez que les voyants se stabilisent (deux à cinq minutes).',
      '**Appelez l\'opérateur**, avec les informations notées : ce qui marche, ce qui ne marche pas, la couleur des voyants, depuis quand.',
    ] },
    { tableau: [['Outil utile', 'Où'], [
      ['L\'utilitaire de résolution des problèmes de Windows', '**Paramètres** → **Système** → **Résolution des problèmes** → **Autres utilitaires de résolution des problèmes** → **Connexions Internet** → **Exécuter**'],
      ['Mesurer son débit', 'Un site de test de vitesse, par exemple **fast.com** ou **speedtest.net** : lancez le test et comparez au débit promis par votre offre.'],
    ], [2, 3]] },
    { h2: 'Étape 4 : sécuriser son Wi-Fi' },
    { puces: [
      '**Changez le mot de passe Wi-Fi** livré avec la box, surtout s\'il a été partagé avec beaucoup de monde. Cela se fait dans la **page d\'administration** de la box (son adresse et ses identifiants sont sur l\'étiquette ou dans le guide de l\'opérateur), ou dans l\'application de l\'opérateur.',
      'Choisissez la sécurité **WPA2** ou **WPA3**, jamais un réseau ouvert.',
      'Créez, si la box le permet, un **réseau invité** pour les visiteurs et les clients : ils ont Internet sans accéder à vos ordinateurs.',
      'Sur un **Wi-Fi public** (hôtel, café, gare) : pas d\'opérations bancaires ni de Mobile Money ; vérifiez le cadenas des sites ; préférez votre partage de connexion pour les opérations sensibles.',
    ] },
  ],

  pieges: {
    lignes: [
      ['🔄 Redémarrer l\'ordinateur trois fois', 'Si le problème est la box ou le forfait, cela ne change rien.', 'La méthode des six étapes, dans l\'ordre.'],
      ['🔑 Garder le mot de passe Wi-Fi d\'origine et le donner à tous', 'Des inconnus consomment votre débit, voire accèdent à vos appareils.', 'Le changer, et créer un réseau invité.'],
      ['📲 Partage de connexion sans connexion limitée', 'Windows Update vide le forfait en une matinée.', 'Activer Connexion limitée sur ce réseau.'],
      ['☕ Payer en ligne sur le Wi-Fi gratuit du café', 'Un réseau public peut être espionné ou imité.', 'Opérations sensibles sur sa propre connexion.'],
      ['📦 Cacher la box dans un placard en fer, au fond du couloir', 'Le signal Wi-Fi est bloqué.', 'Box en hauteur, au centre, dégagée.'],
    ],
    questions: [
      ['Pourquoi le Wi-Fi est-il plus lent dans la chambre du fond ?', 'Les murs, surtout en béton armé, et les objets métalliques affaiblissent le signal. Rapprochez la box, utilisez la bande 2,4 GHz pour la portée, ou installez un **répéteur Wi-Fi**.'],
      ['La fibre, la 4G, la 5G : quelle différence pour moi ?', 'La **fibre** passe par un câble jusqu\'à la maison : débit élevé et stable, idéale pour un bureau. La **4G** et la **5G** passent par les antennes : pratiques partout, mais le débit varie selon la couverture et le nombre d\'utilisateurs. Comparez les offres disponibles à votre adresse.'],
    ],
  },

  exercices: {
    echauffe: [
      { h3: 'Exercice 1 : quel maillon ?' },
      { tableau: [['Symptôme', 'Maillon probable'], [
        ['Le téléphone a Internet sur le Wi-Fi, mais pas l\'ordinateur', ''], ['Aucun appareil n\'a Internet ; le voyant « Internet » de la box est rouge', ''],
        ['« Connecté, pas d\'Internet » sur le partage de connexion ; le téléphone n\'a plus de crédit data', ''], ['Internet marche dans le salon, pas dans la chambre du fond', ''],
      ], [3.2, 1.8], C.bleu] },
    ],
    entraine: [
      { h3: 'Exercice 2 : je teste ma connexion' },
      { cases: [
        'Je mesure mon débit à deux endroits de la maison ou du bureau, et je note les résultats.',
        'Je fais un partage de connexion depuis mon téléphone et je connecte l\'ordinateur.',
        'Je déclare ce réseau en connexion limitée.',
        'Je lance l\'utilitaire de résolution des problèmes Connexions Internet.',
      ] },
    ],
    lance: [
      { h3: 'Exercice 3 : la fiche de dépannage' },
      'Rédigez, imprimez et affichez près de la box une fiche « Pas d\'Internet ? » en six étapes, avec le numéro du service client de votre opérateur et l\'emplacement de la box. Toute personne de la maison ou du bureau doit pouvoir la suivre.',
    ],
  },

  cas: [
    { h2: 'Trois appels à Koffi' },
    'Koffi est devenu le « dépanneur réseau » de son quartier. Pour chaque appel, indiquez le maillon en cause et la solution.',
    { tableau: [['Appel', 'Ce que dit la personne'], [
      ['**1. Tantie Akissi**', '« Mon ordinateur dit "connecté, pas d\'Internet". Ma nièce, sur son téléphone, n\'a rien non plus. Les lumières de la box clignotent en rouge depuis l\'orage d\'hier. »'],
      ['**2. Yao**', '« Chez moi, tout le monde a Internet sauf mon ordinateur portable. Il ne voit même plus aucun réseau Wi-Fi. »'],
      ['**3. Mariam**', '« J\'ai utilisé le partage de connexion de mon téléphone ce matin pour l\'ordinateur. À midi, plus rien, et je venais d\'acheter un forfait de 5 Go hier ! »'],
    ], [1.1, 4], C.violet] },
  ],

  retiens: [
    'La connexion est une **chaîne** : ordinateur → Wi-Fi → box → opérateur → Internet. On cherche le maillon faible **dans l\'ordre**.',
    '« Wi-Fi mais pas d\'Internet » : le problème est **après** le Wi-Fi.',
    'Les six étapes : **mode Avion** · **autre appareil** · **voyants** · **forfait** · **redémarrer la box 30 s** · **appeler l\'opérateur**.',
    '**Débit** = largeur du tuyau ; **forfait** = réservoir.',
    'Partage de connexion : **Connexion limitée** pour protéger le forfait.',
    'Wi-Fi : mot de passe changé, **WPA2/WPA3**, réseau invité. Wi-Fi public : pas d\'opérations sensibles.',
  ],
  defi: [
    'Cette semaine, affichez la fiche « Pas d\'Internet ? » près de votre box, et changez le mot de passe Wi-Fi s\'il n\'a jamais été changé.',
  ],
  motDeLaFin: 'Depuis, au secrétariat, une fiche plastifiée est collée au-dessus de la box, et la prise est marquée au feutre rouge : « Ne pas débrancher ». Koffi a rappelé le conseiller de l\'opérateur pour s\'excuser. Ils plaisantent maintenant ensemble à chaque appel.',
  quiz: [
    'Le téléphone n\'a pas Internet non plus sur le même Wi-Fi. Le problème vient probablement… **a)** de l\'ordinateur · **b)** de la box, du forfait ou de l\'opérateur · **c)** de Word.',
    'Le débit, c\'est… **a)** la largeur du tuyau · **b)** la taille du réservoir · **c)** le nom du réseau.',
    'Pour redémarrer une box correctement, on la débranche… **a)** une seconde · **b)** trente secondes · **c)** une semaine.',
    'Sur un partage de connexion, pour éviter que Windows consomme tout le forfait : **a)** Connexion limitée · **b)** mode Avion · **c)** plus de luminosité.',
  ],
  corriges: [
    ['Exercice 1', 'L\'ordinateur (Wi-Fi désactivé, mode Avion, pilote) · La box ou l\'opérateur (ligne) · Le forfait du téléphone · La portée du Wi-Fi (distance, murs).'],
    ['Cas pratique', '**1.** La box ou la ligne, probablement après l\'orage : redémarrer la box 30 secondes ; si le voyant reste rouge, appeler l\'opérateur (et vérifier qu\'un parafoudre protège la box). **2.** L\'ordinateur : vérifier le mode Avion, la touche Wi-Fi du clavier, l\'activation du Wi-Fi dans les paramètres ; redémarrer ; lancer l\'utilitaire de résolution des problèmes ; vérifier le pilote Wi-Fi dans Windows Update. **3.** Le forfait : Windows (mises à jour) ou des synchronisations ont consommé les 5 Go. Racheter un forfait et activer Connexion limitée sur ce réseau.'],
    ['Mini-quiz', '1-b · 2-a · 3-b · 4-a'],
  ],
  glossaire: [
    ['Wi-Fi', 'La liaison sans fil entre un appareil et une box ou un point d\'accès.'],
    ['Box (routeur)', 'L\'appareil fourni par l\'opérateur qui relie la maison ou le bureau à Internet.'],
    ['Débit', 'La quantité de données qui peut passer par seconde, en Mbit/s.'],
    ['Forfait data', 'La quantité totale de données qu\'on peut consommer, en Go.'],
    ['Adresse IP', 'Le numéro qui identifie un appareil sur un réseau.'],
    ['DNS', 'Le service qui traduit les noms de sites en adresses IP.'],
    ['Point d\'accès mobile', 'Le téléphone qui partage sa connexion avec d\'autres appareils en Wi-Fi.'],
    ['Connexion limitée', 'Un réglage de Windows qui réduit la consommation de données sur un réseau.'],
    ['WPA2 / WPA3', 'Les protections de sécurité recommandées pour un réseau Wi-Fi.'],
  ],
};
