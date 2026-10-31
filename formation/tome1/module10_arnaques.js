// Tome 1 · Module 10 : Se protéger des arnaques
const { C } = require('../outils/livre');

module.exports = {
  num: 10,
  titre: 'Se protéger des arnaques',
  sousTitre: 'Les escrocs ne cassent pas la porte : ils se la font ouvrir',
  objectifs: [
    'reconnaître les **arnaques les plus courantes** en Côte d\'Ivoire ;',
    'comprendre les **ruses** des escrocs : urgence, peur, gain, amour, autorité ;',
    'créer des **mots de passe solides** et activer la **vérification en deux étapes** ;',
    'garder l\'ordinateur protégé : **antivirus**, **mises à jour**, verrouillage ;',
    'savoir **quoi faire** si l\'on est victime.',
  ],
  duree: 'Quatre heures', materiel: 'Un ordinateur, votre téléphone', prerequis: 'Modules 1 à 9',

  situation: [
    { h2: 'Le transfert « par erreur »' },
    'Mardi, 14 heures. Tantie Akissi reçoit un SMS : « Vous avez reçu 50 000 F de KOUASSI JEAN. Nouveau solde : 52 300 F. » Deux minutes après, un appel :',
    { d: ['La voix', 'Maman, pardon, je me suis trompé de numéro, je t\'ai envoyé 50 000 F ! C\'est l\'argent de l\'hôpital de mon enfant. Renvoie-moi ça vite, Dieu va te bénir !'] },
    'La voix pleure presque. Tantie Akissi a bon cœur. Elle ouvre déjà son application… puis se souvient d\'une phrase de M. Kouassi : « **Avant de renvoyer, vérifiez votre vrai solde.** » Elle consulte son solde par le menu officiel de son opérateur : il n\'y a **aucun** nouvel argent. Le SMS était faux.',
    { d: ['Tantie Akissi', 'Ce petit-là voulait me faire pleurer pour me voler ! Et il m\'a appelée « maman » !'] },
  ],

  declic: [
    { h2: 'Votre vie numérique est une maison' },
    'Votre téléphone, vos comptes et votre ordinateur sont comme une maison : il y a des portes, des clés et un coffre.',
    { tableau: [['Dans la maison…', 'Dans votre vie numérique', 'La règle'], [
      ['La **clé** de la porte', 'Le **mot de passe** de vos comptes', 'Une clé solide, différente pour chaque porte importante.'],
      ['La clé du **coffre**', 'Le **code secret** Mobile Money, le code PIN de la carte bancaire', 'Elle ne sort **jamais** de votre poche. Même pas pour votre opérateur.'],
      ['Le **verrou en plus**', 'La **vérification en deux étapes**', 'Même avec la clé, le voleur ne rentre pas sans le code envoyé sur votre téléphone.'],
      ['Le **gardien**', 'L\'**antivirus** et les **mises à jour**', 'Il surveille et répare les fenêtres cassées.'],
    ], [1.2, 2, 2.2]] },
    { encadre: { titre: '🔑  La règle d\'or', style: 'rouge', contenu: [
      '**Votre opérateur, votre banque, la police ou l\'administration ne vous demanderont JAMAIS votre code secret, votre mot de passe ou un code reçu par SMS.** Quiconque vous le demande est un escroc. Sans exception.',
    ] } },
    { h2: 'Les cinq leviers de l\'escroc' },
    'Les « brouteurs » et autres escrocs ne sont pas des génies de l\'informatique : ce sont des **manipulateurs**. Ils ne forcent pas la porte, ils vous convainquent de l\'ouvrir. Ils jouent toujours sur l\'une de ces cinq cordes :',
    { tableau: [['Levier', 'Ce qu\'ils disent', 'Ce qu\'ils veulent'], [
      ['⏰ **L\'urgence**', '« Vite ! Vous avez 24 heures ! »', 'Vous empêcher de réfléchir et de demander conseil.'],
      ['😨 **La peur**', '« Votre compte va être bloqué ! Vous allez être arrêté ! »', 'Vous faire agir sous le choc.'],
      ['💰 **Le gain**', '« Vous avez gagné ! Doublez votre argent ! »', 'Vous aveugler par la promesse.'],
      ['❤️ **Les sentiments**', '« Mon amour… » « Maman, pardon… »', 'Toucher votre cœur pour ouvrir votre porte-monnaie.'],
      ['🎖️ **L\'autorité**', '« Ici le service client », « la police », « le ministère »', 'Que vous obéissiez sans vérifier.'],
    ], [1.1, 2.1, 2.2], C.rouge] },
    { h2: 'Les arnaques les plus courantes' },
    { tableau: [['L\'arnaque', 'Comment elle se présente', 'Comment la déjouer'], [
      ['**Le faux transfert « par erreur »**', 'Un faux SMS de dépôt, suivi d\'un appel suppliant de « renvoyer ».', 'Vérifier son **vrai solde** par le menu officiel. Ne jamais renvoyer soi-même : dire à la personne de passer par l\'opérateur.'],
      ['**Le faux service client**', 'Un appel ou un message « de votre opérateur » qui demande votre code pour « débloquer » ou « mettre à jour » votre compte.', 'Raccrocher. Appeler soi-même le numéro officiel de l\'opérateur.'],
      ['**Le code WhatsApp « envoyé par erreur »**', '« Je t\'ai envoyé un code à six chiffres par erreur, renvoie-le-moi. »', 'Ne **jamais** transmettre ce code : c\'est la clé de votre compte WhatsApp.'],
      ['**Le faux concours ou faux recrutement**', '« Places garanties dans la fonction publique », contre des « frais de dossier ».', 'Les vrais concours se font par les canaux officiels. On ne paie pas une place.'],
      ['**Le gain trop beau**', 'Loterie, cadeau, aide de l\'État, « investissement qui double en une semaine ».', 'Personne ne donne de l\'argent à un inconnu. Si c\'est trop beau, c\'est faux.'],
      ['**L\'arnaque aux sentiments**', 'Un ou une inconnue très amoureuse en ligne, qui finit par demander de l\'argent.', 'Ne jamais envoyer d\'argent à quelqu\'un qu\'on n\'a jamais rencontré.'],
      ['**Le prêt en ligne miracle**', 'Une application promet un prêt immédiat, puis exige des frais ou menace en accédant à vos contacts.', 'Passer par des établissements reconnus ; l\'ARTCI a déjà mis en garde contre certaines applications de prêt.'],
    ], [1.3, 2, 2.2]] },
  ],

  pasAPas: [
    { h2: 'Étape 1 : créer un mot de passe solide' },
    'Un bon mot de passe est **long**. La meilleure méthode : la **phrase de passe**, une petite phrase facile à retenir pour vous, impossible à deviner pour les autres.',
    { tableau: [['Mauvais', 'Pourquoi', 'Bon (exemple à ne pas copier)'], [
      ['123456', 'Le plus utilisé au monde : trouvé en une seconde.', 'MonPagneBaoule!Coute25000F'],
      ['akissi1972', 'Nom et année de naissance : faciles à deviner.', 'Le-Garba-de-7h-est-le-Meilleur'],
      ['motdepasse', 'Évident.', 'Yao#Etudie2026aCocody'],
    ], [1, 2, 2]] },
    { puces: [
      'Au moins **douze caractères**, avec des majuscules, des minuscules, des chiffres et un symbole.',
      'Un mot de passe **différent** pour l\'e-mail, les réseaux sociaux et tout ce qui touche à l\'argent.',
      'Ne le donnez **à personne**, ne l\'écrivez pas sur un papier collé à l\'écran. Un carnet rangé à la maison, c\'est acceptable au début.',
    ] },
    { h2: 'Étape 2 : activer la vérification en deux étapes' },
    { h3: 'Sur WhatsApp' },
    { etapes: [
      'WhatsApp → **Paramètres** (ou Réglages) → **Compte** → **Vérification en deux étapes** → **Activer**.',
      'Choisissez un **code PIN à six chiffres** que vous n\'utilisez nulle part ailleurs, et ajoutez votre adresse e-mail en secours.',
    ] },
    { h3: 'Sur votre compte Gmail' },
    { etapes: [
      'Allez sur **myaccount.google.com** → **Sécurité** → **Validation en deux étapes**.',
      'Suivez les instructions : Google enverra une demande de confirmation sur votre téléphone à chaque connexion depuis un nouvel appareil.',
    ] },
    { h2: 'Étape 3 : protéger l\'ordinateur' },
    { tableau: [['Je veux…', 'Chemin'], [
      ['Vérifier l\'**antivirus** (Microsoft Defender est inclus et gratuit)', 'Démarrer → tapez **Sécurité Windows** → **Protection contre les virus et menaces**. Tout doit être coché en vert.'],
      ['Lancer une **analyse**, par exemple après avoir branché une clé USB inconnue', 'Dans la même page : **Analyse rapide**. Ou clic droit sur la clé USB → **Afficher d\'autres options** → **Analyser avec Microsoft Defender**.'],
      ['Faire les **mises à jour**', 'Démarrer → **Paramètres** → **Windows Update** → **Rechercher des mises à jour**.'],
      ['**Verrouiller** quand je m\'absente', '**Windows + L**.'],
    ], [2, 3]] },
    { h2: 'Étape 4 : si je suis victime' },
    { encadre: { titre: '🚨  Les six réflexes, dans l\'ordre', style: 'rouge', contenu: [
      { etapes: [
        '**Stop** : ne plus rien envoyer, ne plus répondre à l\'escroc.',
        '**Alerter** immédiatement votre opérateur ou votre banque **par le numéro officiel** pour bloquer le compte ou la transaction.',
        '**Changer** les mots de passe des comptes concernés, en commençant par l\'e-mail.',
        '**Garder les preuves** : captures d\'écran des messages, numéros, reçus de transaction (Windows + Maj + S sur l\'ordinateur).',
        '**Porter plainte** au commissariat ou auprès de la **Plateforme de lutte contre la cybercriminalité (PLCC)**. N\'utilisez que les contacts publiés par les sites officiels du gouvernement : de fausses pages « PLCC » existent pour arnaquer les victimes une deuxième fois.',
        '**Prévenir** votre entourage, surtout si l\'escroc a pris le contrôle de votre WhatsApp ou de votre Facebook.',
      ] },
      'En Côte d\'Ivoire, la loi n° 2013-451 relative à la lutte contre la cybercriminalité punit ces escroqueries. Être victime n\'est pas une honte : porter plainte aide à arrêter les escrocs.',
    ] } },
  ],

  pieges: {
    lignes: [
      ['📞 Croire un appel parce que le nom de l\'opérateur s\'affiche', 'Les noms et numéros affichés peuvent être falsifiés.', 'Raccrocher et rappeler soi-même le numéro officiel.'],
      ['🔢 Donner le code reçu par SMS', 'C\'est la clé qui permet de vider votre compte ou de voler votre WhatsApp.', 'Ce code est pour vous seul, toujours.'],
      ['🤝 « C\'est un ami qui m\'a envoyé le lien »', 'Le compte de votre ami a peut-être été piraté.', 'Vérifier par un appel à l\'ami.'],
      ['🔁 Le même mot de passe partout', 'Un seul site piraté, et tous vos comptes tombent.', 'Des mots de passe différents pour les comptes importants.'],
      ['😶 Se taire par honte après une arnaque', 'L\'escroc continue avec d\'autres victimes, parfois vos proches.', 'Bloquer, porter plainte, prévenir.'],
    ],
    questions: [
      ['Faut-il acheter un antivirus ?', 'Pour un usage personnel, **Microsoft Defender**, inclus dans Windows 11, offre une bonne protection s\'il est actif et à jour. Méfiez-vous des fenêtres qui vous poussent à acheter un antivirus « en urgence » : c\'est souvent une arnaque.'],
      ['Comment savoir si un SMS de dépôt est vrai ?', 'Ne vous fiez jamais au SMS seul. Consultez votre solde par le **menu officiel** de votre opérateur ou son application officielle. Les vrais messages des opérateurs viennent de leur nom court officiel, mais même cela peut être imité : seul le solde fait foi.'],
    ],
  },

  exercices: {
    echauffe: [
      { h3: 'Exercice 1 : arnaque ou pas ?' },
      { tableau: [['Message reçu', 'Arnaque ?', 'Levier utilisé'], [
        ['« Votre compte Mobile Money sera suspendu dans 2 h. Appelez le 07 XX XX XX XX avec votre code secret. »', '', ''],
        ['Votre fille, depuis son numéro habituel : « Maman, je rentre à 19 h. »', '', ''],
        ['« Félicitations ! Votre numéro a gagné un iPhone 16. Payez 5 000 F de frais de livraison. »', '', ''],
        ['« Je t\'ai envoyé un code WhatsApp par erreur, peux-tu me le renvoyer ? »', '', ''],
        ['« Recrutement à la douane : places garanties, frais de dossier 150 000 F. »', '', ''],
        ['Un e-mail de votre banque vous invitant à passer en agence, sans lien ni demande de code.', '', ''],
      ], [3, 0.8, 1.2], C.bleu] },
    ],
    entraine: [
      { h3: 'Exercice 2 : ma phrase de passe' },
      'Inventez une phrase de passe d\'au moins quinze caractères, facile à retenir pour vous. **Ne l\'écrivez pas ici** : écrivez seulement la méthode utilisée (« une phrase sur mon plat préféré, avec un chiffre et un symbole »).',
      { lignes: ['Ma méthode : '] },
    ],
    lance: [
      { h3: 'Exercice 3 : je verrouille ma maison' },
      { cases: [
        'J\'active la vérification en deux étapes sur WhatsApp.',
        'J\'active la validation en deux étapes sur mon compte Gmail.',
        'Je vérifie que Sécurité Windows est tout vert et je lance une analyse rapide.',
        'Je lance Windows Update.',
        'J\'enregistre dans mon téléphone le numéro officiel du service client de mon opérateur Mobile Money.',
      ] },
    ],
  },

  cas: [
    { h2: 'L\'appel du « service client »' },
    'Le lendemain du faux transfert, Tantie Akissi reçoit un nouvel appel : « Bonjour Madame, ici le service client. Nous avons détecté une tentative de fraude sur votre compte. Pour le sécuriser, vous allez recevoir un code par SMS : lisez-le-moi pour confirmer que vous êtes bien la titulaire. »',
    { etapes: [
      'Quels **leviers** l\'escroc utilise-t-il ?',
      'Qu\'arrivera-t-il si Tantie Akissi lit le code ?',
      'Que doit-elle faire, précisément, dans les cinq minutes qui suivent ?',
      'Elle avait déjà lu le code avant de comprendre. Quels réflexes doit-elle appliquer, et dans quel ordre ?',
    ] },
  ],

  retiens: [
    'Personne de sérieux ne demande **jamais** un code secret, un mot de passe ou un code reçu par SMS.',
    'Les escrocs jouent sur **l\'urgence, la peur, le gain, les sentiments, l\'autorité**.',
    'Un dépôt se vérifie par le **solde officiel**, jamais par le SMS seul.',
    'Mot de passe = **phrase de passe** longue, différente pour chaque compte important.',
    'J\'active la **vérification en deux étapes** sur WhatsApp et Gmail.',
    'Victime ? **Stop, alerter l\'opérateur, changer les mots de passe, garder les preuves, porter plainte, prévenir.**',
  ],
  defi: [
    'Cette semaine, faites la « tournée de sécurité » de deux proches (parents, voisins, collègues) : activez avec eux la vérification en deux étapes sur WhatsApp et expliquez-leur la règle d\'or. Vous protégez votre famille.',
  ],
  motDeLaFin: 'Tantie Akissi a raccroché au nez du faux service client. Puis elle a organisé, au marché, une petite réunion de dix minutes avec les vendeuses de son allée : « Le code secret, c\'est comme la clé du coffre. On ne la donne à personne, même pas à son mari ! » Tout le monde a ri. Et personne n\'a oublié.',
  quiz: [
    'Un agent de votre opérateur vous demande votre code secret. C\'est… **a)** normal pour vérifier · **b)** une arnaque, toujours · **c)** acceptable s\'il est poli.',
    'Le meilleur mot de passe est… **a)** 123456 · **b)** votre prénom et votre année de naissance · **c)** une longue phrase de passe.',
    'Vous recevez un SMS de dépôt suivi d\'un appel pour « renvoyer l\'argent ». Vous… **a)** renvoyez vite · **b)** vérifiez votre vrai solde par le menu officiel · **c)** envoyez la moitié.',
    'Après une arnaque, le premier réflexe est de… **a)** se taire · **b)** ne plus rien envoyer et alerter l\'opérateur · **c)** payer l\'escroc pour qu\'il arrête.',
  ],
  corriges: [
    ['Exercice 1', '1 : arnaque (peur et urgence) · 2 : pas une arnaque · 3 : arnaque (gain) · 4 : arnaque (sentiments et ruse) · 5 : arnaque (gain et autorité) · 6 : probablement vrai, aucune demande de code ; en cas de doute, appeler l\'agence.'],
    ['Cas pratique', '**1.** L\'autorité (« service client »), la peur (« fraude ») et l\'urgence. **2.** L\'escroc utilisera ce code pour prendre le contrôle du compte ou valider un retrait. **3.** Raccrocher, ne rien lire, appeler elle-même le numéro officiel de son opérateur, vérifier son solde. **4.** Stop ; appeler immédiatement l\'opérateur par le numéro officiel pour bloquer le compte ; changer son code secret ; garder les preuves (numéro, heure, SMS) ; porter plainte ; prévenir son entourage.'],
    ['Mini-quiz', '1-b · 2-c · 3-b · 4-b'],
  ],
  glossaire: [
    ['Mot de passe', 'Un secret qui protège l\'accès à un compte.'],
    ['Phrase de passe', 'Un mot de passe long formé d\'une petite phrase facile à retenir.'],
    ['Vérification en deux étapes', 'Une protection qui demande, en plus du mot de passe, un code reçu sur son téléphone.'],
    ['Antivirus', 'Un logiciel qui détecte et bloque les programmes malveillants. Microsoft Defender est inclus dans Windows.'],
    ['Virus informatique', 'Un programme malveillant qui s\'installe à votre insu pour nuire, espionner ou voler.'],
    ['Hameçonnage', 'Une arnaque par message ou faux site qui imite un organisme de confiance pour voler des codes. On dit aussi « phishing ».'],
    ['Brouteur', 'En Côte d\'Ivoire, nom courant donné aux escrocs qui opèrent sur Internet.'],
    ['PLCC', 'La Plateforme de lutte contre la cybercriminalité, service de police spécialisé.'],
  ],
};
