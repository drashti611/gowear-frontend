import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function VerifyEmail() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/verify-email", { email });
      alert(res.data.message);
      navigate("/verify-otp", { state: { email } });
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow-lg p-4" style={{ maxWidth: "400px", width: "100%" }}>
        <h3 className="text-center mb-4">Verify Email</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Send OTP</button>
        </form>
      </div>
    </div>
  );
}
