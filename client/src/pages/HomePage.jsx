import { useCallback, useEffect, useState } from "react";
import axiosInstance from "../lib/axios";
import { MEALS, MEAL_LABELS } from "../lib/constants";
import { formatDate, getErrorMessage, relativeLabel } from "../lib/format";
import Spinner from "../components/Spinner";

const MealRow = ({ meal, slot, onBook, pending }) => {
  const { status, mine, bookedBy } = slot;

  return (
    <div className="flex items-center justify-between gap-3 border-t border-base-200 py-3 first:border-t-0">
      <span className="font-medium">{MEAL_LABELS[meal]}</span>

      {status === "free" && (
        <button
          className="btn btn-primary btn-sm"
          onClick={onBook}
          disabled={pending}
        >
          {pending && <span className="loading loading-spinner loading-xs" />}
          Book
        </button>
      )}

      {status === "booked" && mine && (
        <span className="badge badge-success badge-sm">Yours</span>
      )}

      {status === "booked" && !mine && (
        <span className="badge badge-ghost badge-sm">
          {bookedBy ? `Taken — ${bookedBy}` : "Taken"}
        </span>
      )}

      {status === "blocked" && (
        <span className="badge badge-outline badge-sm opacity-60">
          Unavailable
        </span>
      )}
    </div>
  );
};

const HomePage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);
  const [pendingSlot, setPendingSlot] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/bookings/availability");
      setData(res.data);
    } catch (err) {
      setNotice({ type: "error", text: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const book = async (date, meal) => {
    setPendingSlot(`${date}|${meal}`);
    setNotice(null);
    try {
      await axiosInstance.post("/bookings/create", { date, meal });
      setNotice({
        type: "success",
        text: `Booked ${MEAL_LABELS[meal].toLowerCase()} on ${formatDate(date)}.`,
      });
      await load();
    } catch (err) {
      const isTaken = err.response?.status === 409;
      setNotice({
        type: isTaken ? "warning" : "error",
        text: getErrorMessage(err, "Could not book that slot"),
      });
      if (isTaken) await load();
    } finally {
      setPendingSlot(null);
    }
  };

  if (loading) return <Spinner label="Loading available meals" />;

  return (
    <div className="mx-auto max-w-3xl p-4">
      <header className="mb-4">
        <h1 className="text-2xl font-semibold">Book a meal</h1>
        {data && (
          <p className="mt-1 text-sm opacity-70">
            You can book up to {formatDate(data.maxBookableDate)}.
          </p>
        )}
      </header>

      {notice && (
        <div className={`alert alert-${notice.type} mb-4 py-2 text-sm`}>
          <span>{notice.text}</span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.days.map((day, index) => (
          <section key={day.date} className="card bg-base-100 shadow-sm">
            <div className="card-body p-4">
              <div className="flex items-baseline justify-between">
                <h2 className="font-semibold">{formatDate(day.date)}</h2>
                {relativeLabel(index) && (
                  <span className="badge badge-primary badge-sm">
                    {relativeLabel(index)}
                  </span>
                )}
              </div>

              <div className="mt-1">
                {MEALS.map((meal) => (
                  <MealRow
                    key={meal}
                    meal={meal}
                    slot={day.meals[meal]}
                    pending={pendingSlot === `${day.date}|${meal}`}
                    onBook={() => book(day.date, meal)}
                  />
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
