import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../css/AdminCss/AdminCategoryPage.css";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function AdminSubCategoryPage() {
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Fetch all categories for dropdown
  const fetchCategories = async () => {
    try {
      const res = await API.get("/category");
      setCategories(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Error fetching categories");
    }
  };

  // ✅ Fetch all subcategories
  const fetchSubCategories = async () => {
    try {
      const res = await API.get("/subcategory/viewSubCategory");
      setSubCategories(res.data);
      setFilteredSubCategories(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Error fetching subcategories");
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
  }, []);

  // ✅ Search filter
  useEffect(() => {
    const filtered = subCategories.filter(
      (sub) =>
        sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.categoryId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSubCategories(filtered);
  }, [searchTerm, subCategories]);

  // ✅ Add or Update SubCategory
  const handleSubmit = async () => {
    if (!name || !categoryId) return alert("Please fill all fields");

    try {
      if (editingId) {
        await API.put(`/subcategory/update/${editingId}`, {
          name,
          categoryId,
        });
        setToastMessage(`Subcategory "${name}" updated successfully!`);
      } else {
        await API.post("/subcategory/addSubCategory", {
          name,
          categoryId,
        });
        setToastMessage(`Subcategory "${name}" added successfully!`);
      }
      setName("");
      setCategoryId("");
      setEditingId(null);
      setShowModal(false);
      fetchSubCategories();
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Error saving subcategory");
    }
  };

  // ✅ Confirm Delete
  const confirmDelete = (id, name) => {
    setDeleteId(id);
    setDeleteName(name);
    setShowModal(true);
  };

  // ✅ Delete SubCategory
  const handleDelete = async () => {
    try {
      await API.delete(`/subcategory/delete/${deleteId}`);
      setShowModal(false);
      setToastMessage(`Subcategory "${deleteName}" deleted successfully!`);
      setShowToast(true);
      setDeleteId(null);
      setDeleteName("");
      fetchSubCategories();
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting subcategory");
    }
  };

  // ✅ Edit SubCategory
  const handleEdit = (sub) => {
    setName(sub.name);
    setCategoryId(sub.categoryId?._id);
    setEditingId(sub._id);
    setShowModal(true);
  };

  return (
    <div className="container my-4">
      {/* Header: Title + Search + Add */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-sidebar mb-0">Manage Subcategories</h2>
        <div className="d-flex gap-2">
          <input
            type="text"
            className="form-control shadow-sm"
            placeholder="Search subcategory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="btn btn-sidebar shadow-sm"
            onClick={() => {
              setName("");
              setCategoryId("");
              setEditingId(null);
              setShowModal(true);
            }}
          >
            Add
          </button>
        </div>
      </div>

      {/* Subcategory Cards */}
      <div className="row g-3">
        {filteredSubCategories.map((sub) => (
          <div className="col-md-4" key={sub._id}>
            <div className="card shadow-sm border-0 category-card">
              <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="card-title mb-0">{sub.name}</h5>
                  <small className="text-muted">
                    Category: {sub.categoryId?.name || "N/A"}
                  </small>
                </div>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-outline-warning btn-sm d-flex align-items-center justify-content-center"
                    onClick={() => handleEdit(sub)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center"
                    onClick={() => confirmDelete(sub._id, sub.name)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredSubCategories.length === 0 && (
          <p className="text-center text-muted mt-3">No subcategories found.</p>
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
                    ? "Delete Subcategory"
                    : editingId
                    ? "Edit Subcategory"
                    : "Add Subcategory"}
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
                  `Are you sure you want to delete subcategory "${deleteName}"?`
                ) : (
                  <>
                    <input
                      type="text"
                      className="form-control mb-3"
                      placeholder="Subcategory name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <select
                      className="form-select"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </>
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
                  className={`btn ${deleteId ? "btn-danger" : "btn-sidebar"}`}
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
