import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../css/AdminCss/AdminProductPage.css";
import { FaEdit, FaTrash, FaTimes } from "react-icons/fa";

export default function AdminClothingTypePage() {
  const [clothingTypes, setClothingTypes] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [name, setName] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [image, setImage] = useState(null); // local File selected
  const [existingImage, setExistingImage] = useState(null); // server image path string (e.g. "/uploads/...")
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Fetch all clothing types
  const fetchClothingTypes = async () => {
    try {
      const res = await API.get("/product_type");
      setClothingTypes(res.data);
    } catch (err) {
      console.error(err);
      alert("Error fetching clothing types");
    }
  };

  // Fetch subcategories
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

  // When user selects a file: preview local and hide server preview
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setExistingImage(null); // show local preview instead of server image
    }
  };

  const removeNewImage = () => setImage(null);
  // Note: backend doesn't support removing image without uploading new one.
  // So "remove existing" here just hides preview; if you want server deletion without upload,
  // backend must be extended to support a removeImage flag.

  // Add or update clothing type
  const handleSubmit = async () => {
    if (!name || !subCategoryId) return alert("Name and Subcategory required");

    try {
      const formData = new FormData();
      formData.append("type", "clothingType");
      formData.append("name", name);
      formData.append("subCategoryId", subCategoryId);
      // append image only if user selected a new file
      if (image) formData.append("image", image);

      if (editingId) {
        // endpoint: PUT /product_type/update/:id
        await API.put(`/product_type/update/${editingId}`, formData);
        setToastMessage(`Clothing type "${name}" updated successfully!`);
      } else {
        // endpoint: POST /product_type/addProductType
        await API.post("/product_type/addProductType", formData);
        setToastMessage(`Clothing type "${name}" added successfully!`);
      }

      // reset
      setName("");
      setSubCategoryId("");
      setImage(null);
      setExistingImage(null);
      setEditingId(null);
      setShowModal(false);
      setShowToast(true);
      fetchClothingTypes();
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error("Save error:", err, err.response?.data);
      alert(
        err.response?.data?.message ||
          err.message ||
          "Error saving clothing type"
      );
    }
  };

  // Edit a clothing type
  const handleEdit = (type) => {
    setName(type.name);
    setSubCategoryId(type.subCategoryId?._id || "");
    setEditingId(type._id);
    // show server image preview when editing (if present)
    setExistingImage(type.images?.[0] || null);
    setImage(null);
    setShowModal(true);
  };

  // Delete a clothing type
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

  // Helper to build full image URL (backend stores path with leading slash)
  const fullImageUrl = (imgPath) => {
    if (!imgPath) return null;
    // If imgPath already starts with http, return as is
    if (imgPath.startsWith("http")) return imgPath;
    // otherwise prefix server host
    return `http://localhost:5000${
      imgPath.startsWith("/") ? imgPath : `/${imgPath}`
    }`;
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
            setImage(null);
            setExistingImage(null);
            setEditingId(null);
            setShowModal(true);
          }}
        >
          Add
        </button>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>SubCategory</th>
              <th>Image</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clothingTypes.map((type, index) => (
              <tr key={type._id}>
                <td>{index + 1}</td>
                <td>{type.name}</td>
                <td>{type.subCategoryId?.name || "N/A"}</td>
                <td style={{ width: 80 }}>
                  {type.images?.[0] ? (
                    <img
                      src={fullImageUrl(type.images[0])}
                      alt={type.name}
                      style={{
                        width: 50,
                        height: 50,
                        objectFit: "cover",
                        borderRadius: 4,
                      }}
                    />
                  ) : (
                    <span className="text-muted">No Image</span>
                  )}
                </td>
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
                <td colSpan={5} className="text-center text-muted">
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
                <h5 className="modal-title">
                  {editingId ? "Edit Clothing Type" : "Add Clothing Type"}
                </h5>
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

                {/* Existing server image preview */}
                {existingImage && (
                  <div className="mb-2">
                    <div
                      style={{ display: "inline-block", position: "relative" }}
                    >
                      <img
                        src={fullImageUrl(existingImage)}
                        alt="existing"
                        style={{
                          width: 80,
                          height: 80,
                          objectFit: "cover",
                          borderRadius: 5,
                        }}
                      />
                      <FaTimes
                        onClick={() => setExistingImage(null)}
                        style={{
                          position: "absolute",
                          top: -8,
                          right: -8,
                          background: "white",
                          borderRadius: "50%",
                          padding: 2,
                          cursor: "pointer",
                          color: "red",
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* New image preview */}
                {image && (
                  <div className="mb-2">
                    <div
                      style={{ display: "inline-block", position: "relative" }}
                    >
                      <img
                        src={URL.createObjectURL(image)}
                        alt="preview"
                        style={{
                          width: 80,
                          height: 80,
                          objectFit: "cover",
                          borderRadius: 5,
                        }}
                      />
                      <FaTimes
                        onClick={removeNewImage}
                        style={{
                          position: "absolute",
                          top: -8,
                          right: -8,
                          background: "white",
                          borderRadius: "50%",
                          padding: 2,
                          cursor: "pointer",
                          color: "red",
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="mb-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control"
                    onChange={handleImageChange}
                  />
                  <small className="text-muted">
                    Select image to upload (optional)
                  </small>
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
        <div
          className="toast show position-fixed bottom-0 end-0 m-3"
          role="alert"
        >
          <div className="toast-body">{toastMessage}</div>
        </div>
      )}
    </div>
  );
}
