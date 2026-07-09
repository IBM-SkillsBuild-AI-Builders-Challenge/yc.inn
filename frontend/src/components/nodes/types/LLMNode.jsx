import { useState, useMemo } from "react";
import { BaseNode } from "../BaseNode";
import { useFlowStore } from "../../../store/useFlowStore";
import { Brain, Loader2, CheckCircle2, XCircle, Key, Eye, EyeOff, Plug } from "lucide-react";

const BASE_URL = "http://localhost:8000";
const MODELS = [
  { value: "llama-3.3-70b-versatile", label: "Llama 3.3 70B" },
  { value: "llama-3.1-8b-instant", label: "Llama 3.1 8B" },
  { value: "mixtral-8x7b-32768", label: "Mixtral 8x7B" },
  { value: "gemma2-9b-it", label: "Gemma 2 9B" },
];

export function LLMNode({ id, data }) {
  const updateNodeField = useFlowStore((s) => s.updateNodeField);
  const edges = useFlowStore((s) => s.edges);
  const nodes = useFlowStore((s) => s.nodes);
  const [prompt, setPrompt] = useState(data?.prompt || "");
  const [systemPrompt, setSystemPrompt] = useState(data?.systemPrompt || "");
  const [model, setModel] = useState(data?.model || "llama-3.3-70b-versatile");
  const [apiKey, setApiKey] = useState(data?.apiKey || "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");
  const [showKey, setShowKey] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const hasIncomingConnection = useMemo(() => {
    return edges.some((e) => e.target === id);
  }, [edges, id]);

  const connectedValue = useMemo(() => {
    if (!hasIncomingConnection) return "";
    const incomingEdge = edges.find((e) => e.target === id);
    if (!incomingEdge) return "";
    const sourceNode = nodes.find((n) => n.id === incomingEdge.source);
    return sourceNode?.data?.inputValue || sourceNode?.data?.text || sourceNode?.data?.output || "";
  }, [edges, id, nodes, hasIncomingConnection]);

  const canRun = prompt.trim() || hasIncomingConnection;

  const handleRun = async () => {
    if (!canRun) return;
    setIsRunning(true); setOutput(""); setError("");
    const effectivePrompt = prompt.trim() || connectedValue || "(auto: connected input)";
    try {
      if (apiKey) {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model,
            messages: [
              ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
              { role: "user", content: effectivePrompt },
            ],
            temperature: 0.7, max_tokens: 1024,
          }),
        });
        const json = await res.json();
        if (json.error) throw new Error(json.error.message || "Request failed");
        setOutput(json.choices?.[0]?.message?.content || "No response");
      } else {
        const res = await fetch(`${BASE_URL}/api/v1/llm/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model, system_prompt: systemPrompt, prompt: effectivePrompt, temperature: 0.7, max_tokens: 1024 }),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Request failed");
        setOutput(json.response);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <BaseNode id={id} title="LLM" icon={Brain}
      inputs={[{ id: `${id}-system` }, { id: `${id}-prompt` }]}
      outputs={[{ id: `${id}-response` }]}
    >
      <div className="field">
        <label className="field-label">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Key size={10} /> API Key <span style={{ fontWeight: 400, color: "#b1ada1", textTransform: "none" }}>(optional)</span>
          </span>
        </label>
        <div style={{ position: "relative" }}>
          <input
            className="field-input field-input-mono"
            type={showKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => { setApiKey(e.target.value); updateNodeField(id, "apiKey", e.target.value); }}
            placeholder="Leave empty to use server key"
            style={{ paddingRight: 28 }}
          />
          <button type="button" onClick={() => setShowKey(!showKey)}
            style={{
              position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer", color: "#b1ada1",
              display: "flex", padding: 2,
            }}
          >
            {showKey ? <EyeOff size={12} /> : <Eye size={12} />}
          </button>
        </div>
      </div>

      <div className="field">
        <label className="field-label">Model</label>
        <select className="field-input" value={model}
          onChange={(e) => { setModel(e.target.value); updateNodeField(id, "model", e.target.value); }}>
          {MODELS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
      </div>

      <div className="field">
        <label className="field-label">System Prompt</label>
        <textarea className="field-textarea" value={systemPrompt} rows={2}
          onChange={(e) => { setSystemPrompt(e.target.value); updateNodeField(id, "systemPrompt", e.target.value); }}
          placeholder="Sets LLM behavior. Use {{variable}} for upstream data." />
      </div>

      <div className="field">
        <label className="field-label">Prompt</label>
        <textarea className="field-textarea" value={prompt} rows={2}
          onChange={(e) => { setPrompt(e.target.value); updateNodeField(id, "prompt", e.target.value); }}
          placeholder="Leave empty to auto-use connected input..." />
        {hasIncomingConnection && !prompt.trim() && (
          <div className="auto-input-hint">
            <Plug size={10} /> Connected input will be used automatically as the prompt
          </div>
        )}
      </div>

      <button className="field-btn field-btn-primary" onClick={handleRun} disabled={isRunning || !canRun}>
        {isRunning ? <><Loader2 size={12} className="spinner" /> Running...</> : <><Brain size={12} /> Run LLM</>}
      </button>

      {output && (
        <div className="field-output field-output-success">
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <CheckCircle2 size={14} color="#16A34A" />
            <span style={{ fontWeight: 600, color: "#16A34A", fontSize: 12 }}>Response</span>
          </div>
          <div className="field-output-content">{output}</div>
        </div>
      )}

      {error && (
        <div className="field-output field-output-error">
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <XCircle size={14} color="#DC2626" />
            <span style={{ fontWeight: 600, color: "#DC2626", fontSize: 12 }}>Failed</span>
          </div>
          <div className="field-output-content">{error}</div>
        </div>
      )}
    </BaseNode>
  );
}
