# Rapport T12 : rédaction du lot 3

Konan (plume). Travail du 9 au 13 novembre 2026, interrompu plusieurs fois par la limite d’utilisation et repris depuis le point d’arrêt.

## STATUT

TERMINÉ. Six fichiers rédigés, contrôle des versets propre sur chacun, aucun tiret cadratin ni demi-cadratin, essai de composition fait et regardé (chapitre 10 et annexes, carte et frise comprises).

## RÉSUMÉ

Les chapitres 9 à 12, la conclusion et les annexes suivent le plan détaillé : déroulé, encadrés, versets clés en bloc, leçons, trois questions au tutoiement. J’ai appliqué les décisions T09 : récit à la troisième personne, tutoiement dans les leçons et les questions, « nous » dans les transitions, une courte prière finale par chapitre, à la première personne, close par « Au nom de Jésus. Amen. », proposée comme brouillon. Les positions doctrinales sont exposées sans être tranchées et consignées dans `manuscrit/questions-auteur-lot3.md`, avec la formulation neutre retenue. Aucune marque [À COMPLÉTER] ni [À VÉRIFIER] dans le texte. Les leçons commencent par une phrase ordinaire, sans gras, selon la décision d’harmonisation d’Akissi.

L’essai de composition a montré un défaut : avec la légende longue, la carte pleine page (170 mm de haut) renvoyait sa légende seule sur une page blanche. J’ai réduit la légende à une ligne, « Le monde de Jérémie (carte schématique). », et placé la mention des positions approximatives dans le paragraphe qui précède. La carte et sa légende tiennent maintenant sur une seule page, sans titre courant.

## FICHIERS

Produits, dans `/home/user/FORLIFE/livres/jeremie/.edition/` :

| Fichier | Mots (texte lisible) | `wc -w` | Cible du plan | Écart |
|---|---|---|---|---|
| `manuscrit/11-ch09-consolation.md` | 3 435 | 3 550 | 3 200 | + 7 % |
| `manuscrit/12-ch10-citerne.md` | 3 362 | 3 448 | 3 300 | + 2 % |
| `manuscrit/13-ch11-ruines.md` | 2 783 | 2 853 | 3 000 | − 7 % |
| `manuscrit/14-ch12-egypte.md` | 2 959 | 2 979 | 3 200 | − 8 % |
| `manuscrit/15-conclusion.md` | 1 391 | 1 407 | 1 500 | − 7 % |
| `manuscrit/16-annexes.md` | 1 090 (dont 290 hors tableaux) | 1 340 | 700 de texte | au-dessus, voir plus bas |
| `manuscrit/questions-auteur-lot3.md` | | | | |
| `rapports/T12-konan.md` | | | | |

Comptage « texte lisible » : mots du fichier sans le balisage Markdown et sans les signes de ponctuation isolés (script dans le dossier de travail). Toutes les parties rédigées sont dans la marge de plus ou moins 10 %. Les annexes dépassent les 700 mots parce que l’annexe « Qui est qui » (32 lignes) et la chronologie (23 lignes) sont des tableaux ; la prose seule fait 290 mots.

Essai de composition (hors `sortie/`) : `/tmp/claude-0/-home-user-FORLIFE/ef469a51-b9ee-55ef-a414-9b10ccc34b69/scratchpad/essai/essai-lot3.pdf` (chapitre 10 et annexes, 30 pages) et sa version écran.

Lus : protocole, fiche projet, journal (décisions T09), charte de voix, feuille de style, charte graphique, chapitre exemple, lexique, bible visuelle, rapport T06 de Kouamé, plan détaillé, leçons des chapitres 1 à 8 (lots 1 et 2) pour la conclusion, `questions-auteur-lot2.md` pour le format. Je n’ai pas modifié les fichiers des lots 1 et 2.

## VÉRIFICATIONS

