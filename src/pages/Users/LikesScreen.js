import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import API from "../../api/axios";

export default function LikesScreen() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [likedProducts, setLikedProducts] = useState([]);
  const [toast, setToast] = useState("");
  const [removingId, setRemovingId] = useState(null);

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
     TOAST HELPER
  ============================== */
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  };

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

      showToast(`Added "${product.name}" to cart`);
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error(err);
      showToast("Failed to add to cart");
    }
  };

  /* =============================
     REMOVE FROM WISHLIST (API)
  ============================== */
  const handleUnlike = async (e, product) => {
    e.stopPropagation();
    setRemovingId(product._id);

    try {
      await API.post("/wishlist/remove", {
        userId,
        productId: product._id,
      });

      setTimeout(() => {
        setLikedProducts((prev) => prev.filter((p) => p._id !== product._id));
        setRemovingId(null);
        window.dispatchEvent(new Event("wishlistUpdated"));
        showToast(`Removed "${product.name}" from wishlist`);
      }, 300);
    } catch (err) {
      console.error(err);
      setRemovingId(null);
      showToast("Failed to remove");
    }
  };

  /* =============================
     EMPTY STATE
  ============================== */
  if (!likedProducts || likedProducts.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <div style={styles.emptyContent}>
          <div style={styles.emptyIconWrapper}>
            <FaHeart style={styles.emptyIcon} />
          </div>
          <h2 style={styles.emptyTitle}>Your Wishlist is Empty</h2>
          <p style={styles.emptyText}>Start adding products you love!</p>
          <button 
            style={styles.emptyButton}
            onClick={() => navigate('/products')}
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.maxWidth}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerTop}>
            <FaHeart style={styles.headerIcon} />
            <h1 style={styles.headerTitle}>My Wishlist</h1>
          </div>
          <p style={styles.headerSubtitle}>{likedProducts.length} items saved</p>
        </div>

        {/* Products Grid */}
        <div style={styles.grid}>
          {likedProducts.map((product) => (
            <div
              key={product._id}
              style={{
                ...styles.card,
                opacity: removingId === product._id ? 0 : 1,
                transform: removingId === product._id ? 'scale(0.95)' : 'scale(1)',
              }}
              onClick={() => navigate(`/productdetail/${product._id}`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                if (removingId !== product._id) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                }
              }}
            >
              <div style={styles.imageContainer}>
                <img
                  src={
                    product.images?.[0]
                      ? `http://localhost:5000/${product.images[0]}`
                      : ""
                  }
                  alt={product.name}
                  style={styles.image}
                  onError={(e) => (e.target.style.display = "none")}
                />
                
                <div style={styles.overlay} />
                
                <button
                  onClick={(e) => handleUnlike(e, product)}
                  style={styles.unlikeButton}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.backgroundColor = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.9)';
                  }}
                >
                  <FaHeart style={styles.unlikeIcon} />
                </button>

                <button
                  onClick={(e) => handleAddToCart(e, product)}
                  style={styles.hoverCartButton}
                  className="hover-cart-btn"
                >
                  <FaShoppingCart style={{ marginRight: '8px' }} />
                  Add to Cart
                </button>
              </div>

              <div style={styles.productInfo}>
                <h3 style={styles.productName}>{product.name}</h3>
                
                <div style={styles.productFooter}>
                  <div>
                    <p style={styles.price}>
                      ₹{product.variants?.[0]?.sizes?.[0]?.price?.toLocaleString() || "N/A"}
                    </p>
                    <p style={styles.color}>{product.variants?.[0]?.color}</p>
                  </div>
                  
                  <button
                    onClick={(e) => handleAddToCart(e, product)}
                    style={styles.cartButton}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(236,72,153,0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #fce7f3 0%, #ede9fe 100%)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <FaShoppingCart style={styles.cartIcon} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={styles.toast}>
          <div style={styles.toastDot} />
          <span style={styles.toastText}>{toast}</span>
        </div>
      )}

      <style>{`
        .hover-cart-btn {
          opacity: 0;
          transform: translateY(8px);
          transition: all 0.3s ease;
        }
        
        div[style*="cursor: pointer"]:hover .hover-cart-btn {
          opacity: 1;
          transform: translateY(0);
        }

        @keyframes slideInUp {
          from {
            transform: translate(-50%, 20px);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    // background: 'linear-gradient(135deg, #fce7f3 0%, #e0e7ff 50%, #dbeafe 100%)',
    padding: '16px',
  },
  maxWidth: {
    maxWidth: '1280px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '32px',
  },
  headerTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
  },
  headerIcon: {
    width: '32px',
    height: '32px',
    color: '#ec4899',
  },
  headerTitle: {
    fontSize: '36px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    margin: 0,
  },
  headerSubtitle: {
    color: '#6b7280',
    marginLeft: '44px',
    margin: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  imageContainer: {
    position: 'relative',
    paddingBottom: '100%',
    backgroundColor: '#f3f4f6',
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.5s ease',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
    pointerEvents: 'none',
  },
  unlikeButton: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    width: '40px',
    height: '40px',
    backgroundColor: 'rgba(255,255,255,0.9)',
    backdropFilter: 'blur(10px)',
    border: 'none',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    transition: 'all 0.3s ease',
    zIndex: 2,
  },
  unlikeIcon: {
    width: '20px',
    height: '20px',
    color: '#ec4899',
  },
  hoverCartButton: {
    position: 'absolute',
    bottom: '12px',
    left: '12px',
    right: '12px',
    background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(236,72,153,0.4)',
    zIndex: 1,
  },
  productInfo: {
    padding: '16px',
  },
  productName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '12px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    transition: 'color 0.3s ease',
  },
  productFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: '24px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    margin: 0,
  },
  color: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '4px',
    margin: 0,
  },
  cartButton: {
    width: '48px',
    height: '48px',
    background: 'linear-gradient(135deg, #fce7f3 0%, #ede9fe 100%)',
    border: 'none',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  cartIcon: {
    width: '20px',
    height: '20px',
    color: '#8b5cf6',
    transition: 'color 0.3s ease',
  },
  toast: {
    position: 'fixed',
    bottom: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#1f2937',
    color: '#fff',
    padding: '16px 24px',
    borderRadius: '9999px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backdropFilter: 'blur(10px)',
    zIndex: 50,
    animation: 'slideInUp 0.3s ease',
  },
  toastDot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#10b981',
    borderRadius: '50%',
    animation: 'pulse 2s infinite',
  },
  toastText: {
    fontWeight: '500',
  },
  emptyContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #fce7f3 0%, #e0e7ff 50%, #dbeafe 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
  },
  emptyContent: {
    textAlign: 'center',
  },
  emptyIconWrapper: {
    width: '96px',
    height: '96px',
    background: 'linear-gradient(135deg, #fce7f3 0%, #ede9fe 100%)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
  },
  emptyIcon: {
    width: '48px',
    height: '48px',
    color: '#ec4899',
  },
  emptyTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '8px',
  },
  emptyText: {
    color: '#6b7280',
    marginBottom: '24px',
  },
  emptyButton: {
    padding: '12px 32px',
    background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '9999px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(236,72,153,0.4)',
    transition: 'all 0.3s ease',
  },
};