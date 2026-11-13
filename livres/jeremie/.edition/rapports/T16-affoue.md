# Rapport T16 : couverture, deux pistes et gabarit complet

Affoué (maquette et couverture). Commencé le 9 novembre 2026, terminé le 13 novembre 2026 après l'interruption de session.

## STATUT

TERMINÉ. Les deux pistes et le gabarit sont rendus en PNG et je les ai regardés. Les vignettes de 200 px sont lisibles. Le contrôle de Salif donne 0 échec et 0 point à voir sur les trois PDF, et aucun tiret cadratin ni demi-cadratin ne figure dans les fichiers produits.

Piste recommandée : A (illustration pleine page de Kouamé, avec remparts).

## RÉSUMÉ

Piste A : l'illustration `images/couverture-amandier.svg` en pleine page. Le titre est posé dans la zone calme notée par Kouamé (8 à 85 mm) : auteur en capitales espacées, « La vie et le ministère / prophétique du prophète » en Alegreya Sans 500 de 18,5 pt, « Jérémie » en Alegreya Sans 800 de 66 pt, le tout en sable sur l'indigo. Sous le titre, « BIOGRAPHIE » entre deux filets carmin. « FORLIFE IMPRIM » figure en petit dans la zone calme du bas.

Piste B : même typographie, en indigo sur un fond sable. La variante sans remparts est vue par une fenêtre en arc qui rappelle la porte de la ville, avec un filet indigo et un second filet carmin. La mention « Biographie » est en carmin.

Les deux pistes se lisent en vignette de 200 px : « Jérémie » domine (environ 20 px de haut), les deux lignes du haut du titre restent déchiffrables et l'auteur se lit encore. Je recommande A pour trois raisons. Elle reprend l'illustration retenue par Akissi et Yao sans la réduire. Les remparts disent Jérusalem. Enfin, le ciel et les collines se prolongent naturellement sur le dos et la quatrième. La piste B reste une bonne solution de repli, en particulier si l'épreuve pelliculée mate marque trop sur les grands aplats indigo (réserve de Salif).

Gabarit (piste A, 160 pages, offset 90 g, main 1,25, dos de 9,00 mm) : largeur totale de 295,00 mm, soit 2 × 140 + 9 + 6, et hauteur de 216 mm. Le paysage de Kouamé (ciel indigo, bandes mauve, abricot et sable, collines) est continué en miroir sur le dos et la quatrième. Le plat 1 est posé en premier et ses 3 mm de fonds perdus passent sous le dos. Le dos et la quatrième le recouvrent exactement jusqu'au pli, ce qui évite un raccord découpé.

Le dos fait 9 mm, donc au moins 6 mm : il porte du texte lu de bas en haut. Le titre complet (Alegreya Sans 700, 9 pt) est placé sur l'indigo du ciel et le nom de l'auteur sur l'indigo des collines, avec au moins 1,5 mm de marge de chaque côté.

La quatrième reprend l'accroche (Jérémie 20:9, disposée en vers) et la présentation. La mention de la version biblique suit. La biographie est posée sur la bande mauve (amande sur mauve, contraste d'environ 6 : 1). En bas figurent l'éditeur et le prix réservé à gauche, et à droite le cartouche blanc du code-barres : cadre pointillé de 31,7 × 22,0 mm (EAN-13 à 85 %) portant « ISBN à venir », sans faux numéro.

