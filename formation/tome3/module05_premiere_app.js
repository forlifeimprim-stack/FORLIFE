// Tome 3 · Module 5 : Ma première application de A à Z
const { C } = require('../outils/livre');

module.exports = {
  num: 5,
  titre: 'Ma première application de A à Z',
  sousTitre: 'La vitrine de Pagnes Akissi, avec commande sur WhatsApp',
  objectifs: [
    'construire une **vitrine** complète de plusieurs pages, du prompt à la version publiable ;',
    'adapter l\'application au **téléphone** (responsive) ;',
    'créer un **lien de commande WhatsApp** prérempli ;',
    'soigner les **images**, les **textes** et le **référencement** de base ;',
    'faire **tester** l\'application par de vrais utilisateurs.',
  ],
  duree: 'Six heures', materiel: 'Votre constructeur d\'applications, des photos de produits (module 9 du Tome 2)', prerequis: 'Modules 1 à 4',

  situation: [
    { h2: 'Le site qui manquait' },
    'Pagnes Akissi a une vitrine WhatsApp Business et une page Facebook. Mais les clientes de Paris demandent : « Vous avez un site ? » Une agence de mariage veut un lien à mettre dans sa brochure. Et Tantie Akissi voudrait que quelqu\'un qui cherche « pagne wax Adjamé » sur Google la trouve.',
    { d: ['Tantie Akissi', 'Yao, mon fils, fais-moi un vrai site. Pas trop compliqué : mes pagnes, mes prix, et on commande sur WhatsApp. Comme ça je réponds depuis le marché.'] },
    { d: ['M. Kouassi', 'C\'est le projet parfait pour un premier chantier, Yao : utile, limité, et sans données sensibles. On va le faire de A à Z, proprement.'] },
  ],

  declic: [
    { h2: 'Une vitrine, c\'est une boutique sans arrière-boutique' },
    'Une **vitrine** (on dit aussi site vitrine ou « landing page » quand il n\'y a qu\'une page) n\'a besoin ni de comptes ni de base de données : elle **montre** et elle **renvoie** vers WhatsApp pour la commande. C\'est le projet idéal pour apprendre : rapide, peu risqué, immédiatement utile.',
    { h3: 'Le lien WhatsApp prérempli' },
    'WhatsApp propose des liens qui ouvrent directement une discussion avec un numéro, avec un message déjà écrit. Le format est **https://wa.me/** suivi du numéro au format international, **sans le +, sans espaces**, puis **?text=** et le message.',
    { encadre: { style: 'violet', contenu: [
      '**https://wa.me/2250700000000?text=Bonjour, je veux commander le pagne Wax hollandais bleu**',
      'Le numéro : 225 (indicatif de la Côte d\'Ivoire) suivi des dix chiffres. L\'IA se chargera d\'encoder correctement les espaces et les accents du message.',
    ] } },
    { h3: 'Responsive : une boutique qui se range toute seule' },
    'Une page **responsive** s\'adapte à la taille de l\'écran, comme un étal qu\'on réorganise selon la place : trois pagnes côte à côte sur une grande table, un seul par ligne sur une petite. En Côte d\'Ivoire, la grande majorité des visiteurs viendront d\'un **téléphone** : on conçoit pour le téléphone **d\'abord**.',
  ],

  pasAPas: [
    { h2: 'Étape 1 : le prompt de départ' },
    { encadre: { titre: '✍️  Prompt', style: 'bleu', contenu: [
      '**But** : un site vitrine pour Pagnes Akissi, boutique de pagnes au marché d\'Adjamé (Abidjan), pour présenter les produits et recevoir les commandes sur WhatsApp.',
      '**Pages** : Accueil (accroche, trois pagnes vedettes, avis de clientes, bouton WhatsApp) ; Catalogue (grille de produits filtrable par catégorie : Wax hollandais, Wax ordinaire, Pagne baoulé, Foulards) ; À propos (l\'histoire de Tantie Akissi, trente ans au marché) ; Contact (adresse, horaires, carte, bouton WhatsApp).',
      '**Produits** : nom, catégorie, prix en F CFA, photo, courte description. Mets douze produits d\'exemple ; je remplacerai les photos.',
      '**Commande** : sous chaque produit, un bouton vert « Commander sur WhatsApp » qui ouvre wa.me/2250700000000 avec le message « Bonjour Tantie Akissi, je veux commander : [nom du produit] ([prix] F) ».',
      '**Style** : chaleureux, couleurs orange, vert, crème ; motif discret inspiré du tissage baoulé ; grandes photos ; police lisible.',
      '**Contraintes** : conçu d\'abord pour le téléphone ; rapide à charger ; tout en français ; aucun compte, aucun paiement en ligne.',
      'Présente-moi d\'abord ton plan, puis construis la page d\'Accueil seulement.',
    ] } },
    { h2: 'Étape 2 : construire page par page' },
    { etapes: [
      'Validez le plan, faites construire l\'**Accueil**, vérifiez-le sur ordinateur et en mode téléphone.',
      'Demandez ensuite le **Catalogue**, puis **À propos**, puis **Contact** : une page par demande.',
      'Après chaque page, **testez chaque bouton** : le menu, les filtres, et surtout le lien WhatsApp (sur votre téléphone, il doit ouvrir la discussion avec le bon message).',
      'Sauvegardez chaque version qui marche (historique de l\'outil, puis GitHub au module 8).',
    ] },
    { h2: 'Étape 3 : les vraies photos et les vrais textes' },
    { puces: [
      'Remplacez les images d\'exemple par les **vraies photos** (Tome 2, module 9). Demandez à l\'IA : « Comment remplacer la photo du produit [nom] ? » : selon l\'outil, on glisse l\'image dans la discussion ou dans les fichiers du projet.',
      'Faites **réduire le poids** des images : « Optimise les images pour un chargement rapide sur téléphone. » Une photo de 5 Mo ralentit tout ; 200 Ko suffisent souvent.',
      'Écrivez les **textes** avec Tantie Akissi (ou faites-les rédiger par l\'IA, puis relisez-les avec elle) : c\'est sa voix, pas celle d\'une machine.',
      'Vérifiez les **prix**, le **numéro** WhatsApp, l\'**adresse**, les **horaires** : une seule erreur et ce sont des clientes perdues.',
    ] },
    { h2: 'Étape 4 : être trouvé sur Google (référencement de base)' },
    { encadre: { style: 'bleu', contenu: [
      '« Ajoute un référencement de base : un titre et une description pour chaque page (par exemple « Pagnes Akissi – Wax et pagnes baoulés à Adjamé, Abidjan »), des textes alternatifs pour chaque image, une balise de partage pour que le lien affiche une belle image sur WhatsApp et Facebook, et un fichier sitemap. Explique-moi ce que tu as ajouté. »',
    ] } },
    'Une fois le site en ligne (module 9), créez aussi une **fiche d\'établissement Google** (Google Business Profile) pour apparaître sur Google Maps : c\'est souvent ce qui apporte le plus de visiteurs locaux.',
    { h2: 'Étape 5 : la recette avant la livraison' },
    'Dans le bâtiment, on fait la « réception des travaux » avant de remettre les clés. Faites-la avec cette liste :',
    { cases: [
      'Toutes les pages s\'affichent, sur ordinateur **et** sur deux téléphones différents (dont un petit).',
      'Tous les liens et boutons marchent, le lien WhatsApp ouvre le bon numéro avec le bon message.',
      'Les prix, numéros, adresses et horaires sont exacts.',
      'Les photos sont nettes et légères ; la page s\'affiche vite même en 3G.',
      'Aucun texte d\'exemple oublié (« Lorem ipsum », « Votre titre ici »).',
      'Trois personnes qui ne connaissent pas le projet ont réussi à passer une « commande » sans aide.',
    ] },
    { img: 'vitrine', illus: 'Trois captures côte à côte de la vitrine Pagnes Akissi : l\'accueil sur ordinateur, le catalogue sur téléphone (une carte par ligne), et la discussion WhatsApp ouverte avec le message prérempli.' },
  ],

  pieges: {
    lignes: [
      ['📞 Un numéro WhatsApp mal formaté', 'Le bouton n\'ouvre rien, ou ouvre le mauvais numéro.', 'Format 225 + numéro, sans +, sans espace ; tester sur un vrai téléphone.'],
      ['🐘 Des photos de plusieurs Mo', 'Site lent, visiteurs qui partent, forfait des clientes consommé.', 'Faire optimiser les images.'],
      ['🖥️ Ne tester que sur ordinateur', 'Le site est cassé pour la majorité des visiteurs.', 'Téléphone d\'abord, et sur plusieurs modèles.'],
      ['🤖 Laisser des textes génériques écrits par l\'IA', 'Le site sonne faux, sans personnalité.', 'Les vrais mots de la cliente.'],
      ['🖼️ Utiliser des photos trouvées sur Internet', 'Droits d\'auteur, et produits qui ne sont pas ceux de la boutique.', 'Les vraies photos des vrais produits.'],
    ],
    questions: [
      ['Pourquoi ne pas faire tout de suite un vrai panier avec paiement ?', 'Parce que cela demande des comptes, une base de données, un paiement sécurisé et une gestion des stocks : c\'est l\'objet des modules 6, 10 et 11. Pour démarrer, WhatsApp suffit très bien, et Tantie Akissi garde le contact direct avec ses clientes.'],
      ['Comment Tantie Akissi pourra-t-elle changer ses prix elle-même ?', 'Avec une vitrine simple, il faut repasser par l\'outil (ou par Yao). Si les changements sont fréquents, on peut ajouter plus tard une petite page d\'administration reliée à une base de données, ou une feuille Google Sheets que le site lit : c\'est une très bonne évolution pour la version 2.'],
    ],
  },

  exercices: {
    echauffe: [
      { h3: 'Exercice 1 : mon lien WhatsApp' },
      'Construisez le lien wa.me de votre propre numéro avec le message « Bonjour, je viens de votre site ». Testez-le sur votre téléphone.',
      { lignes: ['Mon lien : '] },
    ],
    entraine: [
      { h3: 'Exercice 2 : la vitrine Pagnes Akissi' },
      'Construisez la vitrine complète en suivant les cinq étapes. Remplissez la liste de la recette.',
    ],
    lance: [
      { h3: 'Exercice 3 : une vitrine pour un vrai commerçant' },
      'Proposez à un artisan, un commerçant ou une association de votre entourage de lui construire gratuitement sa vitrine, en échange de son avis et du droit de la montrer dans votre portfolio (module 13). Suivez la méthode complète, du cahier des charges à la recette.',
    ],
  },

  cas: [
    { h2: 'Les retours des premières testeuses' },
    'Trois clientes testent le site de Pagnes Akissi. Voici leurs remarques.',
    { tableau: [['Testeuse', 'Remarque'], [
      ['**Adjoua**, téléphone d\'entrée de gamme', '« La page met longtemps à s\'afficher, et j\'ai vu le logo en dernier. »'],
      ['**Fanta**, à Paris', '« J\'ai cliqué sur Commander, WhatsApp m\'a dit que ce numéro n\'existe pas. »'],
      ['**Marie-Laure**', '« Je n\'ai pas compris si les prix étaient pour 6 yards ou 12 yards. »'],
    ], [1.6, 3.4], C.violet] },
    { etapes: [
      'Pour chaque remarque, quelle est la cause probable ?',
      'Rédigez la retouche précise à envoyer à l\'IA (ou l\'action à faire) pour chacune.',
    ] },
  ],

  retiens: [
    'Une **vitrine** : montrer et renvoyer vers WhatsApp. Idéale comme premier projet.',
    'Lien WhatsApp : **https://wa.me/225XXXXXXXXXX?text=…**, sans +, sans espace.',
    '**Téléphone d\'abord** (responsive), et tests sur de vrais téléphones.',
    'Construire **page par page**, tester chaque bouton, sauvegarder chaque version qui marche.',
    'Vraies photos **optimisées**, vrais textes, infos **vérifiées**, référencement de base.',
    'La **recette** avant la livraison, avec des testeurs qui ne connaissent pas le projet.',
  ],
  defi: [
    'Cette semaine, faites tester votre vitrine par cinq personnes, chacune sur son propre téléphone, et corrigez au moins trois problèmes qu\'elles ont trouvés.',
  ],
  motDeLaFin: 'Trois semaines après la mise en ligne, une cliente de Bouaké a écrit sur WhatsApp : « Bonjour Tantie Akissi, je veux commander : Pagne baoulé tissé main (45 000 F). Je vous ai trouvée sur Google. » Tantie Akissi a montré le message à toute l\'allée B. Puis elle a appelé Yao : « Maintenant, on fait la tontine. »',
  quiz: [
    'Pour le numéro +225 07 00 00 00 00, le lien WhatsApp commence par… **a)** wa.me/+225 07… · **b)** wa.me/2250700000000 · **c)** whatsapp.ci/07…',
    'Un site responsive… **a)** s\'adapte à la taille de l\'écran · **b)** répond aux messages · **c)** est payant.',
    'Avant de livrer, je fais tester par… **a)** moi seul · **b)** des personnes qui ne connaissent pas le projet, sur leurs téléphones · **c)** personne.',
    'Une photo de produit pour le web devrait peser environ… **a)** 5 Mo · **b)** quelques centaines de Ko · **c)** 1 Go.',
  ],
  corriges: [
    ['Exercice 1', 'Format : https://wa.me/225 suivi de vos dix chiffres, sans espace, puis ?text=Bonjour, je viens de votre site (l\'outil ou le navigateur encode les espaces).'],
    ['Cas pratique', '**Adjoua** : images trop lourdes. Retouche : « Optimise toutes les images pour le téléphone (format moderne, largeur adaptée, chargement différé sous la ligne de flottaison) et affiche le logo en priorité. » **Fanta** : numéro mal formaté dans le lien (espace, + ou indicatif manquant). Retouche : « Vérifie tous les liens WhatsApp : ils doivent tous utiliser exactement https://wa.me/2250700000000 ; montre-moi le lien final d\'un produit. » Puis tester depuis un téléphone étranger. **Marie-Laure** : information manquante. Action : demander à Tantie Akissi les métrages, puis « Ajoute sous chaque prix la mention du métrage (par exemple “6 yards”) en petit gris. »'],
    ['Mini-quiz', '1-b · 2-a · 3-b · 4-b'],
  ],
  glossaire: [
    ['Site vitrine', 'Un site qui présente une activité et ses produits, sans comptes ni paiement.'],
    ['Responsive', 'Qui s\'adapte automatiquement à la taille de l\'écran : téléphone, tablette, ordinateur.'],
    ['Lien wa.me', 'Un lien qui ouvre une discussion WhatsApp avec un numéro, avec un message prérempli.'],
    ['Référencement (SEO)', 'L\'ensemble des réglages qui aident un site à être trouvé sur les moteurs de recherche.'],
    ['Recette', 'La vérification complète d\'une application avant sa livraison au client.'],
    ['Google Business Profile', 'La fiche gratuite d\'un établissement sur Google Maps et la recherche Google.'],
  ],
};
