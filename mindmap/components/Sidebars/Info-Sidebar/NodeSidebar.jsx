"use client";

import React, { useState, useEffect } from "react";
import InfoCard from "./Cards/InfoCard";
import SmallInfoCard from "./Cards/SmallInfoCard";
import TickerSentimentCard from "./Cards/TickerSentimentCard";
import OHLCDataCard from "./Cards/OHLCDataCard";
import EntityCard from "./Cards/EntityCard";
import CollapseButton from "./Buttons/CollapseButton";

const CenterDetails = ({ node }) => {
  const d = node.data;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div
        style={{
          background: "rgba(59,130,246,0.1)",
          border: "1px solid rgba(59,130,246,0.25)",
          borderRadius: "10px",
          padding: "16px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "24px", fontWeight: 800, color: "#fff", letterSpacing: "1px" }}>
          {d.ticker}
        </div>
      </div>

      <InfoCard label="Topics" value={d.topics?.join(", ")} />
      <InfoCard label="Type" value="General News" />
    </div>
  );
};

const SourceDetails = ({ node }) => {
  const d = node.data;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div
        style={{
          background: "rgba(15,23,42,0.5)",
          border: "1px solid rgba(148,163,184,0.08)",
          borderRadius: "10px",
          padding: "16px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "18px", fontWeight: 700, color: "#e2e8f0" }}>
          {d.label?.replace(/ \(\d+\)/, "")}
        </div>
        <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
          News Source
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        <SmallInfoCard
          label="Total Articles"
          value={`${d.articleCount} articles`}
          color="rgba(59,130,246,0.15)"
          textColor="#93c5fd"
        />
        <SmallInfoCard
          label="Current Page"
          value={`Page ${(d.currentPage || 0) + 1} of ${Math.ceil((d.articleCount || 1) / (d.pageSize || 5))}`}
          color="rgba(139,92,246,0.15)"
          textColor="#c4b5fd"
        />
      </div>
    </div>
  );
};

const MonthDetails = ({ node }) => {
  const d = node.data;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div
        style={{
          background: "rgba(139,92,246,0.1)",
          border: "1px solid rgba(139,92,246,0.25)",
          borderRadius: "10px",
          padding: "16px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "18px", fontWeight: 700, color: "#c4b5fd" }}>
          {d.label}
        </div>
        <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
          Month
        </div>
      </div>
    </div>
  );
};

const ArticleDetails = ({ selectedNodeData }) => {
  const details = selectedNodeData.details;
  return (
    <>
      {details.banner_image && (
        <img
          src={details.banner_image}
          alt="Banner"
          style={{
            borderRadius: "10px",
            width: "100%",
            maxHeight: "140px",
            objectFit: "cover",
            border: "1px solid rgba(148,163,184,0.1)",
          }}
        />
      )}

      <InfoCard label="Title" value={details.title} />
      <InfoCard label="Summary" value={details.summary} />

      <div style={{ display: "flex", gap: "8px" }}>
        <SmallInfoCard
          label="Source"
          value={details.source}
          color="rgba(59,130,246,0.25)"
          textColor="#93c5fd"
        />
        <SmallInfoCard
          label="Sentiment"
          value={details.overall_sentiment_label}
          color={details.color}
          textColor="#fff"
        />
      </div>

      {details.time_published && (
        <InfoCard label="Published" value={details.time_published} />
      )}

      <EntityCard entities={selectedNodeData.entities || []} />
      <TickerSentimentCard sentiments={details.ticker_sentiment || []} />
      <OHLCDataCard ohlc={selectedNodeData.OHLC} />

      {details.url && (
        <a
          href={details.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            marginTop: "4px",
            display: "block",
            background: "linear-gradient(135deg, #3b82f6, #2563eb)",
            color: "#fff",
            textDecoration: "none",
            padding: "10px 16px",
            borderRadius: "8px",
            textAlign: "center",
            fontWeight: 600,
            fontSize: "13px",
          }}
        >
          Read Full Article
        </a>
      )}
    </>
  );
};

const NodeSidebar = ({ selectedNode, selectedNodeData }) => {
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    if (selectedNode) setCollapsed(false);
  }, [selectedNode]);

  const renderContent = () => {
    if (!selectedNode) {
      return (
        <div
          style={{
            fontSize: "14px",
            color: "#64748b",
            padding: "20px 16px",
            background: "rgba(15,23,42,0.5)",
            borderRadius: "10px",
            border: "1px solid rgba(148,163,184,0.08)",
            textAlign: "center",
          }}
        >
          Click a node to view details
        </div>
      );
    }

    const d = selectedNode.data;

    if (d?.isCenterNode) {
      return <CenterDetails node={selectedNode} />;
    }

    if (d?.isSourceNode) {
      return <SourceDetails node={selectedNode} />;
    }

    if (d?.isMonthNode) {
      return <MonthDetails node={selectedNode} />;
    }

    if (selectedNodeData) {
      return <ArticleDetails selectedNodeData={selectedNodeData} />;
    }

    return (
      <InfoCard label="Node" value={d?.label || selectedNode.id} />
    );
  };

  return (
    <div
      className="hide-scrollbar"
      style={{
        width: collapsed ? "10px" : "360px",
        transition: "width 0.3s ease",
        background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
        padding: collapsed ? "8px" : "20px",
        borderLeft: "1px solid rgba(148,163,184,0.1)",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
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
              fontSize: "16px",
              color: "#94a3b8",
              marginBottom: "4px",
              textAlign: "center",
              fontWeight: 600,
              letterSpacing: "0.03em",
              textTransform: "uppercase",
            }}
          >
            Node Details
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {renderContent()}
          </div>
        </>
      )}
    </div>
  );
};

export default NodeSidebar;
