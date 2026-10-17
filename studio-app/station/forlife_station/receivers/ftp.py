"""Serveur FTP intégré : reçoit les photos du FX30 (transfert FTP automatique Sony)."""

from __future__ import annotations

import logging
import threading
from pathlib import Path
from typing import Callable

from pyftpdlib.authorizers import DummyAuthorizer
from pyftpdlib.handlers import FTPHandler
from pyftpdlib.servers import ThreadedFTPServer

from ..config import FtpConfig

log = logging.getLogger(__name__)
PHOTO_EXT = {".jpg", ".jpeg", ".heif", ".hif", ".arw", ".png", ".tif", ".tiff"}


def build_server(cfg: FtpConfig, root: Path, on_file: Callable[[Path, str], None]) -> ThreadedFTPServer:
    if not cfg.password:
        raise ValueError("Mot de passe FTP manquant : lancez `forlife-station init`.")
    root.mkdir(parents=True, exist_ok=True)
    authorizer = DummyAuthorizer()
    authorizer.add_user(cfg.user, cfg.password, str(root), perm="elwm")  # pas de suppression

    allowed = set(cfg.allowed_ips)

    class Handler(FTPHandler):
        banner = "ForLife Studio"

        def on_connect(self):
            if allowed and self.remote_ip not in allowed:
                log.warning("Connexion FTP refusée depuis %s", self.remote_ip)
                self.close()

        def on_file_received(self, file):
            path = Path(file)
            if path.suffix.lower() in PHOTO_EXT:
                on_file(path, f"ftp:{self.remote_ip}")

        def on_incomplete_file_received(self, file):
            # Transfert coupé (Wi-Fi perdu) : le boîtier renverra le fichier.
            Path(file).unlink(missing_ok=True)

    Handler.authorizer = authorizer
    Handler.passive_ports = range(60000, 60100)
    server = ThreadedFTPServer((cfg.host, cfg.port), Handler)
    server.max_cons = 16
    return server


def serve_in_background(server: ThreadedFTPServer) -> threading.Thread:
    t = threading.Thread(target=server.serve_forever, kwargs={"handle_exit": False}, daemon=True, name="ftp")
    t.start()
    return t
