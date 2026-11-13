# Rapport T17 : composition de l'intérieur et mise à jour de la couverture

Affoué (maquette et couverture), 13 novembre 2026.

## STATUT

TERMINÉ. L'intérieur compte 160 pages, soit dix cahiers de 16 sans page blanche ajoutée. Le dos mesure 9,00 mm. Le contrôle de Salif ne relève aucun échec sur `sortie/interieur.pdf` ni sur `couverture/couverture-gabarit.pdf`.

## RÉSUMÉ

`python3 outils/composer.py` compose les seize copies `manuscrit/*-corrige.md`. Le texte n'a pas été touché : toutes les corrections portent sur `charte/interieur.css`.

- Tableaux des annexes. La CSS n'avait aucune règle pour les tableaux, d'où la ligne coupée en bas de page signalée par Amenan. J'ai ajouté `tr { break-inside: avoid }`, un en-tête répété en haut de chaque page, des filets et un corps de 9 / 12 pt. J'ai aussi remplacé les trois colonnes égales imposées par Pandoc par des colonnes de 21 %, 55 % et 24 %, pour que la colonne de description ne soit plus écrasée.
- Page « À propos de l'auteur ». Elle n'est plus forcée en page impaire : elle suit les annexes, en page 160. Le livre passe ainsi de 162 à 160 pages et supprime deux pages blanches (avant et après cette page).

La couverture reprend le texte de `couverture/quatrieme-corrige.md`, copié sur `quatrieme.md`. Les seuls écarts avec l'ancienne version sont les apostrophes typographiques et deux références abrégées dans le tableau des sources. La piste A est régénérée pour 160 pages : 160 ÷ 2 × 0,1125 = 9,00 mm de dos, soit une largeur totale de 295,00 mm.

## FICHIERS

- `sortie/interieur.pdf` (fonds perdus de 3 mm, noir seul), SHA-256 2e6dec063e18968c7809d3bd895ccdfcdf7e7ce81bdbc1b95e9c0adb18b95f22.
- `sortie/interieur-ecran.pdf` (160 pages, sans fonds perdus).
- `charte/interieur.css` : règles des tableaux et placement de « À propos de l'auteur ».
- `charte/graphique.md` : la ligne « Ordre des pages » est mise à jour et une règle pour les tableaux est ajoutée.
- `couverture/quatrieme.md` : remplacé par la version corrigée. L'ancienne version est conservée dans le dossier de travail de la session.
- Fichiers régénérés par le script : `couverture/couverture-gabarit.pdf`, `couverture-gabarit.png`, `couverture-gabarit-reperes.png`, `piste-A.pdf`, `piste-A.png`, `piste-B.pdf`, `piste-B.png`, les deux vignettes et `plat1-epub.jpg`.

## VÉRIFICATIONS

- Composition : « sortie/interieur.pdf : 160 pages », « sortie/interieur-ecran.pdf : 160 pages », information « 6 marque(s) [À COMPLÉTER] ».
- `python3 fabrication/controle_pdf.py interieur sortie/interieur.pdf --cahier 16` :
  - 160 pages ; boîtes conformes sur les 160 pages (coupe 140 × 210 mm, fonds perdus 3 mm) ;
  - texte en noir seul (DeviceCMYK 0 0 0 1 et DeviceGray) ;
  - 9 polices, toutes incorporées ;
  - bilan : 0 échec, 1 point à voir. Ce point concerne les étiquettes grises de la carte et de la frise de Kouamé (« texte en gris tramé »), déjà signalées en T07.
- Le même contrôle sur le PDF écran donne 17 échecs : pas de fonds perdus et couleurs RVB. C'est attendu, ce fichier ne va pas chez l'imprimeur.
- `pdffonts` : 9 lignes, `emb` à `yes` partout dans les deux PDF. Polices présentes : EB Garamond en romain, italique, Medium et Semi-Bold ; Alegreya Sans en 400, 500, 500 italique, 700 et 800.
- pikepdf : TrimBox de 140,0 × 210,0 mm et BleedBox de 146,0 × 216,0 mm sur toutes les pages de `interieur.pdf`. Dans le PDF écran, BleedBox égale TrimBox.
- `pdftotext`, recherche de « À COMPLÉTER » : six occurrences, toutes attendues.
  1. ISBN de la version imprimée (mentions légales, page 4).
  2. ISBN de la version numérique (page 4).
  3. Dépôt légal (page 4).
  4. Impression : imprimeur, lieu et date (page 4).
  5. Avant-propos : « témoignage personnel » de l'auteur.
  6. Avant-propos : « remerciements ».
