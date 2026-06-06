'use client';

const statusConfig = {
  accepted:       { label: 'Driver Coming',    color: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500' },
  driver_arrived: { label: 'Driver Arrived',   color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  in_progress:    { label: 'Ride In Progress', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  completed:      { label: 'Completed',        color: 'bg-gray-100 text-gray-600',   dot: 'bg-gray-400' },
};

export default function Navbar({ status }) {
  const cfg = status ? statusConfig[status] : null;

  return (
    <nav className="bg-primary-700 shadow-lg z-50 relative">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow">
            <span className="text-base">🚗</span>
          </div>
          <div>
            <span className="text-white font-bold text-base leading-none">GoMobility</span>
            <span className="block text-blue-200 text-[10px] leading-none">Live Tracking</span>
          </div>
        </div>

        {cfg && (
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`} />
            {cfg.label}
          </div>
        )}
      </div>
    </nav>
  );
}
