import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import "../../css/Customercss/SubCategoryScreen.css";

export default function SubCategoryScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subCategories, setSubCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return; // prevent undefined fetch
    const fetchSubCategories = async () => {
      try {
        const response = await API.get(`/subcategory/viewSubCategoryByCategoryID/${id}`);
        setSubCategories(response.data);
      } catch (error) {
        console.error("Error fetching subcategories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubCategories();
  }, [id]);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await API.get("/brand/viewBrand");
        setBrands(response.data);
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    };
    fetchBrands();
  }, []);

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  return (
    <div className="subcategory-container">
      {/* Subcategories */}
      {subCategories.length === 0 ? (
        <p className="no-data">No subcategories found for this category.</p>
      ) : (
        <div className="subcategory-grid">
          {subCategories.map((sub) => (
            <div
              key={sub._id}
              className="subcategory-card"
              onClick={() => navigate(`/products/${sub._id}`)}
            >
              <img
                src={`http://localhost:5000/${sub.images[0]}`}
                alt={sub.name}
                onError={(e) => (e.target.style.display = "none")}
              />
              <div className="overlay">{sub.name}</div>
            </div>
          ))}
        </div>
      )}

      {/* Brands */}
      {brands.length > 0 && (
        <div className="brand-section">
          <h2 className="brand-title">Popular Brands</h2>
          <div className="brand-grid">
            {brands.map((brand) => (
              <div key={brand._id} className="brand-card">
                <img
                  src={`http://localhost:5000/${brand.images[0]}`}
                  alt={brand.name}
                  onError={(e) => (e.target.style.display = "none")}
                />
                <p className="brand-name">{brand.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
