"use client";

import React from "react";
import NavBar from "../../components/Navbar/Navbar";

export default function DashboardLayout({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <NavBar />
      <main style={{ flex: 1, padding: "2rem 2.5rem" }}>{children}</main>
    </div>
  );
}
