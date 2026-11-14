# Rapport T25 : recomposition de l'intérieur et couverture piste C

Affoué (maquette et couverture), 14 novembre 2026.

## STATUT

TERMINÉ. L'intérieur fait 224 pages, soit 14 cahiers de 16 : 219 pages de texte, puis 5 pages blanches. Le dos mesure 12,60 mm (224 ÷ 2 × 0,1125). Le contrôle de Salif ne relève aucun échec, ni sur l'intérieur ni sur la couverture. Aucune police de secours n'apparaît.

## RÉSUMÉ

Intérieur, avec l'avant-propos reformulé et validé par l'auteur. Le manuscrit a été modifié le 14 novembre à 01:25:38 ; le PDF livré a été composé ensuite, à 01:33:16.

- Correction des polices :
  - EB Garamond reçoit son sous-ensemble latin-ext, fusionné avec le latin par fontTools. Les lettres ṭ et ă sortent dans la police du livre.
  - J'ai trouvé une erreur plus ancienne. Une copie système d'EB Garamond (latin seul, `~/.local/share/fonts`) portait le même nom que la nôtre, et WeasyPrint la prenait à la place des fichiers corrigés. La famille est donc déclarée sous le nom « EB Garamond Livre ».
  - Les SVG de la carte et de la frise passent par une copie de travail qui pointe vers cette famille. Sans cela, leurs étiquettes tomberaient dans une police de secours sur une autre machine.
- Intertitres de niveau 3 des sections d'étude : 22,5 pt au-dessus, italique 11,5 pt.
- Tableaux à cinq colonnes :
  - corps de 8 / 10,5 pt, en-tête répété, lignes jamais coupées ;
  - largeurs de colonnes propres à chaque tableau et gouttière de 5 pt ;
  - pas de page à l'italienne : le format en hauteur suffit.
- Page des mentions : le crédit des textes hébreux (`credits_textes`) y est imprimé.
- Page de titre : sous-titre « Biographie et étude biblique ».
- Pagination :
  - le livre composé fait 220 pages ;
  - j'ai d'abord essayé de jouer sur les blancs d'ouverture : 18 et 24 mm donnent tous deux 220 pages ;
  - je reviens donc aux 24 mm de la charte, plus aérés ;
  - nouvelle option `composer.py --cahier 16` (par défaut) : elle complète le livre par des pages blanches finales jusqu'à 224 pages.

Couverture, piste C « Arracher et planter », reproduite dans `couverture/generer_couverture.py` (option `--piste C`, désormais par défaut).

- Rendu :
  - en vecteurs, en CMJN ;
  - couleurs relevées sur l'aperçu Figma et ajoutées à la palette avec leurs valeurs CMJN estimées : encre, crème, or, ardoise, rouille, pétale, rameau.
- Polices : Barlow Condensed (Medium, SemiBold, Bold, Black) et Fraunces (Regular, Italic, SemiBold), en OFL, Fontsource 5.3.0 récupérée sur npm, copiées dans `outils/ressources/polices/` avec leur licence.
- Plat 1 :
  - les six verbes de Jérémie 1:10 avec leurs mots hébreux (nâthash, nâthats, ʼâbad, hâraç, bânâh, nâṭaʻ) ;
  - les quatre premiers barrés en ardoise, « bâtir » et « planter » en or ;
  - la branche d'amandier part de « PLANTER » ;
  - « JÉRÉMIE » en Barlow Condensed Black sur 124 mm ;
  - l'amorce du titre en Fraunces italique ;
  - la frise d'inspiration bogolan en pied.
