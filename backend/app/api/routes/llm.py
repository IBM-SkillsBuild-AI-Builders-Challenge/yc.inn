from __future__ import annotations

import httpx
from fastapi import APIRouter
from loguru import logger
from pydantic import BaseModel

from app.core.config import settings

router = APIRouter(prefix="/llm", tags=["llm"])


class LLMChatRequest(BaseModel):
    model: str = "llama-3.3-70b-versatile"
    system_prompt: str = ""
    prompt: str = ""
    temperature: float = 0.7
    max_tokens: int = 1024


class LLMChatResponse(BaseModel):
    success: bool
    response: str = ""
    error: str = ""


@router.post("/chat", response_model=LLMChatResponse)
def llm_chat(payload: LLMChatRequest) -> LLMChatResponse:
    if not settings.groq_api_key:
        return LLMChatResponse(success=False, error="Groq API key not configured on server.")

    if not payload.prompt:
        return LLMChatResponse(success=False, error="Prompt is required.")

    messages = []
    if payload.system_prompt:
        messages.append({"role": "system", "content": payload.system_prompt})
    messages.append({"role": "user", "content": payload.prompt})

    try:
        with httpx.Client(timeout=30) as client:
            resp = client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.groq_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": payload.model,
                    "messages": messages,
                    "temperature": payload.temperature,
                    "max_tokens": payload.max_tokens,
                },
            )
            data = resp.json()

            if resp.status_code != 200:
                error_msg = data.get("error", {}).get("message", "LLM request failed")
                logger.error(f"Groq API error: {error_msg}")
                if "image" in error_msg.lower():
                    error_msg = "This model does not support image inputs. Use a vision-capable model."
                return LLMChatResponse(success=False, error=error_msg)

            content = data["choices"][0]["message"]["content"]
            return LLMChatResponse(success=True, response=content)

    except Exception as e:
        logger.error(f"LLM proxy error: {e}")
        return LLMChatResponse(success=False, error=str(e))
