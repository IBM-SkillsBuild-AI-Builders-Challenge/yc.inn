const NODE_DELAY = 600;
const OVERALL_TIMEOUT = 60000;

function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

function topologicalSort(nodes, edges) {
  const adj = {};
  const inDeg = {};
  nodes.forEach((n) => { adj[n.id] = []; inDeg[n.id] = 0; });
  edges.forEach((e) => {
    if (adj[e.source]) adj[e.source].push(e.target);
    if (inDeg[e.target] !== undefined) inDeg[e.target]++;
  });
  const queue = nodes.filter((n) => inDeg[n.id] === 0).map((n) => n.id);
  const order = [];
  while (queue.length) {
    const n = queue.shift();
    order.push(n);
    (adj[n] || []).forEach((neighbor) => {
      inDeg[neighbor]--;
      if (inDeg[neighbor] === 0) queue.push(neighbor);
    });
  }
  return order;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function resolveTemplate(text, data) {
  if (!text || !data || typeof data !== "object") return text || "";
  return text.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_, key) => {
    const parts = key.split(".");
    let val = data;
    for (const part of parts) {
      if (val === undefined || val === null) return "";
      if (typeof val !== "object") return "";
      val = val[part];
    }
    return val !== undefined && val !== null ? String(val) : "";
  });
}

function getIncomingData(nodeId, nodes, edges, dataMap) {
  const incoming = edges.filter((e) => e.target === nodeId);
  const merged = {};
  incoming.forEach((e) => {
    const val = dataMap[e.source];
    if (val !== undefined) {
      merged.input = val;
      merged.value = val;
      const handle = (e.targetHandle || e.sourceHandle || "").replace(`${nodeId}-`, "");
      if (handle) merged[handle] = val;
    }
    const sourceNode = nodes.find((n) => n.id === e.source);
    if (sourceNode?.data) {
      Object.entries(sourceNode.data).forEach(([k, v]) => {
        if (merged[k] === undefined && v !== undefined && v !== null) {
          merged[k] = v;
        }
      });
      const nodeName = sourceNode.data.inputName || sourceNode.data.name || sourceNode.data.id || e.source;
      if (!merged[nodeName]) {
        merged[nodeName] = { value: val, ...sourceNode.data };
      }
    }
  });
  return merged;
}

async function executeNode(nodeId, nodes, edges, dataMap, setNodeOutput) {
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) return null;
  const type = node.type;
  const data = node.data || {};
  const upstream = getIncomingData(nodeId, nodes, edges, dataMap);
  const primaryInput = upstream.input !== undefined ? upstream.input : upstream.value;

  let output;

  switch (type) {
    case "customInput":
      output = data.inputValue || data.inputName || `input_${nodeId}`;
      break;

    case "customOutput":
      output = primaryInput !== undefined ? primaryInput
        : upstream.response || upstream.result
        || Object.values(upstream)[0] || `[Output ${data.outputName || nodeId}]`;
      await delay(NODE_DELAY / 2);
      break;

    case "text": {
      const text = data.text || "";
      if (text) {
        output = resolveTemplate(text, { ...upstream, ...(data.testValues || {}) });
      } else if (primaryInput !== undefined) {
        output = primaryInput;
      } else {
        output = "";
      }
      await delay(NODE_DELAY);
      break;
    }

    case "llm": {
      let filledPrompt = "";
      if (data.prompt) {
        filledPrompt = resolveTemplate(data.prompt, upstream);
      } else if (primaryInput !== undefined) {
        filledPrompt = primaryInput;
      }
      if (filledPrompt) {
        try {
          const res = await fetchWithTimeout("http://localhost:8000/api/v1/llm/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: data.model || "llama-3.3-70b-versatile",
              system_prompt: data.systemPrompt ? resolveTemplate(data.systemPrompt, upstream) : "",
              prompt: filledPrompt,
              temperature: 0.7, max_tokens: 512,
            }),
          }, 30000);
          const json = await res.json();
          if (!json.success) throw new Error(json.error || "LLM request failed");
          output = json.response || "(no response)";
        } catch (err) {
          throw new Error(`LLM "${nodeId}" failed: ${err.message}`);
        }
      } else {
        output = "[LLM — no prompt]";
        await delay(NODE_DELAY);
      }
      break;
    }

    case "api":
      if (data.url) {
        try {
          const res = await fetchWithTimeout(data.url, { method: data.method || "GET" }, 10000);
          output = `HTTP ${res.status}: ${await res.text().catch(() => "(body not readable)")}`;
        } catch (err) {
          output = `Error: ${err.message}`;
        }
      } else if (primaryInput !== undefined) {
        output = primaryInput;
        await delay(NODE_DELAY);
      } else {
        output = "[API — no URL]";
        await delay(NODE_DELAY);
      }
      break;

    case "condition":
    case "delay":
      output = primaryInput !== undefined ? primaryInput : "(data)";
      await delay(NODE_DELAY / 2);
      break;

    case "database":
      if (data.collection) {
        output = `[Database: ${data.operation || "query"} on ${data.collection}]`;
      } else if (primaryInput !== undefined) {
        output = primaryInput;
      } else {
        output = "[Database — no collection]";
      }
      await delay(NODE_DELAY);
      break;

    case "notification":
      if (data.recipient) {
        output = `[Notification sent via ${data.channel || "email"} to ${data.recipient}]`;
      } else if (primaryInput !== undefined) {
        output = primaryInput;
      } else {
        output = "[Notification — no recipient]";
      }
      await delay(NODE_DELAY);
      break;

    default:
      output = primaryInput !== undefined ? primaryInput : `[${type}]`;
      await delay(NODE_DELAY);
  }

  dataMap[nodeId] = output;
  setNodeOutput(nodeId, output);
  return output;
}

