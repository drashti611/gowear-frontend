import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart, FaFilter, FaBoxOpen } from "react-icons/fa";
import API from "../../api/axios";
import getImageUrl from "../../utils/imageUrl";
import "../../css/Customercss/ProductByCategoryScreen.css";

export default function ProductByCategoryScreen() {
  const userId = localStorage.getItem("userId");
  const { categoryId, subCategoryId } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedProducts, setLikedProducts] = useState([]);
  const [sortOption, setSortOption] = useState("default");
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    color: "",
    size: "",
  });

  const getProductStock = (product) => {
    if (!product.variants || product.variants.length === 0) return 0;
    let totalStock = 0;
    product.variants.forEach((variant) => {
      if (variant.sizes && variant.sizes.length > 0) {
        variant.sizes.forEach((size) => {
          totalStock += size.stock || 0;
        });
      }
    });
    return totalStock;
  };

  const isOutOfStock = (product) => getProductStock(product) === 0;
  const isLowStock = (product) => {
    const stock = getProductStock(product);
    return stock > 0 && stock < 10;
  };

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
        await API.post("/wishlist/remove", { userId, productId: product._id });
        setLikedProducts((prev) => prev.filter((p) => p._id !== product._id));
      } else {
        await API.post("/wishlist/add", { userId, productId: product._id });
        setLikedProducts((prev) => [...prev, product]);
      }
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!categoryId && !subCategoryId) return;

    const fetchProducts = async () => {
      try {
        const res = await API.get(
          `/product/category/${categoryId}/subcategory/${subCategoryId}`
        );
        setProducts(res.data || []);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, subCategoryId]);

  // Extract unique colors & sizes for filter options
  const availableColors = Array.from(
    new Set(
      products.flatMap((p) => p.variants?.map((v) => v.color).filter(Boolean) || [])
    )
  );

  const availableSizes = Array.from(
    new Set(
      products.flatMap((p) =>
        p.variants?.flatMap((v) => v.sizes?.map((s) => s.size).filter(Boolean) || []) || []
      )
    )
  );

  // Filter and sort products
  let filteredProducts = products.filter((p) => {
    const firstPrice = p.variants?.[0]?.sizes?.[0]?.price || 0;
    if (filters.minPrice && firstPrice < Number(filters.minPrice)) return false;
    if (filters.maxPrice && firstPrice > Number(filters.maxPrice)) return false;
    if (filters.color && !p.variants?.some((v) => v.color === filters.color)) return false;
    if (
      filters.size &&
      !p.variants?.some((v) => v.sizes?.some((s) => s.size === filters.size))
    )
      return false;
    return true;
  });

  if (sortOption === "priceLow") {
    filteredProducts.sort(
      (a, b) =>
        (a.variants?.[0]?.sizes?.[0]?.price || 0) -
        (b.variants?.[0]?.sizes?.[0]?.price || 0)
    );
  } else if (sortOption === "priceHigh") {
    filteredProducts.sort(
      (a, b) =>
        (b.variants?.[0]?.sizes?.[0]?.price || 0) -
        (a.variants?.[0]?.sizes?.[0]?.price || 0)
    );
  }

  const resetFilters = () => {
    setFilters({ minPrice: "", maxPrice: "", color: "", size: "" });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading products...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="product-category-container container">
      <div className="catalog-layout">
        {/* Sidebar Filters */}
        <aside className="filter-sidebar">
          <div className="filter-header">
            <h3>
              <FaFilter style={{ fontSize: "14px", color: "var(--primary)" }} /> Filter Apparel
            </h3>
            {(filters.minPrice || filters.maxPrice || filters.color || filters.size) && (
              <button className="clear-filters-btn" onClick={resetFilters}>
                Reset
              </button>
            )}
          </div>

          {/* Price Filter */}
          <div className="filter-group">
            <span className="filter-label">Price Range (₹)</span>
            <div className="price-inputs">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              />
            </div>
          </div>

          {/* Color Filter */}
          {availableColors.length > 0 && (
            <div className="filter-group">
              <span className="filter-label">Color Palette</span>
              <div className="color-filter-grid">
                {availableColors.map((color, i) => (
                  <div
                    key={i}
                    className={`color-filter-chip ${filters.color === color ? "selected" : ""}`}
                    style={{ backgroundColor: color }}
                    title={color}
                    onClick={() =>
                      setFilters({
                        ...filters,
                        color: filters.color === color ? "" : color,
                      })
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size Filter */}
          {availableSizes.length > 0 && (
            <div className="filter-group">
              <span className="filter-label">Select Size</span>
              <div className="size-filter-grid">
                {availableSizes.map((size, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`size-filter-chip ${filters.size === size ? "selected" : ""}`}
                    onClick={() =>
                      setFilters({
                        ...filters,
                        size: filters.size === size ? "" : size,
                      })
                    }
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Main Products Grid */}
        <main className="products-main-content">
          <div className="catalog-top-bar">
            <div className="catalog-results-count">
              Showing <strong>{filteredProducts.length}</strong> styles found
            </div>
            <select
              className="catalog-sort-select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="default">Featured / Newest</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
            </select>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-5 bg-white rounded shadow-sm border p-4">
              <FaBoxOpen size={48} className="text-muted mb-3" />
              <h4>No matching styles found</h4>
              <p className="text-muted">Try adjusting your filters or search terms.</p>
              <button className="btn-luxury-secondary mt-2" onClick={resetFilters}>
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="luxury-products-grid">
              {filteredProducts.map((product) => {
                const image = product.images?.[0];
                const price = product.variants?.[0]?.sizes?.[0]?.price || 0;
                const discount = product.discount || 0;
                const finalPrice = discount ? price - (price * discount) / 100 : price;
                const isLiked = likedProducts.some((p) => p._id === product._id);
                const outOfStock = isOutOfStock(product);
                const lowStock = isLowStock(product);

                return (
                  <div
                    key={product._id}
                    className="luxury-product-card"
                    onClick={() => navigate(`/productdetail/${product._id}`)}
                  >
                    <div className="product-image-container">
                      <img
                        src={getImageUrl(image)}
                        alt={product.name}
                        className="product-card-img"
                      />

                      <div className="product-card-badges">
                        {discount > 0 && (
                          <span className="badge-pill-discount">-{discount}% OFF</span>
                        )}
                      </div>

                      <button
                        className={`product-card-wishlist ${isLiked ? "active" : ""}`}
                        onClick={(e) => handleLike(e, product)}
                      >
                        {isLiked ? <FaHeart /> : <FaRegHeart />}
                      </button>
                    </div>

                    <div className="product-card-body">
                      {product.brandId?.name && (
                        <div className="product-card-brand">{product.brandId.name}</div>
                      )}
                      <h4 className="product-card-title">{product.name}</h4>

                      <div className="product-card-price-row">
                        <span className="product-price-current">
                          ₹{finalPrice.toLocaleString()}
                        </span>
                        {discount > 0 && (
                          <span className="product-price-original">
                            ₹{price.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <div className="product-card-footer">
                        {outOfStock ? (
                          <span className="product-stock-pill stock-out">Out of Stock</span>
                        ) : lowStock ? (
                          <span className="product-stock-pill stock-low">Few pieces left</span>
                        ) : (
                          <span className="product-stock-pill stock-in">In Stock</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}