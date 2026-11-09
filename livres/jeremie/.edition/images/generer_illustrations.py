#!/usr/bin/env python3
"""Génère les illustrations vectorielles du livre « La vie et le ministère prophétique du prophète Jérémie ».

  python3 generer_illustrations.py          # écrit les SVG puis les PNG à 300 ppp dans ce dossier

Les SVG sont en millimètres (viewBox = taille finale). Les étiquettes restent du texte en EB Garamond
(police libre, SIL OFL) : pour un rendu identique, la police doit être installée sur la machine qui
convertit le SVG. Dépendance : cairosvg (PyPI) et Pillow.
"""
import math
from pathlib import Path

DOSSIER = Path(__file__).resolve().parent
POLICE = "EB Garamond"


# ---------------------------------------------------------------- outils communs

def fmt(v):
    return f"{v:.2f}".rstrip("0").rstrip(".")


def chemin_lisse(points, ferme=False, tension=0.5):
    """Courbe de Catmull-Rom convertie en Bézier cubiques : contours et fleuves sans angles."""
    if len(points) < 3:
        return "M" + " L".join(f"{fmt(x)},{fmt(y)}" for x, y in points)
    pts = list(points)
    n = len(pts)
    segments = n if ferme else n - 1
    d = f"M{fmt(pts[0][0])},{fmt(pts[0][1])}"
    for i in range(segments):
        p0 = pts[(i - 1) % n] if (ferme or i > 0) else pts[0]
        p1 = pts[i]
        p2 = pts[(i + 1) % n]
        p3 = pts[(i + 2) % n] if (ferme or i + 2 < n) else p2
        c1 = (p1[0] + (p2[0] - p0[0]) * tension / 3, p1[1] + (p2[1] - p0[1]) * tension / 3)
        c2 = (p2[0] - (p3[0] - p1[0]) * tension / 3, p2[1] - (p3[1] - p1[1]) * tension / 3)
        d += f" C{fmt(c1[0])},{fmt(c1[1])} {fmt(c2[0])},{fmt(c2[1])} {fmt(p2[0])},{fmt(p2[1])}"
    return d + (" Z" if ferme else "")


def texte(x, y, contenu, taille_pt, couleur="#000000", ancre="start", style="normal",
          graisse=400, espacement=0.0, contour_blanc=False):
    """Étiquette typographique ; taille en points convertie en mm (1 pt = 0,3528 mm)."""
    taille = taille_pt * 0.3528
    attributs = (f'x="{fmt(x)}" y="{fmt(y)}" font-family="{POLICE}" font-size="{fmt(taille)}" '
                 f'fill="{couleur}" text-anchor="{ancre}" font-style="{style}" font-weight="{graisse}"')
    if espacement:
        attributs += f' letter-spacing="{fmt(espacement)}"'
    halo = ""
    if contour_blanc:
        # Le halo blanc garde l'étiquette lisible quand elle croise un fleuve ou une côte.
        halo = (f'<text {attributs} stroke="#FFFFFF" stroke-width="{fmt(taille * 0.28)}" '
                f'stroke-linejoin="round">{contenu}</text>')
    return halo + f"<text {attributs}>{contenu}</text>"


def entete_svg(largeur, hauteur, titre, description):
    return (f'<?xml version="1.0" encoding="UTF-8"?>\n'
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{fmt(largeur)}mm" height="{fmt(hauteur)}mm" '
            f'viewBox="0 0 {fmt(largeur)} {fmt(hauteur)}">\n'
            f'<title>{titre}</title>\n<desc>{description}</desc>\n')


# ---------------------------------------------------------------- carte

GRIS_EAU = "#D4D4D4"
GRIS_COTE = "#6A6A6A"
GRIS_FLEUVE = "#7C7C7C"
GRIS_REGION = "#555555"
GRIS_EAU_TEXTE = "#3F3F3F"

# Contours approximatifs (longitude, latitude), tracés à la main d'après les atlas courants.
COTE_MEDITERRANEE = [
    (29.5, 36.22), (30.1, 36.25), (30.5, 36.4), (30.62, 36.85), (31.0, 36.85), (31.5, 36.65),
    (32.0, 36.55), (32.5, 36.15), (32.8, 36.05), (33.3, 36.15), (33.7, 36.2), (34.1, 36.35),
    (34.6, 36.78), (35.0, 36.75), (35.4, 36.58), (35.8, 36.78), (36.17, 36.62), (36.0, 36.2),
    (35.95, 35.95), (35.8, 35.82), (35.78, 35.52), (35.9, 35.2), (35.9, 34.9), (35.85, 34.45),
    (35.65, 34.3), (35.5, 33.9), (35.37, 33.56), (35.2, 33.27), (35.1, 33.05), (34.97, 32.83),
    (34.9, 32.5), (34.78, 32.08), (34.6, 31.75), (34.45, 31.5), (34.2, 31.32), (33.8, 31.15),
    (33.0, 31.1), (32.6, 31.07), (32.3, 31.27), (31.85, 31.53), (31.6, 31.48), (31.0, 31.6),
    (30.4, 31.47), (30.05, 31.3), (29.9, 31.2), (29.5, 30.95),
]
CHYPRE = [
    (32.3, 35.05), (32.42, 34.78), (33.05, 34.67), (33.63, 34.92), (34.08, 34.96), (33.94, 35.15),
    (34.59, 35.69), (34.1, 35.45), (33.32, 35.34), (32.92, 35.4), (32.95, 35.2), (32.55, 35.18),
]
MER_ROUGE = [
    (32.55, 29.97), (32.65, 29.12), (33.1, 28.36), (33.55, 27.75), (33.8, 27.25), (33.95, 26.9),
    (36.1, 26.9), (35.69, 27.35), (35.05, 28.05), (34.72, 28.4), (34.94, 29.29), (35.0, 29.53),
    (34.9, 29.49), (34.66, 28.97), (34.52, 28.5), (34.25, 27.75), (33.6, 28.24), (33.18, 28.9),
    (32.72, 29.6),
]
GOLFE_PERSIQUE = [
    (47.98, 30.02), (48.55, 29.95), (49.0, 30.25), (49.4, 30.25), (49.4, 26.9), (49.55, 26.9),
    (49.2, 27.4), (48.85, 27.9), (48.4, 28.6), (48.1, 29.25), (47.72, 29.45), (47.95, 29.7),
]
MER_SALEE = [(35.48, 31.78), (35.58, 31.75), (35.6, 31.4), (35.55, 31.1), (35.43, 31.12),
             (35.38, 31.45), (35.43, 31.7)]
