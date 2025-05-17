"use client";

import React from "react";

const OHLCDataCard = ({ ohlc }) => {
  if (!ohlc) return null;

  const renderRow = (label, data) => {
    if (!data) return null;
    return (
      <div style={{ marginBottom: "12px" }}>
        <strong style={{ color: "#6C63FF" }}>{label}</strong>
        <table style={{ width: "100%", fontSize: "14px", marginTop: "4px" }}>
          <thead>
            <tr>
              <th>Open</th>
              <th>High</th>
              <th>Low</th>
              <th>Close</th>
              <th>Volume</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{(data.Open ?? data.open)?.toFixed(2)}</td>
              <td>{(data.High ?? data.high)?.toFixed(2)}</td>
              <td>{(data.Low ?? data.low)?.toFixed(2)}</td>
              <td>{(data.Close ?? data.close)?.toFixed(2)}</td>
              <td>{(data.Volume ?? data.volume)?.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div
      style={{
        background: "#fff",
        padding: "16px",
        borderRadius: "12px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
      }}
    >
      <h4 style={{ color: "#6C63FF", marginBottom: "12px" }}>📈 OHLC Data</h4>
      {renderRow("Monthly Average", ohlc.monthly_avg)}
      {renderRow("Weekly Average", ohlc.weekly_avg)}
      {renderRow("Previous Day", ohlc.daily?.previous)}
      {renderRow("Current Day", ohlc.daily?.current)}
      {renderRow("Next Day", ohlc.daily?.next)}
    </div>
  );
};

export default OHLCDataCard;
