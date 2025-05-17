const InfoCard = ({ label, value }) => (
  <div
    style={{
      background: "#fff",
      padding: "12px 16px",
      borderRadius: "12px",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.06)",
    }}
  >
    <strong style={{ color: "#6C63FF" }}>{label}:</strong>
    <p style={{ margin: "4px 0 0", color: "#333", fontSize: "15px" }}>
      {value || "N/A"}
    </p>
  </div>
);

export default InfoCard;
