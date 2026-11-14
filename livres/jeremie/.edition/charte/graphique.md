# Charte graphique

Établie par Affoué (maquette) le 9 novembre 2026, tâche T07. Elle fixe la mise en page de l'intérieur de « La vie et le ministère prophétique du prophète Jérémie » (Kouadio Koffi Élisée, Forlife Imprim) et sert de base à la couverture (T16), à la composition (T17) et aux versions numériques (T20). La feuille de style qui l'applique est `charte/interieur.css` ; la chaîne qui compose le livre est `outils/composer.py`. La typographie du texte (orthographe, citations, nombres) relève de `charte/style.md` (Amenan) ; les images et la palette de couverture, de `charte/illustration.md` (Kouamé).

Aucune charte de collection n'existe chez Forlife Imprim : celle-ci est la première et pourra servir aux titres suivants.

## Format, marges et grille

Format fini 140 × 210 mm, broché, dos carré collé, intérieur en noir. Le PDF imprimeur a 3 mm de fonds perdus sur chaque bord (page de 146 × 216 mm, TrimBox et BleedBox déclarées). Le PDF écran a le même rendu sans fonds perdus.

| Marge | Valeur | Remarque |
|---|---|---|
| Haut | 15 mm | le titre courant est posé dans cette marge, à environ 11 mm de la coupe |
| Intérieur (petit fond) | 20 mm | côté reliure : à gauche sur une page impaire, à droite sur une page paire |
| Bas | 18 mm | le folio est posé dans cette marge, à environ 9 mm de la coupe |
| Extérieur | 15 mm | |

Le rectangle de texte mesure 105 × 177 mm. Tout l'espacement vertical est réglé sur l'interligne du texte courant (15 pt) ou sur sa moitié (7,5 pt), pour que les lignes de deux pages en vis-à-vis restent à peu près alignées. WeasyPrint n'a pas de grille de lignes stricte : un bloc en corps réduit (citation, encadré, note) peut décaler les lignes qui le suivent d'une fraction de ligne, ce qui reste acceptable dans un livre de ce genre.

Une page pleine compte 33 lignes et 360 à 372 mots (mesuré sur la maquette). Rien d'important n'est à moins de 5 mm de la coupe : le texte est à 15 mm au moins, le titre courant à 11 mm, le folio à 9 mm, et la carte en pleine page à 7,5 mm.

## Polices

Deux familles libres (licence SIL Open Font License), fichiers dans `outils/ressources/polices/`.

EB Garamond (texte) : 400, 500, 600 et 700, romain et italique, sous-ensembles latin et latin-ext fusionnés par `composer.py` (translittérations hébraïques : ṭ, ă, ʻ, ʼ). Depuis T25, la famille est déclarée en CSS sous le nom « EB Garamond Livre » : une copie système d'EB Garamond (latin seul) portait le nom « EB Garamond » et passait devant les fichiers du livre. Garamond de lecture suivie, économe en largeur, familier aux lecteurs de Bibles imprimées. Le jeu de caractères fourni (Fontsource, sous-ensemble latin) n'a ni petites capitales ni chiffres elzéviriens : la charte n'en demande pas. Les petites capitales des siècles sont simulées à la composition (capitales réduites à 80 %).

Alegreya Sans (titres et repères) : 400, 500 et 700, plus 800 pour les titres d'encadré, avec l'italique 400 et 500. Fontsource 5.3.0, récupérée sur npm le 9 novembre 2026. Raisons du choix : c'est une linéale humaniste dessinée à partir d'un modèle calligraphique, qui s'accorde avec le Garamond sans le doubler ; elle reste nette en petit corps (références, légendes, titres d'encadré) et sur l'écran d'un téléphone ; ses graisses fortes donnent un titre de couverture lisible en vignette ; elle a la capitale accentuée, l'œ, les guillemets français et un large jeu de graisses dans la même famille. Une seconde famille à empattements aurait manqué de contraste avec le texte, et une police en capitales seules (de type Cinzel) se lit mal en titre long.

Les fichiers Fontsource n'ont ni l'espace fine insécable (U+202F) ni le trait d'union U+2010. `composer.py` en fait une copie corrigée à chaque composition (U+202F prend le glyphe de l'espace fine U+2009, U+2010 et U+2011 celui du trait d'union), et la CSS impose `hyphenate-character: "-"`.

