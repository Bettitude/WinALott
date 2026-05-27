import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiArrowRight, FiCalendar, FiMapPin, FiFlag } from 'react-icons/fi';

// Opening match: June 11, 2026 at 19:00 UTC
const WC_START_MS = new Date('2026-06-11T19:00:00Z').getTime();

function pad(n) {
  return String(n).padStart(2, '0');
}

function useCountdown(targetMs) {
  const [remaining, setRemaining] = useState(() => Math.max(0, targetMs - Date.now()));
  useEffect(() => {
    const id = setInterval(() => setRemaining(Math.max(0, targetMs - Date.now())), 1000);
    return () => clearInterval(id);
  }, [targetMs]);
  return {
    days:    Math.floor(remaining / 86400000),
    hours:   Math.floor((remaining % 86400000) / 3600000),
    mins:    Math.floor((remaining % 3600000)  / 60000),
    secs:    Math.floor((remaining % 60000)    / 1000),
    started: remaining === 0,
  };
}

function CountUnit({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-2xl px-4 sm:px-8 py-4 sm:py-6 min-w-[72px] sm:min-w-[110px]">
        <span className="font-mono font-black text-white text-4xl sm:text-6xl tabular-nums leading-none">
          {pad(value)}
        </span>
      </div>
      <span className="mt-2 text-[11px] sm:text-xs font-bold text-white/50 uppercase tracking-widest">{label}</span>
    </div>
  );
}

const GROUPS = [
  { label: 'Group A', teams: ['Mexico', 'USA', 'Canada', 'TBD'] },
  { label: 'Group B', teams: ['TBD', 'TBD', 'TBD', 'TBD'] },
  { label: 'Group C', teams: ['TBD', 'TBD', 'TBD', 'TBD'] },
  { label: 'Group D', teams: ['TBD', 'TBD', 'TBD', 'TBD'] },
];

export default function WorldCup() {
  const { days, hours, mins, secs, started } = useCountdown(WC_START_MS);

  return (
    <div className="min-h-screen bg-[#0D2B5E] dark:bg-[#060f22]">

      {/* Hero */}
      <div className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-[#1A4D8F]/30 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#F5C518]/10 blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-16 sm:py-24 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#F5C518]/20 border border-[#F5C518]/40 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 bg-[#F5C518] rounded-full animate-pulse" />
            <span className="text-[#F5C518] text-xs font-black uppercase tracking-widest">Coming Soon</span>
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-7xl font-black text-white mb-3 leading-none">
            WORLD CUP
            <span className="block text-[#F5C518]">2026</span>
          </h1>

          {/* Meta */}
          <div className="flex items-center justify-center gap-4 flex-wrap mb-3">
            <span className="flex items-center gap-1.5 text-white/60 text-sm">
              <FiMapPin className="w-4 h-4" />
              USA · Canada · Mexico
            </span>
            <span className="text-white/30">·</span>
            <span className="flex items-center gap-1.5 text-white/60 text-sm">
              <FiCalendar className="w-4 h-4" />
              Jun 11 – Jul 19, 2026
            </span>
            <span className="text-white/30">·</span>
            <span className="flex items-center gap-1.5 text-white/60 text-sm">
              <FiFlag className="w-4 h-4" />
              48 Teams
            </span>
          </div>

          <p className="text-white/50 text-sm mb-12">
            Prediction markets for every group stage, knockout round, and the Final will open here.
          </p>

          {/* Countdown */}
          {!started ? (
            <>
              <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4">
                <CountUnit value={days}  label="Days"    />
                <span className="text-white/30 text-4xl sm:text-6xl font-black mb-6">:</span>
                <CountUnit value={hours} label="Hours"   />
                <span className="text-white/30 text-4xl sm:text-6xl font-black mb-6">:</span>
                <CountUnit value={mins}  label="Minutes" />
                <span className="text-white/30 text-4xl sm:text-6xl font-black mb-6">:</span>
                <CountUnit value={secs}  label="Seconds" />
              </div>
              <p className="text-white/30 text-xs flex items-center justify-center gap-1.5 mb-10">
                <FiClock className="w-3.5 h-3.5" />
                Until the opening match — June 11, 2026 · 19:00 UTC
              </p>
            </>
          ) : (
            <div className="mb-10">
              <p className="text-[#F5C518] font-black text-2xl">The World Cup has started!</p>
              <p className="text-white/50 text-sm mt-1">Check the lobby for live prediction markets.</p>
            </div>
          )}

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/lobby"
              className="flex items-center gap-2 bg-[#F5C518] text-[#1A1A2E] font-black px-7 py-3.5 rounded-xl hover:brightness-105 transition-all text-sm"
            >
              Browse Lobby Now <FiArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/how-to-play"
              className="flex items-center gap-2 border border-white/20 text-white/70 font-semibold px-7 py-3.5 rounded-xl hover:bg-white/10 transition-colors text-sm"
            >
              How to Play
            </Link>
          </div>
        </div>
      </div>

      {/* What to expect */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <div className="border-t border-white/10 pt-12">
          <h2 className="text-xl font-black text-white text-center mb-8">What's Coming</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: FiFlag,
                title: 'Group Stage Markets',
                body: 'Predict match results for all 48 group stage games across 16 groups.',
              },
              {
                icon: FiArrowRight,
                title: 'Knockout Rounds',
                body: 'Round of 32 through the Final — every match gets its own prediction market.',
              },
              {
                icon: FiClock,
                title: 'Provably Fair Draws',
                body: 'Platinum-tier markets use HMAC-SHA256 RNG so every draw is verifiable.',
              },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="w-9 h-9 rounded-xl bg-[#F5C518]/20 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-[#F5C518]" />
                </div>
                <p className="font-black text-white text-sm mb-1">{title}</p>
                <p className="text-white/50 text-xs leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