- `python3 outils/controle_versets.py` sur chaque fichier, dernier passage :
  - chapitre 9 : 50 conformes, 0 écart, 0 référence introuvable, 22 références seules valides ;
  - chapitre 10 : 34 conformes, 0 écart, 0 introuvable, 48 références seules ;
  - chapitre 11 : 30 conformes, 0 écart, 0 introuvable, 36 références seules ;
  - chapitre 12 : 29 conformes, 0 écart, 0 introuvable, 45 références seules ;
  - conclusion : 15 conformes, 0 écart, 0 introuvable, 4 références seules ;
  - annexes : 2 conformes, 0 écart, 0 introuvable, 68 références seules.
- Le seul écart rencontré en cours de route (chapitre 9, Jérémie 31:3) venait d’un défaut de l’outil (voir points ouverts) ; j’ai reformulé la citation au lieu de forcer la casse.
- Une remarque typographique subsiste au chapitre 10 (« capitale de vers à abaisser : Juifs ») : c’est un nom de peuple, la capitale est juste.
- Tirets comptés en Python sur les six fichiers : U+2014 = 0 et U+2013 = 0 partout ; aucune apostrophe droite.
- Mots et tournures interdits : recherche par script sur la liste du protocole. Restent seulement des faux positifs vérifiés à la main : « ce n’est pas » dans la citation de Jérémie 15:19 (conclusion), « plus qu’un tas de cendres » et « témoin véritable » (citation de Jérémie 42:5) au chapitre 11. J’ai réécrit les phrases construites en « ce n’est pas X, c’est Y », « pas seulement », et les questions rhétoriques suivies de leur réponse.
- Versets : tous tirés de la LSG 1910 locale par `outils/verset.py`. La vérification « en ligne » demandée par la fiche de rôle n’est pas possible dans cette session (réseau limité) ; la source locale est celle validée par Akissi.
- Composition : `python3 outils/composer.py manuscrit/12-ch10-citerne.md manuscrit/16-annexes.md --sortie <dossier de travail> --nom essai-lot3`, 30 pages, aucun avertissement de tiret ni de titre courant trop long (le titre du chapitre 11 a reçu `court="Parmi les ruines"`). Pages regardées en image : ouverture du chapitre 10 (étiquette, titre, fleuron, épigraphe), fin du chapitre (questions, prière), frise avec sa légende (page 23 de l’essai), carte pleine page avec légende sur une ligne. La syntaxe `{#conclusion - court="Conclusion"}` a été composée sans erreur dans l’essai des annexes (`{#annexes - court="Annexes"}`), mais la conclusion elle-même n’a pas été composée.
- Non vérifié : composition des chapitres 9, 11, 12 et de la conclusion ; rendu EPUB.

## HYPOTHÈSES

- Une épigraphe courte en tête de chaque chapitre (la charte graphique la prévoit après le fleuron), bien que le plan n’en parle pas. À harmoniser avec les lots 1 et 2 à la correction.
- Chronologie : dates de la frise de Kouamé reprises telles quelles, y compris Sédécias « vers 597-586 » et Guedalia « vers 586 », alors que le texte du livre dit « 587 ou 586 » pour la chute.
- Le titre de la conclusion reprend celui du plan : « Conclusion : ce que Jérémie enseigne au serviteur de Dieu ».
- « Serviteur de Dieu » est pris au sens large (chaire, école du dimanche, groupe de prière) en attendant l’auteur.

## POINTS OUVERTS ET RISQUES

Passages les plus fragiles :

1. Chapitre 9, paragraphe final de « L’alliance nouvelle » : formulation neutre sur Israël et l’Église. C’est la position que le plan jugeait la plus structurante ; elle doit être relue par l’auteur en priorité.
2. Chapitre 10, « Peut-être un miracle » : présentation de l’appel à la reddition comme parole « pour ce moment précis ». Sensible pour des lecteurs qui en tireraient une règle politique.
3. Chapitre 10, encadré « Le pays d’Ébed-Mélec » : citation de Jérémie 13:23 sur la peau de l’Éthiopien. Le verset est exact, mais son emploi devant un lectorat africain mérite le regard de l’auteur ; on peut le retirer sans perte.
4. Chapitre 11, encadré des Lamentations : tradition d’attribution et lecture alphabétique, non vérifiées sur une source imprimée.
5. Chapitre 12, Matthieu 27:9-10 : difficulté signalée sans solution.
6. Annexes : dates « vers » et chiffres des déportations ; « Qui est qui » à relire contre le lexique.

