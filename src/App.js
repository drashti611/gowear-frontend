import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Users/Homes"; // fix typo: Homes → Home
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import VerifyOtp from "./pages/VerifyOtp";
import AdminCategoryPage from "./pages/Admin/AdminCategoryPage";
import ProtectedRoute from "./pages/Admin/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />

        {/* Admin Route */}
        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute>
              <AdminCategoryPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