LAC_GALILEE = [(35.55, 32.89), (35.63, 32.88), (35.65, 32.8), (35.59, 32.71), (35.53, 32.8)]

NIL = [(30.95, 26.9), (31.18, 27.18), (30.75, 28.1), (31.1, 29.07), (31.22, 30.05), (31.1, 30.3)]
NIL_ROSETTE = [(31.1, 30.3), (30.75, 30.75), (30.55, 31.15), (30.4, 31.47)]
NIL_DAMIETTE = [(31.1, 30.3), (31.35, 30.8), (31.6, 31.15), (31.82, 31.52)]
EUPHRATE = [(38.75, 38.6), (38.6, 38.0), (38.45, 37.6), (38.0, 37.1), (38.0, 36.83), (38.55, 35.95),
            (39.0, 35.95), (40.15, 35.33), (40.92, 34.45), (41.97, 34.37), (42.35, 34.13),
            (42.83, 33.64), (43.3, 33.42), (43.78, 33.35), (44.42, 32.54), (44.6, 32.0),
            (45.3, 31.3), (46.25, 31.05), (47.43, 31.0)]
TIGRE = [(39.6, 38.6), (40.23, 37.91), (41.42, 37.71), (42.19, 37.33), (43.13, 36.36), (43.5, 35.3),
         (43.68, 34.6), (43.87, 34.2), (44.38, 33.33), (45.0, 32.9), (45.82, 32.5), (47.15, 31.84),
         (47.43, 31.0)]
CHATT = [(47.43, 31.0), (47.8, 30.5), (48.3, 30.15), (48.55, 29.97)]
JOURDAIN = [(35.6, 32.72), (35.56, 32.4), (35.55, 32.1), (35.54, 31.78)]

# Positions approximatives des sites (identifications courantes : Tell en-Nasbeh pour Mitspa,
# er-Ram pour Rama, Ras el-Kharrubeh / Anata pour Anathoth, Tell Defenneh pour Tachpanès).
VILLES_MONDE = {
    "Jérusalem": (35.23, 31.78), "Meguiddo": (35.18, 32.585), "Carkemisch": (38.0, 36.83),
    "Babylone": (44.42, 32.54), "Tachpanès": (32.17, 30.86), "Noph": (31.25, 29.85),
    "Ribla": (36.55, 34.45),
}
VILLES_ENCART = {
    "Jérusalem": (35.230, 31.778), "Anathoth": (35.260, 31.812), "Rama": (35.232, 31.852),
    "Mitspa": (35.217, 31.886), "Jéricho": (35.444, 31.871),
}
ENCART_JORDAIN = [(35.53, 31.99), (35.545, 31.93), (35.535, 31.88), (35.55, 31.83), (35.545, 31.79),
                  (35.556, 31.765)]
ENCART_MER_SALEE = [(35.45, 31.6), (35.455, 31.72), (35.475, 31.762), (35.51, 31.769),
                    (35.545, 31.759), (35.575, 31.73), (35.59, 31.6)]


class Projection:
    """Projection équirectangulaire centrée : suffisante pour une carte schématique de cette taille."""

    def __init__(self, lon_min, lon_max, lat_min, lat_max, x0, y0, largeur):
        self.lon_min, self.lat_max = lon_min, lat_max
        self.coslat = math.cos(math.radians((lat_min + lat_max) / 2))
        self.k = largeur / ((lon_max - lon_min) * self.coslat)
        self.x0, self.y0 = x0, y0
        self.largeur = largeur
        self.hauteur = (lat_max - lat_min) * self.k

    def __call__(self, lon, lat):
        return (self.x0 + (lon - self.lon_min) * self.coslat * self.k,
                self.y0 + (self.lat_max - lat) * self.k)

    def liste(self, points):
        return [self(lon, lat) for lon, lat in points]

    def mm_par_km(self):
        return self.k / 111.2


def barre_echelle(x, y, km, mm_par_km, sous_div=2):
    longueur = km * mm_par_km
    morceaux = []
    pas = longueur / sous_div
    for i in range(sous_div):
        remplissage = "#000000" if i % 2 == 0 else "#FFFFFF"
        morceaux.append(f'<rect x="{fmt(x + i * pas)}" y="{fmt(y)}" width="{fmt(pas)}" height="0.9" '
                        f'fill="{remplissage}" stroke="#000000" stroke-width="0.15"/>')
    morceaux.append(texte(x, y - 0.9, "0", 6))
    morceaux.append(texte(x + longueur, y - 0.9, f"{km} km", 6, ancre="middle"))
    return "".join(morceaux)


def fleche_nord(x, y):
    return (f'<path d="M{fmt(x)},{fmt(y)} l1.4,4.2 l-1.4,-1.1 l-1.4,1.1 Z" fill="#000000"/>'
            + texte(x, y - 0.8, "N", 7, ancre="middle", graisse=600))


