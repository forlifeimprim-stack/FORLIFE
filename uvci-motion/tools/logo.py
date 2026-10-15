"""Extrait le logo officiel UVCI de l'affiche et le reconstruit net en haute définition.
Usage : python3 logo.py affiche.jpg dossier_sortie
Sorties : logo-uvci.png (complet), logo-mark.png (sigle), logo-text.png (nom), transparents."""
import sys
import numpy as np
from PIL import Image, ImageFilter

src, out = sys.argv[1], sys.argv[2]
im = np.asarray(Image.open(src).convert('RGB')).astype(float)
Y0, Y1, X0, X1 = 40, 200, 55, 270
c = im[Y0:Y1, X0:X1]
BG = np.array([238, 241, 243.])
INKS = {'green': np.array([21, 140, 78.]), 'purple': np.array([124, 40, 136.]), 'dark': np.array([34, 33, 51.])}
COL = {'green': (21, 140, 78), 'purple': (124, 40, 136), 'dark': (34, 33, 51)}
# alpha par projection sur la droite fond -> encre, pour chaque encre
alphas = {}
for k, ink in INKS.items():
    d = ink - BG
    a = ((c - BG) @ d) / (d @ d)
    resid = np.linalg.norm(c - (BG + a[..., None] * d), axis=-1)
    alphas[k] = np.clip(a, 0, 1) * np.exp(-(resid / 38) ** 2)
# feuillage flou en haut à gauche : hors logo
yy, xx = np.mgrid[Y0:Y1, X0:X1]
for k in alphas:
    alphas[k][(yy < 100) & (xx < 100)] = 0
alphas['dark'][yy < 140] = 0  # le sigle n'a pas de bleu nuit
# chaque pixel appartient à l'encre dominante
stack = np.stack([alphas[k] for k in INKS])
win = stack.argmax(0)
S = 8
H, W = c.shape[:2]
up = lambda m, r: np.asarray(Image.fromarray((m * 255).astype(np.uint8)).resize((W * S, H * S), Image.BICUBIC)
                             .filter(ImageFilter.GaussianBlur(S * r))).astype(float) / 255
# forme : union de toutes les encres (évite les trous où deux couleurs se croisent)
shape = up(stack.max(0), .7)
al = np.clip((shape - 0.33) / 0.14, 0, 1)
al = al * al * (3 - 2 * al)
# couleur : encre dominante lissée
rgb = np.zeros((H * S, W * S, 3)); wsum = np.zeros((H * S, W * S))
for i, k in enumerate(INKS):
    m = up(np.where(win == i, 1.0, 0.0) * (stack.max(0) > .15), 1.0)
    m = m ** 4
    rgb += m[..., None] * np.array(COL[k]); wsum += m
rgb /= np.maximum(wsum, 1e-6)[..., None]
img = Image.fromarray(np.dstack([rgb, al * 255]).clip(0, 255).astype(np.uint8), 'RGBA')
img = img.crop(img.getbbox())
# réparation du délié du V (filet trop fin dans le JPEG source) : trait violet continu
from PIL import ImageDraw
A0 = np.asarray(img)[..., 3]
cut0 = next(y for y in range(int(A0.shape[0] * .45), A0.shape[0]) if A0[y].max() < 10)
mb = img.crop((0, 0, img.width, cut0)).getbbox()
ox, oy = mb[0], mb[1]
hi = Image.new('RGBA', (img.width * 2, img.height * 2), (0, 0, 0, 0))
dr = ImageDraw.Draw(hi)
P0, P1 = (690 + ox, 418 + oy), (586 + ox, 596 + oy)
for i in range(40):
    u = i / 39
    px, py = P0[0] + (P1[0] - P0[0]) * u, P0[1] + (P1[1] - P0[1]) * u
    r = (9 - 2 * u) * 2
    dr.ellipse((px * 2 - r, py * 2 - r, px * 2 + r, py * 2 + r), fill=COL['purple'] + (255,))
hi = hi.resize(img.size, Image.LANCZOS)
under = img.copy()
img = Image.alpha_composite(hi, img)  # sous le C vert
img.save(f'{out}/logo-uvci.png')
# séparation sigle / nom : première ligne vide sous le sigle
A = np.asarray(img)[..., 3]
rows = A.max(1)
h = A.shape[0]
cut = next(y for y in range(int(h * .45), h) if rows[y] < 10)
mark = img.crop((0, 0, img.width, cut)); mark = mark.crop(mark.getbbox()); mark.save(f'{out}/logo-mark.png')
text = img.crop((0, cut, img.width, h)); text = text.crop(text.getbbox()); text.save(f'{out}/logo-text.png')
print(img.size, mark.size, text.size)
