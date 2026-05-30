import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function generateNodeId(type, count) {
  return `${type}-${count + 1}`;
}

export function getHandleColor(type) {
  const colors = {
    value: "bg-charcoal border-white",
    output: "bg-charcoal border-white",
    response: "bg-charcoal border-white",
    result: "bg-charcoal border-white",
    sent: "bg-charcoal border-white",
    passed: "bg-charcoal border-white",
    true: "bg-charcoal border-white",
    input: "bg-taupe border-white",
    system: "bg-taupe border-white",
    prompt: "bg-taupe border-white",
    to: "bg-taupe border-white",
    body: "bg-taupe border-white",
    query: "bg-taupe border-white",
    false: "bg-taupe/50 border-white",
    rejected: "bg-taupe/50 border-white",
  };
  return colors[type] || "bg-taupe border-white";
}
