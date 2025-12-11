import React, { useEffect, useState, useRef } from "react";
import API from "../../api/axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../css/AdminCss/AdminCategoryPage.css";
import { FaEdit, FaTrash, FaTimes } from "react-icons/fa";

export default function AdminSubCategoryPage() {
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [name, setName] = useState("");
  const [categoryIds, setCategoryIds] = useState([]);
  const [image, setImage] = useState({}); // new file per categoryId
  const [existingImage, setExistingImage] = useState({}); // { categoryId: { _id, path } }
  const [removedImageIds, setRemovedImageIds] = useState([]); // list of existing image _id to remove
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // keep reference of initial existing images to detect removals (optional)
  const initialExistingRef = useRef({});

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await API.get("/category");
      setCategories(res.data || []);
    } catch (err) {
      alert(err.response?.data?.message || "Error fetching categories");
    }
  };

  // Fetch subcategories
  const fetchSubCategories = async () => {
    try {
      const res = await API.get("/subcategory/viewSubCategory");
      setSubCategories(res.data || []);
      setFilteredSubCategories(res.data || []);
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

  // Handle image selection for a category
  const handleImageChange = (categoryId, file) => {
    // if categoryId is undefined (legacy input) ignore
    if (!categoryId) return;
    setImage((prev) => ({ ...prev, [categoryId]: file }));
  };

  const removeImage = (categoryId) => {
    const existing = existingImage[categoryId];
    if (existing && existing._id) {
      setRemovedImageIds((prev) => {
        if (!prev.includes(existing._id)) return [...prev, existing._id];
        return prev;
      });
    }

    // remove from existingImage (so preview disappears)
    setExistingImage((prev) => {
      const copy = { ...prev };
      delete copy[categoryId];
      return copy;
    });

    // clear any newly selected file for this category (so input shows)
    setImage((prev) => {
      const copy = { ...prev };
      delete copy[categoryId];
      return copy;
    });

    // optional: if you want the file dialog to open automatically after removal,
    // you can trigger a click on the file input (I can show this if you want).
  };

  // Add or update subcategory
  const handleSubmit = async () => {
    if (!name || categoryIds.length === 0)
      return alert("Please fill all fields");

    // Quick client-side sanity check
    console.log(
      "DEBUG: image state keys:",
      Object.keys(image),
      "removedImageIds:",
      removedImageIds
    );

    // Build pairs from image state (only categories with a File)
    const pairs = Object.entries(image)
      .filter(([catId, file]) => catId && file) // ensure valid
      .map(([catId, file]) => ({ catId, file }));

    // Sanity: if you expect N files, pairs.length should be N
    console.log("DEBUG: pairs to upload:", pairs);

    const formData = new FormData();
    formData.append("type", "subcategory");
    formData.append("name", name.trim());

    // Keep sending selected categories (optional)
    categoryIds.forEach((id) => formData.append("categoryIds", id));

    // IMPORTANT: Append each pair as id THEN file (interleaved)
    pairs.forEach(({ catId, file }) => {
      formData.append("imageCategoryIds", catId); // id first
      formData.append("images", file); // then file
    });

    // Append removed images
    removedImageIds.forEach((imgId) =>
      formData.append("removeImageIds", imgId)
    );

    // DEBUG: Log FormData entries (order matters)
    console.log("=== FormData preview ===");
    for (const pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }
    console.log("=== counts ===", {
      pairsCount: pairs.length,
      formEntries: Array.from(formData.entries()).length,
    });

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

      // Reset UI
      setName("");
      setCategoryIds([]);
      setImage({});
      setExistingImage({});
      setRemovedImageIds([]);
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

  // Edit subcategory: populate fields + build existing image map (by categoryId)
  const handleEdit = (sub) => {
    setName(sub.name || "");
    const catIds = sub.categoryIds?.map((cat) => cat._id) || [];
    setCategoryIds(catIds);

    // Build maps for existing images. Expecting backend to return images like:
    // sub.images = [ { _id, categoryId, path }, ... ]
    const imagesMap = {};
    const initialMap = {};
    if (Array.isArray(sub.images)) {
      sub.images.forEach((imgObj) => {
        // ensure categoryId is present and imgObj.path is relative path
        const cid = imgObj.categoryId?.toString();
        if (cid) {
          imagesMap[cid] = { _id: imgObj._id, path: imgObj.path };
          initialMap[cid] = imgObj._id;
        }
      });
    }

    setExistingImage(imagesMap);
    initialExistingRef.current = initialMap;
    setImage({});
    setRemovedImageIds([]);
    setEditingId(sub._id);
    setShowModal(true);
  };

  // Helper: get category name from id (from categories state or sub.categoryIds)
  const getCategoryName = (categoryId) => {
    const cat = categories.find((c) => c._id === categoryId);
    if (cat) return cat.name;
    return categoryId;
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
              setImage({});
              setExistingImage({});
              setRemovedImageIds([]);
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
              <th>Images</th>
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
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {Array.isArray(sub.images) && sub.images.length > 0 ? (
                        sub.images.map((imgObj) => {
                          // imgObj might be either string path (legacy) or object {path, categoryId}
                          const imgPath =
                            typeof imgObj === "string"
                              ? imgObj
                              : imgObj.path || imgObj.url;
                          const catId =
                            typeof imgObj === "string"
                              ? null
                              : imgObj.categoryId || null;
                          return (
                            <div
                              key={imgObj._id || imgPath}
                              style={{ textAlign: "center" }}
                            >
                              <img
                                src={`http://localhost:5000/${imgPath}`}
                                alt={sub.name}
                                style={{
                                  width: 50,
                                  height: 50,
                                  objectFit: "cover",
                                  borderRadius: "5px",
                                  display: "block",
                                }}
                              />
                              <small
                                className="text-muted"
                                style={{ fontSize: 11 }}
                              >
                                {catId ? getCategoryName(catId) : ""}
                              </small>
                            </div>
                          );
                        })
                      ) : (
                        <span className="text-muted">No Image</span>
                      )}
                    </div>
                  </td>
                  <td>{sub.name}</td>
                  <td>{sub.categoryIds.map((cat) => cat.name).join(", ")}</td>
                  <td>
                    <button
                      className="btn btn-outline-warning btn-sm me-1"
                      onClick={() => handleEdit(sub)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => confirmDelete(sub._id, sub.name)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center text-muted">
                  No subcategories found.
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
                    ? "Delete Subcategory"
                    : editingId
                    ? "Edit Subcategory"
                    : "Add Subcategory"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
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

                    {/* Multi-select categories */}
                    <select
                      className="form-select mb-3"
                      multiple
                      value={categoryIds}
                      onChange={(e) =>
                        setCategoryIds(
                          Array.from(
                            e.target.selectedOptions,
                            (option) => option.value
                          )
                        )
                      }
                    >
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <small className="text-muted">
                      Hold Ctrl (Windows) or Cmd (Mac) to select multiple
                      categories
                    </small>

                    {/* For each selected category, show existing image (if any), preview new image, and file input */}
                    {categoryIds.map((catId) => {
                      const cat = categories.find((c) => c._id === catId);
                      const existing = existingImage[catId];
                      return (
                        <div key={catId} className="mb-3">
                          <label>{cat ? cat.name : catId} Image:</label>

                          {/* Existing image preview */}
                          {existing && existing.path && (
                            <div
                              className="position-relative mb-1"
                              style={{
                                display: "inline-block",
                                marginRight: 8,
                              }}
                            >
                              <img
                                src={`http://localhost:5000/${existing.path}`}
                                alt={cat?.name}
                                style={{
                                  width: 80,
                                  height: 80,
                                  objectFit: "cover",
                                  borderRadius: 5,
                                }}
                              />
                              <FaTimes
                                className="position-absolute top-0 end-0 text-danger"
                                style={{
                                  cursor: "pointer",
                                  background: "white",
                                  borderRadius: "50%",
                                }}
                                onClick={() => removeImage(catId)}
                              />
                            </div>
                          )}

                          {/* New selected image preview */}
                          {image[catId] && (
                            <div
                              className="position-relative mb-1"
                              style={{
                                display: "inline-block",
                                marginRight: 8,
                              }}
                            >
                              <img
                                src={URL.createObjectURL(image[catId])}
                                alt={cat?.name}
                                style={{
                                  width: 80,
                                  height: 80,
                                  objectFit: "cover",
                                  borderRadius: 5,
                                }}
                              />
                              <FaTimes
                                className="position-absolute top-0 end-0 text-danger"
                                style={{
                                  cursor: "pointer",
                                  background: "white",
                                  borderRadius: "50%",
                                }}
                                onClick={() => removeImage(catId)}
                              />
                            </div>
                          )}

                          {/* FILE INPUT should only show when:  
         1. existing image was removed  
         2. there is no existing image  
         3. OR user removed and now wants new upload 
      */}
                          {(!existingImage[catId] ||
                            removedImageIds.includes(existing?._id)) &&
                            !image[catId] && (
                              <input
                                type="file"
                                className="form-control"
                                onChange={(e) =>
                                  handleImageChange(catId, e.target.files[0])
                                }
                              />
                            )}
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
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
