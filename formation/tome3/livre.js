// Assemble le Tome 3 complet. Usage : node tome3/livre.js [pages.json]
const path = require('path');
const L = require('../outils/livre');
const { assembler } = require('../outils/assembler');
const { C } = L;

const prompt = (titre, texte) => ({ encadre: { titre, style: 'bleu', contenu: [texte] } });

const annexeC = [
  'Vingt prompts éprouvés, à adapter à vos projets. Remplacez les crochets [ ] par vos informations. Ajoutez vos propres trouvailles dans votre journal de bord.',
  { h2: 'Concevoir' },
  prompt('1. Organiser un cahier des charges', '« Voici mes notes d\'entretien avec un client : [notes]. Organise-les en cahier des charges d\'une page : Objectif, Utilisateurs et rôles, Écrans, Actions, Données, Règles, Contraintes, Hors première version. Puis liste les cas particuliers que j\'ai oubliés, sous forme de questions “Et si… ?”. »'),
  prompt('2. Les récits utilisateurs', '« À partir de ce cahier des charges, écris les récits utilisateurs au format “En tant que…, je veux…, afin de…”, classés par rôle et par priorité. »'),
  prompt('3. Le modèle de données', '« Ne code rien. Propose les tables de données pour cette application, avec leurs colonnes, leurs types et leurs relations, puis les règles d\'accès de chaque rôle sur chaque table. »'),
  { h2: 'Construire' },
  prompt('4. Le premier prompt', '« But : [ ]. Utilisateurs et rôles : [ ]. Écrans : [ ]. Données : [ ]. Règles : [ ]. Style : [ ]. Contraintes : téléphone d\'abord, français, F CFA, dates JJ/MM/AAAA, aucune clé secrète dans l\'interface. Présente d\'abord ton plan et pose-moi tes questions, puis construis seulement le premier écran. »'),
  prompt('5. Ajouter une fonction', '« Sur la page [ ], ajoute [fonction] qui permet à [rôle] de [action]. Quand [événement], il doit se passer [résultat]. Gère les cas : [cas particuliers]. Ne modifie rien d\'autre. »'),
  prompt('6. Retouche visuelle', '« Sur téléphone, dans [zone], [problème précis, avec capture jointe]. Je voudrais [résultat]. Ne touche pas au reste de la page. »'),
  prompt('7. Données de test', '« Crée des données de test réalistes : [nombre] utilisateurs avec des noms ivoiriens, [données], dont des cas difficiles : [retards, doublons, valeurs vides, montants élevés]. »'),
  { h2: 'Comprendre et vérifier' },
  prompt('8. Expliquer le code', '« Explique-moi ce fichier comme à quelqu\'un qui ne programme pas : à quoi il sert, comment il est organisé, ce qui casserait si je le modifiais. Utilise une comparaison avec une boutique. »'),
  prompt('9. Le plan de l\'application', '« Fais-moi le plan de l\'application : pages, tables, fonctions serveur, services externes, variables d\'environnement (noms seulement), et comment tout est relié. »'),
  prompt('10. Les cas d\'échec', '« Relis [fonction] et liste tous les cas où elle pourrait mal se comporter : données vides, connexion lente, double clic, utilisateur non autorisé. Propose une correction pour chacun, sans rien modifier pour l\'instant. »'),
  { h2: 'Réparer' },
  prompt('11. Diagnostic SAVE', '« Ne modifie rien. Symptôme : [ ]. Action pour reproduire : [ ]. Voulu : [ ]. Erreur exacte : [console]. Changement récent : [ ]. Donne la cause la plus probable, les autres causes possibles et la plus petite correction. »'),
  prompt('12. Messages de suivi', '« Ajoute des messages dans la console qui affichent les données reçues à chaque étape de [fonction], pour que je voie où le problème apparaît. Je les retirerai ensuite. »'),
  prompt('13. Retour arrière', '« Annule les dernières modifications et reviens à la version où [ce qui fonctionnait]. Explique-moi ce qui sera perdu. »'),
  { h2: 'Sécuriser et livrer' },
  prompt('14. Revue de sécurité', '« Fais une revue de sécurité complète, sans rien modifier : règles d\'accès par table et par rôle, secrets exposés dans l\'interface, vérification des saisies côté serveur, pages accessibles sans connexion, bibliothèques obsolètes ou inconnues, données personnelles collectées. Classe du plus grave au moins grave. »'),
  prompt('15. Test des droits', '« Écris des tests qui vérifient qu\'un utilisateur du rôle [ ] ne peut ni lire ni modifier les données d\'un autre utilisateur, et montre-moi les résultats. »'),
  prompt('16. Performance et accessibilité', '« Analyse la page [ ] pour le téléphone : poids des images, bibliothèques lourdes, contrastes, textes alternatifs, taille des boutons. Propose les améliorations par ordre d\'impact. »'),
  prompt('17. Page Confidentialité', '« Rédige une page Confidentialité claire et courte, en français simple, pour cette application : données collectées, finalités, durée de conservation, destinataires, droits des personnes (accès, rectification, opposition, suppression) et contact. Je la ferai vérifier. »'),
  prompt('18. README et guide client', '« Rédige un README technique (sans aucune valeur secrète) et un guide d\'utilisation d\'une page pour le client, avec captures à insérer. »'),
  { h2: 'Relier et automatiser' },
  prompt('19. Intégrer un service', '« Intègre [service] à partir de sa documentation : [lien]. Les clés sont dans les variables d\'environnement [NOMS]. Tout appel se fait dans une fonction serveur. Gère les erreurs et les délais. Présente d\'abord le plan et les cas d\'échec. »'),
  prompt('20. Configurer une automatisation', '« Je veux automatiser : quand [déclencheur], faire [actions], seulement si [condition]. Avec [Make ou Zapier], décris-moi pas à pas les modules à ajouter et les champs à relier, et les tests à faire. »'),
];

