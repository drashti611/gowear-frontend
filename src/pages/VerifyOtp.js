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
      navigate("/register"); // go to registration after OTP verified
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Enter OTP</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />{" "}
        <br />
        <button type="submit">Verify OTP</button>
      </form>
    </div>
  );
}
