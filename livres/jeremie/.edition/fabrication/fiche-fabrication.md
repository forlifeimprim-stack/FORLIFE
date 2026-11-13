# Fiche de fabrication préliminaire

Livre : « La vie et le ministère prophétique du prophète Jérémie », Kouadio Koffi Elisée. Version papier.
Établie le 9 novembre 2026 par Salif (fabrication), tâche T08, mise à jour le 13 novembre 2026 (T19)
avec la pagination réelle : 160 pages. Statut : préliminaire. Toutes les valeurs
techniques marquées « indicatif » seront remplacées par celles de l'imprimeur retenu, et aucun prix ne
figure ici tant qu'aucun devis n'est reçu.

## Synthèse pour la maquette (Affoué)

| Élément | Valeur de travail | Statut |
|---|---|---|
| Format fini (coupé) | 140 × 210 mm, à la française | fixé par la fiche projet |
| Fonds perdus | 3 mm sur chaque bord, intérieur et couverture | à confirmer par l'imprimeur |
| Pagination | 160 pages, soit 10 cahiers de 16 | réelle, `sortie/interieur.pdf` du 13 novembre 2026 |
| Papier intérieur recommandé | offset blanc 90 g | à confirmer par devis |
| Dos de travail | 9,00 mm (160 p., offset 90 g, main 1,25) | indicatif, remplacé par la valeur de l'imprimeur |
| Gabarit de couverture | 2 × 140 + 9 + 2 × 3 = 295,00 mm de large, 216 mm de haut | `couverture/couverture-gabarit.pdf`, piste A |
| Couverture | quadrichromie recto, 300 g, pelliculage mat recto | recommandation |
| Façonnage | dos carré collé PUR | recommandation |

Le gabarit de couverture se construit avec un dos variable : la largeur définitive n'est connue qu'avec
la pagination finale et l'épaisseur annoncée par l'imprimeur (idéalement mesurée sur une maquette en
blanc). Le texte du dos se cale au centre avec une marge de sécurité d'au moins 1,5 mm de chaque côté
(usage courant, à confirmer), et les textes des plats restent à 5 mm au moins du trait de coupe.

## Pagination réelle (13 novembre 2026)

La composition d'Affoué (T17) donne 160 pages, soit 10 cahiers de 16 pages sans page blanche ajoutée
(160 ÷ 16 = 10 ; 160 ÷ 32 = 5, donc aussi compatible avec des cahiers de 32). L'estimation de T08 (176 à
185 pages) était trop haute : le texte final est plus dense que l'hypothèse de 280 à 300 mots par page.
Les hypothèses 176 et 192 pages ci-dessous restent pour mémoire ; les demandes de devis devront être
corrigées à 160 pages avant envoi (voir `bat/bloquants.md`).

| Papier | Calcul (80 feuilles) | Dos | Largeur coupée | Largeur avec fonds perdus |
|---|---|---|---|---|
| offset 80 g, main 1,25 | 80 × 0,100 | 8,00 mm | 288,00 mm | 294,00 mm |
| offset 90 g, main 1,25 (retenu) | 80 × 0,1125 | 9,00 mm | 289,00 mm | 295,00 mm |
| bouffant 80 g, main 1,8 | 80 × 0,144 | 11,52 mm | 291,52 mm | 297,52 mm |

Formule : dos = 160 ÷ 2 × grammage × main ÷ 1 000 ; largeur = 2 × 140 + dos + 2 × 3. Hauteur 216 mm.
Le gabarit de la piste A (295 × 216 mm, dos 9,00 mm) correspond à l'offset 90 g. Si l'imprimeur annonce
un autre dos, Affoué relance `generer_couverture.py` avec cette valeur et le contrôle se refait avec
`--dos`.

## Format et pagination (estimation de T08, pour mémoire)

Format fini : 140 × 210 mm, broché, dos carré collé. Fichier intérieur : pages de 146 × 216 mm avec fonds
perdus (TrimBox 140 × 210 mm).

