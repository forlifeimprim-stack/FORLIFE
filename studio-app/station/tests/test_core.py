import json
import time
from datetime import datetime, timezone
from ftplib import FTP
from pathlib import Path

import cv2
import numpy as np
import pytest

from forlife_station.config import FtpConfig, StationConfig
from forlife_station.dayfolder import ensure_day_folder, folder_name, slugify
from forlife_station.engine import pipeline
from forlife_station.engine.faces import models_available, similarity
from forlife_station.engine.lut import apply_lut, identity_cube, load_cube
from forlife_station.engine.presets import load_presets
from forlife_station.jobqueue import MAX_ATTEMPTS, JobQueue
from forlife_station.receivers.ftp import build_server, serve_in_background
from forlife_station.receivers.watch import FolderWatcher
from forlife_station.station import Station


def test_folder_name_uses_abidjan_date_and_location():
    # 23h30 UTC le 16 = 23h30 à Abidjan (UTC+0), toujours le 16.
    now = datetime(2026, 10, 16, 23, 30, tzinfo=timezone.utc)
    assert folder_name(now) == "2026-10-16"
    assert folder_name(now, location="Mariage Koné & Fils") == "2026-10-16_Mariage-Kone-Fils"
    assert slugify("  ") == ""


def test_ensure_day_folder(tmp_path):
    root = ensure_day_folder(tmp_path, "2026-10-17")
    assert {p.name for p in root.iterdir()} == {"originaux", "hd", "web", "thumbs", "faces"}


def test_queue_newest_first_and_retries(tmp_path):
    q = JobQueue(tmp_path / "q.db")
    assert q.add(Path("/a.jpg"), "d")
    time.sleep(0.01)
    assert q.add(Path("/b.jpg"), "d")
    assert not q.add(Path("/a.jpg"), "d")  # doublon ignoré
    job = q.claim("pending", newest_first=True)
    assert job.source_path == "/b.jpg"
    # Le travail réservé n'est pas redonné à un autre ouvrier.
    assert q.claim("pending").source_path == "/a.jpg"
    assert q.claim("pending") is None
    for _ in range(MAX_ATTEMPTS):
        q.fail(job.id, "boom", retry_in=0)
    assert q.get(job.id).status == "error"


def test_presets_load_and_override(tmp_path):
    presets = load_presets()
    assert {"signature", "peaux-ebene", "corporate", "noir-blanc"} <= presets.keys()
    (tmp_path / "signature.json").write_text(json.dumps({"name": "Perso", "contrast": 0.5}))
    custom = load_presets(tmp_path)
    assert custom["signature"].name == "Perso" and custom["signature"].contrast == 0.5


def test_identity_lut_roundtrip(tmp_path):
    table = identity_cube(9)
    lines = ["LUT_3D_SIZE 9"] + [" ".join(f"{v:.6f}" for v in table[b, g, r]) for b in range(9) for g in range(9) for r in range(9)]
    cube = tmp_path / "id.cube"
    cube.write_text("\n".join(lines))
    rgb = np.random.default_rng(1).random((20, 20, 3)).astype(np.float32)
    assert np.allclose(apply_lut(rgb, load_cube(cube)), rgb, atol=1e-5)


@pytest.mark.parametrize("key", ["signature", "peaux-ebene", "noir-blanc", "evenement-rapide"])
def test_pipeline_outputs(photo, tmp_path, key):
    preset = load_presets()[key]
    res = pipeline.process(photo, preset, tmp_path / "out", "p1", None, web_max_side=800, thumb_max_side=200)
    web = cv2.imread(str(res.renditions["web"].path))
    hd = cv2.imread(str(res.renditions["hd"].path))
    assert max(web.shape[:2]) == 800 and max(hd.shape[:2]) == 1600
    assert max(cv2.imread(str(res.renditions["thumb"].path)).shape[:2]) == 200
    if key == "noir-blanc":
        b, g, r = cv2.split(hd.astype(int))
        assert np.abs(b - g).mean() < 3 and np.abs(g - r).mean() < 3


