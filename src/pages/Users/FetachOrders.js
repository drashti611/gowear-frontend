import React, { useEffect, useState } from "react";
import { FaBox, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import getImageUrl from "../../utils/imageUrl";
import "../../css/Customercss/MyOrders.css";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [filterStatus, setFilterStatus] = useState("All");

  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await API.get(`/order/user/${userId}`);
        setOrders(res.data || []);
      } catch (error) {
        console.error("Failed to load orders:", error);
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
    const confirmCancel = window.confirm("Are you sure you want to cancel this order?");
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
                  order.paymentType === "COD" ? "Cancelled" : order.paymentStatus,
              }
            : order
        )
      );
      alert("Order cancelled successfully.");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to cancel order.");
    }
  };

  const statusOptions = ["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

  const filteredOrders =
    filterStatus === "All"
      ? orders
      : orders.filter((order) => order.orderStatus === filterStatus);

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered": return "badge-status-delivered";
      case "shipped": return "badge-status-shipped";
      case "processing": return "badge-status-processing";
      case "cancelled": return "badge-status-cancelled";
      default: return "badge-status-pending";
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading orders...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page-wrapper container">
      <div className="orders-header-row">
        <div>
          <h2 className="orders-page-title">My Orders History</h2>
          <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
            Track, view invoice, and manage your GoWear purchases
          </p>
        </div>

        <div className="status-filter-pills">
          {statusOptions.map((s) => (
            <button
              key={s}
              type="button"
              className={`status-pill-btn ${filterStatus === s ? "active" : ""}`}
              onClick={() => setFilterStatus(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="empty-cart-view">
          <FaBox className="empty-cart-icon" />
          <h3 style={{ fontSize: "22px", fontWeight: 800 }}>No Orders Found</h3>
          <p className="text-muted" style={{ fontSize: "14px", marginBottom: "24px" }}>
            {filterStatus === "All"
              ? "You haven't placed any orders yet."
              : `No orders found with status "${filterStatus}".`}
          </p>
          <button className="btn-luxury-primary" onClick={() => navigate("/")}>
            Explore Trending Styles <FaArrowRight />
          </button>
        </div>
      ) : (
        filteredOrders.map((order) => {
          const isExpanded = !!expandedOrders[order._id];

          return (
            <div key={order._id} className="order-luxury-card">
              {/* Header */}
              <div className="order-card-header">
                <div>
                  Order ID: <span className="order-id-tag">{order._id}</span>
                </div>
                <div>
                  Placed on: <strong>{new Date(order.createdAt).toLocaleDateString()}</strong>
                </div>
              </div>

              {/* Items */}
              <div className="order-items-list">
                {order.items?.map((item) => (
                  <div key={item._id} className="order-item-row">
                    <img
                      src={getImageUrl(item.productId?.images?.[0])}
                      alt={item.productId?.name || "Apparel"}
                      className="order-item-img"
                    />
                    <div className="order-item-details">
                      <h4>{item.productId?.name}</h4>
                      <p>
                        Color: <strong>{item.variant?.color || "Standard"}</strong>
                        {item.variant?.size && (
                          <> • Size: <strong>{item.variant.size}</strong></>
                        )}
                        {" "}• Qty: <strong>{item.quantity}</strong>
                      </p>
                      <p style={{ fontWeight: 700, color: "var(--text-primary)", marginTop: "2px" }}>
                        ₹{item.price?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Collapsible Details */}
              {isExpanded && (
                <div className="p-4 bg-light border-top">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <h6 style={{ fontWeight: 700, fontSize: "13px" }}>Delivery Address</h6>
                      <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
                        {order.address?.street}, {order.address?.city}, {order.address?.state} - {order.address?.pincode}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <h6 style={{ fontWeight: 700, fontSize: "13px" }}>Payment Details</h6>
                      <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
                        Method: <strong>{order.paymentType}</strong> • Status:{" "}
                        <strong>{order.paymentStatus}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="order-card-footer">
                <div className="d-flex align-items-center gap-3">
                  <span className={`order-badge-status ${getStatusBadgeClass(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                  <div className="order-amount-block">
                    Total: <strong>₹{(order.finalAmount || order.totalAmount || 0).toLocaleString()}</strong>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    className="btn-luxury-secondary"
                    style={{ padding: "6px 14px", fontSize: "12px" }}
                    onClick={() => toggleExpand(order._id)}
                  >
                    {isExpanded ? "Hide Details" : "View Details"}
                  </button>

                  {order.orderStatus !== "Delivered" && order.orderStatus !== "Cancelled" && (
                    <button
                      type="button"
                      className="cancel-order-btn"
                      onClick={() => cancelOrder(order._id)}
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
