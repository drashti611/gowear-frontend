import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  FiFolder,
  FiPackage,
  FiShoppingCart,
  FiUser,
  FiGift,
  FiLogOut,
  FiMenu,
  FiChevronDown,
  FiChevronRight,
  FiTag,
  FiGrid,
} from "react-icons/fi";
import "../../css/AdminCss/AdminHome.css";

export default function AdminHome() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [openMenu, setOpenMenu] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    sessionStorage.clear();
    navigate("/login");
  };

  const menuItems = [
    {
      name: "Categories",
      icon: <FiFolder />,
      children: [
        { name: "All Categories", path: "categories" },
        { name: "Subcategories", path: "subcategories" },
      ],
    },
    { name: "Brands", path: "brands", icon: <FiTag /> },
    { name: "Products", path: "products", icon: <FiPackage /> },
    {
      name: "Clothing Types",
      icon: <FiGrid />,
      path: "clothing-types",
    },
    { name: "Coupons & Offers", path: "coupons", icon: <FiGift /> },
    { name: "Orders History", path: "orders", icon: <FiShoppingCart /> },
    { name: "Registered Users", path: "users", icon: <FiUser /> },
  ];

  return (
    <div className="d-flex admin-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <div className="sidebar-header">
          {sidebarOpen ? (
            <h5>
              GoWear <span className="admin-badge-tag">ADMIN</span>
            </h5>
          ) : (
            <h5 className="m-0">GW</h5>
          )}
          <button
            className="btn btn-dark btn-sm d-md-none text-white"
            onClick={toggleSidebar}
          >
            <FiMenu />
          </button>
        </div>

        <div className="menu-items">
          {menuItems.map((item) => (
            <div key={item.name}>
              {/* Parent Menu */}
              <div
                className={`menu-link ${
                  location.pathname.includes(item.path) ? "active" : ""
                }`}
                onClick={() =>
                  item.children
                    ? setOpenMenu(openMenu === item.name ? "" : item.name)
                    : navigate(item.path)
                }
              >
                <span className="menu-icon">{item.icon}</span>
                {sidebarOpen && (
                  <>
                    <span className="flex-grow-1">{item.name}</span>
                    {item.children && (
                      <span>
                        {openMenu === item.name ? (
                          <FiChevronDown />
                        ) : (
                          <FiChevronRight />
                        )}
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Submenu */}
              {item.children && openMenu === item.name && sidebarOpen && (
                <div className="submenu">
                  {item.children.map((child) => (
                    <Link
                      key={child.path}
                      to={child.path}
                      className={`submenu-link ${
                        location.pathname.includes(child.path) ? "active" : ""
                      }`}
                    >
                      <span>{child.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Logout Button */}
        <button
          type="button"
          className="logout-btn"
          onClick={() => setShowLogoutModal(true)}
        >
          <FiLogOut className="menu-icon" />
          {sidebarOpen && <span>Sign Out</span>}
        </button>
      </div>

      {/* Main Content Workspace */}
      <div className="admin-workspace">
        <Outlet />
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content"
              style={{ borderRadius: "20px", overflow: "hidden", border: "none" }}
            >
              <div className="modal-header bg-dark text-white p-4">
                <h5 className="modal-title" style={{ fontWeight: 800 }}>Confirm Logout</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowLogoutModal(false)}
                />
              </div>
              <div className="modal-body p-4" style={{ fontSize: "15px" }}>
                Are you sure you want to end your admin session?
              </div>
              <div className="modal-footer p-3 bg-light">
                <button
                  className="btn btn-light"
                  onClick={() => setShowLogoutModal(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={handleLogout}>
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
