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
      menuPortalTarget={document.body} // 👈 THIS IS MAGIC: forces dropdown OUTSIDE the table
      styles={{
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        control: (base) => ({
          ...base,
          backgroundColor: "rgba(33,79,149,0.95)",
          color: "white",
          border: "1px solid white",
        }),
        menu: (base) => ({
          ...base,
          backgroundColor: "rgba(33,79,149,1)",
          color: "white",
        }),
        option: (base, { isFocused }) => ({
          ...base,
          backgroundColor: isFocused ? "#2a63b8" : "rgba(33,79,149,1)",
          color: "white",
        }),
        multiValue: (base) => ({
          ...base,
          backgroundColor: "#2a63b8",
        }),
      }}
    />
  );
};

export default DropDown;