def point_ville(x, y, capitale=False):
    if capitale:
        return (f'<rect x="{fmt(x - 1.05)}" y="{fmt(y - 1.05)}" width="2.1" height="2.1" fill="#FFFFFF" '
                f'stroke="#000000" stroke-width="0.35"/>'
                f'<rect x="{fmt(x - 0.5)}" y="{fmt(y - 0.5)}" width="1" height="1" fill="#000000"/>')
    return (f'<circle cx="{fmt(x)}" cy="{fmt(y)}" r="0.85" fill="#000000" stroke="#FFFFFF" '
            f'stroke-width="0.25"/>')


def carte():
    L, H = 120.0, 170.0
    monde = Projection(29.5, 49.4, 26.9, 38.6, 0.0, 0.0, L)
    svg = [entete_svg(L, H, "Carte schématique du monde de Jérémie",
                      "Carte en niveaux de gris : Grande mer (Méditerranée), Nil, Euphrate, Tigre, Juda, "
                      "Egypte, Chaldée ; encart des environs de Jérusalem. Positions approximatives.")]
    svg.append(f'<defs><clipPath id="cadre-monde"><rect x="0" y="0" width="{fmt(L)}" '
               f'height="{fmt(monde.hauteur)}"/></clipPath>')

    # --- carte principale
    y_encart = monde.hauteur + 6.0
    # L'encart prend toute la hauteur restante de la page : on déduit sa latitude sud de la place libre.
    lat_nord = 32.0
    coslat = math.cos(math.radians(31.83))
    k_encart = L / (0.6 * coslat)
    lat_sud = lat_nord - (H - 0.2 - y_encart) / k_encart
    encart = Projection(35.02, 35.62, lat_sud, lat_nord, 0.0, y_encart, L)
    svg.append(f'<clipPath id="cadre-encart"><rect x="0" y="{fmt(y_encart)}" width="{fmt(L)}" '
               f'height="{fmt(encart.hauteur)}"/></clipPath></defs>')

    svg.append('<g clip-path="url(#cadre-monde)">')
    svg.append(f'<rect x="0" y="0" width="{fmt(L)}" height="{fmt(monde.hauteur)}" fill="#FFFFFF"/>')
    coin_haut_gauche = [(29.0, 36.22), (29.0, 30.95)]
    svg.append(f'<path d="{chemin_lisse(monde.liste(COTE_MEDITERRANEE), tension=0.6)} '
               f'L{fmt(monde(*coin_haut_gauche[1])[0])},{fmt(monde(*coin_haut_gauche[1])[1])} '
               f'L{fmt(monde(*coin_haut_gauche[0])[0])},{fmt(monde(*coin_haut_gauche[0])[1])} Z" '
               f'fill="{GRIS_EAU}" stroke="{GRIS_COTE}" stroke-width="0.25" stroke-linejoin="round"/>')
    for contour in (MER_ROUGE, GOLFE_PERSIQUE, MER_SALEE, LAC_GALILEE):
        svg.append(f'<path d="{chemin_lisse(monde.liste(contour), ferme=True, tension=0.6)}" '
                   f'fill="{GRIS_EAU}" stroke="{GRIS_COTE}" stroke-width="0.25" stroke-linejoin="round"/>')
    svg.append(f'<path d="{chemin_lisse(monde.liste(CHYPRE), ferme=True, tension=0.6)}" fill="#FFFFFF" '
               f'stroke="{GRIS_COTE}" stroke-width="0.25"/>')
    for fleuve, epaisseur in ((NIL, 0.55), (NIL_ROSETTE, 0.4), (NIL_DAMIETTE, 0.4), (EUPHRATE, 0.55),
                              (TIGRE, 0.55), (CHATT, 0.55), (JOURDAIN, 0.3)):
        svg.append(f'<path d="{chemin_lisse(monde.liste(fleuve))}" fill="none" stroke="{GRIS_FLEUVE}" '
                   f'stroke-width="{epaisseur}" stroke-linecap="round" stroke-linejoin="round"/>')

    # Régions et étendues d'eau
    def etiquette_region(lon, lat, nom, taille=8.5, espacement=0.9):
        x, y = monde(lon, lat)
        return texte(x, y, nom, taille, couleur=GRIS_REGION, ancre="middle", espacement=espacement)

    svg.append(etiquette_region(32.1, 27.85, "ÉGYPTE", taille=7, espacement=0.35))
    svg.append(etiquette_region(45.9, 30.0, "CHALDÉE"))
    svg.append(etiquette_region(34.45, 30.95, "JUDA", taille=7.5, espacement=0.6))
    x, y = monde(32.2, 33.9)
    svg.append(texte(x, y, "Grande mer", 8.5, couleur=GRIS_EAU_TEXTE, ancre="middle", style="italic"))
    svg.append(texte(x, y + 3.4, "(Méditerranée)", 7, couleur=GRIS_EAU_TEXTE, ancre="middle", style="italic"))
    x, y = monde(35.75, 27.55)
    svg.append(texte(x, y, "Mer Rouge", 6.5, couleur=GRIS_EAU_TEXTE, ancre="start", style="italic"))
    x, y = monde(30.62, 29.0)
    svg.append(texte(x, y, "Nil", 7.5, couleur=GRIS_EAU_TEXTE, ancre="end", style="italic"))
    x, y = monde(39.8, 34.9)
    svg.append(texte(x, y, "Euphrate", 7.5, couleur=GRIS_EAU_TEXTE, ancre="end", style="italic",
                     contour_blanc=True))
    x, y = monde(44.35, 34.6)
    svg.append(texte(x, y, "Tigre", 7.5, couleur=GRIS_EAU_TEXTE, ancre="start", style="italic",
                     contour_blanc=True))
    svg.append(texte(x, y + 2.9, "(Hiddékel)", 6.5, couleur=GRIS_EAU_TEXTE, ancre="start", style="italic",
                     contour_blanc=True))

    # Villes : (nom, décalage x, décalage y, ancre)
    placements = {
        "Jérusalem": (2.8, 0.9, "start"), "Meguiddo": (1.6, 0.9, "start"),
        "Carkemisch": (1.6, 0.9, "start"), "Babylone": (-1.6, 3.2, "end"),
        "Tachpanès": (1.4, 2.9, "start"), "Noph": (-1.5, 0.9, "end"), "Ribla": (1.6, 0.9, "start"),
    }
    for nom, (lon, lat) in VILLES_MONDE.items():
        x, y = monde(lon, lat)
        svg.append(point_ville(x, y, capitale=(nom == "Jérusalem")))
        dx, dy, ancre = placements[nom]
        svg.append(texte(x + dx, y + dy, nom, 7.5, ancre=ancre, graisse=500, contour_blanc=True))

    # Repère de l'encart autour de Jérusalem
    x1, y1 = monde(35.02, 31.985)
    x2, y2 = monde(35.62, 31.68)
    svg.append(f'<rect x="{fmt(x1)}" y="{fmt(y1)}" width="{fmt(x2 - x1)}" height="{fmt(y2 - y1)}" '
               f'fill="none" stroke="#000000" stroke-width="0.2" stroke-dasharray="0.6,0.4"/>')
    svg.append("</g>")
    svg.append(f'<rect x="0" y="0" width="{fmt(L)}" height="{fmt(monde.hauteur)}" fill="none" '
               f'stroke="#000000" stroke-width="0.3"/>')
    svg.append(barre_echelle(L - 22.0, monde.hauteur - 4.0, 200, monde.mm_par_km()))
    svg.append(fleche_nord(L - 6.0, 6.0))

    # --- encart
    svg.append('<g clip-path="url(#cadre-encart)">')
    svg.append(f'<rect x="0" y="{fmt(y_encart)}" width="{fmt(L)}" height="{fmt(encart.hauteur)}" '
               f'fill="#FFFFFF"/>')
    svg.append(f'<path d="{chemin_lisse(encart.liste(ENCART_MER_SALEE), ferme=True, tension=0.6)}" '
               f'fill="{GRIS_EAU}" stroke="{GRIS_COTE}" stroke-width="0.25"/>')
    svg.append(f'<path d="{chemin_lisse(encart.liste(ENCART_JORDAIN))}" fill="none" '
               f'stroke="{GRIS_FLEUVE}" stroke-width="0.6" stroke-linecap="round"/>')
    placements_encart = {
        "Jérusalem": (2.4, 3.6, "start"), "Anathoth": (2.4, 1.2, "start"), "Rama": (2.4, 1.2, "start"),
        "Mitspa": (-2.4, 1.2, "end"), "Jéricho": (-2.4, 1.2, "end"),
    }
    for nom, (lon, lat) in VILLES_ENCART.items():
        x, y = encart(lon, lat)
        if nom == "Jérusalem":
            svg.append(f'<rect x="{fmt(x - 1.5)}" y="{fmt(y - 1.5)}" width="3" height="3" fill="#FFFFFF" '
                       f'stroke="#000000" stroke-width="0.4"/>'
                       f'<rect x="{fmt(x - 0.7)}" y="{fmt(y - 0.7)}" width="1.4" height="1.4" fill="#000000"/>')
        else:
            svg.append(f'<circle cx="{fmt(x)}" cy="{fmt(y)}" r="1.1" fill="#000000"/>')
        dx, dy, ancre = placements_encart[nom]
        svg.append(texte(x + dx, y + dy, nom, 9, ancre=ancre, graisse=500))
    x, y = encart(35.548, 31.905)
    svg.append(texte(x + 2.0, y, "Jourdain", 7.5, couleur=GRIS_EAU_TEXTE, style="italic"))
    x, y = encart(35.52, 31.715)
    svg.append(texte(x, y, "Mer Salée", 7.5, couleur=GRIS_EAU_TEXTE, ancre="middle", style="italic"))
    x, y = encart(35.36, 31.74)
    svg.append(texte(x, y, "désert de Juda", 7.5, couleur=GRIS_REGION, ancre="middle", style="italic"))
    svg.append(texte(3.0, y_encart + 5.5, "ENVIRONS DE JÉRUSALEM", 7, couleur=GRIS_REGION, espacement=0.5))
    svg.append("</g>")
    svg.append(f'<rect x="0" y="{fmt(y_encart)}" width="{fmt(L)}" height="{fmt(encart.hauteur)}" fill="none" '
               f'stroke="#000000" stroke-width="0.3"/>')
    svg.append(barre_echelle(4.0, y_encart + encart.hauteur - 4.0, 10, encart.mm_par_km()))
    svg.append("</svg>\n")
    return "".join(svg), (L, H)


