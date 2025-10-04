import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../css/AdminCss/AdminCategoryPage.css";
import { FaEdit, FaTrash } from "react-icons/fa"; // <-- React Icons

export default function AdminCategoryPage() {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await API.get("/category");
      setCategories(res.data);
      setFilteredCategories(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Error fetching categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Search filter
  useEffect(() => {
    const filtered = categories.filter((cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCategories(filtered);
  }, [searchTerm, categories]);

  // Add or update category
  const handleSubmit = async () => {
    if (!name) return alert("Enter category name");
    try {
      if (editingId) {
        await API.put(`/category/${editingId}`, { name });
        setToastMessage(`Category "${name}" updated successfully!`);
      } else {
        await API.post("/category", { name });
        setToastMessage(`Category "${name}" added successfully!`);
      }
      setName("");
      setEditingId(null);
      setShowModal(false);
      fetchCategories();
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  // Delete category
  const confirmDelete = (id, name) => {
    setDeleteId(id);
    setDeleteName(name);
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/category/${deleteId}`);
      setShowModal(false);
      setToastMessage(`Category "${deleteName}" deleted successfully!`);
      setShowToast(true);
      setDeleteId(null);
      setDeleteName("");
      fetchCategories();
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting category");
    }
  };

  // Edit category
  const handleEdit = (cat) => {
    setName(cat.name);
    setEditingId(cat._id);
    setShowModal(true);
  };

  return (
    <div className="container my-4">
      {/* Header: Title + Search + Add */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-sidebar mb-0">Manage Categories</h2>
        <div className="d-flex gap-2">
          <input
            type="text"
            className="form-control shadow-sm"
            placeholder="Search category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="btn btn-sidebar shadow-sm"
            onClick={() => {
              setName("");
              setEditingId(null);
              setShowModal(true);
            }}
          >
            Add
          </button>
        </div>
      </div>

      {/* Category Cards */}
      <div className="row g-3">
        {filteredCategories.map((cat) => (
          <div className="col-md-4" key={cat._id}>
            <div className="card shadow-sm border-0 category-card">
              <div className="card-body d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">{cat.name}</h5>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-outline-warning btn-sm d-flex align-items-center justify-content-center"
                    onClick={() => handleEdit(cat)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center"
                    onClick={() => confirmDelete(cat._id, cat.name)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredCategories.length === 0 && (
          <p className="text-center text-muted mt-3">No categories found.</p>
        )}
      </div>

      {/* Modal for Add/Edit/Delete */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-sidebar text-white">
                <h5 className="modal-title">
                  {deleteId
                    ? "Delete Category"
                    : editingId
                    ? "Edit Category"
                    : "Add Category"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowModal(false);
                    setDeleteId(null);
                    setDeleteName("");
                  }}
                ></button>
              </div>
              <div className="modal-body">
                {deleteId ? (
                  `Are you sure you want to delete category "${deleteName}"?`
                ) : (
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Category name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                )}
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    setDeleteId(null);
                    setDeleteName("");
                  }}
                >
                  {deleteId ? "No" : "Cancel"}
                </button>
                <button
                  className={`btn ${
                    deleteId ? "btn-danger" : "btn-sidebar"
                  }`}
                  onClick={deleteId ? handleDelete : handleSubmit}
                >
                  {deleteId ? "Yes" : editingId ? "Update" : "Add"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div
          className="toast show position-fixed bottom-0 end-0 m-3 bg-success text-white"
          role="alert"
        >
          <div className="toast-body">{toastMessage}</div>
        </div>
      )}
    </div>
  );
}
