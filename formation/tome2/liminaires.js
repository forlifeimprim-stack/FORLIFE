// Tome 2 : liminaires (préface, test de positionnement) et pages communes.
const { liminairesCommuns } = require('../outils/liminaires');
const { C } = require('../outils/livre');

const communs = liminairesCommuns({
  num: 2, titre: 'Maîtriser l\'outil', sousTitre: 'L\'informatique au service de mon travail', niveau: 'Niveau intermédiaire',
  logiciels: 'Logiciels de référence : Windows 11 et Microsoft 365 (Word, Excel, PowerPoint, Outlook, OneDrive), en français, ainsi que des services gratuits en ligne (Google Drive, WhatsApp Business, Canva…).',
  prerequis: 'Il suppose acquis tout le contenu du Tome 1 : si vous hésitez, faites d\'abord le test de positionnement.',
  quand: 'un an plus tard',
  personnages: [
    ['**Tantie Akissi**', 'Elle tient ses comptes dans Excel et envoie ses factures par e-mail. Elle veut maintenant vendre au-delà du marché d\'Adjamé et gérer la tontine de son association.'],
    ['**Yao**', 'Il a obtenu son stage. Il doit rendre un rapport de quarante pages et présenter son travail devant un jury.'],
    ['**Mariam**', 'Promue assistante de direction, elle organise des réunions avec des partenaires, gère l\'agenda de son directeur et travaille en équipe à distance.'],
    ['**Koffi**', 'Son secrétariat public marche bien. Il veut un crédit pour l\'agrandir, protéger son activité en ligne et dépanner seul ses machines.'],
    ['**M. Kouassi**', 'Toujours là, toujours patient, avec de nouvelles images pour de nouveaux outils.'],
  ],
  logicielsDetail: 'Ce tome utilise **Windows 11** et **Microsoft 365** en français. Certaines fonctions récentes, comme RECHERCHEX dans Excel, n\'existent pas dans les versions anciennes d\'Office : une solution de remplacement est alors indiquée. Les services gratuits (Google Drive, WhatsApp Business, Canva, assistants d\'intelligence artificielle) demandent seulement un compte et une connexion Internet.',
  projet: 'Digitaliser la boutique de Tantie Akissi',
  competences: 'L\'apprenant sait désormais produire des documents professionnels, gérer une activité avec Excel, présenter un projet, travailler en équipe en ligne, sécuriser ses données, communiquer sur Internet, utiliser l\'intelligence artificielle avec discernement et dépanner les problèmes courants.',
});

const preface = [
  { h2: 'Préface : de l\'usager au professionnel' },
  'Savoir allumer un ordinateur, écrire une lettre, envoyer un e-mail : c\'est savoir lire. Le Tome 1 vous l\'a appris. Mais savoir lire ne suffit pas pour écrire un livre, tenir une comptabilité ou plaider un dossier. Il faut maîtriser l\'outil.',
  'Dans nos bureaux, nos boutiques et nos associations, je vois tous les jours la même scène : des personnes compétentes qui perdent des heures avec l\'informatique. Le rapport dont on refait la table des matières à la main. Le tableau Excel dont on recalcule les totaux à la calculatrice. Le budget envoyé en six versions sur WhatsApp. La présentation de quarante diapositives qu\'on lit au jury. Le compte Facebook piraté qui escroque les clients. Ce n\'est pas un manque d\'intelligence : c\'est un manque de méthode.',
  'Ce deuxième tome est un livre de **méthode**. Chaque module vous fait gagner du temps, de l\'argent ou de la crédibilité. Vous y apprendrez à faire travailler l\'ordinateur à votre place : styles et tables automatiques dans Word, formules qui vérifient tout dans Excel, documents partagés que toute une équipe modifie en même temps, assistants d\'intelligence artificielle qui vous aident à écrire, à condition de savoir les guider et les vérifier.',
  'Vous retrouverez Tantie Akissi, Yao, Mariam et Koffi, un an après leurs premiers pas. Ils ont grandi. Leurs problèmes aussi. Et c\'est en les aidant à les résoudre que vous deviendrez, à votre tour, la personne vers qui l\'on se tourne au bureau quand « l\'ordinateur ne veut pas ».',
  { centre: '*Kouadio Koffi Elisée*' },
  { centre: '*Fondateur de FOR LIFE, formateur*' },
];

const test = [
  { h2: 'Test de positionnement : par où commencer ?' },
  'Cochez **Oui** seulement si vous savez le faire **seul, sans aide**.',
  { tableau: [['Je sais…', 'Oui', 'Non'], [
    ['1. Désinstaller un programme et désactiver ceux qui ralentissent le démarrage', '☐', '☐'],
    ['2. Créer une table des matières automatique dans Word', '☐', '☐'],
    ['3. Envoyer une lettre personnalisée à cinquante personnes avec le publipostage', '☐', '☐'],
    ['4. Utiliser la fonction SI dans Excel', '☐', '☐'],
    ['5. Figer une adresse dans une formule avec le signe $', '☐', '☐'],
    ['6. Créer un graphique et un tableau croisé dynamique', '☐', '☐'],
    ['7. Construire une présentation PowerPoint claire de dix diapositives', '☐', '☐'],
    ['8. Partager un document en ligne en choisissant les droits de chacun', '☐', '☐'],
    ['9. Planifier une visioconférence en tenant compte des fuseaux horaires', '☐', '☐'],
    ['10. Trouver pourquoi « le réseau ne passe pas »', '☐', '☐'],
    ['11. Utiliser un gestionnaire de mots de passe', '☐', '☐'],
    ['12. Appliquer la règle de sauvegarde 3-2-1', '☐', '☐'],
    ['13. Configurer WhatsApp Business avec un catalogue', '☐', '☐'],
    ['14. Rédiger une bonne demande à un assistant d\'intelligence artificielle et vérifier sa réponse', '☐', '☐'],
    ['15. Suivre une méthode pour dépanner seul une panne courante', '☐', '☐'],
  ], [4, 0.5, 0.5]] },
  { h3: 'Mon résultat' },
  { tableau: [['Nombre de « Oui »', 'Mon parcours conseillé'], [
    ['**0 à 5**', 'Suivez tout le livre dans l\'ordre. Si les gestes de base (fichiers, Word, Excel simples, e-mail) vous posent problème, révisez d\'abord le **Tome 1**.'],
    ['**6 à 11**', 'Commencez par les modules correspondant à vos « Non ». Faites quand même les fiches « Ce que je retiens » de tous les modules.'],
    ['**12 à 15**', 'Faites le projet final pour le prouver, puis passez au **Tome 3**, *Créer avec l\'IA*.'],
  ], [1.2, 4], C.violet] },
];

module.exports = { ...communs, preface, test };
