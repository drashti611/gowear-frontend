import React, { useEffect, useState } from "react";
import {
  FaTrash,
  FaShoppingBag,
  FaShieldAlt,
  FaArrowRight,
  FaTicketAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import getImageUrl from "../../utils/imageUrl";
import "../../css/Customercss/CartScreen.css";

export default function CartScreen() {
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [sizeOptions, setSizeOptions] = useState({});
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [appliedCoupons, setAppliedCoupons] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [stockWarnings, setStockWarnings] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const res = await API.get(`/cart/get/${userId}`);
      setCart(res.data?.items || []);
      checkStockAvailability(res.data?.items || []);
    } catch (err) {
      console.error("Failed to load cart", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    API.get("/coupon")
      .then((res) => setCoupons((res.data || []).filter((c) => c.isActive)))
      .catch((err) => console.error(err));
  }, []);

  const checkStockAvailability = async (cartItems) => {
    const warnings = {};
    for (const item of cartItems) {
      if (!item.productId?._id) continue;
      try {
        const res = await API.get(
          `/cart/${item.productId._id}/sizes/${encodeURIComponent(
            item.variant.color
          )}`
        );
        const currentSize = res.data.find((s) => s.size === item.variant.size);
        const availableStock = currentSize?.stock || 0;

        if (availableStock === 0) {
          warnings[item._id] = { type: "out-of-stock", message: "Out of stock" };
        } else if (item.quantity > availableStock) {
          warnings[item._id] = {
            type: "exceeds-stock",
            message: `Only ${availableStock} left`,
          };
        } else if (availableStock < 10) {
          warnings[item._id] = {
            type: "low-stock",
            message: `Only ${availableStock} left in stock`,
          };
        }
      } catch (err) {
        console.error("Stock check error:", err);
      }
    }
    setStockWarnings(warnings);
  };

  const fetchSizes = async (item) => {
    if (!item.productId?._id) return;
    try {
      const res = await API.get(
        `/cart/${item.productId._id}/sizes/${encodeURIComponent(
          item.variant.color
        )}`
      );
      setSizeOptions((prev) => ({
        ...prev,
        [item._id]: res.data,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSizeChange = async (itemId, newSize) => {
    try {
      await API.put(`/cart/updateSize/${userId}/${itemId}`, {
        newSize,
      });
      fetchCart();
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuantityChange = async (itemId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;

    try {
      await API.put(`/cart/update/${userId}/${itemId}`, { quantity: newQty });
      setCart((prev) =>
        prev.map((item) =>
          item._id === itemId ? { ...item, quantity: newQty } : item
        )
      );
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await API.delete(`/cart/remove/${userId}/${itemId}`);
      setCart((prev) => prev.filter((item) => item._id !== itemId));
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyCoupon = async (codeToApply) => {
    const code = codeToApply || couponCode;
    if (!code.trim()) return;

    try {
      const res = await API.post("/coupon/apply", {
        code: code.trim(),
        cartTotal: subtotal,
      });

      setAppliedCoupons([
        {
          code: code.trim(),
          discount: res.data.discount || 0,
        },
      ]);
      setCouponMessage("✅ Coupon applied successfully!");
      setShowCouponModal(false);
    } catch (err) {
      setCouponMessage(
        err.response?.data?.message || "❌ Invalid or inapplicable coupon code."
      );
    }
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );
  const totalDiscount = appliedCoupons.reduce((sum, c) => sum + c.discount, 0);
  const finalTotal = Math.max(0, subtotal - totalDiscount);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading your bag...</span>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="cart-page-wrapper container">
        <div className="empty-cart-view">
          <FaShoppingBag className="empty-cart-icon" />
          <h2 style={{ fontSize: "28px", fontWeight: 800 }}>Your Bag is Empty</h2>
          <p className="text-muted" style={{ fontSize: "15px", marginBottom: "28px" }}>
            Looks like you haven't added any luxury pieces to your shopping bag yet.
          </p>
          <button className="btn-luxury-primary" onClick={() => navigate("/")}>
            Explore Trending Styles <FaArrowRight />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page-wrapper container">
      <div className="cart-grid-layout">
        {/* Left Column: Cart Items */}
        <div className="cart-items-column">
          <h2 className="cart-section-title">
            <FaShoppingBag style={{ color: "var(--primary)", fontSize: "20px" }} />
            Shopping Bag ({cart.length} {cart.length === 1 ? "Item" : "Items"})
          </h2>

          {cart.map((item) => {
            const warning = stockWarnings[item._id];
            const itemTotal = (item.price || 0) * (item.quantity || 1);

            return (
              <div key={item._id} className="cart-item-card">
                <div className="cart-item-thumbnail">
                  <img
                    src={getImageUrl(item.productId?.images?.[0])}
                    alt={item.productId?.name || "Product"}
                  />
                </div>

                <div className="cart-item-info">
                  {item.productId?.brandId?.name && (
                    <span className="cart-item-brand">{item.productId.brandId.name}</span>
                  )}
                  <h3 className="cart-item-name">{item.productId?.name}</h3>

                  <div className="cart-item-options-row">
                    <span className="cart-option-badge">
                      Color: <strong>{item.variant?.color}</strong>
                    </span>

                    <span className="cart-option-badge">
                      Size:
                      <select
                        className="cart-size-select"
                        value={item.variant?.size}
                        onFocus={() => fetchSizes(item)}
                        onChange={(e) => handleSizeChange(item._id, e.target.value)}
                      >
                        <option value={item.variant?.size}>{item.variant?.size}</option>
                        {sizeOptions[item._id]?.map((s) => (
                          <option key={s._id || s.size} value={s.size}>
                            {s.size} (₹{s.price})
                          </option>
                        ))}
                      </select>
                    </span>
                  </div>

                  {warning && (
                    <div
                      className={`badge-pill-stock mb-2 ${
                        warning.type === "out-of-stock"
                          ? "bg-danger text-white"
                          : ""
                      }`}
                      style={{ alignSelf: "flex-start" }}
                    >
                      {warning.message}
                    </div>
                  )}

                  <div className="cart-item-bottom-row">
                    <div className="cart-qty-controller">
                      <button
                        className="cart-qty-btn"
                        onClick={() => handleQuantityChange(item._id, item.quantity, -1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="cart-qty-value">{item.quantity}</span>
                      <button
                        className="cart-qty-btn"
                        onClick={() => handleQuantityChange(item._id, item.quantity, 1)}
                      >
                        +
                      </button>
                    </div>

                    <div className="cart-item-price-block">
                      <span className="cart-item-price-main">₹{itemTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <button
                  className="cart-item-remove-btn"
                  onClick={() => handleRemoveItem(item._id)}
                  title="Remove from Bag"
                >
                  <FaTrash />
                </button>
              </div>
            );
          })}
        </div>

        {/* Right Column: Sticky Order Summary */}
        <div className="cart-summary-column">
          <div className="cart-summary-card">
            <h3 className="cart-summary-title">Order Summary</h3>

            {/* Coupon Application Box */}
            <div className="cart-coupon-box">
              <label style={{ fontSize: "12px", fontWeight: 700, marginBottom: "6px", display: "block" }}>
                Promo / Coupon Code
              </label>
              <div className="coupon-input-group">
                <input
                  type="text"
                  placeholder="ENTER CODE"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <button
                  type="button"
                  className="btn-luxury-primary"
                  style={{ padding: "8px 18px", fontSize: "13px", borderRadius: "10px" }}
                  onClick={() => handleApplyCoupon()}
                >
                  Apply
                </button>
              </div>

              {couponMessage && (
                <div style={{ fontSize: "12.5px", marginTop: "6px", fontWeight: 600 }}>
                  {couponMessage}
                </div>
              )}

              {coupons.length > 0 && (
                <button
                  type="button"
                  className="view-coupons-link"
                  onClick={() => setShowCouponModal(true)}
                >
                  <FaTicketAlt /> View Available Offers ({coupons.length})
                </button>
              )}
            </div>

            {/* Price Calculations */}
            <div className="summary-line-row">
              <span>Bag Subtotal</span>
              <strong style={{ color: "var(--text-primary)" }}>₹{subtotal.toLocaleString()}</strong>
            </div>

            {totalDiscount > 0 && (
              <div className="summary-line-row" style={{ color: "var(--accent-emerald)" }}>
                <span>Coupon Savings</span>
                <strong>-₹{totalDiscount.toLocaleString()}</strong>
              </div>
            )}

            <div className="summary-line-row">
              <span>Estimated Delivery</span>
              <strong style={{ color: "var(--accent-emerald)" }}>FREE</strong>
            </div>

            <div className="summary-total-row">
              <span>Total Payable</span>
              <span className="gradient-text">₹{finalTotal.toLocaleString()}</span>
            </div>

            <button
              className="btn-luxury-primary checkout-proceed-btn"
              onClick={() =>
                navigate("/checkout", {
                  state: { couponCode: appliedCoupons[0]?.code || "" },
                })
              }
            >
              Proceed to Secure Checkout <FaArrowRight />
            </button>

            <div className="d-flex align-items-center justify-content-center gap-2 mt-3 text-muted" style={{ fontSize: "12px" }}>
              <FaShieldAlt style={{ color: "var(--accent-emerald)" }} /> 256-Bit SSL Encrypted Checkout
            </div>
          </div>
        </div>
      </div>

      {/* Available Coupons Modal */}
      {showCouponModal && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: "20px", border: "none", overflow: "hidden" }}>
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title" style={{ fontSize: "17px", fontWeight: 700 }}>
                  <FaTicketAlt className="me-2 text-warning" /> Exclusive Offers & Coupons
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowCouponModal(false)}
                />
              </div>
              <div className="modal-body p-4" style={{ maxHeight: "400px", overflowY: "auto" }}>
                {coupons.map((c) => (
                  <div
                    key={c._id}
                    className="p-3 mb-3 border rounded-3 d-flex justify-content-between align-items-center bg-light"
                  >
                    <div>
                      <div className="badge-pill-discount mb-1">{c.code}</div>
                      <div style={{ fontSize: "13px", fontWeight: 600 }}>{c.description || `Save on your order`}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        Min Purchase: ₹{c.minCartValue || 0}
                      </div>
                    </div>
                    <button
                      className="btn-luxury-primary"
                      style={{ padding: "6px 14px", fontSize: "12px" }}
                      onClick={() => {
                        setCouponCode(c.code);
                        handleApplyCoupon(c.code);
                      }}
                    >
                      Apply
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}