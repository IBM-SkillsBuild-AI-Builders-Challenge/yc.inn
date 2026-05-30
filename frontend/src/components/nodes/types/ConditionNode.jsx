import { useState } from "react";
import { BaseNode } from "../BaseNode";
import { useFlowStore } from "../../../store/useFlowStore";
import { GitBranch } from "lucide-react";

const OPERATORS = [
  { label: "Equals", value: "eq" }, { label: "Not Equals", value: "neq" },
  { label: "Greater Than", value: "gt" }, { label: "Less Than", value: "lt" },
  { label: "Greater or Equal", value: "gte" }, { label: "Less or Equal", value: "lte" },
];

export function ConditionNode({ id, data }) {
  const updateNodeField = useFlowStore((s) => s.updateNodeField);
  const [variable, setVariable] = useState(data?.variable || "");
  const [operator, setOperator] = useState(data?.operator || "eq");
  const [value, setValue] = useState(data?.value || "");

  return (
    <BaseNode id={id} title="Condition" icon={GitBranch}
      inputs={[{ id: `${id}-input` }]}
      outputs={[{ id: `${id}-true` }, { id: `${id}-false` }]}
    >
      <div className="field">
        <label className="field-label">Variable</label>
        <input className="field-input" value={variable}
          onChange={(e) => { setVariable(e.target.value); updateNodeField(id, "variable", e.target.value); }}
          placeholder="e.g., input.field" />
      </div>
      <div className="field">
        <label className="field-label">Operator</label>
        <select className="field-input" value={operator}
          onChange={(e) => { setOperator(e.target.value); updateNodeField(id, "operator", e.target.value); }}>
          {OPERATORS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <div className="field">
        <label className="field-label">Value</label>
        <input className="field-input" value={value}
          onChange={(e) => { setValue(e.target.value); updateNodeField(id, "value", e.target.value); }}
          placeholder="value to compare" />
      </div>

      <div className="condition-labels">
        <span className="condition-label condition-label-true">✓ True</span>
        <span className="condition-label condition-label-false">✗ False</span>
      </div>
    </BaseNode>
  );
}
