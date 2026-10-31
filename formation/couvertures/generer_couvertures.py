"""Couvertures de la collection « Apprivoiser l'informatique » (philosophie : Trame vive).

Un profil humain tissé de bandes de kita baoulé ; d'un tome à l'autre, le tissage se transforme en pixels puis
en circuits, depuis la tête : l'intelligence héritée devient code.
Sortie : PNG A4 300 dpi + PDF, dans formation/couvertures/.
"""
import math
import random
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ICI = Path(__file__).resolve().parent
POLICES = Path(sys.argv[1]) if len(sys.argv) > 1 else ICI / 'polices'

L, H = 2480, 3508           # A4 à 300 dpi
SS = 2                      # suréchantillonnage pour des bords nets
MARGE = 180

ORANGE, OR, VERT, CREME, INDIGO, BRIQUE, BLANC = (
    (234, 120, 34), (226, 172, 72), (24, 122, 82), (246, 239, 230), (24, 22, 40), (160, 62, 32), (250, 247, 242))

TOMES = [
    dict(n=1, niveau='NIVEAU DÉBUTANT', titre=["Apprivoiser", "l'ordinateur"], sous="Mes premiers pas sans peur",
         fond=(246, 239, 230), encre=(24, 22, 26), point=(222, 210, 196), coiffe='foulard', t=0.0),
    dict(n=2, niveau='NIVEAU INTERMÉDIAIRE', titre=["Maîtriser", "l'outil"], sous="L'informatique au service de mon travail",
         fond=(13, 52, 40), encre=(246, 239, 230), point=(30, 78, 62), coiffe='court', t=0.55),
    dict(n=3, niveau='NIVEAU EXPERT', titre=["Créer", "avec l'IA"], sous="Le vibe coding, de l'idée à l'application en ligne",
         fond=(12, 18, 42), encre=(246, 239, 230), point=(30, 40, 78), coiffe='chignon', t=1.0),
]


def police(nom, taille):
    return ImageFont.truetype(str(POLICES / nom), int(taille * SS))


# ---------- Silhouette (profil tourné vers la droite), coordonnées dans une boîte 1000 × 1000 ----------
VISAGE = [(612, 300), (640, 345), (652, 392), (646, 420), (668, 455), (702, 498), (690, 512), (660, 522),
          (666, 540), (672, 550), (658, 563), (668, 578), (662, 593), (644, 606), (652, 634), (648, 662),
          (622, 686), (590, 700), (584, 760), (590, 840), (660, 880), (760, 930), (840, 1000)]
COIFFES = {
    'foulard': [(150, 1000), (190, 900), (300, 850), (408, 820), (432, 740), (420, 660), (380, 600), (340, 520),
                (300, 440), (262, 360), (250, 270), (272, 180), (330, 100), (410, 40), (500, 4), (580, 0),
                (640, 20), (690, 60), (700, 120), (672, 150), (690, 196), (676, 250), (650, 290)],
    'court': [(150, 1000), (190, 900), (300, 850), (408, 820), (430, 740), (418, 660), (392, 600), (372, 520),
              (372, 430), (392, 340), (440, 268), (510, 226), (580, 220), (630, 246), (650, 280), (640, 300)],
    'chignon': [(150, 1000), (190, 900), (300, 850), (408, 820), (430, 740), (418, 660), (392, 600), (366, 520),
                (360, 440), (360, 360), (330, 300), (310, 230), (330, 160), (390, 120), (450, 130), (480, 170),
                (500, 210), (560, 214), (620, 240), (648, 278), (640, 300)],
}


def catmull_rom(points, pas=14, ferme=True):
    pts = points[:]
    n = len(pts)
    sortie = []
    for i in range(n if ferme else n - 1):
        p0, p1, p2, p3 = pts[(i - 1) % n], pts[i], pts[(i + 1) % n], pts[(i + 2) % n]
        for k in range(pas):
            t = k / pas
            t2, t3 = t * t, t * t * t
            x = 0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2
                       + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3)
            y = 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2
                       + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
            sortie.append((x, y))
    return sortie


def silhouette(coiffe, ox, oy, echelle):
    # Visage (du front aux épaules), puis la coiffe en remontant de l'épaule arrière jusqu'au front.
    contour = VISAGE + [(840, 1000), (150, 1000)] + COIFFES[coiffe][1:]
    lisse = catmull_rom(contour)
    return [((ox + x * echelle) * SS, (oy + y * echelle) * SS) for x, y in lisse]


