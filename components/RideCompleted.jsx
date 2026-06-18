'use client';
import dynamic from 'next/dynamic';
import ShareButton from './ShareButton';

const RouteReplayMap = dynamic(() => import('./RouteReplayMap'), { ssr: false });

const addr = (loc) => (typeof loc === 'string' ? loc : loc?.address || '—');
const num  = (v) => {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const variants = {
  completed: {
    badge: '✅ Completed',
    badgeClass: 'bg-green-500/15 border-green-400/40 text-green-300',
    title: 'Ride Completed',
    subtitle: (name) => `${name || 'Passenger'} reached destination safely`,
    farewell: 'Thank you for riding with GoMobility 🙏',
    showFare: true,
    cancelled: false,
  },
  cancelled: {
    badge: '✖️ Cancelled',
    badgeClass: 'bg-red-500/15 border-red-400/40 text-red-300',
    title: 'Ride Cancelled',
    subtitle: () => 'This ride was cancelled before completion',
    farewell: 'See you on your next ride 👋',
    showFare: false,
    cancelled: true,
  },
  expired: {
    badge: '⌛ Link Expired',
    badgeClass: 'bg-gray-500/15 border-gray-400/40 text-gray-300',
    title: 'Tracking Link Expired',
    subtitle: () => 'This tracking link is no longer active',
    farewell: 'Open a fresh link from your ride to track again',
    showFare: false,
    cancelled: true,
  },
};

function actualDurationMin(startIso, endIso) {
  if (!startIso || !endIso) return null;
  const a = new Date(startIso).getTime();
  const b = new Date(endIso).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b) || b <= a) return null;
  return Math.round((b - a) / 60000);
}

