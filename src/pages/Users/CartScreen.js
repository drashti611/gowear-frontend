import React, { useEffect, useState } from "react";
import { FaTrash, FaHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../../css/Customercss/CartScreen.css";

export default function CartScreen() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
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

  // Total items
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Total MRP (sum of original prices × quantity)
  const totalMRP = cart.reduce((acc, item) => {
    const basePrice =
      item.variants?.find((v) => v.color === item.selectedColor)?.sizes?.[0]?.price ||
      item.price ||
      0;
    return acc + basePrice * item.quantity;
  }, 0);

  // Total discount on MRP
  const totalDiscount = cart.reduce((acc, item) => {
    const basePrice =
      item.variants?.find((v) => v.color === item.selectedColor)?.sizes?.[0]?.price ||
      item.price ||
      0;
    const discountAmount = item.discount ? (basePrice * item.discount) / 100 : 0;
    return acc + discountAmount * item.quantity;
  }, 0);

  // Total amount after discount
  const totalAmount = totalMRP - totalDiscount;

  // Shipping calculation
  const freeShippingThreshold = 3000;
  const shipping = totalAmount >= freeShippingThreshold ? 0 : 100;
  const finalTotal = totalAmount + shipping;

  // Amount left for free shipping
  const amountForFreeShipping =
    totalAmount >= freeShippingThreshold
      ? 0
      : freeShippingThreshold - totalAmount;

  if (cart.length === 0)
    return <div className="cart-empty">Your cart is empty.</div>;

  return (
    <div className="cart-wrapper">
      {/* Left: Cart Items */}
      <div className="cart-left">
        {cart.map((item) => {
          const basePrice =
            item.variants?.find((v) => v.color === item.selectedColor)?.sizes?.[0]?.price ||
            item.price ||
            0;
          const discountedPrice = item.discount
            ? basePrice - (basePrice * item.discount) / 100
            : basePrice;

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
                <p>Color: <strong>{item.selectedColor || "N/A"}</strong></p>
                <div className="cart-price">
                  {item.discount > 0 ? (
                    <>
                      <span className="cart-price-discounted">₹{discountedPrice.toFixed(2)}</span>
                      <span className="cart-price-original">₹{basePrice.toFixed(2)}</span>
                    </>
                  ) : (
                    <span className="cart-price-discounted">₹{basePrice.toFixed(2)}</span>
                  )}
                </div>
                <div className="cart-qty">
                  <label>Qty:</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item._id, e.target.value)}
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
        <button
          className="cart-continue-btn"
          onClick={() => navigate("/")}
        >
          Continue Shopping
        </button>
      </div>

      {/* Right: Summary */}
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
          <div className="cart-summary-row total">
            <span>Total Amount</span>
            <span>₹{totalAmount.toFixed(2)}</span>
          </div>
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
            onClick={() => navigate("/checkout")}
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
