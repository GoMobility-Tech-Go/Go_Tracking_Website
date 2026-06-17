'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchTrackingData } from '../lib/api';
import { io } from 'socket.io-client';

export const useTrackingData = (token) => {
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [socketLive, setSocketLive] = useState(false);
  const intervalRef             = useRef(null);
  const socketRef               = useRef(null);

  // REST polling — full ride data (status, driver, fare, etc.)
  const poll = useCallback(async () => {
    try {
      const result = await fetchTrackingData(token);
      setData(result);
      setError(null);
      if (result?.status === 'completed') {
        clearInterval(intervalRef.current);
        socketRef.current?.disconnect();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ERROR');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // ── REST polling ──────────────────────────────────────────────
    poll();
    intervalRef.current = setInterval(poll, 5000);

    // ── Socket.IO — real-time driver location ─────────────────────
    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://api.gomobility.co.in';

    const socket = io(SOCKET_URL, {
      path: '/socket.io',
      // Public tracking namespace — no JWT needed
      // Backend mein /tracking namespace add karna hoga (unauthenticated)
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      timeout: 10000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketLive(true);
      // Join tracking room with token
      socket.emit('tracking:join', { trackingToken: token });
    });

    // Backend driver:location_update se yeh event aata hai
    socket.on('tracking:location-updated', (locationData) => {
      setData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          location: {
            ...prev.location,
            current: {
              latitude:  locationData.latitude,
              longitude: locationData.longitude,
              accuracy:  locationData.accuracy || null,
              timestamp: locationData.timestamp,
            },
          },
        };
      });
    });

    socket.on('disconnect', () => {
      setSocketLive(false);
    });

    socket.on('connect_error', () => {
      // Socket connect nahi hua — polling se kaam chalega, no error shown
      setSocketLive(false);
    });

    return () => {
      clearInterval(intervalRef.current);
      if (socket.connected) {
        socket.emit('tracking:leave', { trackingToken: token });
      }
      socket.disconnect();
    };
  }, [poll, token]);

  return { data, loading, error, socketLive };
};
