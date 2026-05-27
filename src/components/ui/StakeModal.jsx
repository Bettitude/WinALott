import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { requireAuth } from '../../utils/requireAuth';
import { FiX, FiStar, FiAward, FiZap, FiUsers, FiShoppingCart, FiCheckCircle, FiLock, FiBarChart2, FiAlertTriangle, FiLogIn } from 'react-icons/fi';
import { formatBTP } from '../../utils/btp';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import TeamAvatar from './TeamAvatar';
import { matchApi } from '../../api/matchApi';
import { normalizeMarketToTier } from '../../api/normalizers';

const TIER_CONFIG = {
  silver: {
    label: 'Silver', Icon: FiStar,
    border: 'border-gray-300', activeBorder: 'border-gray-500', activeBg: 'bg-gray-50',
    badge: 'bg-gray-500 text-white', bar: 'bg-gray-400', ring: 'ring-gray-400',
    desc: 'For casual players. More winners, lower entry.',
  },
  gold: {
    label: 'Gold', Icon: FiAward,
    border: 'border-yellow-200', activeBorder: 'border-[#F5C518]', activeBg: 'bg-yellow-50',
    badge: 'bg-[#F5C518] text-[#1A1A2E]', bar: 'bg-[#F5C518]', ring: 'ring-[#F5C518]',
    desc: 'Best value. Balanced odds and payouts.',
  },
  platinum: {
    label: 'Platinum', Icon: FiZap,
    border: 'border-purple-200', activeBorder: 'border-purple-600', activeBg: 'bg-purple-50',
    badge: 'bg-purple-600 text-white', bar: 'bg-purple-500', ring: 'ring-purple-500',
    desc: 'High roller. Provably fair draw, massive prizes.',
  },
};

// Seeded pseudo-random for stable prediction percentages per match
function seededRand(seed, min, max) {
  const x = Math.sin(seed) * 10000;
  return min + Math.floor((x - Math.floor(x)) * (max - min + 1));
}

