"use client";

import NavBar from "../../components/Navbar/Navbar";

export default function MindmapsLayout({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <NavBar />
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}
