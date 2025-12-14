import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import API from "../api/axios";
import "../css/Navbar.css";
import jwtDecode from "jwt-decode";


import {
  FaUser,
  FaHeart,
  FaShoppingBag,
  FaSearch,
  FaMapMarkerAlt,
  FaBars,
  FaTimes,
  FaChevronRight,
  FaBox,
  FaCog,
  FaSignOutAlt,
  FaShippingFast
} from "react-icons/fa";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
const token =
  sessionStorage.getItem("token") || localStorage.getItem("token");

useEffect(() => {
  if (!token) {
    setRole(null);
    return;
  }

  try {
    const decoded = jwtDecode(token);
    // ✅ Update ye
    if (decoded.role === "admin") {
      setRole(null); // admin ke liye user role null ho jaaye
    } else {
      setRole(decoded.role); // normal user ke liye role set ho jaaye
    }
  } catch (err) {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  }
}, [token, navigate]);


  const [city, setCity] = useState(null);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
const [role, setRole] = useState(null);

  const [activeCategory, setActiveCategory] = useState(null);
  const [hoveredSubcategory, setHoveredSubcategory] = useState(null);
  const [subcategoryData, setSubcategoryData] = useState({});
  const [productTypeData, setProductTypeData] = useState({});

  const hoverTimeoutRef = useRef(null);
  const profileRef = useRef(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          setCity(data.address?.city || data.address?.town || "Your Location");
        } catch {
          setCity("India");
        }
      },
      () => setCity("India"),
      { timeout: 5000 }
    );
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get("/category/");
        setCategories(res.data || []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const updateCounts = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const likes = JSON.parse(localStorage.getItem("likedProducts") || "[]");
      setCartCount(cart.length);
      setLikeCount(likes.length);
    };

    updateCounts();
    window.addEventListener("storage", updateCounts);

    return () => window.removeEventListener("storage", updateCounts);
  }, []);

  if (location.pathname.startsWith("/admin")) return null;

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("cart");
    localStorage.removeItem("likedProducts");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    setShowProfileMenu(false);
    navigate("/login");
  };

  const homeLink = role === "admin" ? "/admin/home" : "/";

  const fetchSubcategories = async (categoryId) => {
    if (subcategoryData[categoryId]) return;

    try {
      const res = await API.get(`subCategory/viewSubCategoryByCategoryID/${categoryId}`);
      setSubcategoryData(prev => ({
        ...prev,
        [categoryId]: res.data || []
      }));
    } catch (err) {
      console.error("Failed to fetch subcategories:", err);
    }
  };

  const fetchProductTypes = async (categoryId, subcategoryId) => {
    const key = `${categoryId}-${subcategoryId}`;
    if (productTypeData[key]) return;

    try {
      const res = await API.get(`product_type/ProductTypebyCategory/${categoryId}`);

      const filtered = res.data.filter(pt => {
        const subId = pt.subCategoryId?._id || pt.subCategoryId;
        return subId === subcategoryId;
      });

      setProductTypeData(prev => ({
        ...prev,
        [key]: filtered
      }));
    } catch (err) {
      console.error("Failed to fetch product types:", err);
    }
  };

  const handleCategoryInteraction = (categoryId) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);

    setActiveCategory(categoryId);
    setHoveredSubcategory(null);
    fetchSubcategories(categoryId);
  };

  const handleCategoryLeave = () => {
    if (isMobile) return;

    hoverTimeoutRef.current = setTimeout(() => {
      setActiveCategory(null);
      setHoveredSubcategory(null);
    }, 200);
  };

  const handleSubcategoryHover = (subcategoryId) => {
    if (isMobile) return;
    setHoveredSubcategory(subcategoryId);
    fetchProductTypes(activeCategory, subcategoryId);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
      setMobileMenuOpen(false);
    }
  };

  const handleWishlistClick = () => {
    if (!token) {
      alert("Please login to view wishlist");
      navigate("/login");
      return;
    }
    navigate("/likes");
  };

  const handleCartClick = () => {
    if (!token) {
      alert("Please login to view cart");
      navigate("/login");
      return;
    }
    navigate("/cart");
  };

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="announcement-bar">
        <div className="announcement-content">
          <div className="announcement-item">
            <FaMapMarkerAlt className="announcement-icon" />
            <span>Deliver to: <strong>{city || "India"}</strong></span>
          </div>
          <div className="announcement-promo">
            <FaShippingFast className="promo-icon" />
            <span>Free Shipping on Orders Above ₹999 | Shop Now!</span>
          </div>
          <div className="announcement-links">
            <a href="/track-order">Track Order</a>
            <span className="dot">•</span>
            <a href="/help">Help Center</a>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="main-nav">
        <div className="nav-container">
          {/* Mobile Menu Button */}
          <button
            className="mobile-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
          </button>

          {/* Brand Logo */}
          <div className="brand" onClick={() => navigate(homeLink)}>
            <div className="brand-logo">GW</div>
            <div className="brand-text">
              <span className="brand-name">GoWear</span>
              <span className="brand-tagline">Fashion Hub</span>
            </div>
          </div>

          {/* Desktop Categories */}
          <div className="nav-categories">
            {categories.slice(0, 5).map((cat) => (
              <div
                key={cat._id}
                className="category-wrapper"
                onMouseEnter={() => handleCategoryInteraction(cat._id)}
                onMouseLeave={handleCategoryLeave}
              >
                <button
                  className={`category-btn ${activeCategory === cat._id ? 'active' : ''}`}
                  onClick={() => navigate(`/category/${cat._id}`)}
                >
                  {cat.name}
                </button>
              </div>
            ))}
          </div>

          {/* Search Bar */}
          <form className="search-form" onSubmit={handleSearch}>
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search for products, brands and more..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-submit">
              Search
            </button>
          </form>

          {/* Action Icons */}
          <div className="nav-actions">
            {/* Wishlist */}
            <div className="action-btn" onClick={handleWishlistClick}>
              <div className="action-icon-box">
                <FaHeart className="action-icon" />
                {token && likeCount > 0 && <span className="action-badge">{likeCount}</span>}
              </div>
              <span className="action-text">Wishlist</span>
            </div>

            {/* Cart */}
            <div className="action-btn" onClick={handleCartClick}>
              <div className="action-icon-box">
                <FaShoppingBag className="action-icon" />
                {token && cartCount > 0 && <span className="action-badge">{cartCount}</span>}
              </div>
              <span className="action-text">Bag</span>
            </div>

            {/* Profile / Login */}
            {!token ? (
              <button className="login-button" onClick={() => navigate("/login")}>
                <FaUser size={14} />
                <span>Login</span>
              </button>
            ) : (
              <div className="profile-wrapper" ref={profileRef}>
                <div
                  className="action-btn"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <div className="action-icon-box">
                    <FaUser className="action-icon" />
                  </div>
                  <span className="action-text">Profile</span>
                </div>

                {showProfileMenu && (
                  <div className="profile-menu">
                    <div className="profile-header">
                      <div className="profile-avatar">
                        <FaUser size={20} />
                      </div>
                      <div className="profile-details">
                        <span className="profile-title">My Account</span>
                        <span className="profile-subtitle">Welcome back!</span>
                      </div>
                    </div>

                    <div className="profile-body">
                      <button
                        className="profile-item"
                        onClick={() => {
                          navigate("/profile");
                          setShowProfileMenu(false);
                        }}
                      >
                        <FaCog className="profile-icon" />
                        <span>Account Settings</span>
                        <FaChevronRight className="profile-arrow" />
                      </button>

                      <button
                        className="profile-item"
                        onClick={() => {
                          navigate("/orders");
                          setShowProfileMenu(false);
                        }}
                      >
                        <FaBox className="profile-icon" />
                        <span>My Orders</span>
                        <FaChevronRight className="profile-arrow" />
                      </button>

                      <button
                        className="profile-item"
                        onClick={() => {
                          navigate("/likes");
                          setShowProfileMenu(false);
                        }}
                      >
                        <FaHeart className="profile-icon" />
                        <span>My Wishlist</span>
                        <FaChevronRight className="profile-arrow" />
                      </button>

                      <div className="profile-divider"></div>

                      <button className="profile-item logout-item" onClick={logout}>
                        <FaSignOutAlt className="profile-icon" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mega Menu */}
      {activeCategory && !isMobile && (
        <div
          className="mega-menu"
          onMouseEnter={() => hoverTimeoutRef.current && clearTimeout(hoverTimeoutRef.current)}
          onMouseLeave={handleCategoryLeave}
        >
          <div className="mega-container">
            {/* Subcategories */}
            <div className="mega-section">
              <h4 className="mega-heading">Shop by Category</h4>
              <div className="mega-list">
                {subcategoryData[activeCategory] ? (
                  subcategoryData[activeCategory].length > 0 ? (
                    subcategoryData[activeCategory].map((sub) => (
                      <div
                        key={sub._id}
                        className={`mega-link ${hoveredSubcategory === sub._id ? 'hovered' : ''}`}
                        onMouseEnter={() => handleSubcategoryHover(sub._id)}
                        onClick={() => navigate(`/products/${activeCategory}/${sub._id}`)}
                      >
                        <span>{sub.name}</span>
                        <FaChevronRight className="mega-icon" />
                      </div>
                    ))
                  ) : (
                    <div className="mega-empty">No items available</div>
                  )
                ) : (
                  <div className="mega-loading">Loading...</div>
                )}
              </div>
            </div>

            {/* Product Types */}
            {hoveredSubcategory && (
              <div className="mega-section">
                <h4 className="mega-heading">Popular Products</h4>
                <div className="mega-list">
                  {productTypeData[`${activeCategory}-${hoveredSubcategory}`] ? (
                    productTypeData[`${activeCategory}-${hoveredSubcategory}`].length > 0 ? (
                      productTypeData[`${activeCategory}-${hoveredSubcategory}`].map((pt) => (
                        <div
                          key={pt._id}
                          className="mega-link"
                          onClick={() => navigate(`/product-type/${pt._id}`)}
                        >
                          <span>{pt.name}</span>
                        </div>
                      ))
                    ) : (
                      <div className="mega-empty">No products</div>
                    )
                  ) : (
                    <div className="mega-loading">Loading...</div>
                  )}
                </div>
              </div>
            )}

            {/* Featured Banner */}
            {categories.find(c => c._id === activeCategory)?.heroImageUrl && (
              <div className="mega-featured">
                <img
                  src={categories.find(c => c._id === activeCategory).heroImageUrl}
                  alt="Featured"
                  className="featured-image"
                />
                <div className="featured-content">
                  <h3>New Arrivals</h3>
                  <p>Explore the latest collection</p>
                  <button
                    className="featured-button"
                    onClick={() => navigate(`/category/${activeCategory}`)}
                  >
                    Shop Now
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="mobile-menu">
            <div className="mobile-header">
              <h3>Menu</h3>
              <button onClick={() => setMobileMenuOpen(false)}>
                <FaTimes size={24} />
              </button>
            </div>

            <div className="mobile-body">
              {/* Mobile Search */}
              <form className="mobile-search" onSubmit={handleSearch}>
                <FaSearch />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </form>

              {/* Mobile Categories */}
              <div className="mobile-section">
                <h4 className="section-title">Categories</h4>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    className="mobile-link"
                    onClick={() => {
                      navigate(`/category/${cat._id}`);
                      setMobileMenuOpen(false);
                    }}
                  >
                    {cat.name}
                    <FaChevronRight />
                  </button>
                ))}
              </div>

              {/* Mobile Quick Links */}
              {token && (
                <div className="mobile-section">
                  <h4 className="section-title">My Account</h4>
                  <button
                    className="mobile-link"
                    onClick={() => {
                      navigate("/orders");
                      setMobileMenuOpen(false);
                    }}
                  >
                    <FaBox /> My Orders
                  </button>
                  <button
                    className="mobile-link"
                    onClick={() => {
                      navigate("/likes");
                      setMobileMenuOpen(false);
                    }}
                  >
                    <FaHeart /> Wishlist
                  </button>
                  <button
                    className="mobile-link"
                    onClick={() => {
                      navigate("/profile");
                      setMobileMenuOpen(false);
                    }}
                  >
                    <FaCog /> Settings
                  </button>
                </div>
              )}

              {/* Mobile Auth Button */}
              {token ? (
                <button className="mobile-logout" onClick={logout}>
                  <FaSignOutAlt /> Logout
                </button>
              ) : (
                <button
                  className="mobile-login"
                  onClick={() => {
                    navigate("/login");
                    setMobileMenuOpen(false);
                  }}
                >
                  <FaUser /> Login
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
