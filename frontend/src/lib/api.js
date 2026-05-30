const BASE_URL = "http://localhost:8000";

export async function parsePipeline(nodes, edges) {
  const res = await fetch(`${BASE_URL}/api/v1/pipelines/parse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nodes, edges }),
  });
  const data = await res.json();
  if (!res.ok) {
    const message = data?.detail || data?.message || "Request failed";
    throw new Error(message);
  }
  return data;
}
