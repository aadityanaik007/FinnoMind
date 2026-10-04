"use client";

import { useState } from "react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { createPortal } from "react-dom";

const FloatingCalendar = ({
  position,
  value,
  onChange,
  onClose,
  articleCounts,
}) => {
  const [range, setRange] = useState([
    {
      startDate: value?.startDate ? new Date(value.startDate) : new Date(),
      endDate: value?.endDate ? new Date(value.endDate) : new Date(),
      key: "selection",
    },
  ]);

  const handleConfirm = () => {
    onChange({
      startDate: range[0].startDate.toISOString(),
      endDate: range[0].endDate.toISOString(),
    });
    onClose();
  };

  const formatDateKey = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const customDayContent = (day) => {
    const key = formatDateKey(day);
    const count = articleCounts?.[key];
    return (
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <span>{day.getDate()}</span>
        {count > 0 && (
          <span
            style={{
              position: "absolute",
              bottom: "-2px",
              right: "-2px",
              background: "#10b981",
              color: "#fff",
              fontSize: "9px",
              fontWeight: 700,
              borderRadius: "50%",
              width: "16px",
              height: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
            }}
          >
            {count > 99 ? "99" : count}
          </span>
        )}
      </div>
    );
  };

  const start = range[0].startDate;
  const end = range[0].endDate;
  const sameDay = start.toDateString() === end.toDateString();
  let selectedTotal = 0;
  if (!sameDay && articleCounts) {
    Object.entries(articleCounts).forEach(([dateStr, count]) => {
      const d = new Date(dateStr);
      if (d >= start && d <= end) selectedTotal += count;
    });
  }

  return createPortal(
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        zIndex: 9999,
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        padding: "16px",
        borderRadius: "12px",
        border: "1px solid rgba(148, 163, 184, 0.2)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        width: "340px",
        transform: "scale(0.88)",
        transformOrigin: "top left",
      }}
    >
      <DateRange
        ranges={range}
        onChange={(item) => setRange([item.selection])}
        editableDateInputs
        moveRangeOnFirstSelection={false}
        showMonthAndYearPickers
        rangeColors={["#3b82f6"]}
        dayContentRenderer={customDayContent}
        color="#3b82f6"
      />

      {!sameDay && (
        <div
          style={{
            textAlign: "center",
            padding: "8px 0 4px",
            color: selectedTotal > 0 ? "#10b981" : "#f87171",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          {selectedTotal > 0
            ? `${selectedTotal} articles available in selected range`
            : "No articles found in selected range"}
        </div>
      )}

      <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
        <button
          onClick={handleConfirm}
          disabled={sameDay}
          style={{
            flex: 1,
            padding: "10px",
            background: sameDay
              ? "rgba(100,100,100,0.3)"
              : "linear-gradient(135deg, #3b82f6, #2563eb)",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: sameDay ? "not-allowed" : "pointer",
            fontWeight: 600,
            fontSize: "13px",
          }}
        >
          Confirm
        </button>
        <button
          onClick={onClose}
          style={{
            flex: 1,
            padding: "10px",
            background: "rgba(239, 68, 68, 0.15)",
            color: "#f87171",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "13px",
          }}
        >
          Cancel
        </button>
      </div>
    </div>,
    document.body
  );
};

export default FloatingCalendar;
