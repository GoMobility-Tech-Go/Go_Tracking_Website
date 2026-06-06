'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchTrackingData } from '../lib/api';

export const useTrackingData = (token) => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const intervalRef           = useRef(null);

  const poll = useCallback(async () => {
    try {
      const result = await fetchTrackingData(token);
      setData(result);
      setError(null);
      if (result?.status === 'completed') {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ERROR');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    poll();
    intervalRef.current = setInterval(poll, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [poll]);

  return { data, loading, error };
};
