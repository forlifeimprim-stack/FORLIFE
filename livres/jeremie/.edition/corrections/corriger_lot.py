#!/usr/bin/env python3
"""Correction d'un lot du manuscrit sur copie : produit les NN-x-corrige.md, le relevé et la page de comparaison.

  python3 corrections/corriger_lot.py A        (fichiers 01 à 08, T14)
  python3 corrections/corriger_lot.py B        (fichiers 09 à 16, T15)

ATTENTION : depuis T18, les copies corrigées ont été enrichies directement (T22, T23, T27, avant-propos).
Ce script repart des originaux : le relancer effacerait ces ajouts. Ne plus l'exécuter ; voir corriger_T24.py.

Les originaux de manuscrit/ ne sont jamais réécrits. Deux passes :
  1. corrections relevées à la lecture (orthographe, cohérence, harmonisation), listées ci-dessous ;
  2. typographie française : espaces insécables, mêmes règles que outils/composer.py pour que la copie
     corrigée et la composition donnent le même texte.
"""
import difflib
import html
import re
import subprocess
import sys
from pathlib import Path

EDITION = Path(__file__).resolve().parent.parent
MANUSCRIT = EDITION / "manuscrit"
CORRECTIONS = EDITION / "corrections"
LOTS = {
    "A": {"fichiers": ["01-avant-propos", "02-introduction", "03-ch01-anathoth", "04-ch02-appel",
                       "05-ch03-josias", "06-ch04-temple", "07-ch05-solitude", "08-ch06-rouleau"],
          "tache": "T14", "date": "13 novembre 2026"},
    "B": {"fichiers": ["09-ch07-gestes", "10-ch08-lettre", "11-ch09-consolation", "12-ch10-citerne",
                       "13-ch11-ruines", "14-ch12-egypte", "15-conclusion", "16-annexes"],
          "tache": "T15", "date": "13 novembre 2026"},
}

HARMONISATION_LECONS = "harmonisation des lots : pas de phrase en gras en tête des leçons (décision d'Akissi, T11)"
PRISON = "cohérence avec Jérémie 20:2 : la LSG dit « la prison », pas « les ceps » (voir chapitre 5 et questions-auteur-lot2, n° 5)"

