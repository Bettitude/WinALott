import { useState, useEffect, useCallback } from 'react';
import { liveApi } from '../api/liveApi';
import { normalizeFixture } from '../api/normalizers';

export function useLiveFixtures(refreshInterval = 30000) {
  const [fixtures, setFixtures] = useState([]);
  const [loading,  setLoading]  = useState(true);
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

      setFixtures(combined);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    const id = setInterval(fetch, refreshInterval);
    return () => clearInterval(id);
  }, [fetch, refreshInterval]);

  const liveOnly = fixtures.filter(f => f.isLive);

  return { fixtures, liveOnly, loading, error, refetch: fetch };
}
