"""Ajoute les espaces insécables de la typographie française (? ! : ; « »)."""
import re
import sys

texte = open(sys.argv[1], encoding="utf-8").read()
texte = re.sub(r" ([?!:;»])", " \\1", texte)
texte = texte.replace("« ", "« ")
open(sys.argv[2], "w", encoding="utf-8").write(texte)
