// Cloud Functions ForLife Studio : le client ne lit JAMAIS la base directement.
// - createGallery : reçoit l'empreinte du selfie (pas la photo), crée une galerie privée.
// - galleryPhotos : renvoie les photos de la galerie avec des URL signées (1 h).
// - purgeDaily    : supprime chaque nuit tout ce qui a plus de 30 jours.
import { initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { randomBytes } from "node:crypto";

initializeApp();
const db = getFirestore();
const bucket = getStorage().bucket();

const STUDIO = "forlife-studio";
const GALLERY_DAYS = 30;
const MATCH_DISTANCE = 0.5;
const DAY_MS = 86400000;
const REGION = "europe-west1";

const today = () => new Date().toISOString().slice(0, 10); // Abidjan = UTC+0

function distance(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    s += d * d;
  }
  return Math.sqrt(s);
}

function checkDescriptor(d) {
  if (!Array.isArray(d) || d.length !== 128 || !d.every((v) => typeof v === "number" && Number.isFinite(v))) {
    throw new HttpsError("invalid-argument", "Empreinte invalide");
  }
}

async function matchingPhotos(day, descriptor) {
  const snap = await db.collection(`studios/${STUDIO}/days/${day}/photos`).get();
  const out = [];
  for (const doc of snap.docs) {
    const p = doc.data();
    const best = Math.min(Infinity, ...(p.faces || []).map((f) => distance(descriptor, f.d)));
    if (best <= MATCH_DISTANCE) out.push({ id: doc.id, ...p });
  }
  return out.sort((a, b) => b.createdAt - a.createdAt);
}

// Limite simple : 10 recherches par adresse IP et par heure (anti-aspiration).
async function rateLimit(req) {
  const ip = (req.rawRequest.headers["x-forwarded-for"] || req.rawRequest.ip || "?").toString().split(",")[0].trim();
  const key = Buffer.from(ip).toString("base64url");
  const ref = db.doc(`rateLimits/${key}`);
  const hour = Math.floor(Date.now() / 3600000);
  await db.runTransaction(async (tx) => {
    const cur = (await tx.get(ref)).data();
    const n = cur?.hour === hour ? cur.n : 0;
    if (n >= 10) throw new HttpsError("resource-exhausted", "Trop de recherches, réessayez plus tard.");
    tx.set(ref, { hour, n: n + 1, expiresAt: Timestamp.fromMillis(Date.now() + 2 * 3600000) });
  });
}

export const createGallery = onCall({ region: REGION, enforceAppCheck: false }, async (req) => {
  const { descriptor, phone } = req.data || {};
  checkDescriptor(descriptor);
  await rateLimit(req);
  // Le QR du jour ne donne accès qu'au dossier du jour.
  const day = today();
  const id = randomBytes(16).toString("base64url");
  const expiresAt = Date.now() + GALLERY_DAYS * DAY_MS;
  await db.doc(`galleries/${id}`).set({
    studio: STUDIO,
    day,
    descriptor,
    phone: typeof phone === "string" ? phone.replace(/[^\d+]/g, "").slice(0, 20) : null,
    createdAt: Date.now(),
    expiresAt: Timestamp.fromMillis(expiresAt),
  });
  return { id, day, expiresAt };
});

export const galleryPhotos = onCall({ region: REGION }, async (req) => {
  const galleryId = String(req.data?.galleryId || "");
  if (!/^[\w-]{16,40}$/.test(galleryId)) throw new HttpsError("invalid-argument", "Lien invalide");
  const snap = await db.doc(`galleries/${galleryId}`).get();
  const g = snap.data();
  if (!g || g.expiresAt.toMillis() < Date.now()) return null;
  const photos = await matchingPhotos(g.day, g.descriptor);
  const expires = Date.now() + 3600000;
  const signed = await Promise.all(
    photos.map(async (p) => {
      const [[web], [thumb]] = await Promise.all([
        bucket.file(p.paths.web).getSignedUrl({ action: "read", expires, version: "v4" }),
        bucket.file(p.paths.thumb).getSignedUrl({ action: "read", expires, version: "v4" }),
      ]);
      return { id: p.id, day: g.day, createdAt: p.createdAt, web, thumb };
    }),
  );
  return { gallery: { id: galleryId, day: g.day, expiresAt: g.expiresAt.toMillis() }, photos: signed };
});

export const purgeDaily = onSchedule({ region: REGION, schedule: "15 3 * * *", timeZone: "Africa/Abidjan" }, async () => {
  const limitDay = new Date(Date.now() - GALLERY_DAYS * DAY_MS).toISOString().slice(0, 10);
  const days = await db.collection(`studios/${STUDIO}/days`).listDocuments();
  for (const dayRef of days) {
    if (dayRef.id >= limitDay) continue;
    await bucket.deleteFiles({ prefix: `studios/${STUDIO}/${dayRef.id}/` });
    await db.recursiveDelete(dayRef);
  }
  const old = await db.collection("galleries").where("expiresAt", "<", Timestamp.now()).get();
  for (const doc of old.docs) await doc.ref.delete();
});
