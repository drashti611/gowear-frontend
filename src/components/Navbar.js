import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import API from "../api/axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/Navbar.css";
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
  FaSignOutAlt
} from "react-icons/fa";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = sessionStorage.getItem("token") || localStorage.getItem("token");
  const role = sessionStorage.getItem("role") || localStorage.getItem("role");

  const [city, setCity] = useState(null);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mega menu state
  const [activeCategory, setActiveCategory] = useState(null);
  const [hoveredSubcategory, setHoveredSubcategory] = useState(null);
  const [subcategoryData, setSubcategoryData] = useState({});
  const [productTypeData, setProductTypeData] = useState({});

  const hoverTimeoutRef = useRef(null);
  const profileRef = useRef(null);

  // Mobile detection
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Detect city
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

  // Fetch categories
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

  // Update cart & likes count
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
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    setShowProfileMenu(false);
    navigate("/login");
  };

  const homeLink = role === "admin" ? "/admin/home" : "/";

  // Fetch subcategories
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

  // Fetch product types
  const fetchProductTypes = async (categoryId, subcategoryId) => {
    const key = `${categoryId}-${subcategoryId}`;
    if (productTypeData[key]) return;

    try {
      const res = await API.get(`product_type/ProductTypebyCategory/${categoryId}`);

      // Filter by subcategory
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

  // Handle category interaction
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
    fetchProductTypes(activeCategory, subcategoryId); // ✅ Pass both IDs
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
    }
  };

  return (
    <>
      {/* Top Bar */}
      <div className="top-bar">
        <div className="container-fluid">
          <div className="top-bar-content">
            <div className="top-bar-left">
              <FaMapMarkerAlt className="top-icon" />
              <span>Deliver to: <strong>{city || "India"}</strong></span>
            </div>
            <div className="top-bar-center">
              <span className="promo-text">✨ Free Shipping on Orders Above ₹999</span>
            </div>
            <div className="top-bar-right">
              <a href="/track-order" className="top-link">Track Order</a>
              <span className="divider">|</span>
              <a href="/help" className="top-link">Help</a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="premium-navbar">
        <div className="container-fluid">
          <div className="navbar-container">
            {/* Mobile Menu Toggle */}
            <button
              className="mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>

            {/* Brand Logo */}
            <div className="brand-logo" onClick={() => navigate(homeLink)}>
              <div className="logo-icon">GW</div>
              <div className="logo-text">
                <span className="logo-main">GoWear</span>
                <span className="logo-sub">Fashion Hub</span>
              </div>
            </div>

            {/* Desktop Categories */}
            <div className="desktop-categories">
              {categories.slice(0, 5).map((cat) => (
                <div
                  key={cat._id}
                  className="category-trigger"
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
            <form className="search-container" onSubmit={handleSearch}>
              <FaSearch className="search-icon-left" />
              <input
                type="text"
                placeholder="Search for products, brands and more..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input-modern"
              />
              <button type="submit" className="search-btn-modern">
                Search
              </button>
            </form>

            {/* Action Icons */}
            <div className="navbar-icons">
              {/* Wishlist */}
              <div className="icon-item" onClick={() => navigate("/likes")}>
                <FaHeart className="nav-icon" />
                <span className="icon-label">Wishlist</span>
                {likeCount > 0 && <span className="icon-count">{likeCount}</span>}
              </div>

              {/* Cart */}
              <div className="icon-item" onClick={() => navigate("/cart")}>
                <FaShoppingBag className="nav-icon" />
                <span className="icon-label">Bag</span>
                {cartCount > 0 && <span className="icon-count">{cartCount}</span>}
              </div>

              {/* Profile */}
              {!token ? (
                <button className="login-btn-modern" onClick={() => navigate("/login")}>
                  <FaUser size={16} />
                  <span>Login</span>
                </button>
              ) : (
                <div className="profile-container" ref={profileRef}>
                  <div
                    className="icon-item profile-trigger"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                  >
                    <FaUser className="nav-icon" />
                    <span className="icon-label">Profile</span>
                  </div>

                  {showProfileMenu && (
                    <div className="profile-menu-modern">
                      <div className="profile-menu-header">
                        <div className="profile-avatar">
                          <FaUser size={24} />
                        </div>
                        <div className="profile-info">
                          <span className="profile-name">My Account</span>
                          <span className="profile-email">Welcome back!</span>
                        </div>
                      </div>

                      <div className="profile-menu-body">
                        <button
                          className="profile-menu-item"
                          onClick={() => {
                            navigate("/profile");
                            setShowProfileMenu(false);
                          }}
                        >
                          <FaCog className="menu-item-icon" />
                          <span>Account Settings</span>
                          <FaChevronRight className="menu-item-arrow" />
                        </button>

                        <button
                          className="profile-menu-item"
                          onClick={() => {
                            navigate("/orders");
                            setShowProfileMenu(false);
                          }}
                        >
                          <FaBox className="menu-item-icon" />
                          <span>My Orders</span>
                          <FaChevronRight className="menu-item-arrow" />
                        </button>

                        <button
                          className="profile-menu-item"
                          onClick={() => {
                            navigate("/likes");
                            setShowProfileMenu(false);
                          }}
                        >
                          <FaHeart className="menu-item-icon" />
                          <span>My Wishlist</span>
                          <FaChevronRight className="menu-item-arrow" />
                        </button>

                        <div className="menu-divider"></div>

                        <button
                          className="profile-menu-item logout-btn"
                          onClick={logout}
                        >
                          <FaSignOutAlt className="menu-item-icon" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mega Menu */}
      {activeCategory && !isMobile && (
        <div
          className="mega-menu-overlay"
          onMouseEnter={() => hoverTimeoutRef.current && clearTimeout(hoverTimeoutRef.current)}
          onMouseLeave={handleCategoryLeave}
        >
          <div className="mega-menu-wrapper">
            <div className="container-fluid">
              <div className="mega-menu-grid">
                {/* Subcategories */}
                <div className="mega-col">
                  <h4 className="mega-col-title">Shop by Category</h4>
                  <div className="mega-items">
                    {subcategoryData[activeCategory] ? (
                      subcategoryData[activeCategory].length > 0 ? (
                        subcategoryData[activeCategory].map((sub) => (
                          <div
                            key={sub._id}
                            className={`mega-item ${hoveredSubcategory === sub._id ? 'hovered' : ''}`}
                            onMouseEnter={() => handleSubcategoryHover(sub._id)}
                            onClick={() => navigate(`/subcategory/${sub._id}`)}
                          >
                            <span>{sub.name}</span>
                            <FaChevronRight className="mega-arrow" />
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
                  <div className="mega-col">
                    <h4 className="mega-col-title">Popular Products</h4>
                    <div className="mega-items">
                      {/* ✅ Use combined key */}
                      {productTypeData[`${activeCategory}-${hoveredSubcategory}`] ? (
                        productTypeData[`${activeCategory}-${hoveredSubcategory}`].length > 0 ? (
                          productTypeData[`${activeCategory}-${hoveredSubcategory}`].map((pt) => (
                            <div
                              key={pt._id}
                              className="mega-item"
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
                      className="mega-featured-img"
                    />
                    <div className="mega-featured-content">
                      <h3>New Arrivals</h3>
                      <p>Explore the latest collection</p>
                      <button
                        className="mega-cta-btn"
                        onClick={() => navigate(`/category/${activeCategory}`)}
                      >
                        Shop Now
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay">
          <div className="mobile-menu-content">
            <div className="mobile-menu-header">
              <h3>Menu</h3>
              <button onClick={() => setMobileMenuOpen(false)}>
                <FaTimes size={24} />
              </button>
            </div>

            <div className="mobile-menu-body">
              {/* Search in mobile */}
              <form className="mobile-search" onSubmit={handleSearch}>
                <FaSearch />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </form>

              {/* Categories */}
              <div className="mobile-categories">
                {categories.map((cat) => (
                  <div key={cat._id} className="mobile-category-item">
                    <button
                      onClick={() => {
                        navigate(`/category/${cat._id}`);
                        setMobileMenuOpen(false);
                      }}
                    >
                      {cat.name}
                      <FaChevronRight />
                    </button>
                  </div>
                ))}
              </div>

              {/* Quick Links */}
              <div className="mobile-quick-links">
                <button onClick={() => { navigate("/orders"); setMobileMenuOpen(false); }}>
                  <FaBox /> My Orders
                </button>
                <button onClick={() => { navigate("/likes"); setMobileMenuOpen(false); }}>
                  <FaHeart /> Wishlist
                </button>
                <button onClick={() => { navigate("/profile"); setMobileMenuOpen(false); }}>
                  <FaCog /> Settings
                </button>
              </div>

              {token && (
                <button className="mobile-logout-btn" onClick={logout}>
                  <FaSignOutAlt /> Logout
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}