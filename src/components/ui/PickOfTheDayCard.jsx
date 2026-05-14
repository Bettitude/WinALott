import { Link } from 'react-router-dom';
import { FiShoppingCart, FiStar } from 'react-icons/fi';
import { useCart } from '../../hooks/useCart';
import TeamAvatar from './TeamAvatar';
import { btpFromDollars } from '../../utils/btp';

export default function PickOfTheDayCard({ match }) {
  const { addToCart } = useCart();

  if (!match) return null;

  const handleAddToCart = () => {
    addToCart({
      cartId: `potd-${match.id}-${Date.now()}`,
      matchId: match.id,
      match: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
      market: match.market,
      pick: `${match.adminPick} (${match.adminPickValue})`,
      price: match.price,
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-sm">
      {/* Blue top accent */}
      <div className="h-1.5 bg-[#1A4D8F] rounded-t-2xl" />

      <div className="p-5">
        {/* Title */}
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-[#F5C518] p-1.5 rounded-lg">
            <FiStar className="w-4 h-4 text-[#1A1A2E]" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pick of the Day</p>
            <p className="text-xs text-gray-500">{match.league}</p>
          </div>
        </div>

        {/* Teams */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex flex-col items-center gap-1 flex-1">
            <TeamAvatar short={match.homeTeam.short} logo={match.homeTeam.logo} size="lg" />
            <p className="text-xs font-semibold text-[#1A1A2E] text-center leading-tight">{match.homeTeam.name}</p>
          </div>
          <div className="flex flex-col items-center">
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
          <p className="text-xs text-gray-500">Admin Predicts:</p>
          <p className="text-sm font-bold text-[#1A4D8F]">{match.adminPick}</p>
          <p className="text-xs text-gray-400 mt-0.5">{match.market} Market</p>
        </div>

        {/* Price */}
        <div className="text-center mb-4">
          <span className="text-2xl font-black text-[#1A4D8F]">
            {btpFromDollars(match.price).toLocaleString()}
          </span>
          <span className="text-[#1A4D8F]/60 text-sm ml-1 font-bold">BTP / ticket</span>
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-2">
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
      </div>
    </div>
  );
}
