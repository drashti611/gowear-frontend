import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import "../../css/Customercss/AccountSetting.css";

const AccountSetting = () => {
  const userId = localStorage.getItem("userId");

  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile edit toggle
  const [editProfile, setEditProfile] = useState(false);

  // Profile data
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Address form
  const [addressData, setAddressData] = useState({
    label: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [editingAddressId, setEditingAddressId] = useState(null);

  /* ================= FETCH USER ================= */
  const fetchUser = async () => {
    const res = await API.get(`/auth/${userId}`);
    setUser(res.data);
    setProfileData({
      name: res.data.name || "",
      email: res.data.email || "",
      phone: res.data.phone || "",
    });
  };

  /* ================= FETCH ADDRESSES ================= */
  const fetchAddresses = async () => {
    const res = await API.get(`/auth/addresses/${userId}`);
    setAddresses(res.data);
  };

  useEffect(() => {
    if (userId) {
      Promise.all([fetchUser(), fetchAddresses()]).finally(() =>
        setLoading(false)
      );
    }
  }, [userId]);

  /* ================= UPDATE PROFILE ================= */
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    await API.put(`/auth/updateprofile/${userId}`, profileData);
    setEditProfile(false);
    fetchUser();
  };

  /* ================= ADD / UPDATE ADDRESS ================= */
  const handleAddressSubmit = async (e) => {
    e.preventDefault();

    if (editingAddressId) {
      await API.put(
        `/auth/updateaddress/${userId}/${editingAddressId}`,
        addressData
      );
    } else {
      await API.post(`/auth/AddAddress/${userId}`, addressData);
    }

    setAddressData({
      label: "",
      street: "",
      city: "",
      state: "",
      pincode: "",
    });

    setEditingAddressId(null);
    fetchAddresses();
  };

  /* ================= EDIT ADDRESS ================= */
  const handleEditAddress = (addr) => {
    setEditingAddressId(addr._id);
    setAddressData(addr);
  };

  /* ================= DELETE ADDRESS ================= */
  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Delete this address?")) return;
    await API.delete(`/auth/deleteaddress/${userId}/${addressId}`);
    fetchAddresses();
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="account-setting">
      <h2>Account</h2>

      {/* ================= PROFILE ================= */}
      <div className="profile-card">
        <div className="profile-header">
          <h4>Profile Details</h4>
          {!editProfile && (
            <button className="edit-btn" onClick={() => setEditProfile(true)}>
              Edit
            </button>
          )}
        </div>

        {!editProfile ? (
          <div className="profile-view">
            <div className="row">
              <span>Name</span>
              <p>{user?.name}</p>
            </div>
            <div className="row">
              <span>Email</span>
              <p>{user?.email}</p>
            </div>
            <div className="row">
              <span>Phone</span>
              <p>{user?.phone || "-"}</p>
            </div>
          </div>
        ) : (
          <form className="profile-form" onSubmit={handleProfileUpdate}>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) =>
                setProfileData({ ...profileData, name: e.target.value })
              }
              required
            />
            <input
              type="email"
              value={profileData.email}
              onChange={(e) =>
                setProfileData({ ...profileData, email: e.target.value })
              }
              required
            />
            <input
              type="text"
              value={profileData.phone}
              onChange={(e) =>
                setProfileData({ ...profileData, phone: e.target.value })
              }
            />

            <div className="action-btns">
              <button className="save-btn">Save</button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setEditProfile(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ================= ADDRESS ================= */}
      <div className="profile-card">
        <h4>Saved Addresses</h4>

        {addresses.length === 0 ? (
          <p className="no-address">No address found</p>
        ) : (
          addresses.map((addr) => (
            <div className="address-box" key={addr._id}>
              <strong>{addr.label}</strong>
              <p>
                {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
              </p>
              <button onClick={() => handleEditAddress(addr)}>Edit</button>
              <button onClick={() => handleDeleteAddress(addr._id)}>
                Remove
              </button>
            </div>
          ))
        )}

        {/* Add / Edit Address Form */}
        <form onSubmit={handleAddressSubmit} className="address-form">
          <h5>{editingAddressId ? "Edit Address" : "Add New Address"}</h5>

          <input
            placeholder="Label"
            value={addressData.label}
            onChange={(e) =>
              setAddressData({ ...addressData, label: e.target.value })
            }
            required
          />
          <input
            placeholder="Street"
            value={addressData.street}
            onChange={(e) =>
              setAddressData({ ...addressData, street: e.target.value })
            }
            required
          />
          <input
            placeholder="City"
            value={addressData.city}
            onChange={(e) =>
              setAddressData({ ...addressData, city: e.target.value })
            }
            required
          />
          <input
            placeholder="State"
            value={addressData.state}
            onChange={(e) =>
              setAddressData({ ...addressData, state: e.target.value })
            }
            required
          />
          <input
            placeholder="Pincode"
            value={addressData.pincode}
            onChange={(e) =>
              setAddressData({ ...addressData, pincode: e.target.value })
            }
            required
          />

          <button className="save-btn">
            {editingAddressId ? "Update Address" : "Add Address"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AccountSetting;
