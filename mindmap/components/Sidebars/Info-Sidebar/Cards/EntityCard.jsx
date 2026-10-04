"use client";

import React from "react";

const typeConfig = {
  Person: { bg: "rgba(168,85,247,0.15)", color: "#c084fc", border: "rgba(168,85,247,0.3)" },
  Company: { bg: "rgba(59,130,246,0.15)", color: "#93c5fd", border: "rgba(59,130,246,0.3)" },
  Product: { bg: "rgba(16,185,129,0.15)", color: "#6ee7b7", border: "rgba(16,185,129,0.3)" },
  Other: { bg: "rgba(148,163,184,0.15)", color: "#94a3b8", border: "rgba(148,163,184,0.3)" },
};

const EntityCard = ({ entities = [] }) => {
  if (!entities.length) return null;

  return (
    <div
      style={{
        background: "rgba(15,23,42,0.5)",
        padding: "12px 14px",
        borderRadius: "10px",
        border: "1px solid rgba(148,163,184,0.08)",
      }}
    >
      <strong
        style={{
          color: "#64748b",
          fontSize: "11px",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        Entities
      </strong>
      <div
        style={{
          marginTop: "8px",
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
        }}
      >
        {entities.map((e, idx) => {
          const cfg = typeConfig[e.type] || typeConfig.Other;
          return (
            <span
              key={idx}
              style={{
                background: cfg.bg,
                color: cfg.color,
                border: `1px solid ${cfg.border}`,
                padding: "3px 10px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span style={{ fontSize: "10px", opacity: 0.7 }}>
                {e.type === "Person" ? "P" : e.type === "Company" ? "C" : e.type === "Product" ? "Pr" : "?"}
              </span>
              {e.canonical_name}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default EntityCard;