# ---------- Tissage kita ----------
def tisser(img, masque, boite, tome, rng, tete):
    d = ImageDraw.Draw(img)
    x0, y0, x1, y1 = boite
    S = 58 * SS                                    # largeur d'une bande
    palette = [ORANGE, ORANGE, OR, VERT, INDIGO, BLANC, BRIQUE]
    hx, hy, rayon = tete
    pixels, circuits = [], []
    x = x0
    while x < x1:
        y = y0 - rng.randint(0, 3) * S // 2
        fond_bande = rng.choice([INDIGO, ORANGE, VERT, OR])
        while y < y1:
            h = S * rng.choice([1, 1, 2, 2, 3])
            cx, cy = x + S / 2, y + h / 2
            dist = math.hypot(cx - hx, cy - hy)
            zone = tome['t'] > 0 and dist < rayon * (0.55 + 0.45 * rng.random())
            a, b = rng.sample(palette, 2)
            if zone:
                pixels.append((x, y, h, a))
            else:
                motif = rng.choice(['plein', 'damier', 'trame', 'trame', 'damier', 'losange'])
                if motif == 'plein':
                    d.rectangle([x, y, x + S, y + h], fill=a)
                elif motif == 'damier':
                    c = S // 4
                    for i in range(0, S, c):
                        for j in range(0, h, c):
                            d.rectangle([x + i, y + j, x + i + c, y + j + c], fill=a if (i // c + j // c) % 2 else b)
                elif motif == 'trame':
                    d.rectangle([x, y, x + S, y + h], fill=fond_bande)
                    e = max(3 * SS, S // 9)
                    for j in range(0, h, 2 * e):
                        d.rectangle([x, y + j, x + S, y + j + e], fill=a)
                else:
                    d.rectangle([x, y, x + S, y + h], fill=b)
                    m = S // 2
                    d.polygon([(x + m, y + h / 2 - m * 0.8), (x + S - 6 * SS, y + h / 2), (x + m, y + h / 2 + m * 0.8),
                               (x + 6 * SS, y + h / 2)], fill=a)
                d.line([x, y, x + S, y], fill=INDIGO, width=SS)
            y += h
        d.line([x, y0, x, y1], fill=INDIGO, width=2 * SS)   # couture entre deux bandes
        x += S
    return pixels


def composer(tome):
    rng = random.Random(1960 + tome['n'])
    W, Hh = L * SS, H * SS
    img = Image.new('RGB', (W, Hh), tome['fond'])
    d = ImageDraw.Draw(img)

    # Grille de points : la trame invisible du réseau.
    pas = 58 * SS
    for gx in range(MARGE * SS, W - MARGE * SS + 1, pas):
        for gy in range(1240 * SS, (H - 330) * SS, pas):
            r = 3 * SS
            d.ellipse([gx - r, gy - r, gx + r, gy + r], fill=tome['point'])

    # Silhouette tissée.
    ox, oy, ech = 330, 1180, 2.06
    contour = silhouette(tome['coiffe'], ox, oy, ech)
    masque = Image.new('L', (W, Hh), 0)
    ImageDraw.Draw(masque).polygon(contour, fill=255)
    bas = (H - 330) * SS
    ImageDraw.Draw(masque).rectangle([0, bas, W, Hh], fill=0)
    tissu = Image.new('RGB', (W, Hh), INDIGO)
    tete = ((ox + 440 * ech) * SS, (oy + 250 * ech) * SS, (110 + 300 * tome['t']) * ech * SS)
    pixels = tisser(tissu, masque, (int((ox + 100 * ech) * SS), int((oy + 20 * ech) * SS),
                                    int((ox + 900 * ech) * SS), bas), tome, rng, tete)
    img.paste(tissu, (0, 0), masque)

    # Pixels : la partie du tissage qui devient numérique, puis s'échappe vers la droite.
    d = ImageDraw.Draw(img)
    S = 58 * SS
    for (x, y, h, c) in pixels:
        for j in range(0, h, S):
            if masque.getpixel((min(W - 1, int(x + S / 2)), min(Hh - 1, int(y + j + S / 2)))) == 0:
                continue
            dx = 0
            if rng.random() < 0.35 * tome['t']:
                dx = rng.randint(1, int(3 + 9 * tome['t'])) * S
            px, py = x + dx, y + j
            if px + S > (L - MARGE) * SS:
                continue
            g = 6 * SS
            d.rectangle([px + g, py + g, px + S - g, py + S - g], fill=c)

    # Circuits (tome 3 surtout, amorcés au tome 2) : des pistes partent de la tête vers le monde.
    if tome['t'] > 0.3:
        hx, hy, _ = tete
        n = 5 if tome['t'] < 0.8 else 9
        for i in range(n):
            y = hy - 360 * SS + i * 92 * SS
            ligne = [masque.getpixel((k, int(y))) for k in range(0, W, 4 * SS)]
            dedans = [k for k, v in enumerate(ligne) if v]
            if not dedans:
                continue
            x = dedans[-1] * 4 * SS + 10 * SS
            couleur = ORANGE if i % 3 else OR
            pts = [(x, y)]
            longueur = rng.randint(4, 9) * S
            pts.append((x + longueur, y))
            dy = rng.choice([-1, 1]) * rng.randint(1, 2) * S
            pts.append((x + longueur + abs(dy), y + dy))
            fin = (L - MARGE - 30) * SS
            pts.append((min(fin, x + longueur + abs(dy) + rng.randint(2, 6) * S), y + dy))
            d.line(pts, fill=couleur, width=5 * SS, joint='curve')
            ex, ey = pts[-1]
            r = 13 * SS
            d.ellipse([ex - r, ey - r, ex + r, ey + r], outline=couleur, width=5 * SS, fill=tome['fond'])

    # ---------- Typographie ----------
    encre = tome['encre']
    mono = police('GeistMono-Regular.ttf', 30)
    d.rectangle([MARGE * SS, (MARGE + 6) * SS, (MARGE + 22) * SS, (MARGE + 28) * SS], fill=ORANGE)
    d.text(((MARGE + 44) * SS, MARGE * SS), 'FOR LIFE  ·  COLLECTION « APPRIVOISER L\'INFORMATIQUE »', font=mono, fill=encre)
    tome_txt = f'TOME {tome["n"]} / 3'
    w = d.textlength(tome_txt, font=mono)
    d.text(((L - MARGE) * SS - w, MARGE * SS), tome_txt, font=mono, fill=encre)
    d.line([MARGE * SS, (MARGE + 70) * SS, (L - MARGE) * SS, (MARGE + 70) * SS], fill=encre, width=2 * SS)

    niv = police('GeistMono-Bold.ttf', 40)
    d.text((MARGE * SS, 420 * SS), ' '.join(tome['niveau']).replace('   ', '     '), font=niv, fill=ORANGE)
    grand = police('BricolageGrotesque-Bold.ttf', 236)
    y = 500
    for ligne in tome['titre']:
        d.text((MARGE * SS - 8 * SS, y * SS), ligne, font=grand, fill=encre)
        y += 236
    sous = police('InstrumentSerif-Italic.ttf', 92)
    d.text((MARGE * SS, (y + 40) * SS), tome['sous'], font=sous, fill=encre)

    # Pied de couverture.
    pied = H - 250
    d.line([MARGE * SS, pied * SS, (L - MARGE) * SS, pied * SS], fill=encre, width=2 * SS)
    auteur = police('InstrumentSans-Bold.ttf', 50)
    d.text((MARGE * SS, (pied + 46) * SS), 'Kouadio Koffi Elisée', font=auteur, fill=encre)
    petit = police('GeistMono-Regular.ttf', 28)
    d.text((MARGE * SS, (pied + 118) * SS), 'Manuel de formation  ·  situations de vie, exercices, cas pratiques', font=petit, fill=encre)
    marque = police('BricolageGrotesque-Bold.ttf', 64)
    w = d.textlength('FOR LIFE', font=marque)
    d.text(((L - MARGE) * SS - w, (pied + 40) * SS), 'FOR LIFE', font=marque, fill=ORANGE)

    final = img.resize((L, H), Image.LANCZOS)
    return final


if __name__ == '__main__':
    pages = []
    for tome in TOMES:
        im = composer(tome)
        chemin = ICI / f'Couverture_Tome{tome["n"]}.png'
        im.save(chemin, dpi=(300, 300))
        im.convert('RGB').save(ICI / f'Couverture_Tome{tome["n"]}.pdf', resolution=300)
        pages.append(im)
        print('Écrit :', chemin)
