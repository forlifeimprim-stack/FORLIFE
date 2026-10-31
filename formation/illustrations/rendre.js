// Rend les planches en PNG. Usage : node illustrations/rendre.js [nom…]
// - les planches décrites en JavaScript (planches_*.js) ;
// - les planches HTML historiques de sources/ (cuisine, bureau_windows).
const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path');
const { page: gabarit } = require('./kit');

(async () => {
  const planches = {};
  for (const f of fs.readdirSync(__dirname).filter((x) => /^planches_.*\.js$/.test(x))) Object.assign(planches, require(path.join(__dirname, f)));
  const voulues = process.argv.slice(2);
  const nav = await chromium.launch();
  const page = await nav.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1.6 });
  for (const [nom, html] of Object.entries(planches)) {
    if (voulues.length && !voulues.includes(nom)) continue;
    const tmp = path.join(__dirname, '.rendu.html');
    fs.writeFileSync(tmp, gabarit(html));
    await page.goto('file://' + tmp, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await (await page.$('.planche')).screenshot({ path: path.join(__dirname, nom + '.png') });
    console.log('Écrit :', nom);
  }
  for (const f of fs.readdirSync(path.join(__dirname, 'sources')).filter((x) => x.endsWith('.html'))) {
    const nom = f.replace('.html', '');
    if (voulues.length && !voulues.includes(nom)) continue;
    await page.goto('file://' + path.join(__dirname, 'sources', f));
    await page.evaluate(() => document.fonts.ready);
    await (await page.$('.planche')).screenshot({ path: path.join(__dirname, nom + '.png') });
    console.log('Écrit :', nom);
  }
  await nav.close();
})();
