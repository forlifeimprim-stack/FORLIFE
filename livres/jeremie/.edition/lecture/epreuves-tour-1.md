# Épreuves, premier tour : relevé par page

Amenan, 13 novembre 2026 (T18). Fichier relu : `sortie/interieur.pdf` (160 pages, composé par Affoué en T17).

Méthode. J'ai fait des planches-contact à 30 ppp pour les 160 pages et regardé à 45 ou 60 ppp les pages 17, 106 et 153 à 160. J'ai extrait le texte et la position de chaque ligne (`pdftotext -bbox-layout`), puis compté les coupures, les veuves et orphelines, les titres en bas de page, les titres courants et les folios, et comparé la table des matières aux pages réelles. Les scripts d'analyse sont dans mon dossier de travail, pas dans le projet.

Qui corrige : « Affoué » pour la mise en page (CSS, `composer.py`), « Amenan » pour le texte des `-corrige.md`, « Akissi » pour `livre.yaml`.

## Ce qui est conforme

- Folios : les 160 pages sont numérotées dans l'ordre. Les pages blanches (6, 48, 70, 100, 124, 146, 152) n'ont ni folio ni titre courant.
- Titres courants : le titre du livre en page paire, le titre du chapitre en page impaire (forme courte pour le chapitre 11, « Parmi les ruines », et pour « Conclusion » et « Annexes »). Les pages d'ouverture n'en ont pas.
- Ouvertures : chaque chapitre commence sur une page impaire (7, 9, 17, 27, 37, 49, 59, 71, 81, 91, 101, 113, 125, 135, 147, 153).
- Table des matières (page 5) : les dix-sept numéros de page sont justes.
- Veuves et orphelines : aucune ligne de paragraphe isolée en haut ou en bas de page. Les seuls cas trouvés sont des titres en haut de page, ce qui est normal.
- Titres isolés : aucun intertitre en dernière ligne de page.
- Notes : le livre n'a pas de note de bas de page.
- Renvois « au chapitre N » : tous sont justes (vérifiés en T14 et T15), et la numérotation de la table est celle du texte.
- Page « À propos de l'auteur » (160) : la biographie est conforme mot pour mot à `livre.yaml` (`biographie_auteur`).
- Page « Du même auteur » (2) : les deux titres de `livre.yaml` sont présents.
- Légendes : frise des rois (155) et carte (157) ont leur légende ; le tableau « Qui est qui » ne coupe plus de ligne entre deux pages (157 à 159).
- Mentions légales (4) : copyright, version biblique, éditeur et adresse sont présents. Les quatre marques [À COMPLÉTER] (ISBN papier, ISBN numérique, dépôt légal, imprimeur) sont attendues. La conformité à la loi n° 2015-540, article 26, n'a pas pu être vérifiée en ligne.
- Marques de travail : six au total, les quatre des mentions et les deux de l'avant-propos (témoignage et remerciements, pages 7 et 8). Toutes sont attendues.

## Défauts relevés

