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
    <div className="space-y-2">
      <p className="text-xs text-gray-400 font-medium text-center">Share live tracking with someone</p>
      <div className="flex gap-2">
        <button
          onClick={shareWhatsApp}
          className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-2xl text-sm font-semibold transition-colors shadow-sm"
        >
          <span className="text-base">📤</span> WhatsApp
        </button>
        <button
          onClick={copyLink}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all shadow-sm
            ${copied ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-primary-700 hover:bg-primary-800 text-white'}`}
        >
          <span className="text-base">{copied ? '✅' : '📋'}</span>
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
      </div>
      <button
        onClick={shareNative}
        className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-600 py-2.5 rounded-2xl text-xs font-medium transition-colors border border-gray-200"
      >
        <span>↗️</span> Share via other apps
      </button>
    </div>
  );
}
