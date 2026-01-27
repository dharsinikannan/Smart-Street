import React from "react";
import { STATUS_COLORS } from "../utils/constants.js";

export default function AdminRequestDetail({
  selected,
  requestRadius,
  remarks,
  setRemarks,
  handleApproveClick,
  handleRejectClick,
  actionLoading,
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-4 md:p-5 w-full md:w-96 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-6rem)] md:max-h-[85vh] overflow-y-auto flex flex-col transition-colors duration-300 dark:border dark:border-slate-800">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
            {selected.status !== "PENDING" ? "Request" : "Review Request"} #{selected.request_id.slice(0, 8)}...
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Submitted {new Date(selected.submitted_at).toLocaleString()}
          </p>
        </div>
        <span className={`text-xs font-bold px-3 py-1.5 rounded uppercase ${
          STATUS_COLORS[selected.status] || STATUS_COLORS.PENDING
        }`}>
          {selected.status}
        </span>
      </div>
      
      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3 mb-4 space-y-2 mt-4">
        <div className="flex justify-between items-start">
           <div>
             <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">Vendor</p>
             <p className="font-semibold text-base text-slate-900 dark:text-white leading-tight">{selected.business_name}</p>
             <p className="text-sm text-slate-500 dark:text-slate-400">{selected.vendor_name}</p>
           </div>
           <span className="px-2 py-1 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded text-xs text-slate-600 dark:text-slate-300">
             Verified
           </span>
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-lg p-3 mb-4">
        <p className="text-sm text-amber-800 dark:text-amber-400 leading-snug">
          <strong>Review:</strong> Check map for red conflict circles. Green circle = owner space.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 mb-4">
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 flex justify-between items-center">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Size</span>
          <div className="text-right">
             <p className="text-base font-semibold text-slate-900 dark:text-white">{selected.max_width}m × {selected.max_length}m</p>
             <p className="text-xs text-slate-400">Radius: {requestRadius.toFixed(1)}m</p>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 flex justify-between items-center">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Space</span>
          <div className="text-right">
             <p className="text-base font-semibold text-slate-900 dark:text-white">{selected.allowed_radius ? `${selected.allowed_radius}m` : "Custom"}</p>
             <p className="text-xs text-slate-400 truncate max-w-[120px]">{selected.space_name || "Custom Location"}</p>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 flex justify-between items-center">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Conflicts</span>
          <div className="text-right">
             <p className={`text-base font-semibold ${selected.conflicts?.length > 0 ? "text-red-600 dark:text-red-400" : "text-slate-900 dark:text-white"}`}>
               {selected.conflicts?.length || 0}
             </p>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Remarks (optional)</label>
          <textarea
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            rows={3}
            className="w-full mt-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Reasoning for decision (visible to vendor)"
          />
        </div>

        {selected.status === "PENDING" && (
          <div className="flex gap-3">
            <button
              onClick={handleRejectClick}
              disabled={actionLoading}
              className="flex-1 rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              Reject Request
            </button>
            <button
              onClick={handleApproveClick}
              disabled={actionLoading}
              className="flex-1 rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
            >
              Approve + Issue Permit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
