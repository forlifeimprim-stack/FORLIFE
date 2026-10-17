// ForLife Studio — application web : parcours client (selfie) et espace photographe.
import { QR_LIB_URL, STUDIO } from "./config.js";
import { analyse, loadFaceApi, selfieDescriptor } from "./faces.js";
import { PRESETS, drawScaled, loadBitmap, render, toBlob } from "./retouch.js";
import { store, today } from "./store.js";

const root = document.getElementById("root");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
let cleanup = [];

// ---------- Utilitaires ----------
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const plural = (n, w) => `${n} ${w}${n > 1 ? "s" : ""}`;
const longDay = (day) => new Date(`${day}T12:00:00Z`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
const baseUrl = () => location.href.split("#")[0];
const brand = `<a class="brand" href="#/" aria-label="ForLife Studio, accueil"><svg aria-hidden="true"><use href="#logo-f"/></svg><b>ForLife</b><i>Studio</i></a>`;
const demoBadge = () => (store.mode === "demo" ? `<span class="badge-demo" title="Les photos restent dans ce navigateur">Démonstration</span>` : "");

export function toast(message, kind = "info") {
  const el = document.createElement("div");
  el.className = `toast${kind === "err" ? " toast--err" : ""}`;
  el.textContent = message;
  document.getElementById("toasts").append(el);
  setTimeout(() => {
    el.classList.add("is-out");
    el.addEventListener("animationend", () => el.remove(), { once: true });
  }, kind === "err" ? 6000 : 3200);
}

function mount(html, theme) {
  cleanup.forEach((fn) => fn());
  cleanup = [];
  root.innerHTML = `<div class="view theme-${theme}">${html}</div>`;
  document.querySelector('meta[name="theme-color"]').content = theme === "light" ? "#FFF8F2" : "#120B08";
  window.scrollTo(0, 0);
  return root.firstElementChild;
}

function revealImg(img) {
  if (img.complete && img.naturalWidth) img.classList.add("is-loaded");
  else img.addEventListener("load", () => img.classList.add("is-loaded"), { once: true });
}

async function download(url, filename) {
  try {
    const blob = await (await fetch(url)).blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  } catch {
    window.open(url, "_blank", "noopener");
  }
}

let qrLib = null;
function loadQr() {
  qrLib ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = QR_LIB_URL;
    s.onload = () => resolve(window.qrcode);
    s.onerror = () => reject(new Error("QR indisponible"));
    document.head.append(s);
  });
  return qrLib;
}
async function qrSvg(text) {
  const qrcode = await loadQr();
  const qr = qrcode(0, "H");
  qr.addData(text);
  qr.make();
  return qr.createSvgTag({ cellSize: 6, margin: 2, scalable: true });
}

// ======================================================================
// PARCOURS CLIENT
// ======================================================================
function viewWelcome() {
  const day = today();
  const el = mount(`
    <main class="client">
      <div class="client__top">${brand}${demoBadge()}</div>
      <section class="hero" aria-labelledby="t">
        <svg class="hero__iris" aria-hidden="true"><use href="#iris"/></svg>
        <h1 class="display" id="t">Vos photos,<br><em>en un selfie.</em></h1>
        <p class="muted">Séance du ${esc(longDay(day))}. Prenez un selfie : nous retrouvons uniquement les photos où vous apparaissez.</p>
        <label class="consent">
          <input type="checkbox" id="consent">
          <span>J'accepte que mon visage serve <b>uniquement</b> à retrouver mes photos. Le selfie n'est ni envoyé ni conservé ; l'accès à mes photos dure ${STUDIO.galleryDays} jours.</span>
        </label>
        <button class="btn btn--primary" id="go" type="button" disabled>
          <svg class="icon" aria-hidden="true"><use href="#i-camera"/></svg> Prendre mon selfie
        </button>
        <input type="file" id="file" accept="image/*" capture="user" class="sr-only" tabindex="-1" aria-hidden="true">
        <div class="steps" aria-hidden="true">
          <span class="step"><b>1</b>Selfie</span><span class="step"><b>2</b>Reconnaissance</span><span class="step"><b>3</b>Vos photos</span>
        </div>
      </section>
      <p class="footer-note">ForLife Studio — Imprimer l'avenir, valoriser les marques.</p>
    </main>`, "light");
  const consent = el.querySelector("#consent");
  const go = el.querySelector("#go");
  const file = el.querySelector("#file");
  consent.addEventListener("change", () => (go.disabled = !consent.checked));
  go.addEventListener("click", () => file.click());
  file.addEventListener("change", () => file.files[0] && searchWithSelfie(file.files[0], day));
  // Préchargement discret des modèles pendant que le client lit la page.
  loadFaceApi().catch(() => {});
}

