"""Réglages globaux sur une image RGB flottante (0-1) : balance des blancs, exposition,
ombres et hautes lumières, contraste, couleur, netteté, vignettage."""

from __future__ import annotations

import cv2
import numpy as np

LUMA = np.array([0.2126, 0.7152, 0.0722], np.float32)


def luminance(rgb: np.ndarray) -> np.ndarray:
    return rgb @ LUMA


def auto_white_balance(rgb: np.ndarray, strength: float = 0.8) -> np.ndarray:
    """Monde gris restreint aux tons moyens et peu saturés, gains bornés pour ne pas
    dénaturer une ambiance volontaire (coucher de soleil, gélatine colorée)."""
    small = cv2.resize(rgb, (256, 256), interpolation=cv2.INTER_AREA)
    y = luminance(small)
    sat = small.max(axis=-1) - small.min(axis=-1)
    mask = (y > 0.15) & (y < 0.85) & (sat < 0.25)
    if mask.sum() < 500:
        return rgb
    means = small[mask].mean(axis=0)
    gains = means.mean() / np.maximum(means, 1e-4)
    gains = np.clip(gains, 0.85, 1.18)
    gains = 1 + (gains - 1) * strength
    return rgb * gains.astype(np.float32)


def auto_exposure(rgb: np.ndarray, target: float) -> np.ndarray:
    """Ramène la luminance médiane vers `target` par une courbe gamma (pas d'écrêtage brutal)."""
    if target <= 0:
        return rgb
    y = luminance(cv2.resize(rgb, (256, 256), interpolation=cv2.INTER_AREA))
    median = float(np.clip(np.median(y), 0.02, 0.98))
    gamma = np.log(target) / np.log(median)
    gamma = float(np.clip(gamma, 0.55, 1.6))
    return np.power(np.clip(rgb, 0, 1), gamma)


def shadows_highlights(rgb: np.ndarray, shadows: float, highlights: float) -> np.ndarray:
    if shadows <= 0 and highlights <= 0:
        return rgb
    y = luminance(rgb)
    # Luminance « locale » floutée pour agir par zones et non pixel par pixel.
    h, w = y.shape
    k = min(1.0, 512 / max(h, w))
    small = cv2.resize(y, None, fx=k, fy=k, interpolation=cv2.INTER_AREA)
    base = cv2.GaussianBlur(small, (0, 0), max(small.shape) / 60)
    base = cv2.resize(base, (w, h), interpolation=cv2.INTER_LINEAR)
    lift = shadows * 0.35 * np.clip(1 - base / 0.5, 0, 1) ** 2
    pull = highlights * 0.30 * np.clip((base - 0.6) / 0.4, 0, 1) ** 2
    new_y = np.clip(y + lift * (1 - y) - pull * y, 0, 1)
    ratio = (new_y + 1e-4) / (y + 1e-4)
    return rgb * ratio[..., None]


def contrast(rgb: np.ndarray, amount: float) -> np.ndarray:
    if amount == 0:
        return rgb
    # Courbe en S (smoothstep) centrée sur 0,5 ; une valeur négative adoucit.
    x = np.clip(rgb, 0, 1)
    s = x * x * (3 - 2 * x)
    return x + (s - x) * amount


def color(rgb: np.ndarray, saturation: float, warmth: float, tint: float) -> np.ndarray:
    out = rgb
    if warmth or tint:
        gains = np.array([1 + 0.08 * warmth, 1 - 0.06 * tint, 1 - 0.08 * warmth], np.float32)
        out = out * gains
    if saturation:
        y = luminance(out)[..., None]
        out = y + (out - y) * (1 + saturation)
    return out


def sharpen(rgb: np.ndarray, amount: float, max_side: int) -> np.ndarray:
    if amount <= 0:
        return rgb
    sigma = max(0.6, max_side / 2048)
    blur = cv2.GaussianBlur(rgb, (0, 0), sigma)
    return rgb + (rgb - blur) * amount * 1.2


