import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Circle, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { QRCodeCanvas } from "qrcode.react";
import api from "../api.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import MapContainerFullscreen from "../components/MapContainerFullscreen.jsx";
import NotificationBell from "../components/NotificationBell.jsx";
import NotificationModal from "../components/NotificationModal.jsx";
import { ConfirmModal } from "../components/Modal.jsx";
import MapSearchControl from "../components/MapSearchControl.jsx";
import AdminSidebar from "../components/AdminSidebar.jsx";
import AdminRequestDetail from "../components/AdminRequestDetail.jsx";
import AdminStatsCards from "../components/AdminStatsCards.jsx";
import AdminVendorList from "../components/AdminVendorList.jsx";
import AdminOwnerList from "../components/AdminOwnerList.jsx";
import { ChartBarSquareIcon, MapIcon, UserGroupIcon } from "@heroicons/react/24/outline";

import ThemeToggle from "../components/ThemeToggle.jsx";

const defaultCenter = [11.3410, 77.7172];

const radiusFromDims = (maxWidth, maxLength) => {
  return Math.sqrt(maxWidth ** 2 + maxLength ** 2) / 2;
};

import { STATUS_COLORS } from "../utils/constants.js";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const [requests, setRequests] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [permits, setPermits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  const [viewMode, setViewMode] = useState("pending");
  const [activeTab, setActiveTab] = useState("overview"); // overview, map, vendors
  const [stats, setStats] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [owners, setOwners] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const [statsRes, vendorsRes, ownersRes] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/vendors"),
          api.get("/admin/owners")
        ]);
        setStats(statsRes.data.stats || statsRes.data);
        setVendors(vendorsRes.data.vendors || []);
        setOwners(ownersRes.data.owners || []);
      } catch (err) {
        console.error("Failed to load stats", err);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const endpoint = viewMode === "history" ? "/admin/requests?history=true" : "/admin/requests";
      const { data } = await api.get(endpoint);
      setRequests(data.requests || []);
      if (!selectedId && data.requests?.length) setSelectedId(data.requests[0].request_id);
    } catch (err) {
      showError(err.response?.data?.message || "Unable to load requests");
    } finally {
      setLoading(false);
    }
  };

  const fetchPermits = async () => {
    try {
      const { data } = await api.get("/admin/permits");
      setPermits(data.permits || []);
    } catch (err) {
      console.error("Failed to load permits", err);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const { data } = await api.get("/admin/audit-logs");
      setLogs(data.logs || []);
    } catch (err) {
      console.error("Failed to load audit logs", err);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchPermits();
    fetchAuditLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  const selected = useMemo(
    () => requests.find(r => String(r.request_id) === String(selectedId)) || null,
    [requests, selectedId]
  );

  useEffect(() => {
    if (selected && selected.lat && selected.lng) {
      window.dispatchEvent(
        new CustomEvent("centerMap", {
          detail: { lat: selected.lat, lng: selected.lng, zoom: 18 }
        })
      );
    }
  }, [selected]);

  const handleApproveClick = () => {
    setShowApproveModal(true);
  };

  const handleRejectClick = () => {
    setShowRejectModal(true);
  };

  const handleApprove = async () => {
    if (!selected) return;
    setActionLoading(true);
    try {
      await api.post(`/admin/requests/${selected.request_id}/approve`, { remarks });
      showSuccess("Request approved and permit issued");
      setRemarks("");
      setShowApproveModal(false);
      await fetchRequests();
      await fetchPermits();
      await fetchAuditLogs();
    } catch (err) {
      showError(err.response?.data?.message || "Approval failed");
      if (err.response?.data?.conflicts) console.error("Conflicts:", err.response.data.conflicts);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selected) return;
    setActionLoading(true);
    try {
      await api.post(`/admin/requests/${selected.request_id}/reject`, { remarks });
      showSuccess("Request rejected");
      setRemarks("");
      setShowRejectModal(false);
      await fetchRequests();
      await fetchAuditLogs();
    } catch (err) {
      showError(err.response?.data?.message || "Rejection failed");
    } finally {
      setActionLoading(false);
    }
  };

  const requestRadius = selected ? radiusFromDims(selected.max_width, selected.max_length) : 0;
  const conflictRadii = (selected?.conflicts || []).map(c => ({
    id: c.request_id,
    lat: c.lat,
    lng: c.lng,
    radius: radiusFromDims(c.max_width || 0, c.max_length || 0)
  }));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <header className="bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-3 md:py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 mb-4">
            <div className="text-center md:text-left">
              <Link to="/" className="block">
                <p className="text-[10px] md:text-xs text-blue-700 dark:text-blue-400 font-semibold tracking-[0.2em] hover:opacity-80 transition-opacity">SMART STREET</p>
              </Link>
              <h1 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">Admin console</h1>
              <p className="text-[10px] md:text-xs text-slate-600 dark:text-slate-400">Review requests & issue permits</p>
            </div>
            <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-slate-700 dark:text-slate-300 w-full md:w-auto justify-center md:justify-end">
              <ThemeToggle />
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
              <NotificationBell onClick={() => setShowNotificationModal(true)} />
              <span className="font-semibold truncate max-w-[100px] md:max-w-none">{user?.name}</span>
              <button onClick={logout} className="rounded-lg bg-slate-800 dark:bg-slate-700 px-3 py-1 text-white hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors whitespace-nowrap">
                Logout
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl w-full md:w-fit mx-auto md:mx-0">
             <button
               onClick={() => setActiveTab("overview")}
               className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                 activeTab === "overview" ? "bg-white dark:bg-slate-800 shadow text-blue-600 dark:text-blue-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
               }`}
             >
               <ChartBarSquareIcon className="w-4 h-4" />
               Overview
             </button>
             <button
               onClick={() => setActiveTab("map")}
               className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                 activeTab === "map" ? "bg-white dark:bg-slate-800 shadow text-blue-600 dark:text-blue-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
               }`}
             >
               <MapIcon className="w-4 h-4" />
               Map & Requests
             </button>
             <button
               onClick={() => setActiveTab("vendors")}
               className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                 activeTab === "vendors" ? "bg-white dark:bg-slate-800 shadow text-blue-600 dark:text-blue-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
               }`}
             >
               <UserGroupIcon className="w-4 h-4" />
               Vendors
             </button>
             <button
               onClick={() => setActiveTab("owners")}
               className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                 activeTab === "owners" ? "bg-white dark:bg-slate-800 shadow text-blue-600 dark:text-blue-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
               }`}
             >
               <UserGroupIcon className="w-4 h-4" />
               Owners
             </button>
          </div>
        </div>
      </header>

      <main className="flex-1 relative h-[calc(100vh-140px)] overflow-hidden">
        {activeTab === "overview" && (
           <div className="h-full overflow-y-auto p-4 md:p-6 max-w-7xl mx-auto w-full">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Dashboard Overview</h2>
              <AdminStatsCards stats={stats} loading={statsLoading} />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Quick Actions or Recent Logs? For now recent logs */}
                 <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 uppercase tracking-wide">Recent Audit Logs</h3>
                    <div className="space-y-3">
                       {logs.slice(0, 8).map((log, i) => (
                          <div key={i} className="flex gap-3 text-sm pb-3 border-b border-slate-50 dark:border-slate-800 last:border-0">
                             <div className="text-xs text-slate-400 whitespace-nowrap font-mono">{new Date(log.created_at).toLocaleTimeString()}</div>
                             <div>
                                <p className="text-slate-800 dark:text-slate-200 font-medium">{log.action}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">by Admin #{log.admin_id?.slice(0,6)}</p>
                             </div>
                          </div>
                       ))}
                       {logs.length === 0 && <p className="text-sm text-slate-400 italic">No logs found</p>}
                    </div>
                 </div>

                 <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-center items-center text-center">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-full mb-3">
                       <MapIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Review Pending Requests</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-2 mb-6">
                       There are {stats?.pending_requests || 0} requests waiting for your approval.
                    </p>
                    <button 
                       onClick={() => setActiveTab("map")}
                       className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                    >
                       Go to Map
                    </button>
                 </div>
              </div>
           </div>
        )}

        {activeTab === "vendors" && (
           <div className="h-full overflow-hidden p-4 md:p-6 max-w-7xl mx-auto w-full">
              <AdminVendorList vendors={vendors} loading={statsLoading} />
           </div>
        )}

        {activeTab === "owners" && (
           <div className="h-full overflow-hidden p-4 md:p-6 max-w-7xl mx-auto w-full">
              <AdminOwnerList owners={owners} loading={statsLoading} />
           </div>
        )}

        {activeTab === "map" && (

        <MapContainerFullscreen
          center={selected ? [selected.lat, selected.lng] : defaultCenter}
          zoom={selected ? 16 : 13}
          height="100vh"
          showFullscreenButton={false}
          overlayContent={
            <>
              {/* LEFT SIDEBAR: List */}
              <AdminSidebar
                requests={requests}
                loading={loading}
                selectedId={selectedId}
                setSelectedId={setSelectedId}
                fetchRequests={fetchRequests}
                statusColors={STATUS_COLORS}
                viewMode={viewMode}
                setViewMode={setViewMode}
              />

              {/* RIGHT SIDEBAR: Detail (Conditionally rendered) */}
              {selected && (
                <div className="absolute top-4 right-4 z-[2000]">
                   <AdminRequestDetail
                      selected={selected}
                      requestRadius={requestRadius}
                      remarks={remarks}
                      setRemarks={setRemarks}
                      handleApproveClick={handleApproveClick}
                      handleRejectClick={handleRejectClick}
                      actionLoading={actionLoading}
                   />
                </div>
              )}

              {!selected && requests.length > 0 && (
                <div className="absolute top-4 right-4 z-[2000]">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg p-6 max-w-4xl w-full transition-colors duration-300">
                    <div className="text-center py-8">
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-md mx-auto">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                          <strong>👆 Select a request from the left panel</strong><br />
                          Click any pending request to review its details and make a decision. The map will show the requested location and any spatial conflicts.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          }
        >
          {selected && (
            <>
              {/* Space circle - only if space exists */}
              {selected.space_id && selected.space_lat && selected.space_lng && (
                <Circle
                  center={[selected.space_lat, selected.space_lng]}
                  radius={selected.allowed_radius || 50}
                  pathOptions={{ color: "#22c55e", weight: 2, fillOpacity: 0.08 }}
                >
                  <Popup>Space boundary (radius: {selected.allowed_radius}m)</Popup>
                </Circle>
              )}
              {/* Request pin + circle */}
              <Marker position={[selected.lat, selected.lng]}>
                <Popup>Request location</Popup>
              </Marker>
              {requestRadius > 0 && (
                <Circle
                  center={[selected.lat, selected.lng]}
                  radius={requestRadius}
                  pathOptions={{ color: "#2563eb", weight: 3, fillOpacity: 0.18 }}
                >
                  <Popup>Request area ({selected.max_width}m × {selected.max_length}m)</Popup>
                </Circle>
              )}
              {/* Conflict circles */}
              {conflictRadii.map(c =>
                c.lat && c.lng && c.radius > 0 ? (
                  <Circle
                    key={`conflict-${c.lat}-${c.lng}`}
                    center={[c.lat, c.lng]}
                    radius={c.radius}
                    pathOptions={{ color: "#ef4444", weight: 1, fillOpacity: 0.3 }}
                  >
                    <Popup>Conflict Region</Popup>
                  </Circle>
                ) : null
              )}
            </>
          )}

        </MapContainerFullscreen>
        )}

        <NotificationModal
          isOpen={showNotificationModal}
          onClose={() => setShowNotificationModal(false)}
        />
        <ConfirmModal
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          onConfirm={handleReject}
          title="Reject Request"
          message={`Reject request #${selected?.request_id}? The vendor will be notified.`}
          confirmText="Reject Request"
          confirmVariant="danger"
          loading={actionLoading}
        />

        <ConfirmModal
          isOpen={showApproveModal}
          onClose={() => setShowApproveModal(false)}
          onConfirm={handleApprove}
          title="Approve Request"
          message={`Approve request #${selected?.request_id} and issue permit?`}
          confirmText="Approve & Issue"
          confirmVariant="primary"
          loading={actionLoading}
        />
      </main>
    </div>
  );
}

