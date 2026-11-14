# Rapport T24 : relecture des ajouts (études, archéologie, repères théologiques, avant-propos, quatrième)

Amenan, lectrice et correctrice. 14 novembre 2026.

## Statut

TERMINÉ.

## Résumé

J'ai relu en entier tout ce qui a été ajouté depuis T18. Le périmètre est tiré de git (diff depuis le commit 68ae281) : 843 lignes, environ 15 800 mots. Il comprend :
- le témoignage et la note de l'avant-propos ;
- les douze sections « Pour aller plus loin : étude » ;
- les six encadrés « Archéologie et histoire » ;
- les trois nouvelles annexes ;
- la phrase nouvelle de la quatrième de couverture.

Le texte est propre : aucune faute d'orthographe ni d'accord, et les noms bibliques sont conformes au lexique. Les dates sont cohérentes avec la chronologie existante (vers 627, 605, 597, 594 ou 593, 587 ou 586, 561 ou 560).

Corrections faites en place dans les copies corrigées (relevé dans `corrections/releve-T24.md`) :
- deux siècles mis en chiffres romains (VII^e^, VI^e^, XX^e^) ;
- un mot cité mis entre guillemets (« peut-être ») ;
- un « au-dedans » ;
- une citation de Daniel 2:21 qui commençait au milieu d'une relative ;
- dix « ᵉ » remplacés par un « e » en exposant, car aucune police du livre n'a ce caractère ;
- 41 lignes d'espaces insécables, surtout dans « 1 Rois » ou « 2 Chroniques » et dans le témoignage.

Aucun mot du témoignage n'a changé.

## Fichiers

- `manuscrit/*-corrige.md` : quatorze copies modifiées en place. La version d'avant est gardée dans `corrections/avant-T24/`.
- `corrections/corriger_T24.py` : applique les corrections à la copie actuelle, puis produit le relevé et la comparaison. Il ne s'exécute qu'une fois : il refuse de tourner si `avant-T24/` existe.
- `corrections/corriger_lot.py` : une mise en garde est ajoutée. Ce script repart des originaux ; le relancer effacerait les ajouts de T22 à T27, il ne faut donc plus l'exécuter.
- `corrections/releve-T24.md` : relevé (fichier, ligne, avant, après, règle), 33 lignes.
- `corrections/comparaison-T24.html` : comparaison mot à mot, générée par difflib.
- `corrections/suggestions-T24.md` : translittération, renvois ambigus, cohérence, quatrième.
- `charte/lexique.txt` : six noms bibliques ajoutés et vérifiés (Buzi, Adullam, Éphèse, Jucal, Schephathia, Matthan), soit 211 entrées vérifiées. Les noms modernes et les formes d'inscriptions retenues sont listés en commentaire.
- `charte/style.md`, § 9 : la règle de translittération est mise à jour pour refléter l'usage de `hebreu.py` depuis T27 ; la forme simplifiée reste en réserve si l'auteur la choisit (question 14).
- `rapports/T24-amenan.md` : ce rapport.

## Vérifications

- `controle_versets.py` sur les seize copies : 0 écart, 0 référence introuvable, 580 citations conformes. La quatrième donne 1 citation conforme et 0 écart.
- Tirets U+2014 et U+2013 : 0 dans les seize copies et dans la quatrième. Le caractère « ᵉ » n'apparaît plus.
- `controle_versets.py --lexique` : 211 entrées, 211 vérifiées.
- spylls sur les ajouts : il ne reste comme inconnus que les noms modernes, les formes d'inscriptions et les translittérations en italique.
- Le contrôle typographique des ajouts ne relève ni apostrophe droite dans le texte imprimé, ni guillemets droits, ni abréviation de livre.
- Chaque section d'étude compte bien cinq questions, comme l'annonce l'avant-propos.
- Les 75 formes hébraïques ont été inventoriées : une seule forme par mot, toutes du système de `hebreu.py`.
- Couverture des polices (fontTools) : les caractères ᵉ (U+1D49), ṭ (U+1E6D) et ă (U+0103) manquent dans EB Garamond, sous-ensemble latin.
- Pandoc rend `*g^e^ʼullâh*` en italique avec un « e » en exposant.
- Les faits archéologiques que je connais concordent avec le texte : Ketef Hinnom 1979, chronique BM 21946 et 2 Adar de l'an 7, lettres de Lakis 1935 et 1938, bulles de Mazar 2005 et 2008, BM 114789 déchiffrée en 2007, Weidner 1939, Petrie 1886. Ce n'est pas une vérification sur source : les 28 marques [À VÉRIFIER] restent en place, comme demandé.
- Non vérifié : je n'ai pas recomposé le PDF (T25, Affoué).

