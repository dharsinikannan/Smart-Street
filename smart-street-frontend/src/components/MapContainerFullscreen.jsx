import { useState, useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { ArrowsPointingOutIcon, XMarkIcon } from "@heroicons/react/24/outline";
import MapSearchControl from "./MapSearchControl.jsx";
import MapZoomLocationControls from "./MapZoomLocationControls.jsx";
import "leaflet/dist/leaflet.css";

const defaultCenter = [12.9716, 77.5946];

const MapEventListener = () => {
  const map = useMap();

  useEffect(() => {
    const handleCenterMap = (event) => {
      const { lat, lng, zoom = 16 } = event.detail;
      map.setView([lat, lng], zoom, { animate: true });
    };

    window.addEventListener('centerMap', handleCenterMap);
    return () => window.removeEventListener('centerMap', handleCenterMap);
  }, [map]);

  return null;
};

const MapInvalidator = ({ isFullscreen }) => {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [map, isFullscreen]);
  return null;
};

export default function MapContainerFullscreen({
  children,
  center = defaultCenter,
  zoom = 13,
  className = "",
  height = "70vh",
  showSearch = true,
  searchQuery = "",
  onSearchSelect,
  isFullscreen: controlledIsFullscreen,
  onToggleFullscreen: controlledOnToggleFullscreen,
  overlayContent,
  showFullscreenButton = true
}) {
  const [internalIsFullscreen, setInternalIsFullscreen] = useState(false);
  const containerRef = useState(null)[1] || React.useRef(null);

  const isFullscreen = controlledIsFullscreen !== undefined ? controlledIsFullscreen : internalIsFullscreen;

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNativeFullscreen = !!document.fullscreenElement;
      if (controlledOnToggleFullscreen) {
        if (controlledIsFullscreen !== isNativeFullscreen) {
           controlledOnToggleFullscreen(isNativeFullscreen);
        }
      } else {
        setInternalIsFullscreen(isNativeFullscreen);
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [controlledIsFullscreen, controlledOnToggleFullscreen]);

  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
         if (containerRef.current) await containerRef.current.requestFullscreen();
      } else {
        if (document.fullscreenElement) await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen toggle failed:", err);
    }
  };

  useEffect(() => {
    if (controlledIsFullscreen && !document.fullscreenElement && containerRef.current) {
       containerRef.current.requestFullscreen().catch(err => console.warn("Auto-enter FS failed", err));
    } else if (!controlledIsFullscreen && document.fullscreenElement) {
       document.exitFullscreen().catch(err => console.warn("Auto-exit FS failed", err));
    }
  }, [controlledIsFullscreen]);

  const containerStyle = {
     height: isFullscreen ? "100vh" : height,
     width: isFullscreen ? "100vw" : "100%",
     position: isFullscreen ? "fixed" : "relative",
     top: isFullscreen ? 0 : "auto",
     left: isFullscreen ? 0 : "auto",
     margin: 0,
     zIndex: isFullscreen ? 9999 : "auto",
     backgroundColor: "white"
  };

  return (
    <div
      ref={containerRef}
      className={`${className} ${isFullscreen ? "fullscreen-active fixed inset-0 z-[9999]" : "relative rounded-xl border border-slate-200 overflow-hidden"}`}
      style={containerStyle}
    >
      {showFullscreenButton && (
        <button
          type="button"
          onClick={() => {
              if (controlledOnToggleFullscreen) controlledOnToggleFullscreen(!isFullscreen);
              else toggleFullscreen();
          }}
          className="absolute top-4 right-4 z-[2000] bg-white rounded-lg p-2 shadow-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? <XMarkIcon className="h-5 w-5 text-slate-600" /> : <ArrowsPointingOutIcon className="h-5 w-5 text-slate-600" />}
        </button>
      )}

      {/* Overlays (Sidebar, Action Bar) - Parent must ensure these have high z-index (e.g. z-[2000]) */}
      {overlayContent}

      <div className="w-full h-full z-0 isolate">
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <MapInvalidator isFullscreen={isFullscreen} />
          
          {showSearch && (
            <MapSearchControl 
              onSelect={onSearchSelect} 
              externalQuery={searchQuery}
              className="absolute top-4 right-16 z-[2000]"
            />
          )}

          <TileLayer
            attribution='&copy; <a href="https://osm.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapZoomLocationControls />
          <MapEventListener />
          {children}
        </MapContainer>
      </div>

      {isFullscreen && (
        <div className="absolute bottom-4 left-4 z-[2000] bg-white/50 backdrop-blur rounded px-2 py-1 text-[10px] text-slate-500 pointer-events-none">
          Press Esc to exit
        </div>
      )}
    </div>
  );
}