import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import jwt_decode from "jwt-decode";
import 'bootstrap/dist/css/bootstrap.min.css';

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

      // Redirect based on role
      if (decoded.role === "admin") {
        navigate("/admin/home"); 
      } else {
        navigate("/"); 
      }
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow-lg p-4" style={{ maxWidth: "400px", width: "100%" }}>
        <h3 className="text-center mb-4">Login</h3>
        <form onSubmit={handleSubmit}>
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

          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              name="password"
              type="password"
              className="form-control"
              id="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

           <button type="submit" className="btn btn-success w-100 mb-3">
            Login
          </button>
        </form>

        <div className="text-center">
          <p className="mb-0">
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
