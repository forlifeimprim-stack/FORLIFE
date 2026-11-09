#!/usr/bin/env python3
"""Compose l'intérieur du livre en PDF à partir du manuscrit Markdown et de livre.yaml.

  python3 outils/composer.py
      prend manuscrit/*-corrige.md et produit sortie/interieur.pdf (fonds perdus de 3 mm)
      et sortie/interieur-ecran.pdf (même rendu, sans fonds perdus)
  python3 outils/composer.py charte/maquette/chapitre-exemple.md --sortie charte/maquette --nom maquette
      compose un fichier ou un dossier précis

Balisage attendu et rendu : charte/graphique.md, section « Balisage du manuscrit ».
Feuille de style : charte/interieur.css. Les chemins d'images s'écrivent depuis .edition/
(par exemple images/carte.svg).
"""
import argparse
import html
import re
import subprocess
import sys
import tempfile
from pathlib import Path

import pikepdf
import yaml
from fontTools.ttLib import TTFont
from weasyprint import CSS, HTML
from weasyprint.text.fonts import FontConfiguration

EDITION = Path(__file__).resolve().parent.parent
POLICES = EDITION / "outils" / "ressources" / "polices"
FEUILLE_DE_STYLE = EDITION / "charte" / "interieur.css"
FLEURON = EDITION / "images" / "fleuron-amandier.svg"

sys.dont_write_bytecode = True  # ne rien écrire dans fabrication/, dossier de Salif
sys.path.insert(0, str(EDITION / "fabrication"))
from noir_seul import convertir_flux, convertir_formulaires  # noqa: E402  (script de Salif, T08)

FAMILLES = {
    "EB Garamond": ("eb-garamond", "eb-garamond-latin-{graisse}-{style}.woff2",
                    [(g, s) for g in (400, 500, 600, 700) for s in ("normal", "italic")]),
    "Alegreya Sans": ("alegreya-sans", "alegreya-sans-latin-{graisse}-{style}.woff2",
                      [(400, "normal"), (400, "italic"), (500, "normal"), (500, "italic"),
                       (700, "normal"), (800, "normal")]),
}

# Les polices Fontsource n'ont ni espace fine insécable ni trait d'union U+2010/U+2011 :
# on les fait pointer vers les glyphes de l'espace fine et du trait d'union ordinaires.
CORRESPONDANCES = {0x202F: 0x2009, 0x2010: 0x2D, 0x2011: 0x2D}

TITRE_COURANT_MAX = 55

FILTRE_LUA = r'''
-- Titres par défaut ; une première ligne entièrement en gras les remplace (charte/style.md, § 14).
local TITRES = {
  encadre = false,
  application = false,
  lecons = "Leçons pour aujourd’hui",
  questions = "Pour méditer",
  priere = "Prière",
}

function Note(n)
  return pandoc.Span(pandoc.utils.blocks_to_inlines(n.content), {class = "note"})
end

-- Dernière ligne d'un bloc « > » : la référence seule entre parenthèses, « (Jérémie 1:4-10) ».
function BlockQuote(b)
  local dernier = b.content[#b.content]
  if dernier and dernier.t == "Para" then
    local texte = pandoc.utils.stringify(dernier)
    if texte:match("^%(.*%d.*%)$") then
      b.content[#b.content] = pandoc.Div({dernier}, {class = "reference"})
      return b
    end
  end
end

local function titre_en_gras(d)
  local premier = d.content[1]
  if premier and premier.t == "Para" and #premier.content == 1 and premier.content[1].t == "Strong" then
    table.remove(d.content, 1)
    return premier.content[1].content
  end
end

function Div(d)
  for classe, defaut in pairs(TITRES) do
    if d.classes:includes(classe) then
      local titre = titre_en_gras(d) or (defaut and {pandoc.Str(defaut)})
      if titre then
        table.insert(d.content, 1, pandoc.Div({pandoc.Para(titre)}, {class = "bloc-titre"}))
      end
      return d
    end
  end
end
'''


