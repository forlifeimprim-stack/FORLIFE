#!/usr/bin/env python3
"""Couverture de « La vie et le ministère prophétique du prophète Jérémie » : deux pistes de plat 1,
gabarit complet (plat 4, dos, plat 1) et image de couverture pour l'EPUB.

  python3 couverture/generer_couverture.py                          # 160 pages, offset 90 g, main 1,25, piste A
  python3 couverture/generer_couverture.py --pages 176 --main 1.3   # recalcul du dos sur la pagination réelle
  python3 couverture/generer_couverture.py --dos 10.4               # dos mesuré par l'imprimeur (prime sur le calcul)
  python3 couverture/generer_couverture.py --piste B                # gabarit et EPUB de la piste B

Lancer depuis n'importe où ; les chemins partent de `.edition/`. Sorties dans `couverture/` :
piste-A.pdf, piste-B.pdf (plat 1 seul, CMJN, 146 × 216 mm), piste-*.png (rendu RVB),
piste-*-vignette-200.png, couverture-gabarit.pdf (CMJN), couverture-gabarit.png,
couverture-gabarit-reperes.png (coupe, plis, sécurité : repères d'écran, absents du PDF), plat1-epub.jpg.

Textes : titre, sous-titre, auteur, éditeur et biographie viennent de `livre.yaml` ; accroche,
présentation et mentions de la quatrième viennent de `couverture/quatrieme.md`. On corrige là, puis on relance.

Couleurs : le PDF imprimeur est en CMJN. Le texte est écrit en `device-cmyk()` ; les SVG de Kouamé,
que WeasyPrint 70 écrit en RVB, sont repassés en CMJN après coup avec les valeurs estimées de
`charte/illustration.md`. Une couleur hors palette arrête le script. Les aperçus PNG et l'image EPUB
viennent d'un rendu RVB du même document : poppler convertit le CMJN sans profil et fausserait les teintes.
"""
import argparse
import re
import subprocess
import sys
import tempfile
from pathlib import Path

import pikepdf
import yaml
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw
from weasyprint import CSS, HTML
from weasyprint.text.fonts import FontConfiguration

EDITION = Path(__file__).resolve().parent.parent
COUVERTURE = EDITION / "couverture"
IMAGES = EDITION / "images"
POLICES = EDITION / "outils" / "ressources" / "polices"

sys.dont_write_bytecode = True  # ne rien écrire dans outils/, dossier partagé
sys.path.insert(0, str(EDITION / "outils"))
from composer import polices_corrigees  # noqa: E402  (même correction des polices que l'intérieur, T07)

FORMAT_L, FORMAT_H = 140.0, 210.0
FONDS_PERDUS = 3.0
SECURITE = 5.0          # rien d'important à moins de 5 mm de la coupe
SECURITE_DOS = 1.5      # marge du texte de chaque côté du dos (fiche de Salif)
DOS_MIN_TEXTE = 6.0     # en dessous, le dos ne porte pas de texte
MM = 72 / 25.4

# Palette de Kouamé (charte/illustration.md) : hexadécimal pour l'écran, CMJN estimé pour l'impression.
PALETTE = {
    "indigo": ("#1E2B47", (90, 75, 35, 45)),
    "mauve": ("#5B5378", (70, 65, 25, 15)),
    "abricot": ("#E59B5E", (5, 45, 70, 0)),
    "sable": ("#F3D9B1", (3, 15, 32, 0)),
    "ecorce": ("#2E211B", (50, 65, 70, 75)),
    "amande": ("#FAF0EA", (0, 5, 6, 0)),
    "carmin": ("#B4475C", (20, 80, 50, 8)),
    "blanc": ("#FFFFFF", (0, 0, 0, 0)),
    "noir": ("#000000", (0, 0, 0, 100)),
}

# Couleurs des textes et des fonds selon la piste : A sur l'indigo de l'illustration, B sur le sable.
THEMES = {
    "A": {"fond": "indigo", "titre": "sable", "texte": "amande", "accent": "carmin", "discret": "sable"},
    "B": {"fond": "sable", "titre": "indigo", "texte": "indigo", "accent": "carmin", "discret": "indigo"},
}

