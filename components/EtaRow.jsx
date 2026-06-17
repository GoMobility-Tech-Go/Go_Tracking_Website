const num = (v) => {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export default function EtaRow({ estimatedFare, finalFare, totalDistance, totalDuration }) {
  const fareNum = num(finalFare) ?? num(estimatedFare);
  const dist    = num(totalDistance);
  const dur     = num(totalDuration);
  const isFinal = num(finalFare) != null;

  const boxes = [
    {
      icon: '⏱️',
      value: dur != null ? `${Math.round(dur)}` : '—',
      unit: 'min',
      label: 'Duration',
      gradient: 'from-royal-900 to-royal-700',
    },
    {
      icon: '💰',
      value: fareNum != null ? `₹${fareNum.toFixed(0)}` : '—',
      unit: '',
      label: isFinal ? 'Final Fare' : 'Est. Fare',
      gradient: 'from-gold-600 to-gold-400',
      highlight: true,
    },
    {
      icon: '📏',
      value: dist != null ? `${dist.toFixed(1)}` : '—',
      unit: 'km',
      label: 'Distance',
      gradient: 'from-royal-900 to-royal-700',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {boxes.map((b) => (
        <div key={b.label} className="bg-white rounded-2xl border border-royal-100 shadow-royal overflow-hidden">
          <div className={`h-1.5 bg-gradient-to-r ${b.gradient}`} />
          <div className="p-3 text-center">
            <div className="text-xl mb-1">{b.icon}</div>
            <div className={`font-black text-base leading-none ${b.highlight ? 'text-gold-600' : 'text-royal-900'}`}>
              {b.value}
              {b.unit && <span className="text-xs font-bold text-royal-400 ml-0.5">{b.unit}</span>}
            </div>
            <div className="text-royal-400 text-[10px] font-semibold mt-1">{b.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
