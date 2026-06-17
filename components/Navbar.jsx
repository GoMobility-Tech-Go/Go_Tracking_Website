'use client';

const statusConfig = {
  assigned:  { label: 'Driver Coming',    color: 'bg-blue-500/20 text-gold-300 border border-gold-500/40',    dot: 'bg-gold-400' },
  arrived:   { label: 'Driver Arrived',   color: 'bg-amber-500/20 text-amber-300 border border-amber-400/40', dot: 'bg-amber-400' },
  started:   { label: 'Ride In Progress', color: 'bg-green-500/20 text-green-300 border border-green-400/40', dot: 'bg-green-400' },
  completed: { label: 'Completed',        color: 'bg-gray-500/20 text-gray-300 border border-gray-400/40',    dot: 'bg-gray-400' },
  cancelled: { label: 'Cancelled',        color: 'bg-red-500/20 text-red-300 border border-red-400/40',      dot: 'bg-red-400' },
};

export default function Navbar({ status, connected }) {
  const cfg = status ? statusConfig[status] : null;

  return (
    <nav className="shadow-2xl z-50 relative border-b border-white/10" style={{ background: '#0E1B55' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-1">
          <img
            src="/go-logo.jpeg"
            alt="GoMobility"
            className="h-12 w-12 object-cover"
          />
          <div className="leading-none">
            <span className="gold-shine-text font-black text-base tracking-wider block">GoMobility</span>
            <span className="text-[10px] tracking-widest uppercase block mt-0.5" style={{ color: '#8899cc' }}>Live Tracking</span>
          </div>
        </div>

        {/* Status pill */}
        <div className="flex items-center gap-2">
          {connected === false && (
            <span className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold text-amber-300/90 bg-amber-500/15 border border-amber-400/30 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Reconnecting…
            </span>
          )}
          {cfg && (
            <div className={`status-badge flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold ${cfg.color}`}>
              <span className={`w-2 h-2 rounded-full ${cfg.dot} animate-pulse`} />
              {cfg.label}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
