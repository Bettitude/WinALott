import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FiSearch, FiChevronDown, FiChevronUp, FiFilter, FiX,
  FiRadio, FiUsers, FiStar, FiAward, FiZap, FiTrendingUp, FiGift, FiClock,
  FiCheckCircle, FiArrowRight, FiFlag,
} from 'react-icons/fi';
import MatchCard from '../components/ui/MatchCard';
import { useMatches } from '../hooks/useMatches';
import { useLiveFixtures } from '../hooks/useLiveFixtures';
import { useWinners } from '../hooks/useWinners';

const PAGE_SIZE = 20;

const TIER_TABS = [
  { key: 'all',      label: 'All',      Icon: null,    activeBg: 'bg-[#1A4D8F]',  activeText: 'text-white' },
  { key: 'free',     label: 'Free',     Icon: FiGift,  activeBg: 'bg-green-500',  activeText: 'text-white' },
  { key: 'silver',   label: 'Silver',   Icon: FiStar,  activeBg: 'bg-gray-500',   activeText: 'text-white' },
  { key: 'gold',     label: 'Gold',     Icon: FiAward, activeBg: 'bg-[#F5C518]',  activeText: 'text-[#1A1A2E]' },
  { key: 'platinum', label: 'Platinum', Icon: FiZap,   activeBg: 'bg-purple-600', activeText: 'text-white' },
];

const POPULAR_LEAGUES = [
  'Premier League', 'La Liga', 'Bundesliga', 'Serie A', 'Ligue 1',
  'Champions League', 'Europa League', 'Conference League',
  'World Cup', 'Euros', 'Copa America', 'Copa Libertadores',
  'MLS', 'Saudi Pro League', 'Eredivisie', 'Primeira Liga',
  'Scottish Premiership', 'Super Lig', 'Brazil Serie A',
];

const SORT_OPTIONS = [
  { key: 'open_first',  label: 'Open First' },
  { key: 'prize_high',  label: 'Prize High-Low' },
  { key: 'entry_low',   label: 'Entry Low-High' },
  { key: 'soonest',     label: 'Soonest' },
];

function GroupSeparator({ label, dot }) {
  return (
    <div className="flex items-center gap-3 py-2 col-span-full">
      <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
      <span className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-slate-500 whitespace-nowrap">{label}</span>
      <div className="flex-1 h-px bg-gray-100 dark:bg-slate-700" />
    </div>
  );
}

function isLive(m)     { return m.status === 'live'; }
function isFinished(m) { return m.status === 'finished'; }
function isOpen(m)     { return !isLive(m) && !isFinished(m); }

function InfiniteMatchList({ matches, allFiltered, sort }) {
  if (sort !== 'open_first') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-2">
        {matches.map(m => <MatchCard key={m.id} match={m} />)}
      </div>
    );
  }

  const rows = [];
  let shownOpen = false, shownLive = false;

  matches.forEach(m => {
    if (isOpen(m) && !shownOpen) {
      rows.push({ type: 'sep', key: 'sep-open', label: 'Open for Staking', dot: 'bg-green-500' });
      shownOpen = true;
    }
    if (isLive(m) && !shownLive) {
      rows.push({ type: 'sep', key: 'sep-live', label: 'Live Now', dot: 'bg-red-500' });
      shownLive = true;
    }
    rows.push({ type: 'card', key: m.id, match: m });
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-2">
      {rows.map(row =>
        row.type === 'sep'
          ? <GroupSeparator key={row.key} label={row.label} dot={row.dot} />
          : <MatchCard key={row.key} match={row.match} />
      )}
    </div>
  );
}

const WC_START = new Date('2026-06-11T19:00:00Z').getTime();

function useCountdown(targetMs) {
  const [remaining, setRemaining] = useState(() => Math.max(0, targetMs - Date.now()));
  useEffect(() => {
    const id = setInterval(() => setRemaining(Math.max(0, targetMs - Date.now())), 1000);
    return () => clearInterval(id);
  }, [targetMs]);
  const days  = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);
  const mins  = Math.floor((remaining % 3600000)  / 60000);
  const secs  = Math.floor((remaining % 60000)    / 1000);
  return { days, hours, mins, secs, started: remaining === 0 };
}

const STATUS_FILTERS = ['Live', 'Free'];

function Toggle({ on }) {
  return (
    <div className={`relative w-8 h-4 rounded-full transition-colors cursor-pointer shrink-0 pointer-events-none ${on ? 'bg-[#1A4D8F]' : 'bg-gray-200 dark:bg-slate-600'}`}>
      <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </div>
  );
}

