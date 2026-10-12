import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import { loadConfig } from "../../config.js";
import { fitText, frenchSpacing, renderPng, type Image, type Palette } from "../creative/composer.js";

/**
 * Moteur vidéo Forlife Com : chaque image est composée en SVG (texte exact, marque, vraie photo),
 * rendue par resvg puis encodée en H.264 9:16 par FFmpeg avec une bande-son générée.
 */

export const W = 1080;
export const H = 1920;
export const FPS = 30;
export const END_CARD = 2.5;

export interface PlannedScene {
  start: number;
  end: number;
  overlay: string;
  caption: string;
  photo: Image | null;
  motion: "ZOOM_IN" | "ZOOM_OUT" | "PAN" | "POP";
}

export interface VideoPlan {
  scenes: PlannedScene[];
  total: number;
  palette: Palette;
  brandName: string;
  logo: Image | null;
  cta: string;
  offer: string | null;
}

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const eo = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const back = (x: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  const k = clamp(x);
  return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2);
};
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]!);
const uri = (img: Image) => `data:${img.mime};base64,${img.data.toString("base64")}`;

function lines(ls: string[], x: number, y: number, size: number, weight: number, fill: string, lh = 1.08, anchor = "middle") {
  return ls.map((l, i) => `<text x="${x}" y="${y + i * size * lh}" font-family="Poppins" font-weight="${weight}" font-size="${size}" fill="${fill}" text-anchor="${anchor}">${esc(l)}</text>`).join("");
}

function brandMark(x: number, y: number, size: number, color: string) {
  const s = size / 190;
  return `<g transform="translate(${x} ${y}) scale(${s}) translate(-25 -50)" fill="${color}"><circle cx="59.24" cy="209.06" r="25.45"/><path d="m59.23,55.5h112.07c9.44,0,17.09,7.65,17.09,17.09h0c0,16.06-13.02,29.08-29.08,29.08H47.23c-9.44,0-17.09-7.64-17.1-17.08h0c0-16.06,13.02-29.08,29.08-29.08Z"/><path d="m56.23,121.44h62.72c7.29,0,13.2,5.91,13.2,13.2v8.65c0,12.41-10.06,22.47-22.47,22.47h-62.69c-7.29,0-13.2-5.91-13.2-13.2v-8.65c0-12.4,10.04-22.45,22.44-22.47Z"/></g>`;
}

/** Pré-calculs coûteux faits une seule fois (photos en data URI, mises en page du texte). */
export function prepare(plan: VideoPlan) {
  return {
    ...plan,
    photoUris: plan.scenes.map((s) => (s.photo ? uri(s.photo) : null)),
    logoUri: plan.logo ? uri(plan.logo) : null,
    overlayFit: plan.scenes.map((s) => fitText(frenchSpacing(s.overlay), W - 160, 112, 3, 800, 56)),
    captionFit: plan.scenes.map((s) => fitText(frenchSpacing(s.caption), W - 200, 44, 2, 600, 30)),
    ctaFit: fitText(frenchSpacing(plan.cta), W - 260, 58, 2, 800, 36),
    offer: plan.offer ? frenchSpacing(plan.offer) : null,
  };
}
type Prepared = ReturnType<typeof prepare>;

