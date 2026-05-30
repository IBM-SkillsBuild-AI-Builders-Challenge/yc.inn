import { useState, useEffect, useRef, useMemo } from "react";
import { BaseNode } from "../BaseNode";
import { useFlowStore } from "../../../store/useFlowStore";
import { parseVariables } from "../../../lib/parseVariables";
import { Type, Play, Variable } from "lucide-react";

export function TextNode({ id, data }) {
  const updateNodeField = useFlowStore((s) => s.updateNodeField);
  const [text, setText] = useState(data?.text || "");
  const [testValues, setTestValues] = useState(data?.testValues || {});
  const [rendered, setRendered] = useState(null);
  const textareaRef = useRef(null);

  const variables = useMemo(() => parseVariables(text || ""), [text]);
  const uniqueVars = useMemo(() => [...new Set(variables)], [variables]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [text]);

  const handleRender = () => {
    let result = text;
    uniqueVars.forEach((v) => {
      const val = testValues[v] || `{{${v}}}`;
      result = result.replace(new RegExp(`\\{\\{\\s*${v}\\s*\\}\\}`, "g"), val);
    });
    setRendered(result);
  };

  const setTestVal = (v, val) => {
    const next = { ...testValues, [v]: val };
    setTestValues(next);
    updateNodeField(id, "testValues", next);
  };

  return (
    <BaseNode
      id={id}
      title="Text"
      icon={Type}
      inputs={uniqueVars.map((v) => ({ id: `${id}-${v}` }))}
      outputs={[{ id: `${id}-output` }]}
      className="text-node"
    >
      <div className="field">
        <label className="field-label">Text Template</label>
        <textarea
          ref={textareaRef}
          className="field-textarea text-node-textarea"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            updateNodeField(id, "text", e.target.value);
            setRendered(null);
          }}
          rows={2}
          placeholder="Enter text with {{variables}}..."
        />
      </div>

      {uniqueVars.length > 0 && (
        <div className="var-badges">
          {uniqueVars.map((v) => (
            <span key={v} className="var-badge">
              <Variable size={10} />
              {v}
            </span>
          ))}
        </div>
      )}

      {uniqueVars.length > 0 && (
        <div style={{ marginTop: 4 }}>
          <label className="field-label">Test Values</label>
          {uniqueVars.map((v) => (
            <div key={v} className="var-input-row">
              <span className="var-input-label">{v}</span>
              <input
                className="field-input var-input-value"
                placeholder={`value for {{${v}}}`}
                value={testValues[v] || ""}
                onChange={(e) => setTestVal(v, e.target.value)}
              />
            </div>
          ))}
        </div>
      )}

      <button className="field-btn" onClick={handleRender}>
        <Play size={12} /> Preview Output
      </button>

      {rendered !== null && (
        <div className="field-output">
          <div className="field-output-label">Output</div>
          <div className="field-output-content">{rendered}</div>
        </div>
      )}
    </BaseNode>
  );
}
