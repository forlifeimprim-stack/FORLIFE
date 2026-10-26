#!/usr/bin/env bash
# Génère les versions PDF (format poche 11 x 17,8 cm) et Word du livre.
set -euo pipefail
cd "$(dirname "$0")"
SRC=avant-que-l-horloge-ne-s-arrete.md
# Espaces insécables de la typographie française (? ! : ; « »)
python3 typo.py "$SRC" livre.tmp.md
pandoc livre.tmp.md -s --section-divs --css poche.css --embed-resources -o livre.html
pandoc livre.tmp.md -o avant-que-l-horloge-ne-s-arrete.docx
node -e "
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('file://' + process.cwd() + '/livre.html');
  await p.pdf({ path: 'avant-que-l-horloge-ne-s-arrete.pdf', preferCSSPageSize: true, displayHeaderFooter: false });
  await b.close();
})();"
rm livre.html livre.tmp.md
