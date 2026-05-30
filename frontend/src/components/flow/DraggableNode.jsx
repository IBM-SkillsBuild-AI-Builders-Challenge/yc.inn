export function DraggableNode({ type, label, icon: Icon, description }) {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData("application/reactflow", JSON.stringify({ nodeType }));
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      className="draggable-node"
      draggable
      onDragStart={(e) => onDragStart(e, type)}
    >
      <div className="draggable-node-icon">
        <Icon size={14} strokeWidth={2} />
      </div>
      <div className="draggable-node-text">
        <span className="draggable-node-label">{label}</span>
        {description && <span className="draggable-node-desc">{description}</span>}
      </div>
    </div>
  );
}