Le texte de la quatrième (`couverture/quatrieme.md`, 155 mots pour l'accroche et la présentation) est marqué « À RELIRE » pour Amenan. Chaque affirmation y est rattachée au plan détaillé et à un verset vérifié avec `outils/verset.py` (tableau en fin de fichier). Je l'ai relu au regard de `manuscrit/15-conclusion.md`. La conclusion écrit « plus de quarante années », et la quatrième « une quarantaine d'années » : il n'y a pas de contradiction, mais Amenan peut aligner les deux formules.

## FICHIERS

Tous dans `couverture/` :

- `quatrieme.md` : texte de la quatrième, source unique, lue par le script.
- `generer_couverture.py` : script reproductible. Options : `--pages`, `--grammage`, `--main`, `--dos` (valeur de l'imprimeur, qui prime sur le calcul) et `--piste A|B`.
- `piste-A.pdf`, `piste-B.pdf` : plat 1 seul, en CMJN, 146 × 216 mm, TrimBox de 140 × 210 mm.
- `piste-A.png`, `piste-B.png` : rendus à 150 ppp.
- `piste-A-vignette-200.png`, `piste-B-vignette-200.png` : vignettes de 200 px de large.
- `couverture-gabarit.pdf` : couverture complète de la piste A, en CMJN.
- `couverture-gabarit.png` : rendu du gabarit.
- `couverture-gabarit-reperes.png` : même rendu avec les repères tracés à l'écran seulement (coupe en rouge, plis en cyan, zones de sécurité en vert). Le PDF ne contient aucun repère.
- `plat1-epub.jpg` : 1 707 × 2 560 px, RVB, plat 1 rogné à la coupe.

Lus sans modification : la charte, les fichiers d'illustration, de droits et de fabrication, `livre.yaml`, le plan et la conclusion. J'importe `polices_corrigees` depuis `outils/composer.py` (même correction des polices que pour l'intérieur) sans modifier ce fichier. Aucun commit, aucun envoi.

## VÉRIFICATIONS

Commandes lancées depuis `.edition/`.

- `python3 couverture/generer_couverture.py` : dos de 9,00 mm, largeur de 295,00 mm.
- `python3 fabrication/controle_pdf.py couverture couverture/couverture-gabarit.pdf --dos 9` :
  - boîtes conformes (coupe de 289,0 × 210,0 mm, fonds perdus de 3,0 mm) ;
  - « couleurs du texte et des aplats sans RVB ni noir enrichi » ;
  - 7 polices, toutes incorporées ;
  - aucune image matricielle, donc aucune résolution à contrôler (tout est vectoriel) ;
  - bilan : 0 échec, 0 point à voir ;
  - SHA-256 : d718d6e11f2603410e0e77d4f888e5799223b3c3eb356de13f1a4e5d6ecefbb2.
- `controle_pdf.py couverture` sur `piste-A.pdf` et `piste-B.pdf` : boîtes de 140 × 210 mm conformes, 3 polices incorporées, 0 échec. La ligne « dos déduit −140 mm » est attendue, car il s'agit d'un plat seul et non d'une couverture complète.
- `pdffonts` : colonne `emb` à « yes » sur les 7 lignes.
- Couleurs : le script repasse chaque couleur RVB des SVG en CMJN d'après le tableau de Kouamé et s'arrête si une couleur sort de la palette. Aucun arrêt ne s'est produit.
- Variante testée : `--piste B --pages 192`, puis `controle_pdf.py --dos 10.8`, donne 0 échec. Le gabarit B rendu a été regardé (dos de 10,8 mm, titre et auteur au dos). J'ai ensuite régénéré la piste A, qui est le livrable.
- Regard des images : pistes A et B à 150 ppp, vignettes à 200 px, gabarit avec repères, dos et pli à 300 ppp.
  - Défauts trouvés et corrigés : biographie et mentions qui chevauchaient la colline mauve (biographie déplacée dans la bande mauve) ; nom propre coupé en fin de ligne (« Jo-jakim », coupure automatique retirée) ; espace parasite devant la virgule après « FORLIFE IMPRIM » ; filet clair au pli à l'écran (plat 1 désormais glissé sous le dos au lieu d'être découpé).
  - Un très léger trait reste visible au pli dans l'indigo du bas sur le rendu poppler. C'est un effet de lissage entre deux aplats de même couleur, et non un blanc dans le fichier.
- `plat1-epub.jpg` : 1 707 × 2 560 px, RVB.
- Tirets : 0 occurrence de U+2014 ou U+2013 dans `quatrieme.md`, dans le script et dans le texte extrait du gabarit. La seule occurrence trouvée par grep est dans les octets d'un PNG, donc sans objet.

Non vérifié :

- le rendu réel des couleurs, faute de profil ICC et d'épreuve, avec des valeurs CMJN estimées par Kouamé ;
- l'encrage total : l'écorce atteint 260 %, sous 300 % d'après la charte, mais rien n'a été mesuré ici ;
- la tenue du pelliculage mat sur l'indigo.

## HYPOTHÈSES

- 160 pages en offset 90 g et main de 1,25 donnent 9,00 mm de dos (brief). On les remplace par la pagination réelle et la valeur de l'imprimeur avec `--pages` ou `--dos`.
- Le code-barres est réservé à 85 % de la taille nominale (31,7 × 22,0 mm, minimum usuel de 80 %) parce que la place sur l'indigo du bas est comptée. Si l'imprimeur exige 100 % (37,29 × 25,93 mm), il faut remonter le cartouche ou réduire la marge.
- « Biographie » figure en couverture comme sous-titre, d'après `livre.yaml`, qui le donne à valider par l'auteur.
- L'éditeur est indiqué par son nom en capitales espacées, faute de logo fourni.
- La mention de version biblique est rédigée ainsi : « Citations bibliques tirées de la Louis Segond 1910. »
- Le titre complet figure au dos sans abréviation.
- Le nom du fichier `couverture-gabarit.pdf` suit le brief. Il devient `couverture.pdf` au BAT (exigences de Salif).

## POINTS OUVERTS ET RISQUES

- Prix public : marque `[À COMPLÉTER : prix public, décision de l'utilisateur]` imprimée sur le gabarit. C'est à l'utilisateur de décider.
- ISBN et EAN-13 : à attribuer (Mariam). On remplacera alors le cartouche par le vrai code-barres, en noir 100 % K sur blanc, généré avec python-barcode.
- Amenan : relecture de `quatrieme.md`. L'auteur doit valider l'accroche et la présentation.
- Salif : dos et main réels de l'imprimeur, taille minimale du code-barres, marge de dos, profil ICC, encrage maximal, échantillon de pelliculage mat sur l'indigo.
- Akissi : choisir la piste (A recommandée, B en repli).
- Désiré (numérique) : `plat1-epub.jpg` suit le repère de 2 560 px de haut. Les conditions des plateformes n'ont pas été consultées.

## PART GÉNÉRÉE PAR IA

Restera dans le livre :

- l'illustration de couverture de Kouamé (générée par IA, IMG-COUV), utilisée sur le plat 1 et prolongée par moi sur le dos et la quatrième ;
- le texte de la quatrième que j'ai rédigé : présentation, mention de version biblique et intitulé « L'auteur ».

Ne sont pas générés : le verset d'accroche (LSG 1910), la biographie (texte validé de l'auteur), le titre, le nom de l'auteur et celui de l'éditeur. Tout cela est à déclarer aux plateformes (par exemple Amazon KDP).

## SUITE PROPOSÉE

1. Akissi valide la piste A et transmet la quatrième à Amenan puis à l'auteur.
2. Une fois la pagination finale connue (T17) et la valeur de l'imprimeur reçue : `python3 couverture/generer_couverture.py --pages N --dos X`, puis `controle_pdf.py couverture ... --dos X`.
3. Une fois l'ISBN attribué, j'ajoute le code-barres réel dans le script et je relance le contrôle.
