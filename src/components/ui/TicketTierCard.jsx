import { FiCheck } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function TicketTierCard({ tier }) {
  return (
    <div className={`bg-white rounded-2xl border-2 shadow-md card-hover overflow-hidden flex flex-col relative ${
      tier.featured ? 'border-[#1A4D8F]' : 'border-gray-200'
    }`}>
      {/* Top accent bar — thicker on featured */}
      <div className={`${tier.featured ? 'h-2' : 'h-1.5'} ${
        tier.featured ? 'bg-[#1A4D8F]' : 'bg-gray-200'
      }`} />

      <div className="p-6 flex flex-col flex-1">
        {/* Featured badge */}
        {tier.featured && (
          <div className="absolute top-5 right-5 bg-[#F5C518] text-[#1A1A2E] text-xs font-black px-3 py-1 rounded-full uppercase tracking-wide shadow-sm">
            Popular
          </div>
        )}

        {/* Name + price */}
        <h3 className="text-xl font-black text-[#1A1A2E] mb-2">{tier.name}</h3>
        <div className="mb-5">
          <span className="text-3xl font-black text-[#1A4D8F]">${tier.price}</span>
          <span className="text-gray-400 text-sm ml-1">/ ticket</span>
        </div>

        {/* Features list */}
        <ul className="space-y-2.5 mb-6 flex-1">
          {tier.features.map((f, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
              <span className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                <FiCheck className="w-2.5 h-2.5 text-green-600" />
              </span>
              {f}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link
          to="/lobby"
          className={`block text-center font-semibold py-3 rounded-xl text-sm transition-colors ${
            tier.featured
              ? 'bg-[#1A4D8F] text-white hover:bg-[#0D2B5E]'
              : 'border border-[#1A4D8F] text-[#1A4D8F] hover:bg-blue-50'
          }`}
        >
          {tier.cta}
        </Link>
      </div>
    </div>
  );
}