Estimation de la pagination, à partir d'environ 40 000 mots (fiche projet) et du rectangle de texte que
donnent les marges de `livre.yaml` (140 − 20 − 15 = 105 mm de large, 210 − 15 − 18 = 177 mm de haut) :

| Poste | Hypothèse basse | Hypothèse haute |
|---|---|---|
| Densité de texte courant (mots par page pleine) | 300 | 280 |
| Texte courant (40 000 mots ÷ densité) | 134 p. | 143 p. |
| Ouvertures de chapitre en belle page, 14 ouvertures (12 chapitres, introduction, conclusion), perte moyenne 1,25 p. | 18 p. | 18 p. |
| Pages liminaires (faux-titre, titre, mentions légales, sommaire) | 8 p. | 8 p. |
| Annexes (chronologie, carte, frise, index des passages) | 16 p. | 16 p. |
| Total brut | 176 p. | 185 p. |
| Total arrondi au cahier de 16 pages | 176 p. (11 cahiers) | 192 p. (12 cahiers) |

La densité de 280 à 300 mots par page suppose un texte en EB Garamond autour de 11 pt : c'est une
hypothèse. Dès qu'Affoué aura rendu ses pages test (T07), je compterai les mots d'une page pleine et je
referai ce calcul.

Cahiers de 16 ou de 32 pages. En offset, l'intérieur s'imprime par feuilles pliées en cahiers. Je retiens
le cahier de 16 pages comme unité de calcul, pour trois raisons : 176 est un multiple de 16 (11 cahiers)
mais pas de 32 (5,5 cahiers) ; un pas de 16 pages limite les pages blanches ajoutées en fin de livre à
15 au plus, contre 31 avec un pas de 32 ; en 90 g, un cahier de 32 pages fait un pli épais. 192 pages
conviennent aux deux (12 cahiers de 16 ou 6 de 32). Le choix réel dépend du format de feuille et de la
plieuse de l'imprimeur : la question figure dans les demandes de devis. En impression numérique, il n'y a
pas de contrainte de cahier, seulement un nombre pair de pages (certains imprimeurs demandent un
multiple de 4).

Règle pour la maquette : si la composition finale tombe entre deux paliers (par exemple 180 pages), on
ajuste d'abord la mise en page (blancs d'ouverture, annexes) avant d'ajouter des pages blanches.

## Impression

Intérieur : noir seul (une couleur), y compris la carte et la frise, livrées en niveaux de gris. Recto
verso. Le texte s'imprime en 100 % noir (K) ; les gris des images sont tramés. Je demande à l'imprimeur sa
linéature de trame en offset et le comportement des aplats de gris clairs en numérique, car la carte de
Kouamé contient des tons proches.

Couverture : quadrichromie (CMJN) au recto, rien au verso (2e et 3e de couverture blanches), sauf
décision contraire d'Affoué. Pelliculage au recto seulement.

## Papier intérieur

Formule d'épaisseur d'une feuille (en mm) : grammage (g/m²) × main (cm³/g) ÷ 1 000.

| Papier | Grammage | Main typique (indicatif) | Épaisseur d'une feuille |
|---|---|---|---|
| Offset blanc | 80 g | 1,25 (souvent 1,2 à 1,3) | 80 × 1,25 ÷ 1 000 = 0,100 mm |
| Offset blanc | 90 g | 1,25 (souvent 1,2 à 1,3) | 90 × 1,25 ÷ 1 000 = 0,1125 mm |
| Bouffant | 80 g | 1,8 (selon les qualités, de 1,5 à 2,2) | 80 × 1,8 ÷ 1 000 = 0,144 mm |

Ces mains sont des ordres de grandeur du métier, non vérifiés auprès d'un fournisseur (sites
inaccessibles le 9 novembre 2026). La main exacte figure sur la fiche technique du papier que l'imprimeur
a en stock : c'est elle qui fera foi.

