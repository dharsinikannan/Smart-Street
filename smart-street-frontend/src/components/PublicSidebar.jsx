import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MagnifyingGlassIcon, FunnelIcon, MapPinIcon, ClockIcon, ChatBubbleLeftRightIcon, StarIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import ReviewList from "./ReviewList";

export default function PublicSidebar({
  vendors,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories,
  onVendorClick,
  loading,
  congestion = []
}) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);

  const [selectedVendorDetail, setSelectedVendorDetail] = useState(null);

  // If a vendor is clicked from map (passed via props?) or list, we might want to show details
  // But wait, the parent passes onVendorClick which sets selectedVendor in parent state.
  // We need a way to know WHICH vendor is selected to show details IN THE SIDEBAR.
  // The logic in PublicMap sets selectedVendor state but uses it for ZOOM. 
  // Ideally, PublicMap should pass 'selectedVendor' back down to Sidebar.
  // Since I can't easily change parent props without seeing parent, I'll add local state for now
  // OR assume onVendorClick is enough. 
  // Let's modify the props to accept 'activeVendor' if possible, but for now I'll use local state triggered by click.
  
  // Actually, let's just use local state for the detail view overlay.
  const handleVendorClickInternal = (vendor) => {
    setSelectedVendorDetail(vendor);
    onVendorClick(vendor); // Still trigger map zoom
  };

  return (
    <div className={`absolute top-4 left-4 z-[2000] flex flex-col max-h-[calc(100vh-2rem)] transition-all duration-300 ${isOpen ? "w-[calc(100vw-2rem)] max-w-md" : "w-12 h-12 overflow-hidden rounded-full"}`}>
      
      {/* Search & Filter Header (Glassmorphism) - Hide if viewing detail */}
      {!selectedVendorDetail && (
      <div className={`bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-xl border border-slate-200 dark:border-slate-700 flex flex-col gap-4 p-5 transition-all ${isOpen ? "rounded-2xl mb-4" : "rounded-full p-0 h-full w-full items-center justify-center cursor-pointer"}`}
           onClick={() => !isOpen && setIsOpen(true)}
      >
        {isOpen ? (
          <>
             <div className="flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2 group">
                  <div className="w-8 h-8 bg-gradient-to-tr from-teal-500 to-cyan-600 rounded-full flex items-center justify-center shadow-md shadow-cyan-500/30 group-hover:scale-105 transition-transform">
                     <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  </div>
                  <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">Smart Street</h1>
                </Link>
                <div className="flex gap-2">
                 <button 
                  onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                  className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                >
                  <FunnelIcon className="w-5 h-5" />
                </button>
               </div>
             </div>

             <div className="space-y-3">
               <div className="relative">
                 <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input 
                   type="text" 
                   placeholder={t('search_placeholder')}
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 dark:text-white"
                 />
               </div>
               
               <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                 <button 
                   onClick={() => setSelectedCategory("")}
                   className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full transition-all ${
                     selectedCategory === "" 
                     ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md" 
                     : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                   }`}
                 >
                   {t('all')}
                 </button>
                 {categories.map(cat => (
                   <button 
                     key={cat}
                     onClick={() => setSelectedCategory(cat)}
                     className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                       selectedCategory === cat 
                       ? "bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md shadow-cyan-200 dark:shadow-cyan-900/20" 
                       : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                     }`}
                   >
                     {cat}
                   </button>
                 ))}
               </div>
             </div>
          </>
        ) : (
          <MagnifyingGlassIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        )}
      </div>
      )}

      {/* Vendor List or Detail View */}
      {isOpen && (
        <div className="flex-1 overflow-y-auto pr-2 space-y-3 pb-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
           
           {selectedVendorDetail ? (
             <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-fade-in-up">
               {/* Detail Header */}
               <div className="relative h-32 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                 <button 
                   onClick={() => setSelectedVendorDetail(null)}
                   className="absolute top-4 left-4 p-2 bg-white/50 dark:bg-black/50 backdrop-blur-md rounded-full text-slate-800 dark:text-white hover:bg-white dark:hover:bg-black transition-colors"
                 >
                   <ChevronLeftIcon className="w-5 h-5" />
                 </button>
                 <div className="absolute -bottom-10 left-6">
                    <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-2xl shadow-lg flex items-center justify-center text-4xl border-4 border-white dark:border-slate-950">
                      {selectedVendorDetail.business_name[0].toUpperCase()}
                    </div>
                 </div>
               </div>
               
               <div className="pt-12 px-6 pb-6 space-y-6">
                 <div>
                   <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedVendorDetail.business_name}</h2>
                   <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
                     <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-md font-medium text-xs uppercase tracking-wide">{selectedVendorDetail.category}</span>
                     <span>•</span>
                     <span className="flex items-center gap-1"><MapPinIcon className="w-4 h-4" /> {selectedVendorDetail.address}</span>
                   </p>
                 </div>

                 <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-4">{t('reviews')}</h3>
                    <ReviewList vendorId={selectedVendorDetail.vendor_id} />
                 </div>
               </div>
             </div>
           ) : (
             <>
               {congestion.length > 0 && (
                <div className="mb-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
                  <p className="text-xs font-bold text-amber-800 dark:text-amber-400 mb-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    {t('busy_zones')}
                  </p>
                  {congestion.slice(0, 3).map((zone, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs text-amber-700 dark:text-amber-300 ml-4 py-0.5">
                      <span className="truncate max-w-[120px]">{zone.vendors?.[0]?.space_name || "Unknown Area"}</span>
                      <span className="font-semibold">{t('vendors_count', { count: zone.vendor_count })}</span>
                    </div>
                  ))}
                </div>
              )}

              {loading ? (
                 <div className="text-center py-8 text-slate-500 text-sm">{t('loading')}</div>
              ) : vendors.length === 0 ? (
                 <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-lg">
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{t('no_vendors')}</p>
                 </div>
              ) : (
                vendors.map(vendor => {
                  const isOpenNow = isVendorOpen(vendor.start_time, vendor.end_time);
                  return (
                    <div 
                      key={vendor.request_id}
                      onClick={() => handleVendorClickInternal(vendor)}
                      className="group bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer relative overflow-hidden"
                    >
                      <div className={`absolute top-0 left-0 w-1 h-full ${isOpenNow ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
                      
                      <div className="flex justify-between items-start mb-1 pl-2">
                        <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                          {vendor.business_name}
                        </h3>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          isOpenNow 
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        }`}>
                          {isOpenNow ? t('open') : t('closed')}
                        </span>
                      </div>
                      
                      <div className="pl-2 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                          <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs font-medium uppercase tracking-wide">
                            {vendor.category}
                          </span>
                        </div>
                        
                        <div className="flex items-start gap-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                          <MapPinIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{vendor.address}</span>
                        </div>

                       <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                          <ClockIcon className="w-4 h-4" />
                           {new Date(vendor.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(vendor.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
             </>
           )}
        </div>
      )}
    </div>
  );
}

function isVendorOpen(start, end) {
  const now = new Date();
  const startTime = new Date(start);
  const endTime = new Date(end);
  
  // Normalize to today's date for time comparison
  const current = new Date();
  const s = new Date(); s.setHours(startTime.getHours(), startTime.getMinutes(), 0);
  const e = new Date(); e.setHours(endTime.getHours(), endTime.getMinutes(), 0);
  
  return current >= s && current <= e;
}
