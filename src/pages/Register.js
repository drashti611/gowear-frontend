import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  // Update input fields
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Step 1: Send OTP to email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!form.email) return alert("Enter your email first");
    try {
      const res = await API.post("/auth/verify-email", { email: form.email });
      alert(res.data.message || "OTP sent to your email");
      setOtpSent(true);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send OTP");
    }
  };

  // Step 2: Verify OTP and register
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!otp) return alert("Enter OTP first");
    try {
      // Verify OTP
      await API.post("/auth/verify-otp", { email: form.email, otp });
      // Register user
      const res = await API.post("/auth/register", form);
      alert(res.data.message);
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow-lg p-4" style={{ maxWidth: "400px", width: "100%" }}>
        <h3 className="text-center mb-4">Register</h3>

        {!otpSent ? (
          // Step 1: Send OTP
          <form onSubmit={handleSendOtp}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                name="email"
                type="email"
                className="form-control"
                id="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100 mb-3">
              Send OTP
            </button>
          </form>
        ) : (
          // Step 2: Verify OTP and complete registration
          <form onSubmit={handleRegister}>
            <div className="mb-3">
              <label htmlFor="otp" className="form-label">OTP</label>
              <input
                id="otp"
                type="text"
                className="form-control"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="name" className="form-label">Full Name</label>
              <input
                name="name"
                type="text"
                className="form-control"
                id="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="phone" className="form-label">Phone</label>
              <input
                name="phone"
                type="text"
                className="form-control"
                id="phone"
                placeholder="Enter your phone number"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-success w-100 mb-3">
              Register
            </button>
          </form>
        )}

        <div className="text-center">
          <p className="mb-0">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
