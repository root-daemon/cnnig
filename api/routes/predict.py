"""Single + batch prediction endpoints."""

from __future__ import annotations

import json

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlmodel import Session

from api.db import Run, get_session
from api.model import load_from_bytes, predict_array, to_64x64_array
from api.schemas import BatchItemResponse, PredictionResponse

router = APIRouter(prefix="/api", tags=["predict"])


def _run_inference(filename: str, data: bytes, session: Session) -> Run:
    raw = load_from_bytes(filename, data)
    arr = to_64x64_array(raw)
    result = predict_array(arr)
    row = Run(
        filename=filename,
        predicted_class=result["predicted_class"],
        confidence=result["confidence"],
        probabilities=json.dumps(result["probabilities"]),
        preview_b64=result["preview_b64"],
    )
    session.add(row)
    session.commit()
    session.refresh(row)
    return row


def _row_to_response(row: Run) -> PredictionResponse:
    return PredictionResponse(
        id=row.id,
        filename=row.filename,
        predicted_class=row.predicted_class,
        confidence=row.confidence,
        probabilities=json.loads(row.probabilities),
        preview_b64=row.preview_b64,
        created_at=row.created_at,
    )


@router.post("/predict", response_model=PredictionResponse)
async def predict_single(
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
) -> PredictionResponse:
    data = await file.read()
    try:
        row = _run_inference(file.filename or "upload", data, session)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return _row_to_response(row)


@router.post("/predict/batch", response_model=list[BatchItemResponse])
async def predict_batch(
    files: list[UploadFile] = File(...),
    session: Session = Depends(get_session),
) -> list[BatchItemResponse]:
    out: list[BatchItemResponse] = []
    for file in files:
        name = file.filename or "upload"
        try:
            data = await file.read()
            row = _run_inference(name, data, session)
            out.append(
                BatchItemResponse(
                    filename=name,
                    id=row.id,
                    predicted_class=row.predicted_class,
                    confidence=row.confidence,
                    probabilities=json.loads(row.probabilities),
                    preview_b64=row.preview_b64,
                    created_at=row.created_at,
                )
            )
        except Exception as exc:
            out.append(BatchItemResponse(filename=name, error=str(exc)))
    return out
