import React, { useEffect, useState } from "react";
import { FaTrash, FaExclamationTriangle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { useLocation } from "react-router-dom";
import "../../css/Customercss/CartScreen.css";

export default function CartScreen() {
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();
  const location = useLocation();
  const passedCouponCode = location.state?.couponCode || "";
  const [cart, setCart] = useState([]);
  const [sizeOptions, setSizeOptions] = useState([]);
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [appliedCoupons, setAppliedCoupons] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [stockWarnings, setStockWarnings] = useState({});

  useEffect(() => {
    if (!userId) return;

    const fetchCart = async () => {
      try {
        const res = await API.get(`/cart/get/${userId}`);
        setCart(res.data?.items || []);
        checkStockAvailability(res.data?.items || []);
      } catch (err) {
        console.error("Failed to load cart", err);
      }
    };

    fetchCart();
  }, [userId]);

  useEffect(() => {
    fetch("http://localhost:5000/api/coupon")
      .then((res) => res.json())
      .then((data) => setCoupons(data.filter((c) => c.isActive)))
      .catch((err) => console.error(err));
  }, []);

  // Check stock availability for all cart items
  const checkStockAvailability = async (cartItems) => {
    const warnings = {};
    
    for (const item of cartItems) {
      try {
        const res = await API.get(
          `/cart/${item.productId._id}/sizes/${encodeURIComponent(
            item.variant.color
          )}`
        );
        
        const currentSize = res.data.find(s => s.size === item.variant.size);
        const availableStock = currentSize?.stock || 0;
        
        if (availableStock === 0) {
          warnings[item._id] = {
            type: 'out-of-stock',
            message: 'Out of stock',
            availableStock: 0
          };
        } else if (item.quantity > availableStock) {
          warnings[item._id] = {
            type: 'exceeds-stock',
            message: `Only ${availableStock} available`,
            availableStock
          };
        } else if (availableStock < 10) {
          warnings[item._id] = {
            type: 'low-stock',
            message: `Only ${availableStock} left in stock`,
            availableStock
          };
        }
      } catch (err) {
        console.error("Stock check failed", err);
      }
    }
    
    setStockWarnings(warnings);
  };

  const fetchSizes = async (item) => {
    const res = await API.get(
      `/cart/${item.productId._id}/sizes/${encodeURIComponent(
        item.variant.color
      )}`
    );

    setSizeOptions((prev) => ({
      ...prev,
      [item._id]: res.data,
    }));
  };

  const handleSizeChange = async (itemId, newSize) => {
    try {
      await API.put("/cart/update-variant", {
        userId,
        itemId,
        size: newSize,
      });

      const refreshed = await API.get(`/cart/get/${userId}`);
      setCart(refreshed.data.items);
      checkStockAvailability(refreshed.data.items);
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Size update failed", err);
    }
  };

  const handleRemove = async (itemId) => {
    try {
      const res = await API.delete(`/cart/remove/${userId}/${itemId}`);
      setCart(res.data.items);
      checkStockAvailability(res.data.items);
      
      // Remove warning for this item
      const newWarnings = { ...stockWarnings };
      delete newWarnings[itemId];
      setStockWarnings(newWarnings);
      
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Failed to remove item", err);
    }
  };

  const handleQuantityChange = async (itemId, quantity) => {
  let quantityNum = parseInt(quantity);

  if (isNaN(quantityNum) || quantityNum < 1) return;

  const item = cart.find(i => i._id === itemId);
  const warning = stockWarnings[itemId];

  // 🔒 STRICT STOCK LIMIT
  if (warning?.availableStock !== undefined) {
    if (quantityNum > warning.availableStock) {
      quantityNum = warning.availableStock;

      alert(`You can add only ${warning.availableStock} items. Stock limit reached.`);
    }

    if (quantityNum === 0) {
      await handleRemove(itemId);
      return;
    }
  }

  try {
    await API.put("/cart/update", {
      userId,
      itemId,
      quantity: quantityNum,
    });

    const refreshed = await API.get(`/cart/get/${userId}`);
    setCart(refreshed.data.items);
    checkStockAvailability(refreshed.data.items);
    window.dispatchEvent(new Event("cartUpdated"));
  } catch (err) {
    console.error("Quantity update failed", err);
  }
};

  // Auto-remove out of stock items
  useEffect(() => {
    const removeOutOfStockItems = async () => {
      const outOfStockItems = Object.entries(stockWarnings)
        .filter(([_, warning]) => warning.type === 'out-of-stock')
        .map(([itemId]) => itemId);
      
      if (outOfStockItems.length > 0) {
        for (const itemId of outOfStockItems) {
          await handleRemove(itemId);
        }
      }
    };
    
    removeOutOfStockItems();
  }, [stockWarnings]);

  /* ======================
     TOTAL CALCULATIONS
  ====================== */
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const totalMRP = cart.reduce((acc, item) => {
    const discountedPrice = item.price;
    const discountPercent = item.productId?.discount || 0;

    const mrp =
      discountPercent > 0
        ? Math.round(discountedPrice / (1 - discountPercent / 100))
        : discountedPrice;

    return acc + mrp * item.quantity;
  }, 0);

  const totalDiscount = cart.reduce((acc, item) => {
    const discountedPrice = item.price;
    const discountPercent = item.productId?.discount || 0;

    if (discountPercent === 0) return acc;

    const basePrice = Math.round(
      discountedPrice / (1 - discountPercent / 100)
    );

    const discountOnMrp = basePrice - discountedPrice;

    return acc + discountOnMrp * item.quantity;
  }, 0);

  const totalAmount = totalMRP - totalDiscount;

  const freeShippingThreshold = 999;
  const shipping = totalAmount >= freeShippingThreshold ? 0 : 100;
  const finalTotal = Math.max(
    totalAmount -
      appliedCoupons.reduce((acc, c) => acc + c.discount, 0) +
      shipping,
    0
  );
  const amountForFreeShipping =
    totalAmount >= freeShippingThreshold
      ? 0
      : freeShippingThreshold - totalAmount;

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
        setAppliedCoupons([
          ...appliedCoupons,
          { code: codeToApply, discount: data.discount },
        ]);
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
          const discountedPrice = item.price;
          const discountPercent = item.productId?.discount || 0;

          const basePrice =
            discountPercent > 0
              ? Math.round(discountedPrice / (1 - discountPercent / 100))
              : discountedPrice;

          const discountOnMrp = basePrice - discountedPrice;
          const warning = stockWarnings[item._id];

          return (
            <div 
              className={`cart-item ${warning?.type === 'out-of-stock' ? 'out-of-stock' : ''}`} 
              key={item._id}
            >
              <div className="cart-item-img">
                <img
                  src={`http://localhost:5000/${item.productId.images?.[0]}`}
                  alt={item.productId.name}
                  style={warning?.type === 'out-of-stock' ? { filter: 'grayscale(100%)', opacity: 0.5 } : {}}
                />
              </div>

              <div className="cart-item-details">
                <h3 className="cart-item-name">{item.productId.name}</h3>

                {/* Stock Warning */}
                {warning && (
                  <div className={`stock-warning ${warning.type}`}>
                    <FaExclamationTriangle />
                    <span>{warning.message}</span>
                  </div>
                )}

                {item.productId.discount > 0 && (
                  <span className="cart-discount">
                    {item.productId.discount}% OFF
                  </span>
                )}

                <p>
                  Color: <strong>{item.variant.color || "N/A"}</strong>
                </p>

                <div className="cart-size">
                  <label>Size:</label>

                  <select
                    value={item.variant.size}
                    onClick={() => fetchSizes(item)}
                    onChange={(e) => handleSizeChange(item._id, e.target.value)}
                    disabled={warning?.type === 'out-of-stock'}
                  >
                    {(sizeOptions[item._id] || []).map((s) => (
                      <option
                        key={s.size}
                        value={s.size}
                        disabled={s.stock === 0}
                      >
                        {s.size} {s.stock === 0 ? "(Out of stock)" : s.stock < 10 ? `(${s.stock} left)` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="cart-price">
                  {item.productId.discount > 0 ? (
                    <>
                      <span className="cart-price-discounted">
                        ₹{discountedPrice.toFixed(2)}
                      </span>
                      <span className="cart-price-original">
                        ₹{basePrice.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="cart-price-off">
                      ({discountPercent}% OFF)
                    </span>
                  )}
                </div>

                <div className="cart-qty">
                  <label>Qty:</label>
                  <input
                    type="number"
                    min="1"
                    max={warning?.availableStock || 999}
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(item._id, e.target.value)
                    }
                    disabled={warning?.type === 'out-of-stock'}
                  />
                  {warning?.availableStock && (
                    <span className="max-qty-hint">Max: {warning.availableStock}</span>
                  )}
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
                <span>
                  {c.code} - ₹{c.discount.toFixed(2)}
                </span>
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
              <button
                className="close-modal"
                onClick={() => setShowCouponModal(false)}
              >
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

          {appliedCoupons.length > 0 &&
            appliedCoupons.map((c) => (
              <div className="cart-summary-row" key={c.code}>
                <span>Coupon ({c.code})</span>
                <span style={{ color: "green" }}>
                  - ₹{c.discount.toFixed(2)}
                </span>
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
              navigate("/checkout", {
                state: {
                  couponCode: appliedCoupons[0]?.code || "",
                },
              });
            }}
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}