from __future__ import annotations

from fastapi import APIRouter
from loguru import logger

from app.schemas.pipeline import PipelineRequest, PipelineResponse
from app.services.pipeline_service import pipeline_service

router = APIRouter(prefix="/pipelines", tags=["pipelines"])


@router.post("/parse", response_model=PipelineResponse)
def parse_pipeline(payload: PipelineRequest) -> PipelineResponse:
    logger.debug(f"POST /pipelines/parse — nodes={len(payload.nodes)}, edges={len(payload.edges)}")
    return pipeline_service.parse(payload)
