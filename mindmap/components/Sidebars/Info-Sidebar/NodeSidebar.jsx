"use client";

import React, { useState, useEffect } from "react";
import InfoCard from "./Cards/InfoCard";
import SmallInfoCard from "./Cards/SmallInfoCard";
import TickerSentimentCard from "./Cards/TickerSentimentCard";
import OHLCDataCard from "./Cards/OHLCDataCard";
import CollapseButton from "./Buttons/CollapseButton";

const NodeSidebar = ({ selectedNode, selectedNodeData }) => {
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    if (selectedNode) {
      setCollapsed(false);
    }
  }, [selectedNode]);
  return (
    <div
      className="hide-scrollbar"
      style={{
        width: collapsed ? "10px" : "350px",
        transition: "width 0.3s ease",
        backgroundColor: "#f8f7fd",
        padding: "15px",
        marginRight: 0,
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.1)",
        borderTopLeftRadius: "24px",
        borderBottomLeftRadius: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        overflowY: "auto",
        position: "relative",
        zIndex: 50,
      }}
    >
      <CollapseButton
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
      />

      {!collapsed && (
        <>
          <h2
            style={{
              fontSize: "20px",
              color: "#6C63FF",
              marginBottom: "8px",
              textAlign: "center",
            }}
          >
            🧠 Node Details
          </h2>

          {!selectedNode ? (
            <div
              style={{
                fontSize: "16px",
                color: "#555",
                padding: "12px",
                background: "#fff",
                borderRadius: "12px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
                textAlign: "center",
              }}
            >
              Select a node to view details
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {selectedNodeData && (
                <>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      gap: "8px",
                    }}
                  >
                    {selectedNodeData.details.banner_image && (
                      <img
                        src={selectedNodeData.details.banner_image}
                        alt="Banner"
                        style={{
                          borderRadius: "16px",
                          maxWidth: "40%",
                          objectFit: "cover",
                          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                        }}
                      />
                    )}
                    <InfoCard
                      label="Title"
                      value={selectedNodeData.details.title}
                    />
                  </div>

                  <InfoCard
                    label="Summary"
                    value={selectedNodeData.details.summary}
                  />
                  <div style={{ display: "flex", gap: "8px" }}>
                    <SmallInfoCard
                      label="Source"
                      value={selectedNodeData.details.source}
                      color="#52a9ff"
                    />
                    <SmallInfoCard
                      label="Sentiment"
                      value={selectedNodeData.details.overall_sentiment_label}
                      color={selectedNodeData.details.color}
                    />
                  </div>

                  <InfoCard
                    label="Time Published"
                    value={selectedNodeData.details.time_published}
                  />

                  <TickerSentimentCard
                    sentiments={selectedNodeData.details.ticker_sentiment || []}
                  />

                  <OHLCDataCard ohlc={selectedNodeData.OHLC} />

                  {selectedNodeData.details.url && (
                    <a
                      href={selectedNodeData.details.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        marginTop: "8px",
                        display: "inline-block",
                        background: "#6C63FF",
                        color: "#fff",
                        textDecoration: "none",
                        padding: "10px 16px",
                        borderRadius: "8px",
                        textAlign: "center",
                      }}
                    >
                      Read Full Article
                    </a>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NodeSidebar;
