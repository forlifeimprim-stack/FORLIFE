"""Lecture et application de LUT 3D au format .cube (Resolve, darktable, Lightroom...)."""

from __future__ import annotations

from pathlib import Path

import numpy as np


def load_cube(path: Path) -> np.ndarray:
    """Renvoie un tableau (N, N, N, 3) indexé [b, g, r] comme le format .cube (R varie le plus vite)."""
    size = 0
    values: list[list[float]] = []
    domain_min = np.zeros(3, np.float32)
    domain_max = np.ones(3, np.float32)
    for raw in Path(path).read_text(encoding="utf-8", errors="ignore").splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        head = line.split()[0].upper()
        if head == "LUT_3D_SIZE":
            size = int(line.split()[1])
        elif head == "DOMAIN_MIN":
            domain_min = np.array(line.split()[1:4], np.float32)
        elif head == "DOMAIN_MAX":
            domain_max = np.array(line.split()[1:4], np.float32)
        elif head in ("TITLE", "LUT_1D_SIZE", "LUT_1D_INPUT_RANGE", "LUT_3D_INPUT_RANGE"):
            if head == "LUT_1D_SIZE":
                raise ValueError("Les LUT 1D ne sont pas prises en charge")
        else:
            values.append([float(v) for v in line.split()[:3]])
    if size < 2 or len(values) != size**3:
        raise ValueError(f"Fichier .cube invalide : {path}")
    table = np.asarray(values, np.float32).reshape(size, size, size, 3)
    span = np.where(domain_max - domain_min == 0, 1, domain_max - domain_min)
    return (table - domain_min) / span


def apply_lut(rgb: np.ndarray, table: np.ndarray, strength: float = 1.0) -> np.ndarray:
    """Applique la LUT (interpolation trilinéaire) à une image RGB flottante 0-1."""
    n = table.shape[0]
    x = np.clip(rgb, 0, 1) * (n - 1)
    i0 = np.floor(x).astype(np.int32)
    i1 = np.minimum(i0 + 1, n - 1)
    f = x - i0
    r0, g0, b0 = i0[..., 0], i0[..., 1], i0[..., 2]
    r1, g1, b1 = i1[..., 0], i1[..., 1], i1[..., 2]
    fr, fg, fb = f[..., 0:1], f[..., 1:2], f[..., 2:3]

    def t(b, g, r):
        return table[b, g, r]

    c00 = t(b0, g0, r0) * (1 - fr) + t(b0, g0, r1) * fr
    c01 = t(b0, g1, r0) * (1 - fr) + t(b0, g1, r1) * fr
    c10 = t(b1, g0, r0) * (1 - fr) + t(b1, g0, r1) * fr
    c11 = t(b1, g1, r0) * (1 - fr) + t(b1, g1, r1) * fr
    c0 = c00 * (1 - fg) + c01 * fg
    c1 = c10 * (1 - fg) + c11 * fg
    out = c0 * (1 - fb) + c1 * fb
    if strength >= 1:
        return out
    return rgb + (out - rgb) * strength


def identity_cube(n: int = 17) -> np.ndarray:
    grid = np.linspace(0, 1, n, dtype=np.float32)
    b, g, r = np.meshgrid(grid, grid, grid, indexing="ij")
    return np.stack([r, g, b], axis=-1)
