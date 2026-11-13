# Doutes et choix de traduction (anglais)

Internal evaluation translation, not for publication.

Awa, 13 novembre 2026, tâche T21. Fichiers traduits : `couverture/quatrieme.md` (identique à `quatrieme-corrige.md`, vérifié par `diff`) vers `numerique/traduction-en/back-cover.md`, et `manuscrit/04-ch02-appel-corrige.md` vers `numerique/traduction-en/chapter-02.md`. Graphies et termes : `charte/glossaire-en.md`.

## Droits

Aucune cession écrite des droits de traduction dans `droits/` : `projet-contrat-edition.md` laisse la case « Droit de traduction en [À COMPLÉTER PAR L'AUTEUR : langues] » non cochée. La traduction est donc interne et d'évaluation, marquée comme telle en tête de chaque fichier. Toute publication suppose d'abord la signature de ce contrat avec la langue anglaise.

## Méthode

Passe 1 : traduction. Passe 2 : révision phrase à phrase contre l'original (omissions, contresens, faux amis, chiffres, références). Passe 3 : lecture de l'anglais seul. Chaque citation biblique a été remplacée par le texte KJV du même passage, tiré de `outils/verset.py --kjv`, puis contrôlée par un script qui vérifie que chaque citation entre guillemets ou en bloc figure mot pour mot dans le verset cité : 40 citations sur 40 conformes (une alerte du script était un faux positif, la citation « a prophet unto the nations » étant suivie d'une référence à Jeremiah 1:1 qui porte sur la phrase suivante).

## Écarts de sens entre la LSG et la KJV

Ces écarts touchent le commentaire de l'auteur, écrit sur la LSG. Je n'ai pas modifié le fond ; voici où l'anglais s'éloigne et ce que j'ai fait.

1. Jérémie 1:12. LSG « je veille sur ma parole, pour l'exécuter » ; KJV « I will hasten my word to perform it ». Le commentaire de l'auteur (« Dieu lui-même la surveille », « l'amandier rappelle que Dieu ne dort pas », leçon 4 « Dieu veille sur sa parole ») repose sur l'idée de veille. J'ai cité la KJV exacte et gardé « watches over » dans le commentaire, qui reste défendable (l'hébreu dit « veiller » ; Jérémie 31:28 KJV dit « watch over »). La phrase « Dans notre traduction, le lien entre l'arbre et la veille n'est pas expliqué » devient « In our translation, the link between the tree and God's word is not explained », car la KJV ne parle pas de veille. [À VÉRIFIER : l'auteur souhaite-t-il une note expliquant le jeu de mots hébreu amandier / veiller, que ni la LSG ni la KJV ne rendent ?]
2. Jérémie 1:13. LSG « du côté du septentrion », d'où la glose « Le septentrion, c'est le nord ». La KJV dit déjà « toward the north » : la glose n'a plus d'objet et je l'ai supprimée. Seule omission volontaire de la traduction.
3. Jérémie 1:17. LSG « Ne tremble pas… de peur que je ne te fasse trembler » ; KJV « be not dismayed at their faces, lest I confound thee before them ». Le jeu de répétition (trembler / trembler) disparaît ; le commentaire « deux craintes » reste juste sur le sens.
4. Jérémie 1:7. LSG « tous ceux… tout ce que », d'où « Deux fois revient le mot tout ». KJV « all that I shall send thee, and whatsoever I command thee » : rendu par « Twice the verse leaves no exception », suivi des deux expressions.
5. Jérémie 1:8. LSG « Ne les crains point » ; KJV « Be not afraid of their faces ».
6. Jérémie 1:15. Paraphrase de l'auteur (« placer leur siège à l'entrée des portes ») : la KJV dit « set every one his throne at the entering of the gates » ; paraphrase rendue par « set their thrones », pour ne pas faire croire à un siège militaire que le texte ne dit pas ainsi.
7. Jérémie 1:16. LSG « parce qu'ils m'ont abandonné… » ; KJV « who have forsaken me… » : la citation commence à « have forsaken me », précédée de « the people » hors guillemets.
8. Jérémie 20:9 (accroche et chapitre). LSG « Il y a dans mon cœur comme un feu dévorant » ; KJV « his word was in mine heart as a burning fire shut up in my bones ». Le sujet change (la parole, en KJV). L'accroche garde la KJV exacte, sans majuscule ajoutée en début de ligne ni le « But » initial du verset.
9. Jérémie 20:2. Paraphrase « le mettra en prison » ; la KJV dit « put him in the stocks » (aux ceps) : rendu « put him in the stocks ».
10. Jérémie 38:6. « Citerne » ; la KJV dit « dungeon ». Choix : « dungeon » partout (récit, leçons, quatrième), pour que le lecteur retrouve le mot de sa Bible. « Cistern » serait plus clair pour un lecteur moderne ; à trancher si l'édition anglaise change de version biblique.
11. Jérémie 46:1. LSG « sur les nations » ; KJV « against the Gentiles ». Le titre « prophète des nations » reste juste (KJV 1:5 « a prophet unto the nations »).
12. Jérémie 25:3. La LSG dit « il y a vingt-trois ans » ; la KJV « that is the three and twentieth year », avec « rising early and speaking » pour « je vous ai parlé dès le matin ». Le chiffre de vingt-trois ans du commentaire est conservé.
13. Jérémie 25:9. La KJV écrit ici « Nebuchadrezzar » ; graphie conservée dans la citation, « Nebuchadnezzar » dans le récit (glossaire).
14. Jérémie 15:16. LSG « J'ai recueilli tes paroles » ; KJV « Thy words were found ».
15. Jérémie 1:10. Six verbes dans les deux versions (root out, pull down, destroy, throw down, build, plant) : la remarque « quatre pour démolir, deux pour construire » reste exacte.

