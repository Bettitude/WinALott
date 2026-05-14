import { useState, useMemo } from 'react';
import {
  FiSearch, FiChevronDown, FiChevronUp, FiFilter, FiX,
  FiRadio, FiUsers, FiStar, FiAward, FiZap, FiTrendingUp, FiGift,
} from 'react-icons/fi';
import MatchCard from '../components/ui/MatchCard';
import { useMatches } from '../hooks/useMatches';
import { useLiveFixtures } from '../hooks/useLiveFixtures';
import { useWinners } from '../hooks/useWinners';

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
  { key: 'newest',     label: 'Newest' },
  { key: 'prize_high', label: 'Prize High-Low' },
  { key: 'entry_low',  label: 'Entry Low-High' },
  { key: 'soonest',    label: 'Soonest' },
];

const STATUS_FILTERS = ['Live', 'Upcoming', 'Finished', 'Free'];

function Toggle({ on, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`relative w-8 h-4 rounded-full transition-colors cursor-pointer shrink-0 ${on ? 'bg-[#1A4D8F]' : 'bg-gray-200'}`}
    >
      <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </div>
  );
}

export default function Lobby() {
  const [tierTab, setTierTab]             = useState('all');
  const [search, setSearch]               = useState('');
  const [activeStatuses, setActiveStatuses] = useState(new Set());
  const [sort, setSort]                   = useState('newest');
  const [leagueOpen, setLeagueOpen]       = useState(true);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [page, setPage]                   = useState(1);
  const [filterOpen, setFilterOpen]       = useState(false);
  const [showAllPools, setShowAllPools]   = useState(false);
  const perPage = 12;

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
    setPage(1);
  };

  const filtered = useMemo(() => {
    let list = [...allMatches];

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
        if (activeStatuses.has('Live')     && m.status === 'live')     return true;
        if (activeStatuses.has('Upcoming') && m.status === 'upcoming') return true;
        if (activeStatuses.has('Finished') && m.status === 'finished') return true;
        if (activeStatuses.has('Free')     && m.price  === 0)          return true;
        return false;
      });
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(m =>
        `${m.homeTeam.name} ${m.awayTeam.name} ${m.league} ${m.market}`.toLowerCase().includes(q)
      );
    }

    switch (sort) {
      case 'prize_high': list = [...list].sort((a, b) => b.prizePool - a.prizePool); break;
      case 'entry_low':  list = [...list].sort((a, b) => a.price - b.price);         break;
      case 'soonest':    list = [...list].sort((a, b) => a.time.localeCompare(b.time)); break;
      default: break;
    }

    return list;
  }, [allMatches, tierTab, selectedLeague, activeStatuses, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated  = filtered.slice((page - 1) * perPage, page * perPage);

  const liveCount  = allMatches.filter(m => m.status === 'live').length;
  const totalPool  = allMatches.reduce((sum, m) => sum + m.prizePool, 0);
  const biggestPools = useMemo(() =>
    [...allMatches].sort((a, b) => b.prizePool - a.prizePool).slice(0, 10),
  [allMatches]);

  const hasFilters = activeStatuses.size > 0 || selectedLeague || search.trim();
  const activeFilterCount = activeStatuses.size + (selectedLeague ? 1 : 0) + (sort !== 'newest' ? 1 : 0);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">

      {/* Mobile filter bottom sheet */}
      {filterOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setFilterOpen(false)} />
          <div className="relative bg-white rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-black text-[#1A1A2E]">Filters &amp; Sort</h3>
              <button onClick={() => setFilterOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <FiX className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-5 space-y-6">
              {/* Status filters */}
              <div>
                <p className="text-[10px] font-black text-[#1A1A2E] uppercase tracking-widest mb-3">Status</p>
                <div className="space-y-3">
                  {STATUS_FILTERS.map(s => (
                    <label key={s} className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm font-medium text-gray-600">{s}</span>
                      <Toggle on={activeStatuses.has(s)} onClick={() => toggleStatus(s)} />
                    </label>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <p className="text-[10px] font-black text-[#1A1A2E] uppercase tracking-widest mb-3">Sort by</p>
                <div className="grid grid-cols-2 gap-2">
                  {SORT_OPTIONS.map(o => (
                    <button
                      key={o.key}
                      onClick={() => setSort(o.key)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
                        sort === o.key
                          ? 'bg-[#1A4D8F] text-white'
                          : 'bg-gray-50 text-gray-500 border border-gray-200'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Leagues */}
              <div>
                <p className="text-[10px] font-black text-[#1A1A2E] uppercase tracking-widest mb-3">League</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { setSelectedLeague(null); setPage(1); }}
                    className={`px-3 py-2 rounded-xl text-xs font-medium text-left ${
                      !selectedLeague ? 'bg-blue-50 text-[#1A4D8F] font-bold border border-blue-200' : 'bg-gray-50 text-gray-600 border border-gray-200'
                    }`}
                  >
                    All Leagues
                  </button>
                  {leagues.map((l, i) => (
                    <button
                      key={i}
                      onClick={() => { setSelectedLeague(l); setPage(1); }}
                      className={`px-3 py-2 rounded-xl text-xs font-medium text-left truncate ${
                        selectedLeague === l ? 'bg-blue-50 text-[#1A4D8F] font-bold border border-blue-200' : 'bg-gray-50 text-gray-600 border border-gray-200'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => { setActiveStatuses(new Set()); setSelectedLeague(null); setSort('newest'); setPage(1); }}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:border-gray-300 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => setFilterOpen(false)}
                className="flex-1 py-3 rounded-xl bg-[#1A4D8F] text-white text-sm font-bold hover:bg-[#0D2B5E] transition-colors"
              >
                Show {filtered.length} results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black text-[#1A1A2E] mb-1">The Lobby</h1>
        <p className="text-gray-500 text-sm">Browse all active prediction markets</p>
      </div>

      <div className="flex gap-5 items-start">

        {/* ── Left Sidebar ─────────────────────────────────────────────────── */}
        <aside className="hidden lg:block w-[220px] shrink-0">
          <div className="sticky top-24 flex flex-col gap-4">

            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search matches…"
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F] bg-white"
              />
            </div>

            {/* Status filters */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3.5">
              <p className="text-[10px] font-black text-[#1A1A2E] uppercase tracking-widest mb-3">Filters</p>
              <div className="space-y-2.5">
                {STATUS_FILTERS.map(s => (
                  <label key={s} className="flex items-center justify-between cursor-pointer gap-2">
                    <span className="text-xs font-medium text-gray-600">{s}</span>
                    <Toggle on={activeStatuses.has(s)} onClick={() => toggleStatus(s)} />
                  </label>
                ))}
              </div>
            </div>

            {/* Popular league quick-filters */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3.5">
              <p className="text-[10px] font-black text-[#1A1A2E] uppercase tracking-widest mb-2.5">Popular Leagues</p>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_LEAGUES.filter(l => leagues.includes(l)).map(l => (
                  <button
                    key={l}
                    onClick={() => { setSelectedLeague(selectedLeague === l ? null : l); setPage(1); }}
                    className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                      selectedLeague === l
                        ? 'bg-[#1A4D8F] text-white'
                        : 'bg-gray-50 text-gray-500 border border-gray-200 hover:border-[#1A4D8F] hover:text-[#1A4D8F]'
                    }`}
                  >
                    {l}
                  </button>
                ))}
                {POPULAR_LEAGUES.filter(l => leagues.includes(l)).length === 0 && (
                  <p className="text-[10px] text-gray-400">Leagues load from live data</p>
                )}
              </div>
            </div>

            {/* League accordion */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <button
                onClick={() => setLeagueOpen(v => !v)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 text-[10px] font-black text-[#1A1A2E] uppercase tracking-widest"
              >
                Leagues
                {leagueOpen
                  ? <FiChevronUp className="w-3.5 h-3.5 text-gray-400" />
                  : <FiChevronDown className="w-3.5 h-3.5 text-gray-400" />}
              </button>
              {leagueOpen && (
                <div className="border-t border-gray-100 max-h-56 overflow-y-auto">
                  <button
                    onClick={() => { setSelectedLeague(null); setPage(1); }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-medium transition-colors border-b border-gray-50 ${
                      !selectedLeague
                        ? 'bg-blue-50 text-[#1A4D8F] font-bold'
                        : 'text-gray-600 hover:bg-blue-50 hover:text-[#1A4D8F]'
                    }`}
                  >
                    All Leagues
                  </button>
                  {leagues.map((l, i) => (
                    <button
                      key={i}
                      onClick={() => { setSelectedLeague(l); setPage(1); }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-medium transition-colors border-b border-gray-50 last:border-0 ${
                        selectedLeague === l
                          ? 'bg-blue-50 text-[#1A4D8F] font-bold'
                          : 'text-gray-600 hover:bg-blue-50 hover:text-[#1A4D8F]'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort options */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3.5">
              <p className="text-[10px] font-black text-[#1A1A2E] uppercase tracking-widest mb-2.5">Sort by</p>
              <div className="flex flex-col gap-1">
                {SORT_OPTIONS.map(o => (
                  <button
                    key={o.key}
                    onClick={() => setSort(o.key)}
                    className={`text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      sort === o.key
                        ? 'bg-[#1A4D8F] text-white'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-[#1A4D8F]'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live stats snapshot */}
            <div className="bg-gradient-to-br from-[#0D2B5E] to-[#1A4D8F] rounded-2xl p-3.5 text-white">
              <p className="text-[10px] font-black uppercase tracking-widest mb-3 text-white/60">Live Stats</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/70">Live now</span>
                  <span className="flex items-center gap-1 text-xs font-black">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    {liveCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/70">Total pool</span>
                  <span className="text-xs font-black text-[#F5C518]">${totalPool.toFixed(0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/70">Open markets</span>
                  <span className="text-xs font-black">{allMatches.length}</span>
                </div>
              </div>
            </div>

          </div>
        </aside>

        {/* ── Center Feed ──────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">

          {/* Mobile: search + filter button */}
          <div className="lg:hidden mb-4 flex gap-2">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search matches…"
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F] bg-white"
              />
            </div>
            <button
              onClick={() => setFilterOpen(true)}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-colors shrink-0 ${
                activeFilterCount > 0
                  ? 'bg-[#1A4D8F] text-white border-[#1A4D8F]'
                  : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              <FiFilter className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center text-[10px] font-black">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Tier tabs */}
          <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide pb-0.5">
            {TIER_TABS.map(t => {
              const active = tierTab === t.key;
              const count  = t.key === 'all'
                ? allMatches.length
                : t.key === 'free'
                  ? allMatches.filter(m => m.price === 0).length
                  : allMatches.filter(m => m.tier === t.key).length;
              return (
                <button
                  key={t.key}
                  onClick={() => { setTierTab(t.key); setPage(1); }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-black whitespace-nowrap transition-all ${
                    active
                      ? `${t.activeBg} ${t.activeText} shadow-md`
                      : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {t.Icon && <t.Icon className="w-3.5 h-3.5" />}
                  {t.label}
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    active ? 'bg-white/20' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Results bar */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-gray-400 font-medium">
              {filtered.length} market{filtered.length !== 1 ? 's' : ''} found
            </p>
            {hasFilters && (
              <button
                onClick={() => { setActiveStatuses(new Set()); setSelectedLeague(null); setSearch(''); setPage(1); }}
                className="text-xs text-[#1A4D8F] font-semibold hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Grid */}
          {paginated.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
              {paginated.map(m => <MatchCard key={m.id} match={m} />)}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <FiFilter className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No matches found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 mt-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-[#1A4D8F] hover:text-[#1A4D8F] disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-white"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                  p === page
                    ? 'bg-[#1A4D8F] text-white shadow-sm'
                    : 'border border-gray-200 bg-white text-gray-600 hover:border-[#1A4D8F] hover:text-[#1A4D8F]'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-[#1A4D8F] hover:text-[#1A4D8F] disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-white"
            >
              Next
            </button>
          </div>

        </div>

        {/* ── Right Sidebar ─────────────────────────────────────────────────── */}
        <aside className="hidden xl:block w-[260px] shrink-0">
          <div className="sticky top-24 flex flex-col gap-4">

            {/* Live scores ticker */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-3.5 py-2.5 bg-red-500">
                <FiRadio className="w-3.5 h-3.5 text-white animate-pulse" />
                <span className="text-xs font-black text-white uppercase tracking-wide">Live Scores</span>
              </div>
              <div className="divide-y divide-gray-50 max-h-48 overflow-y-auto">
                {liveOnly.length === 0 ? (
                  <p className="text-xs text-gray-400 px-3.5 py-3">No live matches right now</p>
                ) : liveOnly.map(f => (
                  <div key={f.id} className="flex items-center gap-2 px-3.5 py-2">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full shrink-0 animate-pulse" />
                    <span className="text-xs text-gray-600 font-medium truncate">
                      {f.homeTeam.name} {f.score.home ?? 0} - {f.score.away ?? 0} {f.awayTeam.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Biggest pools */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3.5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <FiTrendingUp className="w-3.5 h-3.5 text-[#1A4D8F]" />
                  <p className="text-[10px] font-black text-[#1A1A2E] uppercase tracking-widest">Biggest Pools</p>
                </div>
                <span className="text-[10px] text-gray-400">Top {showAllPools ? 10 : 5}</span>
              </div>
              <div className="space-y-2.5">
                {(showAllPools ? biggestPools : biggestPools.slice(0, 5)).map((m, i) => (
                  <div key={m.id} className="flex items-center gap-2">
                    <span className={`w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-[10px] font-black ${
                      i === 0 ? 'bg-[#F5C518] text-[#1A1A2E]' :
                      i === 1 ? 'bg-gray-300 text-gray-700' :
                      i === 2 ? 'bg-orange-200 text-orange-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#1A1A2E] truncate">
                        {m.homeTeam.short} vs {m.awayTeam.short}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate">{m.market}</p>
                    </div>
                    <span className="text-xs font-black text-green-600 shrink-0">${m.prizePool.toFixed(0)}</span>
                  </div>
                ))}
              </div>
              {biggestPools.length > 5 && (
                <button
                  onClick={() => setShowAllPools(v => !v)}
                  className="w-full mt-3 py-1.5 rounded-xl border border-gray-200 text-[10px] font-bold text-[#1A4D8F] hover:bg-blue-50 transition-colors"
                >
                  {showAllPools ? 'Show less' : `See all top 10`}
                </button>
              )}
            </div>

            {/* Recent winners */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3.5">
              <div className="flex items-center gap-1.5 mb-3">
                <FiUsers className="w-3.5 h-3.5 text-[#1A4D8F]" />
                <p className="text-[10px] font-black text-[#1A1A2E] uppercase tracking-widest">Recent Winners</p>
              </div>
              <div className="space-y-2.5">
                {recentWinners.length === 0 ? (
                  <p className="text-xs text-gray-400">No winners yet</p>
                ) : recentWinners.map(w => (
                  <div key={w.id} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#F5C518] to-[#e6a800] flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-black text-[#1A1A2E]">
                        {(w.username || '?')[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#1A1A2E]">{w.username}</p>
                      <p className="text-[10px] text-gray-400 truncate">{w.market}</p>
                    </div>
                    <span className="text-xs font-black text-[#1A4D8F] shrink-0">+${w.prize.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </aside>

      </div>
    </div>
  );
}
