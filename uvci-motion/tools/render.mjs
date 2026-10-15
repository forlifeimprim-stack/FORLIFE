// Usage : node render.mjs index.html bande-son.mp3 sortie.mp4 [fps]
// Rend chaque image du canvas (déterministe) et l'envoie à ffmpeg.
import { createRequire } from 'module';
import { spawn } from 'child_process';
import path from 'path';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW || 'playwright');
const [,, file, audio, out, fpsArg] = process.argv;
const FPS = +(fpsArg || 30), DUR = 50.5, N = Math.round(DUR * FPS);
const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
  '-i', audio, '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p',
  '-movflags', '+faststart', '-c:a', 'aac', '-b:a', '192k', '-shortest', out], { stdio: ['pipe', 'inherit', 'inherit'] });
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on('pageerror', e => console.log('ERR', e.message));
await p.goto('file://' + path.resolve(file) + '?render');
await p.evaluate(() => window.__ready);
for (let i = 0; i < N; i++) {
  const d = await p.evaluate(t => { window.__render(t); return document.getElementById('c').toDataURL('image/jpeg', 0.95); }, i / FPS);
  const buf = Buffer.from(d.slice(d.indexOf(',') + 1), 'base64');
  if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  if (i % 150 === 0) console.log(`${i}/${N}`);
}
ff.stdin.end();
await new Promise(r => ff.on('close', r));
await b.close();
console.log('ok', out);
