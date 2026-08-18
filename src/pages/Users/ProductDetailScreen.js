import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaHeart,
  FaShoppingBag,
  FaTruck,
  FaShieldAlt,
  FaUndo,
  FaStar,
  FaBolt,
} from "react-icons/fa";
import API from "../../api/axios";
import getImageUrl from "../../utils/imageUrl";
import "../../css/Customercss/ProductDetailScreen.css";

export default function ProductDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [mainImage, setMainImage] = useState("");
  const [liked, setLiked] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        const res = await API.get(`/product/getProduct/${id}`);
        setProduct(res.data);
        setSelectedColor(res.data.variants?.[0]?.color || "");
        setMainImage(res.data.images?.[0] || "");

        if (userId) {
          const wishRes = await API.get(`/wishlist/${userId}`);
          setLiked(wishRes.data.some((p) => p._id === res.data._id));
        }
      } catch (err) {
        console.error("Failed to load product details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, userId]);

  useEffect(() => {
    setSelectedSize("");
  }, [selectedColor]);

  const selectedVariant = product?.variants?.find(
    (v) => v.color === selectedColor
  );

  const selectedSizeObj = selectedVariant?.sizes?.find(
    (s) => s.size === selectedSize
  );

  const currentPrice = selectedSizeObj?.price || product?.variants?.[0]?.sizes?.[0]?.price || 0;
  const discount = product?.discount || 0;
  const finalPrice = discount ? currentPrice - (currentPrice * discount) / 100 : currentPrice;

  const handleAddToCart = async (redirect = false) => {
    const token = localStorage.getItem("token");
    if (!token || !userId) {
      alert("Please login to add items to your cart.");
      navigate("/login");
      return;
    }

    if (!selectedColor || !selectedSize) {
      setToast("⚠️ Please select both a color and size.");
      setTimeout(() => setToast(""), 2500);
      return;
    }

    if (!selectedSizeObj || selectedSizeObj.stock <= 0) {
      setToast("❌ This selected size is out of stock.");
      setTimeout(() => setToast(""), 2500);
      return;
    }

    try {
      await API.post("/cart/add", {
        userId,
        productId: product._id,
        variant: {
          color: selectedColor,
          size: selectedSize,
        },
        quantity: 1,
        price: selectedSizeObj.price,
      });

      window.dispatchEvent(new Event("cartUpdated"));

      if (redirect) {
        navigate("/cart");
      } else {
        setToast("✅ Added to your shopping bag!");
        setTimeout(() => setToast(""), 2500);
      }
    } catch (err) {
      console.error(err);
      setToast("❌ Failed to add item to bag.");
      setTimeout(() => setToast(""), 2500);
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token || !userId) {
      navigate("/login");
      return;
    }

    try {
      if (liked) {
        await API.post("/wishlist/remove", { userId, productId: product._id });
      } else {
        await API.post("/wishlist/add", { userId, productId: product._id });
      }
      setLiked(!liked);
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading product...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-5">
        <h3>Product Not Found</h3>
        <button className="btn-luxury-primary mt-3" onClick={() => navigate("/")}>
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="detail-page-wrapper container">
      <div className="detail-layout">
        {/* Left Image Viewport & Thumbnails */}
        <div className="detail-gallery-side">
          <div className="main-image-viewport">
            <img src={getImageUrl(mainImage)} alt={product.name} />
            <button
              className={`gallery-floating-wishlist ${liked ? "liked" : ""}`}
              onClick={handleLike}
              title="Add to Wishlist"
            >
              <FaHeart />
            </button>
          </div>

          {product.images && product.images.length > 1 && (
            <div className="gallery-thumbnails-strip">
              {product.images.map((img, i) => (
                <div
                  key={i}
                  className={`thumb-item ${mainImage === img ? "active" : ""}`}
                  onClick={() => setMainImage(img)}
                >
                  <img src={getImageUrl(img)} alt={`Thumbnail ${i + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Info Section */}
        <div className="detail-info-side">
          {product.brandId?.name && (
            <div className="product-brand-badge">{product.brandId.name}</div>
          )}
          <h1 className="product-main-title">{product.name}</h1>

          <div className="product-rating-row">
            <span className="rating-badge">
              <FaStar /> 4.9
            </span>
            <span className="rating-count">124 verified customer reviews</span>
          </div>

          <div className="product-price-section">
            <span className="price-main">₹{finalPrice.toLocaleString()}</span>
            {discount > 0 && (
              <>
                <span className="price-strike">₹{currentPrice.toLocaleString()}</span>
                <span className="badge-pill-discount">SAVE {discount}%</span>
              </>
            )}
          </div>

          <p className="product-description-text">
            {product.description || "Crafted from ultra-premium breathable fabric designed to deliver all-day comfort, structural integrity, and modern streetwear luxury."}
          </p>

          {/* Color Selection */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-3">
              <div className="selector-heading">
                Color: <strong>{selectedColor || "Select"}</strong>
              </div>
              <div className="color-picker-row">
                {product.variants.map((v, i) => (
                  <div
                    key={i}
                    className={`color-option-ring ${selectedColor === v.color ? "active" : ""}`}
                    style={{ backgroundColor: v.color }}
                    onClick={() => setSelectedColor(v.color)}
                    title={v.color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {selectedVariant && (
            <div className="mb-4">
              <div className="selector-heading">
                Size: <strong>{selectedSize || "Select Size"}</strong>
              </div>
              <div className="size-picker-grid">
                {selectedVariant.sizes?.map((s, i) => {
                  const outOfStock = s.stock === 0;
                  const isSelected = selectedSize === s.size;
                  return (
                    <div
                      key={i}
                      className={`size-option-card ${isSelected ? "selected" : ""} ${
                        outOfStock ? "out-of-stock" : ""
                      }`}
                      onClick={() => !outOfStock && setSelectedSize(s.size)}
                    >
                      <span className="size-title">{s.size}</span>
                      <span className="size-price-tag">₹{s.price}</span>
                      {outOfStock ? (
                        <span style={{ fontSize: "9px", color: "var(--accent-rose)" }}>Sold Out</span>
                      ) : s.stock < 10 ? (
                        <span style={{ fontSize: "9px", color: "var(--accent-gold)" }}>{s.stock} left</span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="detail-actions-row">
            <button
              className="btn-luxury-primary detail-add-bag-btn"
              onClick={() => handleAddToCart(false)}
              disabled={!selectedSize || selectedSizeObj?.stock <= 0}
            >
              <FaShoppingBag /> Add to Bag
            </button>
            <button
              className="detail-buy-now-btn"
              onClick={() => handleAddToCart(true)}
              disabled={!selectedSize || selectedSizeObj?.stock <= 0}
            >
              <FaBolt className="me-1" /> Buy Now
            </button>
          </div>

          {/* Value Perks */}
          <div className="product-trust-strip">
            <div className="trust-item">
              <FaTruck /> Express Delivery
            </div>
            <div className="trust-item">
              <FaShieldAlt /> 100% Authentic
            </div>
            <div className="trust-item">
              <FaUndo /> 30-Day Returns
            </div>
          </div>
        </div>
      </div>

      {toast && <div className="detail-toast-alert">{toast}</div>}
    </div>
  );
}
