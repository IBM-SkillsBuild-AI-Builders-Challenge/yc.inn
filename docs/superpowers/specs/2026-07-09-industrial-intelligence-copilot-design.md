# Industrial Intelligence Copilot — Design Doc

## Overview

Transform the existing pipeline/workflow builder into **FactoryFlow AI**, an AI-native industrial workflow platform where plant managers describe monitoring/maintenance automation in plain English and the system generates executable predictive-maintenance workflows.

SDG 9: Industry, Innovation & Infrastructure.

---

## Architecture

### Frontend (React + React Flow + Zustand — unchanged)

Keep: React Flow canvas, FlowCanvas, FlowControls (undo/redo/import/export), SubmitButton, BaseNode, createNode factory, useFlowStore, useAssistantStore, workflowExecutor.

**Add:** 12 industrial nodes (alongside existing 9 generic nodes), updated assistant prompts, execution animation polish, KPI panel.

### Backend (FastAPI — unchanged structure)

Keep: router, config, exceptions, existing routes.

**Add:** 3 new services with routes:
1. **Simulation Service** — 4-phase sensor data (NORMAL → WARNING → ANOMALY → FAILURE)
2. **Prediction Service** — health score + failure probability
3. **Agent Backend** — Workflow Generator + Validator (2 agents, not 4)

---

## Node Registry — 9 Generic + 12 Industrial = 21 Total

### Existing Generic Nodes (kept as-is)
`customInput`, `customOutput`, `text`, `llm`, `api`, `condition`, `delay`, `database`, `notification`

### Industrial Nodes — Inputs
| Type | Parent | Description |
|------|--------|-------------|
| `workflowTrigger` | BaseNode | Entry point for all workflows |
| `sensorInput` | BaseNode | IoT sensor data stream |
| `csvUpload` | BaseNode | Historical data import |

### Industrial Nodes — Processing
| Type | Parent | Description |
|------|--------|-------------|
| `dataCleaning` | BaseNode | Remove noise, normalize signals |
| `featureExtraction` | BaseNode | Extract RMS, peak freq, trend |

### Industrial Nodes — AI/ML
| Type | Parent | Description |
|------|--------|-------------|
| `anomalyDetection` | custom (visual) | Detect temperature/vibration spikes |
| `failurePrediction` | custom (visual) | Health score + failure prob + risk level |

### Industrial Nodes — Logic
| Type | Parent | Description |
|------|--------|-------------|
| `decision` | BaseNode (alias) | Risk threshold branching |
| `humanApproval` | BaseNode | Manual approval gate |

### Industrial Nodes — Actions
| Type | Parent | Description |
|------|--------|-------------|
| `maintenanceTicket` | BaseNode | Create work order |
| `inventoryCheck` | BaseNode | Check spare part stock |
| `notification` | BaseNode (reuse) | Send alerts |

### Industrial Nodes — Agents
| Type | Parent | Description |
|------|--------|-------------|
| `maintenanceExpert` | custom | LLM-powered maintenance advice |
| `procurementAgent` | BaseNode | Auto-order spare parts |
| `rootCauseAgent` | custom | Diagnose failure root cause |

---

## Backend Services

### 1. Simulation Service (`/api/v1/simulation/stream`)
Generates sensor readings for single machine `CNC-12`.
```
NORMAL → WARNING → ANOMALY → FAILURE
```
```json
{
  "timestamp": "...",
  "phase": "ANOMALY",
  "temperature": 94,
  "vibration": 0.87,
  "rpm": 3100,
  "pressure": 34
}
```

### 2. Prediction Service (`/api/v1/prediction/evaluate`)
Takes sensor readings, returns health score:
```json
{
  "health_score": 27,
  "failure_probability": 91,
  "risk_level": "CRITICAL",
  "estimated_days_remaining": 2,
  "recommendation": "Schedule immediate maintenance"
}
```
Simple rolling statistics. Health score = 100 - weighted penalty from temp/vibration/pressure deviation.

### 3. Agent Backend (`/api/v1/agents/execute`)
Two modes:
```
agent_type: "workflowGenerator" — single prompt does planning + node discovery + architecture
agent_type: "validator" — checks workflow JSON for issues
```
Single endpoint, `agent_type` selects system prompt.

---

## Workflow Templates

Assistant starts with suggested templates:
- Predictive Maintenance
- Motor Health Monitoring
- Bearing Failure Detection
- Conveyor Monitoring
- CNC Maintenance

Click to auto-generate. Templates are predefined workflow JSONs.

---

## Execution Animation

