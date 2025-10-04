import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role"); // get user role

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <nav style={{ padding: "10px", background: "#f0f0f0" }}>
      <Link to="/">Home</Link> |{" "}
      {role === "admin" && <Link to="/admin/categories">Manage Categories</Link>} |{" "}
      {!token ? (
        <>
          <Link to="/login">Login</Link> | <Link to="/register">Register</Link>
        </>
      ) : (
        <button onClick={logout}>Logout</button>
      )}
    </nav>
  );
}
