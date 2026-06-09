'use client';
import { useState } from 'react';

export default function ShareButton({ token }) {
  const [copied, setCopied] = useState(false);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://track.gomobility.co.in';
  const url    = `${appUrl}/track/${token}`;

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`Track my GoMobility ride live 🚗\n${url}`)}`);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareNative = () => {
    if (navigator.share) {
      navigator.share({ title: 'Track my GoMobility ride', url });
    } else {
      shareWhatsApp();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-royal-100 shadow-royal overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-royal-900 via-gold-500 to-royal-900" />
      <div className="p-4">
        <p className="text-[10px] text-royal-400 font-bold uppercase tracking-widest mb-3">Share Live Tracking</p>

        <div className="flex gap-2 mb-2">
          {/* WhatsApp */}
          <button
            onClick={shareWhatsApp}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-xl text-sm font-bold transition-all shadow-md hover:scale-[1.02] active:scale-95"
          >
            <span className="text-base">📤</span> WhatsApp
          </button>

          {/* Copy */}
          <button
            onClick={copyLink}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all shadow-md hover:scale-[1.02] active:scale-95
              ${copied
                ? 'bg-gradient-to-r from-green-400 to-green-500 text-white'
                : 'bg-gradient-to-r from-royal-900 to-royal-700 text-white hover:from-royal-800 hover:to-royal-600'
              }`}
          >
            <span className="text-base">{copied ? '✅' : '📋'}</span>
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>

        {/* Share via apps */}
        <button
          onClick={shareNative}
          className="w-full flex items-center justify-center gap-2 bg-royal-50 hover:bg-royal-100 text-royal-700 py-2.5 rounded-xl text-xs font-bold transition-colors border border-royal-200"
        >
          <span>↗️</span> Share via other apps
        </button>
      </div>
    </div>
  );
}
