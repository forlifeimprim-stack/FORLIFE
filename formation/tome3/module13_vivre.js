// Tome 3 · Module 13 : Vivre du vibe coding
const { C } = require('../outils/livre');

module.exports = {
  num: 13,
  titre: 'Vivre du vibe coding',
  sousTitre: 'De l\'atelier à l\'entreprise',
  objectifs: [
    'définir des **offres** claires adaptées au marché ivoirien ;',
    '**chiffrer** une prestation et rédiger un **devis** ;',
    'protéger le client et soi-même avec un **contrat** simple ;',
    'proposer une **maintenance** et des revenus récurrents ;',
    'construire un **portfolio** et trouver ses **premiers clients**.',
  ],
  duree: 'Quatre heures', materiel: 'Vos projets réalisés, Excel ou Google Sheets', prerequis: 'Modules 1 à 12',

  situation: [
    { h2: 'Le premier devis de Yao' },
    'Le pharmacien du quartier a vu l\'application de la tontine. Il veut une application pour que ses clients réservent leurs médicaments et soient prévenus quand ils arrivent. Il demande : « Combien ? »',
    'Yao, pris de court, répond : « 50 000 F, ça va ? » Le pharmacien accepte immédiatement. Trois semaines plus tard, Yao a passé quatre-vingts heures sur le projet, payé 45 000 F d\'abonnements, le pharmacien demande des modifications chaque jour, et il veut maintenant que Yao vienne réparer son imprimante « puisqu\'il est informaticien ».',
    { d: ['Yao', 'J\'ai travaillé pour moins que rien, et je ne sais même pas quand ça va s\'arrêter !'] },
    { d: ['M. Kouassi', 'Tu as fait le travail d\'un professionnel, Yao, avec la gestion d\'un amateur. Le talent ne suffit pas. Il faut une offre, un prix calculé, un devis, un contrat, et le courage de dire non. On va voir tout ça.'] },
  ],

  declic: [
    { h2: 'Le couturier qui affiche ses prix' },
    'Un bon couturier n\'invente pas son prix à la tête du client. Il sait combien coûtent le tissu et les fournitures, combien d\'heures prend chaque modèle, et ce que vaut son savoir-faire. Il affiche ses modèles, il prend les mesures, il annonce un prix et une date, il demande une avance. Et une retouche après la livraison, c\'est payant, sauf défaut de sa part.',
    { h2: 'Des offres claires' },
    { tableau: [['Offre', 'Contenu', 'Pour qui'], [
      ['**Vitrine Essentielle**', 'Site vitrine de 3 à 5 pages, responsive, commande WhatsApp, référencement de base, mise en ligne avec nom de domaine', 'Commerçants, artisans, églises, associations'],
      ['**Application de gestion**', 'Comptes, base de données, tableau de bord, 3 à 6 écrans', 'Tontines, petites écoles, cabinets, PME'],
      ['**Automatisation**', 'Un à trois scénarios Make ou Zapier, avec formation', 'Bureaux, services administratifs'],
      ['**Maintenance**', 'Mises à jour, sauvegardes, petites corrections, surveillance, un nombre d\'heures de modifications par mois', 'Tous les clients, en abonnement mensuel'],
    ], [1.4, 2.6, 1.6]] },
    { h2: 'Le calcul du prix' },
    'Un prix se construit, il ne se devine pas :',
    { tableau: [['Élément', 'Exemple pour une application de gestion'], [
      ['**Temps** estimé × votre taux horaire', '40 heures (cahier des charges, construction, tests, sécurité, formation) × votre taux'],
      ['**Coûts des outils** pendant le projet', 'Abonnements de l\'outil de vibe coding, crédits d\'IA'],
      ['**Coûts récurrents** du client', 'Hébergement, base de données, nom de domaine, envois de SMS : à faire payer par le client ou à inclure dans la maintenance'],
      ['**Marge d\'imprévus**', '15 à 30 % du temps : il y en a toujours'],
      ['**Valeur pour le client**', 'Combien l\'application lui fait gagner ou économiser ? Un outil qui évite 200 000 F de pertes par mois vaut plus que son temps de fabrication'],
    ], [1.6, 3.4]] },
    { encadre: { titre: '🔑  Votre taux horaire', style: 'vert', contenu: [
      'Partez de ce que vous voulez gagner par mois, ajoutez vos charges (ordinateur, Internet, abonnements, transport, cotisations), et divisez par les heures **réellement facturables** (souvent la moitié de votre temps de travail : le reste part en prospection, formation, administration). Comparez ensuite avec les prix pratiqués autour de vous, et ajustez.',
    ] } },
  ],

  pasAPas: [
    { h2: 'Étape 1 : le devis' },
    { tableau: [['Rubrique', 'Contenu'], [
      ['**En-tête**', 'Votre nom ou entreprise, contacts, numéro de devis, date, durée de validité (30 jours).'],
      ['**Client**', 'Nom, entreprise, contacts.'],
      ['**Objet**', 'Le besoin en une phrase, et une référence au cahier des charges joint.'],
      ['**Détail**', 'Chaque lot avec son prix : cahier des charges, construction, tests et sécurité, mise en ligne, formation.'],
      ['**Ce qui est inclus et exclu**', 'Nombre de séries de retouches incluses (par exemple deux) ; ce qui est hors projet (contenus, photos, matériel, dépannage).'],
      ['**Coûts récurrents**', 'Hébergement, domaine, services : montants estimés, qui paie.'],
      ['**Délais**', 'Date de livraison, à condition de recevoir les contenus du client à temps.'],
      ['**Paiement**', 'Par exemple : 40 % à la commande, 40 % à la livraison de la version de test, 20 % à la mise en ligne.'],
      ['**Signature**', '« Bon pour accord », date, signature du client.'],
    ], [1.5, 3.5]] },
    'Faites-le dans Word ou Excel avec un modèle propre (Tome 2), exporté en PDF.',
    { h2: 'Étape 2 : le contrat simple' },
    'Pour les projets importants, ajoutez au devis des **conditions** claires, et faites-les relire par un professionnel du droit si les montants sont élevés :',
    { puces: [
      '**Propriété** : le code, le dépôt GitHub, le nom de domaine et les comptes des services appartiennent au client **après paiement complet**. Vous pouvez montrer le projet dans votre portfolio, sauf refus du client.',
      '**Données** : le client est responsable de ses données et de ses formalités (dont celles prévues par la loi n° 2013-450) ; vous vous engagez à les protéger et à ne pas les utiliser.',
      '**Modifications** : toute demande hors cahier des charges fait l\'objet d\'un devis complémentaire.',
      '**Garantie** : correction gratuite des défauts signalés dans les 30 jours suivant la mise en ligne.',
      '**Maintenance** : contrat séparé, mensuel, avec un contenu précis.',
    ] },
    { h2: 'Étape 3 : la maintenance, le revenu qui revient' },
    'Une application vivante a besoin d\'entretien : mises à jour de sécurité, sauvegardes vérifiées, petites corrections, renouvellement du domaine. Proposez un **forfait mensuel** (par exemple deux heures de modifications incluses, surveillance, sauvegardes, réponse sous 48 heures). Dix clients en maintenance, c\'est un revenu stable qui finance les mois creux.',
    { h2: 'Étape 4 : le portfolio' },
    { etapes: [
      'Créez votre propre site vitrine (vous savez le faire !) : vos offres, trois à six réalisations, des témoignages, un bouton WhatsApp.',
      'Pour chaque réalisation : le problème du client, ce que vous avez construit, le résultat chiffré (« 114 rendez-vous en ligne le premier mois »), une capture.',
      'Demandez à chaque client satisfait un **témoignage** de deux phrases, avec son accord pour le publier.',
      'Reliez-le à votre profil **LinkedIn** (Tome 2, module 9).',
    ] },
    { h2: 'Étape 5 : trouver ses premiers clients' },
    { tableau: [['Où', 'Comment'], [
      ['**Votre entourage**', 'Commerçants, églises, associations, écoles : commencez par des projets simples, à prix d\'ami mais **jamais gratuitement sans contrepartie** (témoignage, droit de montrer).'],
      ['**Le bouche-à-oreille**', 'Chaque client satisfait en amène d\'autres : soignez la livraison et le suivi.'],
      ['**LinkedIn et WhatsApp**', 'Montrez vos réalisations, expliquez ce que vous résolvez, pas la technique.'],
      ['**Les plateformes de missions**', 'Plateformes internationales et africaines de travail indépendant : concurrence forte, mais bonne école.'],
      ['**Les produits numériques**', 'Vendez des modèles prêts à l\'emploi (vitrine de restaurant, application de tontine, pack d\'automatisations) sur une plateforme de vente de produits numériques adaptée aux créateurs africains, comme Chariow.'],
    ], [1.5, 3.5]] },
    { h2: 'Étape 6 : continuer d\'apprendre' },
    { puces: [
      'Les outils changent tous les mois : consacrez une heure par semaine à la **veille** (nouveautés de votre outil, sécurité).',
      'Apprendre les **bases de la programmation** (JavaScript, SQL) vous rendra bien plus solide face aux projets complexes.',
      'Des **certifications** reconnues (cloud, sécurité, gestion de projet) rassurent les entreprises.',
      'Rejoignez des **communautés** de créateurs et de développeurs, en ligne et à Abidjan.',
    ] },
  ],

  pieges: {
    lignes: [
      ['🎲 Donner un prix au hasard', 'Projet à perte, découragement.', 'Le calcul : temps, coûts, imprévus, valeur.'],
      ['♾️ Pas de limite aux retouches', 'Le projet ne finit jamais.', 'Nombre de séries de retouches dans le devis ; le reste en complément.'],
      ['💳 Payer les abonnements du client avec son propre compte', 'Dépendance, litiges, coûts cachés.', 'Comptes au nom du client, ou refacturation claire.'],
      ['🤝 Commencer sans acompte ni devis signé', 'Travail non payé, client qui disparaît.', 'Devis signé et acompte avant de commencer.'],
      ['🧰 Accepter tout ce qu\'on vous demande (« répare aussi l\'imprimante »)', 'Vous devenez l\'informaticien gratuit de tout le quartier.', 'Une offre claire, et le courage de dire non ou de facturer.'],
    ],
    questions: [
      ['Je ne suis pas programmeur. Est-ce honnête de vendre des applications faites avec l\'IA ?', 'Oui, si vous êtes **transparent** sur votre méthode et **responsable** de la qualité : cahier des charges, tests, sécurité, maintenance. Le client paie un résultat qui fonctionne et un accompagnement, pas des lignes de code tapées à la main. Ne promettez jamais ce que vous ne savez pas faire : pour un projet trop complexe ou trop sensible, orientez vers des professionnels ou associez-vous à eux.'],
      ['Dois-je créer une entreprise ?', 'Pour facturer régulièrement, ouvrir des comptes marchands ou travailler avec des entreprises, une structure déclarée devient vite nécessaire. Renseignez-vous auprès des services publics d\'appui à la création d\'entreprise et d\'un comptable sur le statut adapté à votre situation.'],
    ],
  },

  exercices: {
    echauffe: [
      { h3: 'Exercice 1 : mon taux horaire' },
      { lignes: ['Ce que je veux gagner par mois : ', 'Mes charges mensuelles : ', 'Mes heures facturables par mois : ', 'Mon taux horaire = (gains + charges) ÷ heures : '] },
    ],
    entraine: [
      { h3: 'Exercice 2 : le devis du pharmacien' },
      'Refaites le devis du pharmacien de la situation de départ, avec toutes les rubriques, le calcul détaillé et les conditions. Comparez avec les 50 000 F de Yao.',
    ],
    lance: [
      { h3: 'Exercice 3 : mon portfolio' },
      'Construisez et mettez en ligne votre site portfolio, avec vos offres et au moins trois réalisations (dont vos projets de ce livre). Partagez-le sur LinkedIn.',
    ],
  },

  cas: [
    { h2: 'Repartir sur de bonnes bases avec le pharmacien' },
    'Yao doit renégocier avec le pharmacien, avec qui il a déjà accepté 50 000 F et passé quatre-vingts heures.',
    { etapes: [
      'Que peut-il proposer pour que la relation reste bonne et devienne rentable ?',
      'Que répondre à la demande de réparer l\'imprimante ?',
      'Quelle offre de maintenance lui proposer ?',
      'Quelles leçons écrire dans son journal de bord pour les prochains clients ?',
    ] },
  ],

  retiens: [
    'Des **offres claires** : vitrine, application de gestion, automatisation, **maintenance**.',
    'Le prix se **calcule** : temps × taux, coûts des outils, coûts récurrents, imprévus, valeur pour le client.',
    'Un **devis** signé, un **acompte**, des retouches **limitées**, des exclusions écrites.',
    'Un **contrat** simple : propriété, données, modifications, garantie, maintenance.',
    'La **maintenance** mensuelle : le revenu qui revient.',
    'Un **portfolio** avec résultats chiffrés et témoignages ; la transparence sur la méthode.',
  ],
  defi: [
    'Cette semaine, rédigez vos trois offres avec leurs prix de départ, et présentez-les à deux clients potentiels de votre entourage.',
  ],
  motDeLaFin: 'Yao a revu le pharmacien avec un document propre : la première version livrée était comprise dans les 50 000 F, la suite ferait l\'objet d\'un devis, et un forfait de maintenance mensuel était proposé. Pour l\'imprimante, il lui a donné le numéro d\'un technicien. Le pharmacien a signé. Et le mois suivant, il a recommandé Yao à trois confrères.',
  quiz: [
    'Un prix bien construit tient compte… **a)** seulement du temps · **b)** du temps, des coûts, des imprévus et de la valeur pour le client · **c)** de l\'humeur du jour.',
    'Avant de commencer un projet, il faut… **a)** un devis signé et un acompte · **b)** seulement une poignée de main · **c)** finir le projet.',
    'Le code et le nom de domaine appartiennent en général au client… **a)** jamais · **b)** après paiement complet, si le contrat le prévoit · **c)** avant même de commencer.',
    'Les revenus récurrents viennent surtout… **a)** de la maintenance mensuelle · **b)** des réductions · **c)** du hasard.',
  ],
  corriges: [
    ['Exercice 1', 'Exemple : objectif 400 000 F par mois, charges 100 000 F, 60 heures facturables : taux d\'environ 8 300 F de l\'heure. Ajustez selon le marché et la valeur apportée.'],
    ['Cas pratique', '**1.** Reconnaître son erreur de chiffrage sans reprocher au client ; considérer les 50 000 F comme le prix de la première version livrée ; proposer pour la suite un devis par lot et un forfait de maintenance ; formaliser par écrit. **2.** Refuser poliment (hors de son offre) et recommander un technicien de confiance. **3.** Par exemple : mises à jour, sauvegardes, surveillance, deux heures de modifications par mois, réponse sous 48 heures, pour un montant mensuel fixe. **4.** Ne jamais donner de prix sans cahier des charges ; toujours un devis signé et un acompte ; limiter les retouches ; écrire les exclusions ; proposer la maintenance dès le départ.'],
    ['Mini-quiz', '1-b · 2-a · 3-b · 4-a'],
  ],
  glossaire: [
    ['Devis', 'Le document qui détaille une prestation, son prix et ses conditions, à faire signer avant de commencer.'],
    ['Acompte', 'La partie du prix payée à la commande.'],
    ['Taux horaire', 'Le prix d\'une heure de travail, calculé à partir des revenus visés, des charges et des heures facturables.'],
    ['Maintenance', 'L\'entretien régulier d\'une application après sa livraison, souvent en abonnement mensuel.'],
    ['Portfolio', 'La présentation de ses réalisations pour convaincre de futurs clients.'],
    ['Revenu récurrent', 'Un revenu qui revient chaque mois, comme un abonnement de maintenance.'],
  ],
};
