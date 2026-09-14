import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const linkClass = ({ isActive }) =>
  `btn btn-ghost btn-sm ${isActive ? "btn-active" : ""}`;

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  if (!user) return null;

  return (
    <div className="navbar border-b border-base-300 bg-base-100 px-4">
      <div className="flex-1">
        <Link to="/" className="text-lg font-semibold">
          Meal Card
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-1">
        <NavLink to="/" className={linkClass} end>
          Book
        </NavLink>
        <NavLink to="/my-bookings" className={linkClass}>
          My bookings
        </NavLink>
        {user.isAdmin && (
          <NavLink to="/admin" className={linkClass}>
            Admin
          </NavLink>
        )}
        <NavLink to="/change-password" className={linkClass}>
          Password
        </NavLink>

        <div className="divider divider-horizontal mx-1" />

        <span className="hidden text-sm opacity-70 sm:inline">
          {user.fullName}
        </span>
        <button onClick={handleLogout} className="btn btn-outline btn-sm">
          Log out
        </button>
      </div>
    </div>
  );
};

export default Navbar;
