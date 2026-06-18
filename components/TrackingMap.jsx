'use client';
import { useEffect, useRef, useState } from 'react';
import { fetchDirections, directionsKey, decodePolyline } from '../lib/directions';
import { isTerminal } from '../lib/status';

const addr = (loc) => (typeof loc === 'string' ? loc : loc?.address || '');
const coords = (loc) => {
  if (!loc) return null;
  const lat = Number(loc.latitude);
  const lng = Number(loc.longitude);
  return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
};

function bearing(from, to) {
  if (!from || !to) return null;
  const toRad = (d) => (d * Math.PI) / 180;
  const toDeg = (r) => (r * 180) / Math.PI;
  const lat1 = toRad(from[0]);
  const lat2 = toRad(to[0]);
  const dLng = toRad(to[1] - from[1]);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function sameLL(a, b) {
  return a && b && a[0] === b[0] && a[1] === b[1];
}

export default function TrackingMap({ currentLocation, pickup, dropoff, route, status, routes }) {
  const mapRef       = useRef(null);
  const mapObj       = useRef(null);
  const markerRef    = useRef(null);
  const pickupRef    = useRef(null);
  const dropoffRef   = useRef(null);
  const breadcrumbRef = useRef(null);
  const plannedRef   = useRef(null);
  const plannedOutlineRef = useRef(null);
  const toPickupRef  = useRef(null);
  const animRef      = useRef({ raf: 0, currentLL: null, bearing: 0 });
  const fittedRef    = useRef(false);
  const followRef    = useRef(true);

  const [mapReady, setMapReady] = useState(false);
  const [plannedCoords, setPlannedCoords] = useState(null);     // toDropoff
  const [toPickupCoords, setToPickupCoords] = useState(null);   // toPickup (driver→pickup)
  const [fallbackKey, setFallbackKey] = useState(null);

  // ── Mount: init Leaflet map ONCE ────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current || mapObj.current) return;
    let cancelled = false;

    import('leaflet').then((L) => {
      if (cancelled) return;
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const initialCenter =
        coords(currentLocation) || coords(pickup) || coords(dropoff) || [20.5937, 78.9629];

      const map = L.map(mapRef.current, { zoomControl: false, attributionControl: false });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);
      map.setView(initialCenter, 15);
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      map.on('dragstart zoomstart', () => { followRef.current = false; });

      mapObj.current = map;
      setMapReady(true);
    });

    return () => {
      cancelled = true;
      if (animRef.current.raf) cancelAnimationFrame(animRef.current.raf);
      if (mapObj.current) {
        mapObj.current.remove();
        mapObj.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Pickup / Dropoff pins ───────────────────────────────────────────────────
  useEffect(() => {
    const map = mapObj.current;
    if (!map) return;
    let cancelled = false;
    import('leaflet').then((L) => {
      if (cancelled) return;

      const pickupIcon = L.divIcon({
        html: `<div style="
          background: linear-gradient(135deg,#16a34a,#22c55e);
          color: white; border-radius: 50%;
          width: 34px; height: 34px;
          display: flex; align-items: center; justify-content: center; font-size: 15px;
          box-shadow: 0 3px 10px rgba(34,197,94,0.6); border: 2.5px solid white;">📍</div>`,
        iconSize: [34, 34], iconAnchor: [17, 17], className: '',
      });
      const dropoffIcon = L.divIcon({
        html: `<div style="
          background: linear-gradient(135deg,#dc2626,#ef4444);
          color: white; border-radius: 50%;
          width: 34px; height: 34px;
          display: flex; align-items: center; justify-content: center; font-size: 15px;
          box-shadow: 0 3px 10px rgba(239,68,68,0.6); border: 2.5px solid white;">🏁</div>`,
        iconSize: [34, 34], iconAnchor: [17, 17], className: '',
      });

      const pLL = coords(pickup);
      const dLL = coords(dropoff);

      if (pLL) {
        if (pickupRef.current) pickupRef.current.setLatLng(pLL);
        else pickupRef.current = L.marker(pLL, { icon: pickupIcon })
          .bindPopup(`<b style="color:#0E1B55">📍 Pickup</b><br><small>${addr(pickup)}</small>`)
          .addTo(map);
      }
      if (dLL) {
        if (dropoffRef.current) dropoffRef.current.setLatLng(dLL);
        else dropoffRef.current = L.marker(dLL, { icon: dropoffIcon })
          .bindPopup(`<b style="color:#dc2626">🏁 Dropoff</b><br><small>${addr(dropoff)}</small>`)
          .addTo(map);
      }
    });
    return () => { cancelled = true; };
  }, [pickup, dropoff, mapReady]);

  // ── Planned route (pickup→dropoff) — prefer backend polyline ────────────────
  useEffect(() => {
    const backendPolyline = routes?.toDropoff?.polyline;
    if (backendPolyline) {
      let cancelled = false;
      decodePolyline(backendPolyline)
        .then((c) => { if (!cancelled && c?.length) setPlannedCoords(c); })
        .catch(() => {});
      return () => { cancelled = true; };
    }

    // Fallback: backend didn't send → client-side Google call (costly)
    const key = directionsKey(pickup, dropoff);
    if (!key || key === fallbackKey) return;
    let cancelled = false;
    setFallbackKey(key);
    fetchDirections(pickup, dropoff)
      .then((r) => { if (!cancelled && r?.coords?.length) setPlannedCoords(r.coords); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [routes?.toDropoff?.polyline, routes?.toDropoff?.computedAt, pickup, dropoff, fallbackKey]);

  // ── Driver→Pickup route (assigned/arrived only) — backend only, no fallback ─
  useEffect(() => {
    const backendPolyline = routes?.toPickup?.polyline;
    if (!backendPolyline) {
      setToPickupCoords(null);
      return;
    }
    let cancelled = false;
    decodePolyline(backendPolyline)
      .then((c) => { if (!cancelled && c?.length) setToPickupCoords(c); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [routes?.toPickup?.polyline, routes?.toPickup?.computedAt]);

  // ── Draw planned route polyline (white outline + royal blue) ────────────────
  useEffect(() => {
    const map = mapObj.current;
    if (!map || !plannedCoords) return;
    let cancelled = false;
    import('leaflet').then((L) => {
      if (cancelled) return;
      if (plannedOutlineRef.current) plannedOutlineRef.current.setLatLngs(plannedCoords);
      else plannedOutlineRef.current = L.polyline(plannedCoords, {
        color: '#FFFFFF', weight: 9, opacity: 0.95, lineCap: 'round', lineJoin: 'round',
      }).addTo(map);

      if (plannedRef.current) plannedRef.current.setLatLngs(plannedCoords);
      else plannedRef.current = L.polyline(plannedCoords, {
        color: '#0E1B55', weight: 5, opacity: 0.9, lineCap: 'round', lineJoin: 'round',
      }).addTo(map);
    });
    return () => { cancelled = true; };
  }, [plannedCoords, mapReady]);

  // ── Draw driver→pickup route (dotted overlay) ───────────────────────────────
  useEffect(() => {
    const map = mapObj.current;
    if (!map) return;
    let cancelled = false;
    import('leaflet').then((L) => {
      if (cancelled) return;
      if (!toPickupCoords || toPickupCoords.length < 2) {
        if (toPickupRef.current) { toPickupRef.current.remove(); toPickupRef.current = null; }
        return;
      }
      if (toPickupRef.current) toPickupRef.current.setLatLngs(toPickupCoords);
      else toPickupRef.current = L.polyline(toPickupCoords, {
        color: '#16a34a', weight: 4, opacity: 0.95, dashArray: '2 8',
        lineCap: 'round', lineJoin: 'round',
      }).addTo(map);
    });
    return () => { cancelled = true; };
  }, [toPickupCoords, mapReady]);

  // ── Breadcrumb (actual traveled) polyline ───────────────────────────────────
  useEffect(() => {
    const map = mapObj.current;
    if (!map) return;
    let cancelled = false;
    import('leaflet').then((L) => {
      if (cancelled) return;
      const latlngs = (route || []).map(coords).filter(Boolean);
      if (latlngs.length < 2) {
        if (breadcrumbRef.current) { breadcrumbRef.current.remove(); breadcrumbRef.current = null; }
        return;
      }
      if (breadcrumbRef.current) breadcrumbRef.current.setLatLngs(latlngs);
      else breadcrumbRef.current = L.polyline(latlngs, {
        color: '#D4AF37', weight: 5, opacity: 0.95,
        lineCap: 'round', lineJoin: 'round',
      }).addTo(map);
    });
    return () => { cancelled = true; };
  }, [route, mapReady]);

  // ── Driver marker: smooth-animate + rotate to bearing + follow ──────────────
  useEffect(() => {
    const map = mapObj.current;
    const driverLL = coords(currentLocation);
    if (!map || !driverLL) return;

    let cancelled = false;
    import('leaflet').then((L) => {
      if (cancelled) return;

      const renderIcon = (deg) => L.divIcon({
        html: `<div style="
          background: linear-gradient(135deg, #D4AF37, #fbbf24);
          color: #0E1B55;
          border-radius: 50%;
          width: 42px; height: 42px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
          box-shadow: 0 4px 16px rgba(212,175,55,0.6);
          border: 3px solid white;
          transform: rotate(${deg - 90}deg);
          transition: transform 400ms ease;">🚗</div>`,
        iconSize:   [42, 42],
        iconAnchor: [21, 21],
        className:  '',
      });

      if (!markerRef.current) {
        markerRef.current = L.marker(driverLL, { icon: renderIcon(animRef.current.bearing) }).addTo(map);
        animRef.current.currentLL = driverLL;
      }

      const prev = animRef.current.currentLL || driverLL;
      // Prefer device heading from driver app; fall back to computed bearing
      const reportedHeading = currentLocation?.heading != null ? Number(currentLocation.heading) : null;
      const computedBearing = sameLL(prev, driverLL) ? null : bearing(prev, driverLL);
      const newBearing = Number.isFinite(reportedHeading) ? reportedHeading : computedBearing;

      if (newBearing != null) {
        animRef.current.bearing = newBearing;
        markerRef.current.setIcon(renderIcon(newBearing));
      }

      if (sameLL(prev, driverLL)) return;

      // Animate from prev → driverLL over ~1.2s
      if (animRef.current.raf) cancelAnimationFrame(animRef.current.raf);
      const start = performance.now();
      const duration = 1200;
      const from = prev;
      const to = driverLL;
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        const lat = from[0] + (to[0] - from[0]) * eased;
        const lng = from[1] + (to[1] - from[1]) * eased;
        if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
        if (followRef.current && !isTerminal(status)) {
          map.panTo([lat, lng], { animate: false });
        }
        if (t < 1) animRef.current.raf = requestAnimationFrame(tick);
        else animRef.current.currentLL = to;
      };
      animRef.current.raf = requestAnimationFrame(tick);
    });
    return () => { cancelled = true; };
  }, [currentLocation, status, mapReady]);

  // ── First-paint auto-fit covering pickup/dropoff/driver/planned route ───────
  useEffect(() => {
    const map = mapObj.current;
    if (!map || fittedRef.current) return;

    const driverLL = coords(currentLocation);
    const pLL = coords(pickup);
    const dLL = coords(dropoff);
    const anchors = [pLL, dLL, driverLL].filter(Boolean);
    if (anchors.length < 2 && !(plannedCoords && plannedCoords.length)) return;

    const bounds = [...anchors];
    if (plannedCoords?.length) bounds.push(...plannedCoords);
    if (toPickupCoords?.length) bounds.push(...toPickupCoords);

    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
    fittedRef.current = true;
    setTimeout(() => { followRef.current = true; }, 200);
  }, [currentLocation, pickup, dropoff, plannedCoords, toPickupCoords, mapReady]);

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

      <button
        onClick={() => {
          const map = mapObj.current;
          const driverLL = coords(currentLocation);
          if (map && driverLL) {
            followRef.current = true;
            map.panTo(driverLL, { animate: true });
          }
        }}
        className="absolute bottom-20 right-4 z-20 bg-white rounded-full w-11 h-11 shadow-2xl flex items-center justify-center border border-royal-100 hover:bg-royal-50 active:scale-95 transition"
        title="Recenter on driver"
      >
        <span className="text-lg">🎯</span>
      </button>
    </div>
  );
}
