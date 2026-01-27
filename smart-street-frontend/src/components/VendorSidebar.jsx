import React, { useState } from "react";
import { ChevronRightIcon, ChevronLeftIcon, PlusCircleIcon, ClockIcon, DocumentCheckIcon, ArrowRightIcon, QrCodeIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import AnalyticsChart from "./AnalyticsChart";
import { useTranslation } from "react-i18next";

export default function VendorSidebar({
  intent,
  setIntent,
  spaces,
  selectedSpaceId,
  setSelectedSpaceId,
  loading,
  requests,
  permits,
  onOpenQr,
  onRequestClick,
  className = ""
}) {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("new"); // "new", "history", "permits"
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSpaces = spaces.filter(s =>
    s.space_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className={`absolute top-4 left-4 z-[2000] flex flex-col transition-all duration-300 ${
        collapsed ? "w-12 h-12 bg-white/90 dark:bg-slate-900/90 shadow-md rounded-full overflow-hidden" : "w-80 md:w-96 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-xl rounded-xl border border-slate-200 dark:border-slate-800"
      } ${className}`}
    >
      {/* Toggle Button */}
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className={`absolute z-[1010] p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all ${
           collapsed ? "inset-0 flex items-center justify-center w-full h-full border-none" : "right-2 top-2 w-8 h-8 flex items-center justify-center"
        }`}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRightIcon className="w-5 h-5" /> : <ChevronLeftIcon className="w-4 h-4" />}
      </button>

      {!collapsed && (
        <div className="flex flex-col h-full overflow-hidden">
           {/* Tab Navigation */}
           <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-1">
              <button
                onClick={() => setActiveTab("new")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === "new" ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                <PlusCircleIcon className="w-4 h-4" />
                {t('new', { defaultValue: 'New' })}
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === "history" ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                <ClockIcon className="w-4 h-4" />
                {t('history', { defaultValue: 'History' })}
              </button>
              <button
                onClick={() => setActiveTab("permits")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === "permits" ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                <DocumentCheckIcon className="w-4 h-4" />
                {t('permits', { defaultValue: 'Permits' })}
              </button>
           </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            
            {/* --- TAB: NEW REQUEST --- */}
            {activeTab === "new" && (
              <>
                {/* Header */}
                <div>
                  <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1">New Request</h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Select intent & space</p>
                </div>

                {/* 1. Intent Selection */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Request Type</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setIntent("OWNER_DEFINED")}
                      className={`py-3 px-2 text-sm font-medium rounded-lg border transition-all ${
                        intent === "OWNER_DEFINED"
                          ? "bg-blue-600 text-white border-blue-600 shadow-md"
                          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                      }`}
                    >
                      Owner Location
                    </button>
                    <button
                      type="button"
                      onClick={() => setIntent("REQUEST_NEW")}
                      className={`py-3 px-2 text-sm font-medium rounded-lg border transition-all ${
                        intent === "REQUEST_NEW"
                          ? "bg-purple-600 text-white border-purple-600 shadow-md"
                          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                      }`}
                    >
                      New Request
                    </button>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>

                {/* 2. Space Selection */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300">Select Space</h3>
                  {loading ? (
                    <div className="text-xs text-slate-400 italic">Loading spaces...</div>
                  ) : spaces.length === 0 ? (
                    <div className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-100 dark:border-red-900/30">
                      No spaces available.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Search spaces..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full text-xs rounded-lg border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2"
                      />
                      
                      <select
                        value={selectedSpaceId || ""}
                        onChange={(e) => setSelectedSpaceId(e.target.value || null)}
                        className="w-full text-sm rounded-lg border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        <option value="">
                          {filteredSpaces.length === 0 ? "-- No matches found --" : "-- Choose an Owner Space --"}
                        </option>
                        {filteredSpaces.map((s) => (
                          <option key={s.space_id} value={s.space_id}>
                            {s.space_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* --- TAB: HISTORY --- */}
            {activeTab === "history" && (
              <div className="space-y-4">
                 <div>
                  <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1">Request History</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Track your submissions</p>
                </div>
                <div className="space-y-2">
                   {requests.length === 0 ? (
                     <p className="text-xs text-slate-400 italic">No requests found.</p>
                   ) : (
                     requests.map(r => (
                       <div 
                         key={r.request_id} 
                         onClick={() => onRequestClick && onRequestClick(r)}
                         className="p-3 bg-white dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700 rounded-lg text-xs hover:border-blue-200 dark:hover:border-blue-500 transition-colors cursor-pointer group"
                       >
                          <div className="flex justify-between items-start mb-1">
                             <span className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">#{r.request_id.slice(0,6)}</span>
                             <div className="flex items-center gap-2">
                               <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                 STATUS_COLORS[r.status] || STATUS_COLORS.PENDING
                               }`}>{r.status}</span>
                             </div>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 truncate">{r.space_name || "Custom Location"}</p>
                          <div className="flex justify-between items-center mt-2">
                             <p className="text-[10px] text-slate-400">{new Date(r.submitted_at).toLocaleDateString()}</p>
                             <span className="text-[10px] text-blue-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">View Details →</span>
                          </div>
                       </div>
                     ))
                   )}
                </div>
              </div>
            )}

            {/* --- TAB: PERMITS --- */}
            {activeTab === "permits" && (
              <div className="space-y-4">
                 <div>
                  <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1">My Permits</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Valid Access Passes</p>
                </div>
                <div className="space-y-2">
                   {permits.length === 0 ? (
                     <p className="text-xs text-slate-400 italic">No active permits.</p>
                   ) : (
                     permits.map(p => (
                       <div key={p.permit_id} className="p-3 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-lg text-xs">
                          <div className="flex justify-between items-start mb-1">
                             <span className="font-semibold text-green-900 dark:text-green-300 border-b border-green-200 dark:border-green-800 pb-0.5">Permit #{p.permit_id}</span>
                             <button 
                               onClick={() => onOpenQr && onOpenQr(p)}
                               className="text-[10px] bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded hover:bg-green-300 dark:hover:bg-green-800 transition-colors font-medium shadow-sm"
                             >
                               View Permit
                             </button>
                          </div>
                          <p className="text-green-800 dark:text-green-400 mt-1 font-medium">Valid: {new Date(p.valid_from).toLocaleDateString()}</p>
                          <p className="text-green-700 dark:text-green-500 text-[10px]">To: {new Date(p.valid_to).toLocaleDateString()}</p>
                       </div>
                     ))
                   )}
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
