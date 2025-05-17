"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NavBar = () => {
  const pathname = usePathname();

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 32px",
        WebkitBackdropFilter: "blur(10px)",
        backdropFilter: "blur(10px)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <h2 style={{ margin: 0, fontWeight: "bold", color: "#ffffff" }}>
        🧠 Knowledge Graphs: Finance's Information Highway
      </h2>

      <div style={{ display: "flex", gap: "24px", fontSize: "1.1rem" }}>
        <Link
          href="/homepage"
          style={{
            color: pathname.startsWith("/homepage") ? "#4d91ff" : "white",
            textDecoration: "none",
            fontWeight: pathname.startsWith("/homepage") ? "bold" : "normal",
          }}
        >
          Home
        </Link>
        <Link
          href="/dashboard"
          style={{
            color: pathname.startsWith("/dashboard") ? "#4d91ff" : "white",
            textDecoration: "none",
            fontWeight: pathname.startsWith("/dashboard") ? "bold" : "normal",
          }}
        >
          User Dashboard
        </Link>
      </div>
    </nav>
  );
};

export default NavBar;
