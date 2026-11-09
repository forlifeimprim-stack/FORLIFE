#!/usr/bin/env python3
"""Contrôle des citations bibliques d'un chapitre Markdown contre la Louis Segond 1910.

  python3 controle_versets.py manuscrit/03-chapitre.md [autres.md]
  python3 controle_versets.py --lexique charte/lexique.txt

Convention de balisage (détaillée dans charte/style.md, section « Balisage des citations pour le contrôle ») :
  - citation dans le texte : « texte cité » (Jérémie 1:5)
  - citation en bloc : lignes commençant par « > », la dernière ligne du bloc étant « > (Jérémie 20:9) »
  - coupure : […] ou [...]
Les références seules entre parenthèses, sans citation, sont vérifiées aussi (existence du passage).

Relevé : CONFORME, ÉCART (détail mot à mot) ou RÉFÉRENCE INTROUVABLE. Code de sortie 1 s'il reste
un écart ou une référence introuvable.
"""
import difflib
import re
import sys
import unicodedata
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from verset import NOMS_FR, charger, numero_livre, texte_verset  # noqa: E402

LIVRES = charger("lsg")

REF_MOTIF = re.compile(r"^\s*(?P<livre>(?:[1-3]\s)?[^\W\d][\w\s'’-]*?)\s+(?P<chap>\d+)"
                       r"(?::(?P<debut>\d+)(?:-(?P<fin>\d+))?)?\s*$")
COUPURE = re.compile(r"\[\s*(?:\.\.\.|…)\s*\]")
JETON = re.compile(r"\w+(?:-\w+)*'?|\.\.\.|[^\w\s]")
# Noms divins : leur capitale n'est jamais négociable, même en tête de vers.
NOMS_DIVINS = {"dieu", "seigneur", "eternel", "esprit", "tres-haut", "tout-puissant", "saint"}
# Marques d'incise de la source (« -c'était ... -») que le livre rend par des parenthèses.
INCISES = {"-", "(", ")"}
# En dessous de cette ressemblance, le détail mot à mot n'a plus de sens : le texte vient d'ailleurs.
SEUIL_RESSEMBLANCE = 0.5
FINS_DE_PHRASE = {".", "!", "?", ":", "...", None}
CAPITALES = str.maketrans("ÉÈÊËÀÂÔÎÏÇÙÛ", "EEEEAAOIICUU")
LIGATURES_ATTENDUES = re.compile(
    r"\b(?:[cC]oeurs?|[sS]oeurs?|[oO]euvres?|[bB]oeufs?|[oO]eil|[vV]oeux?|[oO]eufs?|[cC]hoeurs?|"
    r"[mM]anoeuvres?|[mM]oeurs)\b")


def normaliser(texte):
    """Ramène citation et source à une forme commune : seule la typographie autorisée par style.md disparaît."""
    texte = unicodedata.normalize("NFC", texte)
    texte = re.sub(r"[’ʼ`]", "'", texte)
    texte = texte.replace("œ", "oe").replace("Œ", "Oe").replace("æ", "ae").replace("Æ", "Ae")
    texte = texte.replace("…", "...").translate(CAPITALES)
    texte = re.sub(r"[«»“”\"]", " ", texte)
    return re.sub(r"\\\s*$", "", texte, flags=re.M)


def jetons(texte):
    """Mots et ponctuation ; les marques d'incise et la virgule qui les touche sont ignorées
    (« mois, -c'était » de la source devient « mois (c’était » dans le livre)."""
    bruts = JETON.findall(normaliser(texte))
    gardes = []
    for i, j in enumerate(bruts):
        if j in INCISES:
            continue
        voisin_incise = (i > 0 and bruts[i - 1] in INCISES) or (i + 1 < len(bruts) and bruts[i + 1] in INCISES)
        if j == "," and voisin_incise:
            continue
        gardes.append(j)
    return gardes


def est_mot(jeton):
    return jeton[0].isalnum()


# Mots que la LSG écrit aussi en minuscule : une capitale en milieu de phrase y marque un début de vers.
MINUSCULES_LSG = {j.lower() for livre in LIVRES.values() for c in livre["chapters"] for v in c["verses"]
                  for j in jetons(texte_verset(v["text"])) if est_mot(j) and j[0].islower()}


def casse_libre(jeton, precedent):
    """Vrai si la capitale de ce mot de la LSG est une capitale de vers, que le livre peut abaisser."""
    cle = jeton.lower().rstrip("'")
    return (jeton[0].isupper() and precedent not in FINS_DE_PHRASE
            and cle in MINUSCULES_LSG and cle not in NOMS_DIVINS)


