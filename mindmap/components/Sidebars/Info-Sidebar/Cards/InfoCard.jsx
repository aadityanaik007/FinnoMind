const InfoCard = ({ label, value }) => (
  <div
    style={{
      background: "rgba(15,23,42,0.5)",
      padding: "12px 14px",
      borderRadius: "10px",
      border: "1px solid rgba(148,163,184,0.08)",
    }}
  >
    <strong style={{ color: "#64748b", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
      {label}
    </strong>
    <p style={{ margin: "4px 0 0", color: "#e2e8f0", fontSize: "13px", lineHeight: 1.5 }}>
      {value || "N/A"}
    </p>
  </div>
);

export default InfoCard;
