import React, { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../../css/Customercss/CartScreen.css";

export default function CartScreen() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [appliedCoupons, setAppliedCoupons] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [showCouponModal, setShowCouponModal] = useState(false);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/api/coupon")
      .then((res) => res.json())
      .then((data) => setCoupons(data.filter((c) => c.isActive)))
      .catch((err) => console.error(err));
  }, []);

  const updateCart = (updatedCart) => {
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("storage"));
  };

  const handleRemove = (id) => {
    const updatedCart = cart.filter((item) => item._id !== id);
    updateCart(updatedCart);
  };

  const handleQuantityChange = (id, quantity) => {
    const updatedCart = cart.map((item) =>
      item._id === id ? { ...item, quantity: Number(quantity) } : item
    );
    updateCart(updatedCart);
  };

  /* ======================
     TOTAL CALCULATIONS
  ====================== */
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const totalMRP = cart.reduce((acc, item) => {
    const basePrice =
      item.variants?.find((v) => v.color === item.selectedColor)?.sizes?.[0]
        ?.price || item.price || 0;
    return acc + basePrice * item.quantity;
  }, 0);

  const totalDiscount = cart.reduce((acc, item) => {
    const basePrice =
      item.variants?.find((v) => v.color === item.selectedColor)?.sizes?.[0]
        ?.price || item.price || 0;
    const discountAmount = item.discount
      ? (basePrice * item.discount) / 100
      : 0;
    return acc + discountAmount * item.quantity;
  }, 0);

  const totalAmount = totalMRP - totalDiscount;

  const freeShippingThreshold = 3000;
  const shipping = totalAmount >= freeShippingThreshold ? 0 : 100;
  const finalTotal =
    Math.max(totalAmount - appliedCoupons.reduce((acc, c) => acc + c.discount, 0) + shipping, 0);
  const amountForFreeShipping =
    totalAmount >= freeShippingThreshold ? 0 : freeShippingThreshold - totalAmount;

  const applyCoupon = async (codeParam) => {
    const codeToApply = codeParam || couponCode;

    try {
      const res = await fetch("http://localhost:5000/api/coupon/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: codeToApply,
          orderAmount: totalAmount,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCouponMessage(data.message);
        return;
      }

      if (!appliedCoupons.some((c) => c.code === codeToApply)) {
        setAppliedCoupons([...appliedCoupons, { code: codeToApply, discount: data.discount }]);
        setCouponMessage(`Applied ${codeToApply}`);
      } else {
        setCouponMessage(`${codeToApply} is already applied`);
      }
      setCouponCode("");
    } catch {
      setCouponMessage("Coupon apply failed");
    }
  };

  const removeCoupon = (code) => {
    setAppliedCoupons(appliedCoupons.filter((c) => c.code !== code));
  };

  if (cart.length === 0)
    return <div className="cart-empty">Your cart is empty.</div>;

  return (
    <div className="cart-wrapper">
      {/* LEFT */}
      <div className="cart-left">
        {cart.map((item) => {
          const basePrice =
            item.variants?.find((v) => v.color === item.selectedColor)
              ?.sizes?.[0]?.price || item.price || 0;

          const discountedPrice = item.discount
            ? basePrice - (basePrice * item.discount) / 100
            : basePrice;

          const variant = item.variants?.find(
            (v) => v.color === item.selectedColor
          );

          return (
            <div className="cart-item" key={item._id}>
              <div className="cart-item-img">
                <img
                  src={`http://localhost:5000/${item.images?.[0]}`}
                  alt={item.name}
                />
              </div>

              <div className="cart-item-details">
                <h3 className="cart-item-name">{item.name}</h3>

                {item.discount > 0 && (
                  <span className="cart-discount">{item.discount}% OFF</span>
                )}

                <p>
                  Color: <strong>{item.selectedColor || "N/A"}</strong>
                </p>

                <div className="cart-size">
                  <label>Size:</label>
                  <select
                    value={item.selectedSize || ""}
                    onChange={(e) => {
                      const updatedCart = cart.map((c) =>
                        c._id === item._id
                          ? { ...c, selectedSize: e.target.value }
                          : c
                      );
                      updateCart(updatedCart);
                    }}
                  >
                    {variant?.sizes?.map((s, i) => (
                      <option key={i} value={s.size}>
                        {s.size}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="cart-price">
                  {item.discount > 0 ? (
                    <>
                      <span className="cart-price-discounted">
                        ₹{discountedPrice.toFixed(2)}
                      </span>
                      <span className="cart-price-original">
                        ₹{basePrice.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="cart-price-discounted">
                      ₹{basePrice.toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="cart-qty">
                  <label>Qty:</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(item._id, e.target.value)
                    }
                  />
                </div>
              </div>

              <button
                className="cart-remove-btn"
                onClick={() => handleRemove(item._id)}
              >
                <FaTrash />
              </button>
            </div>
          );
        })}

        <button className="cart-continue-btn" onClick={() => navigate("/")}>
          Continue Shopping
        </button>
      </div>

      {/* COUPON SECTION */}
      <div className="coupon-box">
        <input
          type="text"
          placeholder="Enter Coupon Code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
        />

        <button
          className="view-coupon-btn"
          onClick={() => setShowCouponModal(true)}
        >
          View Available Coupons
        </button>

        {couponMessage && (
          <p
            style={{
              color: "green",
              marginTop: "8px",
              fontSize: "14px",
            }}
          >
            {couponMessage}
          </p>
        )}

        {/* Applied Coupons */}
        {appliedCoupons.length > 0 && (
          <div className="applied-coupons">
            {appliedCoupons.map((c) => (
              <div key={c.code} className="applied-coupon">
                <span>{c.code} - ₹{c.discount.toFixed(2)}</span>
                <button onClick={() => removeCoupon(c.code)}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* COUPON MODAL */}
      {showCouponModal && (
        <div className="coupon-modal-overlay">
          <div className="coupon-modal">
            <div className="coupon-modal-header">
              <h3>Available Coupons</h3>
              <button className="close-modal" onClick={() => setShowCouponModal(false)}>
                ✕
              </button>
            </div>

            <div className="coupon-modal-body">
              {coupons.length === 0 && <p>No coupons available</p>}
              {coupons.map((coupon) => (
                <div key={coupon._id} className="coupon-card">
                  <div>
                    <strong>{coupon.code}</strong>
                    <p>
                      {coupon.discountType === "percentage"
                        ? `${coupon.discountValue}% OFF`
                        : `₹${coupon.discountValue} OFF`}
                    </p>
                    <small>Min order ₹{coupon.minOrderValue}</small>
                  </div>

                  <button
                    onClick={() => {
                      applyCoupon(coupon.code);
                      setShowCouponModal(false);
                    }}
                  >
                    Apply
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* RIGHT */}
      <div className="cart-right">
        <div className="cart-summary-box">
          <h3>Price Details</h3>

          {amountForFreeShipping > 0 && (
            <div className="free-shipping-msg">
              Add ₹{amountForFreeShipping.toFixed(2)} more to get Free Shipping!
            </div>
          )}

          <div className="cart-summary-row">
            <span>Total Items</span>
            <span>{totalItems}</span>
          </div>

          <div className="cart-summary-row">
            <span>Total MRP</span>
            <span>₹{totalMRP.toFixed(2)}</span>
          </div>

          <div className="cart-summary-row">
            <span>Discount on MRP</span>
            <span>₹{totalDiscount.toFixed(2)}</span>
          </div>

          {appliedCoupons.length > 0 && appliedCoupons.map((c) => (
            <div className="cart-summary-row" key={c.code}>
              <span>Coupon ({c.code})</span>
              <span style={{ color: "green" }}>- ₹{c.discount.toFixed(2)}</span>
            </div>
          ))}

          <div className="cart-summary-row">
            <span>Shipping</span>
            <span style={{ color: shipping === 0 ? "green" : "#000" }}>
              {shipping === 0 ? "Free Shipping" : `₹${shipping}`}
            </span>
          </div>

          <div className="cart-summary-row total">
            <span>Final Total</span>
            <span>₹{finalTotal.toFixed(2)}</span>
          </div>

          <button
            className="cart-checkout-btn"
            onClick={() => {
              localStorage.setItem("cartTotal", totalAmount);
              localStorage.setItem("finalAmount", finalTotal);
              localStorage.setItem("appliedCoupons", JSON.stringify(appliedCoupons));

              navigate("/checkout");
            }}
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
