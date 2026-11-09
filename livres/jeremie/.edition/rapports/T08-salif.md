# Rapport T08 : fiche de fabrication préliminaire et demandes de devis en brouillon

Agent : Salif (fabrication). Date : 9 novembre 2026.

## Statut

TERMINÉ (fiche préliminaire : les valeurs de l'imprimeur et les prix restent à obtenir).

## Résumé

Format fini 140 × 210 mm, broché, dos carré collé. Pagination estimée entre 176 et 185 pages, arrondie
au cahier de 16 pages : 176 pages (11 cahiers) ou 192 pages (12 cahiers). Recommandations : intérieur en
offset blanc 90 g imprimé en noir, couverture 300 g couché en quadrichromie avec pelliculage mat,
colle PUR. Procédé : numérique à 300 exemplaires, les deux procédés à chiffrer à 500, offset à 1 000.

Dos calculé par la formule pages ÷ 2 × grammage × main ÷ 1 000, avec des mains indicatives (offset 1,25,
bouffant 1,8). En offset 90 g : 9,9 mm pour 176 pages, 10,8 mm pour 192 pages, soit un gabarit de
couverture de 295,9 mm ou 296,8 mm de large sur 216 mm de haut, fonds perdus compris. Valeurs à
remplacer par celles de l'imprimeur, idéalement mesurées sur une maquette en blanc.

Les trois demandes de devis sont en brouillon, marquées « BROUILLON, NE PAS ENVOYER SANS ACCORD », et
reprennent le même cahier des charges avec une grille de réponse de 12 configurations, plus les options.
Aucun courriel n'a été envoyé. Le modèle de coût de revient et de point mort ne contient aucun prix.

J'ai aussi écrit deux petits outils pour T19 : `controle_pdf.py` (contrôle complet d'un PDF intérieur
ou couverture) et `noir_seul.py` (passe le noir RVB de WeasyPrint en DeviceGray). En les testant, j'ai
constaté que WeasyPrint écrit le texte noir en RVB (0 0 0 rg), ce qui ne respecte pas l'exigence du
100 % K : solution documentée pour Affoué.

## Fichiers

- `.edition/fabrication/fiche-fabrication.md` : fiche de fabrication, calculs du dos et du gabarit, procédé selon le tirage, délais à demander.
- `.edition/fabrication/exigences-fichiers.md` : liste de contrôle des fichiers (intérieur I1 à I11, couverture C1 à C8), commandes de contrôle pour T19, point sur le noir de WeasyPrint et sur le PDF/X.
- `.edition/fabrication/devis/01-forlife-imprim.md` : demande de devis à Forlife Imprim (tarif client et coût interne demandés séparément).
- `.edition/fabrication/devis/02-imprimeur-b.md`, `.edition/fabrication/devis/03-imprimeur-c.md` : demandes aux imprimeurs B et C, destinataires en `[À COMPLÉTER : nom et contact de l'imprimeur]`.
- `.edition/fabrication/cout-de-revient.md` : modèle de coût de revient, de point mort, de comparaison de trois prix publics et de comparaison des devis.
- `.edition/fabrication/controle_pdf.py` : contrôle des boîtes, du nombre de pages, des polices, des images, de la couleur du texte, de l'OutputIntent, empreinte SHA-256.
- `.edition/fabrication/noir_seul.py` : conversion des gris neutres RVB en DeviceGray, sur une copie.

## Vérifications

- Calculs du dos et du gabarit refaits en Python : 176 p. donnent 8,8 / 9,9 / 12,672 mm (offset 80, offset 90, bouffant 80) ; 192 p. donnent 9,6 / 10,8 / 13,824 mm ; largeurs avec fonds perdus 294,8 / 295,9 / 298,672 et 295,6 / 296,8 / 299,824 mm. Identiques aux tableaux de la fiche (arrondis au dixième pour le bouffant).
- Pagination : 40 000 ÷ 300 = 133,3, soit 134 p. ; 40 000 ÷ 280 = 142,9, soit 143 p. ; totaux 176 et 185 pages ; 176 = 11 × 16, 192 = 12 × 16 = 6 × 32, 176 n'est pas un multiple de 32.
- `controle_pdf.py` testé sur des PDF produits avec WeasyPrint 70.0 dans le dossier temporaire de la session (hors du dossier du livre) :
  - intérieur avec noir CSS : « ÉCHEC texte hors noir seul (100 % K attendu) : DeviceRGB 0 0 0 » ;
  - image RVB à 95 ppp : « ÉCHEC page 1 : image à 95 ppp » et « À VOIR image en rgb » ; image grise à 300 ppp : OK ;
  - page unique : « ÉCHEC nombre de pages impair » et « À VOIR ... 15 page(s) blanche(s) à prévoir » ;
  - boîtes 140 × 210 mm et 3 mm de fonds perdus : OK ; polices EB Garamond incorporées : OK ;
  - couverture de 290,8 mm contrôlée avec `--dos 10.8` : OK ; avec `--dos 9.6` : « ÉCHEC format coupé 290.8 × 210.0 mm, attendu 289.6 » ; sans `--dos` : « dos déduit de la TrimBox : 10.80 mm » ;
  - texte en `device-cmyk(0 0 0 1)` : accepté ; noir RVB sur la couverture : ÉCHEC.
