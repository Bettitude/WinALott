import { useState, useEffect, useCallback } from 'react';
import { matchApi } from '../api/matchApi';
import { normalizeMatch } from '../api/normalizers';

// Module-level cache — survives component unmount/remount (page navigation)
const _cache = {};
const CACHE_TTL_MS = 60_000; // 60 seconds

function getCache(key) {
  const entry = _cache[key];
  if (entry && Date.now() - entry.ts < CACHE_TTL_MS) return entry.data;
  return null;
}

function setCache(key, data) {
  _cache[key] = { data, ts: Date.now() };
}

export function useMatches(params = {}) {
  const cacheKey = JSON.stringify({ status: 'active', ...params });
  const cached   = getCache(cacheKey);

  const [matches, setMatches] = useState(() => cached || []);
  const [loading, setLoading] = useState(!cached);
  const [error,   setError]   = useState(null);
  const [total,   setTotal]   = useState(cached?.length || 0);

  const fetch = useCallback(async () => {
    // Return immediately if cache is fresh
    const hit = getCache(cacheKey);
    if (hit) {
      setMatches(hit);
      setTotal(hit.length);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await matchApi.getMatches({ status: 'active', ...params });
      const raw  = res.data?.data?.matches || [];
      const normalized = raw.map(normalizeMatch);
      setCache(cacheKey, normalized);
      setMatches(normalized);
      setTotal(res.data?.data?.total || normalized.length);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [cacheKey]);

  useEffect(() => { fetch(); }, [fetch]);

  return { matches, loading, error, total, refetch: fetch };
}
