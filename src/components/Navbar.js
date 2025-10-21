import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import API from "../api/axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/Navbar.css";
import { FaUserCircle } from "react-icons/fa";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const [city, setCity] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Detect city
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
          setCity(data.address.city || "Unknown location");
        } catch {
          setLocationError("Unable to detect city");
        }
      },
      (err) => setLocationError(err.message),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // Fetch categories
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

  // Update cart & likes count
  useEffect(() => {
    const updateCart = () => setCartCount(JSON.parse(localStorage.getItem("cart"))?.length || 0);
    const updateLikes = () => setLikeCount(JSON.parse(localStorage.getItem("likedProducts"))?.length || 0);
    updateCart();
    updateLikes();
    window.addEventListener("storage", updateCart);
    window.addEventListener("storage", updateLikes);
    return () => {
      window.removeEventListener("storage", updateCart);
      window.removeEventListener("storage", updateLikes);
    };
  }, []);

  if (location.pathname.startsWith("/admin")) return null;

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setShowProfileMenu(false);
    navigate("/login");
  };

  const homeLink = role === "admin" ? "/admin/home" : "/";

  return (
    <nav className="navbar navbar-expand-lg sticky-top navbar-light sleek-navbar">
      <div className="container-fluid">
        <span className="navbar-brand sleek-brand" onClick={() => navigate(homeLink)}>
          GoWear
        </span>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 sleek-categories">
            {categories.map((cat) => (
              <li key={cat._id} className="nav-item" onClick={() => navigate(`/category/${cat._id}`)}>
                <span className="nav-link">{cat.name}</span>
              </li>
            ))}
          </ul>

          <div className="d-flex align-items-center sleek-right">
            <span className="nav-location">{city || locationError || "Detecting location..."}</span>

            <div className="search-wrapper">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="sleek-search"
              />
              <span className="search-icon">🔍</span>
            </div>

            <span className="icon" onClick={() => navigate("/likes")}>
              ❤️ {likeCount > 0 && <span className="icon-badge">{likeCount}</span>}
            </span>

            <span className="icon" onClick={() => navigate("/cart")}>
              🛒 {cartCount > 0 && <span className="icon-badge">{cartCount}</span>}
            </span>

            {!token ? (
              <button className="btn sleek-btn-login" onClick={() => navigate("/login")}>Login</button>
            ) : (
              <div className="profile-wrapper">
                <FaUserCircle
                  size={28}
                  className="profile-icon"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                />
                {showProfileMenu && (
                  <div className="profile-dropdown">
                    <ul>
                      <li onClick={() => { navigate("/profile"); setShowProfileMenu(false); }}>Profile</li>
                      <li onClick={() => { navigate("/orders"); setShowProfileMenu(false); }}>My Orders</li>
                      <li onClick={logout}>Logout</li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
