"""Lissage de peau automatique (alternative gratuite à SkinFiner).

Principe : pour chaque visage détecté, on mesure la couleur de SA peau (au centre du
visage) puis on construit un masque des pixels de même teinte autour du visage et du
cou. Le masque s'adapte donc à toutes les carnations, des plus claires aux plus
foncées, sans plage de couleur figée. Sur ce masque, séparation de fréquences :
les variations de couleur sont lissées et une partie du grain est réinjectée
pour garder une peau naturelle.
"""

from __future__ import annotations

import cv2
import numpy as np

from .faces import Face

WORK_SIDE = 900


def _roi(face: Face, shape: tuple[int, ...]) -> tuple[int, int, int, int]:
    x, y, w, h = face.box
    H, W = shape[:2]
    x0 = max(0, int(x - 0.35 * w))
    x1 = min(W, int(x + 1.35 * w))
    y0 = max(0, int(y - 0.30 * h))
    y1 = min(H, int(y + 1.70 * h))  # inclut le cou
    return x0, y0, x1, y1


def skin_mask(rgb: np.ndarray, face: Face) -> tuple[np.ndarray, tuple[int, int, int, int]]:
    """Masque flottant 0-1 de la peau dans la zone du visage ; renvoie (masque, roi)."""
    x0, y0, x1, y1 = _roi(face, rgb.shape)
    roi = np.clip(rgb[y0:y1, x0:x1], 0, 1)
    ycc = cv2.cvtColor((roi * 255).astype(np.uint8), cv2.COLOR_RGB2YCrCb).astype(np.float32)

    x, y, w, h = face.box
    cx0, cx1 = int(x + 0.30 * w) - x0, int(x + 0.70 * w) - x0
    cy0, cy1 = int(y + 0.45 * h) - y0, int(y + 0.80 * h) - y0  # joues et nez, sous les yeux
    sample = ycc[max(cy0, 0):max(cy1, 1), max(cx0, 0):max(cx1, 1)].reshape(-1, 3)
    if len(sample) < 20:
        return np.zeros(roi.shape[:2], np.float32), (x0, y0, x1, y1)
    med = np.median(sample, axis=0)
    spread = np.maximum(np.percentile(np.abs(sample - med), 80, axis=0), (0, 6, 6))

    d_cr = np.abs(ycc[..., 1] - med[1]) / (spread[1] * 2.2)
    d_cb = np.abs(ycc[..., 2] - med[2]) / (spread[2] * 2.2)
    d_y = np.abs(ycc[..., 0] - med[0]) / max(spread[0] * 4, 40)
    dist = np.sqrt(d_cr**2 + d_cb**2 + d_y**2)
    mask = np.clip(1.5 - dist, 0, 1)

    # Limite à une ellipse visage + cou pour ne pas lisser le décor de même teinte.
    ell = np.zeros_like(mask)
    center = (int(x + w / 2) - x0, int(y + h * 0.65) - y0)
    axes = (int(w * 0.75), int(h * 1.05))
    cv2.ellipse(ell, center, axes, 0, 0, 360, 1.0, -1)
    mask *= ell
    feather = max(3.0, w / 25)
    mask = cv2.GaussianBlur(mask, (0, 0), feather)
    return mask.astype(np.float32), (x0, y0, x1, y1)


def smooth_skin(rgb: np.ndarray, faces: list[Face], amount: float, texture: float = 0.4, glow: float = 0.0) -> np.ndarray:
    if amount <= 0 or not faces:
        return rgb
    out = rgb.copy()
    for face in faces:
        mask, (x0, y0, x1, y1) = skin_mask(out, face)
        if mask.max() <= 0:
            continue
        roi = out[y0:y1, x0:x1]
        # Le lissage est calculé sur une zone réduite (max ~900 px) puis la
        # correction est remise à l'échelle : même rendu, bien plus rapide en HD.
        k = min(1.0, WORK_SIDE / max(roi.shape[:2]))
        small = cv2.resize(roi, None, fx=k, fy=k, interpolation=cv2.INTER_AREA) if k < 1 else roi
        fw = face.box[2] * k
        # Basses fréquences : filtre bilatéral (préserve les contours du visage).
        sigma_space = max(2.0, fw / 45)
        low = cv2.bilateralFilter(small, d=0, sigmaColor=0.08, sigmaSpace=sigma_space)
        low = cv2.bilateralFilter(low, d=0, sigmaColor=0.06, sigmaSpace=sigma_space)
        # Hautes fréquences fines (grain, pores) à réinjecter.
        fine = small - cv2.GaussianBlur(small, (0, 0), max(0.8, fw / 300))
        smoothed = low + fine * texture
        if glow > 0:
            smoothed = smoothed + glow * 0.06 * (1 - smoothed)
        delta = smoothed - small
        if k < 1:
            delta = cv2.resize(delta, (roi.shape[1], roi.shape[0]), interpolation=cv2.INTER_LINEAR)
        m = (mask * amount)[..., None]
        out[y0:y1, x0:x1] = roi + delta * m
    return out
