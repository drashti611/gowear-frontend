import { Navigate } from "react-router-dom";
import jwt_decode from "jwt-decode";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  // No token → not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwt_decode(token);

    // Not admin
    if (decoded.role !== "admin") {
      return <Navigate to="/" replace />;
    }

    // Admin allowed
    return children;
  } catch (err) {
    // Invalid or expired token
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    return <Navigate to="/login" replace />;
  }
}
