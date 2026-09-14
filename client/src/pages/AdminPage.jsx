import { useCallback, useEffect, useState } from "react";
import axiosInstance from "../lib/axios";
import { MEALS, MEAL_LABELS } from "../lib/constants";
import { formatDate, getErrorMessage } from "../lib/format";
import Spinner from "../components/Spinner";

const emptyForm = {
  date: "",
  meal: "lunch",
  userId: "",
  paid: false,
  note: "",
};

const AdminPage = () => {
  const [bookings, setBookings] = useState([]);
  const [unpaidCount, setUnpaidCount] = useState(0);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const [filters, setFilters] = useState({
    paid: "",
    from: "",
    to: "",
    userId: "",
  });
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);

  const loadBookings = useCallback(async () => {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== ""),
    );
    try {
      const { data } = await axiosInstance.get("/bookings/admin", { params });
      setBookings(data.bookings ?? []);
      setUnpaidCount(data.unpaidCount ?? 0);
    } catch (err) {
      setNotice({ type: "error", text: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadBookings();
  }, [loadBookings]);

  useEffect(() => {
    axiosInstance
      .get("/users")
      .then(({ data }) => setUsers(data.users ?? []))
      .catch(() => setUsers([]));
  }, []);

  const togglePaid = async (booking) => {
    setBusyId(booking._id);
    setNotice(null);
    try {
      await axiosInstance.patch(`/bookings/admin/${booking._id}`, {
        paid: !booking.paid,
      });
      await loadBookings();
    } catch (err) {
      setNotice({ type: "error", text: getErrorMessage(err) });
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (booking) => {
    const who = booking.user ? booking.user.fullName : "this blocked slot";
    if (
      !window.confirm(
        `Delete ${MEAL_LABELS[booking.meal]} on ${formatDate(booking.date)} for ${who}?`,
      )
    )
      return;

    setBusyId(booking._id);
    setNotice(null);
    try {
      await axiosInstance.delete(`/bookings/admin/${booking._id}`);
      await loadBookings();
    } catch (err) {
      setNotice({ type: "error", text: getErrorMessage(err) });
    } finally {
      setBusyId(null);
    }
  };

  const create = async (e) => {
    e.preventDefault();
    setCreating(true);
    setNotice(null);

    const body = { date: form.date, meal: form.meal, paid: form.paid };
    if (form.userId) body.userId = form.userId;
    if (form.note.trim()) body.note = form.note.trim();

    try {
      await axiosInstance.post("/bookings/admin", body);
      setNotice({
        type: "success",
        text: form.userId ? "Booking created." : "Slot blocked.",
      });
      setForm(emptyForm);
      await loadBookings();
    } catch (err) {
      setNotice({
        type: err.response?.status === 409 ? "warning" : "error",
        text: getErrorMessage(err),
      });
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <Spinner label="Loading the ledger" />;

  return (
    <div className="mx-auto max-w-5xl p-4">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <span
          className={`badge ${unpaidCount ? "badge-warning" : "badge-ghost"}`}
        >
          {unpaidCount} unpaid overall
        </span>
      </header>

      {notice && (
        <div className={`alert alert-${notice.type} mb-4 py-2 text-sm`}>
          <span>{notice.text}</span>
        </div>
      )}

      {/* Book for someone, or block a slot */}
      <section className="card mb-6 bg-base-100 shadow-sm">
        <form className="card-body gap-3 p-4" onSubmit={create}>
          <h2 className="font-semibold">Book for someone / block a slot</h2>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input
              type="date"
              className="input w-full"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />

            <select
              className="select w-full"
              value={form.meal}
              onChange={(e) => setForm({ ...form, meal: e.target.value })}
            >
              {MEALS.map((m) => (
                <option key={m} value={m}>
                  {MEAL_LABELS[m]}
                </option>
              ))}
            </select>

            <select
              className="select w-full"
              value={form.userId}
              onChange={(e) => setForm({ ...form, userId: e.target.value })}
            >
              <option value="">— Block (nobody) —</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.fullName}
                </option>
              ))}
            </select>

            <input
              className="input w-full"
              placeholder="Note (optional)"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={form.paid}
                onChange={(e) => setForm({ ...form, paid: e.target.checked })}
                disabled={!form.userId}
              />
              Already paid
            </label>

            <button className="btn btn-primary btn-sm" disabled={creating}>
              {creating && (
                <span className="loading loading-spinner loading-xs" />
              )}
              {form.userId ? "Create booking" : "Block slot"}
            </button>
          </div>
        </form>
      </section>

      {/* Filters */}
      <section className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <select
          className="select w-full"
          value={filters.paid}
          onChange={(e) => setFilters({ ...filters, paid: e.target.value })}
        >
          <option value="">All payments</option>
          <option value="false">Unpaid only</option>
          <option value="true">Paid only</option>
        </select>

        <select
          className="select w-full"
          value={filters.userId}
          onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
        >
          <option value="">Everyone</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>
              {u.fullName}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="input w-full"
          value={filters.from}
          onChange={(e) => setFilters({ ...filters, from: e.target.value })}
        />
        <input
          type="date"
          className="input w-full"
          value={filters.to}
          onChange={(e) => setFilters({ ...filters, to: e.target.value })}
        />
      </section>

      {/* Ledger */}
      {bookings.length === 0 ? (
        <div className="rounded-box border border-dashed border-base-300 p-8 text-center opacity-60">
          Nothing matches those filters.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-box border border-base-300">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Meal</th>
                <th>Who</th>
                <th>Paid</th>
                <th>Note</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td className="whitespace-nowrap">{formatDate(b.date)}</td>
                  <td>{MEAL_LABELS[b.meal] ?? b.meal}</td>
                  <td>
                    {b.user ? (
                      <div>
                        <div>{b.user.fullName}</div>
                        <div className="text-xs opacity-60">{b.user.email}</div>
                      </div>
                    ) : (
                      <span className="badge badge-outline badge-sm opacity-60">
                        Blocked
                      </span>
                    )}
                  </td>
                  <td>
                    {b.user ? (
                      <input
                        type="checkbox"
                        className="toggle toggle-success toggle-sm"
                        checked={b.paid}
                        disabled={busyId === b._id}
                        onChange={() => togglePaid(b)}
                      />
                    ) : (
                      <span className="opacity-40">—</span>
                    )}
                  </td>
                  <td className="max-w-[12rem] truncate text-sm opacity-70">
                    {b.note || ""}
                  </td>
                  <td className="text-right">
                    <button
                      className="btn btn-ghost btn-xs text-error"
                      disabled={busyId === b._id}
                      onClick={() => remove(b)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
