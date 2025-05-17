const API_BASE_URL = "http://localhost:8000/api";

export async function fetchMindmaps() {
  const res = await fetch(`${API_BASE_URL}/mindmaps`);
  const data = await res.json();
  return data;
}

export async function createMindmap(mindmap) {
  const res = await fetch(`${API_BASE_URL}/mindmap`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mindmap),
  });
  const data = await res.json();
  return data;
}

export async function getMindmapStatus(id) {
  const res = await fetch(`${API_BASE_URL}/status?id=${id}`);
  const data = await res.json();
  return data;
}

export async function deleteMindmap(id) {
  const res = await fetch(`${API_BASE_URL}/mindmap/${id}`, {
    method: "DELETE",
  });
  const data = await res.json();
  return data;
}

export const getNodeDetails = async (mindmapId, nodeId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/node-details?mindmap_id=${mindmapId}&node_id=${nodeId}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch node details");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const fetchMindmapNodesEdges = async (id) => {
  try {
    const res = await fetch(`${API_BASE_URL}/mindmap/${id}`);
    if (!res.ok) {
      throw new Error("Failed to fetch mindmap nodes/edges");
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching mindmap:", error);
    return null;
  }
};
