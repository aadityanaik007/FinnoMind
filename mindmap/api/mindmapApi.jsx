const API_BASE_URL = "http://localhost:8000/api";

export async function fetchMindmaps() {
  const res = await fetch(`${API_BASE_URL}/mindmaps`);
  return await res.json();
}

export async function createMindmap({ name, description }) {
  const res = await fetch(`${API_BASE_URL}/mindmap`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, description }),
  });
  return await res.json();
}

export async function getMindmap(id) {
  const res = await fetch(`${API_BASE_URL}/mindmap/${id}`);
  if (!res.ok) throw new Error("Mindmap not found");
  return await res.json();
}

export async function deleteMindmap(id) {
  const res = await fetch(`${API_BASE_URL}/mindmap/${id}`, {
    method: "DELETE",
  });
  return await res.json();
}

export async function saveGraph(id, playgroundNodes, playgroundEdges) {
  const res = await fetch(`${API_BASE_URL}/mindmap/${id}/graph`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      playground_nodes: playgroundNodes,
      playground_edges: playgroundEdges,
    }),
  });
  return await res.json();
}

export async function publishMindmap(id) {
  const res = await fetch(`${API_BASE_URL}/mindmap/${id}/publish`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail?.message || err.detail || "Publish failed");
  }
  return await res.json();
}

export async function getEdgeCounts(id) {
  const res = await fetch(`${API_BASE_URL}/mindmap/${id}/edge-counts`);
  return await res.json();
}

export async function getMindmapEntities(id) {
  const res = await fetch(`${API_BASE_URL}/mindmap/${id}/entities`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Cannot fetch entities");
  }
  return await res.json();
}

export async function getMindmapStatus(id) {
  const res = await fetch(`${API_BASE_URL}/status?id=${id}`);
  return await res.json();
}

export async function getArticleCounts(ticker, topics) {
  const topicsParam = topics.join(",");
  const res = await fetch(
    `${API_BASE_URL}/article-counts?ticker=${encodeURIComponent(ticker)}&topics=${encodeURIComponent(topicsParam)}`
  );
  return await res.json();
}

export const getNodeDetails = async (mindmapId, nodeId) => {
  const response = await fetch(
    `${API_BASE_URL}/node-details?mindmap_id=${mindmapId}&node_id=${nodeId}`
  );
  if (!response.ok) throw new Error("Failed to fetch node details");
  return await response.json();
};

export async function updateMindmap(id, { name, description }) {
  const res = await fetch(`${API_BASE_URL}/mindmap/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, description }),
  });
  if (!res.ok) throw new Error("Failed to update mindmap");
  return await res.json();
}

export async function unpublishMindmap(id) {
  const res = await fetch(`${API_BASE_URL}/mindmap/${id}/unpublish`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Unpublish failed");
  }
  return await res.json();
}

export async function getMindmapArticles(id) {
  const res = await fetch(`${API_BASE_URL}/mindmap/${id}/articles`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Cannot fetch articles");
  }
  return await res.json();
}

export async function searchEntities(q) {
  const res = await fetch(`${API_BASE_URL}/entities/search?q=${encodeURIComponent(q)}`);
  return await res.json();
}
