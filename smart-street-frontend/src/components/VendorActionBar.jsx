import React from "react";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";

export default function VendorActionBar({
  intent,
  form,
  setForm,
  requestedRadius,
  setRequestedRadius,
  ownerDefinedRadius,
  handleSubmit,
  saving,
  className = ""
}) {
  const isOwnerDefined = intent === "OWNER_DEFINED";
  const isRequestNew = intent === "REQUEST_NEW";

  return (
    <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-[2000] ${className}`}>
      <form
        onSubmit={handleSubmit}
        className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 flex flex-col gap-4"
      >
        <div className="flex flex-col md:flex-row gap-4 items-end">
          {/* Time Window Inputs */}
          <div className="flex-1 w-full grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Time</label>
              <input
                type="datetime-local"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full text-sm rounded-lg border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 py-2 px-3 bg-slate-50 dark:bg-slate-800 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">End Time</label>
              <input
                type="datetime-local"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="w-full text-sm rounded-lg border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 py-2 px-3 bg-slate-50 dark:bg-slate-800 dark:text-white"
                required
              />
            </div>
          </div>

          {/* Radius Input */}
          <div className="w-full md:w-48">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Radius (m) {isOwnerDefined && <span className="text-slate-400 font-normal">(Fixed)</span>}
            </label>
            <input
              type="number"
              value={isOwnerDefined ? ownerDefinedRadius : requestedRadius}
              onChange={(e) => setRequestedRadius(e.target.value)}
              disabled={isOwnerDefined}
              placeholder="e.g. 5"
              className={`w-full text-sm rounded-lg border-slate-200 dark:border-slate-700 py-2 px-3 ${
                isOwnerDefined ? "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-500 cursor-not-allowed" : "bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500"
              }`}
            />
            {isRequestNew && (
               <span className="text-[10px] text-slate-400 mt-1 block">Editable only for new requests</span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
             disabled={saving || !intent}
            className={`w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold shadow-lg transition-all transform active:scale-95 ${
              saving
                ? "bg-slate-300 text-slate-500 cursor-wait"
                : !intent
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-200"
            }`}
          >
            {saving ? (
              "Submitting..."
            ) : (
              <>
                <PaperAirplaneIcon className="w-4 h-4" />
                <span>Submit Request</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
