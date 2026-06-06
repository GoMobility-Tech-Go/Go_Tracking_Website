import ShareButton from './ShareButton';

export default function RideCompleted({ data }) {
  const fare = data.fare.final || data.fare.estimated;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-700 to-primary-900 flex flex-col">
      <nav className="px-4 h-14 flex items-center gap-2.5">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
          <span>🚗</span>
        </div>
        <span className="text-white font-bold">GoMobility</span>
        <span className="ml-auto bg-white/20 text-white text-xs px-3 py-1 rounded-full">Completed</span>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✅</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ride Completed!</h2>
          <p className="text-gray-500 text-sm mb-8">
            {data.passenger.name} has safely reached the destination.
          </p>

          {fare && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
              <p className="text-xs text-green-600 font-medium mb-1">Total Fare Paid</p>
              <p className="text-4xl font-bold text-green-700">₹{fare}</p>
            </div>
          )}

          <div className="text-left space-y-3 mb-8">
            <div className="flex gap-3 items-start">
              <span className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-sm flex-shrink-0">📍</span>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">From</p>
                <p className="text-sm font-semibold text-gray-700">{data.location.pickup}</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center text-sm flex-shrink-0">🏁</span>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">To</p>
                <p className="text-sm font-semibold text-gray-700">{data.location.dropoff}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="bg-gray-50 rounded-2xl p-3">
              <p className="text-xs text-gray-400">Distance</p>
              <p className="font-bold text-gray-800">{data.routeStats?.totalDistance?.toFixed(1) ?? '—'} km</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-3">
              <p className="text-xs text-gray-400">Duration</p>
              <p className="font-bold text-gray-800">{data.routeStats?.totalDuration ?? '—'} min</p>
            </div>
          </div>

          <div className="bg-primary-50 rounded-2xl p-4 mb-6 text-left">
            <p className="text-xs text-primary-600 font-medium mb-2">Driver</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-700 text-white flex items-center justify-center font-bold">
                {data.driver.name?.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{data.driver.name}</p>
                <p className="text-xs text-gray-500">{data.driver.vehicle?.number} · ⭐ {data.driver.rating}</p>
              </div>
            </div>
          </div>

          <ShareButton token={data.trackingToken} />

          <p className="text-xs text-gray-400 mt-6">Thank you for riding with GoMobility 🙏</p>
        </div>
      </div>
    </div>
  );
}
