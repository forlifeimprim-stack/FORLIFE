# Rapport T04 : feuille de style, lexique et outil de contrôle des versets

Amenan, lectrice et correctrice. 9 novembre 2026.

## Statut

TERMINÉ.

## Résumé

La feuille de style fixe l'orthographe traditionnelle, les majuscules religieuses, une forme unique de référence (« Jérémie 1:5 », nom du livre en entier, aucune abréviation) et la liste fermée des normalisations typographiques permises dans une citation de la LSG 1910. Ces normalisations sont l'accent sur les capitales, les ligatures, l'apostrophe courbe, les espaces françaises, les incises de la source mises entre parenthèses et les points de suspension en un seul caractère. Pour les capitales de début de vers : on les garde en bloc, avec un vers par ligne, et on les abaisse dans le texte courant. Aucun mot ne change.

Le lexique compte 167 entrées (personnes, rois, lieux, peuples, termes cultuels), chacune contrôlée dans le verset qu'elle cite. Il fixe notamment Achikam (pas Ahikam), Tachpanès (pas Taphnès), Carkemisch (pas Karkemisch), Récabites (pas Réchabites), Acbor, Jeconia, Néco (avec la variante « Neco » de Jérémie 46:2) et Tsadok (« Sadok » n'existe qu'en Matthieu 1:14).

L'outil `controle_versets.py` repère les citations balisées, les compare à la LSG et classe chaque citation en CONFORME, ÉCART (avec le détail mot à mot) ou RÉFÉRENCE INTROUVABLE. Il propose la bonne référence quand le texte se trouve ailleurs, contrôle aussi les renvois sans citation et vérifie le lexique. Les trois cas du fichier test sont détectés.

## Fichiers

- `charte/style.md` : feuille de style en quinze sections, dont la section 6 « Balisage des citations pour le contrôle ».
- `charte/lexique.txt` : 167 entrées, cinq champs séparés par « | » : graphie du livre, graphie du texte numérique, catégorie, référence vérifiée, remarque (homonymes, variantes, graphies à éviter).
- `outils/controle_versets.py` : contrôle des citations et du lexique. Il importe `NOMS_FR`, `charger`, `numero_livre` et `texte_verset` depuis `outils/verset.py`, qui n'a pas été modifié.
- `corrections/test-controle.md` : fichier test avec les trois cas demandés, plus un renvoi vers un mauvais verset existant, une citation non biblique et deux renvois sans citation.
- `rapports/T04-amenan.md` : ce rapport.

## Vérifications

Contrôle du fichier test (`python3 outils/controle_versets.py corrections/test-controle.md`), sortie réelle :

```
ligne 5  Jérémie 20:9  [texte]  CONFORME
ligne 9  Jérémie 1:9  [bloc]  ÉCART
    écart : remplacé : LSG « bouche », citation « langue » (après « , et toucha ma »)
ligne 13  Jérémie 29:41  [texte]  RÉFÉRENCE INTROUVABLE : Jérémie 29 s'arrête au verset 32
ligne 15  Jérémie 1:7  [texte]  ÉCART
    écart : texte absent du passage cité : « Ne les crains point , car je suis avec toi pour te délivrer » ; ce texte se trouve en Jérémie 1:8

Bilan : 1 conforme(s), 2 écart(s), 1 référence(s) introuvable(s), 0 bloc(s) non contrôlé(s), 2 référence(s) seule(s) valide(s)
code de sortie : 1
```

La citation juste (ligne 5) applique toutes les normalisations à la fois : Éternel, apostrophe courbe, cœur, capitales de vers abaissées et coupure […]. Elle sort CONFORME. La citation proverbiale sans référence est ignorée, comme prévu.

Contrôle du lexique (`python3 outils/controle_versets.py --lexique charte/lexique.txt`) : « Lexique : 167 entrées, 167 vérifiées, 0 en défaut ». Chaque graphie a d'abord été cherchée avec `verset.py --chercher`, en ne gardant que les mots entiers à la casse exacte. Un lexique piégé (graphie absente, chapitre inexistant, champs manquants) a donné trois défauts sur trois.

Essais supplémentaires sur un fichier du dossier de travail (hors projet), tous conformes à l'attendu :
- une ligature manquante et une capitale de vers non abaissée produisent des remarques de typographie, sans écart ;
- « l'éternel » en minuscule sort en ÉCART ;
- une omission sans coupure est signalée « omis sans [...] : LSG « dans le ventre de ta mère » » ;
- un bloc poétique de Jérémie 20:9 (un vers par ligne, capitales gardées) sort CONFORME ;
- un bloc sans référence sort NON CONTRÔLÉ et un nom de livre fautif (« Jérémi ») sort RÉFÉRENCE INTROUVABLE ;
- l'incise de 2 Rois 25:8 mise entre parenthèses et une plage Jérémie 1:4-5 sortent CONFORME ;
- « Voici » mis en capitale à la place de « voici » (Jérémie 1:6) sort en écart de casse ;
- des renvois inexistants dans la phrase (Jérémie 20:19, 1:25, 53) sont détectés.