- `noir_seul.py` testé : après conversion, le même intérieur passe à « OK texte en noir seul : DeviceGray 0; DeviceGray 0.2; DeviceGray 0.4 » ; une couleur rouge est laissée en RVB et signalée (code de sortie 1). Rendu de la page converti en image et regardé : texte, image et SVG intacts.
- Commande pikepdf des boîtes de `exigences-fichiers.md` lancée telle quelle : MediaBox 146 × 216 mm, TrimBox 140 × 210 mm.
- Essai PDF/X-4 de WeasyPrint 70.0 : aucun OutputIntent produit, constaté avec le script et dans le code de WeasyPrint.
- Relecture des fichiers produits : aucun tiret cadratin ni demi-cadratin, aucun émoji, aucun gras (recherche par expression régulière) ; aucun montant en FCFA autre que « 0 FCFA » dans une consigne de saisie.

Non vérifié : mains réelles des papiers, valeur du dos chez un imprimeur, coût de l'ISBN, nombre d'exemplaires du dépôt légal, régime de TVA du livre en Côte d'Ivoire (sites inaccessibles le 9 novembre 2026). Aucun vrai PDF du livre n'existe encore : les outils n'ont tourné que sur des fichiers de test.

## Hypothèses

- Densité de 280 à 300 mots par page pleine, texte autour de 11 pt dans le rectangle de 105 × 177 mm donné par `livre.yaml` ; 14 ouvertures en belle page, 8 pages liminaires, 16 pages d'annexes.
- Mains indicatives : offset 1,25, bouffant 1,8 ; dos calculé sans couverture ni colle.
- Cahier de 16 pages en offset ; nombre pair de pages en numérique.
- Couverture non imprimée au verso ; pelliculage au recto seulement.
- Livraison à l'adresse de Forlife Imprim à Bingerville.
- Seuil numérique et offset selon la fiche de rôle (300 à 500 exemplaires), à confirmer sur devis.

## Points ouverts et risques

- Décision de l'utilisateur : accord écrit pour envoyer les demandes de devis, choix des imprimeurs B et C, signataire des courriers. Rien n'est envoyé.
- Forlife Imprim est à la fois éditeur pressenti et imprimerie de l'auteur : une remarque interne dans le brouillon n° 1 explique la double demande (tarif client et coût interne) ; elle est à retirer avant envoi.
- Pour Affoué (T07, T16, T17) : dos de travail 9,9 ou 10,8 mm, gabarit à dos variable, 3 mm de fonds perdus, textes à 5 mm de la coupe ; écrire les noirs en `device-cmyk(0 0 0 1)` ou passer l'intérieur par `noir_seul.py` ; pages test attendues pour recaler la pagination.
- Pour Kouamé (T06) : carte et frise en niveaux de gris neutres, traits d'au moins 0,25 pt, éviter les gris trop proches ; si la couverture repose sur de grands aplats sombres, le pelliculage mat est à revoir sur échantillon.
- Pour Mariam (T02) : délais de fabrication à intégrer au rétroplanning une fois connus ; nombre d'exemplaires du dépôt légal, coût éventuel de l'ISBN, base et taux des droits d'auteur dans le contrat, régime de TVA.
- Pour Akissi : mise à jour du statut de T08 dans `plan.md` (fichier non modifié par moi).
- Risque : si l'imprimeur exige un PDF/X avec son profil, la chaîne actuelle (WeasyPrint sans Ghostscript) ne produit pas d'OutputIntent valide ; il faudra un outil de conversion et de contrôle.
- Limite de `controle_pdf.py` : motifs et dégradés non analysés couleur par couleur ; couverture d'encre maximale non contrôlable sans profil.

## Part générée par IA

Aucune : rien de ce que j'ai produit n'entre dans le livre. Les fiches, brouillons et scripts sont des documents de fabrication internes.

## Suite proposée

1. Obtenir l'accord de l'utilisateur sur les brouillons, et les noms et contacts des imprimeurs B et C.
2. À réception des devis : saisir la grille dans `cout-de-revient.md`, remplacer mains et dos par les valeurs des imprimeurs, présenter deux ou trois prix publics avec leur point mort pour décision de l'utilisateur.
3. Dès les pages test d'Affoué : recompter la densité et confirmer 176 ou 192 pages.
4. En T19 : `controle_pdf.py` sur `sortie/interieur.pdf` et `couverture/couverture.pdf`, préparation du BAT avec les empreintes SHA-256, signature par l'utilisateur, contrôle d'un échantillon à la livraison.
