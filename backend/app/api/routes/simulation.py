from __future__ import annotations

from fastapi import APIRouter, Query
from app.services.simulation_service import generate_reading

router = APIRouter(prefix="/simulation", tags=["simulation"])


@router.get("/stream")
def stream_simulation(phase: str = Query("normal", pattern="^(normal|warning|anomaly|failure)$")):
    return generate_reading(phase)
