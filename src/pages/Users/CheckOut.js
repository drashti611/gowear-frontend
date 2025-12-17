import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

import {
  FaMapMarkerAlt,
  FaCreditCard,
  FaTruck,
  FaPlus,
  FaCheck,
} from "react-icons/fa";
import API from "../../api/axios";
import "../../css/Customercss/Checkout.css";

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const passedCouponCode = location.state?.couponCode || "";

  const [cart, setCart] = useState([]);
  const [paymentType, setPaymentType] = useState("ONLINE");
  const [couponCode, setCouponCode] = useState(passedCouponCode);
  const [appliedCoupons, setAppliedCoupons] = useState([]);
  const [finalAmount, setFinalAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Address states
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

  const userId = localStorage.getItem("userId");

  /* =========================
     LOAD CART (API) + ADDRESSES
  ========================= */
  useEffect(() => {
    if (couponCode && cart.length > 0 && appliedCoupons.length === 0) {
      applyCoupon();
    }
  }, [cart]);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await API.get(`/cart/get/${userId}`);
        setCart(res.data.items || []);
      } catch (err) {
        console.error("Failed to load cart", err);
      }
    };

    fetchCart();
    fetchPreviousAddresses();
  }, []);

  /* =========================
     FINAL AMOUNT FROM CART
  ========================= */
  useEffect(() => {
    const cartTotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const discount = appliedCoupons.reduce((sum, c) => sum + c.discount, 0);

    setFinalAmount(Math.max(cartTotal - discount, 0));
  }, [cart, appliedCoupons]);

  const fetchPreviousAddresses = async () => {
    try {
      const res = await API.get(`/order/user/${userId}`);
      const orders = res.data;

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
      console.error("Failed to fetch addresses", error);
      setShowNewAddressForm(true);
    }
  };

  /* =========================
     APPLY COUPON
  ========================= */
  const applyCoupon = async () => {
    if (!couponCode) return alert("Enter coupon code");

    try {
      const cartTotal = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const res = await fetch("http://localhost:5000/api/coupon/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode,
          orderAmount: cartTotal,
        }),
      });

      const data = await res.json();
      if (!res.ok) return alert(data.message);

      if (appliedCoupons.some((c) => c.code === couponCode)) {
        alert("Coupon already applied");
        return;
      }

      setAppliedCoupons([{ code: couponCode, discount: data.discount }]);
      setCouponCode("");
    } catch {
      alert("Coupon apply failed");
    }
  };

  const removeCoupon = (code) => {
    setAppliedCoupons(appliedCoupons.filter((c) => c.code !== code));
  };

  const getSelectedAddress = () => {
    if (selectedAddressIndex !== null && savedAddresses[selectedAddressIndex]) {
      return savedAddresses[selectedAddressIndex];
    }
    return null;
  };

  /* =========================
     CREATE ORDER (FIXED)
  ========================= */
  const createOrder = async () => {
    const selectedAddress = getSelectedAddress();

    let addressToUse;
    if (showNewAddressForm) {
      addressToUse = newAddress;
    } else if (selectedAddress) {
      addressToUse = selectedAddress;
    } else {
      return alert("Please select or add a delivery address");
    }

    if (
      !addressToUse.street ||
      !addressToUse.city ||
      !addressToUse.state ||
      !addressToUse.pincode
    ) {
      return alert("Please fill all address fields");
    }

    setLoading(true);

    const cartTotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    try {
      const res = await fetch("http://localhost:5000/api/order/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          items: cart.map((item) => ({
            productId: item.productId._id, // ✅ FIX
            variant: item.variant, // ✅ FIX
            quantity: item.quantity,
            price: item.price,
          })),
          totalAmount: cartTotal,
          couponCode: appliedCoupons[0]?.code || "", // ✅ FIX
          paymentType,
          address: addressToUse,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (paymentType === "COD") {
        await API.delete(`/cart/clear/${userId}`); // ✅ FIX
        navigate("/orders");
      } else {
        openRazorpay(data.order);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const openRazorpay = async (order) => {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) return alert("Razorpay SDK failed to load");

    const options = {
      key: "rzp_test_Sh9HYbJ3Cyw97I",
      amount: order.finalAmount * 100,
      currency: "INR",
      name: "GoWear",
      description: "Order Payment",
      handler: async function (response) {
        await fetch(
          `http://localhost:5000/api/order/payment-success/${order._id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              paymentId: response.razorpay_payment_id,
            }),
          }
        );

        await API.delete(`/cart/clear/${userId}`); // ✅ FIX
        navigate("/orders");
      },
      theme: { color: "#667eea" },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  return (
    <div className="checkout-container">
      <div className="checkout-card">
        <h2 className="checkout-title">Checkout</h2>

        {/* Address Section */}
        <div className="section">
          <div className="section-header">
            <h4>Delivery Address</h4>
            {savedAddresses.length > 0 && (
              <button
                className="add-address-btn"
                onClick={() => setShowNewAddressForm(!showNewAddressForm)}
              >
                <FaPlus /> {showNewAddressForm ? "Show Saved" : "Add New"}
              </button>
            )}
          </div>

          {/* Saved Addresses List */}
          {!showNewAddressForm && savedAddresses.length > 0 && (
            <div className="saved-addresses">
              {savedAddresses.map((addr, index) => (
                <div
                  key={index}
                  className={`address-card ${
                    selectedAddressIndex === index ? "selected" : ""
                  }`}
                  onClick={() => setSelectedAddressIndex(index)}
                >
                  <div className="address-radio">
                    {selectedAddressIndex === index && <FaCheck />}
                  </div>
                  <div className="address-details">
                    <FaMapMarkerAlt className="address-icon" />
                    <div>
                      <p className="address-text">
                        {addr.street}, {addr.city}
                      </p>
                      <p className="address-text">
                        {addr.state} - {addr.pincode}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* New Address Form */}
          {(showNewAddressForm || savedAddresses.length === 0) && (
            <div className="new-address-form">
              <div className="input-group">
                <FaMapMarkerAlt className="icon" />
                <input
                  placeholder="Street Address"
                  value={newAddress.street}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, street: e.target.value })
                  }
                />
              </div>
              <div className="input-group">
                <FaMapMarkerAlt className="icon" />
                <input
                  placeholder="City"
                  value={newAddress.city}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, city: e.target.value })
                  }
                />
              </div>
              <div className="input-group">
                <FaMapMarkerAlt className="icon" />
                <input
                  placeholder="State"
                  value={newAddress.state}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, state: e.target.value })
                  }
                />
              </div>
              <div className="input-group">
                <FaMapMarkerAlt className="icon" />
                <input
                  placeholder="Pincode"
                  value={newAddress.pincode}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, pincode: e.target.value })
                  }
                />
              </div>
            </div>
          )}
        </div>

        {/* Coupon Section */}
        {/* Coupon Section */}
        <div className="section">
          <h4>Apply Coupon</h4>

          <div className="coupon-group">
            <input
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              disabled={appliedCoupons.length > 0}
            />

            {appliedCoupons.length === 0 ? (
              <button className="apply-btn" onClick={applyCoupon}>
                Apply
              </button>
            ) : (
              <button className="apply-btn" disabled>
                Applied
              </button>
            )}
          </div>

          {appliedCoupons.length > 0 && (
            <div className="applied-coupons">
              {appliedCoupons.map((c) => (
                <div key={c.code} className="applied-coupon">
                  <span>
                    ✓ {c.code} - ₹{c.discount.toFixed(2)}
                  </span>
                  <button
                    className="remove-btn"
                    onClick={() => removeCoupon(c.code)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Section */}
        <div className="section">
          <h4>Payment Method</h4>
          <div className="payment-options">
            <button
              className={`payment-btn ${
                paymentType === "ONLINE" ? "active" : ""
              }`}
              onClick={() => setPaymentType("ONLINE")}
            >
              <FaCreditCard /> Online Payment
            </button>
            <button
              className={`payment-btn ${paymentType === "COD" ? "active" : ""}`}
              onClick={() => setPaymentType("COD")}
            >
              <FaTruck /> Cash on Delivery
            </button>
          </div>
        </div>

        {/* Summary & Place Order */}
        <div className="summary">
          <div className="summary-row">
            <span>Total Amount:</span>
            <span className="summary-amount">₹{finalAmount.toFixed(2)}</span>
          </div>
          <button
            className="place-order-btn"
            disabled={loading}
            onClick={createOrder}
          >
            {loading ? "Processing..." : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
