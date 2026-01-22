import { 
  UserGroupIcon, 
  MapPinIcon, 
  TicketIcon, 
  ClockIcon 
} from "@heroicons/react/24/outline";

export default function AdminStatsCards({ stats, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      title: "Total Vendors",
      value: stats.total_vendors,
      icon: UserGroupIcon,
      color: "bg-blue-500",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      text: "text-blue-600 dark:text-blue-400"
    },
    {
      title: "Active Permits",
      value: stats.active_permits,
      subValue: `/ ${stats.total_permits} Total`,
      icon: TicketIcon,
      color: "bg-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      text: "text-emerald-600 dark:text-emerald-400"
    },
    {
      title: "Owner Spaces",
      value: stats.total_spaces,
      icon: MapPinIcon,
      color: "bg-purple-500",
      bg: "bg-purple-50 dark:bg-purple-900/20",
      text: "text-purple-600 dark:text-purple-400"
    },
    {
      title: "Pending Requests",
      value: stats.pending_requests,
      icon: ClockIcon,
      color: "bg-amber-500",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      text: "text-amber-600 dark:text-amber-400"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => (
        <div 
          key={idx} 
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                {card.title}
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {card.value}
                </span>
                {card.subValue && (
                  <span className="text-xs text-slate-400">{card.subValue}</span>
                )}
              </div>
            </div>
            <div className={`p-2 rounded-lg ${card.bg}`}>
              <card.icon className={`w-6 h-6 ${card.text}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
