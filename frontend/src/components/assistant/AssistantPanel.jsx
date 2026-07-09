import { useState, useRef, useEffect, useCallback } from "react";
import { useAssistantStore } from "../../store/useAssistantStore";
import { useFlowStore } from "../../store/useFlowStore";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "../ui/alert-dialog";
import { Bot, Send, X, Loader2, Trash2, Plus, Copy, Check } from "lucide-react";

function mapType(raw) {
  const key = raw.replace(/[\s_-]+/g, "").toLowerCase();
  const map = {
    custominput: "customInput", customoutput: "customOutput",
    input: "customInput", output: "customOutput",
    text: "text", llm: "llm", api: "api", apirequest: "api",
    condition: "condition", delay: "delay", database: "database", notification: "notification",
    filter: "condition", email: "notification",
    workflowtrigger: "workflowTrigger", trigger: "workflowTrigger",
    sensorinput: "sensorInput", sensor: "sensorInput",
    csvupload: "csvUpload",
    datacleaning: "dataCleaning", cleaning: "dataCleaning",
    featureextraction: "featureExtraction", feature: "featureExtraction",
    anomalydetection: "anomalyDetection", anomaly: "anomalyDetection",
    failureprediction: "failurePrediction", prediction: "failurePrediction",
    decision: "condition",
    humanapproval: "humanApproval", approval: "humanApproval",
    maintenanceticket: "maintenanceTicket", ticket: "maintenanceTicket",
    inventorycheck: "inventoryCheck", inventory: "inventoryCheck",
    maintenanceexpert: "maintenanceExpert",
    procurementagent: "procurementAgent", procurement: "procurementAgent",
    rootcauseagent: "rootCauseAgent", rootcause: "rootCauseAgent",
  };
  return map[key] || null;
}

const HANDLE_OUTPUT = {
  customInput: "value", text: "output", llm: "response",
  api: "response", condition: "true", delay: "output", database: "result",
  workflowTrigger: "trigger", sensorInput: "data", csvUpload: "data",
  dataCleaning: "output", featureExtraction: "features",
  anomalyDetection: "anomaly", failurePrediction: "prediction",
  decision: "true", humanApproval: "approved",
  maintenanceTicket: "ticket", inventoryCheck: "result",
  notification: "input", maintenanceExpert: "advice",
  procurementAgent: "order", rootCauseAgent: "diagnosis",
};

const HANDLE_INPUT = {
  customOutput: "value", llm: "prompt",
  api: "input", condition: "input", delay: "input", database: "input", notification: "input",
  sensorInput: "trigger", csvUpload: "trigger",
  dataCleaning: "input", featureExtraction: "input",
  anomalyDetection: "input", failurePrediction: "input",
  decision: "input", humanApproval: "input",
  maintenanceTicket: "input", inventoryCheck: "input",
  maintenanceExpert: "input", procurementAgent: "input", rootCauseAgent: "input",
};

function parseWorkflowJson(content) {
  const blocks = [];
  const regex = /```(?:json)?\s*([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const raw = match[1].trim();
    if (!raw.startsWith("{")) continue;
    try {
      const parsed = JSON.parse(raw);
      if (parsed.nodes) blocks.push(parsed);
    } catch {}
  }
  return blocks;
}

function CopyBtn({ text, className }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [text]);
  return (
    <button className={`copy-btn${className ? " " + className : ""}`} onClick={handleCopy} title="Copy">
      {copied ? <Check size={11} /> : <Copy size={11} />}
    </button>
  );
}

const HIGHLIGHT_WORDS = [
  "Input", "Output", "Text", "LLM", "API Request", "API",
  "Condition", "Delay", "Database", "Notification",
  "customInput", "customOutput",
  "Input / Output", "Transform", "AI", "Integration", "Logic",
];

const HIGHLIGHT_RE = new RegExp(`\\b(${HIGHLIGHT_WORDS.join("|")})\\b`, "g");

function highlightText(text) {
  const parts = text.split(/(```[\s\S]*?```)/g);
  return parts.map((part, i) => {
    if (part.startsWith("```")) return part;
    return part.replace(HIGHLIGHT_RE, (m) => `<hl>${m}</hl>`);
  }).join("");
}

