// Retouche automatique dans le navigateur (même logique que la Station) :
// balance des blancs, exposition, ombres / hautes lumières, lissage de peau
// adaptatif, contraste, chaleur, saturation, vignettage, netteté.

export const PRESETS = {
  signature: { name: "Signature ForLife", description: "Peau douce et naturelle, tons légèrement chauds.", exposure: 0.46, contrast: 0.12, saturation: 0.06, warmth: 0.08, tint: 0, shadows: 0.2, highlights: 0.25, skin: 0.45, texture: 0.35, glow: 0, sharpen: 0.25, vignette: 0.08 },
  "peaux-ebene": { name: "Peaux mates et ébène", description: "Carnations foncées fidèles, ombres ouvertes.", exposure: 0.44, contrast: 0.08, saturation: 0.04, warmth: 0.05, tint: -0.02, shadows: 0.35, highlights: 0.2, skin: 0.4, texture: 0.4, glow: 0.1, sharpen: 0.25, vignette: 0.05 },
  corporate: { name: "Corporate / Badge", description: "Neutre et fidèle.", exposure: 0.48, contrast: 0.06, saturation: 0, warmth: 0, tint: 0, shadows: 0.15, highlights: 0.2, skin: 0.3, texture: 0.45, glow: 0, sharpen: 0.3, vignette: 0 },
  editorial: { name: "Mode / Éditorial", description: "Contraste marqué, couleurs riches.", exposure: 0.44, contrast: 0.25, saturation: 0.15, warmth: 0.03, tint: 0, shadows: 0.1, highlights: 0.3, skin: 0.4, texture: 0.35, glow: 0, sharpen: 0.35, vignette: 0.15 },
  exterieur: { name: "Extérieur", description: "Contre-jour corrigé, ciel préservé.", exposure: 0.47, contrast: 0.1, saturation: 0.1, warmth: 0.04, tint: 0, shadows: 0.4, highlights: 0.45, skin: 0.35, texture: 0.4, glow: 0, sharpen: 0.25, vignette: 0.05 },
  "noir-blanc": { name: "Noir & Blanc", description: "Noir et blanc contrasté.", exposure: 0.46, contrast: 0.22, saturation: -1, warmth: 0, tint: 0, shadows: 0.15, highlights: 0.25, skin: 0.35, texture: 0.4, glow: 0, sharpen: 0.3, vignette: 0.12 },
  rapide: { name: "Événement rapide", description: "Correction légère, priorité à la vitesse.", exposure: 0.46, contrast: 0.08, saturation: 0.05, warmth: 0.03, tint: 0, shadows: 0.2, highlights: 0.2, skin: 0, texture: 0.5, glow: 0, sharpen: 0.2, vignette: 0 },
};

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

