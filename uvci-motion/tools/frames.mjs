// Usage : node frames.mjs index.html outdir t1 t2 ...  → PNG d'images clés
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW || 'playwright');
import path from 'path';
const [,, file, out, ...ts] = process.argv;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on('console', m => console.log('console:', m.text()));
p.on('pageerror', e => console.log('ERR', e.message));
await p.goto('file://' + path.resolve(file) + '?render');
await p.evaluate(() => window.__ready);
for (const t of ts) {
  await p.evaluate(t => window.__render(+t), t);
  await p.locator('#c').screenshot({ path: `${out}/f_${t}.png` });
}
await b.close();
