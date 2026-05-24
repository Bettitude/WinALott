import { Link } from 'react-router-dom';
import {
  FiShield, FiExternalLink, FiTwitter, FiInstagram, FiFacebook,
  FiYoutube, FiMail, FiArrowRight,
} from 'react-icons/fi';
import Logo from '../ui/Logo';

const platformLinks = [
  { label: 'Lobby',              to: '/lobby' },
  { label: 'BTGiveaway',         to: '/btgiveaway' },
  { label: 'Winners',            to: '/winners' },
  { label: 'Leaderboard',        to: '/leaderboard' },
  { label: 'How to Play',        to: '/how-to-play' },
  { label: 'Verify Fair Play',   to: '/verify' },
];

const accountLinks = [
  { label: 'Log In',             to: '/auth/login' },
  { label: 'Sign Up',            to: '/auth/signup' },
  { label: 'My Dashboard',       to: '/dashboard' },
  { label: 'My Tickets',         to: '/dashboard/tickets' },
  { label: 'My Winnings',        to: '/dashboard/winnings' },
  { label: 'Wallet',             to: '/dashboard/wallet' },
];

const companyLinks = [
  { label: 'About Us',           to: '/about' },
  { label: 'Contact Us',         to: '/contact' },
  { label: 'Partnership',        to: '/partner-with-us' },
  { label: 'Sponsorship & Ads',  to: '/sponsorship' },
];

const legalLinks = [
  { label: 'Terms & Conditions',    to: '/terms' },
  { label: 'Privacy Policy',        to: '/privacy' },
  { label: 'FAQs',                  to: '/faq' },
  { label: 'Responsible Gambling',  to: '/responsible-gambling' },
  { label: '18+ Policy',            to: '/responsible-gambling' },
];

const productLinks = [
  { label: 'Bettitude.com',     href: 'https://bettitude.com' },
  { label: 'ProBetPicks',       href: 'https://probetpicks.com' },
  { label: 'BettiScores',       href: 'https://bettiscores.com' },
  { label: 'BettiSports Blog',  href: 'https://bettisportsblog.com' },
];

const socials = [
  { Icon: FiTwitter,   href: '#', label: 'Twitter/X' },
  { Icon: FiInstagram, href: '#', label: 'Instagram' },
  { Icon: FiFacebook,  href: '#', label: 'Facebook' },
  { Icon: FiYoutube,   href: '#', label: 'YouTube' },
];

function ColHeading({ children }) {
  return (
    <h4 className="font-black text-white text-xs uppercase tracking-widest mb-5">
      {children}
    </h4>
  );
}

function FootLink({ to, href, children }) {
  const cls = 'text-sm text-slate-400 hover:text-white transition-colors leading-relaxed';
  if (to) return <Link to={to} className={cls}>{children}</Link>;
  return <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{children}</a>;
}

