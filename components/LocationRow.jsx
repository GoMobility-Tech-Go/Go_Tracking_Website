export default function LocationRow({ pickup, dropoff }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-sm">📍</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">Pickup</p>
          <p className="text-sm font-semibold text-gray-800 leading-snug">{pickup}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 pl-3.5">
        <div className="w-1 flex flex-col gap-1 items-center">
          <div className="w-0.5 h-1.5 bg-gray-300 rounded-full" />
          <div className="w-0.5 h-1.5 bg-gray-300 rounded-full" />
          <div className="w-0.5 h-1.5 bg-gray-300 rounded-full" />
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-sm">🏁</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">Dropoff</p>
          <p className="text-sm font-semibold text-gray-800 leading-snug">{dropoff}</p>
        </div>
      </div>
    </div>
  );
}
