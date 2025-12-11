import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
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

  // For dropdown handling
  const [openCategoryId, setOpenCategoryId] = useState(null);
  const [openSubcategoryId, setOpenSubcategoryId] = useState(null);
  const subcategoryCache = useRef({}); // { [categoryId]: [subcategories] }
  const productTypeCache = useRef({}); // { [subcategoryId]: [productTypes] }
  const leaveTimerRef = useRef(null);

  // loading indicators
  const [loadingSubcats, setLoadingSubcats] = useState({});
  const [loadingProdTypes, setLoadingProdTypes] = useState({});

  // mobile detection
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 992 : false
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Detect city (unchanged)
  useEffect(() => {
    if (!navigator.geolocation)
      return setLocationError("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          setCity(data.address?.city || "Unknown location");
        } catch {
          setLocationError("Unable to detect city");
        }
      },
      (err) => setLocationError(err.message),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // Fetch top-level categories (and prefetch first 2 subcats)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get("/category/");
        const cats = res.data || [];
        setCategories(cats);

        // Prefetch subcategories for first 2 categories (optional small perf boost)
        cats.slice(0, 2).forEach((c) => {
          loadSubcategories(c._id);
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update cart & likes count (unchanged)
  useEffect(() => {
    const updateCart = () =>
      setCartCount(JSON.parse(localStorage.getItem("cart"))?.length || 0);
    const updateLikes = () =>
      setLikeCount(
        JSON.parse(localStorage.getItem("likedProducts"))?.length || 0
      );
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

  // Lazy-load subcategories for a category (uses your endpoint)
  const loadSubcategories = async (categoryId) => {
    if (subcategoryCache.current[categoryId]) return; // already cached
    try {
      setLoadingSubcats((s) => ({ ...s, [categoryId]: true }));
      const res = await API.get(
        `subCategory/viewSubCategoryByCategoryID/${categoryId}`
      );
      subcategoryCache.current[categoryId] = res.data || [];
    } catch (err) {
      console.error("Failed to load subcategories", err);
      subcategoryCache.current[categoryId] = [];
    } finally {
      setLoadingSubcats((s) => ({ ...s, [categoryId]: false }));
    }
  };

  // Lazy-load product types for a subcategory (uses your endpoint)
  const loadProductTypes = async (subcategoryId) => {
    if (productTypeCache.current[subcategoryId]) return;
    try {
      setLoadingProdTypes((s) => ({ ...s, [subcategoryId]: true }));
      const res = await API.get(
        `product_type/productTypeBysubcategory/${subcategoryId}`
      );
      productTypeCache.current[subcategoryId] = res.data || [];
    } catch (err) {
      console.error("Failed to load product types", err);
      productTypeCache.current[subcategoryId] = [];
    } finally {
      setLoadingProdTypes((s) => ({ ...s, [subcategoryId]: false }));
    }
  };

  // Hover handlers (desktop)
  const handleCategoryEnter = (catId) => {
    if (isMobile) return;
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    setOpenCategoryId(catId);
    setOpenSubcategoryId(null);
    loadSubcategories(catId);
  };
  const handleCategoryLeave = () => {
    if (isMobile) return;
    leaveTimerRef.current = setTimeout(() => {
      setOpenCategoryId(null);
      setOpenSubcategoryId(null);
    }, 150);
  };

  const handleSubcategoryEnter = (subId) => {
    if (isMobile) return;
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    setOpenSubcategoryId(subId);
    loadProductTypes(subId);
  };
  const handleSubcategoryLeave = () => {
    if (isMobile) return;
    leaveTimerRef.current = setTimeout(() => {
      setOpenSubcategoryId(null);
    }, 150);
  };

  // Mobile click handlers: toggle panel instead of navigate
  const handleCategoryClick = (e, cat) => {
    // on desktop, behave like normal navigate
    if (!isMobile) return navigate(`/category/${cat._id}`);
    e.preventDefault();
    // toggle this category
    if (openCategoryId === cat._id) {
      setOpenCategoryId(null);
      setOpenSubcategoryId(null);
    } else {
      setOpenCategoryId(cat._id);
      setOpenSubcategoryId(null);
      loadSubcategories(cat._id);
    }
  };

  const handleSubcategoryClick = (e, sub) => {
    if (!isMobile) return navigate(`/subcategory/${sub._id}`);
    e.preventDefault();
    // toggle subcategory column (to show product types)
    if (openSubcategoryId === sub._id) {
      setOpenSubcategoryId(null);
    } else {
      setOpenSubcategoryId(sub._id);
      loadProductTypes(sub._id);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg sticky-top navbar-light sleek-navbar">
      <div className="container-fluid">
        <span
          className="navbar-brand sleek-brand"
          onClick={() => navigate(homeLink)}
        >
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
              <li
                key={cat._id}
                className="nav-item mega-cat"
                onMouseEnter={() => handleCategoryEnter(cat._id)}
                onMouseLeave={() => handleCategoryLeave()}
              >
                <button
                  type="button"
                  className="nav-link cat-link"
                  onClick={(e) => handleCategoryClick(e, cat)}
                  aria-expanded={openCategoryId === cat._id}
                  aria-haspopup="true"
                >
                  {cat.name}
                </button>

                {/* Mega panel */}
                {openCategoryId === cat._id && (
                  <div
                    className="mega-panel"
                    onMouseEnter={() => {
                      if (leaveTimerRef.current)
                        clearTimeout(leaveTimerRef.current);
                    }}
                    onMouseLeave={() => {
                      leaveTimerRef.current = setTimeout(
                        () => setOpenCategoryId(null),
                        150
                      );
                    }}
                    role="menu"
                    aria-label={`${cat.name} menu`}
                  >
                    {/* left hero image / label */}
                    <div className="mega-hero">
                      {cat.heroImageUrl ? (
                        <img
                          src={cat.heroImageUrl}
                          alt={cat.name}
                          className="mega-hero-img"
                        />
                      ) : (
                        <div className="mega-hero-placeholder">{cat.name}</div>
                      )}
                    </div>

                    {/* columns container */}
                    <div className="mega-columns">
                      {/* prefer cached subcategories, fallback to whatever came in category obj */}
                      {(
                        subcategoryCache.current[cat._id] ??
                        cat.subcategories ??
                        []
                      ).length === 0 && loadingSubcats[cat._id] ? (
                        <div className="mega-loading">
                          Loading subcategories...
                        </div>
                      ) : (
                        (
                          subcategoryCache.current[cat._id] ??
                          cat.subcategories ??
                          []
                        ).map((sub) => (
                          <div
                            key={sub._id}
                            className={`mega-column ${
                              isMobile && openSubcategoryId === sub._id
                                ? "mobile-open"
                                : ""
                            }`}
                            onMouseEnter={() => handleSubcategoryEnter(sub._id)}
                            onMouseLeave={() => handleSubcategoryLeave()}
                          >
                            <button
                              type="button"
                              className="mega-col-heading"
                              onClick={(e) => handleSubcategoryClick(e, sub)}
                              aria-expanded={openSubcategoryId === sub._id}
                            >
                              {sub.name}
                            </button>

                            <ul className="mega-col-list">
                              {loadingProdTypes[sub._id] ? (
                                <li className="mega-loading">
                                  Loading product types...
                                </li>
                              ) : (
                                (
                                  productTypeCache.current[sub._id] ??
                                  sub.productTypes ??
                                  []
                                ).map((pt) => (
                                  <li
                                    key={pt._id}
                                    className="mega-col-item"
                                    onClick={() =>
                                      navigate(`/product-type/${pt._id}`)
                                    }
                                    role="menuitem"
                                  >
                                    {pt.name}
                                  </li>
                                ))
                              )}
                            </ul>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>

          <div className="d-flex align-items-center sleek-right">
            <span className="nav-location">
              {city || locationError || "Detecting location..."}
            </span>

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
              ❤️{" "}
              {likeCount > 0 && <span className="icon-badge">{likeCount}</span>}
            </span>

            <span className="icon" onClick={() => navigate("/cart")}>
              🛒{" "}
              {cartCount > 0 && <span className="icon-badge">{cartCount}</span>}
            </span>

            {!token ? (
              <button
                className="btn sleek-btn-login"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
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
                      <li
                        onClick={() => {
                          navigate("/profile");
                          setShowProfileMenu(false);
                        }}
                      >
                        Profile
                      </li>
                      <li
                        onClick={() => {
                          navigate("/orders");
                          setShowProfileMenu(false);
                        }}
                      >
                        My Orders
                      </li>
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
