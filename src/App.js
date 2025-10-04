import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Users/Homes";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import VerifyOtp from "./pages/VerifyOtp";
import AdminCategoryPage from "./pages/Admin/AdminCategoryPage";
import ProtectedRoute from "./pages/Admin/ProtectedRoute";
import AdminHome from "./pages/Admin/AdminHome";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />

        {/* Admin Routes with nested structure */}
        <Route
          path="/admin/home"
          element={
            <ProtectedRoute>
              <AdminHome />
            </ProtectedRoute>
          }
        >
          {/* Nested routes rendered inside AdminHome Outlet */}
          <Route index element={<div>Welcome Admin 🛍</div>} />
          <Route path="categories" element={<AdminCategoryPage />} />
          {/* Add more nested admin pages here */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
