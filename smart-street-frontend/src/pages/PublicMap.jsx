import { useEffect, useState, useMemo } from "react";
import { Marker, Circle, Popup, useMap } from "react-leaflet";
import { Link, useLocation } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import api from "../api.jsx";
import MapContainerFullscreen from "../components/MapContainerFullscreen.jsx";
import MapSearchControl from "../components/MapSearchControl.jsx";
import PublicSidebar from "../components/PublicSidebar.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import LanguageSwitcher from "../components/LanguageSwitcher.jsx";
import { useTranslation } from "react-i18next";

const defaultCenter = [11.3410, 77.7172];

const radiusFromDims = (maxWidth, maxLength) => {
  return Math.sqrt(maxWidth ** 2 + maxLength ** 2) / 2;
};

// Helper component to sync map movement with parent state (for congestion logic, etc.)
const MapBoundsUpdater = ({ onBoundsChange }) => {
  const map = useMap();
  useEffect(() => {
    const updateBounds = () => {
      const bounds = map.getBounds();
      onBoundsChange({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest()
      });
    };
    map.on("moveend", updateBounds);
    map.on("zoomend", updateBounds);
    updateBounds();
    return () => {
      map.off("moveend", updateBounds);
      map.off("zoomend", updateBounds);
    };
  }, [map, onBoundsChange]);
  return null;
};

// Helper to zoom to a vendor
const MapZoomHandler = ({ target }) => {
  const map = useMap();
  useEffect(() => {
    if (target && target.lat && target.lng) {
      map.flyTo([target.lat, target.lng], 17, { duration: 1.5 });
    }
  }, [target, map]);
  return null;
};