def lire_reference(texte):
    """Renvoie (titre, versets) ou lève ValueError avec la raison."""
    m = REF_MOTIF.match(texte.replace(" ", " ").replace(" ", " "))
    if not m:
        raise ValueError(f"forme illisible « {texte} »")
    try:
        numero = numero_livre(m["livre"].strip(), LIVRES)
    except SystemExit:
        raise ValueError(f"livre inconnu « {m['livre'].strip()} »")
    chapitre = int(m["chap"])
    chapitres = {c["chapter"]: c for c in LIVRES[numero]["chapters"]}
    titre = NOMS_FR[numero - 1]
    if chapitre not in chapitres:
        raise ValueError(f"le chapitre {chapitre} n'existe pas dans {titre}")
    versets = chapitres[chapitre]["verses"]
    if m["debut"]:
        debut, fin = int(m["debut"]), int(m["fin"] or m["debut"])
        dernier = versets[-1]["number"]
        if fin > dernier or debut > fin:
            raise ValueError(f"{titre} {chapitre} s'arrête au verset {dernier}")
        versets = [v for v in versets if debut <= v["number"] <= fin]
    return titre, versets


def ressemble_a_reference(texte):
    """« Jérémie 1:5 » ou « Jérémie 36 », mais pas « chapitre 3 » ni « vers 627 av. J.-C. »."""
    m = REF_MOTIF.match(texte)
    if not m:
        return False
    if m["debut"]:
        return True
    try:
        numero_livre(m["livre"].strip(), LIVRES)
    except SystemExit:
        return False
    return True


def passage_lsg(versets):
    """Jetons de la LSG avec, pour chacun, la tolérance de casse."""
    sortie, precedent = [], None
    for v in versets:
        for j in jetons(texte_verset(v["text"])):
            sortie.append((j, est_mot(j) and casse_libre(j, precedent)))
            precedent = j
    return sortie


def rogner(segment):
    """Une citation peut commencer ou finir au milieu d'une phrase : la ponctuation des bords ne compte pas."""
    debut, fin = 0, len(segment)
    while debut < fin and not est_mot(segment[debut]):
        debut += 1
    while fin > debut and not est_mot(segment[fin - 1]):
        fin -= 1
    return segment[debut:fin]


def cle(jeton):
    return jeton.lower()


def meilleure_fenetre(segment, source, depart):
    """Cherche dans la source la zone la plus proche du segment, pour expliquer l'écart mot à mot.

    Les bornes candidates sont les endroits où la source reprend l'un des premiers ou des derniers mots
    de la citation : une omission de plusieurs mots au milieu reste ainsi lisible comme une omission."""
    cles_seg = [cle(j) for j in segment]
    cles_src = [cle(j) for j, _ in source]
    tete, queue = set(cles_seg[:3]), set(cles_seg[-3:])
    debuts = [k for k in range(depart, len(source)) if cles_src[k] in tete] or list(range(depart, len(source)))
    fins = [k + 1 for k in range(depart, len(source)) if cles_src[k] in queue] or list(range(depart + 1, len(source) + 1))
    meilleur = (-1.0, 0.0, depart, min(len(source), depart + len(segment)))
    for debut in debuts:
        for fin in fins:
            if fin <= debut or fin - debut > 2 * len(segment) + 5:
                continue
            comparaison = difflib.SequenceMatcher(None, cles_seg, cles_src[debut:fin], autojunk=False)
            communs = sum(b.size for b in comparaison.get_matching_blocks())
            # Chaque mot de source non retrouvé coûte un peu : on préfère la zone la plus serrée.
            score = communs - 0.3 * (fin - debut - communs)
            if score > meilleur[0]:
                meilleur = (score, comparaison.ratio(), debut, fin)
    return meilleur[1:]


def situer(segment, verset_cite):
    """Cherche le segment, à la casse près, dans le livre cité puis dans toute la Bible, pour proposer la bonne référence."""
    cles_seg = [cle(j) for j in segment]
    livre_cite = next(n for n, livre in LIVRES.items() for c in livre["chapters"] if verset_cite in c["verses"])
    for numero in [livre_cite] + [n for n in LIVRES if n != livre_cite]:
        for c in LIVRES[numero]["chapters"]:
            for v in c["verses"]:
                cles_v = [cle(j) for j in jetons(texte_verset(v["text"]))]
                for i in range(len(cles_v) - len(cles_seg) + 1):
                    if cles_v[i:i + len(cles_seg)] == cles_seg:
                        return f"{NOMS_FR[numero - 1]} {c['chapter']}:{v['number']}"
    return None


