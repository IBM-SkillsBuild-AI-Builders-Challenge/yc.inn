from __future__ import annotations

import json
from typing import Any

import httpx
from loguru import logger

from app.core.config import settings

SYSTEM_PROMPT = """You are FactoryFlow AI — an industrial automation workflow assistant. Help plant engineers design predictive maintenance workflows.

## Available Nodes (use exact type strings)

**Generic:** customInput, customOutput, text, llm, api, condition, delay, database, notification

**Industrial (Inputs):** workflowTrigger (start), sensorInput (IoT data), csvUpload (file import)
**Industrial (Processing):** dataCleaning (noise removal), featureExtraction (RMS/trend)
**Industrial (AI/ML):** anomalyDetection (spike detection), failurePrediction (health score 0-100)
**Industrial (Logic):** decision (risk threshold), humanApproval (manual gate)
**Industrial (Actions):** maintenanceTicket (work order), inventoryCheck (stock), notification (alerts)
**Industrial (Agents):** maintenanceExpert (LLM advice), procurementAgent (auto-order), rootCauseAgent (diagnosis)

## How to generate workflows
When building a workflow, respond with a complete JSON block:
```json
{
  "action": "add_nodes",
  "nodes": [...],
  "edges": [...]
}
```

Position nodes at x intervals of ~280, y intervals of ~150.

## Templates
Offer these templates when users aren't specific:
1. **Predictive Maintenance** — Sensor → Cleaning → Anomaly → Prediction → Decision → Ticket → Notify
2. **Motor Health** — Sensor → Feature Extraction → Prediction → Decision → Notify
3. **Bearing Failure** — Sensor → Anomaly → Prediction → Decision → Ticket
4. **Conveyor Monitoring** — Sensor → Cleaning → Feature → Anomaly → Notification
5. **CNC Maintenance** — Trigger → Sensor → Prediction → Decision → Ticket → Notify

## Rules
- Include ALL fields for each node with realistic values
- ALWAYS create edges — never return empty edges for multi-node workflows
- Keep responses concise and helpful
"""

# Suggested templates shown at startup
TEMPLATES = [
    {"name": "Predictive Maintenance", "description": "Sensor monitoring → anomaly detection → failure prediction → auto-maintenance"},
    {"name": "Motor Health Monitoring", "description": "Motor vibration/temp monitoring with health scoring and alerts"},
    {"name": "Bearing Failure Detection", "description": "Detect bearing wear via vibration anomalies and schedule replacement"},
    {"name": "Conveyor Monitoring", "description": "Monitor conveyor belt health with anomaly detection and notifications"},
    {"name": "CNC Maintenance", "description": "Complete CNC machine maintenance workflow with decision automation"},
]


class AssistantService:
    def __init__(self):
        self.api_key = settings.groq_api_key
        self.model = "llama-3.3-70b-versatile"
        self.base_url = "https://api.groq.com/openai/v1/chat/completions"

    async def chat(self, message: str, history: list[dict[str, str]], workflow_context: dict[str, Any]) -> dict[str, Any]:
        if not self.api_key:
            return {"role": "assistant", "content": "Groq API key is not configured on the server. Please set GROQ_API_KEY in the backend .env file."}

        messages = [{"role": "system", "content": SYSTEM_PROMPT}]

        for msg in history:
            messages.append({"role": msg["role"], "content": msg["content"]})

        context = f"\n\n## Current Workflow State\n```json\n{json.dumps(workflow_context, indent=2)}\n```"
        messages.append({"role": "user", "content": message + context})

        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.post(
                    self.base_url,
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": self.model,
                        "messages": messages,
                        "temperature": 0.7,
                        "max_tokens": 2048,
                    },
                )
                data = resp.json()

                if resp.status_code != 200:
                    logger.error(f"Groq API error: {data}")
                    return {"role": "assistant", "content": f"Error: {data.get('error', {}).get('message', 'Failed to get response from Groq')}"}

                content = data["choices"][0]["message"]["content"]
                return {"role": "assistant", "content": content}

        except Exception as e:
            logger.error(f"Assistant service error: {e}")
            return {"role": "assistant", "content": f"Sorry, I encountered an error: {str(e)}"}


assistant_service = AssistantService()
