from fastapi import APIRouter

from app.api.routes.pipeline import router as pipeline_router

api_router = APIRouter()
api_router.include_router(pipeline_router)
