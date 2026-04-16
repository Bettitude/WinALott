import { Link } from 'react-router-dom';
import { FiShield } from 'react-icons/fi';

const productLinks = [
  { label: 'Bettitude.com', href: '#' },
  { label: 'BettiSports Blog', href: '#' },
  { label: 'Probetpicks', href: '#' },
  { label: 'Livescores', href: '#' },
];

const infoLinks = [
  { label: 'Terms and Conditions', to: '/terms' },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'FAQs', to: '/faq' },
  { label: '18+', to: '/responsible-gambling' },
];

const companyLinks = [
  { label: 'About', to: '/about' },
  { label: 'Contact Us', to: '/contact' },
  { label: 'Sponsorship and Ads', to: '/sponsorship' },
  { label: 'Partnership', to: '/partner-with-us' },
];

export default function Footer() {
  return (
    <footer>
      {/* Top section */}
      <div className="bg-white border-t border-gray-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Responsible gambling disclaimer */}
            <div className="md:col-span-1">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-2 bg-blue-50 rounded-xl">
                  <FiShield className="w-5 h-5 text-[#1A4D8F]" />
                </div>
                <div>
                  <h4 className="font-bold text-[#1A4D8F] mb-2 text-sm">Responsible Gambling</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    WinALot is intended for entertainment purposes only. Play responsibly.
                    Must be 18 or older to participate.{' '}
                    <Link to="/responsible-gambling" className="text-[#1A4D8F] underline hover:no-underline">
                      Learn more
                    </Link>
                  </p>
                  <div className="mt-3 inline-flex items-center bg-[#1A4D8F] text-white text-xs font-bold px-2 py-1 rounded-lg">
                    18+
                  </div>
                </div>
              </div>
            </div>

            {/* Products */}
            <div>
              <h4 className="font-bold text-[#1A1A2E] mb-4 text-sm uppercase tracking-wide">Products</h4>
              <ul className="space-y-2">
                {productLinks.map(link => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-gray-500 hover:text-[#1A4D8F] transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Information */}
            <div>
              <h4 className="font-bold text-[#1A1A2E] mb-4 text-sm uppercase tracking-wide">Information</h4>
              <ul className="space-y-2">
                {infoLinks.map(link => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-gray-500 hover:text-[#1A4D8F] transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-bold text-[#1A1A2E] mb-4 text-sm uppercase tracking-wide">Company</h4>
              <ul className="space-y-2">
                {companyLinks.map(link => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-gray-500 hover:text-[#1A4D8F] transition-colors">
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
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-blue-200">
            Copyrights &copy;2017-2025 Bettitude | Bettitude Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
