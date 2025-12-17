import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { FaArrowLeft, FaBox, FaChevronRight } from "react-icons/fa";

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
        setCategoryName(res.data.name);
      } catch (err) {
        console.error("Failed to fetch category:", err);
      }
    };
    fetchCategory();
  }, [id]);

  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        const res = await API.get(
          `/subcategory/viewSubCategoryByCategoryID/${id}`
        );
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
      <div className="subcategory-loading">
        <div className="loading-content">
          <div className="spinner"></div>
          <p>Loading subcategories...</p>
        </div>
        <style>{`
          .subcategory-loading {
            min-height: 80vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          }
          .loading-content {
            text-align: center;
          }
          .spinner {
            width: 60px;
            height: 60px;
            border: 4px solid #e0e0e0;
            border-top-color: #2196F3;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .loading-content p {
            color: #546e7a;
            font-size: 16px;
            font-weight: 500;
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <div className="subcategory-screen">
        {/* Breadcrumb & Header */}
        <div className="page-header">
          <div className="header-container">
            <button className="back-btn" onClick={() => navigate(-1)}>
              <FaArrowLeft />
              <span>Back</span>
            </button>

            <div className="breadcrumb">
              <span onClick={() => navigate("/")} className="breadcrumb-link">
                Home
              </span>
              <FaChevronRight className="breadcrumb-icon" />
              <span className="breadcrumb-current">{categoryName}</span>
            </div>

            <div className="header-title">
              <h1>{categoryName}</h1>
              <p className="subtitle">
                {subCategories.length} Collections Available
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="content-wrapper">
          {subCategories.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <FaBox size={64} />
              </div>
              <h3>No Subcategories Found</h3>
              <p>We're working on adding new items. Check back soon!</p>
              <button className="cta-button" onClick={() => navigate("/")}>
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="subcategory-grid">
              {subCategories.map((sub) => {
                // ✅ handle string OR object images
                const imagePath =
                  Array.isArray(sub.images) && sub.images.length > 0
                    ? typeof sub.images[0] === "string"
                      ? sub.images[0]
                      : sub.images[0].path || sub.images[0].url
                    : null;

                return (
                  <div
                    key={sub._id}
                    className="subcategory-card"
                    onClick={() => navigate(`/products/${id}/${sub._id}`)}
                  >
                    <div className="card-image-wrapper">
                      {imagePath ? (
                        <img
                          src={`http://localhost:5000/${imagePath}`}
                          alt={sub.name}
                          className="card-image"
                          onError={(e) => {
                            e.target.src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23f5f5f5'/%3E%3Ctext x='50%25' y='50%25' font-size='18' fill='%23999' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      ) : (
                        <div className="no-image">No Image</div>
                      )}

                      <div className="card-overlay">
                        <div className="overlay-content">
                          <FaChevronRight className="arrow-icon" />
                        </div>
                      </div>
                    </div>

                    <div className="card-content">
                      <h3 className="card-title">{sub.name}</h3>
                      <div className="card-action">
                        <span>Explore Collection</span>
                        <FaChevronRight className="action-arrow" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .subcategory-screen {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          padding-bottom: 60px;
        }

        /* Header Styles */
        .page-header {
          background: white;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 24px 32px;
        }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: transparent;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          color: #546e7a;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 16px;
        }

        .back-btn:hover {
          background: #f5f5f5;
          border-color: #2196F3;
          color: #2196F3;
          transform: translateX(-4px);
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
          font-size: 14px;
        }

        .breadcrumb-link {
          color: #2196F3;
          cursor: pointer;
          transition: color 0.3s;
        }

        .breadcrumb-link:hover {
          color: #1976D2;
          text-decoration: underline;
        }

        .breadcrumb-icon {
          color: #bdbdbd;
          font-size: 12px;
        }

        .breadcrumb-current {
          color: #37474f;
          font-weight: 600;
        }

        .header-title h1 {
          font-size: 42px;
          font-weight: 700;
          color: #263238;
          margin: 0 0 8px 0;
          letter-spacing: -0.5px;
        }

        .subtitle {
          font-size: 16px;
          color: #78909c;
          margin: 0;
        }

        /* Content */
        .content-wrapper {
          max-width: 1400px;
          margin: 40px auto 0;
          padding: 0 32px;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 80px 20px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }

        .empty-icon {
          color: #cfd8dc;
          margin-bottom: 24px;
        }

        .empty-state h3 {
          font-size: 28px;
          color: #37474f;
          margin-bottom: 12px;
        }

        .empty-state p {
          font-size: 16px;
          color: #78909c;
          margin-bottom: 32px;
        }

        .cta-button {
          padding: 14px 32px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
        }

        /* Grid */
        .subcategory-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 28px;
        }

        /* Card Styles */
        .subcategory-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .subcategory-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.15);
        }

        .card-image-wrapper {
          position: relative;
          padding-bottom: 100%;
          overflow: hidden;
          background: #f5f5f5;
        }

        .card-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .subcategory-card:hover .card-image {
          transform: scale(1.1);
        }

        .card-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%);
          opacity: 0;
          transition: opacity 0.4s;
        }

        .subcategory-card:hover .card-overlay {
          opacity: 1;
        }

        .overlay-content {
          position: absolute;
          bottom: 20px;
          right: 20px;
        }

        .arrow-icon {
          background: white;
          color: #2196F3;
          padding: 12px;
          border-radius: 50%;
          font-size: 20px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          transform: translateX(0);
          transition: transform 0.3s;
        }

        .subcategory-card:hover .arrow-icon {
          transform: translateX(4px);
        }

        .card-content {
          padding: 20px;
        }

        .card-title {
          font-size: 20px;
          font-weight: 600;
          color: #263238;
          margin: 0 0 12px 0;
          transition: color 0.3s;
          line-height: 1.4;
        }

        .subcategory-card:hover .card-title {
          color: #2196F3;
        }

        .card-action {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #78909c;
          font-size: 14px;
          font-weight: 500;
        }

        .action-arrow {
          transition: transform 0.3s;
        }

        .subcategory-card:hover .action-arrow {
          transform: translateX(4px);
          color: #2196F3;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .header-container {
            padding: 20px;
          }

          .header-title h1 {
            font-size: 32px;
          }

          .subcategory-grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 16px;
          }

          .content-wrapper {
            padding: 0 16px;
            margin-top: 24px;
          }
        }

        @media (max-width: 480px) {
          .header-title h1 {
            font-size: 28px;
          }

          .subcategory-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </>
  );
}
