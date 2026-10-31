// Rend chaque planche HTML de illustrations/sources en PNG haute définition (×2).
const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path');
(async () => {
  const src = path.join(__dirname, 'sources');
  const fichiers = process.argv.slice(2).length ? process.argv.slice(2) : fs.readdirSync(src).filter((f) => f.endsWith('.html'));
  const nav = await chromium.launch();
  const page = await nav.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 2 });
  for (const f of fichiers) {
    await page.goto('file://' + path.join(src, f));
    await page.evaluate(() => document.fonts.ready);
    const corps = await page.$('.planche');
    const sortie = path.join(__dirname, f.replace('.html', '.png'));
    await corps.screenshot({ path: sortie });
    console.log('Écrit :', sortie);
  }
  await nav.close();
})();