# Bords supérieurs des collines de couverture-amandier.svg (Kouamé), repris pour prolonger le paysage.
COLLINE_MAUVE = [(0, 167), (30, 163), (60, 163.5), (90, 163.8), (115, 164), (132, 166), (146, 168)]
COLLINE_INDIGO = [(0, 180), (40, 172), (95, 175), (146, 171)]

# Code-barres EAN-13 à 100 % : 37,29 × 25,93 mm, zones de silence et chiffres compris (norme GS1).
EAN_L, EAN_H = 37.29, 25.93
EAN_GRANDISSEMENT = 0.85


def couleur(nom, impression):
    hexa, (c, m, j, n) = PALETTE[nom]
    return f"device-cmyk({c / 100:g} {m / 100:g} {j / 100:g} {n / 100:g})" if impression else hexa


# ---------- Textes ----------

def lire_quatrieme():
    texte = (COUVERTURE / "quatrieme.md").read_text(encoding="utf-8")
    sections = {}
    for bloc in re.split(r"^## ", texte, flags=re.M)[1:]:
        titre, _, corps = bloc.partition("\n")
        sections[titre.strip()] = corps.strip()
    accroche = [ligne.lstrip("> ").rstrip("\\").strip() for ligne in sections["Accroche"].splitlines()]
    reference = accroche[-1]
    vers = [ligne for ligne in accroche[:-1] if ligne]
    paragraphes = [p.strip() for p in sections["Présentation"].split("\n\n") if p.strip()]
    mentions = dict(ligne.split(" : ", 1) for ligne in sections["Mentions"].splitlines() if " : " in ligne)
    return {"vers": vers, "reference": reference, "paragraphes": paragraphes, "mentions": mentions}


def insecables(texte):
    """Espaces françaises de la charte : fine avant ; ! ?, insécable avant : et dans les guillemets."""
    texte = re.sub(r" ([;!?])", "\u202f\\1", texte)
    texte = re.sub(r" :", "\u00a0:", texte)
    texte = texte.replace("« ", "«\u202f").replace(" »", "\u202f»")
    texte = re.sub(r"(\d) (av\.)", "\\1\u00a0\\2", texte)
    return texte.replace("'", "\u2019")


def echapper(texte):
    return texte.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def couper_titre(mots):
    """Coupe la partie haute du titre en deux lignes de longueurs voisines."""
    meilleure = min(range(1, len(mots)), key=lambda i: max(len(" ".join(mots[:i])), len(" ".join(mots[i:]))))
    return " ".join(mots[:meilleure]), " ".join(mots[meilleure:])


# ---------- Mesures ----------

def largeur_texte_mm(texte, fichier_police, corps_pt, interlettrage_em=0.0):
    police = TTFont(fichier_police)
    table, avances = police.getBestCmap(), police["hmtx"].metrics
    unites = sum(avances[table.get(ord(c), ".notdef")][0] for c in texte)
    em = police["head"].unitsPerEm
    return (unites / em + interlettrage_em * len(texte)) * corps_pt / MM


def courbe(points, pas=0.5):
    """Échantillonne les bords de colline (Bézier cubiques en suite de points de contrôle)."""
    resultat = []
    for i in range(0, len(points) - 1, 3):
        p0, p1, p2, p3 = points[i:i + 4]
        n = int((p3[0] - p0[0]) / pas) + 1
        for k in range(n + 1):
            t = k / n
            a, b, c, d = (1 - t) ** 3, 3 * (1 - t) ** 2 * t, 3 * (1 - t) * t ** 2, t ** 3
            resultat.append((a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0],
                             a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]))
    return resultat


def hauteur_a(points, x):
    for (x0, y0), (x1, y1) in zip(points, points[1:]):
        if x0 <= x <= x1:
            return y0 + (y1 - y0) * (x - x0) / (x1 - x0)
    return points[-1][1]


# ---------- Illustrations ----------

def contenu_svg(fichier):
    texte = fichier.read_text(encoding="utf-8")
    interieur = texte[texte.index(">", texte.index("<svg")) + 1:texte.rindex("</svg>")]
    return re.sub(r"<(title|desc)>.*?</\1>", "", interieur, flags=re.S)


