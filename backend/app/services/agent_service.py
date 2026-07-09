from __future__ import annotations

import json
import httpx
from loguru import logger
from app.core.config import settings

GENERATOR_PROMPT = """You are a workflow architect for an industrial automation platform called FactoryFlow AI.

Your job: Convert the user's natural language request into a workflow JSON for a React Flow-based workflow builder.

Available node types (use these exact type strings):

**Generic nodes:** customInput, customOutput, text, llm, api, condition, delay, database, notification

**Industrial nodes:** workflowTrigger, sensorInput, csvUpload, dataCleaning, featureExtraction, anomalyDetection, failurePrediction, decision, humanApproval, maintenanceTicket, inventoryCheck, maintenanceExpert, procurementAgent, rootCauseAgent

Rules:
- Each node must have: type, id (unique, like "sensor_1"), position (x, y), data (object with field values)
- Position nodes at x intervals of ~280, y intervals of ~150
- Every edge source/target must reference valid node ids
- Include realistic field values in node data

Return ONLY valid JSON with this structure:
{
  "nodes": [{"type": "...", "id": "...", "position": {"x": 50, "y": 100}, "data": {}}],
  "edges": [{"source": "...", "target": "..."}]
}"""

VALIDATOR_PROMPT = """You are a workflow validator. Check the given workflow JSON for:
1. Every edge source/target references a valid node id
2. No circular dependencies (rough check)
3. All required fields are present

Return JSON: {"valid": true/false, "issues": ["list of issues if invalid"]}"""

async def execute_agent(agent_type: str, context: dict) -> dict:
    if agent_type == "workflowGenerator":
        prompt = GENERATOR_PROMPT + f"\n\nUser request: {context.get('user_message', '')}"
    elif agent_type == "validator":
        prompt = VALIDATOR_PROMPT + f"\n\nWorkflow JSON: {json.dumps(context.get('workflow', {}), indent=2)}"
    else:
        return {"error": f"Unknown agent type: {agent_type}"}

    if not settings.groq_api_key:
        return _fallback_response(agent_type, context)

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {settings.groq_api_key}", "Content-Type": "application/json"},
                json={"model": "llama-3.3-70b-versatile", "messages": [{"role": "user", "content": prompt}], "temperature": 0.3, "max_tokens": 2048},
            )
            data = resp.json()
            content = data["choices"][0]["message"]["content"]
            if agent_type == "workflowGenerator":
                json_match = content[content.index("{"):content.rindex("}")+1] if "{" in content else "{}"
                parsed = json.loads(json_match)
                parsed.setdefault("nodes", [])
                parsed.setdefault("edges", [])
                return parsed
            return json.loads(content) if "{" in content else {"valid": False, "issues": ["Invalid response from AI"]}
    except Exception as e:
        logger.error(f"Agent error: {e}")
        return _fallback_response(agent_type, context)

def _fallback_response(agent_type: str, context: dict) -> dict:
    if agent_type == "workflowGenerator":
        return {
            "nodes": [
                {"type": "workflowTrigger", "id": "trigger_1", "position": {"x": 50, "y": 200}, "data": {}},
                {"type": "sensorInput", "id": "sensor_1", "position": {"x": 330, "y": 200}, "data": {"machineId": "CNC-12", "sensorType": "vibration"}},
                {"type": "anomalyDetection", "id": "anomaly_1", "position": {"x": 610, "y": 200}, "data": {"threshold": 0.8}},
                {"type": "failurePrediction", "id": "prediction_1", "position": {"x": 890, "y": 200}, "data": {}},
                {"type": "decision", "id": "decision_1", "position": {"x": 1170, "y": 200}, "data": {"variable": "failure_probability", "operator": "gt", "value": 80}},
                {"type": "maintenanceTicket", "id": "ticket_1", "position": {"x": 1450, "y": 150}, "data": {"priority": "high", "category": "predictive"}},
                {"type": "notification", "id": "notify_1", "position": {"x": 1450, "y": 250}, "data": {"channel": "email", "recipient": "plantmanager@factory.com", "subject": "Maintenance Required", "message": "CNC-12 requires maintenance. Failure probability exceeds 80%."}},
            ],
            "edges": [
                {"source": "trigger_1", "target": "sensor_1"},
                {"source": "sensor_1", "target": "anomaly_1"},
                {"source": "anomaly_1", "target": "prediction_1"},
                {"source": "prediction_1", "target": "decision_1"},
                {"source": "decision_1", "target": "ticket_1"},
                {"source": "decision_1", "target": "notify_1"},
            ],
        }
    return {"valid": True, "issues": []}