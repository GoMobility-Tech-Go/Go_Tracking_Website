const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.gomobility.co.in/api/v1';

export const API_HOST = BASE.replace(/\/api\/v1\/?$/, '');

const parse = async (res) => {
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    const msg = json.message || 'SERVER_ERROR';
    if (/not found|tracking disabled|invalid/i.test(msg)) throw new Error('NOT_FOUND');
    throw new Error(msg);
  }
  return json.data;
};

export const fetchTrackingData = async (token) => {
  const res = await fetch(`${BASE}/tracking/public/${token}`, { cache: 'no-store' });
  return parse(res);
};

export const fetchRouteHistory = async (token) => {
  const res = await fetch(`${BASE}/tracking/public/${token}/history`, { cache: 'no-store' });
  return parse(res);
};
