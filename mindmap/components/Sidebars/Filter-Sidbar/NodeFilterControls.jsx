"use client";

import React, { useState, useEffect } from "react";

const NodeFilterControls = ({ nodes, visibleNodeIds, setVisibleNodeIds }) => {
  const [checked, setChecked] = useState({});

  const monthNodes = nodes.filter((n) => n.data?.isMonthNode);
  const sourceNodes = nodes.filter((n) => n.data?.isSourceNode);

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
      const linkedSources = nodes.filter(
        (n) => n.data?.isSourceNode && n.id.startsWith(`${nodeId}-source`)
      );
      linkedSources.forEach((source) => {
        toggle(source.id, newChecked[nodeId]);
        newChecked[source.id] = newChecked[nodeId];
        nodes
          .filter((a) => a.id.startsWith(`${source.id}-article`))
          .forEach((article) => {
            toggle(article.id, newChecked[nodeId]);
            newChecked[article.id] = newChecked[nodeId];
          });
      });
    }

    if (type === "source") {
      nodes
        .filter((a) => a.id.startsWith(`${nodeId}-article`))
        .forEach((article) => {
          toggle(article.id, newChecked[nodeId]);
          newChecked[article.id] = newChecked[nodeId];
        });
    }

    setChecked(newChecked);
    setVisibleNodeIds(Array.from(updatedVisible));
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "12px",
        left: "12px",
        zIndex: 99,
        display: "flex",
        gap: "6px",
        flexWrap: "wrap",
        maxWidth: "calc(100% - 400px)",
      }}
    >
      {monthNodes.map((n) => (
        <button
          key={n.id}
          onClick={() => handleToggle(n.id, "month")}
          style={{
            padding: "5px 12px",
            borderRadius: "6px",
            border: checked[n.id]
              ? "1px solid rgba(139,92,246,0.4)"
              : "1px solid rgba(148,163,184,0.15)",
            background: checked[n.id]
              ? "rgba(139,92,246,0.15)"
              : "rgba(15,23,42,0.4)",
            backdropFilter: "blur(8px)",
            color: checked[n.id] ? "#c4b5fd" : "#475569",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          {n.data?.label}
        </button>
      ))}

      <div
        style={{
          width: "1px",
          background: "rgba(148,163,184,0.15)",
          alignSelf: "stretch",
          margin: "0 2px",
        }}
      />

      {sourceNodes.map((n) => (
        <button
          key={n.id}
          onClick={() => handleToggle(n.id, "source")}
          style={{
            padding: "5px 12px",
            borderRadius: "6px",
            border: checked[n.id]
              ? "1px solid rgba(59,130,246,0.4)"
              : "1px solid rgba(148,163,184,0.15)",
            background: checked[n.id]
              ? "rgba(59,130,246,0.12)"
              : "rgba(15,23,42,0.4)",
            backdropFilter: "blur(8px)",
            color: checked[n.id] ? "#93c5fd" : "#475569",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          {n.data?.label?.replace(/ \(\d+\)/, "")}
        </button>
      ))}
    </div>
  );
};

export default NodeFilterControls;
