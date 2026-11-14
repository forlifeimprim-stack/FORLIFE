# T23, Konan (plume) : sections d'étude des chapitres 7 à 12 et tableau « Le livre de Jérémie remis dans l'ordre »

Date : 14 novembre 2026.

## STATUT

PARTIEL. Le texte est terminé et contrôlé. Le tableau de l'annexe se compose mal tant que la feuille de style ne connaît pas les tableaux à cinq colonnes (voir les points ouverts). Ce réglage revient à Affoué.

## RÉSUMÉ

Chapitres 7 à 12 : chaque fichier corrigé reçoit, juste avant `::: lecons`, une section « Pour aller plus loin : étude » avec les cinq intertitres de niveau 3 de T22. Rien d'autre n'est modifié. Passages étudiés : Jérémie 18:1-12 (potier) ; 29:1-14 (lettre) ; 31:31-34 (alliance nouvelle) ; 38:1-13 (citerne) ; 42:1-22 (le reste consulte Jérémie) ; 44 (dernier discours). Le fil de Jérémie 1:10 suit les reprises des verbes de l'appel : Jérémie 18:7-9 ; 24:6 ; 29:5 ; 31:28 ; 42:10 ; 44:27, et le verbe veiller de Jérémie 1:12.

Annexe : dans `16-annexes-corrige.md`, juste après la chronologie (avant « Carte »), nouvelle section « Le livre de Jérémie remis dans l'ordre ». Elle comprend une introduction de trois phrases et un tableau à cinq colonnes, 39 lignes qui couvrent Jérémie 1 à 52 par blocs. Les 31 blocs datés ou datables par le contexte viennent d'abord, dans l'ordre chronologique. Les 8 blocs non datés sont regroupés à la fin, avec une phrase d'explication. Chaque année de règne et chaque indication de contexte renvoie au verset qui la donne. Tous ces versets ont été lus avec verset.py : Jérémie 1:2 ; 3:6 ; 22:11, 18, 24 ; 24:1 ; 25:1 ; 26:1 ; 28:1 ; 29:2-3 ; 32:1 ; 33:1 ; 34:1, 7, 21 ; 35:1, 11 ; 36:1, 9 ; 37:5, 11 ; 38:28 ; 39:2, 15 ; 40:1 ; 41:1 ; 42:7 ; 43:8 ; 44:1 ; 45:1 ; 46:2 ; 47:1 ; 49:34 ; 51:59-60 ; 52:4-5, 31. Les dates approximatives reprennent celles de la chronologie existante (627, 609, 605, 597, 587 ou 586, 561 ou 560). Ajouts : « vers 604 » (cinquième année de Jojakim), « vers 594 ou 593 » (quatrième année de Sédécias), « vers 588 » (début du siège) et « après 586 » pour l'Égypte.

## FICHIERS

- `manuscrit/09-ch07-gestes-corrige.md` à `manuscrit/14-ch12-egypte-corrige.md` (sections d'étude)
- `manuscrit/16-annexes-corrige.md` (nouvelle section, tableau encadré par `::: tableau-ordre`)
- `manuscrit/questions-auteur-etude.md` (questions 8 à 12 ajoutées)
- Essai hors dépôt : `/tmp/claude-0/-home-user-FORLIFE/ef469a51-b9ee-55ef-a414-9b10ccc34b69/scratchpad/t22/compo/essai-annexes.pdf`
- Originaux sans suffixe : intacts. Aucun commit.

## VÉRIFICATIONS

- `controle_versets.py` : 0 écart et 0 référence introuvable dans les sept fichiers modifiés (ch. 7 : 40 conformes ; ch. 8 : 37 ; ch. 9 : 55 ; ch. 10 : 36 ; ch. 11 : 34 ; ch. 12 : 32 ; annexes : 4 conformes, 104 renvois valides). Au chapitre 12, un écart est apparu sur une glose entre guillemets (« veiller » suivi de Jérémie 1:12) : il est corrigé. Les remarques typographiques « Juifs » des chapitres 8 et 10 portent sur des lignes antérieures à T23.
- Tirets U+2014 et U+2013 : 0 dans les sept fichiers (comptage Python).
- Mots ajoutés (Python, `split`) : ch. 7 : 866 ; ch. 8 : 871 ; ch. 9 : 812 ; ch. 10 : 817 ; ch. 11 : 816 ; ch. 12 : 805. Cinq intertitres `###` dans chaque chapitre.
- J'ai composé l'annexe et regardé la page 10 en image. Le tableau s'affiche, mais les colonnes 4 et 5 sont écrasées : le texte y passe un mot par ligne et déborde sur la marge.

## HYPOTHÈSES

- Jérémie 7:1-15 est rangé avec Jérémie 26 (« daté par le contexte »), comme dans le chapitre 4. Jérémie 50 et 51 sont rangés à la quatrième année de Sédécias, d'après Jérémie 51:59-60.
- Pour Jérémie 27, je suis Jérémie 28:1 et 27:3, 12 (Sédécias), comme le chapitre 7, et non 27:1, qui nomme Jojakim.
- La colonne « Chapitre du présent livre » renvoie aux chapitres où le passage est traité ; elle en donne parfois deux.

## POINTS OUVERTS ET RISQUES

- Pour Affoué : `charte/interieur.css` fixe la largeur des colonnes pour tous les tableaux (21 %, 55 %, 24 %, lignes 623 à 625). Le tableau à cinq colonnes en hérite, et ses colonnes 4 et 5 sont écrasées. Je l'ai placé dans un bloc `::: tableau-ordre` pour qu'une règle propre s'y applique sans toucher aux autres tableaux. Proposition à valider par Affoué : `.tableau-ordre th:nth-child(n), .tableau-ordre td:nth-child(n)` avec des largeurs d'environ 13 %, 30 %, 14 %, 33 % et 10 %, et une police de 8,5 pt. Je n'ai pas modifié la feuille de style, qui n'est pas de mon rôle.
- Trois nouvelles positions doctrinales sont laissées à l'auteur (questions 8 à 10) : les ministères prophétiques d'aujourd'hui, l'application personnelle de Jérémie 29:11, Israël et l'Église dans l'alliance nouvelle.
- Hébreu : 24 explications nouvelles marquées [À VÉRIFIER : dictionnaire hébreu imprimé]. Les moins sûres : *motot* (Jérémie 28:13), le verbe bâtir derrière « établir » en Jérémie 42:10, *salah* réservé à Dieu comme sujet, *gola* et son verbe.
- Dates « vers 588 », « vers 594 ou 593 » et « vers 604 » : repères usuels absents de la chronologie existante, à confirmer par Akissi ou l'auteur (question 11).

## PART GÉNÉRÉE PAR IA

À déclarer : les six sections d'étude (environ 4 990 mots) et le tableau de l'annexe avec son introduction (environ 1 100 mots), rédigés entièrement par la plume. Les passages rédigés par moi sont les plans, les explications de mots, les lignes des références croisées, les paragraphes « Le fil de Jérémie 1:10 », les trente questions, ainsi que le classement et les intitulés du tableau.

## SUITE PROPOSÉE

Réglage CSS du tableau par Affoué, relecture d'Amenan (T24) sur les douze sections et l'annexe, puis réponses de l'auteur aux questions 1 à 12, recomposition (T25) et EPUB (T26).
