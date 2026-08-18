import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaCreditCard,
  FaMoneyBillWave,
  FaLock,
  FaPlus,
  FaCheck,
  FaArrowRight,
} from "react-icons/fa";
import API from "../../api/axios";
import getImageUrl from "../../utils/imageUrl";
import "../../css/Customercss/Checkout.css";

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const passedCouponCode = location.state?.couponCode || "";

  const [cart, setCart] = useState([]);
  const [paymentType, setPaymentType] = useState("ONLINE");
  const [couponCode] = useState(passedCouponCode);
  const [appliedCoupons, setAppliedCoupons] = useState([]);
  const [finalAmount, setFinalAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Address states
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: "Home",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

  const userId = localStorage.getItem("userId");

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const cartTotal = cart.reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
        0
      );
      const res = await API.post("/coupon/apply", {
        code: couponCode.trim(),
        cartTotal,
      });
      setAppliedCoupons([
        {
          code: couponCode.trim(),
          discount: res.data.discount || 0,
        },
      ]);
    } catch (err) {
      console.error("Coupon auto-apply failed:", err);
    }
  };

  useEffect(() => {
    if (couponCode && cart.length > 0 && appliedCoupons.length === 0) {
      applyCoupon();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart]);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await API.get(`/cart/get/${userId}`);
        setCart(res.data.items || []);
      } catch (err) {
        console.error("Failed to load cart:", err);
      }
    };

    fetchCart();
    fetchPreviousAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    const cartTotal = cart.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0
    );
    const discount = appliedCoupons.reduce((sum, c) => sum + c.discount, 0);
    setFinalAmount(Math.max(cartTotal - discount, 0));
  }, [cart, appliedCoupons]);

  const fetchPreviousAddresses = async () => {
    try {
      const res = await API.get(`/order/user/${userId}`);
      const orders = res.data || [];

      const addressMap = new Map();
      orders.forEach((order) => {
        if (order.address && order.address.street) {
          const key = `${order.address.street}-${order.address.city}-${order.address.pincode}`;
          if (!addressMap.has(key)) {
            addressMap.set(key, order.address);
          }
        }
      });

      const uniqueAddresses = Array.from(addressMap.values());
      setSavedAddresses(uniqueAddresses);

      if (uniqueAddresses.length > 0) {
        setSelectedAddressIndex(0);
      } else {
        setShowNewAddressForm(true);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      setShowNewAddressForm(true);
    }
  };

  const handlePlaceOrder = async () => {
    const activeAddress = showNewAddressForm
      ? newAddress
      : savedAddresses[selectedAddressIndex];

    if (!activeAddress || !activeAddress.street || !activeAddress.city || !activeAddress.pincode) {
      alert("Please enter or select a complete shipping address.");
      return;
    }

    setLoading(true);
    try {
      const orderPayload = {
        userId,
        address: activeAddress,
        paymentType,
        couponCode: appliedCoupons[0]?.code || null,
      };

      await API.post("/order/create", orderPayload);
      alert("Order placed successfully! Thank you for shopping with GoWear.");
      window.dispatchEvent(new Event("cartUpdated"));
      navigate("/orders");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );
  const totalDiscount = appliedCoupons.reduce((sum, c) => sum + c.discount, 0);

  return (
    <div className="checkout-page-wrapper container">
      <div className="checkout-grid">
        {/* Left Column: Multi-Step Form */}
        <div className="checkout-steps-column">
          {/* Step 1: Shipping Address */}
          <div className="checkout-card-section">
            <div className="checkout-section-header">
              <h3>
                <span className="step-number-badge">1</span>
                Shipping Address
              </h3>
              {savedAddresses.length > 0 && (
                <button
                  type="button"
                  className="btn-luxury-secondary"
                  style={{ padding: "6px 14px", fontSize: "12.5px" }}
                  onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                >
                  <FaPlus /> {showNewAddressForm ? "Select Saved" : "Add New Address"}
                </button>
              )}
            </div>

            {!showNewAddressForm && savedAddresses.length > 0 ? (
              <div className="address-cards-grid">
                {savedAddresses.map((addr, idx) => (
                  <div
                    key={idx}
                    className={`address-selectable-card ${
                      selectedAddressIndex === idx ? "selected" : ""
                    }`}
                    onClick={() => setSelectedAddressIndex(idx)}
                  >
                    <div className="address-card-header">
                      <span className="address-type-pill">{addr.label || "Home"}</span>
                      {selectedAddressIndex === idx && (
                        <FaCheck style={{ color: "var(--primary)" }} />
                      )}
                    </div>
                    <p className="address-card-text">
                      <strong>{addr.street}</strong>
                      <br />
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="new-address-inputs">
                <div className="form-row">
                  <div className="luxury-input-group">
                    <label>Address Label</label>
                    <input
                      type="text"
                      className="luxury-input"
                      placeholder="Home / Office"
                      value={newAddress.label}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, label: e.target.value })
                      }
                    />
                  </div>
                  <div className="luxury-input-group">
                    <label>Street Address</label>
                    <input
                      type="text"
                      className="luxury-input"
                      placeholder="House No., Street name"
                      value={newAddress.street}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, street: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="luxury-input-group">
                    <label>City</label>
                    <input
                      type="text"
                      className="luxury-input"
                      placeholder="Mumbai / Delhi"
                      value={newAddress.city}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, city: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="luxury-input-group">
                    <label>State</label>
                    <input
                      type="text"
                      className="luxury-input"
                      placeholder="Maharashtra"
                      value={newAddress.state}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, state: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="luxury-input-group" style={{ maxWidth: "140px" }}>
                    <label>Pincode</label>
                    <input
                      type="text"
                      className="luxury-input"
                      placeholder="400001"
                      value={newAddress.pincode}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, pincode: e.target.value })
                      }
                      maxLength="6"
                      required
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Payment Method */}
          <div className="checkout-card-section">
            <div className="checkout-section-header">
              <h3>
                <span className="step-number-badge">2</span>
                Payment Options
              </h3>
            </div>

            <div className="payment-methods-grid">
              <div
                className={`payment-method-card ${
                  paymentType === "ONLINE" ? "selected" : ""
                }`}
                onClick={() => setPaymentType("ONLINE")}
              >
                <div className="payment-method-icon">
                  <FaCreditCard />
                </div>
                <div className="payment-method-info">
                  <h5>Instant Online Payment</h5>
                  <p>UPI, Cards, Netbanking & Wallets</p>
                </div>
                {paymentType === "ONLINE" && <FaCheck className="ms-auto text-primary" />}
              </div>

              <div
                className={`payment-method-card ${
                  paymentType === "COD" ? "selected" : ""
                }`}
                onClick={() => setPaymentType("COD")}
              >
                <div className="payment-method-icon">
                  <FaMoneyBillWave />
                </div>
                <div className="payment-method-info">
                  <h5>Cash On Delivery</h5>
                  <p>Pay upon physical arrival</p>
                </div>
                {paymentType === "COD" && <FaCheck className="ms-auto text-primary" />}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Order Recap */}
        <div className="checkout-summary-column">
          <div className="checkout-summary-card">
            <h3 className="cart-summary-title">Order Recap</h3>

            <div className="checkout-items-preview">
              {cart.map((item) => (
                <div key={item._id} className="checkout-mini-item">
                  <img
                    src={getImageUrl(item.productId?.images?.[0])}
                    alt={item.productId?.name}
                    className="checkout-mini-thumb"
                  />
                  <div className="checkout-mini-details">
                    <h6>{item.productId?.name}</h6>
                    <span>
                      Qty: {item.quantity} • {item.variant?.color} ({item.variant?.size})
                    </span>
                  </div>
                  <span className="checkout-mini-price">
                    ₹{((item.price || 0) * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="summary-line-row">
              <span>Subtotal</span>
              <strong>₹{subtotal.toLocaleString()}</strong>
            </div>

            {totalDiscount > 0 && (
              <div className="summary-line-row" style={{ color: "var(--accent-emerald)" }}>
                <span>Coupon Applied ({appliedCoupons[0]?.code})</span>
                <strong>-₹{totalDiscount.toLocaleString()}</strong>
              </div>
            )}

            <div className="summary-line-row">
              <span>Delivery Fee</span>
              <strong style={{ color: "var(--accent-emerald)" }}>FREE</strong>
            </div>

            <div className="summary-total-row">
              <span>Total Payable</span>
              <span className="gradient-text">₹{finalAmount.toLocaleString()}</span>
            </div>

            <button
              type="button"
              className="btn-luxury-primary checkout-proceed-btn"
              onClick={handlePlaceOrder}
              disabled={loading || cart.length === 0}
            >
              {loading ? "Confirming Order..." : "Place Order & Pay"} <FaArrowRight />
            </button>

            <div
              className="d-flex align-items-center justify-content-center gap-2 mt-3 text-muted"
              style={{ fontSize: "12px" }}
            >
              <FaLock style={{ color: "var(--accent-emerald)" }} /> Safe & Encrypted Checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
