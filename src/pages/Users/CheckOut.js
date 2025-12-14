import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaCreditCard, FaTruck } from "react-icons/fa";
import "../../css/Customercss/Checkout.css";

export default function Checkout() {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [paymentType, setPaymentType] = useState("ONLINE");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [finalAmount, setFinalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const cartData = JSON.parse(localStorage.getItem("cart")) || [];
    const coupon = localStorage.getItem("appliedCoupon") || "";
    const amount = Number(localStorage.getItem("finalAmount")) || 0;

    setCart(cartData);
    setAppliedCoupon(coupon);
    setFinalAmount(amount);
  }, []);

  const applyCoupon = () => {
    if (!couponCode) return alert("Enter a coupon code");
    setAppliedCoupon(couponCode);
    localStorage.setItem("appliedCoupon", couponCode);
    alert(`Coupon ${couponCode} applied!`);
  };

  const removeCoupon = () => {
    setAppliedCoupon("");
    setCouponCode("");
    localStorage.removeItem("appliedCoupon");
    alert("Coupon removed");
  };

  const createOrder = async () => {
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
          couponCode: appliedCoupon,
          paymentType,
          address,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (paymentType === "COD") {
        alert("Order placed successfully");
        localStorage.removeItem("cart");
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
        navigate("/orders");
      },
      prefill: {
        name: "Customer",
        email: "customer@email.com",
      },
      theme: { color: "#3498db" },
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
          <h4>Shipping Address</h4>
          <div className="input-group">
            <FaMapMarkerAlt className="icon" />
            <input
              placeholder="Street"
              value={address.street}
              onChange={(e) =>
                setAddress({ ...address, street: e.target.value })
              }
            />
          </div>
          <div className="input-group">
            <FaMapMarkerAlt className="icon" />
            <input
              placeholder="City"
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
            />
          </div>
          <div className="input-group">
            <FaMapMarkerAlt className="icon" />
            <input
              placeholder="State"
              value={address.state}
              onChange={(e) =>
                setAddress({ ...address, state: e.target.value })
              }
            />
          </div>
          <div className="input-group">
            <FaMapMarkerAlt className="icon" />
            <input
              placeholder="Pincode"
              value={address.pincode}
              onChange={(e) =>
                setAddress({ ...address, pincode: e.target.value })
              }
            />
          </div>
        </div>

        {/* Coupon Section */}
        <div className="section">
          <h4>Coupon</h4>
          <div className="coupon-group">
            <input
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
            />
            {appliedCoupon ? (
              <button className="remove-btn" onClick={removeCoupon}>
                Remove
              </button>
            ) : (
              <button className="apply-btn" onClick={applyCoupon}>
                Apply
              </button>
            )}
          </div>
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
              <FaCreditCard /> Online
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
          <h3>Total: ₹{finalAmount}</h3>
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
