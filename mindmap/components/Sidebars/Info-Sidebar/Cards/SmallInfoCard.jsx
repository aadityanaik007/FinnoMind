import React, { useState, useEffect, useRef } from "react";

const SmallInfoCard = ({ label, value, color, textColor }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setShowTooltip(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={cardRef}
      style={{
        position: "relative",
        background: color || "rgba(59,130,246,0.15)",
        padding: "8px 12px",
        borderRadius: "8px",
        border: "1px solid rgba(148,163,184,0.1)",
        cursor: "pointer",
        flex: 1,
        textAlign: "center",
      }}
      onClick={() => setShowTooltip((prev) => !prev)}
    >
      <p style={{ margin: 0, color: textColor || "#e2e8f0", fontSize: "13px", fontWeight: 600 }}>
        {value || "N/A"}
      </p>

      {showTooltip && (
        <div
          style={{
            position: "absolute",
            top: "-32px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#1e293b",
            color: "#e2e8f0",
            padding: "4px 10px",
            borderRadius: "6px",
            fontSize: "11px",
            whiteSpace: "nowrap",
            zIndex: 10,
            border: "1px solid rgba(148,163,184,0.2)",
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};

export default SmallInfoCard;
