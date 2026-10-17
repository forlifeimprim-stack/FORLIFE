"""Chef d'orchestre : réception -> file d'attente -> retouche -> publication."""

from __future__ import annotations

import hashlib
import json
import logging
import queue
import shutil
import threading
import time
from pathlib import Path

from .config import StationConfig
from .dayfolder import ensure_day_folder, folder_name
from .engine import pipeline
from .engine.faces import FaceEngine, models_available
from .engine.presets import Preset, load_presets
from .jobqueue import Job, JobQueue
from .publish import FirebasePublisher, LocalPublisher, Publisher

log = logging.getLogger(__name__)


def photo_id_for(path: Path) -> str:
    digest = hashlib.sha1(str(path).encode()).hexdigest()[:6]
    return f"{path.stem}-{digest}"


class EventBus:
    """Diffuse les événements (photo reçue, retouchée, publiée...) vers l'interface."""

    def __init__(self):
        self._subs: list[queue.Queue] = []
        self._lock = threading.Lock()

    def subscribe(self) -> queue.Queue:
        q: queue.Queue = queue.Queue(maxsize=500)
        with self._lock:
            self._subs.append(q)
        return q

    def unsubscribe(self, q: queue.Queue) -> None:
        with self._lock:
            if q in self._subs:
                self._subs.remove(q)

    def emit(self, kind: str, **data) -> None:
        event = {"type": kind, "time": time.time(), **data}
        with self._lock:
            for q in list(self._subs):
                try:
                    q.put_nowait(event)
                except queue.Full:
                    pass


