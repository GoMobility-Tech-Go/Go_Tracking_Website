const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.gomobility.co.in/api/v1';

export const fetchTrackingData = async (token) => {
  const res = await fetch(`${BASE}/tracking/public/${token}`, { cache: 'no-store' });
  if (res.status === 404) throw new Error('NOT_FOUND');
  if (!res.ok) throw new Error('SERVER_ERROR');
  const json = await res.json();
  return json.data;
};

export const fetchRouteHistory = async (token) => {
  const res = await fetch(`${BASE}/tracking/public/${token}/history`, { cache: 'no-store' });
  if (!res.ok) throw new Error('History fetch failed');
  const json = await res.json();
  return json.data;
};
