import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../css/AdminCss/AdminCategoryPage.css"; // can reuse same CSS
import { FaEdit, FaTrash } from "react-icons/fa";

export default function Brand() {
  const [brands, setBrands] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all brands
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

  // Add or update brand
  const handleSubmit = async () => {
    if (!name) return alert("Enter brand name");

    try {
      if (editingId) {
        await API.put(`/brand/update/${editingId}`, { name });
        setToastMessage(`Brand "${name}" updated successfully!`);
      } else {
        await API.post("/brand/addBrand", { name });
        setToastMessage(`Brand "${name}" added successfully!`);
      }

      setName("");
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
              setEditingId(null);
              setShowModal(true);
            }}
          >
            Add
          </button>
        </div>
      </div>

      {/* Brand Cards */}
      <div className="row g-3">
        {filteredBrands.map((brand) => (
          <div className="col-md-4" key={brand._id}>
            <div className="card shadow-sm border-0 category-card">
              <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="card-title mb-0">{brand.name}</h5>
                </div>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-outline-warning btn-sm d-flex align-items-center justify-content-center"
                    onClick={() => handleEdit(brand)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center"
                    onClick={() => confirmDelete(brand._id, brand.name)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredBrands.length === 0 && (
          <p className="text-center text-muted mt-3">No brands found.</p>
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
