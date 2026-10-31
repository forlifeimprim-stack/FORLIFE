// Tome 3 · Projet final : Une application complète pour un vrai client
const L = require('../outils/livre');
const { C } = L;
const { Paragraph, TextRun } = L.docx;

const titre = 'Une application complète pour un vrai client';

const contenu = [
  new Paragraph({ spacing: { before: 200, after: 80 }, children: [new TextRun({ text: '★  PROJET FINAL', bold: true, color: C.orange, size: 26, characterSpacing: 40 })] }),
  new Paragraph({ heading: 'Heading1', spacing: { after: 80 }, children: [new TextRun({ text: titre, color: C.texte, size: 52 })] }),
  new Paragraph({ spacing: { after: 300 }, border: { bottom: { style: 'single', size: 12, color: C.orange, space: 8 } },
    children: [new TextRun({ text: 'De l\'entretien avec le client à la livraison, comme un professionnel', italics: true, size: 28, color: C.gris })] }),
  { h2: 'La mission' },
  'Trouvez un **vrai client** : une coopérative, une école, une église, une association, un commerce, un cabinet. Résolvez un **vrai problème** avec une application web complète, et livrez-la comme un professionnel. Si vous n\'avez pas de client, prenez le sujet de référence ci-dessous.',
  { encadre: { titre: '📋  Le sujet de référence : la coopérative de Daloa', style: 'violet', contenu: [
    'La **Coopérative des femmes vivrières de Daloa** vend banane plantain, manioc, piment et légumes à des restaurants d\'Abidjan. Les commandes arrivent par appels et messages WhatsApp, se perdent, et les paiements sont suivis dans un cahier.',
    'La présidente veut : un **catalogue** en ligne avec les prix de la semaine ; une **commande** en ligne pour les restaurants (avec compte) ; un **tableau de bord** pour la coopérative (commandes du jour, à livrer, payées) ; un **acompte** par Mobile Money ; une **confirmation** automatique et un **résumé** quotidien des commandes envoyé à la responsable logistique.',
  ] } },
  { h2: 'Les étapes et les livrables' },
  { tableau: [['N°', 'Étape', 'Livrable', 'Modules'], [
    ['1', 'Entretien client et cahier des charges', 'Notes d\'entretien, cahier des charges d\'une page validé, croquis des écrans, liste des « et si… ? »', '2'],
    ['2', 'Devis et accord', 'Devis signé (même symbolique), conditions de propriété et de données', '13'],
    ['3', 'Premier prompt et plan', 'Premier prompt complet, instructions permanentes du projet', '4'],
    ['4', 'Construction par étapes', 'Application avec comptes, rôles, données, règles d\'accès dans la base', '5, 6'],
    ['5', 'Paiement et messages', 'Acompte en mode test puis production, webhook vérifié, confirmation automatique', '11'],
    ['6', 'Automatisation', 'Scénario du résumé quotidien (Make ou Zapier), avec alertes d\'erreur', '12'],
    ['7', 'Sauvegarde', 'Dépôt GitHub privé, commits clairs, README', '8'],
    ['8', 'Sécurité et qualité', 'Revue de sécurité, test des badges, Lighthouse, page Confidentialité, liste de contrôle complète', '10'],
    ['9', 'Mise en ligne', 'Application en production sur un nom de domaine, aperçu séparé, Rollback testé', '9'],
    ['10', 'Livraison', 'Formation du client (une page de guide), liste des accès et coûts récurrents, proposition de maintenance', '13'],
  ], [0.4, 1.6, 2.8, 0.7], C.violet] },
  { h2: 'La soutenance' },
  'En vingt minutes, devant un jury (et si possible le client) : le problème, la démarche, une **démonstration en direct** sur téléphone (une commande, un paiement test, le tableau de bord, le résumé automatique), la sécurité, ce que l\'IA a fait et ce que **vous** avez décidé et vérifié, les limites et la suite. Le client, s\'il est présent, dit en deux phrases ce que l\'application change pour lui.',
  { h2: 'La grille d\'évaluation' },
  { tableau: [['Critère', 'Points', 'Moi', 'Jury'], [
    ['Cahier des charges clair, validé par le client, cas particuliers traités', '3', '', ''],
    ['Application fonctionnelle, simple, adaptée au téléphone', '4', '', ''],
    ['Sécurité : règles d\'accès, secrets protégés, revue faite, liste de contrôle', '4', '', ''],
    ['Paiement et automatisation fiables, cas d\'échec gérés', '3', '', ''],
    ['GitHub, mise en ligne, nom de domaine, Rollback', '2', '', ''],
    ['Livraison professionnelle : devis, guide, accès, maintenance', '2', '', ''],
    ['Soutenance : clarté, honnêteté sur l\'usage de l\'IA', '2', '', ''],
    ['**Total**', '**20**', '', ''],
  ], [3.4, 0.6, 0.6, 0.8], C.violet] },
  { encadre: { titre: '🎉  Félicitations', style: 'vert', contenu: [
    'Avec 14 points ou plus, vous êtes devenu ce que ce livre promettait : un **créateur numérique**, capable de transformer un besoin réel en un outil qui fonctionne, de le livrer et de l\'entretenir. Du Tome 1 au Tome 3, vous êtes passé de l\'illettrisme numérique à l\'auteur. Transmettez maintenant ce que vous avez appris : à votre tour, apprenez à quelqu\'un à apprivoiser l\'ordinateur.',
  ] } },
];

const corriges = [
  ['Grille', 'Pas de corrigé unique. Les erreurs les plus fréquentes : cahier des charges trop vague, règles d\'accès non testées avec plusieurs comptes, clé secrète oubliée dans l\'interface, paiement marqué « payé » sans webhook vérifié, scénario sans alerte d\'erreur, nom de domaine au nom du prestataire, absence de guide pour le client, et une soutenance qui cache le rôle de l\'IA au lieu d\'expliquer la méthode.'],
];

module.exports = { titre, contenu, corriges };
