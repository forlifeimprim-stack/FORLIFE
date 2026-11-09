#!/usr/bin/env python3
"""Contrôle des PDF à livrer à l'imprimeur (intérieur ou couverture), avant le BAT.

  python3 controle_pdf.py interieur sortie/interieur.pdf
  python3 controle_pdf.py couverture couverture/couverture.pdf --dos 10.8
  python3 controle_pdf.py interieur sortie/interieur.pdf --largeur 140 --hauteur 210 --cahier 16

Vérifie : boîtes (TrimBox, BleedBox, MediaBox) et fonds perdus, nombre de pages, polices
incorporées (pdffonts), définition et espace colorimétrique des images (pdfimages -list),
couleur du texte (noir seul sur l'intérieur), présence d'un OutputIntent, empreinte SHA-256.
Code de sortie 1 si un point est en ÉCHEC. Les valeurs par défaut suivent fabrication/fiche-fabrication.md ;
celles de l'imprimeur les remplacent dès qu'elles sont connues.
"""
import argparse
import hashlib
import subprocess
import sys
from pathlib import Path

import pikepdf

MM_PAR_POINT = 25.4 / 72
TOLERANCE_MM = 0.2
DEFINITION_MIN_PPP = 300
DEFINITION_TRAIT_PPP = 1200

constats = []


def noter(niveau, message):
    constats.append(niveau)
    print(f"{niveau:8} {message}")


def en_mm(boite):
    x0, y0, x1, y1 = (float(v) * MM_PAR_POINT for v in boite)
    return x0, y0, x1, y1


def dimensions(boite):
    x0, y0, x1, y1 = en_mm(boite)
    return abs(x1 - x0), abs(y1 - y0)


def proche(a, b):
    return abs(a - b) <= TOLERANCE_MM


def controler_boites(pdf, largeur_coupe, hauteur_coupe, fonds_perdus):
    anomalies = []
    for numero, page in enumerate(pdf.pages, start=1):
        objet = page.obj
        # Sans TrimBox explicite, pikepdf renvoie la MediaBox : l'imprimeur ne saurait pas où couper.
        if "/TrimBox" not in objet:
            anomalies.append(f"page {numero} : pas de TrimBox")
            continue
        if "/BleedBox" not in objet:
            anomalies.append(f"page {numero} : pas de BleedBox")
            continue
        tl, th = dimensions(objet.TrimBox)
        bl, bh = dimensions(objet.BleedBox)
        ml, mh = dimensions(objet.MediaBox)
        if not (proche(tl, largeur_coupe) and proche(th, hauteur_coupe)):
            anomalies.append(f"page {numero} : format coupé {tl:.1f} × {th:.1f} mm, attendu "
                             f"{largeur_coupe:.1f} × {hauteur_coupe:.1f} mm")
        tx0, ty0, tx1, ty1 = en_mm(objet.TrimBox)
        bx0, by0, bx1, by1 = en_mm(objet.BleedBox)
        marges = (tx0 - bx0, ty0 - by0, bx1 - tx1, by1 - ty1)
        if not all(proche(m, fonds_perdus) for m in marges):
            anomalies.append(f"page {numero} : fonds perdus "
                             + " / ".join(f"{m:.1f}" for m in marges)
                             + f" mm (gauche/bas/droite/haut), attendu {fonds_perdus} mm")
        if ml + TOLERANCE_MM < bl or mh + TOLERANCE_MM < bh:
            anomalies.append(f"page {numero} : MediaBox plus petite que la BleedBox")
    if anomalies:
        for ligne in anomalies[:15]:
            noter("ÉCHEC", ligne)
        if len(anomalies) > 15:
            noter("ÉCHEC", f"... et {len(anomalies) - 15} autres anomalies de boîtes")
    else:
        noter("OK", f"boîtes conformes sur {len(pdf.pages)} page(s) : coupe {largeur_coupe:.1f} × "
                    f"{hauteur_coupe:.1f} mm, fonds perdus {fonds_perdus} mm")


def controler_polices(chemin):
    sortie = subprocess.run(["pdffonts", str(chemin)], capture_output=True, text=True, check=True).stdout
    lignes = sortie.splitlines()
    if len(lignes) <= 2:
        noter("OK", "aucune police dans le fichier (texte vectorisé ou absent)")
        return
    # pdffonts aligne ses colonnes sur la ligne de tirets : on découpe d'après elle.
    tirets = lignes[1]
    bornes, debut = [], 0
    for bloc in tirets.split(" "):
        bornes.append((debut, debut + len(bloc)))
        debut += len(bloc) + 1
    entete = [lignes[0][a:b].strip() for a, b in bornes]
    col_nom, col_type, col_emb = entete.index("name"), entete.index("type"), entete.index("emb")
    non_incorporees, type3 = [], []
    for ligne in lignes[2:]:
        champs = [ligne[a:b].strip() for a, b in bornes]
        if champs[col_emb] != "yes":
            non_incorporees.append(champs[col_nom])
        if champs[col_type].startswith("Type 3"):
            type3.append(champs[col_nom])
    if non_incorporees:
        noter("ÉCHEC", "polices non incorporées : " + ", ".join(sorted(set(non_incorporees))))
    else:
        noter("OK", f"{len(lignes) - 2} police(s), toutes incorporées")
    if type3:
        noter("À VOIR", "polices Type 3 (à faire accepter par l'imprimeur) : " + ", ".join(sorted(set(type3))))


