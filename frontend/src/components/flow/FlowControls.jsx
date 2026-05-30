import { useFlowStore } from "../../store/useFlowStore";
import { useState } from "react";
import { Trash2, Download, Upload, Undo2, Redo2 } from "lucide-react";

export function FlowControls() {
  const clearWorkflow = useFlowStore((s) => s.clearWorkflow);
  const getNodeData = useFlowStore((s) => s.getNodeData);
  const undo = useFlowStore((s) => s.undo);
  const redo = useFlowStore((s) => s.redo);
  const historyIndex = useFlowStore((s) => s.historyIndex);
  const history = useFlowStore((s) => s.history);
  const [confirmClear, setConfirmClear] = useState(false);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleClear = () => {
    if (confirmClear) { clearWorkflow(); setConfirmClear(false); }
    else { setConfirmClear(true); setTimeout(() => setConfirmClear(false), 3000); }
  };

  const handleExport = () => {
    const data = JSON.stringify(getNodeData(), null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "workflow.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          if (data.nodes && data.edges) {
            const store = useFlowStore.getState();
            store.nodes.forEach((n) => store.onNodesChange([{ id: n.id, type: "remove" }]));
            store.edges.forEach((e) => store.onEdgesChange([{ id: e.id, type: "remove" }]));
            data.nodes.forEach((n) => store.addNode(n));
            data.edges.forEach((e) => store.onConnect(e));
          }
        } catch (err) { /* invalid json */ }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="controls-panel">
      <button onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)"><Undo2 size={16} /></button>
      <button onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Y)"><Redo2 size={16} /></button>
      <div className="divider" />
      <button onClick={handleImport} title="Import workflow"><Upload size={16} /></button>
      <button onClick={handleExport} title="Export workflow"><Download size={16} /></button>
      <div className="divider" />
      <button
        className={confirmClear ? "danger" : ""}
        onClick={handleClear}
        title={confirmClear ? "Click again to confirm" : "Clear workflow"}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
