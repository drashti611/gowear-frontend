import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../css/AdminCss/AdminCategoryPage.css";
import { FaEdit, FaTrash, FaTimes } from "react-icons/fa";

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
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToRemove, setImagesToRemove] = useState([]);

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

  // Image handling
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages([...images, ...files]);
  };

  const removeNewImage = (index) => {
    const updated = [...images];
    updated.splice(index, 1);
    setImages(updated);
  };

  const removeExistingImage = (img) => {
    setExistingImages(existingImages.filter((i) => i !== img));
    setImagesToRemove([...imagesToRemove, img]);
  };

  // Add or update category
  const handleSubmit = async () => {
    if (!name) return alert("Enter category name");

    const formData = new FormData();
    formData.append("name", name);
    images.forEach((img) => formData.append("images", img));
    if (editingId && imagesToRemove.length > 0) {
      formData.append("imagesToRemove", JSON.stringify(imagesToRemove));
    }

    try {
      if (editingId) {
        await API.put(`/category/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setToastMessage(`Category "${name}" updated successfully!`);
      } else {
        await API.post("/category", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setToastMessage(`Category "${name}" added successfully!`);
      }

      setName("");
      setEditingId(null);
      setImages([]);
      setExistingImages([]);
      setImagesToRemove([]);
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
    setExistingImages(cat.images || []);
    setImages([]);
    setImagesToRemove([]);
    setShowModal(true);
  };

  return (
    <div className="container my-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
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
              setImages([]);
              setExistingImages([]);
              setImagesToRemove([]);
              setShowModal(true);
            }}
          >
            Add
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Images</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.length > 0 ? (
              filteredCategories.map((cat, idx) => (
                <tr key={cat._id}>
                  <td>{idx + 1}</td>
                  <td>{cat.name}</td>
                  <td>
                    <div className="d-flex gap-2 flex-wrap">
                      {cat.images &&
                        cat.images.map((img, i) => (
                          <img
                            key={i}
                            src={`http://localhost:5000/${img}`}
                            alt={cat.name}
                            style={{
                              width: "60px",
                              height: "60px",
                              objectFit: "cover",
                              borderRadius: "5px",
                            }}
                          />
                        ))}
                    </div>
                  </td>
                  <td>
                    <button
                      className="btn btn-outline-warning btn-sm me-2"
                      onClick={() => handleEdit(cat)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => confirmDelete(cat._id, cat.name)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center text-muted">
                  No categories found.
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
                    setImages([]);
                    setExistingImages([]);
                    setImagesToRemove([]);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                {deleteId ? (
                  `Are you sure you want to delete category "${deleteName}"?`
                ) : (
                  <>
                    <input
                      type="text"
                      className="form-control mb-3"
                      placeholder="Category name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    {existingImages.length > 0 && (
                      <div className="mb-3 d-flex flex-wrap gap-2">
                        {existingImages.map((img, idx) => (
                          <div
                            key={idx}
                            className="position-relative"
                            style={{ display: "inline-block" }}
                          >
                            <img
                              src={`http://localhost:5000/${img}`}
                              alt="cat"
                              style={{
                                width: "80px",
                                height: "80px",
                                objectFit: "cover",
                                borderRadius: "5px",
                              }}
                            />
                            <FaTimes
                              className="position-absolute top-0 end-0 text-danger"
                              style={{
                                cursor: "pointer",
                                background: "white",
                                borderRadius: "50%",
                              }}
                              onClick={() => removeExistingImage(img)}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    {images.length > 0 && (
                      <div className="mb-3 d-flex flex-wrap gap-2">
                        {images.map((img, idx) => (
                          <div
                            key={idx}
                            className="position-relative"
                            style={{ display: "inline-block" }}
                          >
                            <img
                              src={URL.createObjectURL(img)}
                              alt="cat"
                              style={{
                                width: "80px",
                                height: "80px",
                                objectFit: "cover",
                                borderRadius: "5px",
                              }}
                            />
                            <FaTimes
                              className="position-absolute top-0 end-0 text-danger"
                              style={{
                                cursor: "pointer",
                                background: "white",
                                borderRadius: "50%",
                              }}
                              onClick={() => removeNewImage(idx)}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    <input
                      type="file"
                      className="form-control"
                      multiple
                      onChange={handleImageChange}
                    />
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
                    setImages([]);
                    setExistingImages([]);
                    setImagesToRemove([]);
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

      {/* Toast */}
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
