# Rapport T20 : EPUB, PDF écran, script audio et fiches des plateformes

Désiré (numérique), 13 novembre 2026.

## STATUT

TERMINÉ. L'EPUB passe EPUBCheck 5.2.1 sans erreur ni avertissement. Le PDF écran est conforme et n'a pas été refait. Le livre audio n'est pas produit (consigne) : le script du chapitre 2 et le lexique de prononciation sont prêts pour validation par l'auteur.

## RÉSUMÉ

`numerique/fabriquer_epub.py` compose l'EPUB depuis les seize `manuscrit/*-corrige.md` et `livre.yaml`, sans retouche à la main. Il reprend de `outils/composer.py` le filtre Lua des blocs (titres « Leçons pour aujourd'hui », « Pour méditer », « Prière », titres d'encadrés) et la fonction des espaces insécables françaises : l'EPUB suit donc les mêmes règles que le livre imprimé. Pandoc passe du Markdown au HTML, le script pose les espaces, remplace les SVG par les PNG écran de Kouamé et ajoute deux pages tirées de `livre.yaml` (mentions légales avec « Du même auteur » en tête, « À propos de l'auteur » à la fin), puis Pandoc produit l'EPUB 3.

- Métadonnées : titre principal et sous-titre distincts (`title-type` main et subtitle), auteur avec rôle `aut`, éditeur, `lang: fr`, droits, sujet, description reprise de la quatrième.
- Identifiant : l'ISBN numérique n'est pas attribué. L'EPUB porte `urn:uuid:0244f9ff-e11e-5eea-a166-70e93d8c0b53`, un UUID dérivé du titre, donc stable d'une fabrication à l'autre. Dès qu'un ISBN de forme valide est inscrit dans `livre.yaml` (`isbn_epub`), le script le prend comme identifiant (`urn:isbn:…`) sans autre changement.
- Table des matières à un niveau : 17 entrées (avant-propos, introduction, douze chapitres, conclusion, annexes, à propos de l'auteur). La page des mentions en est exclue.
- Images : frise et carte en PNG écran (109 Ko et 120 Ko). La légende du manuscrit reste sous l'image. Le texte alternatif décrit ce que l'image montre, d'après les étiquettes des SVG de Kouamé (rois et dates de la frise ; lieux, fleuves et échelles de la carte). Il est écrit dans le script, pas dans le manuscrit.
- CSS sobre (`numerique/epub.css`) : la liseuse garde la main sur la police et le corps. Épigraphe centrée en italique, encadré sur fond clair et filet, leçons, questions et prière séparées par un filet avec leur titre en gras. Le fond de l'encadré passe en transparent en mode sombre.
- Couverture : `couverture/plat1-epub.jpg`, 1 707 × 2 560 px.

## FICHIERS

- `numerique/fabriquer_epub.py` : script de fabrication (`python3 numerique/fabriquer_epub.py`).
- `numerique/epub.css` : feuille de style de l'EPUB.
- `numerique/jeremie.epub` : 546 Ko, 30 fichiers, SHA-256 8c3ceaa7e37e77dbb3bc1a3b11e95ca188ca3b9fec3768f58af9deb53a2dfd4c. L'empreinte change à chaque fabrication, à cause de la date `dcterms:modified`.
- `numerique/audio/script-ch02.txt` : script du chapitre 2 pour l'oreille, 3 289 mots.
- `numerique/audio/lexique-prononciation.md` : 106 noms et mots, avec une prononciation proposée, dont 9 noms « à trancher » par l’auteur, plus le sigle CMA.
- `numerique/fiches-plateformes.md` : métadonnées à saisir, description, catégories, mots-clés, déclaration d'IA, points à contrôler par plateforme.

## VÉRIFICATIONS

- `java -jar outils/ressources/epubcheck-5.2.1/epubcheck.jar numerique/jeremie.epub` : « Validating using EPUB version 3.3 rules. No errors or warnings detected. Messages: 0 fatals / 0 errors / 0 warnings / 0 infos ».
- `unzip -l` : `mimetype`, `content.opf`, `nav.xhtml`, `toc.ncx`, 18 fichiers XHTML (page de titre, mentions, 16 fichiers du manuscrit, à propos), 2 PNG, la couverture JPEG et une seule feuille de style.
- `content.opf` lu : identifiant `urn:uuid`, deux `dc:title` (main, subtitle), `dc:creator` avec `marc:relators aut`, `dc:language` fr, `dc:publisher`, `dc:rights`, `dc:description`.
- `nav.xhtml` lu : un seul niveau, 17 liens, titre « Table des matières ».
- Chapitre 2 (`text/ch005.xhtml`) ouvert : les blocs `epigraphe`, `encadre`, `lecons`, `questions` et `priere` sont présents, chacun avec son titre (`bloc-titre`). On compte 106 espaces insécables et 118 espaces fines insécables, et aucune espace ordinaire devant « ; : ! ? » ni à l'intérieur des guillemets. Les références sont liées (« Jérémie 1:5 » avec une espace insécable).
- Chapitre 2 rendu en pages par WeasyPrint avec `epub.css` (simulation de liseuse, 110 × 180 mm) : ouverture, encadré, leçons et questions regardés en planche. Un défaut est corrigé : les paragraphes des leçons se collaient, ils sont maintenant espacés de 0,5 em.
- Annexes (`text/ch017.xhtml`) : les deux `<figure>` portent le PNG écran, le texte alternatif descriptif et la légende.
- Tirets cadratin et demi-cadratin : aucun dans les XHTML de l'EPUB ni dans les fichiers produits.
- Marques visibles dans l'EPUB : les cinq attendues, à savoir l'ISBN numérique, l'ISBN papier et le dépôt légal (mentions) et le témoignage et les remerciements (avant-propos). La mention « Impression » du PDF n'est pas reprise, car elle ne concerne pas le numérique.
- PDF écran : `pdfinfo` donne 160 pages de 396,85 × 595,28 pt, soit 140 × 210 mm. `pdfinfo -box` sur les 160 pages : MediaBox, TrimBox et BleedBox identiques, donc aucun fond perdu. Fichier daté de 17 h 55, après T17 bis.
- Script audio : aucun chiffre, aucune parenthèse, aucun tiret long (`grep -P '[0-9()\x{2014}\x{2013}]'` ne trouve rien) ; 78 lignes vides entre les paragraphes. Les citations bibliques sont recopiées du manuscrit corrigé sans changement de mots.

Non vérifié : le rendu dans de vraies liseuses (Kindle, Apple Books, Google Play Livres, Kobo, application Android), faute d'appareil. La simulation WeasyPrint n'en tient pas lieu. L'italique de l'épigraphe n'est pas apparu dans cette simulation (police de repli) ; à regarder sur une liseuse.

## HYPOTHÈSES

- Une même description vaut pour toutes les plateformes. C'est la quatrième, sans changement.
- Les mentions légales viennent tout de suite après la page de titre, comme dans le PDF, et ne figurent pas dans la table.
- Le script audio garde le texte de l'auteur. Seuls changent les références, dites après la citation (« Jérémie, chapitre un, verset cinq. »), les nombres et « av. J.-C. », écrits en toutes lettres, quelques phrases longues coupées en deux et les annonces de rubrique (« Première question. »). S'y ajoutent l'annonce « Chapitre deux. » et la clôture « Fin du chapitre deux. ».
- Les prononciations suivent la lecture française de la graphie de la Louis Segond. Le « ch » se dit « k » seulement là où l'usage l'a fixé (Chaldéens, Ézéchias, Ézéchiel, Achab).

## POINTS OUVERTS ET RISQUES

- ISBN numérique : à obtenir (Mariam), à inscrire dans `livre.yaml`, puis il faut relancer le script. Tant qu'il manque, l'EPUB n'est pas publiable.
- Prononciations à trancher par l'auteur : Jojakim et Jojakin (deux rois successifs que la lecture nasale confond à l'oreille), Schallum, Paschhur, Joachaz, Achikam, Machséja, Jochanan, Karéach, Sichem, et le sigle de l'Église CMA.
- Livre audio : l'enregistrement de référence de la voix n'est pas fourni et l'installation (environ 40 minutes, 4 Go) n'a pas été lancée. Avant toute production, il faut faire un extrait court du chapitre 2 et l'envoyer à l'auteur pour validation (`CLAUDE.md`).
- Catégories BISAC et Thema : codes donnés de mémoire, marqués « À VÉRIFIER ». Les conditions et les règles d'IA des plateformes n'ont pas été vérifiées le 13 novembre 2026.
- Les repères cachés (landmarks) de l'EPUB gardent les libellés anglais de Pandoc (« Cover », « Title Page »). Ils ne s'affichent pas et EPUBCheck ne relève rien. Un modèle Pandoc personnalisé les franciserait si une plateforme le demande.
- EPUB à mise en page fixe : sans objet pour ce livre, qui ne contient ni BD ni album.

## PART GÉNÉRÉE PAR IA

Restera dans le livre ou l'accompagnera :

- les textes alternatifs de la carte et de la frise, dans l'EPUB ;
- le script audio du chapitre 2, une adaptation pour l'oreille d'un texte lui-même généré par IA (T10) ;
- le lexique de prononciation, document de travail qui guide la voix et n'est pas publié ;
- les mots-clés et la formulation de la déclaration d'IA dans `fiches-plateformes.md`.

La part générée par IA du livre (texte, images intérieures, illustration de couverture) est déclarée dans `fiches-plateformes.md`, d'après T06, T10 à T12 et T16.

## SUITE PROPOSÉE

1. L'utilisateur lit `numerique/fiches-plateformes.md` et décide du prix, des territoires, de l'exclusivité et de la couverture.
2. L'auteur valide le lexique de prononciation et les cas « à trancher », puis fournit son enregistrement de référence. On produit alors un extrait de deux minutes du chapitre 2 avec la « FOR LIFE voix off » pour son accord, avant les autres chapitres.
3. Dès l'ISBN numérique obtenu, on lance `python3 numerique/fabriquer_epub.py` puis EPUBCheck, et on fait un essai sur liseuse Android, Kindle (prévisualiseur) et Apple Books.
4. Après la validation du texte par l'auteur, toute correction se fait dans `manuscrit/*-corrige.md`, puis on refait le PDF (`composer.py`) et l'EPUB (`fabriquer_epub.py`).
