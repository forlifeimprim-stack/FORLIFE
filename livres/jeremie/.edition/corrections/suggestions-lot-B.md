# Suggestions à l'auteur et à la plume, lot B (fichiers 09 à 16) et quatrième de couverture

Amenan, 13 novembre 2026 (T15). Rien de ce qui suit n'a été appliqué : les phrases concernées sont correctes, elles peuvent être plus claires. Les numéros de ligne renvoient aux originaux de `manuscrit/`. Si une suggestion est retenue, je l'ajoute à `corrections/corriger_lot.py` et je relance le script.

## Cohérence des faits entre chapitres

- 14-ch12-egypte.md, ligne 87 : « Le roi Jojakin, emmené en captivité à dix-huit ans ». Le chapitre 8 (10-ch08-lettre.md, ligne 21) signale que les Rois donnent dix-huit ans et les Chroniques huit, et laisse la question ouverte. Proposition : « Le roi Jojakin, emmené en captivité au début de son règne, y était toujours prisonnier. »
- 15-conclusion.md, ligne 35 : « L'un était un haut fonctionnaire, l'autre un secrétaire, le troisième un serviteur étranger. » Le paragraphe précédent nomme quatre soutiens (Achikam, Baruc, Ébed-Mélec, Guedalia). Proposition : ajouter « le quatrième, un gouverneur », ou écrire « Achikam était un haut fonctionnaire, Baruc un secrétaire, Ébed-Mélec un serviteur étranger ».
- Les « ceps » de Paschhur ont été remplacés par « la prison » dans trois passages (relevé, règle de cohérence avec Jérémie 20:2). La question n° 5 de `questions-auteur-lot2.md` reste ouverte pour l'auteur, s'il tient au mot.

## Renvois ambigus entre « chapitre » du livre et chapitre de Jérémie

Tous les renvois du lot vers les chapitres du livre ont été vérifiés et sont justes : 09 lignes 13, 69 et 115 ; 11 lignes 55 et 99 ; 13 ligne 89 ; 14 lignes 69 et 120. Je propose d'ajouter « de Jérémie » quand le numéro peut désigner les deux.

- 11-ch09-consolation.md, ligne 37 : « Le chapitre 31 s'ouvre… » et ligne 153 : « Ici, au chapitre 33 ». Le contexte suffit, mais « Jérémie 31 s'ouvre… » serait plus net.
- 13-ch11-ruines.md, ligne 23 : « Le chapitre 40 raconte la libération d'une autre manière. » Proposition : « Jérémie 40 raconte… ».
- 09-ch07-gestes.md, ligne 65 : « le chapitre suivant situe la scène » (Jérémie 28). Le chapitre suivant du livre est la lettre aux exilés. Proposition : « Jérémie 28 situe la scène ».

## Tournures à revoir

- 13-ch11-ruines.md, ligne 43 : « en d'autres mots » est un belgicisme. Proposition : « en d'autres termes ».
- 13-ch11-ruines.md, ligne 131 : « Les Lamentations ne font pas semblant que tout va bien. » La tournure est familière. Proposition : « Les Lamentations ne prétendent pas que tout va bien. »
- 14-ch12-egypte.md, ligne 73 : « (Jérémie 50 à 51) ». Proposition : « (Jérémie 50 et 51) », puisqu'il n'y a que deux chapitres.
- Tic « Le texte… » : la formule ouvre encore de nombreuses phrases, comme dans le lot A (voir `suggestions-lot-A.md`). Passages les plus chargés : 09-ch07-gestes.md, lignes 53 à 59, et 13-ch11-ruines.md, lignes 61 à 73.

## Mise en page (pour Affoué, épreuves)

- Annexe « Qui est qui » : dans l'essai de composition de tout le livre (164 pages), la ligne « Seraja (3) » est coupée en bas de la page 161. Le nom et la référence restent seuls, et la description passe à la page suivante. Il faut empêcher la coupure des lignes de tableau (`break-inside: avoid` sur `tr`).

## Quatrième de couverture

Corrections faites dans `couverture/quatrieme-corrige.md` : apostrophes typographiques et forme des références dans le tableau des sources. Le texte imprimé n'a pas été réécrit. Les espaces insécables sont posées par `generer_couverture.py` au moment de la génération : je ne les ai donc pas tapées.

- « Version biblique : Citations bibliques tirées de la Louis Segond 1910. » répète « biblique ». Proposition : « Version biblique : Louis Segond 1910 ».
- « Pour le croyant qui lit sa Bible et pour le serviteur de Dieu qui cherche à rester fidèle quand la parole dérange. » C'est une phrase sans verbe, admise en quatrième. À garder si Affoué la veut comme chute.
- Le tableau des sources (non imprimé) parle d'« annexes A et B », alors que les annexes du livre ne sont pas lettrées. Proposition : « annexes (chronologie, carte) ».
- La biographie n'a pas été touchée : elle est reprise mot pour mot de `livre.yaml`.
