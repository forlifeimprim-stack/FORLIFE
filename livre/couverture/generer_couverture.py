"""Génère la couverture (1re et 4e) du livre « Avant que l'horloge ne s'arrête ».

Sortie : couverture.html, rendu ensuite en PDF et PNG par rendre_couverture.js.
Unités de dessin : 1 unité = 0,1 mm (format poche 110 x 178 mm).
"""
import math
import random

W, H = 1100, 1780
HORIZON = 1300
CX = W / 2


def f(x):
    return f"{x:.1f}"


def ciel(id_, stops):
    s = "".join(f'<stop offset="{o}" stop-color="{c}"/>' for o, c in stops)
    return f'<linearGradient id="{id_}" x1="0" y1="0" x2="0" y2="1">{s}</linearGradient>'


def etoiles(rng, n, y_max, densite_haut=1.0):
    pts = []
    for _ in range(n):
        y = rng.random() ** 1.6 * y_max
        x = rng.random() * W
        r = 0.9 + rng.random() * 1.6
        op = (1 - y / y_max) ** 1.3 * (0.35 + rng.random() * 0.6) * densite_haut
        pts.append(f'<circle cx="{f(x)}" cy="{f(y)}" r="{f(r)}" fill="#FFF4DA" opacity="{op:.2f}"/>')
    return "".join(pts)


def cadran(cx, cy, r0, echelle=1.0):
    """Demi-cadran de 365 graduations (les jours) au-dessus de l'horizon,
    plus un anneau intérieur de 60 graduations (les minutes)."""
    out = []
    n = 365
    for i in range(n + 1):
        a = math.pi * i / n  # 0 → π, de gauche à droite
        if i % 30 == 0:
            long_, ep = 118, 2.4
        elif i % 5 == 0:
            long_, ep = 70, 1.6
        else:
            long_, ep = 40, 1.0
        long_ *= echelle
        # Plus lumineux au zénith, plus discret vers l'horizon
        zen = math.sin(a)
        op = 0.18 + 0.72 * zen ** 1.4
        r1 = r0 * echelle
        r2 = r1 + long_
        x1, y1 = cx - r1 * math.cos(a), cy - r1 * math.sin(a)
        x2, y2 = cx - r2 * math.cos(a), cy - r2 * math.sin(a)
        out.append(
            f'<line x1="{f(x1)}" y1="{f(y1)}" x2="{f(x2)}" y2="{f(y2)}" '
            f'stroke="url(#or)" stroke-width="{ep * echelle:.2f}" stroke-linecap="round" opacity="{op:.2f}"/>'
        )
    ri = (r0 - 70) * echelle
    for i in range(31):
        a = math.pi * i / 30
        long_ = (26 if i % 5 == 0 else 14) * echelle
        x1, y1 = cx - ri * math.cos(a), cy - ri * math.sin(a)
        x2, y2 = cx - (ri + long_) * math.cos(a), cy - (ri + long_) * math.sin(a)
        out.append(
            f'<line x1="{f(x1)}" y1="{f(y1)}" x2="{f(x2)}" y2="{f(y2)}" '
            f'stroke="#FFF1CF" stroke-width="{1.3 * echelle:.2f}" stroke-linecap="round" opacity="0.55"/>'
        )
    return "".join(out)


def arcs_construction(cx, cy, rayons):
    out = []
    for r, dash, op in rayons:
        out.append(
            f'<path d="M {f(cx - r)} {cy} A {r} {r} 0 0 1 {f(cx + r)} {cy}" fill="none" '
            f'stroke="#FFE7B8" stroke-width="1" stroke-dasharray="{dash}" opacity="{op}"/>'
        )
    return "".join(out)


def sol(horizon, bas):
    """Lignes de perspective sur le sol, de plus en plus espacées vers le lecteur."""
    out = []
    for k in range(1, 14):
        t = (k / 13) ** 2.2
        y = horizon + t * (bas - horizon)
        op = 0.15 * (1 - k / 15)
        out.append(f'<line x1="0" y1="{f(y)}" x2="{W}" y2="{f(y)}" stroke="#F3C98C" stroke-width="1" opacity="{op:.2f}"/>')
    return "".join(out)


