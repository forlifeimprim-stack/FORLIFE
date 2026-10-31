// Tome 2 · Module 11 : Devenir son propre dépanneur
const { C } = require('../outils/livre');

module.exports = {
  num: 11,
  titre: 'Devenir son propre dépanneur',
  sousTitre: 'Le jour où personne n\'est là pour aider',
  objectifs: [
    'appliquer une **méthode de diagnostic** au lieu d\'essayer au hasard ;',
    'résoudre seul les **pannes les plus courantes** : son, imprimante, écran, programme figé, démarrage ;',
    '**chercher une solution** en ligne efficacement ;',
    'se faire aider **à distance** en sécurité ;',
    'savoir **quand s\'arrêter** et appeler un professionnel.',
  ],
  duree: 'Quatre heures', materiel: 'Un ordinateur, une imprimante si possible', prerequis: 'Modules 1 et 7 de ce tome',

  situation: [
    { h2: 'Samedi matin, bureau vide' },
    'Samedi, Mariam vient terminer un dossier urgent pour lundi. M. Kouassi est en voyage, le technicien est injoignable. Coup sur coup : l\'imprimante refuse d\'imprimer (« Erreur – Impression »), le son de l\'ordinateur a disparu au moment de la visioconférence avec Paris, et Word se fige avec le message « Microsoft Word ne répond pas ».',
    'Mariam commence à cliquer partout. Elle redémarre l\'imprimante, puis l\'ordinateur, puis à nouveau l\'imprimante. Elle débranche des câbles au hasard. Trente minutes plus tard, rien n\'a changé, sauf que la souris ne marche plus non plus.',
    'Elle s\'arrête, respire, et se souvient d\'une phrase de M. Kouassi : « Un dépanneur, c\'est un médecin, pas un sorcier. »',
  ],

  declic: [
    { h2: 'Dépanner, c\'est faire comme le médecin' },
    'Le médecin ne donne pas un médicament au hasard. Il **écoute** les symptômes, il **examine**, il fait une **hypothèse**, il donne **un** traitement et il **observe** le résultat. En informatique, c\'est la même chose. Retenez la méthode **OSER** :',
    { tableau: [['Lettre', 'Étape', 'Ce que je fais'], [
      ['**O**', '**Observer**', 'Je lis le message **exact**, je note quand le problème est apparu et ce qui a changé juste avant (une mise à jour, un nouveau câble, une installation). Je fais une capture d\'écran (**Windows + Maj + S**).'],
      ['**S**', '**Simplifier**', 'Les gestes simples d\'abord : redémarrer, débrancher et rebrancher **un** câble, essayer un autre port, un autre appareil.'],
      ['**E**', '**Explorer**', 'Je cherche le message d\'erreur sur Internet, j\'utilise les utilitaires de résolution des problèmes de Windows.'],
      ['**R**', '**Réparer pas à pas**', 'Une seule action à la fois, puis je vérifie. Je note ce que j\'ai fait, pour pouvoir revenir en arrière ou l\'expliquer au technicien.'],
    ], [0.6, 1.2, 3.4], C.violet] },
    { encadre: { titre: '🔑  Une chose à la fois', style: 'vert', contenu: [
      'Si vous changez trois choses en même temps et que ça remarche, vous ne saurez jamais laquelle a réglé le problème. Et si ça empire, vous ne saurez pas laquelle défaire. C\'est exactement ce qui est arrivé à Mariam avec la souris.',
    ] } },
  ],

  pasAPas: [
    { h2: 'Les pannes courantes et leurs remèdes' },
    { h3: '🔇 Plus de son' },
    { etapes: [
      'Vérifiez le **volume** (icône du son, en bas à droite) et que le son n\'est pas **coupé** dans l\'application (Meet, Teams, le lecteur vidéo).',
      'Clic sur l\'icône du son → flèche **›** à côté du volume : vérifiez que la bonne **sortie** est choisie (haut-parleurs, casque, écran HDMI…).',
      'Débranchez et rebranchez le casque ; essayez un autre port.',
      '**Paramètres** → **Système** → **Son** → en bas, **Résolution des problèmes de son courants** → **Périphériques de sortie**.',
    ] },
    { h3: '🖨️ L\'imprimante n\'imprime pas' },
    { etapes: [
      'Vérifiez l\'évidence : **allumée**, **papier**, **encre**, aucun voyant d\'erreur, porte bien fermée, pas de bourrage.',
      'Ouvrez la **file d\'attente** : **Paramètres** → **Bluetooth et appareils** → **Imprimantes et scanners** → votre imprimante → **Ouvrir la file d\'attente**. Annulez le document bloqué en tête (clic droit → **Annuler**), puis relancez l\'impression.',
      'Vérifiez que c\'est la **bonne imprimante** qui est choisie dans la fenêtre d\'impression (et pas « Microsoft Print to PDF »).',
      'Éteignez l\'imprimante trente secondes, rallumez, attendez qu\'elle soit prête.',
      'Sur la même page de paramètres : **Exécuter l\'utilitaire de résolution des problèmes**. Si besoin, réinstallez le **pilote** depuis le site officiel du fabricant.',
    ] },
    { h3: '🧊 Un programme ne répond plus' },
    { etapes: [
      'Patientez une minute : il est peut-être en train d\'enregistrer ou de calculer.',
      '**Ctrl + Maj + Échap** → **Gestionnaire des tâches** → sélectionnez le programme → **Fin de tâche**.',
      'Rouvrez-le. Word et Excel proposent souvent de **récupérer** le document (volet **Récupération de documents**).',
      'Si cela se répète : faites les mises à jour (Windows Update ; **Fichier** → **Compte** → **Options de mise à jour** dans Office), et vérifiez la mémoire disponible (module 1).',
    ] },
    { h3: '⬛ Écran noir ou figé' },
    { puces: [
      'Vérifiez la **luminosité** et, pour un écran externe, le **câble** et la source (bouton « Input » de l\'écran).',
      'Le raccourci **Windows + Ctrl + Maj + B** redémarre le pilote graphique : l\'écran clignote, un bip retentit, l\'image revient souvent.',
      'Sur un portable branché à un vidéoprojecteur : **Windows + P** pour choisir l\'affichage (Écran du PC seulement, Dupliquer, Étendre).',
    ] },
    { h3: '🔌 L\'ordinateur ne démarre pas' },
    { etapes: [
      'Vérifiez le **courant** : chargeur bien branché, voyant de charge allumé, multiprise et onduleur en marche.',
      'Débranchez **tous** les périphériques (clés USB, disques, imprimante) : un appareil branché peut bloquer le démarrage.',
      'Maintenez le bouton de marche **dix secondes**, attendez, puis rallumez.',
      'Si Windows échoue plusieurs fois, il lance tout seul la **réparation automatique**. Choisissez **Options avancées** → **Outil de redémarrage système**, ou **Restauration du système** pour revenir à un point de restauration (module 1).',
    ] },
    { h3: '🟦 L\'écran bleu' },
    'Un écran bleu (« Votre PC a rencontré un problème… ») est un arrêt d\'urgence. Notez ou photographiez le **code d\'arrêt** affiché (par exemple **CRITICAL_PROCESS_DIED**), laissez redémarrer, faites les mises à jour. S\'il revient souvent, cherchez ce code en ligne ou montrez-le au technicien.',
    { h2: 'Chercher une solution en ligne' },
    { etapes: [
      'Copiez le message d\'erreur **exact**, entre guillemets, avec le nom du logiciel : **"l\'imprimante est en état d\'erreur" Windows 11**.',
      'Privilégiez les sources fiables : **support.microsoft.com**, le site du fabricant, les grands forums d\'entraide.',
      'Vous pouvez aussi décrire le problème à un **assistant d\'IA** avec la méthode RCTF (module 10), en vérifiant ses propositions et en refusant toute manipulation que vous ne comprenez pas.',
      'Ne téléchargez **jamais** un « outil de réparation miracle » proposé par un site inconnu.',
    ] },
    { h2: 'Se faire aider à distance, en sécurité' },
    'Windows contient l\'application **Assistance rapide** (cherchez-la dans le menu Démarrer). Une personne **de confiance** peut voir votre écran, et vous aider, avec un code que **vous** lui donnez.',
    { encadre: { titre: '⚠️  L\'arnaque au faux support technique', style: 'rouge', contenu: [
      'Microsoft, votre banque ou votre opérateur ne vous appellent **jamais** pour « réparer votre ordinateur ». N\'utilisez l\'aide à distance qu\'avec une personne que **vous** avez contactée et que vous connaissez. Un inconnu qui prend la main sur votre ordinateur peut tout voler.',
    ] } },
    { h2: 'Quand appeler un professionnel' },
    { puces: [
      'Une **odeur de brûlé**, de la fumée, un appareil très chaud.',
      'Un **liquide** renversé.',
      'Un disque dur qui fait des **clics** répétés.',
      'Des **données précieuses** en jeu que vous n\'avez pas sauvegardées : n\'expérimentez pas, confiez l\'appareil à un spécialiste.',
      'Après avoir appliqué OSER sans résultat : donnez au technicien vos notes, il gagnera du temps (et vous de l\'argent).',
    ] },
  ],

  pieges: {
    lignes: [
      ['🎲 Tout essayer en même temps', 'On ne sait plus ce qui a marché, ni ce qui a empiré.', 'Une action, une vérification.'],
      ['🙈 Ne pas lire le message d\'erreur', 'On jette l\'indice le plus précieux.', 'Le lire, le noter, le photographier.'],
      ['💊 Installer un « réparateur miracle »', 'Souvent un logiciel indésirable ou une arnaque.', 'Outils de Windows et sites officiels.'],
      ['📞 Laisser un inconnu prendre la main à distance', 'Vol de données, d\'argent, rançon.', 'Assistance rapide uniquement avec une personne de confiance.'],
      ['🪛 Ouvrir l\'ordinateur sans savoir', 'Risque de casse et perte de garantie.', 'Un professionnel pour le matériel.'],
    ],
    questions: [
      ['Réinstaller Windows, c\'est la solution à tout ?', 'C\'est le dernier recours, pas le premier. **Paramètres** → **Système** → **Récupération** → **Réinitialiser ce PC** permet de garder ou non ses fichiers. Mais sauvegardez d\'abord tout (règle 3-2-1), et notez les logiciels à réinstaller.'],
      ['Comment savoir si une panne vient du matériel ou du logiciel ?', 'Un indice simple : si le problème apparaît **avant** le logo de Windows (pas d\'image, bips, rien ne s\'allume), il est souvent matériel. S\'il apparaît **après** l\'ouverture de Windows ou dans un seul programme, il est souvent logiciel.'],
    ],
  },

  exercices: {
    echauffe: [
      { h3: 'Exercice 1 : remettre OSER dans l\'ordre' },
      'Remettez ces actions de Mariam dans l\'ordre de la méthode : « Je cherche le message sur support.microsoft.com » · « Je note le message exact et je fais une capture » · « Je vide la file d\'attente puis je vérifie » · « J\'éteins l\'imprimante trente secondes ».',
      { lignes: ['1. ', '2. ', '3. ', '4. '] },
    ],
    entraine: [
      { h3: 'Exercice 2 : je connais mes outils' },
      { cases: [
        'J\'ouvre la file d\'attente de mon imprimante.',
        'Je lance l\'utilitaire de résolution des problèmes de son.',
        'Je termine un programme avec le Gestionnaire des tâches.',
        'J\'essaie Windows + P avec un écran ou un vidéoprojecteur.',
        'Je trouve l\'application Assistance rapide.',
      ] },
    ],
    lance: [
      { h3: 'Exercice 3 : mon cahier de pannes' },
      'Pendant un mois, notez chaque problème informatique rencontré (chez vous, au bureau, chez un proche) : symptôme, cause trouvée, solution. Ce cahier deviendra votre meilleur manuel.',
    ],
  },

  cas: [
    { h2: 'Les trois pannes du samedi' },
    'Reprenez les trois pannes de Mariam. Pour chacune, appliquez OSER.',
    { tableau: [['Panne', 'Ce qu\'elle observe'], [
      ['**1. L\'imprimante**', '« Erreur – Impression » dans la file d\'attente ; quatre documents en attente ; l\'imprimante est allumée, du papier est chargé.'],
      ['**2. Le son**', 'Plus de son depuis qu\'elle a branché l\'écran externe en HDMI pour la visioconférence.'],
      ['**3. Word**', '« Microsoft Word ne répond pas » au moment d\'enregistrer un document de 80 pages plein de photos. Le Gestionnaire des tâches montre la mémoire à 95 %.'],
    ], [1.2, 4], C.violet] },
    'Et la souris qui ne marche plus depuis qu\'elle a « débranché des câbles au hasard » ?',
  ],

  retiens: [
    'Un dépanneur est un **médecin**, pas un sorcier : **O**bserver, **S**implifier, **E**xplorer, **R**éparer pas à pas.',
    '**Une** action à la fois, puis on vérifie. On note tout.',
    'Son : **sortie** audio. Imprimante : **file d\'attente**. Programme figé : **Fin de tâche**. Écran : **Windows + Ctrl + Maj + B**, **Windows + P**.',
    'Je cherche le message **exact** entre guillemets, sur des sources fiables.',
    'Aide à distance : **Assistance rapide**, seulement avec une personne de confiance.',
    'Odeur de brûlé, liquide, clics du disque, données non sauvegardées : **professionnel**.',
  ],
  defi: [
    'Cette semaine, dépannez un problème chez quelqu\'un d\'autre en appliquant OSER, et expliquez-lui ce que vous avez fait. Vous êtes en train de devenir la personne-ressource de votre entourage.',
  ],
  motDeLaFin: 'À midi, l\'imprimante tournait, le son passait par l\'écran HDMI, Word avait enregistré le dossier, et la souris remarchait : son récepteur USB avait simplement été débranché dans la panique. Lundi, M. Kouassi a lu le cahier de pannes de Mariam et a dit : « Je crois que je vais vous laisser le prochain cours. »',
  quiz: [
    'Le premier réflexe face à un message d\'erreur est de… **a)** le fermer vite · **b)** le lire, le noter et le photographier · **c)** éteindre l\'ordinateur.',
    'Pour débloquer une impression, je regarde d\'abord… **a)** la file d\'attente · **b)** le fond d\'écran · **c)** la Corbeille.',
    'Un inconnu appelle « de la part de Microsoft » pour réparer votre ordinateur à distance. C\'est… **a)** un service gratuit · **b)** une arnaque · **c)** obligatoire.',
    'Pour chercher une erreur en ligne, je tape… **a)** « ça marche pas » · **b)** le message exact entre guillemets avec le nom du logiciel · **c)** mon mot de passe.',
  ],
  corriges: [
    ['Exercice 1', '1. Je note le message exact et je fais une capture (O) · 2. J\'éteins l\'imprimante trente secondes (S) · 3. Je cherche le message sur support.microsoft.com (E) · 4. Je vide la file d\'attente puis je vérifie (R).'],
    ['Cas pratique', '**1.** Annuler les documents bloqués dans la file d\'attente, éteindre l\'imprimante 30 secondes, relancer une seule impression ; sinon utilitaire de résolution des problèmes, puis pilote officiel. **2.** La sortie audio est passée sur l\'écran HDMI (souvent sans haut-parleurs ou volume à zéro) : choisir les haut-parleurs du PC ou monter le son de l\'écran. **3.** Mémoire saturée : attendre une ou deux minutes ; sinon Fin de tâche, rouvrir, récupérer le document ; fermer les autres programmes ; réduire le poids des images (Fichier → Compresser les images, selon la version) ; envisager plus de mémoire vive. **La souris** : un câble ou le récepteur USB a été débranché ; rebrancher, essayer un autre port.'],
    ['Mini-quiz', '1-b · 2-a · 3-b · 4-b'],
  ],
  glossaire: [
    ['Méthode OSER', 'Observer, Simplifier, Explorer, Réparer pas à pas : la méthode de dépannage de ce livre.'],
    ['File d\'attente d\'impression', 'La liste des documents en attente d\'impression, où l\'on peut annuler un document bloqué.'],
    ['Utilitaire de résolution des problèmes', 'Un outil de Windows qui détecte et corrige automatiquement certaines pannes courantes.'],
    ['Écran bleu', 'Un arrêt d\'urgence de Windows, avec un code d\'arrêt qui aide au diagnostic.'],
    ['Assistance rapide', 'L\'application de Windows qui permet à une personne de confiance d\'aider à distance.'],
    ['Réinitialiser ce PC', 'La réinstallation de Windows depuis les paramètres, avec ou sans conservation des fichiers.'],
  ],
};
