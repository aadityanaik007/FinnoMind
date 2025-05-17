"use client";

import React from "react";
import NavBar from "../../components/Navbar/Navbar";
export default function DashboardLayout({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `url('/bg_img.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <NavBar />
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}
