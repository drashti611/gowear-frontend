import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import "../../css/Customercss/ProductByCategoryScreen.css"; // reuse same CSS

export default function LikesScreen() {
  const navigate = useNavigate();
  const [likedProducts, setLikedProducts] = useState([]);
  const [toast, setToast] = useState("");

  // Load liked products from localStorage
  useEffect(() => {
    const storedLikes = JSON.parse(localStorage.getItem("likedProducts")) || [];
    setLikedProducts(storedLikes);
  }, []);

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existing = cart.find((item) => item._id === product._id);

    if (!existing) {
      cart.push({ ...product, selectedColor: product.variants?.[0]?.color || "", quantity: 1 });
      localStorage.setItem("cart", JSON.stringify(cart));
      setToast(`Added "${product.name}" to cart!`);
    } else {
      setToast(`"${product.name}" is already in cart!`);
    }

    // Notify Navbar
    window.dispatchEvent(new Event("storage"));
    setTimeout(() => setToast(""), 2000);
  };

  const handleUnlike = (e, product) => {
    e.stopPropagation();
    let liked = JSON.parse(localStorage.getItem("likedProducts")) || [];
    liked = liked.filter((p) => p._id !== product._id);
    localStorage.setItem("likedProducts", JSON.stringify(liked));
    setLikedProducts(liked);

    // Notify Navbar
    window.dispatchEvent(new Event("storage"));
    setToast(`Removed "${product.name}" from likes`);
    setTimeout(() => setToast(""), 2000);
  };

  if (!likedProducts || likedProducts.length === 0)
    return <p className="no-data">You have no liked products yet.</p>;

  return (
    <>
      <div className="product-grid">
        {likedProducts.map((product) => (
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
                className="icon like-icon liked"
                onClick={(e) => handleUnlike(e, product)}
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

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
