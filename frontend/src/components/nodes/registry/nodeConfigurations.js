import { FileInput, FileOutput, Globe, Database, GitBranch, Clock, Bell } from "lucide-react";
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
};
