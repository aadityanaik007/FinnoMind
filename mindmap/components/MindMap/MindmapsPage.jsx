"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fetchMindmapNodesEdges } from "../../api/mindmapApi"; // Adjust import if needed

import MindMap from "../MindMap/MindMap";

const MindmapsPage = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMindmap = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const mindmap = await fetchMindmapNodesEdges(id);
        if (mindmap) {
          setNodes(mindmap.nodes || []);
          setEdges(mindmap.edges || []);
        }
      } catch (error) {
        console.error("Failed to fetch mindmap", error);
      }
      setLoading(false);
    };

    fetchMindmap();
  }, [id]);

  if (loading) {
    return (
      <div style={{ color: "white", textAlign: "center", marginTop: "50px" }}>
        Loading Mindmap...
      </div>
    );
  }

  return <MindMap nodesData={nodes} edgesData={edges} mindmapId={id} />;
};

export default MindmapsPage;