def svg_arche(dossier):
    """Piste B : la variante sans remparts vue par une fenêtre en arc, comme la porte de la ville."""
    x0, x1, haut, bas = 27.0, 119.0, 92.0, 190.0
    rayon = (x1 - x0) / 2
    arche = f"M{x0},{bas} V{haut + rayon} A{rayon},{rayon} 0 0 1 {x1},{haut + rayon} V{bas} Z"
    echelle = 0.72
    # Le rameau occupe x 18 à 146 et y 88 à 160 dans l'original : on le cadre dans la fenêtre.
    dx, dy = x0 - 12 * echelle, haut - 62 * echelle
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="146mm" height="216mm" viewBox="0 0 146 216">'
           f'<defs><clipPath id="arche"><path d="{arche}"/></clipPath></defs>'
           f'<g clip-path="url(#arche)"><g transform="translate({dx:.3f},{dy:.3f}) scale({echelle})">'
           f'{contenu_svg(IMAGES / "couverture-amandier-sans-remparts.svg")}</g></g>'
           f'<path d="{arche}" fill="none" stroke="#1E2B47" stroke-width="0.5"/>'
           f'<path d="M{x0 - 2.2},{bas + 2.2} V{haut + rayon} A{rayon + 2.2},{rayon + 2.2} 0 0 1 {x1 + 2.2},'
           f'{haut + rayon} V{bas + 2.2} Z" fill="none" stroke="#B4475C" stroke-width="0.35"/></svg>')
    cible = dossier / "piste-B-arche.svg"
    cible.write_text(svg, encoding="utf-8")
    return cible


def svg_paysage_arriere(dossier, dos):
    """Prolonge le ciel et les collines de Kouamé sur le dos et la quatrième, en miroir autour du dos."""
    largeur = FONDS_PERDUS + FORMAT_L + dos
    mauve, indigo = courbe(COLLINE_MAUVE), courbe(COLLINE_INDIGO)

    def bord(points):
        # Un point de la quatrième à u mm du pli correspond au point du plat 1 à 3 + u mm du bord du fichier.
        haut_au_pli = hauteur_a(points, FONDS_PERDUS)
        trace = [(largeur, haut_au_pli), (FONDS_PERDUS + FORMAT_L, haut_au_pli)]
        u = 0.0
        while u <= FONDS_PERDUS + FORMAT_L:
            trace.append((FONDS_PERDUS + FORMAT_L - u, hauteur_a(points, FONDS_PERDUS + u)))
            u += 0.5
        return " L".join(f"{x:.2f},{y:.2f}" for x, y in trace)

    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{largeur}mm" height="216mm" '
           f'viewBox="0 0 {largeur} 216">'
           f'<rect x="0" y="0" width="{largeur}" height="104.3" fill="#1E2B47"/>'
           f'<rect x="0" y="104" width="{largeur}" height="24.3" fill="#5B5378"/>'
           f'<rect x="0" y="128" width="{largeur}" height="22.3" fill="#E59B5E"/>'
           f'<rect x="0" y="150" width="{largeur}" height="66" fill="#F3D9B1"/>'
           f'<path d="M{bord(mauve)} L-1,{hauteur_a(mauve, 146):.2f} L-1,200 L{largeur},200 Z" fill="#5B5378"/>'
           f'<path d="M{bord(indigo)} L-1,{hauteur_a(indigo, 146):.2f} L-1,216 L{largeur},216 Z" fill="#1E2B47"/>'
           f'</svg>')
    cible = dossier / "paysage-arriere.svg"
    cible.write_text(svg, encoding="utf-8")
    return cible, hauteur_a(mauve, FONDS_PERDUS), hauteur_a(indigo, FONDS_PERDUS)


# ---------- Mise en page ----------

