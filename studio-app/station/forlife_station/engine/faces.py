"""Détection (YuNet) et empreintes faciales (SFace) avec OpenCV.

Licences : YuNet MIT, SFace Apache-2.0 ; usage commercial autorisé.
Les modèles se téléchargent avec `models/download_models.sh`.
"""

from __future__ import annotations

import threading
from dataclasses import dataclass
from pathlib import Path

import cv2
import numpy as np

YUNET = "face_detection_yunet_2023mar.onnx"
SFACE = "face_recognition_sface_2021dec.onnx"

# Seuil cosinus recommandé pour SFace : 0,363. On est plus strict pour éviter de
# montrer à un client la photo de quelqu'un d'autre.
MATCH_THRESHOLD = 0.42
DETECT_MAX_SIDE = 1280
MIN_FACE_PX = 40


@dataclass
class Face:
    box: tuple[int, int, int, int]  # x, y, largeur, hauteur (pixels de l'image d'origine)
    score: float
    row: np.ndarray  # ligne YuNet (15 valeurs) à l'échelle de l'image d'origine
    embedding: np.ndarray | None = None

    def to_dict(self, scale: float = 1.0) -> dict:
        x, y, w, h = self.box
        return {
            "box": [round(x * scale), round(y * scale), round(w * scale), round(h * scale)],
            "score": round(float(self.score), 3),
            "embedding": None if self.embedding is None else [round(float(v), 5) for v in self.embedding],
        }


def models_available(models_dir: Path) -> bool:
    return (Path(models_dir) / YUNET).is_file() and (Path(models_dir) / SFACE).is_file()


class FaceEngine:
    def __init__(self, models_dir: Path):
        models_dir = Path(models_dir)
        self._detector = cv2.FaceDetectorYN.create(str(models_dir / YUNET), "", (320, 320), 0.8, 0.3, 5000)
        self._recognizer = cv2.FaceRecognizerSF.create(str(models_dir / SFACE), "")
        # Les objets OpenCV DNN ne sont pas sûrs entre threads.
        self._lock = threading.Lock()

    def detect(self, bgr: np.ndarray) -> list[Face]:
        h, w = bgr.shape[:2]
        scale = min(1.0, DETECT_MAX_SIDE / max(h, w))
        small = cv2.resize(bgr, (round(w * scale), round(h * scale)), interpolation=cv2.INTER_AREA) if scale < 1 else bgr
        with self._lock:
            self._detector.setInputSize((small.shape[1], small.shape[0]))
            _, rows = self._detector.detect(small)
        faces: list[Face] = []
        for row in rows if rows is not None else []:
            full = row.copy()
            full[:14] /= scale
            x, y, fw, fh = (int(round(v)) for v in full[:4])
            if min(fw, fh) < MIN_FACE_PX:
                continue
            faces.append(Face(box=(x, y, fw, fh), score=float(row[14]), row=full))
        return faces

    def embed(self, bgr: np.ndarray, face: Face) -> np.ndarray:
        with self._lock:
            crop = self._recognizer.alignCrop(bgr, face.row)
            feat = self._recognizer.feature(crop)
        vec = feat.flatten().astype(np.float32)
        return vec / (np.linalg.norm(vec) + 1e-9)

    def analyse(self, bgr: np.ndarray) -> list[Face]:
        faces = self.detect(bgr)
        for f in faces:
            f.embedding = self.embed(bgr, f)
        return faces


def similarity(a: np.ndarray, b: np.ndarray) -> float:
    a = np.asarray(a, np.float32)
    b = np.asarray(b, np.float32)
    return float(a @ b / ((np.linalg.norm(a) * np.linalg.norm(b)) + 1e-9))


def is_match(a: np.ndarray, b: np.ndarray, threshold: float = MATCH_THRESHOLD) -> bool:
    return similarity(a, b) >= threshold
