'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import Navbar      from '../../components/Navbar';
import DriverCard  from '../../components/DriverCard';
import StatusBar   from '../../components/StatusBar';
import EtaRow      from '../../components/EtaRow';
import LocationRow from '../../components/LocationRow';
import ShareButton from '../../components/ShareButton';

const TrackingMap = dynamic(() => import('../../components/TrackingMap'), { ssr: false });

const STATUSES = ['driver_assigned', 'driver_arrived', 'in_progress'];

const mockData = {
  rideId: 104,
  trackingToken: 'demo-token',
  driver: {
    name: 'Ramesh Kumar',
    phone: '9876543210',
    rating: '4.8',
    vehicle: { number: 'UP32 AB 1234', type: 'auto', color: 'Yellow' },
  },
  passenger: { name: 'Irshad Alam' },
  location: {
    pickup:  { latitude: 27.0722, longitude: 84.3853, address: 'Baghi, West Champaran, Bihar' },
    dropoff: { latitude: 27.0780, longitude: 84.3950, address: 'Lauriya, West Champaran, Bihar' },
    current: { latitude: 27.0722, longitude: 84.3853 },
  },
  fare:       { estimated: '150.00', final: null },
  routeStats: { totalDistance: 8.0, totalDuration: 15 },
  route: [
    { latitude: 27.0722, longitude: 84.3853 },
    { latitude: 27.0750, longitude: 84.3900 },
    { latitude: 27.0780, longitude: 84.3950 },
  ],
};

function InfoCards({ data, statusIndex, setStatusIndex }) {
  return (
    <>
      <div className="flex items-center justify-between py-1 px-1">
        <p className="text-[10px] text-royal-400 font-bold uppercase tracking-widest">Live Tracking</p>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] text-green-600 font-bold">DEMO · 2s</span>
        </div>
      </div>

      <DriverCard driver={data.driver} />
      <StatusBar status={data.status} />
      <EtaRow
        estimatedFare={data.fare.estimated}
        finalFare={data.fare.final}
        totalDistance={data.routeStats.totalDistance}
        totalDuration={data.routeStats.totalDuration}
      />
      <LocationRow pickup={data.location.pickup} dropoff={data.location.dropoff} />
      <ShareButton token="demo-token" />

      {/* Passenger */}
      <div className="bg-white rounded-2xl border border-royal-100 shadow-royal overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-royal-900 via-gold-500 to-royal-900" />
        <div className="p-4">
          <p className="text-[10px] text-royal-400 font-bold uppercase tracking-widest mb-3">Passenger</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-royal-100 flex items-center justify-center text-xl flex-shrink-0">👤</div>
            <div>
              <p className="text-sm font-black text-royal-900">{data.passenger.name}</p>
              <p className="text-xs text-royal-400 font-medium">Ride #{data.rideId}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status switcher — demo only */}
      <div className="bg-white rounded-2xl border border-gold-300 shadow-royal overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-gold-600 to-gold-400" />
        <div className="p-4">
          <p className="text-[10px] text-gold-600 font-bold uppercase tracking-widest mb-3">Demo — Status Switch</p>
          <div className="flex gap-2">
            {STATUSES.map((s, i) => (
              <button
                key={s}
                onClick={() => setStatusIndex(i)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  i === statusIndex
                    ? 'text-white shadow-royal'
                    : 'bg-royal-50 text-royal-500 border border-royal-200 hover:bg-royal-100'
                }`}
                style={i === statusIndex ? { background: '#0E1B55' } : {}}
              >
                {s === 'driver_assigned' ? '🚗 Coming' : s === 'driver_arrived' ? '📍 Arrived' : '🛣️ In Ride'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default function DemoPage() {
  const [statusIndex, setStatusIndex] = useState(0);
  const [location, setLocation]       = useState(mockData.location.current);

  useEffect(() => {
    const interval = setInterval(() => {
      setLocation(prev => ({
        ...prev,
        latitude:  prev.latitude  + (Math.random() - 0.5) * 0.001,
        longitude: prev.longitude + (Math.random() - 0.5) * 0.001,
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const status = STATUSES[statusIndex];
  const data   = { ...mockData, status, location: { ...mockData.location, current: location } };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-royal-50">
      {/* Demo banner */}
      <div className="bg-gradient-to-r from-gold-600 to-gold-400 text-royal-900 text-xs font-black text-center py-2 tracking-wider uppercase flex-shrink-0 z-50">
        🎬 Demo Mode — Driver har 2 second mein move ho raha hai
      </div>

      <Navbar status={status} />

      {/* ── DESKTOP: full map + floating glass panel ── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="absolute inset-0">
          <TrackingMap
            currentLocation={location}
            pickup={data.location.pickup}
            dropoff={data.location.dropoff}
            route={data.route}
            status={STATUSES[statusIndex]}
          />
        </div>

        {/* Floating glass panel */}
        <div className="absolute right-5 top-5 bottom-5 w-[360px] z-20 flex flex-col rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/30">
          <div className="h-1 bg-gradient-to-r from-royal-900 via-gold-500 to-royal-900 flex-shrink-0" />
          <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-6"
            style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(20px)' }}>
            <InfoCards data={data} statusIndex={statusIndex} setStatusIndex={setStatusIndex} />
          </div>
        </div>
      </div>

      {/* ── MOBILE: stacked ── */}
      <div className="flex lg:hidden flex-col flex-1 overflow-hidden">
        <div className="flex-shrink-0" style={{ height: '52vh' }}>
          <TrackingMap
            currentLocation={location}
            pickup={data.location.pickup}
            dropoff={data.location.dropoff}
            route={data.route}
            status={STATUSES[statusIndex]}
          />
        </div>
        <div className="flex-1 overflow-y-auto bg-white border-t border-royal-100">
          <div className="h-1 bg-gradient-to-r from-royal-900 via-gold-500 to-royal-900" />
          <div className="p-4 space-y-3 pb-8">
            <InfoCards data={data} statusIndex={statusIndex} setStatusIndex={setStatusIndex} />
          </div>
        </div>
      </div>
    </div>
  );
}
