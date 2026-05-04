import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowRight, FiUsers, FiDollarSign, FiTrendingUp,
  FiCheckCircle, FiShield, FiZap, FiRadio, FiAward,
} from 'react-icons/fi';
import { useRadio } from '../context/RadioContext';
import HeroSlider from '../components/ui/HeroSlider';
import MatchCard from '../components/ui/MatchCard';
import MarketFilterTabs from '../components/ui/MarketFilterTabs';
import WhyWinALot from '../components/ui/WhyWinALot';
import LeagueLogoStrip from '../components/ui/LeagueLogoStrip';
import TeamAvatar from '../components/ui/TeamAvatar';
import { mockMatches, tickerScores, recentWinners, featuredMatch } from '../data/mockData';

const STATS = [
  { Icon: FiUsers,      label: 'Active Players',  value: '12,400+', color: 'text-[#1A4D8F]', bg: 'bg-blue-50' },
  { Icon: FiDollarSign, label: 'Total Prize Pool', value: '$48,000+', color: 'text-green-600',  bg: 'bg-green-50' },
  { Icon: FiTrendingUp, label: 'Markets Live',     value: '120+',     color: 'text-purple-600', bg: 'bg-purple-50' },
  { Icon: FiCheckCircle,label: 'Verified Winners', value: '9,800+',   color: 'text-[#F5C518]',  bg: 'bg-yellow-50' },
];

const TRUST_BADGES = [
  { Icon: FiShield,     label: 'Provably Fair',       sub: 'HMAC-SHA256 verified draws' },
  { Icon: FiZap,        label: 'Instant Payouts',     sub: 'Winnings sent within minutes' },
  { Icon: FiCheckCircle,label: 'No Hidden Fees',      sub: '90% of pool goes to winners' },
  { Icon: FiAward,      label: 'Tiered Rewards',      sub: 'Silver, Gold & Platinum tiers' },
];

