const pollingIntervals = {}; // ✅ Keep a map of { id: intervalId }

export const startPollingStatus = (id, setData) => {
  const intervalId = setInterval(async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/status?id=${id}`);
      const result = await res.json();

      if (["done", "error"].includes(result.status)) {
        clearInterval(intervalId);
        delete pollingIntervals[id]; // ✅ clean up
        setData((prev) =>
          prev.map((row) =>
            row.id === id ? { ...row, status: result.status } : row
          )
        );
      }
    } catch (error) {
      console.error(`Error polling status for id ${id}`, error);
    }
  }, 3000);

  pollingIntervals[id] = intervalId;
};

export const stopPollingStatus = (id) => {
  if (pollingIntervals[id]) {
    clearInterval(pollingIntervals[id]);
    delete pollingIntervals[id];
    console.log(`⛔ Stopped polling for ID: ${id}`);
  }
};