CSS_COMMUN = """
@page { margin: 0; }
html, body { margin: 0; padding: 0; }
body { position: relative; font-family: "Alegreya Sans"; hyphens: none; }
.bloc { position: absolute; }
.centre { text-align: center; }
.auteur { font-weight: 500; font-size: 10.5pt; letter-spacing: 0.2em; line-height: 1; }
.titre-haut { font-weight: 500; font-size: 18.5pt; line-height: 1.12; }
.titre-nom { font-weight: 800; font-size: 66pt; line-height: 1; letter-spacing: 0.005em; }
.genre { font-weight: 700; font-size: 9.5pt; letter-spacing: 0.32em; line-height: 1; }
.filet { position: absolute; height: 0; border-top-style: solid; border-top-width: 0.7pt; }
.editeur { font-weight: 500; font-size: 7.5pt; letter-spacing: 0.24em; line-height: 1; }
.vers { font-family: "EB Garamond"; font-style: italic; font-size: 13.5pt; line-height: 1.3; }
.reference { font-size: 8.5pt; line-height: 1; margin-top: 2mm; }
.presentation p { font-family: "EB Garamond"; font-size: 10.5pt; line-height: 13.6pt; margin: 0;
                  text-align: justify; hyphens: auto; text-indent: 1.2em; }
.presentation p:first-child { text-indent: 0; }
.presentation p.envoi { text-indent: 0; margin-top: 2.2mm; font-style: italic; text-align: left; }
.bio-titre { font-weight: 700; font-size: 7.5pt; letter-spacing: 0.24em; line-height: 1; margin-bottom: 1.6mm; }
.bio { font-family: "EB Garamond"; font-size: 9pt; line-height: 11.4pt; text-align: left; }
.mention { font-size: 7.5pt; line-height: 10pt; }
.cartouche { position: absolute; }
.cartouche .cadre { position: absolute; border: 0.4pt dashed; box-sizing: border-box; }
.cartouche .isbn { position: absolute; left: 0; right: 0; text-align: center; font-size: 8pt; line-height: 1; }
.dos { position: absolute; transform-origin: center center; transform: rotate(-90deg);
       white-space: nowrap; overflow: hidden; }
"""


def plat1(piste, x0, impression, livre, illustration):
    """Éléments du plat 1 ; x0 est l'abscisse du bord gauche du fichier du plat (fonds perdus compris)."""
    theme = THEMES[piste]
    c = {cle: couleur(nom, impression) for cle, nom in theme.items()}
    mots = livre["titre"].split()
    haut1, haut2 = couper_titre(mots[:-1])
    nom = mots[-1]
    centre_l = 130  # bloc utile de 8 à 138 mm (sécurité de 5 mm depuis la coupe)
    elements = []
    if piste == "A":
        elements.append(f'<img class="bloc" src="{illustration.as_uri()}" '
                        f'style="left:{x0}mm; top:0; width:146mm; height:216mm">')
        haut_auteur, haut_titre, haut_nom, haut_genre, haut_editeur = 15.0, 26.0, 40.5, 74.5, 199.0
    else:
        elements.append(f'<div class="bloc" style="left:{x0}mm; top:0; width:146mm; height:216mm; '
                        f'background:{c["fond"]}"></div>')
        elements.append(f'<img class="bloc" src="{illustration.as_uri()}" '
                        f'style="left:{x0}mm; top:0; width:146mm; height:216mm">')
        haut_auteur, haut_titre, haut_nom, haut_genre, haut_editeur = 14.0, 24.5, 39.0, 73.0, 199.0
    gauche = x0 + 8
    elements.append(f'<div class="bloc centre auteur" style="left:{gauche}mm; top:{haut_auteur}mm; '
                    f'width:{centre_l}mm; color:{c["titre"]}">{echapper(livre["auteur"]).upper()}</div>')
    elements.append(f'<div class="bloc centre titre-haut" style="left:{gauche}mm; top:{haut_titre}mm; '
                    f'width:{centre_l}mm; color:{c["titre"]}">{echapper(haut1)}<br>{echapper(haut2)}</div>')
    elements.append(f'<div class="bloc centre titre-nom" style="left:{gauche}mm; top:{haut_nom}mm; '
                    f'width:{centre_l}mm; color:{c["titre"]}">{echapper(nom)}</div>')
    genre = livre["sous_titre"].upper()
    largeur_genre = largeur_texte_mm(genre, POLICES / "alegreya-sans" / "alegreya-sans-latin-700-normal.woff2",
                                     9.5, 0.32)
    milieu = x0 + 73
    for sens in (-1, 1):
        debut = milieu + sens * (largeur_genre / 2 + 4)
        fin = milieu + sens * (largeur_genre / 2 + 4 + 14)
        elements.append(f'<div class="filet" style="left:{min(debut, fin):.2f}mm; top:{haut_genre + 1.55:.2f}mm; '
                        f'width:14mm; border-top-color:{c["accent"]}"></div>')
    couleur_genre = c["accent"] if piste == "B" else c["titre"]
    elements.append(f'<div class="bloc centre genre" style="left:{gauche}mm; top:{haut_genre}mm; '
                    f'width:{centre_l}mm; color:{couleur_genre}">{echapper(genre)}</div>')
    elements.append(f'<div class="bloc centre editeur" style="left:{gauche}mm; top:{haut_editeur}mm; '
                    f'width:{centre_l}mm; color:{c["discret"]}">{echapper(livre["editeur"]["nom"]).upper()}</div>')
    return elements


