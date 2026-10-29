import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, extname, resolve, sep } from "node:path";
import { loadConfig } from "../../config.js";

/** Interface de stockage objet : disque local (dev) ou Google Cloud Storage (production). */
export interface ObjectStorage {
  put(key: string, data: Buffer, mime: string): Promise<void>;
  get(key: string): Promise<Buffer>;
  remove(key: string): Promise<void>;
}

class LocalStorage implements ObjectStorage {
  private root: string;
  constructor(dir: string) {
    this.root = resolve(dir);
  }
  private path(key: string): string {
    const p = resolve(this.root, key);
    if (!p.startsWith(this.root + sep)) throw new Error("Clé de stockage invalide");
    return p;
  }
  async put(key: string, data: Buffer): Promise<void> {
    const p = this.path(key);
    await mkdir(dirname(p), { recursive: true });
    await writeFile(p, data);
  }
  get(key: string): Promise<Buffer> {
    return readFile(this.path(key));
  }
  async remove(key: string): Promise<void> {
    await rm(this.path(key), { force: true });
  }
}

/** Google Cloud Storage (production sur Cloud Run) : bucket privé, accès par le compte de service. */
class GcsStorage implements ObjectStorage {
  private bucket: Promise<import("@google-cloud/storage").Bucket>;
  constructor(name: string) {
    this.bucket = import("@google-cloud/storage").then(({ Storage }) => new Storage().bucket(name));
  }
  private static check(key: string) {
    if (!key || key.includes("..") || key.startsWith("/")) throw new Error("Clé de stockage invalide");
    return key;
  }
  async put(key: string, data: Buffer, mime: string): Promise<void> {
    await (await this.bucket).file(GcsStorage.check(key)).save(data, { contentType: mime, resumable: false });
  }
  async get(key: string): Promise<Buffer> {
    const [buf] = await (await this.bucket).file(GcsStorage.check(key)).download();
    return buf;
  }
  async remove(key: string): Promise<void> {
    await (await this.bucket).file(GcsStorage.check(key)).delete({ ignoreNotFound: true });
  }
}

let storage: ObjectStorage | undefined;
export function getStorage(): ObjectStorage {
  if (!storage) {
    const cfg = loadConfig();
    if (cfg.STORAGE_DRIVER === "gcs") {
      if (!cfg.GCS_BUCKET) throw new Error("GCS_BUCKET est requis avec STORAGE_DRIVER=gcs");
      storage = new GcsStorage(cfg.GCS_BUCKET);
    } else storage = new LocalStorage(cfg.STORAGE_LOCAL_DIR);
  }
  return storage;
}

/** Types autorisés + vérification de la signature binaire (le MIME déclaré par le client n'est pas fiable). */
const SIGNATURES: Record<string, (b: Buffer) => boolean> = {
  "image/png": (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  "image/jpeg": (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  "image/webp": (b) => b.subarray(0, 4).toString("latin1") === "RIFF" && b.subarray(8, 12).toString("latin1") === "WEBP",
  "application/pdf": (b) => b.subarray(0, 5).toString("latin1") === "%PDF-",
  "image/svg+xml": (b) => {
    const s = b.subarray(0, 200_000).toString("utf8");
    return /<svg[\s>]/i.test(s) && !/<script|on[a-z]+\s*=|javascript:|<foreignObject/i.test(s);
  },
  "text/plain": (b) => !b.subarray(0, 8000).includes(0),
};

export const ALLOWED_MIME = Object.keys(SIGNATURES);

export function validateUpload(mime: string, data: Buffer): boolean {
  const check = SIGNATURES[mime];
  return !!check && data.length > 0 && check(data);
}

export function safeExtension(fileName: string): string {
  const ext = extname(fileName).toLowerCase();
  return /^\.[a-z0-9]{1,5}$/.test(ext) ? ext : "";
}
