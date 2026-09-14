import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../lib/format";

const MIN_PASSWORD_LENGTH = 8;

const ChangePasswordPage = () => {
  const { updatePassword } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notice, setNotice] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotice(null);

    if (newPassword !== confirmPassword) {
      setNotice({ type: "error", text: "New passwords do not match" });
      return;
    }

    setSubmitting(true);
    try {
      await updatePassword(currentPassword, newPassword);
      setNotice({ type: "success", text: "Password updated." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setNotice({
        type: "error",
        text: getErrorMessage(err, "Could not update password"),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm p-4">
      <h1 className="mb-4 text-2xl font-semibold">Change password</h1>

      <div className="card bg-base-100 shadow-sm">
        <form className="card-body gap-4" onSubmit={handleSubmit}>
          {notice && (
            <div className={`alert alert-${notice.type} py-2 text-sm`}>
              <span>{notice.text}</span>
            </div>
          )}

          <label className="form-control w-full">
            <span className="label-text mb-1 block text-sm">
              Current password
            </span>
            <input
              type="password"
              className="input w-full"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          <label className="form-control w-full">
            <span className="label-text mb-1 block text-sm">New password</span>
            <input
              type="password"
              className="input w-full"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              minLength={MIN_PASSWORD_LENGTH}
              required
            />
          </label>

          <label className="form-control w-full">
            <span className="label-text mb-1 block text-sm">
              Confirm new password
            </span>
            <input
              type="password"
              className="input w-full"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              minLength={MIN_PASSWORD_LENGTH}
              required
            />
          </label>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={submitting}
          >
            {submitting && (
              <span className="loading loading-spinner loading-sm" />
            )}
            Update password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
