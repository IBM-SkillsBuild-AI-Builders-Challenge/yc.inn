import { MarkerType } from "@xyflow/react";

export const defaultEdgeOptions = {
  type: "smoothstep",
  animated: true,
  style: {
    strokeWidth: 2.5,
    stroke: "#706E6A",
  },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 24,
    height: 24,
    color: "#706E6A",
  },
};

export const connectionLineStyle = {
  strokeWidth: 2.5,
  stroke: "#141414",
};

export const snapGrid = [20, 20];

export const minimapStyle = {
  height: 120,
  width: 180,
  borderRadius: 8,
};
