#!/usr/bin/env python3
"""Mots hébreux d'un verset (texte massorétique WLC) avec leur lemme et le sens du dictionnaire.

  python3 hebreu.py "Jérémie 1:10"
  python3 hebreu.py --strong 5428          # article du lexique de Strong (et renvoi BDB)
  python3 hebreu.py --chercher 5428 --livre Jérémie   # versets où le lemme apparaît

Sources (sources/hebreu/, téléchargées depuis github.com/openscriptures) :
- morphhb : texte WLC (domaine public), lemmes et morphologie sous licence CC BY 4.0,
  crédit à imprimer : « Open Scriptures Hebrew Bible Project » ;
- HebrewLexicon : dictionnaire de Strong (domaine public) et Brown-Driver-Briggs (domaine public).
Les numéros de verset suivent la Bible hébraïque : ils diffèrent parfois de la Louis Segond.
"""
import re
import signal
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from verset import NOMS_FR, sans_accents  # noqa: E402

SOURCES = Path(__file__).resolve().parent.parent / "sources" / "hebreu"
OSIS = {"Genèse": "Gen", "Exode": "Exod", "Deutéronome": "Deut", "2 Rois": "2Kgs", "2 Chroniques": "2Chr",
        "Psaumes": "Ps", "Ésaïe": "Isa", "Jérémie": "Jer", "Lamentations": "Lam", "Ézéchiel": "Ezek",
        "Daniel": "Dan"}
NS = {"o": "http://www.bibletechnologies.net/2003/OSIS/namespace"}


def livre_osis(nom):
    cle = sans_accents(nom)
    for fr, code in OSIS.items():
        if sans_accents(fr) == cle:
            return code
    sys.exit(f"Livre non téléchargé en hébreu : {nom} (disponibles : {', '.join(OSIS)})")


def lexique():
    racine = ET.parse(SOURCES / "HebrewStrong.xml").getroot()
    entrees = {}
    for e in racine.iter():
        if e.tag.endswith("entry") and e.get("id"):
            mot = next((c for c in e if c.tag.endswith("w")), None)
            sens = next((c for c in e if c.tag.endswith("meaning")), None)
            usage = next((c for c in e if c.tag.endswith("usage")), None)
            entrees[e.get("id").lstrip("H")] = {
                "hebreu": mot.text if mot is not None else "",
                "translit": mot.get("xlit", "") if mot is not None else "",
                "sens": " ".join("".join(sens.itertext()).split()) if sens is not None else "",
                "usage": " ".join("".join(usage.itertext()).split()) if usage is not None else "",
            }
    return entrees


def numero_strong(lemme):
    # « c/l/5428 a » : préfixes (c = et, l = pour, d = article...) puis numéro et lettre de sens
    m = re.search(r"(\d+)", lemme.split("/")[-1])
    return m.group(1) if m else None


def versets(code):
    racine = ET.parse(SOURCES / f"{code}.xml").getroot()
    for v in racine.iterfind(".//o:verse", NS):
        yield v.get("osisID"), [w for w in v.iterfind("o:w", NS)]


def afficher_verset(reference):
    m = re.match(r"^\s*(.+?)\s+(\d+):(\d+)\s*$", reference)
    if not m:
        sys.exit("Forme attendue : Jérémie 1:10")
    code = livre_osis(m.group(1))
    cible = f"{code}.{m.group(2)}.{m.group(3)}"
    lex = lexique()
    for osis, mots in versets(code):
        if osis == cible:
            print(f"{reference} (WLC, lemmes OSHB, sens de Strong)")
            for w in mots:
                num = numero_strong(w.get("lemma", ""))
                e = lex.get(num, {})
                print(f"  {w.text.replace('/', '')}  H{num}  {e.get('translit', '')}  {w.get('morph', '')}  : {e.get('sens', '')}")
            return
    sys.exit(f"{reference} introuvable dans le texte hébreu (numérotation différente ?)")


def afficher_strong(numero):
    e = lexique().get(numero.lstrip("H"))
    if not e:
        sys.exit("Numéro inconnu")
    print(f"H{numero.lstrip('H')}  {e['hebreu']}  {e['translit']}\n  sens : {e['sens']}\n  emplois (KJV) : {e['usage']}")


def chercher(numero, livre):
    code = livre_osis(livre)
    numero = numero.lstrip("H")
    for osis, mots in versets(code):
        if any(numero_strong(w.get("lemma", "")) == numero for w in mots):
            _, ch, vs = osis.split(".")
            print(f"{livre} {ch}:{vs}")


def main():
    signal.signal(signal.SIGPIPE, signal.SIG_DFL)
    args = sys.argv[1:]
    if not args:
        sys.exit(__doc__)
    if args[0] == "--strong":
        afficher_strong(args[1])
    elif args[0] == "--chercher":
        chercher(args[1], args[args.index("--livre") + 1] if "--livre" in args else "Jérémie")
    else:
        for reference in args:
            afficher_verset(reference)


if __name__ == "__main__":
    main()