# ---------------------------------------------------------------- frise des rois

def frise():
    L, H = 105.0, 78.0
    debut, fin = 642, 580
    x_min, x_max = 4.0, 101.0

    def x(annee):
        return x_min + (debut - annee) * (x_max - x_min) / (debut - fin)

    svg = [entete_svg(L, H, "Frise des rois de Juda au temps de Jérémie",
                      "Rois de Juda de Josias à Sédécias, puis le gouverneur Guedalia, avec les repères du "
                      "ministère de Jérémie. Dates av. J.-C., approximatives.")]
    svg.append(f'<rect x="0" y="0" width="{fmt(L)}" height="{fmt(H)}" fill="#FFFFFF"/>')
    y_axe = 27.0
    svg.append(f'<line x1="{fmt(x_min)}" y1="{fmt(y_axe)}" x2="{fmt(x_max)}" y2="{fmt(y_axe)}" '
               f'stroke="#000000" stroke-width="0.35"/>')
    for annee in range(640, fin - 1, -10):
        svg.append(f'<line x1="{fmt(x(annee))}" y1="{fmt(y_axe)}" x2="{fmt(x(annee))}" y2="{fmt(y_axe + 1.2)}" '
                   f'stroke="#000000" stroke-width="0.25"/>')
        svg.append(texte(x(annee), y_axe + 3.6, str(annee), 6, couleur="#4A4A4A", ancre="middle"))
    for annee in range(640, fin - 1, -1):
        if annee % 10:
            svg.append(f'<line x1="{fmt(x(annee))}" y1="{fmt(y_axe)}" x2="{fmt(x(annee))}" '
                       f'y2="{fmt(y_axe + 0.6)}" stroke="#7A7A7A" stroke-width="0.12"/>')

    # Repères : (année, nom, date, rangée, ancre, x du texte)
    rangees = {"A": 4.6, "B": 12.1, "C": 19.6}
    reperes = [
        (627, "Appel de Jérémie", "vers 627", "A", "end", x(627) + 1.5),
        (622, "Réforme de Josias", "vers 622", "B", "start", x(622) - 1.3),
        (605, "Bataille de Carkemisch", "vers 605", "A", "start", x(605) - 1.3),
        (597, "Déportation de Jojakin", "vers 597", "B", "start", x(597) - 1.3),
        (586.5, "Chute de Jérusalem", "vers 587-586", "C", "end", x_max),
    ]
    for annee, nom, date, rangee, ancre, x_texte in reperes:
        y = rangees[rangee]
        svg.append(texte(x_texte, y, nom, 7, ancre=ancre, graisse=500))
        svg.append(texte(x_texte, y + 3.0, date, 6.5, couleur="#3A3A3A", ancre=ancre, style="italic"))
        svg.append(f'<line x1="{fmt(x(annee))}" y1="{fmt(y + 4.2)}" x2="{fmt(x(annee))}" y2="{fmt(y_axe)}" '
                   f'stroke="#000000" stroke-width="0.2"/>')
        svg.append(f'<circle cx="{fmt(x(annee))}" cy="{fmt(y_axe)}" r="0.9" fill="#000000"/>')

    # Règnes
    haut, bas = 32.0, 39.5
    milieu = (haut + bas) / 2 + 1.0

    def barre(a, b, remplissage, contour="none", pointilles=""):
        return (f'<rect x="{fmt(x(a))}" y="{fmt(haut)}" width="{fmt(x(b) - x(a))}" height="{fmt(bas - haut)}" '
                f'fill="{remplissage}" stroke="{contour}" stroke-width="0.3"{pointilles}/>')

    svg.append(barre(640, 609, "#5C5C5C"))
    svg.append(texte((x(640) + x(609)) / 2, milieu, "Josias", 8, couleur="#FFFFFF", ancre="middle", graisse=600))
    svg.append(barre(608.6, 598, "#A6A6A6"))
    svg.append(texte((x(608.6) + x(598)) / 2, milieu, "Jojakim", 8, ancre="middle", graisse=600))
    svg.append(barre(597, 586, "#5C5C5C"))
    svg.append(texte((x(597) + x(586)) / 2, milieu, "Sédécias", 8, couleur="#FFFFFF", ancre="middle",
                     graisse=600))
    # Les règnes de trois mois sont élargis pour rester visibles ; leur date exacte est dans l'étiquette.
    for a, b in ((609, 608.6), (598, 597)):
        svg.append(f'<rect x="{fmt(x(a))}" y="{fmt(haut - 1.2)}" width="{fmt(x(b) - x(a))}" '
                   f'height="{fmt(bas - haut + 2.4)}" fill="#000000"/>')
    # Fin de la charge de Guedalia : date discutée, d'où le pointillé.
    svg.append(barre(586, 582, "#E6E6E6", contour="#000000", pointilles=' stroke-dasharray="0.8,0.5"'))

    y_dates = 43.6
    for a, b, date in ((640, 609, "vers 640-609"), (608.6, 598, "vers 609-598"), (597, 586, "vers 597-586")):
        svg.append(texte((x(a) + x(b)) / 2, y_dates, date, 6.5, couleur="#3A3A3A", ancre="middle", style="italic"))

    def renvoi(x_barre, y_texte, lignes, x_texte, ancre):
        morceaux = [f'<line x1="{fmt(x_barre)}" y1="{fmt(bas + 1.2)}" x2="{fmt(x_barre)}" '
                    f'y2="{fmt(y_texte - 2.9)}" stroke="#000000" stroke-width="0.2"/>']
        for i, (contenu, style) in enumerate(lignes):
            morceaux.append(texte(x_texte, y_texte + i * 3.0, contenu, 7 if i == 0 else 6.5,
                                  couleur="#000000" if i == 0 else "#3A3A3A", ancre=ancre, style=style,
                                  graisse=500 if i == 0 else 400))
        return "".join(morceaux)

    svg.append(renvoi(x(608.8), 50.5, [("Joachaz", "normal"), ("vers 609, trois mois", "italic")],
                      x(608.8) + 0.8, "end"))
    svg.append(renvoi(x(597.5), 57.5, [("Jojakin", "normal"), ("vers 598-597, trois mois", "italic")],
                      x(597.5) + 0.8, "end"))
    svg.append(renvoi(x(584), 50.5, [("Guedalia, gouverneur", "normal"), ("à partir de 586", "italic")],
                      x_max, "end"))

    # Ministère de Jérémie
    y_min = 66.5
    svg.append(f'<rect x="{fmt(x(627))}" y="{fmt(y_min)}" width="{fmt(x(586) - x(627))}" height="2.2" '
               f'fill="#000000"/>')
    svg.append(f'<line x1="{fmt(x(586))}" y1="{fmt(y_min + 1.1)}" x2="{fmt(x_max)}" y2="{fmt(y_min + 1.1)}" '
               f'stroke="#000000" stroke-width="1.0" stroke-dasharray="1,0.8"/>')
    svg.append(texte(x(627), y_min - 1.4, "Ministère de Jérémie (vers 627 jusqu\u2019après 586, en Égypte)",
                     7, ancre="start", graisse=500))
    svg.append(texte(x_min, H - 2.0, "Toutes les dates sont avant Jésus-Christ et approximatives (chronologie usuelle).",
                     6.5, couleur="#3A3A3A", style="italic"))
    svg.append("</svg>\n")
    return "".join(svg), (L, H)


