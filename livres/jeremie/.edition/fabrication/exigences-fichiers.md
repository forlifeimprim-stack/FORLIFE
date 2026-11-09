# Exigences des fichiers à livrer à l'imprimeur

Établi le 9 novembre 2026 par Salif (T08), pour Affoué (maquette, T07, T16, T17) et pour le contrôle
avant BAT (T19). Ce sont les exigences par défaut de l'équipe. Dès qu'un imprimeur est retenu, ses
propres exigences, notées dans sa réponse au devis, priment sur cette liste, et la liste sera mise à jour.

## Liste de contrôle

Intérieur (`sortie/interieur.pdf`)

| N° | Exigence | Contrôle |
|---|---|---|
| I1 | Un seul PDF, pages à l'unité (pas de planches ni de doubles pages), dans l'ordre de lecture, pages blanches comprises | `controle_pdf.py` : nombre de pages, TrimBox de 140 mm de large |
| I2 | Nombre de pages pair, et multiple de 16 en offset (multiple exact à confirmer selon le cahier de l'imprimeur) | `controle_pdf.py` (option `--cahier`) |
| I3 | Format coupé 140 × 210 mm déclaré en TrimBox, fonds perdus de 3 mm déclarés en BleedBox (page de 146 × 216 mm) | `controle_pdf.py` (pikepdf) |
| I4 | Éléments à fond perdu (carte, frise, aplats) prolongés jusqu'au bord des fonds perdus ; textes à 5 mm au moins du trait de coupe | contrôle visuel sur rendu des pages |
| I5 | Aucune trace de coupe dans la zone de fond perdu (sauf demande de l'imprimeur) | contrôle visuel |
| I6 | Toutes les polices incorporées (sous-ensembles acceptés) | `pdffonts` : colonne `emb` à `yes` partout |
| I7 | Images en niveaux de gris, 300 ppp au moins à la taille d'impression ; dessins au trait en 1 bit à 1 200 ppp au moins | `pdfimages -list` : colonnes `color`, `x-ppi`, `y-ppi` |
| I8 | Texte en noir seul, 100 % K : DeviceGray 0 ou CMJN 0/0/0/100, jamais de noir RVB ni de noir quadri | `controle_pdf.py` (couleur active à chaque affichage de texte) |
| I9 | Pas de couleur RVB ni CMJN non neutre dans l'intérieur, tracés vectoriels compris | `controle_pdf.py` |
| I10 | Pas de texte courant en gris tramé dans les petits corps (titres courants, légendes) sauf choix assumé | `controle_pdf.py` signale le gris tramé |
| I11 | Traits d'au moins 0,25 pt (usage courant, à confirmer par l'imprimeur) | contrôle visuel de la carte et de la frise à 400 % |

Couverture (`couverture/couverture.pdf`)

| N° | Exigence | Contrôle |
|---|---|---|
| C1 | Un seul PDF d'une seule page : quatrième, dos, première | `controle_pdf.py couverture` |
| C2 | Format coupé : (2 × 140 + dos) × 210 mm en TrimBox, avec le dos de l'imprimeur ; 3 mm de fonds perdus en BleedBox | `controle_pdf.py couverture --dos <valeur>` |
| C3 | Images 300 ppp au moins à la taille d'impression | `pdfimages -list` |
| C4 | Polices incorporées | `pdffonts` |
| C5 | Textes noirs (dont le code-barres EAN-13) en 100 % K, pas de noir RVB | `controle_pdf.py` |
| C6 | Quadrichromie CMJN. Conversion avec le profil ICC de l'imprimeur seulement s'il l'exige ; sinon, livrer selon ses consignes et faire valider la couleur sur l'épreuve | `controle_pdf.py` signale le RVB ; épreuve couleur au BAT |
| C7 | Couverture d'encre maximale (somme C + M + J + N) : valeur à demander à l'imprimeur | non contrôlable ici sans profil ni Ghostscript (voir limites) |
| C8 | Texte du dos centré, marge de sécurité d'au moins 1,5 mm de chaque côté du texte (à confirmer) ; textes des plats à 5 mm du trait de coupe | contrôle visuel sur rendu, avec les repères du gabarit |

Les deux fichiers : nommage stable (`interieur.pdf`, `couverture.pdf`, suivis d'une date ou d'un indice
de version pour le BAT), empreinte SHA-256 relevée au moment du BAT et reportée sur le bon à tirer, pour
qu'on puisse prouver que le fichier imprimé est celui qui a été signé.

## Point technique pour Affoué : le noir de WeasyPrint

WeasyPrint écrit les couleurs CSS en RVB : le noir `#000` devient `0 0 0 rg` dans le PDF. Je l'ai vérifié
le 9 novembre 2026 sur une page test (WeasyPrint 70.0) : le contrôle signale alors « texte hors noir seul
(100 % K attendu) : DeviceRGB 0 0 0 ». Converti par le RIP d'un imprimeur, ce noir peut devenir un noir à
quatre couleurs, flou en petit corps à cause du repérage. Deux solutions, à combiner si besoin :

1. Dans la CSS, écrire les couleurs de l'intérieur et les noirs de la couverture avec `device-cmyk()`,
   par exemple `color: device-cmyk(0 0 0 1)`. Vérifié sur une page test : WeasyPrint 70.0 écrit alors
   l'espace DeviceCMYK avec 0/0/0/1, accepté par le contrôle.
2. Après composition de l'intérieur, passer les gris neutres RVB en DeviceGray avec
   `python3 fabrication/noir_seul.py sortie/interieur.pdf sortie/interieur-noir.pdf`. Le script ne
   touche que les couleurs où rouge = vert = bleu, laisse le fichier d'origine intact et signale toute
   couleur non neutre, à corriger à la source. Les SVG de Kouamé intégrés en vectoriel sont traités de
   la même façon s'ils sont en gris neutres.

Les images matricielles ne sont pas converties par ces outils : elles doivent être préparées en niveaux de
gris avant la composition.

Sur PDF/X : WeasyPrint 70.0 accepte `pdf_variant='pdf/x-1a'`, `'pdf/x-3'` ou `'pdf/x-4'`, mais mon essai
du 9 novembre 2026 en PDF/X-4 n'a produit aucun OutputIntent : le fichier porte des métadonnées PDF/X sans
profil de sortie, ce qui ne suffit pas à un imprimeur qui exige du PDF/X. Si l'imprimeur retenu l'exige,
il faudra son profil ICC et un outil de conversion et de contrôle (Ghostscript ou équivalent, absent de
la session). Sinon, un PDF standard qui passe la liste ci-dessus suffit.

## Commandes de contrôle (T19)

Les chemins sont relatifs à `.edition/`.

Contrôle complet, une commande par fichier. Code de sortie 1 si un point est en ÉCHEC :

```bash
python3 fabrication/controle_pdf.py interieur sortie/interieur.pdf --cahier 16
python3 fabrication/controle_pdf.py couverture couverture/couverture.pdf --dos 10.8
```

Sans `--dos`, le script déduit le dos de la TrimBox de la couverture et l'affiche, pour le comparer à la
valeur de l'imprimeur. Avec `--dos`, il vérifie que la couverture a exactement la largeur attendue.

Contrôles unitaires, si l'on veut voir les sorties brutes :

```bash
# Polices : la colonne « emb » doit valoir « yes » sur chaque ligne.
pdffonts sortie/interieur.pdf

# Images : « color » à gray pour l'intérieur, « x-ppi » et « y-ppi » à 300 au moins.
pdfimages -list sortie/interieur.pdf

# Boîtes de la page 1 en millimètres.
python3 -c "
import pikepdf, sys
pdf = pikepdf.open(sys.argv[1])
page = pdf.pages[0].obj
for nom in ('/MediaBox', '/BleedBox', '/TrimBox'):
    boite = page.get(nom)
    if boite is None:
        print(nom, 'absente'); continue
    x0, y0, x1, y1 = (float(v) * 25.4 / 72 for v in boite)
    print(nom, f'{x1 - x0:.2f} x {y1 - y0:.2f} mm', [round(v, 2) for v in (x0, y0, x1, y1)])
" sortie/interieur.pdf

# Rendu des pages en image pour le contrôle visuel (fonds perdus, dos, marges).
pdftoppm -r 100 -png -f 1 -l 8 sortie/interieur.pdf /tmp/controle-page
pdftoppm -r 100 -png couverture/couverture.pdf /tmp/controle-couverture

# Empreinte à reporter sur le BAT.
sha256sum sortie/interieur.pdf couverture/couverture.pdf
```

Essais réalisés le 9 novembre 2026 sur des PDF de test produits avec WeasyPrint (hors du dossier du
livre) : le script a bien détecté un noir RVB, une image RVB à 95 ppp, un nombre de pages impair, un dos
faux de 1,2 mm (couverture à 290,8 mm contrôlée avec `--dos 9.6`), et validé les boîtes à 3 mm, les
polices incorporées, une image en gris à 300 ppp et un texte en DeviceCMYK 0/0/0/1.

## Limites connues

- Pas de Ghostscript ni de profil ICC dans la session : la couverture d'encre maximale et la conversion
  CMJN avec profil ne peuvent pas être contrôlées ici.
- Le script lit les couleurs des flux de pages et des formulaires (XObject Form). Les motifs (Pattern) et
  les dégradés (Shading) ne sont pas analysés couleur par couleur : ils se vérifient à l'œil sur le rendu.
- DeviceGray s'imprime sur la seule plaque noire chez la plupart des imprimeurs ; à confirmer avec
  l'imprimeur retenu (question posée dans les devis).
