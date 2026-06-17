
const addr = (loc) => (typeof loc === 'string' ? loc : loc?.address || '—');

export default function LocationRow({ pickup, dropoff }) {
  return (
    <div className="bg-white rounded-2xl border border-royal-100 shadow-royal overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-royal-900 via-gold-500 to-royal-900" />
      <div className="p-4">
        <p className="text-[10px] text-royal-400 font-bold uppercase tracking-widest mb-3">Route</p>

        <div className="flex gap-3">
          {/* Line */}
          <div className="flex flex-col items-center gap-0 flex-shrink-0 pt-1">
            <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow" />
            <div className="w-0.5 flex-1 bg-gradient-to-b from-green-400 to-royal-400 my-1" style={{ minHeight: '24px' }} />
            <div className="w-3 h-3 rounded-full bg-royal-900 border-2 border-white shadow" />
          </div>

          {/* Addresses */}
          <div className="flex-1 space-y-2">
            <div className="bg-green-50 border border-green-200 rounded-xl p-2.5">
              <p className="text-[9px] text-green-600 font-bold uppercase tracking-wider mb-0.5">Pickup</p>
              <p className="text-sm font-bold text-royal-900 leading-snug">{addr(pickup)}</p>
            </div>
            <div className="bg-royal-50 border border-royal-200 rounded-xl p-2.5">
              <p className="text-[9px] text-royal-600 font-bold uppercase tracking-wider mb-0.5">Dropoff</p>
              <p className="text-sm font-bold text-royal-900 leading-snug">{addr(dropoff)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