export function frameSvg(p: Prepared, t: number): string {
  const pal = p.palette;
  let body = "";
  const endStart = p.total - END_CARD;
  if (t < endStart) {
    const i = Math.max(0, p.scenes.findIndex((s) => t >= s.start && t < s.end));
    const s = p.scenes[i]!;
    const dur = s.end - s.start;
    const local = t - s.start;
    const k = local / dur;
    // Fond : vraie photo en mouvement (Ken Burns) ou fond graphique animé aux couleurs de la marque
    const photo = p.photoUris[i];
    if (photo) {
      let sc = 1.08;
      let tx = 0;
      if (s.motion === "ZOOM_IN") sc = 1 + 0.14 * eo(k);
      else if (s.motion === "ZOOM_OUT") sc = 1.16 - 0.14 * eo(k);
      else if (s.motion === "PAN") {
        sc = 1.18;
        tx = -70 + 140 * k;
      } else sc = 1.22 - 0.16 * back(Math.min(1, local / 0.6));
      body += `<rect width="${W}" height="${H}" fill="#000"/><g transform="translate(${W / 2 + tx} ${H / 2}) scale(${sc}) translate(${-W / 2} ${-H / 2})"><image href="${photo}" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice"/></g>`;
    } else {
      body += `<rect width="${W}" height="${H}" fill="${pal.bg}"/>`;
      body += `<circle cx="${W * (0.75 - 0.2 * k)}" cy="${H * (0.3 + 0.1 * k)}" r="${W * (0.55 + 0.05 * Math.sin(t * 2))}" fill="${pal.accent}" opacity="0.9"/>`;
      body += `<circle cx="${W * 0.15}" cy="${H * (0.85 - 0.08 * k)}" r="${W * 0.28}" fill="${pal.accent}" opacity="0.35"/>`;
      body += `<rect x="${-W * 0.1 + 80 * k}" y="${H * 0.62}" width="${W * 0.7}" height="${W * 0.12}" rx="${W * 0.06}" fill="${pal.fg}" opacity="0.08"/>`;
    }
    // Voiles de lisibilité
    body += `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0.55"/><stop offset="0.3" stop-color="#000" stop-opacity="0.15"/><stop offset="0.55" stop-color="#000" stop-opacity="0.2"/><stop offset="1" stop-color="#000" stop-opacity="0.82"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#g)"/>`;
    // Texte à l'écran : apparition dynamique
    const ov = p.overlayFit[i]!;
    const appear = back(clamp((local - 0.1) / 0.45));
    const fade = 1 - clamp((local - (dur - 0.2)) / 0.2);
    const oy = H * 0.36 - ((ov.lines.length - 1) * ov.size * 1.08) / 2;
    body += `<g opacity="${clamp(appear * 1.5) * fade}" transform="translate(${W / 2} ${oy}) scale(${0.82 + 0.18 * appear}) translate(${-W / 2} ${-oy})">`;
    body += lines(ov.lines, W / 2 + 4, oy + 4, ov.size, 800, "#000", 1.08);
    body += lines(ov.lines, W / 2, oy, ov.size, 800, "#FFFFFF", 1.08);
    body += `<rect x="${W / 2 - 90}" y="${oy + ov.lines.length * ov.size * 1.08 - ov.size * 0.55}" width="180" height="14" rx="7" fill="${pal.accent}"/></g>`;
    // Sous-titres (narration)
    const cap = p.captionFit[i]!;
    const capH = cap.lines.length * cap.size * 1.3 + 44;
    const capY = H - 300 - capH;
    const capO = clamp((local - 0.2) / 0.25) * fade;
    body += `<g opacity="${capO}"><rect x="70" y="${capY}" width="${W - 140}" height="${capH}" rx="26" fill="#000" opacity="0.62"/>`;
    body += lines(cap.lines, W / 2, capY + 22 + cap.size * 0.95, cap.size, 600, "#FFFFFF", 1.3);
    body += `</g>`;
    // Flash de transition au début de chaque scène (sauf la première)
    if (i > 0 && local < 0.14) body += `<rect width="${W}" height="${H}" fill="#FFFFFF" opacity="${0.55 * (1 - local / 0.14)}"/>`;
    // En-tête de marque
    body += p.logoUri
      ? `<image href="${p.logoUri}" x="70" y="110" width="220" height="80" preserveAspectRatio="xMinYMid meet"/>`
      : `${brandMark(70, 110, 72, "#FFFFFF")}<text x="160" y="164" font-family="Poppins" font-weight="700" font-size="40" fill="#FFFFFF">${esc(p.brandName)}</text>`;
  } else {
    // Carte finale : marque + offre + appel à l'action
    const local = t - endStart;
    const k = back(clamp(local / 0.6));
    body += `<rect width="${W}" height="${H}" fill="${pal.bg}"/>`;
    body += `<circle cx="${W / 2}" cy="${H * 0.36}" r="${W * 0.62 * (0.6 + 0.4 * eo(local / 0.8))}" fill="${pal.accent}" opacity="0.16"/>`;
    const markY = H * 0.24;
    body += p.logoUri
      ? `<g opacity="${clamp(local / 0.3)}"><image href="${p.logoUri}" x="${W / 2 - 260}" y="${markY - 40}" width="520" height="200" preserveAspectRatio="xMidYMid meet"/></g>`
      : `<g opacity="${clamp(local / 0.3)}" transform="translate(${W / 2} ${markY + 90}) scale(${k}) translate(${-W / 2} ${-(markY + 90)})">${brandMark(W / 2 - 90, markY, 180, pal.accent)}</g>`;
    body += `<text x="${W / 2}" y="${H * 0.43}" font-family="Poppins" font-weight="800" font-size="84" fill="${pal.fg}" text-anchor="middle" opacity="${clamp((local - 0.15) / 0.35)}">${esc(p.brandName)}</text>`;
    if (p.offer) {
      const oy = H * 0.52;
      body += `<g opacity="${clamp((local - 0.35) / 0.3)}"><rect x="${W / 2 - 300}" y="${oy}" width="600" height="130" rx="65" fill="none" stroke="${pal.accent}" stroke-width="6" stroke-dasharray="18 12"/>`;
      body += `<text x="${W / 2}" y="${oy + 88}" font-family="Poppins" font-weight="800" font-size="64" fill="${pal.accent}" text-anchor="middle">${esc(p.offer)}</text></g>`;
    }
    const cy = H * (p.offer ? 0.66 : 0.56);
    const cta = p.ctaFit;
    const ch = cta.lines.length * cta.size * 1.15 + 70;
    const pulse = 1 + 0.035 * Math.sin(Math.max(0, local - 0.8) * 7);
    body += `<g opacity="${clamp((local - 0.5) / 0.3)}" transform="translate(${W / 2} ${cy + ch / 2}) scale(${pulse}) translate(${-W / 2} ${-(cy + ch / 2)})"><rect x="110" y="${cy}" width="${W - 220}" height="${ch}" rx="${Math.min(ch / 2, 70)}" fill="${pal.accent}"/>`;
    body += lines(cta.lines, W / 2, cy + 35 + cta.size * 0.9, cta.size, 800, pal.bg, 1.15);
    body += `</g>`;
  }
  // Barre de progression
  body += `<rect x="0" y="0" width="${W * clamp(t / p.total)}" height="10" fill="${pal.accent}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${body}</svg>`;
}

