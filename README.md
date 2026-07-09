# FactoryFlow AI — Industrial Predictive Maintenance Workflow Builder

A no-code drag-and-drop workflow builder for industrial predictive maintenance pipelines. Design, simulate, and execute AI-powered maintenance workflows with an intelligent assistant.

## Problem

Unplanned downtime costs manufacturers $50B annually. Most factories still rely on reactive maintenance. FactoryFlow AI lets plant engineers build predictive maintenance workflows visually — no coding required.

## Architecture

```
Frontend (React + React Flow) → Backend (FastAPI) → Groq AI (Llama 3.3 70B)
```

- **Frontend:** React, React Flow (canvas), Tailwind CSS, shadcn/ui
- **Backend:** Python, FastAPI, Uvicorn
- **AI:** Groq API for assistant and agent-powered nodes
- **Validation:** Pydantic, NetworkX (DAG enforcement)

## Node Catalog (22 nodes)

| Category | Nodes |
|----------|-------|
| **Inputs** | workflowTrigger, sensorInput, csvUpload, customInput |
| **Processing** | dataCleaning, featureExtraction, text |
| **AI/ML** | anomalyDetection, failurePrediction, llm |
| **Logic** | condition (decision), humanApproval |
| **Actions** | maintenanceTicket, inventoryCheck, notification, delay, api, database, customOutput |
| **Agents** | maintenanceExpert, procurementAgent, rootCauseAgent |

## Features

- Drag-and-drop workflow canvas with 22 node types
- DAG validation (cycle detection)
- Real-time sensor simulation (temperature, vibration, pressure)
- Health score prediction with failure probability and risk levels
- Multi-channel notifications (email, Slack, Discord)
- AI assistant that generates complete workflows from natural language
- LLM-powered agent nodes (maintenance advice, root cause analysis, procurement)

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.10+
- Groq API key (optional, for AI features)

### Install

```bash
# Install all dependencies
npm install
cd frontend && npm install && cd ..

# Install Python dependencies
cd backend && pip install -r requirements.txt && cd ..
```

### Configure

Set your Groq API key in `backend/.env`:

```
GROQ_API_KEY="gsk_your_key_here"
```

### Run

```bash
# Start both backend and frontend
npm start

# Or run separately:
npm run backend    # Backend on port 8000
npm run frontend   # Frontend on port 3000
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/api/v1/pipelines/parse` | Validate pipeline DAG |
| POST | `/api/v1/prediction/evaluate` | Compute health score |
| GET | `/api/v1/simulation/stream` | Simulate sensor readings |
| POST | `/api/v1/assistant/chat` | AI workflow assistant |
| POST | `/api/v1/agents/execute` | Execute agent |
| POST | `/api/v1/llm/chat` | Direct LLM proxy |

## Example Workflow

### Bearing Failure Detection

```
workflowTrigger → sensorInput(vibration, CNC-12)
  → anomalyDetection(threshold: 0.85)
  → failurePrediction → condition(health < 60)
  → maintenanceTicket(high) → notification(slack)
```

## Prediction Engine

Computes health score (0-100) from sensor inputs:

| Health Score | Risk Level | Action |
|-------------|------------|--------|
| 85-100 | SAFE | No action needed |
| 60-84 | WARNING | Monitor closely |
| 30-59 | ANOMALY | Schedule maintenance |
| 0-29 | CRITICAL | Immediate shutdown |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, React Flow, Tailwind CSS, shadcn/ui |
| Backend | Python, FastAPI, Uvicorn |
| AI | Groq API (Llama 3.3 70B) |
| Validation | Pydantic, NetworkX |
| Build | CRACO, PostCSS |