class Station:
    def __init__(self, cfg: StationConfig, publisher: Publisher | None = None):
        self.cfg = cfg
        cfg.ensure_dirs()
        self.queue = JobQueue(cfg.db_path)
        self.events = EventBus()
        self.presets: dict[str, Preset] = load_presets(cfg.home_path / "presets")
        self.face_engine = FaceEngine(cfg.models_dir) if models_available(cfg.models_dir) else None
        if self.face_engine is None:
            log.warning("Modèles de visages absents : lancez models/download_models.sh")
        self.publishers: list[Publisher] = [LocalPublisher(cfg.library_dir)]
        if publisher is not None:
            self.publishers.append(publisher)
        elif cfg.backend == "firebase":
            self.publishers.append(FirebasePublisher(cfg.firebase_credentials, cfg.firebase_bucket, cfg.studio_id))
        self._stop = threading.Event()
        self._threads: list[threading.Thread] = []
        # Dernière activité par source (ftp:<ip>, pcremote:<boîtier>, dossier).
        self.sources: dict[str, dict] = {}
        self.tethers: list = []

    # --- Réception -----------------------------------------------------------------
    @property
    def preset(self) -> Preset:
        return self.presets.get(self.cfg.active_preset) or self.presets["signature"]

    def current_folder(self) -> str:
        return folder_name(tz=self.cfg.timezone, location=self.cfg.location)

    def on_file(self, path: Path, source: str) -> None:
        """Appelé par les récepteurs (FTP, PC Remote, dossier) pour chaque photo arrivée."""
        info = self.sources.setdefault(source, {"count": 0})
        info["count"] += 1
        info["lastSeen"] = time.time()
        folder = self.current_folder()
        root = ensure_day_folder(self.cfg.library_dir, folder)
        dest = root / "originaux" / Path(path).name
        if dest.exists() and dest.resolve() != Path(path).resolve():
            dest = dest.with_name(f"{dest.stem}-{int(time.time() * 1000) % 100000}{dest.suffix}")
        if Path(path).resolve() != dest.resolve():
            shutil.move(str(path), dest)
        if dest.suffix.lower() == ".arw":
            # Les RAW sont archivés ; seuls les JPEG partent en direct.
            self.events.emit("raw_archived", folder=folder, name=dest.name)
            return
        if self.queue.add(dest, folder, source):
            self.events.emit("received", folder=folder, name=dest.name, source=source, photo_id=photo_id_for(dest))

    # --- Traitement ----------------------------------------------------------------
    def process_one(self) -> bool:
        """Traite un travail (priorité aux versions express). Renvoie False si rien à faire."""
        job = self.queue.claim("pending", self.cfg.newest_first)
        phase = "express"
        if job is None:
            job = self.queue.claim("express", self.cfg.newest_first)
            phase = "hd"
        if job is None:
            return False
        try:
            self._run_phase(job, phase)
        except Exception as exc:  # noqa: BLE001 - on journalise et on retente
            log.exception("Échec %s sur %s", phase, job.source_path)
            self.queue.fail(job.id, f"{type(exc).__name__}: {exc}")
            self.events.emit("error", photo_id=photo_id_for(Path(job.source_path)), message=str(exc))
        return True

    def _run_phase(self, job: Job, phase: str) -> None:
        source = Path(job.source_path)
        pid = photo_id_for(source)
        root = self.cfg.library_dir / job.folder
        faces_file = root / "faces" / f"{pid}.json"
        preset = self.preset
        if phase == "express":
            self.events.emit("processing", photo_id=pid, phase=phase, folder=job.folder)
            res = pipeline.process(source, preset, root, pid, self.face_engine, self.cfg.web_max_side, self.cfg.hd_max_side, self.cfg.thumb_max_side, passes=("express",))
            faces = [f.to_dict() for f in res.faces]
            faces_file.write_text(json.dumps(faces), encoding="utf-8")
            meta = {
                "name": source.name,
                "camera": job.camera,
                "preset": preset.key,
                "width": res.source_size[0],
                "height": res.source_size[1],
                "sharpness": round(res.sharpness, 1),
                "faceCount": len(faces),
                "receivedAt": job.received_at,
                "faces": faces,
                "timings": {k: round(v, 2) for k, v in res.timings.items()},
            }
            files = {"web": res.renditions["web"].path, "thumbs": res.renditions["thumb"].path}
            next_status = "express"
        else:
            # Les visages sont redétectés (rapide) pour disposer des points d'alignement.
            res = pipeline.process(source, preset, root, pid, self.face_engine, self.cfg.web_max_side, self.cfg.hd_max_side, self.cfg.thumb_max_side, passes=("hd",))
            meta = {"preset": preset.key, "hdTimings": {k: round(v, 2) for k, v in res.timings.items()}}
            files = {"hd": res.renditions["hd"].path}
            next_status = "published"
        for pub in self.publishers:
            pub.publish(job.folder, pid, phase, files, meta)
        self.queue.advance(job.id, next_status, pid)
        self.events.emit("published" if phase == "hd" else "express_ready", photo_id=pid, folder=job.folder, phase=phase, thumb=f"/media/{job.folder}/thumbs/{pid}.jpg", web=f"/media/{job.folder}/web/{pid}.jpg", before=f"/media/{job.folder}/avant/{pid}.jpg", faces=meta.get("faceCount"), sharpness=meta.get("sharpness"), timings=meta.get("timings") or meta.get("hdTimings"))

    def start_workers(self) -> None:
        def loop():
            while not self._stop.is_set():
                if not self.process_one():
                    time.sleep(0.3)

        for i in range(max(1, self.cfg.workers)):
            t = threading.Thread(target=loop, daemon=True, name=f"worker-{i}")
            t.start()
            self._threads.append(t)

    def stop(self) -> None:
        self._stop.set()

    def set_preset(self, key: str) -> None:
        if key not in self.presets:
            raise KeyError(key)
        self.cfg.active_preset = key
        self.events.emit("preset", preset=key)

    def set_location(self, location: str) -> None:
        self.cfg.location = location.strip()
        self.events.emit("folder", folder=self.current_folder())

    def photos(self, folder: str) -> list[dict]:
        manifest = self.cfg.library_dir / folder / "photos.json"
        if not manifest.exists():
            return []
        data = json.loads(manifest.read_text(encoding="utf-8"))
        out = []
        for pid, entry in data.items():
            files = entry.get("files", {})
            out.append({
                "id": pid,
                "name": entry.get("name"),
                "phase": entry.get("phase"),
                "faces": entry.get("faceCount", 0),
                "sharpness": entry.get("sharpness"),
                "receivedAt": entry.get("receivedAt"),
                "thumb": f"/media/{folder}/{files['thumbs']}" if "thumbs" in files else None,
                "web": f"/media/{folder}/{files['web']}" if "web" in files else None,
                "before": f"/media/{folder}/avant/{pid}.jpg",
            })
        out.sort(key=lambda p: p.get("receivedAt") or 0, reverse=True)
        return out

    def status(self) -> dict:
        now = time.time()
        return {
            "folder": self.current_folder(),
            "location": self.cfg.location,
            "preset": self.preset.key,
            "queue": self.queue.counts(),
            "faces": self.face_engine is not None,
            "backend": self.cfg.backend,
            "galleryUrl": f"{self.cfg.public_base_url.rstrip('/')}/s/{self.cfg.studio_id}",
            "sources": [
                {"id": k, "count": v["count"], "ago": round(now - v["lastSeen"])} for k, v in sorted(self.sources.items())
            ],
            "tethers": [
                {"name": t.cam.name, "port": t.cam.port, "connected": t.connected, "error": t.last_error} for t in self.tethers
            ],
        }
