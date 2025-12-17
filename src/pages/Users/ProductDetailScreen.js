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
          setLiked(wishRes.data.some((p) => p._id === res.data._id));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    setSelectedSize("");
  }, [selectedColor]);

  const selectedVariant = product?.variants?.find(
    (v) => v.color === selectedColor
  );

  const selectedSizeObj = selectedVariant?.sizes?.find(
    (s) => s.size === selectedSize
  );

  // ✅ ADD TO CART WITH STOCK CHECK
  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");

    if (!token || !userId) {
      alert("Please login to add products to cart.");
      navigate("/login");
      return;
    }

    if (!selectedColor || !selectedSize) {
      setToast("⚠️ Please select color and size");
      return;
    }

    if (!selectedSizeObj || selectedSizeObj.stock <= 0) {
      setToast("❌ This product is out of stock");
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
        price: selectedSizeObj.price,
      });

      window.dispatchEvent(new Event("cartUpdated"));
      setToast("✅ Product added to cart");
    } catch (err) {
      console.error(err);
      setToast("❌ Failed to add product");
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
        await API.post("/wishlist/remove", {
          userId,
          productId: product._id,
        });
      } else {
        await API.post("/wishlist/add", {
          userId,
          productId: product._id,
        });
      }

      setLiked(!liked);
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

  return (
    <div className="detail-container">
      {/* LEFT */}
      <div className="detail-left">
        <div className="main-image-wrapper">
          <img
            src={`http://localhost:5000/${mainImage}`}
            alt={product.name}
          />
        </div>

        <div className="thumbnails">
          {product.images?.map((img, i) => (
            <img
              key={i}
              src={`http://localhost:5000/${img}`}
              alt=""
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
        <p>{product.description}</p>

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
              />
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
                  className={`size-box 
                    ${selectedSize === s.size ? "selected" : ""}
                    ${s.stock === 0 ? "out-of-stock" : ""}
                  `}
                  onClick={() => s.stock > 0 && setSelectedSize(s.size)}
                >
                  <span>{s.size}</span>
                  <span>₹{s.price}</span>

                  {s.stock === 0 && (
                    <span className="stock-error">Out of Stock</span>
                  )}

                  {s.stock > 0 && s.stock < 10 && (
                    <span className="stock-warning">
                      ⚠️ Few pieces left
                    </span>
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
          disabled={!selectedSize || selectedSizeObj?.stock <= 0}
        >
          <FaShoppingCart /> Add to Cart
        </button>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
