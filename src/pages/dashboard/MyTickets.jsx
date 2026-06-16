import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FiCheckCircle, FiXCircle, FiClock, FiTrendingUp, FiRefreshCw,
  FiChevronLeft, FiChevronRight, FiCalendar, FiAlertCircle,
} from 'react-icons/fi';
import { useTickets } from '../../hooks/useTickets';
import { useAuth } from '../../hooks/useAuth';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAYS_SHORT = ['Su','Mo','Tu','We','Th','Fr','Sa'];

const STATUS_FILTERS = ['All', 'Wins', 'Losses', 'Pending', 'Refunds'];

const QUICK_RANGES = [
  { label: 'Last 7 days',   days: 7   },
  { label: 'Last 30 days',  days: 30  },
  { label: 'Last 3 months', days: 90  },
  { label: 'Last year',     days: 365 },
  { label: 'All time',      days: null },
];

function ticketDateISO(t) {
  if (t._raw?.created_at) return t._raw.created_at.slice(0, 10);
  try {
    const d = new Date(t.date);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  } catch {}
  return new Date().toISOString().slice(0, 10);
}

// ── Mini Calendar (Google Calendar style) ─────────────────────────────────
function MiniCalendar({ year, month, stakeDays, selectedDay, onSelectDay, onChangeMonth }) {
  const todayISO = new Date().toISOString().slice(0, 10);
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const now = new Date();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
  const minYear = now.getFullYear() - 2;
  const isOldestMonth = year === minYear && month === now.getMonth();

  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-4">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => onChangeMonth(-1)}
          disabled={isOldestMonth}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-30"
        >
          <FiChevronLeft className="w-4 h-4 text-gray-500 dark:text-slate-400" />
        </button>
        <span className="text-sm font-black text-[#1A1A2E] dark:text-white">{MONTHS[month]} {year}</span>
        <button
          onClick={() => onChangeMonth(1)}
          disabled={isCurrentMonth}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-30"
        >
          <FiChevronRight className="w-4 h-4 text-gray-500 dark:text-slate-400" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-0.5">
        {DAYS_SHORT.map(d => (
          <span key={d} className="text-center text-[9px] text-gray-400 dark:text-slate-500 font-bold py-1">{d}</span>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} className="h-9" />;
          const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isSelected = selectedDay === iso;
          const isToday = iso === todayISO;
          const statuses = stakeDays[iso] || [];
          const hasStake = statuses.length > 0;
          const hasWin     = statuses.some(s => s === 'won');
          const hasLoss    = statuses.some(s => s === 'lost');
          const hasPending = statuses.some(s => s === 'pending' || s === 'active');

          return (
            <button
              key={iso}
              onClick={() => hasStake || isToday ? onSelectDay(isSelected ? null : iso) : undefined}
              className={`flex flex-col items-center justify-start py-1 h-9 rounded-lg transition-all ${
                isSelected
                  ? 'bg-[#1A4D8F] text-white'
                  : isToday
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-[#1A4D8F] dark:text-blue-400'
                  : hasStake
                  ? 'hover:bg-gray-50 dark:hover:bg-slate-700 text-[#1A1A2E] dark:text-slate-200 cursor-pointer'
                  : 'text-gray-300 dark:text-slate-700 cursor-default'
              }`}
            >
              <span className={`text-[11px] leading-none ${isSelected || isToday ? 'font-black' : hasStake ? 'font-bold' : 'font-medium'}`}>
                {day}
              </span>
              {hasStake && !isSelected && (
                <div className="flex gap-0.5 mt-0.5">
                  {hasWin     && <span className="w-1 h-1 rounded-full bg-green-500" />}
                  {hasLoss    && <span className="w-1 h-1 rounded-full bg-red-400" />}
                  {hasPending && <span className="w-1 h-1 rounded-full bg-blue-400" />}
                </div>
              )}
              {hasStake && isSelected && (
                <span className="w-1 h-1 rounded-full bg-white/70 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-slate-700 flex-wrap">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          <span className="text-[9px] text-gray-400 dark:text-slate-500">Win</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
          <span className="text-[9px] text-gray-400 dark:text-slate-500">Loss</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          <span className="text-[9px] text-gray-400 dark:text-slate-500">Pending</span>
        </div>
      </div>
    </div>
  );
}

// ── Ticket card ───────────────────────────────────────────────────────────
function HistoryCard({ ticket }) {
  const isWin     = ticket.status === 'won';
  const isLoss    = ticket.status === 'lost';
  const isPending = ticket.status === 'pending' || ticket.status === 'active';
  const netChange = isWin
    ? (ticket.prize ?? 0) - (ticket.entryFee ?? 0)
    : isLoss ? -(ticket.entryFee ?? 0) : 0;

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl border shadow-sm p-4 transition-shadow hover:shadow-md ${
      isWin     ? 'border-green-200 dark:border-green-800' :
      isLoss    ? 'border-red-200 dark:border-red-800' :
      isPending ? 'border-blue-100 dark:border-blue-900' :
                  'border-gray-200 dark:border-slate-700'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {isWin ? (
              <span className="flex items-center gap-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-green-200 dark:border-green-700">
                <FiCheckCircle className="w-2.5 h-2.5" /> WON
              </span>
            ) : isLoss ? (
              <span className="flex items-center gap-1 bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-red-200 dark:border-red-700">
                <FiXCircle className="w-2.5 h-2.5" /> LOST
              </span>
            ) : isPending ? (
              <span className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 text-[#1A4D8F] dark:text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                <FiClock className="w-2.5 h-2.5" /> PENDING
              </span>
            ) : (
              <span className="flex items-center gap-1 bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-gray-200 dark:border-slate-600">
                <FiRefreshCw className="w-2.5 h-2.5" /> REFUNDED
              </span>
            )}
            <p className="text-sm font-bold text-[#1A1A2E] dark:text-white truncate">{ticket.match}</p>
          </div>
          <p className="text-xs text-gray-400 dark:text-slate-500">{ticket.market}</p>
          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-slate-400 flex-wrap">
            <span>Pick: <strong className="text-[#1A1A2E] dark:text-white">{ticket.myPick}</strong></span>
            {ticket.adminPick && ticket.adminPick !== '—' && (
              <span>Correct: <strong className="text-[#1A1A2E] dark:text-white">{ticket.adminPick}</strong></span>
            )}
          </div>
          <p className="text-[10px] text-gray-400 dark:text-slate-500 font-mono mt-1">
            {ticket.ticketNumber} · {ticket.date}
          </p>
        </div>

        <div className="text-right shrink-0">
          <p className={`text-sm font-black ${
            netChange > 0  ? 'text-green-600 dark:text-green-400' :
            netChange < 0  ? 'text-red-500 dark:text-red-400' :
            isPending      ? 'text-[#1A4D8F] dark:text-blue-400' :
                             'text-gray-400 dark:text-slate-500'
          }`}>
            {netChange > 0
              ? `+$${netChange.toFixed(2)}`
              : netChange < 0
              ? `-$${Math.abs(netChange).toFixed(2)}`
              : `$${(ticket.entryFee ?? 0).toFixed(2)}`}
          </p>
          <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">
            {isPending ? 'staked' : netChange > 0 ? 'won' : netChange < 0 ? 'lost' : 'entry'}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────
export default function MyHistory() {
  const { user } = useAuth();
  const now = new Date();

  const [calYear,      setCalYear]      = useState(now.getFullYear());
  const [calMonth,     setCalMonth]     = useState(now.getMonth());
  const [selectedDay,  setSelectedDay]  = useState(null);
  const [rangePreset,  setRangePreset]  = useState(30);
  const [statusFilter, setStatusFilter] = useState('All');
  const [showCal,      setShowCal]      = useState(false);

  const { tickets, loading, error } = useTickets({ limit: 500 });

  const localStakes = useMemo(() => {
    if (!user?.id) return [];
    try { return JSON.parse(localStorage.getItem(`winalot_stakes_${user.id}`) || '[]'); }
    catch { return []; }
  }, [user?.id]);

  const allTickets = useMemo(() => {
    const apiNums = new Set(tickets.map(t => t.ticketNumber));
    return [...tickets, ...localStakes.filter(t => !apiNums.has(t.ticketNumber))];
  }, [tickets, localStakes]);

  // Map "YYYY-MM-DD" → [statuses] — powers the dot indicators
  const stakeDays = useMemo(() => {
    const map = {};
    allTickets.forEach(t => {
      const iso = ticketDateISO(t);
      if (!map[iso]) map[iso] = [];
      map[iso].push(t.status);
    });
    return map;
  }, [allTickets]);

  // Date-range filter
  const dateFiltered = useMemo(() => {
    if (selectedDay) return allTickets.filter(t => ticketDateISO(t) === selectedDay);
    if (rangePreset === null) return allTickets;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - rangePreset);
    const cutoffISO = cutoff.toISOString().slice(0, 10);
    return allTickets.filter(t => ticketDateISO(t) >= cutoffISO);
  }, [allTickets, selectedDay, rangePreset]);

  // Status filter
  const filtered = useMemo(() => {
    if (statusFilter === 'Wins')    return dateFiltered.filter(t => t.status === 'won');
    if (statusFilter === 'Losses')  return dateFiltered.filter(t => t.status === 'lost');
    if (statusFilter === 'Pending') return dateFiltered.filter(t => t.status === 'pending' || t.status === 'active');
    if (statusFilter === 'Refunds') return dateFiltered.filter(t => t.status === 'voided');
    return dateFiltered;
  }, [dateFiltered, statusFilter]);

  // Period stats
  const wins       = filtered.filter(t => t.status === 'won').length;
  const losses     = filtered.filter(t => t.status === 'lost').length;
  const totalWon   = filtered.reduce((s, t) => s + (t.prize || 0), 0);
  const totalSpent = filtered.reduce((s, t) => s + (t.entryFee || 0), 0);
  const net        = totalWon - totalSpent;

  const changeMonth = (dir) => {
    let m = calMonth + dir;
    let y = calYear;
    if (m < 0)  { m = 11; y--; }
    if (m > 11) { m = 0;  y++; }
    setCalYear(y);
    setCalMonth(m);
  };

  const handleSelectDay = (iso) => {
    setSelectedDay(iso);
    if (iso) setRangePreset(null);
  };

  const handleRangePreset = (days) => {
    setSelectedDay(null);
    setRangePreset(days);
    // Navigate calendar to current month when clearing a day selection
    setCalYear(now.getFullYear());
    setCalMonth(now.getMonth());
  };

  const rangeLabel = selectedDay
    ? new Date(selectedDay + 'T12:00:00').toLocaleDateString(undefined, {
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
      })
    : rangePreset === null
    ? 'All time'
    : `Last ${rangePreset} day${rangePreset !== 1 ? 's' : ''}`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-[#1A1A2E] dark:text-white">My History</h1>
          <p className="text-gray-400 dark:text-slate-500 text-sm">{rangeLabel}</p>
        </div>
        <Link to="/lobby" className="bg-[#1A4D8F] text-white font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-[#0D2B5E] transition-colors">
          + Enter New Match
        </Link>
      </div>

      {/* Quick range filters + mobile calendar toggle */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {QUICK_RANGES.map(r => (
          <button
            key={r.label}
            onClick={() => handleRangePreset(r.days)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              !selectedDay && rangePreset === r.days
                ? 'bg-[#1A4D8F] text-white'
                : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:border-[#1A4D8F] hover:text-[#1A4D8F]'
            }`}
          >
            {r.label}
          </button>
        ))}
        <button
          onClick={() => setShowCal(v => !v)}
          className="ml-auto lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400"
        >
          <FiCalendar className="w-3.5 h-3.5" />
          Calendar {showCal ? '▲' : '▼'}
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        {[
          { label: 'Total Stakes', value: filtered.length,   color: 'text-[#1A4D8F] dark:text-blue-400'  },
          { label: 'Wins',         value: wins,              color: 'text-green-600 dark:text-green-400'  },
          { label: 'Losses',       value: losses,            color: 'text-red-500 dark:text-red-400'      },
          {
            label: 'Net',
            value: `${net >= 0 ? '+' : ''}$${Math.abs(net).toFixed(2)}`,
            color: net >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400',
          },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-3">
            <p className={`text-lg font-black tabular-nums ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-gray-400 dark:text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Main 2-col layout */}
      <div className="lg:grid lg:grid-cols-[272px_1fr] lg:gap-5 lg:items-start">

        {/* Left: Calendar + Status filter */}
        <div className={`mb-4 lg:mb-0 lg:sticky lg:top-24 space-y-3 ${showCal ? 'block' : 'hidden lg:block'}`}>
          <MiniCalendar
            year={calYear}
            month={calMonth}
            stakeDays={stakeDays}
            selectedDay={selectedDay}
            onSelectDay={handleSelectDay}
            onChangeMonth={changeMonth}
          />

          {/* Status filter panel */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-3">
            <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Filter by Status
            </p>
            <div className="flex flex-col gap-0.5">
              {STATUS_FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold text-left transition-all ${
                    statusFilter === f
                      ? 'bg-[#1A4D8F] text-white'
                      : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Ticket list */}
        <div>
          {/* Selected day banner */}
          {selectedDay && (
            <div className="flex items-center justify-between bg-[#1A4D8F]/10 dark:bg-blue-900/20 border border-[#1A4D8F]/20 dark:border-blue-800 rounded-xl px-4 py-2.5 mb-4">
              <div className="flex items-center gap-2">
                <FiCalendar className="w-4 h-4 text-[#1A4D8F] dark:text-blue-400" />
                <span className="text-sm font-bold text-[#1A4D8F] dark:text-blue-400">{rangeLabel}</span>
                <span className="text-xs text-gray-400 dark:text-slate-500">
                  · {filtered.length} stake{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>
              <button
                onClick={() => { setSelectedDay(null); setRangePreset(30); }}
                className="text-xs text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 font-medium"
              >
                Clear ×
              </button>
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="h-24 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
              <FiAlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-sm font-bold text-red-600 dark:text-red-400">Could not load history</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 text-center py-16">
              <FiCalendar className="w-10 h-10 text-gray-200 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-slate-400 font-medium">No stakes in this period</p>
              <p className="text-gray-400 dark:text-slate-500 text-xs mt-1">
                {selectedDay ? 'Try a different date' : 'Widen your time range'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(t => <HistoryCard key={t.id} ticket={t} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
