// Tome 3 : notes du formateur, module par module.
module.exports = {
  1: {
    accroche: 'Créez en direct, en cinq minutes, une page vitrine pour un commerce choisi par le groupe. Puis demandez : « Qu\'est-ce qui manque pour la livrer à un vrai client ? »',
    conseils: [
      'Choisissez un seul outil pour tout le groupe et vérifiez à l\'avance les conditions de son offre gratuite.',
      'Faites créer les comptes (e-mail dédié, outil, GitHub) dès la première séance, avec la double authentification.',
      'Tempérez l\'enthousiasme : montrez aussi une erreur ou une invention de l\'IA dans la démonstration.',
      'Installez dès le départ le rituel du journal de bord.',
    ],
    variante: 'Si les apprenants n\'ont pas de moyen de paiement pour les abonnements, restez sur les offres gratuites et regroupez les essais.',
  },
  2: {
    accroche: '« Écrivez la recette de l\'attiéké-poisson pour quelqu\'un qui n\'a jamais cuisiné. » Lisez quelques recettes et relevez les étapes oubliées.',
    conseils: [
      'Ce module se fait surtout sans ordinateur : papier, crayon, tableau.',
      'Faites jouer l\'entretien client : un apprenant joue Tantie Akissi, un autre pose les six questions.',
      'Faites dessiner les écrans et les faire « tester » par un autre groupe avec le doigt.',
      'Valorisez la série des « et si… ? » : c\'est la marque d\'un bon concepteur.',
    ],
    variante: 'Invitez un vrai commerçant ou responsable d\'association pour un entretien en direct.',
  },
  3: {
    accroche: 'Montrez la réponse technique de l\'IA de la situation et demandez : « Qui accepterait sans comprendre ? »',
    conseils: [
      'Dessinez la boutique (vitrine, arrière-boutique, cahier, coursier) au tableau et gardez le dessin pour tout le tome.',
      'Faites ouvrir les outils de développement (F12) sur un site connu et repérer la console.',
      'Montrez le mode Code de l\'outil et faites expliquer un fichier par l\'IA.',
      'Ne cherchez pas à enseigner la programmation : l\'objectif est de savoir où regarder et quoi demander.',
    ],
    variante: 'Pour les apprenants curieux, proposez une introduction optionnelle de trente minutes au HTML (modifier un titre, une couleur) pour démystifier le code.',
  },
  4: {
    accroche: 'Faites passer une même commande vague et une commande précise à deux groupes « couturiers » qui dessinent la robe : comparez.',
    conseils: [
      'Faites rédiger le premier prompt du projet personnel en séance et relire par un binôme qui joue l\'IA.',
      'Montrez le mode plan sur une modification importante.',
      'Constituez une bibliothèque de prompts commune au groupe, partagée en ligne.',
      'Attirez l\'attention sur la consommation de crédits des outils.',
    ],
    variante: 'Organisez un concours du meilleur premier prompt, évalué par le groupe selon les huit rubriques.',
  },
  5: {
    accroche: '« Si une cliente de Paris cherche “pagne wax Adjamé” ce soir, que trouve-t-elle ? »',
    conseils: [
      'Faites construire la vitrine page par page, avec une vérification sur téléphone après chaque page.',
      'Vérifiez avec chacun le format du lien WhatsApp sur un vrai téléphone.',
      'Organisez la recette en échangeant les projets entre binômes.',
      'Encouragez fortement l\'exercice 3 (vitrine pour un vrai commerçant) : c\'est le début du portfolio.',
    ],
    variante: 'Avec un groupe avancé, ajoutez une petite page d\'administration qui lit les prix dans une feuille Google Sheets.',
  },
  6: {
    accroche: '« Bintou peut-elle voir ce qu\'Adjoua a payé ? Comment en être sûr ? »',
    conseils: [
      'Prévoyez du temps pour la connexion au service de données : c\'est souvent l\'étape qui bloque.',
      'Faites le test des badges collectivement : un apprenant essaie de « tricher », le groupe observe.',
      'Montrez l\'onglet Réseau pour rendre visibles les données qui transitent.',
      'Rappelez l\'usage exclusif de données fictives pendant la formation.',
    ],
    variante: 'Si l\'outil choisi ne gère pas facilement les règles d\'accès, utilisez une base Supabase préparée par vous, avec des règles à compléter.',
  },
  7: {
    accroche: 'Introduisez volontairement un bug dans un projet de démonstration et faites deviner la cause au groupe, sans console, puis avec.',
    conseils: [
      'Faites écrire des prompts SAVE au tableau et améliorez-les ensemble.',
      'Montrez une vraie boucle infernale, puis la sortie par retour à la dernière version qui marchait.',
      'Instituez le carnet de bugs comme pièce obligatoire du journal de bord.',
      'Félicitez les apprenants qui s\'arrêtent après trois essais : c\'est un signe de maturité.',
    ],
    variante: 'Organisez une « chasse aux bugs » : chaque binôme casse le projet d\'un autre, qui doit le réparer avec la méthode SAVE.',
  },
  8: {
    accroche: '« Si votre compte sur l\'outil était fermé demain matin, que perdriez-vous ? »',
    conseils: [
      'Faites relier chaque projet à GitHub en séance, et vérifiez ensemble que le fichier .env n\'y est pas.',
      'Montrez l\'historique des commits d\'un vrai projet et un retour en arrière.',
      'Faites une Pull Request en direct entre deux binômes.',
      'Insistez sur les dépôts privés pour les projets clients.',
    ],
    variante: 'Pour les plus avancés, présentez GitHub Desktop ou un agent de code travaillant directement sur le dépôt.',
  },
  9: {
    accroche: 'Montrez une adresse d\'aperçu illisible, puis une adresse en .ci : « Laquelle mettriez-vous sur votre affiche ? »',
    conseils: [
      'Faites déployer chaque vitrine en séance par les deux chemins (outil, puis GitHub vers Vercel ou Netlify).',
      'Si possible, achetez un nom de domaine de démonstration pour montrer la configuration DNS en direct.',
      'Faites un Rollback en démonstration.',
      'Insistez sur le nom de domaine au nom du client et sur le renouvellement.',
    ],
    variante: 'Sans budget pour un nom de domaine, montrez les étapes sur des captures et restez sur les adresses gratuites de l\'hébergeur.',
  },
  10: {
    accroche: 'Ouvrez F12 sur une page de démonstration contenant une fausse clé visible, et demandez au groupe de la trouver.',
    conseils: [
      'Faites faire la chasse aux secrets sur tous les projets du groupe : on en trouve presque toujours.',
      'Faites réaliser la revue de sécurité par l\'IA, puis corrigez une faille ensemble.',
      'Passez Lighthouse en direct et améliorez un point.',
      'Abordez la loi n° 2013-450 et l\'ARTCI avec sérieux : c\'est la responsabilité du futur prestataire.',
    ],
    variante: 'Invitez un professionnel de la cybersécurité pour un échange de trente minutes.',
  },
  11: {
    accroche: '« Comment le maquis d\'à côté accepte-t-il tous les opérateurs Mobile Money ? »',
    conseils: [
      'Préparez à l\'avance un compte de test chez un agrégateur, avec sa documentation.',
      'Faites dessiner le parcours d\'un paiement (six étapes) avant d\'ouvrir l\'outil.',
      'Testez collectivement les six cas, dont le faux webhook.',
      'Ne passez jamais en production pendant la formation sans l\'accord d\'un vrai client.',
    ],
    variante: 'Si aucun agrégateur n\'est accessible, simulez le webhook avec un outil de test et concentrez-vous sur la logique de vérification.',
  },
  12: {
    accroche: '« Listez les trois tâches que vous refaites chaque semaine en copiant-collant. »',
    conseils: [
      'Construisez le scénario de Mariam en direct avec Run once, en montrant les bulles qui s\'allument.',
      'Faites automatiser une vraie tâche de chaque apprenant.',
      'Montrez un agent d\'IA qui prépare des brouillons, et insistez sur la validation humaine.',
      'Parlez des coûts : opérations, crédits d\'IA.',
    ],
    variante: 'Pour un groupe d\'entreprise, travaillez sur leurs outils internes (Microsoft 365 et Power Automate peuvent remplacer Make).',
  },
  13: {
    accroche: '« Combien factureriez-vous l\'application de la tontine ? » Recueillez les chiffres, souvent très bas, puis faites le calcul ensemble.',
    conseils: [
      'Faites calculer le taux horaire de chacun avec ses vrais chiffres.',
      'Faites rédiger un devis complet et le faire « signer » par un binôme qui joue le client exigeant.',
      'Insistez sur la transparence et l\'honnêteté envers les clients.',
      'Invitez un indépendant du numérique ou un comptable pour parler statut et facturation.',
    ],
    variante: 'Organisez une simulation complète : un client (joué par vous) présente un besoin, les binômes répondent avec cahier des charges, devis et calendrier.',
  },
  projet: {
    conseils: [
      'Exigez un vrai client chaque fois que c\'est possible ; sinon, le sujet de la coopérative de Daloa.',
      'Planifiez trois revues d\'étape : cahier des charges, première version, sécurité.',
      'La soutenance inclut une démonstration en direct sur téléphone et l\'explication honnête du rôle de l\'IA.',
      'Évaluez particulièrement la sécurité : un projet avec une clé secrète exposée ne peut pas obtenir la note maximale.',
    ],
  },
};