/** Bande-son originale générée (pulsation douce + nappe), libre de droits. */
function musicFilter(total: number) {
  const expr = [
    "0.32*sin(2*PI*52*t)*exp(-mod(t,0.5)*13)",
    "0.05*(random(0)*2-1)*exp(-mod(t+0.25,0.5)*45)",
    "0.045*sin(2*PI*220*t)*(0.7+0.3*sin(2*PI*0.25*t))",
    "0.035*sin(2*PI*261.63*t)",
    "0.035*sin(2*PI*329.63*t)",
  ].join("+");
  return `aevalsrc='${expr}':s=44100:d=${total.toFixed(2)},lowpass=f=4000,afade=t=in:d=0.3,afade=t=out:st=${Math.max(0, total - 1).toFixed(2)}:d=1,volume=0.9`;
}

export function srt(plan: VideoPlan): string {
  const ts = (x: number) => {
    const ms = Math.round(x * 1000);
    const h = Math.floor(ms / 3_600_000);
    const m = Math.floor((ms % 3_600_000) / 60_000);
    const s = Math.floor((ms % 60_000) / 1000);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(ms % 1000).padStart(3, "0")}`;
  };
  return plan.scenes.map((s, i) => `${i + 1}\n${ts(s.start)} --> ${ts(s.end)}\n${s.caption}\n`).join("\n");
}

/**
 * Recadre une photo une seule fois au format 9:16 (avec marge pour les mouvements de caméra)
 * et la recompresse en JPEG : évite de décoder une image de plusieurs mégapixels à chaque image.
 */
export function normalizePhoto(img: Image): Promise<Image> {
  const tw = Math.round(W * 1.25);
  const th = Math.round(H * 1.25);
  return ffmpegImage(img, [`scale=${tw}:${th}:force_original_aspect_ratio=increase,crop=${tw}:${th}`], ["-q:v", "3", "-c:v", "mjpeg"], "image/jpeg");
}

/** Logo réduit une seule fois (PNG, transparence conservée) : il n'est plus décodé en pleine taille à chaque image. */
export function normalizeLogo(img: Image): Promise<Image> {
  return ffmpegImage(img, ["scale=600:300:force_original_aspect_ratio=decrease"], ["-c:v", "png"], "image/png");
}

async function ffmpegImage(img: Image, filters: string[], codec: string[], mime: string): Promise<Image> {
  const ff = spawn(loadConfig().FFMPEG_PATH, ["-loglevel", "error", "-i", "pipe:0", "-vf", filters.join(","), "-frames:v", "1", ...codec, "-f", "image2", "pipe:1"], { stdio: ["pipe", "pipe", "ignore"] });
  const chunks: Buffer[] = [];
  ff.stdout.on("data", (d: Buffer) => chunks.push(d));
  // En cas d'échec (FFmpeg absent…), l'image d'origine est conservée : le rendu principal signalera l'erreur.
  const done = new Promise<number>((resolve) => {
    ff.on("error", () => resolve(-1));
    ff.on("close", resolve);
  });
  ff.stdin.on("error", () => undefined);
  ff.stdin.end(img.data);
  const code = await done;
  if (code !== 0 || !chunks.length) return img;
  return { mime, data: Buffer.concat(chunks) };
}

/** Rendu complet en MP4 (H.264 + AAC, 1080×1920, 30 i/s). */
export async function renderVideo(input: VideoPlan, onProgress?: (pct: number) => void): Promise<Buffer> {
  const cache = new Map<Buffer, Image>();
  const scenes = [];
  for (const s of input.scenes) {
    if (s.photo && !cache.has(s.photo.data)) cache.set(s.photo.data, await normalizePhoto(s.photo));
    scenes.push({ ...s, photo: s.photo ? cache.get(s.photo.data)! : null });
  }
  const plan = { ...input, scenes, logo: input.logo ? await normalizeLogo(input.logo) : null };
  const prepared = prepare(plan);
  const dir = await mkdtemp(join(tmpdir(), "forlife-video-"));
  const out = join(dir, "video.mp4");
  try {
    const ff = spawn(loadConfig().FFMPEG_PATH, [
      "-y", "-loglevel", "error",
      // Pixels bruts RGBA : pas de compression PNG intermédiaire.
      "-f", "rawvideo", "-pix_fmt", "rgba", "-s", `${W}x${H}`, "-framerate", String(FPS), "-i", "-",
      "-f", "lavfi", "-i", musicFilter(plan.total),
      "-map", "0:v", "-map", "1:a",
      "-c:v", "libx264", "-preset", "veryfast", "-crf", "21", "-pix_fmt", "yuv420p", "-r", String(FPS),
      "-c:a", "aac", "-b:a", "128k", "-shortest", "-movflags", "+faststart", out,
    ], { stdio: ["pipe", "ignore", "pipe"] });
    let stderr = "";
    ff.stderr.on("data", (d) => (stderr += String(d)));
    const done = new Promise<void>((resolve, reject) => {
      ff.on("error", (e) => reject(new Error((e as NodeJS.ErrnoException).code === "ENOENT" ? "FFmpeg n'est pas installé sur le serveur de rendu" : e.message)));
      ff.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`Encodage vidéo en échec : ${stderr.slice(0, 300)}`))));
    });
    // Un échec de lancement (ffmpeg absent) ou d'encodage interrompt immédiatement l'envoi des images.
    let failure: unknown = null;
    done.catch((e) => (failure = e));
    ff.stdin.on("error", () => undefined);
    const frames = Math.round(plan.total * FPS);
    const resvgOpts = { font: { fontFiles: fontFilesForVideo(), loadSystemFonts: false, defaultFontFamily: "Poppins" } };
    for (let f = 0; f < frames; f++) {
      if (failure) throw failure;
      const pixels = new Resvg(frameSvg(prepared, f / FPS), resvgOpts).render().pixels;
      if (!ff.stdin.write(pixels)) await Promise.race([new Promise((r) => ff.stdin.once("drain", r)), done]);
      if (onProgress && f % 30 === 0) onProgress(Math.round((f / frames) * 100));
    }
    ff.stdin.end();
    await done;
    return await readFile(out);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

/** Vignette (première image utile) pour les listes. */
export function posterPng(plan: VideoPlan): Buffer {
  return renderPng(frameSvg(prepare(plan), Math.min(1.2, plan.total / 3)));
}

const FONT_DIR = join(dirname(fileURLToPath(import.meta.url)), "../../../assets/fonts");
const fontFilesForVideo = () => ["Poppins_400Regular.ttf", "Poppins_600SemiBold.ttf", "Poppins_700Bold.ttf", "Poppins_800ExtraBold.ttf"].map((f) => join(FONT_DIR, f));
