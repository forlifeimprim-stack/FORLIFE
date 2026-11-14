# T22, Konan (plume) : témoignage de l'avant-propos et sections d'étude des chapitres 1 à 6

Date : 13 et 14 novembre 2026.

## STATUT

TERMINÉ (sous réserve de validation par l'auteur du témoignage, des positions doctrinales et des explications hébraïques).

## RÉSUMÉ

Avant-propos : la marque du témoignage est remplacée par un paragraphe à la première personne, rédigé à partir des seuls mots de l'auteur du 13 novembre : ministère rattaché à Jérémie 1:10, qu'il veut mieux cerner, et plus de six lectures de Jérémie et d'Ézéchiel, auxquelles le Seigneur l'a conduit. Aucun fait ajouté. Le paragraphe est encadré par `<!-- témoignage à valider par l'auteur -->`. Une phrase ajoutée dans « Comment le lire » annonce la section d'étude. La marque des remerciements est conservée.

Chapitres 1 à 6 : chaque fichier corrigé reçoit, juste avant `::: lecons`, une section « Pour aller plus loin : étude » avec cinq intertitres de niveau 3 (passage à la loupe, mots clés, références croisées, fil de Jérémie 1:10, cinq questions d'étude). Rien d'autre n'a été modifié. Passages étudiés : Jérémie 1:1-3 ; 1:4-19 ; 2:1-13 ; 7:1-15 (et le plan de Jérémie 26) ; 20:7-18 ; 36. Le chapitre 2 développe les six verbes de Jérémie 1:10 et leurs reprises (Jérémie 18:7-10 ; 24:6 ; 31:28 ; 42:10 ; 45:4).

## FICHIERS

- `manuscrit/01-avant-propos-corrige.md` (témoignage, annonce de la section d'étude)
- `manuscrit/03-ch01-anathoth-corrige.md` à `manuscrit/08-ch06-rouleau-corrige.md` (sections d'étude)
- `manuscrit/questions-auteur-etude.md` (nouveau : 7 questions)
- Essai de composition (hors dépôt) : `/tmp/claude-0/-home-user-FORLIFE/ef469a51-b9ee-55ef-a414-9b10ccc34b69/scratchpad/t22/compo/essai-ch02.pdf` (22 pages)
- Originaux sans suffixe : intacts. Aucun commit.

## VÉRIFICATIONS

- Toutes les références et citations nouvelles ont été lues avec `outils/verset.py` avant rédaction.
- `python3 outils/controle_versets.py` sur chaque fichier : 0 écart, 0 référence introuvable partout (avant-propos 1 conforme ; ch. 1 : 30 ; ch. 2 : 40 ; ch. 3 : 58 ; ch. 4 : 45 ; ch. 5 : 59 ; ch. 6 : 42). Seule remarque : « Complaintes » (typographie) au chapitre 3, ligne antérieure à T22.
- Tirets U+2014 et U+2013, comptage Python : 0 dans les fichiers 01 à 08 corrigés.
- Mots ajoutés (Python, `split`, intertitres compris) : ch. 1 : 968 ; ch. 2 : 998 ; ch. 3 : 883 ; ch. 4 : 893 ; ch. 5 : 964 ; ch. 6 : 849. Avant-propos : environ 120.
- Cinq intertitres `###` présents dans chacun des six chapitres (`grep -c`).
- Typographie des ajouts alignée sur les fichiers corrigés (apostrophe ’, insécables avant « : ; ! ? » et dans les guillemets).
- Composition : `python3 outils/composer.py manuscrit/04-ch02-appel-corrige.md --sortie <scratchpad>/t22/compo --nom essai-ch02`. Pages 15 et 17 regardées en image : le titre de section s'affiche en gras sans empattement, les intertitres de niveau 3 en italique au corps du texte, lisibles, listes numérotées et puces correctes, marques [À VÉRIFIER] visibles.

## HYPOTHÈSES

- « Et surtout », dans les mots de l'auteur, est rendu par « la seconde raison compte plus encore pour moi ».
- Translittérations simples à la française (*ch* pour le son « che ») ; chaque explication hébraïque se termine par `[À VÉRIFIER : dictionnaire hébreu imprimé]`.
- Questions d'étude au tutoiement, comme « Pour méditer ».
- Ézéchiel n'est que mentionné (Ézéchiel 1:3 au ch. 1, Ézéchiel 3:3 au ch. 5).

## POINTS OUVERTS ET RISQUES

- Trois positions doctrinales laissées à l'auteur, marquées dans le texte et listées dans `questions-auteur-etude.md` : reprise de Jérémie 1:10 par un ministère d'aujourd'hui (ch. 2), Dieu qui « se repent » (ch. 4), dictée et inspiration de l'Écriture (ch. 6).
- Hébreu : environ vingt-cinq explications à faire vérifier dans un dictionnaire imprimé. Celles qui me paraissent les moins sûres : *paqad* en Jérémie 1:10, la correspondance des verbes « ruiner » et « détruire » avec *heevid* et *haras*, *bor* en Jérémie 38:6, le verbe « bâtir » derrière « jouir du bonheur » en Jérémie 12:16.
- Le rapprochement *chaqed* / *choqed* (amandier, veiller) figure dans l'étude alors que le corps du chapitre 2 s'en abstient : décision à prendre par l'auteur.
- Pour Affoué (maquette) : l'intertitre de niveau 3 a peu d'espace avant et n'en a pas après ; dans une section très découpée, la hiérarchie reste faible. Un léger espacement ou un petit gras pourrait aider. Je n'ai pas touché à la composition.
- Pour Amenan (T24) : relire les gloses entre guillemets (sens des mots hébreux) qui ne sont pas des citations bibliques.

## PART GÉNÉRÉE PAR IA

À déclarer : les six sections d'étude (environ 5 550 mots, rédigés en entier par la plume à partir du texte biblique et des chapitres existants), la phrase d'annonce de l'avant-propos et la formulation du témoignage (fond fourni par l'auteur, phrases rédigées par la plume). Passages rédigés de moi-même : tout le contenu des sections « Pour aller plus loin : étude », y compris les plans, les explications de mots, les lignes d'explication des références, les paragraphes « Le fil de Jérémie 1:10 » et les trente questions.

## SUITE PROPOSÉE

Validation par l'auteur du témoignage et des réponses aux questions de `questions-auteur-etude.md`, puis T23 (chapitres 7 à 12, même gabarit), relecture d'Amenan (T24), recomposition (T25).
