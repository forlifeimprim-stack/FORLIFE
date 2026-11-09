# Rapport T05 : recherche iconographique, registre des droits, page des crédits

Agent : Yao (iconographie). Date : 9 novembre 2026.

## STATUT

TERMINÉ au sens du critère de fin : le registre est complet, les tailles en pixels sont calculées, et aucune image n'est marquée VALIDÉE. Aucune licence d'image tierce n'a pu être lue en ligne : toutes les œuvres anciennes restent À VÉRIFIER.

## RÉSUMÉ

Wikimedia Commons et Openverse ont refusé la connexion (une tentative chacun). J'ai donc dressé de mémoire une liste de candidates du domaine public, chacune avec son emplacement, la raison du choix, la source à consulter, la licence attendue et le statut « À VÉRIFIER : licence et fichier non consultés en ligne le 9 novembre 2026 ». Le registre compte 17 lignes : les quatre commandes internes de Kouamé (IMG-COUV, IMG-CARTE, IMG-FRISE, IMG-FLEURON, générées par IA, sans droits tiers), la photo de l'auteur (en attente de deux autorisations), dix œuvres ou photos candidates (Rembrandt, Michel-Ange, trois planches de Doré, Schnorr von Carolsfeld, Bendemann, Tissot, chronique babylonienne du British Museum, porte d'Ishtar) et deux refus motivés (Chagall, bulle de Baruch).

Ma recommandation à Akissi : l'amandier de Kouamé en couverture, la carte, la frise et le fleuron à l'intérieur, deux à quatre gravures de Doré (Bible de Tours, 1866) en ouverture de partie, le Rembrandt en piste B de couverture et pour l'EPUB, mais pas en page intérieure en noir.

## FICHIERS

- `droits/images.md` : gabarits et tailles minimales, registre à 11 colonnes, raisons des choix, règles appliquées.
- `droits/credits.md` : page des crédits prête à composer, lignes en attente marquées [À VÉRIFIER], [À COMPLÉTER] ou [SI RETENUE].
- `droits/recommandation-iconographie.md` : recommandation d'une demi-page à Akissi.
- `rapports/T05-yao.md` : ce rapport.

Aucun fichier créé ni téléchargé dans `images/`. Manuscrit, `plan.md` et `journal.md` non modifiés.

## VÉRIFICATIONS

- `curl` vers l'API de recherche de Wikimedia Commons : « CONNECT tunnel failed, response 403 », code 000.
- `curl` vers l'API d'Openverse : même réponse 403. Pas d'autre tentative, conformément à la consigne.
- Tailles calculées par script Python (pixels = mm ÷ 25,4 × 300, arrondi supérieur ; seuil 200 ppp). Exemples : pleine page avec fonds perdus 146 × 216 mm, 1725 × 2552 px ; zone de composition 105 × 177 mm, 1241 × 2091 px ; demi-page 105 × 88 mm, 1241 × 1040 px ; couverture complète avec dos de 12 mm, 298 × 216 mm, 3520 × 2552 px.
- Contrôle du registre par script : 17 lignes, toutes à 11 colonnes, aucune au statut VALIDÉE.
- Contrôle des règles d'écriture sur les trois fichiers de `droits/` : zéro tiret cadratin ou demi-cadratin, zéro émoji, zéro gras, aucun mot de la liste à éviter.
- Non vérifié : licences, titres exacts des planches, numéros d'inventaire, dimensions réelles des fichiers, conditions de Gallica, du Vatican, des musées de Berlin, du Jewish Museum et du British Museum, conditions du jour d'Amazon KDP pour la déclaration IA.

## HYPOTHÈSES

- Zone de composition de 105 × 177 mm, déduite des marges de `livre.yaml`.
- Dos de 12 mm pour la couverture complète (160 à 190 pages) ; plage calculée de 9 à 15 mm, en attendant la valeur de Salif.
- Trois ou quatre parties dans le livre, en attendant le plan détaillé de Konan (`manuscrit/00-plan-detaille.md` absent à l'heure de ce rapport).
- Photo de l'auteur au format 40 × 50 mm en quatrième, à ajuster par Affoué.
- Intérieur en noir sur papier non couché, d'où le refus du Rembrandt en page intérieure.

## POINTS OUVERTS ET RISQUES

- Toutes les images tierces sont inutilisables tant que leur licence n'a pas été lue sur une connexion qui atteint Commons, le Rijksmuseum et Internet Archive. Solution de repli sans réseau : numériser un exemplaire original de la Bible de Doré (Tours, Mame, 1866).
- Titres de planches, graveurs, numéro d'inventaire du Rembrandt (SK-A-3276), dates de Michel-Ange et attribution du Bendemann sont donnés de mémoire et marqués [À VÉRIFIER]. Une planche de Doré sur la chute de Jérusalem (IMG-ART-05) peut ne pas exister.
- Photo de l'auteur : il faut la photo originale, la cession écrite du photographe et l'autorisation de l'auteur (point à transmettre à Mariam pour ses brouillons de courriers).
- Kouamé : demander l'origine du tracé géographique de la carte et vérifier à la livraison que les SVG n'incorporent ni image matricielle ni police sous licence restrictive.
- Les images générées par IA ne sont peut-être pas protégeables par le droit d'auteur : Forlife Imprim ne pourra pas forcément s'opposer à leur reprise par d'autres.
- La mention IA dans la page des crédits est une proposition : formulation à trancher par Akissi et l'auteur.

## PART GÉNÉRÉE PAR IA

Images : IMG-COUV, IMG-CARTE, IMG-FRISE et IMG-FLEURON, produites par Kouamé, à déclarer comme images générées par IA. Texte : la page des crédits (`droits/credits.md`) est rédigée par l'agent et restera dans le livre. Aucune image produite par Yao.

## SUITE PROPOSÉE

1. Dès qu'une connexion le permet, lire les pages de Rijksmuseum (SK-A-3276), de Wikimedia Commons (planches de Doré) et d'Internet Archive, télécharger les fichiers retenus dans `droits/` en attente (pas dans `images/`), mesurer leurs pixels et passer les lignes conformes à VALIDÉE.
2. Akissi : arbitrer la recommandation (couverture Kouamé, Doré en ouverture de partie) après le plan de Konan, puis me donner le nombre de parties.
3. Salif : confirmer l'épaisseur du dos pour recalculer la couverture complète.
4. Mariam : préparer les brouillons d'autorisation pour la photo de l'auteur et la cession du photographe.
5. Affoué : composer la page des crédits à partir de `droits/credits.md` après validation des lignes.