export default function PublicMap() {
  const { t } = useTranslation();
  const [vendors, setVendors] = useState([]);
  const [congestion, setCongestion] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [mapBounds, setMapBounds] = useState(null);
  const [fullscreen, setFullscreen] = useState(true); // Default to fullscreen
  const [selectedVendor, setSelectedVendor] = useState(null); // For zoom interaction

  const categories = useMemo(() => {
    const cats = new Set(vendors.map(v => v.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [vendors]);

  const filteredVendors = useMemo(() => {
    return vendors.filter(v => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        (v.business_name && v.business_name.toLowerCase().includes(q)) ||
        (v.category && v.category.toLowerCase().includes(q)) ||
        (v.space_name && v.space_name.toLowerCase().includes(q)) ||
        (v.address && v.address.toLowerCase().includes(q));
      const matchesCategory = !selectedCategory || v.category === selectedCategory;
      return matchesQuery && matchesCategory;
    });
  }, [vendors, searchQuery, selectedCategory]);

  const fetchVendors = async (signal) => {
    setLoading(true);
    try {
      const { data } = await api.get("/public/vendors", { signal });
      setVendors(data.vendors || []);
    } catch (err) {
      if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED" && err.code !== "ECONNABORTED") {
         console.error("Failed to load vendors:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCongestion = async (bounds, signal) => {
    if (!bounds) return;
    try {
      const { data } = await api.get(`/public/routes?bounds=${encodeURIComponent(JSON.stringify(bounds))}`, { signal });
      setCongestion(data.congestion || []);
    } catch (err) {
      if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED" && err.code !== "ECONNABORTED") {
        console.error("Failed to load congestion data:", err);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchVendors(controller.signal);
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (mapBounds) {
      fetchCongestion(mapBounds);
    }
  }, [mapBounds]);

  const location = useLocation();
  useEffect(() => {
    if (location.state?.focusVendor) {
      // Small delay to ensure map is ready or just set it directly
      setSelectedVendor({ data: location.state.focusVendor, ts: Date.now() });
      
      // Clear state so it doesn't persist if we navigate away and back? 
      // Actually React Router state persists. We might want to clear it, but let's keep it simple.
      // We can also ensure the vendor is added to the list if not already present?
      // Logic: if the vendor from search results isn't in the current viewport list, we should probably add it 
      // OR we just rely on the map moving to that location and fetching new vendors there.
      // But fetchVendors depends on viewport? No, fetchVendors fetches ALL public vendors currently (based on API).
      // So simply setting selectedVendor is enough.
    }
  }, [location.state]);

  // Wrap selected vendor in an object with distinct key to force updates on re-click
  const handleVendorClick = (vendor) => {
    setSelectedVendor({ data: vendor, ts: Date.now() });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* Map Layout */}
      <MapContainerFullscreen
        center={defaultCenter}
        zoom={13}
        height="100vh"
        isFullscreen={fullscreen}
        onToggleFullscreen={setFullscreen}
        showFullscreenButton={false}
        showSearch={false}
        overlayContent={
          <>
             {/* Sidebar */}
             <PublicSidebar 
                vendors={filteredVendors}
                congestion={congestion}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                categories={categories}
                onVendorClick={handleVendorClick}
                loading={loading}
             />
          </>
        }
      >
        {/* Header Controls (Moved inside MapContainer for context access) */}
        <div className="absolute top-4 right-4 z-[2000] flex flex-col-reverse sm:flex-row items-end sm:items-start gap-3 pointer-events-none max-w-[calc(100vw-3rem)]">
           <div className="flex items-center gap-3 pointer-events-auto shadow-sm rounded-xl overflow-hidden sm:overflow-visible sm:shadow-none bg-white/10 sm:bg-transparent p-1 sm:p-0 backdrop-blur-sm sm:backdrop-blur-none border sm:border-none border-white/20">
             <Link
               to="/verify"
               className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 px-3 py-2 sm:px-4 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm whitespace-nowrap"
             >
               {t('verify')}
             </Link>
             <Link
               to="/login"
               className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 backdrop-blur-md px-3 py-2 sm:px-4 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold text-white transition-all shadow-md shadow-cyan-600/20"
             >
               {t('login')}
             </Link>
             <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1.5 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hidden sm:block">
               <ThemeToggle />
             </div>
             <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1.5 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hidden sm:block">
               <LanguageSwitcher />
             </div>
           </div>

           {/* Search Bar (Right) */}
           <div className="pointer-events-auto relative z-50">
              <MapSearchControl 
                placeholder="Search places..."
                onSelect={(lat, lng) => {
                   // Handled internally
                }} 
              />
           </div>
        </div>

        <MapBoundsUpdater onBoundsChange={setMapBounds} />
        {selectedVendor?.data && (
           <MapZoomHandler 
             key={selectedVendor.ts} 
             target={selectedVendor.data} 
           />
        )}
        
        {filteredVendors.map(vendor => {
          if (!vendor.lat || !vendor.lng) return null;
          
          const lat = Number(vendor.lat);
          const lng = Number(vendor.lng);
          
          const requestRadius = vendor.max_width && vendor.max_length
            ? radiusFromDims(vendor.max_width, vendor.max_length)
            : 5; 
          
          return (
            <div key={`${vendor.vendor_id}-${vendor.request_id}`}>
              <Marker 
                 position={[lat, lng]}
                 eventHandlers={{
                    click: () => handleVendorClick(vendor)
                 }}
              >
                <Popup>
                  <div className="text-sm min-w-[200px]">
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="font-bold text-base">{vendor.business_name}</h3>
                       <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-medium uppercase">{vendor.category}</span>
                    </div>
                    <p className="text-xs text-slate-600 mb-1">{vendor.address}</p>
                    <p className="text-xs text-slate-500 mb-2">{vendor.space_name}</p>
                    
                    <div className="border-t pt-2 mt-2 flex justify-between items-center">
                       <p className="text-xs font-mono text-slate-500">
                        {new Date(vendor.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(vendor.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                       </p>
                    </div>
                  </div>
                </Popup>
              </Marker>
              
              {/* Optional: Show circle only on hover or selection to reduce clutter? For now keeping it simple */}
              {/* Or maybe show concise circle for all */}
              {requestRadius > 0 && (
                <Circle
                  center={[lat, lng]}
                  radius={requestRadius}
                  pathOptions={{
                    color: "#22c55e",
                    weight: 1,
                    fillOpacity: 0.1
                  }}
                />
              )}
            </div>
          );
        })}
      </MapContainerFullscreen>
    </div>
  );
}
