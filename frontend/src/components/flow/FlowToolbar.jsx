import { useState } from "react";
import { DraggableNode } from "./DraggableNode";
import { nodeRegistry, nodeCategories } from "../nodes/registry/nodeRegistry";
import { ChevronDown, Search } from "lucide-react";

export function FlowToolbar() {
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState({});
  const [isExpanded, setIsExpanded] = useState(true);

  const filtered = nodeRegistry.filter(
    (n) => n.label.toLowerCase().includes(search.toLowerCase()) ||
           n.description.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = nodeCategories.reduce((acc, cat) => {
    acc[cat.id] = filtered.filter((n) => n.category === cat.id);
    return acc;
  }, {});

  const toggleCategory = (id) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!isExpanded) {
    return (
      <div className="toolbar" style={{ width: "auto" }}>
        <div className="toolbar-header">
          <h3>Components</h3>
          <button onClick={() => setIsExpanded(true)}>
            <ChevronDown size={14} style={{ transform: "rotate(90deg)" }} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="toolbar">
      <div className="toolbar-header">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <h3>Components</h3>
          <span>{filtered.length}</span>
        </div>
        <button onClick={() => setIsExpanded(false)}>
          <ChevronDown size={14} />
        </button>
      </div>

      <div className="toolbar-search">
        <Search />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search components..."
        />
      </div>

      <div className="toolbar-body">
        {nodeCategories.map((cat) => {
          const items = grouped[cat.id] || [];
          if (items.length === 0) return null;
          const isCollapsed = collapsed[cat.id];

          return (
            <div key={cat.id} style={{ marginBottom: 10 }}>
              <div className="category-label" onClick={() => toggleCategory(cat.id)}>
                <span>{cat.label}</span>
                <ChevronDown size={12} style={{
                  transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)",
                  transition: "transform 0.15s",
                }} />
              </div>
              <div className={`category-items${isCollapsed ? " collapsed" : ""}`}>
                {items.map((node) => (
                  <DraggableNode
                    key={node.type}
                    type={node.type}
                    label={node.label}
                    icon={node.icon}
                    description={node.description}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
