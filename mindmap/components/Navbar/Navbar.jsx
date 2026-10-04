"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NavBar = () => {
  const pathname = usePathname();

  const linkStyle = (path) => ({
    color: pathname.startsWith(path) ? "#3b82f6" : "#94a3b8",
    textDecoration: "none",
    fontWeight: pathname.startsWith(path) ? 600 : 400,
    fontSize: "14px",
    padding: "6px 14px",
    borderRadius: "6px",
    background: pathname.startsWith(path) ? "rgba(59,130,246,0.1)" : "transparent",
    transition: "all 0.2s ease",
  });

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "14px 32px",
        background: "rgba(15,23,42,0.8)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(148,163,184,0.1)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <h2
        style={{
          margin: 0,
          fontWeight: 700,
          color: "#f1f5f9",
          fontSize: "16px",
          letterSpacing: "-0.3px",
        }}
      >
        Knowledge Graphs: Finance&apos;s Information Highway
      </h2>

      <div style={{ display: "flex", gap: "6px" }}>
        <Link href="/homepage" style={linkStyle("/homepage")}>
          Home
        </Link>
        <Link href="/dashboard" style={linkStyle("/dashboard")}>
          Dashboard
        </Link>
        <Link href="/entities" style={linkStyle("/entities")}>
          Entities
        </Link>
      </div>
    </nav>
  );
};

export default NavBar;
