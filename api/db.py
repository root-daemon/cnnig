"""SQLite persistence for inference runs."""

from __future__ import annotations

from collections.abc import Iterator
from datetime import datetime
from pathlib import Path

from sqlmodel import Field, Session, SQLModel, create_engine

DB_PATH = Path(__file__).resolve().parent.parent / "runs.db"
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False},
)


class Run(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    filename: str
    predicted_class: str = Field(index=True)
    confidence: float
    probabilities: str  # JSON-encoded {class_name: prob}
    preview_b64: str


def init_db() -> None:
    SQLModel.metadata.create_all(engine)


def get_session() -> Iterator[Session]:
    with Session(engine) as session:
        yield session
