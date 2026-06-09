export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-royal-950 via-royal-900 to-royal-800 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background decorative circles */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gold-500/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold-500/5 rounded-full translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-royal-800/30 rounded-full -translate-x-1/2 -translate-y-1/2" />

      <div className="relative text-center max-w-2xl mx-auto">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src="/go-logo.jpeg" alt="GoMobility" className="w-36 h-36 rounded-3xl object-cover shadow-gold mb-2" />
          <p className="text-royal-300 text-sm tracking-widest uppercase mt-1">Live Ride Tracking</p>
        </div>

        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl font-black text-white mb-4 leading-tight">
          Track your ride in <span className="gold-shine-text">real-time</span>
        </h2>
        <p className="text-royal-300 mb-10 leading-relaxed text-sm sm:text-base max-w-md mx-auto">
          Share your live ride location with friends and family.<br />
          No login required — just share the link.
        </p>

        {/* Features grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {[
            { icon: '📍', title: 'Live Location',  desc: 'Real-time GPS' },
            { icon: '🔔', title: 'Ride Status',    desc: 'Pickup to drop' },
            { icon: '🚗', title: 'Driver Details', desc: 'Name & vehicle' },
            { icon: '📤', title: 'Easy Share',     desc: 'WhatsApp / link' },
          ].map((f) => (
            <div key={f.title} className="bg-white/5 hover:bg-white/10 border border-gold-500/20 rounded-2xl p-4 text-center backdrop-blur-sm transition-all hover:border-gold-500/40 hover:scale-[1.02]">
              <div className="text-2xl mb-2">{f.icon}</div>
              <div className="font-bold text-white text-xs">{f.title}</div>
              <div className="text-royal-400 text-[10px] mt-0.5">{f.desc}</div>
            </div>
          ))}
        </div>

        {/* Info box */}
        <div className="bg-white/5 border border-gold-500/20 rounded-2xl px-6 py-4 inline-block">
          <p className="text-royal-300 text-sm">
            Tracking link milta hai jab passenger ride book karta hai
          </p>
          <p className="text-gold-400 text-xs mt-1 font-bold tracking-wider">
            track.gomobility.co.in/track/TOKEN
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-royal-500 text-xs tracking-widest uppercase">
        © 2026 GoMobility · All rights reserved
      </div>
    </div>
  );
}
