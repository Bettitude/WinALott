import { useState, useEffect } from 'react';
import { matchApi } from '../api/matchApi';
import { normalizeMatch } from '../api/normalizers';

export function useMatches(params = {}) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [total,   setTotal]   = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    matchApi.getMatches({ status: 'active', ...params })
      .then(res => {
        if (cancelled) return;
        const raw = res.data?.data?.matches || [];
        setMatches(raw.map(normalizeMatch));
        setTotal(res.data?.data?.total || raw.length);
        setError(null);
      })
      .catch(err => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [JSON.stringify(params)]);

  return { matches, loading, error, total };
}
