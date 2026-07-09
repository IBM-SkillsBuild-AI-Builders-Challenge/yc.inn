import {
  FileInput, FileOutput, Type, Brain, Globe, GitBranch, Clock, Database, Bell,
  Play, Activity, Upload, Filter, BarChart3, AlertTriangle, TrendingUp, UserCheck,
  Wrench, Package, Search, ShoppingCart,
} from "lucide-react";

export const nodeRegistry = [
  // Generic (existing)
  { type: "customInput", label: "Input", icon: FileInput, category: "io", description: "Input data source" },
  { type: "customOutput", label: "Output", icon: FileOutput, category: "io", description: "Output data sink" },
  { type: "text", label: "Text", icon: Type, category: "transform", description: "Text template with {{variables}}" },
  { type: "llm", label: "LLM", icon: Brain, category: "ai", description: "Call a language model" },
  { type: "api", label: "API Request", icon: Globe, category: "integration", description: "HTTP request to an API" },
  { type: "condition", label: "Condition", icon: GitBranch, category: "logic", description: "Branch on a condition" },
  { type: "delay", label: "Delay", icon: Clock, category: "logic", description: "Wait for a duration" },
  { type: "database", label: "Database", icon: Database, category: "integration", description: "Query a database" },
  { type: "notification", label: "Notification", icon: Bell, category: "integration", description: "Send via Email / Slack / Discord" },
  // Industrial inputs
  { type: "workflowTrigger", label: "Workflow Trigger", icon: Play, category: "industrial-inputs", description: "Workflow entry point" },
  { type: "sensorInput", label: "Sensor Input", icon: Activity, category: "industrial-inputs", description: "IoT sensor data stream" },
  { type: "csvUpload", label: "CSV Upload", icon: Upload, category: "industrial-inputs", description: "Historical data import" },
  // Industrial processing
  { type: "dataCleaning", label: "Data Cleaning", icon: Filter, category: "industrial-processing", description: "Remove noise, normalize signals" },
  { type: "featureExtraction", label: "Feature Extraction", icon: BarChart3, category: "industrial-processing", description: "Extract RMS, peak freq, trend" },
  // Industrial AI/ML
  { type: "anomalyDetection", label: "Anomaly Detection", icon: AlertTriangle, category: "industrial-ai", description: "Detect temperature/vibration spikes" },
  { type: "failurePrediction", label: "Failure Prediction", icon: TrendingUp, category: "industrial-ai", description: "Health score + failure probability" },
  // Industrial logic
  { type: "decision", label: "Decision", icon: GitBranch, category: "industrial-logic", description: "Risk threshold branching" },
  { type: "humanApproval", label: "Human Approval", icon: UserCheck, category: "industrial-logic", description: "Manual approval gate" },
  // Industrial actions
  { type: "maintenanceTicket", label: "Maintenance Ticket", icon: Wrench, category: "industrial-actions", description: "Create work order" },
  { type: "inventoryCheck", label: "Inventory Check", icon: Package, category: "industrial-actions", description: "Check spare part stock" },
  // Industrial agents
  { type: "maintenanceExpert", label: "Maintenance Expert", icon: Brain, category: "industrial-agents", description: "LLM maintenance advice" },
  { type: "procurementAgent", label: "Procurement Agent", icon: ShoppingCart, category: "industrial-agents", description: "Auto-order spare parts" },
  { type: "rootCauseAgent", label: "Root Cause Agent", icon: Search, category: "industrial-agents", description: "Diagnose failure root cause" },
];

export const nodeCategories = [
  { id: "io", label: "Input / Output" },
  { id: "transform", label: "Transform" },
  { id: "ai", label: "AI" },
  { id: "integration", label: "Integration" },
  { id: "logic", label: "Logic" },
  { id: "industrial-inputs", label: "Industrial Inputs" },
  { id: "industrial-processing", label: "Industrial Processing" },
  { id: "industrial-ai", label: "Industrial AI/ML" },
  { id: "industrial-logic", label: "Industrial Logic" },
  { id: "industrial-actions", label: "Industrial Actions" },
  { id: "industrial-agents", label: "Industrial Agents" },
];