# (fichier, texte fautif, texte corrigé, règle). Chaque texte fautif doit apparaître une seule fois.
CORRECTIONS_LUES = [
    ("05-ch03-josias",
     "> Placez-vous sur les chemins, regardez, Et demandez quels sont les anciens sentiers, Quelle est la bonne voie ; marchez-y, Et vous trouverez le repos de vos âmes !",
     "> Placez-vous sur les chemins, regardez,\\\n> Et demandez quels sont les anciens sentiers,\\\n> Quelle est la bonne voie ; marchez-y,\\\n> Et vous trouverez le repos de vos âmes !",
     "style.md § 4.7 : en bloc, un vers par ligne avec sa capitale"),
    ("05-ch03-josias", "devant l’Éternel [...] moi aussi", "devant l’Éternel […] moi aussi",
     "style.md § 5 : coupure […] en un seul caractère"),
    ("05-ch03-josias", "cette année correspond à 622 av. J.-C. environ ;", "cette année se situe vers 622 av. J.-C. ;",
     "style.md § 8 : date reconstruite précédée de « vers », une seule forme"),
    ("05-ch03-josias", "a changé au dehors sans avoir encore changé au dedans", "a changé au-dehors sans avoir encore changé au-dedans",
     "orthographe : locutions adverbiales « au-dehors », « au-dedans » (trait d'union)"),
    ("07-ch05-solitude", "**La plainte honnête a sa place devant Dieu.**", "La plainte honnête a sa place devant Dieu.", HARMONISATION_LECONS),
    ("07-ch05-solitude", "**Le serviteur aussi est appelé à revenir.**", "Le serviteur aussi est appelé à revenir.", HARMONISATION_LECONS),
    ("07-ch05-solitude", "**La solitude du service, et ses limites.**", "La solitude du service, et ses limites.", HARMONISATION_LECONS),
    ("08-ch06-rouleau", "**La parole ne brûle pas.**", "La parole ne brûle pas.", HARMONISATION_LECONS),
    ("08-ch06-rouleau", "**Deux réactions à la même lecture.**", "Deux réactions à la même lecture.", HARMONISATION_LECONS),
    ("08-ch06-rouleau", "**Le collaborateur qui sert dans l’ombre.**", "Le collaborateur qui sert dans l’ombre.", HARMONISATION_LECONS),
    ("08-ch06-rouleau", "**L’ambition dans le service.**", "L’ambition dans le service.", HARMONISATION_LECONS),
    # Lot B
    ("09-ch07-gestes", "**L’obéissance qui fait honte.**", "L’obéissance qui fait honte.", HARMONISATION_LECONS),
    ("09-ch07-gestes", "**L’humilité devant la contradiction.**", "L’humilité devant la contradiction.", HARMONISATION_LECONS),
    ("09-ch07-gestes", "**Discerner à la lumière de ce que Dieu a dit.**", "Discerner à la lumière de ce que Dieu a dit.", HARMONISATION_LECONS),
    ("09-ch07-gestes", "**Un message agréable n’est pas une preuve.**", "Un message agréable n’est pas une preuve.", HARMONISATION_LECONS),
    ("10-ch08-lettre", "**Rechercher le bien de la ville où tu vis.**", "Rechercher le bien de la ville où tu vis.", HARMONISATION_LECONS),
    ("10-ch08-lettre", "**Dieu n’est pas enfermé dans un lieu.**", "Dieu n’est pas enfermé dans un lieu.", HARMONISATION_LECONS),
    ("10-ch08-lettre", "**Lire Jérémie 29:11 avec ses voisins.**", "Lire Jérémie 29:11 avec ses voisins.", HARMONISATION_LECONS),
    ("10-ch08-lettre", "**Se méfier des promesses de délivrance rapide.**", "Se méfier des promesses de délivrance rapide.", HARMONISATION_LECONS),
    ("10-ch08-lettre", "On date habituellement cette déportation de vers 597 av. J.-C.",
     "On situe habituellement cette déportation vers 597 av. J.-C.",
     "syntaxe : « dater de vers » est fautif ; même tournure que les autres dates (style.md § 8)"),
    ("11-ch09-consolation", "La loi au dedans et le pardon.", "La loi au-dedans et le pardon.",
     "orthographe : locution adverbiale « au-dedans » (hors citation ; la LSG garde « au dedans »)"),
    ("11-ch09-consolation", "d’écrire sa loi au dedans, et", "d’écrire sa loi au-dedans, et",
     "orthographe : locution adverbiale « au-dedans » (hors citation ; la LSG garde « au dedans »)"),
    ("12-ch10-citerne", "celui qui avait mis Jérémie aux ceps", "celui qui avait mis Jérémie en prison", PRISON),
    ("12-ch10-citerne", "(Jérémie 21:9 ; 38:2 ; 38:17)", "(Jérémie 21:9 ; 38:2, 17)",
     "style.md § 3 : versets du même chapitre séparés par une virgule"),
    ("14-ch12-egypte", "(Jérémie 49:6 ; 49:39)", "(Jérémie 49:6, 39)",
     "style.md § 3 : versets du même chapitre séparés par une virgule"),
    ("15-conclusion", "prisonnier dans les ceps, dans les cachots", "prisonnier à la porte de Benjamin, dans les cachots", PRISON),
    ("16-annexes", "qui met Jérémie aux ceps", "qui met Jérémie en prison", PRISON),
    # Retouches d'Akissi faites directement dans les copies après T15, reportées ici pour qu'une relance ne les perde pas
    ("14-ch12-egypte", "emmené en captivité à dix-huit ans,", "emmené en captivité après trois mois de règne (2 Rois 24:8),",
     "décision d'Akissi après T15 : l'âge diffère entre 2 Rois 24:8 et 2 Chroniques 36:9"),
    ("15-conclusion", "L’un était un haut fonctionnaire, l’autre un secrétaire, le troisième un serviteur étranger.",
     "Il y avait parmi eux de hauts fonctionnaires, un secrétaire et un serviteur étranger.",
     "décision d'Akissi après T15 : le paragraphe nomme quatre soutiens"),
    # Épreuves, premier tour (T18)
    ("16-annexes", "La carte de la page suivante situe", "La carte qui suit situe",
     "épreuves T18 : la carte n'est pas sur la page suivante (texte page 155, carte page 157)"),
]

# Copie des règles de outils/composer.py (« Typographie française »), appliquées au Markdown.
ESPACES = "[ \u00a0\u202f]*"
# Seul écart avec composer.py : la barre oblique inverse du saut de vers Markdown compte comme une fin.
APRES_PONCTUATION = r"(?=[\s\u00a0\u202f»)\]’”.,…;:!?\\]|$)"
AVANT_PONCTUATION = r"(?<=[^\s\u00a0\u202f;:!?(\[«])"
LIVRES_NUMEROTES = "Samuel|Rois|Chroniques|Corinthiens|Thessaloniciens|Timothée|Pierre|Jean"
REGLES_TYPO = [
    ("espace insécable entre le chiffre et le nom d'un livre numéroté (style.md § 3)",
     re.compile(r"(?<![\w:])([1-3]) (?=(?:" + LIVRES_NUMEROTES + r")\b)"), "\\1\u00a0"),
    ("espaces insécables dans « av. J.-C. » (style.md § 8)",
     re.compile(r"(\d) av\. ?J\.-C\."), "\\1\u00a0av.\u00a0J.-C."),
    ("espace fine insécable dans les nombres de plus de trois chiffres (style.md § 7)",
     re.compile(r"(?<![\d:,.])(\d{1,3}) (\d{3})(?!\d)"), "\\1\u202f\\2"),
    ("espace fine insécable avant ; ! ? (style.md § 4.4)",
     re.compile(AVANT_PONCTUATION + ESPACES + r"([;!?])" + APRES_PONCTUATION), "\u202f\\1"),
    ("espace insécable avant les deux-points (style.md § 4.4)",
     re.compile(AVANT_PONCTUATION + ESPACES + r":" + APRES_PONCTUATION), "\u00a0:"),
    ("espace insécable après « (style.md § 10)", re.compile("«" + ESPACES), "«\u202f"),
    ("espace insécable avant » (style.md § 10)", re.compile(ESPACES + "»"), "\u202f»"),
]


