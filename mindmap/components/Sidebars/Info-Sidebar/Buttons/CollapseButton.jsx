"use client";

import React from "react";

const CollapseButton = ({ collapsed, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      style={{
        position: "absolute",
        top: "12px",
        right: "20px",
        left: collapsed ? "5px" : "18px",
        transform: collapsed ? "none" : "translateX(-50%)",
        width: "32px",
        height: "32px",
        backgroundColor: "#6C63FF",
        color: "#fff",
        border: "none",
        borderRadius: "50%",
        cursor: "pointer",
        fontSize: "16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
        zIndex: 100,
      }}
      title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
    >
      {collapsed ? "<" : ">"}
    </button>
  );
};

export default CollapseButton;
