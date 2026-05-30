import { useState } from "react";
import { BaseNode } from "../BaseNode";
import { useFlowStore } from "../../../store/useFlowStore";
import { Clock } from "lucide-react";

export function DelayNode({ id, data }) {
  const updateNodeField = useFlowStore((s) => s.updateNodeField);
  const [duration, setDuration] = useState(data?.duration || 5);
  const [unit, setUnit] = useState(data?.unit || "seconds");

  return (
    <BaseNode id={id} title="Delay" icon={Clock}
      inputs={[{ id: `${id}-input` }]}
      outputs={[{ id: `${id}-output` }]}
    >
      <div className="field">
        <label className="field-label">Duration</label>
        <input className="field-input" type="number" min={0} value={duration}
          onChange={(e) => { setDuration(Number(e.target.value)); updateNodeField(id, "duration", Number(e.target.value)); }}
          placeholder="5" />
      </div>
      <div className="field">
        <label className="field-label">Unit</label>
        <select className="field-input" value={unit}
          onChange={(e) => { setUnit(e.target.value); updateNodeField(id, "unit", e.target.value); }}>
          <option value="seconds">Seconds</option>
          <option value="minutes">Minutes</option>
          <option value="hours">Hours</option>
        </select>
      </div>
      <div className="delay-summary">
        Wait {duration} {unit}
      </div>
    </BaseNode>
  );
}
