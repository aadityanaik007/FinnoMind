"use client";

import React, { useState, useEffect } from "react";

const NodeFilterControls = ({ nodes, visibleNodeIds, setVisibleNodeIds }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [checked, setChecked] = useState({});

  // Filter only true month nodes (no sources inside) and valid sources (no articles)
  const monthNodes = nodes.filter(
    (n) =>
      n.id.includes("month") && !n.id.includes("source") && isNaN(n.data?.label)
  );

  const sourceNodes = nodes.filter(
    (n) =>
      n.id.includes("source") &&
      !n.id.includes("article") &&
      isNaN(n.data?.label)
  );

  useEffect(() => {
    const initialChecked = {};
    [...monthNodes, ...sourceNodes].forEach((n) => {
      initialChecked[n.id] = true;
    });
    setChecked(initialChecked);
  }, [nodes]);

  const handleToggle = (nodeId, type) => {
    const newChecked = { ...checked, [nodeId]: !checked[nodeId] };
    const updatedVisible = new Set(visibleNodeIds);

    const toggle = (id, show) =>
      show ? updatedVisible.add(id) : updatedVisible.delete(id);

    toggle(nodeId, newChecked[nodeId]);

    if (type === "month") {
      // Toggle sources and articles under this month
      const linkedSources = nodes.filter(
        (n) => n.id.startsWith(`${nodeId}-source`) && !n.id.includes("article")
      );

      linkedSources.forEach((source) => {
        toggle(source.id, newChecked[nodeId]);
        newChecked[source.id] = newChecked[nodeId];

        const linkedArticles = nodes.filter((a) =>
          a.id.startsWith(`${source.id}-article`)
        );
        linkedArticles.forEach((article) => {
          toggle(article.id, newChecked[nodeId]);
          newChecked[article.id] = newChecked[nodeId];
        });
      });
    }

    if (type === "source") {
      // Toggle only articles under this source
      const linkedArticles = nodes.filter((a) =>
        a.id.startsWith(`${nodeId}-article`)
      );
      linkedArticles.forEach((article) => {
        toggle(article.id, newChecked[nodeId]);
        newChecked[article.id] = newChecked[nodeId];
      });
    }

    setChecked(newChecked);
    setVisibleNodeIds(Array.from(updatedVisible));
  };

  const renderSection = (label, nodes, type) => (
    <div style={{ marginBottom: "1rem" }}>
      <h4 style={{ marginBottom: "0.5rem", color: "#333" }}>{label}</h4>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {nodes.map((n) => (
          <label key={n.id} style={{ display: "flex", gap: "0.5rem" }}>
            <input
              type="checkbox"
              checked={checked[n.id] || false}
              onChange={() => handleToggle(n.id, type)}
            />
            <span>{n.data?.label}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        height: "100%",
        backgroundColor: "#f1f1f1",
        width: isOpen ? "260px" : "40px",
        padding: isOpen ? "16px" : "0",
        overflowY: "auto",
        borderRight: "1px solid #ccc",
        transition: "width 0.3s ease",
        zIndex: 99,
      }}
    >
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          position: "absolute",
          top: "10px",
          right: "0px",
          backgroundColor: "#214f95",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "32px",
          height: "32px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        {isOpen ? "←" : "→"}
      </button>

      {isOpen && (
        <>
          <h3 style={{ fontSize: "16px", marginBottom: "1rem" }}>Filter</h3>
          {renderSection("Months", monthNodes, "month")}
          {renderSection("Sources", sourceNodes, "source")}
        </>
      )}
    </div>
  );
};

export default NodeFilterControls;
