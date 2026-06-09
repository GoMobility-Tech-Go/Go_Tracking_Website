export default function LoadingScreen() {
  return (
    <div className="h-screen bg-royal-50 flex flex-col">
      {/* Navbar skeleton */}
      <div className="bg-gradient-to-r from-royal-950 to-royal-800 h-16 flex items-center px-6 gap-3">
        <div className="w-10 h-10 bg-gold-500/30 rounded-xl animate-pulse" />
        <div className="space-y-1.5">
          <div className="w-28 h-3.5 bg-gold-500/30 rounded animate-pulse" />
          <div className="w-20 h-2 bg-white/10 rounded animate-pulse" />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Map skeleton */}
        <div className="h-[60vh] lg:h-full lg:w-[65%] bg-royal-100 animate-pulse flex-shrink-0">
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl animate-bounce mb-3">🗺️</div>
              <p className="text-royal-500 text-sm font-bold">Loading map...</p>
            </div>
          </div>
        </div>

        {/* Cards skeleton */}
        <div className="flex-1 p-4 space-y-3 overflow-hidden bg-white lg:w-[42%]">
          {/* Driver card */}
          <div className="bg-white rounded-2xl border border-royal-100 p-4 flex items-center gap-4 shadow-royal">
            <div className="w-16 h-16 rounded-2xl bg-royal-100 animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="w-32 h-4 bg-royal-100 rounded animate-pulse" />
              <div className="w-24 h-3 bg-gold-100 rounded animate-pulse" />
              <div className="w-40 h-3 bg-royal-50 rounded animate-pulse" />
            </div>
          </div>

          {/* Status card */}
          <div className="bg-gradient-to-r from-royal-900 to-royal-700 rounded-2xl p-4">
            <div className="w-40 h-4 bg-white/20 rounded animate-pulse mb-2" />
            <div className="w-28 h-3 bg-white/10 rounded animate-pulse" />
          </div>

          {/* ETA boxes */}
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-royal-100 p-3 text-center shadow-royal">
                <div className="w-8 h-8 bg-royal-100 rounded-full animate-pulse mx-auto mb-2" />
                <div className="w-12 h-4 bg-royal-100 rounded animate-pulse mx-auto mb-1" />
                <div className="w-10 h-2 bg-royal-50 rounded animate-pulse mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
