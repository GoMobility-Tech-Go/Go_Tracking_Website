import { Loader } from '@googlemaps/js-api-loader';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function pointKey(p) {
  const lat = toNum(p?.latitude);
  const lng = toNum(p?.longitude);
  return lat != null && lng != null ? `${lat.toFixed(6)},${lng.toFixed(6)}` : null;
}

export function directionsKey(from, to) {
  const a = pointKey(from);
  const b = pointKey(to);
  return a && b ? `${a}|${b}` : null;
}

let loaderInstance;
function getLoader() {
  if (!loaderInstance) {
    if (!API_KEY) throw new Error('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set');
    loaderInstance = new Loader({
      apiKey: API_KEY,
      version: 'weekly',
      libraries: ['routes', 'geometry'],
    });
  }
  return loaderInstance;
}

let routesPromise;
function importRoutes() {
  if (!routesPromise) routesPromise = getLoader().importLibrary('routes');
  return routesPromise;
}

let geometryPromise;
function importGeometry() {
  if (!geometryPromise) geometryPromise = getLoader().importLibrary('geometry');
  return geometryPromise;
}

let serviceInstance;
async function getDirectionsService() {
  if (!serviceInstance) {
    const { DirectionsService } = await importRoutes();
    serviceInstance = new DirectionsService();
  }
  return serviceInstance;
}

/**
 * Decode a Google encoded polyline string → [[lat, lng], ...].
 * Loads the `geometry` library on first call. Cached.
 */
export async function decodePolyline(encoded) {
  if (!encoded || typeof encoded !== 'string') return null;
  const { encoding } = await importGeometry();
  const path = encoding.decodePath(encoded);
  return path.map((p) => [p.lat(), p.lng()]);
}

/**
 * Client-side fallback when backend `routes` is missing.
 * Costly — prefer backend-cached routes.
 */
export async function fetchDirections(from, to) {
  const a = pointKey(from);
  const b = pointKey(to);
  if (!a || !b) return null;

  const [aLat, aLng] = a.split(',').map(Number);
  const [bLat, bLng] = b.split(',').map(Number);

  const service = await getDirectionsService();
  const result = await service.route({
    origin:      { lat: aLat, lng: aLng },
    destination: { lat: bLat, lng: bLng },
    travelMode:  'DRIVING',
  });

  const route = result?.routes?.[0];
  if (!route) return null;

  const coords = (route.overview_path || []).map((p) => [p.lat(), p.lng()]);
  const distance = (route.legs || []).reduce((s, l) => s + (l.distance?.value || 0), 0);
  const duration = (route.legs || []).reduce((s, l) => s + (l.duration?.value || 0), 0);
  return { coords, distance, duration };
}
