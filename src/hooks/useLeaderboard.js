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
          const raw = res.data?.data?.leaderboard || [];
          setRows(raw.map((r, i) => ({
            rank:       r.rank ?? i + 1,
            username:   r.username ?? 'Unknown',
            wins:       r.total_wins ?? r.wins ?? 0,
            totalPrize: (r.total_won ?? r.totalPrize ?? 0) / 100,
            lastWin:    r.last_win
              ? new Date(r.last_win).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : '—',
          })));
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
