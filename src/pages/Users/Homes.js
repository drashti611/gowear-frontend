import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ import useNavigate
import API from "../../api/axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../css/Customercss/Home.css";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate(); // ✅ initialize navigate

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get("/category");
        setCategories(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  const handleShopNow = (id) => {
    navigate(`/category/${id}`); 
  };

  return (
    <div className="home-container container my-5">
      <h1 className="home-title text-center mb-2">Welcome to GoWear 🛍</h1>
      <p className="home-subtitle text-center mb-5">
        Explore trending fashion categories and shop your favorite styles.
      </p>

      <div className="row g-4">
        {categories.map((cat) => (
          <div key={cat._id} className="col-md-12 col-lg-6">
            <div className="category-card shadow-lg rounded overflow-hidden wow animate__animated animate__fadeInUp">
              
              <div className="category-image-side">
                {cat.images && cat.images.length > 0 ? (
                  <img
                    src={`http://localhost:5000/${cat.images[0]}`}
                    alt={cat.name}
                    className="category-image img-fluid"
                  />
                ) : (
                  <div className="no-image d-flex align-items-center justify-content-center">
                    No Image
                  </div>
                )}
              </div>

              <div className="category-details-side p-4 d-flex flex-column justify-content-center">
                <h2 className="category-name mb-3">{cat.name}</h2>
                <p className="category-description">
                  Discover the best products in <strong>{cat.name}</strong> category. Find your perfect style, enjoy exclusive deals, and shop now!
                </p>
                {/* ✅ Add onClick to navigate */}
                <button
                  className="btn btn-gradient mt-3 align-self-start"
                  onClick={() => handleShopNow(cat._id)}
                >
                  Shop Now
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
