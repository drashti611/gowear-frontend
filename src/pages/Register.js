import { useState } from "react";
import API from "../api/axios";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/register", form);
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" onChange={handleChange} /> <br />
        <input name="email" placeholder="Email" onChange={handleChange} /> <br />
        <input name="phone" placeholder="Phone" onChange={handleChange} /> <br />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}
