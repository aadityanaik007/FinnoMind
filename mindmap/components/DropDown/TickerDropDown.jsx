"use client";

import React from "react";

const TickerDropDown = ({ options, value, onChange }) => {
  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      style={{
        minHeight: "40px",
        width: "200px",
        backgroundColor: "#214f95",
        color: "white",
        border: "1px solid white",
        borderRadius: "6px",
        padding: "8px",
      }}
    >
      <option value="">Select Ticker</option>
      {options.map((ticker) => (
        <option key={ticker} value={ticker}>
          {ticker}
        </option>
      ))}
    </select>
  );
};

export default TickerDropDown;
