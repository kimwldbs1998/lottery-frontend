import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api/client';

/**
 * Requirement section 8: expected 1st/2nd place prize display, refreshed at least every 5
 * seconds so purchases made from other devices are reflected, plus an explicit refresh()
 * for "구매가 완료되거나 회차가 변경되면 즉시 갱신".
 */
export function useEstimate(roundNumber) {
  const [estimate, setEstimate] = useState(null);
  const [stale, setStale] = useState(false);
  const timerRef = useRef(null);

  const fetchNow = useCallback(async () => {
    try {
      const data = await api.get('/rounds/current/estimate', { auth: false });
      setEstimate(data);
      setStale(false);
    } catch (e) {
      setStale(true);
    }
  }, []);

  useEffect(() => {
    fetchNow();
    timerRef.current = setInterval(fetchNow, 5000);
    return () => clearInterval(timerRef.current);
  }, [fetchNow, roundNumber]);

  return { estimate, stale, refresh: fetchNow };
}
