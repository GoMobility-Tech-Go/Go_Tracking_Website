'use client';
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { API_HOST } from '../lib/api';

export const useTrackingSocket = (token, { onLocation, onError, enabled = true } = {}) => {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const onLocationRef = useRef(onLocation);
  const onErrorRef = useRef(onError);

  useEffect(() => { onLocationRef.current = onLocation; }, [onLocation]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  useEffect(() => {
    if (!token || !enabled) return;

    const socket = io(API_HOST, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      withCredentials: true,
    });
    socketRef.current = socket;

    const join = () => socket.emit('tracking:join', { trackingToken: token });

    socket.on('connect', () => {
      setConnected(true);
      join();
    });
    socket.on('disconnect', () => setConnected(false));
    socket.on('tracking:joined', () => {});
    socket.on('tracking:location-updated', (loc) => {
      onLocationRef.current?.(loc);
    });
    socket.on('tracking:error', (e) => {
      onErrorRef.current?.(e?.message || 'Tracking unavailable');
    });

    return () => {
      try { socket.emit('tracking:leave', { trackingToken: token }); } catch {}
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, enabled]);

  return { connected };
};
