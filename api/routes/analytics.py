"""Aggregate analytics over the runs table."""

from __future__ import annotations

from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, func, select

from api.db import Run, get_session
from api.model import CLASS_NAMES
from api.schemas import AnalyticsOverview, ClassCount, ConfidenceBin, DayCount

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/overview", response_model=AnalyticsOverview)
def overview(session: Session = Depends(get_session)) -> AnalyticsOverview:
    total = session.exec(select(func.count(Run.id))).one()
    avg_conf = session.exec(select(func.avg(Run.confidence))).one()
    last_at = session.exec(select(func.max(Run.created_at))).one()

    top_class: str | None = None
    if total:
        top_row = session.exec(
            select(Run.predicted_class, func.count(Run.id).label("c"))
            .group_by(Run.predicted_class)
            .order_by(func.count(Run.id).desc())
            .limit(1)
        ).first()
        if top_row:
            top_class = top_row[0]

    return AnalyticsOverview(
        total_runs=int(total or 0),
        top_class=top_class,
        avg_confidence=float(avg_conf or 0.0),
        last_run_at=last_at,
    )


@router.get("/distribution", response_model=list[ClassCount])
def distribution(session: Session = Depends(get_session)) -> list[ClassCount]:
    rows = session.exec(
        select(Run.predicted_class, func.count(Run.id))
        .group_by(Run.predicted_class)
    ).all()
    counts = {name: 0 for name in CLASS_NAMES}
    for cls, c in rows:
        counts[cls] = int(c)
    return [ClassCount(class_name=name, count=counts[name]) for name in CLASS_NAMES]


@router.get("/confidence", response_model=list[ConfidenceBin])
def confidence_hist(session: Session = Depends(get_session)) -> list[ConfidenceBin]:
    rows = session.exec(select(Run.confidence)).all()
    bins = [0] * 10
    for conf in rows:
        idx = min(int(conf * 10), 9)
        bins[idx] += 1
    return [
        ConfidenceBin(lower=i / 10, upper=(i + 1) / 10, count=bins[i])
        for i in range(10)
    ]


@router.get("/timeseries", response_model=list[DayCount])
def timeseries(
    days: int = Query(30, ge=1, le=365),
    session: Session = Depends(get_session),
) -> list[DayCount]:
    cutoff = datetime.utcnow() - timedelta(days=days)
    rows = session.exec(
        select(Run.created_at).where(Run.created_at >= cutoff)
    ).all()
    counts: dict[str, int] = {}
    for created_at in rows:
        key = created_at.date().isoformat()
        counts[key] = counts.get(key, 0) + 1

    out: list[DayCount] = []
    today = datetime.utcnow().date()
    for offset in range(days - 1, -1, -1):
        d = (today - timedelta(days=offset)).isoformat()
        out.append(DayCount(date=d, count=counts.get(d, 0)))
    return out
