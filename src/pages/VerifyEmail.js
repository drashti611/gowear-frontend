import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEnvelope, FaKey } from "react-icons/fa";
import API from "../api/axios";
import "../css/Register.css";

export default function VerifyEmail() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await API.post("/auth/verify-email", { email });
      navigate("/verify-otp", { state: { email } });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-standalone-card">
        <div className="auth-standalone-header">
          <div className="auth-standalone-logo">
            <FaKey style={{ fontSize: "20px" }} />
          </div>
          <h2>Reset Password</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
            Enter your registered email address to receive a one-time verification code
          </p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 px-3 mb-3" style={{ fontSize: "13.5px", borderRadius: "10px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="luxury-input-group">
            <label>
              <FaEnvelope className="me-1" style={{ fontSize: "11px" }} /> Email Address
            </label>
            <input
              id="email"
              type="email"
              className="luxury-input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-luxury-primary w-100"
            style={{ padding: "14px", marginTop: "8px" }}
            disabled={loading}
          >
            {loading ? "Sending Code..." : "Send Verification Code"}
          </button>
        </form>

        <div className="auth-footer-text">
          Remember your password? <Link to="/login">Back to Sign In</Link>
        </div>
      </div>
    </div>
  );
}
