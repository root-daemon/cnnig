"""Database persistence for inference runs."""

from __future__ import annotations

from collections.abc import Iterator
from datetime import datetime, timedelta
import os
from pathlib import Path

from sqlalchemy import inspect, text
from sqlmodel import Field, Session, SQLModel, create_engine, delete

DB_PATH = Path(__file__).resolve().parent.parent / "runs.db"
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DB_PATH}")
RETENTION_DAYS = max(30, int(os.getenv("HISTORY_RETENTION_DAYS", "30")))

if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

connect_args = (
    {"check_same_thread": False}
    if DATABASE_URL.startswith("sqlite")
    else {}
)

engine = create_engine(
    DATABASE_URL,
    echo=False,
    connect_args=connect_args,
)


class Run(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    filename: str
    predicted_class: str = Field(index=True)
    confidence: float
    probabilities: str  # JSON-encoded {class_name: prob}
    preview_b64: str
    rca_json: str | None = None  # JSON-encoded RCA payload


def init_db() -> None:
    SQLModel.metadata.create_all(engine)
    _migrate_runs_table()
    purge_old_runs()


def _migrate_runs_table() -> None:
    """Keep existing SQLite/dev databases compatible after adding columns."""
    if not inspect(engine).has_table("run"):
        return

    existing = {column["name"] for column in inspect(engine).get_columns("run")}
    if "rca_json" in existing:
        return

    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE run ADD COLUMN rca_json TEXT"))


def purge_old_runs() -> int:
    cutoff = datetime.utcnow() - timedelta(days=RETENTION_DAYS)
    with Session(engine) as session:
        result = session.exec(delete(Run).where(Run.created_at < cutoff))
        session.commit()
        return int(result.rowcount or 0)


def get_session() -> Iterator[Session]:
    with Session(engine) as session:
        yield session
