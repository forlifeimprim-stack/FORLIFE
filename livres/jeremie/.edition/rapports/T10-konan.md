# Rapport T10 : rédaction du lot 1

Konan (plume), 9 novembre 2026.

## STATUT

TERMINÉ. Les six fichiers du lot 1 sont rédigés et passent le contrôle des versets sans écart. Ils attendent la lecture éditoriale (T13), puis la validation de l’auteur.

## RÉSUMÉ

J’ai rédigé l’avant-propos, l’introduction et les chapitres 1 à 4 en suivant le plan détaillé validé et les décisions T09 d’Akissi. Le chapitre 2 a été écrit en premier, comme échantillon de voix. Le récit est à la troisième personne, au passé simple. Les leçons et les questions tutoient le lecteur, et le « nous » apparaît dans les transitions. Chaque chapitre se termine par une courte prière en brouillon, close par « Au nom de Jésus. Amen. ». Les positions doctrinales ne sont pas tranchées : le texte expose ce que dit la Bible, et les dix questions doctrinales et pastorales sont consignées dans `manuscrit/questions-auteur-lot1.md`, avec neuf faits incertains présentés comme tels. Seuls le témoignage et les remerciements de l’avant-propos portent une marque visible `[À COMPLÉTER PAR L'AUTEUR : ...]`. Le lot compte 13 974 mots, pour 14 700 visés, et chaque fichier est dans la fourchette de plus ou moins 10 %. Composé, il occupe 60 pages, dont 52 pages de texte (pages 7 à 58).

## FICHIERS

- `manuscrit/01-avant-propos.md` (créé)
- `manuscrit/02-introduction.md` (créé)
- `manuscrit/03-ch01-anathoth.md` (créé)
- `manuscrit/04-ch02-appel.md` (créé)
- `manuscrit/05-ch03-josias.md` (créé)
- `manuscrit/06-ch04-temple.md` (créé)
- `manuscrit/questions-auteur-lot1.md` (créé)
- `rapports/T10-konan.md` (ce rapport)
- Hors du livre, dans le scratchpad de session (`/tmp/claude-0/-home-user-FORLIFE/ef469a51-b9ee-55ef-a414-9b10ccc34b69/scratchpad/`) : `relire.py` (apostrophes typographiques, tirets, mots et tournures interdits, comptage), `essai/ch02.pdf`, `essai/ch02-ecran.pdf`, `essai/lot1.pdf`, `essai/lot1-ecran.pdf` et les pages rendues en PNG. Rien n’a été écrit dans `sortie/`, `charte/` ni `outils/`. Les fichiers des lots 2 et 3 n’ont pas été touchés.

## VÉRIFICATIONS

1. Contrôle des versets, depuis `.edition/` : `python3 outils/controle_versets.py manuscrit/<fichier>`.

| Fichier | Conformes | Écarts | Introuvables | Renvois valides |
|---|---|---|---|---|
| 01-avant-propos.md | 0 | 0 | 0 | 1 |
| 02-introduction.md | 28 | 0 | 0 | 26 |
| 03-ch01-anathoth.md | 26 | 0 | 0 | 29 |
| 04-ch02-appel.md | 36 | 0 | 0 | 17 |
| 05-ch03-josias.md | 52 | 0 | 0 | 36 |
| 06-ch04-temple.md | 39 | 0 | 0 | 32 |

Il n’y a plus aucune ligne « typographie » : les apostrophes sont toutes typographiques, sauf dans les deux marques `[À COMPLÉTER PAR L'AUTEUR` gardées telles quelles pour la recherche. En cours de rédaction, l’outil a relevé six écarts, tous corrigés en reformulant la citation, sans toucher au texte biblique. Un seul était une erreur de ma part : « le livre de l’alliance » au lieu de « du livre de l’alliance » en 2 Rois 23:2. Les cinq autres venaient d’une limite de l’outil, décrite dans les points ouverts.

2. Tirets : comptage Unicode (U+2014 et U+2013) sur les six fichiers, 0 cadratin et 0 demi-cadratin. Un premier comptage avec `grep` et une classe de caractères contenant les deux tirets donnait des faux positifs, parce que la classe de caractères compare octet par octet et attrape l’apostrophe ’. Le comptage retenu est celui de Python.

