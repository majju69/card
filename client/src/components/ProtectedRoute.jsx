import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Spinner from "./Spinner";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isCheckingAuth } = useAuth();

  if (isCheckingAuth) return <Spinner label="Checking your session" />;

  if (!user) return <Navigate to="/login" replace />;

  if (adminOnly && !user.isAdmin) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
