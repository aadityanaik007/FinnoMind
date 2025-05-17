"use client";
import { useState, useEffect } from "react";
import FloatingCalendar from "../Date/FloatingCalendar";
import DataTable, { createTheme } from "react-data-table-component";
import { useRouter } from "next/navigation";
import DropDown from "../DropDown/DropDown";
import TickerDropDown from "../DropDown/TickerDropDown";
import { startPollingStatus, stopPollingStatus } from "../utils/statusPolling";
import {
  handleAddRow,
  handleSave,
  handleDelete,
} from "../utils/dashboardHandlers";
import { getButtonStyle } from "./buttonStyles";
import { TOPICS, TICKERS } from "../utils/constants";

const DashboardTable = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });
  const [openCalendarRowId, setOpenCalendarRowId] = useState(null);
  const [data, setData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newRowData, setNewRowData] = useState({
    topic: "",
    ticker: "",
    range: { startDate: "", endDate: "" },
  });

  useEffect(() => {
    const fetchMindmaps = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/mindmaps");
        const mindmaps = await res.json();

        if (Array.isArray(mindmaps)) {
          setData(mindmaps);

          // ✅ After setting data, poll unfinished rows
          mindmaps.forEach((row) => {
            if (row.status === "pending" || row.status === "processing") {
              startPollingStatus(row.id);
            }
          });
        } else {
          console.error("Mindmaps response is not an array!", mindmaps);
          setData([]);
        }
      } catch (error) {
        console.error("Failed to fetch mindmaps:", error);
        setData([]);
      }
    };

    fetchMindmaps();
  }, []);

  const columns = [
    {
      name: "Topic",
      selector: (row) => row.topic?.join(", "),
      cell: (row) =>
        row.id === editingId ? (
          <DropDown
            options={TOPICS}
            value={newRowData.topic}
            onChange={(selectedOptions) =>
              setNewRowData({ ...newRowData, topic: selectedOptions })
            }
          />
        ) : row.topic ? (
          row.topic.join(", ")
        ) : (
          ""
        ),
    },
    {
      name: "Ticker",
      selector: (row) => row.ticker,
      cell: (row) =>
        row.id === editingId ? (
          <TickerDropDown
            options={TICKERS}
            value={newRowData.ticker}
            onChange={(selectedOption) =>
              setNewRowData({ ...newRowData, ticker: selectedOption })
            }
          />
        ) : (
          row.ticker
        ),
    },
    {
      name: "Date Range",
      selector: (row) => row.range,
      cell: (row) => (
        <div style={{ position: "relative", minHeight: "40px" }}>
          {row.id === editingId ? (
            <>
              <button
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#214f95",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  width: "160px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  const rect = e.target.getBoundingClientRect();
                  setCalendarPosition({
                    top: rect.bottom + window.scrollY,
                    left: rect.left + window.scrollX,
                  });
                  setOpenCalendarRowId(row.id);
                }}
              >
                {row.range?.startDate && row.range?.endDate
                  ? `${new Date(
                      row.range.startDate
                    ).toLocaleDateString()} - ${new Date(
                      row.range.endDate
                    ).toLocaleDateString()}`
                  : "Select Date Range"}
              </button>

              {openCalendarRowId === row.id && (
                <FloatingCalendar
                  position={calendarPosition}
                  value={
                    typeof row.range === "object" && row.range !== null
                      ? row.range
                      : { startDate: "", endDate: "" }
                  }
                  onChange={(range) => {
                    setData((prev) =>
                      prev.map((r) =>
                        r.id === row.id ? { ...r, range: range } : r
                      )
                    );

                    if (row.id === editingId) {
                      setNewRowData((prev) => ({
                        ...prev,
                        range: range,
                      }));
                    }

                    setOpenCalendarRowId(null);
                  }}
                  onClose={() => setOpenCalendarRowId(null)}
                />
              )}
            </>
          ) : row.range && row.range.startdate && row.range.enddate ? ( // ✅ FIXED: small caps
            `${new Date(row.range.startdate).toLocaleDateString()} - ${new Date(
              row.range.enddate
            ).toLocaleDateString()}`
          ) : (
            ""
          )}
        </div>
      ),
    },
    {
      name: "Status",
      selector: (row) => row.status,
      cell: (row) => <span>{row.status}</span>,
    },
    {
      name: "Actions",
      cell: (row) =>
        row.id === editingId ? (
          <button
            onClick={() =>
              handleSave(
                row.id,
                newRowData,
                setData,
                setEditingId,
                setNewRowData
              )
            }
          >
            Save
          </button>
        ) : (
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              disabled={row.status !== "done"}
              style={getButtonStyle({
                type: "view",
                disabled: row.status !== "done",
              })}
              onClick={() => {
                if (row.status === "done") {
                  router.push(`/mindmaps?id=${row.id}`);
                }
              }}
            >
              View
            </button>

            <button
              style={getButtonStyle({ type: "delete" })}
              onClick={async () => {
                stopPollingStatus(row.id);
                const deleted = await handleDelete(row.id, setData);
                if (!deleted) {
                  startPollingStatus(row.id, setData);
                }
              }}
            >
              Delete
            </button>
          </div>
        ),
    },
  ];

  createTheme(
    "solarized",
    {
      text: {
        primary: "#ffffff",
        secondary: "#2aa198",
      },
      background: {
        default: "rgba(33, 79, 149, 0.5)",
      },
      context: {
        background: "#cb4b16",
        text: "#FFFFFF",
      },
      divider: {
        default: "#073642",
      },
      action: {
        button: "rgba(0,0,0,.54)",
        hover: "rgba(0,0,0,.08)",
        disabled: "rgba(0,0,0,.12)",
      },
      row: {
        background: "rgba(33, 79, 149, 0.5)",
        text: "#FFFFFF",
      },
      newRow: {
        background: "rgba(33, 79, 149, 0.5)",
        text: "#FFFFFF",
      },
    },
    "dark"
  );

  return (
    <div>
      <button
        onClick={() =>
          handleAddRow(data, editingId, setData, setEditingId, setNewRowData)
        }
        style={{
          marginBottom: "1rem",
          background:
            "linear-gradient(to right, rgba(33,79,149,0.7), rgba(85,150,255,0.6))",
          color: "#fff",
          border: "none",
          padding: "10px 20px",
          borderRadius: "10px",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          backdropFilter: "blur(4px)",
          transition: "background 0.3s ease",
        }}
        onMouseOver={(e) =>
          (e.currentTarget.style.background =
            "linear-gradient(to right, rgba(33,79,149,0.9), rgba(85,150,255,0.8))")
        }
        onMouseOut={(e) =>
          (e.currentTarget.style.background =
            "linear-gradient(to right, rgba(33,79,149,0.7), rgba(85,150,255,0.6))")
        }
      >
        + Add Mindmap
      </button>

      {loading && (
        <div
          style={{
            textAlign: "center",
            marginBottom: "1rem",
            color: "#00ff88",
          }}
        >
          Loading mindmaps...
        </div>
      )}

      <div style={{ overflow: "visible", position: "relative" }}>
        <DataTable
          title={
            <span style={{ fontWeight: "bold", fontSize: "18px" }}>
              Your Mindmaps
            </span>
          }
          columns={columns}
          data={data}
          pagination
          highlightOnHover
          striped
          theme="solarized"
        />
      </div>
    </div>
  );
};

export default DashboardTable;
