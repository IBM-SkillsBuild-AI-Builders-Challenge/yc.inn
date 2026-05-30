from __future__ import annotations

from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.assistant_service import assistant_service

router = APIRouter(prefix="/assistant", tags=["assistant"])


class ChatRequest(BaseModel):
    message: str
    history: list[dict[str, str]] = []
    workflow_context: dict[str, Any] = {}


class ChatResponse(BaseModel):
    role: str
    content: str


@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(payload: ChatRequest) -> ChatResponse:
    return await assistant_service.chat(payload.message, payload.history, payload.workflow_context)
