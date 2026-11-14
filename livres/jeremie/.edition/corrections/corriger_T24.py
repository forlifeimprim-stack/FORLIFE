#!/usr/bin/env python3
"""Correction des ajouts T22, T23, T27 et de l'avant-propos (T24), faite en place dans manuscrit/*-corrige.md.

  python3 corrections/corriger_T24.py        (depuis .edition/, une seule fois)

Depuis T18, les copies corrigées ont été enrichies directement : corriger_lot.py, qui repart des originaux,
ne doit plus être relancé. Ce script applique les corrections à la copie telle qu'elle est, garde la version
d'avant dans corrections/avant-T24/, puis écrit le relevé et la page de comparaison.
"""
import re
import shutil
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from corriger_lot import PAGE, comparaison_html, typographier  # noqa: E402

EDITION = Path(__file__).resolve().parent.parent
MANUSCRIT = EDITION / "manuscrit"
CORRECTIONS = EDITION / "corrections"
SAUVEGARDE = CORRECTIONS / "avant-T24"
ESPACE = "[   ]"

# (fichier, motif regex qui doit trouver exactement une occurrence, remplacement, règle)
CORRECTIONS_LUES = [
    ("07-ch05-solitude", r"fin du septième siècle ou du début du sixième siècle",
     "fin du VII^e^ siècle ou du début du VI^e^ siècle", "style.md § 8 : siècles en chiffres romains, « e » en exposant"),
    ("14-ch12-egypte", r"au début du vingtième siècle", "au début du XX^e^ siècle",
     "style.md § 8 : siècles en chiffres romains, « e » en exposant"),
    ("08-ch06-rouleau", r"le même mot, peut-être, revient", "le même mot, « peut-être », revient",
     "style.md § 10 : un mot cité pour lui-même se met entre guillemets (sinon on lit « peut-être » comme une hésitation)"),
    ("11-ch09-consolation", r"Dieu mettra sa loi au dedans d’eux", "Dieu mettra sa loi au-dedans d’eux",
     "orthographe : locution adverbiale « au-dedans » hors citation (T15)"),
    ("16-annexes", r"dira de même que Dieu «" + ESPACE + r"renverse et qui établit les rois",
     "dira de même que c’est Dieu « qui renverse et qui établit les rois",
     "syntaxe : la citation de Daniel 2:21 commençait au milieu de la relative (« Dieu renverse et qui établit »)"),
]
EXPOSANT_E = "typographie : « ᵉ » (U+1D49) absent des polices du livre ; remplacé par un « e » en exposant Markdown"


def appliquer(nom, texte, releve):
    for fichier, motif, remplacement, regle in CORRECTIONS_LUES:
        if fichier != nom:
            continue
        trouves = list(re.finditer(motif, texte))
        if len(trouves) != 1:
            sys.exit(f"{nom} : motif « {motif} » trouvé {len(trouves)} fois au lieu d'une")
        m = trouves[0]
        releve.append((texte[:m.start()].count("\n") + 1, m.group(0), remplacement, regle))
        texte = texte[:m.start()] + remplacement + texte[m.end():]
    for m in reversed(list(re.finditer(r"(?<!\*)\*([^*\n]*ᵉ[^*\n]*)\*(?!\*)", texte))):
        nouveau = "*" + m.group(1).replace("ᵉ", "^e^") + "*"
        releve.append((texte[:m.start()].count("\n") + 1, m.group(0), nouveau, EXPOSANT_E))
        texte = texte[:m.start()] + nouveau + texte[m.end():]
    return texte


def main():
    if SAUVEGARDE.exists():
        sys.exit("corrections/avant-T24/ existe déjà : le script a déjà été appliqué.")
    SAUVEGARDE.mkdir()
    sections, lignes_releve, total_typo = [], [], 0
    for chemin in sorted(MANUSCRIT.glob("*-corrige.md")):
        nom = chemin.stem.removesuffix("-corrige")
        avant = chemin.read_text(encoding="utf-8")
        shutil.copy2(chemin, SAUVEGARDE / chemin.name)
        releve = []
        texte = appliquer(nom, avant, releve)
        typo = {}
        lignes = []
        for numero, ligne in enumerate(texte.split("\n"), start=1):
            nouvelle, regles = typographier(ligne)
            for regle in regles:
                typo.setdefault(regle, []).append(numero)
            lignes.append(nouvelle)
        texte = "\n".join(lignes)
        if texte == avant:
            continue
        chemin.write_text(texte, encoding="utf-8")
        sections.append(comparaison_html(nom, avant, texte))
        for ligne, a, b, regle in sorted(releve):
            lignes_releve.append(f"| {nom}.md | {ligne} | {a} | {b} | {regle} |")
        for regle, numeros in typo.items():
            total_typo += len(numeros)
            lignes_releve.append(f"| {nom}.md | {', '.join(map(str, sorted(set(numeros))))} | espace ordinaire "
                                 f"| espace insécable ({len(numeros)} ligne(s)) | {regle} |")
    nav = " ".join(f'<a href="#{s.split(chr(34))[1]}">{s.split(chr(34))[1][:2]}</a>' for s in sections)
    (CORRECTIONS / "comparaison-T24.html").write_text(
        PAGE.format(nav=nav, sections="\n".join(sections), lot="T24 (ajouts)", date="14 novembre 2026"),
        encoding="utf-8")
    entete = ["# Relevé des corrections T24 (ajouts T22, T23, T27 et avant-propos)", "",
              "Établi par Amenan le 14 novembre 2026. Généré par `corrections/corriger_T24.py`, appliqué en place "
              "aux copies `manuscrit/*-corrige.md` ; la version d'avant est gardée dans `corrections/avant-T24/`. "
              "Numéros de ligne : ceux de la copie avant correction.", "",
              "| Fichier | Ligne | Avant | Après | Règle |", "|---|---|---|---|---|"]
    (CORRECTIONS / "releve-T24.md").write_text("\n".join(entete + lignes_releve) + "\n", encoding="utf-8")
    print(f"{len(sections)} fichiers modifiés, {len(lignes_releve)} lignes de relevé, {total_typo} lignes de typographie")


if __name__ == "__main__":
    main()
