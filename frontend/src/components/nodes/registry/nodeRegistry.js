import {
  FileInput, FileOutput, Type, Brain, Globe, GitBranch, Clock, Database, Bell,
} from "lucide-react";

export const nodeRegistry = [
  { type: "customInput", label: "Input", icon: FileInput, category: "io", description: "Input data source" },
  { type: "customOutput", label: "Output", icon: FileOutput, category: "io", description: "Output data sink" },
  { type: "text", label: "Text", icon: Type, category: "transform", description: "Text template with {{variables}}" },
  { type: "llm", label: "LLM", icon: Brain, category: "ai", description: "Call a language model" },
  { type: "api", label: "API Request", icon: Globe, category: "integration", description: "HTTP request to an API" },
  { type: "condition", label: "Condition", icon: GitBranch, category: "logic", description: "Branch on a condition" },
  { type: "delay", label: "Delay", icon: Clock, category: "logic", description: "Wait for a duration" },
  { type: "database", label: "Database", icon: Database, category: "integration", description: "Query a database" },
  { type: "notification", label: "Notification", icon: Bell, category: "integration", description: "Send via Email / Slack / Discord" },
];

export const nodeCategories = [
  { id: "io", label: "Input / Output" },
  { id: "transform", label: "Transform" },
  { id: "ai", label: "AI" },
  { id: "integration", label: "Integration" },
  { id: "logic", label: "Logic" },
];
