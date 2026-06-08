import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiShoppingCart, FiUsers, FiZap, FiAward, FiStar, FiClock, FiCheckCircle,
  FiTrendingUp, FiAlertCircle,
} from 'react-icons/fi';
import TeamAvatar from './TeamAvatar';
import StakeModal from './StakeModal';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { requireAuth } from '../../utils/requireAuth';
import { formatBTP } from '../../utils/btp';
import { generateOptions } from '../../utils/marketOptions';

const TIER = {
  silver: {
    label: 'Silver', Icon: FiStar,
    border: 'border-l-gray-400',
    badge: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white',
    bar: 'bg-gray-400',
    btnBg: 'bg-gray-500 hover:bg-gray-600',
    accentText: 'text-gray-500',
  },
  gold: {
    label: 'Gold', Icon: FiAward,
    border: 'border-l-[#F5C518]',
    badge: 'bg-gradient-to-r from-[#F5C518] to-[#e6a800] text-[#1A1A2E]',
    bar: 'bg-[#F5C518]',
    btnBg: 'bg-[#1A4D8F] hover:bg-[#0D2B5E]',
    accentText: 'text-[#d97706]',
  },
  platinum: {
    label: 'Platinum', Icon: FiZap,
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
  const { isAuthenticated } = useAuth();
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
  const isFinished = match.status === 'finished';
  const isFree     = match.price === 0;
  const isPlatinum = match.tier === 'platinum';

  const predictionType = match._raw?.markets?.[0]?.prediction_type
    || match._raw?.prediction_type
    || 'market_pick';
  const isMarketType = predictionType === 'market_type';
  const isApiPick    = predictionType === 'api_pick';

  // Generate preview options for market_type markets
  const previewOptions = isMarketType
    ? (match._raw?.markets?.[0]?.auto_options
       || generateOptions(match.market, match.homeTeam?.name, match.awayTeam?.name))
    : [];

  const isUnavailable = match.marketAvailable === false;
  const isHot       = (match.fillPercent ?? 0) > 50;
  const closesMs    = new Date(`${match.date}T${match.time}:00`).getTime() - Date.now();
  const closesMin   = Math.floor(closesMs / 60000);
  const stakingOpenMins = closesMin - 5;
  const closingSoon     = stakingOpenMins > 0 && stakingOpenMins <= 15;
  const stakingClosed   = isLive || isFinished || stakingOpenMins <= 0;
  const almostFull  = (match.fillPercent ?? 0) >= 80;
  const ticketsLeft = Math.max(0, Math.round(100 * (1 - (match.fillPercent ?? 0) / 100)));

  const openStakeModal = (e) => {
    e.stopPropagation();
    if (isUnavailable || stakingClosed) return;
    if (!requireAuth(navigate, isAuthenticated)) return;
    setModalOpen(true);
  };
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
        {/* Header row */}
        <div className="flex items-center justify-between px-3 sm:px-4 pt-3 sm:pt-3.5 pb-1.5 sm:pb-2">
          <div className="flex items-center gap-1 flex-wrap">
            <span className={`inline-flex items-center gap-1 text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full ${tier.badge}`}>
              <TierIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />{tier.label}
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
            {/* Prediction type pill */}
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
              isMarketType
                ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800'
                : isApiPick
                ? 'bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800'
                : 'bg-blue-50 dark:bg-blue-950/50 text-[#1A4D8F] dark:text-blue-400 border-blue-200 dark:border-blue-800'
            }`}>
              {isMarketType ? 'Pick Option' : isApiPick ? 'API Pick' : 'Yes / No'}
            </span>
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
          <p className="text-[10px] text-gray-400 dark:text-slate-500 font-medium mb-2 truncate">{match.league}</p>

          {/* Teams row */}
          <div className="flex items-center justify-between gap-1 mb-3">
            <button onClick={(e) => openTeamPage('home', e)}
              className="flex flex-col items-center gap-1 flex-1 min-w-0 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 px-1 py-1 transition-colors">
              <TeamAvatar short={match.homeTeam.short} logo={match.homeTeam.logo} size={homeMode ? 'sm' : 'md'} />
              <p className="text-[10px] sm:text-xs font-bold text-[#1A1A2E] dark:text-slate-200 text-center leading-tight truncate w-full">
                {match.homeTeam.name}
              </p>
            </button>
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
            <button onClick={(e) => openTeamPage('away', e)}
              className="flex flex-col items-center gap-1 flex-1 min-w-0 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 px-1 py-1 transition-colors">
              <TeamAvatar short={match.awayTeam.short} logo={match.awayTeam.logo} size={homeMode ? 'sm' : 'md'} />
              <p className="text-[10px] sm:text-xs font-bold text-[#1A1A2E] dark:text-slate-200 text-center leading-tight truncate w-full">
                {match.awayTeam.name}
              </p>
            </button>
          </div>

          {/* Market + Prediction section */}
          <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 rounded-xl px-3 py-2 mb-3">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="min-w-0">
                <p className="text-[10px] text-gray-400 dark:text-slate-500 leading-none mb-0.5">Market</p>
                <p className="text-xs font-bold text-[#1A4D8F] dark:text-blue-400 truncate">{match.market}</p>
              </div>
              {!isMarketType && match.adminPick && (
                <div className="shrink-0 text-right">
                  <p className="text-[10px] text-gray-400 dark:text-slate-500 leading-none mb-0.5">
                    {isApiPick ? 'API Pick' : 'Admin Pick'}
                  </p>
                  <p className="text-xs font-bold text-[#1A1A2E] dark:text-slate-200">{match.adminPick}</p>
                </div>
              )}
            </div>

            {/* Market Pick: show "Do you agree?" hint */}
            {!isMarketType && match.adminPick && (
              <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">
                Do you agree? — YES or NO
              </p>
            )}

            {/* Market Type: show first 3 options as pills */}
            {isMarketType && previewOptions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {previewOptions.slice(0, 4).map((opt, i) => (
                  <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-700 border border-blue-200 dark:border-blue-800 text-[#1A4D8F] dark:text-blue-400 font-semibold">
                    {opt.label}
                  </span>
                ))}
                {previewOptions.length > 4 && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-400 dark:text-slate-500 font-semibold">
                    +{previewOptions.length - 4} more
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-1.5 mb-3">
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl px-2 py-1.5 text-center">
              <p className="text-[9px] sm:text-[10px] text-gray-400 dark:text-slate-500 leading-none mb-0.5">Pool</p>
              <p className="text-xs sm:text-sm font-black text-[#1A1A2E] dark:text-slate-100 tabular-nums truncate">
                {formatBTP(match.prizePool)}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl px-2 py-1.5 text-center">
              <p className="text-[9px] sm:text-[10px] text-gray-400 dark:text-slate-500 leading-none mb-0.5">Entry</p>
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

          {!homeMode && almostFull && (
            <div className="flex items-center gap-1 text-[10px] text-orange-500 font-bold mb-2">
              <FiAlertCircle className="w-3 h-3" />{ticketsLeft} tickets left
            </div>
          )}

          {/* Pool fill bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-[10px] text-gray-400 dark:text-slate-500 mb-1">
              <span>Pool {match.fillPercent ?? 0}% full</span>
              {!homeMode && <span className="text-gray-300 dark:text-slate-600">Click card for details</span>}
            </div>
            <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${tier.bar}`} style={{ width: `${match.fillPercent ?? 0}%` }} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-auto" onClick={e => e.stopPropagation()}>
            {isUnavailable ? (
              <div className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-700/60 border border-dashed border-gray-300 dark:border-slate-600 text-gray-400 dark:text-slate-500 text-xs font-semibold cursor-not-allowed">
                <FiAlertCircle className="w-3.5 h-3.5" /> Unavailable
              </div>
            ) : inCart ? (
              <div className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-green-50 dark:bg-green-950/40 border-2 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-xs font-black">
                <FiCheckCircle className="w-3.5 h-3.5" /> In Cart
              </div>
            ) : isLive ? (
              <div className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 text-xs font-black">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shrink-0" />
                Live — Staking Closed
              </div>
            ) : stakingClosed ? (
              <div className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 text-gray-400 dark:text-slate-500 text-xs font-semibold cursor-not-allowed">
                <FiAlertCircle className="w-3.5 h-3.5" /> Staking Closed
              </div>
            ) : closingSoon ? (
              <button onClick={openStakeModal}
                className="flex-1 text-white text-xs sm:text-sm font-black py-2.5 rounded-xl text-center transition-colors bg-orange-500 hover:bg-orange-600 animate-pulse">
                Closing Soon — Enter
              </button>
            ) : (
              <button onClick={openStakeModal}
                className={`flex-1 text-white text-xs sm:text-sm font-black py-2.5 rounded-xl text-center transition-colors ${tier.btnBg}`}>
                {isFree ? 'Enter Free' : isMarketType ? 'Pick & Enter' : 'Yes or No'}
              </button>
            )}
            <button
              onClick={(!inCart && !stakingClosed && !isUnavailable) ? openStakeModal : undefined}
              disabled={inCart || stakingClosed || isUnavailable}
              className={`flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all ${
                inCart
                  ? 'border-green-200 dark:border-green-800 text-green-400 cursor-not-allowed bg-green-50 dark:bg-green-950/40'
                  : (stakingClosed || isUnavailable)
                  ? 'border-gray-100 dark:border-slate-700 text-gray-300 dark:text-slate-600 cursor-not-allowed'
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
