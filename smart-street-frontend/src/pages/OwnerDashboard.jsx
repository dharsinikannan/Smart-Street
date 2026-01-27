import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import api from "../api.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import MapContainerFullscreen from "../components/MapContainerFullscreen.jsx";
import NotificationBell from "../components/NotificationBell.jsx";
import NotificationModal from "../components/NotificationModal.jsx";
import MapSearchControl from "../components/MapSearchControl.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import OwnerSidebar from "../components/OwnerSidebar.jsx";

const defaultCenter = [11.3410, 77.7172];

const MapClickCatcher = ({ onClick }) => {
  useMapEvents({
    click: e => onClick([e.latlng.lat, e.latlng.lng]),
  });
  return null;
};

export default function OwnerDashboard() {
  const { user, logout } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    spaceName: "",
    address: "",
    allowedRadius: 50, // default meters
  });
  const [pin, setPin] = useState(null); // [lat, lng]
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  const fetchSpaces = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/owner/spaces");
      setSpaces(data.spaces || []);
    } catch (err) {
      showError(err.response?.data?.message || "Failed to load spaces");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pin) {
      showError("Please click on the map to set a location pin.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        spaceName: form.spaceName,
        address: form.address,
        lat: pin[0],
        lng: pin[1],
        allowedRadius: Number(form.allowedRadius),
      };
      await api.post("/owner/spaces", payload);
      showSuccess("Space created successfully!");
      setForm({ spaceName: "", address: "", allowedRadius: 50 });
      setPin(null);
      fetchSpaces();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to create space");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <header className="bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-3 md:py-4 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-0">
          <div className="text-center md:text-left">
            <Link to="/" className="block">
              <p className="text-[10px] md:text-xs text-blue-700 dark:text-blue-400 font-semibold tracking-[0.2em] hover:opacity-80 transition-opacity">SMART STREET</p>
            </Link>
            <h1 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">Owner workspace</h1>
            <p className="text-[10px] md:text-xs text-slate-600 dark:text-slate-400">Create spaces (Pin + Radius)</p>
          </div>
          <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-slate-700 dark:text-slate-300 w-full md:w-auto justify-center md:justify-end">
            <ThemeToggle />
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
            <NotificationBell onClick={() => setShowNotificationModal(true)} />
            <span className="font-semibold truncate max-w-[100px] md:max-w-none">{user?.name}</span>
            <button
              onClick={logout}
              className="rounded-lg bg-slate-800 dark:bg-slate-700 px-3 py-1 text-white hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors whitespace-nowrap"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 relative">
        {/* MAP-FIRST LAYOUT */}
        <MapContainerFullscreen
          center={defaultCenter}
          zoom={13}
          height="100vh"
          showFullscreenButton={false}
          onSearchSelect={(lat, lng) => setPin([lat, lng])}
          overlayContent={
            <OwnerSidebar
               spaces={spaces}
               loading={loading}
               fetchSpaces={fetchSpaces}
               form={form}
               setForm={setForm}
               pin={pin}
               setPin={setPin}
               handleSubmit={handleSubmit}
               saving={saving}
            />
          }
        >
          <MapClickCatcher onClick={coord => setPin(coord)} />
          {pin && (
            <>
              <Marker position={pin}>
                <Popup>Space center</Popup>
              </Marker>
              {form.allowedRadius && Number(form.allowedRadius) > 0 && (
                <Circle
                  center={pin}
                  radius={Number(form.allowedRadius)}
                  pathOptions={{ color: "#2563eb", fillOpacity: 0.2, weight: 2 }}
                >
                  <Popup>Space radius: {form.allowedRadius}m</Popup>
                </Circle>
              )}
            </>
          )}
          {spaces.map(space => (
            <Circle
              key={space.space_id}
              center={[space.lat, space.lng]}
              radius={space.allowed_radius}
              pathOptions={{ color: "#22c55e", weight: 2, fillOpacity: 0.1 }}
            >
              <Popup>{space.space_name}</Popup>
            </Circle>
          ))}
        </MapContainerFullscreen>
      </main>
      <NotificationModal
          isOpen={showNotificationModal}
          onClose={() => setShowNotificationModal(false)}
      />
    </div>
  );
}