Un bloc de trente-deux versets (Jérémie 36:1-32) avec un mot changé est contrôlé en une seconde, et l'écart est trouvé.

Les exemples de la feuille de style ont été passés à l'outil : quatre citations conformes, vingt-sept renvois valides. Aucun tiret cadratin ni demi-cadratin dans les quatre fichiers produits.

Non vérifié : le statut de droits de la Segond 21, de la Nouvelle Édition de Genève et de la Colombe, cité de mémoire (aucun accès réseau à ces éditeurs) ; la typographie de l'édition imprimée de 1910, que je n'ai pas pu consulter. La règle d'accent sur les capitales repose sur l'usage typographique français, pas sur cet imprimé.

## Hypothèses

- Pour les noms propres, l'accent sur la capitale initiale suit la règle de la syllabe ouverte (Éliakim, Ébed-Mélec, Évil-Merodac ; mais Elnathan, Esdras, Euphrate). Les formes les moins courantes (Ébed-Mélec, Évil-Merodac, Élischama) sont à confirmer par l'auteur s'il a une habitude d'église différente.
- Dans le récit, le terme est « sacrificateur », comme dans la LSG, plutôt que « prêtre ».
- Konan tape des espaces ordinaires avant « : ; ! ? ». Je pose les insécables lors de la passe typographique.
- À la demande d'Akissi, le nom de l'auteur s'imprime « Kouadio Koffi Élisée ». C'est noté dans `style.md` et en tête du lexique.
- Graphies de la carte de Kouamé : Carkemisch et Tachpanès figurent bien au lexique, avec les références qu'il cite (2 Chroniques 35:20, Ésaïe 10:9, Jérémie 2:16). J'ai ajouté Hiddékel (Genèse 2:14, « Tigre » est absent de la LSG) et « grande mer » (Nombres 34:6). La LSG l'écrit en minuscules : le récit garde « la grande mer », et l'étiquette « Grande mer » de la carte reste correcte, puisqu'une étiquette commence par une capitale.

## Points ouverts et risques

- Pour Akissi : `fiche-projet.md`, `livre.yaml` et la consigne voix off de `CLAUDE.md` portent encore « Elisée » sans accent. Ces fichiers ne sont pas dans mon périmètre. Il faut aussi décider si le nom s'écrit avec l'accent sur la couverture (Affoué) et dans les métadonnées (Désiré).
- Pour Affoué : les siècles se tapent `VII^e^` dans le manuscrit, et la mise en petites capitales lui revient. Elle doit aussi styler la ligne de référence finale des blocs et les classes d'encadré `.encadre` et `.application`.
- Pour Konan : l'outil ne contrôle que les citations balisées selon la section 6 de `style.md`. Une citation écrite autrement (référence placée avant la citation, guillemets droits) échappe au contrôle. Je relirai donc chaque chapitre en entier lors de la correction.
- Pour Désiré (livre audio) : les références « Jérémie 1:5 » devront être développées à l'oral (« Jérémie, chapitre un, verset cinq »). C'est à fixer dans le script audio.
- Les homonymes notés au lexique (deux Hilkija, trois Seraja, deux Guedalia, deux Paschhur, trois Sédécias) sont un risque de confusion dans le récit. Je les contrôlerai lors de la passe de cohérence.
- Mes fichiers ont été versionnés par un commit de l'équipe (241851a) pendant que je travaillais. Les dernières retouches (lexique, une phrase de `style.md`, la doc de l'outil) sont dans l'arbre de travail, sans commit de ma part.

## Part générée par IA

La feuille de style, le lexique, l'outil et le fichier test sont des documents de travail. Ils n'entreront pas dans le livre et n'ont rien à déclarer. Les graphies du lexique viennent toutes de la LSG 1910.

## Suite proposée

1. Konan lit `style.md` et `lexique.txt` avant de rédiger, et lance `controle_versets.py` sur chaque chapitre avant de le rendre.
2. Akissi valide les choix qui engagent l'auteur : orthographe traditionnelle, pas d'abréviation de référence, capitales de vers abaissées dans le texte courant, accents des noms propres. Elle les note au journal.
3. En T14 et T15, je corrige sur copie `-corrige.md` en passes séparées, avec ce relevé comme base de la vérification verset par verset.