function canvas(w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

export async function loadBitmap(file) {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      return img;
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

/** Dessine l'image réduite à `maxSide` et renvoie le canvas. */
export function drawScaled(bitmap, maxSide) {
  const w0 = bitmap.width, h0 = bitmap.height;
  const k = Math.min(1, maxSide / Math.max(w0, h0));
  const c = canvas(Math.round(w0 * k), Math.round(h0 * k));
  const ctx = c.getContext("2d", { willReadFrequently: true });
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, c.width, c.height);
  return c;
}

function stats(src) {
  // Mesures sur une miniature : gains de balance des blancs et gamma d'exposition.
  const s = drawScaled(src, 256);
  const d = s.getContext("2d").getImageData(0, 0, s.width, s.height).data;
  let r = 0, g = 0, b = 0, n = 0;
  const lum = [];
  for (let i = 0; i < d.length; i += 4) {
    const R = d[i] / 255, G = d[i + 1] / 255, B = d[i + 2] / 255;
    const y = 0.2126 * R + 0.7152 * G + 0.0722 * B;
    lum.push(y);
    const sat = Math.max(R, G, B) - Math.min(R, G, B);
    if (y > 0.15 && y < 0.85 && sat < 0.25) { r += R; g += G; b += B; n++; }
  }
  let gains = [1, 1, 1];
  if (n > 500) {
    const m = [r / n, g / n, b / n];
    const avg = (m[0] + m[1] + m[2]) / 3;
    gains = m.map((v) => 1 + (clamp(avg / Math.max(v, 1e-4), 0.85, 1.18) - 1) * 0.6);
  }
  lum.sort((a, b2) => a - b2);
  return { gains, median: clamp(lum[lum.length >> 1] || 0.5, 0.02, 0.98) };
}

function toneLuts(p, st) {
  const balancedMedian = clamp(st.median * ((st.gains[0] * 0.2126) + (st.gains[1] * 0.7152) + (st.gains[2] * 0.0722)), 0.02, 0.98);
  const gamma = p.exposure > 0 ? clamp(Math.log(p.exposure) / Math.log(balancedMedian), 0.55, 1.6) : 1;
  const warm = [1 + 0.08 * p.warmth, 1 - 0.06 * p.tint, 1 - 0.08 * p.warmth];
  return [0, 1, 2].map((c) => {
    const lut = new Uint8ClampedArray(256);
    for (let i = 0; i < 256; i++) {
      let v = Math.pow(clamp((i / 255) * st.gains[c], 0, 1), gamma);
      v = v + (v * v * (3 - 2 * v) - v) * p.contrast;
      lut[i] = Math.round(v * warm[c] * 255);
    }
    return lut;
  });
}

/** Carte de luminance floutée (pour ombres / hautes lumières), à la taille de l'image. */
function blurredLuminance(c) {
  const small = canvas(96, Math.max(1, Math.round((96 * c.height) / c.width)));
  const sctx = small.getContext("2d");
  sctx.filter = "blur(2px)";
  sctx.drawImage(c, 0, 0, small.width, small.height);
  const big = canvas(c.width, c.height);
  const bctx = big.getContext("2d", { willReadFrequently: true });
  bctx.imageSmoothingQuality = "high";
  bctx.drawImage(small, 0, 0, big.width, big.height);
  return bctx.getImageData(0, 0, big.width, big.height).data;
}

function smoothSkin(c, data, faces, p) {
  if (!p.skin || !faces?.length) return;
  const W = c.width, H = c.height;
  for (const f of faces) {
    const { x, y, width: fw, height: fh } = f;
    const x0 = Math.max(0, Math.floor(x - 0.35 * fw)), x1 = Math.min(W, Math.ceil(x + 1.35 * fw));
    const y0 = Math.max(0, Math.floor(y - 0.3 * fh)), y1 = Math.min(H, Math.ceil(y + 1.7 * fh));
    const rw = x1 - x0, rh = y1 - y0;
    if (rw < 8 || rh < 8) continue;
    // Couleur de référence : joues et nez (sous les yeux).
    const ref = [[], [], []];
    for (let yy = Math.floor(y + 0.45 * fh); yy < y + 0.8 * fh; yy += 2)
      for (let xx = Math.floor(x + 0.3 * fw); xx < x + 0.7 * fw; xx += 2) {
        if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
        const i = (yy * W + xx) * 4;
        ref[0].push(data[i]); ref[1].push(data[i + 1]); ref[2].push(data[i + 2]);
      }
    if (ref[0].length < 20) continue;
    const med = ref.map((a) => a.sort((m, n) => m - n)[a.length >> 1]);
    // Version floutée de la zone (basses fréquences).
    const radius = Math.max(1.5, fw / 55);
    const zone = canvas(rw, rh);
    const zctx = zone.getContext("2d", { willReadFrequently: true });
    zctx.filter = `blur(${radius}px)`;
    zctx.drawImage(c, x0, y0, rw, rh, 0, 0, rw, rh);
    const blur = zctx.getImageData(0, 0, rw, rh).data;
    const cx = x + fw / 2, cy = y + fh * 0.65, ax = fw * 0.75, ay = fh * 1.05;
    const amount = p.skin, keep = p.texture;
    for (let yy = y0; yy < y1; yy++) {
      for (let xx = x0; xx < x1; xx++) {
        const ex = (xx - cx) / ax, ey = (yy - cy) / ay;
        const e = ex * ex + ey * ey;
        if (e > 1) continue;
        const i = (yy * W + xx) * 4;
        const j = ((yy - y0) * rw + (xx - x0)) * 4;
        const dr = data[i] - med[0], dg = data[i + 1] - med[1], db = data[i + 2] - med[2];
        const dist = Math.sqrt(dr * dr + dg * dg + db * db) / 70; // proche de la teinte de peau
        let m = clamp(1.4 - dist, 0, 1) * clamp((1 - e) * 4, 0, 1);
        if (m <= 0) continue;
        for (let k = 0; k < 3; k++) {
          const o = data[i + k], b = blur[j + k];
          const diff = b - o;
          // Préserve les contours (yeux, lèvres) : peu de lissage si l'écart est fort.
          const edge = Math.exp(-((diff / 28) ** 2));
          let v = o + diff * m * amount * edge * (1 - keep * 0.5);
          if (p.glow) v += p.glow * 0.06 * (255 - v) * m;
          data[i + k] = v;
        }
      }
    }
  }
}

/**
 * Retouche une image. `faces` : boîtes {x, y, width, height} dans les coordonnées du canvas.
 * Renvoie le canvas retouché (modifié en place).
 */
export function render(c, p, faces = []) {
  const ctx = c.getContext("2d", { willReadFrequently: true });
  const img = ctx.getImageData(0, 0, c.width, c.height);
  const d = img.data;
  const st = stats(c);
  const [lr, lg, lb] = toneLuts(p, st);
  for (let i = 0; i < d.length; i += 4) {
    d[i] = lr[d[i]]; d[i + 1] = lg[d[i + 1]]; d[i + 2] = lb[d[i + 2]];
  }
  if (p.shadows || p.highlights || p.vignette) {
    ctx.putImageData(img, 0, 0);
    const base = blurredLuminance(c);
    const W = c.width, H = c.height;
    for (let yy = 0, i = 0; yy < H; yy++) {
      const vy = (yy - H / 2) / (H / 2);
      for (let xx = 0; xx < W; xx++, i += 4) {
        const bl = (0.2126 * base[i] + 0.7152 * base[i + 1] + 0.0722 * base[i + 2]) / 255;
        const lift = p.shadows * 0.35 * clamp(1 - bl / 0.5, 0, 1) ** 2;
        const pull = p.highlights * 0.3 * clamp((bl - 0.6) / 0.4, 0, 1) ** 2;
        const vx = (xx - W / 2) / (W / 2);
        const dist = Math.sqrt(vx * vx + vy * vy) / Math.SQRT2;
        const vig = 1 - p.vignette * 0.6 * clamp((dist - 0.45) / 0.55, 0, 1) ** 2;
        const gain = (1 - lift - pull) * vig, off = lift * vig * 255;
        d[i] = d[i] * gain + off; d[i + 1] = d[i + 1] * gain + off; d[i + 2] = d[i + 2] * gain + off;
      }
    }
  }
  smoothSkin(c, d, faces, p);
  if (p.saturation) {
    const s = p.saturation;
    for (let i = 0; i < d.length; i += 4) {
      const y = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
      d[i] = y + (d[i] - y) * (1 + s); d[i + 1] = y + (d[i + 1] - y) * (1 + s); d[i + 2] = y + (d[i + 2] - y) * (1 + s);
    }
  }
  ctx.putImageData(img, 0, 0);
  if (p.sharpen > 0) {
    // Masque flou : image + (image - flou) * quantité.
    const b = canvas(c.width, c.height);
    const bctx = b.getContext("2d", { willReadFrequently: true });
    bctx.filter = `blur(${Math.max(0.6, c.width / 2400)}px)`;
    bctx.drawImage(c, 0, 0);
    const bd = bctx.getImageData(0, 0, c.width, c.height).data;
    const out = ctx.getImageData(0, 0, c.width, c.height);
    const od = out.data, a = p.sharpen * 1.2;
    for (let i = 0; i < od.length; i += 4) {
      od[i] += (od[i] - bd[i]) * a; od[i + 1] += (od[i + 1] - bd[i + 1]) * a; od[i + 2] += (od[i + 2] - bd[i + 2]) * a;
    }
    ctx.putImageData(out, 0, 0);
  }
  return c;
}

export function toBlob(c, quality = 0.88) {
  return new Promise((resolve, reject) => c.toBlob((b) => (b ? resolve(b) : reject(new Error("Encodage JPEG impossible"))), "image/jpeg", quality));
}
