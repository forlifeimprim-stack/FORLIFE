#!/usr/bin/env python3
"""Produit les scripts du livre audio, un fichier texte par partie, depuis le manuscrit corrigé.

  python3 numerique/fabriquer_scripts_audio.py
      lit manuscrit/*-corrige.md et numerique/audio/lexique-prononciation.md,
      écrit numerique/audio/scripts/01-avant-propos.txt … 16-annexes.txt,
      puis contrôle chaque script et affiche les marques retirées et la durée estimée.

Les scripts suivent les consignes de CLAUDE.md pour la « FOR LIFE voix off » : nombres,
références et sigles en toutes lettres, une ligne vide entre les paragraphes, titres sur leur
propre paragraphe. On ne retouche jamais un script à la main : on corrige le manuscrit ou le
lexique, puis on relance ce script.
"""
import re
import sys
from pathlib import Path

EDITION = Path(__file__).resolve().parent.parent
MANUSCRIT = EDITION / "manuscrit"
LEXIQUE = EDITION / "numerique" / "audio" / "lexique-prononciation.md"
SCRIPTS = EDITION / "numerique" / "audio" / "scripts"
MOTS_PAR_MINUTE = 150

sys.dont_write_bytecode = True
sys.path.insert(0, str(EDITION / "outils"))
from verset import NOMS_FR  # noqa: E402

# ---------- Nombres ----------

UNITES = ["zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix",
          "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"]
DIZAINES = {2: "vingt", 3: "trente", 4: "quarante", 5: "cinquante", 6: "soixante"}


def moins_de_cent(n):
    if n < 20:
        return UNITES[n]
    d, u = divmod(n, 10)
    if d in DIZAINES:
        if u == 0:
            return DIZAINES[d]
        return DIZAINES[d] + (" et un" if u == 1 else "-" + UNITES[u])
    if d == 7:
        return "soixante" + (" et onze" if u == 1 else "-" + UNITES[10 + u])
    if d == 8:
        return "quatre-vingts" if u == 0 else "quatre-vingt-" + UNITES[u]
    return "quatre-vingt-" + UNITES[10 + u]


def moins_de_mille(n):
    c, r = divmod(n, 100)
    if c == 0:
        return moins_de_cent(r)
    centaines = "cent" if c == 1 else UNITES[c] + " cent"
    if r == 0:
        return centaines + ("s" if c > 1 else "")
    return centaines + " " + moins_de_cent(r)


def en_lettres(n):
    if n < 1000:
        return moins_de_mille(n)
    m, r = divmod(n, 1000)
    milliers = "mille" if m == 1 else moins_de_mille(m).removesuffix("s") + " mille"
    return milliers + ("" if r == 0 else " " + moins_de_mille(r))


ORDINAUX = ["", "premier", "deuxième", "troisième", "quatrième", "cinquième", "sixième", "septième",
            "huitième", "neuvième", "dixième", "onzième", "douzième"]
ORDINAUX_F = ["", "Première"] + [o.capitalize() for o in ORDINAUX[2:]]
def ordinal(n):
    if n == 1:
        return "premier"
    mot = en_lettres(n).removesuffix("s")
    if mot.endswith("cinq"):
        return mot + "uième"
    if mot.endswith("neuf"):
        return mot[:-1] + "vième"
    return mot.removesuffix("e") + "ième"


ROMAINS = {"I": 1, "V": 5, "X": 10, "L": 50}


def romain(chiffres):
    total = 0
    for i, c in enumerate(chiffres):
        v = ROMAINS[c]
        total += -v if i + 1 < len(chiffres) and ROMAINS[chiffres[i + 1]] > v else v
    return total


# ---------- Références bibliques ----------

