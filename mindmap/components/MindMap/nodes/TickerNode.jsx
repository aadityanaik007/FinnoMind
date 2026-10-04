"use client";
import { memo } from "react";
import { Handle, Position, useReactFlow } from "reactflow";

const TickerNode = ({ data, id }) => {
  const { setNodes, setEdges } = useReactFlow();

  const handleDelete = (e) => {
    e.stopPropagation();
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #1e1b4b, #312e81)",
        border: `2px solid ${data.symbol ? "rgba(139,92,246,0.5)" : "rgba(239,68,68,0.5)"}`,
        borderRadius: "12px",
        padding: "14px 18px",
        minWidth: "180px",
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
      <div style={{ fontSize: "10px", fontWeight: 700, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
        Ticker
      </div>
      <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: "4px" }}>
        {data.symbol || "Select ticker..."}
      </div>
      {data.dateRange?.start && data.dateRange?.end && (
        <div style={{ fontSize: "11px", color: "#94a3b8" }}>
          {data.dateRange.start} → {data.dateRange.end}
        </div>
      )}
      <Handle type="source" position={Position.Right} style={{ background: "#8b5cf6", width: 10, height: 10 }} />
    </div>
  );
};

export default memo(TickerNode);
