import { useState } from "react";
import { BaseNode } from "../BaseNode";
import { useFlowStore } from "../../../store/useFlowStore";
import { FileInput } from "lucide-react";

export function InputNode({ id, data }) {
  const updateNodeField = useFlowStore((s) => s.updateNodeField);
  const [name, setName] = useState(data?.inputName || "input_" + id.split("-").pop());
  const [value, setValue] = useState(data?.inputValue || "");

  return (
    <BaseNode id={id} title="Input" icon={FileInput} outputs={[{ id: `${id}-value` }]}>
      <div className="field">
        <label className="field-label">Name</label>
        <input className="field-input" value={name}
          onChange={(e) => { setName(e.target.value); updateNodeField(id, "inputName", e.target.value); }}
          placeholder="input name" />
      </div>
      <div className="field">
        <label className="field-label">Value</label>
        <textarea className="field-textarea" value={value} rows={3}
          onChange={(e) => { setValue(e.target.value); updateNodeField(id, "inputValue", e.target.value); }}
          placeholder="Enter input text..." />
      </div>
    </BaseNode>
  );
}
