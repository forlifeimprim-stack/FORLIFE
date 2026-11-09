# Rapport T06 : bible visuelle, carte, frise des rois, couverture, fleuron

Kouamé (illustration), 9 novembre 2026. Tâche reprise après la levée de la limite d'utilisation signalée par Akissi.

## STATUT

TERMINÉ, avec des dates et des CMJN à confirmer (voir « Points ouverts »).

## RÉSUMÉ

La bible visuelle est écrite dans `charte/illustration.md` : style en trois phrases, palette de sept couleurs (hexadécimal, CMJN estimé, clarté et gris équivalent), gris de l'intérieur, motifs tirés du texte (amandier, chaudière, joug, rouleau, remparts, aube), règles, zones de la couverture en millimètres. Cinq SVG sont produits en aplats et à leur taille finale, avec leurs PNG à 300 ppp, tous regardés et corrigés avant livraison. La carte et la frise sont en gris neutre strict, avec des étiquettes typographiques en EB Garamond qui restent modifiables. La couverture n'a aucun texte et réserve le tiers supérieur au titre.

Réponse à Yao sur l'origine du fond de carte : je l'ai dessiné moi-même. Les côtes, les fleuves, les mers et les positions des villes sont une suite de coordonnées approximatives (longitude, latitude) que j'ai saisies à la main dans `images/generer_illustrations.py`, de mémoire de géographie générale, puis lissées par programme. Aucune base de données ni aucune carte existante n'a été téléchargée ou décalquée (ni Natural Earth, ni Wikimedia, réseau fermé de toute façon). Il n'y a donc aucun droit de tiers sur le tracé. En revanche, la précision n'a pas été contrôlée contre un atlas : la carte est dite « schématique, positions approximatives ». Les identifications de sites sont celles qui ont cours : Tell en-Nasbeh pour Mitspa, er-Ram pour Rama, Ras el-Kharrubeh ou Anata pour Anathoth, Tell Defenneh pour Tachpanès.

## FICHIERS

Produits, tous dans `/home/user/FORLIFE/livres/jeremie/.edition/` :

| Fichier | Taille finale | PNG | Usage |
|---|---|---|---|
| `charte/illustration.md` | | | bible visuelle |
| `images/carte-monde-jeremie.svg` | 120 × 170 mm | `.png` 1418 × 2008 px, gris, 300 ppp ; `-ecran.png` 1695 × 2400 px | carte pleine page intérieure |
| `images/frise-rois-juda.svg` | 105 × 78 mm | `.png` 1241 × 922 px, gris, 300 ppp ; `-ecran.png` 2401 × 1783 px | frise pleine largeur, sans rotation |
| `images/couverture-amandier.svg` | 146 × 216 mm | `.png` 1725 × 2552 px, RVB, 300 ppp | plat 1 avec remparts |
| `images/couverture-amandier-sans-remparts.svg` | 146 × 216 mm | `.png` 1725 × 2552 px, RVB, 300 ppp | variante plus calme |
| `images/fleuron-amandier.svg` | 30 × 9 mm | `.png` 355 × 107 px, RVBA, 300 ppp | ornement de chapitre |
| `images/generer_illustrations.py` | | | régénère tous les SVG et PNG |

Lus : `charte/protocole-equipe.md`, `fiche-projet.md`, `plan.md`, `journal.md`, `livre.yaml`, `charte/lexique.txt`, `droits/images.md`. `charte/style.md` n'existait pas au moment du travail ; j'ai suivi le lexique d'Amenan pour les noms.

## VÉRIFICATIONS

