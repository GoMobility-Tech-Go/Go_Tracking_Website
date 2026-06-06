const vehicleIcon = { bike: '🛵', auto: '🛺', car: '🚗' };

export default function DriverCard({ driver }) {
  const stars = Math.round(parseFloat(driver.rating || '4'));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center shadow-md flex-shrink-0">
          <span className="text-2xl text-white font-bold">
            {driver.name?.charAt(0)?.toUpperCase() || 'D'}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-bold text-gray-900 text-base truncate">{driver.name}</h3>
          </div>
          <div className="flex items-center gap-1 mb-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={`text-sm ${i < stars ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
            ))}
            <span className="text-xs text-gray-500 ml-1">{driver.rating}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span>{vehicleIcon[driver.vehicle?.type] || '🚗'}</span>
            <span className="font-medium text-gray-700">{driver.vehicle?.number}</span>
            <span>·</span>
            <span>{driver.vehicle?.color}</span>
            <span>·</span>
            <span className="capitalize">{driver.vehicle?.type}</span>
          </div>
        </div>

        <a
          href={`tel:${driver.phone}`}
          className="w-11 h-11 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center flex-shrink-0 hover:bg-green-100 transition-colors"
        >
          <span className="text-xl">📞</span>
        </a>
      </div>
    </div>
  );
}
