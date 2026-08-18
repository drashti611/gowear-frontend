import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaCheckCircle,
  FaShieldAlt,
  FaTruck,
  FaGift,
  FaStar,
  FaEnvelope,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";
import API from "../api/axios";
import "../css/Register.css";

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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const navigate = useNavigate();

  // Fetch all Indian states on component mount
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

  // Handle state change
  const handleStateChange = (e) => {
    const selectedState = e.target.value;
    const updatedAddress = { ...form.address, state: selectedState, city: "" };
    setForm({ ...form, address: updatedAddress });

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

  const handleCityChange = (e) => {
    const updatedAddress = { ...form.address, city: e.target.value };
    setForm({ ...form, address: updatedAddress });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    const updatedAddress = { ...form.address, [name]: value };
    setForm({ ...form, address: updatedAddress });
  };

  const handleSendOtp = async () => {
    if (!form.email) {
      setMessage({ text: "Please enter your email first.", type: "danger" });
      return;
    }
    setLoading(true);
    try {
      const res = await API.post("/auth/verify-email", { email: form.email });
      setMessage({ text: res.data.message || "OTP sent to your email!", type: "success" });
      setOtpSent(true);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Failed to send OTP", type: "danger" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setMessage({ text: "Please enter the 6-digit OTP code.", type: "danger" });
      return;
    }
    setLoading(true);
    try {
      const res = await API.post("/auth/verify-otp", {
        email: form.email,
        otp: otp,
      });
      setMessage({ text: res.data.message || "Email verified successfully!", type: "success" });
      setVerified(true);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Invalid OTP code", type: "danger" });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!verified) {
      setMessage({ text: "Please verify your email before registering.", type: "danger" });
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/auth/register", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: [form.address],
      });
      alert(res.data.message || "Account created successfully! Please log in.");
      navigate("/login");
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Registration failed.", type: "danger" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-split-card">
        {/* Left Side: Brand & Benefits */}
        <div className="auth-hero-side">
          <div className="auth-hero-header">
            <div className="auth-hero-badge">
              <FaStar /> Luxury Fashion Collective
            </div>
            <h1 className="auth-hero-title">
              Redefine Your <br />
              <span className="gradient-text-accent" style={{ WebkitTextFillColor: "#fb7185" }}>
                Style Statement.
              </span>
            </h1>
            <p className="auth-hero-subtitle">
              Join over 50,000+ fashion connoisseurs discovering curated designer apparel, exclusive seasonal drops, and personalized styles.
            </p>
          </div>

          <div className="auth-features-list">
            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <FaGift />
              </div>
              <div className="auth-feature-text">
                <h5>Instant 15% Welcome Perk</h5>
                <p>Enjoy exclusive discount on your premier order.</p>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <FaTruck />
              </div>
              <div className="auth-feature-text">
                <h5>Complimentary Express Shipping</h5>
                <p>Fast track delivery right to your doorstep.</p>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <FaShieldAlt />
              </div>
              <div className="auth-feature-text">
                <h5>100% Authentic Quality</h5>
                <p>Direct sourcing with 30-day hassle-free returns.</p>
              </div>
            </div>
          </div>

          <div className="auth-hero-footer">
            <span>© 2026 GoWear Fashion Hub. All rights reserved.</span>
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="auth-form-side">
          <div className="auth-form-header">
            <h2>Create Account</h2>
            <p>Enter your details to create your GoWear profile</p>
          </div>

          {message.text && (
            <div
              className={`alert ${
                message.type === "success" ? "alert-success" : "alert-danger"
              } py-2 px-3 mb-3`}
              style={{ fontSize: "13.5px", borderRadius: "10px" }}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleRegister}>
            {/* Email with OTP Action */}
            <div className="luxury-input-group">
              <label>
                <FaEnvelope className="me-1" style={{ fontSize: "11px" }} /> Email Address
              </label>
              <div className="input-with-action">
                <input
                  name="email"
                  type="email"
                  className="luxury-input"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  disabled={verified || loading}
                />
                {!verified ? (
                  <button
                    type="button"
                    className="input-action-btn"
                    onClick={handleSendOtp}
                    disabled={otpSent || loading}
                  >
                    {otpSent ? "Code Sent" : "Send OTP"}
                  </button>
                ) : (
                  <span className="verified-tag">
                    <FaCheckCircle /> Verified
                  </span>
                )}
              </div>
            </div>

            {/* OTP Input Section */}
            {otpSent && !verified && (
              <div className="otp-box-section">
                <label className="d-block mb-1" style={{ fontSize: "12px", fontWeight: 700 }}>
                  Enter Verification Code
                </label>
                <div className="input-with-action">
                  <input
                    type="text"
                    className="luxury-input"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength="6"
                    required
                  />
                  <button
                    type="button"
                    className="input-action-btn"
                    onClick={handleVerifyOtp}
                    disabled={loading}
                    style={{ background: "var(--accent-emerald)" }}
                  >
                    Verify Code
                  </button>
                </div>
              </div>
            )}

            {/* Name & Phone */}
            <div className="form-row">
              <div className="luxury-input-group">
                <label>
                  <FaUser className="me-1" style={{ fontSize: "11px" }} /> Full Name
                </label>
                <input
                  name="name"
                  type="text"
                  className="luxury-input"
                  placeholder="Alex Morgan"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="luxury-input-group">
                <label>
                  <FaPhone className="me-1" style={{ fontSize: "11px" }} /> Mobile Number
                </label>
                <input
                  name="phone"
                  type="tel"
                  className="luxury-input"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Address Details */}
            <div className="address-divider-title">
              <FaMapMarkerAlt /> Shipping Address
            </div>

            <div className="form-row">
              <div className="luxury-input-group">
                <label>Address Label</label>
                <input
                  name="label"
                  type="text"
                  className="luxury-input"
                  placeholder="Home, Office, etc."
                  value={form.address.label}
                  onChange={handleAddressChange}
                />
              </div>

              <div className="luxury-input-group">
                <label>Street / Flat / Landmark</label>
                <input
                  name="street"
                  type="text"
                  className="luxury-input"
                  placeholder="123 Fashion Blvd, Apt 4B"
                  value={form.address.street}
                  onChange={handleAddressChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="luxury-input-group">
                <label>State</label>
                <select
                  name="state"
                  className="luxury-select"
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

              <div className="luxury-input-group">
                <label>City</label>
                <select
                  name="city"
                  className="luxury-select"
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

              <div className="luxury-input-group" style={{ maxWidth: "140px" }}>
                <label>Pincode</label>
                <input
                  name="pincode"
                  type="text"
                  className="luxury-input"
                  placeholder="400001"
                  value={form.address.pincode}
                  onChange={handleAddressChange}
                  maxLength="6"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-luxury-primary auth-submit-btn"
              disabled={!verified || loading}
            >
              {loading ? "Creating Account..." : "Create Account & Join"}
            </button>
          </form>

          <div className="auth-footer-text">
            Already have an account? <Link to="/login">Sign in here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
