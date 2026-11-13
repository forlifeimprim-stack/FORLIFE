# Rapport T15 : correction du lot B (fichiers 09 à 16) et de la quatrième de couverture

Amenan, lectrice et correctrice. 13 novembre 2026.

## Statut

TERMINÉ.

## Résumé

Le lot B (chapitres 7 à 12, conclusion et annexes, 21 361 mots selon wc) est corrigé sur copie, avec la même méthode qu'en T14. Les huit fichiers `manuscrit/NN-x-corrige.md` sont produits et les originaux sont intacts (md5 identiques).

La lecture complète a conduit à seize corrections :
- les huit phrases en gras en tête des leçons des chapitres 7 et 8 (harmonisation) ;
- les « ceps » de Paschhur remplacés par « la prison » à trois endroits (chapitre 10, conclusion, annexe « Qui est qui ») : la LSG dit « la prison » en Jérémie 20:2, et le chapitre 5 aussi ;
- une tournure fautive, « on date cette déportation de vers 597 », corrigée ;
- deux « au dedans » d'auteur corrigés en « au-dedans » ;
- deux références remises à la forme de style.md (« 38:2, 17 » et « 49:6, 39 »).

La passe typographique a touché 748 lignes. Elle suit les mêmes règles qu'au lot A.

La quatrième de couverture d'Affoué est relue. La version corrigée, `couverture/quatrieme-corrige.md`, ne change que les apostrophes et la forme de deux références dans le tableau des sources. Le texte imprimé n'est pas réécrit, et les PDF de couverture n'ont pas été touchés.

## Fichiers

- `manuscrit/09-ch07-gestes-corrige.md` à `manuscrit/16-annexes-corrige.md` : les huit copies corrigées.
- `couverture/quatrieme-corrige.md` : version corrigée, que le script de couverture sait lire (vérifié).
- `corrections/corriger_lot.py` : il remplace `corriger_lot_a.py` et sert aux deux lots (`python3 corrections/corriger_lot.py A` ou `B`). Le lot A, régénéré avec ce script, donne des copies identiques octet pour octet à celles de T14.
- `corrections/releve-lot-B.md` : relevé (fichier, ligne, avant, après, règle), avec les six lignes changées de la quatrième.
- `corrections/comparaison-lot-B.html` : comparaison mot à mot générée par difflib.
- `corrections/suggestions-lot-B.md` : suggestions pour Konan, l'auteur et Affoué.
- `charte/lexique.txt` : 38 entrées ajoutées, dont les noms que Konan avait signalés comme absents (Asa, Azaria, Baalis, Thanhumeth, Jonathan, Boaz, Naomi, Ruth, Cyrus, Éphrata, Syène, etc.) et une entrée « prison » pour Jérémie 20:2. Le lexique compte 205 entrées, toutes vérifiées.
- `rapports/T14-amenan.md` : le nom du script y est mis à jour.

## Vérifications

- `controle_versets.py` sur les huit copies du lot B : 0 écart, 0 référence introuvable (229 citations conformes). La quatrième corrigée donne 1 citation conforme et 0 écart.
- Les seize copies `-corrige.md` du livre ne contiennent aucun tiret U+2014 ou U+2013 et aucun gras dans les leçons. Elles n'ont plus d'espace ordinaire devant « : ; ! ? » et ne contiennent plus « ceps ».
- `controle_versets.py --lexique` : 205 entrées, 205 vérifiées, 0 en défaut.
- spylls avec le dictionnaire classique et le lexique : il ne reste comme inconnus que des noms vérifiés dans la LSG, les classes Pandoc et les noms de fichiers d'images.
- Lecture complète des huit fichiers et de la quatrième. Les renvois entre chapitres ont été vérifiés contre les chapitres visés, dont le chapitre 12 pour Matthieu 2:17-18 et le chapitre 9 pour l'alliance nouvelle ; tous sont justes.
- Composition d'essai du livre entier depuis les seize copies, dans le dossier de travail et non dans `sortie/` : 164 pages et six marques [À COMPLÉTER] (mentions légales et avant-propos). J'ai regardé la page 161 (annexe « Qui est qui ») : le texte est correct et « en prison » apparaît bien. En revanche, une ligne du tableau est coupée en bas de page (point pour Affoué).
- Quatrième : `generer_couverture.py` lit `quatrieme-corrige.md` sans erreur (accroche en deux vers, référence, paragraphes, mentions). Le cache Python créé par cet essai a été supprimé.

## Hypothèses

- « Les ceps » est traité comme une erreur de fait, et non comme un choix de style. Le mot est absent de Jérémie 20:2 dans la LSG, Akissi l'a vérifié en T11, et le chapitre 5 dit « la prison ». La question n° 5 de `questions-auteur-lot2.md` reste ouverte pour l'auteur.
- Pour la conclusion, j'ai écrit « prisonnier à la porte de Benjamin » (le lieu de Jérémie 20:2) pour garder la structure de la phrase.
- Les espaces insécables de la quatrième sont laissées au script de couverture, qui les pose lui-même.
- « Juifs » est signalé par l'outil comme capitale de vers (Jérémie 52:28 ; 38:19) : c'est un nom de peuple, donc une fausse alerte sans écart, comme « Complaintes » au lot A.

## Points ouverts et risques

- Pour Konan ou l'auteur (`suggestions-lot-B.md`) :
  - l'âge de Jojakin, donné comme un fait au chapitre 12 alors que le chapitre 8 le laisse ouvert ;
  - « le troisième » de la conclusion, alors que le paragraphe précédent nomme quatre soutiens ;
  - quatre renvois ambigus vers « le chapitre N » de Jérémie ;
  - deux tournures à reprendre.
- Pour Affoué : appliquer `quatrieme-corrige.md`, en le copiant sur `quatrieme.md`, puis relancer le script. Il faut aussi empêcher la coupure des lignes de tableau dans les annexes.
- Pour Akissi : les seize copies sont prêtes pour la composition finale (T17). Les suggestions des deux lots restent à trancher.
- Non vérifié : l'aspect de la quatrième imprimée, puisque je n'ai pas relancé la génération des PDF de couverture, comme demandé.

## Part générée par IA

La correction n'ajoute presque aucun texte. Les seuls changements de mots sont « vers 597 », « en prison » (deux fois) et « à la porte de Benjamin ». Le texte reste celui de Konan et la présentation de la quatrième celle d'Affoué. La part générée par IA est donc élevée, comme déjà déclaré en T12 et T16.

## Suite proposée

1. Akissi tranche les suggestions des lots A et B, puis je les reporte avec `corriger_lot.py`.
2. Affoué applique la quatrième corrigée, puis compose l'intérieur depuis `manuscrit/*-corrige.md` (T17).
3. Je fais le premier tour d'épreuves sur le PDF composé (T18).
