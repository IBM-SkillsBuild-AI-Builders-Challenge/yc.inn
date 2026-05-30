import { Handle, Position } from "@xyflow/react";
import { useFlowStore } from "../../store/useFlowStore";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

function getHandleColor(handleId) {
  const last = handleId.split("-").pop();
  if (["value", "output", "response", "result", "sent", "passed", "true"].includes(last)) return "handle-output";
  return "handle-input";
}

export function BaseNode({ id, title, icon: Icon, children, inputs = [], outputs = [], className = "" }) {
  const selectedNode = useFlowStore((s) => s.selectedNode);
  const nodeStatus = useFlowStore((s) => s.nodeStatuses[id]);

  const isSelected = selectedNode === id;

  const statusClass = !nodeStatus ? "" : nodeStatus === "running" ? " exec-running" : nodeStatus === "success" ? " exec-success" : " exec-error";
  const statusIcon = !nodeStatus ? null : nodeStatus === "running" ? <Loader2 size={12} className="spinner" /> : nodeStatus === "success" ? <CheckCircle2 size={12} /> : <XCircle size={12} />;

  return (
    <div className={`base-node${isSelected ? " selected" : ""}${statusClass}${className ? " " + className : ""}`}>
      <div className="base-node-header">
        {Icon && (
          <div className="base-node-header-icon">
            {statusIcon || <Icon size={14} strokeWidth={2} />}
          </div>
        )}
        <span className="base-node-header-title">{title}</span>
      </div>

      <div className="base-node-body">{children}</div>

      {inputs.map((input, i) => (
        <Handle
          key={input.id}
          type="target"
          position={Position.Left}
          id={input.id}
          className={getHandleColor(input.id)}
          style={{ top: `${((i + 0.5) / Math.max(inputs.length, 1)) * 100}%` }}
        />
      ))}

      {outputs.map((output, i) => (
        <Handle
          key={output.id}
          type="source"
          position={Position.Right}
          id={output.id}
          className={getHandleColor(output.id)}
          style={{ top: `${((i + 0.5) / Math.max(outputs.length, 1)) * 100}%` }}
        />
      ))}
    </div>
  );
}
