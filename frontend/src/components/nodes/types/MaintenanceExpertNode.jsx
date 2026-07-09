import { useState } from "react";
import { BaseNode } from "../BaseNode";
import { useFlowStore } from "../../../store/useFlowStore";
import { Brain, Loader2 } from "lucide-react";

export function MaintenanceExpertNode({ id, data }) {
  const updateNodeField = useFlowStore((s) => s.updateNodeField);
  const [query, setQuery] = useState(data?.query ?? "");
  const [advice, setAdvice] = useState(data?.advice ?? "");
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!query) return;
    setLoading(true);
    setAdvice("");
    try {
      const res = await fetch("http://localhost:8000/api/v1/llm/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: `Maintenance advice needed: ${query}`, temperature: 0.3, max_tokens: 512 }),
      });
      const json = await res.json();
      const result = json.response || "No advice generated";
      setAdvice(result);
      updateNodeField(id, "advice", result);
    } catch { setAdvice("Could not reach LLM service."); }
    setLoading(false);
  };

  return (
    <BaseNode id={id} title="Maintenance Expert" icon={Brain}
      inputs={[{ id: `${id}-input` }]}
      outputs={[{ id: `${id}-advice` }]}
    >
      <div className="field">
        <label className="field-label">Query</label>
        <textarea className="field-textarea" value={query} rows={2}
          onChange={(e) => { setQuery(e.target.value); updateNodeField(id, "query", e.target.value); }}
          placeholder="e.g., Best maintenance interval for CNC spindle?" />
      </div>
      <button className="field-btn field-btn-primary" onClick={handleAnalyze} disabled={loading || !query}>
        {loading ? <><Loader2 size={12} className="spinner" /> Analyzing...</> : <>Get Advice</>}
      </button>
      {advice && <div className="field-output" style={{ marginTop: 6, maxHeight: 80, fontSize: 11 }}>{advice}</div>}
    </BaseNode>
  );
}