def controler_images(chemin, partie):
    sortie = subprocess.run(["pdfimages", "-list", str(chemin)], capture_output=True, text=True,
                            check=True).stdout
    lignes = sortie.splitlines()[2:]
    images, insuffisantes = 0, 0
    for ligne in lignes:
        champs = ligne.split()
        page, genre, couleur, composantes, bits = champs[0], champs[2], champs[5], int(champs[6]), int(champs[7])
        x_ppp, y_ppp = int(champs[12]), int(champs[13])
        # Les masques de transparence suivent l'image qu'ils accompagnent.
        if genre in ("smask", "stencil"):
            continue
        images += 1
        definition = min(x_ppp, y_ppp)
        seuil = DEFINITION_TRAIT_PPP if bits == 1 else DEFINITION_MIN_PPP
        if definition < seuil:
            insuffisantes += 1
            noter("ÉCHEC", f"page {page} : image à {definition} ppp, minimum {seuil} ppp à la taille d'impression")
        if partie == "interieur" and composantes > 1:
            noter("À VOIR", f"page {page} : image en {couleur} ({composantes} composantes) sur un intérieur noir ; "
                            "la convertir en niveaux de gris")
    if images == 0:
        noter("OK", "aucune image")
    elif not insuffisantes:
        noter("OK", f"{images} image(s) contrôlée(s) en définition")


def nature_espace(nom, ressources):
    if nom in ("/DeviceGray", "/DeviceRGB", "/DeviceCMYK", "/Pattern"):
        return nom[1:]
    espaces = ressources.get("/ColorSpace", {}) if ressources is not None else {}
    espace = espaces.get(nom)
    if espace is None:
        return f"inconnu {nom}"
    if isinstance(espace, pikepdf.Array):
        famille = str(espace[0])[1:]
        if famille == "ICCBased":
            composantes = int(espace[1].get("/N", 0))
            return {1: "DeviceGray", 3: "DeviceRGB", 4: "DeviceCMYK"}.get(composantes, "ICCBased")
        if famille == "Separation":
            return f"Separation {espace[1]}"
        return famille
    return str(espace)[1:]


def parcourir_flux(flux, ressources, couleur, textes, vecteurs, deja_vus):
    """Note la couleur de remplissage active à chaque affichage de texte et à chaque tracé."""
    pile = []
    espace_courant = "DeviceGray"
    mode_rendu = 0
    for operandes, operateur in pikepdf.parse_content_stream(flux):
        op = str(operateur)
        if op == "q":
            pile.append((couleur, espace_courant, mode_rendu))
        elif op == "Q" and pile:
            couleur, espace_courant, mode_rendu = pile.pop()
        elif op == "g":
            couleur = ("DeviceGray", tuple(float(v) for v in operandes))
        elif op == "rg":
            couleur = ("DeviceRGB", tuple(float(v) for v in operandes))
        elif op == "k":
            couleur = ("DeviceCMYK", tuple(float(v) for v in operandes))
        elif op == "cs":
            espace_courant = nature_espace(str(operandes[0]), ressources)
        elif op in ("sc", "scn"):
            # Le dernier opérande de scn peut être un nom de motif, sans valeur numérique.
            valeurs = tuple(float(v) for v in operandes if not isinstance(v, pikepdf.Name))
            couleur = (espace_courant, valeurs)
        elif op == "Tr":
            mode_rendu = int(operandes[0])
        elif op in ("Tj", "TJ", "'", '"'):
            # Le mode 3 est du texte invisible (calque de recherche) : il n'imprime rien.
            if mode_rendu != 3:
                textes.add(couleur)
        elif op in ("f", "F", "f*", "B", "B*", "b", "b*"):
            vecteurs.add(couleur)
        elif op == "Do" and ressources is not None:
            objet = ressources.get("/XObject", {}).get(operandes[0])
            if objet is not None and objet.get("/Subtype") == "/Form" and objet.objgen not in deja_vus:
                deja_vus.add(objet.objgen)
                parcourir_flux(objet, objet.get("/Resources", ressources), couleur, textes, vecteurs, deja_vus)


def est_noir_seul(couleur):
    espace, valeurs = couleur
    if espace == "DeviceGray":
        return True
    if espace == "DeviceCMYK" and len(valeurs) == 4:
        return valeurs[0] == valeurs[1] == valeurs[2] == 0
    return False


def decrire(couleur):
    espace, valeurs = couleur
    return f"{espace} " + " ".join(f"{v:g}" for v in valeurs)


