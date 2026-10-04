"use client";

import { useRouter } from "next/navigation";

const TICKERS = ["AAPL", "AMZN", "GOOG", "META", "MSFT", "NVDA", "TSLA"];

const features = [
  {
    title: "Sentiment Mindmaps",
    desc: "Radial knowledge graphs color-coded by bullish/bearish sentiment across news sources.",
    icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  },
  {
    title: "OHLC Correlation",
    desc: "Every article linked to real stock price data — daily, weekly, and monthly averages.",
    icon: "M3 3v18h18M7 16l4-4 4 4 5-5",
  },
  {
    title: "Entity Extraction",
    desc: "AI-powered NER identifies people, companies, and products mentioned in every article.",
    icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  },
  {
    title: "Cross-Ticker Links",
    desc: "Discover hidden connections — entities shared across tickers reveal market-wide narratives.",
    icon: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 17a3 3 0 100-6 3 3 0 000 6z",
  },
];

const Homepage = () => {
  const router = useRouter();

  return (
    <div style={{ minHeight: "calc(100vh - 57px)", overflow: "hidden" }}>
      {/* Hero */}
      <div
        style={{
          position: "relative",
          padding: "80px 40px 60px",
          textAlign: "center",
          background: "radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.12) 0%, transparent 70%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "inline-block",
              padding: "6px 16px",
              borderRadius: "20px",
              background: "rgba(59,130,246,0.1)",
              border: "1px solid rgba(59,130,246,0.2)",
              color: "#60a5fa",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.5px",
              marginBottom: "20px",
            }}
          >
            7 TICKERS &middot; 1,300+ ARTICLES &middot; 850+ ENTITIES
          </div>

          <h1
            style={{
              fontSize: "3.2rem",
              fontWeight: 800,
              color: "#f1f5f9",
              lineHeight: 1.1,
              letterSpacing: "-1px",
              margin: "0 auto 16px",
              maxWidth: "700px",
            }}
          >
            Turn Financial News
            <br />
            Into{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Knowledge Graphs
            </span>
          </h1>

          <p
            style={{
              fontSize: "17px",
              color: "#94a3b8",
              maxWidth: "520px",
              margin: "0 auto 32px",
              lineHeight: 1.7,
            }}
          >
            Visualize sentiment, correlate news with price movements, and
            discover cross-ticker connections through AI-powered entity extraction.
          </p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button
              onClick={() => router.push("/dashboard")}
              style={{
                padding: "14px 32px",
                fontSize: "15px",
                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: 700,
                boxShadow: "0 4px 20px rgba(59,130,246,0.3)",
                transition: "all 0.2s ease",
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
              onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              Create Mindmap
            </button>
            <button
              onClick={() => router.push("/entities")}
              style={{
                padding: "14px 32px",
                fontSize: "15px",
                background: "transparent",
                color: "#94a3b8",
                border: "1px solid rgba(148,163,184,0.2)",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: 600,
                transition: "all 0.2s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = "rgba(59,130,246,0.4)";
                e.currentTarget.style.color = "#e2e8f0";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = "rgba(148,163,184,0.2)";
                e.currentTarget.style.color = "#94a3b8";
              }}
            >
              Explore Entities
            </button>
          </div>
        </div>
      </div>

      {/* Ticker strip */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "12px",
          padding: "0 40px 48px",
        }}
      >
        {TICKERS.map((t) => (
          <div
            key={t}
            style={{
              padding: "8px 20px",
              borderRadius: "8px",
              background: "rgba(15,23,42,0.6)",
              border: "1px solid rgba(148,163,184,0.08)",
              color: "#c4b5fd",
              fontSize: "14px",
              fontWeight: 700,
              letterSpacing: "1px",
            }}
          >
            {t}
          </div>
        ))}
      </div>

      {/* Features grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
          padding: "0 40px 60px",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {features.map((f, i) => (
          <div
            key={i}
            style={{
              background: "rgba(15,23,42,0.5)",
              border: "1px solid rgba(148,163,184,0.08)",
              borderRadius: "14px",
              padding: "24px 20px",
              transition: "border-color 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.borderColor = "rgba(59,130,246,0.25)")}
            onMouseOut={(e) => (e.currentTarget.style.borderColor = "rgba(148,163,184,0.08)")}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginBottom: "14px" }}
            >
              <path d={f.icon} />
            </svg>
            <h3
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "#e2e8f0",
                margin: "0 0 8px",
              }}
            >
              {f.title}
            </h3>
            <p
              style={{
                fontSize: "13px",
                color: "#64748b",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {f.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div
        style={{
          textAlign: "center",
          padding: "40px 40px 60px",
          borderTop: "1px solid rgba(148,163,184,0.06)",
        }}
      >
        <p style={{ color: "#475569", fontSize: "13px", margin: 0 }}>
          Built with Next.js, FastAPI, ReactFlow, MongoDB, and Groq AI
        </p>
      </div>
    </div>
  );
};

export default Homepage;
