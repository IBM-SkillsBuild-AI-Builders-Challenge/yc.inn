import { create } from "zustand";
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
} from "@xyflow/react";

const MAX_HISTORY = 50;

function snap(nodes, edges) {
  return { nodes: structuredClone(nodes), edges: structuredClone(edges) };
}

export const useFlowStore = create((set, get) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  nodeIDs: {},
  nodeStatuses: {},
  edgeStatuses: {},
  nodeOutputs: {},
  alert: null,
  history: [snap([], [])],
  historyIndex: 0,

  _commit: () => {
    const { nodes, edges, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(snap(nodes, edges));
    if (newHistory.length > MAX_HISTORY) newHistory.shift();
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  undo: () => {
    const { historyIndex, history } = get();
    if (historyIndex <= 0) return;
    const idx = historyIndex - 1;
    set({ nodes: structuredClone(history[idx].nodes), edges: structuredClone(history[idx].edges), historyIndex: idx });
  },

  redo: () => {
    const { historyIndex, history } = get();
    if (historyIndex >= history.length - 1) return;
    const idx = historyIndex + 1;
    set({ nodes: structuredClone(history[idx].nodes), edges: structuredClone(history[idx].edges), historyIndex: idx });
  },

  setSelectedNode: (nodeId) => {
    set({ selectedNode: nodeId });
  },

  getNodeID: (nodeType) => {
    const newIDs = { ...get().nodeIDs };
    if (newIDs[nodeType] === undefined) newIDs[nodeType] = 0;
    newIDs[nodeType] += 1;
    set({ nodeIDs: newIDs });
    return `${nodeType}-${newIDs[nodeType]}`;
  },

  addNode: (node) => {
    set({ nodes: [...get().nodes, node] });
    get()._commit();
  },

  updateNode: (nodeId, data) => {
    set({
      nodes: get().nodes.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n)),
    });
    get()._commit();
  },

  deleteNode: (nodeId) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== nodeId),
      edges: get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNode: get().selectedNode === nodeId ? null : get().selectedNode,
    });
    get()._commit();
  },

  onNodesChange: (changes) => {
    const hasRemoval = changes.some((c) => c.type === "remove");
    set({ nodes: applyNodeChanges(changes, get().nodes) });
    if (hasRemoval) get()._commit();
  },

  onEdgesChange: (changes) => {
    const hasRemoval = changes.some((c) => c.type === "remove");
    set({ edges: applyEdgeChanges(changes, get().edges) });
    if (hasRemoval) get()._commit();
  },

  onConnect: (connection) => {
    set({
      edges: addEdge(
        {
          ...connection,
          type: "smoothstep",
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: "#94a3b8" },
        },
        get().edges
      ),
    });
    get()._commit();
  },

  updateNodeField: (nodeId, fieldName, fieldValue) => {
    set({
      nodes: get().nodes.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, [fieldName]: fieldValue } } : n)),
    });
    get()._commit();
  },

  getNodeData: () => {
    const { nodes, edges } = get();
    return { nodes, edges };
  },

  clearWorkflow: () => {
    set({ nodes: [], edges: [], selectedNode: null, nodeIDs: {}, nodeStatuses: {}, edgeStatuses: {}, nodeOutputs: {}, alert: null });
    get()._commit();
  },

  setNodeStatus: (nodeId, status) => {
    set({ nodeStatuses: { ...get().nodeStatuses, [nodeId]: status } });
  },

  setEdgeStatus: (edgeId, status) => {
    set({ edgeStatuses: { ...get().edgeStatuses, [edgeId]: status } });
  },

  clearNodeStatuses: () => {
    set({ nodeStatuses: {}, edgeStatuses: {}, nodeOutputs: {} });
  },

  setNodeOutput: (nodeId, output) => {
    set({ nodeOutputs: { ...get().nodeOutputs, [nodeId]: output } });
  },

  setAlert: (alert) => {
    set({ alert });
    if (alert) setTimeout(() => { if (get().alert === alert) set({ alert: null }); }, 5000);
  },

  addEdgeRaw: (source, target, sourceHandle, targetHandle) => {
    set({
      edges: [
        ...get().edges,
        {
          id: `e-${source}-${target}`,
          source,
          target,
          sourceHandle: sourceHandle || null,
          targetHandle: targetHandle || null,
          type: "smoothstep",
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: "#94a3b8" },
        },
      ],
    });
    get()._commit();
  },
}));
