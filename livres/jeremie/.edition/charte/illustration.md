# Bible visuelle

Tenue par Kouamé (illustration), 9 novembre 2026. Elle vaut pour la couverture, les images intérieures et les déclinaisons numériques du livre « La vie et le ministère prophétique du prophète Jérémie ». Les fichiers sont dans `images/` et se régénèrent avec `python3 images/generer_illustrations.py`.

## Style

Des aplats francs aux bords nets, sans dégradé ni texture, avec un trait fin couleur écorce réservé aux éléments du premier plan (fleurs, boutons). Le livre parle par symboles tirés du texte biblique : on montre la branche d'amandier, le rouleau ou les murailles, jamais le visage de Jérémie ni une personne réelle. La lumière raconte le message : une nuit qui finit et une aube qui se lève derrière Jérusalem, image du jugement suivi de l'espérance (Jérémie 1:11-12, 29:11).

## Palette de couverture

Sept couleurs, pas une de plus. Les valeurs CMJN sont des valeurs de départ estimées pour un couché offset (profil de type FOGRA39), à confirmer sur l'épreuve contractuelle avec le profil de l'imprimeur choisi par Salif [À VÉRIFIER : profil ICC et épreuve]. Le gris équivalent est calculé à partir de la clarté L* (100 % = noir).

| Nom | Rôle | Hexadécimal | CMJN estimé | Clarté L* | Gris équivalent |
|---|---|---|---|---|---|
| Indigo | ciel de fin de nuit, sol du premier plan, zone du titre | #1E2B47 | 90 75 35 45 | 18 | 82 % |
| Mauve | bande de ciel, colline et remparts lointains | #5B5378 | 70 65 25 15 | 37 | 63 % |
| Abricot | lueur de l'aube, porte de la ville | #E59B5E | 5 45 70 0 | 70 | 30 % |
| Sable | horizon, soleil, étamines | #F3D9B1 | 3 15 32 0 | 88 | 12 % |
| Écorce | branche, contour des fleurs | #2E211B | 50 65 70 75 | 14 | 86 % |
| Amande | pétales | #FAF0EA | 0 5 6 0 | 95 | 5 % |
| Carmin | cœur des fleurs, boutons | #B4475C | 20 80 50 8 | 46 | 54 % |

Encrage total maximal : 260 % (écorce), sous la limite usuelle de 300 %.