def typographier(ligne):
    """Applique les règles hors des attributs Pandoc {#id .classe} et des lignes de bloc « ::: »."""
    if ligne.startswith(":::"):
        return ligne, []
    morceaux = re.split(r"(\{[#.][^}]*\})", ligne)
    appliquees = []
    for i in range(0, len(morceaux), 2):
        for nom, motif, remplacement in REGLES_TYPO:
            nouveau = motif.sub(remplacement, morceaux[i])
            if nouveau != morceaux[i]:
                appliquees.append(nom)
                morceaux[i] = nouveau
    return "".join(morceaux), appliquees


def corriger(nom):
    original = (MANUSCRIT / f"{nom}.md").read_text(encoding="utf-8")
    texte = original
    releve = []
    for fichier, avant, apres, regle in CORRECTIONS_LUES:
        if fichier != nom:
            continue
        if texte.count(avant) != 1:
            raise SystemExit(f"{nom} : « {avant[:50]} » trouvé {texte.count(avant)} fois au lieu d'une")
        ligne = original[:original.index(avant)].count("\n") + 1
        texte = texte.replace(avant, apres)
        releve.append((ligne, avant, apres, regle))
    typo = {}
    lignes = []
    for numero, ligne in enumerate(texte.split("\n"), start=1):
        nouvelle, regles = typographier(ligne)
        for regle in regles:
            typo.setdefault(regle, []).append(numero)
        lignes.append(nouvelle)
    corrige = "\n".join(lignes)
    (MANUSCRIT / f"{nom}-corrige.md").write_text(corrige, encoding="utf-8")
    return original, corrige, releve, typo


def mots(texte):
    """Les espaces insécables sont invisibles à l'écran : on les lit comme des espaces pour la comparaison."""
    return re.findall(r"\S+|\n", texte.replace("\u00a0", " ").replace("\u202f", " "))


def comparaison_html(nom, original, corrige):
    a, b = mots(original), mots(corrige)
    sortie = []
    for code, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
        if code in ("delete", "replace"):
            sortie.append(f"<del>{html.escape(' '.join(a[i1:i2]))}</del>")
        if code in ("insert", "replace"):
            sortie.append(f"<ins>{html.escape(' '.join(b[j1:j2]))}</ins>")
        if code == "equal":
            sortie.append(html.escape(" ".join(a[i1:i2])))
    corps = " ".join(sortie).replace(" \n ", "\n").replace("\n", "<br>\n")
    nb = sum(1 for c in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes() if c[0] != "equal")
    return f'<section id="{nom}"><h2>{nom}.md <span class="nb">{nb} modification(s) de mots</span></h2>\n<div class="texte">{corps}</div></section>'


PAGE = """<!doctype html>
<html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Comparaison lot {lot}</title>
<style>
:root {{ --fond: #fdfcf8; --texte: #222; --supprime: #f6d5d2; --ajoute: #d4ecd6; --discret: #666; }}
@media (prefers-color-scheme: dark) {{ :root {{ --fond: #1d1c1a; --texte: #e8e6e1; --supprime: #5a2622; --ajoute: #22472a; --discret: #aaa; }} }}
body {{ background: var(--fond); color: var(--texte); font: 17px/1.6 Georgia, serif; max-width: 46em; margin: 0 auto; padding: 1em 16px 4em; }}
h1 {{ font-size: 1.4em; }} h2 {{ font-size: 1.1em; border-top: 1px solid var(--discret); padding-top: 1em; margin-top: 2em; }}
.nb {{ font-weight: normal; color: var(--discret); font-size: .85em; }}
del {{ background: var(--supprime); text-decoration: line-through; }}
ins {{ background: var(--ajoute); text-decoration: none; }}
.texte {{ overflow-wrap: anywhere; }}
nav a {{ margin-right: .8em; }}
</style></head><body>
<h1>Correction du lot {lot} : comparaison mot à mot</h1>
<p>Texte de l'original retiré : <del>barré</del>. Texte de la version corrigée : <ins>surligné</ins>. Les espaces insécables posées partout devant « : ; ! ? » et dans les guillemets sont invisibles et ne sont pas marquées ; elles sont comptées dans le relevé. Page générée par <code>corrections/corriger_lot.py {lot}</code> le {date}.</p>
<nav>{nav}</nav>
{sections}
</body></html>
"""