def plat4_et_dos(piste, dos, impression, livre, quatrieme, paysage):
    theme = THEMES[piste]
    c = {cle: couleur(nom, impression) for cle, nom in theme.items()}
    noir, blanc = couleur("noir", impression), couleur("blanc", impression)
    elements = []
    largeur_arriere = FONDS_PERDUS + FORMAT_L + dos
    if piste == "A":
        fichier, _, haut_indigo_dos = paysage
        elements.append(f'<img class="bloc" src="{fichier.as_uri()}" '
                        f'style="left:0; top:0; width:{largeur_arriere}mm; height:216mm">')
    else:
        haut_indigo_dos = None
        elements.append(f'<div class="bloc" style="left:0; top:0; width:{largeur_arriere}mm; height:216mm; '
                        f'background:{c["fond"]}"></div>')

    # Plat 4 : coupe de 3 à 143 mm, texte à 12 mm de la coupe (sécurité 5 mm, marge de lecture en plus).
    gauche, largeur = FONDS_PERDUS + 12, FORMAT_L - 24
    vers = "<br>".join(echapper(insecables(v)) for v in quatrieme["vers"])
    elements.append(f'<div class="bloc" style="left:{gauche}mm; top:14mm; width:{largeur}mm; color:{c["titre"]}">'
                    f'<div class="vers">{vers}</div>'
                    f'<div class="reference" style="color:{c["titre"]}">{echapper(insecables(quatrieme["reference"]))}'
                    f'</div></div>')
    paragraphes = quatrieme["paragraphes"]
    corps = "".join(f"<p>{echapper(insecables(p))}</p>" for p in paragraphes[:-1])
    corps += f'<p class="envoi">{echapper(insecables(paragraphes[-1]))}</p>'
    elements.append(f'<div class="bloc presentation" lang="fr" style="left:{gauche}mm; top:33mm; '
                    f'width:{largeur}mm; color:{c["texte"]}">{corps}</div>')

    # Bas du plat 4 : biographie à gauche, cartouche du code-barres à droite, près du dos.
    mentions = quatrieme["mentions"]
    bio = " ".join(ligne.strip() for ligne in livre["biographie_auteur"].strip().splitlines())
    haut_bas = 178.5
    largeur_bio = 72
    elements.append(f'<div class="bloc" style="left:{gauche}mm; top:{haut_bas}mm; width:{largeur_bio}mm">'
                    f'<div class="bio-titre" style="color:{c["titre"]}">L’AUTEUR</div>'
                    f'<div class="bio" style="color:{c["texte"]}">{echapper(insecables(bio))}</div></div>')
    ean_l, ean_h = EAN_L * EAN_GRANDISSEMENT, EAN_H * EAN_GRANDISSEMENT
    cart_l, cart_h = ean_l + 3, ean_h + 3
    cart_x = FONDS_PERDUS + FORMAT_L - 8 - cart_l
    cart_y = FONDS_PERDUS + FORMAT_H - SECURITE - 1 - cart_h
    elements.append(f'<div class="cartouche" style="left:{cart_x:.2f}mm; top:{cart_y:.2f}mm; width:{cart_l:.2f}mm; '
                    f'height:{cart_h:.2f}mm; background:{blanc}">'
                    f'<div class="cadre" style="left:1.5mm; top:1.5mm; width:{ean_l:.2f}mm; height:{ean_h:.2f}mm; '
                    f'border-color:{noir}"></div>'
                    f'<div class="isbn" style="top:{cart_h / 2 - 3.2:.2f}mm; color:{noir}">'
                    f'{echapper(mentions["ISBN"])}</div>'
                    f'<div class="isbn" style="top:{cart_h / 2 + 0.8:.2f}mm; font-size:6pt; color:{noir}">'
                    f'EAN-13 à {EAN_GRANDISSEMENT * 100:.0f}&nbsp;%</div></div>')
    elements.append(f'<div class="bloc mention" style="left:{cart_x:.2f}mm; top:{cart_y - 11.5:.2f}mm; '
                    f'width:{cart_l:.2f}mm; color:{c["texte"]}">'
                    f'{echapper(insecables(mentions["Éditeur"]))}<br>'
                    f'{echapper(insecables("Prix : " + mentions["Prix"]))}</div>')
    elements.append(f'<div class="bloc mention" style="left:{gauche}mm; top:{haut_bas - 7:.2f}mm; '
                    f'width:{largeur}mm; color:{c["texte"]}; font-style:italic">'
                    f'{echapper(insecables(mentions["Version biblique"]))}</div>')

    # Dos, lu de bas en haut. Piste A : titre sur l'indigo du ciel, auteur sur l'indigo des collines.
    if dos >= DOS_MIN_TEXTE:
        x_dos = FONDS_PERDUS + FORMAT_L
        corps_dos = min(9.0, (dos - 2 * SECURITE_DOS) / 0.3528 * 0.62)
        police_titre = POLICES / "alegreya-sans" / "alegreya-sans-latin-700-normal.woff2"
        police_auteur = POLICES / "alegreya-sans" / "alegreya-sans-latin-500-normal.woff2"
        if piste == "A":
            zones = [(livre["titre"], police_titre, 700, c["titre"], 104 - 4, FONDS_PERDUS + SECURITE + 2),
                     (livre["auteur"], police_auteur, 500, c["titre"], 216 - FONDS_PERDUS - SECURITE - 1,
                      haut_indigo_dos + 3)]
        else:
            zones = [(livre["titre"], police_titre, 700, c["titre"], 120, FONDS_PERDUS + SECURITE + 2),
                     (livre["auteur"], police_auteur, 500, c["titre"], 216 - FONDS_PERDUS - SECURITE - 1, 140)]
        for texte, police, graisse, teinte, bas, haut in zones:
            longueur_dispo = bas - haut
            corps = corps_dos
            while largeur_texte_mm(texte, police, corps) > longueur_dispo and corps > 6:
                corps -= 0.25
            if largeur_texte_mm(texte, police, corps) > longueur_dispo:
                sys.exit(f"Le texte du dos « {texte} » ne tient pas en {longueur_dispo:.1f} mm.")
            centre_x, centre_y = x_dos + dos / 2, (haut + bas) / 2
            elements.append(f'<div class="dos centre" style="left:{centre_x - longueur_dispo / 2:.3f}mm; '
                            f'top:{centre_y - dos / 2:.3f}mm; width:{longueur_dispo:.3f}mm; height:{dos:.3f}mm; '
                            f'line-height:{dos:.3f}mm; font-weight:{graisse}; font-size:{corps:.2f}pt; '
                            f'color:{teinte}">{echapper(texte)}</div>')
    return elements


