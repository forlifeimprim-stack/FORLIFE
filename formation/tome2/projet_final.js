// Tome 2 · Projet final : Digitaliser la boutique de Tantie Akissi
const L = require('../outils/livre');
const { C } = L;
const { Paragraph, TextRun } = L.docx;

const titre = 'Digitaliser la boutique de Tantie Akissi';

const contenu = [
  new Paragraph({ spacing: { before: 200, after: 80 }, children: [new TextRun({ text: '★  PROJET FINAL', bold: true, color: C.orange, size: 26, characterSpacing: 40 })] }),
  new Paragraph({ heading: 'Heading1', spacing: { after: 80 }, children: [new TextRun({ text: titre, color: C.texte, size: 52 })] }),
  new Paragraph({ spacing: { after: 300 }, border: { bottom: { style: 'single', size: 12, color: C.orange, space: 8 } },
    children: [new TextRun({ text: 'Tous les outils du Tome 2 au service d\'une vraie petite entreprise', italics: true, size: 28, color: C.gris })] }),
  { h2: 'La mission' },
  'Pagnes Akissi grandit : une boutique au marché d\'Adjamé, des clientes à Abidjan, à l\'intérieur du pays et à Paris, une nièce qui aide le samedi, et un projet de crédit de 2 millions de F pour ouvrir un deuxième point de vente à Cocody. Tantie Akissi vous engage comme **consultant numérique**. Votre mission : mettre en place, en une semaine, les outils numériques de la boutique. Vous pouvez aussi réaliser ce projet pour une vraie petite activité de votre entourage.',
  { h2: 'Les livrables' },
  { tableau: [['N°', 'Livrable', 'Modules'], [
    ['1', '**Le classeur de gestion** (Excel) : feuille Stock (article, quantité, prix d\'achat, prix de vente, seuil d\'alerte), feuille Ventes (date, article, quantité, cliente), feuille Tableau de bord (chiffre d\'affaires du mois, bénéfice, articles sous le seuil en rouge, graphique des ventes par article, tableau croisé dynamique par mois).', '3'],
    ['2', '**La vitrine** : profil WhatsApp Business complet, catalogue de dix articles photographiés selon les règles, message d\'accueil, message d\'absence, trois réponses rapides, étiquettes.', '9'],
    ['3', '**La communication** : trois visuels Canva aux couleurs de la boutique et un calendrier de publications sur un mois (règle 80/20).', '9'],
    ['4', '**Le dossier de crédit** : une présentation PowerPoint de dix diapositives (problème, solution, preuves, moyens, demande), avec les graphiques du classeur, et sa version PDF.', '4'],
    ['5', '**Le courrier aux fidèles** : une lettre d\'invitation à l\'inauguration de Cocody, envoyée par publipostage à au moins quinze clientes.', '2'],
    ['6', '**L\'espace partagé** : un dossier en ligne pour la boutique, partagé avec la nièce (Éditeur) et le comptable (Lecteur), et un formulaire de commande en ligne relié à une feuille de calcul.', '5'],
    ['7', '**La sécurité** : mots de passe uniques gérés par un gestionnaire, double authentification sur l\'e-mail et WhatsApp, sauvegarde 3-2-1 testée, fiche « Pas d\'Internet ? » et fiche OSER affichées.', '1, 7, 8, 11'],
    ['8', '**L\'assistant** : trois demandes RCTF utiles à la boutique (descriptions de produits, réponses aux clientes, idées de publications), avec les corrections apportées aux réponses.', '10'],
  ], [0.4, 4.2, 0.8], C.violet] },
  { h2: 'La soutenance' },
  'Présentez votre travail en quinze minutes, comme à un vrai client : la situation de départ, ce que vous avez mis en place, une démonstration (le tableau de bord qui se met à jour, le catalogue, le formulaire), et trois recommandations pour les six prochains mois.',
  { h2: 'La grille d\'évaluation' },
  { tableau: [['Critère', 'Points', 'Moi', 'Formateur'], [
    ['Classeur : formules justes, mise en forme conditionnelle, graphique, tableau croisé dynamique', '4', '', ''],
    ['Vitrine WhatsApp Business complète, photos de qualité', '3', '', ''],
    ['Visuels cohérents et calendrier 80/20', '2', '', ''],
    ['Présentation : histoire claire, règle 10-20-30, PDF', '3', '', ''],
    ['Publipostage réussi', '2', '', ''],
    ['Partage avec les bons droits, formulaire fonctionnel', '2', '', ''],
    ['Sécurité et sauvegarde 3-2-1 testée', '2', '', ''],
    ['Usage pertinent et vérifié de l\'IA', '1', '', ''],
    ['Qualité de la soutenance', '1', '', ''],
    ['**Total**', '**20**', '', ''],
  ], [3.4, 0.6, 0.6, 0.8], C.violet] },
  { encadre: { titre: '🎉  Et après ?', style: 'vert', contenu: [
    'Avec 14 points ou plus, vous **maîtrisez l\'outil**. Vous savez rendre une activité plus efficace, plus visible et plus sûre grâce au numérique, et vous pouvez accompagner d\'autres personnes. Le **Tome 3**, *Créer avec l\'IA*, vous apprendra à aller plus loin : construire vos propres applications web, avec l\'intelligence artificielle comme partenaire.',
  ] } },
];

const corriges = [
  ['Grille', 'Il n\'y a pas de corrigé unique. Points d\'attention : un tableau de bord qui ne se met pas à jour (formules tapées en dur), des seuils d\'alerte sans mise en forme conditionnelle, une présentation trop chargée, des droits Éditeur donnés à tout le monde, une sauvegarde jamais testée, des réponses de l\'IA publiées sans relecture.'],
];

module.exports = { titre, contenu, corriges };