def controler_couleurs(pdf, partie):
    textes, vecteurs = set(), set()
    for page in pdf.pages:
        parcourir_flux(page, page.obj.get("/Resources"), ("DeviceGray", (0.0,)), textes, vecteurs, set())
    if partie == "interieur":
        hors_noir = sorted(decrire(c) for c in textes if not est_noir_seul(c))
        if hors_noir:
            noter("ÉCHEC", "texte hors noir seul (100 % K attendu) : " + "; ".join(hors_noir))
        else:
            noter("OK", "texte en noir seul : " + "; ".join(sorted(decrire(c) for c in textes)))
        tramé = sorted(decrire(c) for c in textes if est_noir_seul(c) and c not in
                       {("DeviceGray", (0.0,)), ("DeviceCMYK", (0.0, 0.0, 0.0, 1.0))})
        if tramé:
            noter("À VOIR", "texte en gris tramé (lisibilité en petit corps) : " + "; ".join(tramé))
        aplats = sorted(decrire(c) for c in vecteurs if not est_noir_seul(c))
        if aplats:
            noter("À VOIR", "tracés en couleur sur l'intérieur, à convertir en gris : " + "; ".join(aplats))
    else:
        noirs_rvb = [c for c in textes if c[0] == "DeviceRGB" and c[1] == (0.0, 0.0, 0.0)]
        noirs_quadri = [c for c in textes if c[0] == "DeviceCMYK" and c[1][3] == 1 and any(c[1][:3])]
        if noirs_rvb:
            noter("ÉCHEC", "texte noir en RVB sur la couverture : il deviendrait un noir à quatre couleurs")
        if noirs_quadri:
            noter("À VOIR", "texte en noir enrichi : " + "; ".join(decrire(c) for c in noirs_quadri))
        rvb = sorted(decrire(c) for c in textes | vecteurs if c[0] == "DeviceRGB")
        if rvb:
            noter("À VOIR", "couleurs RVB sur la couverture (conversion CMJN à faire avec le profil de "
                            "l'imprimeur s'il l'exige) : " + "; ".join(rvb[:8]))
        if not (noirs_rvb or noirs_quadri or rvb):
            noter("OK", "couleurs du texte et des aplats sans RVB ni noir enrichi")


def controler_intention(pdf):
    intentions = pdf.Root.get("/OutputIntents")
    norme = pdf.docinfo.get("/GTS_PDFXVersion") if pdf.docinfo is not None else None
    if intentions:
        profil = intentions[0].get("/OutputConditionIdentifier", "?")
        noter("INFO", f"OutputIntent présent : {profil} ; norme PDF/X : {norme or 'non déclarée'}")
    else:
        noter("INFO", "aucun OutputIntent (exigé seulement si l'imprimeur demande un PDF/X)")


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("partie", choices=["interieur", "couverture"])
    parser.add_argument("pdf", type=Path)
    parser.add_argument("--largeur", type=float, default=140.0, help="largeur du livre fini en mm")
    parser.add_argument("--hauteur", type=float, default=210.0, help="hauteur du livre fini en mm")
    parser.add_argument("--fonds-perdus", type=float, default=3.0, help="fonds perdus en mm")
    parser.add_argument("--dos", type=float, help="épaisseur du dos en mm (valeur de l'imprimeur)")
    parser.add_argument("--cahier", type=int, default=16, help="pages par cahier en offset")
    args = parser.parse_args()

    empreinte = hashlib.sha256(args.pdf.read_bytes()).hexdigest()
    print(f"Fichier  {args.pdf}\nSHA-256  {empreinte}")
    with pikepdf.open(args.pdf) as pdf:
        pages = len(pdf.pages)
        if args.partie == "interieur":
            noter("INFO", f"{pages} pages")
            if pages % 2:
                noter("ÉCHEC", "nombre de pages impair")
            if pages % args.cahier:
                manque = args.cahier - pages % args.cahier
                noter("À VOIR", f"{pages} pages ne font pas un multiple de {args.cahier} : "
                                f"{manque} page(s) blanche(s) à prévoir en offset")
            controler_boites(pdf, args.largeur, args.hauteur, args.fonds_perdus)
        else:
            if pages != 1:
                noter("ÉCHEC", f"la couverture doit tenir en un seul PDF d'une page ({pages} pages)")
            objet = pdf.pages[0].obj
            if args.dos is None and "/TrimBox" in objet:
                largeur_lue = dimensions(objet.TrimBox)[0]
                noter("INFO", f"dos déduit de la TrimBox : {largeur_lue - 2 * args.largeur:.2f} mm "
                              "(à comparer à la valeur de l'imprimeur)")
                largeur_gabarit = largeur_lue
            else:
                largeur_gabarit = 2 * args.largeur + (args.dos or 0)
            controler_boites(pdf, largeur_gabarit, args.hauteur, args.fonds_perdus)
        controler_couleurs(pdf, args.partie)
        controler_intention(pdf)
    controler_polices(args.pdf)
    controler_images(args.pdf, args.partie)
    echecs = constats.count("ÉCHEC")
    print(f"Bilan    {echecs} échec(s), {constats.count('À VOIR')} point(s) à voir")
    sys.exit(1 if echecs else 0)


if __name__ == "__main__":
    main()
