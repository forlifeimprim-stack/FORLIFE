// Stockage des photos et des galeries.
// - LocalStore : mode démonstration, tout reste dans ce navigateur (IndexedDB).
// - FirebaseStore : production (Firestore + Storage + Cloud Functions).
import { FIREBASE_CONFIG, STUDIO } from "./config.js";
import { matchPhotos } from "./faces.js";

const DAY_MS = 86400000;

/** Date du jour à Abidjan (UTC+0, sans heure d'été) : AAAA-MM-JJ. */
export function today(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: STUDIO.timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

export function randomId(bytes = 12) {
  const a = crypto.getRandomValues(new Uint8Array(bytes));
  return Array.from(a, (b) => b.toString(36).padStart(2, "0")).join("").slice(0, bytes * 2);
}

// ---------------------------------------------------------------------------
class LocalStore {
  mode = "demo";

  constructor() {
    this.channel = "BroadcastChannel" in window ? new BroadcastChannel("forlife-studio") : null;
    this.listeners = new Set();
    this.urls = new Map();
    this.channel?.addEventListener("message", () => this._notify(false));
    this.ready = new Promise((resolve, reject) => {
      const req = indexedDB.open("forlife-studio", 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        db.createObjectStore("photos", { keyPath: "id" }).createIndex("day", "day");
        db.createObjectStore("blobs");
        db.createObjectStore("galleries", { keyPath: "id" });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async _tx(stores, mode, fn) {
    const db = await this.ready;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(stores, mode);
      const out = fn(tx);
      tx.oncomplete = () => resolve(out?.result ?? out);
      tx.onerror = () => reject(tx.error);
    });
  }

  _notify(broadcast = true) {
    if (broadcast) this.channel?.postMessage("change");
    for (const fn of this.listeners) fn();
  }

  async _url(key) {
    if (this.urls.has(key)) return this.urls.get(key);
    const blob = await this._tx(["blobs"], "readonly", (tx) => tx.objectStore("blobs").get(key));
    const url = blob ? URL.createObjectURL(blob) : null;
    if (url) this.urls.set(key, url);
    return url;
  }

  // --- Photographe ---
  async signIn() { return { email: "demo" }; }
  async signOut() {}
  onAuth(cb) { cb({ email: "demo" }); return () => {}; }

  async addPhoto({ day, name, preset, faces, web, thumb, width, height }) {
    const id = `${Date.now().toString(36)}-${randomId(4)}`;
    const photo = { id, day, name, preset, faces, width, height, createdAt: Date.now() };
    await this._tx(["photos", "blobs"], "readwrite", (tx) => {
      tx.objectStore("photos").put(photo);
      tx.objectStore("blobs").put(web, `${id}:web`);
      tx.objectStore("blobs").put(thumb, `${id}:thumb`);
    });
    this._notify();
    return id;
  }

  async deletePhoto(id) {
    await this._tx(["photos", "blobs"], "readwrite", (tx) => {
      tx.objectStore("photos").delete(id);
      tx.objectStore("blobs").delete(`${id}:web`);
      tx.objectStore("blobs").delete(`${id}:thumb`);
    });
    this._notify();
  }

  async listDay(day) {
    const rows = await this._tx(["photos"], "readonly", (tx) => tx.objectStore("photos").index("day").getAll(day));
    const photos = await Promise.all(rows.map(async (p) => ({ ...p, web: await this._url(`${p.id}:web`), thumb: await this._url(`${p.id}:thumb`) })));
    return photos.sort((a, b) => b.createdAt - a.createdAt);
  }

  async listDays() {
    const rows = await this._tx(["photos"], "readonly", (tx) => tx.objectStore("photos").getAll());
    const days = new Map();
    for (const p of rows) days.set(p.day, (days.get(p.day) || 0) + 1);
    return [...days].map(([day, count]) => ({ day, count })).sort((a, b) => (a.day < b.day ? 1 : -1));
  }

  watchDay(day, cb) {
    const run = () => this.listDay(day).then(cb);
    this.listeners.add(run);
    run();
    return () => this.listeners.delete(run);
  }

  /** Supprime tout ce qui a plus de `galleryDays` jours (photos et galeries). */
  async purge() {
    const limit = Date.now() - STUDIO.galleryDays * DAY_MS;
    const old = await this._tx(["photos"], "readonly", (tx) => tx.objectStore("photos").getAll());
    for (const p of old) if (p.createdAt < limit) await this.deletePhoto(p.id);
    const gal = await this._tx(["galleries"], "readonly", (tx) => tx.objectStore("galleries").getAll());
    await this._tx(["galleries"], "readwrite", (tx) => gal.filter((g) => g.expiresAt < Date.now()).forEach((g) => tx.objectStore("galleries").delete(g.id)));
  }

  // --- Client ---
  async createGallery({ day, descriptor, phone }) {
    const g = { id: randomId(16), day, descriptor, phone: phone || null, createdAt: Date.now(), expiresAt: Date.now() + STUDIO.galleryDays * DAY_MS };
    await this._tx(["galleries"], "readwrite", (tx) => tx.objectStore("galleries").put(g));
    return g;
  }

  async galleryPhotos(galleryId) {
    const g = await this._tx(["galleries"], "readonly", (tx) => tx.objectStore("galleries").get(galleryId));
    if (!g || g.expiresAt < Date.now()) return null;
    const photos = matchPhotos(g.descriptor, await this.listDay(g.day));
    return { gallery: { id: g.id, day: g.day, expiresAt: g.expiresAt }, photos };
  }

  watchGallery(galleryId, cb) {
    const run = () => this.galleryPhotos(galleryId).then(cb);
    this.listeners.add(run);
    run();
    return () => this.listeners.delete(run);
  }
}

// ---------------------------------------------------------------------------
const FB = "https://www.gstatic.com/firebasejs/10.14.1";

class FirebaseStore {
  mode = "firebase";

  constructor(config) {
    this.ready = (async () => {
      const [{ initializeApp }, auth, fs, st, fn] = await Promise.all([
        import(`${FB}/firebase-app.js`),
        import(`${FB}/firebase-auth.js`),
        import(`${FB}/firebase-firestore.js`),
        import(`${FB}/firebase-storage.js`),
        import(`${FB}/firebase-functions.js`),
      ]);
      const app = initializeApp(config);
      return { auth, fs, st, fn, a: auth.getAuth(app), db: fs.getFirestore(app), storage: st.getStorage(app), functions: fn.getFunctions(app, "europe-west1") };
    })();
  }

  _col(day) {
    return `studios/${STUDIO.id}/days/${day}/photos`;
  }

  async signIn(email, password) {
    const { auth, a } = await this.ready;
    const cred = await auth.signInWithEmailAndPassword(a, email, password);
    return cred.user;
  }

  async signOut() {
    const { auth, a } = await this.ready;
    await auth.signOut(a);
  }

  onAuth(cb) {
    let off = () => {};
    this.ready.then(({ auth, a }) => {
      off = auth.onAuthStateChanged(a, cb);
    });
    return () => off();
  }

  async addPhoto({ day, name, preset, faces, web, thumb, width, height }) {
    const { fs, st, db, storage } = await this.ready;
    const id = `${Date.now().toString(36)}-${randomId(4)}`;
    const base = `studios/${STUDIO.id}/${day}`;
    const meta = { contentType: "image/jpeg", cacheControl: "private, max-age=31536000" };
    await Promise.all([
      st.uploadBytes(st.ref(storage, `${base}/web/${id}.jpg`), web, meta),
      st.uploadBytes(st.ref(storage, `${base}/thumbs/${id}.jpg`), thumb, meta),
    ]);
    await fs.setDoc(fs.doc(db, this._col(day), id), {
      name, preset, width, height, day,
      faces: faces.map((f) => ({ box: f.box, score: f.score, d: f.descriptor })),
      paths: { web: `${base}/web/${id}.jpg`, thumb: `${base}/thumbs/${id}.jpg` },
      createdAt: Date.now(),
      expiresAt: fs.Timestamp.fromMillis(Date.now() + STUDIO.galleryDays * DAY_MS),
    });
    return id;
  }

  async deletePhoto(id, day) {
    const { fs, st, db, storage } = await this.ready;
    const ref = fs.doc(db, this._col(day), id);
    const snap = await fs.getDoc(ref);
    if (snap.exists()) {
      const p = snap.data().paths || {};
      await Promise.allSettled(Object.values(p).map((path) => st.deleteObject(st.ref(storage, path))));
    }
    await fs.deleteDoc(ref);
  }

  async _hydrate(docs) {
    const { st, storage } = await this.ready;
    return Promise.all(docs.map(async (d) => {
      const p = { id: d.id, ...d.data() };
      const [web, thumb] = await Promise.all([st.getDownloadURL(st.ref(storage, p.paths.web)), st.getDownloadURL(st.ref(storage, p.paths.thumb))]);
      return { ...p, web, thumb, faces: (p.faces || []).map((f) => ({ ...f, descriptor: f.d })) };
    }));
  }

  async listDay(day) {
    const { fs, db } = await this.ready;
    const snap = await fs.getDocs(fs.query(fs.collection(db, this._col(day)), fs.orderBy("createdAt", "desc")));
    return this._hydrate(snap.docs);
  }

  async listDays() {
    return [];
  }

  watchDay(day, cb) {
    let off = () => {};
    this.ready.then(({ fs, db }) => {
      off = fs.onSnapshot(fs.query(fs.collection(db, this._col(day)), fs.orderBy("createdAt", "desc")), async (snap) => cb(await this._hydrate(snap.docs)));
    });
    return () => off();
  }

  async purge() {
    // Côté production, la purge à 30 jours est faite par la Cloud Function planifiée.
  }

  // Côté client, tout passe par les Cloud Functions : la base n'est jamais lue directement.
  async createGallery({ day, descriptor, phone }) {
    const { fn, functions } = await this.ready;
    const res = await fn.httpsCallable(functions, "createGallery")({ day, descriptor, phone });
    return res.data;
  }

  async galleryPhotos(galleryId) {
    const { fn, functions } = await this.ready;
    const res = await fn.httpsCallable(functions, "galleryPhotos")({ galleryId });
    return res.data;
  }

  watchGallery(galleryId, cb) {
    let stop = false;
    const tick = async () => {
      if (stop) return;
      try { cb(await this.galleryPhotos(galleryId)); } catch { /* réseau : on réessaie */ }
      setTimeout(tick, 15000);
    };
    tick();
    return () => { stop = true; };
  }
}

export const store = FIREBASE_CONFIG ? new FirebaseStore(FIREBASE_CONFIG) : new LocalStore();