def document(largeur, elements, polices):
    return (f'<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><style>{polices}\n{CSS_COMMUN}\n'
            f'@page {{ size: {largeur:.3f}mm 216mm; }}\nbody {{ width: {largeur:.3f}mm; height: 216mm; }}'
            f'</style></head><body>{"".join(elements)}</body></html>')


# ---------- PDF ----------

def rvb_vers_cmjn(fichier_pdf):
    """Repasse en CMJN les couleurs RVB des SVG, d'après la palette ; refuse toute couleur hors palette."""
    table = {}
    for hexa, cmjn in PALETTE.values():
        cle = tuple(int(hexa[i:i + 2], 16) for i in (1, 3, 5))
        table[cle] = [v / 100 for v in cmjn]
    hors_palette = set()

    def convertir(flux):
        instructions = []
        for operandes, operateur in pikepdf.parse_content_stream(flux):
            op = str(operateur)
            if op in ("rg", "RG"):
                cle = tuple(round(float(v) * 255) for v in operandes)
                if cle not in table:
                    hors_palette.add("#%02X%02X%02X" % cle)
                else:
                    operandes = [pikepdf.Object.parse(f"{v:g}".encode()) for v in table[cle]]
                    operateur = pikepdf.Operator("k" if op == "rg" else "K")
            instructions.append((operandes, operateur))
        flux.write(pikepdf.unparse_content_stream(instructions))

    def formulaires(ressources, deja_vus):
        if ressources is None:
            return
        for objet in ressources.get("/XObject", {}).values():
            if objet.get("/Subtype") == "/Form" and objet.objgen not in deja_vus:
                deja_vus.add(objet.objgen)
                convertir(objet)
                formulaires(objet.get("/Resources"), deja_vus)

    with pikepdf.open(fichier_pdf, allow_overwriting_input=True) as pdf:
        for page in pdf.pages:
            page.contents_coalesce()
            convertir(page.obj.Contents)
            formulaires(page.obj.get("/Resources"), set())
        pdf.save(fichier_pdf)
    if hors_palette:
        sys.exit(f"Couleurs hors palette dans {fichier_pdf.name} : {', '.join(sorted(hors_palette))}")


