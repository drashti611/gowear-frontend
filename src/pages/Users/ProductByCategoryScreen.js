import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import API from "../../api/axios";
import "../../css/Customercss/ProductByCategoryScreen.css";

export default function ProductByCategoryScreen() {
  const { categoryId, subCategoryId } = useParams(); // ✅ Handle both params
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedProducts, setLikedProducts] = useState([]);

  // Load liked products from localStorage
  useEffect(() => {
    const storedLikes = JSON.parse(localStorage.getItem("likedProducts")) || [];
    setLikedProducts(storedLikes);
  }, []);

  useEffect(() => {
    // ✅ Must have either categoryId or subCategoryId
    if (!categoryId && !subCategoryId) return;

    const fetchProducts = async () => {
      try {
        let res;
        
        // ✅ Fetch based on which parameter is present
        if (subCategoryId) {
          // If subCategoryId is present, fetch by subcategory
          res = await API.get(`/product/getProductsBySubCategory/${subCategoryId}`);
        } else if (categoryId) {
          // If only categoryId is present, fetch by category
          res = await API.get(`/product/getProductsByCategory/${categoryId}`);
        }
        
        setProducts(res.data || []);
      } catch (err) {
        console.error("Error fetching products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, subCategoryId]); // ✅ Watch both params

  if (loading)
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );

  if (!products || products.length === 0)
    return <p className="no-data">No products found for this {subCategoryId ? 'subcategory' : 'category'}.</p>;

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login to add products to cart.");
      navigate("/login");
      return;
    }

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existing = cart.find((item) => item._id === product._id);

    if (!existing) {
      cart.push({ ...product, selectedColor: product.variants?.[0]?.color || "", quantity: 1 });
      localStorage.setItem("cart", JSON.stringify(cart));
      alert(`Added "${product.name}" to cart!`);
    } else {
      alert(`"${product.name}" is already in your cart.`);
    }

    window.dispatchEvent(new Event("storage"));
  };

  const handleLike = (e, product) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login to like products.");
      navigate("/login");
      return;
    }

    let liked = JSON.parse(localStorage.getItem("likedProducts")) || [];
    const isLiked = liked.some((p) => p._id === product._id);

    if (!isLiked) {
      liked.push(product);
    } else {
      liked = liked.filter((p) => p._id !== product._id);
    }

    localStorage.setItem("likedProducts", JSON.stringify(liked));
    setLikedProducts(liked);
    window.dispatchEvent(new Event("storage"));
    // ✅ Don't navigate to /likes, just update the heart icon
  };

  const isProductLiked = (productId) => likedProducts.some((p) => p._id === productId);

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
              className={`icon like-icon ${isProductLiked(product._id) ? "liked" : ""}`}
              onClick={(e) => handleLike(e, product)}
            />
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
              {product.brandId?.name ? `${product.brandId.name} - ` : ""}
              ₹{product.variants?.[0]?.sizes?.[0]?.price || "N/A"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}