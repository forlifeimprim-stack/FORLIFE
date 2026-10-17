"""Chaîne de retouche complète d'une photo.

Pour aller vite sur l'iMac 2015, la retouche se fait en deux passes :
- `express` : à la taille web (2048 px), en quelques secondes, publiée en premier ;
- `hd` : en pleine définition, calculée juste après et qui remplace la version web.
"""

from __future__ import annotations

import time
from dataclasses import dataclass, field
from pathlib import Path

import cv2
import numpy as np

from . import adjust
from .faces import Face, FaceEngine
from .lut import apply_lut, load_cube
from .presets import Preset
from .skin import smooth_skin

_LUT_CACHE: dict[str, np.ndarray] = {}


@dataclass
class Rendition:
    path: Path
    width: int
    height: int


@dataclass
class ProcessResult:
    faces: list[Face] = field(default_factory=list)
    sharpness: float = 0.0
    renditions: dict[str, Rendition] = field(default_factory=dict)
    timings: dict[str, float] = field(default_factory=dict)
    source_size: tuple[int, int] = (0, 0)


def read_image(path: Path) -> np.ndarray:
    """Lit un JPEG/PNG/TIFF en BGR uint8, orientation EXIF appliquée."""
    data = np.fromfile(str(path), dtype=np.uint8)
    img = cv2.imdecode(data, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError(f"Image illisible : {path}")
    return img


def resize_max(img: np.ndarray, max_side: int) -> tuple[np.ndarray, float]:
    h, w = img.shape[:2]
    if max_side <= 0 or max(h, w) <= max_side:
        return img, 1.0
    scale = max_side / max(h, w)
    return cv2.resize(img, (round(w * scale), round(h * scale)), interpolation=cv2.INTER_AREA), scale


def scale_faces(faces: list[Face], scale: float) -> list[Face]:
    out = []
    for f in faces:
        row = f.row.copy()
        row[:14] *= scale
        x, y, w, h = f.box
        out.append(Face(box=(round(x * scale), round(y * scale), round(w * scale), round(h * scale)), score=f.score, row=row, embedding=f.embedding))
    return out


def sharpness_score(bgr: np.ndarray, faces: list[Face]) -> float:
    """Variance du laplacien, sur les visages s'il y en a (c'est là que le flou se voit)."""
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    regions = []
    for f in faces:
        x, y, w, h = f.box
        crop = gray[max(y, 0):y + h, max(x, 0):x + w]
        if crop.size:
            regions.append(cv2.resize(crop, (256, 256)))
    if not regions:
        regions = [cv2.resize(gray, (1024, 1024 * gray.shape[0] // gray.shape[1]))]
    return float(max(cv2.Laplacian(r, cv2.CV_32F).var() for r in regions))


def render(bgr: np.ndarray, preset: Preset, faces: list[Face]) -> np.ndarray:
    """Applique le preset à une image BGR uint8 et renvoie une image BGR uint8.

    Les réglages globaux passent par des tables 8 bits et des cartes basse
    résolution : une photo de 24 Mpx se traite en quelques secondes sur un
    processeur modeste. Seule la zone de peau est traitée en flottant.
    """
    h, w = bgr.shape[:2]
    small_bgr, _ = resize_max(bgr, 512)
    small = cv2.cvtColor(small_bgr, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0

    # 1. Balance des blancs, exposition, contraste, chaleur : une table par canal.
    lr, lg, lb = adjust.tone_luts(small, preset.auto_white_balance, preset.exposure_target, preset.contrast, preset.warmth, preset.tint)
    b_, g_, r_ = cv2.split(bgr)
    img = cv2.merge([cv2.LUT(b_, lb), cv2.LUT(g_, lg), cv2.LUT(r_, lr)])

    # 2. Ombres, hautes lumières et vignettage : cartes lissées (mesurées après l'étape 1).
    small_toned = cv2.cvtColor(resize_max(img, 512)[0], cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
    maps = adjust.local_tone_maps(small_toned, (w, h), preset.shadows, preset.highlights, preset.vignette)
    if maps is not None:
        gain, offset = maps
        f = img.astype(np.float32)
        f *= gain[..., None]
        f += (offset * 255)[..., None]
        img = np.clip(f, 0, 255).astype(np.uint8)

    # 3. Peau : uniquement dans les zones des visages.
    if preset.skin_smoothing > 0 and faces:
        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        rgb = _smooth_faces_uint8(rgb, faces, preset)
        img = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)

    # 4. Saturation (ou noir et blanc).
    if preset.saturation:
        gray = cv2.cvtColor(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY), cv2.COLOR_GRAY2BGR)
        s = preset.saturation
        img = cv2.addWeighted(img, 1 + s, gray, -s, 0)

    # 5. LUT 3D optionnelle (look personnalisé).
    if preset.lut:
        table = _LUT_CACHE.get(preset.lut)
        if table is None:
            table = _LUT_CACHE[preset.lut] = load_cube(Path(preset.lut))
        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
        rgb = apply_lut(rgb, table, preset.lut_strength)
        img = cv2.cvtColor(np.clip(rgb * 255 + 0.5, 0, 255).astype(np.uint8), cv2.COLOR_RGB2BGR)

    # 6. Netteté de sortie (masque flou).
    if preset.sharpen > 0:
        sigma = max(0.6, max(h, w) / 2048)
        blur = cv2.GaussianBlur(img, (0, 0), sigma)
        amt = preset.sharpen * 1.2
        img = cv2.addWeighted(img, 1 + amt, blur, -amt, 0)
    return img


def _smooth_faces_uint8(rgb: np.ndarray, faces: list[Face], preset: Preset) -> np.ndarray:
    """Convertit en flottant seulement la zone englobant les visages."""
    H, W = rgb.shape[:2]
    xs0, ys0, xs1, ys1 = W, H, 0, 0
    for f in faces:
        x, y, fw, fh = f.box
        xs0, ys0 = min(xs0, int(x - 0.5 * fw)), min(ys0, int(y - 0.5 * fh))
        xs1, ys1 = max(xs1, int(x + 1.5 * fw)), max(ys1, int(y + 2.0 * fh))
    xs0, ys0, xs1, ys1 = max(xs0, 0), max(ys0, 0), min(xs1, W), min(ys1, H)
    if xs1 <= xs0 or ys1 <= ys0:
        return rgb
    region = rgb[ys0:ys1, xs0:xs1].astype(np.float32) / 255.0
    local = scale_faces(faces, 1.0)
    for f in local:
        x, y, fw, fh = f.box
        f.box = (x - xs0, y - ys0, fw, fh)
    region = smooth_skin(region, local, preset.skin_smoothing, preset.skin_texture, preset.skin_glow)
    out = rgb.copy()
    out[ys0:ys1, xs0:xs1] = np.clip(region * 255 + 0.5, 0, 255).astype(np.uint8)
    return out


def write_jpeg(path: Path, bgr: np.ndarray, quality: int) -> Rendition:
    path.parent.mkdir(parents=True, exist_ok=True)
    ok, buf = cv2.imencode(".jpg", bgr, [cv2.IMWRITE_JPEG_QUALITY, quality, cv2.IMWRITE_JPEG_PROGRESSIVE, 1])
    if not ok:
        raise ValueError(f"Encodage JPEG impossible : {path}")
    tmp = path.with_suffix(".tmp")
    buf.tofile(str(tmp))
    tmp.replace(path)
    return Rendition(path=path, width=bgr.shape[1], height=bgr.shape[0])


def process(
    source: Path,
    preset: Preset,
    out_dir: Path,
    name: str,
    face_engine: FaceEngine | None = None,
    web_max_side: int = 2048,
    hd_max_side: int = 0,
    thumb_max_side: int = 400,
    passes: tuple[str, ...] = ("express", "hd"),
    faces: list[Face] | None = None,
) -> ProcessResult:
    """Retouche `source` et écrit `web/`, `thumbs/` (passe express) et `hd/` dans `out_dir`."""
    res = ProcessResult()
    t0 = time.perf_counter()
    original = read_image(source)
    res.source_size = (original.shape[1], original.shape[0])
    res.timings["lecture"] = time.perf_counter() - t0

    t = time.perf_counter()
    if faces is not None:
        res.faces = faces
    else:
        res.faces = face_engine.analyse(original) if face_engine else []
    res.timings["visages"] = time.perf_counter() - t

    if "express" in passes:
        t = time.perf_counter()
        web_src, scale = resize_max(original, web_max_side)
        web_faces = scale_faces(res.faces, scale)
        res.sharpness = sharpness_score(web_src, web_faces)
        web = render(web_src, preset, web_faces)
        res.renditions["web"] = write_jpeg(out_dir / "web" / f"{name}.jpg", web, 88)
        thumb, _ = resize_max(web, thumb_max_side)
        res.renditions["thumb"] = write_jpeg(out_dir / "thumbs" / f"{name}.jpg", thumb, 80)
        res.timings["express"] = time.perf_counter() - t

    if "hd" in passes:
        t = time.perf_counter()
        hd_src, scale = resize_max(original, hd_max_side)
        hd = render(hd_src, preset, scale_faces(res.faces, scale))
        res.renditions["hd"] = write_jpeg(out_dir / "hd" / f"{name}.jpg", hd, 92)
        res.timings["hd"] = time.perf_counter() - t

    res.timings["total"] = time.perf_counter() - t0
    return res
