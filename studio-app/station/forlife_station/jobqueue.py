"""File d'attente persistante (SQLite) : rien n'est perdu si la Station ou Internet s'arrête.

Chaque photo reçue devient un travail qui passe par les étapes :
  pending -> processed (retouche faite, fichiers locaux prêts) -> published (envoyée au cloud)
Les erreurs sont retentées ; au-delà de MAX_ATTEMPTS, le travail passe en "error".
"""

from __future__ import annotations

import sqlite3
import threading
import time
from dataclasses import dataclass
from pathlib import Path

MAX_ATTEMPTS = 5

SCHEMA = """
CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_path TEXT NOT NULL UNIQUE,
  folder TEXT NOT NULL,
  camera TEXT NOT NULL DEFAULT '',
  received_at REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  locked_until REAL NOT NULL DEFAULT 0,
  photo_id TEXT,
  error TEXT
);
CREATE INDEX IF NOT EXISTS jobs_status ON jobs(status, received_at);
"""


@dataclass
class Job:
    id: int
    source_path: str
    folder: str
    camera: str
    received_at: float
    status: str
    attempts: int
    photo_id: str | None
    error: str | None


class JobQueue:
    def __init__(self, db_path: Path):
        self._lock = threading.Lock()
        self._db = sqlite3.connect(str(db_path), check_same_thread=False, isolation_level=None)
        self._db.row_factory = sqlite3.Row
        self._db.execute("PRAGMA journal_mode=WAL")
        self._db.executescript(SCHEMA)

    def add(self, source_path: Path, folder: str, camera: str = "") -> bool:
        """Ajoute une photo. Renvoie False si elle était déjà connue (doublon FTP, relance)."""
        with self._lock:
            cur = self._db.execute(
                "INSERT OR IGNORE INTO jobs(source_path, folder, camera, received_at) VALUES (?,?,?,?)",
                (str(source_path), folder, camera, time.time()),
            )
            return cur.rowcount == 1

    def claim(self, status: str, newest_first: bool = True, lease: float = 300) -> Job | None:
        """Réserve le prochain travail dans l'état `status` (la plus récente d'abord par défaut)."""
        order = "DESC" if newest_first else "ASC"
        now = time.time()
        with self._lock:
            row = self._db.execute(
                f"SELECT * FROM jobs WHERE status=? AND locked_until<? AND attempts<? "
                f"ORDER BY received_at {order} LIMIT 1",
                (status, now, MAX_ATTEMPTS),
            ).fetchone()
            if row is None:
                return None
            self._db.execute("UPDATE jobs SET locked_until=? WHERE id=?", (now + lease, row["id"]))
            return self._to_job(row)

    def advance(self, job_id: int, status: str, photo_id: str | None = None) -> None:
        with self._lock:
            self._db.execute(
                "UPDATE jobs SET status=?, photo_id=COALESCE(?, photo_id), attempts=0, "
                "locked_until=0, error=NULL WHERE id=?",
                (status, photo_id, job_id),
            )

    def fail(self, job_id: int, error: str, retry_in: float = 10) -> None:
        with self._lock:
            self._db.execute(
                "UPDATE jobs SET attempts=attempts+1, error=?, locked_until=? WHERE id=?",
                (error[:500], time.time() + retry_in, job_id),
            )
            self._db.execute(
                "UPDATE jobs SET status='error' WHERE id=? AND attempts>=?", (job_id, MAX_ATTEMPTS)
            )

    def counts(self) -> dict[str, int]:
        with self._lock:
            rows = self._db.execute("SELECT status, COUNT(*) n FROM jobs GROUP BY status").fetchall()
        return {r["status"]: r["n"] for r in rows}

    def get(self, job_id: int) -> Job | None:
        with self._lock:
            row = self._db.execute("SELECT * FROM jobs WHERE id=?", (job_id,)).fetchone()
        return self._to_job(row) if row else None

    @staticmethod
    def _to_job(row: sqlite3.Row) -> Job:
        return Job(
            id=row["id"],
            source_path=row["source_path"],
            folder=row["folder"],
            camera=row["camera"],
            received_at=row["received_at"],
            status=row["status"],
            attempts=row["attempts"],
            photo_id=row["photo_id"],
            error=row["error"],
        )
