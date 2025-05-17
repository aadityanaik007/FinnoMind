// components/TickerSentimentCard.jsx
"use client";

import React from "react";
import SmallInfoCard from "./SmallInfoCard";

const TickerSentimentCard = ({ sentiments = [] }) => {
  if (!sentiments.length) return null;

  const color_map = {
    Bullish: "#48af00",
    "Somewhat-Bullish": "#86c21d",
    Neutral: "#909090",
    "Somewhat-Bearish": "#e77812",
    Bearish: "#ff0e0e",
  };

  return (
    <div
      style={{
        background: "#fff",
        padding: "12px 16px",
        borderRadius: "12px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.06)",
      }}
    >
      <strong style={{ color: "#6C63FF" }}>Relevant Tickers:</strong>
      <div
        style={{
          marginTop: "8px",
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        {sentiments.map((ts, idx) => (
          <SmallInfoCard
            key={idx}
            label={`${ts.ticker_sentiment_label} (${ts.ticker_sentiment_score})`}
            value={ts.ticker}
            color={color_map[ts.ticker_sentiment_label] || "#ccc"}
          />
        ))}
      </div>
    </div>
  );
};

export default TickerSentimentCard;
