"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API = "http://localhost:8000/api";

const typeConfig = {
  Person: { bg: "rgba(168,85,247,0.15)", color: "#c084fc", border: "rgba(168,85,247,0.3)" },
  Company: { bg: "rgba(59,130,246,0.15)", color: "#93c5fd", border: "rgba(59,130,246,0.3)" },
  Product: { bg: "rgba(16,185,129,0.15)", color: "#6ee7b7", border: "rgba(16,185,129,0.3)" },
  Other: { bg: "rgba(148,163,184,0.15)", color: "#94a3b8", border: "rgba(148,163,184,0.3)" },
};

function formatDate(raw) {
  if (!raw) return "";
  const match = raw.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})$/);
  if (match) {
    const [, y, m, d, h, min] = match;
    return `${y}-${m}-${d} ${h}:${min}`;
  }
  return raw;
}

const sentimentColors = {
  Bullish: "#48af00",
  "Somewhat-Bullish": "#86c21d",
  Neutral: "#64748b",
  "Somewhat-Bearish": "#e77812",
  Bearish: "#ff0e0e",
};

export default function EntitiesPage() {
  const [crossEntities, setCrossEntities] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [sortNewest, setSortNewest] = useState(true);
  const router = useRouter();

  const handleViewInMindmap = async (articleUrl) => {
    try {
      const res = await fetch(`${API}/article-mindmaps?url=${encodeURIComponent(articleUrl)}`);
      const mindmaps = await res.json();
      if (mindmaps.length === 0) {
        alert("This article doesn't appear in any saved mindmap yet. Create a mindmap covering this date range first.");
        return;
      }
      const best = mindmaps[0];
      router.push(`/mindmaps?id=${best.mindmap_id}&highlight=${encodeURIComponent(best.node_id)}`);
    } catch {
      alert("Failed to look up mindmap for this article.");
    }
  };

  useEffect(() => {
    fetch(`${API}/entities/cross-ticker?limit=40`)
      .then((r) => r.json())
      .then((data) => {
        setCrossEntities(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleEntityClick = async (entity) => {
    setSelectedEntity(entity);
    setArticlesLoading(true);
    try {
      const res = await fetch(`${API}/entities/${encodeURIComponent(entity.name)}/articles?limit=30`);
      const data = await res.json();
      setArticles(data.articles || []);
    } catch {
      setArticles([]);
    }
    setArticlesLoading(false);
  };

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: "#f1f5f9" }}>
          Cross-Ticker Entity Map
        </h2>
        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
          Entities that appear across multiple tickers — revealing hidden connections between stocks
        </p>
      </div>

      <div style={{ display: "flex", gap: "20px" }}>
        {/* Entity list */}
        <div
          style={{
            width: "420px",
            background: "rgba(15,23,42,0.5)",
            borderRadius: "12px",
            border: "1px solid rgba(148,163,184,0.1)",
            overflow: "hidden",
            backdropFilter: "blur(10px)",
            maxHeight: "calc(100vh - 160px)",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid rgba(148,163,184,0.1)",
              color: "#94a3b8",
              fontSize: "11px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Shared Entities ({crossEntities.length})
          </div>

          {loading ? (
            <div style={{ padding: "20px", color: "#64748b", textAlign: "center" }}>Loading...</div>
          ) : (
            crossEntities.map((entity, idx) => {
              const cfg = typeConfig[entity.type] || typeConfig.Other;
              const isSelected = selectedEntity?.name === entity.name;
              return (
                <div
                  key={idx}
                  onClick={() => handleEntityClick(entity)}
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid rgba(148,163,184,0.06)",
                    cursor: "pointer",
                    background: isSelected ? "rgba(59,130,246,0.1)" : "transparent",
                    transition: "background 0.15s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                        style={{
                          background: cfg.bg,
                          color: cfg.color,
                          border: `1px solid ${cfg.border}`,
                          padding: "1px 8px",
                          borderRadius: "4px",
                          fontSize: "10px",
                          fontWeight: 700,
                        }}
                      >
                        {entity.type}
                      </span>
                      <span style={{ color: "#e2e8f0", fontSize: "14px", fontWeight: 600 }}>
                        {entity.name}
                      </span>
                    </div>
                    <span style={{ color: "#64748b", fontSize: "12px" }}>
                      {entity.total_mentions} mentions
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                    {entity.tickers.map((ticker) => (
                      <span
                        key={ticker}
                        style={{
                          background: "rgba(139,92,246,0.12)",
                          color: "#c4b5fd",
                          padding: "1px 6px",
                          borderRadius: "3px",
                          fontSize: "10px",
                          fontWeight: 600,
                          border: "1px solid rgba(139,92,246,0.2)",
                        }}
                      >
                        {ticker}
                        <span style={{ marginLeft: "3px", color: "#8b5cf6" }}>
                          {entity.ticker_counts[ticker]}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Article detail panel */}
        <div
          style={{
            flex: 1,
            background: "rgba(15,23,42,0.5)",
            borderRadius: "12px",
            border: "1px solid rgba(148,163,184,0.1)",
            backdropFilter: "blur(10px)",
            maxHeight: "calc(100vh - 160px)",
            overflowY: "auto",
          }}
        >
          {!selectedEntity ? (
            <div
              style={{
                padding: "48px",
                textAlign: "center",
                color: "#64748b",
                fontSize: "14px",
              }}
            >
              Select an entity to see which articles mention it across tickers
            </div>
          ) : (
            <div>
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid rgba(148,163,184,0.1)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ color: "#e2e8f0", fontSize: "18px", fontWeight: 700 }}>
                    {selectedEntity.name}
                  </div>
                  <div style={{ color: "#64748b", fontSize: "12px", marginTop: "2px" }}>
                    {selectedEntity.type} &middot; {selectedEntity.total_mentions} mentions across{" "}
                    {selectedEntity.tickers.length} tickers
                  </div>
                </div>
                <div style={{ display: "flex", gap: "4px" }}>
                  {selectedEntity.tickers.map((t) => (
                    <span
                      key={t}
                      style={{
                        background: "rgba(59,130,246,0.15)",
                        color: "#93c5fd",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: 600,
                        border: "1px solid rgba(59,130,246,0.25)",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sort bar */}
              <div
                style={{
                  padding: "8px 20px",
                  borderBottom: "1px solid rgba(148,163,184,0.1)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ color: "#64748b", fontSize: "12px" }}>
                  {articles.length} articles
                </span>
                <button
                  onClick={() => setSortNewest((p) => !p)}
                  style={{
                    padding: "4px 12px",
                    borderRadius: "6px",
                    border: "1px solid rgba(148,163,184,0.2)",
                    background: "rgba(15,23,42,0.5)",
                    color: "#94a3b8",
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  Date {sortNewest ? "↓ Newest" : "↑ Oldest"}
                </button>
              </div>

              {articlesLoading ? (
                <div style={{ padding: "20px", color: "#64748b", textAlign: "center" }}>Loading articles...</div>
              ) : (
                <div>
                  {[...articles]
                    .sort((a, b) => {
                      const da = a.time_published || "";
                      const db = b.time_published || "";
                      return sortNewest ? db.localeCompare(da) : da.localeCompare(db);
                    })
                    .map((article, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "14px 20px",
                        borderBottom: "1px solid rgba(148,163,184,0.06)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                        <div style={{ flex: 1 }}>
                          <a
                            href={article.url || article._id}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#93c5fd", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}
                          >
                            {article.title}
                          </a>
                          <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "12px", lineHeight: 1.5 }}>
                            {(article.summary || "").substring(0, 150)}
                            {(article.summary || "").length > 150 ? "..." : ""}
                          </p>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", flexShrink: 0 }}>
                          <span
                            style={{
                              background: "rgba(139,92,246,0.15)",
                              color: "#c4b5fd",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontSize: "11px",
                              fontWeight: 600,
                            }}
                          >
                            {article.ticker}
                          </span>
                          <span
                            style={{
                              color: sentimentColors[article.overall_sentiment_label] || "#64748b",
                              fontSize: "11px",
                              fontWeight: 600,
                            }}
                          >
                            {article.overall_sentiment_label}
                          </span>
                        </div>
                      </div>
                      <div style={{ marginTop: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", gap: "8px", color: "#475569", fontSize: "11px" }}>
                          <span>{article.source}</span>
                          <span>&middot;</span>
                          <span>{formatDate(article.time_published)}</span>
                        </div>
                        <button
                          onClick={() => handleViewInMindmap(article.url || article._id)}
                          style={{
                            padding: "3px 10px",
                            borderRadius: "5px",
                            border: "1px solid rgba(59,130,246,0.3)",
                            background: "rgba(59,130,246,0.1)",
                            color: "#60a5fa",
                            fontSize: "10px",
                            fontWeight: 600,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                        >
                          View in Mindmap
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
