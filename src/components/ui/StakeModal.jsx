import { useState, useEffect } from 'react';
import { FiX, FiStar, FiAward, FiZap, FiUsers, FiShoppingCart, FiCheckCircle, FiLock, FiCreditCard } from 'react-icons/fi';
import { useCart } from '../../hooks/useCart';
import TeamAvatar from './TeamAvatar';
import { matchTiers } from '../../data/mockData';

const TIER_CONFIG = {
  silver: {
    label: 'Silver',
    Icon: FiStar,
    border: 'border-gray-300',
    activeBorder: 'border-gray-500',
    activeBg: 'bg-gray-50',
    badge: 'bg-gray-500 text-white',
    bar: 'bg-gray-400',
    ring: 'ring-gray-400',
    desc: 'For casual players. More winners, lower entry.',
  },
  gold: {
    label: 'Gold',
    Icon: FiAward,
    border: 'border-yellow-200',
    activeBorder: 'border-[#F5C518]',
    activeBg: 'bg-yellow-50',
    badge: 'bg-[#F5C518] text-[#1A1A2E]',
    bar: 'bg-[#F5C518]',
    ring: 'ring-[#F5C518]',
    desc: 'Best value. Balanced odds and payouts.',
  },
  platinum: {
    label: 'Platinum',
    Icon: FiZap,
    border: 'border-purple-200',
    activeBorder: 'border-purple-600',
    activeBg: 'bg-purple-50',
    badge: 'bg-purple-600 text-white',
    bar: 'bg-purple-500',
    ring: 'ring-purple-500',
    desc: 'High roller. Provably fair draw, massive prizes.',
  },
};

