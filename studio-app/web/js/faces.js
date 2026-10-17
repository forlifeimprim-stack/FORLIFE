// Reconnaissance faciale dans le navigateur (face-api, MIT). Le selfie du client
// n'est jamais envoyé : seule son empreinte (128 nombres) sert à la recherche.
import { FACE_API_URL, FACE_MODELS_URL, MATCH_DISTANCE, TF_WASM_URL } from "./config.js";

let ready = null;

export function loadFaceApi() {
  ready ??= (async () => {
    const faceapi = await import(FACE_API_URL);
    const tf = faceapi.tf;
    // WebGL (carte graphique) si possible, sinon WebAssembly, sinon processeur.
    if (TF_WASM_URL) tf.setWasmPaths?.(TF_WASM_URL);
    for (const backend of TF_WASM_URL ? ["webgl", "wasm", "cpu"] : ["webgl", "cpu"]) {
      try {
        if (await tf.setBackend(backend)) {
          await tf.ready();
          break;
        }
      } catch {
        /* moteur suivant */
      }
    }
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(FACE_MODELS_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(FACE_MODELS_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(FACE_MODELS_URL),
    ]);
    return faceapi;
  })().catch((err) => {
    ready = null;
    throw err;
  });
  return ready;
}

/** Visages d'une photo : [{box: {x, y, width, height}, descriptor: number[]}]. */
export async function analyse(source, { minConfidence = 0.5 } = {}) {
  const faceapi = await loadFaceApi();
  // SSD MobileNet : plus précis que le détecteur « tiny » sur les vrais portraits.
  const opts = new faceapi.SsdMobilenetv1Options({ minConfidence });
  const found = await faceapi.detectAllFaces(source, opts).withFaceLandmarks().withFaceDescriptors();
  return found
    .filter((f) => f.detection.box.width >= 28)
    .map((f) => {
      const b = f.detection.box;
      return {
        box: { x: b.x, y: b.y, width: b.width, height: b.height },
        score: Math.round(f.detection.score * 1000) / 1000,
        descriptor: Array.from(f.descriptor, (v) => Math.round(v * 1e5) / 1e5),
      };
    });
}

/** Empreinte du selfie : le plus grand visage, ou null. */
export async function selfieDescriptor(source) {
  const faces = await analyse(source, { minConfidence: 0.4 });
  if (!faces.length) return null;
  faces.sort((a, b) => b.box.width * b.box.height - a.box.width * a.box.height);
  return faces[0].descriptor;
}

export function distance(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    s += d * d;
  }
  return Math.sqrt(s);
}

/** Photos contenant la personne : au moins un visage sous le seuil de distance. */
export function matchPhotos(descriptor, photos, threshold = MATCH_DISTANCE) {
  const out = [];
  for (const p of photos) {
    let best = Infinity;
    for (const f of p.faces || []) best = Math.min(best, distance(descriptor, f.descriptor || f.d));
    if (best <= threshold) out.push({ ...p, distance: best });
  }
  return out.sort((a, b) => b.createdAt - a.createdAt);
}
