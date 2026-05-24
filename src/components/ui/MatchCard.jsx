import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUsers, FiZap, FiAward, FiStar, FiClock, FiCheckCircle,
         FiTrendingUp, FiAlertCircle } from 'react-icons/fi';
import TeamAvatar from './TeamAvatar';
import StakeModal from './StakeModal';
import { useCart } from '../../hooks/useCart';
import { formatBTP } from '../../utils/btp';

const TIER = {
  silver: {
    label: 'Silver',
    Icon: FiStar,
    border: 'border-l-gray-400',
    badge: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white',
    bar: 'bg-gray-400',
    btnBg: 'bg-gray-500 hover:bg-gray-600',
    accentText: 'text-gray-500',
  },
  gold: {
    label: 'Gold',
    Icon: FiAward,
    border: 'border-l-[#F5C518]',
    badge: 'bg-gradient-to-r from-[#F5C518] to-[#e6a800] text-[#1A1A2E]',
    bar: 'bg-[#F5C518]',
    btnBg: 'bg-[#1A4D8F] hover:bg-[#0D2B5E]',
    accentText: 'text-[#d97706]',
  },
  platinum: {
    label: 'Platinum',
    Icon: FiZap,
    border: 'border-l-purple-600',
    badge: 'bg-gradient-to-r from-purple-600 to-violet-500 text-white',
    bar: 'bg-purple-500',
    btnBg: 'bg-purple-600 hover:bg-purple-700',
    accentText: 'text-purple-600',
  },
};

