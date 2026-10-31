#!/usr/bin/env bash
# Construit un tome en deux passes (la seconde remplit les numéros de page du sommaire), puis le PDF.
# Usage : bash formation/outils/construire.sh 1
set -euo pipefail
cd "$(dirname "$0")/.."
T="$1"
TMP=$(mktemp -d)
node "tome$T/livre.js" "$TMP/pages.json" >/dev/null
NOM=$(ls livrables | grep "^FOR_LIFE_Tome${T}_.*\.docx$" | head -1)
soffice --headless --convert-to pdf --outdir livrables "livrables/$NOM" >/dev/null 2>&1
python3 - "livrables/${NOM%.docx}.pdf" "$TMP/pages.json" <<'PY'
import json, re, subprocess, sys
pdf, sortie = sys.argv[1], sys.argv[2]
texte = subprocess.run(['pdftotext', '-layout', pdf, '-'], capture_output=True, text=True).stdout
pages = {}
feuilles = texte.split('\f')
som = next((i for i, f in enumerate(feuilles, 1) if re.search(r'^\s*Sommaire\s*$', f, re.M)), 0)
motifs = {
    'preface': r'Préface :', 'mode': r'Comment utiliser ce livre',
    'test': r'Test de positionnement : par où', 'projet': r'PROJET FINAL',
    'annexeA': r'Annexe A\s+·\s+Corrigés', 'annexeB': r'Annexe B\s+·\s+Glossaire',
    'annexeC': r'Annexe C\s+·', 'annexeD': r'Annexe D\s+·\s+Pour aller',
}
for i, f in enumerate(feuilles, 1):
    for cle, motif in motifs.items():
        if cle not in pages and re.search(motif, f) and (cle == 'preface' or i > som):
            pages[cle] = i
    for n in re.findall(r'^\s*MODULE (\d+)\s*$', f, re.M):
        pages.setdefault(f'm{n}', i)
json.dump(pages, open(sortie, 'w'))
print('Repères trouvés :', len(pages))
PY
node "tome$T/livre.js" "$TMP/pages.json" >/dev/null
soffice --headless --convert-to pdf --outdir livrables "livrables/$NOM" >/dev/null 2>&1
echo "Pages : $(pdfinfo "livrables/${NOM%.docx}.pdf" | awk '/^Pages/{print $2}')  →  livrables/${NOM%.docx}.pdf"
rm -rf "$TMP"
