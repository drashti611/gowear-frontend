import { useEffect, useState } from "react";
import API from "../../api/axios";

export default function AdminCategoryPage() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);

  const fetchCategories = async () => {
    try {
      const res = await API.get("/category");
      setCategories(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Error fetching categories");
    }
  };

  const handleSubmit = async () => {
    if (!name) return alert("Enter category name");
    try {
      if (editingId) {
        await API.put(`/category/${editingId}`, { name });
        setEditingId(null);
      } else {
        await API.post("/category", { name });
      }
      setName("");
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await API.delete(`/category/${id}`);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting category");
    }
  };

  const handleEdit = (cat) => {
    setName(cat.name);
    setEditingId(cat._id);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Manage Categories</h2>
      <input
        placeholder="Category name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={handleSubmit}>{editingId ? "Update" : "Add"}</button>

      <ul>
        {categories.map((cat) => (
          <li key={cat._id}>
            {cat.name}{" "}
            <button onClick={() => handleEdit(cat)}>Edit</button>{" "}
            <button onClick={() => handleDelete(cat._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
