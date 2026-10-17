"""Presets de retouche. Les presets intégrés sont dans `presets/*.json` ; un dossier
utilisateur peut en ajouter ou en remplacer (même nom de fichier)."""

from __future__ import annotations

import json
from dataclasses import asdict, dataclass, fields
from pathlib import Path

BUILTIN_DIR = Path(__file__).parent / "presets"
ORDER = ["signature", "peaux-ebene", "corporate", "editorial", "exterieur", "noir-blanc", "evenement-rapide"]


@dataclass
class Preset:
    key: str
    name: str
    description: str = ""
    # Luminance médiane visée (0-1) pour l'exposition automatique ; 0 = désactivée.
    exposure_target: float = 0.46
    auto_white_balance: bool = True
    contrast: float = 0.0  # -1..1
    saturation: float = 0.0  # -1 (noir et blanc) .. 1
    warmth: float = 0.0  # -1 (froid) .. 1 (chaud)
    tint: float = 0.0  # -1 (vert) .. 1 (magenta)
    shadows: float = 0.0  # 0..1 : débouchage des ombres
    highlights: float = 0.0  # 0..1 : récupération des hautes lumières
    skin_smoothing: float = 0.0  # 0..1
    skin_texture: float = 0.4  # part de grain de peau conservée, 0..1
    skin_glow: float = 0.0  # léger éclat sur la peau, 0..1
    sharpen: float = 0.0  # 0..1
    vignette: float = 0.0  # 0..1
    lut: str = ""  # chemin d'un fichier .cube (optionnel)
    lut_strength: float = 1.0

    def to_dict(self) -> dict:
        return asdict(self)


def _from_file(path: Path) -> Preset:
    data = json.loads(path.read_text(encoding="utf-8"))
    known = {f.name for f in fields(Preset)}
    data = {k: v for k, v in data.items() if k in known}
    data["key"] = path.stem
    return Preset(**data)


def load_presets(user_dir: Path | None = None) -> dict[str, Preset]:
    presets = {p.stem: _from_file(p) for p in sorted(BUILTIN_DIR.glob("*.json"))}
    if user_dir and Path(user_dir).is_dir():
        presets.update({p.stem: _from_file(p) for p in sorted(Path(user_dir).glob("*.json"))})
    rank = {k: i for i, k in enumerate(ORDER)}
    return dict(sorted(presets.items(), key=lambda kv: (rank.get(kv[0], len(ORDER)), kv[0])))
