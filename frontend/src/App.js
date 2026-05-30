import { useEffect } from "react";
import { FlowCanvas } from "./components/flow/FlowCanvas";
import { FlowToolbar } from "./components/flow/FlowToolbar";
import { FlowControls } from "./components/flow/FlowControls";
import { SubmitButton } from "./components/flow/SubmitButton";
import { AssistantPanel } from "./components/assistant/AssistantPanel";
import { useFlowStore } from "./store/useFlowStore";

function App() {
  const undo = useFlowStore((s) => s.undo);
  const redo = useFlowStore((s) => s.redo);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", position: "relative" }}>
      <FlowCanvas />
      <FlowToolbar />
      <FlowControls />
      <SubmitButton />
      <AssistantPanel />
    </div>
  );
}

export default App;
