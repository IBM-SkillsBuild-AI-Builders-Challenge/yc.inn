import { MarkerType } from "@xyflow/react";

export const defaultEdgeOptions = {
  type: "smoothstep",
  animated: true,
  style: {
    strokeWidth: 2.5,
    stroke: "#b1ada1",
  },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 24,
    height: 24,
    color: "#b1ada1",
  },
};

export const connectionLineStyle = {
  strokeWidth: 2.5,
  stroke: "#c15f3c",
};

export const snapGrid = [20, 20];

export const minimapStyle = {
  height: 120,
  width: 180,
  borderRadius: 8,
};
