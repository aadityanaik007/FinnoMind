"use client";

import React from "react";
import { Handle } from "reactflow";

const CustomColoredNode = ({ data }) => {
  const backgroundColor = data.color || "#ffffff"; // Default color if not provided

  return (
    <div
      style={{
        width: 50, // ✅ Fixed width
        height: 50, // ✅ Fixed height
        borderRadius: "50%", // ✅ Make it a circle
        backgroundColor: backgroundColor,
        color: backgroundColor === "white" ? "black" : "white",
        fontWeight: "bold",
        border: "2px solid #000",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        fontSize: "12px",
        position: "relative",
      }}
    >
      {data.label}

      <Handle type="target" position="left" style={{ top: "50%" }} />
      <Handle type="source" position="right" style={{ top: "50%" }} />
    </div>
  );
};

export default CustomColoredNode;
