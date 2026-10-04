"use client";

import React from "react";

const TickerDropDown = ({ options, value, onChange }) => {
  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      style={{
        minHeight: "38px",
        width: "140px",
        backgroundColor: "rgba(15,23,42,0.9)",
        color: "#e2e8f0",
        border: "1px solid rgba(148,163,184,0.2)",
        borderRadius: "8px",
        padding: "6px 10px",
        fontSize: "13px",
        cursor: "pointer",
        outline: "none",
      }}
    >
      <option value="">Select ticker...</option>
      {options.map((ticker) => (
        <option key={ticker} value={ticker}>
          {ticker}
        </option>
      ))}
    </select>
  );
};

export default TickerDropDown;
