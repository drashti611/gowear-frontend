import React, { useEffect, useState } from "react";
import "../../css/Customercss/MyOrders.css";
import API from "../../api/axios";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [filterStatus, setFilterStatus] = useState("All");

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

  const filteredOrders =
    filterStatus === "All"
      ? orders
      : orders.filter((order) => order.orderStatus === filterStatus);

  return (
    <div className="orders-container">
      <h2>My Orders</h2>

      {/* ===== FILTER DROPDOWN ALWAYS VISIBLE ===== */}
      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="statusFilter" style={{ marginRight: "0.5rem" }}>
          Filter by Status:
        </label>
        <select
          id="statusFilter"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: "0.3rem 0.5rem", borderRadius: "5px" }}
        >
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* ===== LOADING STATE ===== */}
      {loading && <p className="orders-loading">Loading orders...</p>}

      {/* ===== NO ORDERS FOUND ===== */}
      {!loading && filteredOrders.length === 0 && (
        <p className="orders-empty">No orders found for selected status.</p>
      )}

      {/* ===== ORDERS LIST ===== */}
      {filteredOrders.map((order) => (
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

          {/* PRODUCT ITEMS */}
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

          {/* COLLAPSIBLE DETAILS */}
          {expandedOrders[order._id] && (
            <>
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

              <div className="order-address">
                <strong>Delivery Address:</strong>
                <p>
                  {order.address.street}, {order.address.city},{" "}
                  {order.address.state} - {order.address.pincode}
                </p>
              </div>

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

          {/* VIEW MORE BUTTON */}
          <div style={{ padding: "1rem 2rem" }}>
            <button
              className="cancel-btn"
              style={{
                backgroundColor: "white",
                color: "#4f46e5",
                border: "2px solid #4f46e5",
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
