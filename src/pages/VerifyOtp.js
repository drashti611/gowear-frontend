import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/verify-otp", { email, otp });
      alert(res.data.message);
      navigate("/register");
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow-lg p-4" style={{ maxWidth: "400px", width: "100%" }}>
        <h3 className="text-center mb-4">Enter OTP</h3>
        <form onSubmit={handleSubmit}>
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
          <button type="submit" className="btn btn-primary w-100">Verify OTP</button>
        </form>
      </div>
    </div>
  );
}
