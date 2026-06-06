export default function LoadingScreen() {
  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <div className="bg-primary-700 h-14 flex items-center px-4 gap-3">
        <div className="w-8 h-8 bg-white/20 rounded-lg animate-pulse" />
        <div className="space-y-1">
          <div className="w-24 h-3 bg-white/20 rounded animate-pulse" />
          <div className="w-16 h-2 bg-white/10 rounded animate-pulse" />
        </div>
      </div>

      <div className="bg-blue-100 animate-pulse" style={{ height: '52vh' }}>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl animate-bounce mb-3">🗺️</div>
            <p className="text-primary-600 text-sm font-medium">Loading map...</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-3 overflow-hidden">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gray-200 animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
            <div className="w-20 h-3 bg-gray-100 rounded animate-pulse" />
            <div className="w-40 h-3 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>

        <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4">
          <div className="w-48 h-4 bg-blue-200 rounded animate-pulse mb-2" />
          <div className="w-36 h-3 bg-blue-100 rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-3 text-center">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse mx-auto mb-2" />
              <div className="w-12 h-4 bg-gray-200 rounded animate-pulse mx-auto mb-1" />
              <div className="w-10 h-2 bg-gray-100 rounded animate-pulse mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
