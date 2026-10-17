"""Commandes : `forlife-station init | run | diag | process`."""

from __future__ import annotations

import argparse
import logging
import secrets
import shutil
import signal
import socket
import subprocess
import sys
import threading
import time
import webbrowser
from pathlib import Path

from .config import DEFAULT_HOME, CameraConfig, StationConfig

CONFIG_NAME = "config.json"


def config_path(home: Path) -> Path:
    return Path(home).expanduser() / CONFIG_NAME


def local_ips() -> list[str]:
    ips = set()
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("8.8.8.8", 80))
            ips.add(s.getsockname()[0])
    except OSError:
        pass
    try:
        for info in socket.getaddrinfo(socket.gethostname(), None, socket.AF_INET):
            ips.add(info[4][0])
    except OSError:
        pass
    return sorted(ip for ip in ips if not ip.startswith("127."))


def cmd_init(args) -> int:
    home = Path(args.home).expanduser()
    path = config_path(home)
    if path.exists() and not args.force:
        print(f"Configuration déjà présente : {path} (ajoutez --force pour la recréer)")
        return 1
    cfg = StationConfig(home=str(home))
    cfg.ftp.password = secrets.token_urlsafe(9)
    cfg.cameras = [CameraConfig(name="A7III", port="usb", enabled=False)]
    cfg.ensure_dirs()
    cfg.save(path)
    ip = (local_ips() or ["<adresse IP de l'iMac>"])[0]
    print(f"""
Configuration créée : {path}

Réglages à saisir UNE FOIS dans le FX30 (Réseau > Transfert FTP > Paramètres serveur) :
  Nom d'hôte   : {ip}
  Port         : {cfg.ftp.port}
  Utilisateur  : {cfg.ftp.user}
  Mot de passe : {cfg.ftp.password}
  Mode passif  : Activé       Sécurité : désactivée (réseau Wi-Fi privé ForLife)
  Fichiers     : JPEG uniquement

Puis lancez :  forlife-station run
""")
    return 0


def load_config(args) -> StationConfig:
    path = config_path(args.home)
    if not path.exists():
        sys.exit(f"Aucune configuration dans {path}. Lancez d'abord : forlife-station init")
    return StationConfig.load(path)


def cmd_run(args) -> int:
    from .receivers.ftp import build_server, serve_in_background
    from .receivers.gphoto import TetherReceiver
    from .receivers.watch import FolderWatcher
    from .server import serve
    from .station import Station

    cfg = load_config(args)
    if args.location is not None:
        cfg.location = args.location
    station = Station(cfg)
    station.start_workers()

    if cfg.ftp.enabled:
        ftp = build_server(cfg.ftp, cfg.incoming_dir / "ftp", station.on_file)
        serve_in_background(ftp)
        print(f"FTP prêt sur le port {cfg.ftp.port} ({', '.join(local_ips()) or 'réseau local'})")

    for cam in cfg.cameras:
        if cam.enabled:
            rx = TetherReceiver(cam, cfg.incoming_dir / cam.name, station.on_file)
            station.tethers.append(rx)
            rx.start()
            print(f"PC Remote : écoute de {cam.name} ({cam.port})")

    import_dir = cfg.home_path / "import"
    import_dir.mkdir(exist_ok=True)
    FolderWatcher(import_dir, station.on_file).start()
    print(f"Dossier d'import (carte SD) : {import_dir}")

    host = "0.0.0.0" if args.lan else "127.0.0.1"
    serve(station, host, cfg.ui_port)
    url = f"http://localhost:{cfg.ui_port}"
    print(f"Interface : {url}")
    if not args.no_browser:
        threading.Timer(1.0, lambda: webbrowser.open(url)).start()

    stop = threading.Event()
    signal.signal(signal.SIGINT, lambda *_: stop.set())
    signal.signal(signal.SIGTERM, lambda *_: stop.set())
    stop.wait()
    station.stop()
    for rx in station.tethers:
        rx.stop()
    print("Station arrêtée.")
    return 0


def _check(label: str, ok: bool, detail: str = "") -> bool:
    print(f"  [{'OK' if ok else '!!'}] {label}{' : ' + detail if detail else ''}")
    return ok


