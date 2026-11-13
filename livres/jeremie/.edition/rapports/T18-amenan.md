# Rapport T18 : épreuves, premier tour

Amenan, lectrice et correctrice. 13 novembre 2026.

## Statut

TERMINÉ.

## Résumé

La structure de `sortie/interieur.pdf` (160 pages) est juste :
- folios, titres courants, ouvertures en page impaire et table des matières, avec ses dix-sept numéros de page exacts ;
- aucune veuve ni orpheline, aucun intertitre seul en bas de page ;
- biographie conforme mot pour mot, légendes présentes.

J'ai trouvé un seul défaut de texte. Page 155, l'annexe renvoie à « la page suivante » pour la carte, alors qu'elle est en page 157. Je l'ai corrigé dans `16-annexes-corrige.md`.

Les autres défauts relèvent de la mise en page et reviennent à Affoué. Le plus visible porte sur les césures : 411 lignes coupées, dont 96 dans des noms propres, et 84 références coupées entre le nom du livre et le chapitre. S'y ajoutent sept coupures en fin de page impaire, une coupure fautive dans « dix-huitième », six intertitres suivis de deux lignes seulement et des détails dans la table et la page de titre. Les apostrophes droites des pages 2, 4 et 160 viennent de `livre.yaml` et reviennent à Akissi.

## Fichiers

- `lecture/epreuves-tour-1.md` : relevé par page (page, nature, correction proposée, qui corrige), avec la liste des noms propres coupés.
- `manuscrit/16-annexes-corrige.md` : « La carte qui suit » à la place de « La carte de la page suivante ».
- `corrections/corriger_lot.py` : il reporte désormais les deux retouches qu'Akissi avait faites directement dans les copies 14 et 15 (âge de Jojakin, « le troisième ») et ma correction de T18. Une relance du script ne les perd plus. Pour la quatrième, que T17 a copiée sur `quatrieme.md`, l'original est relu dans git, ce qui garde les six lignes au relevé du lot B.
- `corrections/releve-lot-B.md` et `corrections/comparaison-lot-B.html` : régénérés (25 corrections lues).

## Vérifications

- Planches-contact à 30 ppp des 160 pages, regardées. Pages 17, 106 et 153 à 160 regardées à 45 ou 60 ppp.
- `pdftotext -bbox-layout` : texte et position de chaque ligne, analysés par script.
  - Titres courants et folios relevés page par page.
  - Table des matières : chaque numéro comparé à la page réelle d'ouverture, 17 sur 17 justes.
  - Biographie de la page 160 comparée à `livre.yaml` : identique.
- Après correction :
  - `controle_versets.py` sur les seize copies : 0 écart, 0 référence introuvable ;
  - aucun tiret U+2014 ou U+2013 ;
  - les copies du lot A, régénérées, sont identiques octet pour octet ;
  - celles du lot B ne diffèrent que par ma correction et par une espace insécable dans « 2 Rois », que la retouche d'Akissi avait laissée ordinaire.
- Non vérifié : je n'ai pas recomposé le PDF, car c'est à Affoué de le faire après ses réglages. La conformité des mentions légales à la loi n° 2015-540, article 26, n'a pas été vérifiée en ligne (réseau fermé).

## Hypothèses

- Seuils retenus :
  - pour une coupure, pas moins de trois lettres de part et d'autre ;
  - jamais de coupure dans un nom propre ou dans une référence ;
  - pas de coupure en fin de page impaire ;
  - au moins trois lignes sous un intertitre en bas de page.

  Ce sont les usages de la typographie française courante ; Affoué peut les assouplir si la pagination en souffre.
- « Souviens-/t'en » (page 64) est une coupure au trait d'union, donc acceptée.
- Une détection automatique des veuves et orphelines peut manquer un cas dans les blocs de citation. Les pages regardées n'en montrent pas.

## Points ouverts et risques

- Pour Affoué : appliquer les réglages de césure et d'insécables du relevé (noms du lexique sans césure, espace insécable entre le livre et le chapitre, limites de coupure). Il faut aussi reprendre les fins de page 17, 39, 81, 87, 103, 113 et 135, la table (page 5) et la page de titre, puis recomposer. Ces réglages peuvent déplacer des lignes : un second tour d'épreuves sera nécessaire.
- Pour Akissi : passer les apostrophes de `livre.yaml` en ’ (mentions, « Du même auteur », biographie), ce qui ne change que la typographie, et décider si la biographie validée peut recevoir ce changement.
- Les marques [À COMPLÉTER] attendues restent : quatre dans les mentions légales et deux dans l'avant-propos.

## Part générée par IA

Rien de nouveau dans le livre : un renvoi reformulé en quatre mots (« La carte qui suit »).

## Suite proposée

1. Affoué applique les réglages et recompose.
2. Je fais le second tour d'épreuves sur les pages qui ont bougé et sur les points de ce relevé.
3. Salif contrôle ensuite les fichiers pour le BAT (T19).
