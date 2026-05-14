import { useState, useEffect, useCallback } from 'react';
import { matchApi } from '../api/matchApi';
import { normalizeTransaction } from '../api/normalizers';

export function useTransactions(params = {}) {
  const [transactions, setTransactions] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [total,        setTotal]        = useState(0);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await matchApi.getMyTransactions(params);
      const raw = res.data?.data?.transactions || [];
      setTransactions(raw.map(normalizeTransaction));
      setTotal(res.data?.data?.total || raw.length);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { transactions, loading, error, total, refetch: fetch };
}
