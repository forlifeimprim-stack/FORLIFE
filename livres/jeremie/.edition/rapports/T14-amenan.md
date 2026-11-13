# Rapport T14 : correction du lot A (fichiers 01 à 08)

Amenan, lectrice et correctrice. 13 novembre 2026.

## Statut

TERMINÉ.

## Résumé

Le lot A (avant-propos, introduction, chapitres 1 à 6, 21 151 mots selon wc) est corrigé sur copie. Les huit fichiers `manuscrit/NN-x-corrige.md` sont produits et les originaux de Konan sont intacts (empreintes md5 identiques avant et après).

Le texte de Konan est propre. La lecture complète n'a relevé aucune faute d'orthographe, d'accord ou d'homophone dans le texte courant. Elle a conduit à onze corrections :
- les sept phrases en gras en tête des leçons des chapitres 5 et 6 (harmonisation décidée par Akissi) ;
- une épigraphe poétique remise en vers (Jérémie 6:16) ;
- une coupure « [...] » ramenée à « […] » ;
- une date ramenée à la forme « vers 622 av. J.-C. » ;
- « au dehors / au dedans » corrigé en « au-dehors / au-dedans ».

La passe typographique a posé les espaces insécables dans 801 lignes. Elle suit les règles de `outils/composer.py`, pour que la copie et la composition donnent le même texte. Les maladresses et les tics vont dans les suggestions, sans réécriture.

L'outil `controle_versets.py` accepte désormais la capitale de vers élidée ou accentuée ramenée en minuscule (s’, n’, c’, à, écoute), et rien d'autre. Le lexique corrige l'entrée Seraja.

## Fichiers

- `outils/controle_versets.py` : nouvelles fonctions `minuscules_permises` et `casse_admise`, et une clé d'alignement qui ignore l'accent de la première lettre. L'écart s'appelle désormais « casse ou accent ». La version précédente est gardée dans le dossier de travail (`controle_versets.avant-T14.py`).
- `corrections/test-controle.md` : ajout des cas 6 et 7, soit cinq abaissements admis et trois interdits.
- `charte/lexique.txt` : l'entrée Seraja dit « fils de Nérija, fils de Machséja » et présente la fraternité avec Baruc comme une déduction ; l'entrée Nérija cite les deux versets.
- `charte/style.md` : § 2, « la Parole » prend la majuscule quand elle est employée seule pour l'Écriture (usage des trois lots) ; § 4.7, exemples explicites pour les mots élidés ou accentués.
- `manuscrit/01-avant-propos-corrige.md` à `manuscrit/08-ch06-rouleau-corrige.md` : les huit copies corrigées.
- `corrections/corriger_lot_a.py` : script qui refait toute la correction depuis les originaux (corrections lues, typographie, relevé, page de comparaison).
- `corrections/releve-lot-A.md` : relevé (fichier, ligne, avant, après, règle). Les onze corrections lues y sont détaillées une par une ; la typographie est regroupée par fichier et par règle, avec les numéros de ligne.
- `corrections/comparaison-lot-A.html` : comparaison mot à mot générée par difflib, avec le texte retiré barré et le texte ajouté surligné, un fichier par section, en thème clair ou sombre. Les insécables y sont invisibles, ce que la page signale.
- `corrections/suggestions-lot-A.md` : suggestions et deux questions pour l'auteur.

## Vérifications

