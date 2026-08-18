import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaShippingFast,
  FaShieldAlt,
  FaUndo,
  FaHeadset,
  FaStar,
} from "react-icons/fa";
import API from "../../api/axios";
import getImageUrl from "../../utils/imageUrl";
import "../../css/Customercss/Home.css";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get("/category");
        setCategories(res.data || []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleShopNow = (id) => {
    navigate(`/category/${id}`);
  };

  return (
    <div className="home-container container my-4">
      {/* Editorial Luxury Hero Banner */}
      <div className="hero-banner">
        <div className="hero-content">
          <div className="hero-badge">
            <FaStar /> Spring / Summer 2026 Collection
          </div>
          <h1 className="hero-title">
            Elevate Your Everyday <br />
            <span style={{ color: "#818cf8" }}>Luxury Apparel.</span>
          </h1>
          <p className="hero-subtitle">
            Immerse yourself in precision craftsmanship, trendsetting silhouettes, and uncompromising quality curated for the modern wardrobe.
          </p>

          <div className="hero-actions">
            <button
              className="btn-luxury-primary"
              onClick={() => {
                if (categories.length > 0) handleShopNow(categories[0]._id);
                else navigate("/search");
              }}
            >
              Explore Collections <FaArrowRight />
            </button>
            <button
              className="btn-luxury-secondary"
              style={{ background: "rgba(255, 255, 255, 0.15)", color: "#ffffff", borderColor: "rgba(255, 255, 255, 0.3)" }}
              onClick={() => navigate("/search")}
            >
              Search Styles
            </button>
          </div>

          <div className="hero-stats-pill">
            <span>
              <FaStar color="#f59e0b" className="me-1" /> <strong>4.9/5</strong> Customer Rating
            </span>
            <span>•</span>
            <span><strong>50,000+</strong> Orders Delivered</span>
            <span>•</span>
            <span><strong>100%</strong> Authentic</span>
          </div>
        </div>
      </div>

      {/* Value Perks Grid */}
      <div className="perks-grid">
        <div className="perk-card">
          <div className="perk-icon-wrapper">
            <FaShippingFast />
          </div>
          <div className="perk-info">
            <h4>Express Delivery</h4>
            <p>Free delivery on orders ₹999+</p>
          </div>
        </div>

        <div className="perk-card">
          <div className="perk-icon-wrapper">
            <FaShieldAlt />
          </div>
          <div className="perk-info">
            <h4>Authentic Quality</h4>
            <p>100% verified genuine apparel</p>
          </div>
        </div>

        <div className="perk-card">
          <div className="perk-icon-wrapper">
            <FaUndo />
          </div>
          <div className="perk-info">
            <h4>Easy 30-Day Returns</h4>
            <p>Hassle-free instant exchanges</p>
          </div>
        </div>

        <div className="perk-card">
          <div className="perk-icon-wrapper">
            <FaHeadset />
          </div>
          <div className="perk-info">
            <h4>24/7 VIP Concierge</h4>
            <p>Dedicated customer assistance</p>
          </div>
        </div>
      </div>

      {/* Curated Categories Section */}
      <div className="section-header">
        <span className="section-tag">Featured Departments</span>
        <h2 className="section-title">Curated Fashion Categories</h2>
        <p className="section-subtitle">
          Explore handcrafted styles, modern staples, and seasonal highlights designed to turn heads.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {categories.map((cat) => (
            <div key={cat._id} className="col-md-6 col-lg-4">
              <div className="category-card" onClick={() => handleShopNow(cat._id)} style={{ cursor: "pointer" }}>
                <div className="category-image-side">
                  {cat.images && cat.images.length > 0 ? (
                    <img
                      src={getImageUrl(cat.images[0])}
                      alt={cat.name}
                      className="category-image"
                    />
                  ) : (
                    <div className="no-image">
                      <span>No Image Available</span>
                    </div>
                  )}
                </div>

                <div className="category-details-side">
                  <h3 className="category-name">{cat.name}</h3>
                  <p className="category-description">
                    Discover hand-selected designs in <strong>{cat.name}</strong>. Premium fabrics and tailored cuts.
                  </p>
                  <button
                    className="btn-luxury-primary align-self-start"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShopNow(cat._id);
                    }}
                  >
                    Shop {cat.name} <FaArrowRight />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIP Promo Banner */}
      <div className="promo-strip">
        <div>
          <h3>Join the GoWear VIP Circle</h3>
          <p>Get exclusive early access to limited edition drops, secret sales, and 20% off your premier order.</p>
        </div>
        <div className="promo-code-pill">
          CODE: <strong>GOWEAR20</strong>
        </div>
      </div>
    </div>
  );
}
