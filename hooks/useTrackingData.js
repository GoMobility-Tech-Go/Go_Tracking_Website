'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchTrackingData } from '../lib/api';
import { useTrackingSocket } from './useTrackingSocket';
import { isTerminal } from '../lib/status';

const POLL_MS = 5000;

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
        const merged = { ...result };
        if (prevTs && (!nextTs || new Date(prevTs) > new Date(nextTs))) {
          merged.location = { ...result.location, current: prev.location.current };
          merged.route = prev.route || result.route;
        }
        return merged;
      });
      setError(null);
      if (isTerminal(result?.status) && intervalRef.current) {
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
    intervalRef.current = setInterval(refresh, POLL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [token, refresh]);

  const terminal = isTerminal(data?.status);

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
        heading: loc.heading != null ? Number(loc.heading) : null,
        speed: loc.speed != null ? Number(loc.speed) : null,
        timestamp: loc.timestamp,
      };
      const route = prev.route ? [...prev.route, current] : [current];
      return { ...prev, location: { ...prev.location, current }, route };
    });
  }, []);

  // Socket emits this when backend recomputes toPickup or refreshes ETA
  // (driver moved >300m or cache >60s old). Not on every driver ping.
  const handleRouteUpdate = useCallback((payload) => {
    if (!payload) return;
    setData((prev) => {
      if (!prev) return prev;
      const next = { ...prev };
      if (payload.toPickup !== undefined) {
        next.routes = { ...(prev.routes || {}), toPickup: payload.toPickup };
      }
      if (payload.eta !== undefined) {
        next.eta = payload.eta;
      }
      return next;
    });
  }, []);

  const handleSocketError = useCallback((msg) => {
    setError((prev) => prev || msg);
  }, []);

  const { connected: socketLive } = useTrackingSocket(token, {
    onLocation: handleLocation,
    onRouteUpdate: handleRouteUpdate,
    onError: handleSocketError,
    enabled: !!token && !terminal,
  });

  return { data, loading, error, socketLive };
};
