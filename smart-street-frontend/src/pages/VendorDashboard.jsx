import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import VendorSidebar from "../components/VendorSidebar.jsx";
import VendorActionBar from "../components/VendorActionBar.jsx";
import api from "../api.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import MapContainerFullscreen from "../components/MapContainerFullscreen.jsx";
import NotificationBell from "../components/NotificationBell.jsx";
import NotificationModal from "../components/NotificationModal.jsx";
import PermitQRModal from "../components/PermitQRModal.jsx";
import RequestDetailModal from "../components/RequestDetailModal.jsx";
import VoiceAssistant from "../components/VoiceAssistant.jsx";
import { parseBookingIntent } from "../utils/voiceUtils.js";
import ThemeToggle from "../components/ThemeToggle.jsx";
import AnalyticsChart from "../components/AnalyticsChart.jsx";
import LanguageSwitcher from "../components/LanguageSwitcher.jsx";
import { useTranslation } from "react-i18next";

const defaultCenter = [11.3410, 77.7172];

// Simple Haversine distance helper (meters)
const getDistanceMeters = (lat1, lng1, lat2, lng2) => {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lng2-lng1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const MapClickCatcher = ({ onClick, intent }) => {
  useMapEvents({
    click: e => {
      if (intent === "REQUEST_NEW") {
        // Allow click anywhere - auto-detection handles the rest
        onClick([e.latlng.lat, e.latlng.lng]);
      }
    }
  });
  return null;
};

const MapZoomToSpace = ({ lat, lng, radius }) => {
  const map = useMap();

  useEffect(() => {
    if (!lat || !lng || !map) return;

    const timer = setTimeout(() => {
      try {
        // Convert radius (meters) to approximate degrees for zoom bounds
        const latDegPerMeter = 1 / 111320;
        const zoomedRadius = (radius || 120) * latDegPerMeter * 2; // padding
        
        map.setView([lat, lng], map.getZoom(), { animate: true });
        
        const bounds = [
          [lat - zoomedRadius, lng - zoomedRadius],
          [lat + zoomedRadius, lng + zoomedRadius]
        ];
        map.fitBounds(bounds, {
          padding: [8, 8],
          maxZoom: 19,
          animate: true,
          duration: 1.0
        });
      } catch (err) {
        console.error("Error zooming to space:", err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [lat, lng, radius, map]);

  return null;
};

// New Component: Fly to specific coordinates on command
const MapFlyTo = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.length === 2) {
      map.flyTo(coords, 16, { animate: true, duration: 1.5 });
    }
  }, [coords, map]);
  return null;
};

const dimsFromRadius = radius => {
  // We store width/length in the API, but UX uses a single radius.
  // Choose square dims where half-diagonal == radius: side = radius * sqrt(2)
  const side = Number(radius) * Math.SQRT2;
  return { maxWidth: side, maxLength: side };
};

import { STATUS_COLORS } from "../utils/constants.js";

export default function VendorDashboard() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const [spaces, setSpaces] = useState([]);
  const [requests, setRequests] = useState([]);
  const [permits, setPermits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedSpaceId, setSelectedSpaceId] = useState(null);

  const [intent, setIntent] = useState(null); // "OWNER_DEFINED" | "REQUEST_NEW"
  const [form, setForm] = useState({ startTime: "", endTime: "" });
  const [requestedRadius, setRequestedRadius] = useState(""); // meters (only for REQUEST_NEW)

  const [pin, setPin] = useState(null); // [lat, lng] only for REQUEST_NEW
  const [flyToCoords, setFlyToCoords] = useState(null); // For programmatic moves (voice)
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  // QR Modal State
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedPermitForQr, setSelectedPermitForQr] = useState(null);
  
  // Request Detail State
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  // Voice Assistant State
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState(""); // "Processing...", "Locating...", etc.
  const [mapSearchQuery, setMapSearchQuery] = useState("");



  const handleVoiceCommand = (transcript) => {
    // If user closed manually (null transcript), clear status
    if (!transcript) {
      setVoiceStatus("");
      return;
    }

    setVoiceStatus("Processing...");
    const result = parseBookingIntent(transcript, spaces);
    
    // 1. Handle Space Selection or Search
    if (result.spaceId) {
       setIntent("OWNER_DEFINED");
       setSelectedSpaceId(result.spaceId);
       setVoiceStatus("Space identified: " + (result.spaceName || "Unknown"));
       setTimeout(() => completeVoiceAction(result), 800);
    } else if (result.searchQuery) {
       // Perform Geocoding Search
       setVoiceStatus(`Searching "${result.searchQuery}"...`);
       handleGeocodeSearch(result.searchQuery, result);
    } else if (result.missingFields.includes("location") && !selectedSpaceId) {
       setVoiceStatus("Location details missing.");
       showError("I heard clearly, but didn't catch a location. Try again?");
       setTimeout(() => setVoiceStatus(""), 3000);
    } else {
       // Maybe location is already selected manually
       setVoiceStatus("Using current selection...");
       completeVoiceAction(result);
    }
  };

  const handleGeocodeSearch = async (query, result) => {
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
      const data = await resp.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        
        // Select logic
        setIntent("REQUEST_NEW");
        handlePinSet([lat, lon]);
        setRequestedRadius(50); 
        
        // Fly to location
        setFlyToCoords([lat, lon]);
        
        setVoiceStatus("Location found.");
        completeVoiceAction(result, `Found "${query}"`);
      } else {
        // Fallback: Fill search bar
        setVoiceStatus("Location not found.");
        setMapSearchQuery(query);
        showError(`Could not find "${query}". Please select from the search dropdown.`);
      }
    } catch (err) {
      console.error("Geocoding failed", err);
      setVoiceStatus("Search failed.");
      setMapSearchQuery(query);
      showError("Search failed. Please try the manual search bar.");
    }
  };

  const completeVoiceAction = (result, extraMsg = "") => {
    // 2. Handle Time Selection
    if (result.startTime && result.endTime) {
       setVoiceStatus(prev => "Updating dates...");
       
       const toLocalISO = (iso) => {
         const d = new Date(iso);
         const pad = n => n < 10 ? '0'+n : n;
         return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
       };

       setForm(prev => ({
         ...prev,
         startTime: toLocalISO(result.startTime),
         endTime: toLocalISO(result.endTime)
       }));
       
       setTimeout(() => setVoiceStatus("Date & Time updated."), 600);
    } else {
       setVoiceStatus("Dates not found in speech.");
    }

    // 3. Feedback
    if (result.spaceName && result.startTime) {
       showSuccess(`Autofilled for ${result.spaceName}`);
    } else if (result.spaceName) {
       showSuccess(`Selected ${result.spaceName}. When?`);
    } else if (result.startTime) {
      if (extraMsg) {
         showSuccess(`${extraMsg}. Time set.`);
      } else {
         showSuccess("Time set. Where?");
      }
    } else if (extraMsg) {
       showSuccess(`${extraMsg}`);
    } else {
       if (!result.spaceId && !result.searchQuery) {
          showError("Could not understand command. Try 'Book near [Space] tomorrow 6pm to 8pm'");
       }
    }
    
    // Clear status after delay
    setTimeout(() => setVoiceStatus(""), 5000);
  };

  const handleOpenQr = (permit) => {
    setSelectedPermitForQr(permit);
    setShowQrModal(true);
  };

  // Auto-detect space for a given location
  const handlePinSet = ([lat, lng]) => {
    setPin([lat, lng]);

    // Find if this point is inside any owner space
    const matchedSpace = spaces.find(s => {
      const dist = getDistanceMeters(lat, lng, Number(s.lat), Number(s.lng));
      return dist <= Number(s.allowed_radius);
    });

    if (matchedSpace) {
      setSelectedSpaceId(matchedSpace.space_id);
    } else {
      // It's okay if no space matches - we allow custom locations now
      setSelectedSpaceId(null);
    }
  };

  const markerDragHandlers = useMemo(
    () => ({
      dragend(e) {
        const { lat, lng } = e.target.getLatLng();
        handlePinSet([lat, lng]);
      },
    }),
    [spaces], // Re-create if spaces change
  );

  const selectedSpace = useMemo(() => spaces.find(s => String(s.space_id) === String(selectedSpaceId)), [spaces, selectedSpaceId]);

  const ownerDefinedRadius = selectedSpace?.allowed_radius ? Number(selectedSpace.allowed_radius) : 0;
  const newRequestRadius = requestedRadius ? Number(requestedRadius) : 0;
  const previewRadius = intent === "OWNER_DEFINED" ? ownerDefinedRadius : newRequestRadius;

  const fetchSpaces = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/vendor/spaces");
      const spacesList = data.spaces || [];
      setSpaces(spacesList);
      if (spacesList.length === 0) {
        setError("No public spaces available. Ask an owner to create spaces first.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load spaces");
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const { data } = await api.get("/vendor/requests");
      setRequests(data.requests || []);
    } catch (err) {
      console.error("Failed to load requests:", err);
    }
  };

  const [analyticsData, setAnalyticsData] = useState([]);

  const fetchPermits = async () => {
    try {
      const { data } = await api.get("/vendor/permits");
      setPermits(data.permits || []);
    } catch (err) {
      console.error("Failed to load permits:", err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const { data } = await api.get("/vendor/analytics"); // Assuming you proxy /api/analytics
      // Wait, standard structure is api.get('/analytics') but we need to ensure correct route.
      // In app.js: app.use("/api/analytics", analyticsRoutes);
      // Protected route: router.get('/', ... getVendorStats);
      // So path is /api/analytics
      const response = await api.get("/analytics");
      setAnalyticsData(response.data.stats || []);
    } catch (err) {
      console.error("Failed to load analytics:", err);
    }
  };

  useEffect(() => {
    fetchSpaces();
    fetchRequests();
    fetchPermits();
    fetchAnalytics();
  }, []);

  // Reset state when intent changes (prevents the “pin always created” bug)
  useEffect(() => {
    setError(null);
    setSuccess(null);
    setPin(null);
    setRequestedRadius("");
  }, [intent]);

  const handleSubmit = async e => {
    e.preventDefault();

    if (!intent) {
      showError("Choose an intent first: use an owner-defined location or request a new location.");
      return;
    }

    const startIso = new Date(form.startTime).toISOString();
    const endIso = new Date(form.endTime).toISOString();

    let lat = null;
    let lng = null;
    let radius = 0;

    if (intent === "OWNER_DEFINED") {
       if (!selectedSpaceId) {
          showError("Please select an owner space");
          return;
       }
       // ... existing validation
       if (!selectedSpace?.lat || !selectedSpace?.lng || !ownerDefinedRadius) {
        showError("Selected space is missing location data");
        return;
      }
      lat = Number(selectedSpace.lat);
      lng = Number(selectedSpace.lng);
      radius = ownerDefinedRadius; // locked

    } else if (intent === "REQUEST_NEW") {
      if (!pin) {
        showError("Tap on the map to place a pin for the new location");
        return;
      }
      if (!newRequestRadius || newRequestRadius <= 0) {
        showError("Choose a radius greater than 0 meters");
        return;
      }
      lat = pin[0];
      lng = pin[1];
      radius = newRequestRadius;
      
      // If we auto-detected a space, great. If not, submit as standalone (spaceId=null).
      // selectedSpaceId is already set/unset by handlePinSet
    } else {
      showError("Invalid intent");
      return;
    }

    const dims = dimsFromRadius(radius);
    const payload = {
      spaceId: selectedSpaceId,
      lat,
      lng,
      maxWidth: dims.maxWidth,
      maxLength: dims.maxLength,
      startTime: startIso,
      endTime: endIso
    };

    setSaving(true);
    try {
      await api.post("/vendor/requests", payload);
      showSuccess("Request submitted successfully!");
      setForm({ startTime: "", endTime: "" });
      setPin(null);
      setRequestedRadius("");
      setSelectedSpaceId(null);
      setIntent(null);
      fetchRequests();
      fetchPermits();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to submit request";
      showError(msg);
      if (err.response?.data?.conflicts) {
        console.error("Conflicts:", err.response.data.conflicts);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <header className="flex-none bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-3 md:py-4 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-0">
          <div className="text-center md:text-left">
            <Link to="/" className="block">
              <p className="text-[10px] md:text-xs text-blue-700 dark:text-blue-400 font-semibold tracking-[0.2em] hover:opacity-80 transition-opacity">{t('app_name').toUpperCase()}</p>
            </Link>
            <h1 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">{t('vendor_workspace')}</h1>
            <p className="text-[10px] md:text-xs text-slate-600 dark:text-slate-400">Choose intent → select owner space → submit request</p>
          </div>
          <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-slate-700 dark:text-slate-300 w-full md:w-auto justify-center md:justify-end">
            <LanguageSwitcher />
            <ThemeToggle />
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
            <NotificationBell onClick={() => setShowNotificationModal(true)} />
            <span className="font-semibold truncate max-w-[100px] md:max-w-none">{user?.name}</span>
            <button
              onClick={logout}
              className="rounded-lg bg-slate-800 dark:bg-slate-700 px-3 py-1 text-white hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors whitespace-nowrap"
            >
              {t('logout')}
            </button>
          </div>
        </div>
      </header>



      <main className="flex-1 relative min-h-0">
        {/* MAP-FIRST LAYOUT */}
        <MapContainerFullscreen
          center={selectedSpace ? [Number(selectedSpace.lat), Number(selectedSpace.lng)] : defaultCenter}
          zoom={selectedSpace ? 16 : 13}
          height="100%"
          onSearchSelect={(lat, lng) => {
            // In request-new mode, also move the pin to the searched location
            if (intent === "REQUEST_NEW") {
              handlePinSet([lat, lng]);
            }
          }}
          searchQuery={mapSearchQuery}
          isFullscreen={fullscreen}
          onToggleFullscreen={setFullscreen}
          showFullscreenButton={true} 
          overlayContent={
            <>
              <VendorSidebar
                intent={intent}
                setIntent={setIntent}
                spaces={spaces}
                selectedSpaceId={selectedSpaceId}
                setSelectedSpaceId={setSelectedSpaceId}
                loading={loading}
                requests={requests}
                permits={permits}
                onOpenQr={handleOpenQr}
                onRequestClick={setSelectedRequest}
                analyticsData={analyticsData}
              />
              <VendorActionBar
                intent={intent}
                form={form}
                setForm={setForm}
                requestedRadius={requestedRadius}
                setRequestedRadius={setRequestedRadius}
                ownerDefinedRadius={ownerDefinedRadius}
                handleSubmit={handleSubmit}
                saving={saving}
              />
            </>
          }
        >
          {/* Always render owner-defined spaces as selectable markers */}
          {spaces.map(space => {
            if (!space?.lat || !space?.lng) return null;
            const isSelected = space.space_id === selectedSpaceId;
            return (
              <Marker
                key={space.space_id}
                position={[Number(space.lat), Number(space.lng)]}
                eventHandlers={{
                  click: () => setSelectedSpaceId(space.space_id)
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <div className="font-semibold">{space.space_name}</div>
                    <div className="text-xs text-slate-600">{space.address}</div>
                    <div className="text-xs text-slate-700 mt-1">
                      <span className="font-semibold">Allowed radius:</span> {space.allowed_radius}m
                    </div>
                    <div className="text-xs text-slate-700">
                      <span className="font-semibold">Status:</span> {isSelected ? "Selected" : "Tap marker to select"}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Selected owner space boundary */}
          {selectedSpace?.lat && selectedSpace?.lng && selectedSpace?.allowed_radius && (
            <>
              <MapZoomToSpace
                key={`zoom-${selectedSpace.space_id}`}
                lat={Number(selectedSpace.lat)}
                lng={Number(selectedSpace.lng)}
                radius={Number(selectedSpace.allowed_radius)}
              />
              <Circle
                center={[Number(selectedSpace.lat), Number(selectedSpace.lng)]}
                radius={Number(selectedSpace.allowed_radius)}
                pathOptions={{ color: "#22c55e", fillOpacity: 0.08, weight: 2 }}
              >
                <Popup>Owner space boundary</Popup>
              </Circle>
            </>
          )}

          {/* Click-to-pin only in REQUEST_NEW mode (with validation) */}
          <MapClickCatcher
            onClick={coord => handlePinSet(coord)}
            intent={intent}
          />

          {/* New-location request preview */}
          {intent === "REQUEST_NEW" && pin && (
            <>
              <Marker
                position={pin}
                draggable={true}
                eventHandlers={markerDragHandlers}
              >
                <Popup>New requested location (Drag to move)</Popup>
              </Marker>
              {previewRadius > 0 && (
                <Circle
                  center={pin}
                  radius={previewRadius}
                  pathOptions={{ color: "#2563eb", fillOpacity: 0.18, weight: 2 }}
                >
                  <Popup>Requested area (preview)</Popup>
                </Circle>
              )}
            </>
          )}

          {/* Voice-triggered FlyTo (must be child of MapContainer) */}
          <MapFlyTo coords={flyToCoords} />
        </MapContainerFullscreen>
      </main>

      {/* Notification Modal */}
      <NotificationModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
      />
      
      {/* Permit QR/Detail Modal */}
      <PermitQRModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        permit={selectedPermitForQr}
      />

      {/* Request Detail Modal */}
      <RequestDetailModal
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        request={selectedRequest}
      />
      
      {/* Voice Assistant Overlay */}
      <VoiceAssistant 
        onCommand={handleVoiceCommand} 
        isListening={isListening} 
        setIsListening={setIsListening} 
        status={voiceStatus}
      />
    </div>
  );
}
