import { useState } from "react";
import { BaseNode } from "../BaseNode";
import { useFlowStore } from "../../../store/useFlowStore";
import { AlertTriangle } from "lucide-react";

export function AnomalyNode({ id, data }) {
  const updateNodeField = useFlowStore((s) => s.updateNodeField);
  const [threshold, setThreshold] = useState(data?.threshold ?? 0.8);

  return (
    <BaseNode id={id} title="Anomaly Detection" icon={AlertTriangle}
      inputs={[{ id: `${id}-input` }]}
      outputs={[{ id: `${id}-anomaly` }, { id: `${id}-normal` }]}
    >
      <div className="field">
        <label className="field-label">Threshold</label>
        <input className="field-input" type="number" min={0} max={1} step={0.05} value={threshold}
          onChange={(e) => { setThreshold(Number(e.target.value)); updateNodeField(id, "threshold", Number(e.target.value)); }} />
      </div>
      <div className="field">
        <label className="field-label">Output</label>
        <div className="field-output" style={{ fontSize: 11 }}>
          <div>Anomaly: {data?.anomalyScore ?? "—"}</div>
          <div>Status: {data?.anomalyStatus ?? "waiting"}</div>
        </div>
      </div>
    </BaseNode>
  );
}
