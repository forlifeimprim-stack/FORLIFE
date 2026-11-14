# Rapport T28 : contrôle des fichiers de 224 pages, devis et BAT mis à jour

Agent : Salif (fabrication). Date : 14 novembre 2026.

## Statut

PARTIEL. Les deux PDF passent le contrôle sans échec. Les brouillons de devis et la fiche de BAT sont à
jour, mais l'envoi reste bloqué par douze points (ISBN, dépôt légal, prix, devis, marques de l'auteur
et marques « À VÉRIFIER », validation du texte).

## Résumé

`sortie/interieur.pdf` compte 224 pages (14 cahiers de 16, dont 5 pages blanches finales) et
`couverture/couverture-gabarit.pdf` (piste C) mesure 298,60 × 216 mm avec un dos de 12,60 mm. Les deux
satisfont `exigences-fichiers.md`. Le dos recalculé pour 224 pages (112 feuilles) donne 11,20 mm en
offset 80 g, 12,60 mm en offset 90 g et 16,13 mm en bouffant 80 g. Le gabarit d'Affoué correspond à
l'offset 90 g. Les demandes de devis portent désormais sur 224 pages (6 lignes de grille au lieu de 12).
La fiche de BAT est refaite avec les nouvelles empreintes, toujours « BAT NON ACCORDÉ ».

## Fichiers

- `.edition/fabrication/fiche-fabrication.md` : section « Pagination réelle (14 novembre 2026) », synthèse à 224 pages et piste C ; la section de 160 pages est gardée comme historique.
- `.edition/fabrication/devis/01-forlife-imprim.md`, `02-imprimeur-b.md`, `03-imprimeur-c.md` : pagination 224, dos calculé indiqué, grille de réponse réduite à 224 pages en offset 90 g et 80 g, graphie « Élisée », genre « biographie et étude biblique ». En-tête « BROUILLON, NE PAS ENVOYER SANS ACCORD » conservé ; aucun prix.
- `.edition/fabrication/bat/fiche-bat.md` : 224 pages, piste C, dos 12,60 mm, empreintes du 14 novembre, points d'épreuve mis à jour.
- `.edition/fabrication/bat/bloquants.md` : douze points bloquants à jour.

## Vérifications

- `python3 fabrication/controle_pdf.py interieur sortie/interieur.pdf --cahier 16` : 224 pages ; boîtes conformes sur 224 pages (coupe 140 × 210 mm, fonds perdus 3 mm) ; texte en noir seul (DeviceCMYK 0 0 0 1 et DeviceGray) ; 9 polices incorporées ; aucune image ; 0 échec, 1 point à voir. Code de sortie 0.
- `python3 fabrication/controle_pdf.py couverture couverture/couverture-gabarit.pdf --dos 12.6` : une page, coupe 292,6 × 210 mm, fonds perdus 3 mm, ni RVB ni noir enrichi, 9 polices incorporées ; 0 échec, 0 point à voir.
- `pdffonts` : `emb` à `yes` sur les 9 polices de l'intérieur (EB Garamond Livre, Alegreya Sans) et sur les 9 de la couverture (Barlow Condensed, Fraunces, EB Garamond Livre, Alegreya Sans).
- `pdfinfo` : intérieur 224 pages de 413,858 × 612,283 pt (146 × 216 mm) ; couverture 846,425 × 612,283 pt (298,6 × 216 mm).
- `sha256sum` : intérieur `b2c4710e6ee269a87e83dc79f3785c86a7aed42e0f284c6b17682ef06db67c5d` (identique au rapport T25), couverture `91f346d9588d69cfba13d0efcbb3510e2b2862e1bf25e24c4e78473b20b78e71`.
- Gris tramés : un relevé des couleurs de texte page par page les situe uniquement sur la frise (page 203) et la carte (page 208). Ce sont les mêmes étiquettes qu'en T19, jugées alors lisibles sur rendu : elles ne bloquent pas, et restent à vérifier sur épreuve.
- `pdftotext`, avec le texte remis bout à bout pour compter les marques coupées en fin de ligne : 15 « À COMPLÉTER » (4 dans les mentions légales, 10 à compléter par l'auteur, plus une sans « PAR L'AUTEUR », à identifier) et 26 « À VÉRIFIER ». Couverture : « ISBN à venir », « Prix : [À COMPLÉTER ...] ».
- Pages sans texte : 200, puis 220 à 224 (les 5 pages blanches finales annoncées par Affoué).
- Aucun tiret cadratin ni demi-cadratin dans les fichiers de `fabrication/`.

Je n'ai pas regardé le rendu de la couverture piste C, car Akissi l'a vérifié en T25. Aussi non
vérifiés : la couverture d'encre maximale et la conformité à un profil ICC (pas de profil d'imprimeur,
pas de Ghostscript).

## Hypothèses

- Offset 90 g de main 1,25 : le dos de 12,60 mm reste un calcul tant que l'imprimeur n'a pas répondu.
- Pelliculage mat maintenu, sous réserve d'une épreuve pelliculée : le fond encre sombre de la piste C est le cas où le mat marque le plus les rayures (réserve de T08).

## Points ouverts et risques

- Bloquants (détail dans `fabrication/bat/bloquants.md`) : ISBN et code-barres, dépôt légal, mention de l'imprimeur, prix public, aucun devis reçu, profil ICC et dos réel inconnus, 10 marques de l'auteur, 26 marques « À VÉRIFIER », validation du texte complet par l'auteur, tirage et procédé, épreuves complètes de la version de 224 pages, épreuve pelliculée de la piste C.
- Le livre passe de 160 à 224 pages : le coût d'impression par exemplaire augmentera. Aucun prix n'est disponible, et `cout-de-revient.md` reste vide.
- Les 5 pages blanches finales pourraient devenir des pages de notes. C'est une suggestion pour Akissi, sans effet sur la fabrication.
- Pour Akissi : mise à jour du statut de T28 dans `plan.md` (fichier non modifié par moi).

## Part générée par IA

Aucune dans cette tâche : les documents de fabrication n'entrent pas dans le livre.

## Suite proposée

1. Utilisateur : accord écrit pour envoyer les trois demandes de devis, et noms et contacts des imprimeurs B et C.
2. Mariam pour l'ISBN et le dépôt légal ; l'auteur pour ses dix marques et la validation du texte ; Konan et Amenan pour les marques « À VÉRIFIER ».
3. Après les devis : prix public décidé par l'utilisateur, fichiers définitifs, nouveau contrôle, nouvelle fiche de BAT signée par l'utilisateur.
