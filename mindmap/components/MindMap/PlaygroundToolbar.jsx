"use client";
import { useState } from "react";
import { TOPICS, TICKERS } from "../../constants/UserDashboard";

const nodeButtonStyle = (bg, border, disabled) => ({
  padding: "8px 16px",
  borderRadius: "8px",
  border: `1px solid ${border}`,
  background: disabled ? "rgba(100,100,100,0.2)" : bg,
  color: disabled ? "#475569" : "#e2e8f0",
  fontSize: "12px",
  fontWeight: 600,
  cursor: disabled ? "not-allowed" : "pointer",
  opacity: disabled ? 0.5 : 1,
  transition: "all 0.15s",
});

const PlaygroundToolbar = ({
  nodes,
  onAddTicker,
  onAddTopic,
  onAddEntity,
  onAddRetrieve,
  onPublish,
  validation,
  status,
}) => {
  const [showTickerForm, setShowTickerForm] = useState(false);
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [showEntityForm, setShowEntityForm] = useState(false);
  const [tickerSymbol, setTickerSymbol] = useState("");
  const [tickerStart, setTickerStart] = useState("");
  const [tickerEnd, setTickerEnd] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [entityName, setEntityName] = useState("");
  const [entitySearchResults, setEntitySearchResults] = useState([]);
  const [entitySearching, setEntitySearching] = useState(false);

  const tickerCount = nodes.filter((n) => n.type === "ticker").length;
  const topicCount = nodes.filter((n) => n.type === "topic").length;
  const entityCount = nodes.filter((n) => n.type === "entity").length;
  const hasRetrieve = nodes.some((n) => n.type === "retrieve");

  const searchEntities = async (q) => {
    if (!q || q.length < 2) {
      setEntitySearchResults([]);
      return;
    }
    setEntitySearching(true);
    try {
      const res = await fetch(`http://localhost:8000/api/entities/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setEntitySearchResults(data.slice(0, 8));
    } catch {
      setEntitySearchResults([]);
    }
    setEntitySearching(false);
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 12,
        left: 12,
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <div
        style={{
          background: "rgba(15,23,42,0.9)",
          border: "1px solid rgba(148,163,184,0.15)",
          borderRadius: "12px",
          padding: "12px 16px",
          backdropFilter: "blur(12px)",
          display: "flex",
          gap: "8px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {/* Ticker button */}
        <button
          disabled={tickerCount >= 3}
          onClick={() => { setShowTickerForm(!showTickerForm); setShowTopicForm(false); setShowEntityForm(false); }}
          style={nodeButtonStyle("rgba(139,92,246,0.2)", "rgba(139,92,246,0.4)", tickerCount >= 3)}
        >
          + Ticker ({tickerCount}/3)
        </button>

        {/* Topic button */}
        <button
          disabled={topicCount >= 2}
          onClick={() => { setShowTopicForm(!showTopicForm); setShowTickerForm(false); setShowEntityForm(false); }}
          style={nodeButtonStyle("rgba(56,189,248,0.2)", "rgba(56,189,248,0.4)", topicCount >= 2)}
        >
          + Topic ({topicCount}/2)
        </button>

        {/* Entity button */}
        <button
          disabled={entityCount >= 2}
          onClick={() => { setShowEntityForm(!showEntityForm); setShowTickerForm(false); setShowTopicForm(false); }}
          style={nodeButtonStyle("rgba(192,132,252,0.2)", "rgba(192,132,252,0.4)", entityCount >= 2)}
        >
          + Entity ({entityCount}/2)
        </button>

        {/* Retrieve button */}
        <button
          disabled={hasRetrieve}
          onClick={() => { onAddRetrieve(); setShowTickerForm(false); setShowTopicForm(false); setShowEntityForm(false); }}
          style={nodeButtonStyle("rgba(52,211,153,0.2)", "rgba(52,211,153,0.4)", hasRetrieve)}
        >
          + Retrieve {hasRetrieve ? "✓" : ""}
        </button>

        <div style={{ width: 1, height: 28, background: "rgba(148,163,184,0.2)", margin: "0 4px" }} />

        {/* Publish button */}
        <button
          disabled={!validation?.publishable}
          onClick={onPublish}
          style={{
            padding: "8px 20px",
            borderRadius: "8px",
            border: "none",
            background: validation?.publishable
              ? "linear-gradient(135deg, #10b981, #059669)"
              : "rgba(100,100,100,0.3)",
            color: "#fff",
            fontSize: "12px",
            fontWeight: 700,
            cursor: validation?.publishable ? "pointer" : "not-allowed",
            opacity: validation?.publishable ? 1 : 0.5,
          }}
        >
          {status === "Published" ? "Re-Publish" : "Publish"}
        </button>

        {status === "Published" && (
          <span style={{ fontSize: "11px", color: "#10b981", fontWeight: 600 }}>Published</span>
        )}
      </div>

      {/* Ticker form */}
      {showTickerForm && (
        <div style={{
          background: "rgba(15,23,42,0.95)", border: "1px solid rgba(139,92,246,0.3)",
          borderRadius: "10px", padding: "14px", backdropFilter: "blur(12px)", width: "280px",
        }}>
          <div style={{ fontSize: "12px", color: "#a78bfa", fontWeight: 600, marginBottom: "10px" }}>Add Ticker Node</div>
          <select
            value={tickerSymbol}
            onChange={(e) => setTickerSymbol(e.target.value)}
            style={{
              width: "100%", padding: "8px", borderRadius: "6px", marginBottom: "8px",
              background: "rgba(30,41,59,0.8)", border: "1px solid rgba(148,163,184,0.3)",
              color: "#e2e8f0", fontSize: "13px",
            }}
          >
            <option value="">Select ticker...</option>
            {TICKERS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
            <input
              type="date" value={tickerStart}
              onChange={(e) => setTickerStart(e.target.value)}
              style={{
                flex: 1, padding: "8px", borderRadius: "6px",
                background: "rgba(30,41,59,0.8)", border: "1px solid rgba(148,163,184,0.3)",
                color: "#e2e8f0", fontSize: "12px",
              }}
            />
            <input
              type="date" value={tickerEnd}
              onChange={(e) => setTickerEnd(e.target.value)}
              style={{
                flex: 1, padding: "8px", borderRadius: "6px",
                background: "rgba(30,41,59,0.8)", border: "1px solid rgba(148,163,184,0.3)",
                color: "#e2e8f0", fontSize: "12px",
              }}
            />
          </div>
          <button
            disabled={!tickerSymbol || !tickerStart || !tickerEnd}
            onClick={() => {
              onAddTicker(tickerSymbol, { start: tickerStart, end: tickerEnd });
              setTickerSymbol(""); setTickerStart(""); setTickerEnd("");
              setShowTickerForm(false);
            }}
            style={{
              width: "100%", padding: "8px", borderRadius: "6px", border: "none",
              background: tickerSymbol && tickerStart && tickerEnd
                ? "linear-gradient(135deg, #8b5cf6, #6d28d9)" : "rgba(100,100,100,0.3)",
              color: "#fff", fontWeight: 600, fontSize: "13px",
              cursor: tickerSymbol && tickerStart && tickerEnd ? "pointer" : "not-allowed",
            }}
          >
            Add Ticker
          </button>
        </div>
      )}

      {/* Topic form */}
      {showTopicForm && (
        <div style={{
          background: "rgba(15,23,42,0.95)", border: "1px solid rgba(56,189,248,0.3)",
          borderRadius: "10px", padding: "14px", backdropFilter: "blur(12px)", width: "240px",
        }}>
          <div style={{ fontSize: "12px", color: "#38bdf8", fontWeight: 600, marginBottom: "10px" }}>Add Topic Node</div>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            style={{
              width: "100%", padding: "8px", borderRadius: "6px", marginBottom: "10px",
              background: "rgba(30,41,59,0.8)", border: "1px solid rgba(148,163,184,0.3)",
              color: "#e2e8f0", fontSize: "13px",
            }}
          >
            <option value="">Select topic...</option>
            {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <button
            disabled={!selectedTopic}
            onClick={() => {
              onAddTopic(selectedTopic);
              setSelectedTopic("");
              setShowTopicForm(false);
            }}
            style={{
              width: "100%", padding: "8px", borderRadius: "6px", border: "none",
              background: selectedTopic
                ? "linear-gradient(135deg, #0ea5e9, #0284c7)" : "rgba(100,100,100,0.3)",
              color: "#fff", fontWeight: 600, fontSize: "13px",
              cursor: selectedTopic ? "pointer" : "not-allowed",
            }}
          >
            Add Topic
          </button>
        </div>
      )}

      {/* Entity form */}
      {showEntityForm && (
        <div style={{
          background: "rgba(15,23,42,0.95)", border: "1px solid rgba(192,132,252,0.3)",
          borderRadius: "10px", padding: "14px", backdropFilter: "blur(12px)", width: "280px",
        }}>
          <div style={{ fontSize: "12px", color: "#c084fc", fontWeight: 600, marginBottom: "10px" }}>Add Entity Node</div>
          <input
            type="text" value={entityName} placeholder="Search entities..."
            onChange={(e) => { setEntityName(e.target.value); searchEntities(e.target.value); }}
            style={{
              width: "100%", padding: "8px", borderRadius: "6px", marginBottom: "4px",
              background: "rgba(30,41,59,0.8)", border: "1px solid rgba(148,163,184,0.3)",
              color: "#e2e8f0", fontSize: "13px", boxSizing: "border-box",
            }}
          />
          {entitySearchResults.length > 0 && (
            <div style={{ maxHeight: "160px", overflowY: "auto", marginBottom: "8px" }}>
              {entitySearchResults.map((e, i) => (
                <div
                  key={i}
                  onClick={() => {
                    onAddEntity(e.canonical_name, e.type);
                    setEntityName(""); setEntitySearchResults([]);
                    setShowEntityForm(false);
                  }}
                  style={{
                    padding: "6px 8px", cursor: "pointer", fontSize: "12px", color: "#e2e8f0",
                    borderBottom: "1px solid rgba(148,163,184,0.1)",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}
                >
                  <span>{e.canonical_name}</span>
                  <span style={{ color: "#64748b", fontSize: "10px" }}>{e.type}</span>
                </div>
              ))}
            </div>
          )}
          <button
            disabled={!entityName.trim()}
            onClick={() => {
              onAddEntity(entityName.trim(), "Other");
              setEntityName(""); setEntitySearchResults([]);
              setShowEntityForm(false);
            }}
            style={{
              width: "100%", padding: "8px", borderRadius: "6px", border: "none",
              background: entityName.trim()
                ? "linear-gradient(135deg, #a855f7, #7c3aed)" : "rgba(100,100,100,0.3)",
              color: "#fff", fontWeight: 600, fontSize: "13px",
              cursor: entityName.trim() ? "pointer" : "not-allowed",
            }}
          >
            Add Entity
          </button>
        </div>
      )}

      {/* Validation errors */}
      {validation?.errors?.length > 0 && (
        <div style={{
          background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
          borderRadius: "8px", padding: "10px 14px", maxWidth: "300px",
        }}>
          {validation.errors.map((err, i) => (
            <div key={i} style={{ fontSize: "11px", color: "#f87171", marginBottom: i < validation.errors.length - 1 ? "4px" : 0 }}>
              {err}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlaygroundToolbar;