LIVRES_NUMEROTES = {
    "Samuel": "livre de Samuel", "Rois": "livre des Rois", "Chroniques": "livre des Chroniques",
    "Corinthiens": "épître aux Corinthiens", "Thessaloniciens": "épître aux Thessaloniciens",
    "Timothée": "épître à Timothée", "Pierre": "épître de Pierre", "Jean": "épître de Jean",
}
NOMS = sorted({re.sub(r"^[1-3] ", "", n) for n in NOMS_FR}, key=len, reverse=True)
VERSETS = r"\d+(?:-\d+)?(?:, ?\d+(?:-\d+)?)*"
CHAPITRE = r"\d+(?::" + VERSETS + r"|-\d+)?"
REFERENCE = re.compile(
    r"(?<![\w-])(?:([1-3]) )?(" + "|".join(map(re.escape, NOMS)) + r") "
    r"(" + CHAPITRE + r"(?:(?: ?; ?| à )" + CHAPITRE + r")*)(?![\d:])")


def nom_du_livre(numero, livre):
    if numero:
        rang = "Premier" if numero == "1" else ORDINAUX[int(numero)].capitalize()
        complement = LIVRES_NUMEROTES[livre]
        if complement.startswith("épître"):
            rang = "Première" if numero == "1" else rang
        return f"{rang} {complement}"
    return livre


def dire_versets(texte):
    morceaux = [m.strip() for m in texte.split(",")]
    dits = []
    for m in morceaux:
        if "-" in m:
            a, b = m.split("-")
            liaison = " et " if int(b) == int(a) + 1 else " à "
            dits.append(f"{en_lettres(int(a))}{liaison}{en_lettres(int(b))}")
        else:
            dits.append(en_lettres(int(m)))
    pluriel = len(morceaux) > 1 or "-" in texte
    if len(dits) > 1:
        dits = [", ".join(dits[:-1]) + " et " + dits[-1]]
    return ("versets " if pluriel else "verset ") + dits[0]


def dire_chapitre(texte):
    if ":" in texte:
        c, v = texte.split(":")
        return f"chapitre {en_lettres(int(c))}, {dire_versets(v)}"
    if "-" in texte:
        a, b = texte.split("-")
        return f"chapitres {en_lettres(int(a))} à {en_lettres(int(b))}"
    return f"chapitre {en_lettres(int(texte))}"


def dire_reference(m):
    numero, livre, corps = m.groups()
    morceaux = re.split(r"( ?; ?| à )", corps)
    dit = dire_chapitre(morceaux[0])
    for liaison, morceau in zip(morceaux[1::2], morceaux[2::2]):
        dit += (", jusqu’au " if liaison == " à " else ", et ") + dire_chapitre(morceau)
    return f"{nom_du_livre(numero, livre)}, {dit}"


# ---------- Lexique et marques ----------

def lire_lexique():
    """Table « Mots hébreux et transcriptions » du lexique : forme du livre -> forme dite."""
    texte = LEXIQUE.read_text(encoding="utf-8")
    section = texte.split("## Mots hébreux et transcriptions", 1)[1].split("\n## ", 1)[0]
    formes = {}
    for ligne in section.splitlines():
        cellules = [c.strip() for c in ligne.strip().strip("|").split("|")]
        if len(cellules) >= 2 and cellules[0] not in ("Forme dans le livre", "") \
                and not set(cellules[0]) <= set("-"):
            formes[cellules[0]] = cellules[1]
    return dict(sorted(formes.items(), key=lambda f: len(f[0]), reverse=True))


# Sigles lus lettre à lettre (choix à valider par l'auteur, voir le lexique).
SIGLES = {"CMA": "C, M, A"}

MARQUE = re.compile(r" ?\[À (?:COMPLÉTER|VÉRIFIER)[^\]]*\]")


# ---------- Mise en mots d'un passage ----------

