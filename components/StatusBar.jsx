const steps = [
  { key: 'accepted',       label: 'Driver Coming',  icon: '🚗' },
  { key: 'driver_arrived', label: 'Driver Arrived', icon: '📍' },
  { key: 'in_progress',   label: 'On the Way',     icon: '🛣️' },
  { key: 'completed',     label: 'Completed',      icon: '✅' },
];

const statusMessage = {
  accepted:       { title: '🚗 Driver is on the way to you', subtitle: 'Your driver is heading to the pickup point', bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
  driver_arrived: { title: '📍 Driver has arrived!',         subtitle: 'Your driver is waiting at the pickup point', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  in_progress:    { title: '🛣️ Ride in progress',            subtitle: 'You are on your way to the destination', bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200' },
  completed:      { title: '✅ Ride completed',              subtitle: 'You have reached your destination safely', bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
};

const stepIndex = {
  accepted: 0, driver_arrived: 1, in_progress: 2, completed: 3,
};

export default function StatusBar({ status }) {
  const msg     = statusMessage[status];
  const current = stepIndex[status];

  return (
    <div className="space-y-3">
      <div className={`rounded-2xl border p-4 ${msg.bg} ${msg.border}`}>
        <p className={`font-bold text-sm ${msg.text}`}>{msg.title}</p>
        <p className={`text-xs mt-0.5 ${msg.text} opacity-70`}>{msg.subtitle}</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3">
        <div className="flex items-center justify-between">
          {steps.map((step, i) => (
            <div key={step.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base transition-all
                  ${i < current  ? 'bg-primary-700 text-white shadow-md'  : ''}
                  ${i === current ? 'bg-primary-700 text-white shadow-lg scale-110 ring-4 ring-blue-100' : ''}
                  ${i > current  ? 'bg-gray-100 text-gray-400' : ''}
                `}>
                  {step.icon}
                </div>
                <span className={`text-[9px] mt-1 font-medium text-center leading-tight
                  ${i <= current ? 'text-primary-700' : 'text-gray-400'}
                `}>
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 mb-4 rounded-full ${i < current ? 'bg-primary-700' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