- Noms de lieux contre la LSG 1910 (`outils/verset.py --chercher` et recherche directe dans `sources/lsg1910/lsg.json`). Deux graphies du brief n'existent pas dans la LSG et sont corrigées sur la carte : « Karkemisch » devient Carkemisch (Jérémie 46:2) et « Taphnès » devient Tachpanès (Jérémie 2:16, 43:7, 44:1), conformément au lexique d'Amenan. « Tigre » est absent de la LSG, qui dit Hiddékel (Genèse 2:14, Daniel 10:4) : étiquette « Tigre (Hiddékel) ». « Méditerranée » et « mer Morte » sont absents : étiquettes « Grande mer (Méditerranée) » (Nombres 34:6) et « Mer Salée » (Genèse 14:3). Trouvés tels quels : Anathoth (Jérémie 1:1), Mitspa (40:6), Rama (40:1), Meguiddo (2 Rois 23:29), Babylone, Juda, Jérusalem, Nil (Jérémie 2:18), Euphrate, Ribla (Jérémie 39:5), Noph (44:1), Jéricho (39:5), Jourdain (12:5), Chaldée (50:10), désert de Juda (Psaumes 63:1), mer Rouge (Jérémie 49:21). La source écrit « Egypte » sans accent ; la carte suit le lexique (« Égypte »).
- Ouverture des SVG : les cinq fichiers se lisent comme XML valide (`xml.etree.ElementTree`) avec les bonnes dimensions en mm, et cairosvg les convertit sans erreur.
- Résolution : pour chaque PNG, pixels ≥ mm ÷ 25,4 × 300, contrôlé par script. Carte 1418 × 2008 pour 1418 × 2008 requis ; frise 1241 × 922 pour 1241 × 922 ; couvertures 1725 × 2552 pour 1725 × 2552 ; fleuron 355 × 107 pour 355 × 107. Métadonnée 300 ppp écrite dans chaque PNG d'impression.
- Gris : carte et frise enregistrées en niveaux de gris ; avant conversion, 0 pixel non neutre compté sur chacune.
- Regard sur chaque PNG (outil Read) et corrections faites : carte, étiquettes « Euphrate » (croisait le fleuve puis Carkemisch), « Égypte » (croisait le Nil et le golfe de Suez), « Mer Rouge » (débordait sur la côte), « Juda » (touchait la mer Salée), échelle de l'encart qui chevauchait « Mer Salée », encart agrandi pour remplir la page ; frise, barre de Jojakin qui laissait un vide avant Sédécias, libellé du ministère reformulé ; couverture, jonction du rameau inférieur qui faisait un moignon plat, échancrure des pétales adoucie, contrôle en niveaux de gris ; fleuron, boutons coupés aux bords et pétales fondus en tache noire.
- Contrôle de la couverture en gris (conversion du PNG) : fleurs lisibles partout, branche lisible sauf sur l'indigo, d'où la règle écrite dans la bible visuelle.
- Correction Akissi (contrôle de la carte, Jérusalem trop près de la côte) : mesurée, non appliquée, décision à prendre par Akissi. J'ai mesuré les distances sur le tracé lissé réellement dessiné, à l'échelle de la barre (12,9 mm pour 200 km). Jérusalem est à 51 km du point de côte le plus proche et à 56 km de la côte à sa latitude. La mer Salée est à 20 km. Meguiddo est à 24 km de la côte. Les distances demandées (environ 55 km de la mer, environ 25 km de la mer Salée) sont donc déjà respectées. Décaler Jérusalem vers l'est la rapprocherait de la mer Salée et fausserait les deux mesures, je ne l'ai donc pas fait. L'impression de proximité tient à l'échelle (55 km font 3,6 mm) et aux symboles : le carré de 2,1 mm et le cadre pointillé de l'encart, dont le bord ouest passe à 20 km à l'ouest de Jérusalem. Pour Meguiddo, j'obtiens 24 km avec les coordonnées usuelles (35,18 E ; 32,585 N) [À VÉRIFIER : les 30 km cités viennent peut-être d'une mesure vers la baie de Haïfa ou d'une distance par la route]. J'ai régénéré les fichiers avec `generer_illustrations.py`, les sommes MD5 de `carte-monde-jeremie.svg` et `.png` sont inchangées, et j'ai regardé le PNG en agrandissement sur la Judée. Si Akissi veut quand même aérer la côte, il faut toucher aux symboles, pas à la géographie : retirer le cadre pointillé de l'encart sur la grande carte ou réduire le carré de Jérusalem. Je fais l'un ou l'autre sur sa demande.
- Non vérifié : rendu dans WeasyPrint et dans une liseuse EPUB (Affoué et Désiré), CMJN réel (pas de profil ICC d'imprimeur dans la session), précision géographique contre un atlas.

## Dates retenues pour la frise

Toutes avant Jésus-Christ, précédées de « vers » sur la frise, avec la mention « dates approximatives (chronologie usuelle) ». Durées de règne vérifiées dans la LSG.

| Élément | Date affichée | Appui biblique | Sûreté |
|---|---|---|---|
| Josias | vers 640-609 | 2 Rois 22:1 (trente et un ans) | usuelle |
| Joachaz | vers 609, trois mois | 2 Rois 23:31 | usuelle |
| Jojakim | vers 609-598 | 2 Rois 23:36 (onze ans) | usuelle |
| Jojakin | vers 598-597, trois mois | 2 Rois 24:8 | usuelle |
| Sédécias | vers 597-586 | 2 Rois 24:18 (onze ans) | [À VÉRIFIER : fin en 587 ou 586 selon la chronologie retenue par l'auteur] |
| Guedalia, gouverneur | à partir de 586, fin en pointillé vers 582 | Jérémie 40:5, 41:1 ; 2 Rois 25:25 | [À VÉRIFIER : l'année du meurtre n'est pas donnée par le texte (« au septième mois ») ; certains la placent en 586, d'autres la rapprochent de la déportation de la vingt-troisième année de Nebucadnetsar (Jérémie 52:30, vers 582). La barre pointillée jusqu'à 582 est indicative.] |
| Appel de Jérémie | vers 627 | Jérémie 1:2 (treizième année de Josias) | usuelle (627 ou 626) |
| Réforme de Josias | vers 622 | 2 Rois 22:3 (dix-huitième année) | [À VÉRIFIER : 2 Chroniques 34:3 fait commencer la purification la douzième année, vers 628 ; la frise retient 622, année de la découverte du livre de la loi] |
| Bataille de Carkemisch | vers 605 | Jérémie 46:2 (quatrième année de Jojakim) | usuelle |
| Déportation de Jojakin | vers 597 | 2 Rois 24:12-16 ; Jérémie 52:28 | [À VÉRIFIER : le brief disait « première déportation » ; j'ai écrit « Déportation de Jojakin » parce que Daniel 1:1-3 rapporte un départ de captifs dès la troisième année de Jojakim, vers 605. Jérémie 52:28 (« la septième année ») et 2 Rois 24:12 (« la huitième année ») diffèrent d'un an selon le mode de comptage.] |
| Chute de Jérusalem | vers 587-586 | Jérémie 52:12 (dix-neuvième année de Nebucadnetsar) | usuelle, double date volontaire |
| Ministère de Jérémie | vers 627, jusqu'après 586, en Égypte | Jérémie 1:2-3, 43:7, 44:1 | fin non datée par le texte |

## HYPOTHÈSES

- Les dates suivent la chronologie usuelle (type Thiele) que cite `fiche-projet.md` ; aucune autre chronologie n'a été consultée (réseau fermé).
- La frise tient en 105 × 78 mm sans rotation : elle peut aller en pleine largeur dans une page portrait. Si Affoué la veut à l'italienne, le SVG se redimensionne sans perte.
- Joachaz et Jojakin portent le nom du lexique ; Jérémie les appelle Schallum (22:11) et Jeconia (24:1). La frise n'affiche pas ces seconds noms, faute de place ; la légende peut les donner.
- Meguiddo figure sur la carte bien qu'absent du livre de Jérémie (2 Rois 23:29), comme le demandait le brief. J'ai ajouté Ribla, Noph et Jéricho, cités dans Jérémie 39:5 et 44:1, et Chypre sans nom.
- Les murailles de la couverture sont une silhouette générique de l'âge du fer, sans reconstitution archéologique de Jérusalem.

## POINTS OUVERTS ET RISQUES

- Police : les SVG appellent « EB Garamond ». Sans la police installée, le texte de la carte et de la frise change de police au rendu. Affoué ou Désiré installent les TTF (commande dans `charte/illustration.md`) ou utilisent les PNG. Je n'ai pas converti le texte en contours pour garder les étiquettes corrigeables.
- CMJN estimé, non converti avec un profil ICC : Salif et Affoué confirment sur épreuve. L'indigo et l'écorce montent à 245 % et 260 % d'encrage, à valider avec l'imprimeur.
- Le gris à 10 % de la frise (période de Guedalia) risque de disparaître sur papier bouffant.
- Dates marquées [À VÉRIFIER] ci-dessus : à trancher par l'auteur ou par Akissi, puis à aligner avec l'annexe chronologique de Konan. Une modification se fait dans `frise()` de `images/generer_illustrations.py`, puis `python3 images/generer_illustrations.py`.
- Pour Yao : la ligne IMG-CARTE de `droits/images.md` peut lever son [À VÉRIFIER] avec la réponse ci-dessus (tracé dessiné par Kouamé, sans base de données ni carte source). Il reste à inscrire la variante `couverture-amandier-sans-remparts.svg` et les PNG `-ecran`. Le fleuron mesure 30 × 9 mm, pas 30 × 30.
- Pour Affoué : zone calme du titre de 0 à 85 mm depuis le haut du fichier (8 à 85 mm avec la marge de sécurité), seconde zone calme de 182 à 205 mm pour l'auteur.

## PART GÉNÉRÉE PAR IA

Toutes les images ci-dessous ont été créées par l'agent (Kouamé, IA) sous forme de code vectoriel écrit par lui, sans outil de génération d'images ni image source ; elles resteront dans le livre et sont à déclarer comme contenu généré par IA aux plateformes qui le demandent (Amazon KDP notamment).

| Image | Fichiers | Part IA |
|---|---|---|
| Carte « Le monde de Jérémie » | `carte-monde-jeremie.svg`, `.png`, `-ecran.png` | totale (tracé, mise en page, étiquettes) |
| Frise des rois de Juda | `frise-rois-juda.svg`, `.png`, `-ecran.png` | totale (dates à valider par l'auteur) |
| Illustration de couverture avec remparts | `couverture-amandier.svg`, `.png` | totale |
| Illustration de couverture sans remparts | `couverture-amandier-sans-remparts.svg`, `.png` | totale |
| Fleuron de chapitre | `fleuron-amandier.svg`, `.png` | totale |

Le texte de `charte/illustration.md` est aussi rédigé par l'agent ; c'est un document interne, il n'entre pas dans le livre.

## SUITE PROPOSÉE

Akissi fait trancher par l'auteur les dates [À VÉRIFIER] et le choix entre les deux variantes de couverture. Affoué place la couverture dans ses deux pistes et la carte et la frise dans sa maquette type, avec la police installée. Yao met à jour le registre. Si l'auteur veut des pictos de chapitre (chaudière, joug, rouleau), je les dessine dans le même style à partir des motifs décrits.
