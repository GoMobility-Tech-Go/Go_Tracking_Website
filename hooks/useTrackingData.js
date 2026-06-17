'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchTrackingData } from '../lib/api';
import { useTrackingSocket } from './useTrackingSocket';

const TERMINAL = new Set(['completed', 'cancelled']);
const REFRESH_MS = 30000;

export const useTrackingData = (token) => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const intervalRef           = useRef(null);

  const refresh = useCallback(async () => {
    try {
      const result = await fetchTrackingData(token);
      setData((prev) => {
        if (!prev) return result;
        // Keep socket-fed current location if newer than REST snapshot
        const prevTs = prev.location?.current?.timestamp;
        const nextTs = result.location?.current?.timestamp;
        if (prevTs && (!nextTs || new Date(prevTs) > new Date(nextTs))) {
          return { ...result, location: { ...result.location, current: prev.location.current }, route: prev.route || result.route };
        }
        return result;
      });
      setError(null);
      if (TERMINAL.has(result?.status) && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ERROR');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    refresh();
    intervalRef.current = setInterval(refresh, REFRESH_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [token, refresh]);

  const isTerminal = data?.status ? TERMINAL.has(data.status) : false;

  const handleLocation = useCallback((loc) => {
    setData((prev) => {
      if (!prev) return prev;
      const lat = Number(loc.latitude);
      const lng = Number(loc.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return prev;
      const current = {
        latitude: lat,
        longitude: lng,
        accuracy: loc.accuracy != null ? Number(loc.accuracy) : null,
        timestamp: loc.timestamp,
      };
      const route = prev.route ? [...prev.route, current] : [current];
      return { ...prev, location: { ...prev.location, current }, route };
    });
  }, []);

  const handleSocketError = useCallback((msg) => {
    setError((prev) => prev || msg);
  }, []);

  const { connected } = useTrackingSocket(token, {
    onLocation: handleLocation,
    onError: handleSocketError,
    enabled: !!token && !isTerminal,
  });

  return { data, loading, error, connected };
};
