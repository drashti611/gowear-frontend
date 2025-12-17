import { Navigate } from "react-router-dom";
import jwt_decode from "jwt-decode";

export default function CustomerRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwt_decode(token);

    if (decoded.role !== "customer") {
      return <Navigate to="/admin/home" replace />;
    }

    return children;
  } catch {
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }
}
