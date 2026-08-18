import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { FaShieldAlt } from "react-icons/fa";
import API from "../api/axios";
import "../css/Register.css";

export default function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await API.post("/auth/verify-otp", { email, otp });
      alert(res.data.message || "OTP verified successfully!");
      navigate("/register");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired OTP code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-standalone-card">
        <div className="auth-standalone-header">
          <div className="auth-standalone-logo">
            <FaShieldAlt style={{ fontSize: "20px" }} />
          </div>
          <h2>Enter Verification Code</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
            We've sent a 6-digit code to <strong>{email || "your email"}</strong>
          </p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 px-3 mb-3" style={{ fontSize: "13.5px", borderRadius: "10px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="luxury-input-group">
            <label>6-Digit Verification Code</label>
            <input
              id="otp"
              type="text"
              className="luxury-input text-center"
              style={{ fontSize: "20px", letterSpacing: "6px", fontWeight: 700 }}
              placeholder="••••••"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength="6"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-luxury-primary w-100"
            style={{ padding: "14px", marginTop: "8px" }}
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>
        </form>

        <div className="auth-footer-text">
          Didn't receive code? <Link to="/verify-email">Resend Code</Link>
        </div>
      </div>
    </div>
  );
}
