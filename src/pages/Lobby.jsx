import { useState, useMemo } from 'react';
import {
  FiSearch, FiChevronDown, FiChevronUp, FiFilter,
  FiRadio, FiUsers, FiStar, FiAward, FiZap, FiTrendingUp,
} from 'react-icons/fi';
import MatchCard from '../components/ui/MatchCard';
import { mockMatches, leaguesList, tickerScores, recentWinners } from '../data/mockData';

const TIER_TABS = [
  { key: 'all',      label: 'All',      Icon: null,   activeBg: 'bg-[#1A4D8F]',   activeText: 'text-white' },
  { key: 'silver',   label: 'Silver',   Icon: FiStar, activeBg: 'bg-gray-500',    activeText: 'text-white' },
  { key: 'gold',     label: 'Gold',     Icon: FiAward,activeBg: 'bg-[#F5C518]',   activeText: 'text-[#1A1A2E]' },
  { key: 'platinum', label: 'Platinum', Icon: FiZap,  activeBg: 'bg-purple-600',  activeText: 'text-white' },
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
  const perPage = 12;

  const toggleStatus = (s) => {
    setActiveStatuses(prev => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s); else next.add(s);
      return next;
    });
    setPage(1);
  };

  const filtered = useMemo(() => {
    let list = [...mockMatches];

    if (tierTab !== 'all') list = list.filter(m => m.tier === tierTab);
    if (selectedLeague)    list = list.filter(m => m.league === selectedLeague);

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
  }, [tierTab, selectedLeague, activeStatuses, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated  = filtered.slice((page - 1) * perPage, page * perPage);

  const liveCount  = mockMatches.filter(m => m.status === 'live').length;
  const totalPool  = mockMatches.reduce((sum, m) => sum + m.prizePool, 0);
  const biggestPools = useMemo(() =>
    [...mockMatches].sort((a, b) => b.prizePool - a.prizePool).slice(0, 5),
  []);

  const hasFilters = activeStatuses.size > 0 || selectedLeague || search.trim();

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
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
                  {leaguesList.map((l, i) => (
                    <button
                      key={i}
                      onClick={() => { setSelectedLeague(l.name); setPage(1); }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-medium transition-colors border-b border-gray-50 last:border-0 ${
                        selectedLeague === l.name
                          ? 'bg-blue-50 text-[#1A4D8F] font-bold'
                          : 'text-gray-600 hover:bg-blue-50 hover:text-[#1A4D8F]'
                      }`}
                    >
                      {l.name}
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
                  <span className="text-xs font-black">{mockMatches.length}</span>
                </div>
              </div>
            </div>

          </div>
        </aside>

        {/* ── Center Feed ──────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">

          {/* Tier tabs */}
          <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide pb-0.5">
            {TIER_TABS.map(t => {
              const active = tierTab === t.key;
              const count  = t.key === 'all'
                ? mockMatches.length
                : mockMatches.filter(m => m.tier === t.key).length;
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
                {tickerScores.map((score, i) => (
                  <div key={i} className="flex items-center gap-2 px-3.5 py-2">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full shrink-0 animate-pulse" />
                    <span className="text-xs text-gray-600 font-medium">{score}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Biggest pools */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3.5">
              <div className="flex items-center gap-1.5 mb-3">
                <FiTrendingUp className="w-3.5 h-3.5 text-[#1A4D8F]" />
                <p className="text-[10px] font-black text-[#1A1A2E] uppercase tracking-widest">Biggest Pools</p>
              </div>
              <div className="space-y-2.5">
                {biggestPools.map((m, i) => (
                  <div key={m.id} className="flex items-center gap-2">
                    <span className="w-5 h-5 shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-500">
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
            </div>

            {/* Recent winners */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3.5">
              <div className="flex items-center gap-1.5 mb-3">
                <FiUsers className="w-3.5 h-3.5 text-[#1A4D8F]" />
                <p className="text-[10px] font-black text-[#1A1A2E] uppercase tracking-widest">Recent Winners</p>
              </div>
              <div className="space-y-2.5">
                {recentWinners.slice(0, 5).map(w => (
                  <div key={w.id} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#F5C518] to-[#e6a800] flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-black text-[#1A1A2E]">
                        {w.username[0].toUpperCase()}
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
