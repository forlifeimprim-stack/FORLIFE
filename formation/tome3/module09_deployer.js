// Tome 3 · Module 9 : Mettre son application en ligne
const { C } = require('../outils/livre');

module.exports = {
  num: 9,
  titre: 'Mettre son application en ligne',
  sousTitre: 'Ouvrir la boutique au public : l\'adresse, l\'enseigne, les clés',
  objectifs: [
    'comprendre ce qu\'est un **déploiement** et un **hébergeur** ;',
    'publier depuis son outil, ou depuis **GitHub** vers **Vercel** ou **Netlify** ;',
    'configurer les **variables d\'environnement** de production ;',
    'acheter un **nom de domaine** (.ci ou .com) et le relier à l\'application ;',
    'publier des **mises à jour** sans casser l\'application.',
  ],
  duree: 'Quatre heures', materiel: 'Votre projet relié à GitHub, un moyen de paiement pour le nom de domaine', prerequis: 'Modules 1 à 8',

  situation: [
    { h2: 'L\'adresse impossible à retenir' },
    'L\'application de rendez-vous de Koffi fonctionne. Yao lui envoie le lien : **https://reserv-app-x7k2q9-preview.exemple.app**. Koffi le colle sur son affiche : personne n\'arrive à le recopier. Pire : un soir, Yao fait un essai dans l\'outil, et la version des clients casse en direct pendant une heure.',
    { d: ['Koffi', 'Yao, mes clients veulent une vraie adresse, comme les grandes entreprises. Et une application qui ne s\'arrête pas quand tu fais tes essais !'] },
    { d: ['M. Kouassi', 'Deux leçons, Koffi : une enseigne lisible, c\'est le nom de domaine. Et on ne repeint pas la vitrine pendant que les clients sont dans la boutique : on sépare l\'atelier d\'essai de la boutique ouverte au public.'] },
  ],

  declic: [
    { h2: 'Ouvrir la boutique' },
    { tableau: [['Mot', 'Comme pour une boutique…', 'Ce que c\'est'], [
      ['**Déployer**', 'Ouvrir la boutique au public', 'Mettre l\'application en ligne, accessible à tous'],
      ['**Hébergeur**', 'Le bailleur du local', 'L\'entreprise dont les serveurs font tourner l\'application (Vercel, Netlify, l\'hébergement intégré de votre outil…)'],
      ['**Préproduction** (ou aperçu)', 'L\'atelier à l\'arrière, où l\'on essaie', 'Une version de test, invisible pour les clients'],
      ['**Production**', 'La boutique ouverte', 'La version utilisée par les vrais utilisateurs'],
      ['**Nom de domaine**', 'L\'enseigne et l\'adresse', 'Une adresse lisible comme **koffiservices.ci**'],
      ['**DNS**', 'L\'annuaire qui indique où se trouve la boutique', 'Les réglages qui relient le nom de domaine à l\'hébergeur'],
      ['**Variables d\'environnement**', 'Les clés du coffre, confiées au gérant et jamais affichées en vitrine', 'Les réglages secrets (clés d\'API, adresses de base de données) donnés à l\'hébergeur'],
    ], [1.5, 1.9, 2.2]] },
    { h3: 'Le .ci ou le .com ?' },
    { tableau: [['Extension', 'Pour qui', 'À savoir'], [
      ['**.ci**', 'Une activité tournée vers la Côte d\'Ivoire : fierté locale, confiance des clients ivoiriens', 'Extension nationale, gérée par l\'autorité ivoirienne (l\'ARTCI, via le registre NIC.CI). Achat auprès d\'un **bureau d\'enregistrement accrédité**. Les conditions et les prix évoluent : vérifiez-les sur le site officiel du registre.'],
      ['**.com**', 'Une activité tournée vers l\'international, ou en complément', 'Achat facile auprès de nombreux bureaux d\'enregistrement internationaux, souvent payable par carte.'],
    ], [0.8, 2, 2.6]] },
    { encadre: { titre: '🔑  Le renouvellement', style: 'rouge', contenu: [
      'Un nom de domaine se **loue**, en général à l\'année. S\'il n\'est pas renouvelé, l\'application devient inaccessible, et quelqu\'un d\'autre peut racheter le nom. Activez le **renouvellement automatique** et notez la date dans l\'agenda du client.',
    ] } },
  ],

  pasAPas: [
    { h2: 'Chemin A : publier depuis son outil de vibe coding' },
    { etapes: [
      'Cliquez sur **Publish**, **Deploy** ou **Publier** dans votre outil.',
      'L\'outil donne une adresse publique. Ouvrez-la sur votre téléphone, **en navigation privée**, pour voir l\'application comme un nouveau visiteur.',
      'Cherchez dans les réglages du projet la section **Domaine** (Domain, Custom domain) pour y relier votre nom de domaine plus tard.',
      'Vérifiez comment l\'outil sépare l\'**aperçu** (vos essais) de la **version publiée** (vos clients) : en général, les clients ne voient vos changements qu\'après un nouveau **Publish**.',
    ] },
    { h2: 'Chemin B : de GitHub vers Vercel ou Netlify' },
    'Ce chemin donne plus de liberté (vous ne dépendez plus d\'un seul outil) et met à jour l\'application à chaque modification enregistrée dans GitHub.',
    { etapes: [
      'Créez un compte sur **vercel.com** ou **netlify.com** en vous connectant avec **GitHub**.',
      '**Add New Project** (ou **Add new site**) → **Import** → choisissez votre dépôt.',
      'L\'hébergeur détecte en général tout seul le type de projet. Avant de lancer, ouvrez **Environment Variables** et ajoutez les variables de votre fichier .env (les **noms** et les **valeurs** de production), une par une.',
      'Cliquez sur **Deploy**. Après une ou deux minutes, une adresse s\'affiche.',
      'Désormais, chaque commit sur la branche **main** déclenche un nouveau déploiement ; chaque branche d\'essai reçoit sa propre adresse d\'aperçu, sans toucher à la production.',
    ] },
    { img: 'hebergeur', illus: 'Capture d\'écran d\'un tableau de bord d\'hébergeur : le projet « koffi-rendez-vous », le dernier déploiement réussi en vert, l\'adresse de production, l\'onglet Environment Variables et l\'onglet Domains.' },
    { h2: 'Étape commune : relier le nom de domaine' },
    { etapes: [
      'Achetez le nom de domaine auprès d\'un bureau d\'enregistrement (pour le .ci, un bureau accrédité).',
      'Dans l\'hébergeur ou l\'outil : **Domains** → **Add** → tapez **koffiservices.ci**. L\'hébergeur affiche les **enregistrements DNS** à créer (souvent un enregistrement **A** et un enregistrement **CNAME** pour **www**).',
      'Dans l\'espace client du bureau d\'enregistrement, section **DNS** ou **Zone DNS** : créez exactement ces enregistrements (copier-coller).',
      'Patientez : la propagation peut prendre de quelques minutes à quarante-huit heures. Le **cadenas HTTPS** est en général ajouté automatiquement par l\'hébergeur.',
      'Testez **koffiservices.ci** et **www.koffiservices.ci** sur plusieurs appareils.',
    ] },
    { h2: 'Publier une mise à jour sans casser' },
    { cases: [
      'La modification est faite sur une **branche** ou dans l\'aperçu, pas directement en production.',
      'Je l\'ai testée sur l\'adresse d\'aperçu, sur téléphone et ordinateur, avec plusieurs comptes.',
      'Les variables d\'environnement nécessaires existent en production.',
      'Je publie à une heure creuse (pas le samedi matin pour un secrétariat).',
      'Je vérifie la production juste après, et je sais comment revenir à la version précédente (bouton **Rollback** ou **Redeploy** d\'un déploiement ancien chez l\'hébergeur).',
    ] },
  ],

  pieges: {
    lignes: [
      ['🧪 Faire ses essais directement sur la version des clients', 'L\'application casse en plein usage.', 'Aperçu ou branche d\'abord, publication ensuite.'],
      ['🔑 Oublier les variables d\'environnement en production', 'L\'application en ligne ne se connecte pas à la base de données.', 'Les ajouter dans l\'hébergeur avant le déploiement.'],
      ['📛 Acheter le nom de domaine au nom du prestataire', 'Le client ne possède pas son adresse, conflits futurs.', 'Le domaine au nom du client, avec ses accès.'],
      ['⏰ Laisser expirer le nom de domaine', 'Site inaccessible, nom racheté par un autre.', 'Renouvellement automatique et rappel.'],
      ['🧮 Ignorer les limites des offres gratuites', 'Application suspendue au pic d\'activité, ou facture surprise.', 'Lire les limites ; prévoir l\'offre adaptée et l\'inclure dans le prix.'],
    ],
    questions: [
      ['Combien coûte l\'hébergement ?', 'Pour une petite application, les offres gratuites de Vercel, Netlify ou de votre outil suffisent souvent au début. Pour un usage commercial ou plus important, prévoyez un abonnement. Ajoutez le nom de domaine (quelques milliers à quelques dizaines de milliers de francs par an selon l\'extension et le bureau). Vérifiez toujours les prix et les conditions d\'utilisation commerciale.'],
      ['Mon application peut-elle être installée sur le téléphone comme une vraie application ?', 'Une application web peut être ajoutée à l\'écran d\'accueil (module 6) et, avec quelques réglages (on parle de « PWA », application web progressive), fonctionner presque comme une application installée. La publier sur le Play Store ou l\'App Store est possible, mais demande des étapes, des comptes développeur payants et des validations supplémentaires.'],
    ],
  },

  exercices: {
    echauffe: [
      { h3: 'Exercice 1 : remettre dans l\'ordre' },
      'Remettez dans l\'ordre : « Ajouter le domaine dans l\'hébergeur » · « Acheter le nom de domaine » · « Tester avec et sans www » · « Créer les enregistrements DNS » · « Attendre la propagation ».',
      { lignes: ['1. ', '2. ', '3. ', '4. ', '5. '] },
    ],
    entraine: [
      { h3: 'Exercice 2 : ma première mise en ligne' },
      'Publiez votre vitrine (module 5) par le chemin A, puis par le chemin B depuis GitHub vers Vercel ou Netlify. Comparez les deux adresses et le fonctionnement des mises à jour.',
    ],
    lance: [
      { h3: 'Exercice 3 : une mise à jour en douceur' },
      'Faites une modification visible (une nouvelle section) sur une branche, testez-la sur l\'adresse d\'aperçu, publiez-la, puis exercez-vous à revenir à la version précédente avec le Rollback de l\'hébergeur.',
    ],
  },

  cas: [
    { h2: 'La mise en ligne de Koffi Services' },
    'Koffi veut koffiservices.ci, une application qui ne casse plus pendant les essais, et il veut rester propriétaire de tout.',
    { etapes: [
      'Quel chemin de déploiement conseillez-vous, et pourquoi ?',
      'Qui doit acheter le nom de domaine, à quel nom, et avec quel réglage ?',
      'Comment organiser les essais de Yao pour ne plus casser l\'application des clients ?',
      'Quelle liste remettre à Koffi pour qu\'il sache ce qu\'il possède et ce qu\'il paie chaque année ?',
    ] },
  ],

  retiens: [
    '**Déployer** = ouvrir la boutique. **Aperçu** = l\'atelier ; **production** = la boutique ouverte.',
    'Chemin A : **Publish** depuis l\'outil. Chemin B : **GitHub → Vercel ou Netlify**, mise à jour à chaque commit.',
    'Les **variables d\'environnement** de production se règlent chez l\'hébergeur, jamais dans le code.',
    'Nom de domaine : **.ci** ou **.com**, **au nom du client**, **renouvellement automatique**.',
    'Relier le domaine : enregistrements **DNS** (A, CNAME), patience, **HTTPS** automatique.',
    'Mettre à jour : tester en aperçu, publier à une heure creuse, savoir faire un **Rollback**.',
  ],
  defi: [
    'Cette semaine, mettez en ligne votre projet personnel à une adresse publique, et faites-le utiliser par trois personnes depuis chez elles.',
  ],
  motDeLaFin: 'Sur la nouvelle affiche du secrétariat, il n\'y a plus qu\'une ligne sous le logo : koffiservices.ci. Le premier mois, cent quatorze rendez-vous ont été pris en ligne, dont trente-deux un dimanche soir. Et Yao fait maintenant ses essais sur une branche, à l\'abri des clients.',
  quiz: [
    'Déployer une application, c\'est… **a)** la supprimer · **b)** la mettre en ligne, accessible au public · **c)** la sauvegarder sur une clé USB.',
    'Les clés secrètes de production se configurent… **a)** dans le code visible · **b)** dans les variables d\'environnement de l\'hébergeur · **c)** sur l\'affiche.',
    'Le nom de domaine d\'un client doit être enregistré… **a)** au nom du prestataire · **b)** au nom du client · **c)** au nom de l\'hébergeur.',
    'Pour relier un nom de domaine à l\'hébergeur, on modifie… **a)** les DNS · **b)** le README · **c)** la police.',
  ],
  corriges: [
    ['Exercice 1', '1. Acheter le nom de domaine · 2. Ajouter le domaine dans l\'hébergeur · 3. Créer les enregistrements DNS · 4. Attendre la propagation · 5. Tester avec et sans www.'],
    ['Cas pratique', '**1.** Le chemin B (GitHub → Vercel ou Netlify) : Koffi possède le dépôt et le compte d\'hébergement, ne dépend pas d\'un seul outil, et bénéficie des aperçus par branche. **2.** Koffi lui-même (ou Yao pour son compte), au nom de l\'entreprise de Koffi, avec renouvellement automatique et accès donnés à Koffi. **3.** Une branche par modification, test sur l\'adresse d\'aperçu, publication sur main à une heure creuse après validation, Rollback prêt. **4.** Nom de domaine (bureau d\'enregistrement, date de renouvellement, prix), hébergeur (offre, prix), base de données et autres services (offres, prix), dépôt GitHub, liste des accès et de qui les détient.'],
    ['Mini-quiz', '1-b · 2-b · 3-b · 4-a'],
  ],
  glossaire: [
    ['Déploiement', 'La mise en ligne d\'une version d\'une application.'],
    ['Production', 'La version d\'une application utilisée par les vrais utilisateurs.'],
    ['Préproduction (aperçu)', 'Une version de test, séparée de la production.'],
    ['Variables d\'environnement', 'Des réglages, souvent secrets, fournis à l\'application par l\'hébergeur plutôt qu\'écrits dans le code.'],
    ['Bureau d\'enregistrement', 'L\'entreprise auprès de laquelle on achète et renouvelle un nom de domaine.'],
    ['Enregistrement DNS', 'Une ligne de réglage qui indique où trouver un site pour un nom de domaine (A, CNAME…).'],
    ['Rollback', 'Le retour rapide à une version précédente d\'une application en ligne.'],
    ['Vercel / Netlify', 'Des hébergeurs qui mettent en ligne des applications web directement depuis GitHub.'],
  ],
};
