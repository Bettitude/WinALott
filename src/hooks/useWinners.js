import { useState, useEffect } from 'react';
import { matchApi } from '../api/matchApi';

// Module-level cache — 5-minute TTL (winners don't change often)
const _cache = {};
const CACHE_TTL_MS = 5 * 60_000;

export function useWinners(limit = 20) {
  const cacheKey = String(limit);
  const cached   = _cache[cacheKey] && (Date.now() - _cache[cacheKey].ts < CACHE_TTL_MS)
    ? _cache[cacheKey].data
    : null;

  const [winners, setWinners] = useState(() => cached || []);
  const [loading, setLoading] = useState(!cached);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (cached) return; // cache hit — skip fetch
    let cancelled = false;
    matchApi.getWinners(limit)
      .then(res => {
        if (!cancelled) {
          const data = res.data?.data?.winners || [];
          _cache[cacheKey] = { data, ts: Date.now() };
          setWinners(data);
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
