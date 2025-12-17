import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import API from "../../api/axios";
import "../../css/Customercss/ProductByCategoryScreen.css";

export default function LikesScreen() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId"); // from login
  const [likedProducts, setLikedProducts] = useState([]);
  const [toast, setToast] = useState("");

  /* =============================
     FETCH WISHLIST FROM API
  ============================== */
  const fetchWishlist = async () => {
    try {
      const res = await API.get(`/wishlist/${userId}`);
      setLikedProducts(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (userId) fetchWishlist();
  }, [userId]);

  /* =============================
     ADD TO CART (API READY)
  ============================== */
  const handleAddToCart = async (e, product) => {
    e.stopPropagation();

    try {
      await API.post("/cart/add", {
        userId,
        productId: product._id,
        variant: {
          color: product.variants?.[0]?.color,
          size: product.variants?.[0]?.sizes?.[0]?.size,
        },
        quantity: 1,
        price: product.variants?.[0]?.sizes?.[0]?.price,
      });

      setToast(`Added "${product.name}" to cart`);
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error(err);
      setToast("Failed to add to cart");
    }

    setTimeout(() => setToast(""), 2000);
  };

  /* =============================
     REMOVE FROM WISHLIST (API)
  ============================== */
  const handleUnlike = async (e, product) => {
    e.stopPropagation();

    try {
      await API.post("/wishlist/remove", {
        userId,
        productId: product._id,
      });

      setLikedProducts((prev) => prev.filter((p) => p._id !== product._id));

      window.dispatchEvent(new Event("wishlistUpdated"));
      setToast(`Removed "${product.name}" from wishlist`);
    } catch (err) {
      console.error(err);
      setToast("Failed to remove");
    }

    setTimeout(() => setToast(""), 2000);
  };

  /* =============================
     EMPTY STATE
  ============================== */
  if (!likedProducts || likedProducts.length === 0) {
    return <p className="no-data">You have no liked products yet.</p>;
  }

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
                src={
                  product.images?.[0]
                    ? `http://localhost:5000/${product.images[0]}`
                    : ""
                }
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
