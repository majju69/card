// AI generated

// The server sends every date as a "YYYY-MM-DD" label. These helpers only
// format for display -- no arithmetic happens on the client, because the
// browser's clock and timezone are not trustworthy.

export const formatDate = (dateStr) => {
  // Parsing with an explicit time makes this local midnight rather than UTC
  // midnight, so the weekday never shifts by a day.
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

// days[] arrives in order starting at the server's "today", so position
// tells us the relative label without any date maths.
export const relativeLabel = (index) =>
  index === 0 ? "Today" : index === 1 ? "Tomorrow" : null;

export const getErrorMessage = (error, fallback = "Something went wrong") =>
  error?.response?.data?.message ?? fallback;
