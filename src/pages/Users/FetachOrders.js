import React, { useEffect, useState } from "react";
import "../../css/Customercss/MyOrders.css";
import API from "../../api/axios";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState({}); // Track expanded state

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) return;

    const fetchOrders = async () => {
      try {
        const res = await API.get(`/order/user/${userId}`);
        setOrders(res.data);
      } catch (error) {
        console.error("Failed to fetch orders", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  const toggleExpand = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const cancelOrder = async (orderId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this order?"
    );
    if (!confirmCancel) return;

    try {
      await API.put(`/order/cancel/${orderId}`);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                orderStatus: "Cancelled",
                paymentStatus:
                  order.paymentType === "COD"
                    ? "Cancelled"
                    : order.paymentStatus,
              }
            : order
        )
      );
      alert("Order cancelled successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Cancel failed");
    }
  };

  if (loading) return <p className="orders-loading">Loading orders...</p>;
  if (orders.length === 0)
    return <p className="orders-empty">No orders found.</p>;

  return (
    <div className="orders-container">
      <h2>My Orders</h2>

      {orders.map((order) => (
        <div className="order-card" key={order._id}>
          {/* ORDER HEADER */}
          <div className="order-header">
            <div>
              <strong>Order ID:</strong> {order._id}
            </div>
            <div>
              <strong>Date:</strong>{" "}
              {new Date(order.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* PRODUCT ITEMS - Always Visible */}
          {order.items.map((item) => (
            <div className="order-item" key={item._id}>
              <img
                src={`http://localhost:5000/${item.productId.images[0]}`}
                alt={item.productId.name}
              />
              <div className="order-item-details">
                <h4>{item.productId.name}</h4>
                <p>
                  Color: <strong>{item.variant?.color || "N/A"}</strong>
                  {item.variant?.size && (
                    <>
                      {" | "}Size: <strong>{item.variant.size}</strong>
                    </>
                  )}
                </p>
                <p>Qty: {item.quantity}</p>
                <p>Price: ₹{item.price}</p>
              </div>
            </div>
          ))}

          {/* COLLAPSIBLE ORDER DETAILS */}
          {expandedOrders[order._id] && (
            <>
              {/* ORDER SUMMARY */}
              <div className="order-summary">
                <p>
                  Total Amount: <strong>₹{order.totalAmount.toFixed(2)}</strong>
                </p>
                {order.discount > 0 && (
                  <p className="discount">
                    Discount: -₹{order.discount.toFixed(2)}
                  </p>
                )}
                <p className="final-amount">
                  Final Amount: ₹{order.finalAmount.toFixed(2)}
                </p>
                {order.appliedCoupon && (
                  <p className="coupon">
                    Coupon Applied: <strong>{order.appliedCoupon.code}</strong>
                  </p>
                )}
              </div>

              {/* ADDRESS */}
              <div className="order-address">
                <strong>Delivery Address:</strong>
                <p>
                  {order.address.street}, {order.address.city},{" "}
                  {order.address.state} - {order.address.pincode}
                </p>
              </div>

              {/* STATUS + CANCEL */}
              <div className="order-status">
                <span>
                  Payment:{" "}
                  <strong
                    className={order.paymentStatus === "Paid" ? "paid" : "pending"}
                  >
                    {order.paymentStatus}
                  </strong>
                </span>

                <span>
                  Order Status: <strong>{order.orderStatus}</strong>
                </span>

                <span>
                  Payment Mode: <strong>{order.paymentType}</strong>
                </span>

                {order.orderStatus !== "Delivered" &&
                  order.orderStatus !== "Cancelled" && (
                    <button
                      className="cancel-btn"
                      onClick={() => cancelOrder(order._id)}
                    >
                      Cancel Order
                    </button>
                  )}
              </div>
            </>
          )}

          {/* VIEW MORE / LESS BUTTON */}
          <div style={{ padding: "1rem 2rem" }}>
            <button
              className="cancel-btn"
             style={{
      backgroundColor: "white",      // White background
      color: "#4f46e5",               // Text in purple
      border: "2px solid #4f46e5"     // Optional: purple border for better visibility
    }}
              onClick={() => toggleExpand(order._id)}
            >
              {expandedOrders[order._id] ? "View Less" : "View More"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
