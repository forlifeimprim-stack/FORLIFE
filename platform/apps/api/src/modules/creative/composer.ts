import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import { CREATIVE_FORMATS, type CreativeFormat, type CreativeLayout } from "@forlife/shared";

/**
 * Moteur de design Forlife Com.
 * Le texte final est composé par le moteur (et non dessiné par un modèle d'image) :
 * orthographe exacte, accents corrects, prix et mentions repris à l'identique (§9 « safe text rendering »).
 */

export interface Palette {
  bg: string;
  fg: string;
  accent: string;
  muted: string;
}

export interface Image {
  mime: string;
  data: Buffer;
}

export interface CompositionSpec {
  format: CreativeFormat;
  layout: CreativeLayout;
  palette: Palette;
  headline: string;
  subline?: string | null;
  cta?: string | null;
  offer?: string | null;
  brandName: string;
}

export interface CompositionAssets {
  photo?: Image | null;
  logo?: Image | null;
}

const FONT_DIR = join(dirname(fileURLToPath(import.meta.url)), "../../../assets/fonts");
let fontFiles: string[] | undefined;
const fonts = () => (fontFiles ??= ["Poppins_400Regular.ttf", "Poppins_600SemiBold.ttf", "Poppins_700Bold.ttf", "Poppins_800ExtraBold.ttf"].map((f) => join(FONT_DIR, f)));

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]!);
const dataUri = (img: Image) => `data:${img.mime};base64,${img.data.toString("base64")}`;

/** Largeur moyenne d'un caractère Poppins par rapport à la taille (approximation prudente). */
const CHAR = { 400: 0.55, 600: 0.58, 700: 0.6, 800: 0.62 } as const;

/** Découpe en lignes en réduisant la taille jusqu'à tenir dans la zone (maxLines). */
export function fitText(text: string, maxWidth: number, startSize: number, maxLines: number, weight: keyof typeof CHAR = 800, minSize = 28) {
  // Seuls les espaces ordinaires sont des points de coupe (les insécables restent soudés).
  const words = text.trim().split(/[ \t\n]+/);
  for (let size = startSize; size >= minSize; size -= 4) {
    const perLine = Math.floor(maxWidth / (size * CHAR[weight]));
    const lines: string[] = [];
    let cur = "";
    let overflow = false;
    for (const w of words) {
      if (w.length > perLine) overflow = true;
      const next = cur ? `${cur} ${w}` : w;
      if (next.length <= perLine) cur = next;
      else {
        lines.push(cur);
        cur = w;
      }
    }
    if (cur) lines.push(cur);
    if (!overflow && lines.length <= maxLines) return { lines, size };
  }
  // Dernier recours : taille minimale, texte tronqué proprement.
  const perLine = Math.floor(maxWidth / (minSize * CHAR[weight]));
  const flat = text.length > perLine * maxLines ? `${text.slice(0, perLine * maxLines - 1)}…` : text;
  const lines: string[] = [];
  for (let i = 0; i < flat.length; i += perLine) lines.push(flat.slice(i, i + perLine));
  return { lines: lines.slice(0, maxLines), size: minSize };
}

function textBlock(lines: string[], x: number, y: number, size: number, weight: number, fill: string, anchor: "start" | "middle" = "start", lh = 1.12) {
  return lines.map((l, i) => `<text x="${x}" y="${y + i * size * lh}" font-family="Poppins" font-weight="${weight}" font-size="${size}" fill="${fill}" text-anchor="${anchor}">${esc(l)}</text>`).join("");
}

function ctaPill(label: string, x: number, y: number, size: number, bg: string, fg: string, anchor: "start" | "middle" = "start") {
  // Largeur généreuse : mieux vaut un bouton un peu large qu'un texte qui déborde.
  const w = Math.round(label.length * size * 0.66 + size * 2.2);
  const h = Math.round(size * 2.1);
  const left = anchor === "middle" ? x - w / 2 : x;
  return `<rect x="${left}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${bg}"/><text x="${left + w / 2}" y="${y + h * 0.66}" font-family="Poppins" font-weight="700" font-size="${size}" fill="${fg}" text-anchor="middle">${esc(label)}</text>`;
}

