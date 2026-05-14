import { Link } from 'react-router-dom';
import { FiShield, FiExternalLink } from 'react-icons/fi';

const productLinks = [
  { label: 'Bettitude.com',    href: '#' },
  { label: 'BettiSports Blog', href: '#' },
  { label: 'Probetpicks',      href: '#' },
  { label: 'Livescores',       href: '#' },
];

const infoLinks = [
  { label: 'Terms and Conditions',   to: '/terms' },
  { label: 'Privacy Policy',         to: '/privacy' },
  { label: 'FAQs',                   to: '/faq' },
  { label: '18+ Only',               to: '/responsible-gambling' },
];

const companyLinks = [
  { label: 'About',              to: '/about' },
  { label: 'Contact Us',         to: '/contact' },
  { label: 'Sponsorship & Ads',  to: '/sponsorship' },
  { label: 'Partnership',        to: '/partner-with-us' },
];

function GamBadge({ href, label, sub, bg, text }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex flex-col items-center justify-center px-3 py-1.5 rounded-lg ${bg} border border-gray-200 hover:opacity-80 transition-opacity min-w-[80px]`}
    >
      <span className={`text-[10px] font-black tracking-wide ${text}`}>{label}</span>
      {sub && <span className={`text-[8px] font-semibold ${text} opacity-70`}>{sub}</span>}
    </a>
  );
}

export default function Footer() {
  return (
    <footer>
      {/* Responsible Gambling Bar — prominent, full-width */}
      <div className="bg-[#1A1A2E] border-t-4 border-[#F5C518] py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 flex-wrap">
          <p className="text-white/70 text-xs font-medium text-center sm:text-left">
            Gambling can be addictive. Play responsibly. Must be 18 or older.{' '}
            <Link to="/responsible-gambling" className="text-[#F5C518] underline hover:no-underline">
              Get Help
            </Link>
          </p>

          {/* Responsible gambling logos */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {/* 18+ */}
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0 border-2 border-[#1A4D8F]">
              <span className="text-[10px] font-black text-[#1A4D8F] leading-none">18+</span>
            </div>

            {/* GamStop */}
            <GamBadge
              href="https://www.gamstop.co.uk"
              label="GamStop"
              sub="Self-Exclusion"
              bg="bg-white"
              text="text-[#003087]"
            />

            {/* GambleAware */}
            <GamBadge
              href="https://www.begambleaware.org"
              label="BeGambleAware"
              sub="org"
              bg="bg-[#00a651]"
              text="text-white"
            />

            {/* GamCare */}
            <GamBadge
              href="https://www.gamcare.org.uk"
              label="GamCare"
              sub="Support"
              bg="bg-white"
              text="text-[#e63329]"
            />

            {/* Gambling Therapy */}
            <a
              href="https://www.gamblingtherapy.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:opacity-80 transition-opacity text-[10px] font-black text-[#1a1a2e]"
            >
              <FiShield className="w-3 h-3 text-[#1A4D8F]" />
              Gambling Therapy
            </a>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Responsible gambling disclaimer */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-2 bg-blue-50 dark:bg-blue-950/50 rounded-xl shrink-0">
                  <FiShield className="w-5 h-5 text-[#1A4D8F]" />
                </div>
                <div>
                  <h4 className="font-bold text-[#1A4D8F] mb-2 text-sm">Responsible Gambling</h4>
                  <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                    WinALot is a sweepstakes prediction platform for entertainment purposes only.
                    Play responsibly. Must be 18+.{' '}
                    <Link to="/responsible-gambling" className="text-[#1A4D8F] underline hover:no-underline">
                      Learn more
                    </Link>
                  </p>
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center bg-[#1A4D8F] text-white text-[10px] font-black px-2 py-1 rounded-lg">
                      18+
                    </span>
                    <a
                      href="https://www.begambleaware.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-[#00a651] hover:underline"
                    >
                      BeGambleAware <FiExternalLink className="w-2.5 h-2.5" />
                    </a>
                    <a
                      href="https://www.gamstop.co.uk"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-[#003087] hover:underline"
                    >
                      GamStop <FiExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Products */}
            <div>
              <h4 className="font-bold text-[#1A1A2E] dark:text-slate-200 mb-4 text-sm uppercase tracking-wide">Products</h4>
              <ul className="space-y-2">
                {productLinks.map(link => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-gray-500 dark:text-slate-400 hover:text-[#1A4D8F] dark:hover:text-blue-400 transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Information */}
            <div>
              <h4 className="font-bold text-[#1A1A2E] dark:text-slate-200 mb-4 text-sm uppercase tracking-wide">Information</h4>
              <ul className="space-y-2">
                {infoLinks.map(link => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-gray-500 dark:text-slate-400 hover:text-[#1A4D8F] dark:hover:text-blue-400 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-bold text-[#1A1A2E] dark:text-slate-200 mb-4 text-sm uppercase tracking-wide">Company</h4>
              <ul className="space-y-2">
                {companyLinks.map(link => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-gray-500 dark:text-slate-400 hover:text-[#1A4D8F] dark:hover:text-blue-400 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-[#0D2B5E] py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-center">
          <p className="text-xs text-blue-200">
            &copy;2017–2025 Bettitude | Bettitude Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <a href="https://www.begambleaware.org" target="_blank" rel="noopener noreferrer"
               className="text-[10px] text-[#4ade80] hover:underline font-bold">BeGambleAware</a>
            <a href="https://www.gamstop.co.uk" target="_blank" rel="noopener noreferrer"
               className="text-[10px] text-blue-200 hover:underline font-bold">GamStop</a>
            <a href="https://www.gamcare.org.uk" target="_blank" rel="noopener noreferrer"
               className="text-[10px] text-blue-200 hover:underline font-bold">GamCare</a>
            <span className="text-[10px] text-blue-300">|</span>
            <span className="text-[10px] text-blue-300 font-semibold">18+ Only</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
