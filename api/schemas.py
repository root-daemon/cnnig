"""Pydantic request/response models for the dashboard API."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class PredictionResponse(BaseModel):
    id: int
    filename: str
    predicted_class: str
    confidence: float
    probabilities: dict[str, float]
    preview_b64: str
    created_at: datetime


class BatchItemResponse(BaseModel):
    filename: str
    id: int | None = None
    predicted_class: str | None = None
    confidence: float | None = None
    probabilities: dict[str, float] | None = None
    preview_b64: str | None = None
    created_at: datetime | None = None
    error: str | None = None


class HistoryListResponse(BaseModel):
    items: list[PredictionResponse]
    total: int


class AnalyticsOverview(BaseModel):
    total_runs: int
    top_class: str | None
    avg_confidence: float
    last_run_at: datetime | None


class ClassCount(BaseModel):
    class_name: str
    count: int


class ConfidenceBin(BaseModel):
    lower: float
    upper: float
    count: int


class DayCount(BaseModel):
    date: str
    count: int


class Topography3D(BaseModel):
    height_map: list[list[float]]
    min_height: float
    max_height: float

class QuadrantMetrics(BaseModel):
    defect_count: int
    total_pixels: int
    defect_percentage: float

class CutlineAnalysis(BaseModel):
    x_line: int
    y_line: int
    quadrants: dict[str, QuadrantMetrics]
    recommended_low_defect_quadrant: str

class FullAnalysis(BaseModel):
    defect_map: list[list[int]]
    region_analysis: dict[str, float]
    saliency_map: list[list[float]]
    topography_3d: Topography3D
    cutline_analysis: CutlineAnalysis

class AnalyzeResponse(BaseModel):
    prediction: PredictionResponse
    analysis: FullAnalysis
