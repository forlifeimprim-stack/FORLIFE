// Tome 3 : liminaires (préface, test de positionnement) et pages communes.
const { liminairesCommuns } = require('../outils/liminaires');
const { C } = require('../outils/livre');

const communs = liminairesCommuns({
  num: 3, titre: 'Créer avec l\'IA', sousTitre: 'Le vibe coding, de l\'idée à l\'application en ligne', niveau: 'Niveau expert',
  logiciels: 'Outils de référence : des plateformes de création d\'applications par intelligence artificielle (Lovable, Bolt, Replit, Google AI Studio…), des éditeurs assistés par IA (Cursor, Claude Code…), GitHub, Vercel, Netlify, Supabase, Make et Zapier. Les noms et les offres changent vite : la méthode, elle, reste.',
  prerequis: 'Il suppose acquis les Tomes 1 et 2, en particulier la sécurité des comptes, le travail en ligne et l\'usage raisonné de l\'intelligence artificielle. **Vous n\'apprendrez pas à écrire du code** : vous apprendrez à le faire écrire, à le comprendre assez pour le diriger, et à le livrer.',
  quand: 'deux ans après leurs débuts',
  personnages: [
    ['**Yao**', 'Diplômé, il veut devenir créateur d\'applications indépendant, sans avoir fait d\'école d\'informatique.'],
    ['**Koffi**', 'Son secrétariat est devenu une petite entreprise. Il veut ses propres outils : prise de rendez-vous, suivi des clients, paiement en ligne.'],
    ['**Mariam**', 'Assistante de direction, elle veut automatiser les tâches répétitives de son service.'],
    ['**Tantie Akissi**', 'Première cliente de Yao : elle veut une vitrine en ligne et une application pour sa tontine.'],
    ['**M. Kouassi**', 'Il a lui-même appris le vibe coding. Il en connaît la puissance… et les pièges.'],
  ],
  logicielsDetail: 'La plupart des plateformes proposent une offre gratuite limitée, suffisante pour apprendre ; les projets réels demandent souvent un abonnement de quelques dizaines de dollars par mois. Vérifiez les prix et les conditions au moment où vous lisez. Les exemples de ce livre ne dépendent d\'aucun outil précis : chaque étape indique ce qu\'il faut chercher dans l\'outil que vous utilisez.',
  projet: 'Une application complète pour un vrai client',
  competences: 'L\'apprenant sait désormais concevoir une application web, la faire construire par l\'intelligence artificielle, la vérifier, la corriger, la sauvegarder, la mettre en ligne, la sécuriser, la relier à des services externes, automatiser des tâches et proposer ses services à des clients.',
});

const preface = [
  { h2: 'Préface : du lecteur à l\'auteur' },
  'Pendant longtemps, créer une application était réservé à une petite élite : des années d\'études, des langages compliqués, des équipes coûteuses. Une commerçante d\'Adjamé, un étudiant de Cocody ou une association de Korhogo qui avaient une idée devaient payer cher, attendre longtemps, ou renoncer.',
  'En février 2025, l\'informaticien Andrej Karpathy a donné un nom à une nouvelle manière de faire : le **vibe coding**. On décrit ce qu\'on veut à une intelligence artificielle, en langage courant, et elle écrit le code. On essaie, on corrige en lui parlant, et l\'application prend forme. Ce qui demandait des mois peut prendre des jours. Ce qui coûtait des millions peut coûter le prix d\'un abonnement.',
  'Ce n\'est pas de la magie, et ce livre ne vous le fera pas croire. L\'IA écrit vite, mais elle se trompe, elle oublie la sécurité, elle tourne en rond. Karpathy lui-même rappelait que la méthode brute convient aux petits projets du week-end. Pour livrer une vraie application à un vrai client, il faut une **méthode** : **décrire, construire, vérifier, corriger, sauvegarder, publier, protéger**. C\'est cette méthode que vous allez apprendre ici.',
  'Vous n\'allez pas devenir programmeur. Vous allez devenir quelque chose de plus rare : un **maître d\'ouvrage du numérique**, capable de transformer un besoin réel, de chez nous, en un outil qui fonctionne. Une vitrine pour la boutique du quartier. Une application pour la tontine. Un système de commande pour la coopérative. Et peut-être, demain, un métier.',
  'Dans le Tome 1, vous avez appris à lire le numérique. Dans le Tome 2, à l\'écrire avec aisance. Ici, vous en devenez l\'auteur.',
  { centre: '*Kouadio Koffi Elisée*' },
  { centre: '*Fondateur de FOR LIFE, formateur*' },
];

const test = [
  { h2: 'Test de positionnement : par où commencer ?' },
  'Cochez **Oui** seulement si vous savez le faire **seul, sans aide**.',
  { tableau: [['Je sais…', 'Oui', 'Non'], [
    ['1. Expliquer ce qu\'est le vibe coding et ses limites', '☐', '☐'],
    ['2. Rédiger un petit cahier des charges : utilisateurs, écrans, actions, données', '☐', '☐'],
    ['3. Expliquer la différence entre interface, serveur et base de données', '☐', '☐'],
    ['4. Écrire un premier prompt complet pour créer une application', '☐', '☐'],
    ['5. Créer une page web qui fonctionne sur téléphone avec un outil d\'IA', '☐', '☐'],
    ['6. Ajouter une inscription, une connexion et des données à une application', '☐', '☐'],
    ['7. Lire un message d\'erreur et le transmettre efficacement à l\'IA', '☐', '☐'],
    ['8. Sauvegarder un projet sur GitHub et revenir à une version précédente', '☐', '☐'],
    ['9. Mettre une application en ligne avec un nom de domaine', '☐', '☐'],
    ['10. Protéger les clés secrètes et les données des utilisateurs', '☐', '☐'],
    ['11. Ajouter un paiement par Mobile Money à une application', '☐', '☐'],
    ['12. Créer une automatisation avec Make ou Zapier', '☐', '☐'],
    ['13. Expliquer ce qu\'est un agent d\'IA et comment le garder sous contrôle', '☐', '☐'],
    ['14. Chiffrer une prestation et rédiger un devis', '☐', '☐'],
  ], [4, 0.5, 0.5]] },
  { h3: 'Mon résultat' },
  { tableau: [['Nombre de « Oui »', 'Mon parcours conseillé'], [
    ['**0 à 5**', 'Suivez tout le livre dans l\'ordre. Les modules 1 à 4 posent les fondations : ne les sautez pas.'],
    ['**6 à 10**', 'Survolez les modules 1 à 3, puis travaillez à partir du premier module où vous avez répondu « Non ».'],
    ['**11 à 14**', 'Lancez-vous directement dans le projet final, en revenant aux modules au besoin.'],
  ], [1.2, 4], C.violet] },
];

module.exports = { ...communs, preface, test };
