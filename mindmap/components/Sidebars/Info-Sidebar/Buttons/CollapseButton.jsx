"use client";

import React from "react";

const CollapseButton = ({ collapsed, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      style={{
        position: "absolute",
        top: "12px",
        left: collapsed ? "50%" : "12px",
        transform: collapsed ? "translateX(-50%)" : "none",
        width: "28px",
        height: "28px",
        backgroundColor: "rgba(59,130,246,0.2)",
        color: "#93c5fd",
        border: "1px solid rgba(59,130,246,0.3)",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        transition: "all 0.2s ease",
      }}
      title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
    >
      {collapsed ? "‹" : "›"}
    </button>
  );
};

export default CollapseButton;
