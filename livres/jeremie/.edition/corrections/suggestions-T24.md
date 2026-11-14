# Suggestions T24 (ajouts T22, T23, T27, avant-propos, quatrième)

Amenan, 14 novembre 2026. Rien de ce qui suit n'a été appliqué. Les numéros de ligne sont ceux des copies `manuscrit/*-corrige.md` après T24. Si une suggestion est retenue, Konan ou moi l'appliquons directement dans la copie, avec une ligne de relevé. `corriger_lot.py` ne doit plus être relancé.

## Translittération de l'hébreu (à trancher avec l'auteur, question 14)

Les 75 formes hébraïques du livre suivent toutes le même système, celui de `hebreu.py` : *dâbâr*, *kôhên*, *nâbîyʼ*, *shâqêd* et *shâqad*, *bôʼr* et *bôwr*, *ʼêzôwr*, *çêpher*. Chaque mot n'a qu'une forme. C'est exact et vérifiable, mais trois limites demeurent.

- Lecture : des formes comme *ʼêzôwr*, *çâbîyb* ou *m^e^gillâh çêpher* arrêtent le lecteur non spécialiste. Elles seront aussi difficiles à dire pour la voix off (Désiré). Une transcription simplifiée, sans signes (*ezor*, *sabib*, *meguilla sefer*), serait plus lisible. Il faudrait alors établir une table de correspondance unique, à valider avant de toucher au texte.
- Polices : EB Garamond, dans le sous-ensemble « latin » installé, n'a ni « ṭ » (*bâṭach*, *nâṭaʻ*, *môwṭâh*, *qâṭar*), ni « ă » (*ʼachărîyth*). Affoué doit ajouter le sous-ensemble « latin-ext » des polices (Fontsource), sinon le PDF prendra une police de secours pour ces lettres. J'ai déjà remplacé « ᵉ », absent de toutes les polices du livre, par un « e » en exposant.
- Couverture : la piste C porte les six verbes hébreux. Sa graphie doit suivre la décision qui sera prise ici.

## Renvois ambigus « au chapitre N » (chapitre de Jérémie ou du livre ?)

Même remarque qu'en T14 et T15 : dans les sections d'étude, « au chapitre 3 », « au chapitre 12 », « au chapitre 27 » désignent des chapitres de Jérémie, alors que le livre a lui aussi des chapitres 3 et 12. Je propose « en Jérémie 3 », etc. :

- 05-ch03-josias-corrige.md, ligne 162 : « Au chapitre 3, ce verbe sert… » ;
- 07-ch05-solitude-corrige.md, ligne 182 : « Au chapitre 12, Dieu annonce… » ;
- 09-ch07-gestes-corrige.md, ligne 137 : « Au chapitre 27… Au chapitre 28… » ;
- 14-ch12-egypte-corrige.md, ligne 143 : « La réponse de l'histoire est donnée par le chapitre 52. »

## Cohérence et précision

- Ézéchiel. Trois formules coexistent : « Son livre est laissé de côté ici » (chapitres 1, 5, 8) et « ce prophète, contemporain de Jérémie, est étudié à part » (11-ch09-consolation-corrige.md, ligne 186). La seconde laisse entendre qu'une autre étude existe. Proposition : « Son livre est laissé de côté ici », partout. Si l'auteur prépare une étude d'Ézéchiel (il dit l'avoir lu près de trois fois), on peut au contraire l'annoncer clairement dans l'avant-propos.
- Bulles d'Eilat Mazar (12-ch10-citerne-corrige.md, ligne 176, et annexe, ligne 143). Le texte donne les formes de l'inscription (« Yehoukal, fils de Shelemyahou », « Guedalyahou, fils de Pashhour ») sans le nom de la Louis Segond. Proposition : ajouter « (dans la Louis Segond : Jucal, fils de Schélémia, et Guedalia, fils de Paschhur) », pour que le lecteur fasse le lien sans effort.
- Annexe « remis dans l'ordre », ligne 81 : parenthèses imbriquées, « non daté (pour les Philistins, seulement « avant que Pharaon frappât Gaza » (Jérémie 47:1)) ». Proposition : « non daté ; pour les Philistins, seulement « avant que Pharaon frappât Gaza » (Jérémie 47:1) ».
- « (Jérémie 50 à 51) » (annexe, ligne 204, comme au chapitre 12) : proposition « (Jérémie 50 et 51) ».
- *Discoveries in the Judaean Desert* (annexe, ligne 214) : ce titre de collection doit être en italique, mais il se trouve dans une marque [À VÉRIFIER], à laquelle je n'ai pas touché. À reprendre quand la marque sera levée.

## Quatrième de couverture (`couverture/quatrieme.md`)

La phrase nouvelle est correcte. La suivante commence sans déterminant : « Leçons pour aujourd'hui et questions pour l'étude en groupe concluent chaque chapitre. » Proposition : « Des leçons pour aujourd'hui et des questions pour l'étude en groupe concluent chaque chapitre. » En toute rigueur, c'est la prière qui conclut le chapitre. Les espaces insécables sont posées par le script de couverture.

## Avant-propos

Le témoignage n'a pas été touché (mots de l'auteur, réécrits par Akissi). Je n'y ai posé que les espaces insécables. La note « Comment le lire » annonce « cinq questions pour l'étude en groupe » : les douze sections en ont bien cinq.
