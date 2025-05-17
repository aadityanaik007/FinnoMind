import {
  createMindmap,
  deleteMindmap,
  getMindmapStatus,
} from "../../api/mindmapApi";
import { stopPollingStatus } from "./statusPolling";
export const handleAddRow = (
  data,
  editingId,
  setData,
  setEditingId,
  setNewRowData
) => {
  if (editingId !== null) {
    const existingRow = data.find((row) => row.id === editingId);

    if (
      !existingRow.topic.length ||
      !existingRow.ticker ||
      !existingRow.range.startDate ||
      !existingRow.range.endDate
    ) {
      alert("⚠️ Please complete the current row before adding a new one!");
      return;
    }
  }

  const newId = Date.now();
  const newRow = {
    id: newId,
    topic: [],
    ticker: "",
    range: { startDate: "", endDate: "" },
    status: "pending",
    isNew: true,
  };

  setData([newRow, ...data]);
  setEditingId(newId);
  setNewRowData({
    topic: "",
    ticker: "",
    range: { startDate: "", endDate: "" },
  });
};

export const handleSave = async (
  tempId,
  newRowData,
  setData,
  setEditingId,
  setNewRowData
) => {
  console.log(
    "Saving mindmap with data startDate:==",
    newRowData.range.startDate
  );

  const newRow = {
    topic: newRowData.topic,
    ticker: newRowData.ticker,
    range: {
      startdate: newRowData.range.startDate
        ? newRowData.range.startDate.split("T")[0]
        : "",
      enddate: newRowData.range.endDate
        ? newRowData.range.endDate.split("T")[0]
        : "",
    },
    status: "pending",
  };

  try {
    const result = await createMindmap(newRow);

    if (result.success) {
      const generatedId = result.id;

      setData((prev) =>
        prev.map((row) =>
          row.id === tempId ? { ...row, id: generatedId, ...newRow } : row
        )
      );

      const intervalId = setInterval(async () => {
        const statusResult = await getMindmapStatus(generatedId);

        if (["done", "error"].includes(statusResult.status)) {
          clearInterval(intervalId);
          setData((prev) =>
            prev.map((row) =>
              row.id === generatedId
                ? { ...row, status: statusResult.status }
                : row
            )
          );
        }
      }, 3000);
    }
  } catch (error) {
    console.error("Failed to save mindmap", error);
  }

  setEditingId(null);
  setNewRowData({
    topic: "",
    ticker: "",
    range: { startDate: "", endDate: "" },
  });
};

export const handleDelete = async (id, setData) => {
  if (!confirm("Are you sure you want to delete this mindmap?")) {
    return;
  }

  try {
    const result = await deleteMindmap(id);

    if (result.success) {
      stopPollingStatus(id); // ✅ STOP POLLING for that id
      setData((prev) => prev.filter((row) => row.id !== id));
      return true;
    } else {
      console.error("Failed to delete mindmap");
      return false;
    }
  } catch (error) {
    console.error("Error deleting mindmap", error);
    return false;
  }
};
