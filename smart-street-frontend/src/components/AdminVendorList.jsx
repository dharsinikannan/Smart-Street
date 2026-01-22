import { useState } from "react";
import { MagnifyingGlassIcon, UserCircleIcon } from "@heroicons/react/24/outline";

export default function AdminVendorList({ vendors, loading }) {
  const [search, setSearch] = useState("");

  const filtered = vendors?.filter(v => 
    v.vendor_name.toLowerCase().includes(search.toLowerCase()) ||
    v.business_name.toLowerCase().includes(search.toLowerCase()) ||
    v.email.toLowerCase().includes(search.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded w-1/3"></div>
          <div className="space-y-2">
             {[...Array(5)].map((_, i) => (
               <div key={i} className="h-12 bg-slate-50 dark:bg-slate-800/50 rounded"></div>
             ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Registered Vendors</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Total {vendors?.length || 0} vendors
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search vendors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold sticky top-0">
            <tr>
              <th className="px-6 py-4">Vendor</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Statistics</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 italic">
                  No vendors found matching "{search}"
                </td>
              </tr>
            ) : (
              filtered.map((vendor) => (
                <tr key={vendor.vendor_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <UserCircleIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{vendor.business_name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{vendor.vendor_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm space-y-0.5">
                      <p className="text-slate-700 dark:text-slate-300">{vendor.email}</p>
                      <p className="text-xs text-slate-500">{vendor.phone_number}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <span className="block font-bold text-slate-800 dark:text-slate-200">{vendor.active_permits}</span>
                        <span className="text-[10px] text-slate-500 uppercase">Permits</span>
                      </div>
                      <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
                      <div className="text-center">
                        <span className="block font-bold text-slate-800 dark:text-slate-200">{vendor.total_requests}</span>
                        <span className="text-[10px] text-slate-500 uppercase">Requests</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {new Date(vendor.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Verified
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
