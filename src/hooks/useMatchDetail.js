import { useState, useEffect } from 'react';
import { liveApi } from '../api/liveApi';
import { matchApi } from '../api/matchApi';

export function useMatchDetail(matchId) {
  const [data,    setData]    = useState({
    match: null, stats: null, lineups: null,
    events: null, h2h: null, odds: null, news: null,
  });
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!matchId) return;
    let cancelled = false;

    async function fetchAll() {
      setLoading(true);
      try {
        // Supabase match data first
        const matchRes = await matchApi.getMatchById(matchId);
        const match = matchRes.data?.data?.match;
        if (cancelled) return;

        const apiFootballId = match?.api_football_id;
        const homeName = match?.team_home;
        const awayName = match?.team_away;

        // Fire all supplemental requests in parallel
        const [fixture, stats, lineups, events, h2h, odds, news] =
          await Promise.allSettled([
            apiFootballId ? liveApi.getFixtureById(apiFootballId)                    : Promise.resolve(null),
            apiFootballId ? liveApi.getMatchStats(apiFootballId)                     : Promise.resolve(null),
            apiFootballId ? liveApi.getMatchLineups(apiFootballId)                   : Promise.resolve(null),
            apiFootballId ? liveApi.getMatchEvents(apiFootballId)                    : Promise.resolve(null),
            apiFootballId ? liveApi.getH2H(null, null, homeName, awayName, null)     : Promise.resolve(null),
            (apiFootballId && homeName && awayName)
              ? liveApi.getMatchOdds(apiFootballId, homeName, awayName)              : Promise.resolve(null),
            homeName ? liveApi.getNewsForTeam(homeName)                              : Promise.resolve(null),
          ]);

        if (!cancelled) {
          setData({
            match,
            fixture:  fixture?.status  === 'fulfilled' ? fixture.value?.data?.data  : null,
            stats:    stats?.status    === 'fulfilled' ? stats.value?.data?.data    : null,
            lineups:  lineups?.status  === 'fulfilled' ? lineups.value?.data?.data  : null,
            events:   events?.status   === 'fulfilled' ? events.value?.data?.data   : null,
            h2h:      h2h?.status      === 'fulfilled' ? h2h.value?.data?.data      : null,
            odds:     odds?.status     === 'fulfilled' ? odds.value?.data?.data     : null,
            news:     news?.status     === 'fulfilled' ? news.value?.data?.data     : null,
          });
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAll();

    // Refresh events + stats every 30s if live
    const interval = setInterval(async () => {
      if (!data.match?.api_football_id) return;
      const id = data.match.api_football_id;
      const [ev, st] = await Promise.allSettled([
        liveApi.getMatchEvents(id),
        liveApi.getMatchStats(id),
      ]);
      setData(prev => ({
        ...prev,
        events: ev.status === 'fulfilled' ? ev.value?.data?.data : prev.events,
        stats:  st.status === 'fulfilled' ? st.value?.data?.data : prev.stats,
      }));
    }, 30000);

    return () => { cancelled = true; clearInterval(interval); };
  }, [matchId]);

  return { ...data, loading, error };
}
