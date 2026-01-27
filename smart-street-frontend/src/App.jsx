import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import VendorDashboard from "./pages/VendorDashboard.jsx";
import OwnerDashboard from "./pages/OwnerDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import PublicMap from "./pages/PublicMap.jsx";
import VerifyPermit from "./pages/VerifyPermit.jsx";
import Unauthorized from "./pages/Unauthorized.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";

import OfflineBanner from "./components/OfflineBanner.jsx";
import ChatWidget from "./components/ChatWidget.jsx";

// Unused HomeRedirect for now, but keeping if logic is needed later logic
// const HomeRedirect = ...

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <OfflineBanner />
      <ChatWidget />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/public" element={<PublicMap />} />
        <Route path="/verify" element={<VerifyPermit />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/vendor"
          element={
            <ProtectedRoute roles={["VENDOR"]}>
              <VendorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner"
          element={
            <ProtectedRoute roles={["OWNER"]}>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
