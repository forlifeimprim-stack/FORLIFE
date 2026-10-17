// ForLife Studio — Station : interface en direct.
const $ = (sel) => document.querySelector(sel);
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

const state = {
  folder: "",
  photos: new Map(), // id -> photo
  activeId: null,
  preset: "",
  presets: [],
  lastEvent: 0,
};

const api = {
  get: (url) => fetch(url, { cache: "no-store" }).then((r) => r.json()),
  post: (url, body) =>
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-ForLife": "1" },
      body: JSON.stringify(body),
    }).then(async (r) => {
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Erreur");
      return data;
    }),
};

// ---------- Utilitaires ----------
const fmtFolder = (name) => {
  const [date, place] = name.split("_");
  const d = new Date(`${date}T12:00:00`);
  const label = isNaN(d) ? date : d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  return place ? `${label} · ${place.replace(/-/g, " ")}` : label;
};
const plural = (n, word) => `${n} ${word}${n > 1 ? "s" : ""}`;

function countTo(el, value) {
  const from = Number(el.dataset.value || 0);
  el.dataset.value = value;
  if (reduceMotion || from === value) { el.textContent = value; return; }
  const start = performance.now();
  const dur = 450;
  const step = (t) => {
    const k = Math.min(1, (t - start) / dur);
    const eased = 1 - Math.pow(1 - k, 3);
    el.textContent = Math.round(from + (value - from) * eased);
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function toast(message, kind = "info") {
  const el = document.createElement("div");
  el.className = `toast${kind === "err" ? " toast--err" : ""}`;
  el.textContent = message;
  $("#toasts").append(el);
  setTimeout(() => {
    el.classList.add("is-out");
    el.addEventListener("animationend", () => el.remove(), { once: true });
  }, kind === "err" ? 6000 : 3200);
}

const irisSvg = '<svg viewBox="-50 -50 100 100" aria-hidden="true"><use href="#iris"/></svg>';

// ---------- Mur de photos ----------
function tileFor(photo) {
  let li = document.getElementById(`t-${photo.id}`);
  const isNew = !li;
  if (!li) {
    li = document.createElement("li");
    li.id = `t-${photo.id}`;
    li.className = "tile";
    li.innerHTML = `<button type="button"></button><div class="tile__spinner">${irisSvg}</div><span class="tile__badge"></span>`;
    li.querySelector("button").addEventListener("click", () => select(photo.id));
  }
  li.querySelector("button").setAttribute("aria-label", `Afficher ${photo.name || photo.id}`);
  if (photo.thumb && !li.querySelector("img")) {
    const img = new Image();
    img.alt = "";
    img.decoding = "async";
    img.onload = () => {
      img.classList.add("is-loaded");
      li.querySelector(".tile__spinner")?.remove();
    };
    img.src = photo.thumb;
    li.prepend(img);
  }
  const badge = li.querySelector(".tile__badge");
  const blurry = photo.sharpness != null && photo.sharpness < 25;
  li.classList.toggle("is-warn", blurry);
  if (!photo.thumb) badge.textContent = "Retouche…";
  else if (blurry) badge.textContent = "Floue ?";
  else badge.textContent = photo.phase === "hd" ? "HD" : "Web";
  badge.classList.toggle("tile__badge--hd", photo.phase === "hd" && !blurry);
  li.classList.toggle("is-active", photo.id === state.activeId);
  return { li, isNew };
}

function upsertPhoto(photo, { animate = false } = {}) {
  const prev = state.photos.get(photo.id) || {};
  const merged = { ...prev, ...Object.fromEntries(Object.entries(photo).filter(([, v]) => v != null)) };
  state.photos.set(photo.id, merged);
  const { li, isNew } = tileFor(merged);
  if (isNew) {
    $("#grid").prepend(li);
    if (animate && !reduceMotion) li.classList.add("is-new");
  }
  $("#wallCount").textContent = plural(state.photos.size, "photo");
  return merged;
}

// ---------- Visionneuse avant / après ----------
function select(id, { reveal = false } = {}) {
  const photo = state.photos.get(id);
  if (!photo || !photo.web) return;
  state.activeId = id;
  document.querySelectorAll(".tile.is-active").forEach((t) => t.classList.remove("is-active"));
  document.getElementById(`t-${id}`)?.classList.add("is-active");
  $("#empty").hidden = true;
  const compare = $("#compare");
  compare.hidden = false;
  const after = $("#imgAfter");
  const before = $("#imgBefore");
  const bust = photo.phase === "hd" ? "?hd" : "";
  after.src = photo.web + bust;
  before.src = photo.before;
  if (reveal && !reduceMotion) {
    compare.classList.remove("is-entering");
    void compare.offsetWidth;
    compare.classList.add("is-entering");
  }
  renderMeta(photo);
}

function renderMeta(p) {
  const parts = [];
  if (p.name) parts.push(`<span><b>${escapeHtml(p.name)}</b></span>`);
  if (p.faces != null) parts.push(`<span>Visages <b>${p.faces}</b></span>`);
  if (p.sharpness != null) {
    const ok = p.sharpness >= 25;
    parts.push(`<span class="${ok ? "" : "warn"}">Netteté <b>${Math.round(p.sharpness)}</b>${ok ? "" : " · à vérifier"}</span>`);
  }
  const t = p.timings?.total;
  if (t) parts.push(`<span>Retouche <b>${t.toFixed(1)} s</b></span>`);
  parts.push(`<span>${p.phase === "hd" ? "Version <b>HD</b> publiée" : "Version <b>web</b> publiée, HD en cours"}</span>`);
  $("#meta").innerHTML = parts.join("");
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function setupCompare() {
  const compare = $("#compare");
  const handle = $("#handle");
  const setPos = (pct) => {
    pct = Math.max(0, Math.min(100, pct));
    compare.style.setProperty("--pos", `${pct}%`);
    handle.setAttribute("aria-valuenow", Math.round(pct));
  };
  let dragging = false;
  const fromEvent = (e) => {
    const r = compare.getBoundingClientRect();
    setPos(((e.clientX - r.left) / r.width) * 100);
  };
  compare.addEventListener("pointerdown", (e) => { dragging = true; compare.setPointerCapture(e.pointerId); fromEvent(e); });
  compare.addEventListener("pointermove", (e) => dragging && fromEvent(e));
  compare.addEventListener("pointerup", () => (dragging = false));
  handle.addEventListener("keydown", (e) => {
    const now = Number(handle.getAttribute("aria-valuenow"));
    if (e.key === "ArrowLeft") { setPos(now - 5); e.preventDefault(); }
    if (e.key === "ArrowRight") { setPos(now + 5); e.preventDefault(); }
  });
  setPos(50);
}

// ---------- Presets ----------
function swatch(p) {
  // Aperçu du rendu du preset : chaleur, saturation et contraste.
  if (p.saturation <= -0.9) return "linear-gradient(135deg,#f2f2f2,#5a5a5a 55%,#111)";
  const warm = Math.round(28 + p.warmth * 120);
  const sat = Math.round(55 + p.saturation * 120);
  const light = Math.round(62 - p.contrast * 30);
  return `linear-gradient(135deg, hsl(${warm} ${sat}% ${light + 18}%), hsl(${warm - 8} ${sat}% ${light - 10}%) 55%, hsl(${warm - 14} ${Math.max(sat - 20, 10)}% ${Math.max(light - 36, 8)}%))`;
}

function renderPresets() {
  const box = $("#presets");
  box.innerHTML = "";
  for (const p of state.presets) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "preset";
    btn.setAttribute("role", "radio");
    btn.setAttribute("aria-checked", String(p.key === state.preset));
    btn.innerHTML = `<span class="preset__swatch" style="background:${swatch(p)}"></span>
      <span><span class="preset__name">${escapeHtml(p.name)}</span><br><span class="preset__desc">${escapeHtml(p.description)}</span></span>`;
    btn.addEventListener("click", async () => {
      try {
        await api.post("/api/preset", { key: p.key });
        state.preset = p.key;
        renderPresets();
        toast(`Style « ${p.name} » appliqué aux prochaines photos`);
      } catch (err) { toast(err.message, "err"); }
    });
    box.append(btn);
  }
}

// ---------- Statut ----------
function setPill(id, level, title) {
  const el = $(id);
  el.classList.remove("is-ok", "is-warn", "is-err");
  if (level) el.classList.add(`is-${level}`);
  el.title = title;
}

function renderStatus(s) {
  if (s.folder !== state.folder) {
    const changed = state.folder && s.folder !== state.folder;
    state.folder = s.folder;
    $("#folderName").textContent = fmtFolder(s.folder);
    if (changed) loadPhotos();
  }
  if (s.preset !== state.preset) { state.preset = s.preset; renderPresets(); }
  const q = s.queue || {};
  const pending = q.pending || 0, express = q.express || 0, published = q.published || 0, errors = q.error || 0;
  const total = pending + express + published + errors;
  countTo($("#nReceived"), total);
  countTo($("#nExpress"), express + published);
  countTo($("#nPublished"), published);
  $("#barFill").style.width = total ? `${(published / total) * 100}%` : "0";
  $("#queueHint").textContent = pending
    ? `${plural(pending, "photo")} en attente de retouche`
    : express ? `${plural(express, "photo")} en finition HD` : errors ? `${plural(errors, "photo")} en erreur` : "File vide.";

  const live = s.sources.some((x) => x.ago < 120) || s.tethers.some((t) => t.connected);
  setPill("#pillCams", live ? "ok" : s.tethers.length || s.sources.length ? "warn" : "", live ? "Appareil actif" : "Aucun appareil actif");
  setPill("#pillFaces", s.faces ? "ok" : "err", s.faces ? "Reconnaissance faciale prête" : "Modèles de visages absents");
  setPill("#pillCloud", s.backend === "firebase" ? "ok" : "warn", s.backend === "firebase" ? "Publication Firebase active" : "Mode local (sans cloud)");
  $("#qrUrl").textContent = s.galleryUrl;

  const ul = $("#sources");
  const rows = [
    ...s.tethers.map((t) => `<li class="source"><i class="dot" style="background:${t.connected ? "var(--ok)" : "var(--warn)"}"></i><span class="source__name">${escapeHtml(t.name)}</span><span class="source__meta">${t.connected ? "connecté" : "en attente"} · ${escapeHtml(t.port)}</span></li>`),
    ...s.sources.map((x) => `<li class="source"><i class="dot" style="background:${x.ago < 120 ? "var(--ok)" : "var(--text-3)"}"></i><span class="source__name">${escapeHtml(labelSource(x.id))}</span><span class="source__meta">${x.count} · il y a ${fmtAgo(x.ago)}</span></li>`),
  ];
  ul.innerHTML = rows.length ? rows.join("") : '<li class="hint">Aucune photo reçue pour l\'instant.</li>';
}

const labelSource = (id) => id.startsWith("ftp:") ? `Wi‑Fi FTP (${id.slice(4)})` : id.startsWith("pcremote:") ? `PC Remote ${id.slice(9)}` : "Import de dossier";
const fmtAgo = (s) => (s < 60 ? `${s} s` : s < 3600 ? `${Math.round(s / 60)} min` : `${Math.round(s / 3600)} h`);

async function refreshStatus() {
  try {
    renderStatus(await api.get("/api/status"));
    setPill("#pillLive", "ok", "Station connectée");
  } catch {
    setPill("#pillLive", "err", "Station injoignable");
  }
}

async function loadPhotos() {
  const list = await api.get(`/api/photos?folder=${encodeURIComponent(state.folder)}`);
  state.photos.clear();
  $("#grid").innerHTML = "";
  for (const p of list.slice().reverse()) upsertPhoto(p);
  if (list[0]) select(list[0].id);
  else { $("#compare").hidden = true; $("#empty").hidden = false; $("#meta").innerHTML = ""; }
}

// ---------- Événements en direct ----------
function connectEvents() {
  const es = new EventSource("/api/events");
  es.onmessage = (msg) => {
    const ev = JSON.parse(msg.data);
    switch (ev.type) {
      case "received":
        upsertPhoto({ id: ev.photo_id, name: ev.name, receivedAt: ev.time }, { animate: true });
        break;
      case "express_ready": {
        upsertPhoto({ id: ev.photo_id, thumb: ev.thumb, web: ev.web, before: ev.before, faces: ev.faces, sharpness: ev.sharpness, timings: ev.timings, phase: "express" });
        // La photo la plus récente s'affiche automatiquement.
        const newest = [...state.photos.values()].sort((a, b) => (b.receivedAt || 0) - (a.receivedAt || 0))[0];
        if (!newest || newest.id === ev.photo_id) select(ev.photo_id, { reveal: true });
        break;
      }
      case "published":
        upsertPhoto({ id: ev.photo_id, phase: "hd" });
        if (state.activeId === ev.photo_id) renderMeta(state.photos.get(ev.photo_id));
        break;
      case "error":
        toast(`Photo non traitée : ${ev.message}`, "err");
        break;
      case "folder":
        refreshStatus();
        break;
    }
    refreshStatusSoon();
  };
  es.onerror = () => setPill("#pillLive", "err", "Connexion perdue, reconnexion…");
  es.onopen = () => setPill("#pillLive", "ok", "Station connectée");
}

let statusTimer = 0;
function refreshStatusSoon() {
  clearTimeout(statusTimer);
  statusTimer = setTimeout(refreshStatus, 250);
}

// ---------- Lieu / dossier ----------
function setupLocation() {
  const dlg = $("#locationDlg");
  $("#folderBtn").addEventListener("click", () => {
    $("#locInput").value = (state.folder.split("_")[1] || "").replace(/-/g, " ");
    dlg.showModal();
  });
  dlg.addEventListener("close", async () => {
    if (dlg.returnValue !== "ok") return;
    try {
      const s = await api.post("/api/location", { location: $("#locInput").value });
      renderStatus(s);
      toast(`Dossier : ${s.folder}`);
    } catch (err) { toast(err.message, "err"); }
  });
  $("#printQr").addEventListener("click", () => {
    const w = window.open("", "_blank", "width=600,height=800");
    if (!w) return;
    w.document.write(`<title>QR ForLife Studio</title><body style="font-family:Poppins,sans-serif;text-align:center;padding:40px">
      <img src="${location.origin}/api/qr.svg" style="width:320px;height:320px"><h2>Retrouvez vos photos</h2>
      <p>Scannez, faites un selfie : vos photos ForLife Studio s'affichent.</p><p style="color:#777">${escapeHtml($("#qrUrl").textContent)}</p>
      <script>onload=()=>print()<\/script></body>`);
    w.document.close();
  });
}

// ---------- Démarrage ----------
async function boot() {
  setupCompare();
  setupLocation();
  state.presets = await api.get("/api/presets");
  await refreshStatus();
  renderPresets();
  await loadPhotos();
  connectEvents();
  setInterval(refreshStatus, 5000);
  const intro = $("#intro");
  if (reduceMotion) intro.remove();
  else {
    requestAnimationFrame(() => intro.classList.add("is-done"));
    intro.addEventListener("animationend", (e) => e.target === intro && intro.remove());
  }
}

boot().catch((err) => {
  $("#intro")?.remove();
  toast(`Démarrage impossible : ${err.message}`, "err");
});
