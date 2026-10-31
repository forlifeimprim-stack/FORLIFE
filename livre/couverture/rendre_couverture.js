// Rend couverture.html en PDF (format poche) et en PNG haute définition.
const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const dir = __dirname;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 416, height: 673 }, deviceScaleFactor: 3.6 });
  await page.goto('file://' + path.join(dir, 'couverture.html'));
  await page.evaluate(() => document.fonts.ready);
  const pages = await page.$$('section.page');
  await pages[0].screenshot({ path: path.join(dir, '1re-de-couverture.png') });
  await pages[1].screenshot({ path: path.join(dir, '4e-de-couverture.png') });
  await page.pdf({ path: path.join(dir, 'couverture.pdf'), preferCSSPageSize: true, printBackground: true });
  await browser.close();
})();
