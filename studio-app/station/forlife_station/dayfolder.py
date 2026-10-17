"""Dossier du jour : `AAAA-MM-JJ` ou `AAAA-MM-JJ_<lieu>`, créé à la première photo."""

from __future__ import annotations

import re
import unicodedata
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

SUBDIRS = ("originaux", "hd", "web", "thumbs", "faces")


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = re.sub(r"[^A-Za-z0-9]+", "-", text).strip("-")
    return text[:60]


def folder_name(now: datetime | None = None, tz: str = "Africa/Abidjan", location: str = "") -> str:
    now = now.astimezone(ZoneInfo(tz)) if now else datetime.now(ZoneInfo(tz))
    name = now.strftime("%Y-%m-%d")
    slug = slugify(location)
    return f"{name}_{slug}" if slug else name


def ensure_day_folder(library: Path, name: str) -> Path:
    root = Path(library) / name
    for sub in SUBDIRS:
        (root / sub).mkdir(parents=True, exist_ok=True)
    return root