# ---------------------------------------------------------------- couverture et fleuron

PALETTE = {
    "indigo": "#1E2B47",    # ciel de nuit finissante, sol du premier plan
    "mauve": "#5B5378",     # bande de ciel, remparts et colline lointaine
    "abricot": "#E59B5E",   # lueur de l'aube
    "sable": "#F3D9B1",     # horizon, disque du soleil
    "ecorce": "#2E211B",    # branche, contours des fleurs
    "amande": "#FAF0EA",    # pétales
    "carmin": "#B4475C",    # cœur des fleurs, boutons
}


def bezier(p0, p1, p2, p3, t):
    u = 1 - t
    return (u ** 3 * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t ** 3 * p3[0],
            u ** 3 * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t ** 3 * p3[1])


def rameau(controles, largeur_base, largeur_bout, pas=60):
    """Rameau effilé : contour fermé autour d'une Bézier, plus large à la base qu'à la pointe."""
    centre = [bezier(*controles, i / pas) for i in range(pas + 1)]
    gauche, droite = [], []
    for i, (cx, cy) in enumerate(centre):
        a = centre[max(i - 1, 0)]
        b = centre[min(i + 1, pas)]
        dx, dy = b[0] - a[0], b[1] - a[1]
        norme = math.hypot(dx, dy) or 1
        nx, ny = -dy / norme, dx / norme
        t = i / pas
        demi = (largeur_base + (largeur_bout - largeur_base) * t ** 0.8) / 2
        # Petites nodosités de l'écorce : l'amandier a un bois noueux.
        demi *= 1 + 0.10 * math.sin(t * 23)
        gauche.append((cx + nx * demi, cy + ny * demi))
        droite.append((cx - nx * demi, cy - ny * demi))
    contour = gauche + droite[::-1]
    return "M" + " L".join(f"{fmt(px)},{fmt(py)}" for px, py in contour) + " Z"


