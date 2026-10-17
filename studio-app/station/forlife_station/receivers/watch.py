"""Surveillance d'un dossier (import de carte SD, ou toute autre source de fichiers)."""

from __future__ import annotations

import threading
import time
from pathlib import Path
from typing import Callable

from .ftp import PHOTO_EXT


class FolderWatcher:
    """Signale chaque nouveau fichier photo une fois sa taille stable (copie terminée)."""

    def __init__(self, folder: Path, on_file: Callable[[Path, str], None], interval: float = 1.0):
        self.folder = Path(folder)
        self.on_file = on_file
        self.interval = interval
        self._seen: set[Path] = set()
        self._sizes: dict[Path, int] = {}
        self._stop = threading.Event()

    def scan_once(self) -> list[Path]:
        found = []
        for p in sorted(self.folder.rglob("*")):
            if p in self._seen or not p.is_file() or p.suffix.lower() not in PHOTO_EXT:
                continue
            size = p.stat().st_size
            if size > 0 and self._sizes.get(p) == size:
                self._seen.add(p)
                self._sizes.pop(p, None)
                found.append(p)
                self.on_file(p, "dossier")
            else:
                self._sizes[p] = size
        return found

    def start(self) -> threading.Thread:
        def loop():
            while not self._stop.is_set():
                self.scan_once()
                time.sleep(self.interval)

        t = threading.Thread(target=loop, daemon=True, name=f"watch-{self.folder.name}")
        t.start()
        return t

    def stop(self) -> None:
        self._stop.set()