export default function MatchCard({ match, loading = false, homeMode = false }) {
  const navigate = useNavigate();
  const { items } = useCart();
  const [modalOpen, setModalOpen] = useState(false);
  const inCart = items.some(i => i.matchId === match?.id);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-md overflow-hidden">
        <div className="h-1.5 bg-gray-100 dark:bg-slate-700" />
        <div className="p-4 space-y-3">
          <div className="flex justify-between">
            <div className="skeleton h-5 w-20 rounded-full" />
            <div className="skeleton h-5 w-16 rounded-full" />
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="skeleton w-10 h-10 rounded-full shrink-0" />
            <div className="skeleton h-4 w-16" />
            <div className="skeleton w-10 h-10 rounded-full shrink-0" />
          </div>
          <div className="skeleton h-14 rounded-xl" />
          <div className="skeleton h-10 rounded-xl" />
        </div>
      </div>
    );
  }

  const tier       = TIER[match.tier] || TIER.silver;
  const TierIcon   = tier.Icon;
  const isLive     = match.status === 'live';
  const isFree     = match.price === 0;
  const isPlatinum = match.tier === 'platinum';

  const isHot       = (match.fillPercent ?? 0) > 50;
  const closesMs    = new Date(`${match.date}T${match.time}:00`).getTime() - Date.now();
  const closesMin   = Math.floor(closesMs / 60000);
  const closingSoon = closesMin > 0 && closesMin < 15;
  const almostFull  = (match.fillPercent ?? 0) >= 80;
  const ticketsLeft = Math.max(0, Math.round(100 * (1 - (match.fillPercent ?? 0) / 100)));

  const openStakeModal  = (e) => { e.stopPropagation(); setModalOpen(true); };
  const handleCardClick = () => navigate(`/match/${match.id}`);

  const openTeamPage = (side, e) => {
    e.stopPropagation();
    navigate(`/match/${match.id}/team/${side}`);
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className={`bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-md card-hover flex flex-col overflow-hidden border-l-4 ${tier.border} cursor-pointer`}
      >
        {/* ── Header row ───────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-3 sm:px-4 pt-3 sm:pt-3.5 pb-1.5 sm:pb-2">
          <div className="flex items-center gap-1 flex-wrap">
            <span className={`inline-flex items-center gap-1 text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full ${tier.badge}`}>
              <TierIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              {tier.label}
            </span>
            {isPlatinum && (
              <span className="text-[9px] sm:text-[10px] font-black text-purple-600 bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 px-1.5 py-0.5 rounded-full">
                HIGH ROLLER
              </span>
            )}
            {!homeMode && isHot && !closingSoon && (
              <span className="hidden sm:inline-flex items-center gap-1 text-xs font-black text-orange-600 bg-orange-50 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-800 px-2 py-0.5 rounded-full">
                <FiTrendingUp className="w-3 h-3" /> HOT
              </span>
            )}
            {!homeMode && closingSoon && (
              <span className="inline-flex items-center gap-1 text-[9px] sm:text-xs font-black text-amber-600 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-1.5 sm:px-2 py-0.5 rounded-full">
                <FiClock className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> SOON
              </span>
            )}
          </div>

          {isLive ? (
            <span className="flex items-center gap-1 bg-red-500 text-white text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full shrink-0">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              LIVE {match.minute}
            </span>
          ) : match.status === 'finished' ? (
            <span className="flex items-center gap-1 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full shrink-0">
              <FiCheckCircle className="w-2.5 h-2.5" /> FT
            </span>
          ) : (
            <span className="flex items-center gap-1 text-gray-500 dark:text-slate-400 text-[9px] sm:text-[10px] font-semibold bg-gray-50 dark:bg-slate-700 px-1.5 sm:px-2 py-0.5 rounded-full shrink-0">
              <FiClock className="w-2.5 h-2.5" /> {match.time}
            </span>
          )}
        </div>

        <div className="px-3 sm:px-4 pb-3 sm:pb-4 flex flex-col flex-1">
          {/* League */}
          <p className="text-[10px] text-gray-400 dark:text-slate-500 font-medium mb-2 truncate">{match.league}</p>

          {/* ── Teams row ────────────────────────────────────────────── */}
          <div className="flex items-center justify-between gap-1 mb-3">
            {/* Home */}
            <button
              onClick={(e) => openTeamPage('home', e)}
              className="flex flex-col items-center gap-1 flex-1 min-w-0 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 px-1 py-1 transition-colors"
              title={`View ${match.homeTeam.name} stats`}
            >
              <TeamAvatar short={match.homeTeam.short} logo={match.homeTeam.logo} size={homeMode ? 'sm' : 'md'} />
              <p className="text-[10px] sm:text-xs font-bold text-[#1A1A2E] dark:text-slate-200 text-center leading-tight truncate w-full">
                {match.homeTeam.name}
              </p>
            </button>

            {/* Score or VS */}
            <div className="shrink-0 px-1 text-center">
              {isLive ? (
                <div className="bg-red-50 dark:bg-red-950/50 border border-red-100 dark:border-red-800 rounded-xl px-2 py-1">
                  <span className={`${homeMode ? 'text-sm' : 'text-base sm:text-lg'} font-black text-red-600 dark:text-red-400 tabular-nums`}>
                    {match.score?.home} - {match.score?.away}
                  </span>
                </div>
              ) : (
                <span className="text-xs font-black text-gray-300 dark:text-slate-600">VS</span>
              )}
            </div>

            {/* Away */}
            <button
              onClick={(e) => openTeamPage('away', e)}
              className="flex flex-col items-center gap-1 flex-1 min-w-0 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 px-1 py-1 transition-colors"
              title={`View ${match.awayTeam.name} stats`}
            >
              <TeamAvatar short={match.awayTeam.short} logo={match.awayTeam.logo} size={homeMode ? 'sm' : 'md'} />
              <p className="text-[10px] sm:text-xs font-bold text-[#1A1A2E] dark:text-slate-200 text-center leading-tight truncate w-full">
                {match.awayTeam.name}
              </p>
            </button>
          </div>

          {/* ── Market + Pick ─────────────────────────────────────────── */}
          <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 rounded-xl px-3 py-2 mb-3">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] text-gray-400 dark:text-slate-500 leading-none mb-0.5">Market</p>
                <p className="text-xs font-bold text-[#1A4D8F] dark:text-blue-400 truncate">{match.market}</p>
              </div>
              {match.adminPick && (
                <div className="shrink-0 text-right">
                  <p className="text-[10px] text-gray-400 dark:text-slate-500 leading-none mb-0.5">Pick</p>
                  <p className="text-xs font-bold text-[#1A1A2E] dark:text-slate-200">{match.adminPick}</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Stats grid ────────────────────────────────────────────── */}
          <div className="grid grid-cols-3 gap-1.5 mb-3">
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl px-2 py-1.5 text-center">
              <p className="text-[9px] sm:text-[10px] text-gray-400 dark:text-slate-500 leading-none mb-0.5">Pool</p>
              <p className="text-xs sm:text-sm font-black text-[#1A1A2E] dark:text-slate-100 tabular-nums truncate">
                {formatBTP(match.prizePool)}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl px-2 py-1.5 text-center">
              <p className="text-[9px] sm:text-[10px] text-gray-400 dark:text-slate-500 leading-none mb-0.5">Entry Fee</p>
              <p className={`text-xs sm:text-sm font-black tabular-nums truncate ${tier.accentText}`}>
                {isFree ? 'FREE' : formatBTP(match.price)}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl px-2 py-1.5 text-center">
              <p className="text-[9px] sm:text-[10px] text-gray-400 dark:text-slate-500 leading-none mb-0.5">Winners</p>
              <p className="text-xs sm:text-sm font-black text-[#1A1A2E] dark:text-slate-100 flex items-center justify-center gap-0.5">
                <FiUsers className="w-2.5 h-2.5 sm:w-3 sm:h-3" />{match.maxWinners}
              </p>
            </div>
          </div>

          {/* Micro-detail (lobby only) */}
          {!homeMode && almostFull && (
            <div className="flex items-center gap-1 text-[10px] text-orange-500 font-bold mb-2">
              <FiAlertCircle className="w-3 h-3" />{ticketsLeft} tickets left
            </div>
          )}

          {/* ── Pool fill bar ──────────────────────────────────────────── */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-[10px] text-gray-400 dark:text-slate-500 mb-1">
              <span>Pool {match.fillPercent ?? 0}% full</span>
              {!homeMode && <span className="text-gray-300 dark:text-slate-600">Click card for details</span>}
            </div>
            <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${tier.bar}`}
                style={{ width: `${match.fillPercent ?? 0}%` }}
              />
            </div>
          </div>

          {/* ── Actions ───────────────────────────────────────────────── */}
          <div className="flex gap-2 mt-auto" onClick={e => e.stopPropagation()}>
            {inCart ? (
              <div className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-green-50 dark:bg-green-950/40 border-2 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-xs font-black">
                <FiCheckCircle className="w-3.5 h-3.5" />
                In Cart
              </div>
            ) : (
              <button
                onClick={openStakeModal}
                className={`flex-1 text-white text-xs sm:text-sm font-black py-2.5 rounded-xl text-center transition-colors ${tier.btnBg}`}
              >
                {isFree ? 'Enter Free' : 'Enter Now'}
              </button>
            )}
            <button
              onClick={inCart ? undefined : openStakeModal}
              disabled={inCart}
              className={`flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all ${
                inCart
                  ? 'border-green-200 dark:border-green-800 text-green-400 cursor-not-allowed bg-green-50 dark:bg-green-950/40'
                  : 'border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:border-[#1A4D8F] hover:text-[#1A4D8F] dark:hover:border-blue-600 dark:hover:text-blue-400'
              }`}
            >
              <FiShoppingCart className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <StakeModal match={match} open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
