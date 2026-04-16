import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import HeroSlider from '../components/ui/HeroSlider';
import MatchCard from '../components/ui/MatchCard';
import MarketFilterTabs from '../components/ui/MarketFilterTabs';
import WhyWinALot from '../components/ui/WhyWinALot';
import LeagueLogoStrip from '../components/ui/LeagueLogoStrip';
import AdBanner from '../components/ui/AdBanner';
import { mockMatches, tickerScores } from '../data/mockData';

export default function Home() {
  const [activeMarket, setActiveMarket] = useState('All Markets');
  const [loading] = useState(false);

  const filtered = activeMarket === 'All Markets'
    ? mockMatches.slice(0, 9)
    : mockMatches.filter(m => m.marketTag.toLowerCase() === activeMarket.toLowerCase()).slice(0, 9);

  return (
    <div>
      {/* Hero Slider */}
      <HeroSlider />

      {/* Top Game Picks */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-black text-[#1A1A2E] mb-1">Top Game Picks</h2>
            <p className="text-gray-500 text-sm">Hottest prediction markets right now</p>
          </div>

          <div className="mb-6">
            <MarketFilterTabs active={activeMarket} onChange={setActiveMarket} />
          </div>

          <div className="flex gap-6">
            {/* Left ad sidebar */}
            <div className="hidden lg:block w-40 shrink-0">
              <div className="sticky top-20 space-y-4">
                <AdBanner size="skyscraper" />
              </div>
            </div>

            {/* Main grid */}
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Array(9).fill(0).map((_, i) => <MatchCard key={i} loading />)}
                </div>
              ) : filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filtered.map(m => <MatchCard key={m.id} match={m} />)}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-gray-400 mb-4">No matches for this market right now.</p>
                  <button onClick={() => setActiveMarket('All Markets')} className="text-[#1A4D8F] font-semibold text-sm hover:underline">
                    Show all markets
                  </button>
                </div>
              )}

              <div className="mt-6 text-center">
                <Link to="/lobby"
                  className="inline-flex items-center gap-2 text-[#1A4D8F] font-semibold text-sm hover:underline">
                  Go to Lobby <FiArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right ad sidebar */}
            <div className="hidden lg:block w-40 shrink-0">
              <div className="sticky top-20 space-y-4">
                <AdBanner size="skyscraper" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why WinALot */}
      <WhyWinALot />

      {/* Diverse League Coverage */}
      <LeagueLogoStrip />
      <div className="bg-white pb-10 text-center -mt-6">
        <Link to="/lobby" className="inline-flex items-center gap-2 bg-[#1A4D8F] text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-[#0D2B5E] transition-colors">
          Browse All Leagues <FiArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* CTA Banner */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D2B5E] to-[#1A4D8F]" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-white" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-[#F5C518]" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
            Make accurate football predictions and stand a chance to{' '}
            <span className="text-[#F5C518]">WinALot.</span>
          </h2>
          <p className="text-blue-200 mb-8 text-lg">The game is on — are you in?</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to="/auth/signup"
              className="bg-[#F5C518] text-[#1A1A2E] font-black px-7 py-3.5 rounded-xl hover:brightness-110 transition-all text-sm">
              Start Predicting
            </Link>
            <Link to="/how-to-play"
              className="border-2 border-white/40 text-white font-semibold px-7 py-3.5 rounded-xl hover:border-white transition-all text-sm">
              How It Works
            </Link>
          </div>
        </div>

        {/* Scrolling ticker */}
        <div className="absolute bottom-0 left-0 right-0 bg-[#F5C518]/20 border-t border-white/10 py-2 overflow-hidden">
          <div className="flex animate-marquee gap-8">
            {[...tickerScores, ...tickerScores].map((score, i) => (
              <span key={i} className="text-white text-xs font-medium shrink-0 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#F5C518] rounded-full" />
                {score}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
