import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaCreditCard, FaTruck, FaPlus, FaCheck } from "react-icons/fa";
import API from "../../api/axios";
import "../../css/Customercss/Checkout.css";

export default function Checkout() {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [paymentType, setPaymentType] = useState("ONLINE");
  const [couponCode, setCouponCode] = useState("");
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
  useEffect(() => {
    const cartData = JSON.parse(localStorage.getItem("cart")) || [];
    const coupons = JSON.parse(localStorage.getItem("appliedCoupons")) || [];
    const amount = Number(localStorage.getItem("finalAmount")) || 0;

    setCart(cartData);
    setAppliedCoupons(coupons);
    setFinalAmount(amount);

    fetchPreviousAddresses();
  }, []);


  const fetchPreviousAddresses = async () => {
    try {
      const res = await API.get(`/order/user/${userId}`);
      const orders = res.data;

      // Extract unique addresses from previous orders
      const addressMap = new Map();
      orders.forEach(order => {
        if (order.address && order.address.street) {
          const key = `${order.address.street}-${order.address.city}-${order.address.pincode}`;
          if (!addressMap.has(key)) {
            addressMap.set(key, order.address);
          }
        }
      });

      const uniqueAddresses = Array.from(addressMap.values());
      setSavedAddresses(uniqueAddresses);

      // Auto-select first address if available
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

  const applyCoupon = async () => {
    if (!couponCode) return alert("Enter coupon code");

    try {
      const cartTotal = Number(localStorage.getItem("cartTotal")) || 0;

      const res = await fetch("http://localhost:5000/api/coupon/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode,
          orderAmount: cartTotal,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      // prevent duplicate
      if (appliedCoupons.some(c => c.code === couponCode)) {
        alert("Coupon already applied");
        return;
      }

      const updatedCoupons = [
        ...appliedCoupons,
        { code: couponCode, discount: data.discount },
      ];

      setAppliedCoupons(updatedCoupons);
      localStorage.setItem("appliedCoupons", JSON.stringify(updatedCoupons));

      // 🔥 final amount update
      const updatedFinal =
        Math.max(finalAmount - data.discount, 0);

      setFinalAmount(updatedFinal);
      localStorage.setItem("finalAmount", updatedFinal);

      setCouponCode("");
    } catch (err) {
      alert("Coupon apply failed");
    }
  };

  // const applyCoupon = () => {
  //   if (!couponCode) return alert("Enter a coupon code");
  //   setAppliedCoupon(couponCode);
  //   localStorage.setItem("appliedCoupon", couponCode);
  //   alert(`Coupon ${couponCode} applied!`);
  // };

  const removeCoupon = (code) => {
    const couponToRemove = appliedCoupons.find(c => c.code === code);
    const updated = appliedCoupons.filter(c => c.code !== code);

    setAppliedCoupons(updated);
    localStorage.setItem("appliedCoupons", JSON.stringify(updated));

    if (couponToRemove) {
      const updatedFinal = finalAmount + couponToRemove.discount;
      setFinalAmount(updatedFinal);
      localStorage.setItem("finalAmount", updatedFinal);
    }
  };


  const getSelectedAddress = () => {
    if (selectedAddressIndex !== null && savedAddresses[selectedAddressIndex]) {
      return savedAddresses[selectedAddressIndex];
    }
    return null;
  };

  const createOrder = async () => {
    const selectedAddress = getSelectedAddress();

    // Determine which address to use
    let addressToUse;
    if (showNewAddressForm) {
      addressToUse = newAddress;
    } else if (selectedAddress) {
      addressToUse = selectedAddress;
    } else {
      return alert("Please select or add a delivery address");
    }

    // Validate address
    if (!addressToUse.street || !addressToUse.city || !addressToUse.state || !addressToUse.pincode) {
      return alert("Please fill all address fields");
    }

    setLoading(true);
    const cartTotal = Number(localStorage.getItem("cartTotal")) || 0;

    try {
      const res = await fetch("http://localhost:5000/api/order/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          items: cart.map((item) => ({
            productId: item._id,
            variant: {
              color: item.selectedColor || null,
              size: item.selectedSize || null,
            },
            quantity: item.quantity,
            price:
              item.variants?.find((v) => v.color === item.selectedColor)
                ?.sizes?.[0]?.price || item.price,
          })),
          totalAmount: cartTotal,
couponCodes: appliedCoupons.map(c => c.code),
          paymentType,
          address: {
            street: addressToUse.street,
            city: addressToUse.city,
            state: addressToUse.state,
            pincode: addressToUse.pincode,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (paymentType === "COD") {
        alert("Order placed successfully");
        localStorage.removeItem("cart");
        localStorage.removeItem("appliedCoupon");
        localStorage.removeItem("finalAmount");
        localStorage.removeItem("cartTotal");
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
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const openRazorpay = async (order) => {
    const isLoaded = await loadRazorpayScript();

    if (!isLoaded) {
      alert("Razorpay SDK failed to load. Check internet connection.");
      return;
    }

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

        alert("Payment successful");
        localStorage.removeItem("cart");
        localStorage.removeItem("appliedCoupon");
        localStorage.removeItem("finalAmount");
        localStorage.removeItem("cartTotal");
        navigate("/orders");
      },
      prefill: {
        name: "Customer",
        email: "customer@email.com",
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
                  className={`address-card ${selectedAddressIndex === index ? "selected" : ""}`}
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
                  <span>✓ {c.code} - ₹{c.discount.toFixed(2)}</span>
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
              className={`payment-btn ${paymentType === "ONLINE" ? "active" : ""
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