def pour_l_oreille(texte, lexique):
    texte = texte.replace(" ", " ").replace(" ", " ")
    for forme, dite in lexique.items():
        texte = texte.replace(f"*{forme}*", dite)
    for forme, dite in lexique.items():
        texte = re.sub(r"(?<!\w)" + re.escape(forme) + r"(?!\w)", dite, texte)
    texte = re.sub(r"\*\*|\*", "", texte)
    texte = texte.replace("[…]", "…")
    for sigle, dit in SIGLES.items():
        texte = re.sub(r"\b" + sigle + r"\b", dit, texte)
    texte = re.sub(r"\\$", "", texte, flags=re.M)

    texte = re.sub(r"\bav\. J\.-C\.", "avant Jésus-Christ", texte)
    texte = re.sub(r"\bapr\. J\.-C\.", "après Jésus-Christ", texte)
    texte = texte.replace("J.-C.", "Jésus-Christ")
    texte = re.sub(r"\b([IVXL]+)\^?e\^? siècle", lambda m: ordinal(romain(m.group(1))) + " siècle", texte)

    # Une parenthèse qui ne contient que des références devient une phrase ou une incise.
    texte = REFERENCE.sub(lambda m: "§" + dire_reference(m) + "§", texte)
    texte = re.sub(r" ?\((§[^()]*§)\)([.!?])", r"\2 \1.", texte)
    texte = re.sub(r"([.!?]) ?\. (§[^()]*§)\.", r"\1 \2.", texte)
    texte = re.sub(r" ?\((§[^()]*§)\)", r", \1,", texte)
    texte = texte.replace("§", "")
    texte = re.sub(r"\b(\d+):(\d+)-(\d+)\b", lambda m: f"chapitre {en_lettres(int(m[1]))}, "
                   f"versets {en_lettres(int(m[2]))} à {en_lettres(int(m[3]))}", texte)
    texte = re.sub(r"\b(\d+):(\d+)\b", lambda m: f"chapitre {en_lettres(int(m[1]))}, "
                   f"verset {en_lettres(int(m[2]))}", texte)

    texte = re.sub(r"\b1er\b", "premier", texte)
    texte = re.sub(r"\b(\d+)-(\d+)\b", r"\1 à \2", texte)
    texte = re.sub(r"\b(\d{1,3}) (\d{3})\b", lambda m: m[1] + m[2], texte)
    texte = re.sub(r"(\d+) ?%", r"\1 pour cent", texte)
    texte = re.sub(r"\d+", lambda m: en_lettres(int(m.group(0))), texte)

    texte = re.sub(r"\b[A-Z]\. (?=[A-Z][a-zé])", "", texte)  # initiale d'un prénom
    texte = re.sub(r" ?\(([^()]*)\)", r", \1,", texte)
    texte = texte.replace("/", " ou ")
    texte = re.sub(r",\s*([,.])", r"\1", texte)
    texte = re.sub(r",\s*([;:!?])", r" \1", texte)
    texte = re.sub(r"\s+([,.])", r"\1", texte)
    texte = re.sub(r"([;:!?])\s*,", r"\1", texte)
    texte = re.sub(r"\.\s*\.", ".", texte)
    texte = re.sub(r" {2,}", " ", texte)
    return texte.strip()


def phrase(texte):
    texte = texte.strip()
    if texte.endswith(":"):
        return texte[:-1].rstrip() + "."
    return texte if not texte or texte[-1] in ".!?…»" else texte + "."


# ---------- Blocs du manuscrit ----------

ANNONCES = {"lecons": "Leçons pour aujourd’hui.", "questions": "Pour méditer.", "priere": "Prière."}
FINS = {"encadre": "Fin de l’encadré.", "application": "Fin de l’encadré."}
TITRE_DE_CHAPITRE = re.compile(r"^(\d\d)-ch(\d\d)-")


def citation(lignes, lexique):
    paragraphes = [p.strip() for p in "\n".join(l[1:].strip().removesuffix("\\") if l != ">" else ""
                                                for l in lignes)
                   .split("\n\n") if p.strip()]
    source = ""
    if re.fullmatch(r"\(.*\d.*\)", paragraphes[-1]):
        source = pour_l_oreille(paragraphes.pop()[1:-1], lexique)
    corps = [pour_l_oreille(" ".join(p.split("\n")), lexique) for p in paragraphes]
    annonce = f"Citation de {source}." if source else "Citation."
    return [annonce, *corps, "Fin de la citation."]


