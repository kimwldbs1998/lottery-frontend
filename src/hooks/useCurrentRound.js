import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client';

/**
 * Polls the current round every second (for the on-screen countdown + sale-open state) and
 * invokes onRoundChange whenever the round number advances, so the caller can apply the
 * "새로운 회차로 변경" reset rules from requirement section 3.
 */
export function useCurrentRound(onRoundChange) {
  const [round, setRound] = useState(null);
  const [error, setError] = useState(null);
  const prevRoundNumber = useRef(null);
  const callbackRef = useRef(onRoundChange);
  callbackRef.current = onRoundChange;

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const data = await api.get('/rounds/current', { auth: false });
        if (cancelled) return;
        setError(null);
        if (prevRoundNumber.current !== null && data.roundNumber !== prevRoundNumber.current) {
          callbackRef.current?.(data);
        }
        prevRoundNumber.current = data.roundNumber;
        setRound(data);
      } catch (e) {
        if (!cancelled) setError(e);
      }
    }

    poll();
    const id = setInterval(poll, 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return { round, error };
}
