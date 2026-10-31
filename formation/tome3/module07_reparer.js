// Tome 3 · Module 7 : Quand ça ne marche pas, réparer avec l'IA
const { C } = require('../outils/livre');

module.exports = {
  num: 7,
  titre: 'Quand ça ne marche pas : réparer avec l\'IA',
  sousTitre: 'Chez le médecin, on décrit bien ses symptômes',
  objectifs: [
    'trouver et lire un **message d\'erreur** (aperçu, console, journaux) ;',
    'décrire un problème à l\'IA avec la méthode **SAVE** ;',
    'demander un **diagnostic** avant une correction ;',
    'sortir de la **boucle infernale** « corrige, ça casse ailleurs » ;',
    'tenir un **carnet de bugs**.',
  ],
  duree: 'Quatre heures', materiel: 'Votre projet, le navigateur Chrome ou Edge', prerequis: 'Modules 1 à 6 ; Tome 2, module 11',

  situation: [
    { h2: 'La boucle infernale de Yao' },
    'La veille de la réunion de la tontine, l\'écran « Ma situation » affiche une page blanche. Yao écrit à l\'IA : « Ça marche pas, corrige. » L\'IA modifie trois fichiers. Maintenant, la page s\'affiche, mais la connexion ne marche plus. « Corrige la connexion. » La connexion revient, mais les montants affichent « NaN F ». « Corrige les montants. » La page redevient blanche.',
    'Deux heures, vingt-trois messages, et l\'application est en pire état qu\'au départ.',
    { d: ['Yao', 'L\'IA tourne en rond, et moi avec !'] },
    { d: ['M. Kouassi', 'Tu ne l\'aides pas, Yao. Tu lui dis « j\'ai mal » sans dire où, depuis quand, ni ce que tu as mangé. Même le meilleur médecin donnerait des médicaments au hasard. Et quand un traitement empire les choses, on arrête le traitement : on revient à la dernière fois où le patient allait bien.'] },
  ],

  declic: [
    { h2: 'Le bon patient fait le bon diagnostic' },
    'L\'IA corrige très bien… ce qu\'elle comprend. Votre rôle est d\'être le **meilleur patient du monde** : précis, factuel, avec les résultats d\'analyse. Retenez la méthode **SAVE** :',
    { tableau: [['Lettre', 'Ce que je donne', 'Exemple'], [
      ['**S**', '**Symptôme** : ce que je vois, exactement', '« L\'écran Ma situation est entièrement blanc. »'],
      ['**A**', '**Action** : ce que je faisais, pour le reproduire', '« Je me connecte avec le compte de Bintou, puis je touche Ma situation. »'],
      ['**V**', '**Voulu** : ce qui devrait se passer', '« Je devrais voir son total versé et sa date de passage. »'],
      ['**E**', '**Erreur** : le message exact (console, aperçu) et ce qui a changé récemment', '« Console : TypeError: Cannot read properties of undefined (reading \'montant\'). Le problème est apparu après l\'ajout des semaines. »'],
    ], [0.6, 2, 2.6], C.violet] },
    { h3: 'Où trouver les messages d\'erreur' },
    { tableau: [['Endroit', 'Ce qu\'on y trouve'], [
      ['**L\'aperçu de l\'outil**', 'Souvent un bandeau rouge avec l\'erreur, et un bouton « Corriger » ou « Try to fix »'],
      ['**La console du navigateur** (F12 → Console)', 'Les erreurs de l\'interface, en rouge'],
      ['**L\'onglet Réseau** (F12 → Network ou Réseau)', 'Les demandes au serveur qui échouent (codes 400, 401, 403, 500…)'],
      ['**Les journaux (logs)** du service de données ou de l\'hébergeur', 'Les erreurs du serveur et de la base de données'],
    ], [2, 3]] },
    { tableau: [['Code', 'Ce qu\'il veut dire, en mots simples'], [
      ['**401**', 'Vous n\'êtes pas connecté (pas de badge).'],
      ['**403**', 'Vous êtes connecté, mais pas autorisé (badge refusé à cette porte). Souvent une règle d\'accès.'],
      ['**404**', 'Introuvable : la page ou la donnée n\'existe pas à cette adresse.'],
      ['**500**', 'Erreur dans l\'arrière-boutique : le serveur a planté en traitant la demande.'],
    ], [0.8, 4.2]] },
  ],

  pasAPas: [
    { h2: 'Étape 1 : observer et reproduire' },
    { etapes: [
      'Notez précisément le symptôme et faites une **capture d\'écran**.',
      'Essayez de **reproduire** le problème : arrive-t-il à chaque fois ? Avec tous les comptes ? Sur téléphone et ordinateur ?',
      'Ouvrez la **console** (F12) et copiez le message rouge **en entier**.',
      'Demandez-vous : **qu\'est-ce qui a changé** juste avant que le problème apparaisse ?',
    ] },
    { h2: 'Étape 2 : demander un diagnostic, pas une correction' },
    { encadre: { titre: '✍️  Prompt de diagnostic (en mode plan)', style: 'bleu', contenu: [
      '« Ne modifie rien pour l\'instant. **Symptôme** : [ce que je vois]. **Action** : [comment le reproduire]. **Voulu** : [ce qui devrait se passer]. **Erreur** : [message exact de la console]. **Changement récent** : [ce qui a été fait juste avant]. Explique-moi la cause la plus probable, les autres causes possibles, et la correction la plus petite possible. »',
    ] } },
    'Lisez l\'explication. Si elle a du sens, demandez : « Applique uniquement cette correction, sans rien modifier d\'autre. » Puis **vérifiez**.',
    { h2: 'Étape 3 : sortir de la boucle infernale' },
    'Si, après **trois** tentatives, le problème persiste ou se déplace, arrêtez-vous. Continuer, c\'est empiler les médicaments.',
    { etapes: [
      '**Revenez** à la dernière version qui marchait (historique de l\'outil, ou GitHub au module 8).',
      'Demandez à l\'IA d\'**expliquer** le fonctionnement de la partie concernée, avant tout changement.',
      'Découpez : refaites la modification en **plus petites étapes**, en vérifiant après chacune.',
      'Si besoin, faites **ajouter des messages de suivi** : « Ajoute des messages dans la console qui affichent les données reçues à chaque étape de cette page. » Vous verrez où ça se casse.',
      'Changez d\'angle : décrivez le problème à **un autre assistant** d\'IA, ou ouvrez une **nouvelle conversation** en résumant la situation : une discussion trop longue embrouille parfois l\'IA.',
    ] },
    { h2: 'Étape 4 : le carnet de bugs' },
    'Dans votre journal de bord, tenez un tableau simple. Il vous fera gagner des heures sur les projets suivants.',
    { tableau: [['Date', 'Symptôme', 'Cause trouvée', 'Solution', 'Prompt qui a marché'], [
      ['12/11', 'Ma situation : page blanche', 'Semaine sans versement : montant indéfini', 'Afficher 0 F si aucun versement', '« Gère le cas où… »'],
      ['', '', '', '', ''],
    ], [0.6, 1.3, 1.4, 1.3, 1.4], C.vert] },
    { img: 'console_save', illus: 'Capture d\'écran : la console du navigateur avec une erreur rouge « TypeError: Cannot read properties of undefined », la ligne concernée surlignée, et à côté la fenêtre de l\'outil de vibe coding avec le prompt de diagnostic SAVE.' },
  ],

  pieges: {
    lignes: [
      ['😤 « Ça marche pas, corrige »', 'L\'IA devine et modifie au hasard.', 'La méthode SAVE.'],
      ['🔁 Enchaîner vingt corrections', 'Le code devient un plat de spaghettis.', 'Trois essais maximum, puis retour à la dernière version qui marchait.'],
      ['🙈 Ne pas ouvrir la console', 'On se prive du message qui donne la réponse.', 'F12 → Console, à chaque problème.'],
      ['✂️ Copier une partie du message d\'erreur', 'L\'information utile est souvent dans la partie coupée.', 'Copier le message en entier.'],
      ['🔐 Coller des clés secrètes dans la discussion pour « aider l\'IA »', 'Les secrets sortent de votre contrôle.', 'Remplacer toute valeur secrète par « [CLÉ] ».'],
    ],
    questions: [
      ['Le bouton « Corriger automatiquement » de mon outil, je l\'utilise ?', 'Oui, pour une erreur simple et isolée : il transmet le message exact à l\'IA. Mais si le problème revient ou se déplace, reprenez la main avec la méthode SAVE et le mode plan.'],
      ['Comment savoir si l\'erreur vient de mon code ou d\'un service extérieur ?', 'Regardez l\'onglet Réseau : si la demande à un service (paiement, base de données) renvoie une erreur, le problème est dans la liaison ou dans le réglage de ce service. Consultez aussi la page d\'état de ce service (souvent appelée « status ») : il est peut-être en panne pour tout le monde.'],
    ],
  },

  exercices: {
    echauffe: [
      { h3: 'Exercice 1 : SAVE ou pas SAVE ?' },
      'Réécrivez ces demandes avec la méthode SAVE (inventez les détails réalistes).',
      { lignes: ['« Le formulaire bug. » → ', '« Les prix sont faux. » → '] },
    ],
    entraine: [
      { h3: 'Exercice 2 : le bug provoqué' },
      'Demandez à votre binôme de casser volontairement quelque chose dans une copie de votre projet (sans vous dire quoi). Trouvez le problème avec la console et la méthode SAVE, et notez-le dans votre carnet de bugs.',
    ],
    lance: [
      { h3: 'Exercice 3 : sortir de la boucle' },
      'Pour le prochain problème qui résiste à trois essais dans votre projet, appliquez les cinq étapes de l\'étape 3 et racontez dans votre journal ce qui a finalement débloqué la situation.',
    ],
  },

  cas: [
    { h2: 'Les « NaN F » de la tontine' },
    'Sur le tableau de bord de la trésorière, le total de la semaine affiche **NaN F** depuis que Yao a ajouté la possibilité de saisir « 10 000 » avec un espace. La console n\'affiche aucune erreur rouge.',
    { etapes: [
      'Que signifie probablement « NaN » ? (Indice : demandez-le à l\'IA.)',
      'Quel changement récent est suspect ?',
      'Rédigez le prompt de diagnostic SAVE.',
      'Quelle correction durable proposer pour que cela ne se reproduise pas, même si quelqu\'un tape « 10.000 » ou « 10 000 F » ?',
    ] },
  ],

  retiens: [
    'Le message d\'erreur est votre meilleur ami : **aperçu**, **console** (F12), **onglet Réseau**, **journaux**.',
    'Méthode **SAVE** : Symptôme, Action, Voulu, Erreur (et ce qui a changé).',
    'D\'abord un **diagnostic** (mode plan), ensuite la **plus petite** correction, puis vérifier.',
    'Trois essais sans succès : **revenir** à la dernière version qui marchait, découper, ajouter des messages de suivi.',
    'Un **carnet de bugs** : symptôme, cause, solution, prompt.',
  ],
  defi: [
    'Cette semaine, notez dans votre carnet chaque problème rencontré, même petit. À la fin de la semaine, relisez-le : quels types d\'erreurs reviennent le plus ?',
  ],
  motDeLaFin: 'Yao est revenu à la version de la veille. Il a ouvert la console, lu le message, et écrit un prompt SAVE de six lignes. L\'IA a répondu : « La semaine 12 n\'a encore aucun versement, le montant est indéfini. » Une correction de deux lignes. Une minute. Yao a collé la phrase de M. Kouassi au-dessus de son écran : « Le bon patient fait le bon diagnostic. »',
  quiz: [
    'Les erreurs de l\'interface s\'affichent dans… **a)** la console du navigateur · **b)** la Corbeille · **c)** le README.',
    'Dans SAVE, le V signifie… **a)** Version · **b)** Voulu · **c)** Vite.',
    'Un code 403 signifie… **a)** page introuvable · **b)** connecté mais pas autorisé · **c)** tout va bien.',
    'Après trois corrections qui ne marchent pas, je… **a)** continue jusqu\'à cinquante · **b)** reviens à la dernière version qui marchait et je découpe · **c)** supprime le projet.',
  ],
  corriges: [
    ['Exercice 1', 'Exemple : « Symptôme : quand je clique sur Enregistrer dans le formulaire de versement, rien ne se passe. Action : compte trésorière, page Saisie, membre Bintou, montant 10 000, Enregistrer. Voulu : le versement apparaît dans la liste et un message de confirmation s\'affiche. Erreur : console « 403 Forbidden » sur la requête versements. Changement récent : ajout des règles d\'accès hier. »'],
    ['Cas pratique', '**1.** « Not a Number » : le calcul a reçu quelque chose qui n\'est pas un nombre. **2.** La saisie avec espace : « 10 000 » est enregistré comme du texte. **3.** « Symptôme : le total de la semaine affiche NaN F. Action : compte trésorière, saisie d\'un versement “10 000” avec espace, retour au tableau de bord. Voulu : total en nombre, par exemple 80 000 F. Erreur : aucune dans la console. Changement récent : autorisation de l\'espace dans le montant. Explique la cause et la correction la plus petite. » **4.** Nettoyer la saisie (garder seulement les chiffres) avant l\'enregistrement, enregistrer le montant en nombre entier dans la base, et afficher le format avec espaces seulement à l\'écran ; corriger aussi les versements déjà enregistrés en texte.'],
    ['Mini-quiz', '1-a · 2-b · 3-b · 4-b'],
  ],
  glossaire: [
    ['Bug', 'Un défaut qui empêche une application de fonctionner comme prévu.'],
    ['Console', 'L\'onglet des outils de développement qui affiche les messages et les erreurs d\'une page.'],
    ['Journaux (logs)', 'Les traces écrites de ce qui se passe sur un serveur ou un service.'],
    ['Code d\'état HTTP', 'Un nombre qui résume la réponse d\'un serveur : 401, 403, 404, 500…'],
    ['Méthode SAVE', 'Symptôme, Action, Voulu, Erreur : pour décrire un problème à l\'IA.'],
    ['NaN', '« Not a Number » : le résultat d\'un calcul fait avec une valeur qui n\'est pas un nombre.'],
    ['Carnet de bugs', 'Le tableau personnel des problèmes rencontrés, de leurs causes et de leurs solutions.'],
  ],
};
