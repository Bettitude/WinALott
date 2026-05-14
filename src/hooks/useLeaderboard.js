import { useState, useEffect } from 'react';
import { matchApi } from '../api/matchApi';

export function useLeaderboard(period = 'weekly') {
  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    matchApi.getLeaderboard(period)
      .then(res => {
        if (!cancelled) {
          setRows(res.data?.data?.leaderboard || []);
          setError(null);
        }
      })
      .catch(err => {
        if (!cancelled) setError(err.response?.data?.error || err.message);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [period]);

  return { rows, loading, error };
}