def poser_boites(fichier_pdf, largeur_coupe):
    with pikepdf.open(fichier_pdf, allow_overwriting_input=True) as pdf:
        page = pdf.pages[0].obj
        largeur, hauteur = float(page.MediaBox[2]), float(page.MediaBox[3])
        page.BleedBox = pikepdf.Array([0, 0, largeur, hauteur])
        fp = FONDS_PERDUS * MM
        page.TrimBox = pikepdf.Array([fp, fp, fp + largeur_coupe * MM, hauteur - fp])
        pdf.save(fichier_pdf)


def composer(html, cible, configuration, impression, largeur_coupe):
    HTML(string=html, base_url=str(EDITION) + "/").write_pdf(cible, font_config=configuration)
    if impression:
        rvb_vers_cmjn(cible)
    poser_boites(cible, largeur_coupe)


def rendre_png(pdf, cible, ppp):
    subprocess.run(["pdftoppm", "-r", str(ppp), "-png", "-singlefile", str(pdf), str(cible.with_suffix(""))],
                   check=True)
    return Image.open(cible)


def rogner_a_la_coupe(image, largeur_mm, hauteur_mm):
    fx, fy = image.width / largeur_mm, image.height / hauteur_mm
    return image.crop((round(FONDS_PERDUS * fx), round(FONDS_PERDUS * fy),
                       round((largeur_mm - FONDS_PERDUS) * fx), round((hauteur_mm - FONDS_PERDUS) * fy)))


