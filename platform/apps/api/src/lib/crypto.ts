import { createCipheriv, createDecipheriv, createHash, hkdfSync, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number, opts: object) => Promise<Buffer>;
// Paramètres équivalents au minimum OWASP (N=2^14, r=8, p=5) : 16 Mo de mémoire par calcul,
// compatible avec de nombreuses connexions simultanées sur une instance Cloud Run.
const SCRYPT = { N: 16384, r: 8, p: 5, maxmem: 64 * 1024 * 1024 };

/** Hash de mot de passe scrypt (format : scrypt$N$r$p$salt$hash). */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64, SCRYPT);
  return ["scrypt", SCRYPT.N, SCRYPT.r, SCRYPT.p, salt.toString("base64"), hash.toString("base64")].join("$");
}

/** Vrai si le hash a été produit avec des paramètres plus faibles que les paramètres courants. */
export function needsRehash(stored: string): boolean {
  const [, N, r, p] = stored.split("$");
  return Number(N) !== SCRYPT.N || Number(r) !== SCRYPT.r || Number(p) !== SCRYPT.p;
}

let dummy: Promise<string> | undefined;
/** Hash factice aux paramètres courants : même durée de vérification pour un email inconnu. */
export function dummyPasswordHash(): Promise<string> {
  dummy ??= hashPassword(randomBytes(16).toString("hex"));
  return dummy;
}

/** Clé dérivée et indépendante pour un usage donné (séparation des domaines HMAC). */
export function deriveKey(secret: string, purpose: string): Buffer {
  return Buffer.from(hkdfSync("sha256", secret, "forlife-com", purpose, 32));
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algo, N, r, p, salt, hash] = stored.split("$");
  if (algo !== "scrypt" || !salt || !hash) return false;
  // Refuse des paramètres hors bornes (hash corrompu ou forgé) avant de lancer le calcul.
  if (!(Number(N) >= 1024 && Number(N) <= 32768 && Number(r) >= 1 && Number(r) <= 16 && Number(p) >= 1 && Number(p) <= 16)) return false;
  const expected = Buffer.from(hash, "base64");
  const actual = await scrypt(password, Buffer.from(salt, "base64"), expected.length, {
    N: Number(N),
    r: Number(r),
    p: Number(p),
    maxmem: SCRYPT.maxmem,
  });
  return timingSafeEqual(actual, expected);
}

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function sha256(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

/**
 * Chiffrement AES-256-GCM des secrets (tokens OAuth sociaux, clés fournisseurs).
 * Format : v1.<iv>.<tag>.<ciphertext> en base64url. Jamais de secret en clair en base.
 */
export function encryptSecret(plaintext: string, keyB64: string): string {
  const key = Buffer.from(keyB64, "base64");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return ["v1", iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), enc.toString("base64url")].join(".");
}

export function decryptSecret(payload: string, keyB64: string): string {
  const [v, iv, tag, data] = payload.split(".");
  if (v !== "v1" || !iv || !tag || !data) throw new Error("Format de secret chiffré inconnu");
  const decipher = createDecipheriv("aes-256-gcm", Buffer.from(keyB64, "base64"), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(data, "base64url")), decipher.final()]).toString("utf8");
}

export function slugify(input: string): string {
  return (
    input
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "espace"
  );
}