def test_dark_image_is_brightened(tmp_path):
    dark = np.full((600, 900, 3), 35, np.uint8)
    dark[200:400, 300:600] = 70
    src = tmp_path / "dark.jpg"
    cv2.imwrite(str(src), dark)
    res = pipeline.process(src, load_presets()["corporate"], tmp_path / "o", "d", None, passes=("hd",))
    assert cv2.imread(str(res.renditions["hd"].path)).mean() > dark.mean() * 1.5


@pytest.mark.skipif(not models_available(Path(__file__).resolve().parents[1] / "models"), reason="modèles absents")
def test_face_embedding_matches_same_person(models_dir, tmp_path):
    from forlife_station.engine.faces import FaceEngine

    candidates = list(Path("/tmp/claude-0").rglob("lena.jpg"))
    if not candidates:
        pytest.skip("photo de test absente")
    img = cv2.imread(str(candidates[0]))
    fe = FaceEngine(models_dir)
    a = fe.analyse(img)
    b = fe.analyse(cv2.flip(cv2.resize(img, None, fx=1.7, fy=1.7), 1))
    assert len(a) == 1 and len(b) == 1
    assert similarity(a[0].embedding, b[0].embedding) > 0.6


def _station(tmp_path) -> Station:
    cfg = StationConfig(home=str(tmp_path / "home"), web_max_side=600, workers=1)
    cfg.ftp = FtpConfig(port=0, password="secret", host="127.0.0.1")
    return Station(cfg)


def _drain(st: Station):
    while st.process_one():
        pass


def test_station_end_to_end_from_watched_folder(photo, tmp_path):
    st = _station(tmp_path)
    events = st.events.subscribe()
    drop = tmp_path / "carte"
    drop.mkdir()
    (drop / photo.name).write_bytes(photo.read_bytes())
    watcher = FolderWatcher(drop, st.on_file)
    watcher.scan_once()
    watcher.scan_once()  # taille stable -> signalé
    _drain(st)
    folder = st.current_folder()
    manifest = json.loads((st.cfg.library_dir / folder / "photos.json").read_text())
    (pid, entry), = manifest.items()
    assert entry["phase"] == "hd" and {"web", "thumbs", "hd"} <= entry["files"].keys()
    assert (st.cfg.library_dir / folder / "originaux" / photo.name).exists()
    kinds = [events.get_nowait()["type"] for _ in range(events.qsize())]
    assert kinds[0] == "received" and "express_ready" in kinds and kinds[-1] == "published"
    assert st.queue.counts() == {"published": 1}


def test_ftp_upload_is_received(photo, tmp_path):
    st = _station(tmp_path)
    server = build_server(st.cfg.ftp, st.cfg.incoming_dir / "ftp", st.on_file)
    serve_in_background(server)
    port = server.socket.getsockname()[1]
    try:
        ftp = FTP()
        ftp.connect("127.0.0.1", port, timeout=5)
        ftp.login("forlife", "secret")
        with photo.open("rb") as fh:
            ftp.storbinary(f"STOR {photo.name}", fh)
        ftp.quit()
        for _ in range(50):
            if st.queue.counts().get("pending"):
                break
            time.sleep(0.05)
        _drain(st)
        assert st.queue.counts() == {"published": 1}
    finally:
        server.close_all()


def test_ftp_rejects_wrong_password(tmp_path):
    st = _station(tmp_path)
    server = build_server(st.cfg.ftp, st.cfg.incoming_dir / "ftp", st.on_file)
    serve_in_background(server)
    try:
        ftp = FTP()
        ftp.connect("127.0.0.1", server.socket.getsockname()[1], timeout=5)
        with pytest.raises(Exception):
            ftp.login("forlife", "mauvais")
    finally:
        server.close_all()
