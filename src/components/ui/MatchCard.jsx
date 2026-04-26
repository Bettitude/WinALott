import { useState } from 'react';
import { FiShoppingCart, FiUsers, FiZap, FiAward, FiStar, FiClock, FiCheckCircle } from 'react-icons/fi';
import TeamAvatar from './TeamAvatar';
import StakeModal from './StakeModal';
import { useCart } from '../../hooks/useCart';

const TIER = {
  silver: {
    label: 'Silver',
    Icon: FiStar,
    border: 'border-l-gray-400',
    badge: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white',
    bar: 'bg-gray-400',
    btnBg: 'bg-gray-500 hover:bg-gray-600',
    shadow: '',
  },
  gold: {
    label: 'Gold',
    Icon: FiAward,
    border: 'border-l-[#F5C518]',
    badge: 'bg-gradient-to-r from-[#F5C518] to-[#e6a800] text-[#1A1A2E]',
    bar: 'bg-[#F5C518]',
    btnBg: 'bg-[#1A4D8F] hover:bg-[#0D2B5E]',
    shadow: '',
  },
  platinum: {
    label: 'Platinum',
    Icon: FiZap,
    border: 'border-l-purple-600',
    badge: 'bg-gradient-to-r from-purple-600 to-violet-500 text-white',
    bar: 'bg-purple-500',
    btnBg: 'bg-purple-600 hover:bg-purple-700',
    shadow: 'shadow-purple-100',
  },
};

export default function MatchCard({ match, loading = false }) {
  const { items } = useCart();
  const [modalOpen, setModalOpen] = useState(false);
  const inCart = items.some(i => i.matchId === match?.id);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
        <div className="h-1.5 bg-gray-100" />
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
          <div className="skeleton h-16 rounded-xl" />
          <div className="skeleton h-10 rounded-xl" />
        </div>
      </div>
    );
  }

  const tier     = TIER[match.tier] || TIER.silver;
  const TierIcon = tier.Icon;
  const isLive   = match.status === 'live';
  const isFree   = match.price === 0;
  const isPlatinum = match.tier === 'platinum';

  return (
    <>
      <div className={`bg-white rounded-2xl border border-gray-200 shadow-md ${tier.shadow} card-hover flex flex-col overflow-hidden border-l-4 ${tier.border}`}>
        {/* Header row */}
        <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
          <div className="flex items-center gap-1.5">
            <span className={`inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full ${tier.badge}`}>
              <TierIcon className="w-3 h-3" />
              {tier.label}
            </span>
            {isPlatinum && (
              <span className="text-xs font-black text-purple-600 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full animate-pulse">
                HIGH ROLLER
              </span>
            )}
          </div>

          {isLive ? (
            <span className="flex items-center gap-1 bg-red-500 text-white text-xs font-black px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              LIVE {match.minute}
            </span>
          ) : match.status === 'finished' ? (
            <span className="flex items-center gap-1 bg-gray-100 text-gray-500 text-xs font-semibold px-2 py-1 rounded-full">
              <FiCheckCircle className="w-3 h-3" /> FT
            </span>
          ) : (
            <span className="flex items-center gap-1 text-gray-500 text-xs font-semibold bg-gray-50 px-2 py-1 rounded-full">
              <FiClock className="w-3 h-3" /> {match.time}
            </span>
          )}
        </div>

        <div className="px-4 pb-4 flex flex-col flex-1">
          {/* League */}
          <p className="text-xs text-gray-400 font-medium mb-3 truncate">{match.league}</p>

          {/* Teams */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
              <TeamAvatar short={match.homeTeam.short} logo={match.homeTeam.logo} size="md" />
              <p className="text-xs font-bold text-[#1A1A2E] text-center leading-tight truncate w-full">{match.homeTeam.name}</p>
            </div>

            <div className="shrink-0 text-center px-1">
              {isLive ? (
                <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-1.5">
                  <span className="text-lg font-black text-red-600 tabular-nums">
                    {match.score?.home} - {match.score?.away}
                  </span>
                </div>
              ) : (
                <span className="text-sm font-black text-gray-300">VS</span>
              )}
            </div>

            <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
              <TeamAvatar short={match.awayTeam.short} logo={match.awayTeam.logo} size="md" />
              <p className="text-xs font-bold text-[#1A1A2E] text-center leading-tight truncate w-full">{match.awayTeam.name}</p>
            </div>
          </div>

          {/* Market + admin pick */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 mb-3">
            <p className="text-xs text-gray-400 mb-0.5">Market — Admin Pick</p>
            <p className="text-sm font-bold text-[#1A4D8F] leading-tight">{match.market}: <span>{match.adminPick}</span></p>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-3 flex-wrap">
            <span className="flex items-center gap-1">
              <FiUsers className="w-3 h-3" />
              {match.maxWinners} winner{match.maxWinners > 1 ? 's' : ''}
            </span>
            <span className="font-bold text-[#1A1A2E]">
              Pool: ${match.prizePool.toFixed(2)}
            </span>
            <span className="ml-auto font-black text-sm" style={{ color: match.tier === 'platinum' ? '#7C3AED' : match.tier === 'gold' ? '#d97706' : '#6b7280' }}>
              {isFree ? 'FREE' : `from $0.99`}
            </span>
          </div>

          {/* Pool fill progress bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>Pool fill</span>
              <span className="font-bold text-[#1A1A2E]">{match.fillPercent ?? 0}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${tier.bar}`}
                style={{ width: `${match.fillPercent ?? 0}%` }}
              />
            </div>
          </div>

          {/* Action — opens stake modal */}
          <div className="flex gap-2 mt-auto">
            {inCart ? (
              <div className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-50 border-2 border-green-200 text-green-600 text-sm font-black">
                <FiCheckCircle className="w-4 h-4" />
                In Cart
              </div>
            ) : (
              <button
                onClick={() => setModalOpen(true)}
                className={`flex-1 text-white text-sm font-black py-2.5 rounded-xl text-center transition-colors ${tier.btnBg}`}
              >
                {isFree ? 'Enter Free' : 'Stake Now'}
              </button>
            )}
            <button
              onClick={() => !inCart && setModalOpen(true)}
              disabled={inCart}
              className={`flex items-center justify-center gap-1 px-3.5 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                inCart
                  ? 'border-green-200 text-green-400 cursor-not-allowed bg-green-50'
                  : 'border-gray-200 text-gray-500 hover:border-[#1A4D8F] hover:text-[#1A4D8F]'
              }`}
            >
              <FiShoppingCart className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-center text-gray-400 mt-2">
            {inCart ? 'Remove from cart to change your stake' : 'Choose Silver, Gold or Platinum'}
          </p>
        </div>
      </div>

      <StakeModal match={match} open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
