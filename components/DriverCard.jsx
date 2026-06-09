const vehicleIcon = { bike: '🛵', auto: '🛺', car: '🚗' };

export default function DriverCard({ driver }) {
  const stars = Math.round(parseFloat(driver.rating || '4'));

  return (
    <div className="bg-white rounded-2xl shadow-royal border border-royal-100 overflow-hidden">
      {/* Top accent */}
      <div className="h-1 bg-gradient-to-r from-royal-900 via-gold-500 to-royal-900" />

      <div className="p-4">
        <p className="text-[10px] text-royal-400 font-bold uppercase tracking-widest mb-3">Your Driver</p>

        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-royal-800 to-royal-950 flex items-center justify-center shadow-royal">
              <span className="text-2xl text-white font-black">
                {driver.name?.charAt(0)?.toUpperCase() || 'D'}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-[8px]">✓</span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-royal-900 text-base truncate">{driver.name}</h3>

            {/* Stars */}
            <div className="flex items-center gap-0.5 my-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={`text-sm ${i < stars ? 'text-gold-500' : 'text-gray-200'}`}>★</span>
              ))}
              <span className="text-xs text-royal-600 font-bold ml-1">{driver.rating}</span>
            </div>

            {/* Vehicle */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="bg-royal-50 border border-royal-200 text-royal-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {vehicleIcon[driver.vehicle?.type] || '🚗'} {driver.vehicle?.number}
              </span>
              <span className="bg-gold-100 border border-gold-300 text-gold-700 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize">
                {driver.vehicle?.color}
              </span>
            </div>
          </div>

          {/* Call button */}
          <a
            href={`tel:${driver.phone}`}
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center flex-shrink-0 shadow-md hover:scale-105 transition-transform active:scale-95"
          >
            <span className="text-xl">📞</span>
          </a>
        </div>
      </div>
    </div>
  );
}
