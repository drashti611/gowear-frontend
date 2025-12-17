import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart, FaFilter, FaTimes } from "react-icons/fa";
import API from "../../api/axios";
import "../../css/Customercss/ProductByCategoryScreen.css";

export default function ProductByCategoryScreen() {
  const [showFilter, setShowFilter] = useState(false);
  const userId = localStorage.getItem("userId");
  const { categoryId, subCategoryId } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedProducts, setLikedProducts] = useState([]);
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    color: "",
    size: "",
  });

  // ================= HELPER FUNCTIONS FOR STOCK =================
  const getProductStock = (product) => {
    if (!product.variants || product.variants.length === 0) return 0;
    
    let totalStock = 0;
    product.variants.forEach(variant => {
      if (variant.sizes && variant.sizes.length > 0) {
        variant.sizes.forEach(size => {
          totalStock += size.stock || 0;
        });
      }
    });
    
    return totalStock;
  };

  const isOutOfStock = (product) => {
    return getProductStock(product) === 0;
  };

  const isLowStock = (product) => {
    const stock = getProductStock(product);
    return stock > 0 && stock < 10;
  };

  // ================= LOAD WISHLIST FROM API =================
  useEffect(() => {
    if (!userId) return;

    const fetchWishlist = async () => {
      try {
        const res = await API.get(`/wishlist/${userId}`);
        setLikedProducts(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchWishlist();
  }, [userId]);

  const handleLike = async (e, product) => {
    e.stopPropagation();

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const alreadyLiked = likedProducts.some((p) => p._id === product._id);

    try {
      if (alreadyLiked) {
        await API.post("/wishlist/remove", {
          userId,
          productId: product._id,
        });
        setLikedProducts((prev) => prev.filter((p) => p._id !== product._id));
      } else {
        await API.post("/wishlist/add", {
          userId,
          productId: product._id,
        });
        setLikedProducts((prev) => [...prev, product]);
      }
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (err) {
      console.error(err);
    }
  };

  // ================= FETCH PRODUCTS =================
  useEffect(() => {
    if (!categoryId && !subCategoryId) return;

    const fetchProducts = async () => {
      try {
        const res = await API.get(
          `/product/getProductsByCategoryAndSubCategory/${categoryId}/${subCategoryId}`
        );
        window.dispatchEvent(new Event("wishlistUpdated"));
        setProducts(res.data || []);
      } catch (err) {
        console.error(err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, subCategoryId]);

  // ================= FILTER OPTIONS =================
  const colors = [
    ...new Set(
      products.flatMap((p) => p.variants?.map((v) => v.color)).filter(Boolean)
    ),
  ];

  const sizes = [
    ...new Set(
      products
        .flatMap((p) => p.variants?.flatMap((v) => v.sizes?.map((s) => s.size)))
        .filter(Boolean)
    ),
  ];

  // ================= APPLY FILTERS =================
  const filteredProducts = products.filter((product) => {
    const variants = product.variants || [];

    let colorMatch = true;
    let sizeMatch = true;
    let priceMatch = true;

    if (filters.color) {
      colorMatch = variants.some(
        (v) => v.color?.toLowerCase() === filters.color.toLowerCase()
      );
    }

    if (filters.size) {
      sizeMatch = variants.some((v) =>
        v.sizes?.some((s) => s.size === filters.size)
      );
    }

    if (filters.minPrice || filters.maxPrice) {
      priceMatch = variants.some((v) =>
        v.sizes?.some((s) => {
          if (filters.minPrice && s.price < +filters.minPrice) return false;
          if (filters.maxPrice && s.price > +filters.maxPrice) return false;
          return true;
        })
      );
    }

    return colorMatch && sizeMatch && priceMatch;
  });

  const isLiked = (id) => likedProducts.some((p) => p._id === id);
  const isLoggedIn = !!localStorage.getItem("token");

  const activeFiltersCount = [
    filters.minPrice,
    filters.maxPrice,
    filters.color,
    filters.size,
  ].filter(Boolean).length;

  // ================= UI =================
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="product-category-container">
      {/* Mobile Filter Toggle Button */}
      <button
        className="mobile-filter-btn"
        onClick={() => setShowFilter(!showFilter)}
      >
        <FaFilter style={{ fontSize: "16px" }} />
        <span className="filter-btn-text">Filters</span>
        {activeFiltersCount > 0 && (
          <span className="filter-badge">{activeFiltersCount}</span>
        )}
      </button>

      {/* Filter Overlay for Mobile */}
      {showFilter && (
        <div
          className="filter-overlay"
          onClick={() => setShowFilter(false)}
        />
      )}

      <div className="page-layout">
        {/* FILTER PANEL */}
        <div
          className={`filter-panel ${showFilter ? "filter-panel-open" : "filter-panel-closed"}`}
        >
          <div className="filter-header">
            <h4 className="filter-title">
              <FaFilter style={{ marginRight: "8px", fontSize: "18px" }} />
              Filters
            </h4>
            <button
              className="close-filter-btn"
              onClick={() => setShowFilter(false)}
            >
              <FaTimes />
            </button>
          </div>

          <div className="filter-content">
            {/* Price Range */}
            <div className="filter-section">
              <label className="filter-label">Price Range</label>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) =>
                    setFilters({ ...filters, minPrice: e.target.value })
                  }
                  className="price-input"
                />
                <span className="price-separator">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    setFilters({ ...filters, maxPrice: e.target.value })
                  }
                  className="price-input"
                />
              </div>
            </div>

            {/* Color Filter */}
            {colors.length > 0 && (
              <div className="filter-section">
                <label className="filter-label">Color</label>
                <div className="color-grid">
                  <div
                    onClick={() => setFilters({ ...filters, color: "" })}
                    className={`filter-chip color-option ${filters.color === "" ? "active" : ""}`}
                  >
                    All
                  </div>
                  {colors.map((c) => (
                    <div
                      key={c}
                      onClick={() => setFilters({ ...filters, color: c })}
                      className={`filter-chip color-option ${filters.color === c ? "active" : ""}`}
                    >
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Size Filter */}
            {sizes.length > 0 && (
              <div className="filter-section">
                <label className="filter-label">Size</label>
                <div className="size-grid">
                  <div
                    onClick={() => setFilters({ ...filters, size: "" })}
                    className={`filter-chip size-option ${filters.size === "" ? "active" : ""}`}
                  >
                    All
                  </div>
                  {sizes.map((s) => (
                    <div
                      key={s}
                      onClick={() => setFilters({ ...filters, size: s })}
                      className={`filter-chip size-option ${filters.size === s ? "active" : ""}`}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeFiltersCount > 0 && (
              <button
                className="clear-btn"
                onClick={() => {
                  setFilters({
                    minPrice: "",
                    maxPrice: "",
                    color: "",
                    size: "",
                  });
                  setShowFilter(false);
                }}
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>

        {/* PRODUCT GRID */}
        <div className="product-section">
          <div className="product-header">
            <h2 className="product-count">
              {filteredProducts.length} Product{filteredProducts.length !== 1 ? "s" : ""}
            </h2>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3 className="empty-title">No products found</h3>
              <p className="empty-text">Try adjusting your filters to see more results</p>
              {activeFiltersCount > 0 && (
                <button
                  className="empty-button"
                  onClick={() =>
                    setFilters({
                      minPrice: "",
                      maxPrice: "",
                      color: "",
                      size: "",
                    })
                  }
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="product-grid">
              {filteredProducts.map((product) => {
                const outOfStock = isOutOfStock(product);
                const lowStock = isLowStock(product);
                const stockCount = getProductStock(product);

                return (
                  <div
                    key={product._id}
                    className={`product-card ${outOfStock ? "out-of-stock" : ""}`}
                    onClick={() => !outOfStock && navigate(`/productdetail/${product._id}`)}
                  >
                    <div className="image-container">
                      <img
                        src={`http://localhost:5000/${product.images?.[0]}`}
                        alt={product.name}
                        className={`product-img ${outOfStock ? "grayscale" : ""}`}
                        onError={(e) => (e.target.style.display = "none")}
                      />

                      <div className="image-overlay" />

                      {/* Out of Stock Overlay */}
                      {outOfStock && (
                        <div className="out-of-stock-overlay">
                          <span className="out-of-stock-text">OUT OF STOCK</span>
                        </div>
                      )}

                      {/* Low Stock Badge */}
                      {!outOfStock && lowStock && (
                        <div className="low-stock-badge">
                          Only {stockCount} left!
                        </div>
                      )}

                      {/* Like Button */}
                      <button
                        onClick={(e) => handleLike(e, product)}
                        disabled={!isLoggedIn}
                        className={`like-btn ${isLiked(product._id) ? "liked" : ""} ${!isLoggedIn ? "disabled" : ""}`}
                      >
                        {isLiked(product._id) ? (
                          <FaHeart className="heart-icon" />
                        ) : (
                          <FaRegHeart className="heart-icon" />
                        )}
                      </button>

                      {/* Brand Badge */}
                      {product.brandId?.name && (
                        <div className="brand-badge">
                          {product.brandId.name}
                        </div>
                      )}
                    </div>

                    <div className="product-info">
                      <h3 className="product-name">{product.name}</h3>
                      <div className="product-footer">
                        <div>
                          <p className="price">
                            ₹{product.variants?.[0]?.sizes?.[0]?.price?.toLocaleString()}
                          </p>
                          {product.variants?.[0]?.color && (
                            <p className="color-info">
                              {product.variants[0].color}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Stock Status */}
                      {outOfStock ? (
                        <div className="stock-status out">
                          Out of Stock
                        </div>
                      ) : lowStock ? (
                        <div className="stock-status low">
                          Hurry! Only {stockCount} piece{stockCount !== 1 ? 's' : ''} left
                        </div>
                      ) : (
                        <div className="stock-status in">
                          In Stock
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}