# Rapport T07 : charte graphique, CSS intérieur, chaîne de composition et maquette type

Affoué (maquette et couverture), 9 novembre 2026.

## STATUT

TERMINÉ. Critère de fin atteint : `charte/maquette/maquette.pdf` produite (16 pages), pages regardées en image, 7 polices toutes incorporées, TrimBox 140 × 210 mm et BleedBox 146 × 216 mm (3 mm) sur chaque page, aucun tiret cadratin ni demi-cadratin. Les messages d'Akissi (nom « Élisée », biographie, page « Du même auteur », images de Kouamé, fiche de Salif) sont intégrés.

## RÉSUMÉ

Format 140 × 210 mm, marges de 15 mm (haut), 20 mm (petit fond), 18 mm (bas) et 15 mm (extérieur), rectangle de texte de 105 × 177 mm. Texte en EB Garamond 11 / 15 pt, justifié, coupures françaises : 33 lignes et 360 à 372 mots par page pleine. Seconde famille : Alegreya Sans (titres, références, légendes, titres d'encadré), choisie pour son accord avec le Garamond, sa netteté en petit corps et sur téléphone, et sa tenue en vignette pour la couverture.

`outils/composer.py` compose le livre depuis `manuscrit/*-corrige.md` (ou des fichiers ou un dossier passés en argument) et `livre.yaml` : faux-titre, « Du même auteur » en page 2, page de titre, mentions légales, table des matières avec renvois de pages, chapitres numérotés sur page impaire, fleuron de Kouamé, titres courants (livre en page paire, chapitre en page impaire), notes de bas de page, « À propos de l'auteur » en fin d'ouvrage, page blanche finale si le compte est impair. Il pose les espaces insécables françaises, corrige les polices Fontsource (U+202F, U+2010), et produit `interieur.pdf` (fonds perdus) et `interieur-ecran.pdf` (sans fonds perdus, mêmes pages, signets et liens).

Le balisage suit `charte/style.md` d'Amenan, arrivée en cours de tâche : citations en bloc `>` avec la référence entre parenthèses en dernière ligne (seule forme lue par `outils/controle_versets.py`), aucun numéro de verset, vers séparés par `\`, encadrés `.encadre` et `.application` dont la première ligne en gras est le titre. J'ai abandonné mon premier balisage (`[Jérémie 1:5]{.ref}`, attribut `titre=`, numéros de versets en exposant) pour ne pas créer deux conventions.

L'intérieur est en noir seul : CSS entièrement en `device-cmyk(0 0 0 k)`, et les SVG de Kouamé (RVB neutre, que WeasyPrint ne sait pas écrire en CMJN) passent en DeviceGray après composition avec la fonction de `fabrication/noir_seul.py` de Salif, importée et non recopiée. Le contrôle de Salif ne signale plus rien sur la maquette.

## FICHIERS

Produits :

- `charte/graphique.md` : charte graphique complète, dont les sections « Balisage du manuscrit », « Composition » et « Estimation de pagination ».
- `charte/interieur.css` : feuille de style d'impression.
- `outils/composer.py` : chaîne de composition (filtre Lua intégré).
- `charte/maquette/chapitre-exemple.md` : avant-propos et chapitre de démonstration, tous les blocs, cinq citations réelles de la LSG 1910.
- `charte/maquette/maquette.pdf` (imprimeur, fonds perdus), `charte/maquette/maquette-ecran.pdf`, `charte/maquette/p-01.png` à `p-16.png` (rendu à 60 ppp).
- `outils/ressources/polices/alegreya-sans/` : six fichiers woff2 (400, 400 italique, 500, 500 italique, 700, 800) et `LICENSE-OFL.txt`, tirés de `@fontsource/alegreya-sans` 5.3.0 (npm). Ce dossier est une ressource partagée, hors de la liste stricte de mes fichiers : je le signale.
- `rapports/T07-affoue.md` : ce rapport.

Lus sans modification : `livre.yaml`, `fiche-projet.md`, `plan.md`, `journal.md`, `charte/style.md`, `charte/illustration.md`, `fabrication/fiche-fabrication.md`, `fabrication/exigences-fichiers.md`, `fabrication/noir_seul.py`, `fabrication/controle_pdf.py`, `images/*.svg`. Aucun commit, aucun envoi.

## VÉRIFICATIONS

Toutes lancées depuis `.edition/` sur la version finale.

- `python3 outils/composer.py charte/maquette/chapitre-exemple.md --sortie charte/maquette --nom maquette` : « maquette.pdf : 16 pages », « maquette-ecran.pdf : 16 pages », information « 4 marque(s) [À COMPLÉTER] » (ISBN papier et numérique, dépôt légal, impression, attendus).
- `python3 fabrication/controle_pdf.py interieur charte/maquette/maquette.pdf --cahier 16` : boîtes conformes sur 16 pages (coupe 140,0 × 210,0 mm, fonds perdus 3,0 mm), texte en noir seul DeviceCMYK 0 0 0 1, 7 polices toutes incorporées, bilan 0 échec, 0 point à voir. SHA-256 e2dccae0f520ccdc105d6ca6a37a02bf0cb60a219e92cb7d650c806367d79078.
- `pdffonts` sur les deux PDF : 7 lignes, colonne `emb` à `yes` partout (EB Garamond, EB Garamond Italic, Alegreya Sans 400, 500, 500 italique, 700, 800).
- pikepdf, chaque page : maquette.pdf TrimBox 140,00 × 210,00 mm, BleedBox et MediaBox 146,00 × 216,00 mm depuis (−3, −3) ; maquette-ecran.pdf les trois boîtes à 140 × 210 mm ; 0 écart.
- Tirets : `grep` de U+2014 et U+2013 dans `graphique.md`, `interieur.css`, `composer.py`, `chapitre-exemple.md` et dans le texte extrait des deux PDF : 0 partout. Le contrôle de `composer.py` signale bien un tiret cadratin placé exprès dans un fichier d'essai.
- `python3 outils/controle_versets.py charte/maquette/chapitre-exemple.md` : 5 conformes, 0 écart, 0 référence introuvable (Jérémie 1:5, 1:4-8, 20:9 en bloc et dans le texte, 2 Rois 22:1-2).
- Espaces françaises, essais unitaires : « dit : non ; oui ! « Bien » » reçoit U+00A0 et U+202F aux bonnes places ; « Jérémie 1:5 », « 10:30 », une adresse `https://x.org?a=1`, « R&amp;D » et le contenu de `<code>` restent intacts ; « mot<em>x</em>: suite » reçoit une seule espace ; « 2 Rois », « 627 av. J.-C. » et « 4 600 » reçoivent leurs insécables. Dans les PDF, aucune ligne ne commence par ; : ! ? ou ».
- Pages regardées avec l'outil de lecture d'images, en planches de doubles pages à 60 ppp et en pleine page à 110 ppp pour la page 9 : pages liminaires, ouverture de chapitre, citations, encadrés, note, pause, poème, rubriques de fin, page sur l'auteur, page blanche finale. Défauts trouvés et corrigés : mot « Jérémie » seul en dernière ligne du faux-titre et de la page de titre (liaison insécable des titres), référence de l'épigraphe alignée à gauche (spécificité CSS), référence « (Jérémie 20:9) » partie seule en haut de page (`break-before: avoid`), plantage de WeasyPrint 70 sur un `::marker` à contenu (puce standard à la place), mentions légales et nom de l'auteur repris de `livre.yaml` mis à jour.
- Page pleine (document d'essai hors du livre) : 35 lignes de base dont titre courant et folio, soit 33 lignes de texte ; 372 et 360 mots sur deux pages pleines.
- Figures de Kouamé (document d'essai hors du livre) : frise de 105 mm en figure ordinaire, carte de 120 × 170 mm en pleine page à 7,5 mm de la coupe extérieure, sans titre courant ; le contrôle de Salif passe (0 échec), avec un « à voir » sur les étiquettes grises de Kouamé.
- PDF écran : signets à deux niveaux (chapitres, intertitres, « À propos de l'auteur »), 12 liens actifs sur la page de la table.
- Chaîne sans argument, manuscrit encore vide : « Aucun fichier *-corrige.md trouvé : rien à composer. », code 1.

Non vérifié : le texte de la loi n° 2015-540, article 26 (réseau limité, liste des mentions reprise du brief) ; le rendu réel sur papier (épreuve) du fond d'encadré à 8 % et du filet à 60 % ; la composition d'un livre entier (temps de calcul, pagination réelle), faute de chapitres corrigés.

## HYPOTHÈSES

- Le titre courant des pages paires est le titre complet (54 signes, il tient en italique 9 pt) ; aucun titre courant abrégé n'est inventé pour le livre.
- « Du même auteur » est en page 2 (verso du faux-titre), comme le permettait le message d'Akissi. Les deux titres sont imprimés tels que `livre.yaml` les donne, alors que son commentaire dit « titres et dates à vérifier ».
- La biographie est reprise mot pour mot ; ses trois lignes sont réunies en un paragraphe. Elle écrit « Forlife Com » quand la fiche projet écrit « Forlife Com' » : je n'ai rien changé.
- Mentions légales : une formule « Tous droits réservés. Toute reproduction, même partielle, est interdite sans l'autorisation écrite de l'éditeur. » et la phrase « Les citations bibliques sont tirées de la Louis Segond 1910 (domaine public). » sont ajoutées par moi ; le téléphone de l'éditeur n'est pas imprimé, l'adresse et le courriel le sont.
- Les références de citation en bloc gardent leurs parenthèses dans le PDF, comme dans le manuscrit, pour que l'EPUB et le livre imprimé disent la même chose.
- Introduction, conclusion et annexes se marquent `{-}` et ne sont pas numérotées ; « Chapitre 1 » s'écrit en chiffres.

## POINTS OUVERTS ET RISQUES

- Pagination : mon estimation est de 150 à 160 pages (dix cahiers de 16), sous le palier de 176 pages de Salif. Décision à prendre par Akissi et Salif : garder 11 / 15 pt, ou passer à 11,5 / 15,5 pt (environ 8 % de pages en plus, meilleur confort pour des lecteurs âgés). À recaler sur les premiers chapitres réels.
- Akissi : valider la formule de copyright, l'impression de l'adresse sans téléphone, et faire confirmer les titres de « Du même auteur » et la graphie « Forlife Com » par l'auteur.
- Mariam : ISBN papier et numérique, dépôt légal ; lecture du texte de la loi 2015-540 dès qu'il est accessible, pour confirmer la liste des mentions.
- Yao : la page des crédits d'images n'existe pas encore ; elle se placera sur la page des mentions ou en fin d'ouvrage.
- Kouamé : les étiquettes en gris (#3A3A3A et voisins) de la carte et de la frise sont signalées « texte en gris tramé » par le contrôle de Salif ; un noir plein serait plus sûr en petit corps. La carte (120 mm) ne tient qu'en pleine page : elle doit aller en annexe ou entre deux chapitres, sinon elle laisse un grand blanc.
- Konan et Amenan : appliquer le balisage de `graphique.md` (identique à `style.md`, plus `.lecons`, `.questions`, `.priere`, `.epigraphe`, `{-}`, `court=`, `{.pleine-page}`). Un titre de chapitre de plus de 55 signes demande un titre court.
- Dépendance : `composer.py` importe `convertir_flux` et `convertir_formulaires` de `fabrication/noir_seul.py`. Si Salif renomme ces fonctions, la chaîne s'arrête ; le prévenir avant toute modification.
- Limites de WeasyPrint 70 : pas de grille de lignes stricte (léger décalage après un bloc en corps réduit), pas de figure flottante en haut de page, pas de `device-cmyk` dans les SVG (contourné), plantage sur un `::marker` à contenu dans une liste sans puce (évité). Une citation en bloc peut se couper entre deux pages ; la relecture des pages rendues reste nécessaire à la composition finale (T17).
- PDF/X non produit : Salif a constaté que WeasyPrint n'écrit pas d'OutputIntent. Il faudra le profil de l'imprimeur et Ghostscript si celui-ci l'exige.
- Les petites capitales des siècles sont simulées (capitales à 80 %), faute de fonte qui les contienne.

## PART GÉNÉRÉE PAR IA

Restera dans le livre : les intitulés et formules de composition écrits par moi (« Chapitre », « Table des matières », « Du même auteur », « À propos de l'auteur », « Leçons pour aujourd'hui », « Pour méditer », « Prière », les libellés des mentions légales et les deux phrases de copyright et de version biblique citées plus haut) ; le choix et le réglage de la mise en page. Ne restera pas dans le livre : le texte de démonstration de la maquette (avant-propos, paragraphes, encadrés, leçons, questions, prière), clairement marqué « texte de démonstration ». Les versets de la maquette sont ceux de la LSG 1910, non générés. Aucune image générée.

## SUITE PROPOSÉE

1. Akissi tranche le corps du texte (11 ou 11,5 pt) au vu de l'estimation de pagination, et valide les mentions légales.
2. Konan compose un premier chapitre réel avec ce balisage ; je le passe dans `composer.py` pour recaler la pagination avec Salif.
3. T16 (couverture) : deux pistes à partir de `couverture-amandier.svg` et de sa variante sans remparts, titre en Alegreya Sans sable sur indigo, test de vignette à 200 px, puis gabarit avec le dos de Salif (9,9 ou 10,8 mm de travail).
4. T17 : `python3 outils/composer.py`, puis `python3 fabrication/controle_pdf.py interieur sortie/interieur.pdf --cahier 16` et relecture de chaque page rendue.