export async function executeWorkflow(nodes, edges, setNodeStatus, setEdgeStatus, setAlert, setNodeOutput) {
  const order = topologicalSort(nodes, edges);

  if (order.length !== nodes.length) {
    setAlert({ type: "error", title: "Cycle Detected", message: "Workflow contains cycles and cannot be executed." });
    return;
  }

  const outgoingEdges = {};
  edges.forEach((e) => {
    if (!outgoingEdges[e.source]) outgoingEdges[e.source] = [];
    outgoingEdges[e.source].push(e);
  });

  setAlert({ type: "info", title: "Running", message: `Executing ${nodes.length} nodes...` });

  const overallTimer = setTimeout(() => {
    setAlert({ type: "error", title: "Timed Out", message: `Workflow exceeded ${OVERALL_TIMEOUT / 1000}s limit.` });
    nodes.forEach((n) => setNodeStatus(n.id, "error"));
  }, OVERALL_TIMEOUT);

  const dataMap = {};

  try {
    for (const nodeId of order) {
      setNodeStatus(nodeId, "running");
      (outgoingEdges[nodeId] || []).forEach((e) => setEdgeStatus(e.id, "running"));
      await delay(400);

      try {
        await executeNode(nodeId, nodes, edges, dataMap, setNodeOutput);
        setNodeStatus(nodeId, "success");
        (outgoingEdges[nodeId] || []).forEach((e) => setEdgeStatus(e.id, "success"));
      } catch (err) {
        setNodeStatus(nodeId, "error");
        (outgoingEdges[nodeId] || []).forEach((e) => setEdgeStatus(e.id, "error"));
        clearTimeout(overallTimer);
        setAlert({ type: "error", title: "Execution Failed", message: err.name === "AbortError" ? `Node "${nodeId}" timed out` : err.message });
        return;
      }

      await delay(200);
    }

    clearTimeout(overallTimer);
    const outputNodes = nodes.filter((n) => n.type === "customOutput");
    setAlert({
      type: "success", title: "Execution Complete",
      message: outputNodes.length > 0
        ? `All ${nodes.length} nodes executed. Click "View Output" to see results.`
        : `All ${nodes.length} nodes executed successfully.`,
    });
  } catch (err) {
    clearTimeout(overallTimer);
    setAlert({ type: "error", title: "Execution Failed", message: err.message });
  }
}
