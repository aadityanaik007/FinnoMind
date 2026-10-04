"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getMindmap, unpublishMindmap } from "../../api/mindmapApi";
import MindMap from "./MindMap";

const sentimentColors = {
  Bullish: "#48af00",
  "Somewhat-Bullish": "#86c21d",
  Neutral: "#64748b",
  "Somewhat-Bearish": "#e77812",
  Bearish: "#ff0e0e",
};

function formatDate(raw) {
  if (!raw) return "";
  const match = raw.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})$/);
  if (match) {
    const [, y, m, d, h, min] = match;
    return `${y}-${m}-${d} ${h}:${min}`;
  }
  if (raw.includes(" ")) return raw;
  return raw;
}

const MindmapsPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  const [mindmapData, setMindmapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePanel, setActivePanel] = useState(null); // "entities" | "articles" | null
  const [entities, setEntities] = useState([]);
  const [articles, setArticles] = useState([]);
  const [panelLoading, setPanelLoading] = useState(false);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getMindmap(id);
      setMindmapData(data);
    } catch (error) {
      console.error("Failed to fetch mindmap", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handlePublished = async () => {
    await fetchData();
  };

  const handleUnpublish = async () => {
    if (!id) return;
    try {
      await unpublishMindmap(id);
      setActivePanel(null);
      setEntities([]);
      setArticles([]);
      await fetchData();
    } catch (err) {
      alert(`Unpublish failed: ${err.message}`);
    }
  };

  const handleShowEntities = async () => {
    if (activePanel === "entities") {
      setActivePanel(null);
      return;
    }
    setActivePanel("entities");
    setPanelLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/mindmap/${id}/entities`);
      const data = await res.json();
      setEntities(data.entities || []);
    } catch {
      setEntities([]);
    }
    setPanelLoading(false);
  };

  const handleShowArticles = async () => {
    if (activePanel === "articles") {
      setActivePanel(null);
      return;
    }
    setActivePanel("articles");
    setPanelLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/mindmap/${id}/articles`);
      const data = await res.json();
      setArticles(data.articles || []);
    } catch {
      setArticles([]);
    }
    setPanelLoading(false);
  };

  if (loading) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "calc(100vh - 57px)", color: "#64748b", fontSize: "15px",
      }}>
        Loading mindmap...
      </div>
    );
  }

  if (!mindmapData) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "calc(100vh - 57px)", color: "#64748b", fontSize: "15px",
      }}>
        Mindmap not found.
      </div>
    );
  }

  const isPublished = mindmapData.status === "Published";

  const typeConfig = {
    Person: { color: "#c084fc" },
    Company: { color: "#93c5fd" },
    Product: { color: "#6ee7b7" },
    Other: { color: "#94a3b8" },
  };

  return (
    <div style={{ height: "calc(100vh - 57px)", display: "flex", flexDirection: "column" }}>
      {/* Header bar */}
      <div style={{
        padding: "10px 20px",
        borderBottom: "1px solid rgba(148,163,184,0.1)",
        background: "rgba(15,23,42,0.6)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            onClick={() => router.push("/dashboard")}
            style={{
              padding: "6px 14px", borderRadius: "6px",
              border: "1px solid rgba(148,163,184,0.2)",
              background: "rgba(15,23,42,0.5)", color: "#94a3b8",
              fontSize: "12px", fontWeight: 600, cursor: "pointer",
            }}
          >
            ← Dashboard
          </button>
          <div>
            <span style={{ color: "#f1f5f9", fontSize: "16px", fontWeight: 700 }}>
              {mindmapData.name || "Untitled"}
            </span>
            {mindmapData.description && (
              <span style={{ color: "#64748b", fontSize: "13px", marginLeft: "12px" }}>
                {mindmapData.description}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {isPublished && (
            <>
              <button
                onClick={handleShowArticles}
                style={{
                  padding: "6px 16px", borderRadius: "6px", border: "none",
                  background: activePanel === "articles"
                    ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                    : "rgba(59,130,246,0.2)",
                  color: "#fff", fontSize: "12px", fontWeight: 600, cursor: "pointer",
                }}
              >
                Articles
              </button>
              <button
                onClick={handleShowEntities}
                style={{
                  padding: "6px 16px", borderRadius: "6px", border: "none",
                  background: activePanel === "entities"
                    ? "linear-gradient(135deg, #a855f7, #7c3aed)"
                    : "rgba(168,85,247,0.2)",
                  color: "#fff", fontSize: "12px", fontWeight: 600, cursor: "pointer",
                }}
              >
                Entities
              </button>
            </>
          )}
          <span style={{
            fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "12px",
            background: isPublished
              ? "rgba(16,185,129,0.15)" : mindmapData.status === "In-Progress"
              ? "rgba(245,158,11,0.15)" : "rgba(148,163,184,0.15)",
            color: isPublished
              ? "#10b981" : mindmapData.status === "In-Progress"
              ? "#f59e0b" : "#94a3b8",
          }}>
            {mindmapData.status}
          </span>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <div style={{ flex: 1 }}>
          <MindMap
            mindmapId={id}
            initialNodes={mindmapData.playground_nodes || []}
            initialEdges={(mindmapData.playground_edges || []).map((e) => ({
              ...e,
              type: "countEdge",
            }))}
            initialEdgeCounts={mindmapData.edge_counts || {}}
            initialValidation={mindmapData.validation || {}}
            initialStatus={mindmapData.status || "New"}
            readOnly={isPublished}
            onPublished={handlePublished}
            onUnpublished={handleUnpublish}
          />
        </div>

        {/* Side panel */}
        {activePanel && (
          <div style={{
            width: "400px",
            borderLeft: "1px solid rgba(148,163,184,0.1)",
            background: "rgba(15,23,42,0.5)",
            overflowY: "auto",
            flexShrink: 0,
          }}>
            {/* Entities panel */}
            {activePanel === "entities" && (
              <>
                <div style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid rgba(148,163,184,0.1)",
                  fontSize: "15px", fontWeight: 700, color: "#f1f5f9",
                }}>
                  Entities
                  <span style={{ fontSize: "12px", color: "#64748b", marginLeft: "8px" }}>
                    ({entities.length})
                  </span>
                </div>
                {panelLoading ? (
                  <div style={{ padding: "20px", color: "#64748b", textAlign: "center" }}>Loading...</div>
                ) : entities.length === 0 ? (
                  <div style={{ padding: "20px", color: "#64748b", textAlign: "center", fontSize: "13px" }}>
                    No entities found in retrieved articles.
                  </div>
                ) : (
                  entities.map((e, i) => {
                    const cfg = typeConfig[e.type] || typeConfig.Other;
                    return (
                      <div key={i} style={{
                        padding: "12px 20px",
                        borderBottom: "1px solid rgba(148,163,184,0.06)",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          {e.pinned && (
                            <span style={{
                              background: "rgba(245,158,11,0.2)", color: "#fbbf24",
                              padding: "1px 6px", borderRadius: "4px",
                              fontSize: "9px", fontWeight: 700,
                            }}>
                              PINNED
                            </span>
                          )}
                          <span style={{ color: "#e2e8f0", fontSize: "13px", fontWeight: 600 }}>
                            {e.name}
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ color: cfg.color, fontSize: "10px", fontWeight: 700 }}>
                            {e.type}
                          </span>
                          <span style={{ color: "#64748b", fontSize: "11px" }}>
                            {e.mention_count}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </>
            )}

            {/* Articles panel */}
            {activePanel === "articles" && (
              <>
                <div style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid rgba(148,163,184,0.1)",
                  fontSize: "15px", fontWeight: 700, color: "#f1f5f9",
                }}>
                  Retrieved Articles
                  <span style={{ fontSize: "12px", color: "#64748b", marginLeft: "8px" }}>
                    ({articles.length})
                  </span>
                </div>
                {panelLoading ? (
                  <div style={{ padding: "20px", color: "#64748b", textAlign: "center" }}>Loading...</div>
                ) : articles.length === 0 ? (
                  <div style={{ padding: "20px", color: "#64748b", textAlign: "center", fontSize: "13px" }}>
                    No articles retrieved.
                  </div>
                ) : (
                  articles.map((article, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "14px 20px",
                        borderBottom: "1px solid rgba(148,163,184,0.06)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                        <div style={{ flex: 1 }}>
                          <a
                            href={article.url || article._id}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#93c5fd", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}
                          >
                            {article.title || "Untitled"}
                          </a>
                          {article.summary && (
                            <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "12px", lineHeight: 1.5 }}>
                              {article.summary.substring(0, 120)}
                              {article.summary.length > 120 ? "..." : ""}
                            </p>
                          )}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", flexShrink: 0 }}>
                          {article.ticker && (
                            <span style={{
                              background: "rgba(139,92,246,0.15)", color: "#c4b5fd",
                              padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: 600,
                            }}>
                              {article.ticker}
                            </span>
                          )}
                          {article.overall_sentiment_label && (
                            <span style={{
                              color: sentimentColors[article.overall_sentiment_label] || "#64748b",
                              fontSize: "10px", fontWeight: 600,
                            }}>
                              {article.overall_sentiment_label}
                            </span>
                          )}
                          {article.category && (
                            <span style={{
                              background: article.category === "related"
                                ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
                              color: article.category === "related" ? "#34d399" : "#fbbf24",
                              padding: "1px 6px", borderRadius: "3px", fontSize: "9px", fontWeight: 700,
                            }}>
                              {article.category === "related" ? "RELATED" : "UNRELATED"}
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ marginTop: "6px", display: "flex", gap: "8px", color: "#475569", fontSize: "11px" }}>
                        {article.source && <span>{article.source}</span>}
                        {article.time_published && (
                          <>
                            <span>&middot;</span>
                            <span>{formatDate(article.time_published)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MindmapsPage;
