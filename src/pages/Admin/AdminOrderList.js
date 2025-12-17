import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import { toast } from "react-toastify";

export default function AdminOrderStatus() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await API.get("/order");
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await API.put(`/order/status/${orderId}`, {
        orderStatus: status,
      });
      toast.success("Order status updated");
      fetchOrders();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const statusBadge = (status) => {
    switch (status) {
      case "Pending":
        return "badge bg-warning text-dark";
      case "Processing":
        return "badge bg-primary";
      case "Shipped":
        return "badge bg-info";
      case "Delivered":
        return "badge bg-success";
      case "Cancelled":
        return "badge bg-danger";
      default:
        return "badge bg-secondary";
    }
  };

  if (loading) return <p>Loading orders...</p>;

  return (
    <div className="container-fluid mt-4">
      <h3 className="mb-3">Order Management</h3>

      <div className="table-responsive">
        <table className="table table-hover table-bordered align-middle">
          <thead className="table-dark text-center">
            <tr>
              <th>#</th>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Order Status</th>
              <th>Update Status</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order, index) => (
              <tr key={order._id}>
                <td className="text-center">{index + 1}</td>

                <td className="text-break">{order._id.slice(-8)}</td>

                <td>
                  <strong>{order.userId?.name}</strong>
                  <br />
                  <small>{order.userId?.email}</small>
                </td>

                <td>
                  {order.items.map((item, i) => (
                    <div key={i}>
                      {item.productId?.name} × {item.quantity}
                    </div>
                  ))}
                </td>

                <td className="text-center">₹{order.totalAmount}</td>

                <td className="text-center">
                  <div>{order.paymentType}</div>
                  <small className="text-muted">{order.paymentStatus}</small>
                </td>

                <td className="text-center">
                  <span className={statusBadge(order.orderStatus)}>
                    {order.orderStatus}
                  </span>
                </td>

                <td>
                  <select
                    className="form-select"
                    value={order.orderStatus}
                    disabled={order.orderStatus === "Delivered"}
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                  >
                    <option>Pending</option>
                    <option>Processing</option>
                    <option>Shipped</option>
                    <option>Delivered</option>
                    <option>Cancelled</option>
                  </select>
                </td>

                <td className="text-center">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
