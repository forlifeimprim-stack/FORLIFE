# Rapport T11 : rédaction du lot 2 (chapitres 5 à 8)

Konan (plume), 9 novembre 2026. Travail interrompu par la limite d'utilisation, puis repris sur consigne d'Akissi.

## STATUT

TERMINÉ. Quatre chapitres rédigés selon le plan détaillé et les décisions T09 ; contrôle des versets propre sur chacun ; zéro tiret cadratin ou demi-cadratin ; essai de composition regardé.

## RÉSUMÉ

Les chapitres 5 à 8 suivent le déroulé, les encadrés, les versets clés en bloc, les leçons et les questions du plan. Le récit est à la troisième personne, le tutoiement est réservé aux leçons et aux questions, le « nous » sert aux transitions. Chaque chapitre se termine par une prière brouillon à la première personne, close par « Au nom de Jésus. Amen. ». Les positions doctrinales ne sont pas tranchées : le texte expose ce que dit la Bible, et chaque question est consignée avec sa formulation neutre dans `manuscrit/questions-auteur-lot2.md`. Aucune marque [À COMPLÉTER] ni [À VÉRIFIER] ne figure dans les chapitres.

Écarts au plan, tous justifiés par le texte LSG :

- chapitre 5 : la LSG 1910 ne parle pas de « ceps » en Jérémie 20:2, mais de « la prison qui était à la porte supérieure de Benjamin ». Le texte dit « prison », et l'encadré s'intitule « Paschhur, inspecteur en chef » au lieu de « Paschhur, les ceps et la police du temple ». La charte de voix (§ Registre) cite aussi les ceps comme exemple : à corriger par son propriétaire si on veut éviter la confusion ;
- chapitre 7 : la date « vers 594 ou 593 av. J.-C. » est omise (repère non usuel) ; seule la date biblique est donnée ;
- chapitre 8 : les envoyés de Jérémie 29:3 ne sont pas nommés (graphie d'« Eleasa » absente du lexique, homonymes) ;
- épigraphes choisies hors des versets clés pour éviter les doublons : Jérémie 12:3, 36:28, 35:16 et 29:14.

## FICHIERS

- `manuscrit/07-ch05-solitude.md` : « Un feu dans les os : la solitude du prophète » `{#solitude}`
- `manuscrit/08-ch06-rouleau.md` : « Le rouleau dans le brasier » `{#rouleau}`
- `manuscrit/09-ch07-gestes.md` : « La parole en gestes : de la ceinture au joug de fer » `{#gestes}`
- `manuscrit/10-ch08-lettre.md` : « Une lettre pour Babylone » `{#lettre}`
- `manuscrit/questions-auteur-lot2.md` : 9 positions doctrinales, 3 questions de lecture, 19 faits incertains ou divergents, et les points à valider
- `rapports/T11-konan.md` : ce rapport
- Hors du livre (scratchpad) : `relire_lot2.py` (tirets, mots et tournures interdits, apostrophes droites, gras, comptage), `phrases_longues.py`, et l'essai de composition `essai/essai-ch05.pdf`, `essai/essai-ch05-ecran.pdf`, `essai/p-07.png` à `p-17.png`, dans /tmp/claude-0/-home-user-FORLIFE/ef469a51-b9ee-55ef-a414-9b10ccc34b69/scratchpad/

Les titres font tous moins de 55 signes (44, 26, 51 et 24) : aucun attribut `court` n'est nécessaire. Le numéro de chapitre n'est pas tapé ; la composition le génère (`graphique.md`).

## VÉRIFICATIONS

1. `python3 outils/controle_versets.py manuscrit/<fichier>` (relevé final) :

| Fichier | Conformes | Écarts | Introuvables | Non contrôlés | Références seules valides |
|---|---|---|---|---|---|
| 07-ch05-solitude.md | 53 | 0 | 0 | 0 | 21 |
| 08-ch06-rouleau.md | 38 | 0 | 0 | 0 | 26 |
| 09-ch07-gestes.md | 36 | 0 | 0 | 0 | 29 |
| 10-ch08-lettre.md | 33 | 0 | 0 | 0 | 33 |

Chaque verset a été lu avec `outils/verset.py` avant d'être cité ou résumé. Seule remarque typographique restante : « Juifs » signalé comme capitale de vers dans Jérémie 52:28, ce qui est un faux positif (nom de peuple).

2. Tirets : comptage Python des caractères U+2014 et U+2013 dans les quatre fichiers : 0 et 0 partout.

3. Mots et tournures interdits, apostrophes droites, gras multiples, marques de travail : `relire_lot2.py` donne 0 problème sur les quatre fichiers (citations bibliques exclues de la recherche des tournures). Relecture à la main en plus, qui m'a fait réécrire une douzaine de phrases de type « pas X, Y », deux questions rhétoriques suivies de leur réponse et quelques groupes de trois.

4. Longueurs (mots comptés par script sur le fichier entier, citations, encadrés, leçons, questions et prière compris, balisage exclu) :

| Chapitre | Mots | Cible | Écart |
|---|---|---|---|
| 5 | 3 523 | 3 300 | +6,8 % |
| 6 | 2 882 | 3 100 | −7,0 % |
| 7 | 3 026 | 3 300 | −8,3 % |
| 8 | 2 782 | 3 000 | −7,3 % |
| Lot 2 | 12 213 | 12 700 | −3,8 % |

Tous dans la tolérance de 10 %.

5. Composition : `python3 outils/composer.py manuscrit/07-ch05-solitude.md --sortie <scratchpad>/essai --nom essai-ch05` donne 20 pages (chapitre 5 en pages 7 à 17). Messages : « 4 marque(s) [À COMPLÉTER] », qui viennent de la page de mentions légales (`livre.yaml`), pas du chapitre ; aucun tiret signalé ; pas d'alerte de titre courant. Pages regardées : p. 7 (étiquette, titre sur deux lignes, fleuron, épigraphe, premier intertitre), p. 14 (encadré Paschhur sur fond gris, intertitre, début du bloc poétique en vers), p. 17 (fin des leçons, questions numérotées, prière en italique). Rendu conforme à la maquette. Composé seul, le chapitre porte l'étiquette « Chapitre 1 » : c'est normal, la numérotation suit l'ordre des fichiers.

6. Non vérifié : aucune vérification en ligne n'a été nécessaire, puisque tout repose sur la LSG locale. Les rapprochements culturels n'ont pas été soumis à un lecteur ivoirien.

## HYPOTHÈSES

- Le mot « rouleau » est employé dans le récit du chapitre 6 (admis par le lexique), jamais dans une citation.
- Le seul repère de date moderne employé est celui de la charte : Carkemisch vers 605, déportation de Jojakin vers 597 av. J.-C.
- Les leçons commencent par une courte phrase en gras (une par paragraphe), pour la lecture sur téléphone. Le lot 1 écrit les siennes sans gras : à harmoniser à la correction (T13).

## POINTS OUVERTS ET RISQUES

Passages les plus fragiles, à relire en priorité :

1. Chapitre 5, Jérémie 8:18 à 9:2 : la voix qui pleure est lue comme celle du prophète, ce que le texte ne dit pas expressément (la formulation le signale).
2. Chapitre 5, lecture de Jérémie 15:19 (« séparer le précieux du vil ») présentée comme une compréhension possible ; affirmation générale sur l'origine du mot « confessions ».
3. Chapitre 5, leçon 3 : la phrase sur le désir de mourir invite à en parler à Dieu et à une personne de confiance ; l'auteur peut vouloir y ajouter l'aide médicale.
4. Chapitre 6 : les liens de personnes (Guemaria et Achikam, Elnathan, Seraja et Baruc) sont présentés comme probables ou possibles, jamais affirmés ; la phrase « d'usage courant pour parler des livres de cette époque » (mot « rouleau ») est une affirmation générale.
5. Chapitre 7 : la leçon 4 sur le discernement aujourd'hui touche une position que l'auteur doit donner ; la phrase sur les Récabites « qu'ils n'avaient sans doute jamais connu » est une supposition signalée.
6. Chapitre 8 : la fin de Jojakim, l'âge de Jojakin, les chiffres de la déportation, cités sans harmonisation ; la leçon sur Jérémie 29:11 dépend de la position de l'auteur.

Pour Amenan (outil `controle_versets.py`) : une capitale de vers élidée ou accentuée, ramenée en minuscule dans le texte courant comme le demande `style.md` (§ 4.7), est comptée comme un ÉCART (« N’ » devenu « n’ », « J’ » devenu « j’ », « Ecoute » devenu « écoute »). La cause : `casse_libre` retire l'apostrophe de la clé alors que `MINUSCULES_LSG` la garde, et `normaliser` n'enlève l'accent que sur les capitales. J'ai contourné le problème en recoupant les citations (Jérémie 9:2 ; 16:5 ; 18:23 ; 22:29), sans toucher à l'outil.

Pour Akissi ou la propriétaire de `charte/voix.md` : l'exemple des « ceps » dans la charte ne correspond pas à Jérémie 20:2 dans la LSG 1910.

Continuité avec le lot 1 : je n'ai lu que la structure et la fin de `06-ch04-temple.md`. Les renvois au lot 1 restent brefs (Achikam, Anathoth, Urie, appel en Jérémie 1:10 et 1:19).

## PART GÉNÉRÉE PAR IA

Tout le texte du lot 2 est rédigé par IA à partir du texte biblique de la Louis Segond 1910 : récit, transitions, encadrés, leçons, questions et prières des quatre chapitres. L'auteur n'a fourni aucune matière. Seules les citations bibliques (LSG 1910, domaine public) ne sont pas générées. Ce texte est à déclarer comme généré par IA aux plateformes (Amazon KDP), ou comme assisté par IA si l'auteur le retravaille.

Passages rédigés de moi-même, au-delà de la paraphrase du texte : toutes les leçons, les douze questions (reprises du plan, avec une légère retouche de la deuxième question du chapitre 7), les quatre prières, les rapprochements culturels (funérailles, consignes des anciens, vivre loin de son village), les suppositions signalées (« on peut imaginer les reproches », « on peut penser » sur les chefs du chapitre 36 et sur les ambassadeurs) et les liens que j'établis entre les passages (le livre brûlé et le livre jeté dans l'Euphrate, Paschhur et Schemaeja, Jérémie 2:13 et 15:18). Aucun témoignage, chiffre extérieur, citation de commentateur ou exemple contemporain présenté comme réel.

## SUITE PROPOSÉE

1. Amenan corrige le lot 2 (T13) et décide de la règle pour les capitales de vers élidées ou accentuées dans l'outil.
2. Akissi transmet à l'auteur `questions-auteur-lot2.md`, en priorité les positions sur le chapitre 7 (discernement, gestes prophétiques) et le chapitre 5 (prières contre les ennemis, découragement).
3. Harmonisation des trois lots à la correction : forme des leçons (avec ou sans gras), renvois entre chapitres, emploi de « rouleau ».
