# Rapport T03 : charte de voix et plan détaillé

Konan (plume), 9 novembre 2026.

## STATUT

TERMINÉ. Le plan attend la validation d'Akissi (T09), puis celle de l'auteur. Aucun chapitre n'est rédigé.

## RÉSUMÉ

La charte de voix est une hypothèse à valider par l'auteur. Après le message d'Akissi, elle s'appuie sur la biographie validée et sur un indice réel : le manuscrit de « Avant que l'horloge ne s'arrête », retrouvé dans l'historique git du dépôt (commit 5e23f53). Ce livre tutoie le lecteur, mêle « nous » et « tu », et propose des prières à la première personne closes par « Au nom de Jésus. Amen. ». Je recommande le tutoiement pour les leçons et les questions, par continuité avec la voix que l'auteur a déjà signée, et je signale le risque auprès des lecteurs âgés et des responsables. Réserve : l'historique montre que ce livre a été mis en forme avec un assistant d'écriture avant d'être validé par l'auteur. C'est un indice, pas un échantillon de sa plume seule.

Le plan détaillé garde la structure d'Akissi : avant-propos, introduction, douze chapitres, conclusion, annexes. J'y propose quatre déplacements justifiés : Jérémie 19:1 à 20:6 passe au chapitre 5, Jérémie 43:8 à 44:30 au chapitre 12, la nouvelle alliance dans le Nouveau Testament est traitée au chapitre 9, et Jérémie 22:24-30, 24, 25, 35, Daniel 1:1-3 et 2 Chroniques 36:6-7 sont intégrés. J'ajoute une annexe facultative « Qui est qui ». Pour chaque chapitre, le plan donne la période et les rois, les passages, un déroulé en sept ou huit étapes, l'encadré historique, les versets en bloc, des pistes de leçons, trois questions et la longueur cible. Il contient 32 marques [À COMPLÉTER PAR L'AUTEUR] et 26 marques [À VÉRIFIER]. Le total visé est de 42 300 mots, répartis en trois lots : 14 700, 12 700 et 14 900 mots.

Les consignes d'Akissi reçues en cours de tâche sont appliquées : graphie « Élisée », graphies Carkemisch et Tachpanès, étapes de la réforme de Josias données d'après les années de règne (2 Chroniques 34:3 ; 2 Chroniques 34:8 ; 2 Rois 22:3) sans date ferme, et déportation sous Jojakim (Daniel 1:1-3) distinguée de celle de Jojakin vers 597.

## FICHIERS

- `charte/voix.md` (créé, puis révisé après le message d'Akissi et la parution de `charte/style.md`)
- `manuscrit/00-plan-detaille.md` (créé)
- `rapports/T03-konan.md` (ce rapport)
- Hors du livre : `/tmp/claude-0/-home-user-FORLIFE/ef469a51-b9ee-55ef-a414-9b10ccc34b69/scratchpad/verifier_refs.py`, script de contrôle qui relève toutes les références d'un fichier et appelle `outils/verset.py` pour chacune.

## VÉRIFICATIONS

1. Existence de toutes les références dans la LSG 1910. Commande, lancée depuis `.edition/` :
   `python3 /tmp/claude-0/-home-user-FORLIFE/ef469a51-b9ee-55ef-a414-9b10ccc34b69/scratchpad/verifier_refs.py manuscrit/00-plan-detaille.md`
   Résultat : 353 références distinctes relevées dans le plan ; 361 appels à `outils/verset.py`, car une plage de chapitres comme « Jérémie 46 à 51 » est vérifiée chapitre par chapitre et une plage sur deux chapitres l'est par ses deux bornes ; 0 erreur. Le script compare l'en-tête renvoyé à la plage demandée, parce que `verset.py` tronque sans erreur une plage qui dépasse la fin d'un chapitre. J'ai testé ce contrôle sur des références volontairement fausses : « Jérémie 1:4-99 », « Jérémie 53 » et « Jérémie 41:99 » sont bien rejetées.
   Plan et charte ensemble : 360 références distinctes, 374 appels, 0 erreur.
2. Contenu des passages. J'ai lu dans `verset.py` le texte de tous les passages sur lesquels repose une étape du déroulé, soit environ 150 appels. Le plan ne s'appuie sur aucun verset de mémoire.
3. Citations entre guillemets. `python3 outils/controle_versets.py manuscrit/00-plan-detaille.md` : 17 conformes, 0 écart, 0 référence introuvable, 529 références seules valides. Un premier passage avait relevé deux écarts : un titre d'encadré entre guillemets suivi de « (Josué 21) » et le mot « dévorée » attribué à Jérémie 15:16. Les deux sont corrigés. Les courtes expressions citées sans référence ont été recherchées une à une avec `verset.py --chercher`.
4. Charte de voix. `python3 outils/controle_versets.py charte/voix.md` : 1 conforme. Les citations du paragraphe d'exemple et Jérémie 32:17, contrôlées à part : 3 conformes, 0 écart. Le paragraphe d'exemple compte 164 mots, environ dix lignes.
5. Règles d'écriture. Recherche des tirets cadratin et demi-cadratin et des tournures et mots interdits par le protocole dans les deux fichiers : aucune occurrence, hors la mention de la règle elle-même.
6. Non vérifié en ligne, le réseau ne le permettant pas : la localisation d'Anathoth, les dates non usuelles (622, 612, 594/593, 588, 561/560, 539), le pays de Koush, l'attribution traditionnelle des Lamentations, la structure alphabétique des Lamentations et le jeu de mots amandier/veiller. Tous ces points sont marqués [À VÉRIFIER] dans le plan.

## HYPOTHÈSES

- L'adresse au lecteur (tutoiement), le passé simple, une prière unique en conclusion et une clôture « Au nom de Jésus. Amen. » sont des propositions, en attente de l'auteur.
- Lecture doctrinale évangélique (`fiche-projet.md`). Tout point doctrinal que le texte ne tranche pas est laissé à l'auteur.
- Les graphies suivent `charte/lexique.txt`, les références et la normalisation des citations suivent `charte/style.md`. Le plan de travail écrit le nom du livre à chaque référence, ce qui facilite le contrôle automatique. Le manuscrit suivra la forme abrégée de `style.md` (« Jérémie 1:5 ; 20:9 »).

## POINTS OUVERTS ET RISQUES

- Trente-deux positions de l'auteur sont à recueillir. Les plus structurantes : Jérémie 1:5 et le ministère de prophète aujourd'hui (chapitre 2), les malédictions générationnelles (chapitre 1), le discernement des prophéties et les gestes prophétiques (chapitre 7), les destinataires des promesses de Jérémie 30 à 33 (chapitre 9), l'appel à la reddition (chapitre 10). Sans réponse, la plume expose le texte sans trancher et laisse la marque.
- Tutoiement : il peut sembler familier à certains lecteurs âgés dans une biographie. Le basculer au vouvoiement est simple, car l'adresse au lecteur est limitée aux leçons et aux questions.
- Pour Amenan (source LSG numérique) : trois défauts relevés dans `sources/lsg1910/lsg.json` en vérifiant les passages. Jérémie 35:19 commence par « cause de cela » au lieu de « A cause de cela ». Jérémie 39:1 commence par une minuscule (« la neuvième année »). Deutéronome 18:22 se termine par le mot parasite « Deutéronome ». Les deux premiers versets peuvent être cités dans le livre : il faut décider comment les rétablir.
- Pour Amenan : Jérémie 27:1 porte « Jojakim » alors que le contexte (Jérémie 27:3 ; 27:12 ; 28:1) se situe sous Sédécias. Le plan suit le contexte et prévoit une phrase pour signaler la difficulté. La formulation est à arrêter avec elle.
- Pour Amenan : la remarque du lexique « Seraja, frère de Baruc » repose sur leur filiation commune (Jérémie 32:12 ; 51:59), mais le texte ne dit pas « frère ». Le livre écrira « sans doute son frère ».
- Le lexique exclut « Nabuchodonosor ». Je l'aurais signalé une fois au lecteur, mais la décision revient à Amenan.
- Le manuscrit du livre précédent contient des récits de deuils familiaux de l'auteur. Ils ne sont pas repris ici, et ne le seront pas sans son accord.
- La longueur visée (42 300 mots) dépasse un peu les 40 000 mots de la fiche projet. La densité de page est à confirmer par Affoué.
- Dates et chiffres divergents gardés tels que dans le texte : la troisième année en Daniel 1:1 et la quatrième en Jérémie 46:2, les vingt-cinquième et vingt-septième jours en Jérémie 52:31 et 2 Rois 25:27, les chiffres de déportation de 2 Rois 24:14-16 et de Jérémie 52:28. Aucune harmonisation sans source.

## PASSAGES RÉDIGÉS DE MOI-MÊME

Tout le contenu de ces deux fichiers est de ma main, puisque l'auteur n'a fourni aucune matière. Dans le détail :

- les règles de voix, les justifications et le paragraphe d'exemple de `charte/voix.md`. L'exemple contient une supposition signalée (« On peut imaginer le fils d'un sacrificateur ») et une application qui évoque l'école du dimanche, tirée de la biographie validée ;
- les titres des chapitres, les déroulés, les intitulés d'encadrés, les pistes de leçons et les 36 questions « Pour méditer » du plan ;
- les quatre déplacements de passages et l'annexe « Qui est qui ».

Rien dans le plan ne relève d'un témoignage personnel de l'auteur.

## PART GÉNÉRÉE PAR IA

Ces deux fichiers sont des documents de travail : rien n'en passera tel quel dans le livre. Les titres de chapitres et les questions « Pour méditer » pourraient y entrer après validation de l'auteur, et il faudra alors les déclarer comme générés par IA, ou assistés par IA s'il les retravaille. Le paragraphe d'exemple de la charte n'est pas destiné au livre.

## SUITE PROPOSÉE

1. Akissi valide ou amende le plan (T09) et transmet à l'auteur les cinq décisions de voix et les positions doctrinales du lot 1.
2. Konan rédige d'abord le chapitre 2, comme échantillon de voix, et le fait passer par `outils/controle_versets.py`. Le reste du lot 1 attend le retour sur cet échantillon.
3. Amenan tranche les trois défauts de la source et la formulation de la note sur Jérémie 27:1.
4. Kouamé reçoit la liste des lieux de l'annexe B pour la carte (T06).
