import { useState, useEffect, useCallback } from 'react';
import { liveApi } from '../api/liveApi';
import { normalizeFixture } from '../api/normalizers';

// Module-level cache — 30-second TTL matches the refresh interval
const _cache = { data: null, ts: 0 };
const CACHE_TTL_MS = 30_000;

export function useLiveFixtures(refreshInterval = 30000) {
  const cached = _cache.data && (Date.now() - _cache.ts < CACHE_TTL_MS) ? _cache.data : null;

  const [fixtures, setFixtures] = useState(() => cached || []);
  const [loading,  setLoading]  = useState(!cached);
  const [error,    setError]    = useState(null);

  const fetch = useCallback(async () => {
    try {
      const [liveRes, todayRes] = await Promise.allSettled([
        liveApi.getLiveFixtures(),
        liveApi.getTodayFixtures(),
      ]);

      const live  = liveRes.status  === 'fulfilled' ? (liveRes.value.data?.data  || []) : [];
      const today = todayRes.status === 'fulfilled' ? (todayRes.value.data?.data || []) : [];

      const liveIds = new Set(live.map(f => f.fixture?.id));
      const combined = [
        ...live,
        ...today.filter(f => !liveIds.has(f.fixture?.id)),
      ].map(normalizeFixture);

      _cache.data = combined;
      _cache.ts   = Date.now();
      setFixtures(combined);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // If cache is fresh, don't fetch on mount — wait for the interval
    if (!(_cache.data && Date.now() - _cache.ts < CACHE_TTL_MS)) {
      fetch();
    }
    const id = setInterval(fetch, refreshInterval);
    return () => clearInterval(id);
  }, [fetch, refreshInterval]);

  const liveOnly = fixtures.filter(f => f.isLive);

  return { fixtures, liveOnly, loading, error, refetch: fetch };
}