def reperes(image, largeur_mm, dos):
    """Aperçu de contrôle : coupe (rouge), plis du dos (cyan), zone de sécurité (vert)."""
    trace = ImageDraw.Draw(image)
    f = image.width / largeur_mm

    def rect(x0, y0, x1, y1, teinte):
        trace.rectangle([x0 * f, y0 * f, x1 * f, y1 * f], outline=teinte, width=2)

    fp = FONDS_PERDUS
    rect(fp, fp, largeur_mm - fp, 216 - fp, (220, 0, 0))
    for x in (fp + FORMAT_L, fp + FORMAT_L + dos):
        trace.line([x * f, 0, x * f, image.height], fill=(0, 200, 220), width=2)
    rect(fp + SECURITE, fp + SECURITE, fp + FORMAT_L - SECURITE, 216 - fp - SECURITE, (0, 170, 0))
    rect(fp + FORMAT_L + dos + SECURITE, fp + SECURITE, largeur_mm - fp - SECURITE, 216 - fp - SECURITE, (0, 170, 0))
    if dos >= DOS_MIN_TEXTE:
        rect(fp + FORMAT_L + SECURITE_DOS, fp + SECURITE, fp + FORMAT_L + dos - SECURITE_DOS, 216 - fp - SECURITE,
             (0, 170, 0))
    return image


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--pages", type=int, default=160, help="nombre de pages de l'intérieur")
    parser.add_argument("--grammage", type=float, default=90, help="grammage du papier intérieur (g/m²)")
    parser.add_argument("--main", type=float, default=1.25, help="main du papier (cm³/g)")
    parser.add_argument("--dos", type=float, help="épaisseur du dos donnée par l'imprimeur (mm), prime sur le calcul")
    parser.add_argument("--piste", choices=["A", "B"], default="A", help="piste du gabarit complet et de l'EPUB")
    args = parser.parse_args()

    if args.pages % 2:
        sys.exit("Le nombre de pages doit être pair.")
    dos = args.dos if args.dos is not None else args.pages / 2 * args.grammage * args.main / 1000
    largeur_totale = 2 * FORMAT_L + dos + 2 * FONDS_PERDUS
    livre = yaml.safe_load((EDITION / "livre.yaml").read_text(encoding="utf-8"))
    quatrieme = lire_quatrieme()
    print(f"Dos : {dos:.2f} mm ({'imprimeur' if args.dos is not None else f'{args.pages} p. ÷ 2 × {args.grammage:g} g × {args.main:g} ÷ 1 000'})"
          f" ; largeur totale avec fonds perdus : {largeur_totale:.2f} mm"
          + ("" if dos >= DOS_MIN_TEXTE else " ; dos de moins de 6 mm : aucun texte au dos"))

    with tempfile.TemporaryDirectory() as dossier:
        travail = Path(dossier)
        configuration = FontConfiguration()
        polices = polices_corrigees(travail)
        illustrations = {"A": IMAGES / "couverture-amandier.svg", "B": svg_arche(travail)}

        for piste in ("A", "B"):
            for impression in (True, False):
                html = document(146, plat1(piste, 0, impression, livre, illustrations[piste]), polices)
                cible = COUVERTURE / f"piste-{piste}.pdf" if impression else travail / f"piste-{piste}-rvb.pdf"
                composer(html, cible, configuration, impression, FORMAT_L)
            apercu = rendre_png(travail / f"piste-{piste}-rvb.pdf", travail / f"piste-{piste}.png", 150)
            apercu.save(COUVERTURE / f"piste-{piste}.png")
            coupe = rogner_a_la_coupe(apercu.convert("RGB"), 146, 216)
            vignette = coupe.resize((200, round(200 * FORMAT_H / FORMAT_L)), Image.LANCZOS)
            vignette.save(COUVERTURE / f"piste-{piste}-vignette-200.png")

        paysage = svg_paysage_arriere(travail, dos)
        x_plat1 = FONDS_PERDUS + FORMAT_L + dos - FONDS_PERDUS
        for impression in (True, False):
            elements = plat4_et_dos(args.piste, dos, impression, livre, quatrieme, paysage)
            # Le plat 1 est rogné à son pli : ses 3 mm de fonds perdus côté dos ne recouvrent pas le dos.
            plat = plat1(args.piste, 0, impression, livre, illustrations[args.piste])
            elements.append(f'<div class="bloc" style="left:{x_plat1 + FONDS_PERDUS:.3f}mm; top:0; '
                            f'width:{FORMAT_L + FONDS_PERDUS}mm; height:216mm; overflow:hidden">'
                            f'<div class="bloc" style="left:-{FONDS_PERDUS}mm; top:0; width:146mm; height:216mm">'
                            f'{"".join(plat)}</div></div>')
            html = document(largeur_totale, elements, polices)
            cible = COUVERTURE / "couverture-gabarit.pdf" if impression else travail / "gabarit-rvb.pdf"
            composer(html, cible, configuration, impression, 2 * FORMAT_L + dos)

        apercu = rendre_png(travail / "gabarit-rvb.pdf", travail / "gabarit.png", 150).convert("RGB")
        apercu.save(COUVERTURE / "couverture-gabarit.png")
        reperes(apercu.copy(), largeur_totale, dos).save(COUVERTURE / "couverture-gabarit-reperes.png")

        # EPUB : plat 1 seul, à la coupe, 2 560 px de haut, RVB.
        grand = rendre_png(travail / f"piste-{args.piste}-rvb.pdf", travail / "epub.png", 600).convert("RGB")
        hauteur = 2560
        epub = rogner_a_la_coupe(grand, 146, 216).resize((round(hauteur * FORMAT_L / FORMAT_H), hauteur),
                                                         Image.LANCZOS)
        epub.save(COUVERTURE / "plat1-epub.jpg", quality=92, optimize=True, dpi=(300, 300))

    for nom in ("piste-A.pdf", "piste-B.pdf", "couverture-gabarit.pdf", "plat1-epub.jpg"):
        print(f"couverture/{nom}")


if __name__ == "__main__":
    main()