def defs_communs():
    return (
        '<linearGradient id="or" x1="0" y1="0" x2="0" y2="1">'
        '<stop offset="0" stop-color="#FFF6DE"/><stop offset="1" stop-color="#F5C46F"/></linearGradient>'
        '<radialGradient id="halo"><stop offset="0" stop-color="#FFE9B5" stop-opacity="0.85"/>'
        '<stop offset="0.35" stop-color="#F7B97A" stop-opacity="0.35"/><stop offset="1" stop-color="#E38C7A" stop-opacity="0"/></radialGradient>'
        '<radialGradient id="soleil" cy="0.62" r="0.62"><stop offset="0" stop-color="#FFFCF0"/>'
        '<stop offset="0.55" stop-color="#FFE7A8"/><stop offset="1" stop-color="#F7BE67"/></radialGradient>'
        '<linearGradient id="sol" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A2753"/>'
        '<stop offset="1" stop-color="#140E28"/></linearGradient>'
        '<linearGradient id="chemin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF1CF" stop-opacity="0.95"/>'
        '<stop offset="0.45" stop-color="#F5C46F" stop-opacity="0.38"/><stop offset="0.85" stop-color="#F5C46F" stop-opacity="0"/></linearGradient>'
        '<clipPath id="ciel-seul"><rect width="1100" height="1300"/></clipPath>'
    )


def premiere():
    rng = random.Random(1790)
    ciel_ = ciel("ciel", [
        (0, "#0B1233"), (0.30, "#18204B"), (0.50, "#3B3468"),
        (0.62, "#7C5482"), (0.69, "#C97C86"), (0.725, "#F2B07E"), (0.7303, "#F9D396"), (1, "#F9D396"),
    ])
    art = f'''<svg class="art" viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg">
<defs>{ciel_}{defs_communs()}</defs>
<rect width="{W}" height="{H}" fill="url(#ciel)"/>
{etoiles(rng, 260, 900)}
<g clip-path="url(#ciel-seul)">
<circle cx="{CX}" cy="{HORIZON}" r="760" fill="url(#halo)"/>
{arcs_construction(CX, HORIZON, [(470, "2 7", 0.30), (600, "1 9", 0.22), (730, "1 12", 0.16)])}
{cadran(CX, HORIZON, 300)}
<circle cx="{CX}" cy="{HORIZON}" r="168" fill="url(#soleil)"/>
</g>
<rect y="{HORIZON}" width="{W}" height="{H - HORIZON}" fill="url(#sol)"/>
{sol(HORIZON, H)}
<path d="M {CX - 3} {HORIZON} L {CX + 3} {HORIZON} L {CX + 78} {H} L {CX - 78} {H} Z" fill="url(#chemin)"/>
<line x1="0" y1="{HORIZON}" x2="{W}" y2="{HORIZON}" stroke="#FFE7B8" stroke-width="1.6" opacity="0.85"/>
</svg>'''
    return f'''<section class="page premiere">{art}
<div class="kicker">Paroles de consolation et d’espérance</div>
<h1><span class="l1">Avant que</span><span class="l2">l’horloge</span><span class="l3">ne s’arrête</span></h1>
<div class="repere repere-g">Ps 90.12</div><div class="repere repere-d">compter nos jours</div>
<div class="auteur">KOUADIO KOFFI ÉLISÉE</div>
</section>'''


def quatrieme():
    rng = random.Random(1211)
    horizon = 1590
    ciel_ = ciel("ciel4", [
        (0, "#0B1233"), (0.40, "#18204B"), (0.66, "#33306A"),
        (0.80, "#6D4E80"), (0.875, "#C27C88"), (0.8933, "#F2B07E"), (0.8934, "#F9D396"), (1, "#F9D396"),
    ])
    art = f'''<svg class="art" viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg">
<defs>{ciel_}{defs_communs()}<clipPath id="ciel4-seul"><rect width="1100" height="{horizon}"/></clipPath></defs>
<rect width="{W}" height="{H}" fill="url(#ciel4)"/>
{etoiles(rng, 200, 1100, 0.8)}
<g clip-path="url(#ciel4-seul)">
<circle cx="{CX}" cy="{horizon}" r="420" fill="url(#halo)"/>
{cadran(CX, horizon, 300, echelle=0.42)}
<circle cx="{CX}" cy="{horizon}" r="72" fill="url(#soleil)"/>
</g>
<rect y="{horizon}" width="{W}" height="{H - horizon}" fill="url(#sol)"/>
<line x1="0" y1="{horizon}" x2="{W}" y2="{horizon}" stroke="#FFE7B8" stroke-width="1.6" opacity="0.85"/>
</svg>'''
    return f'''<section class="page quatrieme">{art}
<div class="citation">« Le soir viennent les pleurs,<br>mais le matin, l’allégresse. »</div>
<div class="texte">
<p>Un samedi, à 17 heures, un enfant part acheter des cubes au marché. Un dimanche matin, une jeune femme part donner la vie. Un 10 août, un pasteur prend la route pour servir Dieu. Aucun d’eux ne reviendra.</p>
<p>À partir de trois deuils qui ont marqué sa vie, l’auteur pose sur la mort un regard simple et poignant : notre horloge descend, et nul ne sait quand elle s’arrêtera.</p>
<p>Mais ce petit livre n’est pas un livre de tristesse. C’est une main tendue à celui qui pleure, une lumière dans la maison en deuil, et l’annonce d’une espérance plus forte que la tombe : en Jésus-Christ, la mort n’est pas un adieu, mais un au revoir.</p>
<p class="pour-toi">Pour toi qui as perdu un être cher.<br>Pour toi qui veux apprendre à compter tes jours.</p>
</div>
<div class="bio"><div class="bio-titre">L’auteur</div>
<p><strong>Kouadio Koffi Élisée</strong> est moniteur d’école du dimanche et responsable de la prière de l’école du dimanche à l’Église CMA. Entrepreneur, il est cofondateur de Forlife Com, entreprise de communication intégrée basée à Bingerville. Il est marié à Koffi Assena Grâce Emmanuelle, épouse Kouadio.</p></div>
<div class="isbn">ISBN<br>code-barres</div>
</section>'''