def vignette(rgb: np.ndarray, amount: float) -> np.ndarray:
    if amount <= 0:
        return rgb
    h, w = rgb.shape[:2]
    yy, xx = np.ogrid[:h, :w]
    yy, xx = yy.astype(np.float32), xx.astype(np.float32)
    d = np.sqrt(((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2) / np.sqrt(2)
    mask = 1 - amount * 0.6 * np.clip((d - 0.45) / 0.55, 0, 1) ** 2
    return rgb * mask[..., None].astype(np.float32)


# --- Version rapide pour la pleine définition -------------------------------
# Les réglages « point par point » (balance des blancs, exposition, contraste,
# chaleur) sont combinés en une table de 256 valeurs par canal, appliquée en une
# seule passe sur l'image 8 bits. Les statistiques sont mesurées sur une miniature.


def wb_gains(small_rgb: np.ndarray, strength: float = 0.6) -> np.ndarray:
    y = luminance(small_rgb)
    sat = small_rgb.max(axis=-1) - small_rgb.min(axis=-1)
    mask = (y > 0.15) & (y < 0.85) & (sat < 0.25)
    if mask.sum() < 500:
        return np.ones(3, np.float32)
    means = small_rgb[mask].mean(axis=0)
    gains = np.clip(means.mean() / np.maximum(means, 1e-4), 0.85, 1.18)
    return (1 + (gains - 1) * strength).astype(np.float32)


def exposure_gamma(small_rgb: np.ndarray, target: float) -> float:
    if target <= 0:
        return 1.0
    median = float(np.clip(np.median(luminance(small_rgb)), 0.02, 0.98))
    return float(np.clip(np.log(target) / np.log(median), 0.55, 1.6))


def tone_luts(small_rgb: np.ndarray, auto_wb: bool, exposure_target: float, contrast_amount: float, warmth: float, tint: float) -> list[np.ndarray]:
    """Renvoie 3 tables uint8 (ordre R, G, B)."""
    gains = wb_gains(small_rgb) if auto_wb else np.ones(3, np.float32)
    balanced = np.clip(small_rgb * gains, 0, 1)
    gamma = exposure_gamma(balanced, exposure_target)
    warm = np.array([1 + 0.08 * warmth, 1 - 0.06 * tint, 1 - 0.08 * warmth], np.float32)
    x = np.linspace(0, 1, 256, dtype=np.float32)
    luts = []
    for c in range(3):
        v = np.clip(x * gains[c], 0, 1) ** gamma
        v = np.clip(v, 0, 1)
        v = v + (v * v * (3 - 2 * v) - v) * contrast_amount
        v = v * warm[c]
        luts.append(np.clip(v * 255 + 0.5, 0, 255).astype(np.uint8))
    return luts


def local_tone_maps(small_rgb: np.ndarray, size: tuple[int, int], shadows: float, highlights: float, vignette_amount: float) -> tuple[np.ndarray, np.ndarray] | None:
    """Cartes (gain, décalage) basse résolution pour ombres, hautes lumières et vignettage :
    sortie = image * gain + 255 * décalage. Renvoie None si rien à faire."""
    if shadows <= 0 and highlights <= 0 and vignette_amount <= 0:
        return None
    w, h = size
    y = luminance(small_rgb)
    base = cv2.GaussianBlur(y, (0, 0), max(y.shape) / 60)
    lift = shadows * 0.35 * np.clip(1 - base / 0.5, 0, 1) ** 2
    pull = highlights * 0.30 * np.clip((base - 0.6) / 0.4, 0, 1) ** 2
    sh, sw = y.shape
    yy, xx = np.mgrid[0:sh, 0:sw].astype(np.float32)
    d = np.sqrt(((xx - sw / 2) / (sw / 2)) ** 2 + ((yy - sh / 2) / (sh / 2)) ** 2) / np.sqrt(2)
    vig = 1 - vignette_amount * 0.6 * np.clip((d - 0.45) / 0.55, 0, 1) ** 2
    gain = ((1 - lift - pull) * vig).astype(np.float32)
    offset = (lift * vig).astype(np.float32)
    up = lambda m: cv2.resize(m, (w, h), interpolation=cv2.INTER_LINEAR)
    return up(gain), up(offset)
