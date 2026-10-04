"use client";

import React from "react";
import { Handle } from "reactflow";

const SourceNode = ({ data }) => {
  const totalPages = Math.ceil((data.articleCount || 0) / (data.pageSize || 5));
  const currentPage = (data.currentPage || 0) + 1;

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #1e293b, #334155)",
        border: "1px solid rgba(148,163,184,0.2)",
        borderRadius: "12px",
        padding: "8px 12px",
        minWidth: "120px",
        textAlign: "center",
        position: "relative",
      }}
    >
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px",
            marginBottom: "4px",
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              data.onPageChange?.(-1);
            }}
            style={{
              width: "22px",
              height: "22px",
              borderRadius: "4px",
              border: "1px solid rgba(148,163,184,0.2)",
              background: currentPage <= 1 ? "transparent" : "rgba(59,130,246,0.2)",
              color: currentPage <= 1 ? "#475569" : "#93c5fd",
              cursor: currentPage <= 1 ? "default" : "pointer",
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
            }}
            disabled={currentPage <= 1}
          >
            ‹
          </button>
          <span style={{ fontSize: "10px", color: "#64748b" }}>
            {currentPage}/{totalPages}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              data.onPageChange?.(1);
            }}
            style={{
              width: "22px",
              height: "22px",
              borderRadius: "4px",
              border: "1px solid rgba(148,163,184,0.2)",
              background: currentPage >= totalPages ? "transparent" : "rgba(59,130,246,0.2)",
              color: currentPage >= totalPages ? "#475569" : "#93c5fd",
              cursor: currentPage >= totalPages ? "default" : "pointer",
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
            }}
            disabled={currentPage >= totalPages}
          >
            ›
          </button>
        </div>
      )}

      <div style={{ color: "#e2e8f0", fontSize: "12px", fontWeight: 600 }}>
        {data.label}
      </div>
      <div style={{ color: "#64748b", fontSize: "10px", marginTop: "2px" }}>
        {data.articleCount} articles
      </div>

      <Handle type="target" position="left" style={{ background: "#64748b", width: 6, height: 6, border: "none" }} />
      <Handle type="source" position="right" style={{ background: "#64748b", width: 6, height: 6, border: "none" }} />
      <Handle type="source" position="top" id="top" style={{ background: "#64748b", width: 6, height: 6, border: "none" }} />
      <Handle type="source" position="bottom" id="bottom" style={{ background: "#64748b", width: 6, height: 6, border: "none" }} />
    </div>
  );
};

export default SourceNode;
