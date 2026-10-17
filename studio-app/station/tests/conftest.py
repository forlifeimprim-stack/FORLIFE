import sys
from pathlib import Path

import cv2
import numpy as np
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))


@pytest.fixture
def photo(tmp_path) -> Path:
    """Image de synthèse (dégradé + formes) de 1600x1067 en JPEG."""
    h, w = 1067, 1600
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    img = np.stack([(xx / w) * 200, (yy / h) * 180, np.full((h, w), 90, np.float32)], -1)
    cv2.circle(img, (800, 500), 220, (60, 110, 170), -1)
    noise = np.random.default_rng(0).normal(0, 6, img.shape)
    img = np.clip(img + noise, 0, 255).astype(np.uint8)
    path = tmp_path / "DSC00001.JPG"
    cv2.imwrite(str(path), img)
    return path


@pytest.fixture
def models_dir() -> Path:
    return Path(__file__).resolve().parents[1] / "models"
