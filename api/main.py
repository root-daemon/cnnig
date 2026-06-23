"""FastAPI entrypoint for the WaferCNN dashboard."""

from __future__ import annotations

from contextlib import asynccontextmanager
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.db import init_db
from api.model import CLASS_NAMES, DEVICE
from api.routes import analytics, history, predict, analyze


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="WaferCNN Dashboard API", lifespan=lifespan)

cors_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]
cors_origin_regex = os.getenv("CORS_ORIGIN_REGEX")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=cors_origin_regex,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict.router)
app.include_router(analyze.router)
app.include_router(history.router)
app.include_router(analytics.router)


@app.get("/api/health")
def health() -> dict:
    return {
        "status": "ok",
        "device": DEVICE.type,
        "classes": CLASS_NAMES,
    }
