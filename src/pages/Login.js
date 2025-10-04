import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import jwt_decode from "jwt-decode";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", form);
      // Save token
      localStorage.setItem("token", res.data.token);

      // Decode token to get role
      const decoded = jwt_decode(res.data.token);
      localStorage.setItem("role", decoded.role);

      alert("Login successful!");
      navigate("/"); // or admin page if role=admin
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <br />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <br />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
