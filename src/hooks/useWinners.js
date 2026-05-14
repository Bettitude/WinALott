import { useState, useEffect } from 'react';
import { matchApi } from '../api/matchApi';

export function useWinners(limit = 20) {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    matchApi.getWinners(limit)
      .then(res => {
        if (!cancelled) {
          setWinners(res.data?.data?.winners || []);
          setError(null);
        }
      })
      .catch(err => {
        if (!cancelled) setError(err.response?.data?.error || err.message);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [limit]);

  return { winners, loading, error };
}