def lire_arguments():
    parser = argparse.ArgumentParser(description="Compose l'intérieur du livre en PDF.")
    parser.add_argument("sources", nargs="*", type=Path,
                        help="fichiers .md ou dossier (par défaut : manuscrit/*-corrige.md)")
    parser.add_argument("--sortie", type=Path, default=EDITION / "sortie",
                        help="dossier de sortie (par défaut : sortie/)")
    parser.add_argument("--nom", default="interieur",
                        help="nom des fichiers produits (par défaut : interieur)")
    return parser.parse_args()


def fichiers_du_manuscrit(sources):
    if not sources:
        sources = [EDITION / "manuscrit"]
    fichiers = []
    for source in sources:
        if source.is_dir():
            fichiers += sorted(source.glob("*-corrige.md"))
        else:
            fichiers.append(source)
    if not fichiers:
        sys.exit("Aucun fichier *-corrige.md trouvé : rien à composer.")
    manquants = [str(f) for f in fichiers if not f.is_file()]
    if manquants:
        sys.exit("Fichier introuvable : " + ", ".join(manquants))
    return fichiers


def markdown_vers_html(fichiers, dossier_travail):
    filtre = dossier_travail / "composition.lua"
    filtre.write_text(FILTRE_LUA, encoding="utf-8")
    commande = ["pandoc", *map(str, fichiers), "-f", "markdown", "-t", "html5",
                "--section-divs", "--wrap=none", "--lua-filter", str(filtre)]
    return subprocess.run(commande, check=True, capture_output=True, text=True).stdout


# ---------- Typographie française ----------

ESPACES = "[ \u00a0\u202f]*"
APRES_PONCTUATION = r"(?=[\s\u00a0\u202f»)\]’”.,…;:!?]|$)"
AVANT_PONCTUATION = r"(?<=[^\s\u00a0\u202f;:!?(\[«])"
LIVRES_NUMEROTES = "Samuel|Rois|Chroniques|Corinthiens|Thessaloniciens|Timothée|Pierre|Jean"
REGLES = [
    (re.compile(r"(?<![\w:])([1-3]) (?=(?:" + LIVRES_NUMEROTES + r")\b)"), "\\1\u00a0"),
    (re.compile(r"(\d) av\. ?J\.-C\."), "\\1\u00a0av.\u00a0J.-C."),
    (re.compile(r"(?<![\d:,.])(\d{1,3}) (\d{3})(?!\d)"), "\\1\u202f\\2"),
    (re.compile(AVANT_PONCTUATION + ESPACES + r"([;!?])" + APRES_PONCTUATION), "\u202f\\1"),
    (re.compile(AVANT_PONCTUATION + ESPACES + r":" + APRES_PONCTUATION), "\u00a0:"),
    (re.compile("«" + ESPACES), "«\u202f"),
    (re.compile(ESPACES + "»"), "\u202f»"),
]


def espaces_dans_un_texte(avant, texte, apres):
    # avant et apres sont les caractères voisins pris hors des balises, pour que
    # « <em>mot</em> ; » et « mot :</p> » soient lus comme du texte continu.
    # Une correspondance qui touche ces voisins est laissée telle quelle.
    for motif, remplacement in REGLES:
        entier = avant + texte + apres
        limite = len(avant) + len(texte)

        def remplacer(m):
            if m.start() < len(avant) or m.end() > limite:
                return m.group(0)
            return m.expand(remplacement)

        entier = motif.sub(remplacer, entier)
        texte = entier[len(avant):len(entier) - len(apres)]
    return texte


