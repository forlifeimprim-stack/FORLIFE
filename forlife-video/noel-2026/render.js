// Rendu image par image (Playwright) → ffmpeg.
// node render.js probe 1 2.5 4 …        → out/probe.jpg (planche)
// node render.js part <t0> <t1> <fichier.mp4> [fps]
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const { spawn, execFileSync } = require('child_process');
const http = require('http'), fs = require('fs'), path = require('path');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
const srv = http.createServer((q, r) => {
  const f = path.join(__dirname, decodeURIComponent(q.url.split('?')[0]));
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); r.end(d); } });
});
(async () => {
  await new Promise(r => srv.listen(0, r));
  const url = `http://127.0.0.1:${srv.address().port}/noel.html?render`;
  const br = await chromium.launch({ args: ['--font-render-hinting=none', '--force-color-profile=srgb', '--disable-threaded-animation'] });
  const pg = await br.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  pg.on('pageerror', e => console.error('PAGE', e.message));
  await pg.goto(url); await pg.waitForFunction('window.ready===true');
  const shot = async t => { await pg.evaluate(async t => { await window.seek(t); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); }, t); return pg.screenshot({ type: 'jpeg', quality: 96 }); };
  const [mode, ...a] = process.argv.slice(2);
  fs.mkdirSync(path.join(__dirname, 'out/probe'), { recursive: true });
  if (mode === 'probe') {
    const fl = [];
    for (const [i, s] of a.entries()) { const f = path.join(__dirname, `out/probe/p${String(i).padStart(2, '0')}.jpg`); fs.writeFileSync(f, await shot(+s)); fl.push(f); }
    const cols = Math.min(6, fl.length), rows = Math.ceil(fl.length / cols);
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '1', '-i', path.join(__dirname, 'out/probe/p%02d.jpg'), '-frames:v', '1', '-vf', `scale=${process.env.PW || 324}:-1,tile=${cols}x${rows}`, '-q:v', '3', path.join(__dirname, 'out/probe.jpg')]);
    fl.forEach(f => fs.unlinkSync(f));
  } else {
    const t0 = +a[0], t1 = +a[1], fps = +(a[3] || 60), n = Math.round((t1 - t0) * fps);
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
      '-vf', 'scale=in_range=pc:out_range=tv:out_color_matrix=bt709,format=yuv420p', '-color_range', 'tv', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
      '-c:v', 'libx264', '-crf', '15', '-preset', 'medium', a[2]], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let i = 0; i < n; i++) { const b = await shot(t0 + i / fps); if (!ff.stdin.write(b)) await new Promise(r => ff.stdin.once('drain', r)); }
    ff.stdin.end(); await new Promise(r => ff.on('close', r)); console.log('ok', a[2], n);
  }
  await br.close(); srv.close();
})();
