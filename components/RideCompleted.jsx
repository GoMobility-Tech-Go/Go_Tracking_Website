import ShareButton from './ShareButton';

export default function RideCompleted({ data }) {
  const fare = data.fare.final || data.fare.estimated;

  return (
    <div className="min-h-screen bg-gradient-to-br from-royal-950 via-royal-900 to-royal-800 flex flex-col">
      {/* Navbar */}
      <nav className="px-6 h-16 flex items-center gap-3 border-b border-gold-500/20">
        <img src="/go-logo.jpeg" alt="GoMobility" className="w-10 h-10 rounded-xl object-cover shadow-gold" />
        <span className="gold-shine-text font-black text-lg tracking-wider">GoMobility</span>
        <span className="ml-auto bg-gold-500/20 border border-gold-500/40 text-gold-300 text-xs font-bold px-4 py-1.5 rounded-full">
          ✅ Completed
        </span>
      </nav>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
          {/* Top gradient */}
          <div className="h-2 bg-gradient-to-r from-royal-900 via-gold-500 to-royal-900" />

          <div className="p-6 sm:p-8 text-center">
            {/* Check icon */}
            <div className="w-20 h-20 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-gold">
              <span className="text-4xl">✅</span>
            </div>

            <h2 className="text-2xl font-black text-royal-900 mb-1">Ride Completed!</h2>
            <p className="text-royal-400 text-sm mb-6">
              {data.passenger.name} reached destination safely
            </p>

            {/* Fare */}
            {fare && (
              <div className="bg-gradient-to-r from-royal-900 to-royal-800 rounded-2xl p-5 mb-6">
                <p className="text-gold-400 text-xs font-bold uppercase tracking-widest mb-1">Total Fare</p>
                <p className="text-4xl font-black text-white">
                  ₹<span className="gold-shine-text">{fare}</span>
                </p>
              </div>
            )}

            {/* Route */}
            <div className="text-left space-y-2 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex gap-3">
                <span className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-white text-xs flex-shrink-0">A</span>
                <div>
                  <p className="text-[9px] text-green-600 font-bold uppercase tracking-wide">From</p>
                  <p className="text-sm font-bold text-royal-900">{data.location.pickup}</p>
                </div>
              </div>
              <div className="bg-royal-50 border border-royal-200 rounded-xl p-3 flex gap-3">
                <span className="w-7 h-7 rounded-full bg-royal-900 flex items-center justify-center text-white text-xs flex-shrink-0">B</span>
                <div>
                  <p className="text-[9px] text-royal-500 font-bold uppercase tracking-wide">To</p>
                  <p className="text-sm font-bold text-royal-900">{data.location.dropoff}</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-royal-50 border border-royal-100 rounded-2xl p-3">
                <p className="text-[10px] text-royal-400 font-bold uppercase mb-1">Distance</p>
                <p className="font-black text-royal-900 text-lg">{data.routeStats?.totalDistance?.toFixed(1) ?? '—'} <span className="text-xs font-bold">km</span></p>
              </div>
              <div className="bg-gold-100 border border-gold-200 rounded-2xl p-3">
                <p className="text-[10px] text-gold-700 font-bold uppercase mb-1">Duration</p>
                <p className="font-black text-royal-900 text-lg">{data.routeStats?.totalDuration ?? '—'} <span className="text-xs font-bold">min</span></p>
              </div>
            </div>

            {/* Driver */}
            <div className="bg-gradient-to-r from-royal-900 to-royal-800 rounded-2xl p-4 mb-6 text-left">
              <p className="text-[10px] text-gold-400 font-bold uppercase tracking-widest mb-2">Driver</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 text-white flex items-center justify-center font-black shadow-gold">
                  {data.driver.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{data.driver.name}</p>
                  <p className="text-xs text-royal-300">{data.driver.vehicle?.number} · ⭐ {data.driver.rating}</p>
                </div>
              </div>
            </div>

            <ShareButton token={data.trackingToken} />

            <p className="text-xs text-royal-300 mt-5 font-medium">Thank you for riding with GoMobility 🙏</p>
          </div>
        </div>
      </div>
    </div>
  );
}
