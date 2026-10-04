"use client";

import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import TickerNode from "./nodes/TickerNode";
import TopicNode from "./nodes/TopicNode";
import EntityNode from "./nodes/EntityNode";
import RetrieveNode from "./nodes/RetrieveNode";
import CountEdge from "./edges/CountEdge";
import PlaygroundToolbar from "./PlaygroundToolbar";
import { saveGraph, publishMindmap } from "../../api/mindmapApi";

const VALID_CONNECTIONS = new Set([
  "ticker->topic",
  "topic->entity",
  "topic->retrieve",
  "entity->retrieve",
]);

const MindMapInner = ({
  mindmapId,
  initialNodes = [],
  initialEdges = [],
  initialEdgeCounts = {},
  initialValidation = {},
  initialStatus = "New",
  readOnly = false,
  onPublished,
  onUnpublished,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [edgeCounts, setEdgeCounts] = useState(initialEdgeCounts);
  const [validation, setValidation] = useState(initialValidation);
  const [status, setStatus] = useState(initialStatus);
  const [publishing, setPublishing] = useState(false);
  const saveTimer = useRef(null);
  const nodeIdCounter = useRef(1);

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  const nodeTypes = useMemo(
    () => ({
      ticker: TickerNode,
      topic: TopicNode,
      entity: EntityNode,
      retrieve: RetrieveNode,
    }),
    []
  );

  const edgeTypes = useMemo(() => ({ countEdge: CountEdge }), []);

  const edgesWithCounts = useMemo(() => {
    return edges.map((e) => ({
      ...e,
      type: "countEdge",
      data: { ...e.data, count: edgeCounts[e.id] },
    }));
  }, [edges, edgeCounts]);

  const triggerAutoSave = useCallback(
    (currentNodes, currentEdges) => {
      if (!mindmapId || readOnly) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        const playgroundNodes = currentNodes.map((n) => ({
          id: n.id,
          type: n.type,
          data: n.data,
          position: n.position,
        }));
        const playgroundEdges = currentEdges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
        }));
        try {
          const result = await saveGraph(mindmapId, playgroundNodes, playgroundEdges);
          if (result.edge_counts) setEdgeCounts(result.edge_counts);
          if (result.validation) setValidation(result.validation);
          if (result.status) setStatus(result.status);
        } catch (err) {
          console.error("Auto-save failed:", err);
        }
      }, 600);
    },
    [mindmapId, readOnly]
  );

  useEffect(() => {
    if (!readOnly) {
      triggerAutoSave(nodes, edges);
    }
  }, [nodes, edges, triggerAutoSave, readOnly]);

  const onConnect = useCallback(
    (connection) => {
      if (readOnly) return;
      const sourceNode = nodes.find((n) => n.id === connection.source);
      const targetNode = nodes.find((n) => n.id === connection.target);
      if (!sourceNode || !targetNode) return;

      const key = `${sourceNode.type}->${targetNode.type}`;
      if (!VALID_CONNECTIONS.has(key)) {
        alert(`Invalid connection: ${sourceNode.type} → ${targetNode.type}. Allowed: Ticker→Topic, Topic→Entity, Topic→Retrieve, Entity→Retrieve.`);
        return;
      }

      const wouldCycle = checkCycle(nodes, edges, connection);
      if (wouldCycle) {
        alert("This connection would create a cycle.");
        return;
      }

      const edgeId = `e-${connection.source}-${connection.target}`;
      setEdges((eds) =>
        addEdge({ ...connection, id: edgeId }, eds)
      );
    },
    [nodes, edges, setEdges, readOnly]
  );

  const getNextPosition = (type) => {
    const xPositions = { ticker: 100, topic: 400, entity: 650, retrieve: 900 };
    const baseX = xPositions[type] || 300;
    const existingOfType = nodes.filter((n) => n.type === type);
    const baseY = 200 + existingOfType.length * 160;
    return { x: baseX, y: baseY };
  };

  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, readOnly },
      }))
    );
  }, [readOnly, setNodes]);

  const addNode = (type, data) => {
    if (readOnly) return;
    const id = `${type}-${nodeIdCounter.current++}`;
    const position = getNextPosition(type);
    const newNode = { id, type, data: { ...data, readOnly }, position };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleAddTicker = (symbol, dateRange) => addNode("ticker", { symbol, dateRange });
  const handleAddTopic = (name) => addNode("topic", { name });
  const handleAddEntity = (name, entityType) => addNode("entity", { name, entityType });
  const handleAddRetrieve = () => {
    if (nodes.some((n) => n.type === "retrieve")) return;
    addNode("retrieve", {});
  };

  const handlePublish = async () => {
    if (!mindmapId || publishing) return;
    setPublishing(true);
    try {
      const result = await publishMindmap(mindmapId);
      setStatus("Published");
      if (onPublished) onPublished(result);
    } catch (err) {
      alert(`Publish failed: ${err.message}`);
    }
    setPublishing(false);
  };

  const handleNodesDelete = useCallback(
    (deletedNodes) => {
      if (readOnly) return;
      setEdges((eds) =>
        eds.filter(
          (e) =>
            !deletedNodes.some((d) => d.id === e.source || d.id === e.target)
        )
      );
    },
    [setEdges, readOnly]
  );

  return (
    <div style={{ display: "flex", height: "100%", position: "relative" }}>
      <div style={{ flex: 1, position: "relative" }}>
        {!readOnly && (
          <PlaygroundToolbar
            nodes={nodes}
            onAddTicker={handleAddTicker}
            onAddTopic={handleAddTopic}
            onAddEntity={handleAddEntity}
            onAddRetrieve={handleAddRetrieve}
            onPublish={handlePublish}
            validation={validation}
            status={status}
          />
        )}

        {readOnly && (
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              zIndex: 10,
              background: "rgba(15,23,42,0.9)",
              border: "1px solid rgba(16,185,129,0.3)",
              borderRadius: "10px",
              padding: "10px 16px",
              backdropFilter: "blur(12px)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span style={{ color: "#10b981", fontSize: "12px", fontWeight: 700 }}>
              Published — Graph is locked
            </span>
            <button
              onClick={onUnpublished}
              style={{
                padding: "6px 16px",
                borderRadius: "6px",
                border: "1px solid rgba(245,158,11,0.4)",
                background: "rgba(245,158,11,0.15)",
                color: "#fbbf24",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Unpublish to Edit
            </button>
          </div>
        )}

        <ReactFlow
          nodes={nodes}
          edges={edgesWithCounts}
          onNodesChange={readOnly ? undefined : onNodesChange}
          onEdgesChange={readOnly ? undefined : onEdgesChange}
          onConnect={readOnly ? undefined : onConnect}
          onNodesDelete={readOnly ? undefined : handleNodesDelete}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          nodesDraggable={!readOnly}
          nodesConnectable={!readOnly}
          elementsSelectable={!readOnly}
          deleteKeyCode={readOnly ? null : ["Backspace", "Delete"]}
          style={{ background: "#0f172a" }}
          defaultEdgeOptions={{
            type: "countEdge",
            style: { stroke: "rgba(148,163,184,0.3)", strokeWidth: 2 },
          }}
        >
          <MiniMap
            nodeColor={(n) => {
              if (n.type === "ticker") return "#8b5cf6";
              if (n.type === "topic") return "#0ea5e9";
              if (n.type === "entity") return "#a855f7";
              if (n.type === "retrieve") return "#10b981";
              return "#64748b";
            }}
            style={{
              background: "#1e293b",
              border: "1px solid rgba(148,163,184,0.15)",
              borderRadius: "8px",
            }}
            maskColor="rgba(15,23,42,0.7)"
          />
          <Controls
            style={{
              background: "#1e293b",
              border: "1px solid rgba(148,163,184,0.15)",
              borderRadius: "8px",
            }}
          />
          <Background color="#1e3a5f" gap={20} size={1} />
        </ReactFlow>
      </div>

      {publishing && (
        <div
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
        >
          <div style={{
            background: "rgba(15,23,42,0.95)",
            border: "1px solid rgba(148,163,184,0.2)",
            borderRadius: "12px",
            padding: "24px 32px",
            color: "#e2e8f0",
            fontSize: "15px",
            fontWeight: 600,
          }}>
            Publishing... Retrieving articles for the full graph.
          </div>
        </div>
      )}
    </div>
  );
};

function checkCycle(nodes, edges, newConnection) {
  const adj = {};
  for (const e of edges) {
    if (!adj[e.source]) adj[e.source] = [];
    adj[e.source].push(e.target);
  }
  if (!adj[newConnection.source]) adj[newConnection.source] = [];
  adj[newConnection.source].push(newConnection.target);

  const visited = new Set();
  const inStack = new Set();

  function dfs(id) {
    visited.add(id);
    inStack.add(id);
    for (const neighbor of adj[id] || []) {
      if (inStack.has(neighbor)) return true;
      if (!visited.has(neighbor) && dfs(neighbor)) return true;
    }
    inStack.delete(id);
    return false;
  }

  for (const n of nodes) {
    if (!visited.has(n.id) && dfs(n.id)) return true;
  }
  return false;
}

const MindMap = (props) => (
  <ReactFlowProvider>
    <MindMapInner {...props} />
  </ReactFlowProvider>
);

export default MindMap;
