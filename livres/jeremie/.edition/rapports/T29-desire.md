# Rapport T29 : scripts du livre audio

Désiré (numérique), 14 novembre 2026.

## STATUT

TERMINÉ. Les seize scripts sont produits par un script depuis le manuscrit corrigé, et le contrôle ne trouve aucun chiffre, sigle ni caractère spécial. Aucune synthèse n'a été lancée.

## RÉSUMÉ

`numerique/fabriquer_scripts_audio.py` lit les seize `manuscrit/*-corrige.md` (version du 14 novembre : sections d'étude, encadrés d'archéologie, nouvelles annexes) et la table des mots hébreux de `numerique/audio/lexique-prononciation.md`. Il écrit un texte par partie dans `numerique/audio/scripts/`. Le texte de l'auteur n'est pas réécrit. Seule sa forme écrite est rendue lisible à l'oreille :

- Références : « Jérémie 1:4-8 » devient « Jérémie, chapitre un, versets quatre à huit », et deux versets qui se suivent sont reliés par « et ». Les livres numérotés sont dits en entier (« Deuxième livre des Rois », « Première épître aux Corinthiens »). Une référence entre parenthèses en fin de phrase devient une phrase à part après la citation. Ailleurs, elle devient une incise entre virgules.
- Dates et nombres : « vers 627 av. J.-C. » devient « vers six cent vingt-sept avant Jésus-Christ », « 609-598 » devient « six cent neuf à cinq cent quatre-vingt-dix-huit », « VII^e^ siècle » devient « septième siècle » et « 1979 » devient « mille neuf cent soixante-dix-neuf ». Le convertisseur des nombres en lettres est écrit dans le script ; num2words n'est pas installé.
- Citations en bloc : elles s'ouvrent par « Citation de Jérémie, chapitre un, versets quatre à huit. » et se ferment par « Fin de la citation. ». Les épigraphes suivent la même règle.
- Titres et intertitres : chacun forme son propre paragraphe. Chaque chapitre s'ouvre par « Chapitre deux. » et se ferme par « Fin du chapitre deux. ». Un titre dont la section devient vide après le retrait d'une marque n'est pas lu : c'est le cas de « Remerciements » dans l'avant-propos.
- Encadrés : ils s'ouvrent par « Encadré : » suivi de leur titre (par exemple « Encadré : Archéologie et histoire : les amulettes de Ketef Hinnom. ») et se ferment par « Fin de l'encadré. ». Les rubriques de fin de chapitre sont annoncées : « Leçons pour aujourd'hui. », « Pour méditer. », « Prière. ».
- Listes numérotées : elles deviennent « Première question. », « Deuxième question. » sous les questions, et « Premier point. », « Deuxième point. » ailleurs.
- Tableaux : chaque ligne est lue comme une phrase, sous la forme « en-tête : contenu ». Le tableau est annoncé par « Tableau en vingt-deux lignes. Le tableau complet figure dans le livre imprimé. ». La carte et la frise sont remplacées par leur légende, suivie de « Elle figure dans le livre imprimé. ».
- Mots hébreux : les 73 formes hébraïques translittérées du livre (*nâthash*, *g^e^ʼullâh*…) et le nom akkadien *Nabû-sharrussu-ukîn* sont remplacés par une forme simple sans signe diacritique, tirée du lexique : « natache », « gueoula », « Nabou-charroussou-oukine ».
- Le sigle CMA devient « C, M, A ». Les initiales des prénoms (« N. Avigad ») sont omises. Les commentaires HTML et les marques entre crochets sont retirés.

Le script se relance après toute correction du manuscrit ou du lexique. Les scripts ne se retouchent jamais à la main.

## FICHIERS

- `numerique/fabriquer_scripts_audio.py` : fabrication et contrôle (`python3 numerique/fabriquer_scripts_audio.py`). Il rend le code 1 si un défaut reste.
- `numerique/audio/scripts/01-avant-propos.txt` à `16-annexes.txt` : 16 fichiers.
- `numerique/audio/extrait-demonstration.txt` : début de l'avant-propos, soit le titre, le témoignage validé par l'auteur le 14 novembre, sa phrase de présentation, puis « À qui s'adresse ce livre » et son premier paragraphe. Il compte 210 mots, environ 1 min 25 à 150 mots par minute, un peu moins à la vitesse 1,08 du script de voix.
- `numerique/audio/lexique-prononciation.md` : nouvelle section « Mots hébreux et transcriptions » de 74 entrées, chacune avec la forme du livre, la forme dite et le sens. Elle est à valider par l'auteur.
- `numerique/audio/script-ch02.txt` (T20) : périmé, remplacé par `scripts/04-appel.txt`. Je ne l'ai pas supprimé ; Akissi peut décider de le retirer.

## VÉRIFICATIONS