function AssistantMessage({ msg, onAddWorkflow }) {
  const isUser = msg.role === "user";
  const workflows = !isUser ? parseWorkflowJson(msg.content) : [];
  const parts = msg.content.split(/(```[\s\S]*?```)/g);

  return (
    <div className={`assistant-msg ${isUser ? "user" : "ai"}`}>
      {!isUser && (
        <div className="assistant-msg-avatar">
          <Bot size={14} />
        </div>
      )}
      <div className="assistant-msg-content">
        <div className="assistant-msg-header">
          <span className="assistant-msg-role">{isUser ? "You" : "Assistant"}</span>
          <CopyBtn text={msg.content} />
        </div>
        {parts.map((part, i) => {
          if (part.startsWith("```")) {
            const code = part.replace(/```(?:json)?\s*/, "").replace(/```$/, "").trim();
            return (
              <div key={i} className="assistant-code-wrap">
                <pre className="assistant-code">{code}</pre>
                <CopyBtn text={code} className="copy-btn-code" />
              </div>
            );
          }
          return part ? (
            <p key={i} className="assistant-text" dangerouslySetInnerHTML={{ __html: highlightText(part) }} />
          ) : null;
        })}
        {workflows.length > 0 && (
          <div className="assistant-workflow-actions">
            {workflows.map((wf, idx) => (
              <button key={idx} className="assistant-add-btn" onClick={() => onAddWorkflow(wf)}>
                <Plus size={12} /> Add {wf.nodes.length} nodes to canvas
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function AssistantPanel() {
  const { messages, isOpen, isLoading, sendMessage, toggleOpen, clearMessages } = useAssistantStore();
  const getNodeData = useFlowStore((s) => s.getNodeData);
  const addNode = useFlowStore((s) => s.addNode);
  const getNodeID = useFlowStore((s) => s.getNodeID);
  const updateNodeField = useFlowStore((s) => s.updateNodeField);
  const addEdgeRaw = useFlowStore((s) => s.addEdgeRaw);
  const nodes = useFlowStore((s) => s.nodes);
  const inputRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const el = inputRef.current;
    if (!el || !el.value.trim() || isLoading) return;
    const text = el.value;
    el.value = "";
    const workflow = getNodeData();
    sendMessage(text, workflow);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAddWorkflow = useCallback((wf) => {
    const idMap = {};
    const typeMap = {};

    wf.nodes.forEach((n, i) => {
      const type = mapType(n.type || "");
      if (!type) { console.warn("AssistantPanel: unknown node type", n.type); return; }
      const storeId = getNodeID(type);
      const nodeType = n.type || "unknown";
      const oldId = n.id || `${nodeType}_${i}`;
      idMap[oldId] = storeId;
      typeMap[storeId] = type;

      const pos = n.position || { x: 50 + (i % 3) * 280, y: 50 + Math.floor(i / 3) * 150 };

      addNode({
        id: storeId,
        type,
        position: pos,
        data: { ...(n.data || {}), id: storeId, nodeType: type },
      });

      if (n.data) {
        Object.entries(n.data).forEach(([key, value]) => {
          updateNodeField(storeId, key, value);
        });
      }
    });

    (wf.edges || []).forEach((e) => {
      const source = idMap[e.source || e.from];
      const target = idMap[e.target || e.to];
      if (!source || !target) return;
      const sType = typeMap[source];
      const tType = typeMap[target];
      const sh = HANDLE_OUTPUT[sType] ? `${source}-${HANDLE_OUTPUT[sType]}` : null;
      const th = HANDLE_INPUT[tType] ? `${target}-${HANDLE_INPUT[tType]}` : null;
      addEdgeRaw(source, target, sh, th);
    });
  }, [addNode, getNodeID, updateNodeField, addEdgeRaw]);

  if (!isOpen) {
    return (
      <button className="assistant-fab" onClick={toggleOpen} title="Open AI Assistant">
        <Bot size={20} />
      </button>
    );
  }

  return (
    <div className="assistant-panel">
      <div className="assistant-header">
        <div className="assistant-header-left">
          <Bot size={16} />
          <span>Workflow Assistant</span>
          <span className="assistant-node-count">{nodes.length} nodes</span>
        </div>
        <div className="assistant-header-actions">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button title="Clear chat">
                <Trash2 size={14} />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear chat?</AlertDialogTitle>
                <AlertDialogDescription>This will delete all messages and the current workflow. This action cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={clearMessages}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <button onClick={toggleOpen} title="Close">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="assistant-body">
        {messages.map((msg, i) => (
          <AssistantMessage key={i} msg={msg} onAddWorkflow={handleAddWorkflow} />
        ))}
        {isLoading && (
          <div className="assistant-msg ai">
            <div className="assistant-msg-avatar">
              <Bot size={14} />
            </div>
            <div className="assistant-msg-content">
              <Loader2 size={14} className="spinner" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="assistant-footer">
        <textarea
          ref={inputRef}
          className="assistant-input"
          placeholder="Ask me to help build a workflow..."
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <button className="assistant-send" onClick={handleSend} disabled={isLoading}>
          {isLoading ? <Loader2 size={16} className="spinner" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  );
}