def tableau(lignes, lexique):
    rangs = [[c.strip() for c in l.strip().strip("|").split("|")] for l in lignes]
    entetes, rangs = rangs[0], [r for r in rangs[2:] if any(r)]
    sortie = [f"Tableau en {en_lettres(len(rangs))} lignes. Le tableau complet figure dans le livre imprimé."]
    for rang in rangs:
        morceaux = []
        for entete, cellule in zip(entetes, rang):
            if not cellule:
                continue
            if entete.startswith("Passage de Jérémie"):
                cellule = "Jérémie " + cellule
            if entete.startswith("Chapitre du présent livre"):
                cellule = ("chapitres " if re.search(r"\d\D+\d", cellule) else "chapitre ") + cellule
            morceaux.append(f"{entete} : {cellule}")
        sortie.append(phrase(pour_l_oreille(". ".join(morceaux), lexique)))
    return sortie


def partie_en_paragraphes(texte, numero_de_chapitre, lexique):
    lignes = re.sub(r"<!--.*?-->", "", texte, flags=re.S).splitlines()
    paragraphes, pile, courant = [], [], []
    niveaux = {}  # rang du paragraphe -> niveau de titre
    rang_de_liste, contexte_questions = 0, False

    def vider():
        if courant:
            paragraphes.append(phrase(pour_l_oreille(" ".join(courant), lexique)))
            courant.clear()

    i = 0
    while i < len(lignes):
        ligne = lignes[i].rstrip()
        if not ligne.strip():
            vider()
            i += 1
            continue
        if ligne.startswith(":::"):
            vider()
            classe = ligne[3:].strip()
            if classe:
                pile.append(classe)
                if classe in ANNONCES:
                    paragraphes.append(ANNONCES[classe])
                elif classe in FINS:
                    titre = lignes[i + 1].strip() if i + 1 < len(lignes) else ""
                    if re.fullmatch(r"\*\*.+\*\*", titre):
                        paragraphes.append(phrase("Encadré : " + pour_l_oreille(titre, lexique)))
                        i += 1
                    else:
                        paragraphes.append("Encadré.")
                rang_de_liste = 0
            elif pile:
                fin = FINS.get(pile.pop())
                if fin:
                    paragraphes.append(fin)
            i += 1
            continue
        if ligne.startswith("#"):
            vider()
            niveau = len(ligne) - len(ligne.lstrip("#"))
            titre = re.sub(r"\s*\{[^}]*\}\s*$", "", ligne.lstrip("#")).strip()
            if niveau == 1 and numero_de_chapitre:
                paragraphes.append(f"Chapitre {en_lettres(numero_de_chapitre)}.")
            paragraphes.append(phrase(pour_l_oreille(titre, lexique)))
            niveaux[len(paragraphes) - 1] = niveau
            contexte_questions = "Questions" in titre
            rang_de_liste = 0
            i += 1
            continue
        if ligne.startswith(">"):
            vider()
            bloc = []
            while i < len(lignes) and lignes[i].startswith(">"):
                bloc.append(lignes[i].rstrip())
                i += 1
            paragraphes.extend(citation(bloc, lexique))
            continue
        if ligne.startswith("|"):
            vider()
            bloc = []
            while i < len(lignes) and lignes[i].startswith("|"):
                bloc.append(lignes[i])
                i += 1
            paragraphes.extend(tableau(bloc, lexique))
            continue
        image = re.match(r"!\[(.*)\]\(", ligne)
        if image:
            vider()
            paragraphes.append(phrase("Illustration : " + pour_l_oreille(image.group(1), lexique)))
            paragraphes.append("Elle figure dans le livre imprimé.")
            i += 1
            continue
        element = re.match(r"(\d+)\.\s+(.*)", ligne)
        if element:
            vider()
            rang_de_liste += 1
            questions = contexte_questions or (pile and pile[-1] == "questions")
            annonce = f"{ORDINAUX_F[rang_de_liste]} question." if questions \
                else f"{ORDINAUX[rang_de_liste].capitalize()} point."
            paragraphes.append(annonce + " " + phrase(pour_l_oreille(element.group(2), lexique)))
            i += 1
            continue
        if ligne.startswith("- "):
            vider()
            paragraphes.append(phrase(pour_l_oreille(ligne[2:], lexique)))
            i += 1
            continue
        courant.append(ligne.strip())
        i += 1
    vider()
    # Un titre dont la section est vide (marque retirée, par exemple) ne se lit pas.
    gardes = []
    for rang, texte in enumerate(paragraphes):
        niveau = niveaux.get(rang)
        suivant = niveaux.get(rang + 1, 0) if rang + 1 < len(paragraphes) else 1
        if niveau and suivant and suivant <= niveau:
            print(f"titre sans contenu non lu : {texte}")
            continue
        gardes.append(texte)
    return gardes


