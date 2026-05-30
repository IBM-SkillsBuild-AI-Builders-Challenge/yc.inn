from fastapi import APIRouter

from app.api.routes.pipeline import router as pipeline_router
from app.api.routes.assistant import router as assistant_router
from app.api.routes.email import router as email_router
from app.api.routes.llm import router as llm_router

api_router = APIRouter()
api_router.include_router(pipeline_router)
api_router.include_router(assistant_router)
api_router.include_router(email_router)
api_router.include_router(llm_router)