When Run is clicked:
- Nodes execute in topological order
- Each node transitions: `idle → running (blue glow) → success (green) | error (red)`
- Each node shows its output data inline (e.g., "Health: 27 • Risk: CRITICAL")
- Sequential delay: ~400ms per node
- Overall timeout: 60s

The existing `workflowExecutor.js` already handles status transitions. Adding inline data preview per node.

---

## KPI Panel

Floating panel, top-right:
```
┌──────────────────────┐
│ MACHINE STATUS       │
├──────────────────────┤
│ CNC-12               │
│ Health: 27/100       │
│ Risk: CRITICAL       │
│ Temp: 94°C           │
│ Vibration: 0.87      │
│ ETA Failure: 2 days  │
└──────────────────────┘
```
Visible during and after execution.

---

## Theme — Industrial Operations Center

| Token | Value | Purpose |
|-------|-------|---------|
| `--bg-canvas` | `#181C22` | Dark control-room background |
| `--bg-card` | `#242A33` | Card surface |
| `--bg-hover` | `#2D3543` | Hover state |
| `--text-primary` | `#E5E7EB` | Primary text |
| `--text-secondary` | `#9CA3AF` | Secondary text |
| `--border` | `#374151` | Borders |
| `--accent` | `#FFB020` | Amber accent |
| `--success` | `#22C55E` | Green status |
| `--warning` | `#F59E0B` | Warning |
| `--error` | `#EF4444` | Error |
| `--running` | `#3B82F6` | Processing |

---

## User Flow (Demo)

1. User types or clicks template: *"Monitor CNC machines, predict failures, schedule maintenance if risk exceeds 80%"*
2. Agent: Workflow Generator → Validator
3. Workflow renders on canvas: Trigger → Sensor → Cleaning → Feature → Anomaly → Prediction → Decision → Ticket → Notification
4. User clicks Run
5. Simulation feeds phase data through nodes sequentially
6. Each node shows live data: temp, vibration, health score
7. KPI panel updates in real-time
8. Final output: maintenance ticket created + notification sent

---

## Demo Scenario — Single Machine

```
Machine: CNC-12

Progression:
NORMAL (health 85-100)  → green
WARNING (health 60-84)  → amber
ANOMALY (health 30-59)  → orange
CRITICAL (health 0-29)  → red
Maintenance Triggered   → action taken
```

---

## MVP Scope — Strict

### Build
- 12 industrial nodes (alongside 9 existing generic)
- Simulation service (4-phase single machine)
- Prediction service (health score)
- Agent backend (Workflow Generator + Validator)
- Workflow templates (5 presets)
- Updated assistant system prompt
- Execution animation with inline data preview
- KPI panel
- Industrial theme

### Simplify
- 4-agent chain → single Workflow Generator prompt

### Skip
- Procurement Agent logic
- Human Approval demo
- Multiple machines
- Real ML models
- Real sensor/MQTT integrations
- Authentication / multi-user
- Database persistence
- Deployment / Docker
- Optimizer agent

---

## File Changes

### New — Backend
- `backend/app/services/simulation_service.py`
- `backend/app/services/prediction_service.py`
- `backend/app/services/agent_service.py`
- `backend/app/api/routes/simulation.py`
- `backend/app/api/routes/prediction.py`
- `backend/app/api/routes/agents.py`

### New — Frontend Components
- `frontend/src/components/nodes/types/SensorInputNode.jsx`
- `frontend/src/components/nodes/types/AnomalyNode.jsx`
- `frontend/src/components/nodes/types/PredictionNode.jsx`
- `frontend/src/components/flow/KpiPanel.jsx`
- `frontend/src/components/flow/TemplatePanel.jsx`
- `frontend/src/styles/industrial.css` (theme overrides)

### Modified
- `frontend/src/components/nodes/registry/nodeRegistry.js` — add 12 nodes
- `frontend/src/components/nodes/registry/nodeConfigurations.js` — add configs
- `frontend/src/components/nodes/index.js` — add to nodeTypes
- `frontend/src/index.css` — theme swap
- `frontend/src/App.js` — add KpiPanel, TemplatePanel
- `frontend/src/components/assistant/AssistantPanel.jsx` — templates
- `frontend/src/store/useAssistantStore.js` — update initial msg
- `frontend/src/store/useFlowStore.js` — add node data previews
- `frontend/src/lib/workflowExecutor.js` — connect to sim/prediction endpoints
- `backend/app/api/router.py` — register new routes
- `backend/app/services/assistant_service.py` — industrial prompts