Recommandation : offset blanc 90 g. Son opacité est meilleure que celle du 80 g, ce qui compte pour la
carte et la frise en gris, dont les aplats transparaîtraient au verso sur un papier plus fin. Il donne un
dos d'environ 10 à 11 mm, assez large pour un titre lisible au dos. L'offset 80 g reste la variante
économique, à chiffrer en parallèle. Je déconseille le bouffant pour ce livre : il gonfle bien le
volume, mais sa surface boit davantage l'encre, ce qui épaissit les traits fins et fonce les gris de la
carte. Si l'imprimeur propose un offset ivoire au même prix, il peut être demandé en option pour le
confort de lecture ; la carte devra alors être vérifiée sur épreuve.

## Calcul du dos

Formule : dos (mm) = nombre de pages ÷ 2 × épaisseur d'une feuille (mm), avec épaisseur = grammage × main ÷ 1 000.
Une feuille porte deux pages : 176 pages font 88 feuilles, 192 pages font 96 feuilles.

| Pagination | Papier | Calcul | Dos |
|---|---|---|---|
| 176 p. | offset 80 g, main 1,25 | 88 × 0,100 | 8,8 mm |
| 176 p. | offset 90 g, main 1,25 | 88 × 0,1125 | 9,9 mm |
| 176 p. | bouffant 80 g, main 1,8 | 88 × 0,144 | 12,672 mm, arrondi 12,7 mm |
| 192 p. | offset 80 g, main 1,25 | 96 × 0,100 | 9,6 mm |
| 192 p. | offset 90 g, main 1,25 | 96 × 0,1125 | 10,8 mm |
| 192 p. | bouffant 80 g, main 1,8 | 96 × 0,144 | 13,824 mm, arrondi 13,8 mm |

Ce calcul ne compte pas l'épaisseur de la couverture ni la colle ; certains imprimeurs ajoutent une
marge (souvent un demi-millimètre à un millimètre) dans leur propre valeur. La valeur fournie par
l'imprimeur remplace toujours ce calcul, et l'idéal est de la mesurer sur une maquette en blanc (livre
relié sur le papier réel, sans impression), demandée dans les devis.

## Gabarit de couverture

Largeur totale = 2 × 140 mm (plats) + dos + 2 × 3 mm (fonds perdus). Hauteur totale = 210 + 2 × 3 = 216 mm.

| Pagination | Papier | Dos | Largeur coupée (2 × 140 + dos) | Largeur avec fonds perdus |
|---|---|---|---|---|
| 176 p. | offset 80 g | 8,8 mm | 288,8 mm | 294,8 mm |
| 176 p. | offset 90 g | 9,9 mm | 289,9 mm | 295,9 mm |
| 176 p. | bouffant 80 g | 12,7 mm | 292,7 mm | 298,7 mm |
| 192 p. | offset 80 g | 9,6 mm | 289,6 mm | 295,6 mm |
| 192 p. | offset 90 g | 10,8 mm | 290,8 mm | 296,8 mm |
| 192 p. | bouffant 80 g | 13,8 mm | 293,8 mm | 299,8 mm |

Ordre de lecture du gabarit, de gauche à droite : fonds perdus 3 mm, quatrième de couverture 140 mm, dos,
première de couverture 140 mm, fonds perdus 3 mm. Le code-barres EAN-13 de l'ISBN (pas encore attribué) se
place sur la quatrième, en 100 % noir sur fond blanc.

## Couverture

Carton : 300 g couché mat, une face imprimée. Recommandation : 300 g plutôt que 350 g. Pour un livre de
14 × 21 cm et d'un dos d'environ 10 mm, le 300 g pelliculé tient bien, s'ouvre plus facilement et se
fend moins aux charnières qu'un 350 g, plus raide. Le 350 g se justifie pour un livre plus épais ou plus
grand.

