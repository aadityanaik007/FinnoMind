"use client";

import React from "react";
import SmallInfoCard from "./SmallInfoCard";

const TickerSentimentCard = ({ sentiments = [] }) => {
  if (!sentiments.length) return null;

  const color_map = {
    Bullish: "rgba(72,175,0,0.3)",
    "Somewhat-Bullish": "rgba(134,194,29,0.3)",
    Neutral: "rgba(144,144,144,0.3)",
    "Somewhat-Bearish": "rgba(231,120,18,0.3)",
    Bearish: "rgba(255,14,14,0.3)",
  };

  const text_map = {
    Bullish: "#86efac",
    "Somewhat-Bullish": "#bef264",
    Neutral: "#94a3b8",
    "Somewhat-Bearish": "#fbbf24",
    Bearish: "#fca5a5",
  };

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
        Ticker Sentiment
      </strong>
      <div
        style={{
          marginTop: "8px",
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
        }}
      >
        {sentiments.map((ts, idx) => (
          <SmallInfoCard
            key={idx}
            label={`${ts.ticker_sentiment_label} (${ts.ticker_sentiment_score})`}
            value={ts.ticker}
            color={color_map[ts.ticker_sentiment_label] || "rgba(100,100,100,0.2)"}
            textColor={text_map[ts.ticker_sentiment_label] || "#e2e8f0"}
          />
        ))}
      </div>
    </div>
  );
};

export default TickerSentimentCard;
