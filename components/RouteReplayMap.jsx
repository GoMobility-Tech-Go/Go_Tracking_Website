'use client';
import { useEffect, useRef, useState } from 'react';
import { fetchDirections, decodePolyline } from '../lib/directions';

const addr = (loc) => (typeof loc === 'string' ? loc : loc?.address || '');
const coords = (loc) => {
  if (!loc) return null;
  const lat = Number(loc.latitude);
  const lng = Number(loc.longitude);
  return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
};

export default function RouteReplayMap({ pickup, dropoff, route, cancelled, plannedPolyline }) {
  const mapRef     = useRef(null);
  const mapObj     = useRef(null);
  const [ready, setReady] = useState(false);
  const [planned, setPlanned] = useState(null);

  // Init map once
  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current || mapObj.current) return;
    let cancelledFlag = false;

    import('leaflet').then((L) => {
      if (cancelledFlag) return;
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const center = coords(pickup) || coords(dropoff) || [20.5937, 78.9629];
      const map = L.map(mapRef.current, { zoomControl: false, attributionControl: false });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
      map.setView(center, 14);
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapObj.current = map;
      setReady(true);
    });

    return () => {
      cancelledFlag = true;
      if (mapObj.current) { mapObj.current.remove(); mapObj.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load planned route — prefer backend polyline, fall back to client Google call
  useEffect(() => {
    let cancelledFlag = false;
    if (plannedPolyline) {
      decodePolyline(plannedPolyline)
        .then((c) => { if (!cancelledFlag && c?.length) setPlanned(c); })
        .catch(() => {});
      return () => { cancelledFlag = true; };
    }
    fetchDirections(pickup, dropoff)
      .then((r) => { if (!cancelledFlag && r?.coords?.length) setPlanned(r.coords); })
      .catch(() => {});
    return () => { cancelledFlag = true; };
  }, [plannedPolyline, pickup, dropoff]);

  // Render layers + fit bounds once map ready
  useEffect(() => {
    const map = mapObj.current;
    if (!map || !ready) return;
    let cancelledFlag = false;

    import('leaflet').then((L) => {
      if (cancelledFlag) return;

      const pickupIcon = L.divIcon({
        html: `<div style="
          background: linear-gradient(135deg,#16a34a,#22c55e);
          color: white; border-radius: 50%; width: 38px; height: 38px;
          display: flex; align-items: center; justify-content: center;
          font-weight: 900; font-size: 16px;
          box-shadow: 0 4px 12px rgba(34,197,94,0.55); border: 3px solid white;">A</div>`,
        iconSize: [38, 38], iconAnchor: [19, 19], className: '',
      });
      const dropoffIcon = L.divIcon({
        html: `<div style="
          background: linear-gradient(135deg,#dc2626,#ef4444);
          color: white; border-radius: 50%; width: 38px; height: 38px;
          display: flex; align-items: center; justify-content: center;
          font-weight: 900; font-size: 16px;
          box-shadow: 0 4px 12px rgba(239,68,68,0.55); border: 3px solid white;">B</div>`,
        iconSize: [38, 38], iconAnchor: [19, 19], className: '',
      });

      const pLL = coords(pickup);
      const dLL = coords(dropoff);

      if (pLL) L.marker(pLL, { icon: pickupIcon })
        .bindPopup(`<b style="color:#0E1B55">📍 Pickup</b><br><small>${addr(pickup)}</small>`)
        .addTo(map);
      if (dLL) L.marker(dLL, { icon: dropoffIcon })
        .bindPopup(`<b style="color:#dc2626">🏁 Dropoff</b><br><small>${addr(dropoff)}</small>`)
        .addTo(map);

      if (planned && planned.length > 1) {
        L.polyline(planned, {
          color: '#FFFFFF', weight: 9, opacity: 0.9, lineCap: 'round', lineJoin: 'round',
        }).addTo(map);
        L.polyline(planned, {
          color: '#0E1B55', weight: 5, opacity: 0.6, dashArray: '8 8',
          lineCap: 'round', lineJoin: 'round',
        }).addTo(map);
      }

      const breadcrumb = (route || []).map(coords).filter(Boolean);
      if (breadcrumb.length > 1) {
        L.polyline(breadcrumb, {
          color: '#FFFFFF', weight: 8, opacity: 0.95, lineCap: 'round', lineJoin: 'round',
        }).addTo(map);
        L.polyline(breadcrumb, {
          color: '#D4AF37', weight: 5, opacity: 1, lineCap: 'round', lineJoin: 'round',
        }).addTo(map);

        const start = breadcrumb[0];
        const end   = breadcrumb[breadcrumb.length - 1];
        L.circleMarker(start, {
          radius: 6, color: '#fff', weight: 2, fillColor: '#16a34a', fillOpacity: 1,
        }).addTo(map);
        L.circleMarker(end, {
          radius: 7, color: '#fff', weight: 2,
          fillColor: cancelled ? '#dc2626' : '#0E1B55', fillOpacity: 1,
        }).addTo(map);
      }

      const bounds = [...(pLL ? [pLL] : []), ...(dLL ? [dLL] : []), ...breadcrumb];
      if (planned) bounds.push(...planned);
      if (bounds.length >= 2) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
      } else if (bounds.length === 1) {
        map.setView(bounds[0], 15);
      }
    });

    return () => { cancelledFlag = true; };
  }, [ready, planned, pickup, dropoff, route, cancelled]);

  return <div ref={mapRef} className="w-full h-full" />;
}
