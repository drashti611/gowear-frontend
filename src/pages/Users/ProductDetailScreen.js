import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import API from "../../api/axios";
import "../../css/Customercss/ProductDetailScreen.css";

export default function ProductDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState("");
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

        const likedItems = JSON.parse(localStorage.getItem("likedProducts")) || [];
        setLiked(likedItems.some((p) => p._id === res.data._id));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to add products to cart.");
      navigate("/login");
      return;
    }

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existing = cart.find((item) => item._id === product._id);

    if (!existing) {
      cart.push({ ...product, selectedColor, quantity: 1 });
      localStorage.setItem("cart", JSON.stringify(cart));
      setToast(`Added "${product.name}" to cart!`);
    } else {
      setToast(`"${product.name}" is already in cart!`);
    }

    window.dispatchEvent(new Event("storage")); // update navbar
    setTimeout(() => setToast(""), 2000);
  };

  const handleLike = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to like products.");
      navigate("/login");
      return;
    }

    let likedItems = JSON.parse(localStorage.getItem("likedProducts")) || [];
    const isLiked = likedItems.some((p) => p._id === product._id);

    if (!isLiked) {
      likedItems.push(product);
      setLiked(true);
      localStorage.setItem("likedProducts", JSON.stringify(likedItems));
      window.dispatchEvent(new Event("storage"));
      navigate("/likes"); // go to likes screen
    } else {
      likedItems = likedItems.filter((p) => p._id !== product._id);
      setLiked(false);
      localStorage.setItem("likedProducts", JSON.stringify(likedItems));
      window.dispatchEvent(new Event("storage"));
    }
  };

  if (loading)
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );

  if (!product) return <p className="no-data">Product not found.</p>;

  const selectedVariant = product.variants?.find((v) => v.color === selectedColor);

  return (
    <div className="detail-container">
      <div className="detail-left">
        <div className="main-image-wrapper">
          {mainImage ? (
            <img src={`http://localhost:5000/${mainImage}`} alt={product.name} />
          ) : (
            <div className="no-image">No Image</div>
          )}
        </div>

        {product.images?.length > 1 && (
          <div className="thumbnails">
            {product.images.map((img, i) => (
              <img
                key={i}
                src={`http://localhost:5000/${img}`}
                alt={product.name}
                className={mainImage === img ? "selected" : ""}
                onClick={() => setMainImage(img)}
              />
            ))}
          </div>
        )}

        <button
          className={`like-btn-floating ${liked ? "liked" : ""}`}
          onClick={handleLike}
        >
          <FaHeart />
        </button>
      </div>

      <div className="detail-right">
        <h2>{product.name}</h2>
        <p className="product-description">{product.description || "No description available"}</p>
        <p><strong>Brand:</strong> {product.brandId?.name || "N/A"}</p>
        <p><strong>Category:</strong> {product.categoryId?.name || "N/A"}</p>

        {product.variants?.length > 0 && (
          <div className="colors-section">
            <strong>Colors:</strong>
            <div className="color-options">
              {product.variants.map((v, i) => (
                <div
                  key={i}
                  className={`color-circle ${selectedColor === v.color ? "selected" : ""}`}
                  style={{ backgroundColor: v.color }}
                  onClick={() => setSelectedColor(v.color)}
                ></div>
              ))}
            </div>
          </div>
        )}

        {selectedVariant && (
          <div className="sizes-section">
            <p><strong>{selectedVariant.color}</strong> — Sizes & Prices:</p>
            <ul>
              {selectedVariant.sizes.map((s, i) => (
                <li key={i}>
                  {s.size} — ₹{s.price}{" "}
                  {s.discount && <span className="discount">(-{s.discount}%)</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="action-buttons">
          <button className="add-to-cart-btn" onClick={handleAddToCart}>
            <FaShoppingCart /> Add to Cart
          </button>
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