Lisibilité en gris, vérifiée sur une conversion de `couverture-amandier.png` en niveaux de gris. Les fleurs (5 %) se lisent sur tous les fonds. La branche (14) se lit sur l'abricot, le sable et le mauve, mais se confond avec l'indigo (18) : la règle est de ne jamais laisser l'écorce seule sur l'indigo, ce sont les fleurs et les boutons qui portent la pointe du rameau dans le ciel de nuit. Le carmin (46) et le mauve (37) sont proches en gris : ils ne se touchent jamais sans un contour écorce. La couverture étant imprimée en quadrichromie, ces deux réserves ne touchent que les reproductions en noir (presse, photocopie d'église, liseuse à encre électronique).

## Gris de l'intérieur

L'intérieur est imprimé en noir. Les images intérieures n'utilisent que du gris neutre (R = V = B), contrôlé pixel par pixel sur les PNG :

| Usage | Valeur | Gris |
|---|---|---|
| Texte, villes, cadres | #000000 | 100 % |
| Règne foncé (frise) | #5C5C5C | 64 % |
| Côtes | #6A6A6A | 58 % |
| Fleuves | #7C7C7C | 51 % |
| Règne clair (frise) | #A6A6A6 | 35 % |
| Mers et lacs | #D4D4D4 | 17 % |
| Période incertaine (frise) | #E6E6E6 | 10 % |

Le 10 % peut s'affaiblir sur un papier bouffant : si l'épreuve le montre, le monter à 15 % (#D9D9D9) [À VÉRIFIER sur épreuve].

## Motifs récurrents

Chaque motif renvoie à un passage précis de la LSG 1910 et peut devenir un picto en aplats ou un ornement noir.

- La branche d'amandier en fleur (Jérémie 1:11-12) : motif principal, sur la couverture et dans le fleuron de chapitre. Cinq pétales échancrés à la pointe, cœur carmin, étamines en couronne, boutons en goutte. L'amandier fleurit avant ses feuilles : aucune feuille verte.
- La chaudière bouillante « du côté du septentrion » (Jérémie 1:13) : marmite ronde à deux anses sur un feu, vapeur en trois volutes, inclinée vers le haut de l'image.
- Le joug de bois (Jérémie 27:2, 28:13) : barre courbe et liens, puis le joug de fer en variante sombre.
- Le rouleau (Jérémie 36, que la LSG appelle « un livre ») : rouleau à demi déroulé, lignes suggérées par des traits sans lettres, flamme d'un brasier pour Jérémie 36:23.
- Les remparts et les ruines de Jérusalem (Jérémie 39, 52, Lamentations) : tours carrées crénelées de l'âge du fer, pierres tombées.
- L'aube (Jérémie 31, Lamentations 3:22-23) : bandes de ciel de l'indigo vers le sable.

## Règles

- Aucun texte peint dans une illustration. Les seules lettres admises sont les étiquettes de la carte et de la frise, qui sont des éléments typographiques du SVG en EB Garamond (police libre, licence SIL OFL), donc modifiables et corrigeables.
- Noms propres dans la graphie de la LSG 1910 et du lexique d'Amenan (`charte/lexique.txt`), avec la capitale accentuée (Égypte).
- Aucun visage détaillé, aucune personne réelle, aucun personnage protégé, aucune imitation d'un artiste vivant.
- Aucun anachronisme visible : pas de dôme, de minaret ni de clocher sur Jérusalem ; les murailles sont celles de l'âge du fer.
- Personnages : ce livre n'en montre pas. Si un chapitre en demande un jour (Jérémie dans la citerne, Baruc qui écrit), on le traite en silhouette de dos, vêtement simple de laine écrue, sans traits du visage. Une illustration qui montre des familles d'aujourd'hui, par exemple un groupe d'étude biblique pour un encart pratique, représente des familles de Côte d'Ivoire telles qu'elles sont : tenues de ville ou pagnes, cadres urbains d'Abidjan ou de Bingerville comme villages, sans caricature ni costume folklorique.
- Décors : Jérusalem (murailles crénelées, porte en arc, maisons basses à toit plat, colline), Anathoth (collines pierreuses et amandiers au nord-est de Jérusalem), la vallée du Jourdain et la mer Salée (bandes horizontales, ton sable), l'Égypte de Tachpanès (palmiers, Nil en bande sombre).
- Toute image générée par un outil d'IA connecté suit cette bible (prompt rédigé à partir d'elle), est regardée puis refusée au moindre défaut, avec trois essais au plus, et porte la mention « générée par IA » au registre de Yao (`droits/images.md`).

## Couverture : `images/couverture-amandier.svg`

Plat 1 seul, 146 × 216 mm, fonds perdus de 3 mm compris (format rogné 140 × 210 mm). Coordonnées ci-dessous mesurées depuis le coin supérieur gauche du fichier, fonds perdus compris.

- Zone calme pour le titre : de 0 à 85 mm en hauteur (soit de 0 à 82 mm depuis le haut du format rogné), sur toute la largeur. Aplat indigo uni, aucun élément. Pour le texte, garder la marge de sécurité de 8 mm depuis le bord du fichier (5 mm depuis la coupe) : bloc utile de 8 à 138 mm en largeur, de 8 à 85 mm en hauteur. Un titre en sable (#F3D9B1) ou en amande (#FAF0EA) contraste fortement avec l'indigo.
- Zone de l'illustration : de 88 à 175 mm environ (branche, fleurs, soleil, remparts).
- Seconde zone calme pour le nom de l'auteur ou la mention « Biographie » : de 182 à 205 mm, aplat indigo, même marge de sécurité.
- Variante `images/couverture-amandier-sans-remparts.svg` : même composition sans la ville. Elle est plus calme et lit mieux en vignette de 2 cm de haut ; la version avec remparts dit davantage le sujet (Jérusalem). Choix à faire par Affoué sur ses deux pistes.
- Pour une couverture complète (dos et quatrième), Affoué prolonge les aplats : l'indigo du haut et du bas, les bandes de ciel horizontales se continuent sans raccord visible.

## Images intérieures

- `images/carte-monde-jeremie.svg` : 120 × 170 mm, zone de texte, sans fonds perdus. Carte principale en haut, encart des environs de Jérusalem en bas. Légende à composer hors image, par exemple : « Le monde de Jérémie. Positions approximatives ; noms selon la Louis Segond 1910. »
- `images/frise-rois-juda.svg` : 105 × 78 mm, pleine largeur de la zone de texte, lisible sans pivoter la page. Corps des étiquettes : 6 à 8 pt.
- `images/fleuron-amandier.svg` : 30 × 9 mm, noir seul (cœur des fleurs en réserve blanche), à poser sur fond blanc.

## Fichiers et rendu

Les SVG sont en millimètres à leur taille finale. Les étiquettes appellent la police « EB Garamond » : la machine qui convertit le SVG doit l'avoir installée, sinon le texte bascule sur une autre police. Les polices du projet sont en WOFF2 (`outils/ressources/polices/eb-garamond/`) ; pour les installer en TTF :

```bash
python3 -c "from fontTools.ttLib import TTFont; import glob,os; d=os.path.expanduser('~/.local/share/fonts/eb-garamond'); os.makedirs(d,exist_ok=True); [ (lambda t: (setattr(t,'flavor',None), t.save(os.path.join(d,os.path.basename(f)[:-6]+'.ttf'))))(TTFont(f)) for f in glob.glob('outils/ressources/polices/eb-garamond/*.woff2')]" && fc-cache -f
```

Les PNG livrés à côté de chaque SVG sont calculés à 300 ppp à la taille finale (niveaux de gris pour la carte et la frise, RVB pour la couverture). Des versions `-ecran.png` de 2 400 px sur le grand côté servent à l'EPUB et au PDF écran. Pour l'impression de la couverture, Affoué part du SVG et fait la conversion en CMJN dans son outil de mise en page avec le profil de l'imprimeur.
