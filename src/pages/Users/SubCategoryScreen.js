import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import getImageUrl from "../../utils/imageUrl";
import { FaArrowLeft, FaBox, FaChevronRight, FaCompass } from "react-icons/fa";
import "../../css/Customercss/SubCategoryScreen.css";

export default function SubCategoryScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subCategories, setSubCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await API.get(`/category/${id}`);
        setCategoryName(res.data?.name || "Collection");
      } catch (err) {
        console.error("Failed to fetch category:", err);
      }
    };
    fetchCategory();
  }, [id]);

  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        const res = await API.get(`/subcategory/viewSubCategoryByCategoryID/${id}`);
        setSubCategories(res.data || []);
      } catch (err) {
        console.error("Failed to fetch subcategories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubCategories();
  }, [id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading collections...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="subcat-screen-wrapper container">
      {/* Header Banner */}
      <div className="subcat-header-card">
        <div className="subcat-nav-row">
          <button className="subcat-back-btn" onClick={() => navigate(-1)}>
            <FaArrowLeft /> Back
          </button>
          <div className="subcat-breadcrumb">
            <span className="subcat-breadcrumb-link" onClick={() => navigate("/")}>Home</span>
            <FaChevronRight style={{ fontSize: "10px" }} />
            <span>{categoryName}</span>
          </div>
        </div>
        <h1 className="subcat-title">{categoryName}</h1>
        <p className="subcat-subtitle">
          Explore {subCategories.length} designer categories curated in this department
        </p>
      </div>

      {/* Collections Grid */}
      {subCategories.length === 0 ? (
        <div className="subcat-empty-state">
          <FaBox className="subcat-empty-icon" />
          <h3>No Subcategories Found</h3>
          <p className="text-muted">Check back soon for new additions to this collection!</p>
          <button className="btn-luxury-primary mt-3" onClick={() => navigate("/")}>
            <FaCompass /> Discover Other Styles
          </button>
        </div>
      ) : (
        <div className="subcat-grid">
          {subCategories.map((sub) => {
            const imagePath =
              Array.isArray(sub.images) && sub.images.length > 0
                ? typeof sub.images[0] === "string"
                  ? sub.images[0]
                  : sub.images[0].path || sub.images[0].url
                : null;

            return (
              <div
                key={sub._id}
                className="subcat-card"
                onClick={() => navigate(`/products/${id}/${sub._id}`)}
              >
                <div className="subcat-image-wrapper">
                  {imagePath ? (
                    <img src={getImageUrl(imagePath)} alt={sub.name} className="subcat-image" />
                  ) : (
                    <div className="no-image">No Image</div>
                  )}
                </div>
                <div className="subcat-card-body">
                  <h3 className="subcat-card-name">{sub.name}</h3>
                  <div className="subcat-card-action">
                    <FaChevronRight />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
