'use client';
import { useEffect, useRef } from 'react';

export default function TrackingMap({ currentLocation, pickup, dropoff, route }) {
  const mapRef    = useRef(null);
  const mapObj    = useRef(null);
  const markerRef = useRef(null);
  const polyRef   = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    import('leaflet').then((L) => {
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const defaultCenter = currentLocation
        ? [currentLocation.latitude, currentLocation.longitude]
        : [20.5937, 78.9629];

      if (!mapObj.current) {
        const map = L.map(mapRef.current, { zoomControl: false, attributionControl: false });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        map.setView(defaultCenter, 15);
        mapObj.current = map;

        // Custom zoom control — bottom right
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Driver car icon
        const carIcon = L.divIcon({
          html: `<div class="driver-marker" style="
            background: linear-gradient(135deg, #D4AF37, #fbbf24);
            color: #0E1B55;
            border-radius: 50%;
            width: 42px; height: 42px;
            display: flex; align-items: center; justify-content: center;
            font-size: 20px;
            box-shadow: 0 4px 16px rgba(212,175,55,0.6);
            border: 3px solid white;">🚗</div>`,
          iconSize:   [42, 42],
          iconAnchor: [21, 21],
          className:  '',
        });

        const pickupIcon = L.divIcon({
          html: `<div style="
            background: linear-gradient(135deg,#16a34a,#22c55e);
            color: white; border-radius: 50%;
            width: 34px; height: 34px;
            display: flex; align-items: center; justify-content: center; font-size: 15px;
            box-shadow: 0 3px 10px rgba(34,197,94,0.6); border: 2.5px solid white;">📍</div>`,
          iconSize:   [34, 34],
          iconAnchor: [17, 17],
          className:  '',
        });

        const dropoffIcon = L.divIcon({
          html: `<div style="
            background: linear-gradient(135deg,#dc2626,#ef4444);
            color: white; border-radius: 50%;
            width: 34px; height: 34px;
            display: flex; align-items: center; justify-content: center; font-size: 15px;
            box-shadow: 0 3px 10px rgba(239,68,68,0.6); border: 2.5px solid white;">🏁</div>`,
          iconSize:   [34, 34],
          iconAnchor: [17, 17],
          className:  '',
        });

        if (currentLocation) {
          markerRef.current = L.marker(
            [currentLocation.latitude, currentLocation.longitude],
            { icon: carIcon }
          ).addTo(map);
        }

        if (currentLocation) {
          L.marker(
            [currentLocation.latitude + 0.005, currentLocation.longitude - 0.005],
            { icon: pickupIcon }
          ).bindPopup(`<b style="color:#0E1B55">📍 Pickup</b><br><small>${pickup}</small>`).addTo(map);

          L.marker(
            [currentLocation.latitude - 0.01, currentLocation.longitude + 0.01],
            { icon: dropoffIcon }
          ).bindPopup(`<b style="color:#dc2626">🏁 Dropoff</b><br><small>${dropoff}</small>`).addTo(map);
        }

        if (route && route.length > 1) {
          const latlngs = route.map(p => [p.latitude, p.longitude]);
          polyRef.current = L.polyline(latlngs, {
            color: '#D4AF37', weight: 5, opacity: 0.85, dashArray: '10 6',
          }).addTo(map);
        }

      } else {
        const map = mapObj.current;
        if (currentLocation && markerRef.current) {
          markerRef.current.setLatLng([currentLocation.latitude, currentLocation.longitude]);
          map.panTo([currentLocation.latitude, currentLocation.longitude], { animate: true, duration: 1 });
        }
        if (route && route.length > 1 && polyRef.current) {
          polyRef.current.setLatLngs(route.map(p => [p.latitude, p.longitude]));
        }
      }
    });
  }, [currentLocation, route, pickup, dropoff]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />

      {!currentLocation && (
        <div className="absolute inset-0 flex items-center justify-center z-10"
          style={{ background: 'rgba(14,27,85,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="text-center">
            <div className="text-5xl mb-3 animate-pulse">📡</div>
            <p className="text-gold-400 font-bold text-sm tracking-wide">Fetching driver location...</p>
          </div>
        </div>
      )}
    </div>
  );
}
