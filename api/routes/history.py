"""Run history endpoints."""

from __future__ import annotations

import json

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, func, select

from api.db import Run, get_session
from api.rca import get_rca
from api.schemas import HistoryListResponse, PredictionResponse

router = APIRouter(prefix="/api/history", tags=["history"])


def _to_response(row: Run) -> PredictionResponse:
    return PredictionResponse(
        id=row.id,
        filename=row.filename,
        predicted_class=row.predicted_class,
        confidence=row.confidence,
        probabilities=json.loads(row.probabilities),
        preview_b64=row.preview_b64,
        rca=json.loads(row.rca_json) if row.rca_json else get_rca(row.predicted_class),
        created_at=row.created_at,
    )


@router.get("", response_model=HistoryListResponse)
def list_history(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    class_name: str | None = Query(None, alias="class"),
    session: Session = Depends(get_session),
) -> HistoryListResponse:
    where = []
    if class_name:
        where.append(Run.predicted_class == class_name)

    count_stmt = select(func.count(Run.id))
    list_stmt = select(Run).order_by(Run.created_at.desc()).limit(limit).offset(offset)
    for clause in where:
        count_stmt = count_stmt.where(clause)
        list_stmt = list_stmt.where(clause)

    total = session.exec(count_stmt).one()
    rows = session.exec(list_stmt).all()
    return HistoryListResponse(
        items=[_to_response(r) for r in rows],
        total=int(total),
    )


@router.get("/{run_id}", response_model=PredictionResponse)
def get_run(run_id: int, session: Session = Depends(get_session)) -> PredictionResponse:
    row = session.get(Run, run_id)
    if not row:
        raise HTTPException(status_code=404, detail="Run not found")
    return _to_response(row)


@router.delete("/{run_id}")
def delete_run(run_id: int, session: Session = Depends(get_session)) -> dict:
    row = session.get(Run, run_id)
    if not row:
        raise HTTPException(status_code=404, detail="Run not found")
    session.delete(row)
    session.commit()
    return {"ok": True}
