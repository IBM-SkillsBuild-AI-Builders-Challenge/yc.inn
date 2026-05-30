import { useState, useCallback } from "react";
import { useFlowStore } from "../../store/useFlowStore";
import { executeWorkflow } from "../../lib/workflowExecutor";
import { cn } from "../../lib/utils";
import { Loader2, Play, X, CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";

function AlertToast({ alert, onDismiss }) {
  if (!alert) return null;

  const icons = {
    success: <CheckCircle2 size={18} color="#16A34A" />,
    error: <XCircle size={18} color="#DC2626" />,
    warning: <AlertTriangle size={18} color="#D97706" />,
    info: <Info size={18} color="#2563EB" />,
  };

  const borders = {
    success: "3px solid #16A34A",
    error: "3px solid #DC2626",
    warning: "3px solid #D97706",
    info: "3px solid #2563EB",
  };

  return (
    <div className="alert-toast" style={{ borderLeft: borders[alert.type] || borders.info }}>
      <div className="alert-toast-icon">{icons[alert.type] || icons.info}</div>
      <div className="alert-toast-body">
        <span className="alert-toast-title">{alert.title}</span>
        {alert.message && <span className="alert-toast-msg">{alert.message}</span>}
      </div>
      <button className="alert-toast-close" onClick={onDismiss}><X size={14} /></button>
    </div>
  );
}

export function SubmitButton() {
  const [isLoading, setIsLoading] = useState(false);
  const getNodeData = useFlowStore((s) => s.getNodeData);
  const setNodeStatus = useFlowStore((s) => s.setNodeStatus);
  const setEdgeStatus = useFlowStore((s) => s.setEdgeStatus);
  const setNodeOutput = useFlowStore((s) => s.setNodeOutput);
  const setAlert = useFlowStore((s) => s.setAlert);
  const alert = useFlowStore((s) => s.alert);
  const clearNodeStatuses = useFlowStore((s) => s.clearNodeStatuses);

  const handleRun = useCallback(async () => {
    const { nodes, edges } = getNodeData();

    if (nodes.length === 0) {
      setAlert({ type: "error", title: "Empty Pipeline", message: "Add at least one node." });
      return;
    }

    setIsLoading(true);
    clearNodeStatuses();
    await executeWorkflow(nodes, edges, setNodeStatus, setEdgeStatus, setAlert, setNodeOutput);
    setIsLoading(false);
  }, [getNodeData, setNodeStatus, setEdgeStatus, setAlert, clearNodeStatuses, setNodeOutput]);

  return (
    <div className="submit-wrapper">
      <AlertToast alert={alert} onDismiss={() => setAlert(null)} />

      <button
        onClick={handleRun}
        disabled={isLoading}
        className={cn("submit-btn", isLoading && "is-running")}
      >
        {isLoading ? (
          <><Loader2 className="spinner" /><span>Running...</span></>
        ) : (
          <><Play fill="currentColor" /><span>Run Pipeline</span></>
        )}
      </button>
    </div>
  );
}
