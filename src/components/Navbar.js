import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const [city, setCity] = useState(null);
  const [locationError, setLocationError] = useState(null);

  // ---- Hooks first ----
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported by browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse geocoding using OpenStreetMap Nominatim
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          const cityName =
            data.address.city ||
            data.address.town ||
            data.address.village ||
            data.address.county ||
            "Unknown location";
          setCity(cityName);
        } catch (err) {
          setLocationError("Unable to get city");
        }
      },
      (error) => {
        setLocationError(error.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  if (location.pathname.startsWith("/admin")) return null;

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const homeLink = role === "admin" ? "/admin/home" : "/";

  return (
    <nav className="navbar navbar-expand-lg ecommerce-navbar">
      <div className="container">
        {/* Brand */}
        <span
          className="navbar-brand ecommerce-brand"
          onClick={() => navigate(homeLink)}
        >
          GoWear
        </span>

        {/* Toggler */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Links */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            {/* Location display */}
            <li className="nav-item me-3 d-flex align-items-center">
              {city ? (
                <span className="nav-link" style={{ cursor: "default" }}>
                  Delivering to {city}
                </span>
              ) : locationError ? (
                <span
                  className="nav-link text-danger"
                  style={{ cursor: "default" }}
                >
                  {locationError}
                </span>
              ) : (
                <span className="nav-link" style={{ cursor: "default" }}>
                  Detecting location...
                </span>
              )}
            </li>

            {/* Search bar */}
            <li className="nav-item me-2 d-none d-lg-block">
              <input
                type="text"
                className="form-control form-control-sm search-input"
                placeholder="Search for products..."
              />
            </li>

            {/* Cart icon */}
            <li className="nav-item ms-3">
              <span className="cart-icon">
                🛒 <span className="cart-badge">0</span>
              </span>
            </li>
            {!token ? (
              <li className="nav-item">
                <span
                  className="nav-link login-link"
                  onClick={() => navigate("/login")}
                >
                  Login
                </span>
              </li>
            ) : (
              <li className="nav-item">
                <button className="btn logout-btn" onClick={logout}>
                  Logout
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
