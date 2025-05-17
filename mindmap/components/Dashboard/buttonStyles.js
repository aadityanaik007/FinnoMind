// utils/buttonStyles.js

export const getButtonStyle = ({ type, disabled }) => {
  const base = {
    padding: "6px 12px",
    borderRadius: "6px",
    border: "none",
    color: "#fff",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    transition: "background 0.3s ease",
  };

  switch (type) {
    case "view":
      return {
        ...base,
        background: disabled
          ? "rgba(200,200,200,0.3)"
          : "linear-gradient(to right, rgba(0, 255, 100, 0.4), rgba(50, 255, 150, 0.6))",
      };

    case "delete":
      return {
        ...base,
        background:
          "linear-gradient(to right, rgba(255, 80, 80, 0.4), rgba(255, 0, 0, 0.6))",
      };

    default:
      return base;
  }
};
