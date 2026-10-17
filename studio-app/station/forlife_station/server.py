"""Interface locale de la Station : page web + API JSON + flux d'événements (SSE)."""

from __future__ import annotations

import json
import logging
import mimetypes
import queue
import threading
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse

import segno

from .station import Station

log = logging.getLogger(__name__)
WEB_DIR = Path(__file__).parent / "web"


def make_handler(station: Station):
    library = station.cfg.library_dir.resolve()

    class Handler(BaseHTTPRequestHandler):
        server_version = "ForLifeStation"

        def log_message(self, fmt, *args):  # journal discret
            log.debug("%s " + fmt, self.address_string(), *args)

        # --- utilitaires ---
        def _send(self, status: int, body: bytes, ctype: str, extra: dict | None = None) -> None:
            self.send_response(status)
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(len(body)))
            self.send_header("X-Content-Type-Options", "nosniff")
            for k, v in (extra or {}).items():
                self.send_header(k, v)
            self.end_headers()
            self.wfile.write(body)

        def _json(self, data, status: int = 200) -> None:
            self._send(status, json.dumps(data, ensure_ascii=False).encode(), "application/json; charset=utf-8", {"Cache-Control": "no-store"})

        def _file(self, path: Path, cache: str = "no-cache") -> None:
            if not path.is_file():
                self._json({"error": "introuvable"}, 404)
                return
            ctype = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
            self._send(200, path.read_bytes(), ctype, {"Cache-Control": cache})

        def _body(self) -> dict:
            n = int(self.headers.get("Content-Length") or 0)
            return json.loads(self.rfile.read(n) or b"{}") if n else {}

        # --- routes ---
        def do_GET(self):
            url = urlparse(self.path)
            p = url.path
            if p == "/" or p == "/index.html":
                return self._file(WEB_DIR / "index.html")
            if p.startswith("/static/"):
                target = (WEB_DIR / unquote(p[len("/static/"):])).resolve()
                if WEB_DIR.resolve() not in target.parents:
                    return self._json({"error": "interdit"}, 403)
                return self._file(target, "max-age=3600")
            if p.startswith("/media/"):
                target = (library / unquote(p[len("/media/"):])).resolve()
                if library not in target.parents:
                    return self._json({"error": "interdit"}, 403)
                return self._file(target, "max-age=86400")
            if p == "/api/status":
                return self._json(station.status())
            if p == "/api/presets":
                return self._json([pr.to_dict() for pr in station.presets.values()])
            if p == "/api/photos":
                folder = parse_qs(url.query).get("folder", [station.current_folder()])[0]
                if "/" in folder or ".." in folder:
                    return self._json({"error": "dossier invalide"}, 400)
                return self._json(station.photos(folder))
            if p == "/api/qr.svg":
                url_qr = station.status()["galleryUrl"]
                qr = segno.make(url_qr, error="h")
                svg = qr.svg_inline(scale=8, dark="#1A0F0B", light="#FFFFFF", border=2)
                return self._send(200, svg.encode(), "image/svg+xml", {"Cache-Control": "no-cache"})
            if p == "/api/events":
                return self._events()
            return self._json({"error": "introuvable"}, 404)

        def do_POST(self):
            p = urlparse(self.path).path
            # Protection simple contre les requêtes d'autres sites (CSRF) : l'interface
            # envoie toujours cet en-tête, qu'un formulaire externe ne peut pas ajouter.
            if self.headers.get("X-ForLife") != "1":
                return self._json({"error": "interdit"}, 403)
            try:
                body = self._body()
                if p == "/api/preset":
                    station.set_preset(str(body.get("key", "")))
                    return self._json(station.status())
                if p == "/api/location":
                    station.set_location(str(body.get("location", ""))[:60])
                    return self._json(station.status())
            except KeyError:
                return self._json({"error": "preset inconnu"}, 400)
            except (ValueError, json.JSONDecodeError):
                return self._json({"error": "requête invalide"}, 400)
            return self._json({"error": "introuvable"}, 404)

        def _events(self):
            q = station.events.subscribe()
            self.send_response(HTTPStatus.OK)
            self.send_header("Content-Type", "text/event-stream")
            self.send_header("Cache-Control", "no-store")
            self.send_header("Connection", "keep-alive")
            self.end_headers()
            try:
                self.wfile.write(b"retry: 2000\n\n")
                self.wfile.flush()
                while True:
                    try:
                        event = q.get(timeout=15)
                        payload = f"data: {json.dumps(event, ensure_ascii=False)}\n\n"
                    except queue.Empty:
                        payload = ": ping\n\n"
                    self.wfile.write(payload.encode())
                    self.wfile.flush()
            except (BrokenPipeError, ConnectionResetError):
                pass
            finally:
                station.events.unsubscribe(q)

    return Handler


def serve(station: Station, host: str = "127.0.0.1", port: int = 8787) -> tuple[ThreadingHTTPServer, threading.Thread]:
    httpd = ThreadingHTTPServer((host, port), make_handler(station))
    httpd.daemon_threads = True
    t = threading.Thread(target=httpd.serve_forever, daemon=True, name="ui")
    t.start()
    return httpd, t
