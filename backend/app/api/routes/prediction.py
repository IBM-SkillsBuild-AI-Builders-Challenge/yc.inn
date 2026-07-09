from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.prediction_service import compute_health

router = APIRouter(prefix="/prediction", tags=["prediction"])


class SensorReading(BaseModel):
    temperature: float
    vibration: float
    rpm: int
    pressure: float


@router.post("/evaluate")
def evaluate_health(reading: SensorReading):
    return compute_health(reading.temperature, reading.vibration, reading.rpm, reading.pressure)
