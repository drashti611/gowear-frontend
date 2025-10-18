import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../css/AdminCss/AdminCategoryPage.css";
import "../../css/AdminCss/AdminProductPage.css";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function AdminProductPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [clothingTypes, setClothingTypes] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [productData, setProductData] = useState({
    name: "",
    description: "",
    categoryId: "",
    subCategoryId: "",
    clothingTypeId: "",
    brandId: "",
    discount: 0,
    images: [],
    variants: [
      {
        color: "",
        sizes: [{ size: "", stock: 0, price: 0 }],
      },
    ],
  });

  // =========================
  // Fetch all products
  // =========================
  const fetchProducts = async () => {
    try {
      const res = await API.get("/product/getProducts");
      setProducts(res.data);
      setFilteredProducts(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Error fetching products");
    }
  };

  // =========================
  // Fetch dropdowns
  // =========================
  const fetchDropdowns = async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        API.get("/category"),
        API.get("/brand/viewBrand"),
      ]);
      setCategories(catRes.data);
      setBrands(brandRes.data);
    } catch (err) {
      console.error("Error fetching dropdown data:", err);
      alert("Error fetching dropdown data");
    }
  };

  // =========================
  // Fetch subcategories by category
  // =========================
  const fetchSubCategoriesByCategory = async (categoryId) => {
    if (!categoryId) {
      setSubCategories([]);
      return;
    }
    try {
      const res = await API.get(
        `/subcategory/viewSubCategoryByCategoryID/${categoryId}`
      );
      setSubCategories(res.data);
    } catch (err) {
      console.error("Error fetching subcategories:", err);
      alert("Error fetching subcategories");
    }
  };

  // =========================
  // Fetch clothing types by subcategory
  // =========================
  const fetchClothingTypesBySubCategory = async (subCategoryId) => {
    try {
      const response = await API.get(`/product_type/subcategory/${subCategoryId}`);
      setClothingTypes(response.data);
    } catch (error) {
      console.error("Error fetching clothing types:", error);
    }
  };


  useEffect(() => {
    fetchProducts();
    fetchDropdowns();
  }, []);

  // =========================
  // Search filter
  // =========================
  useEffect(() => {
    const filtered = products.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  // =========================
  // Variant & Size handlers
  // =========================
  const handleSizeChange = (variantIndex, sizeIndex, field, value) => {
    const newVariants = [...productData.variants];
    if (field === "stock" || field === "price") value = Number(value);
    newVariants[variantIndex].sizes[sizeIndex][field] = value;
    setProductData({ ...productData, variants: newVariants });
  };

  const addSize = (variantIndex) => {
    const newVariants = [...productData.variants];
    newVariants[variantIndex].sizes.push({ size: "", stock: 0, price: 0 });
    setProductData({ ...productData, variants: newVariants });
  };

  const removeSize = (variantIndex, sizeIndex) => {
    const newVariants = [...productData.variants];
    newVariants[variantIndex].sizes.splice(sizeIndex, 1);
    setProductData({ ...productData, variants: newVariants });
  };

  const addVariant = () => {
    setProductData({
      ...productData,
      variants: [
        ...productData.variants,
        { color: "", sizes: [{ size: "", stock: 0, price: 0 }] },
      ],
    });
  };

  const removeVariant = (variantIndex) => {
    const newVariants = [...productData.variants];
    newVariants.splice(variantIndex, 1);
    setProductData({ ...productData, variants: newVariants });
  };

  const getPriceDisplay = (product) => {
    if (!product.variants || product.variants.length === 0)
      return `₹${product.price || 0}`;
    let prices = [];
    product.variants.forEach((v) =>
      v.sizes.forEach((s) => prices.push(s.price))
    );
    prices = prices.filter((p) => p !== undefined && !isNaN(p));
    if (prices.length === 0) return "Price not set";
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? `₹${min}` : `₹${min} - ₹${max}`;
  };

  const getTotalStock = (product) => {
    if (!product.variants || product.variants.length === 0) return 0;
    return product.variants.reduce(
      (total, v) => total + v.sizes.reduce((sum, s) => sum + (s.stock || 0), 0),
      0
    );
  };

  // =========================
  // Add / Update Product
  // =========================
  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("name", productData.name || "");
      formData.append("description", productData.description || "");
      formData.append("categoryId", productData.categoryId || "");
      formData.append("subCategoryId", productData.subCategoryId || "");
      formData.append("clothingTypeId", productData.clothingTypeId);
      formData.append("brandId", productData.brandId || "");
      formData.append("discount", productData.discount || 0);
      formData.append(
        "imagesToRemove",
        JSON.stringify(productData.imagesToRemove || [])
      );
      productData.images.forEach((img) => formData.append("images", img));
      formData.append("variants", JSON.stringify(productData.variants));

      if (editingId) {
        await API.put(`/product/updateProduct/${editingId}`, formData);
        setToastMessage(`Product "${productData.name}" updated successfully!`);
      } else {
        await API.post("/product/addProduct", formData);
        setToastMessage(`Product "${productData.name}" added successfully!`);
      }

      setProductData({
        name: "",
        description: "",
        categoryId: "",
        subCategoryId: "",
        clothingTypeId: "",
        brandId: "",
        discount: 0,
        images: [],
        existingImages: [],
        imagesToRemove: [],
        variants: [{ color: "", sizes: [{ size: "", stock: 0, price: 0 }] }],
      });
      setEditingId(null);
      setShowModal(false);
      fetchProducts();
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(err.response?.data?.message || "Error saving product");
    }
  };

  // =========================
  // Delete Product
  // =========================
  const confirmDelete = (id, name) => {
    setDeleteId(id);
    setDeleteName(name);
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/product/deleteProduct/${deleteId}`);
      setShowModal(false);
      setToastMessage(`Product "${deleteName}" deleted successfully!`);
      setShowToast(true);
      setDeleteId(null);
      setDeleteName("");
      fetchProducts();
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting product");
    }
  };

  // =========================
  // Edit Product
  // =========================
  const handleEdit = (p) => {
    setProductData({
      name: p.name || "",
      description: p.description || "",
      categoryId: p.categoryId?._id || "",
      subCategoryId: p.subCategoryId?._id || "",
      clothingTypeId: p.clothingTypeId?._id || "",
      brandId: p.brandId?._id || "",
      discount: p.discount || 0,
      images: [],
      existingImages: p.images || [],
      imagesToRemove: [],
      variants:
        p.variants.length > 0
          ? p.variants.map((v) => ({
            color: v.color || "",
            sizes: v.sizes.map((s) => ({
              size: s.size || "",
              stock: s.stock || 0,
              price: s.price || 0,
            })),
          }))
          : [{ color: "", sizes: [{ size: "", stock: 0, price: 0 }] }],
    });

    if (p.categoryId?._id) fetchSubCategoriesByCategory(p.categoryId._id);
    if (p.subCategoryId?._id)
      fetchClothingTypesBySubCategory(p.subCategoryId._id);

    setEditingId(p._id);
    setShowModal(true);
  };

  // =========================
  // Render
  // =========================
  return (
    <div className="container my-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-sidebar mb-0">Manage Products</h2>
        <div className="d-flex gap-2">
          <input
            type="text"
            className="form-control shadow-sm"
            placeholder="Search product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="btn btn-sidebar shadow-sm"
            onClick={() => {
              setProductData({
                name: "",
                description: "",
                categoryId: "",
                subCategoryId: "",
                clothingTypeId: "",
                brandId: "",
                discount: 0,
                images: [],
                variants: [
                  { color: "", sizes: [{ size: "", stock: 0, price: 0 }] },
                ],
              });
              setEditingId(null);
              setShowModal(true);
            }}
          >
            Add
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Images</th>
              <th>Name</th>
              <th>Category</th>
              <th>SubCategory</th>
              <th>Clothing Type</th>
              <th>Price</th>
              <th>Total Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p, index) => (
              <tr key={p._id}>
                <td>{index + 1}</td>
                <td style={{ width: "200px" }}>
                  <div className="product-images-container">
                    {p.images && p.images.length > 0 ? (
                      p.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={`http://localhost:5000/${img}`}
                          alt={p.name}
                          className="product-table-image"
                        />
                      ))
                    ) : (
                      <div className="no-image">No Image</div>
                    )}
                  </div>
                </td>
                <td>{p.name}</td>
                <td>{p.categoryId?.name || "No Category"}</td>
                <td>{p.subCategoryId?.name || "No SubCategory"}</td>
                <td>{p.clothingTypeId?.name || "No Type"}</td>
                <td>{getPriceDisplay(p)}</td>
                <td>
                  {getTotalStock(p)}
                  {getTotalStock(p) < 5 && (
                    <span className="text-danger ms-2">Low Stock!</span>
                  )}
                </td>
                <td>
                  <button
                    className="btn btn-outline-warning btn-sm me-1"
                    onClick={() => handleEdit(p)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => confirmDelete(p._id, p.name)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center text-muted">
                  No products found.
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
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-sidebar text-white">
                <h5 className="modal-title">
                  {deleteId
                    ? "Delete Product"
                    : editingId
                      ? "Edit Product"
                      : "Add Product"}
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
                  `Are you sure you want to delete product "${deleteName}"?`
                ) : (
                  <form>
                    {/* Product name */}
                    <div className="mb-2">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Product Name"
                        value={productData.name || ""}
                        onChange={(e) =>
                          setProductData({
                            ...productData,
                            name: e.target.value,
                          })
                        }
                        title="Enter the product name"
                      />
                    </div>

                    {/* Description */}
                    <div className="mb-2">
                      <textarea
                        className="form-control"
                        placeholder="Description"
                        value={productData.description || ""}
                        onChange={(e) =>
                          setProductData({
                            ...productData,
                            description: e.target.value,
                          })
                        }
                        title="Enter a short description"
                      ></textarea>
                    </div>

                    {/* Category */}
                    <div className="mb-2">
                      <select
                        className="form-control"
                        value={productData.categoryId || ""}
                        onChange={(e) => {
                          const selectedCategory = e.target.value;
                          setProductData({
                            ...productData,
                            categoryId: selectedCategory,
                            subCategoryId: "",
                            clothingTypeId: "",
                          });
                          fetchSubCategoriesByCategory(selectedCategory);
                        }}
                      >
                        <option value="">Select Category</option>
                        {categories.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* SubCategory */}
                    <div className="mb-2">
                      <select
                        className="form-control"
                        value={productData.subCategoryId || ""}
                        onChange={(e) => {
                          const selectedSubCat = e.target.value;
                          setProductData({
                            ...productData,
                            subCategoryId: selectedSubCat,
                            clothingTypeId: "",
                          });
                          fetchClothingTypesBySubCategory(selectedSubCat);
                        }}
                      >
                        <option value="">Select SubCategory</option>
                        {subCategories.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Clothing Type */}
                    <div className="mb-2">
                      <select
                        className="form-control"
                        value={productData.clothingTypeId || ""}
                        onChange={(e) =>
                          setProductData({
                            ...productData,
                            clothingTypeId: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Clothing Type</option>
                        {clothingTypes.map((ct) => (
                          <option key={ct._id} value={ct._id}>
                            {ct.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Brand */}
                    <div className="mb-2">
                      <select
                        className="form-control"
                        value={productData.brandId || ""}
                        onChange={(e) =>
                          setProductData({
                            ...productData,
                            brandId: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Brand</option>
                        {brands.map((b) => (
                          <option key={b._id} value={b._id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Discount */}
                    <div className="mb-2">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Discount %"
                        value={
                          productData.discount !== undefined
                            ? productData.discount
                            : ""
                        }
                        onChange={(e) =>
                          setProductData({
                            ...productData,
                            discount:
                              e.target.value === ""
                                ? 0
                                : Number(e.target.value),
                          })
                        }
                      />
                    </div>

                    {/* Images */}
                    <div className="mb-2">
                      <input
                        type="file"
                        className="form-control"
                        multiple
                        onChange={(e) =>
                          setProductData({
                            ...productData,
                            images: Array.from(e.target.files),
                          })
                        }
                      />
                      {productData.existingImages?.length > 0 && (
                        <div className="mt-2 d-flex flex-wrap gap-2">
                          {productData.existingImages.map((img, idx) => (
                            <div key={idx} className="position-relative">
                              <img
                                src={`http://localhost:5000/${img}`}
                                alt="existing"
                                className="product-table-image"
                              />
                              <button
                                type="button"
                                className="btn-close position-absolute top-0 end-0"
                                onClick={() => {
                                  const imagesToRemove = [
                                    ...(productData.imagesToRemove || []),
                                    img,
                                  ];
                                  const remainingImages = productData.existingImages.filter(
                                    (i) => i !== img
                                  );
                                  setProductData({
                                    ...productData,
                                    existingImages: remainingImages,
                                    imagesToRemove,
                                  });
                                }}
                              ></button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Variants */}
                    <div className="mb-2">
                      <h6>Variants:</h6>
                      {productData.variants.map((v, vi) => (
                        <div
                          key={vi}
                          className="border rounded p-2 mb-2 variant-block"
                        >
                          <div className="d-flex align-items-center mb-2">
                            <input
                              type="text"
                              className="form-control me-2"
                              placeholder="Color"
                              value={v.color || ""}
                              onChange={(e) => {
                                const newVariants = [...productData.variants];
                                newVariants[vi].color = e.target.value;
                                setProductData({
                                  ...productData,
                                  variants: newVariants,
                                });
                              }}
                            />
                            {productData.variants.length > 1 && (
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => removeVariant(vi)}
                              >
                                Remove Variant
                              </button>
                            )}
                          </div>
                          <div className="ms-2">
                            {v.sizes.map((s, si) => (
                              <div
                                key={si}
                                className="d-flex align-items-center gap-2 mb-1"
                              >
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Size"
                                  value={s.size || ""}
                                  onChange={(e) =>
                                    handleSizeChange(
                                      vi,
                                      si,
                                      "size",
                                      e.target.value
                                    )
                                  }
                                />
                                <input
                                  type="number"
                                  className="form-control"
                                  placeholder="Stock"
                                  value={s.stock}
                                  onChange={(e) =>
                                    handleSizeChange(
                                      vi,
                                      si,
                                      "stock",
                                      e.target.value
                                    )
                                  }
                                />
                                <input
                                  type="number"
                                  className="form-control"
                                  placeholder="Price"
                                  value={s.price}
                                  onChange={(e) =>
                                    handleSizeChange(
                                      vi,
                                      si,
                                      "price",
                                      e.target.value
                                    )
                                  }
                                />
                                {v.sizes.length > 1 && (
                                  <button
                                    type="button"
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={() => removeSize(vi, si)}
                                  >
                                    X
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              type="button"
                              className="btn btn-outline-primary btn-sm mt-1"
                              onClick={() => addSize(vi)}
                            >
                              Add Size
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="btn btn-outline-success btn-sm"
                        onClick={addVariant}
                      >
                        Add Variant
                      </button>
                    </div>
                  </form>
                )}
              </div>
              <div className="modal-footer">
                {deleteId ? (
                  <>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={handleDelete}
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                    <button className="btn btn-primary" onClick={handleSubmit}>
                      {editingId ? "Update" : "Add"} Product
                    </button>
                  </>
                )}
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
