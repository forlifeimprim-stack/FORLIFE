#!/usr/bin/env python3
"""Passe les gris neutres RVB d'un PDF intérieur en DeviceGray, pour un texte imprimé sur la seule plaque noire.

  python3 noir_seul.py sortie/interieur.pdf sortie/interieur-noir.pdf

WeasyPrint écrit le noir « 0 0 0 rg » (RVB). Converti par le RIP de l'imprimeur, ce noir peut devenir un
noir à quatre couleurs, flou en petit corps. Les couleurs où rouge = vert = bleu deviennent la valeur de
gris équivalente (DeviceGray 0 = 100 % K). Une couleur non neutre est laissée telle quelle et signalée :
elle doit être corrigée à la source (CSS ou SVG). Les images ne sont pas touchées : elles se préparent en
niveaux de gris avant composition. Le fichier d'origine reste intact.
"""
import sys
from pathlib import Path

import pikepdf

OPERATEURS_RVB = {"rg": "g", "RG": "G"}


def convertir_flux(flux, couleurs_restantes):
    instructions = []
    modifie = False
    for operandes, operateur in pikepdf.parse_content_stream(flux):
        op = str(operateur)
        if op in OPERATEURS_RVB:
            rouge, vert, bleu = (float(v) for v in operandes)
            if rouge == vert == bleu:
                instructions.append(([operandes[0]], pikepdf.Operator(OPERATEURS_RVB[op])))
                modifie = True
                continue
            couleurs_restantes.add(f"{rouge:g} {vert:g} {bleu:g} {op}")
        instructions.append((operandes, operateur))
    if modifie:
        flux.write(pikepdf.unparse_content_stream(instructions))


def convertir_formulaires(ressources, couleurs_restantes, deja_vus):
    if ressources is None:
        return
    for objet in ressources.get("/XObject", {}).values():
        if objet.get("/Subtype") == "/Form" and objet.objgen not in deja_vus:
            deja_vus.add(objet.objgen)
            convertir_flux(objet, couleurs_restantes)
            convertir_formulaires(objet.get("/Resources"), couleurs_restantes, deja_vus)


def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    source, cible = Path(sys.argv[1]), Path(sys.argv[2])
    if source.resolve() == cible.resolve():
        sys.exit("Le fichier de sortie doit être différent du fichier d'origine.")
    couleurs_restantes, deja_vus = set(), set()
    with pikepdf.open(source) as pdf:
        for page in pdf.pages:
            page.contents_coalesce()
            convertir_flux(page.obj.Contents, couleurs_restantes)
            convertir_formulaires(page.obj.get("/Resources"), couleurs_restantes, deja_vus)
        pdf.save(cible)
    print(f"Écrit : {cible}")
    if couleurs_restantes:
        print("Couleurs non neutres laissées en RVB (à corriger à la source) : " + ", ".join(sorted(couleurs_restantes)))
        sys.exit(1)


if __name__ == "__main__":
    main()
