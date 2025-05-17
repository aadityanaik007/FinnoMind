import React, { useState, useEffect, useRef } from "react";

const SmallInfoCard = ({ label, value, color }) => {
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
        background: color || "rgba(152, 198, 227, 0.2)", // light sky blue with transparency
        padding: "8px",
        borderRadius: "12px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.06)",
        cursor: "pointer",
      }}
      onClick={() => setShowTooltip((prev) => !prev)}
    >
      <p style={{ margin: "4px 0 0", color: "#fff", fontSize: "15px" }}>
        {value || "N/A"}
      </p>

      {showTooltip && (
        <div
          style={{
            position: "absolute",
            top: "-32px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#333",
            color: "#fff",
            padding: "4px 8px",
            borderRadius: "6px",
            fontSize: "12px",
            whiteSpace: "nowrap",
            zIndex: 10,
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};

export default SmallInfoCard;
