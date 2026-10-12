/**
 * Dimensions d'une image lues dans son en-tête, sans la décoder (protection contre les « bombes de décompression »).
 * Formats : PNG, JPEG, WebP. Retourne null si l'en-tête est illisible.
 */
export function imageSize(buf: Buffer, mime: string): { width: number; height: number } | null {
  try {
    if (mime === "image/png") {
      if (buf.length < 24 || buf.toString("latin1", 12, 16) !== "IHDR") return null;
      return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    }
    if (mime === "image/jpeg") {
      let i = 2;
      while (i + 9 < buf.length) {
        if (buf[i] !== 0xff) return null;
        const marker = buf[i + 1]!;
        if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
          i += 2;
          continue;
        }
        const len = buf.readUInt16BE(i + 2);
        // SOF0..SOF15 sauf DHT (C4), JPG (C8) et DAC (CC)
        if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
          return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
        }
        i += 2 + len;
      }
      return null;
    }
    if (mime === "image/webp") {
      const chunk = buf.toString("latin1", 12, 16);
      if (chunk === "VP8 ") return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
      if (chunk === "VP8L") {
        const b = buf.readUInt32LE(21);
        return { width: (b & 0x3fff) + 1, height: ((b >> 14) & 0x3fff) + 1 };
      }
      if (chunk === "VP8X") return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) };
      return null;
    }
  } catch {
    return null;
  }
  return null;
}

export const MAX_IMAGE_SIDE = 8000;
export const MAX_IMAGE_PIXELS = 40_000_000;

/** Vrai si l'image peut être décodée sans risque (dimensions connues et raisonnables). */
export function isSafeImage(buf: Buffer, mime: string): boolean {
  const s = imageSize(buf, mime);
  return !!s && s.width > 0 && s.height > 0 && s.width <= MAX_IMAGE_SIDE && s.height <= MAX_IMAGE_SIDE && s.width * s.height <= MAX_IMAGE_PIXELS;
}