- Défaut de l'aperçu Figma corrigé : la branche s'arrête vers 104 mm, et l'amorce du titre commence à 124 mm.
- Quatrième de couverture :
  - textes repris de `couverture/quatrieme.md` (version d'Akissi, avec la phrase sur Jérémie 1:10) et de `livre.yaml` ;
  - lettrine en or.
- Dos : lu de bas en haut, il porte « JÉRÉMIE » suivi de l'amorce du titre, puis l'auteur en or.
- Frise : continue sur les trois faces, motif raccordé au pli.

## FICHIERS

- `sortie/interieur.pdf` (224 pages, SHA-256 b2c4710e6ee269a87e83dc79f3785c86a7aed42e0f284c6b17682ef06db67c5d) et `sortie/interieur-ecran.pdf`.
- `outils/composer.py` :
  - fusion des sous-ensembles et famille « EB Garamond Livre » ;
  - correspondances U+02BB vers ‘ et U+02BC vers ’ pour les polices qui n'ont pas ces signes (Fraunces) ;
  - classe de chasse normale pour les polices condensées, pour que leur nom tienne dans `pdffonts` ;
  - copie de travail des SVG ;
  - crédit des textes dans les mentions ;
  - option `--cahier`.
- `charte/interieur.css` (styles T25) et `charte/graphique.md` (mis à jour).
- `couverture/generer_couverture.py` (piste C). Fichiers produits :
  - `couverture/couverture-gabarit.pdf` (SHA-256 91f346d9588d69cfba13d0efcbb3510e2b2862e1bf25e24c4e78473b20b78e71) ;
  - `couverture-gabarit.png` et `couverture-gabarit-reperes.png` ;
  - `piste-C.pdf`, `piste-C.png` et `piste-C-vignette-200.png` ;
  - `plat1-epub.jpg` (1 707 × 2 560 px).
- Les fichiers des pistes A et B n'ont pas été régénérés.
- `outils/ressources/polices/` :
  - `eb-garamond/` : 8 fichiers latin-ext et licence ;
  - `barlow-condensed/` : 4 fichiers et licence ;
  - `fraunces/` : 6 fichiers latin et latin-ext, et licence.

## VÉRIFICATIONS

Intérieur :

- `python3 fabrication/controle_pdf.py interieur sortie/interieur.pdf --cahier 16` :
  - 224 pages ;
  - boîtes conformes sur 224 pages (coupe 140 × 210 mm, fonds perdus 3 mm) ;
  - texte en noir seul ;
  - 9 polices incorporées ;
  - 0 échec, 1 point à voir : les gris des étiquettes de la carte et de la frise, comme avant.
- `pdffonts` sur les deux PDF : 9 polices, toutes incorporées.
  - EB-Garamond-Livre en romain, italique, Medium et Semi-Bold ;
  - Alegreya Sans en 400, 500, 500 italique, 700 et 800 ;
  - aucune DejaVu, Inter ni autre police de secours.
- `pdftotext` :
  - bâṭach, môwṭâh, nâṭaʻ, qâṭar et ʼachărîyth sont présents et rendus dans EB Garamond ;
  - aucun tiret cadratin ni demi-cadratin.
- 16 marques « À COMPLÉTER » :
  - 4 pour l'ISBN imprimé, l'ISBN numérique, le dépôt légal et l'impression ;
  - 12 pour l'auteur : remerciements, et onze positions ou précisions dans les sections d'étude et les repères théologiques.
- 28 marques « À VÉRIFIER » : les sources archéologiques signalées par Akissi.
- Avant-propos : chaque paragraphe de `manuscrit/01-avant-propos-corrige.md` a été comparé, début et fin, au texte extrait des pages 7 à 12. Tout y est. Seul le commentaire HTML « témoignage validé par l'auteur le 14 novembre 2026 » n'apparaît pas, ce qui est normal : il ne s'imprime pas. Pas de recomposition nécessaire, dos inchangé (12,60 mm).
- Pages regardées : 3 (titre et sous-titre), 4 (mentions et crédit des textes), 5 (table), 7 et 8 (avant-propos reformulé), 26 et 27 (section d'étude et niveau 3), 86 (encadré « Archéologie et histoire »), 203 à 205 (tableau de l'ordre), 211 et 212 (tableau archéologique, aussi agrandi à 110 ppp), 213 (repères théologiques), 219 à 221 (fin et pages blanches).

Couverture :

- `python3 couverture/generer_couverture.py --pages 224 --piste C` : dos de 12,60 mm, largeur de 298,60 mm.
- `python3 fabrication/controle_pdf.py couverture couverture/couverture-gabarit.pdf --dos 12.6` :
  - coupe de 292,6 × 210 mm, fonds perdus de 3 mm ;
  - ni RVB ni noir enrichi ;
  - 9 polices incorporées ;
  - 0 échec, 0 point à voir.
- `piste-C.pdf` : 5 polices incorporées, 0 échec.
- Deux défauts trouvés au contrôle puis corrigés :
  - une police de secours Inter apparaissait, parce que l'ayin ʻ manque dans Fraunces ;
  - un faux « non incorporé » sur Barlow, dont le nom trop long débordait de la colonne de `pdffonts`.
- Images regardées :
  - plat 1 à 150 ppp ;
  - gabarit avec repères ;
  - dos et pli agrandis ;
  - frise au pli à trois fois l'échelle ;
  - vignette de 200 px, où « JÉRÉMIE » domine et les six verbes restent lisibles.
- Aucun tiret dans le texte du gabarit ni dans les scripts.

## HYPOTHÈSES

- Le dos se calcule avec 224 pages (pagination livrée, blanches comprises), sur de l'offset 90 g de main 1,25. La valeur de l'imprimeur primera (`--dos`).
- Les couleurs CMJN de la piste C sont estimées à partir de l'aperçu Figma (614 px de large). Elles sont à confirmer sur épreuve, avec le profil de l'imprimeur.
- Les dessins de la branche et des fleurs sont faits à partir de la description de la charte de Kouamé : cinq pétales échancrés, cœur carmin, étamines or, boutons en goutte. Ils ne sont pas copiés point par point de Figma, dont l'aperçu est trop petit pour cela.
- Dans Fraunces, ʻ et ʼ sont rendus par les glyphes ‘ et ’, de même dessin.

## POINTS OUVERTS ET RISQUES

- Pagination et coût : le livre passe de 160 à 224 pages, à cause des études, des encadrés d'archéologie et des annexes. Salif doit refaire le devis et le coût de revient, et demander à l'imprimeur l'épaisseur réelle du dos.
- Il reste 28 « À VÉRIFIER » (sources archéologiques) et 12 points pour l'auteur : ils bloquent le BAT.
- Les cinq pages blanches finales pourraient porter plus tard une page de notes, ou les crédits d'images de Yao.
- L'EPUB est en attente (décision de l'utilisateur). `plat1-epub.jpg` est prêt pour T26.
- La copie système d'EB Garamond dans `~/.local/share/fonts` ne gêne plus la chaîne. Elle pourrait encore tromper un autre outil qui demanderait « EB Garamond » sans passer par `composer.py`.

## PART GÉNÉRÉE PAR IA

Rien de nouveau dans le texte du livre. La couverture C est une reconstruction, en code, de la maquette Figma d'Akissi. Les dessins vectoriels de la branche, des fleurs et de la frise ont été générés par le script à partir de la bible visuelle de Kouamé. Ces images sont à déclarer comme produites avec l'aide de l'IA.

## SUITE PROPOSÉE

1. Salif : devis et coût de revient pour 224 pages, et dos de l'imprimeur (`generer_couverture.py --dos X`).
2. Amenan : second tour d'épreuves, centré sur les études, les tableaux et les translittérations.
3. Akissi et l'auteur : lever les 12 points de l'auteur et les 28 sources à vérifier, et valider la couverture C imprimée sur épreuve.
