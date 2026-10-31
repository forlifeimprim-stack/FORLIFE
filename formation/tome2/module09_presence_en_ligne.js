// Tome 2 · Module 9 : Exister en ligne, image et vente
const { C } = require('../outils/livre');

module.exports = {
  num: 9,
  titre: 'Exister en ligne : image et vente',
  sousTitre: 'Une vitrine ouverte jour et nuit, au-delà du marché',
  objectifs: [
    'choisir les bons **canaux** selon son activité ;',
    'configurer **WhatsApp Business** : profil, **catalogue**, messages automatiques, **étiquettes** ;',
    'prendre de bonnes **photos de produits** avec son téléphone et créer des visuels avec **Canva** ;',
    'créer une **page Facebook** professionnelle et un profil **LinkedIn** soigné ;',
    'planifier ses publications et soigner sa **réputation en ligne**.',
  ],
  duree: 'Cinq heures', materiel: 'Un smartphone, un ordinateur connecté', prerequis: 'Modules 5 et 8 de ce tome',

  situation: [
    { h2: 'Les pagnes de Tantie Akissi' },
    'Tantie Akissi veut vendre au-delà de l\'allée B du marché d\'Adjamé : aux clientes de Bingerville, de San-Pédro, et même aux Ivoiriennes de Paris qui lui demandent des pagnes pour les mariages. Sa nièce a posté quelques photos sur son compte personnel : des pagnes froissés, pris de nuit, sous un néon jaune, avec le pied de quelqu\'un dans le coin.',
    'Résultat : trois « j\'aime », dont celui de sa nièce. Et un commentaire : « C\'est combien ? » resté sans réponse pendant quatre jours.',
    { d: ['Tantie Akissi', 'Au marché, je vends parce que les clientes voient et touchent. Sur Internet, elles ne touchent pas. Comment je fais ?'] },
    { d: ['M. Kouassi', 'Sur Internet, Tantie, la photo remplace la main, et la réponse rapide remplace votre sourire. On va vous construire une vitrine qui ne ferme jamais.'] },
  ],

  declic: [
    { h2: 'Chaque canal est une place du marché' },
    { tableau: [['Canal', 'Comme…', 'Idéal pour…'], [
      ['**WhatsApp Business**', 'La boutique avec son comptoir et son cahier de clientes', 'Vendre en direct, répondre, envoyer le catalogue, fidéliser'],
      ['**Page Facebook**', 'L\'enseigne sur la grande route', 'Être trouvé, publier, recevoir des avis'],
      ['**Instagram**, **TikTok**', 'Le défilé de mode', 'Montrer en images et en vidéos courtes, toucher les jeunes'],
      ['**LinkedIn**', 'Le CV vivant et le salon professionnel', 'Trouver un emploi, des partenaires, des clients entreprises'],
    ], [1.4, 1.8, 2.2]] },
    'Inutile d\'être partout. Mieux vaut **un ou deux canaux bien tenus** que cinq abandonnés. Pour Tantie Akissi : WhatsApp Business et une page Facebook. Pour Mariam, qui cherche à évoluer : LinkedIn.',
    { h3: 'La règle des 80/20' },
    'Si vous ne parlez que de vos prix, on vous évite comme le vendeur qui crie trop fort. Visez **80 % de contenu utile ou agréable** (conseils pour choisir un pagne, nouveautés, coulisses, clientes satisfaites avec leur accord) et **20 % de vente directe**.',
    { h3: 'La réputation en ligne' },
    'Au quartier, une bonne réputation se construit en années et se perd en un jour. En ligne aussi, mais devant beaucoup plus de monde. Répondre vite, poliment, même aux critiques, c\'est la meilleure publicité.',
  ],

  pasAPas: [
    { h2: 'Étape 1 : WhatsApp Business' },
    { etapes: [
      'Installez **WhatsApp Business** (l\'icône avec un **B**) depuis le Play Store ou l\'App Store. Vous pouvez l\'utiliser avec un numéro dédié à l\'activité, ce qui sépare vie privée et commerce.',
      'Créez le **profil d\'entreprise** : nom (**Pagnes Akissi**), catégorie, description, adresse, **horaires**, photo de profil (logo ou belle photo de la boutique).',
      'Ajoutez le **catalogue** : **Outils pour les professionnels** (ou **Outils professionnels**) → **Catalogue** → **Ajouter un nouvel article** : photo, nom, prix, description, code article.',
      'Activez le **message d\'accueil** (« Bienvenue chez Pagnes Akissi ! Voici notre catalogue… ») et le **message d\'absence** en dehors des horaires.',
      'Créez des **réponses rapides** pour les questions fréquentes : tapez **/livraison** et le texte complet s\'insère.',
      'Classez vos clientes avec les **étiquettes** : Nouvelle cliente, Commande en cours, Payée, Livrée.',
    ] },
    { img: 'whatsapp_business', illus: 'Captures d\'écran de WhatsApp Business : le profil d\'entreprise avec horaires, le catalogue avec photos de pagnes et prix, et le menu des étiquettes.' },
    { h2: 'Étape 2 : des photos qui font vendre' },
    { tableau: [['Règle', 'Comment faire avec un téléphone'], [
      ['**La lumière du jour**', 'Près d\'une fenêtre, ou dehors à l\'ombre, le matin. Jamais sous un néon, jamais avec le flash.'],
      ['**Un fond simple**', 'Un drap blanc, un mur uni, une table en bois propre.'],
      ['**Le produit en valeur**', 'Pagne repassé, plié proprement ; une photo à plat, une photo portée, un gros plan sur le motif.'],
      ['**Un cadrage net**', 'Nettoyez l\'objectif, tenez le téléphone à deux mains, touchez l\'écran sur le produit pour faire la mise au point.'],
      ['**Toujours le même style**', 'Même fond, même lumière : le catalogue a l\'air professionnel.'],
    ], [1.3, 3.7]] },
    { h2: 'Étape 3 : un visuel avec Canva' },
    { etapes: [
      'Allez sur **canva.com** et créez un compte gratuit.',
      'Cherchez un modèle : **Publication Facebook**, **Story Instagram**, **Flyer**.',
      'Remplacez la photo par la vôtre (**Importer** → glisser votre photo sur le modèle), et les textes par les vôtres : peu de mots, un prix ou une offre, votre numéro WhatsApp.',
      'Gardez les mêmes **couleurs** et **polices** sur tous vos visuels : c\'est votre identité.',
      '**Partager** → **Télécharger** → format **PNG** → publiez-le.',
    ] },
    { h2: 'Étape 4 : la page Facebook et la planification' },
    { etapes: [
      'Depuis votre compte Facebook personnel : **Menu** → **Pages** → **Créer une page**. Nom, catégorie, description, photo de profil, photo de couverture.',
      'Complétez : numéro WhatsApp, horaires, adresse, et un bouton d\'action (**Envoyer un message WhatsApp**).',
      'Publiez régulièrement : **deux à trois fois par semaine**, c\'est déjà très bien.',
      'Pour gagner du temps, programmez vos publications de la semaine en une fois avec **Meta Business Suite** (business.facebook.com) : **Créer une publication** → **Programmer**.',
      'Répondez aux messages et aux commentaires **dans la journée**.',
    ] },
    { h2: 'Étape 5 : un profil LinkedIn qui ouvre des portes' },
    { puces: [
      '**Photo** professionnelle, visage net, fond neutre, sourire.',
      '**Titre** qui dit ce que vous faites et apportez : « Assistante de direction · Organisation, gestion administrative et outils numériques ».',
      '**Infos** : cinq à six lignes sur votre parcours et vos objectifs.',
      '**Expériences** et **formations**, avec des résultats concrets ; vos **compétences** (y compris Word, Excel, PowerPoint).',
      'Ajoutez vos collègues, anciens camarades et partenaires, et partagez de temps en temps une réussite ou un article utile.',
    ] },
  ],

  pieges: {
    lignes: [
      ['🛒 Acheter des abonnés ou des « j\'aime »', 'Ils n\'achètent jamais ; les plateformes peuvent pénaliser le compte.', 'Grandir lentement, avec de vrais clients.'],
      ['🤬 Se disputer en public avec un client mécontent', 'Tout le monde voit la dispute, personne ne voit qui avait raison.', 'Répondre poliment, proposer de régler en message privé.'],
      ['📸 Publier les photos d\'autrui sans accord', 'Atteinte à l\'image des personnes et aux droits d\'auteur.', 'Vos propres photos ; l\'accord des clientes photographiées.'],
      ['👤 Mélanger compte personnel et compte professionnel', 'Les clients voient vos photos de famille ou vos opinions.', 'Un compte ou numéro pour l\'activité.'],
      ['😴 Publier dix fois en une semaine, puis plus rien pendant deux mois', 'On donne l\'impression d\'avoir fermé.', 'Un rythme régulier et tenable.'],
    ],
    questions: [
      ['Faut-il payer de la publicité sur Facebook ?', 'Pas au début. Commencez par une page soignée et des publications régulières. Plus tard, une petite publicité bien ciblée (par zone géographique, par centres d\'intérêt) peut aider ; fixez-vous un budget maximum et mesurez les ventes qu\'elle apporte.'],
      ['On m\'a écrit pour « vérifier ma page » contre paiement. C\'est sérieux ?', 'Non. C\'est une arnaque très répandue (module 8). Meta ne demande jamais de paiement par message privé ni vos codes.'],
    ],
  },

  exercices: {
    echauffe: [
      { h3: 'Exercice 1 : le bon canal' },
      { tableau: [['Personne', 'Canal principal conseillé', 'Pourquoi ?'], [
        ['Une couturière de Yopougon', '', ''], ['Un jeune comptable qui cherche un emploi', '', ''],
        ['Un vendeur de poulets braisés qui livre le soir', '', ''], ['Une agence de voyages', '', ''],
      ], [1.8, 1.6, 1.6], C.bleu] },
    ],
    entraine: [
      { h3: 'Exercice 2 : ma vitrine WhatsApp' },
      { cases: [
        'Je configure un profil WhatsApp Business complet (pour mon activité, ou pour celle d\'un proche).',
        'Je photographie trois produits selon les cinq règles et je les ajoute au catalogue.',
        'Je crée un message d\'accueil, un message d\'absence et deux réponses rapides.',
        'Je crée un visuel Canva aux couleurs de l\'activité.',
      ] },
    ],
    lance: [
      { h3: 'Exercice 3 : mon profil LinkedIn' },
      'Créez ou améliorez votre profil LinkedIn selon les cinq points de l\'étape 5. Demandez à votre binôme de le lire comme un recruteur : que retient-il en dix secondes ?',
    ],
  },

  cas: [
    { h2: 'Le mois de lancement de Pagnes Akissi' },
    'Tantie Akissi lance sa vitrine en ligne au début de décembre, période des fêtes et des mariages. Elle peut consacrer une heure par jour au numérique ; sa nièce l\'aide le samedi.',
    { etapes: [
      'Quels canaux choisir, et pourquoi ?',
      'Proposez un **calendrier de publications** pour les quatre semaines de décembre (deux à trois publications par semaine), en respectant la règle 80/20.',
      'Rédigez les trois **réponses rapides** les plus utiles pour elle.',
      'Une cliente laisse un commentaire public : « Pagne reçu délavé, arnaque ! » Rédigez la réponse de Tantie Akissi.',
    ] },
  ],

  retiens: [
    '**Un ou deux canaux** bien tenus valent mieux que cinq abandonnés.',
    '**WhatsApp Business** : profil complet, **catalogue**, message d\'accueil et d\'absence, **réponses rapides**, **étiquettes**.',
    'Photos : **lumière du jour**, fond simple, produit soigné, même style partout.',
    '**Canva** pour des visuels cohérents ; **Meta Business Suite** pour programmer.',
    'Règle **80/20** ; publier **régulièrement** ; répondre **dans la journée**, poliment, même aux critiques.',
    '**LinkedIn** : photo, titre, infos, expériences, compétences.',
  ],
  defi: [
    'Cette semaine, publiez trois contenus pour votre activité (ou celle d\'un proche) en respectant la règle 80/20, et répondez à chaque message en moins de quatre heures.',
  ],
  motDeLaFin: 'En décembre, Pagnes Akissi a reçu quarante-sept commandes par WhatsApp, dont douze de Paris, livrées par un transitaire de Treichville. Une cliente de Paris a envoyé une photo du mariage, toute la famille en pagne Akissi. Avec son accord, elle est devenue la photo de couverture de la page.',
  quiz: [
    'Pour séparer vie privée et activité sur WhatsApp, j\'utilise… **a)** WhatsApp Business avec un numéro dédié · **b)** le mode Avion · **c)** plusieurs comptes personnels.',
    'La meilleure lumière pour photographier un produit est… **a)** le néon · **b)** la lumière du jour, sans flash · **c)** le flash en pleine nuit.',
    'La règle 80/20 conseille… **a)** 80 % de vente directe · **b)** 80 % de contenu utile ou agréable, 20 % de vente · **c)** 80 publications par mois.',
    'Face à un commentaire négatif public, je… **a)** l\'insulte · **b)** réponds poliment et propose de régler en privé · **c)** ferme la page.',
  ],
  corriges: [
    ['Exercice 1', 'Couturière : WhatsApp Business et Instagram (montrer les modèles) · Jeune comptable : LinkedIn · Vendeur de poulets : WhatsApp Business (commandes, catalogue, statuts) · Agence de voyages : page Facebook et Instagram, plus WhatsApp Business pour les réservations.'],
    ['Cas pratique', '**1.** WhatsApp Business (ventes, clientes de Paris) et une page Facebook (visibilité, avis). **2.** Par exemple, chaque semaine : un conseil (comment choisir son pagne de mariage, comment le laver), une nouveauté avec prix, une photo de cliente satisfaite (avec accord) ; une publication « vente » par semaine au maximum. **3.** /prix : liste des gammes et prix ; /livraison : zones, délais et tarifs à Abidjan, en Côte d\'Ivoire, à l\'étranger ; /paiement : moyens acceptés et étapes. **4.** « Bonjour Madame, nous sommes désolés que votre pagne ne vous ait pas satisfaite. Ce n\'est pas l\'expérience que nous voulons vous offrir. Pouvez-vous nous écrire en message privé avec votre numéro de commande ? Nous trouverons ensemble une solution. Tantie Akissi »'],
    ['Mini-quiz', '1-a · 2-b · 3-b · 4-b'],
  ],
  glossaire: [
    ['WhatsApp Business', 'La version de WhatsApp pour les entreprises : profil, catalogue, messages automatiques, étiquettes.'],
    ['Catalogue', 'La liste des produits avec photos, prix et descriptions, consultable par les clients.'],
    ['Canva', 'Un outil en ligne pour créer facilement des visuels à partir de modèles.'],
    ['Page Facebook', 'Un espace public dédié à une activité, distinct du profil personnel.'],
    ['Meta Business Suite', 'L\'outil gratuit de Meta pour gérer et programmer ses publications Facebook et Instagram.'],
    ['E-réputation', 'L\'image d\'une personne ou d\'une entreprise telle qu\'elle apparaît sur Internet.'],
    ['LinkedIn', 'Le réseau social professionnel : profils, emplois, relations d\'affaires.'],
  ],
};
