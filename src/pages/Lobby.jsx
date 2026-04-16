import { useState } from 'react';
import { FiSearch, FiChevronDown, FiFilter } from 'react-icons/fi';
import MatchCard from '../components/ui/MatchCard';
import AdBanner from '../components/ui/AdBanner';
import NewsCard from '../components/ui/NewsCard';
import { mockMatches, leagueStandings, newsHeadlines, leaguesList } from '../data/mockData';

const tabs = ['All', 'Live', 'Upcoming', 'Finished'];
const markets = ['All Markets', 'Corners', 'Total Cards', 'Goals', 'Shots', 'BTTS', 'Penalty', 'Fouls'];

export default function Lobby() {
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [market, setMarket] = useState('All Markets');
  const [page, setPage] = useState(1);
  const perPage = 12;

  const filtered = mockMatches.filter(m => {
    if (activeTab === 'Live' && m.status !== 'live') return false;
    if (activeTab === 'Upcoming' && m.status !== 'upcoming') return false;
    if (activeTab === 'Finished' && m.status !== 'finished') return false;
    if (market !== 'All Markets' && !m.marketTag.toLowerCase().includes(market.toLowerCase())) return false;
    if (search && !`${m.homeTeam.name} ${m.awayTeam.name} ${m.league}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[#1A1A2E] mb-1">The Lobby</h1>
        <p className="text-gray-500">Browse all active prediction markets</p>
      </div>

      <div className="flex gap-6">
        {/* Left sidebar */}
        <aside className="hidden lg:block w-52 shrink-0 space-y-4">
          <div>
            <h3 className="font-bold text-sm text-[#1A1A2E] mb-3 uppercase tracking-wide">Leagues</h3>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {leaguesList.slice(0, 8).map((l, i) => (
                <button key={i}
                  className="w-full text-left px-3 py-2.5 text-xs font-medium text-gray-600 hover:bg-blue-50 hover:text-[#1A4D8F] border-b border-gray-50 last:border-0 transition-colors">
                  {l.name}
                </button>
              ))}
            </div>
          </div>
          <AdBanner size="square" />
        </aside>

        {/* Center */}
        <div className="flex-1 min-w-0">
          {/* Tabs */}
          <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide pb-1">
            {tabs.map(t => (
              <button
                key={t}
                onClick={() => { setActiveTab(t); setPage(1); }}
                className={`px-5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                  activeTab === t
                    ? 'bg-[#1A4D8F] text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-[#1A4D8F] hover:text-[#1A4D8F]'
                }`}
              >
                {t}
                {t === 'Live' && (
                  <span className="ml-1.5 w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-pulse" />
                )}
              </button>
            ))}
          </div>

          {/* Filter bar */}
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search teams, leagues…"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F] bg-white"
              />
            </div>
            <div className="relative">
              <select
                value={market}
                onChange={e => { setMarket(e.target.value); setPage(1); }}
                className="appearance-none pl-4 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F] bg-white cursor-pointer"
              >
                {markets.map(m => <option key={m}>{m}</option>)}
              </select>
              <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Grid */}
          {paginated.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
              {paginated.map(m => <MatchCard key={m.id} match={m} />)}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <FiFilter className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">No matches found</p>
              <p className="text-gray-300 text-sm">Try adjusting your filters</p>
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

            {Array.from({ length: Math.max(totalPages, 1) }, (_, i) => i + 1).map(p => (
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
              onClick={() => setPage(p => Math.min(Math.max(totalPages, 1), p + 1))}
              disabled={page >= Math.max(totalPages, 1)}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-[#1A4D8F] hover:text-[#1A4D8F] disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-white"
            >
              Next
            </button>
          </div>
        </div>

        {/* Right sidebar */}
        <aside className="hidden xl:block w-56 shrink-0 space-y-4">
          {/* League Standings */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <h3 className="font-bold text-sm text-[#1A1A2E] mb-3">Premier League</h3>
            <div className="space-y-1">
              <div className="grid grid-cols-4 text-xs text-gray-400 font-medium pb-1 border-b border-gray-100">
                <span>#</span><span className="col-span-2">Team</span><span className="text-right">Pts</span>
              </div>
              {leagueStandings.map(row => (
                <div key={row.pos} className="grid grid-cols-4 text-xs py-0.5 items-center">
                  <span className="text-gray-400">{row.pos}</span>
                  <span className="col-span-2 text-gray-700 font-medium truncate">{row.team}</span>
                  <span className="text-right font-bold text-[#1A4D8F]">{row.points}</span>
                </div>
              ))}
            </div>
          </div>

          <AdBanner size="square" />

          {/* News */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-[#1A1A2E]">Latest News</h3>
            {newsHeadlines.map(n => <NewsCard key={n.id} item={n} />)}
          </div>
        </aside>
      </div>
    </div>
  );
}
