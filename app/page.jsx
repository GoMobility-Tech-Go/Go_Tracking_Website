import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-700 to-primary-900 flex flex-col items-center justify-center px-6 text-white">
      <div className="text-center max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl">
            <span className="text-3xl">🚗</span>
          </div>
          <div className="text-left">
            <h1 className="text-3xl font-bold">GoMobility</h1>
            <p className="text-blue-200 text-sm">Live Ride Tracking</p>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-4">Track your ride in real-time</h2>
        <p className="text-blue-200 mb-8 leading-relaxed">
          Share your live ride location with friends and family. No login required — just share the link.
        </p>

        {/* Features */}
        <div className="grid grid-cols-2 gap-4 mb-10 text-left">
          {[
            { icon: '📍', title: 'Live Location', desc: 'Real-time driver tracking' },
            { icon: '🔔', title: 'Ride Status', desc: 'From pickup to drop' },
            { icon: '🚗', title: 'Driver Details', desc: 'Name, vehicle & rating' },
            { icon: '📤', title: 'Easy Share', desc: 'WhatsApp or copy link' },
          ].map((f) => (
            <div key={f.title} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-2xl mb-2">{f.icon}</div>
              <div className="font-semibold text-sm">{f.title}</div>
              <div className="text-blue-200 text-xs mt-1">{f.desc}</div>
            </div>
          ))}
        </div>

        <p className="text-blue-300 text-sm">
          Tracking link milta hai jab passenger ride book karta hai.<br />
          Format: <code className="bg-white/20 px-2 py-0.5 rounded text-xs">/track/TOKEN</code>
        </p>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-blue-300 text-xs">
        © 2026 GoMobility · All rights reserved
      </div>
    </div>
  );
}
