import { useEffect, useState } from "react";
import API from "../../api/axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { FiPlus, FiTrash2, FiToggleLeft, FiToggleRight } from "react-icons/fi";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    maxDiscount: "",
    minOrderValue: "",
    expiryDate: "",
  });
  const [loading, setLoading] = useState(false);

  /* =========================
     Fetch Coupons
  ========================= */
  const fetchCoupons = async () => {
    const res = await API.get("/Coupon");
    setCoupons(res.data);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  /* =========================
     Handle Input
  ========================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  /* =========================
     Create Coupon
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await API.post("/Coupon/create", {
        ...form,
        code: form.code.toUpperCase(),
        maxDiscount:
          form.discountType === "percentage" ? form.maxDiscount : null,
      });

      setForm({
        code: "",
        discountType: "percentage",
        discountValue: "",
        maxDiscount: "",
        minOrderValue: "",
        expiryDate: "",
      });

      fetchCoupons();
      alert("Coupon created successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Error creating coupon");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     Toggle Coupon Status
  ========================= */
  const toggleStatus = async (id) => {
    await API.put(`/Coupon/UpdateStatusCoupon/${id}`);
    fetchCoupons();
  };

  /* =========================
     Delete Coupon
  ========================= */
  const deleteCoupon = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    await API.delete(`/Coupon/${id}`);
    fetchCoupons();
  };

  return (
    <div className="container-fluid">
      <h4 className="mb-4">Manage Coupons</h4>

      {/* =========================
          Create Coupon Form
      ========================= */}
      <form onSubmit={handleSubmit} className="card p-3 mb-4">
        <div className="row g-3">
          <div className="col-md-3">
            <label className="form-label">Coupon Code</label>
            <input
              type="text"
              name="code"
              className="form-control"
              value={form.code}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">Discount Type</label>
            <select
              name="discountType"
              className="form-select"
              value={form.discountType}
              onChange={handleChange}
            >
              <option value="percentage">Percentage</option>
              <option value="flat">Flat</option>
            </select>
          </div>

          <div className="col-md-2">
            <label className="form-label">
              Discount {form.discountType === "percentage" ? "%" : "₹"}
            </label>
            <input
              type="number"
              name="discountValue"
              className="form-control"
              value={form.discountValue}
              onChange={handleChange}
              required
            />
          </div>

          {form.discountType === "percentage" && (
            <div className="col-md-2">
              <label className="form-label">Max Discount (₹)</label>
              <input
                type="number"
                name="maxDiscount"
                className="form-control"
                value={form.maxDiscount}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="col-md-2">
            <label className="form-label">Min Order Value (₹)</label>
            <input
              type="number"
              name="minOrderValue"
              className="form-control"
              value={form.minOrderValue}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">Expiry Date</label>
            <input
              type="date"
              name="expiryDate"
              className="form-control"
              value={form.expiryDate}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="mt-3">
          <button className="btn btn-primary" disabled={loading}>
            <FiPlus className="me-1" />
            Create Coupon
          </button>
        </div>
      </form>

      {/* =========================
          Coupons Table
      ========================= */}
      <div className="card">
        <table className="table table-bordered table-hover m-0">
          <thead className="table-light">
            <tr>
              <th>Code</th>
              <th>Discount</th>
              <th>Min Order</th>
              <th>Expiry</th>
              <th>Status</th>
              <th width="140">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c._id}>
                <td>{c.code}</td>
                <td>
                  {c.discountType === "percentage"
                    ? `${c.discountValue}% (Max ₹${c.maxDiscount || "-"})`
                    : `₹${c.discountValue}`}
                </td>
                <td>₹{c.minOrderValue}</td>
                <td>{new Date(c.expiryDate).toLocaleDateString()}</td>
                <td>
                  <span
                    className={`badge ${
                      c.isActive ? "bg-success" : "bg-secondary"
                    }`}
                  >
                    {c.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => toggleStatus(c._id)}
                  >
                    {c.isActive ? <FiToggleRight /> : <FiToggleLeft />}
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => deleteCoupon(c._id)}
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center">
                  No coupons found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
