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
        const res = await API.get(`/subcategory/viewSubCategoryByCategoryID/${id}`);
        // Add delay to show fade-in effect
        setTimeout(() => {
          setSubCategories(res.data || []);
          setLoading(false);
        }, 2000); // 2 seconds delay
      } catch (err) {
        console.error("Failed to fetch subcategories:", err);
        setLoading(false);
      }
    };
    fetchSubCategories();
  }, [id]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading subcategories...</p>
        <style>{`
          .loading-screen {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-family: 'Poppins', sans-serif;
            background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 50%, #fce7f3 100%);
          }
          .spinner {
            width: 50px;
            height: 50px;
            border: 5px solid rgba(0,0,0,0.1);
            border-top-color: #818cf8;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
          .loading-screen p {
            font-size: 16px;
            color: #334155;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="subcategory-screen">
      {/* Header */}
      <div className="header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>
        <div className="breadcrumb">
          <span className="breadcrumb-link" onClick={() => navigate("/")}>Home</span>
          <FaChevronRight className="breadcrumb-separator"/>
          <span className="breadcrumb-current">{categoryName}</span>
        </div>
        <h1 className="header-title">{categoryName}</h1>
        <p className="header-subtitle">{subCategories.length} Collections</p>
      </div>

      {/* Content */}
      <div className="content">
        {subCategories.length === 0 ? (
          <div className="empty-state">
            <FaBox size={64} />
            <h3>No Subcategories Found</h3>
            <p>Check back soon for new items!</p>
            <button className="cta-button" onClick={() => navigate("/")}>Continue Shopping</button>
          </div>
        ) : (
          <div className="grid">
            {subCategories.map((sub) => {
              const imagePath =
                Array.isArray(sub.images) && sub.images.length > 0
                  ? typeof sub.images[0] === "string"
                    ? sub.images[0]
                    : sub.images[0].path || sub.images[0].url
                  : null;

              return (
                <div key={sub._id} className="card" onClick={() => navigate(`/products/${id}/${sub._id}`)}>
                  <div className="image-wrapper">
                    {imagePath ? (
                      <img src={`http://localhost:5000/${imagePath}`} alt={sub.name} className="card-image" />
                    ) : (
                      <div className="no-image">No Image</div>
                    )}
                  </div>
                  <div className="card-body">
                    <h3 className="card-title">{sub.name}</h3>
                    <div className="card-action">
                      <span>Explore</span>
                      <FaChevronRight />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Styles */}
      <style>{`
        .subcategory-screen {
          font-family: 'Poppins', sans-serif;
          padding: 30px 20px;
          min-height: 100vh;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 50%, #fce7f3 100%);
        }

        .header {
          margin-bottom: 50px;
          text-align: left;
        }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 50px;
          border: none;
          background: rgba(255, 255, 255, 0.6);
          color: #1e293b;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          margin-bottom: 12px;
        }
        .back-btn:hover {
          transform: translateX(-4px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.2);
          background: rgba(255,255,255,0.75);
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: #475569;
          margin-bottom: 8px;
        }
        .breadcrumb-link {
          cursor: pointer;
          font-weight: 500;
          color: #6366f1;
        }
        .breadcrumb-separator {
          font-size: 12px;
          color: #94a3b8;
        }
        .breadcrumb-current {
          font-weight: 600;
          color: #1e293b;
        }

        .header-title {
          font-size: 36px;
          margin: 6px 0;
          color: #334155;
        }
        .header-subtitle {
          font-size: 16px;
          color: #475569;
          margin-bottom: 20px;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 28px;
          opacity: 0;
          animation: fadeIn 1s forwards;
          animation-delay: 0.2s;
        }

        @keyframes fadeIn {
          to { opacity: 1; }
        }

        .card {
          border-radius: 20px;
          overflow: hidden;
          cursor: pointer;
          background: rgba(255,255,255,0.6);
          backdrop-filter: blur(12px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        }
        .card:hover {
          transform: translateY(-6px) scale(1.03);
          box-shadow: 0 15px 40px rgba(0,0,0,0.15);
        }

        .image-wrapper {
          width: 100%;
          padding-bottom: 100%;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #e0e7ff, #fce7f3);
        }
        .card-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .card:hover .card-image {
          transform: scale(1.08);
        }

        .card-body {
          padding: 16px;
          text-align: center;
        }
        .card-title {
          font-size: 18px;
          margin-bottom: 8px;
          color: #1e293b;
          font-weight: 600;
        }
        .card-action {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 6px;
          color: #6366f1;
          font-weight: 500;
        }
        .card-action span:hover {
          text-decoration: underline;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          border-radius: 20px;
          background: rgba(255,255,255,0.6);
          backdrop-filter: blur(12px);
          color: #334155;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .cta-button {
          margin-top: 20px;
          padding: 12px 30px;
          border-radius: 50px;
          border: none;
          background: linear-gradient(135deg, #a5b4fc, #818cf8);
          color: #fff;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .cta-button:hover {
          background: linear-gradient(135deg, #818cf8, #6366f1);
        }

        @media (max-width: 768px) {
          .grid {
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          }
        }

        @media (max-width: 480px) {
          .header-title {
            font-size: 28px;
          }
          .grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
        }
      `}</style>
    </div>
  );
}
