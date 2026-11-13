#!/usr/bin/env python3
"""Fabrique l'EPUB recomposable du livre à partir du manuscrit corrigé.

  python3 numerique/fabriquer_epub.py
      lit manuscrit/*-corrige.md et livre.yaml, produit numerique/jeremie.epub

L'EPUB ne se retouche jamais à la main : toute correction se fait dans le manuscrit
ou dans livre.yaml, puis on relance ce script. Contrôle :
  java -jar outils/ressources/epubcheck-5.2.1/epubcheck.jar numerique/jeremie.epub
"""
import html
import re
import subprocess
import sys
import tempfile
import uuid
from pathlib import Path

import yaml

EDITION = Path(__file__).resolve().parent.parent
NUMERIQUE = EDITION / "numerique"
EPUB = NUMERIQUE / "jeremie.epub"
FEUILLE_DE_STYLE = NUMERIQUE / "epub.css"
COUVERTURE = EDITION / "couverture" / "plat1-epub.jpg"
QUATRIEME = EDITION / "couverture" / "quatrieme.md"

sys.dont_write_bytecode = True
sys.path.insert(0, str(EDITION / "outils"))
# Même filtre de blocs et mêmes espaces insécables que le livre imprimé (outils/composer.py).
from composer import FILTRE_LUA, espaces_francaises  # noqa: E402

# Le PDF prend les SVG ; l'EPUB prend les PNG écran de Kouamé (moins de 2 Mo, lus partout).
IMAGES_ECRAN = {
    "images/carte-monde-jeremie.svg": "images/carte-monde-jeremie-ecran.png",
    "images/frise-rois-juda.svg": "images/frise-rois-juda-ecran.png",
}

# La légende du manuscrit reste sous l'image ; le texte alternatif décrit ce qu'elle montre,
# d'après les étiquettes des SVG de Kouamé.
TEXTES_ALTERNATIFS = {
    "images/frise-rois-juda-ecran.png": (
        "Frise chronologique de 640 à 580 avant Jésus-Christ. Rois de Juda : Josias, vers 640 à 609 ; "
        "Joachaz, vers 609, trois mois ; Jojakim, vers 609 à 598 ; Jojakin, vers 598 à 597, trois mois ; "
        "Sédécias, vers 597 à 586 ; puis Guedalia, gouverneur, à partir de 586. Événements : appel de "
        "Jérémie vers 627, réforme de Josias vers 622, bataille de Carkemisch vers 605, déportation de "
        "Jojakin vers 597, chute de Jérusalem vers 587 ou 586. Une bande montre le ministère de Jérémie, "
        "de 627 jusqu’après 586, en Égypte."),
    "images/carte-monde-jeremie-ecran.png": (
        "Carte schématique en deux parties. En haut, le monde de Jérémie : l’Égypte avec le Nil, Noph et "
        "Tachpanès ; Juda avec Jérusalem et Meguiddo, au bord de la Grande mer (Méditerranée) ; Ribla et "
        "Carkemisch au nord, sur la route de l’Euphrate ; la Chaldée avec Babylone, entre l’Euphrate et "
        "le Tigre (Hiddékel) ; la mer Rouge au sud. Échelle de 200 kilomètres. En bas, les environs de "
        "Jérusalem : Anathoth, Rama, Mitspa, Jéricho, le Jourdain, la Mer Salée et le désert de Juda. "
        "Échelle de 10 kilomètres."),
}

# Tant que l'ISBN numérique n'est pas attribué, l'identifiant est un UUID stable,
# dérivé du titre, pour qu'une nouvelle fabrication ne crée pas un « autre » livre.
ESPACE_UUID = uuid.UUID("6ba7b811-9dad-11d1-80b4-00c04fd430c8")  # espace URL de la RFC 4122


def identifiant(livre):
    isbn = livre["mentions_legales"]["isbn_epub"]
    if re.fullmatch(r"97[89][\d-]{10,14}", isbn or ""):
        return "urn:isbn:" + isbn.replace("-", "")
    return "urn:uuid:" + str(uuid.uuid5(ESPACE_UUID, "forlife-imprim/" + livre["titre"]))


def presentation_de_la_quatrieme():
    texte = QUATRIEME.read_text(encoding="utf-8")
    section = re.search(r"^## Présentation\n(.*?)^## ", texte, flags=re.S | re.M).group(1)
    return " ".join(section.split())


def metadonnees(livre):
    return {
        "title": [{"type": "main", "text": livre["titre"]},
                  {"type": "subtitle", "text": livre["sous_titre"]}],
        "toc-title": "Table des matières",
        "creator": [{"role": "aut", "text": livre["auteur"]}],
        "publisher": livre["editeur"]["nom"],
        "lang": livre["langue"],
        "identifier": [{"text": identifiant(livre)}],
        "rights": livre["mentions_legales"]["copyright"] + ". Tous droits réservés.",
        "subject": livre["genre"],
        "description": presentation_de_la_quatrieme(),
    }


