"use client";

import { useRouter } from "next/navigation";

const Homepage = () => {
  const router = useRouter();

  return (
    <div
      style={{
        minHeight: "80vh",
        backgroundImage: `url('/bg_img.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          backdropFilter: "blur(10px)",
          borderRadius: "20px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          textAlign: "center",
          maxWidth: "800px",
          width: "100%",
          padding: "2rem",
        }}
      >
        <h1
          style={{ fontSize: "2.5rem", marginBottom: "1rem", color: "#ffffff" }}
        >
          Financial Mindmap Generator
        </h1>
        <p
          style={{
            fontSize: "1rem",
            marginBottom: "3rem",
            color: "#cccccc",
            maxWidth: "500px",
            margin: "0 auto",
          }}
        >
          Generate interactive mindmaps from financial data and news to
          visualize market trends and insights
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          style={{
            marginTop: "1rem",
            padding: "15px 30px",
            fontSize: "1.2rem",
            backgroundColor: "#1f6fac",
            color: "#1a1a1a",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "all 0.3s ease",
            fontWeight: "bold",
          }}
        >
          Generate Mindmap
        </button>
      </div>
    </div>
  );
};

export default Homepage;
