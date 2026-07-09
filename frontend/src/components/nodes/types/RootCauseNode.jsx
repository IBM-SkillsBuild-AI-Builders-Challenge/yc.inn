import { useState } from "react";
import { BaseNode } from "../BaseNode";
import { useFlowStore } from "../../../store/useFlowStore";
import { Search, Loader2 } from "lucide-react";

export function RootCauseNode({ id, data }) {
  const updateNodeField = useFlowStore((s) => s.updateNodeField);
  const [symptoms, setSymptoms] = useState(data?.symptoms ?? "");
  const [diagnosis, setDiagnosis] = useState(data?.diagnosis ?? "");
  const [loading, setLoading] = useState(false);

  const handleDiagnose = async () => {
    if (!symptoms) return;
    setLoading(true);
    setDiagnosis("");
    try {
      const res = await fetch("http://localhost:8000/api/v1/llm/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: `Root cause analysis for: ${symptoms}. Identify likely causes and recommend corrective actions.`, temperature: 0.3, max_tokens: 512 }),
      });
      const json = await res.json();
      const result = json.response || "No diagnosis";
      setDiagnosis(result);
      updateNodeField(id, "diagnosis", result);
    } catch { setDiagnosis("Could not reach LLM service."); }
    setLoading(false);
  };

  return (
    <BaseNode id={id} title="Root Cause Agent" icon={Search}
      inputs={[{ id: `${id}-input` }]}
      outputs={[{ id: `${id}-diagnosis` }]}
    >
      <div className="field">
        <label className="field-label">Symptoms</label>
        <textarea className="field-textarea" value={symptoms} rows={2}
          onChange={(e) => { setSymptoms(e.target.value); updateNodeField(id, "symptoms", e.target.value); }}
          placeholder="e.g., vibration spike, temp rise above 95C" />
      </div>
      <button className="field-btn field-btn-primary" onClick={handleDiagnose} disabled={loading || !symptoms}>
        {loading ? <><Loader2 size={12} className="spinner" /> Diagnosing...</> : <>Run Diagnosis</>}
      </button>
      {diagnosis && <div className="field-output" style={{ marginTop: 6, maxHeight: 80, fontSize: 11 }}>{diagnosis}</div>}
    </BaseNode>
  );
}
