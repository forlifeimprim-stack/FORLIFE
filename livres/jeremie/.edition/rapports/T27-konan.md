# T27, Konan (plume) : hébreu vérifié, encadrés « Archéologie et histoire », annexes archéologique et théologique

Date : 14 novembre 2026.

## STATUT

TERMINÉ pour l'hébreu. PARTIEL pour l'archéologie : 31 marques [À VÉRIFIER : source] restent sur des dates, des numéros d'inventaire et des lectures d'inscriptions, faute d'accès au réseau.

## RÉSUMÉ

1. Hébreu. Les 52 explications hébraïques des chapitres 1 à 12 ont été reprises avec `outils/hebreu.py` : mots du WLC, numéros de Strong, et dérivations lues dans `sources/hebreu/HebrewStrong.xml`. Toutes les marques [À VÉRIFIER : dictionnaire hébreu imprimé] sont retirées (il en reste 0), et les translittérations suivent celles de l'outil. Corrections faites :
   - *bôʼr* (Jérémie 2:13) et *bôwr* (Jérémie 38:6) sont deux formes voisines et non le même mot (ch. 3 et 10) ;
   - Jérémie 22:16 emploie le nom *daʻath* et non le verbe *yâdaʻ* (ch. 2) ;
   - Jérémie 29:13 emploie deux verbes, *bâqash* et *dârash* (ch. 8) ;
   - *nâcham* remplace *niham* (ch. 4) ; *bâgôwd* (Jérémie 3:10) et *bâgad* (Jérémie 3:8) sont distingués, avec *sheqer* pour « avec fausseté » (ch. 3).
   Affirmations supprimées, faute de confirmation : le même mot hébreu en 1 Samuel 22:1 (ce livre n'est pas téléchargé en hébreu), « pardonner » réservé à Dieu, le lien entre « nouveau » et la lune nouvelle. Ajouts confirmés par l'outil : *pâthâh* revient en Jérémie 20:10, *shûwb* est employé quatre fois en Jérémie 15:19, *bânâh* se trouve derrière « jouir du bonheur » en Jérémie 12:16, et quatre verbes de l'appel figurent en Jérémie 42:10. Le jeu de mots *shâqêd* / *shâqad* (Jérémie 1:11-12) est traité au chapitre 2, avec la dérivation donnée par Strong et son retour en Jérémie 31:28 et 44:27.
2. Archéologie. Six encadrés `::: encadre` « Archéologie et histoire » (191 à 248 mots) sont placés dans la section d'étude, avant « Le fil de Jérémie 1:10 » :
   - ch. 5 : amulettes de Ketef Hinnom ;
   - ch. 6 : bulle de Guemaryahou, fils de Shaphan, et bulle « Berekhyahou », dont l'authenticité est contestée et sur laquelle le livre ne s'appuie pas ;
   - ch. 8 : chronique babylonienne de 597 ;
   - ch. 10 : lettres de Lakis, bulles de Yehoukal et de Guedalyahou, fils de Pashhour ;
   - ch. 11 : couches de destruction, bulle de Guedalyahou à Lakis, tablette de Nabû-sharrussu-ukîn, avec le découpage discuté de Jérémie 39:3 ;
   - ch. 12 : Tell Defenneh et tablettes des rations de Jojakin.
   Chaque encadré dit ce qui a été trouvé, où, par qui, ce que la découverte montre et ce qu'elle ne montre pas. Aucune citation d'auteur moderne.
3. Annexes, à la fin de `16-annexes-corrige.md` :
   - « Ce que l'archéologie a mis au jour » : tableau à cinq colonnes, 12 lignes, dans un bloc `::: tableau-archeologie` ;
   - « Repères théologiques » : six thèmes de 302 à 326 mots, avec intertitres de niveau 3. Ils exposent les lectures sans trancher et renvoient par une marque [À COMPLÉTER PAR L'AUTEUR] aux questions 2, 3, 4, 8 et 10.
4. `questions-auteur-etude.md` : la question 6 est réglée, et les questions 13 à 16 sont ajoutées (translittération lisible à voix haute, repères théologiques, vérifications archéologiques).

L'avant-propos n'a pas été touché.

## FICHIERS

- `manuscrit/03-ch01` à `manuscrit/14-ch12` (fichiers -corrige.md) : hébreu ; encadrés dans 07, 08, 10, 12, 13 et 14
- `manuscrit/16-annexes-corrige.md` (deux sections ajoutées en fin de fichier)
- `manuscrit/questions-auteur-etude.md`
- Scripts et essais hors dépôt : `/tmp/claude-0/-home-user-FORLIFE/ef469a51-b9ee-55ef-a414-9b10ccc34b69/scratchpad/t27/` (hebreu_maj.py, encadrés, essai-ch06.pdf)
- Aucun commit.

## VÉRIFICATIONS

- `controle_versets.py` sur les 13 fichiers modifiés : 0 écart, 0 référence introuvable. Un écart sur Daniel 2:21 (mot « qui » omis) est apparu dans les annexes : il est corrigé.
- Tirets U+2014 et U+2013 : 0 partout (comptage Python).
- Marques [À VÉRIFIER] restantes : chapitres 5 : 1 ; 6 : 2 ; 8 : 2 ; 10 : 3 ; 11 : 4 ; 12 : 4 ; annexes : 12. Total : 28 dans le livre, plus 3 citations de la marque dans `questions-auteur-etude.md`. Il ne reste aucune marque hébraïque.
- Composition du chapitre 6 et page 16 regardée en image : l'encadré s'affiche avec son titre en petites capitales, lisible.

## HYPOTHÈSES

- Les faits archéologiques viennent de mes connaissances, sans vérification en ligne possible. J'ai marqué [À VÉRIFIER : source] tout ce qui est daté, chiffré ou lu sur une inscription et dont je ne suis pas certain. Les attributions générales sont présentées comme probables ou discutées : fouilleurs, sites, Lakis et Azéka, chronique de 597, rations de Jojakin.
- « Une page par thème » : je l'ai compris comme une longueur d'environ une page. Le saut de page éventuel revient à la maquette.

## POINTS OUVERTS ET RISQUES

- Pour Affoué : deux nouveaux blocs à mettre en page, `tableau-ordre` (T23) et `tableau-archeologie` (cinq colonnes, cellules longues), ainsi que le saut de page éventuel avant chaque repère théologique.
- Pour Amenan (T24) : vérifier l'harmonie des translittérations à signes diacritiques (ʼ, ʻ, ç, ṭ, ᵉ) avec les polices du livre et de l'EPUB, et leur lecture pour l'audio (question 14).
- Crédit à imprimer pour les données hébraïques : « Open Scriptures Hebrew Bible Project » (CC BY 4.0), signalé par Akissi le 14 novembre. Il n'est pas encore dans le livre.
- Archéologie : les identifications de personnages (Guemaria, Jucal, Guedalia, Sarsekim, Baruc) restent des hypothèses présentées comme telles. La bulle « Berekhyahou » est explicitement écartée.

## PART GÉNÉRÉE PAR IA

À déclarer : les six encadrés « Archéologie et histoire » (environ 1 330 mots), le tableau des découvertes et son introduction (environ 700 mots) et les six « Repères théologiques » (environ 1 870 mots) ont été rédigés entièrement par la plume. Les explications hébraïques ont été réécrites d'après les dictionnaires de Strong et BDB.

## SUITE PROPOSÉE

Vérification des 28 marques archéologiques sur une source à jour (catalogues de musées, rapports de fouille), puis réponses de l'auteur aux questions 2 à 16, relecture d'Amenan (T24), recomposition (T25), EPUB (T26).
