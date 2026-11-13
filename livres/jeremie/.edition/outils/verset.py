#!/usr/bin/env python3
"""Cite ou recherche un passage dans la Louis Segond 1910 (ou la KJV) téléchargée dans .edition/sources.

  python3 verset.py "Jérémie 1:4-10"
  python3 verset.py "Jérémie 20:9" "2 Rois 22:3"
  python3 verset.py --chercher "comme un feu dévorant" [--livre Jérémie]
  python3 verset.py --kjv "Jeremiah 1:5"

Source : github.com/midvash/bible-data (Louis Segond 1910, domaine public). Le fichier source double
les apostrophes (''), on les ramène à une seule.
"""
import json
import re
import signal
import sys
import unicodedata
from pathlib import Path

SOURCES = Path(__file__).resolve().parent.parent / "sources"

NOMS_FR = [
    "Genèse", "Exode", "Lévitique", "Nombres", "Deutéronome", "Josué", "Juges", "Ruth",
    "1 Samuel", "2 Samuel", "1 Rois", "2 Rois", "1 Chroniques", "2 Chroniques", "Esdras",
    "Néhémie", "Esther", "Job", "Psaumes", "Proverbes", "Ecclésiaste", "Cantique des cantiques",
    "Ésaïe", "Jérémie", "Lamentations", "Ézéchiel", "Daniel", "Osée", "Joël", "Amos", "Abdias",
    "Jonas", "Michée", "Nahum", "Habacuc", "Sophonie", "Aggée", "Zacharie", "Malachie",
    "Matthieu", "Marc", "Luc", "Jean", "Actes", "Romains", "1 Corinthiens", "2 Corinthiens",
    "Galates", "Éphésiens", "Philippiens", "Colossiens", "1 Thessaloniciens",
    "2 Thessaloniciens", "1 Timothée", "2 Timothée", "Tite", "Philémon", "Hébreux", "Jacques",
    "1 Pierre", "2 Pierre", "1 Jean", "2 Jean", "3 Jean", "Jude", "Apocalypse",
]
VARIANTES = {"psaume": 19, "cantique": 22, "esaie": 23, "isaie": 23, "ecclesiaste": 21,
             "actes des apotres": 44, "qohelet": 21}


def sans_accents(texte):
    texte = unicodedata.normalize("NFD", texte.lower())
    return "".join(c for c in texte if unicodedata.category(c) != "Mn").strip()


# Défauts de la source numérique LSG relevés le 9 novembre 2026 : la préposition « à » est tombée en
# tête de certains versets (Jérémie 35:19, Jérémie 44:3, 1 Rois 15:30...) et le nom du livre suivant
# est collé à la fin du dernier verset de deux livres (Exode 11:10, Deutéronome 18:22).
A_PERDU = re.compile(r"^(cause |travers |moins que )")
NOM_PARASITE = re.compile(r"\s+(Exode|Deutéronome)\s*$")


def reparer_lsg(texte):
    texte = NOM_PARASITE.sub("", texte)
    if A_PERDU.match(texte):
        texte = "à " + texte
    # Même perte pour un « É » ou « é » initial (Jérémie 44:26, Romains 1:29...).
    if texte.startswith("coutez "):
        texte = "É" + texte
    elif texte.startswith("tant "):
        texte = "é" + texte
    return texte


def charger(version):
    fichier = SOURCES / ("lsg1910/lsg.json" if version == "lsg" else "kjv.json")
    livres = json.load(open(fichier, encoding="utf-8"))["books"]
    if version == "lsg":
        for livre in livres:
            for chapitre in livre["chapters"]:
                for v in chapitre["verses"]:
                    v["text"] = reparer_lsg(v["text"])
    return {livre["bookId"]: livre for livre in livres}


def numero_livre(nom, livres):
    cle = sans_accents(nom)
    for i, fr in enumerate(NOMS_FR, start=1):
        if sans_accents(fr) == cle:
            return i
    if cle in VARIANTES:
        return VARIANTES[cle]
    for numero, livre in livres.items():
        if sans_accents(livre["englishName"]) == cle:
            return numero
    sys.exit(f"Livre inconnu : {nom}")


def texte_verset(texte):
    return texte.replace("''", "'")


def citer(reference, livres, version):
    m = re.match(r"^\s*(.+?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?\s*$", reference)
    if not m:
        sys.exit(f"Référence illisible : {reference} (forme attendue : Jérémie 1:4-10)")
    nom, chapitre, debut, fin = m.group(1), int(m.group(2)), m.group(3), m.group(4)
    numero = numero_livre(nom, livres)
    livre = livres[numero]
    chapitres = {c["chapter"]: c for c in livre["chapters"]}
    if chapitre not in chapitres:
        sys.exit(f"{reference} : chapitre absent")
    versets = chapitres[chapitre]["verses"]
    if debut:
        debut, fin = int(debut), int(fin or debut)
        versets = [v for v in versets if debut <= v["number"] <= fin]
        if not versets:
            sys.exit(f"{reference} : verset absent")
    titre = NOMS_FR[numero - 1] if version == "lsg" else livre["englishName"]
    print(f"{titre} {chapitre}" + (f":{versets[0]['number']}" if debut else "")
          + (f"-{versets[-1]['number']}" if debut and len(versets) > 1 else "")
          + f" ({'LSG 1910' if version == 'lsg' else 'KJV'})")
    for v in versets:
        print(f"  {v['number']} {texte_verset(v['text'])}")


def chercher(expression, livres, version, filtre_livre=None):
    cible = sans_accents(expression)
    numero_filtre = numero_livre(filtre_livre, livres) if filtre_livre else None
    trouves = 0
    for numero, livre in livres.items():
        if numero_filtre and numero != numero_filtre:
            continue
        titre = NOMS_FR[numero - 1] if version == "lsg" else livre["englishName"]
        for c in livre["chapters"]:
            for v in c["verses"]:
                texte = texte_verset(v["text"])
                if cible in sans_accents(texte):
                    print(f"{titre} {c['chapter']}:{v['number']}  {texte}")
                    trouves += 1
    if not trouves:
        print("Aucun résultat.")


def main():
    # Sortie coupée par « head » : se taire au lieu d'afficher une trace.
    signal.signal(signal.SIGPIPE, signal.SIG_DFL)
    args = sys.argv[1:]
    version = "lsg"
    if "--kjv" in args:
        args.remove("--kjv")
        version = "kjv"
    livres = charger(version)
    if args and args[0] == "--chercher":
        filtre = None
        if "--livre" in args:
            i = args.index("--livre")
            filtre = args[i + 1]
            del args[i:i + 2]
        chercher(" ".join(args[1:]), livres, version, filtre)
        return
    if not args:
        sys.exit(__doc__)
    for reference in args:
        citer(reference, livres, version)


if __name__ == "__main__":
    main()
