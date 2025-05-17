"use client";

import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { createPortal } from "react-dom";

const FloatingCalendar = ({ position, value, onChange, onClose }) => {
  const selectionRange = {
    startDate: value?.startDate ? new Date(value.startDate) : new Date(),
    endDate: value?.endDate ? new Date(value.endDate) : new Date(),
    key: "selection",
  };

  const handleSelect = (ranges) => {
    onChange({
      startDate: ranges.selection.startDate.toISOString(),
      endDate: ranges.selection.endDate.toISOString(),
    });
    onClose();
  };

  return createPortal(
    <div
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        zIndex: 9999,
        backgroundColor: "rgba(33,79,149,0.95)",
        padding: "8px",
        borderRadius: "8px",
        border: "1px solid white",
        width: "280px", // <-- ✅ smaller width
        transform: "scale(0.85)", // <-- ✅ shrink calendar a little bit
        transformOrigin: "top left",
      }}
    >
      <DateRange
        ranges={[selectionRange]}
        onChange={handleSelect}
        editableDateInputs
        moveRangeOnFirstSelection={false}
        showMonthAndYearPickers={true}
        rangeColors={["#00ff88"]} // optional: prettier highlight color
      />
      <button
        onClick={onClose}
        style={{
          marginTop: "8px",
          width: "100%",
          backgroundColor: "red",
          color: "white",
          border: "none",
          padding: "8px",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Cancel
      </button>
    </div>,
    document.body
  );
};

export default FloatingCalendar;
