import { useState, useEffect, useCallback } from 'react';
import { matchApi } from '../api/matchApi';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await matchApi.getNotifications({ limit: 50 });
      setNotifications(res.data?.data?.notifications || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const markRead = async (id) => {
    try {
      await matchApi.markNotifRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await matchApi.markAllNotifsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {}
  };

  return { notifications, loading, error, markRead, markAllRead, refetch: fetch };
}
