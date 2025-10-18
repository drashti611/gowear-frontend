import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../css/AdminCss/AdminCategoryPage.css";
import { FaEdit, FaTrash, FaTimes } from "react-icons/fa";

export default function AdminSubCategoryPage() {
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [name, setName] = useState("");
  const [categoryIds, setCategoryIds] = useState([]); // ✅ multiple categories
  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await API.get("/category");
      setCategories(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Error fetching categories");
    }
  };

  // Fetch subcategories
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

  // Search filter
  useEffect(() => {
    const filtered = subCategories.filter(
      (sub) =>
        sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.categoryIds?.some((cat) =>
          cat.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
    setFilteredSubCategories(filtered);
  }, [searchTerm, subCategories]);

  // Handle image selection
  const handleImageChange = (e) => setImage(e.target.files[0]);
  const removeImage = () => setImage(null);

  // Add or update subcategory
  const handleSubmit = async () => {
    if (!name || categoryIds.length === 0) return alert("Please fill all fields");

    const formData = new FormData();
    formData.append("name", name);
    categoryIds.forEach((id) => formData.append("categoryIds[]", id));
    if (image) formData.append("image", image);

    try {
      if (editingId) {
        await API.put(`/subcategory/update/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setToastMessage(`Subcategory "${name}" updated successfully!`);
      } else {
        await API.post("/subcategory/addSubCategory", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setToastMessage(`Subcategory "${name}" added successfully!`);
      }

      // Reset form
      setName("");
      setCategoryIds([]);
      setImage(null);
      setExistingImage(null);
      setEditingId(null);
      setShowModal(false);
      fetchSubCategories();
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Error saving subcategory");
    }
  };

  // Confirm delete
  const confirmDelete = (id, name) => {
    setDeleteId(id);
    setDeleteName(name);
    setShowModal(true);
  };

  // Delete subcategory
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

  // Edit subcategory
  const handleEdit = (sub) => {
    setName(sub.name);
    setCategoryIds(sub.categoryIds.map((cat) => cat._id));
    setEditingId(sub._id);
    setExistingImage(sub.images?.[0] || null);
    setImage(null);
    setShowModal(true);
  };

  return (
    <div className="container my-4">
      {/* Header */}
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
              setCategoryIds([]);
              setEditingId(null);
              setImage(null);
              setExistingImage(null);
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
              <th>Image</th>
              <th>Subcategory Name</th>
              <th>Categories</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubCategories.length > 0 ? (
              filteredSubCategories.map((sub, index) => (
                <tr key={sub._id}>
                  <td>{index + 1}</td>
                  <td>
                    {sub.images?.[0] ? (
                      <img
                        src={`http://localhost:5000/${sub.images[0]}`}
                        alt={sub.name}
                        style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "5px" }}
                      />
                    ) : (
                      <span className="text-muted">No Image</span>
                    )}
                  </td>
                  <td>{sub.name}</td>
                  <td>{sub.categoryIds.map((cat) => cat.name).join(", ")}</td>
                  <td>
                    <button className="btn btn-outline-warning btn-sm me-1" onClick={() => handleEdit(sub)}>
                      <FaEdit />
                    </button>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => confirmDelete(sub._id, sub.name)}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center text-muted">No subcategories found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-sidebar text-white">
                <h5 className="modal-title">{deleteId ? "Delete Subcategory" : editingId ? "Edit Subcategory" : "Add Subcategory"}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                {deleteId ? (
                  `Are you sure you want to delete subcategory "${deleteName}"?`
                ) : (
                  <>
                    <input type="text" className="form-control mb-3" placeholder="Subcategory name" value={name} onChange={(e) => setName(e.target.value)} />

                    {/* Multi-select categories */}
                    <select
                      className="form-select mb-3"
                      multiple
                      value={categoryIds}
                      onChange={(e) =>
                        setCategoryIds(Array.from(e.target.selectedOptions, (option) => option.value))
                      }
                    >
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                    <small className="text-muted">Hold Ctrl (Windows) or Cmd (Mac) to select multiple categories</small>

                    {/* Existing Image */}
                    {existingImage && (
                      <div className="mb-3 position-relative">
                        <img src={`http://localhost:5000/${existingImage}`} alt="subcat" style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "5px" }} />
                        <FaTimes className="position-absolute top-0 end-0 text-danger" style={{ cursor: "pointer", background: "white", borderRadius: "50%" }} onClick={() => setExistingImage(null)} />
                      </div>
                    )}

                    {/* New Image */}
                    {image && (
                      <div className="mb-3 position-relative">
                        <img src={URL.createObjectURL(image)} alt="subcat" style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "5px" }} />
                        <FaTimes className="position-absolute top-0 end-0 text-danger" style={{ cursor: "pointer", background: "white", borderRadius: "50%" }} onClick={removeImage} />
                      </div>
                    )}

                    <input type="file" className="form-control" onChange={handleImageChange} />
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className={`btn ${deleteId ? "btn-danger" : "btn-sidebar"}`} onClick={deleteId ? handleDelete : handleSubmit}>
                  {deleteId ? "Yes" : editingId ? "Update" : "Add"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <div className="toast show position-fixed bottom-0 end-0 m-3 bg-success text-white" role="alert">
          <div className="toast-body">{toastMessage}</div>
        </div>
      )}
    </div>
  );
}
