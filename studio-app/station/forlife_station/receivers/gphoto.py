"""Réception en « Commande via PC » (PC Remote) avec gphoto2 : A7 III en USB ou Wi-Fi.

On s'appuie sur la commande `gphoto2 --capture-tethered`, qui attend chaque
déclenchement sur le boîtier et télécharge l'image aussitôt. Le processus est
relancé automatiquement s'il s'arrête (câble débranché, Wi-Fi perdu).
"""

from __future__ import annotations

import logging
import shutil
import subprocess
import threading
import time
from pathlib import Path
from typing import Callable

from ..config import CameraConfig

log = logging.getLogger(__name__)


def gphoto2_path() -> str | None:
    return shutil.which("gphoto2")


def base_command(cam: CameraConfig) -> list[str]:
    exe = gphoto2_path() or "gphoto2"
    cmd = [exe]
    if cam.port and cam.port != "usb":
        cmd += ["--port", cam.port]
    return cmd


class TetherReceiver:
    def __init__(self, cam: CameraConfig, target_dir: Path, on_file: Callable[[Path, str], None]):
        self.cam = cam
        self.target_dir = Path(target_dir)
        self.on_file = on_file
        self._stop = threading.Event()
        self._proc: subprocess.Popen | None = None
        self.connected = False
        self.last_error = ""

    def start(self) -> threading.Thread:
        t = threading.Thread(target=self._run, daemon=True, name=f"tether-{self.cam.name}")
        t.start()
        return t

    def stop(self) -> None:
        self._stop.set()
        if self._proc and self._proc.poll() is None:
            self._proc.terminate()

    def _run(self) -> None:
        self.target_dir.mkdir(parents=True, exist_ok=True)
        pattern = str(self.target_dir / f"{self.cam.name}_%Y%m%d-%H%M%S_%f.%C")
        while not self._stop.is_set():
            cmd = base_command(self.cam) + ["--capture-tethered", "--keep", "--force-overwrite", "--filename", pattern]
            try:
                self._proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1)
            except FileNotFoundError:
                self.last_error = "gphoto2 introuvable : installez-le (brew install gphoto2)."
                log.error(self.last_error)
                return
            self.connected = True
            for line in self._proc.stdout:  # type: ignore[union-attr]
                line = line.strip()
                # gphoto2 affiche « Saving file as <chemin> » à chaque image reçue.
                if line.startswith("Saving file as "):
                    path = Path(line[len("Saving file as "):].strip())
                    if path.is_file():
                        self.on_file(path, f"pcremote:{self.cam.name}")
                elif "Error" in line or "erreur" in line.lower():
                    self.last_error = line
                    log.warning("[%s] %s", self.cam.name, line)
            self._proc.wait()
            self.connected = False
            if not self._stop.is_set():
                time.sleep(3)  # boîtier éteint ou déconnecté : on réessaie
