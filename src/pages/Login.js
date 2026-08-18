import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaLock, FaEnvelope, FaEye, FaEyeSlash, FaArrowRight } from "react-icons/fa";
import API from "../api/axios";
import jwt_decode from "jwt-decode";
import "../css/Register.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await API.post("/auth/login", form);

      // Save token
      localStorage.setItem("token", res.data.token);

      // Decode token to get role and userId
      const decoded = jwt_decode(res.data.token);
      localStorage.setItem("role", decoded.role);
      localStorage.setItem("userId", decoded.id);

      window.dispatchEvent(new Event("storage"));

      if (decoded.role === "admin") {
        navigate("/admin/home");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-standalone-card">
        <div className="auth-standalone-header">
          <div className="auth-standalone-logo">GW</div>
          <h2>Welcome Back</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
            Sign in to access your GoWear bag, wishlist & orders
          </p>
        </div>

        {error && (
          <div
            className="alert alert-danger py-2 px-3 mb-3"
            style={{ fontSize: "13.5px", borderRadius: "10px" }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="luxury-input-group">
            <label>
              <FaEnvelope className="me-1" style={{ fontSize: "11px" }} /> Email Address
            </label>
            <input
              name="email"
              type="email"
              className="luxury-input"
              id="email"
              placeholder="Enter your registered email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="luxury-input-group">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="mb-0">
                <FaLock className="me-1" style={{ fontSize: "11px" }} /> Password
              </label>
              <Link
                to="/verify-email"
                style={{ fontSize: "12px", color: "var(--primary)", fontWeight: 600 }}
              >
                Forgot Password?
              </Link>
            </div>
            <div style={{ position: "relative" }}>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                className="luxury-input"
                id="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
                style={{ paddingRight: "40px" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-luxury-primary w-100"
            style={{ padding: "14px", marginTop: "8px" }}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In to GoWear"} <FaArrowRight className="ms-1" />
          </button>
        </form>

        <div className="auth-footer-text">
          Don't have an account? <Link to="/register">Create an account</Link>
        </div>
      </div>
    </div>
  );
}

// Logout helper function
export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("userId");
  localStorage.removeItem("cart");
  localStorage.removeItem("likedProducts");
  window.dispatchEvent(new Event("storage"));
}
