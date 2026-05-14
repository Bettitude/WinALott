import { useState, useEffect, useCallback } from 'react';
import { matchApi } from '../api/matchApi';
import { normalizeTicket } from '../api/normalizers';

export function useTickets(params = {}) {
  const [tickets,  setTickets]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [total,    setTotal]    = useState(0);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await matchApi.getMyTickets(params);
      const raw = res.data?.data?.tickets || [];
      setTickets(raw.map(normalizeTicket));
      setTotal(res.data?.data?.total || raw.length);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { tickets, loading, error, total, refetch: fetch };
}
