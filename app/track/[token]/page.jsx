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

export default function TrackingPage() {
  const params = useParams();
  const token  = params.token;

  const { data, loading, error } = useTrackingData(token);

  if (loading) return <LoadingScreen />;

  if (error === 'NOT_FOUND') notFound();
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="text-center max-w-xs">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">Connection Error</h2>
          <p className="text-sm text-gray-500 mb-6">Unable to fetch tracking data. Please check your connection.</p>
          <button onClick={() => window.location.reload()} className="bg-primary-700 text-white px-6 py-2.5 rounded-full text-sm font-semibold">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  if (data.status === 'completed') return <RideCompleted data={data} />;

  return (
    <div className="h-screen flex flex-col bg-gray-50 max-w-2xl mx-auto overflow-hidden">
      <Navbar status={data.status} />

      <TrackingMap
        currentLocation={data.location.current}
        pickup={data.location.pickup}
        dropoff={data.location.dropoff}
        route={data.route || []}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3 pb-8">
          <DriverCard driver={data.driver} />
          <StatusBar status={data.status} />
          <EtaRow
            estimatedFare={data.fare.estimated}
            finalFare={data.fare.final}
            totalDistance={data.routeStats?.totalDistance}
            totalDuration={data.routeStats?.totalDuration}
          />
          <LocationRow
            pickup={data.location.pickup}
            dropoff={data.location.dropoff}
          />
          <ShareButton token={token} />

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Passenger</p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-base">👤</div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{data.passenger.name}</p>
                <p className="text-xs text-gray-400">Ride #{data.rideId}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 py-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-gray-400">Live tracking · Updates every 5 seconds</span>
          </div>
        </div>
      </div>
    </div>
  );
}