async function searchWithSelfie(file, day) {
  const url = URL.createObjectURL(file);
  const el = mount(`
    <main class="client">
      <div class="client__top">${brand}${demoBadge()}</div>
      <section class="searching" aria-live="polite">
        <img class="searching__selfie" src="${url}" alt="Votre selfie">
        <h1 class="display" style="font-size:34px">Nous cherchons vos photos…</h1>
        <p class="muted" id="msg">Analyse du visage</p>
        <svg class="iris-spin" aria-hidden="true"><use href="#iris"/></svg>
      </section>
    </main>`, "light");
  try {
    const bitmap = await loadBitmap(file);
    const canvas = drawScaled(bitmap, 1024);
    const descriptor = await selfieDescriptor(canvas);
    URL.revokeObjectURL(url);
    if (!descriptor) {
      toast("Aucun visage détecté : face à la lumière, sans lunettes de soleil, réessayez.", "err");
      return viewWelcome();
    }
    el.querySelector("#msg").textContent = "Recherche dans les photos du jour";
    const gallery = await store.createGallery({ day, descriptor });
    location.hash = `#/g/${gallery.id}`;
  } catch (err) {
    console.error(err);
    toast("La recherche a échoué. Vérifiez votre connexion et réessayez.", "err");
    viewWelcome();
  }
}

