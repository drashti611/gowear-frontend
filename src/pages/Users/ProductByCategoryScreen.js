import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import API from "../../api/axios";
import "../../css/Customercss/ProductByCategoryScreen.css";

export default function ProductByCategoryScreen() {
  const { subCategoryId } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!subCategoryId) return;

    const fetchProducts = async () => {
      try {
        const res = await API.get(`/product/getProductsBySubCategory/${subCategoryId}`);
        setProducts(res.data);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [subCategoryId]);

  if (loading)
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );

  if (!products || products.length === 0)
    return <p className="no-data">No products found for this subcategory.</p>;

  const handleAddToCart = (e, productId) => {
    e.stopPropagation();
    console.log("Add to cart:", productId);
    // Add your add-to-cart logic here
  };

  const handleLike = (e, productId) => {
    e.stopPropagation();
    console.log("Liked product:", productId);
    // Add your like logic here
  };

  return (
    <div className="product-grid">
      {products.map((product) => (
        <div
          key={product._id}
          className="product-card"
          onClick={() => navigate(`/productdetail/${product._id}`)}
        >
          <div className="product-image-wrapper">
            <img
              src={product.images?.[0] ? `http://localhost:5000/${product.images[0]}` : ""}
              alt={product.name}
              onError={(e) => (e.target.style.display = "none")}
            />
            <FaHeart
              className="icon like-icon"
              onClick={(e) => handleLike(e, product._id)}
            />
          </div>
          <div className="product-info">
            <div className="product-title">
              <h3>{product.name}</h3>
              <FaShoppingCart
                className="icon cart-icon"
                onClick={(e) => handleAddToCart(e, product._id)}
              />
            </div>
            <p className="product-brand-price">
              {product.brandId?.name ? `${product.brandId.name} - ` : ""}
              ₹{product.variants?.[0]?.sizes?.[0]?.price || "N/A"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
