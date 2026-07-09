import { useState } from "react";
import { BaseNode } from "../BaseNode";
import { useFlowStore } from "../../../store/useFlowStore";
import { TrendingUp } from "lucide-react";

function HealthGauge({ score }) {
  const color = score >= 85 ? "#22C55E" : score >= 60 ? "#F59E0B" : score >= 30 ? "#EF4444" : "#DC2626";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
      <div style={{ flex: 1, height: 8, background: "#374151", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: `${score}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.5s" }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color, minWidth: 32 }}>{score}</span>
    </div>
  );
}

export function PredictionNode({ id, data }) {
  return (
    <BaseNode id={id} title="Failure Prediction" icon={TrendingUp}
      inputs={[{ id: `${id}-input` }]}
      outputs={[{ id: `${id}-prediction` }]}
    >
      <div className="field">
        <label className="field-label">Health Score</label>
        <HealthGauge score={data?.healthScore ?? 100} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8, fontSize: 11 }}>
        <div>
          <div style={{ color: "#9CA3AF" }}>Failure Prob.</div>
          <div style={{ fontWeight: 600 }}>{data?.failureProbability ?? "—"}%</div>
        </div>
        <div>
          <div style={{ color: "#9CA3AF" }}>Risk Level</div>
          <div style={{ fontWeight: 600, color: data?.riskLevel === "CRITICAL" ? "#EF4444" : data?.riskLevel === "ANOMALY" ? "#F59E0B" : "#22C55E" }}>{data?.riskLevel ?? "—"}</div>
        </div>
        <div>
          <div style={{ color: "#9CA3AF" }}>Days Remaining</div>
          <div style={{ fontWeight: 600 }}>{data?.daysRemaining ?? "—"}</div>
        </div>
      </div>
    </BaseNode>
  );
}
