"""Planche des personnages (style « Trame vive », comme les couvertures)."""
import random, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
ICI = Path(__file__).resolve().parent
sys.path.insert(0, str(ICI.parent / 'couvertures'))
import generer_couvertures as G

SS = G.SS
PERSOS = [
    ('Tantie Akissi', '52 ans · commerçante', 'foulard', (246, 239, 230), 0.0),
    ('Yao', '22 ans · étudiant', 'court', (232, 220, 200), 0.0),
    ('Mariam', '34 ans · secrétaire', 'chignon', (225, 236, 228), 0.0),
    ('Koffi', '28 ans · entrepreneur', 'court', (250, 228, 210), 0.0),
    ('M. Kouassi', 'le formateur', 'court', (226, 230, 240), 0.0),
]
W, H = 600, 760

def portrait(nom, role, coiffe, fond, graine):
    img = Image.new('RGB', (W * SS, H * SS), fond)
    rng = random.Random(graine)
    ox, oy, ech = 40, 40, 0.56
    contour = G.silhouette(coiffe, ox, oy, ech)
    masque = Image.new('L', img.size, 0)
    ImageDraw.Draw(masque).polygon(contour, fill=255)
    bas = int((oy + 1000 * ech) * SS)
    tissu = Image.new('RGB', img.size, G.INDIGO)
    G.tisser(tissu, masque, (int((ox + 100 * ech) * SS), int((oy + 0) * SS), int((ox + 900 * ech) * SS), bas),
             {'t': 0}, rng, (0, 0, 0))
    img.paste(tissu, (0, 0), masque)
    d = ImageDraw.Draw(img)
    if nom == 'M. Kouassi':   # lunettes
        cx, cy = (ox + 610 * ech) * SS, (oy + 395 * ech) * SS
        d.ellipse([cx - 26 * SS, cy - 18 * SS, cx + 26 * SS, cy + 18 * SS], outline=G.INDIGO, width=5 * SS)
        d.line([cx - 26 * SS, cy, cx - 70 * SS, cy - 4 * SS], fill=G.INDIGO, width=5 * SS)
    titre = ImageFont.truetype(str(G.POLICES / 'BricolageGrotesque-Bold.ttf'), 44 * SS)
    petit = ImageFont.truetype(str(G.POLICES / 'GeistMono-Regular.ttf'), 22 * SS)
    d.text((40 * SS, 640 * SS), nom, font=titre, fill=G.INDIGO)
    d.text((40 * SS, 700 * SS), role.upper(), font=petit, fill=G.ORANGE)
    return img.resize((W, H), Image.LANCZOS)

planche = Image.new('RGB', (W * 5 + 24 * 4, H), (255, 255, 255))
for i, (nom, role, coiffe, fond, _) in enumerate(PERSOS):
    planche.paste(portrait(nom, role, coiffe, fond, 7 + i), (i * (W + 24), 0))
planche.save(ICI / 'personnages.png')
print('Écrit :', ICI / 'personnages.png')
