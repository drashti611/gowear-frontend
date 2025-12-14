import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import "bootstrap/dist/css/bootstrap.min.css";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get("/auth/allusers");
      setUsers(res.data);
    } catch (err) {
      console.log(err);
      alert("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading users...</p>;

  // ❌ Remove admin users
  const filteredUsers = users.filter((user) => user.role !== "admin");

  return (
    <div className="container-fluid">
      <h4 className="mb-3">Registered Users</h4>

      {filteredUsers.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div className="card">
          <table className="table table-bordered table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Addresses</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr key={user._id}>
                  <td>{index + 1}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone || "-"}</td>
                  <td>{user.address?.length || 0}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
