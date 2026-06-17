'use client';
import { useEffect, useRef } from 'react';

const addr = (loc) => (typeof loc === 'string' ? loc : loc?.address || '');
const coords = (loc) => {
  if (!loc) return null;
  const lat = Number(loc.latitude);
  const lng = Number(loc.longitude);
  return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
};

export default function TrackingMap({ currentLocation, pickup, dropoff, route }) {
  const mapRef    = useRef(null);
  const mapObj    = useRef(null);
  const markerRef = useRef(null);
  const pickupMarkerRef  = useRef(null);
  const dropoffMarkerRef = useRef(null);
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

      const driverLL  = coords(currentLocation);
      const pickupLL  = coords(pickup);
      const dropoffLL = coords(dropoff);
      const initialCenter = driverLL || pickupLL || dropoffLL || [20.5937, 78.9629];

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

      if (!mapObj.current) {
        const map = L.map(mapRef.current, { zoomControl: false, attributionControl: false });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        map.setView(initialCenter, 15);
        mapObj.current = map;
        L.control.zoom({ position: 'bottomright' }).addTo(map);
      }

      const map = mapObj.current;

      // Driver marker
      if (driverLL) {
        if (markerRef.current) {
          markerRef.current.setLatLng(driverLL);
          map.panTo(driverLL, { animate: true, duration: 1 });
        } else {
          markerRef.current = L.marker(driverLL, { icon: carIcon }).addTo(map);
        }
      }

      // Pickup marker (real coords from API)
      if (pickupLL && !pickupMarkerRef.current) {
        pickupMarkerRef.current = L.marker(pickupLL, { icon: pickupIcon })
          .bindPopup(`<b style="color:#0E1B55">📍 Pickup</b><br><small>${addr(pickup)}</small>`)
          .addTo(map);
      }

      // Dropoff marker (real coords from API)
      if (dropoffLL && !dropoffMarkerRef.current) {
        dropoffMarkerRef.current = L.marker(dropoffLL, { icon: dropoffIcon })
          .bindPopup(`<b style="color:#dc2626">🏁 Dropoff</b><br><small>${addr(dropoff)}</small>`)
          .addTo(map);
      }

      // Route polyline
      if (route && route.length > 1) {
        const latlngs = route
          .map(p => coords(p))
          .filter(Boolean);
        if (latlngs.length > 1) {
          if (polyRef.current) {
            polyRef.current.setLatLngs(latlngs);
          } else {
            polyRef.current = L.polyline(latlngs, {
              color: '#D4AF37', weight: 5, opacity: 0.85, dashArray: '10 6',
            }).addTo(map);
          }
        }
      }

      // Auto-fit bounds on first paint when we have multiple anchors
      const anchors = [driverLL, pickupLL, dropoffLL].filter(Boolean);
      if (!markerRef.current?._boundsFit && anchors.length >= 2) {
        map.fitBounds(anchors, { padding: [60, 60], maxZoom: 15 });
        if (markerRef.current) markerRef.current._boundsFit = true;
      }
    });
  }, [currentLocation, route, pickup, dropoff]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />

      {!currentLocation && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
          style={{ background: 'rgba(14,27,85,0.4)', backdropFilter: 'blur(2px)' }}>
          <div className="text-center bg-white/95 rounded-2xl px-5 py-3 shadow-2xl">
            <div className="text-3xl mb-1 animate-pulse">📡</div>
            <p className="text-royal-900 font-bold text-xs tracking-wide">Waiting for driver location…</p>
          </div>
        </div>
      )}
    </div>
  );
}
