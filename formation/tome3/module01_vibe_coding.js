// Tome 3 · Module 1 : Le vibe coding, c'est quoi ?
const { C } = require('../outils/livre');

module.exports = {
  num: 1,
  titre: 'Le vibe coding, c\'est quoi ?',
  sousTitre: 'Vous êtes le maître d\'ouvrage, l\'IA est le maçon',
  objectifs: [
    'expliquer ce qu\'est le **vibe coding**, d\'où il vient et ce qu\'il change ;',
    'distinguer ce que l\'IA **sait faire** et ce qu\'elle **ne sait pas faire** ;',
    'connaître les **familles d\'outils** et choisir par où commencer ;',
    'comprendre le **cycle** de travail : décrire, construire, vérifier, corriger, publier ;',
    'créer ses **comptes** et préparer son poste de travail.',
  ],
  duree: 'Trois heures', materiel: 'Un ordinateur connecté, une adresse e-mail sérieuse', prerequis: 'Tomes 1 et 2',

  situation: [
    { h2: 'Les deux millions de Koffi' },
    'Koffi veut une application pour son entreprise : ses clients prendraient rendez-vous en ligne, recevraient un rappel, et lui verrait son planning sur son téléphone. Il a demandé un devis à une agence du Plateau : **2 millions de F**, quatre mois de délai, et 50 000 F par mois de maintenance.',
    'Le soir, Yao lui montre son téléphone : « Grand-frère, regarde. Cette page de rendez-vous, je l\'ai faite cet après-midi en parlant à une IA. Elle n\'est pas finie, mais elle marche. »',
    { d: ['Koffi', 'Tu me racontes quoi ? Tu ne sais pas programmer !'] },
    { d: ['M. Kouassi', 'Il ne sait pas programmer, Koffi, c\'est vrai. Mais il sait ce qu\'il veut, il sait le décrire, et il sait vérifier. Pour beaucoup de projets, c\'est devenu l\'essentiel. Pas pour tous. Et c\'est justement ce qu\'il faut apprendre à distinguer.'] },
  ],

  declic: [
    { h2: 'Le maître d\'ouvrage et le maçon' },
    'Quand on construit une maison, le **maître d\'ouvrage**, c\'est celui qui sait ce qu\'il veut : trois chambres, une cuisine ouverte, une terrasse côté lagune. Il ne pose pas les briques lui-même. Le **maçon** construit, vite et bien… à condition de recevoir des consignes claires. Et le maître d\'ouvrage passe régulièrement sur le chantier pour **vérifier** : un mur de travers se corrige au début, pas à la fin.',
    'Dans le **vibe coding**, vous êtes le maître d\'ouvrage. L\'intelligence artificielle est le maçon. Vous décrivez en français ce que vous voulez ; elle écrit le **code**, c\'est-à-dire les instructions que comprend l\'ordinateur. Vous essayez le résultat, vous demandez des corrections, et l\'application avance.',
    { encadre: { titre: '📜  D\'où vient le mot', style: 'violet', contenu: [
      'Le 2 février 2025, l\'informaticien **Andrej Karpathy**, ancien responsable de l\'intelligence artificielle chez Tesla et cofondateur d\'OpenAI, a décrit une nouvelle façon de programmer où l\'on « se laisse porter par les vibrations » (*vibes*) et où l\'on oublie presque que le code existe. Le mot est devenu célèbre en quelques semaines. Karpathy précisait lui-même que cette manière brute convient aux petits projets « du week-end ». Ce livre vous apprend à aller plus loin, avec méthode.',
    ] } },
    { h3: 'Ce que le maçon IA sait faire, et ce qu\'il ne sait pas faire' },
    { tableau: [['L\'IA sait…', 'L\'IA ne sait pas…'], [
      ['Écrire très vite le code d\'une page, d\'un formulaire, d\'un tableau de bord', 'Deviner ce que vous voulez si vous ne le dites pas'],
      ['Proposer un design propre et adapté au téléphone', 'Connaître vos clients, vos prix, vos règles de gestion'],
      ['Corriger une erreur qu\'on lui décrit bien', 'Garantir que tout est juste et sûr : elle peut se tromper avec assurance'],
      ['Expliquer le code qu\'elle a écrit', 'Penser seule à la sécurité, aux cas particuliers, à la loi'],
      ['Relier l\'application à une base de données, à un paiement, à des e-mails', 'Assumer la responsabilité devant le client : c\'est vous'],
    ], [2.5, 2.5]] },
    { h2: 'Le cycle du vibe codeur' },
    'Tout le livre suit le même cycle, que vous répéterez des centaines de fois :',
    { tableau: [['Étape', 'Ce que vous faites', 'Module'], [
      ['1. **Décrire**', 'Penser le besoin, écrire le cahier des charges et le prompt', '2, 4'],
      ['2. **Construire**', 'Laisser l\'IA produire, par petites étapes', '5, 6'],
      ['3. **Vérifier**', 'Essayer comme un utilisateur, sur ordinateur et téléphone', '3, 10'],
      ['4. **Corriger**', 'Décrire précisément ce qui ne va pas', '7'],
      ['5. **Sauvegarder**', 'Garder chaque version qui marche', '8'],
      ['6. **Publier**', 'Mettre en ligne, à une vraie adresse', '9'],
      ['7. **Protéger et relier**', 'Sécurité, paiement, automatisations', '10, 11, 12'],
    ], [1.2, 3, 0.8], C.violet] },
  ],

  pasAPas: [
    { h2: 'Étape 1 : les familles d\'outils' },
    { tableau: [['Famille', 'Exemples', 'Pour qui, pour quoi'], [
      ['**Les constructeurs d\'applications dans le navigateur**', 'Lovable, Bolt, Replit, Google AI Studio, v0', 'Le meilleur point de départ : on décrit, l\'application apparaît avec un aperçu, on publie en un clic. C\'est l\'outil principal de ce livre.'],
      ['**Les éditeurs de code assistés par IA**', 'Cursor, Windsurf, Visual Studio Code avec un assistant', 'Plus de contrôle, pour des projets plus gros. Demande d\'installer un logiciel et de manipuler des fichiers.'],
      ['**Les agents de code**', 'Claude Code, et des agents similaires', 'Une IA qui travaille sur tout un projet, lit les fichiers, lance des commandes, propose des modifications. Puissants, à superviser de près.'],
      ['**Les services autour**', 'GitHub (sauvegarde), Vercel et Netlify (mise en ligne), Supabase et Firebase (données et comptes), Make et Zapier (automatisation)', 'Ils complètent l\'application. Nous les verrons module par module.'],
    ], [1.5, 1.6, 2.4]] },
    { encadre: { titre: '💡  Le conseil de M. Kouassi', style: 'vert', contenu: [
      '« Choisissez **un** constructeur d\'applications et restez-y pendant tout ce livre. Les outils se ressemblent : quand vous en maîtrisez un, passer à un autre prend une après-midi. Ce qui compte, c\'est la méthode. »',
    ] } },
    { h2: 'Étape 2 : préparer son poste de travail' },
    { etapes: [
      'Utilisez une adresse e-mail **dédiée** à vos projets (par exemple **prenom.nom.dev@gmail.com**), protégée par la double authentification (Tome 2, module 8).',
      'Créez un compte sur **un** constructeur d\'applications de votre choix (offre gratuite pour commencer).',
      'Créez un compte **GitHub** (github.com) : il servira à sauvegarder vos projets (module 8).',
      'Utilisez votre **gestionnaire de mots de passe** pour tous ces comptes.',
      'Créez dans Documents un dossier **Projets** et, dans votre outil de notes, un **journal de bord** : vous y noterez vos prompts réussis, vos erreurs et leurs solutions.',
    ] },
    { h2: 'Étape 3 : votre toute première création' },
    'Pour sentir la puissance de l\'outil, faites ce petit essai, sans chercher la perfection :',
    { encadre: { titre: '✍️  Prompt d\'essai', style: 'bleu', contenu: [
      '« Crée une page web d\'une seule page pour présenter Pagnes Akissi, une boutique de pagnes au marché d\'Adjamé à Abidjan. Elle doit contenir : un titre accueillant, une courte présentation, trois photos d\'exemple de pagnes avec leur prix en francs CFA, les horaires d\'ouverture et un gros bouton vert « Commander sur WhatsApp ». Couleurs chaudes : orange, vert, crème. La page doit être belle sur téléphone. »',
    ] } },
    { etapes: [
      'Collez ce prompt dans votre constructeur d\'applications et envoyez.',
      'Regardez l\'IA travailler, puis observez l\'**aperçu**.',
      'Ouvrez l\'aperçu en mode **téléphone** (icône de téléphone, ou réduisez la fenêtre).',
      'Notez dans votre journal de bord trois choses que vous aimez et trois choses que vous voudriez changer. Nous les changerons au module 5.',
    ] },
  ],

  pieges: {
    lignes: [
      ['🪄 Croire que l\'IA fait tout, toute seule', 'Applications fragiles, fausses, dangereuses.', 'Vous restez le maître d\'ouvrage : vous décidez et vous vérifiez.'],
      ['🔀 Changer d\'outil tous les trois jours', 'On n\'en maîtrise aucun.', 'Un constructeur pour tout le livre.'],
      ['🏗️ Promettre tout de suite une grosse application à un client', 'Délais intenables, client déçu.', 'Commencer par de petits projets maîtrisés.'],
      ['💸 Ignorer les coûts des abonnements et des crédits', 'Factures surprises en fin de mois.', 'Lire les offres, surveiller sa consommation.'],
      ['🙈 Ne jamais regarder le code', 'On ne comprend rien quand ça casse.', 'Le module 3 vous apprend à le lire sans l\'écrire.'],
    ],
    questions: [
      ['Faut-il quand même apprendre à programmer ?', 'Pour commencer, non. Mais plus vous comprendrez comment une application est construite, mieux vous dirigerez l\'IA. Ce livre vous donne juste ce qu\'il faut ; si le métier vous plaît, apprendre les bases de la programmation sera un excellent investissement.'],
      ['Les applications faites par IA sont-elles de vraies applications ?', 'Oui : le code produit est du vrai code, souvent avec les mêmes technologies que les professionnels. Ce qui fait la différence, c\'est la qualité de la description, des vérifications, de la sécurité et de la maintenance. C\'est votre rôle.'],
    ],
  },

  exercices: {
    echauffe: [
      { h3: 'Exercice 1 : IA ou maître d\'ouvrage ?' },
      { tableau: [['Tâche', 'L\'IA ou moi ?'], [
        ['Écrire le code du formulaire de rendez-vous', ''], ['Décider des horaires de rendez-vous disponibles', ''],
        ['Vérifier que le formulaire marche sur un vieux téléphone', ''], ['Proposer trois designs différents', ''],
        ['Garantir au client que ses données sont protégées', ''],
      ], [3.4, 1.6], C.bleu] },
    ],
    entraine: [
      { h3: 'Exercice 2 : mon poste de travail' },
      { cases: [
        'J\'ai une adresse e-mail dédiée, avec double authentification.',
        'J\'ai un compte sur un constructeur d\'applications.',
        'J\'ai un compte GitHub.',
        'Mes mots de passe sont dans mon gestionnaire.',
        'J\'ai créé mon journal de bord.',
      ] },
    ],
    lance: [
      { h3: 'Exercice 3 : trois idées' },
      'Listez trois applications simples qui rendraient service dans votre entourage (famille, quartier, association, travail). Pour chacune : pour qui, quel problème elle résout, et pourquoi personne ne l\'a encore faite.',
    ],
  },

  cas: [
    { h2: 'Agence ou vibe coding ?' },
    'Koffi hésite. Comparez les deux options pour son application de rendez-vous.',
    { etapes: [
      'Quels sont les avantages de l\'agence ? Ses inconvénients ?',
      'Quels sont les avantages du vibe coding avec Yao ? Ses risques ?',
      'Quelles questions Koffi doit-il poser à Yao avant de lui confier le projet ?',
      'Dans quel cas conseilleriez-vous quand même l\'agence ?',
    ] },
  ],

  retiens: [
    '**Vibe coding** : décrire en langage courant, l\'IA écrit le code, on vérifie et on corrige.',
    'Vous êtes le **maître d\'ouvrage**, l\'IA est le **maçon** : elle construit vite, vous décidez et vous contrôlez.',
    'Le cycle : **décrire, construire, vérifier, corriger, sauvegarder, publier, protéger**.',
    'Pour commencer : **un** constructeur d\'applications dans le navigateur, et s\'y tenir.',
    'Adresse dédiée, double authentification, gestionnaire de mots de passe, **journal de bord**.',
  ],
  defi: [
    'Cette semaine, refaites le prompt d\'essai en changeant le sujet : la page d\'un artisan, d\'une église, d\'un club de football de votre quartier. Montrez le résultat à la personne concernée et notez sa réaction.',
  ],
  motDeLaFin: 'Koffi a regardé la page de Yao sur son téléphone, longtemps. Puis il a dit : « Si tu me fais ça proprement, sécurisé, et que tu m\'expliques comment ça marche, je préfère te payer toi. » Yao a souri. Il venait de trouver son premier client. Il ne savait pas encore tout ce qu\'il lui restait à apprendre.',
  quiz: [
    'Dans le vibe coding, le code est écrit… **a)** par vous, ligne par ligne · **b)** par l\'IA, à partir de vos descriptions · **c)** par le client.',
    'Le terme vibe coding a été popularisé par… **a)** Andrej Karpathy en 2025 · **b)** Bill Gates en 1990 · **c)** un opérateur téléphonique.',
    'Qui est responsable de la sécurité de l\'application livrée au client ? **a)** l\'IA · **b)** vous · **c)** personne.',
    'Pour bien débuter, il vaut mieux… **a)** essayer dix outils à la fois · **b)** maîtriser un constructeur d\'applications · **c)** commencer par une très grosse application.',
  ],
  corriges: [
    ['Exercice 1', 'Code du formulaire : l\'IA · Horaires disponibles : moi (règle de gestion) · Vérification sur un vieux téléphone : moi · Trois designs : l\'IA · Garantie de protection des données : moi.'],
    ['Cas pratique', '**1.** Agence : expérience, équipe, garantie contractuelle, maintenance assurée ; mais coût élevé et délai long. **2.** Vibe coding : rapide, peu coûteux, ajustable facilement ; risques : sécurité, solidité, dépendance à une seule personne et à un outil. **3.** As-tu déjà livré des projets ? Comment protèges-tu les données ? Où est sauvegardé le code et à qui appartient-il ? Qui assure la maintenance, à quel prix ? Combien coûtent les abonnements des outils ? **4.** Pour un projet critique ou complexe : gros volumes de paiements, données sensibles (santé), nombreuses intégrations, obligations légales fortes.'],
    ['Mini-quiz', '1-b · 2-a · 3-b · 4-b'],
  ],
  glossaire: [
    ['Vibe coding', 'Créer des applications en décrivant ce qu\'on veut à une IA, qui écrit le code.'],
    ['Code', 'Les instructions écrites dans un langage que l\'ordinateur sait exécuter.'],
    ['Maître d\'ouvrage', 'Celui qui définit le besoin et contrôle le résultat, sans réaliser lui-même les travaux.'],
    ['Constructeur d\'applications par IA', 'Un service en ligne qui crée une application à partir de descriptions en langage courant.'],
    ['Agent de code', 'Une IA capable de travailler sur tout un projet : lire, modifier, tester, lancer des commandes.'],
    ['Aperçu (preview)', 'La version de l\'application qu\'on peut essayer pendant sa construction.'],
  ],
};
