#!/usr/bin/env bash
# Construit les deux PDF d'un tome : le manuel de l'apprenant et le manuel du formateur.
# Deux passes par édition : la seconde remplit les numéros de page du sommaire.
# Le Word n'est qu'un intermédiaire temporaire : seuls les PDF sont livrés.
# Usage : bash formation/outils/construire.sh 1   (ou 2, ou 3 ; plusieurs numéros possibles)
set -euo pipefail
cd "$(dirname "$0")/.."
declare -A NOMS=([1]="Apprivoiser_l_ordinateur" [2]="Maitriser_l_outil" [3]="Creer_avec_l_IA")
mkdir -p livrables
for T in "$@"; do
  for EDITION in apprenant formateur; do
    TMP=$(mktemp -d)
    SUFFIXE=$([ "$EDITION" = apprenant ] && echo "Apprenant" || echo "Formateur")
    BASE="FOR_LIFE_Tome${T}_${NOMS[$T]}_${SUFFIXE}"
    DOCX="$TMP/$BASE.docx"
    node "tome$T/livre.js" "$TMP/pages.json" "$EDITION" "$DOCX" >/dev/null
    soffice --headless --convert-to pdf --outdir "$TMP" "$DOCX" >/dev/null 2>&1
    python3 - "$TMP/$BASE.pdf" "$TMP/pages.json" <<'PY'
import json, re, subprocess, sys
pdf, sortie = sys.argv[1], sys.argv[2]
motifs = json.load(open(sortie + '.motifs.json'))
feuilles = subprocess.run(['pdftotext', '-layout', pdf, '-'], capture_output=True, text=True).stdout.split('\f')
som = next((i for i, f in enumerate(feuilles, 1) if re.search(r'^\s*Sommaire\s*$', f, re.M)), 0)
pages = {}
for i, f in enumerate(feuilles, 1):
    for cle, m in motifs.items():
        if cle not in pages and re.search(m['motif'], f, re.M) and (m['avant'] or i > som):
            pages[cle] = i
json.dump(pages, open(sortie, 'w'))
manquants = [c for c in motifs if c not in pages]
if manquants: print('Repères introuvables :', manquants)
PY
    node "tome$T/livre.js" "$TMP/pages.json" "$EDITION" "$DOCX" >/dev/null
    soffice --headless --convert-to pdf --outdir "$TMP" "$DOCX" >/dev/null 2>&1
    cp "$TMP/$BASE.pdf" "livrables/$BASE.pdf"
    echo "$(pdfinfo "livrables/$BASE.pdf" | awk '/^Pages/{print $2}') pages  →  livrables/$BASE.pdf"
    rm -rf "$TMP"
  done
done
