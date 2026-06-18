const num = (v) => {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

function formatClock(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function EtaRow({
  estimatedFare,
  finalFare,
  totalDistance,      // km (breadcrumb sum — existing)
  totalDuration,      // min (breadcrumb sum — existing)
  eta,                // { remainingDistance (m), remainingDuration (s), arrivalTime }
  plannedDistance,    // m — from routeStats.plannedDistance
  plannedDuration,    // s — from routeStats.plannedDuration
}) {
  const fareNum = num(finalFare) ?? num(estimatedFare);
  const isFinal = num(finalFare) != null;

  // Duration: prefer live ETA, then planned, then breadcrumb
  const liveSec    = num(eta?.remainingDuration);
  const plannedSec = num(plannedDuration);
  const breadcrMin = num(totalDuration);
  const durationMin = liveSec != null ? Math.max(0, Math.round(liveSec / 60))
                    : plannedSec != null ? Math.round(plannedSec / 60)
                    : breadcrMin != null ? Math.round(breadcrMin)
                    : null;
  const arrival = formatClock(eta?.arrivalTime);
  const durLabel = liveSec != null ? 'ETA' : 'Duration';

  // Distance: prefer live remaining, then planned, then breadcrumb (km)
  const liveMeters    = num(eta?.remainingDistance);
  const plannedMeters = num(plannedDistance);
  const breadcrKm     = num(totalDistance);
  const distKm = liveMeters != null ? liveMeters / 1000
              : plannedMeters != null ? plannedMeters / 1000
              : breadcrKm;
  const distLabel = liveMeters != null ? 'Remaining' : 'Distance';

  const boxes = [
    {
      icon: '⏱️',
      value: durationMin != null ? `${durationMin}` : '—',
      unit: 'min',
      label: durLabel,
      sub: arrival ? `Arrives ${arrival}` : null,
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
      value: distKm != null ? `${distKm.toFixed(1)}` : '—',
      unit: 'km',
      label: distLabel,
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
            {b.sub && <div className="text-green-600 text-[9px] font-bold mt-0.5">{b.sub}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
