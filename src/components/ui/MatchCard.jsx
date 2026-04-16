import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiTag, FiUsers, FiDollarSign } from 'react-icons/fi';
import { useCart } from '../../hooks/useCart';
import TeamAvatar from './TeamAvatar';

export default function MatchCard({ match, loading = false }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
        <div className="h-1.5 bg-gray-100" />
        <div className="p-4">
          <div className="skeleton h-3 w-2/3 mb-3" />
          <div className="skeleton h-3 w-1/2 mb-5" />
          <div className="flex items-center gap-3 mb-4">
            <div className="skeleton w-9 h-9 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <div className="skeleton h-3 w-3/4" />
              <div className="skeleton h-2 w-1/2" />
              <div className="skeleton h-3 w-2/3" />
            </div>
          </div>
          <div className="skeleton h-10 w-full mb-3 rounded-xl" />
          <div className="skeleton h-8 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      cartId: `${match.id}-${Date.now()}`,
      matchId: match.id,
      match: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
      market: match.market,
      pick: `${match.adminPick} (${match.adminPickValue})`,
      price: match.price,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const isLive = match.status === 'live';
  const isFree = match.price === 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-md card-hover flex flex-col overflow-hidden">
      {/* Top accent bar */}
      <div className={`h-1.5 ${isLive ? 'bg-green-500' : 'bg-[#1A4D8F]'}`} />

      <div className="p-4 flex flex-col flex-1">
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-400 font-medium truncate flex-1 mr-2">
            {match.league}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {isLive && (
              <span className="flex items-center gap-1 bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                {match.minute}
              </span>
            )}
            <span className={`text-white text-xs font-semibold px-2 py-0.5 rounded-full ${match.tagColor}`}>
              {match.marketTag}
            </span>
          </div>
        </div>

        {/* Teams */}
        <div className="flex items-center gap-3 mb-3">
          <TeamAvatar short={match.homeTeam.short} logo={match.homeTeam.logo} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#1A1A2E] truncate leading-tight">
              {match.homeTeam.name}
            </p>
            <p className="text-xs text-gray-400 my-0.5">vs</p>
            <p className="text-sm font-bold text-[#1A1A2E] truncate leading-tight">
              {match.awayTeam.name}
            </p>
          </div>
          {isLive ? (
            <div className="text-center bg-green-50 rounded-xl px-3 py-2 shrink-0">
              <span className="text-xl font-black text-green-600 tabular-nums">
                {match.score?.home} — {match.score?.away}
              </span>
              <p className="text-xs text-green-500 font-semibold mt-0.5">LIVE</p>
            </div>
          ) : (
            <div className="text-right shrink-0">
              <p className="text-sm font-bold text-[#1A4D8F]">{match.time}</p>
              <p className="text-xs text-gray-400">{match.date}</p>
            </div>
          )}
        </div>

        {/* Admin prediction box */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 mb-3">
          <p className="text-xs text-gray-500 mb-0.5">Admin Prediction</p>
          <p className="text-sm font-bold text-[#1A4D8F] leading-tight">{match.adminPick}</p>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-2 mb-4 flex-wrap text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <FiUsers className="w-3 h-3" />
            {match.maxWinners} winners
          </span>
          <span className="flex items-center gap-1">
            <FiTag className="w-3 h-3" />
            {match.market}
          </span>
          <span className="flex items-center gap-1 ml-auto font-bold text-[#1A4D8F]">
            <FiDollarSign className="w-3 h-3" />
            {isFree ? 'FREE' : `$${match.price.toFixed(2)}`}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-auto pt-3 border-t border-gray-100">
          <Link
            to={`/match/${match.id}`}
            className="flex-1 bg-[#1A4D8F] text-white text-sm font-semibold py-2.5 rounded-xl text-center hover:bg-[#0D2B5E] transition-colors"
          >
            {isFree ? 'Enter Free' : 'Buy Ticket'}
          </Link>
          <button
            onClick={handleAddToCart}
            className={`flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              added
                ? 'bg-green-500 text-white border border-green-500'
                : 'border border-[#1A4D8F] text-[#1A4D8F] hover:bg-blue-50'
            }`}
          >
            <FiShoppingCart className="w-4 h-4" />
            {added ? 'Added!' : 'Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
