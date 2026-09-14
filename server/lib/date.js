// this file is fully AI generated

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const istFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const pad = (v) => String(v).padStart(2, "0");

const formatUTC = (d) =>
  `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;

export const getTodayIST = (now = new Date()) => istFormatter.format(now);

export const addDays = (dateStr, n) => {
  if (!DATE_RE.test(dateStr)) {
    throw new Error(`addDays: invalid date "${dateStr}", expected YYYY-MM-DD`);
  }
  if (!Number.isInteger(n)) {
    throw new Error(`addDays: offset must be an integer, got ${n}`);
  }

  const [year, month, day] = dateStr.split("-").map(Number);

  // reject shape-valid but impossible dates like "2026-02-30"
  const base = new Date(Date.UTC(year, month - 1, day));
  if (
    base.getUTCFullYear() !== year ||
    base.getUTCMonth() !== month - 1 ||
    base.getUTCDate() !== day
  ) {
    throw new Error(`addDays: "${dateStr}" is not a real calendar date`);
  }

  return formatUTC(new Date(Date.UTC(year, month - 1, day + n)));
};
