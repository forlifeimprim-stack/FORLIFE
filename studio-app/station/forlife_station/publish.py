"""Publication des photos : en local (manifeste JSON, utilisé hors ligne et pour les tests)
ou sur Firebase (Cloud Storage + Firestore, avec empreintes de visage vectorielles)."""

from __future__ import annotations

import json
import logging
import threading
from pathlib import Path
from typing import Protocol

log = logging.getLogger(__name__)


class Publisher(Protocol):
    def publish(self, folder: str, photo_id: str, phase: str, files: dict[str, Path], meta: dict) -> None: ...


class LocalPublisher:
    """Écrit `photos.json` dans le dossier du jour ; la galerie locale le lit."""

    def __init__(self, library: Path):
        self.library = Path(library)
        self._lock = threading.Lock()

    def publish(self, folder: str, photo_id: str, phase: str, files: dict[str, Path], meta: dict) -> None:
        manifest = self.library / folder / "photos.json"
        with self._lock:
            data = json.loads(manifest.read_text(encoding="utf-8")) if manifest.exists() else {}
            entry = data.setdefault(photo_id, {})
            entry.update({k: v for k, v in meta.items() if k != "faces"})
            entry.setdefault("files", {}).update({k: str(Path(p).relative_to(self.library / folder)) for k, p in files.items()})
            entry["phase"] = phase
            tmp = manifest.with_suffix(".tmp")
            tmp.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
            tmp.replace(manifest)


class FirebasePublisher:
    """Envoie dans Storage `studios/<studio>/<dossier>/<web|hd|thumbs>/<id>.jpg` et écrit
    `dayFolders/<studio>_<dossier>/photos/<id>` + `.../faces/<id>_<n>` dans Firestore."""

    def __init__(self, credentials: str, bucket: str, studio_id: str):
        import firebase_admin
        from firebase_admin import credentials as fb_credentials
        from firebase_admin import firestore, storage

        if not firebase_admin._apps:
            firebase_admin.initialize_app(fb_credentials.Certificate(credentials), {"storageBucket": bucket})
        self.bucket = storage.bucket()
        self.db = firestore.client()
        self.studio_id = studio_id
        self._firestore = firestore

    def publish(self, folder: str, photo_id: str, phase: str, files: dict[str, Path], meta: dict) -> None:
        from google.cloud.firestore_v1.vector import Vector

        base = f"studios/{self.studio_id}/{folder}"
        paths = {}
        for kind, path in files.items():
            blob = self.bucket.blob(f"{base}/{kind}/{photo_id}.jpg")
            blob.cache_control = "private, max-age=31536000"
            blob.upload_from_filename(str(path), content_type="image/jpeg")
            paths[kind] = blob.name
        folder_ref = self.db.collection("dayFolders").document(f"{self.studio_id}_{folder}")
        folder_ref.set(
            {"studioId": self.studio_id, "name": folder, "date": folder[:10], "updatedAt": self._firestore.SERVER_TIMESTAMP},
            merge=True,
        )
        photo = {k: v for k, v in meta.items() if k != "faces"}
        photo.update({"paths": paths, "phase": phase, "updatedAt": self._firestore.SERVER_TIMESTAMP})
        folder_ref.collection("photos").document(photo_id).set(photo, merge=True)
        if phase == "express":
            batch = self.db.batch()
            for i, face in enumerate(meta.get("faces", [])):
                if not face.get("embedding"):
                    continue
                ref = folder_ref.collection("faces").document(f"{photo_id}_{i}")
                batch.set(ref, {"photoId": photo_id, "box": face["box"], "score": face["score"], "embedding": Vector(face["embedding"])})
            batch.commit()
