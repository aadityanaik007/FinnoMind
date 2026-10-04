"use client";

import React from "react";
import { Handle } from "reactflow";

const CustomColoredNode = ({ data }) => {
  const bg = data.color || "#ffffff";
  const highlighted = data.highlighted;

  return (
    <div
      style={{
        width: highlighted ? 52 : 44,
        height: highlighted ? 52 : 44,
        borderRadius: "50%",
        backgroundColor: bg,
        color: bg === "white" || bg === "#ffffff" ? "#0f172a" : "#fff",
        fontWeight: 700,
        border: highlighted ? "3px solid #facc15" : "2px solid rgba(255,255,255,0.2)",
        boxShadow: highlighted
          ? "0 0 20px rgba(250,204,21,0.6), 0 0 40px rgba(250,204,21,0.3)"
          : `0 0 12px ${bg}66`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: highlighted ? "14px" : "12px",
        position: "relative",
        cursor: "pointer",
        transition: "all 0.3s ease",
        animation: highlighted ? "pulse 1.5s ease-in-out infinite" : "none",
      }}
    >
      {data.label}
      <Handle type="target" position="left" style={{ top: "50%", background: "#64748b", width: 6, height: 6, border: "none" }} />
      <Handle type="source" position="right" style={{ top: "50%", background: "#64748b", width: 6, height: 6, border: "none" }} />
    </div>
  );
};

export default CustomColoredNode;
