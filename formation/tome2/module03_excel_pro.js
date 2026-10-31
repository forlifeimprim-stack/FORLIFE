// Tome 2 · Module 3 : Excel, l'assistant comptable
const { C } = require('../outils/livre');

module.exports = {
  num: 3,
  titre: 'Excel, l\'assistant comptable',
  sousTitre: 'La tontine sans dispute',
  objectifs: [
    'organiser ses données en **tableau** propre, **trier** et **filtrer** ;',
    'figer une adresse avec le signe **$** (références absolues) ;',
    'utiliser les fonctions **SI**, **NB.SI**, **SOMME.SI** et **RECHERCHEX** ;',
    'mettre en couleur automatiquement avec la **mise en forme conditionnelle** ;',
    'présenter ses chiffres en **graphique** et les résumer avec un **tableau croisé dynamique**.',
  ],
  duree: 'Huit heures, en trois séances', materiel: 'Un ordinateur avec Microsoft Excel (Microsoft 365 conseillé)', prerequis: 'Tome 1, module 6',

  situation: [
    { h2: 'La tontine de l\'allée B' },
    'Tantie Akissi est devenue trésorière de la tontine des trente femmes de son allée au marché. Chacune verse 10 000 F par semaine ; chaque semaine, une membre « prend la tontine ». Le cahier de l\'ancienne trésorière est illisible. À la dernière réunion, deux membres affirment avoir payé, le cahier dit le contraire, le ton monte, et Tante Bintou menace de quitter le groupe.',
    { d: ['Tantie Akissi', 'Avec trente personnes et cinquante-deux semaines, même Excel va se fatiguer !'] },
    { d: ['M. Kouassi', 'Excel ne se fatigue jamais, Tantie. On va lui apprendre à dire tout seul qui est à jour et qui est en retard, en couleur. Et le jour de la réunion, vous montrerez un graphique. Plus personne ne discutera.'] },
  ],

  declic: [
    { h2: 'Cinq outils, cinq images' },
    { tableau: [['Outil', 'Comme dans la vie…', 'À quoi il sert'], [
      ['Le **$** (référence absolue)', 'L\'adresse du chef de quartier : on la donne telle quelle, elle ne change pas selon l\'endroit d\'où l\'on part', 'Garder une cellule fixe quand on recopie une formule'],
      ['La fonction **SI**', 'Le gardien du portail : « Si tu as ton badge, tu entres ; sinon, tu restes dehors »', 'Afficher un résultat selon une condition'],
      ['**NB.SI** et **SOMME.SI**', 'Compter les pagnes rouges dans le tas, ou additionner seulement le prix des pagnes rouges', 'Compter ou additionner seulement ce qui répond à un critère'],
      ['**RECHERCHEX**', 'L\'annuaire : on cherche un nom, on lit le numéro en face', 'Retrouver une information dans une liste'],
      ['La **mise en forme conditionnelle**', 'Le feu tricolore : rouge, orange, vert, sans qu\'on ait à lire', 'Colorer automatiquement les cellules selon leur valeur'],
    ], [1.3, 2.3, 1.8]] },
    { h3: 'Le signe $ en détail' },
    'Quand on recopie une formule vers le bas, Excel décale les adresses : C2 devient C3, puis C4. C\'est ce qu\'on veut le plus souvent. Mais si toutes les lignes doivent utiliser **la même** cellule (un taux, un montant de cotisation), il faut l\'« attacher » avec des **$** : **$F$1** reste **$F$1** partout. Astuce : après avoir tapé F1 dans la formule, appuyez sur **F4**, Excel ajoute les $ tout seul.',
    { h3: 'Le langage des fonctions' },
    'En français, Excel sépare les éléments d\'une fonction par des **points-virgules**. Les textes s\'écrivent **entre guillemets**.',
    { tableau: [['Fonction', 'Se lit…', 'Exemple'], [
      ['**=SI(test ; si vrai ; si faux)**', '« Si… alors… sinon… »', '=SI(D2>=E2;"À jour";"En retard")'],
      ['**=NB.SI(plage ; critère)**', '« Combien de fois… ? »', '=NB.SI(F2:F31;"En retard")'],
      ['**=SOMME.SI(plage ; critère ; à additionner)**', '« Le total de… pour… »', '=SOMME.SI(B:B;"Bintou";C:C)'],
      ['**=RECHERCHEX(cherché ; où chercher ; quoi rapporter)**', '« Trouve… et donne-moi… »', '=RECHERCHEX("Bintou";A:A;B:B)'],
    ], [2, 1.4, 2]] },
    { note: 'RECHERCHEX existe dans Microsoft 365 et Excel 2021. Dans les versions plus anciennes, on utilise RECHERCHEV : =RECHERCHEV("Bintou";A:B;2;FAUX).' },
  ],

  pasAPas: [
    { h2: 'Le classeur de la tontine' },
    { h3: 'Étape 1 : deux feuilles bien rangées' },
    { etapes: [
      'Nouveau classeur, enregistré sous **Tontine allée B 2026**. Renommez la première feuille **Membres** (double-clic sur l\'onglet en bas) et ajoutez une feuille **Versements** avec le **+**.',
      'Feuille **Membres** : colonnes **Nom** (A), **Téléphone** (B), **Total versé** (C), **Attendu** (D), **Situation** (E).',
      'Feuille **Versements** : une ligne par versement, colonnes **Date** (A), **Nom** (B), **Montant** (C). On n\'efface jamais une ligne : on ajoute.',
      'Sur chaque feuille, cliquez dans les données → **Accueil** → **Mettre sous forme de tableau** → choisissez un style → cochez **Mon tableau comporte des en-têtes**. Le tableau s\'agrandit tout seul quand on ajoute des lignes, et des **flèches de filtre** apparaissent sur les en-têtes.',
    ] },
    { h3: 'Étape 2 : le total versé par chaque membre' },
    { etapes: [
      'Feuille **Membres**, cellule **C2** : tapez **=SOMME.SI(Versements!B:B;A2;Versements!C:C)**. Traduction : « dans la feuille Versements, additionne les montants de la colonne C pour les lignes où le nom (colonne B) est celui de A2 ».',
      'Validez : dans un tableau, Excel recopie la formule sur toutes les lignes automatiquement. Sinon, double-cliquez sur la poignée de recopie.',
    ] },
    { h3: 'Étape 3 : qui est à jour ?' },
    { etapes: [
      'En **G1**, tapez **Semaines écoulées** et en **H1** le nombre (par exemple **12**). En **G2**, tapez **Cotisation** et en **H2**, **10000**.',
      'En **D2** (Attendu) : **=$H$1\\*$H$2**. Les **$** attachent ces deux cellules : toutes les membres ont le même attendu.',
      'En **E2** (Situation) : **=SI(C2>=D2;"À jour";"En retard")**.',
      'Chaque semaine, il suffit de changer **H1** : toute la colonne Situation se met à jour.',
    ] },
    { h3: 'Étape 4 : les couleurs automatiques' },
    { etapes: [
      'Sélectionnez la colonne **Situation**.',
      '**Accueil** → **Mise en forme conditionnelle** → **Règles de mise en surbrillance des cellules** → **Égal à…** → tapez **En retard** → choisissez **Remplissage rouge clair avec texte rouge foncé**.',
      'Recommencez avec **À jour** et un remplissage vert.',
      'Ajoutez en dessous du tableau : **Nombre en retard** et **=NB.SI(E:E;"En retard")**.',
    ] },
    { illus: 'Capture d\'écran : la feuille Membres de la tontine, avec la colonne Situation colorée en vert et rouge, les flèches de filtre sur les en-têtes et la formule SI visible dans la barre de formule.' },
    { h3: 'Étape 5 : trier, filtrer, retrouver' },
    { puces: [
      '**Trier** : flèche de l\'en-tête **Total versé** → **Trier du plus grand au plus petit**.',
      '**Filtrer** : flèche de l\'en-tête **Situation** → ne cochez que **En retard** : seules les retardataires s\'affichent. **Effacer le filtre** pour tout revoir.',
      '**Retrouver un téléphone** : en **J2**, tapez un nom ; en **K2** : **=RECHERCHEX(J2;A:A;B:B)**.',
      '**Figer les en-têtes** pour qu\'ils restent visibles en descendant : **Affichage** → **Figer les volets** → **Figer la ligne supérieure**.',
    ] },
    { h3: 'Étape 6 : le graphique et le tableau croisé dynamique' },
    { etapes: [
      '**Graphique** : sélectionnez les colonnes **Nom** et **Total versé** → **Insertion** → **Graphiques recommandés** → choisissez un histogramme → **OK**. Donnez-lui un titre clair.',
      '**Tableau croisé dynamique** (le résumé en un clic) : cliquez dans le tableau **Versements** → **Insertion** → **Tableau croisé dynamique** → **Nouvelle feuille** → **OK**.',
      'Dans le panneau de droite, glissez **Nom** dans **Lignes** et **Montant** dans **Valeurs** : Excel affiche le total par membre. Glissez **Date** dans **Colonnes** pour voir par mois.',
      'Quand de nouveaux versements sont saisis : clic droit dans le tableau croisé → **Actualiser**.',
    ] },
  ],

  pieges: {
    lignes: [
      ['␣ « Bintou » et « Bintou » avec un espace à la fin', 'Pour Excel, ce sont deux personnes différentes : SOMME.SI les sépare.', 'Saisir les noms à partir d\'une liste, ou nettoyer avec =SUPPRESPACE(A2).'],
      ['🔗 Fusionner des cellules dans un tableau de données', 'Le tri, le filtre et les tableaux croisés ne marchent plus.', 'Ne fusionner que dans les titres de présentation.'],
      ['📅 Taper les dates comme du texte (« 3 nov »)', 'Impossible de trier ou de grouper par mois.', 'Taper 03/11/2026 : la date se cale à droite de la cellule.'],
      ['📌 Oublier les $ pour un montant commun', 'En recopiant, la formule pointe vers des cellules vides : résultats faux.', 'F4 pour attacher la cellule.'],
      ['✏️ Effacer d\'anciens versements « pour faire propre »', 'On perd l\'historique et les preuves.', 'On ajoute des lignes, on ne les efface pas.'],
    ],
    questions: [
      ['Excel affiche #N/A ou #NOM?. J\'ai tout cassé ?', 'Non. **#N/A** veut souvent dire « je n\'ai pas trouvé » (nom mal orthographié dans RECHERCHEX). **#NOM?** veut dire « je ne connais pas cette fonction » (faute de frappe dans le nom de la fonction, ou version d\'Excel trop ancienne). Cliquez sur la cellule et relisez la formule.'],
      ['Un tableau croisé dynamique, c\'est pour les experts ?', 'Non : c\'est l\'outil qui fait gagner le plus de temps aux débutants. Quatre glisser-déposer suffisent pour résumer des centaines de lignes.'],
    ],
  },

  exercices: {
    echauffe: [
      { h3: 'Exercice 1 : je lis les formules' },
      { tableau: [['Formule', 'Ce qu\'elle fait'], [
        ['=SI(B2>=50000;"Gros client";"Client")', ''], ['=NB.SI(C2:C40;"Abobo")', ''], ['=SOMME.SI(A:A;"Wax";D:D)', ''], ['=B2\\*$G$1', ''],
      ], [2.2, 2.8], C.bleu] },
    ],
    entraine: [
      { h3: 'Exercice 2 : la tontine' },
      'Construisez le classeur de la tontine avec au moins dix membres et trente versements inventés. Toutes les formules du pas à pas doivent fonctionner, avec les couleurs automatiques.',
    ],
    lance: [
      { h3: 'Exercice 3 : le tableau de bord' },
      'Ajoutez une feuille **Tableau de bord** qui affiche : le total collecté, le nombre de membres à jour et en retard, la membre ayant le plus versé (fonction **MAX**, puis **RECHERCHEX**), et un graphique. Elle doit se mettre à jour toute seule.',
    ],
  },

  cas: [
    { h2: 'La réunion de la tontine' },
    'Dimanche, réunion. Tante Bintou dit avoir versé douze semaines ; la feuille Membres indique 110 000 F pour elle, alors que l\'attendu est de 120 000 F.',
    { etapes: [
      'Comment Tantie Akissi peut-elle afficher **tous** les versements de Tante Bintou en dix secondes ?',
      'En vérifiant, elle découvre une ligne au nom de « Bintou » avec un espace à la fin. Que se passe-t-il, et comment corriger ?',
      'Quel graphique projeter à la réunion pour que chacune voie la situation ?',
      'Proposez une règle simple pour que ce problème ne se reproduise pas.',
    ] },
  ],

  retiens: [
    '**Mettre sous forme de tableau** : filtres, recopie automatique, tableau qui grandit tout seul.',
    'Le **$** attache une cellule (touche **F4**). Séparateur des fonctions : **;**. Textes **entre guillemets**.',
    '**SI** : si… alors… sinon. **NB.SI** : compter. **SOMME.SI** : additionner selon un critère. **RECHERCHEX** : retrouver.',
    '**Mise en forme conditionnelle** : les couleurs qui parlent toutes seules.',
    '**Insertion → Graphiques recommandés** ; **Insertion → Tableau croisé dynamique**, puis **Actualiser**.',
    'Des noms écrits toujours **pareil**, des dates de vraies dates, pas de cellules fusionnées dans les données.',
  ],
  defi: [
    'Cette semaine, transformez un vrai cahier (tontine, cotisations d\'association, ventes, dépenses familiales) en classeur Excel avec au moins une fonction SI, une mise en forme conditionnelle et un graphique.',
  ],
  motDeLaFin: 'À la réunion suivante, Tantie Akissi a projeté le tableau sur le mur de la salle paroissiale. Vingt-huit lignes vertes, deux rouges. Tante Bintou a vu son nom en double, a ri, et a payé ses 10 000 F manquants sur-le-champ. Le soir même, deux autres tontines du marché ont demandé à Tantie de leur faire « le même papier qui colore ».',
  quiz: [
    'Pour que toutes les lignes utilisent la même cellule H2, j\'écris… **a)** H2 · **b)** $H$2 · **c)** #H2.',
    '=SI(C2>=D2;"À jour";"En retard") affiche « En retard » quand… **a)** C2 est plus petit que D2 · **b)** C2 est égal à D2 · **c)** toujours.',
    'Pour compter les cellules contenant « En retard », j\'utilise… **a)** SOMME · **b)** NB.SI · **c)** MAX.',
    'Pour résumer des centaines de lignes par personne et par mois, j\'utilise… **a)** un tableau croisé dynamique · **b)** Word · **c)** la Corbeille.',
  ],
  corriges: [
    ['Exercice 1', 'Affiche « Gros client » si B2 vaut au moins 50 000, sinon « Client » · Compte les cellules de C2 à C40 contenant « Abobo » · Additionne la colonne D pour les lignes où A contient « Wax » · Multiplie B2 par la cellule fixe G1.'],
    ['Exercice 3', 'Total : =SOMME(Membres!C:C) · À jour : =NB.SI(Membres!E:E;"À jour") · En retard : =NB.SI(Membres!E:E;"En retard") · Meilleure : =RECHERCHEX(MAX(Membres!C:C);Membres!C:C;Membres!A:A).'],
    ['Cas pratique', '**1.** Feuille Versements, flèche du filtre sur Nom, ne cocher que Bintou (ou utiliser le tableau croisé dynamique). **2.** Le versement au nom « Bintou » est compté pour une autre personne : SOMME.SI ne le rattache pas. Corriger le nom (ou utiliser =SUPPRESPACE), puis actualiser. **3.** Un histogramme du Total versé par membre, avec une ligne de l\'attendu, ou le tableau Membres coloré. **4.** Choisir les noms dans une liste déroulante (Données → Validation des données → Liste) au lieu de les taper.'],
    ['Mini-quiz', '1-b · 2-a · 3-b · 4-a'],
  ],
  glossaire: [
    ['Référence absolue', 'Une adresse attachée par des $ ($H$2), qui ne change pas quand on recopie la formule.'],
    ['Fonction SI', 'Une fonction qui affiche un résultat ou un autre selon une condition.'],
    ['NB.SI / SOMME.SI', 'Des fonctions qui comptent ou additionnent seulement les lignes répondant à un critère.'],
    ['RECHERCHEX', 'Une fonction qui cherche une valeur dans une colonne et rapporte l\'information correspondante.'],
    ['Mise en forme conditionnelle', 'La coloration automatique des cellules selon leur contenu.'],
    ['Tableau croisé dynamique', 'Un résumé automatique d\'un grand tableau, construit par glisser-déposer.'],
    ['Filtre', 'Un outil qui n\'affiche que les lignes répondant à un choix.'],
  ],
};