## Corps et interlignes

| Élément | Police | Corps / interligne | Alignement |
|---|---|---|---|
| Texte courant | EB Garamond 400 | 11 / 15 pt | justifié, coupures françaises, alinéa de 1,2 em sauf après un titre ou un bloc |
| Citation biblique en bloc | EB Garamond 400 | 10,5 / 14 pt | justifié, filet de 0,6 pt à gauche, retrait de 4,5 mm |
| Épigraphe | EB Garamond italique | 10,5 / 14 pt | au fer à gauche, bloc décalé de 32 % vers la droite |
| Référence d'une citation en bloc | Alegreya Sans 400 | 8,5 / 12 pt | au fer à droite, entre parenthèses |
| Encadré | EB Garamond 400 | 10 / 13,5 pt | justifié |
| Prière | EB Garamond italique | 11 / 15 pt | justifié, retrait de 7 % de chaque côté |
| Note de bas de page | EB Garamond 400 | 8,5 / 11 pt | justifié, sous un filet de 0,4 pt |
| Légende de figure | Alegreya Sans 400 | 8,5 / 12 pt | centré |
| Titre courant | EB Garamond italique | 9 pt | centré |
| Folio | EB Garamond 400 | 9,5 pt | centré en pied |

Le corps de 11 pt est dans la fourchette de la fiche de rôle (10,5 à 11,5 pt), avec un interligne de 1,36. Si l'équipe veut un texte plus grand pour des lecteurs âgés, le passage à 11,5 / 15,5 pt ne demande que deux valeurs dans `html` (CSS) et ajoute environ 8 % de pages.

Coupures : au moins 6 lettres dans le mot, 3 avant et 3 après la coupure. Aucun mot à majuscule (noms propres, livres bibliques, l'Éternel) n'est coupé ; un composé ne se coupe qu'à son trait d'union, et pas du tout s'il porte une majuscule ou finit par deux lettres (Ben-Hinnom, Qu'est-ce). Le nom d'un livre biblique est lié au chapitre par une insécable (Jérémie 1:5). Aucune coupure en dernière ligne d'une page impaire : la composition repère ces mots et les recompose sans césure. Veuves et orphelines : 2 lignes au moins en haut et en bas de page, 3 sous un intertitre. Les titres ne sont jamais coupés. La table des matières affiche le titre court d'un chapitre dont le titre dépasse 52 signes.

## Hiérarchie des titres

1. Étiquette de chapitre : « Chapitre 1 », Alegreya Sans 500, 9,5 pt, capitales espacées de 0,22 em, centré. Le numéro est généré par la composition, jamais tapé dans le manuscrit.
2. Titre de chapitre (`#`) : Alegreya Sans 500, 20 / 24 pt, centré. Une liaison insécable évite un mot seul en dernière ligne et un petit mot (de, du, le, à) en fin de ligne.
3. Intertitre (`##`) : Alegreya Sans 700, 12 / 15 pt, au fer à gauche, 22,5 pt avant, 7,5 pt après, toujours suivi d'au moins deux lignes sur la même page.
4. Sous-intertitre (`###`, rubriques des sections « Pour aller plus loin : étude ») : EB Garamond italique 11,5 / 15 pt, 22,5 pt avant, 3 pt après.

