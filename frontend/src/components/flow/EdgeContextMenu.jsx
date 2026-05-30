import { useEffect, useRef } from "react";
import { Unlink } from "lucide-react";
import { useFlowStore } from "../../store/useFlowStore";

export function EdgeContextMenu({ edgeId, position, onClose }) {
  const onEdgesChange = useFlowStore((s) => s.onEdgesChange);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const handleCut = () => {
    onEdgesChange([{ id: edgeId, type: "remove" }]);
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="edge-context-menu"
      style={{ left: position.x, top: position.y }}
    >
      <button className="edge-context-menu-item" onClick={handleCut}>
        <Unlink size={14} />
        <span>Cut connection</span>
      </button>
    </div>
  );
}
