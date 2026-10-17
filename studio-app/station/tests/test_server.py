import json
import urllib.error
import urllib.request

import pytest

from forlife_station.config import StationConfig
from forlife_station.server import serve
from forlife_station.station import Station


@pytest.fixture
def ui(tmp_path):
    st = Station(StationConfig(home=str(tmp_path / "h")))
    httpd, _ = serve(st, "127.0.0.1", 0)
    yield st, f"http://127.0.0.1:{httpd.server_address[1]}"
    httpd.shutdown()


def get(url):
    with urllib.request.urlopen(url, timeout=5) as r:
        return r.status, r.headers.get("Content-Type"), r.read()


def post(url, body, csrf=True):
    headers = {"Content-Type": "application/json"}
    if csrf:
        headers["X-ForLife"] = "1"
    req = urllib.request.Request(url, data=json.dumps(body).encode(), method="POST", headers=headers)
    return urllib.request.urlopen(req, timeout=5)


def test_pages_and_api(ui):
    st, base = ui
    assert get(base + "/")[0] == 200
    assert get(base + "/static/app.js")[0] == 200
    _, ctype, body = get(base + "/api/qr.svg")
    assert ctype == "image/svg+xml" and b"<svg" in body
    presets = json.loads(get(base + "/api/presets")[2])
    assert presets[0]["key"] == "signature"
    assert json.loads(get(base + "/api/status")[2])["galleryUrl"].endswith("/s/forlife-studio")


def test_preset_change_requires_header(ui):
    st, base = ui
    with pytest.raises(urllib.error.HTTPError) as e:
        post(base + "/api/preset", {"key": "editorial"}, csrf=False)
    assert e.value.code == 403
    assert json.loads(post(base + "/api/preset", {"key": "editorial"}).read())["preset"] == "editorial"
    with pytest.raises(urllib.error.HTTPError):
        post(base + "/api/preset", {"key": "inconnu"})


def test_location_changes_folder(ui):
    st, base = ui
    data = json.loads(post(base + "/api/location", {"location": "Mariage Koné"}).read())
    assert data["folder"].endswith("_Mariage-Kone")


def test_path_traversal_blocked(ui):
    st, base = ui
    for path in ["/media/../config.json", "/static/../server.py", "/media/%2e%2e/x"]:
        with pytest.raises(urllib.error.HTTPError) as e:
            urllib.request.urlopen(base + path, timeout=5)
        assert e.value.code in (403, 404)
    with pytest.raises(urllib.error.HTTPError):
        urllib.request.urlopen(base + "/api/photos?folder=../x", timeout=5)
