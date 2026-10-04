"use client";

import React from "react";

const OHLCDataCard = ({ ohlc }) => {
  if (!ohlc || Object.keys(ohlc).length === 0) return null;

  const renderRow = (label, data) => {
    if (!data) return null;
    return (
      <div style={{ marginBottom: "10px" }}>
        <strong style={{ color: "#94a3b8", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {label}
        </strong>
        <table style={{ width: "100%", fontSize: "12px", marginTop: "4px", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Open", "High", "Low", "Close", "Vol"].map((h) => (
                <th key={h} style={{ color: "#64748b", fontWeight: 600, padding: "4px 2px", textAlign: "center", borderBottom: "1px solid rgba(148,163,184,0.1)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tdStyle}>{(data.Open ?? data.open)?.toFixed(2)}</td>
              <td style={tdStyle}>{(data.High ?? data.high)?.toFixed(2)}</td>
              <td style={tdStyle}>{(data.Low ?? data.low)?.toFixed(2)}</td>
              <td style={tdStyle}>{(data.Close ?? data.close)?.toFixed(2)}</td>
              <td style={tdStyle}>{(data.Volume ?? data.volume)?.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const tdStyle = { color: "#e2e8f0", padding: "4px 2px", textAlign: "center" };

  return (
    <div
      style={{
        background: "rgba(15,23,42,0.5)",
        padding: "12px 14px",
        borderRadius: "10px",
        border: "1px solid rgba(148,163,184,0.08)",
      }}
    >
      <strong style={{ color: "#64748b", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
        OHLC Data
      </strong>
      <div style={{ marginTop: "8px" }}>
        {renderRow("Monthly Average", ohlc.monthly_avg)}
        {renderRow("Weekly Average", ohlc.weekly_avg)}
        {renderRow("Previous Day", ohlc.daily?.previous)}
        {renderRow("Current Day", ohlc.daily?.current)}
        {renderRow("Next Day", ohlc.daily?.next)}
      </div>
    </div>
  );
};

export default OHLCDataCard;