def petale(r, largeur=1.0):
    w = r * largeur
    return (f"M0,{fmt(-0.12 * r)} C{fmt(-0.48 * w)},{fmt(-0.22 * r)} {fmt(-0.56 * w)},{fmt(-0.92 * r)} "
            f"{fmt(-0.13 * w)},{fmt(-r)} Q0,{fmt(-0.95 * r)} {fmt(0.13 * w)},{fmt(-r)} "
            f"C{fmt(0.56 * w)},{fmt(-0.92 * r)} {fmt(0.48 * w)},{fmt(-0.22 * r)} 0,{fmt(-0.12 * r)} Z")


def fleur(x, y, r, rotation, couleurs, trait=0.3, largeur_petale=1.0):
    morceaux = [f'<g transform="translate({fmt(x)},{fmt(y)}) rotate({fmt(rotation)})">']
    for i in range(5):
        morceaux.append(f'<path d="{petale(r, largeur_petale)}" transform="rotate({i * 72})" fill="{couleurs["petale"]}" '
                        f'stroke="{couleurs["trait"]}" stroke-width="{fmt(trait)}" stroke-linejoin="round"/>')
    morceaux.append(f'<circle r="{fmt(0.24 * r)}" fill="{couleurs["coeur"]}"/>')
    for i in range(10):
        a = math.radians(i * 36 + 18)
        x2, y2 = math.cos(a) * 0.42 * r, math.sin(a) * 0.42 * r
        morceaux.append(f'<line x1="0" y1="0" x2="{fmt(x2)}" y2="{fmt(y2)}" stroke="{couleurs["coeur"]}" '
                        f'stroke-width="{fmt(0.045 * r)}" stroke-linecap="round"/>')
        morceaux.append(f'<circle cx="{fmt(x2)}" cy="{fmt(y2)}" r="{fmt(0.055 * r)}" fill="{couleurs["etamine"]}"/>')
    morceaux.append("</g>")
    return "".join(morceaux)


def bouton(x, y, longueur, angle, couleurs, trait=0.3):
    l = longueur
    return (f'<g transform="translate({fmt(x)},{fmt(y)}) rotate({fmt(angle)})">'
            f'<path d="M0,0 C{fmt(0.35 * l)},{fmt(-0.45 * l)} {fmt(0.85 * l)},{fmt(-0.3 * l)} {fmt(l)},0 '
            f'C{fmt(0.85 * l)},{fmt(0.3 * l)} {fmt(0.35 * l)},{fmt(0.45 * l)} 0,0 Z" fill="{couleurs["bouton"]}" '
            f'stroke="{couleurs["trait"]}" stroke-width="{fmt(trait)}"/>'
            f'<path d="M0,0 C{fmt(0.15 * l)},{fmt(-0.3 * l)} {fmt(0.3 * l)},{fmt(-0.25 * l)} {fmt(0.36 * l)},0 '
            f'C{fmt(0.3 * l)},{fmt(0.25 * l)} {fmt(0.15 * l)},{fmt(0.3 * l)} 0,0 Z" fill="{couleurs["calice"]}"/>'
            f'</g>')