- Sortie du script : « Contrôle : aucun chiffre, sigle ni caractère spécial. », code de retour 0. Le contrôle accepte seulement les lettres françaises, l'espace, la ponctuation `, . ; : ! ? « » ’ ' - …` et les sauts de ligne. Il signale aussi tout mot de deux capitales ou plus et toute double ligne vide. Pendant la mise au point, il a trouvé et fait corriger 18 barres obliques inverses de vers poétiques, un « […] » dans une citation et le sigle CMA.
- Deux scripts relus en entier : `01-avant-propos.txt` et `04-appel.txt` (chapitre 2, 264 lignes). La relecture a trouvé cinq défauts, tous corrigés dans le script puis vérifiés :
  1. Un point manquait après « » » quand une référence suivait une citation.
  2. Un « : » se trouvait collé à une référence.
  3. On lisait « :. » à la fin des phrases qui annoncent une citation.
  4. « Versets six à sept » se dit maintenant « versets six et sept ».
  5. Le titre « Remerciements » restait seul.
- Lu par sondage : le début des annexes (chronologie en 22 lignes, livre remis dans l'ordre en 39 lignes) et l'encadré d'archéologie du chapitre 5.
- Durées estimées à 150 mots par minute (décompte du script) :

| Partie | Mots | Durée |
|---|---|---|
| 01 Avant-propos | 613 | 4 min |
| 02 Introduction | 2 589 | 17 min |
| 03 à 14, chapitres 1 à 12 | de 3 976 à 4 963 par chapitre | 27 à 33 min par chapitre |
| 15 Conclusion | 1 471 | 10 min |
| 16 Annexes | 6 774 | 45 min |
| Total | 63 830 | environ 7 h 06 |

Les annexes pèsent 45 minutes, à cause des quatre tableaux lus ligne par ligne.

## MARQUES RETIRÉES DES SCRIPTS

Quarante marques sont retirées. Elles restent dans le manuscrit et devront être levées avant toute production. Chaque fabrication du script en imprime la liste complète.

- [À COMPLÉTER] (12) :
  - avant-propos : remerciements ;
  - positions de l'auteur demandées aux chapitres 2 (Jérémie 1:10 et son ministère), 4 (Dieu qui se repent), 6 (inspiration de l'Écriture), 7 (vrai et faux prophète aujourd'hui), 8 (Jérémie 29:11) et 9 (alliance nouvelle) ;
  - cinq positions dans « Repères théologiques » (questions 2, 3, 4, 8 et 10 de `questions-auteur-etude.md`).
- [À VÉRIFIER] (28), toutes sur les sources de l'archéologie, dans les chapitres 5, 6, 8, 10, 11 et 12 et dans les annexes : publications de Barkay, Shiloh et Avigad, numéros BM 21946 et BM 114789, années et dates de découverte, conversion d'une date babylonienne, Vorderasiatisches Museum, Musée d'Israël, sigles des manuscrits de Qumrân, introduction critique au livre de Jérémie.

Risque : une fois une marque retirée, le passage ne dit pas qu'une source reste à vérifier. Si l'auteur répond aux questions de position, sa réponse entre dans le manuscrit et donc dans le script.

## HYPOTHÈSES

- Un tableau se lit ligne par ligne plutôt qu'en résumé : aucune information ne se perd. Si l'auteur préfère un audio plus court, on peut résumer les tableaux des annexes, ce qui retirerait environ 30 minutes.
- Le sigle CMA est lu lettre par lettre ; le nom complet de l'Église reste à donner par l'auteur.
- Les formes dites des mots hébreux se passent d'accents, comme demandé. Le « ch » de l'hébreu (lettre heth) est rendu par « h » (hessed, hadache), et non par un son guttural que la voix ne sait pas faire.
- Deux phrases de l'avant-propos décrivent la forme écrite des références (« par exemple Jérémie 1:5 ») et la typographie (« le œ de cœur »). Elles sont lues telles quelles. Akissi ou l'auteur peut choisir de les omettre à l'oral, avec une marque dans le manuscrit.

## POINTS OUVERTS ET RISQUES

- Validation par l’auteur : les 73 formes hébraïques, les neuf noms « à trancher » du lexique de T20 (dont Jojakim et Jojakin) et la lecture de CMA.
- Noms modernes à écouter lors du premier essai de voix : British Museum, Koldewey, Ishtar, Ketef Hinnom, Shiloh, Weidner, ostraca. Si la voix les lit mal, il faut les ajouter à la table du lexique.
- Une référence placée au milieu d'une phrase alourdit parfois l'écoute, par exemple : « Compare l'objection de Jérémie, Jérémie, chapitre un, verset six, avec… ». C'est fidèle au texte, mais à juger à l'écoute de l'extrait.
- Aucune synthèse n'a été lancée. L'installation se déroule dans une autre tâche, et l'enregistrement de référence est attendu de l'utilisateur. Selon CLAUDE.md, l'extrait de démonstration doit être validé par l'auteur avant la production complète (environ 7 heures).

## PART GÉNÉRÉE PAR IA

- Les annonces ajoutées pour l'oreille (« Citation de… », « Fin de la citation », « Encadré : », « Tableau en… lignes », « Premier point », « Fin du chapitre… ») et la mise en lettres des références.
- Les formes dites des mots hébreux dans le lexique.

Le fond reste le texte du manuscrit. Les déclarations d'IA du livre sont dans `numerique/fiches-plateformes.md`. Pour le livre audio, il faudra y déclarer une narration de synthèse par voix clonée de l'auteur.

## SUITE PROPOSÉE

1. Dès que l'installation est finie et l'enregistrement de référence fourni : `FORLIFE_VOIX=… bash voixoff/forlife_voixoff.sh numerique/audio/extrait-demonstration.txt extrait.mp3`, puis envoyer le résultat à l'auteur pour validation.
2. L'auteur valide le lexique. On corrige ce qu'il faut puis on relance `python3 numerique/fabriquer_scripts_audio.py`.
3. Une fois les marques levées et l'extrait validé, on produit les seize parties une à une, en réécoutant au moins le début de chaque partie.
