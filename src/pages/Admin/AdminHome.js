import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  FiFolder,
  FiPackage,
  FiShoppingCart,
  FiUser,
  FiLogOut,
  FiMenu,
} from "react-icons/fi";
import "../../css/AdminCss/AdminHome.css";

export default function AdminHome() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const menuItems = [
    { name: "Manage Categories", path: "categories", icon: <FiFolder /> },
    { name: "Manage Products", path: "products", icon: <FiPackage /> },
    { name: "Orders", path: "orders", icon: <FiShoppingCart /> },
    { name: "Users", path: "users", icon: <FiUser /> },
  ];

  return (
    <div className="d-flex admin-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <div className="sidebar-header d-flex justify-content-between align-items-center px-3 py-2">
          {sidebarOpen && <h5 className="m-0">GoWear</h5>}
          <button className="btn btn-light btn-sm d-md-none" onClick={toggleSidebar}>
            <FiMenu />
          </button>
        </div>

        <div className="menu-items flex-column d-flex px-2 mt-3">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`menu-link d-flex align-items-center px-2 py-2 rounded ${
                location.pathname.includes(item.path) ? "active" : ""
              }`}
            >
              <span className="menu-icon">{item.icon}</span>
              {sidebarOpen && <span className="ms-2">{item.name}</span>}
              {!sidebarOpen && <span className="tooltip">{item.name}</span>}
            </Link>
          ))}
        </div>

        {/* Logout Button */}
        <div className="mt-auto p-2">
          <button
            className="logout-btn w-100 d-flex align-items-center justify-content-center"
            onClick={() => setShowLogoutModal(true)}
          >
            <FiLogOut className="menu-icon" />
            {sidebarOpen && <span className="ms-2">Logout</span>}
            {!sidebarOpen && <span className="tooltip">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-fill p-4">
        <Outlet />
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-sidebar text-white">
                <h5 className="modal-title">Confirm Logout</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowLogoutModal(false)}
                ></button>
              </div>
              <div className="modal-body">Are you sure you want to logout?</div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowLogoutModal(false)}
                >
                  No
                </button>
                <button className="btn btn-danger" onClick={handleLogout}>
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