3. Mots et tournures interdits : `relire.py` cherche la liste du protocole, plus « non pas », « pas seulement », « mais aussi », « un véritable » et les questions suivies d’une réponse courte. Résultat final : aucune occurrence. Pendant la relecture, j’ai aussi réécrit à la main une quinzaine de tournures de la forme « ne pas X, mais Y » et deux questions rhétoriques suivies de leur réponse (chapitre 1).

4. Longueurs (comptées par `relire.py`, sans les attributs, les balises ni les lignes de référence des blocs) :

| Fichier | Mots | Cible | Fourchette ±10 % |
|---|---|---|---|
| Avant-propos | 492 | 500 | 450 à 550 |
| Introduction | 2 156 | 2 200 | 1 980 à 2 420 |
| Chapitre 1 | 2 583 | 2 800 | 2 520 à 3 080 |
| Chapitre 2 | 3 009 | 3 000 | 2 700 à 3 300 |
| Chapitre 3 | 2 909 | 3 200 | 2 880 à 3 520 |
| Chapitre 4 | 2 825 | 3 000 | 2 700 à 3 300 |
| Total | 13 974 | 14 700 | |

Les chapitres 1 et 3 sont dans le bas de la fourchette. J’ai préféré ne pas allonger avec de la matière non biblique.

5. Composition : `python3 outils/composer.py manuscrit/04-ch02-appel.md --sortie <scratchpad>/essai --nom ch02` donne 18 pages, sans avertissement de tiret ni de titre courant. Les « 4 marques [À COMPLÉTER] » signalées viennent des mentions légales de `livre.yaml`. J’ai regardé les pages 7 à 18 en planche, puis les pages 7, 9 et 16 à 110 ppp. L’ouverture (étiquette, titre, fleuron, épigraphe), les intertitres, les deux blocs de citation avec référence à droite, l’encadré gris, les leçons, les questions numérotées et la prière en italique sous son titre sont tous rendus. Composition du lot entier (six fichiers) : 60 pages. La table des matières donne l’avant-propos et l’introduction sans numéro, puis les chapitres 1 à 4 numérotés correctement. 6 marques [À COMPLÉTER] : les 4 des mentions légales et les 2 de l’avant-propos.

6. Contrôles faits à la main avec `outils/verset.py` : toutes les citations ont été copiées depuis l’outil, ainsi que les renvois de contenu (1 Rois 1:7, 1 Samuel 14:3 et 22:20, Juges 21:19, Josué 18:1, 1 Samuel 3:1 et 4:4, Genèse 18:32, Jérémie 41:5, 2 Rois 18:18). Une recherche `--chercher "Jérémie"` confirme que 2 Chroniques 35:25 est la première mention du prophète dans les Chroniques.

7. Non vérifié, faute d’accès en ligne ou de source imprimée : la localisation d’Anathoth, les dates de 612 et 622 av. J.-C., l’affaiblissement de l’Assyrie sous Josias, et le jeu de mots hébreu amandier/veiller (omis). Ces points sont présentés comme incertains dans le texte et listés dans le fichier de questions.

## HYPOTHÈSES

- Titres : `{#id .unnumbered}` pour l’avant-propos et l’introduction (équivalent Pandoc du `{-}` de `graphique.md`). Aucun titre ne dépasse 55 signes : le plus long, « Les années de Josias : réforme et avertissements », en compte 48. Aucun attribut `court` n’est donc nécessaire.
- L’introduction n’a ni leçons, ni questions, ni prière, comme le prévoit le plan. Elle porte une épigraphe (2 Rois 21:10), et chaque chapitre a la sienne.
- Le plan parle de l’achat du champ « au chapitre 10 », mais il le place au chapitre 9 (encadré « Le droit de rachat »). Le chapitre 1 renvoie donc au chapitre 9.
- Les renvois aux autres chapitres (chapitre 5 pour les confessions, chapitre 6 pour Carkemisch et le rouleau, chapitre 9 pour le champ) suivent la numérotation du plan.
- Jérémie 27:1 et Seraja ne sont pas cités dans le lot 1 ; les consignes qui les concernent ne s’appliquent pas ici.

## POINTS OUVERTS ET RISQUES