function viewGallery(galleryId) {
  const el = mount(`
    <main class="client">
      <div class="client__top">${brand}${demoBadge()}</div>
      <section class="gallery" aria-live="polite">
        <div class="searching" id="loading"><svg class="iris-spin" aria-hidden="true"><use href="#iris"/></svg><p class="muted">Chargement de vos photos…</p></div>
      </section>
    </main>`, "light");
  const box = el.querySelector(".gallery");
  const shown = new Set();
  let headDone = false;

  const stop = store.watchGallery(galleryId, (res) => {
    if (!res) {
      box.innerHTML = `<div class="empty-card"><h1 class="display" style="font-size:32px">Lien expiré</h1><p class="muted">Ce lien n'est plus valide (accès de ${STUDIO.galleryDays} jours). Rapprochez‑vous du studio.</p><a class="btn btn--primary" href="#/">Nouvelle recherche</a></div>`;
      return;
    }
    const { gallery, photos } = res;
    if (!headDone) {
      headDone = true;
      const days = Math.max(0, Math.ceil((gallery.expiresAt - Date.now()) / 86400000));
      const link = `${baseUrl()}#/g/${galleryId}`;
      box.innerHTML = `
        <div class="gallery__head">
          <div><h1 class="display">Vos <em>photos</em></h1><p class="small" id="count"></p></div>
          <div class="gallery__actions">
            <span class="countdown">Disponibles encore ${plural(days, "jour")}</span>
            <button class="btn btn--primary btn--sm" id="all" type="button"><svg class="icon" aria-hidden="true"><use href="#i-download"/></svg>Tout télécharger</button>
          </div>
        </div>
        <div class="masonry" id="grid"></div>
        <div class="empty-card" id="none" hidden>
          <svg class="iris-spin" aria-hidden="true"><use href="#iris"/></svg>
          <p><b>Pas encore de photo de vous.</b></p>
          <p class="muted small">Les photos apparaissent ici automatiquement pendant la séance, gardez cette page ouverte.</p>
          <a class="btn btn--ghost btn--sm" href="#/">Refaire mon selfie</a>
        </div>
        <div class="wa-box">
          <b>Gardez ce lien pour ${STUDIO.galleryDays} jours</b>
          <div class="wa-row">
            <div class="field"><label for="phone">Votre numéro WhatsApp</label><input class="input" id="phone" type="tel" inputmode="tel" placeholder="+225 07 00 00 00 00" autocomplete="tel"></div>
          </div>
          <div class="wa-row">
            <button class="btn btn--wa" id="wa" type="button"><svg class="icon" aria-hidden="true"><use href="#i-whatsapp"/></svg>Recevoir sur WhatsApp</button>
            <button class="btn btn--ghost" id="copy" type="button">Copier le lien</button>
          </div>
          <p class="small">Sans WhatsApp, copiez le lien ou ajoutez cette page à votre écran d'accueil : elle fonctionne dans n'importe quel navigateur.</p>
        </div>`;
      box.querySelector("#copy").addEventListener("click", async () => {
        try { await navigator.clipboard.writeText(link); toast("Lien copié"); } catch { prompt("Copiez ce lien :", link); }
      });
      box.querySelector("#wa").addEventListener("click", () => {
        const phone = box.querySelector("#phone").value.replace(/[^\d]/g, "");
        const text = encodeURIComponent(`Mes photos ForLife Studio (${STUDIO.galleryDays} jours) : ${link}`);
        window.open(phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`, "_blank", "noopener");
      });
    }
    box.querySelector("#all").onclick = async () => {
      for (const p of photos) { await download(p.web, `ForLife-${p.day || ""}-${p.id}.jpg`); await new Promise((r) => setTimeout(r, 350)); }
    };
    box.querySelector("#count").textContent = photos.length ? `${plural(photos.length, "photo")} · séance du ${longDay(gallery.day)}` : "";
    box.querySelector("#none").hidden = photos.length > 0;
    box.querySelector("#all").disabled = !photos.length;
    const grid = box.querySelector("#grid");
    for (const p of photos.slice().reverse()) {
      if (shown.has(p.id)) continue;
      shown.add(p.id);
      const fig = document.createElement("figure");
      fig.className = "shot";
      fig.innerHTML = `<img alt="Photo ForLife Studio" loading="lazy" decoding="async"><button class="shot__dl" type="button" aria-label="Télécharger cette photo"><svg class="icon" aria-hidden="true"><use href="#i-download"/></svg></button>`;
      const img = fig.querySelector("img");
      img.src = p.web;
      revealImg(img);
      fig.querySelector("button").addEventListener("click", () => download(p.web, `ForLife-${p.day || ""}-${p.id}.jpg`));
      grid.prepend(fig);
    }
  });
  cleanup.push(stop);
}

// ======================================================================
// ESPACE PHOTOGRAPHE
// ======================================================================
const studioState = { preset: localStorage.getItem("fl.preset") || "signature", queue: 0, known: new Set() };

function viewLogin() {
  const el = mount(`
    <main class="login">
      <form class="login__card" id="f">
        ${brand}
        <h1 class="display">Espace <em>photographe</em></h1>
        <div class="field"><label for="email">E‑mail</label><input class="input" id="email" type="email" autocomplete="username" required></div>
        <div class="field"><label for="pw">Mot de passe</label><input class="input" id="pw" type="password" autocomplete="current-password" required></div>
        <button class="btn btn--primary" type="submit">Se connecter</button>
        <p class="small">Accès réservé au personnel ForLife.</p>
      </form>
    </main>`, "dark");
  el.querySelector("#f").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await store.signIn(el.querySelector("#email").value, el.querySelector("#pw").value);
    } catch {
      toast("Identifiants incorrects.", "err");
    }
  });
}

function swatch(p) {
  if (p.saturation <= -0.9) return "linear-gradient(135deg,#f2f2f2,#5a5a5a 55%,#111)";
  const h = Math.round(26 + p.warmth * 110), s = Math.round(55 + p.saturation * 140), l = Math.round(60 - p.contrast * 40);
  return `linear-gradient(135deg,hsl(${h} ${s}% ${l + 16}%),hsl(${h - 6} ${s}% ${l - 8}%) 55%,hsl(${h - 12} ${Math.max(s - 25, 8)}% ${Math.max(l - 34, 8)}%))`;
}

function viewStudio() {
  const day = today();
  const galleryEntry = `${baseUrl()}#/`;
  const el = mount(`
    <div class="studio">
      <header class="bar">
        ${brand}
        <span class="bar__day"><small>Dossier du jour</small><b>${esc(day)}</b></span>
        ${demoBadge()}
        <div class="bar__right">
          <a class="btn btn--ghost btn--sm" href="#/" target="_blank" rel="noopener">Vue client</a>
          ${store.mode === "firebase" ? '<button class="btn btn--ghost btn--sm" id="logout" type="button">Déconnexion</button>' : ""}
        </div>
      </header>
      <main class="studio__main">
        <section>
          <div class="drop" id="drop">
            <svg class="hero__iris" style="width:64px;height:64px" aria-hidden="true"><use href="#iris"/></svg>
            <h1 class="display">Déposez les photos de la séance</h1>
            <p class="muted small">Retouche automatique « <span id="presetName"></span> », reconnaissance des visages, publication immédiate.</p>
            <div class="drop__btns">
              <button class="btn btn--primary" id="pick" type="button"><svg class="icon" aria-hidden="true"><use href="#i-upload"/></svg>Choisir des photos</button>
              <button class="btn btn--ghost" id="shoot" type="button"><svg class="icon" aria-hidden="true"><use href="#i-camera"/></svg>Photographier</button>
            </div>
            <input type="file" id="files" accept="image/jpeg,image/png,image/webp,image/heic" multiple>
            <input type="file" id="cam" accept="image/*" capture="environment">
          </div>
          <div class="queue" id="queue" aria-live="polite"></div>
          <div class="section-head"><h2 class="display">Séance <em>en direct</em></h2><span class="small" id="count"></span></div>
          <ul class="grid" id="grid"></ul>
          <p class="small" id="empty">Aucune photo pour l'instant aujourd'hui.</p>
        </section>
        <aside>
          <section class="card">
            <h2>Aujourd'hui</h2>
            <div class="stats">
              <div class="stat"><b id="sPhotos">0</b><span>photos</span></div>
              <div class="stat"><b id="sFaces">0</b><span>visages</span></div>
              <div class="stat"><b id="sQueue">0</b><span>en cours</span></div>
            </div>
          </section>
          <section class="card">
            <h2>Style de retouche</h2>
            <div class="presets" id="presets" role="radiogroup" aria-label="Style de retouche"></div>
          </section>
          <section class="card">
            <h2>QR du jour</h2>
            <div class="qr-wrap">
              <div class="qr" id="qr" aria-label="QR code de la page client"></div>
              <span class="link">${esc(galleryEntry)}</span>
              <button class="btn btn--ghost btn--sm" id="print" type="button">Imprimer le QR</button>
            </div>
          </section>
        </aside>
      </main>
    </div>`, "dark");

  // Presets
  const presetsBox = el.querySelector("#presets");
  const renderPresets = () => {
    presetsBox.innerHTML = "";
    el.querySelector("#presetName").textContent = PRESETS[studioState.preset].name;
    for (const [key, p] of Object.entries(PRESETS)) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "preset";
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", String(key === studioState.preset));
      b.innerHTML = `<span class="preset__sw" style="background:${swatch(p)}"></span><span><span class="preset__name">${esc(p.name)}</span><span class="preset__desc">${esc(p.description)}</span></span>`;
      b.addEventListener("click", () => {
        studioState.preset = key;
        localStorage.setItem("fl.preset", key);
        renderPresets();
        toast(`Style « ${p.name} » pour les prochaines photos`);
      });
      presetsBox.append(b);
    }
  };
  renderPresets();

  // QR
  qrSvg(galleryEntry).then((svg) => (el.querySelector("#qr").innerHTML = svg)).catch(() => (el.querySelector("#qr").textContent = "QR indisponible hors ligne"));
  el.querySelector("#print").addEventListener("click", () => {
    const w = window.open("", "_blank", "width=600,height=800");
    if (!w) return;
    w.document.write(`<title>QR ForLife Studio</title><body style="font-family:Poppins,sans-serif;text-align:center;padding:40px;color:#2A1A15">
      <div style="width:320px;margin:0 auto">${el.querySelector("#qr").innerHTML}</div>
      <h2 style="font-family:Georgia,serif;font-weight:500;font-size:30px;margin:24px 0 8px">Retrouvez vos photos</h2>
      <p>Scannez, faites un selfie : vos photos ForLife Studio s'affichent.</p><script>onload=()=>print()<\/script></body>`);
    w.document.close();
  });

  // Import des photos
  const files = el.querySelector("#files");
  const cam = el.querySelector("#cam");
  el.querySelector("#pick").addEventListener("click", () => files.click());
  el.querySelector("#shoot").addEventListener("click", () => cam.click());
  files.addEventListener("change", () => { enqueue([...files.files], day, el); files.value = ""; });
  cam.addEventListener("change", () => { enqueue([...cam.files], day, el); cam.value = ""; });
  const drop = el.querySelector("#drop");
  const over = (on) => (e) => { e.preventDefault(); drop.classList.toggle("is-over", on); };
  drop.addEventListener("dragover", over(true));
  drop.addEventListener("dragleave", over(false));
  drop.addEventListener("drop", (e) => {
    over(false)(e);
    enqueue([...e.dataTransfer.files].filter((f) => f.type.startsWith("image/")), day, el);
  });
  const onPaste = (e) => {
    const imgs = [...(e.clipboardData?.files || [])].filter((f) => f.type.startsWith("image/"));
    if (imgs.length) enqueue(imgs, day, el);
  };
  document.addEventListener("paste", onPaste);
  cleanup.push(() => document.removeEventListener("paste", onPaste));

  el.querySelector("#logout")?.addEventListener("click", () => store.signOut());

  // Mur en direct
  const grid = el.querySelector("#grid");
  const first = studioState.known.size === 0;
  const stop = store.watchDay(day, (photos) => {
    const ids = new Set(photos.map((p) => p.id));
    for (const li of [...grid.children]) if (!ids.has(li.dataset.id)) li.remove();
    for (const p of photos.slice().reverse()) {
      if (grid.querySelector(`[data-id="${CSS.escape(p.id)}"]`)) continue;
      const li = document.createElement("li");
      li.className = "tile";
      li.dataset.id = p.id;
      if (!first && !studioState.known.has(p.id) && !reduceMotion) li.classList.add("is-new");
      li.innerHTML = `<img alt="${esc(p.name || "Photo")}" loading="lazy"><div class="tile__meta"><span class="chip">${plural((p.faces || []).length, "visage")}</span><button class="tile__del" type="button" aria-label="Supprimer cette photo"><svg aria-hidden="true"><use href="#i-trash"/></svg></button></div>`;
      li.querySelector("img").src = p.thumb;
      li.querySelector(".tile__del").addEventListener("click", async () => {
        if (!confirm("Supprimer définitivement cette photo ?")) return;
        await store.deletePhoto(p.id, p.day);
        if (store.mode === "firebase") li.remove();
      });
      grid.prepend(li);
      studioState.known.add(p.id);
    }
    el.querySelector("#count").textContent = plural(photos.length, "photo");
    el.querySelector("#empty").hidden = photos.length > 0;
    el.querySelector("#sPhotos").textContent = photos.length;
    el.querySelector("#sFaces").textContent = photos.reduce((n, p) => n + (p.faces || []).length, 0);
  });
  cleanup.push(stop);
}

let chain = Promise.resolve();
function enqueue(list, day, el) {
  if (!list.length) return;
  loadFaceApi().catch(() => toast("Reconnaissance faciale indisponible : vérifiez la connexion.", "err"));
  for (const file of list) {
    studioState.queue++;
    const chip = document.createElement("span");
    chip.className = "job";
    chip.innerHTML = `<svg aria-hidden="true"><use href="#iris"/></svg><span>${esc(file.name || "photo")}</span>`;
    el.querySelector("#queue")?.append(chip);
    updateQueue(el);
    // Une photo à la fois : l'interface reste fluide, même sur téléphone.
    chain = chain.then(() => processOne(file, day)).then(
      () => chip.remove(),
      (err) => { console.error(err); chip.remove(); toast(`« ${file.name} » n'a pas pu être traitée.`, "err"); },
    ).finally(() => { studioState.queue--; updateQueue(el); });
  }
}

function updateQueue(el) {
  const q = el.querySelector("#sQueue");
  if (q) q.textContent = studioState.queue;
}

async function processOne(file, day) {
  const bitmap = await loadBitmap(file);
  const canvas = drawScaled(bitmap, 2048);
  let faces = [];
  try {
    faces = await analyse(canvas);
  } catch (err) {
    console.warn("Visages non analysés", err);
  }
  render(canvas, PRESETS[studioState.preset], faces.map((f) => f.box));
  const web = await toBlob(canvas, 0.88);
  const thumb = await toBlob(drawScaled(canvas, 480), 0.8);
  await store.addPhoto({ day, name: file.name, preset: studioState.preset, faces, web, thumb, width: canvas.width, height: canvas.height });
}

// ======================================================================
// ROUTEUR
// ======================================================================
let authOff = null;
function route() {
  authOff?.();
  authOff = null;
  const hash = location.hash || "#/";
  const g = hash.match(/^#\/g\/([\w-]+)/);
  if (g) return viewGallery(g[1]);
  if (hash.startsWith("#/studio")) {
    if (store.mode === "demo") return viewStudio();
    authOff = store.onAuth((user) => (user ? viewStudio() : viewLogin()));
    return;
  }
  viewWelcome();
}

window.addEventListener("hashchange", route);
store.purge().catch(() => {});
route();
