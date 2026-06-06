export default function EtaRow({ estimatedFare, finalFare, totalDistance, totalDuration }) {
  const fare = finalFare || estimatedFare;

  const boxes = [
    {
      icon: '⏱️',
      value: totalDuration != null ? `${totalDuration} min` : '—',
      label: 'Duration',
      color: 'text-primary-700',
    },
    {
      icon: '💰',
      value: fare ? `₹${fare}` : '—',
      label: finalFare ? 'Final Fare' : 'Est. Fare',
      color: 'text-green-700',
    },
    {
      icon: '📏',
      value: totalDistance != null ? `${totalDistance.toFixed(1)} km` : '—',
      label: 'Distance',
      color: 'text-indigo-700',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {boxes.map((b) => (
        <div key={b.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
          <div className="text-xl mb-1">{b.icon}</div>
          <div className={`font-bold text-sm ${b.color}`}>{b.value}</div>
          <div className="text-gray-400 text-[10px] mt-0.5">{b.label}</div>
        </div>
      ))}
    </div>
  );
}
