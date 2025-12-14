import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart, FaShoppingCart } from "react-icons/fa";
import API from "../../api/axios";
import "../../css/Customercss/ProductByCategoryScreen.css";

export default function ProductByCategoryScreen() {
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

  // ================= LOAD LIKES =================
  useEffect(() => {
    const likes = JSON.parse(localStorage.getItem("likedProducts")) || [];
    setLikedProducts(likes);
  }, []);

  // ================= FETCH PRODUCTS =================
  useEffect(() => {
    if (!categoryId && !subCategoryId) return;

    const fetchProducts = async () => {
      try {
        let res;
        if (subCategoryId) {
          res = await API.get(
            `/product/getProductsBySubCategory/${subCategoryId}`
          );
        } else {
          res = await API.get(
            `/product/getProductsByCategory/${categoryId}`
          );
        }
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
        .flatMap((p) =>
          p.variants?.flatMap((v) => v.sizes?.map((s) => s.size))
        )
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

  // ================= ACTIONS =================
  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (!cart.some((item) => item._id === product._id)) {
      cart.push({ ...product, quantity: 1 });
      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("storage"));
    }
  };

  const handleLike = (e, product) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    let liked = JSON.parse(localStorage.getItem("likedProducts")) || [];
    const exists = liked.some((p) => p._id === product._id);

    liked = exists
      ? liked.filter((p) => p._id !== product._id)
      : [...liked, product];

    localStorage.setItem("likedProducts", JSON.stringify(liked));
    setLikedProducts(liked);

    // Notify other components if needed
    window.dispatchEvent(new Event("storage"));
  };

  const isLiked = (id) => likedProducts.some((p) => p._id === id);

  // ================= UI =================
  if (loading)
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );

  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <div className="page-layout">
      {/* FILTER PANEL */}
      <div className="filter-panel">
        <h4>Filters</h4>

        <div className="filter-group">
          <label>Min Price</label>
          <input
            type="number"
            value={filters.minPrice}
            onChange={(e) =>
              setFilters({ ...filters, minPrice: e.target.value })
            }
          />
        </div>

        <div className="filter-group">
          <label>Max Price</label>
          <input
            type="number"
            value={filters.maxPrice}
            onChange={(e) =>
              setFilters({ ...filters, maxPrice: e.target.value })
            }
          />
        </div>

        <div className="filter-group">
          <label>Color</label>
          <select
            value={filters.color}
            onChange={(e) =>
              setFilters({ ...filters, color: e.target.value })
            }
          >
            <option value="">All</option>
            {colors.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Size</label>
          <select
            value={filters.size}
            onChange={(e) =>
              setFilters({ ...filters, size: e.target.value })
            }
          >
            <option value="">All</option>
            {sizes.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        <button
          className="clear-filter"
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
      </div>

      {/* PRODUCT GRID */}
      <div className="product-grid">
        {filteredProducts.map((product) => (
          <div
            key={product._id}
            className="product-card"
            onClick={() => navigate(`/productdetail/${product._id}`)}
          >
            <div className="product-image-wrapper">
              <img
                src={`http://localhost:5000/${product.images?.[0]}`}
                alt={product.name}
              />

              {/* LIKE BUTTON */}
              {isLiked(product._id) ? (
                <FaHeart
                  className={`icon like-icon liked ${
                    !isLoggedIn ? "disabled" : ""
                  }`}
                  onClick={(e) => handleLike(e, product)}
                />
              ) : (
                <FaRegHeart
                  className={`icon like-icon ${!isLoggedIn ? "disabled" : ""}`}
                  onClick={(e) => handleLike(e, product)}
                />
              )}
            </div>

            <div className="product-info">
              <div className="product-title">
                <h3>{product.name}</h3>
                <FaShoppingCart
                  className="icon cart-icon"
                  onClick={(e) => handleAddToCart(e, product)}
                />
              </div>
              <p className="product-brand-price">
                {product.brandId?.name} – ₹
                {product.variants?.[0]?.sizes?.[0]?.price}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
