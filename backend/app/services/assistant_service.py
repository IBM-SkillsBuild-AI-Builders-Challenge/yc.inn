from __future__ import annotations

import json
from typing import Any

import httpx
from loguru import logger

from app.core.config import settings

SYSTEM_PROMPT = """You are an AI assistant for a Pipeline/Workflow Builder. Help users design and build visual workflows.

## Node Types
- **Input** (customInput): No inputs, output `value`. Fields: `inputName`, `inputType`, **`inputValue`** (set this to the user's actual input content/topic)
- **Output** (customOutput): Input `value`, no outputs. Fields: `outputName`, `outputType`
- **Text** (text): Dynamic inputs per `{{variable}}`, output `output`. Field: `text`
- **LLM** (llm): Inputs `system`+`prompt`, output `response`. Fields: `apiKey`, `model`, `systemPrompt`, `prompt`
- **API Request** (api): Input `input`, output `response`. Fields: `url`, `method`
- **Condition** (condition): Input `input`, outputs `true`/`false`. Fields: `variable`, `operator`, `value`
- **Delay** (delay): Input `input`, output `output`. Field: `duration`
- **Database** (database): Input `input`, output `result`. Fields: `collection`, `operation`
- **Notification** (notification): Input `input`, no outputs. Fields: `channel`, `recipient`

## CRITICAL: How to generate workflow JSON
When the user asks you to build a workflow, ALWAYS respond with a complete JSON block containing ALL nodes and their connections. Every node MUST have a unique `id` like `"input_1"`, `"llm_1"`, `"output_1"`. Edges MUST use these `id` values as `source` and `target`.

Use this exact JSON structure:
```json
{
  "action": "add_nodes",
  "nodes": [
    {"type": "customInput", "id": "input_1", "position": {"x": 50, "y": 100}, "data": {"inputName": "Query", "inputType": "Text", "inputValue": "the user's actual topic or content here"}},
    {"type": "llm", "id": "llm_1", "position": {"x": 330, "y": 100}, "data": {"model": "llama-3.3-70b-versatile", "apiKey": "", "systemPrompt": "", "prompt": "Write a descriptive prompt that uses the topic"}},
    {"type": "customOutput", "id": "output_1", "position": {"x": 610, "y": 100}, "data": {"outputName": "Result", "outputType": "Text"}}
  ],
  "edges": [
    {"source": "input_1", "target": "llm_1"},
    {"source": "llm_1", "target": "output_1"}
  ]
}
```

## Rules for edge creation
- Every `source` and `target` in edges MUST match an `id` from the nodes array
- ALWAYS create edges for every connection in the pipeline
- Never return an empty edges array for a multi-node workflow
- Space nodes at x intervals of ~280, y intervals of ~150
- Data flows automatically via connections — no template syntax needed

## Rules for node data
- ALWAYS include ALL fields for each node type, with realistic values — never empty strings
- Input node: set `inputValue` to the user's actual topic/content from their request
- LLM prompt: write a complete descriptive prompt that incorporates the user's topic (e.g., "Generate a catchy title for a YouTube video about {{inputValue}}" or just "Tell me about [topic]")
- For Text node text field, use plain text without {{variable}} syntax
- Never leave `inputValue`, `prompt`, `systemPrompt` empty — use the user's topic to fill them
- Use realistic values, not placeholders like "YOUR_KEY"

Keep responses concise and helpful. Always include the full workflow JSON when the user asks to build something."""


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