def espaces_francaises(document):
    """Pose les espaces insécables françaises dans les nœuds de texte, hors code et entités.

    Le deux-points d'une référence (Jérémie 1:5) ou d'une heure (10:30) n'est jamais suivi
    d'une espace : la règle ne s'y applique donc pas."""
    morceaux = re.split(r"(<[^>]+>)", document)
    code = re.compile(r"<(code|pre|style|script)\b")
    fin_code = re.compile(r"</(code|pre|style|script)>")
    bloc = re.compile(r"</?(p|li|h\d|div|section|blockquote|br|td|th|figcaption|header|nav)\b")

    # Caractère de texte qui suit chaque morceau, sans franchir une limite de bloc.
    suivants = ["\n"] * len(morceaux)
    suivant = "\n"
    for i in range(len(morceaux) - 1, -1, -1):
        suivants[i] = suivant
        morceau = morceaux[i]
        if morceau.startswith("<"):
            if bloc.match(morceau):
                suivant = "\n"
        elif morceau:
            suivant = morceau[0]

    dans_code = False
    precedent = "\n"
    for i, morceau in enumerate(morceaux):
        if morceau.startswith("<"):
            if code.match(morceau):
                dans_code = True
            elif fin_code.match(morceau):
                dans_code = False
            elif bloc.match(morceau):
                precedent = "\n"
            continue
        if not morceau or dans_code:
            continue
        parties = re.split(r"(&[#A-Za-z0-9]+;)", morceau)
        for k in range(0, len(parties), 2):
            if not parties[k]:
                continue
            avant = precedent if k == 0 else ";"
            apres = suivants[i] if k == len(parties) - 1 else "&"
            parties[k] = espaces_dans_un_texte(avant, parties[k], apres)
        morceaux[i] = "".join(parties)
        precedent = morceau[-1]
    return "".join(morceaux)


# ---------- Chapitres, fleurons, table ----------

def fleuron(classe):
    if FLEURON.is_file():
        return f'<div class="{classe}"><img src="{FLEURON.as_uri()}" alt=""></div>'
    return f'<div class="{classe}"><span class="losange"></span></div>'


def lier_titre(titre):
    """Évite un mot seul en dernière ligne d'un titre et un petit mot (du, le, à...) en fin de ligne."""
    morceaux = re.split(r"(<[^>]+>)", titre)
    textes = [i for i, m in enumerate(morceaux) if m and not m.startswith("<")]
    for i in textes:
        morceaux[i] = re.sub(r"(?<![\w’'])(\w{1,3}) ", "\\1\u00a0", morceaux[i])
    if textes:
        dernier = textes[-1]
        morceaux[dernier] = re.sub(r" (\S+)$", "\u00a0\\1", morceaux[dernier])
    return "".join(morceaux)


def sans_balises(fragment):
    return html.unescape(re.sub(r"<[^>]+>", "", fragment)).strip()


def ouvrir_les_chapitres(corps):
    entrees = []
    numero = 0

    def ouverture(m):
        nonlocal numero
        ident, classes, attributs, titre = m.group(1), m.group(2), m.group(3), m.group(5)
        court = re.search(r'data-court="([^"]*)"', attributs)
        court = html.unescape(court.group(1)) if court else sans_balises(titre)
        if len(court) > TITRE_COURANT_MAX:
            print(f"Attention : titre courant de {len(court)} signes pour « {court} ». "
                  f"Ajouter {{court=\"...\"}} au titre du chapitre.", file=sys.stderr)
        etiquette = ""
        if "unnumbered" not in classes.split():
            numero += 1
            etiquette = f'<p class="chapitre-numero">Chapitre {numero}</p>'
        entrees.append((ident, numero if etiquette else None, titre))
        attributs = re.sub(r'\s*data-court="[^"]*"', "", attributs)
        return (f'<section id="{ident}" class="level1{classes}"{attributs} '
                f'data-court="{html.escape(court)}">\n<header class="ouverture">{etiquette}'
                f'<h1>{lier_titre(titre)}</h1>{fleuron("fleuron")}</header>')

    corps = re.sub(r'<section id="([^"]*)" class="level1([^"]*)"([^>]*)>\s*<h1([^>]*)>(.*?)</h1>',
                   ouverture, corps, flags=re.S)
    corps = corps.replace("<hr />", fleuron("fleuron-pause"))
    # Pandoc pose la classe {.pleine-page} sur l'image : la mise en page en a besoin sur la figure.
    corps = re.sub(r'<figure>(\s*<img [^>]*class="pleine-page")', r'<figure class="pleine-page">\1', corps)
    # Siècles (VII^e^) : la police n'a pas de petites capitales, on réduit les capitales romaines.
    corps = re.sub(r"\b([IVXLC]+)(<sup>(?:e|er|re)</sup>)", r'<span class="siecle">\1</span>\2', corps)
    return corps, entrees