- Pour Amenan (outil `controle_versets.py`) : l’outil refuse de mettre en minuscule une capitale de vers sur un mot élidé (« S’il », « N’élève », « Jusqu’à ») ou sur « A » rendu par « à ». La règle 7 de `style.md` le demande pourtant dans le texte courant. Il compte cela comme un ÉCART. J’ai contourné les cinq cas en coupant la citation (Jérémie 5:1 ; 7:12 ; 7:16 ; 11:7 ; 15:4), ce qui alourdit un peu certaines phrases. À corriger dans l’outil, ou à trancher par Amenan.
- Les dix positions doctrinales et pastorales restent à recueillir (`questions-auteur-lot1.md`). Les passages qui en dépendent sont écrits pour pouvoir être complétés sans tout reprendre.
- La voix reste une hypothèse : l’auteur n’a fourni aucun texte. Le chapitre 2 est l’échantillon à lui soumettre en premier.
- Harmonisation avec les lots 2 et 3, rédigés en parallèle : les renvois croisés (chapitres 5, 6 et 9) et la présentation d’Achikam et de la famille de Schaphan sont à vérifier à la lecture éditoriale.

Passages que je juge les plus fragiles :

1. Chapitre 2, section « Connu avant d’être né » : le paragraphe neutre sur Jérémie 1:5, sujet sensible pour beaucoup de lecteurs (vie avant la naissance, élection).
2. Chapitre 3, section « Meguiddo » : la phrase sur 2 Chroniques 35:22 (Dieu parlant par Néco).
3. Chapitre 4, section « N’intercède pas » et paragraphe sur le « repentir » de Dieu (Jérémie 26:3, 13, 19).
4. Chapitre 1, section « Le souvenir d’Abiathar » : la filiation d’Éli à Abiathar repose sur l’identification de deux Achithub.
5. Chapitre 4, section « C’est ici le temple » : le rapprochement de Jérémie 7 et 26, présenté comme une hypothèse de lecteurs.
6. Introduction, encadré sur les empires : seul passage qui s’appuie sur « les historiens » pour un fait hors de la Bible (Assyrie, Ninive).
7. Avant-propos : la phrase biographique mise à la première personne.
8. Chapitre 4, leçons : l’application sur le salaire juste « au service de l’église », la seule leçon qui touche à la gestion concrète d’une communauté.

## PASSAGES RÉDIGÉS DE MOI-MÊME

L’auteur n’a fourni aucune matière : tout le texte du lot est de ma main, en dehors des citations bibliques et de la phrase biographique de l’avant-propos. En particulier :

- les récits, explications, intertitres, encadrés et transitions des six fichiers ;
- toutes les « Leçons pour aujourd’hui » des chapitres 1 à 4 ;
- les questions « Pour méditer », reprises du plan que j’avais rédigé en T03 ;
- les quatre prières de fin de chapitre (brouillons à valider ou remplacer) ;
- l’exemple imaginé du moniteur qui prépare la leçon sur Noé (chapitre 2), annoncé comme tel ;
- les suppositions, toutes signalées (« peut-être », « on peut imaginer », « le texte ne dit pas ») : la jeunesse de Jérémie au contact de la loi (chapitre 1), les raisons de l’hostilité d’Anathoth (chapitre 1), les raisons pour lesquelles Jérémie ne fut pas consulté par Josias (chapitre 3) ;
- le rapprochement culturel sur la terre familiale (chapitre 1) ;
- les parties « Comment le lire » et « La version biblique » de l’avant-propos, écrites sans « je » pour ne pas faire parler l’auteur.

Aucun témoignage, aucune statistique, aucune citation de commentateur et aucun proverbe n’a été inventé.

## PART GÉNÉRÉE PAR IA

Tout le texte du lot 1 (avant-propos, introduction, chapitres 1 à 4, environ 14 000 mots) est rédigé par IA à partir du texte biblique de la Louis Segond 1910. Seules les citations bibliques, dans le domaine public, et la phrase biographique validée par l’auteur n’en relèvent pas. Ce texte restera dans le livre s’il est validé. Il faudra le déclarer comme contenu généré par IA aux plateformes (Amazon KDP), ou comme contenu assisté par IA si l’auteur le réécrit de façon substantielle. Le fichier de questions et ce rapport sont des documents de travail.

## SUITE PROPOSÉE

1. Akissi lit le lot (T13), en commençant par le chapitre 2, et envoie à l’auteur ce chapitre comme échantillon de voix, avec les dix questions doctrinales de `questions-auteur-lot1.md`.
2. Amenan tranche le cas des capitales élidées dans `controle_versets.py`. Si l’outil est corrigé, les citations coupées pourront être rendues en entier.
3. À la lecture éditoriale, harmoniser les renvois croisés avec les lots 2 et 3.
4. Une fois les réponses de l’auteur reçues, compléter les passages concernés, puis remplacer ou valider les prières et l’avant-propos.
