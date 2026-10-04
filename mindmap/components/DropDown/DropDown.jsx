"use client";

import React from "react";
import Select from "react-select";

const DropDown = ({ options, value, onChange, maxSelection = 2 }) => {
  const formattedOptions = options.map((opt) => ({ label: opt, value: opt }));

  const handleChange = (selectedOptions) => {
    if (selectedOptions.length > maxSelection) {
      alert(`You can select at most ${maxSelection} options.`);
      return;
    }
    onChange(selectedOptions.map((opt) => opt.value));
  };

  return (
    <Select
      options={formattedOptions}
      value={formattedOptions.filter((opt) => value.includes(opt.value))}
      onChange={handleChange}
      isMulti
      placeholder="Select topics..."
      menuPortalTarget={document.body}
      styles={{
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        control: (base) => ({
          ...base,
          backgroundColor: "rgba(15,23,42,0.9)",
          color: "#e2e8f0",
          border: "1px solid rgba(148,163,184,0.2)",
          borderRadius: "8px",
          minHeight: "38px",
          boxShadow: "none",
          "&:hover": { borderColor: "rgba(59,130,246,0.5)" },
        }),
        menu: (base) => ({
          ...base,
          backgroundColor: "#1e293b",
          border: "1px solid rgba(148,163,184,0.15)",
          borderRadius: "8px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
        }),
        option: (base, { isFocused }) => ({
          ...base,
          backgroundColor: isFocused ? "rgba(59,130,246,0.2)" : "transparent",
          color: "#e2e8f0",
          fontSize: "13px",
        }),
        multiValue: (base) => ({
          ...base,
          backgroundColor: "rgba(59,130,246,0.2)",
          borderRadius: "4px",
          border: "1px solid rgba(59,130,246,0.3)",
        }),
        multiValueLabel: (base) => ({
          ...base,
          color: "#93c5fd",
          fontSize: "12px",
        }),
        multiValueRemove: (base) => ({
          ...base,
          color: "#93c5fd",
          "&:hover": { backgroundColor: "rgba(239,68,68,0.3)", color: "#fff" },
        }),
        placeholder: (base) => ({ ...base, color: "#64748b", fontSize: "13px" }),
        input: (base) => ({ ...base, color: "#e2e8f0" }),
      }}
    />
  );
};

export default DropDown;