function logoMark(x: number, y: number, size: number, color: string) {
  // Repère graphique de marque par défaut (quand aucun logo n'est importé).
  const s = size / 190;
  return `<g transform="translate(${x} ${y}) scale(${s}) translate(-25 -50)" fill="${color}"><circle cx="59.24" cy="209.06" r="25.45"/><path d="m59.23,55.5h112.07c9.44,0,17.09,7.65,17.09,17.09h0c0,16.06-13.02,29.08-29.08,29.08H47.23c-9.44,0-17.09-7.64-17.1-17.08h0c0-16.06,13.02-29.08,29.08-29.08Z"/><path d="m56.23,121.44h62.72c7.29,0,13.2,5.91,13.2,13.2v8.65c0,12.41-10.06,22.47-22.47,22.47h-62.69c-7.29,0-13.2-5.91-13.2-13.2v-8.65c0-12.4,10.04-22.45,22.44-22.47Z"/></g>`;
}

function brandHeader(spec: CompositionSpec, assets: CompositionAssets, W: number, pad: number, color: string) {
  const h = Math.round(W * 0.06);
  const logo = assets.logo
    ? `<image href="${dataUri(assets.logo)}" x="${pad}" y="${pad}" width="${h * 2.6}" height="${h}" preserveAspectRatio="xMinYMid meet"/>`
    : `${logoMark(pad, pad, h, color)}<text x="${pad + h * 1.1}" y="${pad + h * 0.72}" font-family="Poppins" font-weight="700" font-size="${Math.round(h * 0.55)}" fill="${color}">${esc(spec.brandName)}</text>`;
  return logo;
}

function photoOrPattern(assets: CompositionAssets, x: number, y: number, w: number, h: number, p: Palette, id: string) {
  if (assets.photo) {
    return `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath><image href="${dataUri(assets.photo)}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id})"/>`;
  }
  // Sans photo : motif graphique aux couleurs de la marque.
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${p.accent}"/><circle cx="${x + w * 0.8}" cy="${y + h * 0.25}" r="${Math.min(w, h) * 0.45}" fill="${p.bg}" opacity="0.18"/><circle cx="${x + w * 0.15}" cy="${y + h * 0.85}" r="${Math.min(w, h) * 0.3}" fill="${p.fg}" opacity="0.12"/>`;
}

/**
 * Empile titre, sous-titre et bouton entre `top` et `bottom` sans chevauchement :
 * la taille est réduite progressivement ; en dernier recours le sous-titre est retiré.
 */
function stack(spec: CompositionSpec, p: Palette, o: { x: number; top: number; bottom: number; width: number; head: number; sub: number; cta: number; maxHead: number; headWeight?: 600 | 800; center?: boolean; lh?: number }) {
  const lh = o.lh ?? 1.1;
  const weight = o.headWeight ?? 800;
  for (const withSub of [true, false]) {
    for (let k = 1; k >= 0.55; k -= 0.05) {
      const head = fitText(spec.headline, o.width, Math.round(o.head * k), o.maxHead, weight, 26);
      const sub = withSub && spec.subline ? fitText(spec.subline, o.width, Math.round(o.sub * k), 2, 400, 18) : null;
      const ctaSize = Math.round(o.cta * Math.max(k, 0.75));
      const headH = head.lines.length * head.size * lh;
      const subH = sub ? sub.lines.length * sub.size * 1.35 + sub.size * 0.5 : 0;
      const ctaH = spec.cta ? ctaSize * 2.1 + ctaSize * 0.9 : 0;
      const total = headH + subH + ctaH;
      if (o.top + total > o.bottom && !(k <= 0.56 && !withSub)) continue;
      const startY = o.center ? Math.max(o.top, o.top + (o.bottom - o.top - total) / 2) : o.top;
      let y = startY + head.size * 0.85;
      let svg = textBlock(head.lines, o.x, y, head.size, weight, p.fg, "start", lh);
      y = startY + headH;
      if (sub) {
        svg += textBlock(sub.lines, o.x, y + sub.size * 1.1, sub.size, 400, p.muted, "start", 1.35);
        y += subH;
      }
      if (spec.cta) svg += ctaPill(spec.cta, o.x, y + ctaSize * 0.6, ctaSize, p.accent, p.bg);
      return { svg, head };
    }
  }
  throw new Error("unreachable");
}

/** Typographie française : nombre et unité ne sont jamais séparés (48 h, 15 000 FCFA, -15 %). */
export function frenchSpacing(t: string): string {
  return t.replace(/(\d) (?=\d{3}\b)/g, "$1\u00a0").replace(/(\d) ?(%|FCFA|F CFA|h|min|ans|jours?)(?=$|[\s.,;:!?)])/g, "$1\u00a0$2").replace(/ ([!?:;»])/g, "\u00a0$1").replace(/« /g, "«\u00a0");
}