CSS = '''
@font-face{font-family:"Instrument Serif";src:url(polices/InstrumentSerif-Regular.ttf)}
@font-face{font-family:"Instrument Serif";font-style:italic;src:url(polices/InstrumentSerif-Italic.ttf)}
@font-face{font-family:Jura;font-weight:300;src:url(polices/Jura-Light.ttf)}
@font-face{font-family:Jura;font-weight:500;src:url(polices/Jura-Medium.ttf)}
@font-face{font-family:"Crimson Pro";src:url(polices/CrimsonPro-Regular.ttf)}
@font-face{font-family:"Crimson Pro";font-style:italic;src:url(polices/CrimsonPro-Italic.ttf)}
@page{size:110mm 178mm;margin:0}
html,body{margin:0;padding:0;background:#fff}
.page{width:110mm;height:178mm;position:relative;overflow:hidden;page-break-after:always;color:#FFF4E2}
.art{position:absolute;inset:0;width:100%;height:100%}
.kicker{position:absolute;top:15mm;left:0;right:0;text-align:center;font:500 5.6pt Jura,sans-serif;letter-spacing:.32em;text-transform:uppercase;color:#F7D49A}
h1{position:absolute;top:22mm;left:0;right:0;margin:0;text-align:center;font-family:"Instrument Serif",serif;font-weight:400;line-height:.92;color:#FFF4E2}
h1 span{display:block}
h1 .l1{font-style:italic;font-size:17pt;color:#F7D49A;margin-bottom:1.2mm;letter-spacing:.01em}
h1 .l2{font-size:46pt;letter-spacing:-.005em}
h1 .l3{font-size:30pt;margin-top:.6mm}
.repere{position:absolute;top:132.6mm;font:300 5pt Jura,sans-serif;letter-spacing:.22em;text-transform:uppercase;color:#FFE7B8;opacity:.8}
.repere-g{left:9mm}.repere-d{right:9mm}
.auteur{position:absolute;bottom:11mm;left:0;right:0;text-align:center;font:500 7.4pt Jura,sans-serif;letter-spacing:.38em;color:#FFF1D6}
.citation{position:absolute;top:13mm;left:10mm;right:10mm;text-align:center;font:italic 13pt/1.15 "Instrument Serif",serif;color:#F7D49A}
.texte{position:absolute;top:32mm;left:11mm;right:11mm;font:9.1pt/1.36 "Crimson Pro",serif;color:#FBEFDD;text-align:justify;hyphens:auto}
.texte p{margin:0 0 2.2mm}
.texte .pour-toi{font-style:italic;text-align:center;color:#F7D49A;margin-top:3mm}
.bio{position:absolute;top:104mm;left:11mm;right:11mm;padding-top:3mm;border-top:.25mm solid rgba(247,212,154,.55);font:8.1pt/1.34 "Crimson Pro",serif;color:#F3E6D6;text-align:justify;hyphens:auto}
.bio p{margin:0}
.bio strong{font-weight:400;color:#FFF4E2;letter-spacing:.02em}
.bio-titre{font:500 5.4pt Jura,sans-serif;letter-spacing:.32em;text-transform:uppercase;color:#F7D49A;margin-bottom:1.6mm}
.isbn{position:absolute;bottom:6mm;right:9mm;width:28mm;height:13mm;background:#FFFDF8;color:#8a7a6a;font:500 5pt/1.4 Jura,sans-serif;letter-spacing:.15em;text-transform:uppercase;display:flex;align-items:center;justify-content:center;text-align:center;border-radius:.6mm}
'''

html = f'''<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Couverture</title><style>{CSS}</style></head>
<body>{premiere()}{quatrieme()}</body></html>'''

if __name__ == "__main__":
    import os
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    open("couverture.html", "w", encoding="utf-8").write(html)