def releve_quatrieme():
    """Lot B : la quatrième de couverture est corrigée à la main (couverture/quatrieme-corrige.md) ; on relève ses lignes changées."""
    # Affoué a copié la version corrigée sur quatrieme.md en T17 : l'original de T16 se lit alors dans git.
    texte_avant = (EDITION / "couverture" / "quatrieme.md").read_text(encoding="utf-8")
    if texte_avant == (EDITION / "couverture" / "quatrieme-corrige.md").read_text(encoding="utf-8"):
        texte_avant = subprocess.run(["git", "show", "bbb4bb1:livres/jeremie/.edition/couverture/quatrieme.md"],
                                     cwd=EDITION, capture_output=True, text=True, check=True).stdout
    avant = texte_avant.split("\n")
    apres = (EDITION / "couverture" / "quatrieme-corrige.md").read_text(encoding="utf-8").split("\n")
    lignes = []
    for code, i1, i2, j1, j2 in difflib.SequenceMatcher(None, avant, apres, autojunk=False).get_opcodes():
        if code == "replace":
            for n, (a, b) in enumerate(zip(avant[i1:i2], apres[j1:j2])):
                regle = ("statut de relecture" if a.startswith("Statut") else
                         "style.md § 3 : versets du même chapitre séparés par une virgule" if "Jérémie" in a else
                         "apostrophe typographique ’")
                lignes.append((i1 + n + 1, a, b, regle))
    return lignes


def main():
    lot = sys.argv[1] if len(sys.argv) > 1 else ""
    if lot not in LOTS:
        sys.exit(__doc__)
    fichiers, tache, date = LOTS[lot]["fichiers"], LOTS[lot]["tache"], LOTS[lot]["date"]
    cellule = lambda t: t.replace("|", "\\|").replace("\n", " ⏎ ")
    sections, releve_md, total_lus, total_typo = [], [], 0, 0
    for nom in fichiers:
        original, corrige, releve, typo = corriger(nom)
        sections.append(comparaison_html(nom, original, corrige))
        for ligne, avant, apres, regle in releve:
            releve_md.append(f"| {nom}.md | {ligne} | {cellule(avant)} | {cellule(apres)} | {regle} |")
            total_lus += 1
        for regle, numeros in typo.items():
            total_typo += len(numeros)
            lignes = ", ".join(str(n) for n in sorted(set(numeros)))
            releve_md.append(f"| {nom}.md | {lignes} | espace ordinaire ou absente | espace insécable "
                             f"({len(numeros)} ligne(s)) | {regle} |")
    if lot == "B":
        for ligne, avant, apres, regle in releve_quatrieme():
            releve_md.append(f"| couverture/quatrieme.md | {ligne} | {cellule(avant)} | {cellule(apres)} | {regle} |")
            total_lus += 1
    nav = " ".join(f'<a href="#{n}">{n[:2]}</a>' for n in fichiers)
    (CORRECTIONS / f"comparaison-lot-{lot}.html").write_text(
        PAGE.format(nav=nav, sections="\n".join(sections), lot=lot, date=date), encoding="utf-8")
    entete = [f"# Relevé des corrections, lot {lot} (fichiers {fichiers[0][:2]} à {fichiers[-1][:2]})", "",
              f"Établi par Amenan le {date} ({tache}). Généré par `corrections/corriger_lot.py {lot}`. "
              "Pour les corrections lues, les numéros de ligne sont ceux de l'original de Konan ; pour la "
              "typographie, ceux de la copie corrigée (ils ne diffèrent qu'après une ligne coupée en vers). "
              "Les copies corrigées sont `manuscrit/NN-x-corrige.md` ; les originaux sont intacts.", "",
              f"{total_lus} corrections relevées à la lecture, {total_typo} lignes touchées par la passe "
              "d'espaces insécables (regroupées par fichier et par règle).", "",
              "| Fichier | Ligne | Avant | Après | Règle |", "|---|---|---|---|---|"]
    (CORRECTIONS / f"releve-lot-{lot}.md").write_text("\n".join(entete + releve_md) + "\n", encoding="utf-8")
    print(f"Lot {lot} : {len(fichiers)} copies corrigées, {total_lus} corrections lues, {total_typo} lignes de typographie")


if __name__ == "__main__":
    main()
