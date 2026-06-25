"""Deep analysis endpoint combining prediction and image analytics."""

from __future__ import annotations

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlmodel import Session

from api.analysis import run_full_analysis
from api.db import get_session
from api.model import load_from_bytes, to_64x64_array
from api.routes.predict import _row_to_response, _run_inference
from api.schemas import AnalyzeResponse

router = APIRouter(prefix="/api", tags=["analyze"])

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_single(
    file: UploadFile = File(...),
    x_line: int = Form(32),
    y_line: int = Form(32),
    session: Session = Depends(get_session),
) -> AnalyzeResponse:
    data = await file.read()
    try:
        # 1. Run standard prediction and log to DB
        row = _run_inference(file.filename or "upload", data, session)
        prediction_res = _row_to_response(row)

        # 2. Run deep analysis
        raw = load_from_bytes(file.filename or "upload", data)
        arr = to_64x64_array(raw)
        
        analysis_data = run_full_analysis(arr, x_line=x_line, y_line=y_line)

        return AnalyzeResponse(
            prediction=prediction_res,
            analysis=analysis_data
        )

    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
