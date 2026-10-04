"use client";

import React from "react";
import { Handle } from "reactflow";

const CenterNode = ({ data }) => {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #1e293b, #0f172a)",
        border: "2px solid rgba(59,130,246,0.4)",
        borderRadius: "14px",
        padding: "16px 20px",
        minWidth: "180px",
        boxShadow: "0 0 30px rgba(59,130,246,0.2)",
        position: "relative",
      }}
    >
      <div
        style={{
          textAlign: "center",
          marginBottom: "10px",
          fontSize: "18px",
          fontWeight: 800,
          color: "#fff",
          letterSpacing: "1px",
        }}
      >
        {data.ticker}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "center", marginBottom: "10px" }}>
        {data.topics?.map((t) => (
          <span
            key={t}
            style={{
              background: "rgba(59,130,246,0.15)",
              color: "#93c5fd",
              padding: "3px 10px",
              borderRadius: "6px",
              fontSize: "11px",
              fontWeight: 600,
              border: "1px solid rgba(59,130,246,0.25)",
            }}
          >
            {t}
          </span>
        ))}
      </div>

      <div
        style={{
          textAlign: "center",
          fontSize: "11px",
          color: "#64748b",
          borderTop: "1px solid rgba(148,163,184,0.15)",
          paddingTop: "8px",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        General News
      </div>

      <Handle type="source" position="top" style={{ background: "#3b82f6", width: 6, height: 6, border: "none" }} />
      <Handle type="source" position="right" id="right" style={{ background: "#3b82f6", width: 6, height: 6, border: "none" }} />
      <Handle type="source" position="bottom" id="bottom" style={{ background: "#3b82f6", width: 6, height: 6, border: "none" }} />
      <Handle type="source" position="left" id="left" style={{ background: "#3b82f6", width: 6, height: 6, border: "none" }} />
    </div>
  );
};

export default CenterNode;