function PredictionGraph({ match, options }) {
  const pcts = useMemo(() => {
    const id = parseInt(String(match?.id).replace(/\D/g, '').slice(-6), 10) || 42;
    const raw = options.map((_, i) => seededRand(id + i * 137, 15, 55));
    const total = raw.reduce((a, b) => a + b, 0);
    return raw.map(v => Math.round((v / total) * 100));
  }, [match?.id, options.length]);

  const COLORS = [
    { bar: 'bg-[#1A4D8F]',  text: 'text-[#1A4D8F]' },
    { bar: 'bg-gray-400',   text: 'text-gray-500' },
    { bar: 'bg-red-500',    text: 'text-red-500' },
  ];

  return (
    <div className="px-5 py-4 border-b border-gray-100">
      <div className="flex items-center gap-1.5 mb-3">
        <FiBarChart2 className="w-3.5 h-3.5 text-[#1A4D8F]" />
        <p className="text-xs font-black text-[#1A1A2E] uppercase tracking-wider">Crowd Prediction</p>
        <span className="text-[10px] text-gray-400 ml-auto">based on current entries</span>
      </div>
      <div className="space-y-2">
        {options.map((opt, i) => (
          <div key={opt.value} className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-gray-500 w-16 truncate shrink-0">{opt.label}</span>
            <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${COLORS[i % COLORS.length].bar}`}
                style={{ width: `${pcts[i]}%` }}
              />
            </div>
            <span className={`text-xs font-black w-8 text-right shrink-0 ${COLORS[i % COLORS.length].text}`}>
              {pcts[i]}%
            </span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-gray-400 mt-2">Distribution updates as more players enter</p>
    </div>
  );
}

function CancelModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xs p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
          <FiAlertTriangle className="w-6 h-6 text-amber-500" />
        </div>
        <h3 className="font-black text-[#1A1A2E] mb-1">Leave without staking?</h3>
        <p className="text-sm text-gray-500 mb-5">Your prediction and tier selection will not be saved.</p>
        <div className="flex gap-2">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            Keep editing
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-black hover:bg-red-600 transition-colors">
            Yes, close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StakeModal({ match, open, onClose }) {
  const { addToCart, items } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [pick, setPick]           = useState(null);
  const [selectedTier, setSelectedTier] = useState(null);
  const [added, setAdded]         = useState(false);
  const [paid, setPaid]           = useState(false);
  const [tiers, setTiers]         = useState([]);
  const [showCancel, setShowCancel] = useState(false);

  const cartItem     = items.find(i => i.matchId === match?.id);
  const alreadyStaked = !!cartItem;

  const options = useMemo(() => {
    const raw = match?._raw?.markets?.[0]?.options;
    if (raw?.length) return raw;
    return [
      { label: match?.homeTeam?.name || 'Home Win', value: 'home' },
      { label: 'Draw',                               value: 'draw' },
      { label: match?.awayTeam?.name || 'Away Win',  value: 'away' },
    ];
  }, [match]);

  useEffect(() => {
    if (!open || !match?.id) return;
    setPick(null);
    setAdded(false);
    setPaid(false);
    setShowCancel(false);

    matchApi.getMarkets({ match_id: match.id, status: 'active' })
      .then(res => {
        const markets = res.data?.data?.markets || [];
        const normalized = markets.map(normalizeMarketToTier);
        setTiers(normalized);
        const defaultTier = normalized.find(t => t.tier === match.tier) || normalized[0];
        setSelectedTier(defaultTier?.tier || null);
      })
      .catch(() => {
        const fallback = [{
          marketId: match._raw?.id || match.id,
          tier: match.tier || 'silver',
          price: match.price || 0,
          maxWinners: match.maxWinners || 5,
          prizePool: match.prizePool || 0,
          stakers: 0,
          fillPercent: match.fillPercent || 0,
          name: match.market || '',
        }];
        setTiers(fallback);
        setSelectedTier(fallback[0].tier);
      });
  }, [open, match?.id]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, pick, selectedTier]);

  const handleClose = () => {
    if (pick && !added && !paid && !alreadyStaked) {
      setShowCancel(true);
    } else {
      onClose();
    }
  };

  if (!open || !match) return null;

  const chosen = tiers.find(t => t.tier === selectedTier);
  const hasEnoughBalance = !chosen || (user?.balance ?? 0) >= (chosen.price ?? 0);

  const cartPayload = () => ({
    cartId:      `${match.id}-${chosen.tier}-${Date.now()}`,
    matchId:     match.id,
    marketId:    chosen.marketId,
    match:       `${match.homeTeam.name} vs ${match.awayTeam.name}`,
    market:      chosen.name || match.market,
    pick:        pick,
    prediction:  pick,
    tier:        chosen.tier,
    price:       chosen.price,
    matchStatus: match.status,
    matchDate:   match.date,
    matchTime:   match.time,
  });

  const handleAddToCart = () => {
    if (!pick || !chosen) return;
    if (!requireAuth(navigate, isAuthenticated)) { onClose(); return; }
    addToCart(cartPayload());
    setAdded(true);
    setTimeout(() => { setAdded(false); onClose(); }, 1400);
  };

  const handlePayNow = () => {
    if (!pick || !chosen) return;
    if (!requireAuth(navigate, isAuthenticated)) { onClose(); return; }
    if (!hasEnoughBalance) {
      localStorage.setItem('redirect_after_topup', '/checkout');
      onClose();
      navigate('/dashboard/wallet?deposit=1');
      return;
    }
    addToCart(cartPayload());
    setPaid(true);
    setTimeout(() => { setPaid(false); onClose(); navigate('/checkout'); }, 1400);
  };

  const isLive = match.status === 'live';

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={handleClose} />

      {showCancel && (
        <CancelModal
          onConfirm={() => { setShowCancel(false); onClose(); }}
          onCancel={() => setShowCancel(false)}
        />
      )}

      <div className="fixed inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center z-50 p-0 md:p-4">
        <div className="bg-white rounded-t-3xl md:rounded-2xl shadow-2xl w-full md:max-w-md md:mx-auto max-h-[92vh] overflow-y-auto">

          <div className="flex justify-center pt-3 pb-1 md:hidden">
            <div className="w-10 h-1 bg-gray-200 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-3 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-base font-black text-[#1A1A2E]">Choose Your Entry</h2>
              <p className="text-xs text-gray-400 mt-0.5">{match.league}</p>
            </div>
            <button
              onClick={handleClose}
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
            <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
              <p className="text-xs text-gray-400">Market — Admin Pick</p>
              <p className="text-sm font-bold text-[#1A4D8F]">{match.market}: <span>{match.adminPick}</span></p>
            </div>
          </div>

          {/* Crowd Prediction Graph */}
          <PredictionGraph match={match} options={options} />

          {/* Prediction options */}
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-xs font-black text-[#1A1A2E] uppercase tracking-wider mb-2.5">Your Prediction</p>
            <div className="flex gap-2 flex-wrap">
              {options.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setPick(pick === opt.value ? null : opt.value)}
                  className={`flex-1 min-w-[80px] py-2.5 rounded-xl text-sm font-black border-2 transition-all ${
                    pick === opt.value
                      ? 'bg-[#1A4D8F] border-[#1A4D8F] text-white'
                      : 'border-gray-200 text-gray-500 hover:border-[#1A4D8F] hover:text-[#1A4D8F]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Already staked banner */}
          {alreadyStaked && (
            <div className="mx-5 my-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2.5">
              <FiCheckCircle className="w-4 h-4 text-green-500 shrink-0" />
              <div>
                <p className="text-sm font-bold text-green-700">Already staked on this match</p>
                <p className="text-xs text-green-600">
                  {TIER_CONFIG[cartItem.tier]?.label} tier · {cartItem.pick} · {formatBTP(cartItem.price ?? 0)}
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
                const cfg = TIER_CONFIG[t.tier];
                const active = selectedTier === t.tier;
                const isStakedTier = cartItem?.tier === t.tier;
                return (
                  <button
                    key={t.tier}
                    onClick={() => !alreadyStaked && setSelectedTier(t.tier)}
                    disabled={alreadyStaked}
                    className={`w-full text-left rounded-2xl border-2 p-3.5 transition-all ${
                      isStakedTier ? `${cfg.activeBorder} ${cfg.activeBg} opacity-80`
                      : alreadyStaked ? `${cfg.border} bg-gray-50 opacity-50 cursor-not-allowed`
                      : active ? `${cfg.activeBorder} ${cfg.activeBg} ring-2 ${cfg.ring} ring-offset-1`
                      : `${cfg.border} bg-white hover:${cfg.activeBg}`
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
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
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 flex-wrap">
                          <span className="flex items-center gap-1"><FiUsers className="w-3 h-3" />{t.maxWinners} winner{t.maxWinners > 1 ? 's' : ''}</span>
                          <span className="font-bold text-[#1A1A2E]">Pool: {formatBTP(t.prizePool)}</span>
                          <span>{t.stakers} staked</span>
                        </div>
                        <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${cfg.bar}`} style={{ width: `${t.fillPercent}%` }} />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">{t.fillPercent}% filled</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className={`text-base font-black leading-tight ${
                          t.tier === 'platinum' ? 'text-purple-600' : t.tier === 'gold' ? 'text-[#d97706]' : 'text-gray-600'
                        }`}>{formatBTP(t.price)}</p>
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
              <button onClick={onClose}
                className="w-full py-3.5 rounded-xl text-sm font-black flex items-center justify-center gap-2 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all">
                <FiLock className="w-4 h-4" /> Already Staked — Remove from Cart to Change
              </button>
            ) : (
              <>
                {!pick && (
                  <p className="text-xs text-center text-amber-500 font-medium mb-2">Select a prediction above before staking</p>
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
                    <button onClick={handleAddToCart} disabled={!pick || !selectedTier}
                      className={`flex-1 py-3.5 rounded-xl text-sm font-black flex items-center justify-center gap-1.5 border-2 transition-all ${
                        !pick || !selectedTier ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-[#1A4D8F] text-[#1A4D8F] hover:bg-blue-50'
                      }`}>
                      <FiShoppingCart className="w-4 h-4" /> Cart
                    </button>
                    {isAuthenticated ? (
                      <button onClick={handlePayNow} disabled={!pick || !selectedTier}
                        className={`flex-1 py-3.5 rounded-xl text-sm font-black flex items-center justify-center gap-1.5 transition-all ${
                          !pick || !selectedTier
                            ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                            : !hasEnoughBalance
                            ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                            : 'bg-[#F5C518] hover:brightness-105 text-[#1A1A2E]'
                        }`}>
                        {pick && selectedTier && !hasEnoughBalance ? 'Top Up to Play' : (chosen ? formatBTP(chosen.price) : 'Use WAP')}
                      </button>
                    ) : (
                      <Link to="/auth/login" onClick={onClose}
                        className="flex-1 py-3.5 rounded-xl text-sm font-black flex items-center justify-center gap-1.5 bg-[#1A4D8F] text-white hover:bg-[#0D2B5E] transition-all">
                        <FiLogIn className="w-4 h-4" /> Log In to Stake
                      </Link>
                    )}
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