def table_des_matieres(entrees):
    lignes = []
    for ident, numero, titre in entrees:
        num = f'<span class="table-num">{numero}</span>' if numero else '<span class="table-num"></span>'
        lignes.append(f'<li><a href="#{ident}">{num}{titre}</a></li>')
    return ('<nav class="liminaire table-matieres"><p class="table-titre">Table des matières</p>'
            f'<ol>{"".join(lignes)}</ol></nav>')


def pages_liminaires(livre):
    e = html.escape
    mentions = livre["mentions_legales"]
    editeur = livre["editeur"]
    sous_titre = f'<p class="sous-titre">{e(livre["sous_titre"])}</p>' if livre.get("sous_titre") else ""
    return f'''
<div class="liminaire faux-titre"><p>{lier_titre(e(livre["titre"]))}</p></div>
{du_meme_auteur(livre)}
<div class="liminaire page-titre">
  <p class="auteur">{e(livre["auteur"])}</p>
  <p class="titre">{lier_titre(e(livre["titre"]))}</p>
  {sous_titre}
  {fleuron("fleuron")}
  <p class="editeur"><strong>{e(editeur["nom"])}</strong><br>{e(editeur["ville"])}</p>
</div>
<div class="liminaire mentions"><div class="bloc">
  <p class="mentions-titre">{e(livre["titre"])}. {e(livre.get("sous_titre") or "")}</p>
  <p>Auteur : {e(livre["auteur"])}</p>
  <p>{e(mentions["copyright"])}. Tous droits réservés. Toute reproduction, même partielle,
  est interdite sans l’autorisation écrite de l’éditeur.</p>
  <p>Les citations bibliques sont tirées de la {e(livre["version_biblique"])}.</p>
  <p>Éditeur : {e(editeur["nom"])}, {e(editeur["adresse"])}. {e(editeur["courriel"])}</p>
  <p>ISBN (version imprimée) : {e(mentions["isbn_papier"])}<br>
  ISBN (version numérique) : {e(mentions["isbn_epub"])}</p>
  <p>Dépôt légal : {e(mentions["depot_legal"])}</p>
  <p>Impression : {e(mentions["impression"])}</p>
</div></div>
'''


def du_meme_auteur(livre):
    titres = livre.get("du_meme_auteur") or []
    if not titres:
        return ""
    lignes = "".join(f"<p><em>{html.escape(t)}</em></p>" for t in titres)
    return f'<div class="du-meme-auteur"><p class="du-meme-auteur-titre">Du même auteur</p>{lignes}</div>'


def a_propos_de_l_auteur(livre, entrees):
    # Texte validé par l'auteur : repris mot pour mot, lignes réunies en un paragraphe.
    biographie = " ".join((livre.get("biographie_auteur") or "").split())
    if not biographie:
        return ""
    entrees.append(("a-propos-auteur", None, "À propos de l’auteur"))
    return ('<section id="a-propos-auteur" class="a-propos-auteur">'
            '<p class="a-propos-titre">À propos de l’auteur</p>'
            f'{fleuron("fleuron")}<p>{html.escape(biographie)}</p></section>')


def document_complet(livre, corps, entrees):
    e = html.escape
    a_propos = a_propos_de_l_auteur(livre, entrees)
    table = table_des_matieres(entrees)
    # La dédicace, écrite en tête du premier fichier, se place avant la table des matières.
    dedicace = re.search(r'<div class="dedicace">.*?</div>', corps, flags=re.S)
    if dedicace:
        corps = corps.replace(dedicace.group(0), "", 1)
        table = dedicace.group(0) + table
    return f'''<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>{e(livre["titre"])}</title>
<meta name="author" content="{e(livre["auteur"])}">
<meta name="generator" content="outils/composer.py (WeasyPrint)">
</head>
<body data-titre="{e(livre["titre"])}">
{pages_liminaires(livre)}
{table}
{corps}
{a_propos}
</body>
</html>'''


# ---------- Polices ----------