def cmd_diag(args) -> int:
    """Diagnostic de la semaine d'essais : outils, réseau, boîtiers."""
    from .engine.faces import models_available

    cfg = StationConfig.load(config_path(args.home)) if config_path(args.home).exists() else StationConfig(home=str(args.home))
    print("ForLife Studio — diagnostic\n")
    print("Logiciels")
    _check("Python", sys.version_info >= (3, 10), sys.version.split()[0])
    _check("Modèles de visages", models_available(cfg.models_dir), str(cfg.models_dir))
    gp = shutil.which("gphoto2")
    _check("gphoto2 (PC Remote A7 III)", bool(gp), gp or "installez-le : brew install gphoto2")

    print("\nRéseau")
    ips = local_ips()
    _check("Adresse IP de la Station", bool(ips), ", ".join(ips) or "aucune")
    with socket.socket() as s:
        try:
            s.bind(("0.0.0.0", cfg.ftp.port))
            _check(f"Port FTP {cfg.ftp.port} libre", True)
        except OSError:
            _check(f"Port FTP {cfg.ftp.port} libre", False, "déjà utilisé (Station déjà lancée ?)")

    if gp:
        print("\nBoîtiers détectés (USB)")
        out = subprocess.run([gp, "--auto-detect"], capture_output=True, text=True, timeout=20).stdout
        lines = [line for line in out.splitlines()[2:] if line.strip()]
        _check("Boîtier en USB", bool(lines), "; ".join(line.strip() for line in lines) or "aucun — mettez l'A7 III en « Commande via PC » et branchez-le")
        if sys.platform == "darwin":
            busy = subprocess.run(["pgrep", "-x", "ptpcamerad"], capture_output=True).returncode == 0
            _check("macOS libère l'appareil", not busy, "ptpcamerad actif : la Station le met en pause au lancement" if busy else "")
        for cam in cfg.cameras:
            if cam.port.startswith("ptpip:"):
                print(f"\nTest Wi-Fi PC Remote : {cam.name} ({cam.port})")
                try:
                    res = subprocess.run([gp, "--port", cam.port, "--summary"], capture_output=True, text=True, timeout=30)
                    _check("Connexion PTP/IP", res.returncode == 0, (res.stdout or res.stderr).strip().splitlines()[0] if (res.stdout or res.stderr) else "")
                except subprocess.TimeoutExpired:
                    _check("Connexion PTP/IP", False, "pas de réponse en 30 s")
    print("\nPour le FX30 : lancez `forlife-station run`, déclenchez, la source « Wi-Fi FTP » doit apparaître.")
    return 0


def cmd_process(args) -> int:
    """Retouche des fichiers avec un preset (pour comparer les styles)."""
    from .engine import pipeline
    from .engine.faces import FaceEngine, models_available
    from .engine.presets import load_presets

    cfg = StationConfig.load(config_path(args.home)) if config_path(args.home).exists() else StationConfig(home=str(args.home))
    presets = load_presets(cfg.home_path / "presets")
    keys = list(presets) if args.preset == "tous" else [args.preset]
    fe = FaceEngine(cfg.models_dir) if models_available(cfg.models_dir) else None
    out = Path(args.out)
    for f in args.files:
        for key in keys:
            t = time.perf_counter()
            res = pipeline.process(Path(f), presets[key], out / key, Path(f).stem, fe, cfg.web_max_side, cfg.hd_max_side, cfg.thumb_max_side)
            print(f"{Path(f).name} [{key}] : {len(res.faces)} visage(s), {time.perf_counter() - t:.1f} s -> {res.renditions['hd'].path}")
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="forlife-station", description="Station ForLife Studio")
    parser.add_argument("--home", default=str(DEFAULT_HOME), help="dossier de travail (défaut : ~/ForLifeStudio)")
    parser.add_argument("-v", "--verbose", action="store_true")
    sub = parser.add_subparsers(dest="cmd", required=True)

    p = sub.add_parser("init", help="crée la configuration et affiche les réglages du FX30")
    p.add_argument("--force", action="store_true")
    p.set_defaults(func=cmd_init)

    p = sub.add_parser("run", help="démarre la Station et son interface")
    p.add_argument("--location", help="nom de l'événement (suffixe du dossier du jour)")
    p.add_argument("--no-browser", action="store_true")
    p.add_argument("--lan", action="store_true", help="rend l'interface accessible aux autres appareils du réseau")
    p.set_defaults(func=cmd_run)

    p = sub.add_parser("diag", help="vérifie logiciels, réseau et boîtiers")
    p.set_defaults(func=cmd_diag)

    p = sub.add_parser("process", help="retouche des fichiers avec un preset")
    p.add_argument("files", nargs="+")
    p.add_argument("--preset", default="tous")
    p.add_argument("--out", default="retouches")
    p.set_defaults(func=cmd_process)

    args = parser.parse_args(argv)
    logging.basicConfig(level=logging.DEBUG if args.verbose else logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