- Outil, sur le fichier test : les cas 1 à 5 sortent comme avant (CONFORME ; ÉCART bouche/langue ; Jérémie 29:41 introuvable ; renvoi vers 1:8). Le cas 6 sort CONFORME pour Jérémie 5:1, 31:3, 22:29, 15:4 et 7:16. Le cas 7 sort en trois ÉCART : « N' » abaissé après deux-points (Jérémie 16:5), « ecoute » sans accent (Jérémie 22:29) et « éternel » en minuscule (Jérémie 31:3).
- Outil, sur les seize originaux : 0 écart, 0 référence introuvable, comme avant la modification.
- Lexique : 167 entrées, 167 vérifiées, 0 en défaut.
- Copies corrigées : `controle_versets.py` sur les huit fichiers donne 0 écart et 0 référence introuvable. Il y a 285 citations conformes et 188 renvois valides.
- Les huit copies ne contiennent aucun tiret U+2014 ou U+2013, aucun gras dans les leçons, et plus aucune espace ordinaire devant « : ; ! ? » ni à l'intérieur des guillemets. Le nombre de mots est inchangé, sauf au fichier 05 (+1, « vers »).
- Orthographe : spylls avec le dictionnaire Grammalecte classique et le lexique. Il reste vingt-cinq formes inconnues, toutes expliquées : des noms bibliques vérifiés dans la LSG avec `verset.py --chercher` (Abiathar, Achimélec, Achithub, Adonija, Almon, Astarté, Baals, Béthel, Guéba, Hophni, Jézabel, Lévi, Magor-Missabib, Phinées, ainsi qu'Éli, qui s'écrit « Eli » dans la LSG et prend l'accent selon style.md § 2), les classes Pandoc (lecons, priere, epigraphe), CMA, Segond, et « aujourd'hui », coupé en deux par l'apostrophe courbe.
- Lecture complète des huit fichiers, avec la recherche des homophones et des accords. Des recherches automatiques ont complété la lecture : mots doublés, « a » suivi d'un infinitif, « à » suivi d'un participe, locutions fautives, chiffres hors références, graphies contraires au lexique et capitales de vers restées en ligne dans les blocs.
- Renvois entre chapitres : les onze renvois du lot ont été vérifiés contre le contenu des chapitres visés, dont le chapitre 9 pour l'achat du champ (Jérémie 32, quatorze références). Tous sont justes ; quatre sont ambigus et passent en suggestion.
- Composition d'essai des huit copies avec `outils/composer.py`, dans le dossier de travail et non dans `sortie/` : 82 pages, six marques [À COMPLÉTER] (les quatre des mentions légales et les deux de l'avant-propos). J'ai regardé deux pages. Page 37 : l'épigraphe de Jérémie 6:16 est rendue en quatre vers. Page 68 : les leçons du chapitre 5 sont sans gras et les espaces sont correctes.
- Pandoc lit les copies sans perte : identifiants de section, classes `epigraphe` et `lecons`, sauts de vers.

## Hypothèses

- Les espaces insécables sont posées dans le Markdown avec les caractères de `composer.py` : U+00A0 avant « : », U+202F avant « ; ! ? » et à l'intérieur des guillemets. `style.md` disait « insécables » sans préciser la fine. Une seule différence avec `composer.py` : la barre oblique inverse d'un saut de vers compte comme une fin de mot.
- « Les Complaintes » (2 Chroniques 35:25) garde sa capitale : c'est le titre d'un recueil, pas une capitale de vers. L'outil le signale comme remarque typographique, à tort, et cette remarque n'est pas un écart.
- Dans le relevé, les numéros de ligne des corrections lues sont ceux de l'original. Ceux de la typographie sont ceux de la copie : seul le fichier 05 est décalé de trois lignes après la ligne 4.
- « davantage que » est gardé : la tournure est admise.

## Points ouverts et risques

- Pour Konan ou l'auteur (`suggestions-lot-A.md`) : quatre renvois ambigus entre les chapitres du livre et ceux de Jérémie, le tic « Le texte… » (cinquante-quatre débuts de phrase dans le lot), cinq phrases à alléger, et des citations coupées qui peuvent maintenant être rendues en entier.
- Pour l'auteur : faut-il développer « l'Église CMA » ? La note sur la version doit-elle mentionner aussi l'apostrophe courbe et les capitales de vers abaissées ?
- Pour Affoué : les copies contiennent déjà les insécables. `composer.py` les laisse telles quelles, ce que l'essai a vérifié.
- L'outil abaisse « A » en « à » ou en « a » sans pouvoir trancher : la LSG numérique a perdu l'accent, et les deux formes existent en minuscule. Une confusion entre « à » et « a » dans une citation abaissée ne serait donc pas signalée. Le cas est rare et la lecture humaine le couvre.
- Le relevé et la comparaison sont produits par script : si une suggestion est retenue, il faut l'ajouter à `CORRECTIONS_LUES` dans `corriger_lot_a.py` et relancer le script, et ne pas modifier la copie à la main.
- Hors périmètre, non touchés : les fichiers 09 à 16 (T15), la couverture et la charte graphique.

## Part générée par IA

La correction n'ajoute aucun texte au livre. Le seul mot ajouté est « vers » au fichier 05 ; le reste est de la typographie et de la suppression de gras. Le texte corrigé reste celui de Konan, donc une part générée par IA élevée, déjà déclarée en T10 et T11.

## Suite proposée

1. Akissi tranche les suggestions et transmet à l'auteur les deux questions de l'avant-propos.
2. T15 : correction du lot B (fichiers 09 à 16) avec le même script, adapté au lot.
3. Quand les deux lots sont corrigés, Affoué compose l'ensemble depuis `manuscrit/*-corrige.md`.
