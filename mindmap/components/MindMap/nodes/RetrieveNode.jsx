"use client";
import { memo } from "react";
import { Handle, Position, useReactFlow } from "reactflow";

const RetrieveNode = ({ data, id }) => {
  const { setNodes, setEdges } = useReactFlow();

  const handleDelete = (e) => {
    e.stopPropagation();
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #064e3b, #047857)",
        border: "2px solid rgba(52,211,153,0.5)",
        borderRadius: "16px",
        padding: "18px 24px",
        minWidth: "140px",
        color: "#e2e8f0",
        boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
        textAlign: "center",
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
      <div style={{ fontSize: "10px", fontWeight: 700, color: "#34d399", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
        Retrieve
      </div>
      <div style={{ fontSize: "14px", fontWeight: 600 }}>
        {data.articleCount != null ? `${data.articleCount} articles` : "Connect all branches"}
      </div>
      <Handle type="target" position={Position.Left} style={{ background: "#34d399", width: 12, height: 12 }} />
    </div>
  );
};

export default memo(RetrieveNode);
