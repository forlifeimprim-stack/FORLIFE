// Tome 1 · Module 0 : Pourquoi moi ? Pourquoi maintenant ?
const { C } = require('../outils/livre');

module.exports = {
  num: 0,
  titre: 'Pourquoi moi ? Pourquoi maintenant ?',
  sousTitre: 'Le nouvel alphabet, et pourquoi il n\'est jamais trop tard pour l\'apprendre',
  objectifs: [
    'comprendre pourquoi ne pas savoir utiliser un ordinateur est devenu une forme d\'**illettrisme** ;',
    'me débarrasser des **idées reçues** qui m\'empêchent d\'apprendre ;',
    'savoir ce que je sais **déjà** faire grâce à mon téléphone ;',
    'fixer **mes propres objectifs** et organiser mon apprentissage.',
  ],
  duree: 'Une heure', materiel: 'Ce livre, un crayon, votre téléphone', prerequis: 'Aucun',

  situation: [
    { h2: 'Le dossier de crédit' },
    'Lundi, 8 heures. Tantie Akissi reçoit un message de sa caisse d\'épargne : « Pour votre demande de crédit de 500 000 F, merci d\'envoyer par e-mail votre pièce d\'identité, votre attestation de résidence et le relevé de vos ventes avant vendredi. »',
    'Tantie Akissi n\'a pas d\'adresse e-mail. Elle appelle son neveu Brice, qui « connaît l\'informatique ». Brice promet de passer mercredi. Mercredi, il ne vient pas. Jeudi, il demande 5 000 F « pour le cyber ». Vendredi soir, le dossier n\'est toujours pas parti.',
    'Le crédit qui devait lui permettre d\'acheter sa marchandise avant les fêtes passe à une autre commerçante.',
    { d: ['Tantie Akissi', 'Trente ans de commerce, je sais compter de tête plus vite qu\'une calculatrice. Et je perds un crédit parce que je ne sais pas envoyer un papier ?'] },
    'Ce soir-là, elle prend une décision : « Plus jamais je ne dépendrai de quelqu\'un pour ça. »',
    { encadre: { titre: '🤔  Et vous ?', style: 'bleu', contenu: [
      'Avez-vous déjà dû attendre quelqu\'un, ou payer quelqu\'un, pour une chose que vous auriez pu faire vous-même avec un ordinateur ? Notez-la ici :',
      { lignes: ['', ''] },
    ] } },
  ],

  declic: [
    { h2: 'Hier l\'alphabet, aujourd\'hui le numérique' },
    'Il y a cinquante ans, celui qui ne savait pas lire devait demander à quelqu\'un de lui lire ses lettres. Il dépendait de la bonne volonté, de l\'honnêteté et de la disponibilité des autres. On le disait **illettré**.',
    'Aujourd\'hui, les lettres sont devenues des e-mails, les guichets sont devenus des sites internet, les formulaires se remplissent en ligne et l\'argent circule par Mobile Money. Celui qui ne sait pas se servir de ces outils se retrouve dans la même situation : il dépend des autres. C\'est ce qu\'on appelle l\'**illettrisme numérique**.',
    { encadre: { titre: '📊  Les chiffres', style: 'violet', contenu: [
      'Selon le rapport *Digital 2026* de DataReportal, environ **quatre Ivoiriens sur dix** utilisent Internet. Cela veut dire que **six sur dix** ne sont pas encore en ligne. Et parmi ceux qui le sont, beaucoup n\'utilisent que WhatsApp et Facebook sur leur téléphone, sans savoir écrire une lettre, remplir un tableau ou se protéger d\'une arnaque.',
      'L\'UNESCO a même créé un cadre mondial pour mesurer ces compétences : la **littératie numérique** est désormais suivie au même titre que la lecture et le calcul.',
    ] } },
    { h3: 'Les cinq savoir-faire du citoyen numérique' },
    'Les experts européens du cadre **DigComp** ont résumé ce qu\'il faut savoir faire en cinq grandes familles. Ce livre vous les apprend toutes, une par une.',
    { tableau: [['Savoir-faire', 'Dans la vie, c\'est…', 'Modules du livre'], [
      ['🔎 **S\'informer**', 'Trouver la bonne information et reconnaître la fausse', 'Module 7'],
      ['💬 **Communiquer**', 'Écrire un e-mail, partager un document, échanger avec son téléphone', 'Modules 8 et 9'],
      ['✍️ **Créer**', 'Écrire une lettre, un CV, faire un tableau de comptes', 'Modules 5 et 6'],
      ['🛡️ **Se protéger**', 'Éviter les arnaques, protéger ses mots de passe et ses données', 'Module 10'],
      ['🧰 **Se débrouiller**', 'Utiliser l\'ordinateur, ranger ses fichiers, faire ses démarches', 'Modules 1 à 4 et 11'],
    ], [1.2, 2.4, 1]] },
    { h2: 'Les idées reçues qui empêchent d\'apprendre' },
    { tableau: [['On entend dire…', 'La vérité'], [
      ['« Je suis trop vieux pour ça. »', 'On apprend à tout âge. Les adultes apprennent même mieux quand ils voient à quoi ça sert dans leur vie. Votre expérience est un atout, pas un obstacle.'],
      ['« L\'informatique, c\'est pour les jeunes. »', 'Les jeunes sont à l\'aise avec le téléphone, mais beaucoup ne savent ni écrire une lettre sur ordinateur ni faire un tableau. Tout le monde a quelque chose à apprendre.'],
      ['« Je vais casser l\'ordinateur. »', 'On ne casse pas un ordinateur en cliquant. Le pire qui puisse arriver, c\'est d\'ouvrir une fenêtre qu\'on ne voulait pas. On la ferme, et on recommence.'],
      ['« Il faut être fort en maths. »', 'Non. Il faut savoir lire, être curieux et oser essayer. L\'ordinateur fait les calculs à votre place.'],
      ['« Il faut parler anglais. »', 'Windows, Word et Excel existent entièrement en français. Ce livre utilise uniquement la version française.'],
      ['« Un ordinateur, c\'est trop cher. »', 'Un ordinateur reconditionné coûte moins qu\'un smartphone haut de gamme. On peut aussi s\'entraîner au cybercafé ou au bureau.'],
    ], [1.3, 3]] },
  ],

  pasAPas: [
    { h2: 'Faire le point : ce que je sais déjà' },
    'Vous savez déjà beaucoup de choses sans le savoir. Votre téléphone est un ordinateur (nous le verrons au module 1). Cochez tout ce que vous savez faire avec lui.',
    { cases: [
      'Envoyer un message WhatsApp, une photo, une note vocale.',
      'Faire un appel vidéo.',
      'Envoyer ou recevoir de l\'argent par Mobile Money.',
      'Chercher une information sur Google ou regarder une vidéo sur YouTube.',
      'Installer une application.',
      'Changer le code de verrouillage de mon téléphone.',
    ] },
    'Chaque case cochée est une compétence que vous allez **retrouver** sur l\'ordinateur. Vous ne partez pas de zéro.',
    { h2: 'Bien apprendre avec ce livre' },
    { etapes: [
      '**Un peu chaque jour vaut mieux que beaucoup une fois.** Trente minutes par jour, c\'est l\'idéal. Le cerveau retient ce qu\'il répète.',
      '**Lisez avec l\'ordinateur allumé à côté de vous.** Chaque fois que le livre décrit un geste, faites-le en même temps.',
      '**Suivez l\'ordre des modules.** Chacun s\'appuie sur le précédent, comme les marches d\'un escalier.',
      '**Faites les exercices dans l\'ordre des paliers** : d\'abord 🟢 *Je m\'échauffe*, puis 🟡 *Je m\'entraîne*, enfin 🔴 *Je me lance*.',
      '**Tenez un carnet de bord.** Notez ce que vous avez appris, vos questions, vos réussites.',
      '**Trouvez un binôme.** Un ami, un voisin, un enfant qui apprend avec vous ou qui vous aide. On apprend mieux à deux.',
    ] },
  ],

  exercices: {
    echauffe: [
      { h3: 'Exercice 1 : mes trois raisons' },
      'Écrivez trois choses que vous voulez être capable de faire seul grâce à ce livre.',
      { lignes: ['1. ', '2. ', '3. '] },
    ],
    entraine: [
      { h3: 'Exercice 2 : mon contrat d\'apprentissage' },
      { encadre: { titre: '✒️  Mon contrat', contenu: [
        { lignes: ['Je m\'appelle : ', 'Je m\'engage à apprendre pendant ……… minutes par jour, de préférence le ', 'Mon binôme est : ', 'Je commence le : ', 'Ma récompense quand j\'aurai fini le livre : '] },
        'Signature : ……………………………',
      ] } },
    ],
    lance: [
      { h3: 'Exercice 3 : l\'idée reçue que je combats' },
      'Choisissez une idée reçue du tableau qui vous concernait. Expliquez avec vos mots, en trois phrases, pourquoi elle est fausse.',
      { lignes: ['', '', ''] },
    ],
  },

  cas: [
    { h2: 'Trois vies, un même besoin' },
    'Voici les trois personnes que vous allez suivre tout au long de ce livre. Pour chacune, trouvez dans le tableau des cinq savoir-faire celui dont elle a le plus besoin, et le module qui l\'aidera.',
    { tableau: [['Personne', 'Sa situation', 'Savoir-faire et module'], [
      ['**Yao**, 22 ans, étudiant à Cocody', 'Rapide sur son téléphone, il doit envoyer sa demande de stage par e-mail, avec son CV en pièce jointe.', ''],
      ['**Mariam**, 34 ans, secrétaire à Treichville', 'Elle tape encore ses courriers avec deux doigts et perd souvent ses fichiers.', ''],
      ['**Koffi**, 28 ans, secrétariat public à Yopougon', 'Un client lui a envoyé un lien pour « gagner 300 000 F en une semaine ». Il hésite.', ''],
    ], [1.2, 2.2, 1.4], C.violet] },
  ],

  retiens: [
    'Ne pas savoir utiliser l\'outil numérique, c\'est **dépendre des autres** : c\'est l\'illettrisme d\'aujourd\'hui.',
    'Les cinq savoir-faire : **s\'informer, communiquer, créer, se protéger, se débrouiller**.',
    'Je ne pars pas de zéro : mon téléphone m\'a déjà appris beaucoup de choses.',
    'On ne casse pas un ordinateur en cliquant.',
    'Trente minutes par jour, l\'ordinateur allumé à côté du livre, avec un binôme si possible.',
  ],
  defi: [
    'Cette semaine, parlez de votre projet à deux personnes de votre entourage. Dites-leur : « Je suis en train d\'apprendre l\'informatique. » Le dire à voix haute, c\'est déjà s\'engager.',
  ],
  motDeLaFin: 'Lundi suivant, Tantie Akissi achète un cahier neuf. Sur la première page, elle écrit en grand : « Carnet de bord de Madame Akissi, élève en informatique. » Puis elle souligne deux fois le mot « élève ».',
  quiz: [
    'L\'illettrisme numérique, c\'est… **a)** ne pas savoir lire · **b)** ne pas savoir utiliser les outils numériques et dépendre des autres pour cela · **c)** ne pas avoir d\'ordinateur.',
    'Combien d\'Ivoiriens sur dix utilisent Internet, environ ? **a)** deux · **b)** quatre · **c)** huit.',
    'Pour bien apprendre, il vaut mieux… **a)** trois heures une fois par mois · **b)** trente minutes par jour · **c)** lire le livre sans ordinateur.',
  ],
  corriges: [
    ['Exercices 1 à 3', 'Réponses personnelles. Relisez-les à la fin du livre : vous verrez le chemin parcouru.'],
    ['Cas pratique', '**Yao** : communiquer, module 8 (e-mail et pièce jointe), et créer, module 5 (CV).\n**Mariam** : se débrouiller et créer, modules 2 (clavier), 4 (ranger ses fichiers) et 5 (Word).\n**Koffi** : se protéger, module 10. Un gain énorme et rapide promis par un inconnu est presque toujours une arnaque.'],
    ['Mini-quiz', '1-b · 2-b · 3-b'],
  ],
  glossaire: [
    ['Illettrisme numérique', 'Le fait de ne pas savoir utiliser les outils numériques de base, et donc de dépendre des autres pour les démarches de la vie courante.'],
    ['Littératie numérique', 'L\'ensemble des savoir-faire qui permettent d\'utiliser les outils numériques avec aisance et en sécurité.'],
  ],
};