Pelliculage : mat, au recto. Recommandation motivée : le mat convient à une biographie biblique sobre,
ne fait pas de reflets sous la lumière et garde le titre lisible. Il a deux défauts connus : il éteint un
peu les couleurs sombres et marque davantage les rayures sur les aplats foncés. Si l'illustration de
couverture de Kouamé (T06) repose sur de grandes zones sombres, je demanderai un échantillon pelliculé
mat de l'imprimeur avant de trancher, ou je basculerai vers le brillant, plus résistant aux frottements.
Un pelliculage mat anti-rayures, s'il est disponible, est demandé en option dans les devis.

Rainage : couverture rainée au dos et aux charnières, selon la pratique de l'imprimeur, pour éviter que
le carton ne casse à l'ouverture.

## Façonnage

Dos carré collé : la pagination (176 à 192 pages) dépasse largement la limite de la piqûre à cheval
(64 pages au plus).

Colle : PUR (polyuréthane réactif) recommandée. Elle tient mieux que la colle à chaud classique (EVA),
supporte la chaleur, ce qui compte en Côte d'Ivoire pour des livres stockés ou transportés hors
climatisation, et laisse le livre s'ouvrir plus à plat, ce qui sert le lecteur qui travaille avec sa Bible
ouverte à côté. Elle coûte plus cher et demande un temps de prise avant expédition (à faire préciser
dans les délais). La colle à chaud reste acceptable sur un papier offset non couché, à condition d'un bon
fraisage du dos : elle est chiffrée en variante dans les devis, et devient le choix par défaut si
l'imprimeur retenu n'a pas de ligne PUR.

## Procédé selon le tirage

Repère de la fiche de rôle : l'impression numérique est en général plus avantageuse en dessous de 300 à
500 exemplaires, l'offset au-dessus, parce que l'offset porte des frais fixes de calage (plaques, mise en
route) que le nombre d'exemplaires amortit. Le point de bascule exact se lit sur les devis, pas sur une
règle générale.

| Tirage | Intérieur | Couverture | Recommandation |
|---|---|---|---|
| 300 ex. | numérique noir | numérique quadri | numérique, sauf devis offset inattendu |
| 500 ex. | numérique et offset à chiffrer tous les deux | numérique ou offset | zone de bascule, décision sur devis |
| 1 000 ex. | offset noir | offset quadri (ou numérique si l'imprimeur le propose moins cher) | offset |

Un point de gestion à soumettre à l'utilisateur, sans trancher à sa place : un premier tirage numérique
court (300 exemplaires) limite le stock immobilisé et permet des retirages rapides, au prix d'un coût
unitaire plus élevé. Le modèle de `cout-de-revient.md` sert à comparer les deux options.

## Délais de fabrication à demander

Les délais ne sont pas connus : ils seront demandés à chaque imprimeur, poste par poste.

| Étape | Question posée |
|---|---|
| Contrôle des fichiers | délai de retour du contrôle technique (preflight) après envoi des PDF |
| BAT | délai de fourniture du BAT (PDF et épreuve couleur de la couverture), délai de la maquette en blanc |
| Impression | délai entre BAT signé et fin d'impression, pour chaque tirage et chaque procédé |
| Façonnage | durée du façonnage et temps de prise de la colle PUR avant mise en cartons |
| Livraison | délai et mode de livraison à Bingerville, conditionnement en cartons |
| Retirage | délai d'un retirage de 100 ou 300 exemplaires sur les mêmes fichiers |

La parution visée est le 28 mars 2027 (Pâques). Mariam (T02) devra caler la date limite de BAT signé en
remontant depuis la livraison, avec les délais obtenus.

## Points ouverts

- Pagination définitive : dépend des pages test d'Affoué (T07) et du texte final.
- Main réelle du papier, valeur du dos et gabarit : à obtenir de l'imprimeur, avec la maquette en blanc.
- Exigences de fichiers propres à l'imprimeur (PDF/X ou non, profil CMJN, couverture d'encre maximale) :
  voir `exigences-fichiers.md`.
- Prix : aucun, en attente des devis (brouillons dans `devis/`, non envoyés).