Numérotation : aucun écart de chapitres ou de versets entre LSG et KJV pour les passages cités (Jérémie 1, 15, 17, 20, 25, 31, 36, 38, 39, 46 ; Exode 3 et 4 ; Ésaïe 6 ; Galates 1 ; 1 Rois 18 ; 2 Rois 22). Vérifié verset par verset avec l'outil.

## Autres choix

- « l'Éternel » rendu par « the Lord » : l'outil restitue « Lord », alors que la KJV imprimée met LORD en petites capitales. À régler à la composition si l'édition se fait.
- Tutoiement des leçons et des questions : « you ». Prière adressée à Dieu : « you » aussi, « thou » réservé aux citations KJV. À valider.
- Titre du chapitre : « Before I formed thee: the call ». L'ancre `{#appel}` et les classes `::: epigraphe`, `encadre`, `lecons`, `questions`, `priere` sont laissées telles quelles pour que les outils existants les reconnaissent ; les libellés de rubrique injectés par `outils/composer.py` restent en français (rôle de Désiré ou d'Affoué).
- Anglais britannique (fulfilment, towards, Mrs) ; à changer si l'éditeur vise surtout l'Amérique du Nord.
- « Rouleau » : « scroll » dans le récit, la KJV disant « roll ».
- Biographie : « moniteur d'école du dimanche » rendu par « Sunday school teacher » ; « Koffi Assena Grâce Emmanuelle, épouse Kouadio » rendu par « Koffi Assena Grâce Emmanuelle, Mrs Kouadio ». [À VÉRIFIER : la forme que l'auteur préfère pour le nom de son épouse en anglais.]
- « av. J.-C. » : « BC ».
- Mention de prix laissée à compléter, en anglais : « [TO BE COMPLETED: retail price, the user's decision] ».
- `fiche-projet.md` annonce une traduction d'évaluation du « chapitre 1 » ; la tâche T21 demande le chapitre 2 (`04-ch02`). J'ai suivi la tâche ; la fiche est à mettre à jour par Akissi.

## Remarques sur l'original (pour l'auteur, sans modification)

- Le chapitre dit « Le chapitre précédent l'a montré : les gens de son bourg et ses propres frères se tourneront contre lui (Jérémie 11:21 ; 12:6) ». Traduit tel quel ; le chapitre 1 (`03-ch01-anathoth-corrige.md`) cite bien ces versets (contrôle par `grep`).
