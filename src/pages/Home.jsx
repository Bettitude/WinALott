import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiArrowRight, FiUsers, FiCheckCircle, FiShield, FiZap, FiAward,
  FiGift, FiClock, FiMapPin, FiFlag, FiTrendingUp, FiAlertCircle,
} from 'react-icons/fi';
import { useWinners } from '../hooks/useWinners';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const TRUST_BADGES = [
  { Icon: FiShield,      label: 'Provably Fair',   sub: 'HMAC-SHA256 verified draws' },
  { Icon: FiZap,         label: 'Instant Payouts', sub: 'Winnings credited within minutes' },
  { Icon: FiCheckCircle, label: 'No Hidden Fees',  sub: '90% of pool paid to winners' },
  { Icon: FiAward,       label: 'Real Prizes',     sub: 'Cash & merch, no gimmicks' },
];

const WC_DATE = new Date('2026-06-11T18:00:00Z');

function useCountdown(target) {
  const calc = () => {
    const diff = target - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days:    Math.floor(diff / 86400000),
      hours:   Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

function CountdownUnit({ value, label }) {
  return (
    <div className="flex flex-col items-center min-w-[36px]">
      <span className="text-xl sm:text-3xl font-black text-white tabular-nums leading-none">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[9px] text-blue-400 uppercase tracking-wider mt-1">{label}</span>
    </div>
  );
}

// ── Fixture preview card (links to full WC match page) ────────────────────────
function FixturePreviewCard({ item }) {
  const navigate = useNavigate();
  const { fixture, teams, goals, freeGame } = item;
  const live     = ['1H','HT','2H','ET','BT','P'].includes(fixture.status.short);
  const finished = ['FT','AET','PEN'].includes(fixture.status.short);
  const kickoff  = new Date(fixture.date).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', timeZone: 'UTC', hour12: false,
  }) + ' UTC';

  const hasPrize = freeGame && (freeGame.prize_usd || freeGame.prize_description);

  return (
    <div
      onClick={() => navigate(`/worldcup/match/${fixture.id}`, { state: { item } })}
      className={`relative bg-white/5 border rounded-2xl p-4 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-xl ${
        live ? 'border-green-500/40 shadow-green-500/10 shadow-lg' : 'border-white/10'
      }`}
    >
      {live && <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-green-400 via-green-300 to-green-400 animate-pulse rounded-t-2xl" />}

      {/* Round + venue */}
      <div className="flex items-center justify-between mb-3 text-[10px] text-white/30">
        <span className="font-semibold uppercase tracking-wide">{item.league?.round}</span>
        <span className="flex items-center gap-0.5"><FiMapPin className="w-2.5 h-2.5" />{fixture.venue?.city}</span>
      </div>

      {/* Teams + score/time */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex flex-col items-center flex-1 gap-1">
          <img src={teams.home.logo} alt={teams.home.name} className="w-8 h-8 object-contain" onError={e => { e.target.style.display='none'; }} />
          <span className="text-white font-bold text-xs text-center leading-tight">{teams.home.name}</span>
        </div>
        <div className="flex flex-col items-center shrink-0 min-w-[50px]">
          {(live || finished) ? (
            <span className="text-white font-black text-lg tabular-nums">
              {goals.home ?? 0}<span className="text-white/30 mx-1">:</span>{goals.away ?? 0}
            </span>
          ) : (
            <span className="text-white/50 font-bold text-xs">{kickoff}</span>
          )}
          {live && (
            <span className="flex items-center gap-1 text-green-400 text-[10px] font-black mt-0.5">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              {fixture.status.elapsed ? `${fixture.status.elapsed}'` : 'LIVE'}
            </span>
          )}
          {finished && <span className="text-white/30 text-[9px] font-bold mt-0.5">Full Time</span>}
        </div>
        <div className="flex flex-col items-center flex-1 gap-1">
          <img src={teams.away.logo} alt={teams.away.name} className="w-8 h-8 object-contain" onError={e => { e.target.style.display='none'; }} />
          <span className="text-white font-bold text-xs text-center leading-tight">{teams.away.name}</span>
        </div>
      </div>

      {/* Prize badge */}
      {freeGame && (
        <div className={`flex items-center justify-between rounded-xl px-3 py-2 border text-[11px] font-bold ${
          freeGame.status === 'settled'
            ? 'bg-green-500/10 border-green-500/20 text-green-300'
            : 'bg-[#F5C518]/10 border-[#F5C518]/30 text-[#F5C518]'
        }`}>
          <span className="flex items-center gap-1.5">
            <FiGift className="w-3 h-3" />
            {freeGame.status === 'settled'
              ? 'Settled'
              : `FREE · Win ${freeGame.prize_type === 'merch' ? freeGame.prize_description : `$${freeGame.prize_usd} cash`}`}
          </span>
          <span className="text-white/40 flex items-center gap-0.5">
            <FiUsers className="w-2.5 h-2.5" />{freeGame.entry_count ?? 0}
          </span>
        </div>
      )}

      {!freeGame && (
        <div className="flex items-center gap-1.5 text-[11px] text-white/20 mt-1">
          <FiClock className="w-3 h-3" /> No free game yet
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const countdown = useCountdown(WC_DATE);
  const { winners } = useWinners(4);
  const [fixtures, setFixtures] = useState([]);
  const [loadingFixtures, setLoadingFixtures] = useState(true);
  const [newsIdx, setNewsIdx]   = useState(0);

  const BREAKING_NEWS = [
    'FIFA World Cup 2026 kicks off June 11 — USA, Canada & Mexico hosting',
    'Free predictions open now — predict match outcomes and win real prizes',
    'No entry fee required — sign up free and start playing today',
    'Cash prizes and merch up for grabs across every World Cup group game',
  ];

  useEffect(() => {
    const id = setInterval(() => setNewsIdx(i => (i + 1) % BREAKING_NEWS.length), 5000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/worldcup/fixtures`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setFixtures(d.data || []);
      })
      .catch(() => {})
      .finally(() => setLoadingFixtures(false));
  }, []);

  // Show upcoming + live first, finished last, cap at 8 for the preview
  const preview = [...fixtures]
    .sort((a, b) => {
      const fin = s => ['FT','AET','PEN'].includes(s);
      const live = s => ['1H','HT','2H','ET','BT','P'].includes(s);
      const aFin = fin(a.fixture.status.short), bFin = fin(b.fixture.status.short);
      const aLv  = live(a.fixture.status.short), bLv  = live(b.fixture.status.short);
      if (aLv && !bLv) return -1;
      if (!aLv && bLv) return 1;
      if (!aFin && bFin) return -1;
      if (aFin && !bFin) return 1;
      return new Date(a.fixture.date) - new Date(b.fixture.date);
    })
    .slice(0, 8);

  return (
    <div>
      {/* Breaking News Ticker */}
      <div className="bg-red-600 py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <span className="shrink-0 flex items-center gap-1.5 bg-white text-red-600 text-[10px] font-black px-2 py-0.5 rounded-sm uppercase tracking-wider">
            <FiAlertCircle className="w-3 h-3" /> Live
          </span>
          <div className="overflow-hidden flex-1">
            <p key={newsIdx} className="text-white text-xs font-medium truncate animate-fade-in">
              {BREAKING_NEWS[newsIdx]}
            </p>
          </div>
        </div>
      </div>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-[#0D2B5E] via-[#0f3470] to-[#1A1A2E] overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-[#F5C518]" />
          <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full bg-[#1A4D8F]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 py-12 sm:py-16 text-center">
          {/* League badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <img
              src="https://media.api-sports.io/football/leagues/1.png"
              alt="FIFA World Cup"
              className="w-5 h-5 object-contain"
              onError={e => { e.target.style.display='none'; }}
            />
            <span className="text-[#F5C518] text-xs font-black uppercase tracking-widest">FIFA World Cup 2026</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 leading-tight">
            Predict. Play.<br />
            <span className="text-[#F5C518]">Win Real Prizes.</span>
          </h1>
          <p className="text-blue-200 text-base sm:text-lg max-w-xl mx-auto mb-6 leading-relaxed">
            Predict World Cup 2026 match outcomes for free. If you call it right, you enter a live draw for cash and prizes — no entry fee, no catch.
          </p>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-3 flex-wrap mb-10">
            <Link
              to="/worldcup"
              className="inline-flex items-center gap-2 bg-[#F5C518] text-[#1A1A2E] font-black px-7 py-3.5 rounded-2xl hover:brightness-110 transition-all shadow-xl text-sm"
            >
              <FiFlag className="w-4 h-4" /> See All World Cup Games
            </Link>
            <Link
              to="/auth/signup"
              className="inline-flex items-center gap-2 border-2 border-white/30 text-white font-semibold px-7 py-3.5 rounded-2xl hover:border-white transition-all text-sm"
            >
              Create Free Account <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Countdown */}
          <div className="inline-flex items-center gap-3 bg-white/10 border border-white/20 rounded-2xl px-6 py-4">
            <div className="text-left">
              <p className="text-[10px] text-blue-300 uppercase tracking-widest font-bold mb-1">Tournament kicks off in</p>
              <div className="flex items-end gap-2">
                <CountdownUnit value={countdown.days}    label="Days" />
                <span className="text-white/30 font-black text-xl mb-2">:</span>
                <CountdownUnit value={countdown.hours}   label="Hrs" />
                <span className="text-white/30 font-black text-xl mb-2">:</span>
                <CountdownUnit value={countdown.minutes} label="Min" />
                <span className="text-white/30 font-black text-xl mb-2">:</span>
                <CountdownUnit value={countdown.seconds} label="Sec" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works strip ───────────────────────────────────────────────── */}
      <section className="bg-[#0D2B5E] border-t border-white/10 py-4 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-center gap-8 flex-wrap text-center">
          {[
            { step: '1', text: 'Pick a match' },
            { step: '2', text: 'Submit your prediction — free' },
            { step: '3', text: 'Correct? Enter the prize draw' },
            { step: '4', text: 'Winners paid in cash or prizes' },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#F5C518] text-[#1A1A2E] text-xs font-black flex items-center justify-center shrink-0">{step}</span>
              <span className="text-blue-200 text-xs font-medium">{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── World Cup Fixtures Preview ───────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-[#0f1e3d] to-[#1A1A2E] py-10 px-4">
        <div className="max-w-5xl mx-auto">

          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-black text-white">World Cup 2026 Matches</h2>
              <p className="text-blue-300 text-xs mt-0.5">Free predictions open — pick a winner and enter the draw</p>
            </div>
            <Link
              to="/worldcup"
              className="inline-flex items-center gap-1.5 text-[#F5C518] font-black text-xs hover:underline shrink-0"
            >
              See all <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loadingFixtures ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl h-36 animate-pulse" />
              ))}
            </div>
          ) : preview.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {preview.map(item => (
                <FixturePreviewCard key={item.fixture.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-white/30 text-sm">Fixtures loading…</div>
          )}

          <div className="mt-8 text-center">
            <Link
              to="/worldcup"
              className="inline-flex items-center gap-2 bg-[#F5C518] text-[#1A1A2E] font-black px-8 py-3.5 rounded-2xl hover:brightness-110 transition-all shadow-xl text-sm"
            >
              <FiFlag className="w-4 h-4" /> Play All World Cup Predictions
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trust Badges ─────────────────────────────────────────────────────── */}
      <section className="py-10 px-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-700">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {TRUST_BADGES.map(({ Icon, label, sub }) => (
            <div key={label} className="flex flex-col items-center text-center gap-2 p-4">
              <div className="w-12 h-12 rounded-2xl bg-[#1A4D8F]/10 dark:bg-blue-950/40 flex items-center justify-center">
                <Icon className="w-6 h-6 text-[#1A4D8F] dark:text-blue-400" />
              </div>
              <p className="text-sm font-black text-[#1A1A2E] dark:text-white">{label}</p>
              <p className="text-xs text-gray-400 dark:text-slate-500">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Recent Winners ───────────────────────────────────────────────────── */}
      {winners.length > 0 && (
        <section className="py-10 px-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-700">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-[#1A1A2E] dark:text-white mb-1">Recent Winners</h2>
              <p className="text-gray-500 dark:text-slate-400 text-sm">Real payouts. Real players.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {winners.map(w => (
                <div key={w.id} className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F5C518] to-[#e6a800] flex items-center justify-center shrink-0 shadow-md">
                    <span className="text-sm font-black text-[#1A1A2E]">{(w.username || '?')[0].toUpperCase()}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#1A1A2E] dark:text-white truncate">{w.username}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 truncate">{w.match}</p>
                    <p className="text-sm font-black text-green-600 dark:text-green-400 mt-0.5">+${(w.prize ?? 0).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Bottom CTA ───────────────────────────────────────────────────────── */}
      <section className="relative py-14 px-4 overflow-hidden bg-gradient-to-br from-[#0D2B5E] to-[#1A4D8F]">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-white" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-[#F5C518]" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3 leading-tight">
            The World Cup is here.<br />
            <span className="text-[#F5C518]">Your prize is waiting.</span>
          </h2>
          <p className="text-blue-200 mb-6 text-sm sm:text-base">Predict free. Win real. No entry fee ever.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              to="/worldcup"
              className="inline-flex items-center gap-2 bg-[#F5C518] text-[#1A1A2E] font-black px-7 py-3.5 rounded-xl hover:brightness-110 transition-all text-sm"
            >
              <FiFlag className="w-4 h-4" /> Go to World Cup 2026
            </Link>
            <Link
              to="/how-to-play"
              className="inline-flex items-center gap-2 border-2 border-white/40 text-white font-semibold px-7 py-3.5 rounded-xl hover:border-white transition-all text-sm"
            >
              How It Works <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
