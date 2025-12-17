import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../css/AdminCss/AdminProductPage.css";
import { FaEdit, FaTrash, FaTimes } from "react-icons/fa";

export default function AdminClothingTypePage() {
  const [clothingTypes, setClothingTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState([]);
  const [subCategoryId, setSubCategoryId] = useState("");
  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  /* ================= FETCH DATA ================= */

  const fetchClothingTypes = async () => {
    try {
      const res = await API.get("/product_type");
      setClothingTypes(res.data);
    } catch (err) {
      console.error(err);
      alert("Error fetching clothing types");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await API.get("/category");
      setCategories(res.data);
    } catch (err) {
      console.error(err);
      alert("Error fetching categories");
    }
  };
  const handleCategoryChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
    setCategoryId(selected);
  };

  // ✅ FIXED: This now properly searches the categories array
  const getCategoryNames = (categoryIds) => {
    if (!categoryIds || categoryIds.length === 0) return "N/A";

    const names = categoryIds
      .map((catId) => {
        // If already populated with name property
        if (catId?.name) return catId.name;

        // Extract ID (handle both string and object with _id)
        const id = typeof catId === "string" ? catId : catId?._id;

        // Find category name from categories array
        const category = categories.find((cat) => cat._id === id);
        return category?.name;
      })
      .filter(Boolean); // Remove any undefined/null values

    return names.length > 0 ? names.join(", ") : "N/A";
  };

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
    fetchCategories();
    fetchSubCategories();
  }, []);

  /* ================= IMAGE HANDLING ================= */

  const handleImageChange = (e) => {
    if (e.target.files?.[0]) {
      setImage(e.target.files[0]);
      setExistingImage(null);
    }
  };

  const removeNewImage = () => setImage(null);

  /* ================= ADD / UPDATE ================= */

  const handleSubmit = async () => {
    if (!name || categoryId.length === 0 || !subCategoryId) {
      return alert("Name, Category and SubCategory are required");
    }

    const formData = new FormData();
    formData.append("type", "product");
    formData.append("name", name);
    formData.append("subCategoryId", subCategoryId);

    // ✅ MULTIPLE CATEGORY IDs
    categoryId.forEach((id) => {
      formData.append("categoryId[]", id);
    });

    if (image) formData.append("image", image);

    if (editingId) {
      await API.put(`/product_type/update/${editingId}`, formData);
    } else {
      await API.post("/product_type/addProductType", formData);
    }

    resetForm();
    fetchClothingTypes();
  };

  /* ================= EDIT ================= */

  const handleEdit = (type) => {
    setName(type.name);
    setSubCategoryId(type.subCategoryId?._id || "");
    setCategoryId(
      Array.isArray(type.categoryId)
        ? type.categoryId.map((c) => c._id || c)
        : []
    );
    setEditingId(type._id);
    setExistingImage(type.images?.[0] || null);
    setImage(null);
    setShowModal(true);
  };

  /* ================= DELETE ================= */

  const handleDelete = async (type) => {
    if (!window.confirm(`Delete "${type.name}"?`)) return;
    try {
      await API.delete(`/product_type/${type._id}`);
      setToastMessage("Clothing type deleted successfully");
      fetchClothingTypes();
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch {
      alert("Delete failed");
    }
  };

  /* ================= HELPERS ================= */

  const resetForm = () => {
    setName("");
    setCategoryId([]);
    setSubCategoryId("");
    setImage(null);
    setExistingImage(null);
    setEditingId(null);
    setShowModal(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const fullImageUrl = (path) =>
    path?.startsWith("http") ? path : `http://localhost:5000/${path}`;

  /* ================= UI ================= */

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between mb-3">
        <h3 className="text-sidebar">Manage Clothing Types</h3>
        <button
          className="btn btn-sidebar"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          Add
        </button>
      </div>

      {/* TABLE */}
      <table className="table table-bordered table-hover">
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Category</th>
            <th>SubCategory</th>
            <th>Image</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {clothingTypes.map((type, i) => (
            <tr key={type._id}>
              <td>{i + 1}</td>
              <td>{type.name}</td>
              <td>
                {/* ✅ Now properly displays category names */}
                {getCategoryNames(type.categoryId)}
              </td>
              <td>{type.subCategoryId?.name || "N/A"}</td>
              <td>
                {type.images?.[0] ? (
                  <img
                    src={fullImageUrl(type.images[0])}
                    width={50}
                    height={50}
                    style={{ objectFit: "cover" }}
                    alt={type.name}
                  />
                ) : (
                  "No Image"
                )}
              </td>
              <td>
                <button
                  className="btn btn-warning btn-sm me-1"
                  onClick={() => handleEdit(type)}
                >
                  <FaEdit />
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(type)}
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
          {clothingTypes.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center text-muted">
                No records found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* MODAL */}
      {showModal && (
        <div className="modal fade show d-block bg-dark bg-opacity-50">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-sidebar text-white">
                <h5>{editingId ? "Edit" : "Add"} Clothing Type</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>

              <div className="modal-body">
                <input
                  className="form-control mb-2"
                  placeholder="Type Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                {/* CATEGORY */}
                {/* CATEGORY (MULTI SELECT) */}
                <select
                  className="form-control mb-2"
                  multiple
                  value={categoryId}
                  onChange={handleCategoryChange}
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <small className="text-muted">
                  Hold Ctrl (Windows) / Cmd (Mac) to select multiple categories
                </small>

                {/* SUBCATEGORY */}
                <select
                  className="form-control mb-2"
                  value={subCategoryId}
                  onChange={(e) => setSubCategoryId(e.target.value)}
                >
                  <option value="">Select SubCategory</option>
                  {subCategories.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>

                {/* IMAGE */}
                {existingImage && (
                  <div className="mb-2 position-relative">
                    <img
                      src={fullImageUrl(existingImage)}
                      width={80}
                      height={80}
                      alt="Existing"
                    />
                    <FaTimes
                      onClick={() => setExistingImage(null)}
                      className="text-danger position-absolute top-0 end-0"
                      style={{ cursor: "pointer" }}
                    />
                  </div>
                )}

                {image && (
                  <div className="mb-2 position-relative">
                    <img
                      src={URL.createObjectURL(image)}
                      width={80}
                      height={80}
                      alt="New"
                    />
                    <FaTimes
                      onClick={removeNewImage}
                      className="text-danger position-absolute top-0 end-0"
                      style={{ cursor: "pointer" }}
                    />
                  </div>
                )}

                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={handleImageChange}
                />
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

      {/* TOAST */}
      {showToast && (
        <div className="toast show position-fixed bottom-0 end-0 m-3">
          <div className="toast-body">{toastMessage}</div>
        </div>
      )}
    </div>
  );
}
