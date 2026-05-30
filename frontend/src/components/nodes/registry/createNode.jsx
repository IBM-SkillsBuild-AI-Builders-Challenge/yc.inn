import { BaseNode } from "../BaseNode";
import { useFlowStore } from "../../../store/useFlowStore";

export function createNode({ title, icon, inputs, outputs, fields }) {
  function GeneratedNode({ id, data }) {
    const updateNodeField = useFlowStore((s) => s.updateNodeField);

    const handleChange = (name, value) => {
      updateNodeField(id, name, value);
    };

    return (
      <BaseNode id={id} title={title} icon={icon}
        inputs={(inputs || []).map((inp) => ({ ...inp, id: `${id}-${inp.id}` }))}
        outputs={(outputs || []).map((out) => ({ ...out, id: `${id}-${out.id}` }))}>
        {fields?.map((field) => {
          const val = data?.[field.name] ?? field.default ?? "";
          return <Field key={field.name} field={field} value={val} onChange={(v) => handleChange(field.name, v)} />;
        })}
      </BaseNode>
    );
  }

  GeneratedNode.displayName = title.replace(/\s+/g, "");
  return GeneratedNode;
}

function Field({ field, value, onChange }) {
  switch (field.type) {
    case "text":
      return (
        <div className="field">
          <label className="field-label">{field.label}</label>
          <input className="field-input" value={value} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} />
        </div>
      );
    case "number":
      return (
        <div className="field">
          <label className="field-label">{field.label}</label>
          <input className="field-input" type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} placeholder={field.placeholder} min={field.min} />
        </div>
      );
    case "textarea":
      return (
        <div className="field">
          <label className="field-label">{field.label}</label>
          <textarea className="field-textarea" value={value} onChange={(e) => onChange(e.target.value)} rows={field.rows || 3} placeholder={field.placeholder} />
        </div>
      );
    case "select":
      return (
        <div className="field">
          <label className="field-label">{field.label}</label>
          <select className="field-input" value={value} onChange={(e) => onChange(e.target.value)}>
            {field.options?.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
      );
    default:
      return null;
  }
}