Pour d’autres rôles :

- Amenan (outil) : `controle_versets.py` signale un écart de casse quand on abaisse « C’ » de vers en « c’ » dans le texte courant (Jérémie 31:3, « ; C’est pourquoi »). `casse_libre` cherche la clé « c » (apostrophe retirée) dans `MINUSCULES_LSG`, qui contient « c’ ». Contournement appliqué ; correction de l’outil à faire.
- Amenan (lexique) : l’entrée Seraja dit « frère de Baruc », contraire à la décision T09 (parenté présentée comme déduction).
- Akissi ou Amenan (source) : défaut de la LSG numérique en Jérémie 44:26, « coutez » pour « Écoutez » (capitale perdue), non réparé par `verset.py`. Je n’ai pas cité ce verset.
- Noms employés absents du lexique, à ajouter s’ils sont gardés : Asa, Azaria, Baalis, Boaz, Naomi, Ruth, Cyrus, Hérode, Jean-Baptiste, Élie, Judas, Jonathan (le secrétaire), Thanhumeth, Joseph, Jacob, Sinaï, Syène, Éphrata.
- Affoué : une figure pleine page de 170 mm ne laisse de place qu’à une légende d’une ligne. Si l’équipe veut une légende plus longue, il faut réduire la hauteur de la carte dans la CSS ou faire sortir la légende de la figure. Les tableaux des annexes se composent correctement mais passent sur plusieurs pages, avec répétition de l’en-tête.
- Kouamé : la carte ne porte ni Gabaon, ni Migdol, ni Pathros, ni Moab, Ammon, Édom, cités dans ces chapitres ; le texte renvoie à la carte seulement pour « les principaux » lieux.

## PART GÉNÉRÉE PAR IA

Tout le texte du lot 3 est rédigé par IA (Konan) à partir du texte biblique de la Louis Segond 1910, sans matière fournie par l’auteur : récits, encadrés, leçons, questions, prières, conclusion, chronologie et « Qui est qui ». Seules les citations bibliques (domaine public) ne sont pas générées. Environ 15 000 mots qui resteront dans le livre, à déclarer comme contenu généré par IA aux plateformes qui le demandent (Amazon KDP notamment), et à faire valider par l’auteur chapitre par chapitre.

Passages rédigés de mon propre chef, au-delà des pistes du plan :

- les cinq prières finales et les épigraphes des chapitres 9 à 12 ;
- chapitre 9 : l’exemple imaginé de la famille qui continue à payer l’école des enfants (annoncé comme tel) ; le rapprochement entre Rachel à Rama et Jérémie enchaîné à Rama (Jérémie 40:1) ; la remarque sur le nom « L’Éternel notre justice » donné au roi puis à la ville ;
- chapitre 10 : le rapprochement avec Deutéronome 30:19 ; la mention d’Actes 8:27 dans l’encadré ; le parallèle entre la boue de la citerne et la boue de Jérémie 38:22 ;
- chapitre 11 : le contraste entre la citerne de Jérémie et celle d’Asa ; le lien entre Jérémie 42:10 et les verbes de Jérémie 1:10 ;
- chapitre 12 : la présence de Baruc en Égypte et l’hypothèse, signalée, qu’il ait rapporté ces derniers jours ; les rapprochements entre Jésus et Jérémie (Matthieu 24:2 ; Luc 19:41) ;
- conclusion : la section « Un dernier mot » et l’appel à lire le livre de Jérémie ;
- annexes : les lignes de chronologie ajoutées au plan (discours du temple, lecture du rouleau, achat du champ, sortie de prison de Jojakin) et tout le tableau « Qui est qui ».

## SUITE PROPOSÉE

Amenan corrige le lot 3 avec les lots 1 et 2 et harmonise les épigraphes. Akissi soumet en priorité à l’auteur les deux positions du chapitre 9 et l’appel à la reddition du chapitre 10, puis les questions de la conclusion (serviteur de Dieu, mot personnel, invitation à la foi). Affoué compose le lot entier pour vérifier la pagination réelle. L’index des passages sera produit par script après la correction, comme décidé.
