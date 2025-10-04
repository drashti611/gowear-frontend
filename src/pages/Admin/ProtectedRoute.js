import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "admin") {
    alert("Access denied. Admins only.");
    return <Navigate to="/" />;
  }

  return children;
}