def comparer(citation, versets, en_bloc):
    """Renvoie (écarts, remarques typographiques)."""
    source = passage_lsg(versets)
    ecarts, remarques = [], []
    curseur = 0
    for segment_brut in COUPURE.split(citation):
        segment = rogner(jetons(segment_brut))
        if not segment:
            continue
        ratio, debut, fin = meilleure_fenetre(segment, source, curseur)
        if ratio < SEUIL_RESSEMBLANCE:
            ailleurs = situer(segment, versets[0])
            piste = f" ; ce texte se trouve en {ailleurs}" if ailleurs else ""
            ecarts.append(f"texte absent du passage cité : « {' '.join(segment)} »{piste}")
            continue
        fenetre = source[debut:fin]
        operations = difflib.SequenceMatcher(None, [cle(j) for j in segment], [cle(j) for j, _ in fenetre],
                                             autojunk=False).get_opcodes()
        for code, i1, i2, k1, k2 in operations:
            cite = " ".join(segment[i1:i2])
            lsg = " ".join(j for j, _ in fenetre[k1:k2])
            avant = " ".join(segment[max(0, i1 - 4):i1])
            contexte = f" (après « {avant} »)" if avant else " (en tête de segment)"
            if code == "replace":
                ecarts.append(f"remplacé : LSG « {lsg} », citation « {cite} »{contexte}")
            elif code == "delete":
                ecarts.append(f"ajouté : « {cite} » absent de la LSG{contexte}")
            elif code == "insert":
                ecarts.append(f"omis sans [...] : LSG « {lsg} »{contexte}")
            else:
                for n, (mot, (mot_lsg, libre)) in enumerate(zip(segment[i1:i2], fenetre[k1:k2])):
                    tete = i1 + n == 0
                    if libre and mot[0].isupper() and not en_bloc and not tete:
                        remarques.append(f"capitale de vers à abaisser dans le texte courant : « {mot} »")
                    if mot == mot_lsg:
                        continue
                    nom_divin = mot_lsg.lower().rstrip("'") in NOMS_DIVINS
                    if (libre or tete) and not nom_divin:
                        continue
                    ecarts.append(f"casse : LSG « {mot_lsg} », citation « {mot} »")
        curseur = fin
    remarques.extend(remarques_typographiques(citation))
    return ecarts, remarques


def remarques_typographiques(citation):
    remarques = []
    if "'" in citation:
        remarques.append("apostrophe droite à remplacer par ’")
    if re.search(r"\bEternel", citation):
        remarques.append("« Eternel » à accentuer : Éternel")
    for mot in sorted(set(LIGATURES_ATTENDUES.findall(citation))):
        remarques.append(f"ligature à rétablir : « {mot} »")
    if "[...]" in citation:
        remarques.append("coupure à écrire […] (un seul caractère de points de suspension)")
    if re.search(r"\w[:;!?]", citation):
        remarques.append("espace manquante avant : ; ! ?")
    return remarques


def citations(texte):
    """Repère les citations en bloc, les citations dans le texte et les références seules, avec leur ligne."""
    lignes = texte.split("\n")
    trouvees, hors_bloc = [], list(lignes)
    i = 0
    while i < len(lignes):
        if not lignes[i].lstrip().startswith(">"):
            i += 1
            continue
        debut = i
        contenu = []
        while i < len(lignes) and lignes[i].lstrip().startswith(">"):
            contenu.append(re.sub(r"^\s*>\s?", "", lignes[i]))
            hors_bloc[i] = ""
            i += 1
        utiles = [ligne for ligne in contenu if ligne.strip()]
        derniere = utiles[-1].strip() if utiles else ""
        m = re.fullmatch(r"\((.+)\)", derniere)
        if m and ressemble_a_reference(m[1]):
            corps = "\n".join(contenu[:len(contenu) - contenu[::-1].index(utiles[-1]) - 1])
            trouvees.append(("bloc", debut + 1, m[1], corps))
        else:
            trouvees.append(("bloc sans référence", debut + 1, None, "\n".join(contenu)))
    reste = "\n".join(hors_bloc)
    occupees = []
    for m in re.finditer(r"«([^«»]+)»\s*\(([^()]+)\)", reste):
        if ressemble_a_reference(m[2]):
            trouvees.append(("texte", reste.count("\n", 0, m.start()) + 1, m[2].strip(), m[1]))
            occupees.append(m.span(2))
    for m in RENVOI.finditer(reste):
        if any(a <= m.start() < b for a, b in occupees):
            continue
        for ref in references_seules(m[0]):
            trouvees.append(("référence seule", reste.count("\n", 0, m.start()) + 1, ref, None))
    return sorted(trouvees, key=lambda t: t[1])


# Renvoi dans le texte courant : nom exact d'un livre, puis chapitre, versets, suites « , 9 » ou « ; 20:9 ».
NUMERO = r"\d+(?::\d+(?:-\d+)?)?"
RENVOI = re.compile(r"(?<![\w-])(?:" + "|".join(re.escape(n).replace(r"\ ", r"[ \u00a0\u202f]")
                                               for n in sorted(NOMS_FR, key=len, reverse=True))
                    + r")[ \u00a0\u202f]+" + NUMERO + r"(?:\s*[,;]\s*" + NUMERO + r"(?![\w]))*")