function ReceiptPanel({ data, variant }) {
  const fare = num(data.fare?.final) ?? num(data.fare?.estimated);

  // Distance: prefer Google planned (meters → km), fall back to breadcrumb km
  const plannedMeters = num(data.routeStats?.plannedDistance);
  const dist = plannedMeters != null
    ? plannedMeters / 1000
    : num(data.routeStats?.totalDistance);

  // Duration: prefer actual elapsed (startedAt → completedAt), fall back to planned, then breadcrumb
  const actualMin  = actualDurationMin(data.timestamps?.startedAt, data.timestamps?.completedAt);
  const plannedSec = num(data.routeStats?.plannedDuration);
  const dur = actualMin != null
    ? actualMin
    : plannedSec != null
      ? Math.round(plannedSec / 60)
      : num(data.routeStats?.totalDuration);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-royal-400 font-bold uppercase tracking-widest">Ride Summary</p>
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
          variant.cancelled
            ? 'bg-red-50 border-red-200 text-red-600'
            : 'bg-green-50 border-green-200 text-green-700'
        }`}>
          {variant.badge}
        </span>
      </div>

      {variant.showFare && fare != null && (
        <div className="bg-gradient-to-r from-royal-900 to-royal-800 rounded-2xl p-4">
          <p className="text-gold-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Fare</p>
          <p className="text-3xl font-black text-white">
            ₹<span className="gold-shine-text">{fare.toFixed(0)}</span>
          </p>
        </div>
      )}

      {/* Pickup / Dropoff */}
      <div className="space-y-2">
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex gap-3">
          <span className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-black flex-shrink-0">A</span>
          <div className="min-w-0">
            <p className="text-[9px] text-green-600 font-bold uppercase tracking-wide">From</p>
            <p className="text-xs font-bold text-royal-900 break-words">{addr(data.location?.pickup)}</p>
          </div>
        </div>
        <div className="bg-royal-50 border border-royal-200 rounded-xl p-3 flex gap-3">
          <span className="w-7 h-7 rounded-full bg-royal-900 flex items-center justify-center text-white text-xs font-black flex-shrink-0">B</span>
          <div className="min-w-0">
            <p className="text-[9px] text-royal-500 font-bold uppercase tracking-wide">To</p>
            <p className="text-xs font-bold text-royal-900 break-words">{addr(data.location?.dropoff)}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      {variant.showFare && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-royal-50 border border-royal-100 rounded-xl p-2.5">
            <p className="text-[9px] text-royal-400 font-bold uppercase mb-0.5">Distance</p>
            <p className="font-black text-royal-900 text-base">
              {dist != null ? dist.toFixed(1) : '—'} <span className="text-[10px] font-bold">km</span>
            </p>
          </div>
          <div className="bg-gold-100 border border-gold-200 rounded-xl p-2.5">
            <p className="text-[9px] text-gold-700 font-bold uppercase mb-0.5">Duration</p>
            <p className="font-black text-royal-900 text-base">
              {dur != null ? Math.round(dur) : '—'} <span className="text-[10px] font-bold">min</span>
            </p>
          </div>
        </div>
      )}

      {/* Driver */}
      {data.driver && (
        <div className="bg-gradient-to-r from-royal-900 to-royal-800 rounded-2xl p-3">
          <p className="text-[10px] text-gold-400 font-bold uppercase tracking-widest mb-2">Driver</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 text-white flex items-center justify-center font-black shadow-gold">
              {data.driver.name?.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-white text-sm truncate">{data.driver.name}</p>
              <p className="text-[11px] text-royal-300 truncate">
                {data.driver.vehicle?.number} · ⭐ {data.driver.rating}
              </p>
            </div>
          </div>
        </div>
      )}

      <ShareButton token={data.trackingToken} />

      <p className="text-[11px] text-royal-400 text-center font-medium pt-1">
        {variant.farewell}
      </p>
    </div>
  );
}

export default function RideCompleted({ data }) {
  const variant = variants[data.status] || variants.completed;
  const route = data.route || [];
  const hasRoute = route.length > 0
    || data.location?.pickup?.latitude
    || data.location?.dropoff?.latitude;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-royal-50">
      {/* Navbar */}
      <nav className="px-4 sm:px-6 h-14 flex items-center gap-3 bg-royal-950 border-b border-gold-500/20 flex-shrink-0">
        <img src="/go-logo.jpeg" alt="GoMobility" className="w-9 h-9 rounded-xl object-cover shadow-gold" />
        <span className="gold-shine-text font-black text-base tracking-wider">GoMobility</span>
        <span className={`ml-auto text-[10px] font-bold px-3 py-1.5 rounded-full border ${variant.badgeClass}`}>
          {variant.badge}
        </span>
      </nav>

      {/* ── DESKTOP: map fills screen, floating receipt panel ── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="absolute inset-0">
          {hasRoute ? (
            <RouteReplayMap
              pickup={data.location?.pickup}
              dropoff={data.location?.dropoff}
              route={route}
              cancelled={variant.cancelled}
              plannedPolyline={data.routes?.toDropoff?.polyline}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-royal-100">
              <p className="text-royal-400 text-sm">No route data available</p>
            </div>
          )}
        </div>

        <div className="absolute right-5 top-5 bottom-5 w-[360px] z-20 flex flex-col rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/30">
          <div className="h-1 bg-gradient-to-r from-royal-900 via-gold-500 to-royal-900 flex-shrink-0" />
          <div className="flex-1 overflow-y-auto p-4 pb-6"
            style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(20px)' }}>
            <div className="mb-3">
              <h2 className="text-lg font-black text-royal-900">{variant.title}</h2>
              <p className="text-xs text-royal-400">{variant.subtitle(data.passenger?.name)}</p>
            </div>
            <ReceiptPanel data={data} variant={variant} />
          </div>
        </div>
      </div>

      {/* ── MOBILE: map on top, receipt scrolls below ── */}
      <div className="flex lg:hidden flex-col flex-1 overflow-hidden">
        <div className="flex-shrink-0" style={{ height: '45vh' }}>
          {hasRoute ? (
            <RouteReplayMap
              pickup={data.location?.pickup}
              dropoff={data.location?.dropoff}
              route={route}
              cancelled={variant.cancelled}
              plannedPolyline={data.routes?.toDropoff?.polyline}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-royal-100">
              <p className="text-royal-400 text-sm">No route data available</p>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto bg-white border-t border-royal-100">
          <div className="h-1 bg-gradient-to-r from-royal-900 via-gold-500 to-royal-900" />
          <div className="p-4 pb-8">
            <div className="mb-3">
              <h2 className="text-xl font-black text-royal-900">{variant.title}</h2>
              <p className="text-xs text-royal-400">{variant.subtitle(data.passenger?.name)}</p>
            </div>
            <ReceiptPanel data={data} variant={variant} />
          </div>
        </div>
      </div>
    </div>
  );
}
