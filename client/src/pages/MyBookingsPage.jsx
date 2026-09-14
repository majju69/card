import { useEffect, useState } from "react";
import axiosInstance from "../lib/axios";
import { MEAL_LABELS } from "../lib/constants";
import { formatDate, getErrorMessage } from "../lib/format";
import Spinner from "../components/Spinner";

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [unpaid, setUnpaid] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axiosInstance.get("/bookings/me");
        setBookings(data.bookings ?? []);
        setUnpaid(data.unpaid ?? []);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Spinner label="Loading your bookings" />;

  return (
    <div className="mx-auto max-w-3xl p-4">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">My bookings</h1>
        {unpaid.length > 0 && (
          <span className="badge badge-warning">{unpaid.length} unpaid</span>
        )}
      </header>

      {error && (
        <div className="alert alert-error mb-4 py-2 text-sm">
          <span>{error}</span>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="rounded-box border border-dashed border-base-300 p-8 text-center opacity-60">
          You haven&apos;t booked anything yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-box border border-base-300">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Meal</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td className="whitespace-nowrap">{formatDate(b.date)}</td>
                  <td>{MEAL_LABELS[b.meal] ?? b.meal}</td>
                  <td>
                    {b.paid ? (
                      <span className="badge badge-success badge-sm">Paid</span>
                    ) : (
                      <span className="badge badge-warning badge-sm">
                        Unpaid
                      </span>
                    )}
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

export default MyBookingsPage;
