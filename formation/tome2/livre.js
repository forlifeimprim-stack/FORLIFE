// Assemble le Tome 2 complet. Usage : node tome2/livre.js [pages.json]
const path = require('path');
const L = require('../outils/livre');
const { assembler } = require('../outils/assembler');
const { C } = L;

const annexeC = [
  'Les raccourcis et les fonctions qui font gagner le plus de temps aux professionnels. Gardez cette page à portée de main.',
  { h2: 'Windows' },
  { tableau: [['Raccourci', 'Ce qu\'il fait'], [
    ['**Ctrl + Maj + Échap**', 'Ouvrir directement le Gestionnaire des tâches'],
    ['**Windows + Maj + S**', 'Capture d\'une partie de l\'écran'],
    ['**Windows + V**', 'Historique du presse-papiers (à activer la première fois)'],
    ['**Windows + P**', 'Choisir l\'affichage sur un écran externe ou un vidéoprojecteur'],
    ['**Windows + Ctrl + Maj + B**', 'Redémarrer le pilote graphique en cas d\'écran figé'],
    ['**Windows + flèche gauche / droite**', 'Placer la fenêtre sur la moitié de l\'écran'],
    ['**Windows + .**', 'Insérer un émoji ou un symbole'],
  ], [1.6, 3.4], C.vert] },
  { h2: 'Word' },
  { tableau: [['Raccourci', 'Ce qu\'il fait'], [
    ['**Ctrl + Entrée**', 'Saut de page'],
    ['**Ctrl + Alt + 1 / 2 / 3**', 'Appliquer les styles Titre 1, Titre 2, Titre 3'],
    ['**Ctrl + Maj + N**', 'Revenir au style Normal'],
    ['**F9**', 'Mettre à jour un champ sélectionné (table des matières…)'],
    ['**Maj + F7**', 'Dictionnaire des synonymes'],
  ], [1.6, 3.4], C.bleu] },
  { h2: 'Excel' },
  { tableau: [['Raccourci', 'Ce qu\'il fait'], [
    ['**F4**', 'Ajouter ou retirer les $ dans une adresse'],
    ['**F2**', 'Modifier le contenu de la cellule'],
    ['**Alt + =**', 'Somme automatique'],
    ['**Ctrl + ;**', 'Insérer la date du jour'],
    ['**Ctrl + Maj + L**', 'Activer ou désactiver les filtres'],
    ['**Ctrl + flèche**', 'Aller au bout des données dans une direction'],
  ], [1.6, 3.4], C.vert] },
  { h2: 'PowerPoint' },
  { tableau: [['Raccourci', 'Ce qu\'il fait'], [
    ['**F5**', 'Lancer le diaporama depuis le début'],
    ['**Maj + F5**', 'Lancer depuis la diapositive en cours'],
    ['**B**', 'Écran noir pendant le diaporama (recommencer pour revenir)'],
    ['**Échap**', 'Quitter le diaporama'],
  ], [1.6, 3.4], C.orange] },
  { h2: 'Les fonctions Excel essentielles' },
  { tableau: [['Fonction', 'Exemple', 'Ce qu\'elle fait'], [
    ['SOMME, MOYENNE, MAX, MIN', '=SOMME(C2:C50)', 'Total, moyenne, plus grand, plus petit'],
    ['SI', '=SI(C2>=D2;"À jour";"En retard")', 'Résultat selon une condition'],
    ['NB.SI', '=NB.SI(E:E;"En retard")', 'Compter selon un critère'],
    ['SOMME.SI', '=SOMME.SI(B:B;"Wax";C:C)', 'Additionner selon un critère'],
    ['RECHERCHEX', '=RECHERCHEX(J2;A:A;B:B)', 'Retrouver une information dans une liste'],
    ['SUPPRESPACE', '=SUPPRESPACE(A2)', 'Supprimer les espaces en trop'],
    ['AUJOURDHUI', '=AUJOURDHUI()', 'La date du jour, mise à jour automatiquement'],
  ], [1.4, 2.2, 1.6], C.violet] },
];

const annexeD = [
  { h2: 'Les références de ce livre' },
  { puces: [
    '**DigComp 2.2**, cadre européen des compétences numériques (Commission européenne, 2022) : collaboration, création de contenu, sécurité et résolution de problèmes, au niveau intermédiaire.',
    '**Guy Kawasaki**, la règle 10-20-30 des présentations de financement (module 4).',
    '**Loi n° 2013-450** du 19 juin 2013 relative à la protection des données à caractère personnel, et **ARTCI**, autorité de protection (module 8).',
    '**Loi n° 2013-451** du 19 juin 2013 relative à la lutte contre la cybercriminalité, modifiée en 2023.',
    '**Malcolm Knowles**, *The Adult Learner* ; **Richard E. Mayer**, *Multimedia Learning* : les fondements de la méthode « Situation, Déclic, Pratique ».',
  ] },
  { h2: 'Les centres d\'aide officiels' },
  { puces: [
    '**support.microsoft.com** : Windows, Word, Excel, PowerPoint, Outlook, OneDrive, Teams.',
    '**support.google.com** : Gmail, Drive, Agenda, Meet, Forms, sécurité du compte.',
    '**faq.whatsapp.com** : WhatsApp et WhatsApp Business.',
    '**facebook.com/help** et **facebook.com/hacked** : pages Facebook, récupération de compte.',
  ] },
  { h2: 'Et après ce livre ?' },
  'Vous maîtrisez maintenant l\'outil. Le **Tome 3**, *Créer avec l\'IA*, vous apprendra à créer vos propres applications web avec l\'intelligence artificielle, sans devenir programmeur : décrire une idée, la faire construire, la vérifier, la corriger et la mettre en ligne.',
];

assembler({
  num: 2, dossier: __dirname, titrePreface: 'de l\'usager au professionnel',
  enTete: 'FOR LIFE · Tome 2 — Maîtriser l\'outil',
  couverture: path.join(__dirname, '..', 'couvertures', 'Couverture_Tome2.png'),
  liminaires: require('./liminaires'), projet: require('./projet_final'),
  annexeC: { titre: 'Raccourcis et fonctions des professionnels', contenu: annexeC }, annexeD,
  sortie: path.join(__dirname, '..', 'livrables', 'FOR_LIFE_Tome2_Maitriser_l_outil.docx'),
});