- Tirets cadratin et demi-cadratin : aucun dans le texte extrait des deux PDF, ni dans le texte du gabarit de couverture.
- Pages regardées :
  - les 162 pages de la première composition, en planches-contact ;
  - les annexes (pages 152 à 160) à 45 ppp, avant et après correction ;
  - douze pages clés à 55 ppp : page de titre (3), mentions légales (4), table des matières (5), ouverture du chapitre 1 (17), encadré (19), encadré en haut de page (45), conclusion (147), fin de la frise (156), carte en pleine page (157), « Qui est qui » (158 et 159), « À propos de l'auteur ».
- Contrôle automatique sur `pdftotext` page par page : aucun intertitre en dernière ligne de page. Aucune ligne seule de fin de paragraphe en haut de page, hormis des vers de poème (pages 52, 67 et 109), un titre d'encadré (page 45) et un titre de chapitre sur deux lignes, ce qui est admis.
- Couverture : `python3 couverture/generer_couverture.py --pages 160 --piste A` donne « Dos : 9.00 mm, largeur totale avec fonds perdus : 295.00 mm ». `controle_pdf.py couverture couverture/couverture-gabarit.pdf --dos 9` donne une coupe de 289 × 210 mm, des fonds perdus de 3 mm, ni RVB ni noir enrichi, 7 polices incorporées : 0 échec, 0 point à voir. Le PNG avec repères a été regardé : la quatrième corrigée est en place avec ses apostrophes typographiques, les textes restent dans les zones de sécurité et le titre du dos se lit de bas en haut.

## HYPOTHÈSES

- Placer « À propos de l'auteur » en page paire, en dernière page, est un usage courant. Je l'ai préféré à deux pages blanches qui faisaient passer le livre à 162 pages, hors cahier.
- Le dos reste à 9,00 mm (offset 90 g, main 1,25, formule du brief). Il sera remplacé par la valeur de l'imprimeur avec `--dos`.

## POINTS OUVERTS ET RISQUES

- Page 156 : la fin du texte « Carte » occupe trois lignes, puis la page reste blanche, car la carte pleine page commence forcément sur la page suivante. C'est acceptable en annexe. Pour l'éviter, il faudrait déplacer la carte dans le manuscrit, ce qui relève de Konan et d'Akissi.
- Table des matières : le titre de la conclusion est long, si bien que les points de conduite disparaissent sur sa ligne. Le numéro de page reste lisible.
- Marques à lever avant le BAT : les quatre de la page 4 (dossiers de Mariam) et les deux de l'avant-propos (auteur). Il reste aussi le prix public de la quatrième, décision de l'utilisateur.
- Étiquettes en gris de la carte et de la frise (Kouamé) : à juger sur épreuve.
- Toute correction future du texte se fait dans `manuscrit/*-corrige.md`, puis on relance `composer.py` et `generer_couverture.py --pages N`.

## PART GÉNÉRÉE PAR IA

Rien de nouveau dans cette tâche. La composition reprend le texte de Konan corrigé par Amenan, et la quatrième est celle de T16 relue en T15. La part générée par IA du livre reste celle déclarée en T07, T12 et T16.

## SUITE PROPOSÉE

1. Amenan : premier tour d'épreuves (T18) sur `sortie/interieur.pdf`, avec un relevé par page.
2. Salif : contrôle de fabrication (T19) sur les deux PDF, avec 160 pages et un dos de 9,00 mm à confirmer par l'imprimeur retenu.
3. Désiré : EPUB et PDF écran (T20), à partir de `sortie/interieur-ecran.pdf` et de `couverture/plat1-epub.jpg`.
