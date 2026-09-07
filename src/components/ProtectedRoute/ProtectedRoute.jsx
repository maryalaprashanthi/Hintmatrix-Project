import { Navigate, useLocation } from "react-router-dom";
import { normalizeRole } from "../../utils/roles";

const isAuthenticated = () => Boolean(localStorage.getItem("token"));

const hasRequiredRole = (allowedRoles = []) => {
  if (!allowedRoles.length) return true;

  const userRole = normalizeRole(localStorage.getItem("role"));

  return allowedRoles.some((role) => normalizeRole(role) === userRole);
};

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!hasRequiredRole(allowedRoles)) {
    return <Navigate to="/unauthorized" replace state={{ from: location.pathname }} />;
  }

  return children;
}