export default function Home() {
  const [activeMarket, setActiveMarket] = useState('All Markets');
  const [loading] = useState(false);
  const [stakingCount, setStakingCount] = useState(842);
  const { openPlayer, isOpen: radioOpen } = useRadio();

  // Animate staking count every 60s
  useEffect(() => {
    const id = setInterval(() => {
      setStakingCount(c => c + Math.floor(Math.random() * 7) - 3);
    }, 60000);
    return () => clearInterval(id);
  }, []);

  const filtered = activeMarket === 'All Markets'
    ? mockMatches.slice(0, 9)
    : mockMatches.filter(m => m.marketTag.toLowerCase() === activeMarket.toLowerCase()).slice(0, 9);

  const isLive = featuredMatch.status === 'live';

  return (
    <div>
      {/* Now Staking — fixed bottom-right */}
      <div className={`fixed right-4 z-20 transition-all ${radioOpen ? 'bottom-20' : 'bottom-4'}`}>
        <div className="bg-[#1A4D8F] text-white rounded-full shadow-xl px-4 py-2 flex items-center gap-2 text-xs font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          {stakingCount.toLocaleString()} staking now
        </div>
      </div>

      {/* Radio invite pill — fixed above Now Staking when radio closed */}
      {!radioOpen && (
        <div className={`fixed right-4 z-20 ${radioOpen ? 'bottom-36' : 'bottom-14'}`}>
          <button
            onClick={openPlayer}
            className="bg-[#0D2B5E]/90 hover:bg-[#0D2B5E] text-white rounded-full shadow-lg px-3 py-1.5 flex items-center gap-1.5 text-[11px] font-bold transition-colors border border-white/10"
          >
            <FiRadio className="w-3 h-3 text-[#F5C518]" />
            Match Day Radio
          </button>
        </div>
      )}

      {/* Hero Slider */}
      <HeroSlider />

      {/* Stats Banner */}
      <section className="bg-white border-b border-gray-100 py-6 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(({ Icon, label, value, color, bg }) => (
            <div key={label} className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className={`text-lg font-black ${color} leading-none`}>{value}</p>
                <p className="text-xs text-gray-400 font-medium mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Match */}
      <section className="py-10 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <FiRadio className="w-4 h-4 text-red-500 animate-pulse" />
            <h2 className="text-lg font-black text-[#1A1A2E] uppercase tracking-wide">Featured Match</h2>
          </div>

          <div className="bg-gradient-to-r from-[#0D2B5E] to-[#1A4D8F] rounded-2xl overflow-hidden shadow-xl">
            <div className="flex flex-col md:flex-row items-center gap-6 p-6 md:p-8">
              {/* Match info */}
              <div className="flex-1 text-white">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="text-xs font-semibold text-blue-200 bg-white/10 px-2.5 py-1 rounded-full">
                    {featuredMatch.league}
                  </span>
                  {isLive && (
                    <span className="flex items-center gap-1 bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      LIVE {featuredMatch.minute}
                    </span>
                  )}
                  <span className="text-xs font-semibold text-[#F5C518] bg-[#F5C518]/10 border border-[#F5C518]/30 px-2.5 py-1 rounded-full uppercase">
                    {featuredMatch.tier}
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex flex-col items-center gap-1.5">
                    <TeamAvatar logo={featuredMatch.homeTeam.logo} short={featuredMatch.homeTeam.short} size="lg" />
                    <p className="text-sm font-bold text-white">{featuredMatch.homeTeam.name}</p>
                  </div>

                  <div className="text-center">
                    {isLive ? (
                      <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2">
                        <span className="text-2xl font-black text-white tabular-nums">
                          {featuredMatch.score.home} - {featuredMatch.score.away}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xl font-black text-white/40">VS</span>
                    )}
                  </div>

                  <div className="flex flex-col items-center gap-1.5">
                    <TeamAvatar logo={featuredMatch.awayTeam.logo} short={featuredMatch.awayTeam.short} size="lg" />
                    <p className="text-sm font-bold text-white">{featuredMatch.awayTeam.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm text-blue-200 flex-wrap">
                  <span>Market: <span className="text-white font-bold">{featuredMatch.market}</span></span>
                  <span className="text-white/30">|</span>
                  <span>Pick: <span className="text-[#F5C518] font-bold">{featuredMatch.adminPick}</span></span>
                  <span className="text-white/30">|</span>
                  <span>Pool: <span className="text-white font-bold">${featuredMatch.prizePool.toFixed(2)}</span></span>
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col items-center gap-3 shrink-0 text-center">
                <div className="bg-white/10 border border-white/20 rounded-2xl px-5 py-3">
                  <p className="text-xs text-blue-200 mb-1">Entry Fee</p>
                  <p className="text-2xl font-black text-[#F5C518]">${featuredMatch.price.toFixed(2)}</p>
                  <p className="text-xs text-blue-200 mt-1">{featuredMatch.maxWinners} winners</p>
                </div>
                <Link
                  to={`/match/${featuredMatch.id}`}
                  className="bg-[#F5C518] text-[#1A1A2E] font-black px-6 py-3 rounded-xl hover:brightness-110 transition-all text-sm w-full text-center"
                >
                  Enter Now
                </Link>
                <p className="text-xs text-blue-200">Pool {featuredMatch.fillPercent}% full</p>
              </div>
            </div>
          </div>
        </div>
      </section>

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
              <button
                onClick={() => setActiveMarket('All Markets')}
                className="text-[#1A4D8F] font-semibold text-sm hover:underline"
              >
                Show all markets
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/lobby"
              className="inline-flex items-center gap-2 text-[#1A4D8F] font-semibold text-sm hover:underline"
            >
              Go to Lobby <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why WinALot */}
      <WhyWinALot />

      {/* Winner Showcase */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-[#1A1A2E] mb-1">Recent Winners</h2>
            <p className="text-gray-500 text-sm">Real payouts. Real players.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {recentWinners.slice(0, 4).map(w => (
              <div key={w.id} className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F5C518] to-[#e6a800] flex items-center justify-center shrink-0 shadow-md">
                  <span className="text-sm font-black text-[#1A1A2E]">{w.username[0].toUpperCase()}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#1A1A2E] truncate">{w.username}</p>
                  <p className="text-xs text-gray-400 truncate">{w.match}</p>
                  <p className="text-sm font-black text-green-600 mt-0.5">+${w.prize.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 text-center">
            <Link
              to="/leaderboard"
              className="inline-flex items-center gap-2 text-[#1A4D8F] font-semibold text-sm hover:underline"
            >
              View Leaderboard <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-10 px-4 bg-gray-50 border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {TRUST_BADGES.map(({ Icon, label, sub }) => (
            <div key={label} className="flex flex-col items-center text-center gap-2 p-4">
              <div className="w-12 h-12 rounded-2xl bg-[#1A4D8F]/10 flex items-center justify-center">
                <Icon className="w-6 h-6 text-[#1A4D8F]" />
              </div>
              <p className="text-sm font-black text-[#1A1A2E]">{label}</p>
              <p className="text-xs text-gray-400">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* League Logo Strip */}
      <LeagueLogoStrip />
      <div className="bg-white pb-10 text-center -mt-6">
        <Link
          to="/lobby"
          className="inline-flex items-center gap-2 bg-[#1A4D8F] text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-[#0D2B5E] transition-colors"
        >
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
            <Link
              to="/auth/signup"
              className="bg-[#F5C518] text-[#1A1A2E] font-black px-7 py-3.5 rounded-xl hover:brightness-110 transition-all text-sm"
            >
              Start Predicting
            </Link>
            <Link
              to="/how-to-play"
              className="border-2 border-white/40 text-white font-semibold px-7 py-3.5 rounded-xl hover:border-white transition-all text-sm"
            >
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
