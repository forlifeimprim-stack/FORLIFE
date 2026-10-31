// Tome 1 · Module 8 : La poste électronique (e-mail)
const { C } = require('../outils/livre');

module.exports = {
  num: 8,
  titre: 'La poste électronique (e-mail)',
  sousTitre: 'La lettre qui fait le tour du monde en une seconde',
  objectifs: [
    'comprendre ce qu\'est une **adresse e-mail** et comment elle est construite ;',
    'créer une adresse **Gmail** sérieuse et s\'y connecter ;',
    '**écrire**, **répondre**, **transférer** un e-mail et y **joindre** un fichier ;',
    'écrire un e-mail **poli et professionnel** ;',
    'organiser sa boîte et **se déconnecter** sur un ordinateur partagé.',
  ],
  duree: 'Quatre heures', materiel: 'Un ordinateur connecté, votre téléphone (pour la vérification du compte)', prerequis: 'Modules 1 à 7',

  situation: [
    { h2: 'L\'adresse de Yao' },
    'Pour son stage, Yao doit envoyer son CV par e-mail. Il ouvre fièrement sa boîte… créée en classe de quatrième : **yao.lebogoss.du.225@…**. M. Kouassi lève un sourcil.',
    'Puis Yao écrit son message : pas d\'objet, pas de bonjour, « voici mon cv », et il clique sur **Envoyer**. Trois secondes plus tard, il se rend compte qu\'il a oublié de joindre le CV.',
    { d: ['Yao', 'C\'est pas grave, je renvoie !'] },
    { d: ['M. Kouassi', 'Yao, un e-mail, c\'est une lettre. Le responsable va voir une adresse de lycéen, un message sans objet, sans politesse, puis un deuxième message. Tu serais lui, tu choisirais quel stagiaire ?'] },
  ],

  declic: [
    { h2: 'L\'e-mail, c\'est la poste, en mille fois plus rapide' },
    'Un **e-mail** (on dit aussi **courriel**) est une lettre qui voyage par Internet. Elle arrive en quelques secondes, gratuitement, n\'importe où dans le monde, et elle peut transporter des documents, des photos, des fichiers.',
    { tableau: [['À la poste…', 'Dans la messagerie…'], [
      ['L\'adresse sur l\'enveloppe', 'L\'**adresse e-mail** du destinataire, dans la case **À**'],
      ['Le motif écrit au dos de l\'enveloppe', 'L\'**objet** : le sujet du message, en quelques mots'],
      ['La lettre', 'Le **message**'],
      ['Les documents glissés dans l\'enveloppe', 'Les **pièces jointes**, ajoutées avec le trombone 📎'],
      ['La boîte aux lettres', 'La **boîte de réception**'],
      ['Les prospectus et publicités', 'Les **spams** (courriers indésirables), rangés à part'],
      ['Une photocopie envoyée pour information', 'La copie : **Cc** ; la copie discrète : **Cci**'],
    ], [2, 3]] },
    { h3: 'Une adresse e-mail, c\'est « quelqu\'un chez quelqu\'un »' },
    'Prenons **akissi.kouame@gmail.com** :',
    { puces: [
      '**akissi.kouame** : le nom de la personne, choisi à la création ;',
      '**@** : se lit « arobase » et veut dire « **chez** » ;',
      '**gmail.com** : le fournisseur, la « poste » qui gère la boîte (Gmail, Outlook, Yahoo…).',
    ] },
    'Une adresse ne contient **jamais d\'espace** et ne prend pas d\'accent. Majuscules et minuscules n\'ont pas d\'importance.',
    { encadre: { titre: '🔑  Votre adresse, c\'est votre carte de visite', style: 'vert', contenu: [
      'Pour tout usage sérieux (emploi, administration, banque, clients), choisissez une adresse **prénom.nom** : **mariam.kone@gmail.com**. Gardez « bogoss », « princesse » et « 225 du bled » pour vos amis.',
    ] } },
  ],

  pasAPas: [
    { h2: 'Étape 1 : créer une adresse Gmail' },
    { etapes: [
      'Ouvrez le navigateur et allez sur **accounts.google.com**. Cliquez sur **Créer un compte**, puis **Pour mon usage personnel**.',
      'Saisissez votre **prénom** et votre **nom**, puis votre **date de naissance** et votre **genre**.',
      'Choisissez votre adresse. Si **prenom.nom** est déjà prise, essayez **prenom.nom** suivi de votre année de naissance, ou l\'initiale d\'un second prénom.',
      'Créez un **mot de passe solide** (au moins douze caractères, voir module 10). Notez-le dans un carnet rangé en lieu sûr.',
      'Google vous demande votre **numéro de téléphone** pour vérifier votre identité et vous aider si vous oubliez votre mot de passe : saisissez-le et entrez le code reçu par SMS.',
      'Acceptez les conditions. Votre boîte est prête : elle s\'ouvre sur **gmail.com**.',
    ] },
    { h2: 'Étape 2 : écrire et envoyer un e-mail' },
    { img: 'gmail', illus: 'Capture d\'écran de Gmail annotée : le bouton « Nouveau message », la boîte de réception, la fenêtre de rédaction avec les champs À, Objet, le corps du message, le trombone pour joindre un fichier et le bouton bleu « Envoyer ».' },
    { etapes: [
      'Cliquez sur **Nouveau message** (en haut à gauche, avec un crayon).',
      'Dans **À**, tapez l\'adresse du destinataire.',
      'Dans **Objet**, écrivez le sujet en quelques mots : « Candidature au stage d\'assistant commercial ».',
      'Écrivez votre message (voir le modèle ci-dessous).',
      'Pour joindre un fichier : cliquez sur le **trombone** 📎 en bas, trouvez le fichier dans vos dossiers, double-cliquez. Attendez que son nom s\'affiche en bas du message.',
      '**Relisez tout**, vérifiez la pièce jointe, puis cliquez sur **Envoyer**.',
    ] },
    { encadre: { titre: '✉️  Le modèle d\'e-mail professionnel', style: 'violet', contenu: [
      '**Objet** : Candidature au stage d\'assistant commercial, Yao Kouamé',
      'Madame, Monsieur,',
      'Étudiant en deuxième année de licence de gestion, je vous adresse ma candidature pour le stage d\'assistant commercial proposé par votre entreprise.',
      'Vous trouverez ci-joint mon CV et ma lettre de motivation. Je reste à votre disposition pour un entretien.',
      'Je vous prie d\'agréer, Madame, Monsieur, mes salutations distinguées.',
      'Yao Kouamé',
      'Tél. : 07 00 00 00 00',
    ] } },
    { h2: 'Étape 3 : répondre, transférer, organiser' },
    { tableau: [['Je veux…', 'Je fais…'], [
      ['**Répondre** à l\'expéditeur', 'J\'ouvre le message → **Répondre** (flèche courbe vers la gauche)'],
      ['Répondre à **tous** les destinataires', '**Répondre à tous**, seulement si tous sont concernés'],
      ['**Transférer** un message à quelqu\'un d\'autre', '**Transférer** (flèche vers la droite) ; les pièces jointes suivent'],
      ['**Retrouver** un ancien message', 'Je tape un nom ou un mot dans la barre **Rechercher** en haut'],
      ['**Classer** un message', 'Je l\'**archive** (il quitte la boîte de réception, mais reste retrouvable) ou je lui ajoute un **libellé**'],
      ['Ajouter une **signature** automatique', 'Roue dentée ⚙️ → **Voir tous les paramètres** → **Signature**'],
    ], [1.7, 3.3]] },
    { h2: 'Étape 4 : se déconnecter' },
    'Sur un ordinateur **partagé** (cybercafé, bureau, ordinateur d\'un ami) : cliquez sur votre **photo ou votre initiale** en haut à droite → **Se déconnecter**. Sinon, la personne suivante aura accès à tous vos messages.',
  ],

  pieges: {
    lignes: [
      ['📭 Envoyer un message sans objet', 'Il ressemble à un spam ; il risque de ne jamais être lu.', 'Un objet court et précis, toujours.'],
      ['📎 Oublier la pièce jointe', 'On passe pour quelqu\'un de distrait.', 'Joindre le fichier **avant** d\'écrire le message.'],
      ['👥 « Répondre à tous » par réflexe', 'Tout le monde reçoit une réponse qui ne le concerne pas, parfois gênante.', 'Répondre seulement à l\'expéditeur, sauf besoin réel.'],
      ['🪪 Rester connecté au cybercafé', 'Le client suivant lit vos messages, voire usurpe votre identité.', 'Se déconnecter, toujours.'],
      ['📩 Ouvrir la pièce jointe d\'un inconnu', 'Elle peut contenir un virus.', 'Ne pas ouvrir ; supprimer (module 10).'],
    ],
    questions: [
      ['Je n\'ai pas reçu un e-mail qu\'on m\'a envoyé. Pourquoi ?', 'Regardez dans le dossier **Spam** (à gauche, parfois sous **Plus**). Si le message s\'y trouve, ouvrez-le et cliquez sur **Signaler comme non-spam**.'],
      ['Puis-je annuler un e-mail envoyé par erreur ?', 'Gmail laisse quelques secondes : un bandeau **Annuler** apparaît en bas à gauche juste après l\'envoi. Passé ce délai, c\'est trop tard : d\'où l\'importance de relire.'],
    ],
  },

  exercices: {
    echauffe: [
      { h3: 'Exercice 1 : adresse valide ou pas ?' },
      { tableau: [['Adresse', 'Valide ?', 'Professionnelle ?'], [
        ['mariam.kone@gmail.com', '', ''], ['koffi yao@gmail.com', '', ''], ['akissi.kouamé@outlook.com', '', ''],
        ['princesse.du.07@yahoo.fr', '', ''], ['y.kouame2004@gmail.com', '', ''],
      ], [2.4, 1, 1.4], C.bleu] },
    ],
    entraine: [
      { h3: 'Exercice 2 : je m\'écris à moi-même' },
      { cases: [
        'Je m\'envoie un e-mail avec un objet, un message poli et mon CV en pièce jointe.',
        'Je l\'ouvre dans ma boîte de réception et j\'ouvre la pièce jointe.',
        'Je le transfère à mon binôme.',
        'Je crée ma signature automatique (nom, téléphone).',
        'Je me déconnecte, puis je me reconnecte.',
      ] },
    ],
    lance: [
      { h3: 'Exercice 3 : l\'e-mail de réclamation' },
      'Votre facture d\'électricité de ce mois est anormalement élevée. Rédigez un e-mail de réclamation poli et précis : objet, formule d\'appel, les faits (numéro de compteur, période, montant), votre demande, une formule de politesse, votre signature, la facture en pièce jointe. Envoyez-le à votre binôme pour relecture.',
    ],
  },

  cas: [
    { h2: 'Réparer l\'e-mail de Yao' },
    'Voici l\'e-mail envoyé par Yao :',
    { encadre: { style: 'bleu', contenu: [
      '**De** : yao.lebogoss.du.225@…  ·  **Objet** : (vide)',
      'voici mon cv',
      '*(aucune pièce jointe)*',
    ] } },
    { etapes: [
      'Relevez **toutes** les erreurs (il y en a au moins cinq).',
      'Rédigez la version corrigée, complète et professionnelle.',
      'Que doit faire Yao maintenant, puisque le premier message est déjà parti ?',
    ] },
  ],

  retiens: [
    'Une adresse e-mail = **nom @ fournisseur**. L\'arobase veut dire « chez ». Pas d\'espace, pas d\'accent.',
    'Pour un usage sérieux : une adresse **prenom.nom**.',
    'Un bon e-mail : **objet** précis, **formule d\'appel**, message court, **formule de politesse**, **signature**.',
    'Le **trombone** 📎 joint un fichier : je le joins **avant** d\'écrire, je vérifie avant d\'envoyer.',
    '**Répondre** ≠ **Répondre à tous**. **Transférer** envoie le message à quelqu\'un d\'autre.',
    'Sur un ordinateur partagé, je me **déconnecte** toujours.',
  ],
  defi: [
    'Cette semaine, envoyez au moins **trois vrais e-mails** : un à un proche avec une photo, un à un professionnel ou une administration, et un pour transférer une information utile. Vérifiez chaque fois l\'objet et la politesse.',
  ],
  motDeLaFin: 'Yao a créé une nouvelle adresse, yao.kouame.pro@gmail.com, et renvoyé un message impeccable, avec un mot d\'excuse pour le premier envoi. La réponse est arrivée le lendemain à 8 h 12 : « Bien reçu, Monsieur Kouamé. » Monsieur ! Yao l\'a relue cinq fois.',
  quiz: [
    'Dans une adresse e-mail, le signe @ veut dire… **a)** « et » · **b)** « chez » · **c)** « à propos ».',
    'Pour joindre un fichier, je clique sur… **a)** le trombone · **b)** la poubelle · **c)** l\'étoile.',
    'Un message important n\'arrive pas. Je regarde d\'abord… **a)** dans les Spams · **b)** dans la Corbeille de Windows · **c)** sur Facebook.',
    'Au cybercafé, avant de partir, je… **a)** ferme simplement l\'onglet · **b)** me déconnecte de ma boîte · **c)** éteins l\'écran.',
  ],
  corriges: [
    ['Exercice 1', 'mariam.kone@gmail.com : valide, professionnelle · koffi yao@… : non valide (espace) · akissi.kouamé@… : à éviter (accent, souvent refusé) · princesse.du.07@… : valide, pas professionnelle · y.kouame2004@gmail.com : valide, acceptable.'],
    ['Cas pratique', '**1.** Adresse non professionnelle ; objet vide ; pas de formule d\'appel ; message trop court, sans majuscule ni ponctuation ; pas de formule de politesse ; pas de signature ni de téléphone ; pièce jointe oubliée. **2.** Voir le modèle d\'e-mail professionnel du module. **3.** Renvoyer rapidement un message complet, avec la pièce jointe, en commençant par une phrase d\'excuse : « Veuillez excuser mon précédent envoi, incomplet. »'],
    ['Mini-quiz', '1-b · 2-a · 3-a · 4-b'],
  ],
  glossaire: [
    ['E-mail (courriel)', 'Un message électronique envoyé d\'une adresse à une autre par Internet.'],
    ['Adresse e-mail', 'L\'identifiant d\'une boîte aux lettres électronique : nom@fournisseur.'],
    ['Objet', 'Le sujet d\'un e-mail, en quelques mots.'],
    ['Pièce jointe', 'Un fichier envoyé avec un e-mail.'],
    ['Spam', 'Un courrier indésirable : publicité, arnaque, message non sollicité.'],
    ['Cc / Cci', 'Copie visible de tous (Cc) ou copie cachée (Cci) d\'un e-mail.'],
    ['Transférer', 'Renvoyer à quelqu\'un un e-mail reçu, avec ses pièces jointes.'],
    ['Se déconnecter', 'Fermer sa session sur un site, pour que personne ne puisse l\'utiliser après soi.'],
  ],
};
