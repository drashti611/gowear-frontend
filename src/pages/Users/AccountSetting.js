import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaPlus, FaCheck } from "react-icons/fa";
import API from "../../api/axios";
import "../../css/Customercss/AccountSetting.css";

export default function AccountSetting() {
  const userId = localStorage.getItem("userId");

  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editProfile, setEditProfile] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [addressData, setAddressData] = useState({
    label: "Home",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [editingAddressId, setEditingAddressId] = useState(null);

  const fetchUser = async () => {
    try {
      const res = await API.get(`/auth/${userId}`);
      setUser(res.data);
      setProfileData({
        name: res.data.name || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAddresses = async () => {
    try {
      const res = await API.get(`/auth/addresses/${userId}`);
      setAddresses(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (userId) {
      Promise.all([fetchUser(), fetchAddresses()]).finally(() =>
        setLoading(false)
      );
    }
  }, [userId]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/auth/updateprofile/${userId}`, profileData);
      setEditProfile(false);
      fetchUser();
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Failed to update profile.");
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAddressId) {
        await API.put(
          `/auth/updateaddress/${userId}/${editingAddressId}`,
          addressData
        );
      } else {
        await API.post(`/auth/AddAddress/${userId}`, addressData);
      }

      setAddressData({
        label: "Home",
        street: "",
        city: "",
        state: "",
        pincode: "",
      });
      setEditingAddressId(null);
      setShowAddressForm(false);
      fetchAddresses();
    } catch (err) {
      alert("Failed to save address.");
    }
  };

  const handleEditAddress = (addr) => {
    setEditingAddressId(addr._id);
    setAddressData(addr);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      await API.delete(`/auth/deleteaddress/${userId}/${addressId}`);
      fetchAddresses();
    } catch (err) {
      alert("Failed to delete address.");
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="account-page-wrapper container">
      <div className="account-settings-container">
        {/* Profile Card */}
        <div className="account-luxury-card">
          <div className="account-card-header">
            <h3>Personal Information</h3>
            <button
              type="button"
              className="btn-luxury-secondary"
              style={{ padding: "6px 14px", fontSize: "12.5px" }}
              onClick={() => setEditProfile(!editProfile)}
            >
              <FaEdit /> {editProfile ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          {!editProfile ? (
            <div className="account-profile-preview">
              <div className="account-field-item">
                <label>Full Name</label>
                <p>{user?.name || "N/A"}</p>
              </div>
              <div className="account-field-item">
                <label>Email Address</label>
                <p>{user?.email || "N/A"}</p>
              </div>
              <div className="account-field-item">
                <label>Mobile Number</label>
                <p>{user?.phone || "N/A"}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleProfileUpdate}>
              <div className="form-row">
                <div className="luxury-input-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    className="luxury-input"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="luxury-input-group">
                  <label>Mobile Phone</label>
                  <input
                    type="tel"
                    className="luxury-input"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn-luxury-primary"
                style={{ padding: "10px 24px", fontSize: "13.5px" }}
              >
                <FaCheck /> Save Changes
              </button>
            </form>
          )}
        </div>

        {/* Addresses Section */}
        <div className="account-luxury-card">
          <div className="account-card-header">
            <h3>Saved Addresses ({addresses.length})</h3>
            <button
              type="button"
              className="btn-luxury-secondary"
              style={{ padding: "6px 14px", fontSize: "12.5px" }}
              onClick={() => {
                setShowAddressForm(!showAddressForm);
                setEditingAddressId(null);
                setAddressData({ label: "Home", street: "", city: "", state: "", pincode: "" });
              }}
            >
              <FaPlus /> {showAddressForm ? "Cancel" : "Add New"}
            </button>
          </div>

          {showAddressForm && (
            <form onSubmit={handleAddressSubmit} className="mb-4 p-3 bg-light rounded border">
              <h5 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "14px" }}>
                {editingAddressId ? "Edit Address" : "Add New Address"}
              </h5>
              <div className="form-row">
                <div className="luxury-input-group">
                  <label>Label</label>
                  <input
                    type="text"
                    className="luxury-input"
                    placeholder="Home / Work"
                    value={addressData.label}
                    onChange={(e) =>
                      setAddressData({ ...addressData, label: e.target.value })
                    }
                  />
                </div>
                <div className="luxury-input-group">
                  <label>Street Address</label>
                  <input
                    type="text"
                    className="luxury-input"
                    placeholder="123 Street address"
                    value={addressData.street}
                    onChange={(e) =>
                      setAddressData({ ...addressData, street: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="luxury-input-group">
                  <label>City</label>
                  <input
                    type="text"
                    className="luxury-input"
                    placeholder="City"
                    value={addressData.city}
                    onChange={(e) =>
                      setAddressData({ ...addressData, city: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="luxury-input-group">
                  <label>State</label>
                  <input
                    type="text"
                    className="luxury-input"
                    placeholder="State"
                    value={addressData.state}
                    onChange={(e) =>
                      setAddressData({ ...addressData, state: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="luxury-input-group" style={{ maxWidth: "140px" }}>
                  <label>Pincode</label>
                  <input
                    type="text"
                    className="luxury-input"
                    placeholder="Pincode"
                    value={addressData.pincode}
                    onChange={(e) =>
                      setAddressData({ ...addressData, pincode: e.target.value })
                    }
                    maxLength="6"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-luxury-primary"
                style={{ padding: "8px 20px", fontSize: "13px" }}
              >
                {editingAddressId ? "Update Address" : "Save Address"}
              </button>
            </form>
          )}

          {addresses.length === 0 && !showAddressForm ? (
            <p className="text-muted text-center py-3">No saved addresses found.</p>
          ) : (
            <div className="account-address-grid">
              {addresses.map((addr) => (
                <div key={addr._id} className="account-addr-card">
                  <div>
                    <h5>{addr.label || "Address"}</h5>
                    <p>
                      {addr.street}
                      <br />
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                  </div>
                  <div className="addr-actions-row">
                    <button
                      type="button"
                      className="btn-luxury-secondary"
                      style={{ padding: "4px 10px", fontSize: "11.5px" }}
                      onClick={() => handleEditAddress(addr)}
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      type="button"
                      className="btn-luxury-secondary text-danger"
                      style={{ padding: "4px 10px", fontSize: "11.5px" }}
                      onClick={() => handleDeleteAddress(addr._id)}
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
