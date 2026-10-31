// Assemble le Tome 1 complet. Usage : node tome1/livre.js [pages.json]
const path = require('path');
const L = require('../outils/livre');
const { assembler } = require('../outils/assembler');
const { C, p, vide, titre2, tableau, puces } = L;

const annexeC = [
  p('Un raccourci, c\'est un chemin plus court : au lieu d\'aller chercher une commande avec la souris, on appuie sur deux touches **en même temps**. On tient la première (Ctrl, Alt ou Windows), puis on appuie brièvement sur la seconde. Découpez ou photographiez cette page et gardez-la près de votre ordinateur.'),
  titre2('Les dix raccourcis à connaître par cœur'),
  tableau(['Raccourci', 'Ce qu\'il fait', 'Pour s\'en souvenir'], [
    ['**Ctrl + C**', 'Copier', 'C comme Copier'],
    ['**Ctrl + X**', 'Couper', 'Les ciseaux : le X ressemble à des ciseaux ouverts'],
    ['**Ctrl + V**', 'Coller', 'La lettre juste à côté du C'],
    ['**Ctrl + Z**', 'Annuler la dernière action', 'La gomme magique'],
    ['**Ctrl + Y**', 'Rétablir ce qu\'on vient d\'annuler', 'Le contraire de Z'],
    ['**Ctrl + S**', 'Enregistrer', 'S comme Sauvegarder'],
    ['**Ctrl + P**', 'Imprimer', 'P comme Papier'],
    ['**Ctrl + A**', 'Tout sélectionner', 'A comme « All », « tout » en anglais'],
    ['**Ctrl + F**', 'Rechercher un mot dans la page', 'F comme « Find », trouver'],
    ['**Alt + Tab**', 'Passer d\'une fenêtre à l\'autre', 'Tab comme « tableau des fenêtres »'],
  ], [1, 1.6, 2], C.orange),
  vide(),
  titre2('Windows'),
  tableau(['Raccourci', 'Ce qu\'il fait'], [
    ['**Touche Windows**', 'Ouvrir ou fermer le menu Démarrer'],
    ['**Windows + E**', 'Ouvrir l\'Explorateur de fichiers'],
    ['**Windows + D**', 'Afficher le Bureau (et revenir)'],
    ['**Windows + L**', 'Verrouiller l\'ordinateur quand on s\'absente'],
    ['**Windows + Maj + S**', 'Faire une capture d\'une partie de l\'écran'],
    ['**Alt + F4**', 'Fermer la fenêtre active'],
    ['**F2**', 'Renommer le fichier ou le dossier sélectionné'],
    ['**Ctrl + Alt + Suppr**', 'Ouvrir l\'écran de secours (Gestionnaire des tâches, verrouiller, éteindre)'],
    ['**Ctrl + molette**', 'Agrandir ou réduire l\'affichage'],
  ], [1.4, 3.6], C.vert),
  vide(),
  titre2('Word (version française)'),
  tableau(['Raccourci', 'Ce qu\'il fait'], [
    ['**Ctrl + G**', 'Mettre en **gras**'], ['**Ctrl + I**', 'Mettre en *italique*'], ['**Ctrl + U**', 'Souligner'],
    ['**Ctrl + N**', 'Nouveau document'], ['**Ctrl + O**', 'Ouvrir un document'],
    ['**Maj + F3**', 'Passer un mot sélectionné en majuscules ou en minuscules'],
  ], [1.4, 3.6], C.bleu),
];

const annexeD = [
  titre2('Les références de ce livre'),
  ...puces([
    '**DigComp 2.2**, le cadre européen des compétences numériques du citoyen (Commission européenne, 2022) : les cinq savoir-faire présentés au module 0.',
    '**UNESCO**, *A Global Framework of Reference on Digital Literacy Skills* (Institut de statistique de l\'UNESCO, 2018) : la définition internationale de la littératie numérique.',
    '**Malcolm Knowles**, *The Adult Learner* : les principes de l\'apprentissage des adultes qui inspirent la méthode « Situation, Déclic, Pratique ».',
    '**Dedre Gentner** et ses collègues, sur le rôle des analogies dans l\'apprentissage (2003) : le fondement de l\'étape « Le déclic ».',
    '**Richard E. Mayer**, *Multimedia Learning* : pourquoi un texte accompagné d\'images bien choisies s\'apprend mieux.',
    '**DataReportal**, *Digital 2026 : Côte d\'Ivoire* : les chiffres de l\'usage d\'Internet dans le pays.',
  ]),
  titre2('Les adresses utiles en Côte d\'Ivoire'),
  ...puces([
    '**servicepublic.gouv.ci** : le portail officiel des démarches administratives. Assistance gratuite du Centre d\'information et de communication gouvernementale au **101**.',
    '**ARTCI** (Autorité de régulation des télécommunications de Côte d\'Ivoire) : autorité de protection des données personnelles (loi n° 2013-450).',
    '**PLCC** (Plateforme de lutte contre la cybercriminalité) : pour signaler une arnaque en ligne. N\'utilisez que les contacts publiés sur les sites officiels du gouvernement : de fausses pages « PLCC » circulent sur les réseaux sociaux.',
  ]),
  titre2('Et après ce livre ?'),
  p('Vous avez appris à vous servir de l\'ordinateur. Le **Tome 2**, *Maîtriser l\'outil*, vous apprendra à en faire un véritable outil de travail : documents professionnels, Excel pour gérer une activité, présentations, travail en équipe en ligne, sécurité et intelligence artificielle. Le **Tome 3**, *Créer avec l\'IA*, vous apprendra à créer vos propres applications.'),
];

assembler({
  num: 1, dossier: __dirname, titrePreface: 'le nouvel alphabet',
  enTete: 'FOR LIFE · Tome 1 — Apprivoiser l\'ordinateur',
  couverture: path.join(__dirname, '..', 'couvertures', 'Couverture_Tome1.png'),
  liminaires: require('./liminaires'), projet: require('./projet_final'),
  annexeC: { titre: 'Les raccourcis clavier essentiels', contenu: annexeC }, annexeD,
  sortie: path.join(__dirname, '..', 'livrables', 'FOR_LIFE_Tome1_Apprivoiser_l_ordinateur.docx'),
});