export default function Footer() {
  return (
    <footer>
      {/* ── Responsible Gambling Banner ───────────────────────────────── */}
      <div className="w-full bg-[#1A1A2E] border-t-4 border-[#F5C518]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-[#F5C518] flex items-center justify-center shrink-0">
                <span className="text-[#1A1A2E] text-xl font-black leading-none">18+</span>
              </div>
              <div className="h-10 w-px bg-white/20" />
              <FiShield className="w-8 h-8 text-[#F5C518]" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-wide">
              Beware — Gamble Responsibly
            </h3>
            <p className="text-white/60 text-sm max-w-2xl leading-relaxed">
              Gambling can be addictive and harmful. bWinALOTT is a sweepstakes and prediction platform
              for entertainment purposes only. You must be{' '}
              <strong className="text-[#F5C518]">18 years or older</strong> to participate.
              If gambling is affecting your life, seek help immediately.
            </p>
          </div>

          <div className="border-t border-white/10 mb-8" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <a href="https://www.gamstop.co.uk" target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-1 bg-white rounded-xl py-5 px-4 hover:opacity-90 transition-opacity">
              <span className="text-base font-black text-[#003087]">GamStop</span>
              <span className="text-[11px] text-[#003087]/70 font-semibold">Self-Exclusion</span>
            </a>
            <a href="https://www.begambleaware.org" target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-1 bg-[#00a651] rounded-xl py-5 px-4 hover:opacity-90 transition-opacity">
              <span className="text-base font-black text-white">BeGambleAware</span>
              <span className="text-[11px] text-white/80 font-semibold">begambleaware.org</span>
            </a>
            <a href="https://www.gamcare.org.uk" target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-1 bg-white rounded-xl py-5 px-4 hover:opacity-90 transition-opacity">
              <span className="text-base font-black text-[#e63329]">GamCare</span>
              <span className="text-[11px] text-[#e63329]/70 font-semibold">Counselling &amp; Support</span>
            </a>
            <a href="https://www.gamblingtherapy.org" target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-1 bg-white rounded-xl py-5 px-4 hover:opacity-90 transition-opacity">
              <FiShield className="w-5 h-5 text-[#1A4D8F] mb-0.5" />
              <span className="text-base font-black text-[#1A4D8F]">Gambling Therapy</span>
              <span className="text-[11px] text-[#1A4D8F]/70 font-semibold">Free global support</span>
            </a>
          </div>

          <div className="text-center">
            <Link to="/responsible-gambling"
              className="inline-flex items-center gap-2 bg-[#F5C518] hover:brightness-110 text-[#0D2B5E] font-black px-8 py-3 rounded-xl text-sm transition-all">
              <FiShield className="w-4 h-4" />
              Read Our Responsible Gambling Policy
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main Footer ───────────────────────────────────────────────── */}
      <div className="bg-[#0D1B35] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Top row: brand + newsletter */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10 mb-12">
            {/* Brand */}
            <div className="max-w-sm">
              <Link to="/">
                <Logo variant="full" height={36} className="brightness-0 invert" />
              </Link>
              <p className="text-slate-400 text-sm mt-4 leading-relaxed">
                bWinALOTT is Bettitude Inc.'s football sweepstakes and prediction platform.
                Buy a ticket, pick the outcome, get drawn — and win real prizes.
              </p>
              {/* Socials */}
              <div className="flex items-center gap-3 mt-6">
                {socials.map(({ Icon, href, label }) => (
                  <a key={label} href={href} aria-label={label} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl bg-white/5 hover:bg-[#1A4D8F] border border-white/10 hover:border-[#1A4D8F] flex items-center justify-center transition-colors">
                    <Icon className="w-4 h-4 text-slate-400 hover:text-white" />
                  </a>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className="max-w-sm w-full">
              <h4 className="font-black text-white text-xs uppercase tracking-widest mb-3">
                Stay in the loop
              </h4>
              <p className="text-slate-400 text-sm mb-4">
                Get notified about big jackpots, new markets, and winner announcements.
              </p>
              <form onSubmit={e => e.preventDefault()} className="flex gap-2">
                <div className="relative flex-1">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/60 focus:border-[#1A4D8F]"
                  />
                </div>
                <button type="submit"
                  className="px-4 py-2.5 bg-[#F5C518] hover:brightness-110 text-[#0D2B5E] font-black rounded-xl text-sm transition-all flex items-center gap-1 shrink-0">
                  <FiArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 mb-10" />

          {/* Link columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
            <div>
              <ColHeading>Platform</ColHeading>
              <ul className="space-y-2.5">
                {platformLinks.map(l => (
                  <li key={l.label}><FootLink to={l.to}>{l.label}</FootLink></li>
                ))}
              </ul>
            </div>
            <div>
              <ColHeading>Account</ColHeading>
              <ul className="space-y-2.5">
                {accountLinks.map(l => (
                  <li key={l.label}><FootLink to={l.to}>{l.label}</FootLink></li>
                ))}
              </ul>
            </div>
            <div>
              <ColHeading>Company</ColHeading>
              <ul className="space-y-2.5">
                {companyLinks.map(l => (
                  <li key={l.label}><FootLink to={l.to}>{l.label}</FootLink></li>
                ))}
              </ul>
            </div>
            <div>
              <ColHeading>Legal</ColHeading>
              <ul className="space-y-2.5">
                {legalLinks.map(l => (
                  <li key={l.label}><FootLink to={l.to}>{l.label}</FootLink></li>
                ))}
              </ul>
            </div>
            <div>
              <ColHeading>Products</ColHeading>
              <ul className="space-y-2.5">
                {productLinks.map(l => (
                  <li key={l.label}>
                    <FootLink href={l.href}>
                      <span className="inline-flex items-center gap-1">
                        {l.label} <FiExternalLink className="w-3 h-3" />
                      </span>
                    </FootLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Payment + trust badges */}
          <div className="border-t border-white/10 mt-10 pt-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-3 font-bold">Accepted Payments</p>
                <div className="flex items-center gap-3 flex-wrap">
                  {['PayPal', 'Stripe', 'Flutterwave', 'Bank Transfer'].map(m => (
                    <span key={m}
                      className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[11px] font-bold text-slate-300">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-3 font-bold">Security & Compliance</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="px-3 py-1.5 bg-[#F5C518]/10 border border-[#F5C518]/30 rounded-lg text-[11px] font-black text-[#F5C518]">
                    Provably Fair
                  </span>
                  <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[11px] font-bold text-slate-300">
                    SSL Secured
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[11px] font-bold text-slate-300">
                    <FiShield className="w-3 h-3" /> 18+
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ────────────────────────────────────────────────── */}
      <div className="bg-[#080F1F] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-slate-500">
            &copy; 2017–2025 Bettitude Inc. All rights reserved. bWinALOTT is a product of Bettitude Inc.
          </p>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <a href="https://www.begambleaware.org" target="_blank" rel="noopener noreferrer"
               className="text-[10px] text-[#4ade80] hover:underline font-bold">BeGambleAware</a>
            <a href="https://www.gamstop.co.uk" target="_blank" rel="noopener noreferrer"
               className="text-[10px] text-slate-400 hover:underline font-bold">GamStop</a>
            <a href="https://www.gamcare.org.uk" target="_blank" rel="noopener noreferrer"
               className="text-[10px] text-slate-400 hover:underline font-bold">GamCare</a>
            <span className="text-slate-600 text-[10px]">|</span>
            <span className="text-[10px] text-slate-500 font-semibold">18+ Only</span>
            <span className="text-slate-600 text-[10px]">|</span>
            <span className="text-[10px] text-slate-500">Australia</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
