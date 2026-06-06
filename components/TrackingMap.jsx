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
        const map = L.map(mapRef.current, { zoomControl: true, attributionControl: false });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        map.setView(defaultCenter, 14);
        mapObj.current = map;

        const carIcon = L.divIcon({
          html: `<div style="
            background:#1565C0; color:white; border-radius:50%; width:36px; height:36px;
            display:flex; align-items:center; justify-content:center;
            font-size:18px; box-shadow:0 3px 12px rgba(21,101,192,0.5);
            border:3px solid white; animation:markerPulse 1.5s ease-in-out infinite;">🚗</div>`,
          iconSize:   [36, 36],
          iconAnchor: [18, 18],
          className:  '',
        });

        const pickupIcon = L.divIcon({
          html: `<div style="
            background:#22c55e; color:white; border-radius:50%; width:30px; height:30px;
            display:flex; align-items:center; justify-content:center; font-size:14px;
            box-shadow:0 2px 8px rgba(34,197,94,0.5); border:2px solid white;">📍</div>`,
          iconSize:   [30, 30],
          iconAnchor: [15, 15],
          className:  '',
        });

        const dropoffIcon = L.divIcon({
          html: `<div style="
            background:#ef4444; color:white; border-radius:50%; width:30px; height:30px;
            display:flex; align-items:center; justify-content:center; font-size:14px;
            box-shadow:0 2px 8px rgba(239,68,68,0.5); border:2px solid white;">🏁</div>`,
          iconSize:   [30, 30],
          iconAnchor: [15, 15],
          className:  '',
        });

        if (currentLocation) {
          markerRef.current = L.marker([currentLocation.latitude, currentLocation.longitude], { icon: carIcon }).addTo(map);
        }

        if (currentLocation) {
          L.marker([currentLocation.latitude + 0.005, currentLocation.longitude - 0.005], { icon: pickupIcon })
            .bindPopup(`<b>Pickup</b><br>${pickup}`)
            .addTo(map);
          L.marker([currentLocation.latitude - 0.01, currentLocation.longitude + 0.01], { icon: dropoffIcon })
            .bindPopup(`<b>Dropoff</b><br>${dropoff}`)
            .addTo(map);
        }

        if (route && route.length > 1) {
          const latlngs = route.map(p => [p.latitude, p.longitude]);
          polyRef.current = L.polyline(latlngs, { color: '#1565C0', weight: 4, opacity: 0.7, dashArray: '8 4' }).addTo(map);
        }
      } else {
        const map = mapObj.current;
        if (currentLocation && markerRef.current) {
          markerRef.current.setLatLng([currentLocation.latitude, currentLocation.longitude]);
          map.panTo([currentLocation.latitude, currentLocation.longitude], { animate: true, duration: 1 });
        }

        if (route && route.length > 1 && polyRef.current) {
          const latlngs = route.map(p => [p.latitude, p.longitude]);
          polyRef.current.setLatLngs(latlngs);
        }
      }
    });
  }, [currentLocation, route, pickup, dropoff]);

  return (
    <div className="relative w-full" style={{ height: '52vh', minHeight: '280px' }}>
      <div ref={mapRef} className="w-full h-full" />
      {!currentLocation && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-50/80 backdrop-blur-sm z-10">
          <div className="text-center">
            <div className="text-4xl mb-3 animate-pulse">📡</div>
            <p className="text-primary-700 font-semibold text-sm">Fetching driver location...</p>
          </div>
        </div>
      )}
    </div>
  );
}