| Page | Nature | Correction proposée | Qui |
|---|---|---|---|
| 155 | Renvoi faux : « La carte de la page suivante » ; le texte se poursuit page 156, et la carte est page 157 | « La carte qui suit situe… » | Amenan, fait dans `16-annexes-corrige.md` |
| 2, 4, 160 | Apostrophes droites : « l'horloge ne s'arrête » (2), « Côte d'Ivoire », « date d'impression » (4), « d'école », « l'Église », « l'école » (160). Le reste du livre a l'apostrophe ’ | Apostrophe typographique dans `livre.yaml`. Pour la biographie, c'est un changement de typographie seul, à accepter, car le texte est validé mot pour mot | Akissi (`livre.yaml`), puis Affoué recompose |
| tout le livre (84 cas, dont 18, 33, 34, 35, 41, 61, 76, 77, 82) | Référence coupée en fin de ligne entre le nom du livre et le chapitre (« Jérémie » en fin de ligne, « 1:5) » au début de la suivante). Une fois, la coupure tombe même entre deux pages (105 et 106, « Exode / 31:18 ») | Espace insécable entre le nom du livre et le numéro du chapitre : règle à ajouter dans `composer.py`, sur le modèle de celle des livres numérotés | Affoué |
| tout le livre (96 cas) | Noms propres coupés en fin de ligne : Jéré-mie et Jé-rémie (29 fois, dont 15 dans une référence entre parenthèses), Joja-kim, Joja-kin, Chro-niques, Jérusa-lem, Baby-lone, l'Éter-nel, Nebucad-netsar, Pasch-hur, Ézé-chias, etc. Liste complète à la fin de ce fichier | Interdire la césure des noms propres : envelopper les noms du lexique dans `<span class="nom">` (`hyphens: none`) au moment de la composition | Affoué |
| 17, 39, 81, 87, 103, 113, 135 | Coupure de mot en dernière ligne d'une page impaire, donc lue après avoir tourné la page : « événe-/ments » (17), « sou-/… » (39, 81), « bri-/sera » (87), « ras-/… » (103), « l'Éter-/nel » (113), « Tachpa-/nès » (135) | Supprimer la coupure en fin de page impaire (reprise manuelle de la ligne ou de l'interlettrage) | Affoué |
| 18, 114, 116 | Coupure en dernière ligne d'une page paire : « tri-/… » (18), « sor-/… » (114), « pri-/… » (116). Moins grave, car la page suivante est en vis-à-vis | À reprendre si possible | Affoué |
| 106 | Coupure fautive dans un composé : « dix-hui-/tième » | Couper au trait d'union (« dix-/huitième ») ou pas du tout | Affoué |
| 15, 69 | Coupure qui ne laisse que deux lettres en fin de ligne : « Jé-/rémie » (15), « ac-/cepté » (69) | Minimum de trois lettres avant la coupure (`hyphenate-limit-chars: 6 3 3`) | Affoué |
| 76, 96, 119, 128, 132 | Trois lignes coupées de suite (échelle de césures) | Limiter à deux lignes consécutives (`hyphenate-limit-lines: 2`, si WeasyPrint le gère ; sinon reprise à la main) | Affoué |
| 7, 8, 30, 38, 72, 143 | Intertitre suivi de deux lignes seulement en bas de page : « Comment le lire » (7), « Remerciements » (8), « Un ordre et une promesse » (30), « Israël l'infidèle et Juda la perfide » (38), « Vingt-trois ans de paroles » (72), « Leçons pour aujourd'hui » (143) | Au moins trois lignes sous un intertitre, sinon le passer à la page suivante (`orphans: 3` sur le premier paragraphe après un titre) | Affoué |
| 5 | Table : pas de points de conduite pour « Conclusion : ce que Jérémie enseigne au serviteur de Dieu 147 » (le titre remplit la ligne) ; « …du prophète. . . . » colle un point de conduite au point final du titre | Titre court dans la table (« Conclusion »), comme dans le titre courant ; espace avant les points de conduite | Affoué |
| 3 | Page de titre : coupure du titre en « La vie et le ministère / prophétique / du prophète Jérémie », avec un mot seul au milieu | « La vie et le ministère / prophétique du prophète / Jérémie », ou une ligne plus longue | Affoué (choix graphique) |
| 159 | Colonne « Référence » du tableau « Qui est qui » : « Jéré-/mie 22:11 », références coupées | Pas de césure dans la colonne des références (`hyphens: none` sur cette colonne) | Affoué |
| 156 | Page de trois lignes avant la carte pleine page | Acceptée par Akissi en T17 ; rien à faire | aucun |

## Liste des noms propres coupés (pages)

Jérémie : 13, 15, 31, 34, 40, 41, 42, 45, 53, 56, 64, 67 (deux fois), 73 (deux fois), 76 (deux fois), 78, 88, 97, 98, 116, 119, 123, 128, 136, 139 (deux fois), 159. Jojakim, Jojakin : 14, 44, 76, 92 (deux fois), 93, 97. Chroniques : 12 (deux fois), 41, 91, 92 (deux fois), 98. Jérusalem : 12, 23, 42, 43, 98, 115, 121, 125, 143. Babylone : 72, 97, 125, 128 (deux fois), 140, 150. L'Éternel : 20, 34, 64, 89, 97, 113, 128, 147, 150. Nebucadnetsar : 72, 73, 91, 114, 120, 155. Autres : Joachaz (10), Sédécias (21, 95), Anathoth (21, 24, 151), Benjamin (23), Hanameel (23), Carkemisch (45), Pharaon (49, 118, 135), Philistins (52, 53), Récabites (84), Schemaeja (97), Ézéchiel (97), Samarie (103), Paschhur (114), Ézéchias (114), Azaria (131), Lamentations (132), l'Écriture (138).

## Corrections de texte faites (copies corrigées)

- `manuscrit/16-annexes-corrige.md`, ligne 38 : « La carte de la page suivante situe » devient « La carte qui suit situe ».

C'est le seul défaut de texte du tour. Le reste relève de la mise en page ou de `livre.yaml`.
