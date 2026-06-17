'use client';

import { useParams, notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useTrackingData } from '../../../hooks/useTrackingData';
import Navbar        from '../../../components/Navbar';
import DriverCard    from '../../../components/DriverCard';
import StatusBar     from '../../../components/StatusBar';
import EtaRow        from '../../../components/EtaRow';
import LocationRow   from '../../../components/LocationRow';
import ShareButton   from '../../../components/ShareButton';
import LoadingScreen from '../../../components/LoadingScreen';
import RideCompleted from '../../../components/RideCompleted';

const TrackingMap = dynamic(() => import('../../../components/TrackingMap'), { ssr: false });

function InfoCards({ data, token, connected }) {
  return (
    <>
      <div className="flex items-center justify-between py-1 px-1">
        <p className="text-[10px] text-royal-400 font-bold uppercase tracking-widest">Live Tracking</p>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className={`text-[10px] font-bold ${connected ? 'text-green-600' : 'text-amber-600'}`}>
            {connected ? 'LIVE' : 'CONNECTING…'}
          </span>
        </div>
      </div>

      <DriverCard driver={data.driver} />
      <StatusBar status={data.status} />
      <EtaRow
        estimatedFare={data.fare.estimated}
        finalFare={data.fare.final}
        totalDistance={data.routeStats?.totalDistance}
        totalDuration={data.routeStats?.totalDuration}
      />
      <LocationRow pickup={data.location.pickup} dropoff={data.location.dropoff} />
      <ShareButton token={token} />

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

      <div className="flex items-center justify-center gap-2 py-1">
        <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
        <span className="text-xs text-royal-400">
          {connected ? 'Live updates from driver' : 'Reconnecting…'}
        </span>
      </div>
    </>
  );
}

export default function TrackingPage() {
  const params = useParams();
  const token  = params.token;
  const { data, loading, error, connected } = useTrackingData(token);

  if (loading) return <LoadingScreen />;

  if (error === 'NOT_FOUND') notFound();
  if (error && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#0E1B55' }}>
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-sm w-full">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-lg font-black text-royal-900 mb-2">Connection Error</h2>
          <p className="text-sm text-royal-400 mb-6">Unable to fetch tracking data. Please check your connection.</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full text-white px-6 py-3 rounded-xl text-sm font-bold shadow-royal"
            style={{ background: '#0E1B55' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;
  if (data.status === 'completed' || data.status === 'cancelled') return <RideCompleted data={data} />;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-royal-50">
      <Navbar status={data.status} connected={connected} />

      {/* ── DESKTOP: map fills screen, floating glass panel ── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        {/* Full screen map */}
        <div className="absolute inset-0">
          <TrackingMap
            currentLocation={data.location.current}
            pickup={data.location.pickup}
            dropoff={data.location.dropoff}
            route={data.route || []}
          />
        </div>

        {/* Floating glass panel — right side */}
        <div className="absolute right-5 top-5 bottom-5 w-[360px] z-20 flex flex-col rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/30">
          <div className="h-1 bg-gradient-to-r from-royal-900 via-gold-500 to-royal-900 flex-shrink-0" />
          <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-6"
            style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(20px)' }}>
            <InfoCards data={data} token={token} connected={connected} />
          </div>
        </div>
      </div>

      {/* ── MOBILE: map on top, cards below ── */}
      <div className="flex lg:hidden flex-col flex-1 overflow-hidden">
        <div className="flex-shrink-0" style={{ height: '52vh' }}>
          <TrackingMap
            currentLocation={data.location.current}
            pickup={data.location.pickup}
            dropoff={data.location.dropoff}
            route={data.route || []}
          />
        </div>
        <div className="flex-1 overflow-y-auto bg-white border-t border-royal-100">
          <div className="h-1 bg-gradient-to-r from-royal-900 via-gold-500 to-royal-900" />
          <div className="p-4 space-y-3 pb-8">
            <InfoCards data={data} token={token} connected={connected} />
          </div>
        </div>
      </div>
    </div>
  );
}
