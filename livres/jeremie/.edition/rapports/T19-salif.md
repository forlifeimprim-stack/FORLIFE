# Rapport T19 : contrôle des fichiers et préparation du BAT

Agent : Salif (fabrication). Date : 13 novembre 2026.

## Statut

PARTIEL. Le contrôle technique est fait : 0 échec sur les deux PDF. La fiche de BAT est prête, mais
non signable : onze points bloquent encore l'envoi, dont plusieurs modifieront les fichiers.

## Résumé

`sortie/interieur.pdf` (160 pages, 10 cahiers de 16) et `couverture/couverture-gabarit.pdf` (piste A,
dos 9,00 mm, 295 × 216 mm) satisfont la liste de `exigences-fichiers.md` : boîtes et fonds perdus,
polices incorporées, texte de l'intérieur en noir seul, couverture en un seul PDF sans RVB ni noir
enrichi. Le seul point à voir concerne les étiquettes grises de la carte et de la frise : je le juge non
bloquant. La fiche de fabrication est mise à jour à 160 pages : dos de 9,00 mm en offset 90 g, ce qui
correspond au gabarit d'Affoué.

## Fichiers

- `.edition/fabrication/fiche-fabrication.md` : nouvelle section « Pagination réelle », synthèse mise à jour.
- `.edition/fabrication/bat/fiche-bat.md` : fiche de BAT avec en tête « BAT NON ACCORDÉ ... », caractéristiques, empreintes SHA-256, points à vérifier sur épreuve, case de signature de l'utilisateur.
- `.edition/fabrication/bat/bloquants.md` : liste des onze points qui bloquent l'envoi.

## Vérifications

- `python3 fabrication/controle_pdf.py interieur sortie/interieur.pdf --cahier 16` : 160 pages ; boîtes conformes sur les 160 pages (coupe 140 × 210 mm, fonds perdus 3 mm) ; texte en noir seul (DeviceCMYK 0 0 0 1, DeviceGray) ; 9 polices incorporées ; aucune image matricielle ; aucun OutputIntent ; bilan 0 échec, 1 point à voir. Code de sortie 0.
- `python3 fabrication/controle_pdf.py couverture couverture/couverture-gabarit.pdf --dos 9` : 1 page, coupe 289 × 210 mm, fonds perdus 3 mm, ni RVB ni noir enrichi, 7 polices incorporées, aucune image ; 0 échec, 0 point à voir.
- `pdffonts` sur les deux PDF : `emb` à `yes` sur chaque ligne (EB Garamond et Alegreya Sans, sous-ensembles TrueType CID). `pdfimages -list` : aucune image dans les deux fichiers (carte, frise et illustration sont vectorielles).
- `pdfinfo` : 160 pages, 413,858 × 612,283 pt (146 × 216 mm), PDF 1.7, WeasyPrint 70.0.
- `sha256sum` : intérieur `1113ffbdfd771462c54fb2cc00c18519268a9ca4a8fcc276cb2b9720a9b3a507` (identique à celui du rapport T17 bis), couverture `e4213278426804810762b9d4daff030e0cd57f7e221bc23364f7f42a80c6a9a1`.
- `pdftotext` : intérieur, six marques « À COMPLÉTER » (ISBN papier et numérique, dépôt légal, impression, témoignage et remerciements de l'auteur) ; couverture, « ISBN à venir » et « Prix : [À COMPLÉTER : prix public, décision de l'utilisateur] ».
- Recalcul du dos pour 160 pages (80 feuilles) : 8,00 / 9,00 / 11,52 mm en offset 80, offset 90, bouffant 80 ; largeurs avec fonds perdus 294,00 / 295,00 / 297,52 mm.

Jugement des gris tramés. Un relevé des couleurs de texte page par page situe tous les gris sur deux
pages : la frise (page 155 : dates « vers 627 », graduations, à 71 et 77 % de noir) et la carte (page
157 : noms de mers et de fleuves en italique, à 67 et 75 %), plus des noms de rois en blanc sur les
barres grises de la frise (page 155). Les mots les plus petits mesurent environ 7,8 pt de haut en boîte
`pdftotext`, soit un corps d'environ 6 pt. J'ai rendu les deux pages à 110 ppp et je les ai regardées :
tout se lit. Le point ne bloque pas. À 67 à 77 % de noir, ces petits corps restent lisibles en numérique
comme en offset à trame fine. Le risque est un contour un peu dentelé si l'imprimeur utilise une trame grossière.
Je l'ai inscrit dans la fiche de BAT comme point à vérifier sur épreuve. Si l'épreuve déçoit, il suffit
de passer ces étiquettes à 100 % K dans les SVG de Kouamé, sans toucher à la mise en page.

Non vérifié : couverture d'encre maximale et conformité à un profil ICC (aucun profil d'imprimeur,
pas de Ghostscript), rendu réel sur papier.

## Hypothèses

- Papier offset 90 g de main 1,25 : le dos de 9,00 mm reste une valeur de calcul jusqu'à la réponse de l'imprimeur.
- Pelliculage mat et colle PUR, selon les recommandations de T08, non encore confirmés par devis.

## Points ouverts et risques

Ce qui bloque l'envoi (détail dans `fabrication/bat/bloquants.md`) : ISBN papier et numérique (mentions
légales et code-barres absent de la quatrième) ; numéro de dépôt légal ; mention de l'imprimeur ; prix
public, décision de l'utilisateur ; aucun devis reçu, et les brouillons de T08 sont à corriger de 176
et 192 pages à 160 avant envoi ; imprimeur non choisi, donc profil ICC, exigence PDF/X, couverture
d'encre maximale et dos réel inconnus ; deux marques à compléter par l'auteur dans l'avant-propos ;
validation du texte par l'auteur ; choix final de la couverture par l'utilisateur ; tirage et procédé
non décidés ; second tour d'épreuves complet recommandé.

Ces corrections changeront les deux PDF : la fiche de BAT devra être refaite sur les fichiers
définitifs, avec un nouveau contrôle et de nouvelles empreintes.

Pour Akissi : mise à jour du statut de T19 dans `plan.md`. Pour Affoué : insertion du code-barres EAN-13
quand l'ISBN sera attribué, et nouveau gabarit si le dos de l'imprimeur diffère de 9,00 mm.

## Part générée par IA

Aucune dans cette tâche : fiche de fabrication, fiche de BAT et liste des points bloquants sont des
documents internes qui n'entrent pas dans le livre.

## Suite proposée

1. Utilisateur : accord pour envoyer les demandes de devis, une fois corrigées à 160 pages, et noms des imprimeurs B et C.
2. Mariam : ISBN et dépôt légal ; auteur : avant-propos et validation du texte.
3. Après devis et choix de l'imprimeur : prix public (décision de l'utilisateur), fichiers définitifs, nouveau contrôle, nouvelle fiche de BAT signée par l'utilisateur, puis contrôle d'un échantillon à la livraison.
