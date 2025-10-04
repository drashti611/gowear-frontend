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
    <div style={{ padding: "20px" }}>
      <h2>Verify Email</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />{" "}
        <br />
        <button type="submit">Send OTP</button>
      </form>
    </div>
  );
}
