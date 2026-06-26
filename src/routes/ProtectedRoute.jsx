import { Navigate, useLocation } from "react-router-dom";
import useApp from "../hooks/useApp";

export default function ProtectedRoute({ children }) {
  const { user } = useApp();
  const location = useLocation();
  return user ? (
    children
  ) : (
    <Navigate to="/" replace state={{ from: location.pathname }} />
  );
}
