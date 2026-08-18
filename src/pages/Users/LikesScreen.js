import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaShoppingBag, FaArrowRight } from "react-icons/fa";
import API from "../../api/axios";
import getImageUrl from "../../utils/imageUrl";

export default function LikesScreen() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [likedProducts, setLikedProducts] = useState([]);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const res = await API.get(`/wishlist/${userId}`);
      setLikedProducts(res.data || []);
    } catch (err) {
      console.error("Failed to load wishlist:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchWishlist();
    else setLoading(false);
  }, [userId]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  };

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

      showToast(`Added "${product.name}" to your bag!`);
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error(err);
      showToast("Failed to add to bag.");
    }
  };

  const handleUnlike = async (e, product) => {
    e.stopPropagation();
    try {
      await API.post("/wishlist/remove", {
        userId,
        productId: product._id,
      });
      setLikedProducts((prev) => prev.filter((p) => p._id !== product._id));
      window.dispatchEvent(new Event("wishlistUpdated"));
      showToast(`Removed from wishlist.`);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading wishlist...</span>
        </div>
      </div>
    );
  }

  if (!likedProducts || likedProducts.length === 0) {
    return (
      <div className="container py-5">
        <div className="empty-cart-view">
          <FaHeart className="empty-cart-icon" style={{ color: "var(--accent-rose)" }} />
          <h2 style={{ fontSize: "28px", fontWeight: 800 }}>Your Wishlist is Empty</h2>
          <p className="text-muted" style={{ fontSize: "15px", marginBottom: "28px" }}>
            Explore our curated catalog and tap the heart icon on your favorite designer pieces.
          </p>
          <button className="btn-luxury-primary" onClick={() => navigate("/")}>
            Explore Styles <FaArrowRight />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ minHeight: "80vh" }}>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 style={{ fontSize: "28px", fontWeight: 800, margin: 0 }}>
            My Wishlist ({likedProducts.length})
          </h2>
          <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
            Your saved pieces and wardrobe aspirations
          </p>
        </div>
      </div>

      <div className="row g-4">
        {likedProducts.map((product) => {
          const image = product.images?.[0];
          const price = product.variants?.[0]?.sizes?.[0]?.price || 0;
          const discount = product.discount || 0;
          const finalPrice = discount ? price - (price * discount) / 100 : price;

          return (
            <div key={product._id} className="col-sm-6 col-md-4 col-lg-3">
              <div
                className="luxury-product-card h-100"
                onClick={() => navigate(`/productdetail/${product._id}`)}
              >
                <div className="product-image-container">
                  <img
                    src={getImageUrl(image)}
                    alt={product.name}
                    className="product-card-img"
                  />
                  <button
                    className="product-card-wishlist active"
                    onClick={(e) => handleUnlike(e, product)}
                    title="Remove from Wishlist"
                  >
                    <FaHeart />
                  </button>
                </div>

                <div className="product-card-body">
                  {product.brandId?.name && (
                    <div className="product-card-brand">{product.brandId.name}</div>
                  )}
                  <h4 className="product-card-title">{product.name}</h4>

                  <div className="product-card-price-row mb-3">
                    <span className="product-price-current">
                      ₹{finalPrice.toLocaleString()}
                    </span>
                    {discount > 0 && (
                      <span className="product-price-original">
                        ₹{price.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    className="btn-luxury-primary w-100 mt-auto"
                    style={{ padding: "10px", fontSize: "13px" }}
                    onClick={(e) => handleAddToCart(e, product)}
                  >
                    <FaShoppingBag /> Move to Bag
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {toast && <div className="detail-toast-alert">{toast}</div>}
    </div>
  );
}