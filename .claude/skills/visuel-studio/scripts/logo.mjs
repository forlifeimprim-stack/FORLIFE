// Intègre le logo officiel Forlife (assets/logo/*.svg) dans une page, sans le redessiner.
//
// Dans le HTML :
//   <img data-forlife-logo="horizontal" style="height:60px">                 logo complet (texte blanc : fond sombre)
//   <img data-forlife-logo="horizontal" data-texte="#1A1A1A" style="height:60px">   texte du nom en charbon (fond clair)
//   <img data-forlife-logo="vertical" data-sans-slogan style="height:120px">  sans la phrase d'accroche (petites tailles)
//   <img data-forlife-logo="symbole" style="height:80px">                     le symbole seul
// Le SVG officiel est copié tel quel dans la page (classes renommées pour éviter les conflits), puis recadré au plus juste.

import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DOSSIER = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..', 'assets', 'logo');

export async function injecterLogos(page) {
  const n = await page.evaluate(() => document.querySelectorAll('[data-forlife-logo]').length);
  if (!n) return [];
  const svgs = {};
  for (const v of ['horizontal', 'vertical']) {
    const f = join(DOSSIER, `logo-${v}.svg`);
    if (existsSync(f)) svgs[v] = readFileSync(f, 'utf8').replace(/<\?xml[^>]*\?>/, '');
  }
  if (!Object.keys(svgs).length) return [`logo officiel introuvable (${DOSSIER}) : ${n} logo(s) non intégré(s)`];
  return page.evaluate(svgs => {
    const alertes = [];
    let i = 0;
    for (const el of [...document.querySelectorAll('[data-forlife-logo]')]) {
      const type = el.getAttribute('data-forlife-logo');
      const src = svgs[type === 'symbole' ? 'horizontal' : type];
      if (!src) { alertes.push(`logo « ${type} » inconnu`); continue; }
      const p = `lgf${i++}-`;
      const tmp = document.createElement('div');
      tmp.innerHTML = src.replace(/cls-/g, p + 'cls-').replace(/id="Calque_1"/, '');
      const svg = tmp.querySelector('svg');
      svg.setAttribute('class', el.getAttribute('class') || '');
      svg.setAttribute('style', (el.getAttribute('style') || '') + ';display:inline-block;overflow:visible;width:auto');
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', 'Forlife Com\'');
      el.replaceWith(svg);
      const textes = [...svg.querySelectorAll('text')];
      const blanc = t => /^(#fff(fff)?|rgb\(255, 255, 255\))$/i.test(getComputedStyle(t).fill);
      const nom = textes.find(blanc), slogan = textes.find(t => !blanc(t));
      if (type === 'symbole') textes.forEach(t => t.remove());
      else {
        if (el.hasAttribute('data-sans-slogan') && slogan) slogan.remove();
        const c = el.getAttribute('data-texte');
        if (c && nom) nom.style.fill = c;
      }
      const b = svg.getBBox(), m = Math.max(b.width, b.height) * 0.02;
      svg.setAttribute('viewBox', `${b.x - m} ${b.y - m} ${b.width + 2 * m} ${b.height + 2 * m}`);
    }
    return alertes;
  }, svgs);
}