Ouverture de chapitre : toujours sur une page impaire (une page paire blanche s'intercale si besoin), blanc de 24 mm au-dessus de l'étiquette (réduit à 18 mm en T17 bis pour tenir 160 pages, rétabli en T25 : il ne change plus la pagination), puis titre, fleuron de Kouamé (6 mm de haut), épigraphe, texte. Pas de titre courant sur la page d'ouverture ; le folio est conservé.

## Blocs

Épigraphe : en tête de chapitre, sous le fleuron. Italique, décalée à droite, référence en Alegreya Sans au fer à droite.

Citation biblique longue : bloc avec filet gris (60 % de noir) à gauche, corps réduit, sans guillemets ni numéros de versets (`style.md`, § 4 et 5). Les passages poétiques gardent un vers par ligne. La référence est la dernière ligne du bloc, toujours sur la même page que les dernières lignes de la citation.

Encadré de contexte historique ou géographique (`.encadre`) : fond gris à 8 % de noir, marges intérieures de 3,5 à 4 mm, titre en Alegreya Sans 800, 8,5 pt, capitales espacées. Il peut passer d'une page à l'autre ; son fond et ses marges sont alors répétés.

Encadré d'application (`.application`) : même gabarit, sans fond, entouré d'un filet noir de 0,6 pt, titre en Alegreya Sans 700, 10 pt.

Leçons pour aujourd'hui (`.lecons`) : rubrique finale du chapitre, sous un filet noir de 0,6 pt sur toute la largeur, titre Alegreya Sans 700, 12 pt. Texte en paragraphes ou liste à puces.

Pour méditer (`.questions`) : titre comme les leçons, questions numérotées (numéros en Alegreya Sans gras), le bloc ne se coupe pas.

Prière (`.priere`) : titre « Prière » en Alegreya Sans 8,5 pt capitales espacées, centré ; texte en italique, en retrait des deux côtés ; le bloc ne se coupe pas.

Pause dans le récit (`***`) : fleuron de Kouamé de 4 mm de haut, centré.

Tableaux des annexes (chronologie, « Qui est qui ») : EB Garamond 9 / 12 pt, en-tête en Alegreya Sans gras 8,5 pt sous un filet noir, filets gris de 0,3 pt entre les lignes, colonnes de 21 %, 55 % et 24 % (Pandoc imposait trois tiers). Une ligne de tableau ne se coupe jamais entre deux pages, et l'en-tête se répète en haut de la page suivante (T17). Les deux tableaux à cinq colonnes (`::: tableau-ordre`, `::: tableau-archeologie`) sont en 8 / 10,5 pt, en-tête 7,5 pt, gouttière de 5 pt, colonnes de 13, 26, 13, 37 et 11 % (ordre) et de 20, 22, 16, 24 et 18 % (archéologie), sans page à l'italienne (T25).

## Folios et titres courants

Folio en pied de page, centré, sur toutes les pages de texte, ouvertures de chapitre comprises. Pas de folio sur les pages liminaires ni sur les pages blanches ; la numérotation compte pourtant toutes les pages depuis le faux-titre (la première page de texte est la page 7).

Titre courant en haut de page, centré, en italique : titre du livre sur les pages paires, titre du chapitre sur les pages impaires. Un titre de chapitre de plus de 55 signes reçoit un titre court (attribut `court`, voir le balisage) ; `composer.py` le signale. Pas de titre courant sur les ouvertures de chapitre, les pages blanches, les pages liminaires, la page « À propos de l'auteur » ni les figures en pleine page.

## Ordre des pages

| Page | Contenu |
|---|---|
| 1 | faux-titre (titre seul, Alegreya Sans 500, 13 pt) |
| 2 | « Du même auteur » (titres de `livre.yaml`, `du_meme_auteur`) |
| 3 | page de titre : auteur en capitales espacées, titre en Alegreya Sans 700, 21 pt, sous-titre en italique, fleuron, éditeur et ville en pied |
| 4 | mentions légales, en pied de page, 8,5 / 11,5 pt |
| 5 | table des matières (titres de chapitres, numéros, points de conduite, pages) ; s'il y a une dédicace, elle prend la page 5 et la table passe en page 7 |
| 6 | blanche |
| 7 et suivantes | introduction, chapitres, conclusion, annexes, chacun sur une page impaire |
| fin | « À propos de l'auteur » (texte de `livre.yaml`, `biographie_auteur`, repris mot pour mot), sur la page qui suit les annexes (paire ou impaire, pour ne pas ajouter de blanc), puis une page blanche si le nombre de pages est impair |

Le nombre total de pages est toujours un multiple de 16 : `composer.py --cahier 16` (valeur par défaut) ajoute des pages blanches en fin de livre, après qu'on a essayé d'ajuster les blancs et les annexes. La page des mentions porte aussi le crédit des textes hébreux (`credits_textes` de `livre.yaml`).

## Mentions légales

La page 4 porte, d'après `livre.yaml` : titre et sous-titre, auteur, titulaire du copyright et année, version biblique citée, éditeur avec son adresse et son courriel, ISBN de la version imprimée et de la version numérique, numéro de dépôt légal, imprimeur avec lieu et date d'impression. Les numéros restent `[À COMPLÉTER]` tant qu'ils ne sont pas attribués (dossiers de Mariam, T02). Cette liste suit le brief qui cite la loi ivoirienne n° 2015-540, article 26 ; le texte de la loi n'a pas pu être consulté le 9 novembre 2026 (réseau limité), la liste est donc non vérifiée sur la source. La phrase « Tous droits réservés. Toute reproduction, même partielle, est interdite sans l'autorisation écrite de l'éditeur. » est une formule d'usage, à faire valider par Akissi. Les crédits d'images (registre de Yao) s'ajouteront sur cette page ou en fin d'ouvrage quand le registre sera prêt.

## Couleurs

Intérieur : noir seul. Toutes les couleurs de la CSS sont écrites en `device-cmyk()` sur la seule plaque K : texte, titres, filets et folios en 0/0/0/100, filet des citations en 0/0/0/60, fond des encadrés en 0/0/0/8. Aucun noir RVB ni noir quadri. Les SVG de Kouamé restent en RVB neutre dans le fichier (WeasyPrint 70 ignore `device-cmyk` dans un SVG) : `composer.py` les passe en DeviceGray après composition avec la fonction de `fabrication/noir_seul.py` (Salif). Le 8 % du fond d'encadré est un choix assumé ; s'il s'affaiblit sur l'épreuve, le monter à 10 ou 12 %.

Couverture (T16) : quadrichromie, palette de Kouamé (`charte/illustration.md`), valeurs CMJN estimées à confirmer avec le profil de l'imprimeur.

| Rôle sur la couverture | Couleur | CMJN estimé |
|---|---|---|
| Fond du titre, dos, quatrième | indigo #1E2B47 | 90 75 35 45 |
| Titre et nom de l'auteur sur l'indigo | sable #F3D9B1 | 3 15 32 0 |
| Texte courant de la quatrième sur l'indigo | amande #FAF0EA | 0 5 6 0 |
| Accent (filet, mention « Biographie ») | carmin #B4475C | 20 80 50 8 |
| Code-barres EAN-13 | noir sur cartouche blanc | 0 0 0 100 |

Les textes de la couverture s'écrivent en Alegreya Sans (titre 700 ou 800) et EB Garamond (texte de la quatrième), comme l'intérieur.

## Images

Fleuron : `images/fleuron-amandier.svg` (Kouamé), noir, 30 × 9 mm à l'origine, posé à 6 mm de haut aux ouvertures, 4 mm aux pauses, 9 mm sur la page de titre. Si le fichier manque, la composition met à sa place un petit losange au trait.

Frise des rois (`images/frise-rois-juda.svg`, 105 × 78 mm) : figure ordinaire, pleine largeur du texte, légende en dessous.

Carte (`images/carte-monde-jeremie.svg`, 120 × 170 mm) : plus large que le rectangle de texte. Elle se pose en pleine page (classe `pleine-page`), décalée de 7,5 mm vers l'extérieur, sans titre courant. Comme une figure pleine page commence toujours une nouvelle page, elle se place là où un saut de page ne laisse pas de grand blanc : en annexe, ou entre deux chapitres.

Les étiquettes grises de la carte et de la frise sont signalées « texte en gris tramé » par le contrôle de Salif ; c'est un choix de Kouamé à confirmer sur l'épreuve. Les chemins d'images s'écrivent depuis `.edition/` (`images/...`).

## Balisage du manuscrit

Konan écrit en Markdown Pandoc, un fichier par chapitre, selon `charte/style.md`. Les corrections d'Amenan produisent les fichiers `manuscrit/*-corrige.md`, que la composition prend dans l'ordre alphabétique de leur nom (préfixer par `01-`, `02-`, etc.). Le texte n'est jamais corrigé dans le PDF : toute correction se fait dans le Markdown, puis on recompose.

Titre de chapitre numéroté, avec un titre court facultatif pour le titre courant :

```markdown
# L'appel d'un jeune homme d'Anathoth {#appel court="L'appel d'Anathoth"}
```

Ouverture sans numéro (introduction, conclusion, annexes) : ajouter `-` dans les accolades.

```markdown
# Introduction {-}
```

Intertitres : `##`, sous-intertitres : `###`.

Épigraphe, juste sous le titre du chapitre : une citation en bloc dans un bloc `epigraphe`, pour que l'outil de contrôle des versets la lise.

```markdown
::: epigraphe
> Avant que je t'eusse formé dans le ventre de ta mère, je te connaissais, [...]
>
> (Jérémie 1:5)
:::
```

Citation biblique en bloc : lignes commençant par `>`, ligne vide `>`, puis la référence seule entre parenthèses (`style.md`, § 6). Pour un passage poétique, chaque vers se termine par `\`, sauf le dernier.

```markdown
> Il y a dans mon cœur comme un feu dévorant\
> Qui est renfermé dans mes os.
>
> (Jérémie 20:9)
```

Encadré de contexte (sa première ligne en gras devient le titre) et encadré d'application :

```markdown
::: encadre
**Contexte historique : le livre de la loi sous Josias**

Texte de l'encadré.
:::

::: application
**Titre de l'encadré**

Texte de l'encadré.
:::
```

Rubriques de fin de chapitre : les titres « Leçons pour aujourd'hui », « Pour méditer » et « Prière » sont posés par la composition. Une première ligne en gras les remplacerait, ce qui ne devrait pas servir.

```markdown
::: lecons
Texte en paragraphes, ou liste :

- première leçon ;
- deuxième leçon.
:::

::: questions
1. Première question ?
2. Deuxième question ?
3. Troisième question ?
:::

::: priere
Texte de la prière.
:::
```

Pause dans le récit : `***` seul sur une ligne (devient le fleuron).

Note de bas de page : `texte[^1]` puis, plus bas, `[^1]: Texte de la note.` Les notes se numérotent à partir de 1 dans chaque chapitre.

Figure : `![Légende.](images/frise-rois-juda.svg)` ; carte en pleine page : `![Légende.](images/carte-monde-jeremie.svg){.pleine-page}`.

Siècle : `VII^e^ siècle` (chiffres romains réduits à la composition). Dédicace éventuelle, écrite en tête du premier fichier, avant le premier titre : `::: dedicace` ; la composition la place seule sur une page impaire, en italique, avant la table des matières.

Espaces : Konan tape des espaces ordinaires. La composition pose de toute façon les insécables françaises dans le texte (fine avant ; ! ?, insécable avant :, fines à l'intérieur des guillemets, insécable entre un numéro et le nom d'un livre biblique comme 2 Rois, avant « av. J.-C. », fine entre les milliers). Le deux-points d'une référence (Jérémie 1:5) ou d'une heure (10:30) n'en reçoit jamais. Les tirets cadratin et demi-cadratin sont signalés à la composition : ils doivent être corrigés dans le Markdown.

## Composition

Depuis `.edition/` :

```bash
python3 outils/composer.py                     # manuscrit/*-corrige.md vers sortie/interieur.pdf et sortie/interieur-ecran.pdf
python3 outils/composer.py charte/maquette/chapitre-exemple.md --sortie charte/maquette --nom maquette
python3 fabrication/controle_pdf.py interieur sortie/interieur.pdf --cahier 16
pdftoppm -r 60 -png sortie/interieur.pdf /tmp/page    # puis regarder chaque page
```

La chaîne : Pandoc (HTML, `--section-divs`, `--wrap=none`, filtre Lua intégré à `composer.py`), numérotation des chapitres, fleurons, table des matières, pages liminaires et page « À propos de l'auteur » tirées de `livre.yaml`, espaces françaises, polices corrigées, WeasyPrint avec la même `FontConfiguration` pour les `@font-face`, la CSS et le PDF, page blanche finale si le compte est impair, puis passage des gris RVB en DeviceGray sur le PDF imprimeur. Le PDF écran est le même rendu sans fonds perdus, liens de la table et signets compris.

Maquette type : `charte/maquette/chapitre-exemple.md`, composée en `maquette.pdf` (imprimeur) et `maquette-ecran.pdf`, pages rendues en PNG dans le même dossier.

## Estimation de pagination

Avec 360 à 372 mots par page pleine et environ 40 000 mots, le texte seul occupe une centaine de pages et demie à cent dix. En ajoutant les ouvertures de chapitre et les pages paires blanches (environ une page et demie par chapitre sur quatorze ouvertures), les rubriques de fin, six pages liminaires, une douzaine de pages d'annexes et la page sur l'auteur, j'estime le livre composé à 150 à 160 pages, soit dix cahiers de 16. C'est en dessous du palier de 176 pages de la fiche de Salif. Si l'équipe préfère 176 pages, le passage du texte à 11,5 / 15,5 pt est la voie la plus simple et améliore le confort de lecture. À recaler sur la composition des premiers chapitres réels.
