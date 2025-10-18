import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../css/AdminCss/AdminProductPage.css"; // Reuse existing CSS
import { FaEdit, FaTrash } from "react-icons/fa";

export default function AdminClothingTypePage() {
  const [clothingTypes, setClothingTypes] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [name, setName] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // =========================
  // Fetch all clothing types
  // =========================
  const fetchClothingTypes = async () => {
    try {
      const res = await API.get("/product_type");
      setClothingTypes(res.data);
    } catch (err) {
      console.error(err);
      alert("Error fetching clothing types");
    }
  };

  // =========================
  // Fetch all subcategories
  // =========================
  const fetchSubCategories = async () => {
    try {
      const res = await API.get("/subCategory/viewSubCategory");
      setSubCategories(res.data);
    } catch (err) {
      console.error(err);
      alert("Error fetching subcategories");
    }
  };

  useEffect(() => {
    fetchClothingTypes();
    fetchSubCategories();
  }, []);

  // =========================
  // Add or update clothing type
  // =========================
  const handleSubmit = async () => {
    if (!name || !subCategoryId) return alert("Name and Subcategory required");
    try {
      if (editingId) {
        await API.put(`/product_type/${editingId}`, { name, subCategoryId });
        setToastMessage(`Clothing type "${name}" updated successfully!`);
      } else {
        await API.post("/product_type/addProductType", { name, subCategoryId });
        setToastMessage(`Clothing type "${name}" added successfully!`);
      }
      setName("");
      setSubCategoryId("");
      setEditingId(null);
      setShowModal(false);
      setShowToast(true);
      fetchClothingTypes();
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Error saving clothing type");
    }
  };

  // =========================
  // Edit a clothing type
  // =========================
  const handleEdit = (type) => {
    setName(type.name);
    setSubCategoryId(type.subCategoryId?._id || "");
    setEditingId(type._id);
    setShowModal(true);
  };

  // =========================
  // Delete a clothing type
  // =========================
  const handleDelete = async (type) => {
    if (!window.confirm(`Are you sure to delete "${type.name}"?`)) return;
    try {
      await API.delete(`/product_type/${type._id}`);
      setToastMessage(`Clothing type "${type.name}" deleted successfully!`);
      setShowToast(true);
      fetchClothingTypes();
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Error deleting clothing type");
    }
  };

  return (
    <div className="container my-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-sidebar mb-0">Manage Clothing Types</h2>
        <button
          className="btn btn-sidebar shadow-sm"
          onClick={() => {
            setName("");
            setSubCategoryId("");
            setEditingId(null);
            setShowModal(true);
          }}
        >
          Add
        </button>
      </div>

      {/* Clothing Types Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>SubCategory</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clothingTypes.map((type, index) => (
              <tr key={type._id}>
                <td>{index + 1}</td>
                <td>{type.name}</td>
                <td>{type.subCategoryId?.name || "N/A"}</td>
                <td>
                  <button
                    className="btn btn-outline-warning btn-sm me-1"
                    onClick={() => handleEdit(type)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleDelete(type)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
            {clothingTypes.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-muted">
                  No clothing types found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-sidebar text-white">
                <h5 className="modal-title">{editingId ? "Edit Clothing Type" : "Add Clothing Type"}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Clothing Type Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="mb-2">
                  <select
                    className="form-control"
                    value={subCategoryId}
                    onChange={(e) => setSubCategoryId(e.target.value)}
                  >
                    <option value="">Select SubCategory</option>
                    {subCategories.map((sub) => (
                      <option key={sub._id} value={sub._id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSubmit}>
                  {editingId ? "Update" : "Add"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <div className="toast show position-fixed bottom-0 end-0 m-3" role="alert">
          <div className="toast-body">{toastMessage}</div>
        </div>
      )}
    </div>
  );
}
