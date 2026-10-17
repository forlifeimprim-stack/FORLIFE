"""Configuration de la Station, lue depuis un fichier JSON (voir `forlife-station init`)."""

from __future__ import annotations

import json
from dataclasses import asdict, dataclass, field
from pathlib import Path

DEFAULT_HOME = Path.home() / "ForLifeStudio"


@dataclass
class FtpConfig:
    enabled: bool = True
    host: str = "0.0.0.0"
    port: int = 2121
    user: str = "forlife"
    password: str = ""  # généré par `forlife-station init`
    # Adresses IP autorisées (celles des boîtiers). Vide = tout le réseau local.
    allowed_ips: list[str] = field(default_factory=list)


@dataclass
class CameraConfig:
    """Un boîtier piloté en PC Remote (A7 III) via gphoto2."""

    name: str = "A7III"
    # "usb" ou "ptpip:<adresse IP du boîtier>"
    port: str = "usb"
    enabled: bool = False


@dataclass
class StationConfig:
    home: str = str(DEFAULT_HOME)
    studio_id: str = "forlife-studio"
    timezone: str = "Africa/Abidjan"
    location: str = ""  # suffixe du dossier du jour (événement), ex. "Mariage-Kone"
    active_preset: str = "signature"
    newest_first: bool = True  # la dernière photo prise passe avant la file
    workers: int = 2
    web_max_side: int = 2048
    hd_max_side: int = 0  # 0 = pleine définition
    thumb_max_side: int = 400
    backend: str = "local"  # "local" ou "firebase"
    firebase_credentials: str = ""  # chemin du compte de service (Station)
    firebase_bucket: str = ""
    ftp: FtpConfig = field(default_factory=FtpConfig)
    cameras: list[CameraConfig] = field(default_factory=list)

    @property
    def home_path(self) -> Path:
        return Path(self.home).expanduser()

    @property
    def incoming_dir(self) -> Path:
        return self.home_path / "arrivees"

    @property
    def library_dir(self) -> Path:
        return self.home_path / "dossiers"

    @property
    def db_path(self) -> Path:
        return self.home_path / "station.sqlite3"

    @property
    def models_dir(self) -> Path:
        return Path(__file__).resolve().parent.parent / "models"

    def ensure_dirs(self) -> None:
        for d in (self.home_path, self.incoming_dir, self.library_dir):
            d.mkdir(parents=True, exist_ok=True)

    def to_json(self) -> str:
        return json.dumps(asdict(self), indent=2, ensure_ascii=False)

    @classmethod
    def from_dict(cls, data: dict) -> "StationConfig":
        data = dict(data)
        ftp = FtpConfig(**data.pop("ftp", {}))
        cameras = [CameraConfig(**c) for c in data.pop("cameras", [])]
        return cls(ftp=ftp, cameras=cameras, **data)

    @classmethod
    def load(cls, path: Path) -> "StationConfig":
        return cls.from_dict(json.loads(Path(path).read_text(encoding="utf-8")))

    def save(self, path: Path) -> None:
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        Path(path).write_text(self.to_json(), encoding="utf-8")
