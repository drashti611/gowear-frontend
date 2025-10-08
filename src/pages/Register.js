import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: { label: "", street: "", city: "", state: "", pincode: "" },
  });
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [states, setStates] = useState([]); // list of Indian states
  const [cities, setCities] = useState([]); // list of cities for selected state
  const navigate = useNavigate();

  // ✅ Fetch all Indian states on component mount
  useEffect(() => {
    fetch("https://countriesnow.space/api/v0.1/countries/states", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country: "India" }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.data?.states) setStates(data.data.states);
        else setStates([]);
      })
      .catch((err) => console.error("Error fetching states:", err));
  }, []);

  // ✅ Handle when state changes
  const handleStateChange = (e) => {
    const selectedState = e.target.value;
    const updatedAddress = { ...form.address, state: selectedState, city: "" };
    setForm({ ...form, address: updatedAddress });

    // Fetch cities for selected state
    fetch("https://countriesnow.space/api/v0.1/countries/state/cities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country: "India", state: selectedState }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.data) setCities(data.data);
        else setCities([]);
      })
      .catch((err) => console.error("Error fetching cities:", err));
  };

  // ✅ Handle when city changes
  const handleCityChange = (e) => {
    const updatedAddress = { ...form.address, city: e.target.value };
    setForm({ ...form, address: updatedAddress });
  };

  // handle simple field change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // handle other address fields (label, street, pincode)
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    const updatedAddress = { ...form.address, [name]: value };
    setForm({ ...form, address: updatedAddress });
  };

  // send OTP
  const handleSendOtp = async () => {
    if (!form.email) return alert("Enter your email first");
    try {
      const res = await API.post("/auth/verify-email", { email: form.email });
      alert(res.data.message || "OTP sent to your email");
      setOtpSent(true);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send OTP");
    }
  };

  // verify OTP
  const handleVerifyOtp = async () => {
    if (!otp) return alert("Enter the OTP first");
    try {
      const res = await API.post("/auth/verify-otp", {
        email: form.email,
        otp: otp,
      });
      alert(res.data.message || "Email verified successfully!");
      setVerified(true);
    } catch (err) {
      alert(err.response?.data?.message || "Invalid OTP");
    }
  };

  // register
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!verified) return alert("Please verify your email before registering");

    try {
      const res = await API.post("/auth/register", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: [form.address],
      });
      alert(res.data.message || "Registered successfully!");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow-lg p-4" style={{ maxWidth: "450px", width: "100%" }}>
        <h3 className="text-center mb-4">Register</h3>
        <form onSubmit={handleRegister}>
          {/* Email */}
          <div className="mb-3">
            <label className="form-label">Email</label>
            <div className="input-group">
              <input
                name="email"
                type="email"
                className="form-control"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                required
                disabled={verified}
              />
              {!verified && (
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={handleSendOtp}
                  disabled={otpSent}
                >
                  {otpSent ? "Sent" : "Send OTP"}
                </button>
              )}
            </div>
          </div>

          {/* OTP */}
          {otpSent && !verified && (
            <div className="mb-3">
              <label className="form-label">Enter OTP</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-success"
                  onClick={handleVerifyOtp}
                >
                  Verify
                </button>
              </div>
            </div>
          )}

          {/* Name */}
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input
              name="name"
              type="text"
              className="form-control"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Phone */}
          <div className="mb-3">
            <label className="form-label">Phone</label>
            <input
              name="phone"
              type="text"
              className="form-control"
              placeholder="Enter your phone number"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </div>

          {/* Address Section */}
          <h5 className="mt-4 mb-2 text-secondary">Address Details</h5>
          <div className="mb-2">
            <label className="form-label">Label (e.g., Home/Work)</label>
            <input
              name="label"
              type="text"
              className="form-control"
              placeholder="Home or Work"
              value={form.address.label}
              onChange={handleAddressChange}
            />
          </div>
          <div className="mb-2">
            <label className="form-label">Street</label>
            <input
              name="street"
              type="text"
              className="form-control"
              placeholder="Street address"
              value={form.address.street}
              onChange={handleAddressChange}
            />
          </div>

          {/* State & City Dropdowns */}
          <div className="row">
            <div className="col-md-6 mb-2">
              <label className="form-label">State</label>
              <select
                name="state"
                className="form-select"
                value={form.address.state}
                onChange={handleStateChange}
              >
                <option value="">Select State</option>
                {Array.isArray(states) &&
                  states.map((s, i) => (
                    <option key={i} value={s.name}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="col-md-6 mb-2">
              <label className="form-label">City</label>
              <select
                name="city"
                className="form-select"
                value={form.address.city}
                onChange={handleCityChange}
                disabled={!cities.length}
              >
                <option value="">Select City</option>
                {Array.isArray(cities) &&
                  cities.map((c, i) => (
                    <option key={i} value={c}>
                      {c}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Pincode</label>
            <input
              name="pincode"
              type="text"
              className="form-control"
              placeholder="Enter pincode"
              value={form.address.pincode}
              onChange={handleAddressChange}
              maxLength="6"
            />
          </div>

          {/* Register Button */}
          <button type="submit" className="btn btn-success w-100" disabled={!verified}>
            Register
          </button>
        </form>

        <div className="text-center mt-3">
          <p className="mb-0">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