## Marques de travail présentes (non touchées)

41 marques au total.
- 28 [À VÉRIFIER : …], toutes archéologiques ou textuelles :
  - chapitre 5, ligne 173 ;
  - chapitre 6, lignes 148 et 150 ;
  - chapitre 8, lignes 131 et 133 ;
  - chapitre 10, ligne 174 (deux) et ligne 176 ;
  - chapitre 11, lignes 164 (deux), 166 et 168 ;
  - chapitre 12, ligne 169, et ligne 171 (trois) ;
  - annexes, lignes 139 à 149 (dix), 212 et 214.
- 12 [À COMPLÉTER PAR L'AUTEUR] :
  - avant-propos, remerciements (ligne 31) ;
  - chapitre 2, ligne 175 ; chapitre 4, ligne 153 ; chapitre 6, ligne 161 ; chapitre 7, ligne 160 ; chapitre 8, ligne 146 ; chapitre 9, ligne 201 ;
  - annexes, lignes 164, 176, 184, 196 et 216 (questions 2, 8, 10, 3 et 4).
- 1 [À COMPLÉTER : prix public] dans la quatrième.

La liste détaillée, ligne par ligne, s'obtient avec `grep -n "\[À "` sur les copies. Les marques des mentions légales sont dans `livre.yaml`. Note typographique : les nouvelles marques écrivent « L'AUTEUR » avec l'apostrophe ’, l'ancienne avec l'apostrophe droite. Je n'y ai pas touché.

## Hypothèses

- Translittération : `hebreu.py` est la référence depuis T27, et je ne l'ai pas changée. La remplacer par une forme simplifiée serait une décision d'auteur (question 14), qui toucherait 75 formes et la couverture.
- Remplacer « ᵉ » par « ^e^ » est un choix de typographie et non de translittération : le texte se lit de la même manière.
- Les formes des inscriptions (« Guedalyahou », « Pashhour ») restent distinctes des noms de la Louis Segond : elles sont citées entre guillemets comme lectures d'objets.

## Points ouverts et risques

- Pour Affoué (T25) :
  - ajouter le sous-ensemble « latin-ext » d'EB Garamond (« ṭ », « ă ») ;
  - styler les nouveaux intertitres de niveau 3 et les deux tableaux à cinq colonnes ;
  - vérifier le rendu des exposants dans les italiques.
- Pour Désiré (EPUB, audio) : les translittérations à signes ne se lisent pas telles quelles. Pour l'audio, il faudra une forme dite ; c'est la question 14.
- Pour l'auteur, via Akissi : les 12 marques [À COMPLÉTER PAR L'AUTEUR] et la question 14. Les 28 marques [À VÉRIFIER] bloquent l'impression tant qu'elles n'ont pas été vérifiées sur les publications des fouilleurs ou des musées.
- Le crédit « Open Scriptures Hebrew Bible Project » (CC BY 4.0) n'est toujours pas dans le livre (point de T27). Il faut l'ajouter aux mentions ou aux annexes ; cela revient à Akissi ou à Affoué.

## Part générée par IA

Les ajouts relus sont un texte généré par IA (Konan, et Akissi pour le témoignage), déjà déclarés en T22, T23 et T27. Ma correction n'ajoute que trois mots (« c'est », « qui ») et une paire de guillemets.

## Suite proposée

1. Akissi tranche les suggestions et transmet la question 14 à l'auteur.
2. Affoué recompose (T25) avec le sous-ensemble « latin-ext ».
3. Second tour d'épreuves sur le nouveau PDF, centré sur les sections d'étude, les tableaux et les caractères hébreux.