export default function StakeModal({ match, open, onClose }) {
  const { addToCart, items } = useCart();
  const [pick, setPick]      = useState(null);
  const [selectedTier, setSelectedTier] = useState(null);
  const [added, setAdded]    = useState(false);
  const [paid, setPaid]      = useState(false);

  const tiers  = matchTiers[match?.id] || [];
  // Find which tier (if any) this match is already staked at in cart
  const cartItem    = items.find(i => i.matchId === match?.id);
  const alreadyStaked = !!cartItem;

  // Auto-select the match's default tier on open
  useEffect(() => {
    if (open && match) {
      setPick(null);
      setAdded(false);
      setPaid(false);
      const defaultTier = tiers.find(t => t.tier === match.tier) || tiers[1] || tiers[0];
      setSelectedTier(defaultTier?.tier || null);
    }
  }, [open, match?.id]);

  // Trap ESC key
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !match) return null;

  const chosen = tiers.find(t => t.tier === selectedTier);

  const cartPayload = () => ({
    cartId:     `${match.id}-${chosen.tier}-${Date.now()}`,
    matchId:    match.id,
    match:      `${match.homeTeam.name} vs ${match.awayTeam.name}`,
    market:     match.market,
    pick:       `${match.adminPick} (${pick.toUpperCase()})`,
    prediction: pick,
    tier:       chosen.tier,
    price:      chosen.price,
  });

  const handleAddToCart = () => {
    if (!pick || !chosen) return;
    addToCart(cartPayload());
    setAdded(true);
    setTimeout(() => { setAdded(false); onClose(); }, 1400);
  };

  const handlePayNow = () => {
    if (!pick || !chosen) return;
    addToCart(cartPayload());
    setPaid(true);
    setTimeout(() => { setPaid(false); onClose(); }, 1600);
  };

  const isLive = match.status === 'live';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center z-50 p-0 md:p-4">
        <div className="bg-white rounded-t-3xl md:rounded-2xl shadow-2xl w-full md:max-w-md md:mx-auto max-h-[92vh] overflow-y-auto">

          {/* Handle bar (mobile) */}
          <div className="flex justify-center pt-3 pb-1 md:hidden">
            <div className="w-10 h-1 bg-gray-200 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-3 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-base font-black text-[#1A1A2E]">Choose Your Stake</h2>
              <p className="text-xs text-gray-400 mt-0.5">{match.league}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <FiX className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Match summary */}
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col items-center gap-1 flex-1">
                <TeamAvatar logo={match.homeTeam.logo} short={match.homeTeam.short} size="md" />
                <p className="text-xs font-bold text-[#1A1A2E] text-center truncate w-full">{match.homeTeam.name}</p>
              </div>

              <div className="shrink-0 text-center">
                {isLive ? (
                  <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-1">
                    <span className="text-base font-black text-red-600">
                      {match.score?.home} - {match.score?.away}
                    </span>
                    <p className="text-[10px] text-red-400 font-bold">{match.minute}</p>
                  </div>
                ) : (
                  <span className="text-sm font-black text-gray-300">VS</span>
                )}
              </div>

              <div className="flex flex-col items-center gap-1 flex-1">
                <TeamAvatar logo={match.awayTeam.logo} short={match.awayTeam.short} size="md" />
                <p className="text-xs font-bold text-[#1A1A2E] text-center truncate w-full">{match.awayTeam.name}</p>
              </div>
            </div>

            {/* Market + Pick */}
            <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
              <p className="text-xs text-gray-400">Market — Admin Pick</p>
              <p className="text-sm font-bold text-[#1A4D8F]">
                {match.market}: <span>{match.adminPick}</span>
              </p>
            </div>
          </div>

          {/* YES / NO prediction */}
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-xs font-black text-[#1A1A2E] uppercase tracking-wider mb-2.5">Your Prediction</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPick(pick === 'yes' ? null : 'yes')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-black border-2 transition-all ${
                  pick === 'yes'
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-200 text-gray-500 hover:border-green-400 hover:text-green-600'
                }`}
              >
                YES — Agree
              </button>
              <button
                onClick={() => setPick(pick === 'no' ? null : 'no')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-black border-2 transition-all ${
                  pick === 'no'
                    ? 'bg-red-500 border-red-500 text-white'
                    : 'border-gray-200 text-gray-500 hover:border-red-400 hover:text-red-500'
                }`}
              >
                NO — Disagree
              </button>
            </div>
          </div>

          {/* Already staked banner */}
          {alreadyStaked && (
            <div className="mx-5 my-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2.5">
              <FiCheckCircle className="w-4 h-4 text-green-500 shrink-0" />
              <div>
                <p className="text-sm font-bold text-green-700">Already staked on this match</p>
                <p className="text-xs text-green-600">
                  {TIER_CONFIG[cartItem.tier]?.label} tier · {cartItem.pick} · ${cartItem.price?.toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {/* Tier selection */}
          <div className="px-5 py-4">
            <p className="text-xs font-black text-[#1A1A2E] uppercase tracking-wider mb-3">
              {alreadyStaked ? 'Available Tiers' : 'Select Stake Tier'}
            </p>
            <div className="space-y-2.5">
              {tiers.map(t => {
                const cfg    = TIER_CONFIG[t.tier];
                const active = selectedTier === t.tier;
                const isStakedTier = cartItem?.tier === t.tier;
                return (
                  <button
                    key={t.tier}
                    onClick={() => !alreadyStaked && setSelectedTier(t.tier)}
                    disabled={alreadyStaked}
                    className={`w-full text-left rounded-2xl border-2 p-3.5 transition-all ${
                      isStakedTier
                        ? `${cfg.activeBorder} ${cfg.activeBg} opacity-80`
                        : alreadyStaked
                        ? `${cfg.border} bg-gray-50 opacity-50 cursor-not-allowed`
                        : active
                        ? `${cfg.activeBorder} ${cfg.activeBg} ring-2 ${cfg.ring} ring-offset-1`
                        : `${cfg.border} bg-white hover:${cfg.activeBg}`
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Tier badge */}
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-black ${cfg.badge}`}>
                            <cfg.Icon className="w-3 h-3" />
                            {cfg.label}
                          </span>
                          {isStakedTier && (
                            <span className="text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full">
                              YOUR PICK
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 leading-relaxed">{cfg.desc}</p>

                        {/* Stats */}
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 flex-wrap">
                          <span className="flex items-center gap-1">
                            <FiUsers className="w-3 h-3" />
                            {t.maxWinners} winner{t.maxWinners > 1 ? 's' : ''}
                          </span>
                          <span className="font-bold text-[#1A1A2E]">Pool: ${t.prizePool.toFixed(2)}</span>
                          {/* Staker count */}
                          <span className="flex items-center gap-1 text-gray-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                            {t.stakers} staked
                          </span>
                        </div>

                        {/* Fill bar */}
                        <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${cfg.bar}`}
                            style={{ width: `${t.fillPercent}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">{t.fillPercent}% filled · {t.stakers} players</p>
                      </div>

                      {/* Price + select indicator */}
                      <div className="shrink-0 text-right">
                        <p className={`text-lg font-black ${
                          t.tier === 'platinum' ? 'text-purple-600'
                          : t.tier === 'gold' ? 'text-[#d97706]'
                          : 'text-gray-600'
                        }`}>
                          ${t.price.toFixed(2)}
                        </p>
                        <p className="text-[10px] text-gray-400">entry</p>
                        {(active || isStakedTier) && (
                          <FiCheckCircle className={`w-4 h-4 mt-1 ml-auto ${isStakedTier ? 'text-green-500' : 'text-[#1A4D8F]'}`} />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CTA */}
          <div className="px-5 pb-6">
            {alreadyStaked ? (
              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-xl text-sm font-black flex items-center justify-center gap-2 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
              >
                <FiLock className="w-4 h-4" /> Already Staked — Remove from Cart to Change
              </button>
            ) : (
              <>
                {!pick && (
                  <p className="text-xs text-center text-amber-500 font-medium mb-2">Select YES or NO above before staking</p>
                )}

                {paid ? (
                  <div className="w-full py-3.5 rounded-xl text-sm font-black flex items-center justify-center gap-2 bg-green-500 text-white">
                    <FiCheckCircle className="w-4 h-4" /> Payment confirmed!
                  </div>
                ) : added ? (
                  <div className="w-full py-3.5 rounded-xl text-sm font-black flex items-center justify-center gap-2 bg-green-500 text-white">
                    <FiCheckCircle className="w-4 h-4" /> Added to Cart!
                  </div>
                ) : (
                  <div className="flex gap-2">
                    {/* Add to Cart */}
                    <button
                      onClick={handleAddToCart}
                      disabled={!pick || !selectedTier}
                      className={`flex-1 py-3.5 rounded-xl text-sm font-black flex items-center justify-center gap-1.5 border-2 transition-all ${
                        !pick || !selectedTier
                          ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                          : 'border-[#1A4D8F] text-[#1A4D8F] hover:bg-blue-50'
                      }`}
                    >
                      <FiShoppingCart className="w-4 h-4" />
                      Cart
                    </button>

                    {/* Pay Now */}
                    <button
                      onClick={handlePayNow}
                      disabled={!pick || !selectedTier}
                      className={`flex-1 py-3.5 rounded-xl text-sm font-black flex items-center justify-center gap-1.5 transition-all ${
                        !pick || !selectedTier
                          ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                          : 'bg-[#F5C518] hover:brightness-105 text-[#1A1A2E]'
                      }`}
                    >
                      <FiCreditCard className="w-4 h-4" />
                      {chosen ? `Pay $${chosen.price.toFixed(2)}` : 'Pay Now'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
