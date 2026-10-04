import { createMindmap, updateMindmap } from "../../api/mindmapApi";

export const handleAddRow = (
  data,
  editingId,
  setData,
  setEditingId,
  setNewRowData,
  setEditMode
) => {
  if (editingId !== null) {
    alert("Please complete or save the current row before adding a new one.");
    return;
  }

  const newId = Date.now();
  const newRow = {
    id: newId,
    name: "",
    description: "",
    status: "New",
    node_count: 0,
    article_count: 0,
    isNew: true,
  };

  setData([newRow, ...data]);
  setEditingId(newId);
  setNewRowData({ name: "", description: "" });
  if (setEditMode) setEditMode("create");
};

export const handleEdit = (
  row,
  editingId,
  setEditingId,
  setNewRowData,
  setEditMode
) => {
  if (editingId !== null) {
    alert("Please complete or save the current row before editing another.");
    return;
  }
  setEditingId(row.id);
  setNewRowData({ name: row.name || "", description: row.description || "" });
  if (setEditMode) setEditMode("edit");
};

export const handleSave = async (
  tempId,
  newRowData,
  setData,
  setEditingId,
  setNewRowData,
  editMode
) => {
  if (!newRowData.name.trim()) {
    alert("Name is required.");
    return;
  }

  if (editMode === "edit") {
    try {
      await updateMindmap(tempId, {
        name: newRowData.name.trim(),
        description: newRowData.description.trim(),
      });
      setData((prev) =>
        prev.map((row) =>
          row.id === tempId
            ? {
                ...row,
                name: newRowData.name.trim(),
                description: newRowData.description.trim(),
              }
            : row
        )
      );
    } catch (error) {
      console.error("Failed to update mindmap", error);
    }
  } else {
    try {
      const result = await createMindmap({
        name: newRowData.name.trim(),
        description: newRowData.description.trim(),
      });

      if (result.success) {
        setData((prev) =>
          prev.map((row) =>
            row.id === tempId
              ? {
                  ...row,
                  id: result.id,
                  name: newRowData.name.trim(),
                  description: newRowData.description.trim(),
                  status: "New",
                  node_count: 0,
                  article_count: 0,
                  isNew: false,
                }
              : row
          )
        );
      }
    } catch (error) {
      console.error("Failed to save mindmap", error);
    }
  }

  setEditingId(null);
  setNewRowData({ name: "", description: "" });
};

export const handleCancelEdit = (
  editingId,
  editMode,
  setData,
  setEditingId,
  setNewRowData
) => {
  if (editMode === "create") {
    setData((prev) => prev.filter((r) => r.id !== editingId));
  }
  setEditingId(null);
  setNewRowData({ name: "", description: "" });
};

export const handleDelete = async (id, setData) => {
  if (!confirm("Are you sure you want to delete this mindmap?")) {
    return false;
  }

  try {
    const res = await fetch(`http://localhost:8000/api/mindmap/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setData((prev) => prev.filter((row) => row.id !== id));
      return true;
    } else {
      console.error("Failed to delete mindmap:", res.status);
      return false;
    }
  } catch (error) {
    console.error("Error deleting mindmap", error);
    return false;
  }
};
