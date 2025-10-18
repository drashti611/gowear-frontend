import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import API from "../api/axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const [city, setCity] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!navigator.geolocation) return setLocationError("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          setCity(
            data.address.city || data.address.town || data.address.village || "Unknown location"
          );
        } catch {
          setLocationError("Unable to detect city");
        }
      },
      (err) => setLocationError(err.message),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get("/category/");
        setCategories(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  if (location.pathname.startsWith("/admin")) return null;

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const homeLink = role === "admin" ? "/admin/home" : "/";

  return (
    <nav className="navbar navbar-expand-lg sticky-top navbar-dark premium-navbar">
      <div className="container-fluid">
        {/* Brand */}
        <span
          className="navbar-brand premium-brand"
          onClick={() => navigate(homeLink)}
        >
          GoWear
        </span>

        {/* Mobile toggle */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          {/* Categories */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 flex-row flex-wrap category-scroll">
            {categories.map((cat) => (
              <li
                key={cat._id}
                className="nav-item me-3"
                onClick={() => navigate(`/category/${cat._id}`)}
              >
                <span className="nav-link category-link">
                  {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                </span>
              </li>
            ))}
          </ul>

          {/* Right side */}
          <div className="d-flex align-items-center mt-2 mt-lg-0">
            {/* Location */}
            <span className="nav-location me-3">
              {city ? `Delivering to ${city}` : locationError || "Detecting location..."}
            </span>

            {/* Modern Search */}
            <div className="search-container me-3">
              <input
                type="text"
                className="search-input"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="search-icon">🔍</span>
            </div>

            {/* Cart */}
            <span className="cart-icon me-3">
              🛒 <span className="cart-badge">0</span>
            </span>

            {/* Login/Logout */}
            {!token ? (
              <button className="btn login-link" onClick={() => navigate("/login")}>
                Login
              </button>
            ) : (
              <button className="btn logout-btn" onClick={logout}>
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
