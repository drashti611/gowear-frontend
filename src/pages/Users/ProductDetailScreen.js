import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import API from "../../api/axios";
import "../../css/Customercss/ProductDetailScreen.css";

export default function ProductDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  const [mainImage, setMainImage] = useState("");
  const [liked, setLiked] = useState(false);
  const [toast, setToast] = useState("");

  const [likedProducts, setLikedProducts] = useState([]);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        const res = await API.get(`/product/getProduct/${id}`);
        setProduct(res.data);
        setSelectedColor(res.data.variants?.[0]?.color || "");
        setMainImage(res.data.images?.[0] || "");

        if (userId) {
          const wishRes = await API.get(`/wishlist/${userId}`);
          const isLiked = wishRes.data.some((p) => p._id === res.data._id);
          setLiked(isLiked);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Reset size when color changes
  useEffect(() => {
    setSelectedSize("");
  }, [selectedColor]);

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      alert("Please login to add products to cart.");
      navigate("/login");
      return;
    }

    if (!selectedSize || !selectedColor) {
      setToast("⚠️ Please select color and size.");
      setTimeout(() => setToast(""), 2000);
      return;
    }

    // find selected variant price
    const variant = product.variants.find((v) => v.color === selectedColor);

    const sizeObj = variant?.sizes.find((s) => s.size === selectedSize);

    if (!sizeObj) {
      setToast("Invalid size selection");
      return;
    }

    try {
      await API.post("/cart/add", {
        userId,
        productId: product._id,
        variant: {
          color: selectedColor,
          size: selectedSize,
        },
        quantity: 1,
        price: sizeObj.price,
      });

      // 🔔 notify navbar/cart badge
      window.dispatchEvent(new Event("cartUpdated"));

      setToast(`Added "${product.name}" (${selectedSize}) to cart`);
    } catch (err) {
      console.error(err);
      setToast("Failed to add product to cart");
    }

    setTimeout(() => setToast(""), 2000);
  };

  const handleLike = async (e) => {
    e.stopPropagation();

    const token = localStorage.getItem("token");
    if (!token || !userId) {
      navigate("/login");
      return;
    }

    try {
      if (liked) {
        // REMOVE
        await API.post("/wishlist/remove", {
          userId,
          productId: product._id,
        });
        setLiked(false);
      } else {
        // ADD
        await API.post("/wishlist/add", {
          userId,
          productId: product._id,
        });
        setLiked(true);
      }

      // 🔔 UPDATE NAVBAR COUNT
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );

  if (!product) return <p className="no-data">Product not found.</p>;

  const selectedVariant = product.variants?.find(
    (v) => v.color === selectedColor
  );

  return (
    <div className="detail-container">
      {/* LEFT */}
      <div className="detail-left">
        <div className="main-image-wrapper">
          {mainImage ? (
            <img
              src={`http://localhost:5000/${mainImage}`}
              alt={product.name}
            />
          ) : (
            <div className="no-image">No Image</div>
          )}
        </div>

        <div className="thumbnails">
          {product.images?.map((img, i) => (
            <img
              key={i}
              src={`http://localhost:5000/${img}`}
              alt={product.name}
              className={mainImage === img ? "selected" : ""}
              onClick={() => setMainImage(img)}
            />
          ))}
        </div>

        <button
          className={`like-btn-floating ${liked ? "liked" : ""}`}
          onClick={handleLike}
        >
          <FaHeart />
        </button>
      </div>

      {/* RIGHT */}
      <div className="detail-right">
        <h2>{product.name}</h2>
        <p className="product-description">
          {product.description || "No description available"}
        </p>

        <p>
          <strong>Brand:</strong> {product.brandId?.name || "N/A"}
        </p>
        <p>
          <strong>Category:</strong> {product.categoryId?.name || "N/A"}
        </p>

        {/* COLORS */}
        <div className="colors-section">
          <strong>Colors:</strong>
          <div className="color-options">
            {product.variants?.map((v, i) => (
              <div
                key={i}
                className={`color-circle ${
                  selectedColor === v.color ? "selected" : ""
                }`}
                style={{ backgroundColor: v.color }}
                onClick={() => setSelectedColor(v.color)}
              ></div>
            ))}
          </div>
        </div>

        {/* SIZES */}
        {selectedVariant && (
          <div className="sizes-section">
            <strong>Select Size:</strong>
            <div className="size-options">
              {selectedVariant.sizes.map((s, i) => (
                <div
                  key={i}
                  className={`size-box ${
                    selectedSize === s.size ? "selected" : ""
                  }`}
                  onClick={() => setSelectedSize(s.size)}
                >
                  <span className="size-label">{s.size}</span>
                  <span className="size-price">₹{s.price}</span>
                  {s.discount && (
                    <span className="discount">-{s.discount}%</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACTION */}
        <button
          className="add-to-cart-btn"
          onClick={handleAddToCart}
          disabled={!selectedSize}
        >
          <FaShoppingCart /> Add to Cart
        </button>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