def remparts(y_pied):
    """Silhouette de murailles de l'âge du fer : tours carrées crénelées, une porte, aucun édifice postérieur."""
    p = PALETTE["mauve"]
    morceaux = []
    mur_haut = y_pied - 7.0
    morceaux.append(f'<rect x="16" y="{fmt(mur_haut)}" width="114" height="9" fill="{p}"/>')
    for i in range(int(114 / 3.2)):
        morceaux.append(f'<rect x="{fmt(16.4 + i * 3.2)}" y="{fmt(mur_haut - 1.3)}" width="1.7" height="1.4" fill="{p}"/>')
    for tx, hauteur in ((14, 12.5), (31, 11), (49, 12), (66, 15.5), (75.5, 15.5), (93, 11.5), (110, 12.5), (127, 11)):
        largeur = 6.0
        haut = y_pied - hauteur
        morceaux.append(f'<rect x="{fmt(tx)}" y="{fmt(haut)}" width="{largeur}" height="{fmt(hauteur + 2)}" fill="{p}"/>')
        for k in range(3):
            morceaux.append(f'<rect x="{fmt(tx + 0.2 + k * 2.1)}" y="{fmt(haut - 1.5)}" width="1.5" height="1.6" fill="{p}"/>')
    # Porte entre les deux grandes tours, ouverte sur la lueur de l'aube.
    morceaux.append(f'<path d="M72,{fmt(y_pied + 0.5)} L72,{fmt(y_pied - 4.5)} Q74.75,{fmt(y_pied - 7.6)} 77.5,'
                    f'{fmt(y_pied - 4.5)} L77.5,{fmt(y_pied + 0.5)} Z" fill="{PALETTE["abricot"]}"/>')
    # Maisons basses derrière le mur.
    for mx, ml, mh in ((22, 7, 4), (38, 9, 3.5), (56, 6, 5), (84, 8, 4.2), (100, 7, 3.2), (117, 8, 4.5)):
        morceaux.append(f'<rect x="{mx}" y="{fmt(mur_haut - mh)}" width="{ml}" height="{fmt(mh + 1)}" fill="{p}"/>')
    return "".join(morceaux)


def couverture(avec_remparts=True):
    L, H = 146.0, 216.0
    c = PALETTE
    titre = "Couverture : branche d'amandier à l'aube" + (" devant les remparts de Jérusalem" if avec_remparts else "")
    svg = [entete_svg(L, H, titre, "Illustration en aplats, plat 1, 146 x 216 mm fonds perdus inclus. "
                      "Zone calme pour le titre de 0 à 85 mm depuis le haut du fichier. Aucun texte.")]
    bandes = ((0, 104, c["indigo"]), (104, 128, c["mauve"]), (128, 150, c["abricot"]), (150, 216, c["sable"]))
    for haut, bas, couleur in bandes:
        svg.append(f'<rect x="0" y="{haut}" width="{fmt(L)}" height="{bas - haut + 0.3}" fill="{couleur}"/>')
    svg.append(f'<circle cx="52" cy="163" r="25" fill="{c["sable"]}"/>')
    # Colline lointaine (et, si demandé, la ville fortifiée posée dessus)
    y_pied = 163.0
    if avec_remparts:
        svg.append(remparts(y_pied))
    svg.append(f'<path d="M0,{fmt(y_pied + 4)} C30,{fmt(y_pied)} 60,{fmt(y_pied + 0.5)} 90,{fmt(y_pied + 0.8)} '
               f'C115,{fmt(y_pied + 1)} 132,{fmt(y_pied + 3)} {fmt(L)},{fmt(y_pied + 5)} L{fmt(L)},190 L0,190 Z" '
               f'fill="{c["mauve"]}"/>')
    # Sol du premier plan
    svg.append(f'<path d="M0,180 C40,172 95,175 {fmt(L)},171 L{fmt(L)},{fmt(H)} L0,{fmt(H)} Z" fill="{c["indigo"]}"/>')

    couleurs = {"petale": c["amande"], "trait": c["ecorce"], "coeur": c["carmin"], "etamine": c["sable"],
                "bouton": c["carmin"], "calice": c["ecorce"]}
    tige = ((152, 158), (112, 152), (74, 128), (24, 99))
    rameau_haut = (bezier(*tige, 0.38), (100, 128), (98, 112), (90, 99))
    rameau_bas = (bezier(*tige, 0.62), (57, 133), (47, 141), (36, 146))
    rameau_court = (bezier(*tige, 0.18), (124, 140), (128, 128), (133, 120))
    svg.append(f'<g fill="{c["ecorce"]}">')
    svg.append(f'<path d="{rameau(tige, 7.5, 1.0)}"/>')
    svg.append(f'<path d="{rameau(rameau_haut, 3.0, 0.7)}"/>')
    svg.append(f'<path d="{rameau(rameau_bas, 2.6, 0.7)}"/>')
    svg.append(f'<path d="{rameau(rameau_court, 2.4, 0.7)}"/>')
    svg.append("</g>")

    def sur(courbe, t):
        return bezier(*courbe, t)

    fleurs = [
        (sur(tige, 0.93), 6.2, 12, (0, -3.5)), (sur(tige, 0.78), 7.6, 40, (1.5, -5.5)),
        (sur(tige, 0.70), 6.8, -8, (-1, 5.2)), (sur(tige, 0.52), 8.2, 25, (0, -6.5)),
        (sur(rameau_haut, 1.0), 7.0, 5, (-1.0, -4.0)), (sur(rameau_haut, 0.55), 6.0, 50, (5.0, 0.5)),
        (sur(rameau_bas, 1.0), 6.6, -20, (-2.0, 2.5)), (sur(rameau_bas, 0.5), 5.4, 15, (0.5, 4.6)),
        (sur(tige, 0.30), 7.4, 33, (0, 6.5)), (sur(rameau_court, 1.0), 6.4, -12, (1.0, -4.0)),
    ]
    boutons = [
        (sur(tige, 1.0), 5.0, 200), (sur(tige, 0.86), 4.2, 245), (sur(rameau_haut, 0.8), 4.0, 300),
        (sur(rameau_bas, 0.75), 3.8, 120), (sur(tige, 0.42), 4.4, 75), (sur(rameau_court, 0.6), 3.6, 330),
        (sur(tige, 0.62), 4.0, 260),
    ]
    for (bx, by), longueur, angle in boutons:
        svg.append(bouton(bx, by, longueur, angle, couleurs))
    for (fx, fy), r, rotation, (dx, dy) in fleurs:
        svg.append(fleur(fx + dx, fy + dy, r, rotation, couleurs))
    svg.append("</svg>\n")
    return "".join(svg), (L, H)