export function composeSvg(input: CompositionSpec, assets: CompositionAssets = {}): { svg: string; width: number; height: number; metrics: { headlineLines: number; headlineSize: number; textOverPhoto: boolean } } {
  const spec: CompositionSpec = {
    ...input,
    headline: frenchSpacing(input.headline),
    subline: input.subline ? frenchSpacing(input.subline) : input.subline,
    cta: input.cta ? frenchSpacing(input.cta) : input.cta,
    offer: input.offer ? frenchSpacing(input.offer) : input.offer,
  };
  const { width: W, height: H } = CREATIVE_FORMATS[spec.format];
  const p = spec.palette;
  const pad = Math.round(Math.min(W, H) * 0.07);
  const headerH = Math.round(W * 0.06);
  const portrait = H > W * 1.1;
  const landscape = W > H * 1.3;
  let body = "";
  let textOverPhoto = false;
  let head = { lines: [] as string[], size: 0 };

  switch (spec.layout) {
    case "PRODUCT_HERO": {
      const imgW = landscape ? Math.round(W * 0.5) : W;
      const imgH = landscape ? H : Math.round(H * 0.58);
      body += `<rect width="${W}" height="${H}" fill="${p.bg}"/>`;
      body += photoOrPattern(assets, landscape ? W - imgW : 0, 0, imgW, imgH, p, "ph");
      const x = pad;
      const r = landscape
        ? stack(spec, p, { x, top: pad + headerH + pad * 0.6, bottom: H - pad, width: W - imgW - pad * 2, head: W * 0.05, sub: W * 0.022, cta: W * 0.02, maxHead: 4 })
        : stack(spec, p, { x, top: imgH + pad * 0.8, bottom: H - pad * 0.8, width: W - pad * 2, head: W * 0.08, sub: W * 0.033, cta: W * 0.03, maxHead: 3 });
      body += r.svg;
      head = r.head;
      body += brandHeader(spec, assets, W, pad, landscape || !assets.photo ? (landscape ? p.fg : p.bg) : "#FFFFFF");
      break;
    }
    case "SPLIT": {
      const vertical = !landscape;
      const imgW = vertical ? W : Math.round(W * 0.5);
      const imgH = vertical ? Math.round(H * 0.46) : H;
      body += `<rect width="${W}" height="${H}" fill="${p.bg}"/>`;
      body += photoOrPattern(assets, vertical ? 0 : W - imgW, vertical ? H - imgH : 0, imgW, imgH, p, "sp");
      const top = pad + headerH + pad * 0.9;
      body += `<rect x="${pad}" y="${top - pad * 0.45}" width="${W * 0.08}" height="${Math.max(8, W * 0.008)}" fill="${p.accent}"/>`;
      const r = stack(spec, p, { x: pad, top, bottom: vertical ? H - imgH - pad * 0.6 : H - pad, width: vertical ? W - pad * 2 : W - imgW - pad * 2, head: W * (vertical ? 0.075 : 0.05), sub: W * (vertical ? 0.032 : 0.022), cta: W * (vertical ? 0.03 : 0.02), maxHead: 3 });
      body += r.svg;
      head = r.head;
      body += brandHeader(spec, assets, W, pad, p.fg);
      break;
    }
    case "OFFER_BADGE": {
      body += `<rect width="${W}" height="${H}" fill="${p.bg}"/>`;
      if (assets.photo) {
        body += `${photoOrPattern(assets, 0, 0, W, H, p, "ob")}<rect width="${W}" height="${H}" fill="${p.bg}" opacity="0.74"/>`;
        textOverPhoto = true;
      }
      const rad = Math.min(W, H) * (landscape ? 0.24 : 0.19);
      const cx = W - pad - rad;
      const cy = pad * 0.6 + rad;
      body += `<g transform="rotate(-10 ${cx} ${cy})"><circle cx="${cx}" cy="${cy}" r="${rad}" fill="${p.accent}"/>`;
      const offer = fitText(spec.offer || "Offre", rad * 1.55, Math.round(rad * 0.5), 2, 800, 18);
      body += textBlock(offer.lines, cx, cy - ((offer.lines.length - 1) * offer.size * 1.05) / 2 + offer.size * 0.35, offer.size, 800, p.bg, "middle", 1.05);
      body += `</g>`;
      const r = landscape
        ? stack(spec, p, { x: pad, top: pad + headerH + pad * 0.6, bottom: H - pad, width: W - rad * 2 - pad * 3, head: W * 0.05, sub: W * 0.022, cta: W * 0.02, maxHead: 3 })
        : stack(spec, p, { x: pad, top: cy + rad + pad * 0.4, bottom: H - pad, width: W - pad * 2, head: W * 0.085, sub: W * 0.033, cta: W * 0.03, maxHead: 3 });
      body += r.svg;
      head = r.head;
      body += brandHeader(spec, assets, W, pad, p.fg);
      break;
    }
    case "QUOTE": {
      body += `<rect width="${W}" height="${H}" fill="${p.bg}"/>`;
      const qSize = Math.round(Math.min(W, H) * 0.3);
      const qTop = pad + headerH + pad * 0.5;
      body += `<text x="${pad - qSize * 0.04}" y="${qTop + qSize * 0.72}" font-family="Poppins" font-weight="800" font-size="${qSize}" fill="${p.accent}">“</text>`;
      const quote: CompositionSpec = { ...spec, subline: spec.subline ? `— ${spec.subline}` : null };
      const r = stack(quote, p, { x: pad, top: qTop + qSize * 0.6, bottom: H - pad, width: W - pad * 2, head: W * (landscape ? 0.045 : 0.064), sub: W * (landscape ? 0.022 : 0.03), cta: W * (landscape ? 0.02 : 0.028), maxHead: landscape ? 3 : 6, headWeight: 600, center: portrait, lh: 1.25 });
      body += r.svg;
      head = r.head;
      body += brandHeader(spec, assets, W, pad, p.fg);
      break;
    }
    default: {
      // BOLD : titre impactant, formes inspirées du logo
      body += `<rect width="${W}" height="${H}" fill="${p.bg}"/>`;
      if (assets.photo) {
        body += `${photoOrPattern(assets, 0, 0, W, H, p, "bd")}<rect width="${W}" height="${H}" fill="${p.bg}" opacity="0.78"/>`;
        textOverPhoto = true;
      }
      body += `<rect x="${W * 0.62}" y="${-H * 0.05}" width="${W * 0.55}" height="${Math.min(W, H) * 0.16}" rx="${Math.min(W, H) * 0.08}" fill="${p.accent}" transform="rotate(-18 ${W * 0.9} ${H * 0.05})"/>`;
      body += `<circle cx="${W * 0.92}" cy="${H * 0.94}" r="${Math.min(W, H) * 0.11}" fill="${p.accent}" opacity="0.9"/>`;
      const r = stack(spec, p, { x: pad, top: pad + headerH + pad, bottom: H - pad - Math.min(W, H) * 0.08, width: W - pad * 2.6, head: Math.min(W, H) * (landscape ? 0.085 : 0.105), sub: W * (landscape ? 0.024 : 0.035), cta: W * (landscape ? 0.022 : 0.032), maxHead: portrait ? 5 : 4, center: true, lh: 1.06 });
      body += r.svg;
      head = r.head;
      body += brandHeader(spec, assets, W, pad, p.fg);
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${body}</svg>`;
  return { svg, width: W, height: H, metrics: { headlineLines: head.lines.length, headlineSize: head.size, textOverPhoto } };
}

export function renderPng(svg: string): Buffer {
  const r = new Resvg(svg, { font: { fontFiles: fonts(), loadSystemFonts: false, defaultFontFamily: "Poppins" }, fitTo: { mode: "original" } });
  return r.render().asPng();
}

// ───── Couleurs ─────

const hexToRgb = (hex: string) => {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as [number, number, number];
};
const lum = (hex: string) => {
  const [r, g, b] = hexToRgb(hex).map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
/** Ratio de contraste WCAG entre deux couleurs. */
export function contrast(a: string, b: string): number {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x) as [number, number];
  return (l1 + 0.05) / (l2 + 0.05);
}

/** Palettes dérivées de la couleur de marque : sombre, claire, et « couleur pleine ». */
export function palettes(brandHex = "#EA7822"): Record<"dark" | "light" | "accent", Palette> {
  const accent = /^#[0-9a-fA-F]{6}$/.test(brandHex) ? brandHex : "#EA7822";
  const onAccent = contrast(accent, "#111111") >= contrast(accent, "#FFFFFF") ? "#111111" : "#FFFFFF";
  return {
    dark: { bg: "#0D0D0D", fg: "#FFFFFF", accent, muted: "#C9C1B9" },
    light: { bg: "#F9F6F2", fg: "#141414", accent: contrast(accent, "#F9F6F2") >= 3 ? accent : "#C75F12", muted: "#5F5750" },
    accent: { bg: accent, fg: onAccent, accent: onAccent === "#111111" ? "#111111" : "#FFFFFF", muted: onAccent === "#111111" ? "#2A1A0E" : "#FFF3E8" },
  };
}
