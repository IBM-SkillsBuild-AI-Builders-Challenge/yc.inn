from fastapi import APIRouter
from pydantic import BaseModel
from typing import Any
from app.services.agent_service import execute_agent

router = APIRouter(prefix="/agents", tags=["agents"])

class AgentRequest(BaseModel):
    agent_type: str
    context: dict[str, Any]

@router.post("/execute")
async def execute(payload: AgentRequest):
    return await execute_agent(payload.agent_type, payload.context)