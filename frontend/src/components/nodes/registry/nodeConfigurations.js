import {
  FileInput, FileOutput, Globe, Database, GitBranch, Clock, Bell,
  Play, Activity, Upload, Filter, BarChart3, TrendingUp,
  UserCheck, Wrench, Package, ShoppingCart, Search,
} from "lucide-react";
import { createNode } from "./createNode";

export const nodeConfigurations = {
  customInput: createNode({
    title: "Input",
    icon: FileInput,
    inputs: [],
    outputs: [{ id: "value" }],
    fields: [
      { name: "inputName", label: "Name", type: "text", placeholder: "input name" },
      { name: "inputValue", label: "Value", type: "textarea", placeholder: "Enter input text...", rows: 3 },
    ],
  }),

  customOutput: createNode({
    title: "Output",
    icon: FileOutput,
    inputs: [{ id: "input" }],
    outputs: [],
    fields: [
      { name: "outputName", label: "Name", type: "text", placeholder: "output name" },
    ],
  }),

  // Text and LLM have custom components (complex UI)
  // api, condition, delay, database, notification have custom components (special handles/labels)

  api: createNode({
    title: "API Request",
    icon: Globe,
    inputs: [{ id: "input" }],
    outputs: [{ id: "response" }],
    fields: [
      { name: "url", label: "URL", type: "text", placeholder: "https://api.example.com/endpoint" },
      {
        name: "method", label: "Method", type: "select",
        options: [
          { label: "GET", value: "GET" }, { label: "POST", value: "POST" },
          { label: "PUT", value: "PUT" }, { label: "DELETE", value: "DELETE" },
          { label: "PATCH", value: "PATCH" },
        ],
      },
      { name: "headers", label: "Headers", type: "textarea", placeholder: '{"key": "value"}', rows: 2 },
    ],
  }),

  condition: createNode({
    title: "Condition",
    icon: GitBranch,
    inputs: [{ id: "input" }],
    outputs: [{ id: "true" }, { id: "false" }],
    fields: [
      { name: "variable", label: "Variable", type: "text", placeholder: "e.g., input.field" },
      {
        name: "operator", label: "Operator", type: "select",
        options: [
          { label: "Equals", value: "eq" }, { label: "Not Equals", value: "neq" },
          { label: "Greater Than", value: "gt" }, { label: "Less Than", value: "lt" },
          { label: "Greater or Equal", value: "gte" }, { label: "Less or Equal", value: "lte" },
        ],
      },
      { name: "value", label: "Value", type: "text", placeholder: "value to compare" },
    ],
  }),

  delay: createNode({
    title: "Delay",
    icon: Clock,
    inputs: [{ id: "input" }],
    outputs: [{ id: "output" }],
    fields: [
      { name: "duration", label: "Duration (seconds)", type: "number", min: 0, default: 5 },
    ],
  }),

  database: createNode({
    title: "Database",
    icon: Database,
    inputs: [{ id: "input" }],
    outputs: [{ id: "result" }],
    fields: [
      {
        name: "operation", label: "Operation", type: "select",
        options: [
          { label: "Query", value: "query" }, { label: "Insert", value: "insert" },
          { label: "Update", value: "update" }, { label: "Delete", value: "delete" },
        ],
      },
      { name: "collection", label: "Collection", type: "text", placeholder: "collection name" },
    ],
  }),

  notification: createNode({
    title: "Notification",
    icon: Bell,
    inputs: [{ id: "input" }],
    outputs: [],
    fields: [
      {
        name: "channel", label: "Channel", type: "select",
        options: [
          { label: "Email", value: "email" },
          { label: "Slack", value: "slack" },
          { label: "Discord", value: "discord" },
        ],
      },
      { name: "recipient", label: "Recipient", type: "text", placeholder: "email or webhook URL" },
      { name: "subject", label: "Subject", type: "text", placeholder: "notification subject" },
      { name: "message", label: "Message", type: "textarea", placeholder: "notification body", rows: 2 },
    ],
  }),

  workflowTrigger: createNode({
    title: "Workflow Trigger", icon: Play,
    inputs: [], outputs: [{ id: "trigger" }],
    fields: [{ name: "triggerName", label: "Name", type: "text", placeholder: "workflow trigger" }],
  }),

  sensorInput: createNode({
    title: "Sensor Input", icon: Activity,
    inputs: [{ id: "trigger" }], outputs: [{ id: "data" }],
    fields: [
      { name: "machineId", label: "Machine ID", type: "text", placeholder: "CNC-12" },
      { name: "sensorType", label: "Sensor Type", type: "select", options: [
        { label: "Temperature", value: "temperature" },
        { label: "Vibration", value: "vibration" },
        { label: "Pressure", value: "pressure" },
        { label: "Multi", value: "multi" },
      ]},
      { name: "interval", label: "Poll Interval (s)", type: "number", min: 1, default: 5 },
    ],
  }),

  csvUpload: createNode({
    title: "CSV Upload", icon: Upload,
    inputs: [{ id: "trigger" }], outputs: [{ id: "data" }],
    fields: [
      { name: "filePath", label: "File Path", type: "text", placeholder: "data/machine_logs.csv" },
      { name: "delimiter", label: "Delimiter", type: "text", placeholder: "," },
    ],
  }),

  dataCleaning: createNode({
    title: "Data Cleaning", icon: Filter,
    inputs: [{ id: "input" }], outputs: [{ id: "output" }],
    fields: [
      { name: "method", label: "Method", type: "select", options: [
        { label: "Remove Outliers", value: "outliers" },
        { label: "Normalize", value: "normalize" },
        { label: "Smooth", value: "smooth" },
      ]},
      { name: "threshold", label: "Threshold", type: "number", min: 0, default: 3 },
    ],
  }),

  featureExtraction: createNode({
    title: "Feature Extraction", icon: BarChart3,
    inputs: [{ id: "input" }], outputs: [{ id: "features" }],
    fields: [
      { name: "features", label: "Features", type: "select", options: [
        { label: "RMS", value: "rms" },
        { label: "Peak Frequency", value: "peak_freq" },
        { label: "Trend", value: "trend" },
        { label: "All", value: "all" },
      ]},
    ],
  }),

  humanApproval: createNode({
    title: "Human Approval", icon: UserCheck,
    inputs: [{ id: "input" }], outputs: [{ id: "approved" }, { id: "rejected" }],
    fields: [
      { name: "assignee", label: "Assignee", type: "text", placeholder: "technician@factory.com" },
      { name: "message", label: "Approval Message", type: "textarea", placeholder: "Please approve maintenance action...", rows: 2 },
    ],
  }),

  maintenanceTicket: createNode({
    title: "Maintenance Ticket", icon: Wrench,
    inputs: [{ id: "input" }], outputs: [{ id: "ticket" }],
    fields: [
      { name: "priority", label: "Priority", type: "select", options: [
        { label: "Low", value: "low" }, { label: "Medium", value: "medium" }, { label: "High", value: "high" }, { label: "Critical", value: "critical" },
      ]},
      { name: "category", label: "Category", type: "select", options: [
        { label: "Predictive", value: "predictive" }, { label: "Preventive", value: "preventive" }, { label: "Corrective", value: "corrective" },
      ]},
      { name: "description", label: "Description", type: "textarea", placeholder: "Issue description", rows: 2 },
    ],
  }),

  inventoryCheck: createNode({
    title: "Inventory Check", icon: Package,
    inputs: [{ id: "input" }], outputs: [{ id: "result" }],
    fields: [
      { name: "partNumber", label: "Part Number", type: "text", placeholder: "BRG-6205" },
      { name: "minStock", label: "Min Stock", type: "number", min: 0, default: 2 },
    ],
  }),

  procurementAgent: createNode({
    title: "Procurement Agent", icon: ShoppingCart,
    inputs: [{ id: "input" }], outputs: [{ id: "order" }],
    fields: [
      { name: "vendor", label: "Preferred Vendor", type: "text", placeholder: "Industrial Supplies Co." },
      { name: "autoOrder", label: "Auto-Order", type: "select", options: [
        { label: "Yes", value: "yes" }, { label: "Ask First", value: "ask" },
      ]},
    ],
  }),
};
