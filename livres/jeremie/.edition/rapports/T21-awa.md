# Rapport T21 : traduction anglaise d'évaluation (quatrième et chapitre 2)

Awa (traduction), 13 novembre 2026.

Internal evaluation translation, not for publication.

## STATUT

TERMINÉ, comme traduction interne d'évaluation. Une traduction publiable est BLOQUÉE : aucune cession écrite des droits de traduction n'existe dans `droits/` (le projet de contrat laisse la langue de traduction à compléter et la case non cochée).

## RÉSUMÉ

Le glossaire anglais fixe le titre proposé (« The Life and Prophetic Ministry of the Prophet Jeremiah »), les rubriques, une cinquantaine de noms propres en graphie KJV et les termes récurrents. La quatrième de couverture et le chapitre 2 sont traduits en gardant le balisage Markdown (blocs `:::`, ancre `{#appel}`, encadré). Toutes les citations bibliques sont le texte KJV exact du même passage. Le commentaire de l'auteur, écrit sur la LSG, s'écarte de la KJV en quelques endroits, surtout Jérémie 1:12 (« je veille sur ma parole » contre « I will hasten my word ») : quinze écarts sont consignés avec le choix retenu, et une seule phrase a été omise (la glose « le septentrion, c'est le nord », sans objet en anglais).

## FICHIERS

- `charte/glossaire-en.md` (nouveau).
- `numerique/traduction-en/back-cover.md` (nouveau, 510 mots).
- `numerique/traduction-en/chapter-02.md` (nouveau, 3 130 mots ; original 3 052 mots).
- `corrections/doutes-traduction.md` (nouveau).
- Originaux non modifiés.

## VÉRIFICATIONS

- `ls droits/` et `grep -n traduction droits/projet-contrat-edition.md` : pas de cession signée.
- `diff couverture/quatrieme.md couverture/quatrieme-corrige.md` : identiques ; la version relue par Amenan est celle traduite.
- `python3 outils/verset.py --kjv` sur les 19 passages cités, puis un script de contrôle (hors dépôt) qui vérifie chaque citation contre le verset cité : 40 citations conformes, une alerte qui était un faux positif (référence portant sur la phrase suivante).
- `pandoc --from markdown chapter-02.md -t html` : les 5 blocs `:::` sont reconnus.
- Contrôle des tirets cadratin et demi-cadratin (comptage Python) : 0 dans les quatre fichiers.
- Trois passes faites : traduction, révision contre l'original, lecture de l'anglais seul.
- Non vérifié : rendu dans `composer.py` ou l'EPUB (non demandé ; les libellés de rubrique y sont en français).

## HYPOTHÈSES

- Traduction de `04-ch02` comme le demande la tâche, alors que `fiche-projet.md` parle du « chapitre 1 ».
- Anglais britannique ; « you » pour le tutoiement des leçons, des questions et de la prière ; « dungeon » pour la citerne et « scroll » pour le rouleau dans le récit.

## POINTS OUVERTS ET RISQUES

- Droits : signer le contrat d'édition avec la langue anglaise avant toute publication.
- Jérémie 1:12 : l'auteur doit dire s'il veut une note sur le jeu de mots hébreu amandier / veiller, ou une autre version anglaise que la KJV.
- Forme anglaise du nom de l'épouse de l'auteur dans la biographie.
- `outils/composer.py` injecte « Leçons pour aujourd'hui », « Pour méditer », « Prière » : une édition anglaise demanderait des libellés anglais (Affoué ou Désiré).
- L'outil KJV rend « Lord » là où la KJV imprimée met LORD en petites capitales.

## PART GÉNÉRÉE PAR IA

Toute la traduction : glossaire, quatrième de couverture et chapitre 2 en anglais (hors citations KJV, domaine public). L'accroche et la présentation de la quatrième étaient déjà générées par IA en français.

## SUITE PROPOSÉE

Faire relire `chapter-02.md` par un lecteur anglophone et faire trancher par l'auteur les points `[À VÉRIFIER]` de `corrections/doutes-traduction.md` avant d'étendre la traduction à d'autres chapitres.
