"use client";
import { useState, useEffect } from "react";
import DataTable, { createTheme } from "react-data-table-component";
import { useRouter } from "next/navigation";

import {
  handleAddRow,
  handleEdit,
  handleSave,
  handleCancelEdit,
  handleDelete,
} from "../utils/dashboardHandlers";

const statusConfig = {
  New: { label: "New", bg: "rgba(148,163,184,0.15)", color: "#94a3b8", border: "rgba(148,163,184,0.3)" },
  "In-Progress": { label: "In-Progress", bg: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "rgba(245,158,11,0.3)" },
  Published: { label: "Published", bg: "rgba(16,185,129,0.15)", color: "#10b981", border: "rgba(16,185,129,0.3)" },
};

const DashboardTable = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editMode, setEditMode] = useState(null); // "create" | "edit"
  const [newRowData, setNewRowData] = useState({ name: "", description: "" });

  useEffect(() => {
    const fetchMindmaps = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/mindmaps");
        const mindmaps = await res.json();
        setData(Array.isArray(mindmaps) ? mindmaps : []);
      } catch (error) {
        console.error("Failed to fetch mindmaps:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMindmaps();
  }, []);

  const isFormComplete = newRowData.name.trim().length > 0;

  const columns = [
    {
      name: "Name",
      selector: (row) => row.name,
      cell: (row) =>
        row.id === editingId ? (
          <input
            type="text"
            placeholder="Mindmap name..."
            value={newRowData.name}
            onChange={(e) =>
              setNewRowData((prev) => ({ ...prev, name: e.target.value }))
            }
            style={{
              background: "rgba(30,41,59,0.8)",
              border: "1px solid rgba(59,130,246,0.4)",
              borderRadius: "6px",
              padding: "8px 12px",
              color: "#e2e8f0",
              fontSize: "13px",
              width: "100%",
              outline: "none",
            }}
            autoFocus
          />
        ) : (
          <span style={{ color: "#f1f5f9", fontWeight: 600, fontSize: "14px" }}>
            {row.name || "Untitled"}
          </span>
        ),
      grow: 1.5,
    },
    {
      name: "Description",
      selector: (row) => row.description,
      cell: (row) =>
        row.id === editingId ? (
          <input
            type="text"
            placeholder="Description (optional)..."
            value={newRowData.description}
            onChange={(e) =>
              setNewRowData((prev) => ({ ...prev, description: e.target.value }))
            }
            style={{
              background: "rgba(30,41,59,0.8)",
              border: "1px solid rgba(148,163,184,0.3)",
              borderRadius: "6px",
              padding: "8px 12px",
              color: "#e2e8f0",
              fontSize: "13px",
              width: "100%",
              outline: "none",
            }}
          />
        ) : (
          <span style={{ color: "#94a3b8", fontSize: "13px" }}>
            {row.description || "—"}
          </span>
        ),
      grow: 2,
    },
    {
      name: "Status",
      selector: (row) => row.status,
      cell: (row) => {
        if (row.id === editingId) return null;
        const cfg = statusConfig[row.status] || statusConfig.New;
        return (
          <span
            style={{
              background: cfg.bg,
              color: cfg.color,
              border: `1px solid ${cfg.border}`,
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            {cfg.label}
          </span>
        );
      },
      width: "130px",
    },
    {
      name: "Nodes",
      selector: (row) => row.node_count,
      cell: (row) =>
        row.id === editingId ? null : (
          <span style={{ color: "#e2e8f0", fontWeight: 600, fontSize: "13px" }}>
            {row.node_count ?? 0}
          </span>
        ),
      width: "80px",
    },
    {
      name: "Articles",
      selector: (row) => row.article_count,
      cell: (row) =>
        row.id === editingId ? null : (
          <span style={{ color: "#e2e8f0", fontWeight: 600, fontSize: "13px" }}>
            {row.article_count ?? 0}
          </span>
        ),
      width: "90px",
    },
    {
      name: "Actions",
      cell: (row) =>
        row.id === editingId ? (
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              disabled={!isFormComplete}
              onClick={() =>
                handleSave(row.id, newRowData, setData, setEditingId, setNewRowData, editMode)
              }
              style={{
                padding: "8px 20px",
                background: isFormComplete
                  ? "linear-gradient(135deg, #10b981, #059669)"
                  : "rgba(100,100,100,0.3)",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: isFormComplete ? "pointer" : "not-allowed",
                opacity: isFormComplete ? 1 : 0.5,
                fontWeight: 600,
                fontSize: "13px",
              }}
            >
              {editMode === "edit" ? "Save" : "Create"}
            </button>
            <button
              onClick={() =>
                handleCancelEdit(editingId, editMode, setData, setEditingId, setNewRowData)
              }
              style={{
                padding: "8px 16px",
                background: "rgba(239,68,68,0.1)",
                color: "#f87171",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "13px",
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              style={{
                padding: "7px 16px",
                borderRadius: "8px",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                fontWeight: 600,
                fontSize: "12px",
              }}
              onClick={() => router.push(`/mindmaps?id=${row.id}`)}
            >
              View
            </button>
            <button
              style={{
                padding: "7px 16px",
                borderRadius: "8px",
                border: "1px solid rgba(148,163,184,0.3)",
                color: "#94a3b8",
                cursor: "pointer",
                background: "rgba(148,163,184,0.1)",
                fontWeight: 600,
                fontSize: "12px",
              }}
              onClick={() =>
                handleEdit(row, editingId, setEditingId, setNewRowData, setEditMode)
              }
            >
              Edit
            </button>
            <button
              style={{
                padding: "7px 16px",
                borderRadius: "8px",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#f87171",
                cursor: "pointer",
                background: "rgba(239,68,68,0.1)",
                fontWeight: 600,
                fontSize: "12px",
              }}
              onClick={() => handleDelete(row.id, setData)}
            >
              Delete
            </button>
          </div>
        ),
    },
  ];

  createTheme(
    "dark-modern",
    {
      text: { primary: "#e2e8f0", secondary: "#94a3b8" },
      background: { default: "transparent" },
      context: { background: "#1e40af", text: "#fff" },
      divider: { default: "rgba(148,163,184,0.1)" },
      action: {
        button: "rgba(255,255,255,.54)",
        hover: "rgba(255,255,255,.08)",
        disabled: "rgba(255,255,255,.12)",
      },
    },
    "dark"
  );

  const customStyles = {
    table: { style: { backgroundColor: "transparent" } },
    headRow: {
      style: {
        backgroundColor: "rgba(15,23,42,0.6)",
        borderBottom: "1px solid rgba(148,163,184,0.15)",
        minHeight: "48px",
      },
    },
    headCells: {
      style: {
        color: "#94a3b8",
        fontSize: "11px",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      },
    },
    rows: {
      style: {
        backgroundColor: "rgba(15,23,42,0.3)",
        borderBottom: "1px solid rgba(148,163,184,0.08)",
        minHeight: "56px",
        "&:hover": { backgroundColor: "rgba(30,58,138,0.3)" },
      },
    },
    cells: { style: { color: "#e2e8f0", fontSize: "13px" } },
    pagination: {
      style: {
        backgroundColor: "transparent",
        color: "#94a3b8",
        borderTop: "1px solid rgba(148,163,184,0.15)",
      },
      pageButtonsStyle: {
        color: "#94a3b8",
        fill: "#94a3b8",
        "&:hover": { backgroundColor: "rgba(59,130,246,0.2)" },
      },
    },
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: "#f1f5f9" }}>
            Your Mindmaps
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
            Create and manage your financial mindmaps
          </p>
        </div>
        <button
          onClick={() =>
            handleAddRow(data, editingId, setData, setEditingId, setNewRowData, setEditMode)
          }
          style={{
            background: "linear-gradient(135deg, #3b82f6, #2563eb)",
            color: "#fff",
            border: "none",
            padding: "10px 22px",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(59,130,246,0.3)",
            transition: "all 0.2s ease",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.boxShadow = "0 6px 20px rgba(59,130,246,0.45)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.boxShadow = "0 4px 14px rgba(59,130,246,0.3)")
          }
        >
          + Add Mindmap
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#64748b", fontSize: "14px" }}>
          Loading mindmaps...
        </div>
      ) : (
        <div
          style={{
            background: "rgba(15,23,42,0.5)",
            borderRadius: "12px",
            border: "1px solid rgba(148,163,184,0.1)",
            overflow: "hidden",
            backdropFilter: "blur(10px)",
          }}
        >
          <DataTable
            columns={columns}
            data={data}
            pagination
            highlightOnHover
            theme="dark-modern"
            customStyles={customStyles}
            noDataComponent={
              <div style={{ padding: "48px", color: "#64748b", fontSize: "14px", textAlign: "center" }}>
                No mindmaps yet. Click &quot;+ Add Mindmap&quot; to get started.
              </div>
            }
          />
        </div>
      )}
    </div>
  );
};

export default DashboardTable;
