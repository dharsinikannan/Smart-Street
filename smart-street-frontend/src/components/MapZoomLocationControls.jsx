import { useMap } from "react-leaflet";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/outline";
import { MapPinIcon } from "@heroicons/react/24/solid"; 

export default function MapZoomLocationControls() {
  const map = useMap();

  const handleZoomIn = (e) => {
    e.stopPropagation();
    map.zoomIn();
  };

  const handleZoomOut = (e) => {
    e.stopPropagation();
    map.zoomOut();
  };

  const handleLocate = (e) => {
    e.stopPropagation();
    map.locate({ setView: true, maxZoom: 16 });
  };

  // Prevent clicks from propagating to map (dragging etc)
  const disablePropagation = (e) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="absolute top-24 right-4 z-[1000] flex flex-col gap-2"
      onDoubleClick={disablePropagation}
      onMouseDown={disablePropagation}
      onClick={disablePropagation}
      onTouchStart={disablePropagation}
    >
      {/* Location Button */}
      <button
        onClick={handleLocate}
        className="bg-white dark:bg-slate-800 p-2 rounded shadow-md border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center w-10 h-10"
        title="Show Your Location"
        type="button"
      >
        <MapPinIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
      </button>

      {/* Zoom Controls */}
      <div className="flex flex-col bg-white dark:bg-slate-800 rounded shadow-md border border-slate-300 dark:border-slate-600 overflow-hidden">
        <button
          onClick={handleZoomIn}
          className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center w-10 h-10 border-b border-slate-200 dark:border-slate-600"
          title="Zoom In"
          type="button"
        >
          <PlusIcon className="h-5 w-5 text-slate-700 dark:text-slate-200" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center w-10 h-10"
          title="Zoom Out"
          type="button"
        >
          <MinusIcon className="h-5 w-5 text-slate-700 dark:text-slate-200" />
        </button>
      </div>
    </div>
  );
}