def pages_liminaires(livre):
    e = html.escape
    mentions = livre["mentions_legales"]
    editeur = livre["editeur"]
    autres = "".join(f"<p><em>{e(t)}</em></p>" for t in livre.get("du_meme_auteur") or [])
    return f'''
<h1 class="unlisted" id="mentions">Mentions légales</h1>
<div class="mentions">
<p>{e(livre["titre"])}. {e(livre["sous_titre"])}</p>
<p>Auteur : {e(livre["auteur"])}</p>
<p>{e(mentions["copyright"])}. Tous droits réservés. Toute reproduction, même partielle,
est interdite sans l’autorisation écrite de l’éditeur.</p>
<p>Les citations bibliques sont tirées de la {e(livre["version_biblique"])}.</p>
<p>Éditeur : {e(editeur["nom"])}, {e(editeur["adresse"])}. {e(editeur["courriel"])}</p>
<p>ISBN (version numérique) : {e(mentions["isbn_epub"])}<br>
ISBN (version imprimée) : {e(mentions["isbn_papier"])}</p>
<p>Dépôt légal : {e(mentions["depot_legal"])}</p>
</div>
<div class="du-meme-auteur"><p><strong>Du même auteur</strong></p>{autres}</div>
'''


def a_propos_de_l_auteur(livre):
    # Texte validé par l'auteur : repris mot pour mot, lignes réunies en un paragraphe.
    biographie = " ".join(livre["biographie_auteur"].split())
    return (f'<h1 id="a-propos-auteur" class="unnumbered">À propos de l’auteur</h1>'
            f'<p>{html.escape(biographie)}</p>')


def manuscrit_en_html(dossier_travail):
    fichiers = sorted((EDITION / "manuscrit").glob("*-corrige.md"))
    if len(fichiers) != 16:
        sys.exit(f"{len(fichiers)} fichiers *-corrige.md trouvés au lieu de 16 : vérifier le manuscrit.")
    filtre = dossier_travail / "blocs.lua"
    filtre.write_text(FILTRE_LUA, encoding="utf-8")
    corps = subprocess.run(
        ["pandoc", *map(str, fichiers), "-f", "markdown", "-t", "html5", "--wrap=none",
         "--lua-filter", str(filtre)],
        check=True, capture_output=True, text=True).stdout
    for svg, png in IMAGES_ECRAN.items():
        corps = corps.replace(f'src="{svg}"', f'src="{png}"')
    for png, alt in TEXTES_ALTERNATIFS.items():
        corps, n = re.subn(r'(<img src="' + re.escape(png) + r'"[^>]*? alt=")[^"]*"',
                           lambda m: m.group(1) + html.escape(alt) + '"', corps)
        if n != 1:
            sys.exit(f"Image {png} introuvable dans le manuscrit : texte alternatif non posé.")
    restants = re.findall(r'src="([^"]+\.svg)"', corps)
    if restants:
        sys.exit("Image SVG sans équivalent PNG écran : " + ", ".join(restants))
    return corps


def main():
    livre = yaml.safe_load((EDITION / "livre.yaml").read_text(encoding="utf-8"))
    with tempfile.TemporaryDirectory() as nom:
        dossier_travail = Path(nom)
        corps = manuscrit_en_html(dossier_travail)
        # Pas de <title> : il primerait sur les titres de --metadata-file (sous-titre perdu).
        document = (f'<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"></head><body>'
                    f'{pages_liminaires(livre)}{corps}{a_propos_de_l_auteur(livre)}</body></html>')
        source = dossier_travail / "livre.html"
        source.write_text(espaces_francaises(document), encoding="utf-8")
        meta = dossier_travail / "metadonnees.yaml"
        meta.write_text(yaml.safe_dump(metadonnees(livre), allow_unicode=True), encoding="utf-8")
        subprocess.run(
            ["pandoc", str(source), "-f", "html", "-t", "epub3", "-o", str(EPUB),
             "--metadata-file", str(meta), "--css", str(FEUILLE_DE_STYLE),
             "--epub-cover-image", str(COUVERTURE), "--toc", "--toc-depth=1",
             "--split-level=1", "--resource-path", str(EDITION)],
            check=True)
    print(f"{EPUB.relative_to(EDITION)} : {EPUB.stat().st_size // 1024} Ko, "
          f"identifiant {identifiant(livre)}")


if __name__ == "__main__":
    main()
