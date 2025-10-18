import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../api/axios";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import "../../css/Customercss/ProductDetailScreen.css";

export default function ProductDetailScreen() {
  const { id } = useParams();
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
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleLike = () => setLiked((prev) => !prev);

  const handleAddToCart = () => {
    setToast(`Added "${product.name}" to cart!`);
    setTimeout(() => setToast(""), 2000);
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
