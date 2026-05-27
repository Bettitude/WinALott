import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiStar, FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { requireAuth } from '../../utils/requireAuth';
import TeamAvatar from './TeamAvatar';
import { formatBTP } from '../../utils/btp';

export default function PickOfTheDayCard({ matches = [] }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);

  const list = Array.isArray(matches) ? matches.filter(Boolean) : [];
  const match = list[idx] || null;

  // Auto-cycle every 6 seconds when there are multiple picks
  useEffect(() => {
    if (list.length <= 1) return;
    const id = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % list.length);
        setFade(true);
      }, 250);
    }, 6000);
    return () => clearInterval(id);
  }, [list.length]);

  const goTo = (dir, e) => {
    e.stopPropagation();
    setFade(false);
    setTimeout(() => {
      setIdx(i => (i + dir + list.length) % list.length);
      setFade(true);
    }, 200);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!match) return;
    if (!requireAuth(navigate, isAuthenticated)) return;
    addToCart({
      cartId:  `potd-${match.id}-${Date.now()}`,
      matchId: match.id,
      match:   `${match.homeTeam.name} vs ${match.awayTeam.name}`,
      market:  match.market,
      pick:    `${match.adminPick}`,
      price:   match.price,
      tier:    match.tier || 'silver',
    });
  };

  if (!match) return null;

  return (
    <div
      onClick={() => navigate(`/match/${match.id}`)}
      className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-sm cursor-pointer hover:shadow-2xl transition-shadow"
    >
      {/* Gold top accent */}
      <div className="h-1.5 bg-gradient-to-r from-[#1A4D8F] to-[#F5C518]" />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-[#F5C518] p-1.5 rounded-lg">
              <FiStar className="w-4 h-4 text-[#1A1A2E]" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pick of the Day</p>
              <p className="text-xs text-gray-500 truncate max-w-[160px]">{match.league}</p>
            </div>
          </div>

          {/* Cycle controls (only when multiple) */}
          {list.length > 1 && (
            <div className="flex items-center gap-1">
              <button onClick={e => goTo(-1, e)}
                className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                <FiChevronLeft className="w-3.5 h-3.5 text-gray-500" />
              </button>
              <span className="text-[10px] font-bold text-gray-400">{idx + 1}/{list.length}</span>
              <button onClick={e => goTo(1, e)}
                className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                <FiChevronRight className="w-3.5 h-3.5 text-gray-500" />
              </button>
            </div>
          )}
        </div>

        {/* Animated content */}
        <div style={{ opacity: fade ? 1 : 0, transition: 'opacity 0.25s ease' }}>
          {/* Teams */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex flex-col items-center gap-1 flex-1">
              <TeamAvatar short={match.homeTeam.short} logo={match.homeTeam.logo} size="lg" />
              <p className="text-xs font-semibold text-[#1A1A2E] text-center leading-tight">{match.homeTeam.name}</p>
            </div>
            <div className="flex flex-col items-center shrink-0">
              <span className="text-lg font-black text-gray-300">VS</span>
              <span className="text-xs font-bold text-[#1A4D8F] bg-blue-50 px-2 py-0.5 rounded-full">{match.time}</span>
            </div>
            <div className="flex flex-col items-center gap-1 flex-1">
              <TeamAvatar short={match.awayTeam.short} logo={match.awayTeam.logo} size="lg" />
              <p className="text-xs font-semibold text-[#1A1A2E] text-center leading-tight">{match.awayTeam.name}</p>
            </div>
          </div>

          {/* Prediction */}
          <div className="bg-blue-50 rounded-xl px-3 py-2 mb-4 text-center">
            <p className="text-xs text-gray-500">Admin Predicts</p>
            <p className="text-sm font-bold text-[#1A4D8F]">{match.adminPick}</p>
            <p className="text-xs text-gray-400 mt-0.5">{match.market} Market</p>
          </div>

          {/* Price */}
          <div className="text-center mb-3">
            <span className="text-2xl font-black text-[#1A4D8F]">{formatBTP(match.price)}</span>
            <span className="text-gray-400 text-xs ml-1">/ ticket</span>
          </div>

          {/* Tickets fill */}
          {match.maxTickets > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                <span>{match.ticketsSold || 0} sold</span>
                <span>{match.maxTickets} max</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1A4D8F] rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.round(((match.ticketsSold || 0) / match.maxTickets) * 100))}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
          <Link
            to={`/match/${match.id}`}
            className="flex-1 bg-[#1A4D8F] text-white font-semibold py-2.5 rounded-lg text-center text-sm hover:bg-[#0D2B5E] transition-colors"
          >
            Get Ticket
          </Link>
          <button
            onClick={handleAddToCart}
            className="flex items-center justify-center gap-1.5 border border-[#1A4D8F] text-[#1A4D8F] font-medium px-4 py-2.5 rounded-lg text-sm hover:bg-blue-50 transition-colors"
          >
            <FiShoppingCart className="w-4 h-4" />
            Cart
          </button>
        </div>

        {/* Dot indicators */}
        {list.length > 1 && (
          <div className="flex justify-center gap-1 mt-3">
            {list.map((_, i) => (
              <button key={i} onClick={e => { e.stopPropagation(); setFade(false); setTimeout(() => { setIdx(i); setFade(true); }, 200); }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? 'bg-[#1A4D8F] w-3' : 'bg-gray-300'}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
