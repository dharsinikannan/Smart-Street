import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import SlotBooking from "./pages/SlotBooking.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/slots" element={<SlotBooking />} />
      </Routes>
    </BrowserRouter>
  );
}
