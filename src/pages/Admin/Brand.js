import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../css/AdminCss/AdminCategoryPage.css";
import { FaEdit, FaTrash, FaTimes } from "react-icons/fa";

export default function Brand() {
  const [brands, setBrands] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [name, setName] = useState("");
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToRemove, setImagesToRemove] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch brands
  const fetchBrands = async () => {
    try {
      const res = await API.get("/brand/viewBrand");
      setBrands(res.data);
      setFilteredBrands(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Error fetching brands");
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  // Search filter
  useEffect(() => {
    const filtered = brands.filter((b) =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBrands(filtered);
  }, [searchTerm, brands]);

  // Handle image selection
  const handleImageChange = (e) => {
    setImages([...images, ...Array.from(e.target.files)]);
  };

  const removeNewImage = (idx) => {
    const updated = [...images];
    updated.splice(idx, 1);
    setImages(updated);
  };

  const removeExistingImage = (img) => {
    setExistingImages(existingImages.filter((i) => i !== img));
    setImagesToRemove([...imagesToRemove, img]);
  };

  // Add/Update brand
  const handleSubmit = async () => {
    if (!name) return alert("Enter brand name");

    const formData = new FormData();
    formData.append("name", name);
    images.forEach((img) => formData.append("images", img));
    if (editingId && imagesToRemove.length > 0) {
      formData.append("imagesToRemove", JSON.stringify(imagesToRemove));
    }

    try {
      if (editingId) {
        await API.put(`/brand/update/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setToastMessage(`Brand "${name}" updated successfully!`);
      } else {
        await API.post("/brand/addBrand", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setToastMessage(`Brand "${name}" added successfully!`);
      }

      setName("");
      setImages([]);
      setExistingImages([]);
      setImagesToRemove([]);
      setEditingId(null);
      setShowModal(false);
      fetchBrands();
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Error saving brand");
    }
  };

  // Delete brand
  const confirmDelete = (id, name) => {
    setDeleteId(id);
    setDeleteName(name);
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/brand/delete/${deleteId}`);
      setShowModal(false);
      setToastMessage(`Brand "${deleteName}" deleted successfully!`);
      setShowToast(true);
      setDeleteId(null);
      setDeleteName("");
      fetchBrands();
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting brand");
    }
  };

  // Edit brand
  const handleEdit = (brand) => {
    setName(brand.name);
    setEditingId(brand._id);
    setExistingImages(brand.images || []);
    setImages([]);
    setImagesToRemove([]);
    setShowModal(true);
  };

  return (
    <div className="container my-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-sidebar mb-0">Manage Brands</h2>
        <div className="d-flex gap-2">
          <input
            type="text"
            className="form-control shadow-sm"
            placeholder="Search brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="btn btn-sidebar shadow-sm"
            onClick={() => {
              setName("");
              setImages([]);
              setExistingImages([]);
              setImagesToRemove([]);
              setEditingId(null);
              setShowModal(true);
            }}
          >
            Add
          </button>
        </div>
      </div>

      {/* Brand Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Images</th>
              <th>Brand Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBrands.length > 0 ? (
              filteredBrands.map((brand, index) => (
                <tr key={brand._id}>
                  <td>{index + 1}</td>
                  <td>
                    <div className="d-flex flex-wrap gap-2">
                      {brand.images?.length > 0 ? (
                        brand.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={`http://localhost:5000/${img}`}
                            alt={brand.name}
                            style={{
                              width: "50px",
                              height: "50px",
                              objectFit: "cover",
                              borderRadius: "4px",
                            }}
                          />
                        ))
                      ) : (
                        <span className="text-muted">No Image</span>
                      )}
                    </div>
                  </td>
                  <td>{brand.name}</td>
                  <td>
                    <button
                      className="btn btn-outline-warning btn-sm me-1"
                      onClick={() => handleEdit(brand)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => confirmDelete(brand._id, brand.name)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center text-muted">
                  No brands found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
                    ? "Delete Brand"
                    : editingId
                    ? "Edit Brand"
                    : "Add Brand"}
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
                  `Are you sure you want to delete brand "${deleteName}"?`
                ) : (
                  <>
                    <input
                      type="text"
                      className="form-control mb-2"
                      placeholder="Brand name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />

                    {/* Existing images */}
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
                              alt="brand"
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

                    {/* New images */}
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
                              alt="brand"
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