# ---------- Contrôle ----------

PERMIS = re.compile(r"[A-Za-zÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸàâäçéèêëîïôöùûüÿŒœÆæ’' ,.;:!?«»\-…\n]")


def controler(nom, texte):
    defauts = []
    for n, ligne in enumerate(texte.splitlines(), 1):
        for c in sorted(set(ligne)):
            if not PERMIS.fullmatch(c):
                defauts.append(f"{nom}:{n}: caractère « {c} »")
        for sigle in re.findall(r"\b[A-ZÀ-Ý]{2,}\b", ligne):
            defauts.append(f"{nom}:{n}: sigle « {sigle} »")
    if "\n\n\n" in texte:
        defauts.append(f"{nom}: deux lignes vides de suite")
    return defauts


def main():
    lexique = lire_lexique()
    SCRIPTS.mkdir(parents=True, exist_ok=True)
    fichiers = sorted(MANUSCRIT.glob("*-corrige.md"))
    if len(fichiers) != 16:
        sys.exit(f"{len(fichiers)} fichiers *-corrige.md trouvés au lieu de 16 : vérifier le manuscrit.")
    total_mots, defauts = 0, []
    for source in fichiers:
        texte = source.read_text(encoding="utf-8")
        for m in MARQUE.finditer(re.sub(r"<!--.*?-->", "", texte, flags=re.S)):
            print(f"marque retirée : {source.name} : {m.group(0).strip()}")
        texte = MARQUE.sub("", texte)
        chapitre = TITRE_DE_CHAPITRE.match(source.name)
        numero = int(chapitre.group(2)) if chapitre else 0
        nom = re.sub(r"-ch\d\d", "", source.name.replace("-corrige.md", ".txt"))
        paragraphes = partie_en_paragraphes(texte, numero, lexique)
        fin = f"Fin du chapitre {en_lettres(numero)}." if numero else f"Fin de la partie : {paragraphes[0].rstrip('.')}."
        script = "\n\n".join([*paragraphes, fin]) + "\n"
        (SCRIPTS / nom).write_text(script, encoding="utf-8")
        mots = len(re.findall(r"[\w’'-]+", script))
        total_mots += mots
        defauts += controler(nom, script)
        print(f"{nom} : {mots} mots, environ {round(mots / MOTS_PAR_MINUTE)} min")
    heures, minutes = divmod(round(total_mots / MOTS_PAR_MINUTE), 60)
    print(f"Total : {total_mots} mots, environ {heures} h {minutes:02d} à {MOTS_PAR_MINUTE} mots par minute")
    print("\n".join(defauts) if defauts else "Contrôle : aucun chiffre, sigle ni caractère spécial.")
    return 1 if defauts else 0


if __name__ == "__main__":
    sys.exit(main())