def couverture_sans_remparts():
    return couverture(avec_remparts=False)


def fleuron():
    """Ornement de chapitre, noir seul, 30 mm de large : rameau horizontal, une fleur ouverte au centre."""
    L, H = 30.0, 9.0
    noir = "#000000"
    couleurs = {"petale": noir, "trait": noir, "coeur": "#FFFFFF", "etamine": noir,
                "bouton": noir, "calice": noir}
    svg = [entete_svg(L, H, "Fleuron : rameau d'amandier",
                      "Ornement de chapitre monochrome noir, 30 mm de large.")]
    gauche = ((15, 5.6), (10.5, 6.8), (6.0, 6.6), (2.2, 4.9))
    droite = ((15, 5.6), (19.5, 6.8), (24.0, 6.6), (27.8, 4.9))
    for courbe in (gauche, droite):
        svg.append(f'<path d="{rameau(courbe, 0.9, 0.25)}" fill="{noir}"/>')
    for courbe, signe in ((gauche, -1), (droite, 1)):
        bx, by = bezier(*courbe, 1.0)
        svg.append(bouton(bx - signe * 0.3, by + 0.2, 2.2, -90 + signe * 62, couleurs, trait=0.1))
        fx, fy = bezier(*courbe, 0.55)
        svg.append(fleur(fx, fy - 1.9, 1.75, signe * 14, couleurs, trait=0, largeur_petale=0.74))
        bx, by = bezier(*courbe, 0.3)
        svg.append(bouton(bx, by + 0.3, 1.6, 90 - signe * 50, couleurs, trait=0.08))
    svg.append(fleur(15, 4.4, 3.0, 0, couleurs, trait=0, largeur_petale=0.74))
    svg.append("</svg>\n")
    return "".join(svg), (L, H)


# ---------------------------------------------------------------- écriture et conversion

def ecrire(nom, contenu):
    chemin = DOSSIER / nom
    chemin.write_text(contenu, encoding="utf-8")
    return chemin


def png(chemin_svg, largeur_mm, hauteur_mm, fond=None, mode="RGB", ppp=300, grand_cote_px=None, suffixe=""):
    """PNG à 300 ppp pour l'impression, ou à un grand côté donné en pixels pour l'écran (EPUB, PDF écran)."""
    import cairosvg
    from PIL import Image
    if grand_cote_px:
        echelle = grand_cote_px / max(largeur_mm, hauteur_mm)
        ppp = echelle * 25.4
    largeur_px = math.ceil(largeur_mm / 25.4 * ppp)
    hauteur_px = math.ceil(hauteur_mm / 25.4 * ppp)
    sortie = chemin_svg.with_name(chemin_svg.stem + suffixe + ".png")
    cairosvg.svg2png(url=str(chemin_svg), write_to=str(sortie), output_width=largeur_px,
                     output_height=hauteur_px, background_color=fond)
    image = Image.open(sortie).convert(mode)
    image.save(sortie, dpi=(round(ppp), round(ppp)))
    return sortie, image.size


def main():
    # (fichier, fabrique, fond, mode du PNG, version écran)
    productions = [
        ("carte-monde-jeremie.svg", carte, "#FFFFFF", "L", True),
        ("frise-rois-juda.svg", frise, "#FFFFFF", "L", True),
        ("couverture-amandier.svg", couverture, None, "RGB", False),
        ("couverture-amandier-sans-remparts.svg", couverture_sans_remparts, None, "RGB", False),
        ("fleuron-amandier.svg", fleuron, None, "RGBA", False),
    ]
    for nom, fabrique, fond, mode, ecran in productions:
        contenu, (largeur, hauteur) = fabrique()
        chemin = ecrire(nom, contenu)
        sortie, taille = png(chemin, largeur, hauteur, fond, mode)
        print(f"{nom} -> {sortie.name} {taille[0]}x{taille[1]} px, {mode}, 300 ppp")
        if ecran:
            sortie, taille = png(chemin, largeur, hauteur, fond, mode, grand_cote_px=2400, suffixe="-ecran")
            print(f"{nom} -> {sortie.name} {taille[0]}x{taille[1]} px, {mode}, écran")


if __name__ == "__main__":
    main()