export default function Lobby() {
  const [tierTab, setTierTab]               = useState('all');
  const [search, setSearch]                 = useState('');
  const [activeStatuses, setActiveStatuses] = useState(new Set());
  const [sort, setSort]                     = useState('open_first');
  const [leagueOpen, setLeagueOpen]         = useState(true);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [filterOpen, setFilterOpen]         = useState(false);
  const [showAllPools, setShowAllPools]     = useState(false);
  const [visibleCount, setVisibleCount]     = useState(PAGE_SIZE);
  const sentinelRef                         = useRef(null);

  const { matches: allMatches } = useMatches();
  const { liveOnly } = useLiveFixtures();
  const { winners: recentWinners } = useWinners(5);

  const leagues = useMemo(() => {
    const seen = new Set();
    return allMatches
      .map(m => m.league)
      .filter(l => l && !seen.has(l) && seen.add(l));
  }, [allMatches]);

  const toggleStatus = (s) => {
    setActiveStatuses(prev => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s); else next.add(s);
      return next;
    });
    setVisibleCount(PAGE_SIZE);
  };

  const filtered = useMemo(() => {
    let list = allMatches.filter(m => m.status !== 'finished');

    if (tierTab === 'free') {
      list = list.filter(m => m.price === 0 || (m._raw?.markets || []).some(mk => mk.ticket_price === 0));
    } else if (tierTab !== 'all') {
      list = list.map(m => {
        const market = (m._raw?.markets || []).find(mk => mk.tier === tierTab);
        if (!market) return null;
        const priceCents = market.ticket_price || 0;
        return {
          ...m,
          tier:        market.tier,
          price:       priceCents / 100,
          fillPercent: market.fill_percent || 0,
          prizePool:   Math.floor(priceCents * (market.max_tickets || 200) * 0.9) / 100,
        };
      }).filter(Boolean);
    }

    if (selectedLeague) list = list.filter(m => m.league === selectedLeague);

    if (activeStatuses.size > 0) {
      list = list.filter(m => {
        if (activeStatuses.has('Live') && m.status === 'live') return true;
        if (activeStatuses.has('Free') && m.price  === 0)      return true;
        return false;
      });
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(m =>
        `${m.homeTeam.name} ${m.awayTeam.name} ${m.league} ${m.market}`.toLowerCase().includes(q)
      );
    }

    const dateKey = m => `${m.date || ''}T${m.time || ''}`;

    if (sort === 'prize_high') return [...list].sort((a, b) => b.prizePool - a.prizePool);
    if (sort === 'entry_low')  return [...list].sort((a, b) => a.price - b.price);
    if (sort === 'soonest')    return [...list].sort((a, b) => dateKey(a).localeCompare(dateKey(b)));

    const live = list.filter(m => m.status === 'live').sort((a,b) => dateKey(a).localeCompare(dateKey(b)));
    const open = list.filter(m => m.status !== 'live' && m.status !== 'finished').sort((a,b) => dateKey(a).localeCompare(dateKey(b)));
    return [...open, ...live];
  }, [allMatches, tierTab, selectedLeague, activeStatuses, search, sort]);

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [filtered]);

  const loadMore = useCallback(() => {
    setVisibleCount(v => Math.min(v + PAGE_SIZE, filtered.length));
  }, [filtered.length]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) loadMore();
    }, { rootMargin: '200px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  const visible   = filtered.slice(0, visibleCount);
  const hasMore   = visibleCount < filtered.length;

  const activeMatches = useMemo(() => allMatches.filter(m => m.status !== 'finished'), [allMatches]);
  const liveCount  = activeMatches.filter(m => m.status === 'live').length;
  const totalPool  = activeMatches.reduce((sum, m) => sum + m.prizePool, 0);
  const biggestPools = useMemo(() =>
    [...activeMatches].sort((a, b) => b.prizePool - a.prizePool).slice(0, 10),
  [activeMatches]);

  const hasFilters = activeStatuses.size > 0 || selectedLeague || search.trim();
  const activeFilterCount = activeStatuses.size + (selectedLeague ? 1 : 0) + (sort !== 'open_first' ? 1 : 0);
  const wc = useCountdown(WC_START);

  return (
    <div className="relative">

      {/* ── Coming Soon overlay ───────────────────────────────────────────── */}
      <div className="fixed inset-0 z-40 bg-white/75 dark:bg-slate-900/80 backdrop-blur-[3px] flex items-center justify-center px-4 pt-16 pb-20">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#0D2B5E] flex items-center justify-center mx-auto mb-5 shadow-lg">
            <FiClock className="w-8 h-8 text-[#F5C518]" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5C518]/15 border border-[#F5C518]/40 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F5C518] animate-pulse" />
            <span className="text-[11px] font-black text-[#b89300] uppercase tracking-wide">Coming Soon</span>
          </div>
          <h2 className="text-2xl font-black text-[#1A1A2E] dark:text-white mb-3 leading-tight">
            The Full Lobby<br />is Almost Here
          </h2>
          <p className="text-gray-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
            Silver, Gold and Platinum tier prediction markets are launching very soon.
            <br /><br />
            In the meantime — play our <strong className="text-[#1A1A2E] dark:text-white">free World Cup 2026 predictions</strong> and win real cash prizes.
          </p>
          <Link
            to="/worldcup"
            className="inline-flex items-center justify-center gap-2 w-full bg-[#1A4D8F] text-white font-black px-6 py-3.5 rounded-xl hover:bg-[#0D2B5E] transition-colors shadow-md text-sm"
          >
            <FiFlag className="w-4 h-4" />
            Play World Cup 2026 — Free
            <FiArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-4">
            Free to enter &nbsp;·&nbsp; Cash prizes &nbsp;·&nbsp; Real match predictions
          </p>
        </div>
      </div>

      {/* ── Full lobby UI (non-interactive behind overlay) ────────────────── */}
      <div className="pointer-events-none select-none opacity-40">

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">

          {/* Page header */}
          <div className="mb-6">
            <h1 className="text-3xl font-black text-[#1A1A2E] dark:text-white mb-1">The Lobby</h1>
            <p className="text-gray-500 dark:text-slate-400 text-sm">Browse all active prediction markets</p>
          </div>

          <div className="flex gap-5 items-start">

            {/* Left Sidebar */}
            <aside className="hidden lg:block w-[220px] shrink-0">
              <div className="sticky top-24 flex flex-col gap-4">

                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    readOnly
                    placeholder="Search matches…"
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl text-xs bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500"
                  />
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-3.5">
                  <p className="text-[10px] font-black text-[#1A1A2E] dark:text-slate-200 uppercase tracking-widest mb-3">Filters</p>
                  <div className="space-y-2.5">
                    {STATUS_FILTERS.map(s => (
                      <div key={s} className="flex items-center justify-between gap-2 py-0.5 px-1">
                        <span className="text-xs font-medium text-gray-600 dark:text-slate-300 select-none">{s}</span>
                        <Toggle on={false} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-3.5">
                  <p className="text-[10px] font-black text-[#1A1A2E] dark:text-slate-200 uppercase tracking-widest mb-2.5">Popular Leagues</p>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_LEAGUES.slice(0, 8).map(l => (
                      <span
                        key={l}
                        className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-slate-300 border border-gray-200 dark:border-slate-600"
                      >
                        {l}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
                  <div className="w-full flex items-center justify-between px-3.5 py-2.5 text-[10px] font-black text-[#1A1A2E] dark:text-slate-200 uppercase tracking-widest">
                    Leagues
                    <FiChevronUp className="w-3.5 h-3.5 text-gray-400 dark:text-slate-400" />
                  </div>
                  <div className="border-t border-gray-100 dark:border-slate-700">
                    {['All Leagues', ...POPULAR_LEAGUES.slice(0, 6)].map((l, i) => (
                      <div
                        key={i}
                        className={`w-full text-left px-3.5 py-2 text-xs font-medium border-b border-gray-50 dark:border-slate-700 last:border-0 ${
                          i === 0 ? 'bg-blue-50 dark:bg-blue-950/50 text-[#1A4D8F] dark:text-blue-400 font-bold' : 'text-gray-600 dark:text-slate-300'
                        }`}
                      >
                        {l}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-3.5">
                  <p className="text-[10px] font-black text-[#1A1A2E] dark:text-slate-200 uppercase tracking-widest mb-2.5">Sort by</p>
                  <div className="flex flex-col gap-1">
                    {SORT_OPTIONS.map((o, i) => (
                      <div
                        key={o.key}
                        className={`text-left px-2.5 py-1.5 rounded-lg text-xs font-medium ${
                          i === 0 ? 'bg-[#1A4D8F] text-white' : 'text-gray-500 dark:text-slate-400'
                        }`}
                      >
                        {o.label}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#0D2B5E] to-[#1A4D8F] rounded-2xl p-3.5 text-white">
                  <p className="text-[10px] font-black uppercase tracking-widest mb-3 text-white/60">Live Stats</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/70">Live now</span>
                      <span className="flex items-center gap-1 text-xs font-black">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                        {liveCount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/70">Total pool</span>
                      <span className="text-xs font-black text-[#F5C518]">${(totalPool ?? 0).toFixed(0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/70">Open markets</span>
                      <span className="text-xs font-black">{activeMatches.length}</span>
                    </div>
                  </div>
                </div>

              </div>
            </aside>

            {/* Center Feed */}
            <div className="flex-1 min-w-0">

              {/* Mobile search + filter bar */}
              <div className="lg:hidden mb-4 flex gap-2">
                <div className="relative flex-1">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    readOnly
                    placeholder="Search matches…"
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl text-xs bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500"
                  />
                </div>
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-600 shrink-0">
                  <FiFilter className="w-4 h-4" />
                  Filters
                </div>
              </div>

              {/* Tier tabs */}
              <div className="flex gap-2 mb-5 overflow-x-auto pb-0.5">
                {TIER_TABS.map((t, i) => (
                  <div
                    key={t.key}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-black whitespace-nowrap ${
                      i === 0
                        ? `${t.activeBg} ${t.activeText} shadow-md`
                        : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-600'
                    }`}
                  >
                    {t.Icon && <t.Icon className="w-3.5 h-3.5" />}
                    {t.label}
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      i === 0 ? 'bg-white/20' : 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-400'
                    }`}>
                      {i === 0 ? activeMatches.length : 0}
                    </span>
                  </div>
                ))}
              </div>

              {/* Results bar */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-gray-400 dark:text-slate-500 font-medium">
                  {filtered.length} market{filtered.length !== 1 ? 's' : ''} found
                </p>
              </div>

              {/* Match grid */}
              {visible.length > 0 ? (
                <InfiniteMatchList matches={visible} allFiltered={filtered} sort={sort} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-48 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 animate-pulse" />
                  ))}
                </div>
              )}

              <div className="py-6 flex items-center justify-center">
                <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-slate-500">
                  <FiCheckCircle className="w-4 h-4 text-green-400" />
                  You've seen all available matches
                </div>
              </div>

            </div>

            {/* Right Sidebar */}
            <aside className="hidden xl:block w-[260px] shrink-0">
              <div className="sticky top-24 flex flex-col gap-4">

                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-2 px-3.5 py-2.5 bg-red-500">
                    <FiRadio className="w-3.5 h-3.5 text-white" />
                    <span className="text-xs font-black text-white uppercase tracking-wide">Live Scores</span>
                  </div>
                  <div className="divide-y divide-gray-50 dark:divide-slate-700 max-h-48 overflow-y-auto">
                    {liveOnly.length === 0 ? (
                      <p className="text-xs text-gray-400 dark:text-slate-500 px-3.5 py-3">No live matches right now</p>
                    ) : liveOnly.map(f => (
                      <div key={f.id} className="flex items-center gap-2 px-3.5 py-2">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full shrink-0" />
                        <span className="text-xs text-gray-600 dark:text-slate-300 font-medium truncate">
                          {f.homeTeam.name} {f.score.home ?? 0} - {f.score.away ?? 0} {f.awayTeam.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-3.5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <FiTrendingUp className="w-3.5 h-3.5 text-[#1A4D8F]" />
                      <p className="text-[10px] font-black text-[#1A1A2E] dark:text-slate-200 uppercase tracking-widest">Biggest Pools</p>
                    </div>
                    <span className="text-[10px] text-gray-400 dark:text-slate-500">Top 5</span>
                  </div>
                  <div className="space-y-2.5">
                    {(biggestPools.slice(0, 5).length === 0 ? [...Array(5)] : biggestPools.slice(0, 5)).map((m, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className={`w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-[10px] font-black ${
                          i === 0 ? 'bg-[#F5C518] text-[#1A1A2E]' :
                          i === 1 ? 'bg-gray-300 dark:bg-slate-500 text-gray-700 dark:text-slate-200' :
                          i === 2 ? 'bg-orange-200 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400' :
                          'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'
                        }`}>
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#1A1A2E] dark:text-slate-200 truncate">
                            {m ? `${m.homeTeam?.short} vs ${m.awayTeam?.short}` : '— vs —'}
                          </p>
                          <p className="text-[10px] text-gray-400 dark:text-slate-500 truncate">{m?.market || 'Match Result'}</p>
                        </div>
                        <span className="text-xs font-black text-green-600 dark:text-green-400 shrink-0">
                          ${m ? (m.prizePool ?? 0).toFixed(0) : '0'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-3.5">
                  <div className="flex items-center gap-1.5 mb-3">
                    <FiUsers className="w-3.5 h-3.5 text-[#1A4D8F]" />
                    <p className="text-[10px] font-black text-[#1A1A2E] dark:text-slate-200 uppercase tracking-widest">Recent Winners</p>
                  </div>
                  <div className="space-y-2.5">
                    {recentWinners.length === 0 ? (
                      <p className="text-xs text-gray-400 dark:text-slate-500">No winners yet</p>
                    ) : recentWinners.map(w => (
                      <div key={w.id} className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#F5C518] to-[#e6a800] flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-black text-[#1A1A2E]">
                            {(w.username || '?')[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#1A1A2E] dark:text-slate-200">{w.username}</p>
                          <p className="text-[10px] text-gray-400 dark:text-slate-500 truncate">{w.market}</p>
                        </div>
                        <span className="text-xs font-black text-[#1A4D8F] dark:text-blue-400 shrink-0">+${(w.prize ?? 0).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </aside>

          </div>
        </div>
      </div>
    </div>
  );
}
