import { useState, useRef, useCallback } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  BackgroundVariant,
} from "@xyflow/react";
import { useFlowStore } from "../../store/useFlowStore";
import { nodeTypes } from "../nodes";
import { MarkerType } from "@xyflow/react";
import {
  defaultEdgeOptions,
  connectionLineStyle,
  snapGrid,
  minimapStyle,
} from "../../lib/flowHelpers";
import { EdgeContextMenu } from "./EdgeContextMenu";
import "@xyflow/react/dist/style.css";
import "../../styles/reactflow.css";

const proOptions = { hideAttribution: true };

export function FlowCanvas() {
  const wrapperRef = useRef(null);
  const [rfInstance, setRfInstance] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);

  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const edgeStatuses = useFlowStore((s) => s.edgeStatuses);
  const getNodeID = useFlowStore((s) => s.getNodeID);
  const addNode = useFlowStore((s) => s.addNode);
  const onNodesChange = useFlowStore((s) => s.onNodesChange);
  const onEdgesChange = useFlowStore((s) => s.onEdgesChange);
  const onConnect = useFlowStore((s) => s.onConnect);
  const setSelectedNode = useFlowStore((s) => s.setSelectedNode);

  const onEdgeContextMenu = useCallback((event, edge) => {
    event.preventDefault();
    setContextMenu({ edgeId: edge.id, x: event.clientX, y: event.clientY });
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const raw = event.dataTransfer?.getData("application/reactflow");
      if (!raw) return;

      const { nodeType: type } = JSON.parse(raw);
      if (!type || !rfInstance) return;

      const position = rfInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const nodeID = getNodeID(type);
      addNode({
        id: nodeID,
        type,
        position,
        data: { id: nodeID, nodeType: type },
      });
    },
    [rfInstance, getNodeID, addNode]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const styledEdges = edges.map((e) => {
    const status = edgeStatuses[e.id];
    if (!status) return e;
    const edgeColor = status === "running" ? "#2563EB" : status === "success" ? "#16A34A" : "#DC2626";
    return {
      ...e,
      className: `exec-${status}`,
      style: {
        ...e.style,
        stroke: edgeColor,
        strokeWidth: 2.5,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: edgeColor,
      },
      animated: status === "running",
    };
  });

  return (
    <div ref={wrapperRef} style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={styledEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onInit={setRfInstance}
        onNodeClick={(_, node) => setSelectedNode(node.id)}
        onPaneClick={() => { setSelectedNode(null); setContextMenu(null); }}
        onEdgeContextMenu={onEdgeContextMenu}
        nodeTypes={nodeTypes}
        proOptions={proOptions}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionLineStyle={connectionLineStyle}
        snapGrid={snapGrid}
        connectionLineType="smoothstep"
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
        maxZoom={2}
        snapToGrid
        deleteKeyCode={["Backspace", "Delete"]}
        selectionOnDrag
        panOnScroll
        zoomOnDoubleClick={false}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#D1CEC5" />
        <Controls showInteractive={false} position="top-right" />
        <MiniMap
          style={minimapStyle}
          nodeColor="#E5E2DA"
          nodeStrokeColor="#D1CEC5"
          nodeBorderRadius={8}
          maskColor="rgba(251,249,244,0.7)"
        />
      </ReactFlow>
      {contextMenu && (
        <EdgeContextMenu
          edgeId={contextMenu.edgeId}
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
