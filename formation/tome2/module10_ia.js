// Tome 2 · Module 10 : L'intelligence artificielle, mon nouvel assistant
const { C } = require('../outils/livre');

module.exports = {
  num: 10,
  titre: 'L\'intelligence artificielle, mon nouvel assistant',
  sousTitre: 'Un stagiaire brillant, rapide… et qui invente parfois',
  objectifs: [
    'comprendre ce qu\'est un **assistant d\'intelligence artificielle** et comment il fonctionne ;',
    'écrire une bonne **demande** (on dit un **prompt**) avec la méthode **RCTF** ;',
    'utiliser l\'IA pour **rédiger**, **résumer**, **traduire**, **reformuler** et **apprendre** ;',
    '**vérifier** ce que l\'IA produit et repérer ses **inventions** ;',
    'respecter la **confidentialité**, l\'**honnêteté** et le **droit d\'auteur**.',
  ],
  duree: 'Quatre heures', materiel: 'Un ordinateur connecté, un compte sur un assistant d\'IA (Microsoft Copilot, ChatGPT, Claude ou Gemini)', prerequis: 'Tome 1 ; modules 2 et 8 de ce tome',

  situation: [
    { h2: 'Le rapport « parfait » de Yao' },
    'Avant de découvrir les styles de Word, Yao avait découvert l\'intelligence artificielle. En une soirée, l\'assistant lui avait écrit un premier jet de rapport de stage : vingt pages bien tournées, avec citations et références d\'auteurs.',
    'Son tuteur a lu le texte, puis a posé trois questions. « Cet auteur, Kouamé et Traoré, 2019, où l\'as-tu lu ? » Yao n\'en savait rien. Le tuteur a cherché : le livre n\'existait pas. Deux chiffres sur l\'entreprise étaient faux. Et le texte ne parlait presque pas de ce que Yao avait réellement fait pendant son stage.',
    { d: ['Yao', 'Mais l\'IA avait l\'air tellement sûre d\'elle !'] },
    { d: ['M. Kouassi', 'Justement, Yao. L\'IA est comme un stagiaire très cultivé, très rapide et très poli… qui préfère inventer plutôt que d\'avouer qu\'il ne sait pas. On ne le renvoie pas : on apprend à le diriger et à vérifier son travail.'] },
  ],

  declic: [
    { h2: 'L\'IA, un stagiaire brillant à superviser' },
    'Un **assistant d\'intelligence artificielle** (Microsoft Copilot, ChatGPT, Claude, Gemini…) est un programme qui a lu une quantité immense de textes. Quand vous lui écrivez, il produit la réponse qui lui semble la plus **plausible**, mot après mot. Il ne « sait » pas comme une personne sait : il **prédit**. C\'est pourquoi il peut écrire avec assurance quelque chose de faux. On appelle cela une **hallucination**.',
    { tableau: [['Le stagiaire IA est excellent pour…', 'Il faut le surveiller pour…', 'Il ne faut jamais lui confier…'], [
      ['Un premier jet de lettre, de courriel, de plan', 'Les chiffres, les dates, les noms, les citations', 'Vos mots de passe, codes, numéros de carte'],
      ['Résumer un long texte que vous lui donnez', 'Les informations récentes ou locales', 'Les données personnelles de vos clients ou patients'],
      ['Reformuler, corriger, changer de ton', 'Les références et les sources', 'Les secrets de votre entreprise'],
      ['Traduire, expliquer une notion, proposer des idées', 'Les conseils médicaux, juridiques, financiers', 'La décision finale : c\'est vous le responsable'],
    ], [1.7, 1.7, 1.7]] },
    { h2: 'La méthode RCTF pour bien demander' },
    'Chez le couturier, « fais-moi une robe » donne n\'importe quoi. « Une robe de cérémonie, coupe sirène, en wax bleu, pour un mariage samedi, taille 40 » donne ce que vous voulez. Avec l\'IA, c\'est pareil. Une bonne demande a quatre ingrédients :',
    { tableau: [['Lettre', 'Ingrédient', 'Exemple'], [
      ['**R**', '**Rôle** : qui l\'IA doit-elle être ?', '« Tu es un conseiller en recrutement à Abidjan. »'],
      ['**C**', '**Contexte** : la situation, le public, ce que vous savez', '« Je suis étudiant en gestion, je postule à un stage dans une société de distribution. »'],
      ['**T**', '**Tâche** : ce que vous voulez, précisément', '« Pose-moi les dix questions les plus probables de l\'entretien. »'],
      ['**F**', '**Format** : la forme, la longueur, le ton', '« Une liste numérotée, avec pour chaque question un conseil de réponse en deux lignes. »'],
    ], [0.6, 2, 2.6], C.violet] },
    { encadre: { titre: '🔑  On ne demande pas une fois : on discute', style: 'vert', contenu: [
      'La première réponse est rarement parfaite. Continuez la conversation : « plus court », « plus formel », « ajoute un exemple ivoirien », « explique comme à un enfant de douze ans », « qu\'est-ce que tu n\'es pas sûr de savoir ? ». C\'est en affinant qu\'on obtient le meilleur.',
    ] } },
  ],

  pasAPas: [
    { h2: 'Étape 1 : choisir et ouvrir un assistant' },
    { tableau: [['Assistant', 'Où le trouver', 'À noter'], [
      ['**Microsoft Copilot**', '**copilot.microsoft.com**, ou l\'application Copilot de Windows 11', 'Gratuit avec un compte Microsoft ; intégré à Word et Excel avec certains abonnements'],
      ['**ChatGPT** (OpenAI)', '**chatgpt.com**', 'Version gratuite et versions payantes'],
      ['**Claude** (Anthropic)', '**claude.ai**', 'Version gratuite et versions payantes'],
      ['**Gemini** (Google)', '**gemini.google.com**', 'Gratuit avec un compte Google'],
    ], [1.3, 2, 2]] },
    'Tous fonctionnent de la même manière : une zone de texte en bas, vous écrivez, vous envoyez, il répond. Les méthodes de ce module marchent avec chacun d\'eux.',
    { h2: 'Étape 2 : dix usages utiles au quotidien' },
    { tableau: [['Usage', 'Exemple de demande'], [
      ['**Rédiger un premier jet**', '« Rédige une lettre de réclamation polie à la CIE pour une facture anormalement élevée. Voici les faits : […]. Une page maximum. »'],
      ['**Résumer**', '« Voici le compte rendu de la réunion (texte collé). Résume-le en cinq points, puis liste les actions avec qui et quand. »'],
      ['**Corriger et améliorer**', '« Corrige les fautes de ce texte sans changer le sens, puis explique-moi mes trois erreurs les plus fréquentes. »'],
      ['**Changer de ton**', '« Réécris ce message à mon directeur de façon plus professionnelle et plus courte. »'],
      ['**Traduire**', '« Traduis cet e-mail en anglais professionnel, pour un fournisseur au Ghana. »'],
      ['**Expliquer**', '« Explique-moi ce qu\'est un tableau croisé dynamique, avec un exemple de tontine. »'],
      ['**Aider dans Excel**', '« Dans Excel en français, j\'ai les noms en A et les montants en C. Quelle formule pour le total de Bintou ? Explique chaque partie. »'],
      ['**Préparer un oral**', '« Voici mes dix diapositives (titres). Joue le rôle du jury et pose-moi des questions difficiles, une par une. »'],
      ['**Trouver des idées**', '« Propose dix idées de publications Facebook pour une vendeuse de pagnes en décembre, règle 80/20. »'],
      ['**Apprendre**', '« Fais-moi un quiz de cinq questions sur la sécurité des mots de passe, puis corrige mes réponses. »'],
    ], [1.3, 3.7]] },
    { h2: 'Étape 3 : vérifier, toujours' },
    { etapes: [
      '**Relisez** comme si un inconnu avait écrit le texte. Est-ce juste ? Est-ce ce que je voulais dire ?',
      '**Vérifiez les faits précis** (chiffres, dates, noms, lois, prix) sur une source fiable : site officiel, document original, méthode QUAT\' du Tome 1.',
      '**Méfiez-vous des références** : demandez « donne-moi le lien de cette source », puis ouvrez-la. Si elle n\'existe pas, supprimez-la.',
      '**Demandez à l\'IA ses doutes** : « Quelles parties de ta réponse sont incertaines ? »',
      '**Personnalisez** : ajoutez ce que vous seul savez (votre expérience, vos chiffres, votre ton).',
    ] },
    { h2: 'Étape 4 : les règles de l\'honnête utilisateur' },
    { puces: [
      '**Confidentialité** : ne collez jamais de mots de passe, de données de clients, de dossiers médicaux ou de documents confidentiels de votre employeur dans un assistant grand public. Remplacez les noms par « Client A » si besoin.',
      '**Honnêteté** : à l\'école, à l\'université ou au travail, respectez les règles sur l\'usage de l\'IA. En cas de doute, **dites** comment vous l\'avez utilisée.',
      '**Responsabilité** : ce que vous signez, vous en répondez, même si une IA l\'a écrit.',
      '**Images et voix** : ne créez pas de fausses images ou de faux enregistrements de personnes réelles. Méfiez-vous aussi de ceux que vous recevez : l\'IA rend les arnaques plus crédibles.',
    ] },
  ],

  pieges: {
    lignes: [
      ['🧾 Croire une référence ou un chiffre sans vérifier', 'L\'IA peut inventer un livre, une loi, une statistique.', 'Vérifier chaque fait précis à la source.'],
      ['🔐 Coller des données confidentielles', 'Elles sortent de votre contrôle.', 'Anonymiser, ou ne pas utiliser l\'IA pour cela.'],
      ['🧑‍🎓 Rendre un travail écrit par l\'IA comme si c\'était le sien', 'Sanction, perte de confiance, et on n\'apprend rien.', 'L\'utiliser pour comprendre, structurer, corriger ; écrire soi-même l\'essentiel.'],
      ['🤏 Une demande de trois mots', 'Une réponse vague et générale.', 'La méthode RCTF.'],
      ['🌍 Attendre de l\'IA qu\'elle connaisse la réalité locale du jour', 'Elle peut ignorer les prix, les lois ou les événements récents en Côte d\'Ivoire.', 'Lui donner le contexte ; vérifier sur place.'],
    ],
    questions: [
      ['L\'IA va-t-elle me remplacer au travail ?', 'Elle remplace surtout des **tâches**, pas des personnes. Ceux qui savent l\'utiliser avec discernement deviennent plus efficaces et plus recherchés. C\'est exactement ce que vous apprenez ici.'],
      ['L\'IA comprend-elle le nouchi, le dioula ou le baoulé ?', 'Les assistants sont surtout performants en français et en anglais. Dans les langues ivoiriennes, ils peuvent se tromper beaucoup. Pour un message important dans une langue locale, faites relire par une personne qui la parle.'],
    ],
  },

  exercices: {
    echauffe: [
      { h3: 'Exercice 1 : je complète la demande' },
      'Transformez chaque demande vague en demande RCTF complète.',
      { lignes: ['« Écris une lettre. » → ', '« Aide-moi pour Excel. » → ', '« Fais une publication pour ma boutique. » → '] },
    ],
    entraine: [
      { h3: 'Exercice 2 : l\'entraînement à l\'entretien' },
      'Demandez à un assistant de jouer le rôle d\'un recruteur pour un poste qui vous intéresse. Répondez à cinq questions, puis demandez-lui une évaluation de vos réponses et trois conseils.',
    ],
    lance: [
      { h3: 'Exercice 3 : le détecteur d\'inventions' },
      'Demandez à un assistant : « Cite trois livres d\'auteurs ivoiriens sur l\'informatique, avec l\'éditeur et l\'année. » Vérifiez chaque référence sur Internet. Combien existent vraiment ? Notez vos conclusions.',
      { lignes: ['Référence 1 : ', 'Référence 2 : ', 'Référence 3 : ', 'Ma conclusion : '] },
    ],
  },

  cas: [
    { h2: 'Le bon usage pour Yao et Tantie Akissi' },
    { etapes: [
      'Yao doit refaire son rapport. Proposez **quatre** façons honnêtes et utiles d\'utiliser l\'IA pour l\'aider, et **deux** choses à ne pas lui demander.',
      'Tantie Akissi veut des descriptions pour les trente pagnes de son catalogue WhatsApp. Rédigez la demande RCTF qu\'elle pourrait utiliser.',
      'Mariam voudrait coller dans l\'IA le fichier des salaires de son entreprise pour « faire des statistiques ». Que lui conseillez-vous ?',
    ] },
  ],

  retiens: [
    'L\'IA **prédit** des réponses plausibles : elle peut **inventer** avec assurance (hallucination).',
    'Une bonne demande : **RCTF** — Rôle, Contexte, Tâche, Format. Puis on **affine** en discutant.',
    'Excellente pour : premiers jets, résumés, reformulation, traduction, explications, idées, entraînement.',
    'Je **vérifie** tout fait précis à la source. Je supprime les références introuvables.',
    'Jamais de **données confidentielles**. **Honnêteté** sur l\'usage. **Responsabilité** : c\'est moi qui signe.',
  ],
  defi: [
    'Cette semaine, utilisez un assistant d\'IA pour **trois** vraies tâches (un message, un résumé, une explication), avec la méthode RCTF. Pour chacune, notez ce que vous avez dû corriger ou vérifier.',
  ],
  motDeLaFin: 'Yao a réécrit son rapport lui-même. Il s\'est servi de l\'IA pour structurer son plan, reformuler deux passages maladroits et s\'entraîner aux questions du jury. Dans son introduction, il a écrit une phrase sur cet usage. Le jury l\'a félicité pour son honnêteté… et pour ses réponses, qu\'il connaissait par cœur.',
  quiz: [
    'Une « hallucination » de l\'IA, c\'est… **a)** une réponse inventée présentée comme vraie · **b)** une panne · **c)** une image.',
    'Dans RCTF, le T signifie… **a)** Ton · **b)** Tâche · **c)** Titre.',
    'Je peux coller dans un assistant grand public… **a)** les mots de passe du bureau · **b)** un texte public à résumer · **c)** le fichier des salaires.',
    'L\'IA cite un livre. Je… **a)** le recopie · **b)** vérifie qu\'il existe avant de l\'utiliser · **c)** l\'invente aussi.',
  ],
  corriges: [
    ['Exercice 1', 'Exemples : « Tu es un secrétaire administratif expérimenté (R). Je demande un rendez-vous à ma caisse d\'épargne pour renégocier mon crédit (C). Rédige la lettre (T), une page, ton poli et formel, avec objet (F). » · « Tu es formateur Excel (R). J\'ai un tableau de ventes avec dates en A et montants en C (C). Donne la formule du total de novembre (T), en expliquant chaque partie simplement (F). » · « Tu es community manager (R). Je vends des pagnes à Adjamé, clientèle de femmes de 25 à 55 ans (C). Écris une publication Facebook sur les nouveautés de la semaine (T), 60 mots, ton chaleureux, avec un appel à écrire sur WhatsApp (F). »'],
    ['Exercice 3', 'Très souvent, une partie au moins des références est inexacte ou inventée : c\'est exactement le but de l\'exercice.'],
    ['Cas pratique', '**1.** Utiles : proposer un plan à partir de ses notes ; reformuler un passage qu\'il a écrit ; corriger l\'orthographe ; simuler le jury. À éviter : écrire le rapport à sa place ; fournir des références ou des chiffres sur l\'entreprise. **2.** « Tu es rédactrice pour une boutique de pagnes à Abidjan (R). Je vends du wax hollandais, du wax ordinaire et des pagnes baoulés ; mes clientes cherchent des tenues de fête (C). Pour chaque article que je te donne (nom, motif, couleur, prix), rédige une description (T) de 25 mots maximum, ton chaleureux, avec un conseil d\'usage (F). » **3.** Ne pas le faire avec un assistant grand public : ce sont des données personnelles et confidentielles. Utiliser Excel (tableau croisé dynamique), ou anonymiser complètement les données, et suivre la politique de l\'entreprise.'],
    ['Mini-quiz', '1-a · 2-b · 3-b · 4-b'],
  ],
  glossaire: [
    ['Intelligence artificielle générative', 'Des programmes capables de produire du texte, des images ou des sons à partir d\'une demande.'],
    ['Assistant d\'IA', 'Un programme conversationnel comme Copilot, ChatGPT, Claude ou Gemini.'],
    ['Prompt', 'La demande écrite adressée à un assistant d\'IA.'],
    ['Hallucination', 'Une réponse inventée par l\'IA, présentée comme vraie.'],
    ['Méthode RCTF', 'Rôle, Contexte, Tâche, Format : les quatre ingrédients d\'une bonne demande.'],
    ['Anonymiser', 'Retirer d\'un texte tout ce qui permet d\'identifier une personne.'],
  ],
};
