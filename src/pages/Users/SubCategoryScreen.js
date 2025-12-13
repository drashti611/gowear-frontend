import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import "../../css/Customercss/SubCategoryScreen.css";

export default function SubCategoryScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subCategories, setSubCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch category details
  useEffect(() => {
    if (!id) return;
    
    const fetchCategoryDetails = async () => {
      try {
        const response = await API.get(`/category/${id}`);
        setCategoryName(response.data.name || "Categories");
      } catch (err) {
        console.error("Error fetching category:", err);
      }
    };
    
    fetchCategoryDetails();
  }, [id]);

  // Fetch subcategories
  useEffect(() => {
    if (!id) return;
    
    const fetchSubCategories = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await API.get(`/subcategory/viewSubCategoryByCategoryID/${id}`);
        setSubCategories(response.data || []);
      } catch (error) {
        console.error("Error fetching subcategories:", error);
        setError("Failed to load subcategories. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubCategories();
  }, [id]);

  // Fetch brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await API.get("/brand/viewBrand");
        setBrands(response.data || []);
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    };
    
    fetchBrands();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading subcategories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={() => window.location.reload()} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="subcategory-container">
      {/* Header */}
      <div className="subcategory-header">
        <h1 className="page-title">{categoryName}</h1>
        <p className="page-subtitle">
          Explore {subCategories.length} subcategories
        </p>
      </div>

      {/* Subcategories Grid */}
      {subCategories.length === 0 ? (
        <div className="no-data-wrapper">
          <p className="no-data">No subcategories found for this category.</p>
          <button onClick={() => navigate("/")} className="back-home-btn">
            Back to Home
          </button>
        </div>
      ) : (
        <div className="subcategory-grid">
          {subCategories.map((sub) => (
            <div
              key={sub._id}
              className="subcategory-card"
              onClick={() => navigate(`/products/${sub._id}`)}
            >
              {sub.images && sub.images.length > 0 ? (
                <img
                  src={`http://localhost:5000/${sub.images[0]}`}
                  alt={sub.name}
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/400x300?text=No+Image";
                  }}
                />
              ) : (
                <div className="no-image-placeholder">
                  <span>No Image</span>
                </div>
              )}
              <div className="overlay">
                <span className="subcategory-name">{sub.name}</span>
                <span className="explore-text">Explore →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Brands Section */}
      {brands.length > 0 && (
        <div className="brand-section">
          <h2 className="brand-title">Shop by Popular Brands</h2>
          <div className="brand-grid">
            {brands.map((brand) => (
              <div
                key={brand._id}
                className="brand-card"
                onClick={() => navigate(`/brand/${brand._id}`)}
              >
                {brand.images && brand.images.length > 0 ? (
                  <img
                    src={`http://localhost:5000/${brand.images[0]}`}
                    alt={brand.name}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/200x150?text=Brand";
                    }}
                  />
                ) : (
                  <div className="brand-placeholder">
                    <span>{brand.name.charAt(0)}</span>
                  </div>
                )}
                <p className="brand-name">{brand.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}