const annexeD = [
  { h2: 'Les références de ce livre' },
  { puces: [
    '**Andrej Karpathy**, message du 2 février 2025 qui a lancé l\'expression « vibe coding » (x.com/karpathy).',
    '**OWASP Top 10** (owasp.org) : la liste de référence des failles de sécurité des applications web.',
    '**Snyk**, « Is vibe coding secure? » : les risques de sécurité du code généré par l\'IA.',
    '**DigComp 2.2** (Commission européenne) : création de contenu numérique, programmation et résolution de problèmes au niveau avancé.',
    '**Loi n° 2013-450** relative à la protection des données à caractère personnel ; **loi n° 2013-451** relative à la lutte contre la cybercriminalité ; **loi n° 2013-546** relative aux transactions électroniques ; **ARTCI**.',
  ] },
  { h2: 'Les documentations à garder sous la main' },
  { puces: [
    'La documentation de **votre** constructeur d\'applications (Lovable, Bolt, Replit, Google AI Studio…).',
    '**docs.github.com** : dépôts, commits, branches, Pull Requests, sécurité.',
    '**vercel.com/docs** et **docs.netlify.com** : déploiement, variables d\'environnement, domaines.',
    '**supabase.com/docs** : base de données, authentification, sécurité au niveau des lignes (RLS).',
    'La documentation de votre **agrégateur de paiement** : création de paiement, webhooks, vérification des signatures.',
    '**help.make.com** et **help.zapier.com** : scénarios, filtres, requêtes HTTP.',
    'Le site du registre **.ci** (NIC.CI) : liste des bureaux d\'enregistrement accrédités.',
  ] },
  { h2: 'Et après ?' },
  'Le vibe coding évolue chaque mois. Restez curieux, prudent et honnête. Si le métier vous passionne, apprenez les bases de JavaScript et de SQL : vous dirigerez l\'IA encore mieux. Et surtout, transmettez : la collection « Apprivoiser l\'informatique » est née de la conviction que personne ne doit rester au bord du numérique.',
];

assembler({
  num: 3, dossier: __dirname, titrePreface: 'du lecteur à l\'auteur',
  enTete: 'FOR LIFE · Tome 3 — Créer avec l\'IA',
  couverture: path.join(__dirname, '..', 'couvertures', 'Couverture_Tome3.png'),
  liminaires: require('./liminaires'), projet: require('./projet_final'),
  annexeC: { titre: 'La bibliothèque de prompts', contenu: annexeC }, annexeD,
  sortie: path.join(__dirname, '..', 'livrables', 'FOR_LIFE_Tome3_Creer_avec_l_IA.docx'),
});