def polices_corrigees(dossier_travail):
    regles = []
    for famille, (dossier, modele, variantes) in FAMILLES.items():
        for graisse, style in variantes:
            source = POLICES / dossier / modele.format(graisse=graisse, style=style)
            police = TTFont(source)
            for table in police["cmap"].tables:
                if table.isUnicode():
                    for manquant, modele_glyphe in CORRESPONDANCES.items():
                        if manquant not in table.cmap and modele_glyphe in table.cmap:
                            table.cmap[manquant] = table.cmap[modele_glyphe]
            police.flavor = None
            cible = dossier_travail / (source.stem + ".ttf")
            police.save(cible)
            regles.append(f'@font-face {{ font-family: "{famille}"; font-weight: {graisse}; '
                          f'font-style: {style}; src: url("{cible.as_uri()}"); }}')
    return "\n".join(regles)


# ---------- Noir seul ----------

def noir_seul(fichier_pdf):
    """Passe en DeviceGray les gris neutres restés en RVB (SVG de Kouamé : WeasyPrint ignore
    device-cmyk dans un SVG). Le texte, déjà en device-cmyk par la CSS, n'est pas concerné."""
    couleurs_restantes, deja_vus = set(), set()
    with pikepdf.open(fichier_pdf, allow_overwriting_input=True) as pdf:
        for page in pdf.pages:
            page.contents_coalesce()
            convertir_flux(page.obj.Contents, couleurs_restantes)
            convertir_formulaires(page.obj.get("/Resources"), couleurs_restantes, deja_vus)
        pdf.save(fichier_pdf)
    if couleurs_restantes:
        print("Attention : couleurs non neutres dans l'intérieur, à corriger à la source : "
              + ", ".join(sorted(couleurs_restantes)), file=sys.stderr)


# ---------- Contrôles ----------

def controler(document):
    texte = sans_balises(re.sub(r"<(style|script)\b.*?</\1>", "", document, flags=re.S))
    for tiret in ("\u2014", "\u2013"):
        for m in re.finditer(tiret, texte):
            print(f"Attention : tiret {'cadratin' if tiret == chr(0x2014) else 'demi-cadratin'} "
                  f"dans « …{texte[max(0, m.start() - 30):m.end() + 30]}… »", file=sys.stderr)
    for marque in ("[À COMPLÉTER", "[À VÉRIFIER"):
        nombre = texte.count(marque)
        if nombre:
            print(f"Information : {nombre} marque(s) {marque}] dans le livre composé.", file=sys.stderr)


def main():
    arguments = lire_arguments()
    livre = yaml.safe_load((EDITION / "livre.yaml").read_text(encoding="utf-8"))
    fichiers = fichiers_du_manuscrit(arguments.sources)
    arguments.sortie.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory() as dossier:
        dossier_travail = Path(dossier)
        corps = markdown_vers_html(fichiers, dossier_travail)
        corps, entrees = ouvrir_les_chapitres(corps)
        document = espaces_francaises(document_complet(livre, corps, entrees))
        controler(document)

        configuration = FontConfiguration()
        polices = CSS(string=polices_corrigees(dossier_travail), font_config=configuration)
        charte = CSS(filename=str(FEUILLE_DE_STYLE), font_config=configuration)
        sans_fonds_perdus = CSS(string="@page { bleed: 0 }", font_config=configuration)
        page = HTML(string=document, base_url=str(EDITION) + "/")
        page_paire = HTML(string=document.replace("</body>", '<div class="verso-final"></div>\n</body>'),
                          base_url=str(EDITION) + "/")

        for nom, feuilles in ((arguments.nom, [polices, charte]),
                              (arguments.nom + "-ecran", [polices, charte, sans_fonds_perdus])):
            cible = arguments.sortie / f"{nom}.pdf"
            rendu = page.render(stylesheets=feuilles, font_config=configuration)
            if len(rendu.pages) % 2:
                # Un livre se termine sur un verso : une page blanche finale rend le compte pair.
                rendu = page_paire.render(stylesheets=feuilles, font_config=configuration)
            rendu.write_pdf(cible)
            if nom == arguments.nom:
                noir_seul(cible)
            print(f"{cible.relative_to(EDITION) if cible.is_relative_to(EDITION) else cible} : "
                  f"{len(rendu.pages)} pages")


if __name__ == "__main__":
    main()