def references_seules(renvoi):
    """« Jérémie 1:5, 9 ; 20:9 » donne Jérémie 1:5, Jérémie 1:9, Jérémie 20:9."""
    tete = re.match(r"(.+?)[ \u00a0\u202f]+(\d+(?::\d+(?:-\d+)?)?)", renvoi)
    livre, premier = tete[1], tete[2]
    refs = [f"{livre} {premier}"]
    chapitre = premier.split(":")[0] if ":" in premier else None
    for separateur, numero in re.findall(r"\s*([,;])\s*(" + NUMERO + ")", renvoi[tete.end():]):
        if ":" in numero:
            chapitre = numero.split(":")[0]
            refs.append(f"{livre} {numero}")
        elif separateur == "," and chapitre:
            refs.append(f"{livre} {chapitre}:{numero}")
        else:
            chapitre = None
            refs.append(f"{livre} {numero}")
    return refs


def controler(chemin):
    texte = Path(chemin).read_text(encoding="utf-8")
    print(f"Relevé de contrôle des versets : {chemin}")
    print("Référence : Louis Segond 1910 (sources/lsg1910/lsg.json), normalisation de charte/style.md\n")
    bilan = {"CONFORME": 0, "ÉCART": 0, "RÉFÉRENCE INTROUVABLE": 0, "NON CONTRÔLÉ": 0}
    references_valides = 0
    for genre, ligne, reference, citation in citations(texte):
        if genre == "bloc sans référence":
            print(f"ligne {ligne}  [bloc]  NON CONTRÔLÉ : bloc de citation sans ligne de référence finale")
            bilan["NON CONTRÔLÉ"] += 1
            continue
        try:
            _, versets = lire_reference(reference)
        except ValueError as raison:
            print(f"ligne {ligne}  {reference}  [{genre}]  RÉFÉRENCE INTROUVABLE : {raison}")
            bilan["RÉFÉRENCE INTROUVABLE"] += 1
            continue
        if citation is None:
            references_valides += 1
            continue
        ecarts, remarques = comparer(citation, versets, genre == "bloc")
        statut = "ÉCART" if ecarts else "CONFORME"
        bilan[statut] += 1
        print(f"ligne {ligne}  {reference}  [{genre}]  {statut}")
        for ecart in ecarts:
            print(f"    écart : {ecart}")
        for remarque in remarques:
            print(f"    typographie : {remarque}")
    print(f"\nBilan : {bilan['CONFORME']} conforme(s), {bilan['ÉCART']} écart(s), "
          f"{bilan['RÉFÉRENCE INTROUVABLE']} référence(s) introuvable(s), {bilan['NON CONTRÔLÉ']} bloc(s) "
          f"non contrôlé(s), {references_valides} référence(s) seule(s) valide(s)")
    return bilan["ÉCART"] + bilan["RÉFÉRENCE INTROUVABLE"]


def controler_lexique(chemin):
    """Chaque entrée doit figurer, mot entier et casse exacte, dans le verset qu'elle cite."""
    fautes = entrees = 0
    for numero, ligne in enumerate(Path(chemin).read_text(encoding="utf-8").splitlines(), start=1):
        if not ligne.strip() or ligne.startswith("#"):
            continue
        champs = [c.strip() for c in ligne.split("|")]
        entrees += 1
        if len(champs) != 5:
            print(f"ligne {numero} : cinq champs attendus, {len(champs)} trouvés")
            fautes += 1
            continue
        graphie_lsg, reference = champs[1], champs[3]
        try:
            _, versets = lire_reference(reference)
        except ValueError as raison:
            print(f"ligne {numero} : {graphie_lsg} : RÉFÉRENCE INTROUVABLE ({raison})")
            fautes += 1
            continue
        texte = " ".join(texte_verset(v["text"]) for v in versets)
        if not re.search(r"(?<![\w-])" + re.escape(graphie_lsg) + r"(?![\w-])", texte):
            print(f"ligne {numero} : « {graphie_lsg} » absent de {reference}")
            fautes += 1
    print(f"Lexique : {entrees} entrées, {entrees - fautes} vérifiées, {fautes} en défaut")
    return fautes


def main():
    args = sys.argv[1:]
    if not args:
        sys.exit(__doc__)
    if args[0] == "--lexique":
        sys.exit(1 if controler_lexique(args[1]) else 0)
    problemes = 0
    for chemin in args:
        problemes += controler(chemin)
    sys.exit(1 if problemes else 0)


if __name__ == "__main__":
    main()
