"use client";

import React, { useEffect, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import CustomColoredNode from "./CustomColoredNode";
import NodeSidebar from "../Sidebars/Info-Sidebar/NodeSidebar";
import NodeFilterControls from "../Sidebars/Filter-Sidbar/NodeFilterControls";
import { getNodeDetails } from "../../api/mindmapApi";

const nodeTypes = {
  customColored: CustomColoredNode,
};

const MindMap = ({ nodesData = [], edgesData = [], mindmapId = "" }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(edgesData);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedNodeData, setSelectedNodeData] = useState(null);
  const [visibleNodeIds, setVisibleNodeIds] = useState([]);

  useEffect(() => {
    const updatedNodes = nodesData.map((node) => {
      if (node.data?.color) {
        return { ...node, type: "customColored" };
      }
      return node;
    });
    setNodes(updatedNodes);
    setVisibleNodeIds(updatedNodes.map((n) => n.id)); // Show all by default
  }, [nodesData]);

  const handleNodeClick = async (event, node) => {
    event.stopPropagation();
    setSelectedNode(node);

    try {
      if (!mindmapId) {
        console.error("Mindmap ID is missing!");
        return;
      }
      const data = await getNodeDetails(mindmapId, node.id);
      setSelectedNodeData(data);
    } catch (error) {
      console.error("Failed to fetch node details:", error);
      setSelectedNodeData(null);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ flex: 3, position: "relative" }}>
        <NodeFilterControls
          nodes={nodes}
          visibleNodeIds={visibleNodeIds}
          setVisibleNodeIds={setVisibleNodeIds}
        />

        <ReactFlow
          nodes={nodes.filter((n) => visibleNodeIds.includes(n.id))}
          edges={edges.filter(
            (e) =>
              visibleNodeIds.includes(e.source) &&
              visibleNodeIds.includes(e.target)
          )}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          fitView
          nodeTypes={nodeTypes}
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>

      <NodeSidebar
        nodes={nodes}
        selectedNode={selectedNode}
        selectedNodeData={selectedNodeData}
        setSelectedNode={setSelectedNode}
      />
    </div>
  );
};

export default MindMap;
