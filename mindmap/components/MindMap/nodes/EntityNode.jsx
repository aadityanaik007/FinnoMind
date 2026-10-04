"use client";
import { memo } from "react";
import { Handle, Position, useReactFlow } from "reactflow";

const EntityNode = ({ data, id }) => {
  const { setNodes, setEdges } = useReactFlow();

  const handleDelete = (e) => {
    e.stopPropagation();
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #3b0764, #6b21a8)",
        border: `2px solid ${data.name ? "rgba(192,132,252,0.5)" : "rgba(239,68,68,0.5)"}`,
        borderRadius: "12px",
        padding: "14px 18px",
        minWidth: "160px",
        color: "#e2e8f0",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        position: "relative",
      }}
    >
      {!data.readOnly && (
        <button
          onClick={handleDelete}
          style={{
            position: "absolute", top: -8, right: -8,
            width: 20, height: 20, borderRadius: "50%",
            background: "rgba(239,68,68,0.9)", border: "none",
            color: "#fff", fontSize: "12px", fontWeight: 700,
            cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center",
            lineHeight: 1, padding: 0,
          }}
        >
          ×
        </button>
      )}
      <div style={{ fontSize: "10px", fontWeight: 700, color: "#c084fc", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
        Entity {data.entityType ? `(${data.entityType})` : ""}
      </div>
      <div style={{ fontSize: "15px", fontWeight: 600 }}>
        {data.name || "Select entity..."}
      </div>
      <Handle type="target" position={Position.Left} style={{ background: "#c084fc", width: 10, height: 10 }} />
      <Handle type="source" position={Position.Right} style={{ background: "#c084fc", width: 10, height: 10 }} />
    </div>
  );
};

export default memo(EntityNode);
