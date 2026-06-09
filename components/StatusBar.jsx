const steps = [
  { key: 'accepted',       label: 'Coming',  icon: '🚗' },
  { key: 'driver_arrived', label: 'Arrived', icon: '📍' },
  { key: 'in_progress',    label: 'On Way',  icon: '🛣️' },
  { key: 'completed',      label: 'Done',    icon: '✅' },
];

const statusMessage = {
  accepted:       { title: 'Driver is on the way', subtitle: 'Heading to your pickup point', bg: 'from-royal-900 to-royal-800', icon: '🚗' },
  driver_arrived: { title: 'Driver has arrived!',  subtitle: 'Waiting at the pickup point',   bg: 'from-amber-700 to-amber-600',  icon: '📍' },
  in_progress:    { title: 'Ride in progress',      subtitle: 'On the way to destination',     bg: 'from-green-800 to-green-700',   icon: '🛣️' },
  completed:      { title: 'Ride completed',        subtitle: 'Reached destination safely',    bg: 'from-gray-700 to-gray-600',     icon: '✅' },
};

const stepIndex = { accepted: 0, driver_arrived: 1, in_progress: 2, completed: 3 };

export default function StatusBar({ status }) {
  const msg     = statusMessage[status];
  const current = stepIndex[status];

  return (
    <div className="space-y-3">
      {/* Status message card */}
      <div className={`rounded-2xl p-4 bg-gradient-to-r ${msg.bg} text-white shadow-royal overflow-hidden relative`}>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-5xl opacity-10">{msg.icon}</div>
        <div className="relative">
          <p className="font-black text-sm text-gold-300">{msg.title}</p>
          <p className="text-xs mt-0.5 text-white/70">{msg.subtitle}</p>
        </div>
      </div>

      {/* Progress steps */}
      <div className="bg-white rounded-2xl border border-royal-100 shadow-royal px-4 py-4">
        <p className="text-[10px] text-royal-400 font-bold uppercase tracking-widest mb-3">Ride Progress</p>
        <div className="flex items-center justify-between">
          {steps.map((step, i) => (
            <div key={step.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all duration-300
                  ${i < current  ? 'bg-gradient-to-br from-royal-700 to-royal-900 text-white shadow-royal' : ''}
                  ${i === current ? 'bg-gradient-to-br from-gold-400 to-gold-600 text-white shadow-gold scale-110 ring-4 ring-gold-200' : ''}
                  ${i > current  ? 'bg-royal-50 text-royal-300 border border-royal-100' : ''}
                `}>
                  {step.icon}
                </div>
                <span className={`text-[9px] mt-1.5 font-bold text-center leading-tight
                  ${i === current ? 'text-gold-600' : i < current ? 'text-royal-700' : 'text-royal-300'}
                `}>
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1.5 mb-5 rounded-full transition-all duration-500
                  ${i < current ? 'bg-gradient-to-r from-royal-700 to-royal-500' : 'bg-royal-100'}
                `} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
